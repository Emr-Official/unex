"use client";

import { useState } from "react";
import { Btn, Card, Eyebrow, SectionTitle, Signal, Sub } from "../ui";
import { useUnex } from "@/lib/store";
import { LOCALES } from "@/lib/constants";
import { t } from "@/lib/i18n";
import { normalizePhone, upsertUser } from "@/lib/accountSync";

export function Login() {
  const {
    myName,
    myPhone,
    setMyName,
    setMyPhone,
    setScreen,
    pairState,
    showToast,
    locale,
    setLocale,
    goHome,
  } = useUnex();
  const [name, setName] = useState(myName || "");
  const [phone, setPhone] = useState(myPhone ? `+${myPhone}` : "");
  const [busy, setBusy] = useState(false);

  const go = async () => {
    const trimmed = name.trim();
    const p = normalizePhone(phone);
    if (!trimmed || p.length < 9) return;
    if (busy) return;
    setBusy(true);
    setMyName(trimmed);
    setMyPhone(p);
    try {
      await upsertUser(p, trimmed);
    } catch {
      showToast("saved locally — directory sync delayed");
    }
    setBusy(false);
    goHome();
  };

  return (
    <div className="flex flex-col flex-1 gap-3">
      <Eyebrow>your unex account</Eyebrow>
      <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
        name + WhatsApp number
      </h2>
      <Sub>
        Your WhatsApp number is how someone blocked on other apps can send you
        an in-app request. They still have to Accept here — we never message
        them on WhatsApp for you.
      </Sub>
      <Card className="mt-1 flex flex-col gap-3">
        <div>
          <SectionTitle>your first name</SectionTitle>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sam"
            className="mt-2 w-full bg-[#0c0b10] border border-[rgba(196,181,253,0.14)] rounded-xl px-3 py-2.5 text-[0.9rem] text-[#f3f0f8] placeholder:text-[#6b6478] outline-none focus:border-[rgba(196,181,253,0.45)]"
          />
        </div>
        <div>
          <SectionTitle>WhatsApp number</SectionTitle>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void go()}
            placeholder="+256 7XX XXX XXX"
            inputMode="tel"
            className="mt-2 w-full bg-[#0c0b10] border border-[rgba(196,181,253,0.14)] rounded-xl px-3 py-2.5 text-[0.9rem] text-[#f3f0f8] placeholder:text-[#6b6478] outline-none focus:border-[rgba(196,181,253,0.45)]"
          />
        </div>
      </Card>
      <div className="mt-auto flex flex-col gap-2">
        <p className="text-[0.65rem] text-center text-[#6b6478] uppercase tracking-wide">
          {t(locale, "lang.picker")}
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center mb-1">
          {LOCALES.map((L) => (
            <button
              key={L.code}
              type="button"
              onClick={() => setLocale(L.code)}
              className={`px-2.5 py-1 rounded-full text-[0.68rem] font-medium border ${
                locale === L.code
                  ? "bg-[rgba(196,181,253,0.2)] border-[rgba(196,181,253,0.5)] text-[#c4b5fd]"
                  : "bg-[#1e1b26] border-[rgba(196,181,253,0.14)] text-[#9b93a8]"
              }`}
            >
              {L.label}
              {!L.live ? " · soon" : ""}
            </button>
          ))}
        </div>
        <Btn
          onClick={() => void go()}
          disabled={!name.trim() || normalizePhone(phone).length < 9 || busy}
        >
          {busy ? "saving…" : t(locale, "login.enter")}
        </Btn>
        <Btn variant="ghost" onClick={() => setScreen("splash")}>
          back
        </Btn>
        <Signal>
          include country code · only reaches people who already joined unex
        </Signal>
      </div>
    </div>
  );
}
