"use client";

import { BrandMark, Btn, Chip, Signal, Sub } from "../ui";
import { useUnex } from "@/lib/store";
import { ensureNotifyPermission } from "@/lib/notify";

export function Splash() {
  const setScreen = useUnex((s) => s.setScreen);

  const go = async () => {
    await ensureNotifyPermission();
    setScreen("login");
  };

  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-2">
        <BrandMark size="lg" />
        <Sub className="max-w-[220px]">
          soft reopen for two people after a mess — buttons only.
        </Sub>
        <div className="flex flex-wrap gap-1.5 justify-center mt-1">
          <Chip pink>both say yes</Chip>
          <Chip>no free typing</Chip>
          <Chip>live pings</Chip>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Btn onClick={go}>continue with phone</Btn>
        <Btn variant="ghost" onClick={go}>
          i have an invite
        </Btn>
        <Signal>taps pop up in real time when you allow alerts</Signal>
      </div>
    </div>
  );
}
