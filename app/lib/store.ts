"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COPY, DAILY_TAP_LIMIT, PREMIUM_TAP_LIMIT } from "./constants";
import { notifyTap } from "./notify";
import type {
  HeartbreakStatus,
  LocaleCode,
  Mood,
  PairRole,
  Screen,
  TapMessage,
  ThreadItem,
  UnexState,
} from "./types";
import {
  activeFieldsFromConnection,
  emptyActivePair,
  removeConnection,
  snapshotActive,
  upsertConnection,
} from "./connections";

interface UnexActions {
  setScreen: (screen: Screen) => void;
  setMyName: (name: string) => void;
  setMyPhone: (phone: string) => void;
  sendDirectRequest: (toPhone: string) => Promise<void>;
  setPartnerName: (name: string) => void;
  sendInvite: () => Promise<void>;
  setInviteCode: (code: string | null) => void;
  markPairedFromInvite: () => Promise<void>;
  cancelInvite: () => void;
  acceptInvite: (fromName: string, pairKey: string | null) => Promise<void>;
  declineInvite: () => void;
  setPendingTap: (label: string | null, returnTo?: "home" | "messages") => void;
  sendTap: () => Promise<void>;
  receiveTap: (tap: { id: string; label: string; at: string }) => void;
  applyRemotePresence: (status: string, mood: string) => void;
  applyRemotePin: (label: string | null, at?: string) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  setMuted: (v: boolean) => void;
  setArchived: (v: boolean) => void;
  setNeedSpaceHold: (v: boolean) => void;
  clearUnread: () => void;
  openMessages: () => void;
  setMyStatus: (s: HeartbreakStatus) => void;
  setMyMood: (m: Mood) => void;
  setLastSignal: (s: string | null) => void;
  sendLivePin: () => Promise<void>;
  endPair: () => void;
  submitReport: () => void;
  unlockPremium: () => void;
  reset: () => void;
  markTapSeen: (id: string) => void;
  setPairDocId: (id: string | null) => void;
  upsertThread: (item: ThreadItem) => void;
  selectConnection: (id: string) => void;
  showConnectionsList: () => void;
  syncActiveToConnections: () => void;
  goHome: () => void;
  setLocale: (locale: LocaleCode) => void;
  ensureDailyTaps: () => void;
  endPairFromRemote: () => void;
}

function upsertThreadList(
  thread: ThreadItem[],
  item: ThreadItem
): ThreadItem[] {
  if (thread.some((t) => t.id === item.id)) return thread;
  return [...thread, item]
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(-120);
}

const initial: UnexState = {
  screen: "splash",
  myName: "",
  partnerName: "",
  pairState: "none",
  myStatus: "Open to talk",
  myMood: "Soft",
  partnerStatus: "Open to talk",
  partnerMood: "Soft",
  tapsLeft: DAILY_TAP_LIMIT,
  tapsDayKey: "",
  muted: false,
  archived: false,
  needSpaceHold: false,
  unreadReceived: [],
  sentTaps: [],
  thread: [],
  pendingTap: null,
  toast: null,
  lastSignal: null,
  partnerLivePin: null,
  reportSubmitted: false,
  inviteCode: null,
  myRole: null,
  pairDocId: null,
  seenTapIds: [],
  isPremium: false,
  myPhone: "",
  locale: "en",
  connections: [],
  activeConnectionId: null,
  homeView: "pair",
};


function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dailyLimit(isPremium: boolean): number {
  return isPremium ? PREMIUM_TAP_LIMIT : DAILY_TAP_LIMIT;
}

