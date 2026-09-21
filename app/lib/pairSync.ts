/** Shared pair channel (crudcrud). Free MVP sync — swap for Supabase later. */
import { CRUD_BASE } from "./apiBase";

const API = `${CRUD_BASE}/pairs`;

export type PairRole = "host" | "guest";

export type SyncTap = {
  id: string;
  from: PairRole;
  label: string;
  at: string;
};

export type LivePin = {
  from: PairRole;
  label: string;
  at: string;
  expiresAt: string;
};

export type PairChannel = {
  _id?: string;
  /** same as invite id */
  pairKey: string;
  hostName: string;
  guestName: string;
  hostStatus: string;
  guestStatus: string;
  hostMood: string;
  guestMood: string;
  taps: SyncTap[];
  livePin: LivePin | null;
  ended?: boolean;
  updatedAt?: string;
};

export type PairPatch = {
  addTap?: SyncTap;
  hostStatus?: string;
  hostMood?: string;
  guestStatus?: string;
  guestMood?: string;
  /** set to replace; null clears */
  livePin?: LivePin | null;
  hostName?: string;
  guestName?: string;
  ended?: boolean;
};

/** Serialize writes in this tab so local tap+presence don't stomp each other. */
let writeChain: Promise<unknown> = Promise.resolve();
function enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export function mergeTaps(a: SyncTap[], b: SyncTap[]): SyncTap[] {
  const map = new Map<string, SyncTap>();
  for (const t of a || []) map.set(t.id, t);
  for (const t of b || []) map.set(t.id, t);
  return [...map.values()]
    .sort((x, y) => x.at.localeCompare(y.at))
    .slice(-80);
}

function newerPin(
  a: LivePin | null | undefined,
  b: LivePin | null | undefined
): LivePin | null {
  if (b === null) return null;
  if (!a) return b ?? null;
  if (!b) return a;
  return Date.parse(a.at) >= Date.parse(b.at) ? a : b;
}

function applyPatch(doc: PairChannel, patch: PairPatch): PairChannel {
  return {
    ...doc,
    taps: patch.addTap
      ? mergeTaps(doc.taps || [], [patch.addTap])
      : [...(doc.taps || [])],
    hostStatus: patch.hostStatus ?? doc.hostStatus,
    hostMood: patch.hostMood ?? doc.hostMood,
    guestStatus: patch.guestStatus ?? doc.guestStatus,
    guestMood: patch.guestMood ?? doc.guestMood,
    livePin:
      patch.livePin !== undefined
        ? patch.livePin === null
          ? null
          : newerPin(doc.livePin, patch.livePin)
        : doc.livePin ?? null,
    hostName: patch.hostName ?? doc.hostName,
    guestName: patch.guestName ?? doc.guestName,
    ended: patch.ended ?? doc.ended,
  };
}

export async function createPairChannel(input: {
  pairKey: string;
  hostName: string;
  guestName: string;
  hostStatus?: string;
  guestStatus?: string;
  hostMood?: string;
  guestMood?: string;
}): Promise<PairChannel> {
  const body: Omit<PairChannel, "_id"> = {
    pairKey: input.pairKey,
    hostName: input.hostName,
    guestName: input.guestName,
    hostStatus: input.hostStatus || "Open to talk",
    guestStatus: input.guestStatus || "Open to talk",
    hostMood: input.hostMood || "Soft",
    guestMood: input.guestMood || "Soft",
    taps: [],
    livePin: null,
    ended: false,
    updatedAt: new Date().toISOString(),
  };
  const existing = await findPairByKey(input.pairKey);
  if (existing?._id) {
    // Ensure names/status for this role aren't blank — soft merge own fields only if empty defaults
    return existing;
  }

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // Concurrent create — pick up the winner
    const again = await findPairByKey(input.pairKey);
    if (again) return again;
    throw new Error(`pair create failed (${res.status})`);
  }
  const created = (await res.json()) as PairChannel;
  // If a twin was also created, prefer the canonical find
  const canonical = await findPairByKey(input.pairKey);
  return canonical || created;
}

