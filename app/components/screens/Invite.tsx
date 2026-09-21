"use client";

import { useState } from "react";
import { Btn, Card, Eyebrow, SectionTitle, Signal, Sub } from "../ui";
import { useUnex } from "@/lib/store";
import { inviteShareUrl } from "@/lib/invite";
import { formatPhoneDisplay } from "@/lib/accountSync";

export function Invite() {
  const {
    partnerName,
    setPartnerName,
    sendInvite,
    sendDirectRequest,
    showToast,
    myName,
    myPhone,
    inviteCode,
    pairState,
    isPremium,
    setScreen,
  } = useUnex();
  const [mode, setMode] = useState<"link" | "direct">("link");
  const [name, setName] = useState(partnerName || "");
  const [toPhone, setToPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const guardPremium = () => {
    if (pairState === "paired" && !isPremium) {
      showToast("free plan: one connection — see Premium");
      setScreen("premium");
      return false;
    }
    return true;
  };

  const sendLinkInvite = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast("add their first name");
      return;
    }
    if (!guardPremium()) return;
    if (busy) return;
    setBusy(true);
    setPartnerName(trimmed);
    await sendInvite();
    setBusy(false);
  };

  const copyLink = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast("add their first name first");
      return;
    }
    if (!guardPremium()) return;
    setPartnerName(trimmed);
    let code = inviteCode;
    if (!code) {
      setBusy(true);
      await sendInvite();
      code = useUnex.getState().inviteCode;
      setBusy(false);
    }
    if (!code) {
      showToast("couldn’t create invite — try again");
      return;
    }
    const url = inviteShareUrl(myName || "someone", trimmed, code);
    try {
      await navigator.clipboard.writeText(url);
      showToast("invite link copied");
    } catch {
      showToast(url);
    }
  };

  const sendDirect = async () => {
    if (!toPhone.trim()) {
      showToast("enter their WhatsApp number");
      return;
    }
    if (!guardPremium()) return;
    if (busy) return;
    setBusy(true);
    await sendDirectRequest(toPhone);
    setBusy(false);
  };

  return (
    <div className="flex flex-col flex-1 gap-3">
      <Eyebrow>
        pair up · {myPhone ? formatPhoneDisplay(myPhone) : "you"}
      </Eyebrow>
      <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
        invite them in
      </h2>
      <Sub>
        If you can&apos;t reach them on other apps, send an in-app request to
        their WhatsApp number only if they already joined unex — or share an
        invite link. Both still say yes here.
      </Sub>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`flex-1 rounded-full px-3 py-2 text-[0.75rem] font-semibold border ${
            mode === "link"
              ? "bg-[rgba(196,181,253,0.2)] border-[rgba(196,181,253,0.45)] text-[#f3f0f8]"
              : "bg-[#1e1b26] border-[rgba(196,181,253,0.14)] text-[#9b93a8]"
          }`}
        >
          Invite link
        </button>
        <button
          type="button"
          onClick={() => setMode("direct")}
          className={`flex-1 rounded-full px-3 py-2 text-[0.75rem] font-semibold border ${
            mode === "direct"
              ? "bg-[rgba(196,181,253,0.2)] border-[rgba(196,181,253,0.45)] text-[#f3f0f8]"
              : "bg-[#1e1b26] border-[rgba(196,181,253,0.14)] text-[#9b93a8]"
          }`}
        >
          WhatsApp request
        </button>
      </div>

      {mode === "link" ? (
        <>
          <Card className="flex flex-col gap-2">
            <SectionTitle>their first name</SectionTitle>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="first name"
              className="w-full bg-[#0c0b10] border border-[rgba(196,181,253,0.14)] rounded-xl px-3 py-2.5 text-[0.8rem] text-[#f3f0f8] placeholder:text-[#6b6478] outline-none focus:border-[rgba(196,181,253,0.45)]"
            />
          </Card>
          <Btn onClick={() => void sendLinkInvite()} disabled={busy}>
            {busy ? "sending…" : "create invite"}
          </Btn>
          <Btn variant="subtle" onClick={() => void copyLink()} disabled={busy}>
            copy invite link
          </Btn>
          <Signal>share the link any way you still can — Accept happens in unex</Signal>
        </>
      ) : (
        <>
          <Card className="flex flex-col gap-2">
            <SectionTitle>their WhatsApp number</SectionTitle>
            <input
              value={toPhone}
              onChange={(e) => setToPhone(e.target.value)}
              placeholder="+256 7XX XXX XXX"
              inputMode="tel"
              className="w-full bg-[#0c0b10] border border-[rgba(196,181,253,0.14)] rounded-xl px-3 py-2.5 text-[0.8rem] text-[#f3f0f8] placeholder:text-[#6b6478] outline-none focus:border-[rgba(196,181,253,0.45)]"
            />
          </Card>
          <Btn onClick={() => void sendDirect()} disabled={busy}>
            {busy ? "sending…" : "send direct request"}
          </Btn>
          <Btn variant="ghost" onClick={() => setScreen("requests")}>
            inbox · requests to me
          </Btn>
          <Signal>
            only if they already registered that number on unex. we don’t open
            WhatsApp or text them.
          </Signal>
        </>
      )}
    </div>
  );
}
