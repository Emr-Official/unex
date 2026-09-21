"use client";

import { useState } from "react";
import { Btn, Card, Eyebrow, SectionTitle, Signal, Sub } from "../ui";
import { useUnex } from "@/lib/store";
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
    if (pairState === "paired") setScreen("home");
    else if (pairState === "pending") setScreen("waiting");
    else setScreen("invite");
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
        <Btn
          onClick={() => void go()}
          disabled={!name.trim() || normalizePhone(phone).length < 9 || busy}
        >
          {busy ? "saving…" : "enter unex"}
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
