"use client";

import { useState } from "react";
import { COPY } from "@/lib/constants";
import { useUnex } from "@/lib/store";
import {
  Btn,
  Card,
  Eyebrow,
  QuietLink,
  SectionTitle,
  Sub,
  Toggle,
} from "../ui";

export function Safety() {
  const {
    partnerName,
    muted,
    archived,
    setMuted,
    setArchived,
    endPair,
    submitReport,
    reportSubmitted,
    setScreen, goHome,
  } = useUnex();
  const name = partnerName || "them";
  const [confirmEnd, setConfirmEnd] = useState(false);

  return (
    <div className="flex flex-col flex-1 gap-3">
      <Eyebrow>pair settings</Eyebrow>
      <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
        with {name}
      </h2>

      <Card>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-[0.82rem] text-[#f3f0f8]">Mute</span>
          <Toggle on={muted} onChange={setMuted} />
        </div>
        <div className="h-px bg-[rgba(196,181,253,0.14)]" />
        <div className="flex items-center justify-between py-1.5">
          <span className="text-[0.82rem] text-[#f3f0f8]">Archive</span>
          <Toggle on={archived} onChange={setArchived} />
        </div>
      </Card>

      <Sub>
        prefer mute &amp; archive. ending the pair is permanent for this
        connection.
      </Sub>

      <div className="mt-auto pt-3">
        <div className="text-[0.65rem] text-[#6b6478] text-center mb-1.5">
          safety · buried on purpose
        </div>
        {!confirmEnd ? (
          <Btn variant="danger" onClick={() => setConfirmEnd(true)}>
            End pair (Block)
          </Btn>
        ) : (
          <div className="flex flex-col gap-2">
            <Card className="text-center">
              <Sub className="m-0">
                this ends the channel. they&apos;ll see &ldquo;{COPY.ended}&rdquo;.
                reopen only via new invite + accept.
              </Sub>
            </Card>
            <Btn variant="danger" onClick={endPair}>
              yes, end pair
            </Btn>
            <Btn variant="ghost" onClick={() => setConfirmEnd(false)}>
              keep pair
            </Btn>
          </div>
        )}
        <div className="mt-2.5 text-center">
          <QuietLink
            onClick={() => {
              if (!reportSubmitted) submitReport();
            }}
          >
            {reportSubmitted ? "report submitted" : "Report"}
          </QuietLink>
        </div>
      </div>

      <Card className="text-center py-2.5">
        <SectionTitle>they would see</SectionTitle>
        <p className="text-[0.72rem] italic text-[#fb7185] text-center py-1 m-0">
          {COPY.ended}
        </p>
      </Card>

      <Btn variant="subtle" onClick={() => goHome()}>
        back
      </Btn>
    </div>
  );
}
