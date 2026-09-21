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
  const { acceptInvite, declineInvite, setMyName, myName, showToast } = useUnex();
  const [busy, setBusy] = useState(false);

  const accept = async () => {
    if (busy) return;
    setBusy(true);
    const name = myName.trim() || "you";
    if (!myName.trim()) setMyName(name);
    try {
      if (inviteCode) await markInviteAccepted(inviteCode, name);
    } catch {
      showToast("accepted locally — sender may need a moment");
    }
    await acceptInvite(fromName, inviteCode || null);
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
