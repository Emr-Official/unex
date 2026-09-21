"use client";

import { TAP_DECK } from "@/lib/constants";
import { useUnex } from "@/lib/store";
import {
  Avatar,
  Card,
  Chip,
  Pill,
  QuietLink,
  SectionTitle,
  Sub,
} from "../ui";

function ConnectionsList() {
  const {
    connections,
    selectConnection,
    setScreen,
    isPremium,
    partnerName,
    inviteCode,
    unreadReceived,
    lastSignal,
    partnerMood,
    pairState,
  } = useUnex();

  // Ensure the active pair appears even if connections[] was empty (migration)
  const rows =
    connections.length > 0
      ? [...connections].sort((a, b) =>
          (b.updatedAt || "").localeCompare(a.updatedAt || "")
        )
      : pairState === "paired" && inviteCode
        ? [
            {
              id: inviteCode,
              pairKey: inviteCode,
              partnerName: partnerName || "them",
              myRole: "host" as const,
              pairDocId: null,
              lastSignal,
              unreadCount: unreadReceived.length,
              partnerStatus: "Open to talk" as const,
              partnerMood: partnerMood,
              partnerLivePin: null,
              thread: [],
              unreadReceived,
              sentTaps: [],
              seenTapIds: [],
              muted: false,
              archived: false,
              updatedAt: new Date().toISOString(),
            },
          ]
        : [];

  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
            Connections
          </h2>
          <Sub className="m-0 mt-0.5">
            {isPremium ? "Premium · multiple pairs" : "Free · one pair"}
          </Sub>
        </div>
        <Pill>{rows.length}</Pill>
      </div>

      {rows.length === 0 && (
        <Card soft className="text-center py-6">
          <p className="text-[0.85rem] text-[#9b93a8]">No connections yet.</p>
          <button
            type="button"
            onClick={() => setScreen("invite")}
            className="mt-3 text-[0.8rem] font-semibold text-[#f9a8d4]"
          >
            Invite someone
          </button>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {rows.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => selectConnection(c.id)}
            className="w-full flex items-center gap-3 rounded-[18px] border border-[rgba(196,181,253,0.18)] bg-[#1e1b26] px-3.5 py-3 text-left active:scale-[0.99] transition hover:border-[rgba(249,168,212,0.35)]"
          >
            <Avatar name={c.partnerName} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-[0.9rem] text-[#f3f0f8] truncate">
                  {c.partnerName || "them"}
                </strong>
                {c.unreadCount > 0 && (
                  <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f97316] text-[0.6rem] font-bold text-white flex items-center justify-center">
                    {c.unreadCount > 9 ? "9+" : c.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-[0.7rem] text-[#9b93a8] truncate mt-0.5">
                {c.lastSignal ||
                  `mood · ${c.partnerMood}` ||
                  "paired"}
              </p>
            </div>
            <span className="text-[#c4b5fd] text-lg shrink-0" aria-hidden>
              ›
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setScreen("invite")}
        className="w-full rounded-full px-4 py-2.5 font-semibold text-[0.82rem] bg-gradient-to-r from-[#a78bfa] to-[#f9a8d4] text-[#1a1020] active:scale-[0.98]"
      >
        + Invite another
      </button>

      <div className="flex justify-between mt-auto pt-2">
        <QuietLink onClick={() => setScreen("requests")}>requests</QuietLink>
        <QuietLink onClick={() => setScreen("premium")}>premium</QuietLink>
      </div>
    </div>
  );
}

function PairHome() {
  const {
    partnerName,
    partnerStatus,
    partnerMood,
    myStatus,
    myMood,
    tapsLeft,
    muted,
    archived,
    needSpaceHold,
    lastSignal,
    unreadReceived,
    sentTaps,
    setPendingTap,
    setScreen,
    sendLivePin,
    openMessages,
    partnerLivePin,
    isPremium,
    showConnectionsList,
    connections,
  } = useUnex();

  const name = partnerName || "them";
  const showBack = isPremium && connections.length > 0;

  if (archived) {
    return (
      <div className="flex flex-col flex-1 gap-3">
        {showBack && (
          <QuietLink onClick={() => showConnectionsList()}>
            ← connections
          </QuietLink>
        )}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <Avatar name={name} />
          <h2 className="text-[1.05rem] font-semibold text-[#f3f0f8]">
            archived
          </h2>
          <p className="text-[0.8rem] text-[#9b93a8] max-w-[240px]">
            {name} is quiet for now. open when you&apos;re ready.
          </p>
          <Pill tone="muted">Quiet for now</Pill>
        </div>
        <button
          type="button"
          onClick={() => {
            useUnex.getState().setArchived(false);
          }}
          className="w-full rounded-full px-4 py-2.5 font-semibold text-[0.82rem] bg-[#1e1b26] text-[#f3f0f8] border border-[rgba(196,181,253,0.14)]"
        >
          unarchive
        </button>
        <div className="flex justify-between pt-1">
          <QuietLink onClick={() => setScreen("muteArchive")}>
            mute &amp; archive
          </QuietLink>
          <QuietLink onClick={() => setScreen("safety")}>
            pair settings
          </QuietLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-3">
      {showBack && (
        <button
          type="button"
          onClick={() => showConnectionsList()}
          className="text-left text-[0.72rem] text-[#c4b5fd] font-semibold"
        >
          ← all connections
        </button>
      )}

      <div className="flex items-center gap-2.5">
        <Avatar name={name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <strong className="text-[0.95rem] text-[#f3f0f8] truncate">
              {name}
            </strong>
            <Pill>paired</Pill>
          </div>
          <div className="text-[0.72rem] text-[#9b93a8] mt-0.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f9a8d4] inline-block" />
            mood: {partnerMood}
            {muted && <span className="ml-1 opacity-70">· muted</span>}
          </div>
        </div>
      </div>

      <Card soft>
        <SectionTitle>their status</SectionTitle>
        <div className="flex items-center justify-between mt-1">
          <span className="font-semibold text-[0.9rem] text-[#f3f0f8]">
            {partnerStatus}
          </span>
          <Chip pink>♡</Chip>
        </div>
        {lastSignal && (
          <p className="text-[0.72rem] italic text-[#9b93a8] mt-2 text-center">
            {lastSignal}
          </p>
        )}
        {needSpaceHold && !lastSignal && (
          <p className="text-[0.72rem] italic text-[#9b93a8] mt-2 text-center">
            Delivered when they&apos;re ready
          </p>
        )}
      </Card>

      <button
        type="button"
        onClick={() => setScreen("myStatus")}
        className="w-full flex items-center justify-between rounded-[18px] border border-[rgba(249,168,212,0.35)] bg-gradient-to-br from-[rgba(167,139,250,0.18)] to-[rgba(249,168,212,0.12)] px-3.5 py-3 text-left active:scale-[0.99] transition"
      >
        <span>
          <span className="block text-[0.68rem] font-semibold text-[#6b6478] uppercase tracking-[0.05em]">
            my status
          </span>
          <span className="block font-semibold text-[0.88rem] text-[#f3f0f8] mt-0.5">
            {myStatus}
          </span>
          <span className="block text-[0.7rem] text-[#9b93a8] mt-0.5">
            mood · {myMood}
          </span>
        </span>
        <span className="text-[0.75rem] font-semibold text-[#f9a8d4] shrink-0">
          Edit
        </span>
      </button>

      {partnerLivePin && (
        <Card soft className="py-2.5">
          <p className="text-[0.8rem] font-semibold text-[#f9a8d4] text-center">
            📍 {partnerLivePin}
          </p>
          <p className="text-[0.65rem] text-[#9b93a8] text-center mt-1">
            they dropped a live pin · expires in 30 min
          </p>
        </Card>
      )}

      <button
        type="button"
        onClick={() => openMessages()}
        className={`flex items-center justify-between rounded-[18px] border px-3.5 py-2.5 text-left active:scale-[0.99] transition ${
          unreadReceived.length > 0
            ? "border-[#fb923c] bg-[rgba(251,146,60,0.15)] shadow-[0_0_20px_rgba(251,146,60,0.25)]"
            : "border-[rgba(196,181,253,0.14)] bg-[#1e1b26]"
        }`}
      >
        <span className="flex items-center gap-2 text-[0.8rem] text-[#f3f0f8]">
          <span
            className={
              unreadReceived.length > 0
                ? "text-[#fb923c] animate-pulse text-lg"
                : "text-[#c4b5fd]"
            }
            aria-hidden
          >
            🔔
          </span>
          {unreadReceived.length > 0
            ? `${unreadReceived.length} new from ${name}`
            : "Messages"}
        </span>
        {unreadReceived.length > 0 ? (
          <Pill tone="warn">{unreadReceived.length}</Pill>
        ) : (
          <span className="text-[0.72rem] text-[#f9a8d4] font-semibold">
            Open
          </span>
        )}
      </button>

      <Card>
        <SectionTitle>live pin</SectionTitle>
        <p className="text-[0.72rem] text-[#9b93a8] mt-1 mb-2">
          Map pin for right now — not one shared spot. Expires in 30 min.
        </p>
        <button
          type="button"
          onClick={() => {
            void sendLivePin();
          }}
          className="w-full flex items-center gap-3 rounded-2xl border border-[rgba(249,168,212,0.35)] bg-gradient-to-br from-[rgba(167,139,250,0.2)] to-[rgba(249,168,212,0.15)] px-3.5 py-3 text-left active:scale-[0.99] transition"
        >
          <span
            aria-hidden
            className="shrink-0 w-11 h-11 rounded-full bg-[#f9a8d4] text-[#1a1020] flex items-center justify-center text-xl shadow-[0_8px_24px_rgba(249,168,212,0.35)]"
          >
            📍
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-[0.88rem] text-[#f3f0f8]">
              Come get me
            </span>
            <span className="block text-[0.7rem] text-[#9b93a8]">
              Send live location pin · they see the map
            </span>
          </span>
        </button>
      </Card>

      <div>
        <SectionTitle>tap deck · {tapsLeft} left today</SectionTitle>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {TAP_DECK.map((t) => {
            const disabled = tapsLeft <= 0;
            return (
              <button
                key={t.label}
                type="button"
                disabled={disabled}
                onClick={() => setPendingTap(t.label)}
                className="flex-[1_1_auto] min-w-[calc(50%-4px)] inline-flex items-center justify-center px-3 py-2 rounded-full text-[0.72rem] font-medium border bg-[#1e1b26] border-[rgba(196,181,253,0.14)] text-[#f3f0f8] disabled:opacity-40 active:scale-[0.98] transition"
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {sentTaps.length > 0 && (
        <div className="mt-1">
          <SectionTitle>recent sent</SectionTitle>
          <div className="flex flex-col gap-1.5 mt-2 items-end">
            {sentTaps.slice(-3).map((t) => (
              <div key={t.id} className="max-w-[85%]">
                <div className="bg-gradient-to-br from-[rgba(167,139,250,0.35)] to-[rgba(249,168,212,0.25)] border border-[rgba(196,181,253,0.4)] rounded-[16px_16px_4px_16px] px-3.5 py-2.5 text-[0.85rem] font-semibold text-[#f3f0f8]">
                  {t.label}
                </div>
                <div className="text-[0.65rem] text-[#6b6478] text-right mt-1">
                  {needSpaceHold
                    ? "held · when ready"
                    : muted
                      ? "Not reading right now"
                      : "delivered · just now"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-auto pt-3">
        <QuietLink onClick={() => openMessages()}>messages</QuietLink>
        <QuietLink onClick={() => setScreen("muteArchive")}>
          mute &amp; archive
        </QuietLink>
        <QuietLink onClick={() => setScreen("safety")}>safety</QuietLink>
      </div>
    </div>
  );
}

export function Home() {
  const isPremium = useUnex((s) => s.isPremium);
  const homeView = useUnex((s) => s.homeView);
  const pairState = useUnex((s) => s.pairState);

  // Premium → connections list by default; free → single pair home
  if (isPremium && homeView === "list" && pairState === "paired") {
    return <ConnectionsList />;
  }

  return <PairHome />;
}