export async function findPairByKey(
  pairKey: string
): Promise<PairChannel | null> {
  const res = await fetch(API, { cache: "no-store" });
  if (!res.ok) throw new Error(`pair list failed (${res.status})`);
  const all = (await res.json()) as PairChannel[];
  const matches = all.filter((p) => p.pairKey === pairKey);
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  // Prefer richest / newest if a create race left duplicates
  return matches.sort((a, b) => {
    const taps = (b.taps?.length || 0) - (a.taps?.length || 0);
    if (taps !== 0) return taps;
    return (b.updatedAt || "").localeCompare(a.updatedAt || "");
  })[0];
}

export async function getPairById(id: string): Promise<PairChannel | null> {
  const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`pair get failed (${res.status})`);
  return (await res.json()) as PairChannel;
}

/** Resolve pair doc: prefer cached _id (1 GET) over listing all pairs. */
export async function resolvePair(
  pairKey: string,
  docId?: string | null
): Promise<PairChannel | null> {
  if (docId) {
    try {
      const byId = await getPairById(docId);
      if (byId) return byId;
    } catch {
      /* fall through */
    }
  }
  return findPairByKey(pairKey);
}

async function putPair(doc: PairChannel): Promise<PairChannel> {
  if (!doc._id) throw new Error("pair missing _id");
  const { _id, ...rest } = doc;
  const updatedAt = new Date().toISOString();
  const res = await fetch(`${API}/${encodeURIComponent(_id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...rest,
      updatedAt,
    }),
  });
  if (!res.ok) throw new Error(`pair update failed (${res.status})`);
  return { ...rest, _id, updatedAt };
}

/**
 * Race-safer patch: GET → merge (taps by id, presence per-role, pin by newer) → PUT,
 * with retry + re-merge if a concurrent write clobbered our tap/pin.
 */
export async function patchPair(
  pairKey: string,
  patch: PairPatch,
  docId?: string | null
): Promise<PairChannel> {
  return enqueueWrite(async () => {
    let lastErr: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const doc = await resolvePair(pairKey, docId);
        if (!doc?._id) throw new Error("pair not found");

        // Fresh re-read right before mutate to shrink the race window
        const fresh = (await getPairById(doc._id)) || doc;
        const next = applyPatch(
          { ...fresh, taps: [...(fresh.taps || [])] },
          patch
        );
        const saved = await putPair(next);

        // Verify critical writes weren't clobbered
        const needsVerify = !!(patch.addTap || patch.livePin);
        if (!needsVerify) return saved;

        const check = await getPairById(saved._id!);
        if (!check) return saved;

        let ok = true;
        if (patch.addTap) {
          ok = (check.taps || []).some((t) => t.id === patch.addTap!.id);
        }
        if (ok && patch.livePin && patch.livePin !== null) {
          ok =
            !!check.livePin &&
            check.livePin.at === patch.livePin.at &&
            check.livePin.from === patch.livePin.from;
        }
        if (ok) {
          // Also merge any taps we might have missed from the clobber window
          return {
            ...check,
            taps: mergeTaps(check.taps || [], next.taps || []),
          };
        }
        // Retry — someone overwrote; loop will re-GET and merge our patch in
        await new Promise((r) => setTimeout(r, 120 * (attempt + 1)));
      } catch (e) {
        lastErr = e as Error;
        await new Promise((r) => setTimeout(r, 180 * (attempt + 1)));
      }
    }
    throw lastErr || new Error("pair patch failed");
  });
}

export async function pushTap(
  pairKey: string,
  from: PairRole,
  label: string,
  docId?: string | null
): Promise<SyncTap> {
  const tap: SyncTap = {
    id: `${from}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    from,
    label,
    at: new Date().toISOString(),
  };
  await patchPair(pairKey, { addTap: tap }, docId);
  return tap;
}

export async function pushMyPresence(
  pairKey: string,
  role: PairRole,
  status: string,
  mood: string,
  docId?: string | null
): Promise<void> {
  if (role === "host") {
    await patchPair(
      pairKey,
      { hostStatus: status, hostMood: mood },
      docId
    );
  } else {
    await patchPair(
      pairKey,
      { guestStatus: status, guestMood: mood },
      docId
    );
  }
}

export async function pushLivePin(
  pairKey: string,
  from: PairRole,
  label = "Come get me · live pin · 30 min",
  docId?: string | null
): Promise<LivePin> {
  const at = new Date();
  const pin: LivePin = {
    from,
    label,
    at: at.toISOString(),
    expiresAt: new Date(at.getTime() + 30 * 60 * 1000).toISOString(),
  };
  await patchPair(pairKey, { livePin: pin }, docId);
  return pin;
}
