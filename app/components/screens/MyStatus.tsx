"use client";

import { MOODS, STATUSES } from "@/lib/constants";
import { useUnex } from "@/lib/store";
import { Btn, Card, Chip, Eyebrow, SectionTitle, Sub } from "../ui";

export function MyStatus() {
  const { myStatus, myMood, setMyStatus, setMyMood, setScreen, goHome } = useUnex();

  return (
    <div className="flex flex-col flex-1 gap-3">
      <Eyebrow>you</Eyebrow>
      <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
        my status &amp; mood
      </h2>
      <Sub>visible to your paired person only.</Sub>

      <Card soft>
        <SectionTitle>status</SectionTitle>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {STATUSES.map((s) => (
            <Chip key={s} active={myStatus === s} onClick={() => setMyStatus(s)}>
              {s}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>mood</SectionTitle>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {MOODS.map((m) => (
            <Chip key={m} active={myMood === m} pink={m === "Soft"} onClick={() => setMyMood(m)}>
              {m}
            </Chip>
          ))}
        </div>
      </Card>

      <Btn className="mt-auto" onClick={() => goHome()}>
        save
      </Btn>
    </div>
  );
}
