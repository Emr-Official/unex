"use client";

import { useUnex } from "@/lib/store";
import { Btn, Card, Eyebrow, Sub } from "../ui";

export function Premium() {
  const { isPremium, unlockPremium, setScreen } = useUnex();

  return (
    <div className="flex flex-col flex-1 gap-3">
      <Eyebrow>unex+</Eyebrow>
      <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
        Premium
      </h2>
      <Sub>
        Free keeps one soft-reopen connection. Premium unlocks more pairs and
        room to grow.
      </Sub>

      <Card soft className="flex flex-col gap-2">
        <p className="text-[0.85rem] text-[#f3f0f8] font-semibold">Free</p>
        <ul className="text-[0.78rem] text-[#9b93a8] leading-relaxed list-disc pl-4 space-y-1">
          <li>1 active connection</li>
          <li>Button taps, status &amp; mood</li>
          <li>Mute, archive, live pin</li>
        </ul>
      </Card>

      <Card className="flex flex-col gap-2 border-[rgba(249,168,212,0.35)]">
        <p className="text-[0.85rem] text-[#f3f0f8] font-semibold">Premium</p>
        <ul className="text-[0.78rem] text-[#9b93a8] leading-relaxed list-disc pl-4 space-y-1">
          <li>Multiple connections</li>
          <li>More taps per day</li>
          <li>Extra themes &amp; ping types</li>
        </ul>
      </Card>

      {isPremium ? (
        <>
          <Card soft className="text-center">
            <p className="text-[0.85rem] text-[#a7f3d0] font-semibold">
              Premium is on (simulated)
            </p>
            <Sub className="m-0 mt-1">Real billing comes later.</Sub>
          </Card>
          <Btn onClick={() => setScreen("home")}>back home</Btn>
        </>
      ) : (
        <>
          <Btn onClick={unlockPremium}>Unlock Premium — simulated</Btn>
          <Btn variant="ghost" onClick={() => setScreen("home")}>
            not now
          </Btn>
          <p className="text-[0.65rem] text-center text-[#6b6478]">
            No real charge. This is a payment simulation for the MVP.
          </p>
        </>
      )}
    </div>
  );
}
