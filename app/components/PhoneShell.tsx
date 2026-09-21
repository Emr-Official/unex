"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useUnex } from "@/lib/store";

export function PhoneShell({ children }: { children: ReactNode }) {
  const setScreen = useUnex((s) => s.setScreen);
  const openMessages = useUnex((s) => s.openMessages);
  const pairState = useUnex((s) => s.pairState);
  const isPremium = useUnex((s) => s.isPremium);
  const unreadCount = useUnex((s) => s.unreadReceived.length);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const go = (
    screen:
      | "myStatus"
      | "muteArchive"
      | "safety"
      | "premium"
      | "invite"
      | "requests"
      | "messages"
      | "clearUnread"
  ) => {
    setMenuOpen(false);
    if (screen === "messages") {
      openMessages();
      return;
    }
    setScreen(screen);
  };

  return (
    <div className="min-h-dvh w-full bg-[#0c0b10] flex items-center justify-center p-0 sm:p-6">
      <div className="w-full max-w-[420px] min-h-dvh sm:min-h-[780px] sm:h-[min(860px,100dvh)] sm:rounded-[36px] sm:border sm:border-[rgba(196,181,253,0.14)] bg-[#16141c] sm:shadow-[0_0_0_1px_rgba(249,168,212,0.06),0_24px_48px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden relative">
        <div className="hidden sm:block w-[88px] h-[22px] bg-[#050508] rounded-[14px] mx-auto mt-3 mb-1 shrink-0" />

        <div className="flex justify-between items-center px-4 pt-3 sm:pt-1 pb-2 shrink-0 relative">
          <button
            type="button"
            onClick={() => {
              useUnex.getState().goHome();
            }}
            className="font-semibold tracking-tight bg-gradient-to-r from-[#c4b5fd] to-[#f9a8d4] bg-clip-text text-transparent text-[0.95rem]"
          >
            unex{isPremium ? "+" : ""}
          </button>

          <div className="flex items-center gap-1.5">
            {pairState === "paired" && (
              <button
                type="button"
                aria-label={
                  unreadCount > 0
                    ? `${unreadCount} unread messages`
                    : "Messages"
                }
                onClick={() => go("messages")}
                className={`relative w-9 h-9 rounded-full flex items-center justify-center border active:scale-95 transition ${
                  unreadCount > 0
                    ? "bg-[rgba(251,146,60,0.2)] border-[#fb923c] text-[#fb923c] shadow-[0_0_16px_rgba(251,146,60,0.45)] animate-pulse"
                    : "bg-[#1e1b26] border-[rgba(196,181,253,0.2)] text-[#c4b5fd]"
                }`}
              >
                <span className="text-[1.05rem] leading-none" aria-hidden>
                  🔔
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#f97316] text-[0.6rem] font-bold text-white flex items-center justify-center border border-[#16141c]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="More"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#c4b5fd] border border-[rgba(196,181,253,0.2)] bg-[#1e1b26] active:scale-95"
              >
                <span className="text-[1.1rem] leading-none tracking-widest">
                  ···
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 z-50 min-w-[190px] rounded-2xl border border-[rgba(196,181,253,0.2)] bg-[#1e1b26] shadow-[0_16px_40px_rgba(0,0,0,0.45)] overflow-hidden py-1">
                  {pairState === "paired" && (
                    <>
                      <button
                        type="button"
                        className="w-full text-left px-3.5 py-2.5 text-[0.82rem] text-[#f3f0f8] hover:bg-[rgba(196,181,253,0.1)] flex items-center justify-between"
                        onClick={() => go("messages")}
                      >
                        <span>Messages</span>
                        {unreadCount > 0 && (
                          <span className="text-[0.65rem] font-bold text-[#fb923c]">
                            {unreadCount} new
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-3.5 py-2.5 text-[0.82rem] text-[#f3f0f8] hover:bg-[rgba(196,181,253,0.1)]"
                        onClick={() => go("myStatus")}
                      >
                        My status
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-3.5 py-2.5 text-[0.82rem] text-[#f3f0f8] hover:bg-[rgba(196,181,253,0.1)]"
                        onClick={() => go("muteArchive")}
                      >
                        Mute &amp; archive
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-3.5 py-2.5 text-[0.82rem] text-[#f3f0f8] hover:bg-[rgba(196,181,253,0.1)]"
                        onClick={() => go("clearUnread")}
                      >
                        Clear unread
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-3.5 py-2.5 text-[0.82rem] text-[#f3f0f8] hover:bg-[rgba(196,181,253,0.1)]"
                        onClick={() => go("safety")}
                      >
                        Safety
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="w-full text-left px-3.5 py-2.5 text-[0.82rem] text-[#f3f0f8] hover:bg-[rgba(196,181,253,0.1)]"
                    onClick={() => go("requests")}
                  >
                    Requests inbox
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3.5 py-2.5 text-[0.82rem] text-[#f3f0f8] hover:bg-[rgba(196,181,253,0.1)]"
                    onClick={() => {
                      setMenuOpen(false);
                      const { locale, setLocale, showToast } = useUnex.getState();
                      const order = ["en", "es", "fr", "sw", "pt"] as const;
                      const idx = Math.max(0, order.indexOf(locale as (typeof order)[number]));
                      const next = order[(idx + 1) % order.length];
                      setLocale(next);
                      showToast(
                        next === "en"
                          ? "language · English"
                          : `language · ${next} (coming soon)`
                      );
                    }}
                  >
                    Language
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3.5 py-2.5 text-[0.82rem] text-[#f9a8d4] hover:bg-[rgba(196,181,253,0.1)] font-semibold"
                    onClick={() => go("premium")}
                  >
                    {isPremium ? "Premium · on" : "Premium"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
