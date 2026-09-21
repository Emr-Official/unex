"use client";

import { useEffect, useRef } from "react";
import { TAP_DECK } from "@/lib/constants";
import { useUnex } from "@/lib/store";
import { Avatar, Btn, Card, Pill, SectionTitle, Sub } from "../ui";

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function Messages() {
  const {
    partnerName,
    thread,
    tapsLeft,
    muted,
    setPendingTap,
    sendLivePin,
    setScreen,
    partnerLivePin,
    unreadReceived,
  } = useUnex();
  const name = partnerName || "them";
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (unreadReceived.length > 0) {
      useUnex.setState({ unreadReceived: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  return (
    <div className="flex flex-col flex-1 gap-2 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={name} sm />
          <div className="min-w-0">
            <strong className="text-[0.9rem] text-[#f3f0f8] block truncate">
              {name}
            </strong>
            <span className="text-[0.65rem] text-[#9b93a8]">messages</span>
          </div>
        </div>
        <Pill>thread</Pill>
      </div>

      {partnerLivePin && (
        <Card soft className="py-2.5 shrink-0">
          <p className="text-[0.78rem] font-semibold text-[#f9a8d4] text-center">
            📍 {partnerLivePin}
          </p>
        </Card>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 py-1 min-h-[200px]">
        {thread.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-2">
            <p className="text-[0.85rem] text-[#9b93a8]">
              No messages yet. Send a care tap below.
            </p>
            <Sub className="m-0">Button-first — soft, short, no free typing.</Sub>
          </div>
        )}

        {thread.map((item) => {
          if (item.direction === "system" || item.kind === "system") {
            return (
              <div
                key={item.id}
                className="text-center text-[0.65rem] text-[#6b6478] italic py-1"
              >
                {item.label}
              </div>
            );
          }
          const mine = item.direction === "sent";
          const isPin = item.kind === "pin";
          return (
            <div
              key={item.id}
              className={`flex flex-col max-w-[82%] ${
                mine ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div
                className={`px-3.5 py-2.5 text-[0.85rem] font-semibold ${
                  isPin
                    ? "rounded-2xl border border-[rgba(249,168,212,0.45)] bg-[rgba(249,168,212,0.12)] text-[#f9a8d4]"
                    : mine
                      ? "rounded-[16px_16px_4px_16px] bg-gradient-to-br from-[rgba(167,139,250,0.4)] to-[rgba(249,168,212,0.28)] border border-[rgba(196,181,253,0.4)] text-[#f3f0f8]"
                      : "rounded-[16px_16px_16px_4px] bg-[#1e1b26] border border-[rgba(196,181,253,0.2)] text-[#f3f0f8]"
                }`}
              >
                {isPin ? `📍 ${item.label}` : item.label}
              </div>
              <div
                className={`text-[0.62rem] text-[#6b6478] mt-0.5 px-1 ${
                  mine ? "text-right" : "text-left"
                }`}
              >
                {mine ? "you" : name} · {formatTime(item.at)}
                {muted && !mine ? " · muted" : ""}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-[rgba(196,181,253,0.12)] pt-2 space-y-2">
        <SectionTitle>send · {tapsLeft} left today</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {TAP_DECK.map((t) => (
            <button
              key={t.label}
              type="button"
              disabled={tapsLeft <= 0}
              onClick={() => setPendingTap(t.label, "messages")}
              className="flex-[1_1_auto] min-w-[calc(50%-4px)] inline-flex items-center justify-center px-2.5 py-1.5 rounded-full text-[0.68rem] font-medium border bg-[#1e1b26] border-[rgba(196,181,253,0.14)] text-[#f3f0f8] disabled:opacity-40 active:scale-[0.98]"
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void sendLivePin()}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-[rgba(249,168,212,0.35)] bg-[rgba(249,168,212,0.1)] px-3 py-2 text-[0.75rem] font-semibold text-[#f9a8d4] active:scale-[0.98]"
        >
          📍 Come get me · pin signal
        </button>
        <Btn variant="ghost" onClick={() => setScreen("home")}>
          back to home
        </Btn>
      </div>
    </div>
  );
}