export const useUnex = create<UnexState & UnexActions>()(
  persist(
    (set, get) => ({
      ...initial,

      setScreen: (screen) => set({ screen }),
      setMyName: (myName) => set({ myName }),
      setMyPhone: (myPhone) => set({ myPhone }),
      setPartnerName: (partnerName) => set({ partnerName }),
      setInviteCode: (inviteCode) => set({ inviteCode }),
      setPairDocId: (pairDocId) => set({ pairDocId }),

      syncActiveToConnections: () => {
        const s = get();
        const snap = snapshotActive(s);
        if (!snap) return;
        set({
          connections: upsertConnection(s.connections, snap),
          activeConnectionId: snap.id,
        });
      },

      selectConnection: (id) => {
        const s = get();
        let list = s.connections;
        const snap = snapshotActive(s);
        if (snap) list = upsertConnection(list, snap);
        let entry = list.find((c) => c.id === id);
        if (!entry && (s.activeConnectionId === id || s.inviteCode === id)) {
          // Already on this pair — just open detail
          set({
            connections: list,
            homeView: "pair",
            screen: "home",
            activeConnectionId: id,
          });
          return;
        }
        if (!entry) {
          get().showToast("connection not found");
          return;
        }
        set({
          connections: list,
          ...activeFieldsFromConnection(entry),
          screen: "home",
          homeView: "pair",
          tapsLeft: s.tapsLeft,
        tapsDayKey: s.tapsDayKey,
        });
      },

      showConnectionsList: () => {
        const s = get();
        let list = s.connections;
        const snap = snapshotActive(s);
        if (snap) list = upsertConnection(list, snap);
        set({
          connections: list,
          homeView: "list",
          screen: "home",
          activeConnectionId: snap?.id ?? s.activeConnectionId,
        });
      },

      markTapSeen: (id) => {
        const seen = get().seenTapIds;
        if (seen.includes(id)) return;
        set({ seenTapIds: [...seen, id].slice(-120) });
      },

      upsertThread: (item) => {
        set({ thread: upsertThreadList(get().thread, item) });
      },

      sendInvite: async () => {
        const s = get();
        const { myName, partnerName, showToast, isPremium, pairState } = s;
        if (pairState === "paired" && !isPremium) {
          showToast("free plan: one connection — see Premium");
          set({ screen: "premium" });
          return;
        }
        let connections = s.connections;
        const snap = snapshotActive(s);
        if (snap) connections = upsertConnection(connections, snap);
        set({
          connections,
          pairState: "pending",
          screen: "waiting",
          lastSignal: COPY.pending,
          unreadReceived: [],
          inviteCode: null,
          myRole: "host",
          pairDocId: null,
          thread: [],
          partnerLivePin: null,
          sentTaps: [],
          seenTapIds: [],
          activeConnectionId: null,
          homeView: "pair",
          partnerName: partnerName,
        });
        try {
          const { createInviteRecord } = await import("./inviteSync");
          const id = await createInviteRecord({
            from: myName || "someone",
            as: partnerName || "them",
          });
          set({ inviteCode: id });
        } catch {
          showToast("invite link works offline — sync pending");
        }
      },

      sendDirectRequest: async (toPhone) => {
        const { myName, myPhone, showToast, isPremium, pairState, setScreen } =
          get();
        if (pairState === "paired" && !isPremium) {
          showToast("free plan: one connection — see Premium");
          setScreen("premium");
          return;
        }
        const phone = (myPhone || "").trim();
        if (!phone) {
          showToast("add your WhatsApp number in login first");
          setScreen("login");
          return;
        }
        try {
          const {
            normalizePhone,
            findUserByPhone,
            createDirectRequest,
            formatPhoneDisplay,
          } = await import("./accountSync");
          const { createInviteRecord } = await import("./inviteSync");
          const target = normalizePhone(toPhone);
          const user = await findUserByPhone(target);
          if (!user) {
            showToast("no unex account with that WhatsApp number");
            return;
          }
          {
            const cur = get();
            let connections = cur.connections;
            const snap = snapshotActive(cur);
            if (snap) connections = upsertConnection(connections, snap);
            set({
              connections,
              pairState: "pending",
              screen: "waiting",
              partnerName: user.displayName || formatPhoneDisplay(target),
              lastSignal: "request sent · waiting",
              myRole: "host",
              inviteCode: null,
              pairDocId: null,
              thread: [],
              partnerLivePin: null,
              sentTaps: [],
              seenTapIds: [],
              unreadReceived: [],
              activeConnectionId: null,
              homeView: "pair",
            });
          }
          const inviteId = await createInviteRecord({
            from: myName || phone,
            as: user.displayName || target,
          });
          await createDirectRequest({
            toPhone: target,
            fromPhone: normalizePhone(phone),
            fromName: myName || phone,
            inviteId,
          });
          set({ inviteCode: inviteId });
          showToast("request sent to " + formatPhoneDisplay(target));
        } catch {
          showToast("couldn’t send request — try again");
          set({ pairState: "none", screen: "invite" });
        }
      },

      markPairedFromInvite: async () => {
        const { inviteCode, myName, partnerName, myStatus, myMood, showToast, isPremium } =
          get();
        set({
          pairState: "paired",
          screen: "home",
          lastSignal: null,
          toast: "they accepted",
          myRole: "host",
          homeView: isPremium ? "list" : "pair",
        });
        if (!inviteCode) return;
        try {
          const { createPairChannel, findPairByKey, pushMyPresence } =
            await import("./pairSync");
          let doc = await findPairByKey(inviteCode);
          if (!doc) {
            doc = await createPairChannel({
              pairKey: inviteCode,
              hostName: myName || "someone",
              guestName: partnerName || "them",
              hostStatus: myStatus,
              hostMood: myMood,
            });
          }
          set({
            pairDocId: doc._id || null,
            partnerName: doc.guestName || partnerName,
            partnerStatus:
              (doc.guestStatus as HeartbreakStatus) || "Open to talk",
            partnerMood: (doc.guestMood as Mood) || "Soft",
            activeConnectionId: inviteCode,
          });
          // Register in connections list
          const after = get();
          const snap = snapshotActive(after);
          if (snap) {
            set({
              connections: upsertConnection(after.connections, snap),
              homeView: after.isPremium ? "list" : "pair",
            });
          }
          if (doc._id) {
            pushMyPresence(
              inviteCode,
              "host",
              myStatus,
              myMood,
              doc._id
            ).catch(() => {});
          }
        } catch {
          showToast("paired — sync catching up");
        }
      },

      cancelInvite: () => {
        const s = get();
        if (s.connections.length > 0) {
          const last = s.connections[s.connections.length - 1];
          set({
            ...activeFieldsFromConnection(last),
            screen: "home",
            homeView: s.isPremium ? "list" : "pair",
            toast: "invite cancelled",
          });
          return;
        }
        set({
          pairState: "none",
          screen: "invite",
          lastSignal: null,
          inviteCode: null,
          myRole: null,
          pairDocId: null,
          activeConnectionId: null,
        });
      },

      acceptInvite: async (fromName, pairKey) => {
        const prev = get();
        if (prev.pairState === "paired" && !prev.isPremium) {
          prev.showToast("free plan: one connection — see Premium");
          set({ screen: "premium" });
          return;
        }
        if (!pairKey) {
          prev.showToast("invite incomplete — ask them to resend the link");
          return;
        }
        if (!prev.myPhone || prev.myPhone.length < 9) {
          prev.showToast("add your WhatsApp number before accepting");
          set({ screen: "login" });
          return;
        }
        let connections = prev.connections;
        const prevSnap = snapshotActive(prev);
        if (prevSnap) connections = upsertConnection(connections, prevSnap);
        const { myName, myStatus, myMood, showToast, isPremium } = prev;
        const guest = myName.trim() || "you";
        set({
          connections,
          pairState: "paired",
          screen: "home",
          partnerName: fromName || "them",
          lastSignal: null,
          unreadReceived: [],
          inviteCode: pairKey,
          myRole: "guest",
          myName: guest,
          thread: [],
          partnerLivePin: null,
          sentTaps: [],
          seenTapIds: [],
          activeConnectionId: pairKey,
          homeView: isPremium ? "list" : "pair",
        });
        if (!pairKey) return;
        try {
          const { createPairChannel, pushMyPresence } = await import(
            "./pairSync"
          );
          const doc = await createPairChannel({
            pairKey,
            hostName: fromName || "them",
            guestName: guest,
            guestStatus: myStatus,
            guestMood: myMood,
          });
          set({
            pairDocId: doc._id || null,
            partnerStatus:
              (doc.hostStatus as HeartbreakStatus) || "Open to talk",
            partnerMood: (doc.hostMood as Mood) || "Soft",
          });
          const after = get();
          const snap = snapshotActive(after);
          if (snap) {
            set({
              connections: upsertConnection(after.connections, snap),
              homeView: after.isPremium ? "list" : "pair",
            });
          }
          if (doc._id) {
            pushMyPresence(
              pairKey,
              "guest",
              myStatus,
              myMood,
              doc._id
            ).catch(() => {});
          }
        } catch {
          showToast("accepted — sync catching up");
        }
      },

      declineInvite: () =>
        set({
          pairState: "none",
          screen: "splash",
          partnerName: "",
          lastSignal: COPY.declined,
          unreadReceived: [],
          inviteCode: null,
          myRole: null,
          pairDocId: null,
        }),

      setPendingTap: (pendingTap, returnTo) => {
        const g = globalThis as unknown as { __unexTapBack?: "home" | "messages" };
        if (!pendingTap) {
          const back =
            returnTo ||
            g.__unexTapBack ||
            (get().screen === "messages" ? "messages" : "home");
          set({ pendingTap: null, screen: back });
          return;
        }
        const back =
          returnTo ||
          (get().screen === "messages" ? "messages" : "home");
        g.__unexTapBack = back;
        set({
          pendingTap,
          screen: "tapConfirm",
        });
      },

      sendTap: async () => {
        get().ensureDailyTaps();
        const {
          pendingTap,
          tapsLeft,
          muted,
          sentTaps,
          inviteCode,
          myRole,
          pairDocId,
          showToast,
          thread,
          partnerStatus,
          partnerMood,
        } = get();
        if (!pendingTap || tapsLeft <= 0) return;

        const tap: TapMessage = {
          id: `s-${Date.now()}`,
          label: pendingTap,
          direction: "sent",
          at: new Date().toISOString(),
        };

        const partnerNeedsSpace =
          partnerStatus === "Need space" || partnerMood === "Need space";
        let signal: string | null = null;
        let toast = "tap sent";
        if (partnerNeedsSpace) {
          signal = COPY.needSpace;
          toast = COPY.needSpace;
        } else if (muted) {
          signal = COPY.muted;
        }

        const threadItem: ThreadItem = {
          id: tap.id,
          kind: "tap",
          label: pendingTap,
          direction: "sent",
          at: tap.at,
        };

        set({
          sentTaps: [...sentTaps, tap],
          tapsLeft: tapsLeft - 1,
          pendingTap: null,
          screen: ((globalThis as unknown as { __unexTapBack?: string }).__unexTapBack === "messages"
            ? "messages"
            : "home") as Screen,
          toast,
          lastSignal: signal,
          seenTapIds: [...get().seenTapIds, tap.id].slice(-120),
          thread: upsertThreadList(thread, threadItem),
        });

        notifyTap({
          body: partnerNeedsSpace || muted ? toast : `Sent · ${pendingTap}`,
          tag: "unex-sent",
        });

        setTimeout(() => {
          if (get().toast === toast) set({ toast: null });
        }, 2400);

        if (inviteCode && myRole) {
          try {
            const { pushTap } = await import("./pairSync");
            const remote = await pushTap(
              inviteCode,
              myRole,
              pendingTap,
              pairDocId
            );
            // Prefer remote id in seen + replace local thread id if different
            const prev = get();
            set({
              seenTapIds: [...prev.seenTapIds, remote.id].slice(-120),
              thread: upsertThreadList(
                prev.thread.filter((t) => t.id !== tap.id),
                {
                  id: remote.id,
                  kind: "tap",
                  label: pendingTap,
                  direction: "sent",
                  at: remote.at,
                }
              ),
              sentTaps: prev.sentTaps.map((t) =>
                t.id === tap.id
                  ? { ...t, id: remote.id, at: remote.at }
                  : t
              ),
            });
          } catch {
            showToast("sent here — partner sync delayed");
          }
        }
      },

      receiveTap: (incoming) => {
        const {
          unreadReceived,
          muted,
          archived,
          partnerName,
          seenTapIds,
          thread,
          screen,
        } = get();
        if (seenTapIds.includes(incoming.id)) return;
        const tap: TapMessage = {
          id: incoming.id,
          label: incoming.label,
          direction: "received",
          at: incoming.at,
        };
        const threadItem: ThreadItem = {
          id: incoming.id,
          kind: "tap",
          label: incoming.label,
          direction: "received",
          at: incoming.at,
        };
        const nextThread = upsertThreadList(thread, threadItem);
        // If already on messages, mark read (don't add unread)
        if (screen === "messages") {
          set({
            seenTapIds: [...seenTapIds, incoming.id].slice(-120),
            thread: nextThread,
            toast: muted
              ? COPY.muted
              : `${partnerName || "them"} · ${incoming.label}`,
          });
          if (!muted) {
            notifyTap({
              title: partnerName || "unex",
              body: incoming.label,
              tag: `unex-in-${tap.id}`,
            });
          }
          setTimeout(() => {
            const cur = get().toast;
            if (cur && (cur.includes(incoming.label) || cur === COPY.muted))
              set({ toast: null });
          }, 3200);
          return;
        }
        if (archived) {
          set({
            unreadReceived: [...unreadReceived, tap],
            seenTapIds: [...seenTapIds, incoming.id].slice(-120),
            thread: nextThread,
          });
          return;
        }
        {
          const cur = get();
          const id = cur.activeConnectionId || cur.inviteCode;
          let connections = cur.connections;
          if (id) {
            connections = connections.map((c) =>
              c.id === id
                ? {
                    ...c,
                    unreadCount: unreadReceived.length + 1,
                    unreadReceived: [...unreadReceived, tap],
                    thread: nextThread,
                    lastSignal: muted ? COPY.muted : incoming.label,
                    updatedAt: new Date().toISOString(),
                  }
                : c
            );
          }
          set({
            unreadReceived: [...unreadReceived, tap],
            seenTapIds: [...seenTapIds, incoming.id].slice(-120),
            thread: nextThread,
            connections,
            toast: muted
              ? COPY.muted
              : `${partnerName || "them"} · ${incoming.label}`,
            lastSignal: muted ? COPY.muted : null,
          });
        }
        if (!muted) {
          notifyTap({
            title: partnerName || "unex",
            body: incoming.label,
            tag: `unex-in-${tap.id}`,
          });
        }
        setTimeout(() => {
          const cur = get().toast;
          if (
            cur &&
            (cur.includes(incoming.label) || cur === COPY.muted)
          )
            set({ toast: null });
        }, 3200);
      },

      applyRemotePresence: (status, mood) => {
        const cur = get();
        if (cur.partnerStatus === status && cur.partnerMood === mood) return;
        set({
          partnerStatus: status as HeartbreakStatus,
          partnerMood: mood as Mood,
        });
      },

      applyRemotePin: (label, at) => {
        const cur = get();
        if (!label) {
          if (cur.partnerLivePin) {
            set({
              partnerLivePin: null,
              lastSignal:
                cur.lastSignal && cur.lastSignal.includes("live pin")
                  ? null
                  : cur.lastSignal,
            });
          }
          return;
        }
        const pinAt = at || new Date().toISOString();
        const item: ThreadItem = {
          id: `pin-in-${pinAt}`,
          kind: "pin",
          label,
          direction: "received",
          at: pinAt,
        };
        const already = cur.thread.some((x) => x.id === item.id);
        set({
          partnerLivePin: label,
          lastSignal: label,
          thread: already ? cur.thread : upsertThreadList(cur.thread, item),
          toast: already
            ? cur.toast
            : `${cur.partnerName || "them"} · live pin`,
        });
        if (!already) {
          setTimeout(() => {
            if (get().toast?.includes("live pin")) set({ toast: null });
          }, 3200);
        }
      },

      showToast: (toast) => {
        set({ toast });
        setTimeout(() => {
          if (get().toast === toast) set({ toast: null });
        }, 2400);
      },

      clearToast: () => set({ toast: null }),

      setMuted: (muted) =>
        set({
          muted,
          lastSignal: muted
            ? COPY.muted
            : get().lastSignal === COPY.muted
              ? null
              : get().lastSignal,
        }),

      setArchived: (archived) =>
        set({
          archived,
          lastSignal: archived
            ? COPY.archived
            : get().lastSignal === COPY.archived
              ? null
              : get().lastSignal,
          screen: archived ? "home" : get().screen,
        }),

      setNeedSpaceHold: (needSpaceHold) =>
        set({
          needSpaceHold,
          lastSignal: needSpaceHold
            ? COPY.needSpace
            : get().lastSignal === COPY.needSpace
              ? null
              : get().lastSignal,
        }),

      clearUnread: () => {
        const { unreadReceived } = get();
        if (unreadReceived.length === 0) {
          get().showToast("nothing to clear");
          return;
        }
        set({
          unreadReceived: [],
          lastSignal: COPY.clearedUnread,
          toast: COPY.clearedUnread,
        });
        setTimeout(() => {
          if (get().toast === COPY.clearedUnread) set({ toast: null });
        }, 2400);
      },

      openMessages: () => {
        const s = get();
        let connections = s.connections;
        const id = s.activeConnectionId || s.inviteCode;
        if (id) {
          connections = connections.map((c) =>
            c.id === id
              ? { ...c, unreadCount: 0, unreadReceived: [] }
              : c
          );
        }
        set({
          screen: "messages",
          unreadReceived: [],
          connections,
        });
      },

      setMyStatus: (myStatus) => {
        const needSpaceHold = myStatus === "Need space";
        set({
          myStatus,
          needSpaceHold,
          lastSignal: needSpaceHold
            ? COPY.needSpace
            : get().lastSignal === COPY.needSpace
              ? null
              : get().lastSignal,
        });
        const { inviteCode, myRole, myMood, pairDocId } = get();
        if (inviteCode && myRole) {
          import("./pairSync").then(({ pushMyPresence }) =>
            pushMyPresence(
              inviteCode,
              myRole,
              myStatus,
              myMood,
              pairDocId
            ).catch(() => {})
          );
        }
      },

      setMyMood: (myMood) => {
        set({ myMood });
        const { inviteCode, myRole, myStatus, pairDocId } = get();
        if (inviteCode && myRole) {
          import("./pairSync").then(({ pushMyPresence }) =>
            pushMyPresence(
              inviteCode,
              myRole,
              myStatus,
              myMood,
              pairDocId
            ).catch(() => {})
          );
        }
      },

      setLastSignal: (lastSignal) => set({ lastSignal }),

      sendLivePin: async () => {
        const { inviteCode, myRole, pairDocId, showToast, thread, partnerStatus, partnerMood } = get();
        if (partnerStatus === "Need space" || partnerMood === "Need space") {
          showToast("they're in Need space — pin paused");
          return;
        }
        const label = "Come get me · live pin · 30 min";
        const at = new Date().toISOString();
        const item: ThreadItem = {
          id: `pin-out-${Date.now()}`,
          kind: "pin",
          label,
          direction: "sent",
          at,
        };
        set({
          lastSignal: label,
          toast: "live pin sent",
          thread: upsertThreadList(thread, item),
        });
        setTimeout(() => {
          if (get().toast === "live pin sent") set({ toast: null });
        }, 2400);
        if (inviteCode && myRole) {
          try {
            const { pushLivePin } = await import("./pairSync");
            await pushLivePin(inviteCode, myRole, label, pairDocId);
          } catch {
            showToast("pin saved here — sync delayed");
          }
        } else {
          showToast("pair sync not ready — try again");
        }
      },

      endPair: () => {
        const s = get();
        const code = s.inviteCode;
        const docId = s.pairDocId;
        if (code) {
          import("./pairSync")
            .then(({ patchPair }) =>
              patchPair(code, { ended: true }, docId).catch(() => {})
            )
            .catch(() => {});
        }
        get().endPairFromRemote();
      },

      endPairFromRemote: () => {
        const s = get();
        const id = s.activeConnectionId || s.inviteCode;
        const rest = id
          ? removeConnection(s.connections, id)
          : s.connections;
        if (s.isPremium && rest.length > 0) {
          const next = rest[rest.length - 1];
          set({
            connections: rest,
            ...activeFieldsFromConnection(next),
            screen: "home",
            homeView: "list",
            toast: "connection ended",
            lastSignal: COPY.ended,
          });
          return;
        }
        set({
          connections: rest,
          ...emptyActivePair(),
          pairState: "ended",
          screen: "ended",
          lastSignal: COPY.ended,
          muted: false,
          archived: false,
          homeView: "pair",
          thread: [],
          unreadReceived: [],
          sentTaps: [],
        });
      },

      submitReport: () => {
        set({ reportSubmitted: true, toast: "report submitted · thank you" });
        setTimeout(() => {
          if (get().toast?.startsWith("report")) set({ toast: null });
        }, 2400);
      },

      unlockPremium: () => {
        const s = get();
        let connections = s.connections;
        const snap = snapshotActive(s);
        if (snap) connections = upsertConnection(connections, snap);
        const key = todayKey();
        set({
          isPremium: true,
          connections,
          homeView: connections.length > 0 ? "list" : "pair",
          tapsLeft: PREMIUM_TAP_LIMIT,
          tapsDayKey: key,
          toast: "premium unlocked",
          screen: "home",
        });
        setTimeout(() => {
          if (get().toast?.includes("premium")) set({ toast: null });
        }, 2400);
      },

      ensureDailyTaps: () => {
        const s = get();
        const key = todayKey();
        if (s.tapsDayKey === key) return;
        set({
          tapsDayKey: key,
          tapsLeft: dailyLimit(s.isPremium),
        });
      },

      goHome: () => {
        const s = get();
        if (s.pairState === "paired") {
          if (s.isPremium) {
            s.showConnectionsList();
          } else {
            set({ screen: "home", homeView: "pair" });
          }
          return;
        }
        if (s.pairState === "pending") {
          set({ screen: "waiting" });
          return;
        }
        if (s.pairState === "ended") {
          set({ screen: "ended" });
          return;
        }
        if (s.myName && s.myPhone) {
          set({ screen: "invite" });
          return;
        }
        if (s.myName) {
          set({ screen: "login" });
          return;
        }
        set({ screen: "splash" });
      },

      setLocale: (locale) => {
        set({ locale });
        if (locale !== "en") {
          get().showToast("coming soon — English for now");
        }
      },

      reset: () => set({ ...initial }),
    }),
    {
      name: "unex-v8",
      onRehydrateStorage: () => (state) => {
        state?.ensureDailyTaps();
      },
      partialize: (s) => ({
        myName: s.myName,
        partnerName: s.partnerName,
        pairState: s.pairState,
        myStatus: s.myStatus,
        myMood: s.myMood,
        partnerStatus: s.partnerStatus,
        partnerMood: s.partnerMood,
        tapsLeft: s.tapsLeft,
        tapsDayKey: s.tapsDayKey,
        muted: s.muted,
        archived: s.archived,
        needSpaceHold: s.needSpaceHold,
        unreadReceived: s.unreadReceived,
        sentTaps: s.sentTaps,
        thread: s.thread,
        lastSignal: s.lastSignal,
        partnerLivePin: s.partnerLivePin,
        inviteCode: s.inviteCode,
        myRole: s.myRole,
        pairDocId: s.pairDocId,
        seenTapIds: s.seenTapIds,
        isPremium: s.isPremium,
        myPhone: s.myPhone,
        locale: s.locale,
        connections: s.connections,
        activeConnectionId: s.activeConnectionId,
        homeView: s.isPremium ? "list" : "pair",
        screen:
          s.pairState === "paired"
            ? "home"
            : s.pairState === "pending"
              ? "waiting"
              : s.pairState === "ended"
                ? "ended"
                : s.myName && s.myPhone
                  ? "invite"
                  : s.myName
                    ? "login"
                    : "splash",
      }),
    }
  )
);
