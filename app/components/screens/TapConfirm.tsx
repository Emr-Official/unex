"use client";

import { useUnex } from "@/lib/store";
import { Btn, Card, Eyebrow, Sub } from "../ui";

export function TapConfirm() {
  const { pendingTap, partnerName, tapsLeft, sendTap, setPendingTap } = useUnex();
  const label = pendingTap || "Hey";
  const name = partnerName || "them";

  return (
    <div className="flex flex-col flex-1 gap-3">
      <Eyebrow>confirm tap</Eyebrow>
      <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
        send this?
      </h2>
      <Card soft className="text-center py-5">
        <div className="text-[1.4rem] mb-1.5">💬</div>
        <div className="font-bold text-[1.1rem] text-[#f3f0f8]">{label}</div>
        <Sub className="mt-1.5">
          to {name} · counts as 1 of 5 taps today ({tapsLeft} left)
        </Sub>
      </Card>
      <Btn onClick={sendTap} disabled={tapsLeft <= 0}>
        send tap
      </Btn>
      <Btn variant="ghost" onClick={() => setPendingTap(null)}>
        never mind
      </Btn>
    </div>
  );
}
