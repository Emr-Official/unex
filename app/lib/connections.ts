import type {
  ConnectionEntry,
  HeartbreakStatus,
  Mood,
  PairRole,
  TapMessage,
  ThreadItem,
  UnexState,
} from "./types";

/** Snapshot the currently active pair into a ConnectionEntry (or null). */
export function snapshotActive(s: UnexState): ConnectionEntry | null {
  if (!s.inviteCode || (s.pairState !== "paired" && s.pairState !== "pending")) {
    // Still allow snapshot when paired only for list persistence
  }
  if (!s.inviteCode || s.pairState !== "paired") return null;
  if (!s.myRole) return null;
  return {
    id: s.inviteCode,
    pairKey: s.inviteCode,
    partnerName: s.partnerName || "them",
    partnerPhone: undefined,
    myRole: s.myRole,
    pairDocId: s.pairDocId,
    lastSignal: s.lastSignal,
    unreadCount: s.unreadReceived.length,
    partnerStatus: s.partnerStatus,
    partnerMood: s.partnerMood,
    partnerLivePin: s.partnerLivePin,
    thread: s.thread,
    unreadReceived: s.unreadReceived,
    sentTaps: s.sentTaps,
    seenTapIds: s.seenTapIds,
    muted: s.muted,
    archived: s.archived,
    updatedAt: new Date().toISOString(),
  };
}

export function upsertConnection(
  list: ConnectionEntry[],
  entry: ConnectionEntry
): ConnectionEntry[] {
  const i = list.findIndex((c) => c.id === entry.id);
  if (i < 0) return [...list, entry];
  const next = [...list];
  next[i] = { ...next[i], ...entry, updatedAt: new Date().toISOString() };
  return next;
}

export function removeConnection(
  list: ConnectionEntry[],
  id: string
): ConnectionEntry[] {
  return list.filter((c) => c.id !== id);
}

/** Fields to load from a connection into the live active pair slot. */
export function activeFieldsFromConnection(c: ConnectionEntry): Partial<UnexState> {
  return {
    inviteCode: c.pairKey,
    partnerName: c.partnerName,
    myRole: c.myRole as PairRole,
    pairDocId: c.pairDocId,
    lastSignal: c.lastSignal,
    partnerStatus: c.partnerStatus as HeartbreakStatus,
    partnerMood: c.partnerMood as Mood,
    partnerLivePin: c.partnerLivePin,
    thread: (c.thread || []) as ThreadItem[],
    unreadReceived: (c.unreadReceived || []) as TapMessage[],
    sentTaps: (c.sentTaps || []) as TapMessage[],
    seenTapIds: c.seenTapIds || [],
    muted: !!c.muted,
    archived: !!c.archived,
    pairState: "paired",
    activeConnectionId: c.id,
    homeView: "pair",
  };
}

export function emptyActivePair(): Partial<UnexState> {
  return {
    partnerName: "",
    inviteCode: null,
    myRole: null,
    pairDocId: null,
    lastSignal: null,
    partnerLivePin: null,
    thread: [],
    unreadReceived: [],
    sentTaps: [],
    seenTapIds: [],
    muted: false,
    archived: false,
    activeConnectionId: null,
  };
}
