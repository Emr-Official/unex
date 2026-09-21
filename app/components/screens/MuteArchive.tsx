"use client";

import { COPY } from "@/lib/constants";
import { useUnex } from "@/lib/store";
import { Btn, Card, Chip, Eyebrow, SectionTitle, Signal, Sub, Toggle } from "../ui";

export function MuteArchive() {
  const {
    muted,
    archived,
    needSpaceHold,
    setMuted,
    setArchived,
    setNeedSpaceHold,
    setScreen,
    goHome,
  } = useUnex();

  return (
    <div className="flex flex-col flex-1 gap-3">
      <Eyebrow>controls</Eyebrow>
      <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
        mute &amp; archive
      </h2>
      <Sub>
        culture first. block is the quiet fire exit — buried under safety.
      </Sub>

      <Card>
        <div className="flex items-center justify-between py-2.5">
          <div>
            <div className="font-semibold text-[0.82rem] text-[#f3f0f8]">Mute</div>
            <div className="text-[0.68rem] text-[#9b93a8]">no push · thread stays</div>
          </div>
          <Toggle on={muted} onChange={setMuted} />
        </div>
        <div className="h-px bg-[rgba(196,181,253,0.14)]" />
        <div className="flex items-center justify-between py-2.5">
          <div>
            <div className="font-semibold text-[0.82rem] text-[#f3f0f8]">Archive</div>
            <div className="text-[0.68rem] text-[#9b93a8]">
              hide from home · open when ready
            </div>
          </div>
          <Toggle on={archived} onChange={setArchived} />
        </div>
        <div className="h-px bg-[rgba(196,181,253,0.14)]" />
        <div className="flex items-center justify-between py-2.5">
          <div>
            <div className="font-semibold text-[0.82rem] text-[#f3f0f8]">Need space</div>
            <div className="text-[0.68rem] text-[#9b93a8]">48–72h hold queue</div>
          </div>
          <Toggle on={needSpaceHold} onChange={setNeedSpaceHold} />
        </div>
      </Card>

      <Card soft>
        <SectionTitle>they see</SectionTitle>
        <Signal>
          {muted
            ? COPY.muted
            : needSpaceHold
              ? COPY.needSpace
              : archived
                ? COPY.archived
                : "reading when ready"}
        </Signal>
      </Card>

      <div className="flex flex-wrap gap-1.5">
        <Chip>Need space · 48–72h hold</Chip>
      </div>
      <Sub className="text-[0.72rem]">
        their taps wait in a queue. sender sees:{" "}
        <em>Delivered when they&apos;re ready.</em>
      </Sub>

      <Btn
        variant="subtle"
        onClick={() => setScreen("clearUnread")}
      >
        clear unread
      </Btn>
      <Btn variant="ghost" className="mt-auto" onClick={() => goHome()}>
        done
      </Btn>
    </div>
  );
}
