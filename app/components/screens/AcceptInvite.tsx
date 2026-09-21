"use client";

import { useState } from "react";
import { Avatar, Btn, Card, Pill, Sub } from "../ui";
import { useUnex } from "@/lib/store";
import { clearInviteQuery } from "@/lib/invite";
import { markInviteAccepted, markInviteDeclined } from "@/lib/inviteSync";

export function AcceptInvite({
  fromName,
  inviteCode,
  onDone,
}: {
  fromName: string;
  inviteCode?: string | null;
  onDone?: () => void;
}) {
  const {
    acceptInvite,
    declineInvite,
    setMyName,
    myName,
    myPhone,
    showToast,
    pairState,
    isPremium,
    setScreen,
  } = useUnex();
  const [busy, setBusy] = useState(false);

  const codeMissing = !inviteCode;
  const needsLogin = !myPhone || myPhone.length < 9;

  const accept = async () => {
    if (busy) return;
    if (codeMissing) {
      showToast("invite incomplete — ask them to resend the link");
      return;
    }
    if (needsLogin) {
      showToast("add your WhatsApp number before accepting");
      setScreen("login");
      return;
    }
    if (pairState === "paired" && !isPremium) {
      showToast("free plan: one connection — see Premium");
      setScreen("premium");
      return;
    }
    setBusy(true);
    const name = myName.trim() || "you";
    if (!myName.trim()) setMyName(name);
    try {
      await markInviteAccepted(inviteCode!, name);
    } catch {
      showToast("accepted locally — sender may need a moment");
    }
    await acceptInvite(fromName, inviteCode!);
    clearInviteQuery();
    onDone?.();
    setBusy(false);
  };

  const decline = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (inviteCode) await markInviteDeclined(inviteCode);
    } catch {
      /* ignore */
    }
    declineInvite();
    clearInviteQuery();
    onDone?.();
    setBusy(false);
  };

  if (codeMissing) {
    return (
      <div className="flex flex-col flex-1 gap-3">
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-2">
          <Avatar name={fromName || "?"} />
          <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
            invite incomplete
          </h2>
          <Sub>
            this link is missing its code. ask them to copy the invite again from
            unex.
          </Sub>
          <Pill tone="warn">no code</Pill>
        </div>
        <Btn variant="ghost" onClick={decline}>
          dismiss
        </Btn>
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="flex flex-col flex-1 gap-3">
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-2">
          <Avatar name={fromName} />
          <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
            {fromName} invited you
          </h2>
          <Sub>
            soft reopen. sign in with your WhatsApp number first — we keep this
            invite ready.
          </Sub>
          <Pill>invite</Pill>
        </div>
        <Card soft className="text-center">
          <Sub className="m-0">
            both must opt in. we never message them on WhatsApp for you.
          </Sub>
        </Card>
        <Btn
          onClick={() => {
            // Keep ?invite=… query so App returns here after login
            setScreen("login");
          }}
        >
          continue to login
        </Btn>
        <Btn variant="ghost" onClick={decline} disabled={busy}>
          decline
        </Btn>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-2">
        <Avatar name={fromName} />
        <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
          {fromName} invited you
        </h2>
        <Sub>
          soft reopen. both have to say yes.
          <br />
          accept opens a button-only channel.
        </Sub>
        <Pill>invite</Pill>
      </div>
      <Card soft className="text-center">
        <Sub className="m-0">
          no free typing in v1. mute &amp; archive when you need quiet.
        </Sub>
      </Card>
      <Btn onClick={accept} disabled={busy}>
        {busy ? "one sec…" : "accept"}
      </Btn>
      <Btn variant="ghost" onClick={decline} disabled={busy}>
        decline
      </Btn>
    </div>
  );
}
