"use client";

import { COPY } from "@/lib/constants";
import { useUnex } from "@/lib/store";
import { Avatar, Btn, Card, Pill, Signal, Sub } from "../ui";

export function Ended() {
  const { partnerName, reset } = useUnex();
  const name = partnerName || "them";

  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
        <Avatar name={name} />
        <h2 className="text-[1.05rem] font-semibold text-[#f3f0f8]">
          {COPY.ended}
        </h2>
        <Sub className="max-w-[240px]">
          this pair with {name} is over. reopen only via a new invite + accept.
        </Sub>
        <Pill tone="danger">ended</Pill>
      </div>
      <Card className="text-center">
        <Signal>{COPY.ended}</Signal>
      </Card>
      <Btn
        onClick={() => {
          reset();
        }}
      >
        start fresh
      </Btn>
    </div>
  );
}
