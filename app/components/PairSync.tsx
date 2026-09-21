"use client";

import { useEffect, useRef } from "react";
import { useUnex } from "@/lib/store";
import { resolvePair } from "@/lib/pairSync";

const POLL_MS = 4500;

/** Polls the shared pair channel while paired (by doc id when known). */
export function PairSync() {
  const pairState = useUnex((s) => s.pairState);
  const inviteCode = useUnex((s) => s.inviteCode);
  const myRole = useUnex((s) => s.myRole);
  const pairDocId = useUnex((s) => s.pairDocId);
  const receiveTap = useUnex((s) => s.receiveTap);
  const applyRemotePresence = useUnex((s) => s.applyRemotePresence);
  const applyRemotePin = useUnex((s) => s.applyRemotePin);
  const setPairDocId = useUnex((s) => s.setPairDocId);
  const upsertThread = useUnex((s) => s.upsertThread);
  const lastPinAt = useRef<string | null>(null);

  useEffect(() => {
    if (pairState !== "paired" || !inviteCode || !myRole) return;
    let alive = true;
    let consecutiveErrors = 0;

    const tick = async () => {
      if (!alive) return;
      try {
        const docId = useUnex.getState().pairDocId;
        const doc = await resolvePair(inviteCode, docId);
        if (!doc || !alive) return;

        consecutiveErrors = 0;

        if (doc._id && doc._id !== docId) {
          setPairDocId(doc._id);
        }

        // Presence: always read the *other* role's fields
        if (myRole === "host") {
          applyRemotePresence(doc.guestStatus, doc.guestMood);
        } else {
          applyRemotePresence(doc.hostStatus, doc.hostMood);
        }

        const seen = new Set(useUnex.getState().seenTapIds);
        for (const t of doc.taps || []) {
          if (t.from === myRole) {
            // Mirror own remote taps into thread (id from server)
            if (!seen.has(t.id)) {
              useUnex.getState().markTapSeen(t.id);
              upsertThread({
                id: t.id,
                kind: "tap",
                label: t.label,
                direction: "sent",
                at: t.at,
              });
            }
            continue;
          }
          if (seen.has(t.id)) continue;
          receiveTap({ id: t.id, label: t.label, at: t.at });
        }

        const pin = doc.livePin;
        if (pin && pin.from !== myRole) {
          const exp = Date.parse(pin.expiresAt);
          if (!Number.isNaN(exp) && exp > Date.now()) {
            if (lastPinAt.current !== pin.at) {
              lastPinAt.current = pin.at;
              applyRemotePin(pin.label, pin.at);
            }
          } else {
            lastPinAt.current = null;
            applyRemotePin(null);
          }
        } else {
          // No partner pin (ours or none)
          if (lastPinAt.current) {
            lastPinAt.current = null;
            applyRemotePin(null);
          } else if (useUnex.getState().partnerLivePin) {
            applyRemotePin(null);
          }
        }
      } catch {
        consecutiveErrors += 1;
        /* network / rate-limit blip */
      }
    };

    tick();
    // Back off a bit if errors pile up (rate limit)
    const id = window.setInterval(() => {
      if (consecutiveErrors >= 3) {
        // skip some ticks
        if (consecutiveErrors % 2 === 1) {
          consecutiveErrors += 1;
          return;
        }
      }
      void tick();
    }, POLL_MS);

    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [
    pairState,
    inviteCode,
    myRole,
    pairDocId,
    receiveTap,
    applyRemotePresence,
    applyRemotePin,
    setPairDocId,
    upsertThread,
  ]);

  return null;
}
