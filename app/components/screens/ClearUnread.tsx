"use client";

import { COPY } from "@/lib/constants";
import { useUnex } from "@/lib/store";
import { Avatar, Btn, Card, Chip, Pill, SectionTitle, Sub } from "../ui";

export function ClearUnread() {
  const { partnerName, unreadReceived, clearUnread, setScreen, lastSignal } =
    useUnex();
  const name = partnerName || "them";

  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={name} sm />
          <strong className="text-[0.9rem] text-[#f3f0f8]">{name}</strong>
        </div>
        <Pill tone="muted">{unreadReceived.length} unread</Pill>
      </div>

      <Card className={unreadReceived.length === 0 ? "opacity-40" : "opacity-55"}>
        <div className="flex flex-wrap gap-1.5">
          {(unreadReceived.length > 0
            ? unreadReceived
            : [{ id: "x", label: "empty", direction: "received" as const, at: "" }]
          ).map((t) => (
            <Chip key={t.id}>{t.label}</Chip>
          ))}
        </div>
        <Sub className="mt-2 text-[0.7rem]">
          {unreadReceived.length > 0 ? "queued · not opened" : "all cleared"}
        </Sub>
      </Card>

      <Btn onClick={clearUnread} disabled={unreadReceived.length === 0}>
        clear unread
      </Btn>
      <Sub className="text-center text-[0.72rem]">
        wipe without opening. they get <strong>one</strong> batched signal.
      </Sub>

      <div className="h-px bg-[rgba(196,181,253,0.14)] my-1" />
      <SectionTitle>sender signal copy</SectionTitle>
      <div className="flex flex-col gap-2">
        {[
          { tone: "muted" as const, text: COPY.muted },
          { tone: "warn" as const, text: COPY.clearedUnread },
          { tone: "ok" as const, text: COPY.needSpace },
        ].map((s) => (
          <Card key={s.text} className="py-2.5 px-3">
            <Pill tone={s.tone}>signal</Pill>
            <div
              className={`text-[0.85rem] mt-1.5 italic ${
                s.tone === "warn" ? "text-[#f9a8d4]" : "text-[#9b93a8]"
              }`}
            >
              {s.text}
            </div>
          </Card>
        ))}
      </div>

      {lastSignal === COPY.clearedUnread && (
        <Card soft className="text-center">
          <div className="font-semibold text-[#f3f0f8]">Cleared unread</div>
          <Sub className="m-0 mt-1">batched signal sent once</Sub>
        </Card>
      )}

      <Btn variant="ghost" className="mt-auto" onClick={() => setScreen("home")}>
        back to home
      </Btn>
    </div>
  );
}
