"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, Btn, Card, Pill, Sub } from "../ui";
import { useUnex } from "@/lib/store";
import { inviteShareUrl } from "@/lib/invite";
import { getInviteRecord } from "@/lib/inviteSync";

export function Waiting() {
  const {
    partnerName,
    myName,
    inviteCode,
    cancelInvite,
    showToast,
    markPairedFromInvite,
  } = useUnex();
  const name = partnerName || "them";
  const [syncHint, setSyncHint] = useState("waiting for them to accept…");
  const pairedRef = useRef(false);

  useEffect(() => {
    if (!inviteCode) {
      setSyncHint("creating invite link…");
      return;
    }
    setSyncHint("listening for their accept…");
    let alive = true;
    const tick = async () => {
      if (!alive || pairedRef.current) return;
      try {
        const rec = await getInviteRecord(inviteCode);
        if (!rec || !alive) return;
        if (rec.status === "accepted") {
          pairedRef.current = true;
          await markPairedFromInvite();
          return;
        }
        if (rec.status === "declined") {
          pairedRef.current = true;
          cancelInvite();
          showToast("they declined");
        }
      } catch {
        // keep waiting; network blips are fine
      }
    };
    const safeTick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      void tick();
    };
    safeTick();
    const id = window.setInterval(safeTick, 4000);
    const onVis = () => {
      if (!document.hidden) void tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [inviteCode, markPairedFromInvite, cancelInvite, showToast]);

  const copyLink = async () => {
    if (!inviteCode) {
      showToast("still creating invite — try again in a sec");
      return;
    }
    const url = inviteShareUrl(myName || "someone", name, inviteCode);
    try {
      await navigator.clipboard.writeText(url);
      showToast("invite link copied");
    } catch {
      showToast(url);
    }
  };

  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-2">
        <div className="relative w-[72px] h-[72px] rounded-full bg-[rgba(196,181,253,0.15)] border-2 border-[rgba(196,181,253,0.4)] flex items-center justify-center">
          <div className="absolute -inset-2 rounded-full border border-[rgba(249,168,212,0.25)] animate-pulse" />
          <Avatar name={name} />
        </div>
        <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
          waiting for them
        </h2>
        <Sub>
          invite ready for {name}.
          <br />
          soft reopen. both have to say yes.
        </Sub>
        <Pill tone="warn">pending</Pill>
        <p className="text-[0.7rem] text-[#6b6478]">{syncHint}</p>
      </div>
      <Card soft className="text-center">
        <Sub className="m-0">
          share the invite link. when they Accept, you land here too.
          <br />
          free plan: one active connection.
        </Sub>
      </Card>
      <Btn onClick={copyLink} disabled={!inviteCode}>
        {inviteCode ? "copy invite link" : "preparing link…"}
      </Btn>
      <Btn variant="ghost" onClick={cancelInvite}>
        cancel invite
      </Btn>
    </div>
  );
}
