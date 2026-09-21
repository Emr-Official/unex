"use client";

import { useEffect, useState } from "react";
import { useUnex } from "@/lib/store";
import { clearInviteQuery, parseInviteFromLocation } from "@/lib/invite";
import { PhoneShell } from "./PhoneShell";
import { Toast } from "./Toast";
import { PairSync } from "./PairSync";
import { Splash } from "./screens/Splash";
import { Login } from "./screens/Login";
import { Invite } from "./screens/Invite";
import { Waiting } from "./screens/Waiting";
import { Home } from "./screens/Home";
import { TapConfirm } from "./screens/TapConfirm";
import { MuteArchive } from "./screens/MuteArchive";
import { ClearUnread } from "./screens/ClearUnread";
import { Safety } from "./screens/Safety";
import { MyStatus } from "./screens/MyStatus";
import { Ended } from "./screens/Ended";
import { AcceptInvite } from "./screens/AcceptInvite";
import { Premium } from "./screens/Premium";
import { Requests } from "./screens/Requests";
import { Messages } from "./screens/Messages";

export function App() {
  const screen = useUnex((s) => s.screen);
  const [hydrated, setHydrated] = useState(false);
  const [inbound, setInbound] = useState<{
    from: string;
    code: string | null;
  } | null>(null);

  useEffect(() => {
    setHydrated(true);
    const inv = parseInviteFromLocation();
    if (inv) setInbound({ from: inv.from, code: inv.code });
  }, []);

  if (!hydrated) {
    return (
      <PhoneShell>
        <div className="flex-1 flex items-center justify-center">
          <span className="font-bold tracking-tight bg-gradient-to-r from-[#c4b5fd] to-[#f9a8d4] bg-clip-text text-transparent text-[1.5rem]">
            unex
          </span>
        </div>
      </PhoneShell>
    );
  }

  if (inbound) {
    return (
      <PhoneShell>
        <Toast />
        <AcceptInvite
          fromName={inbound.from}
          inviteCode={inbound.code}
          onDone={() => {
            setInbound(null);
            clearInviteQuery();
          }}
        />
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <PairSync />
      <Toast />
      {screen === "splash" && <Splash />}
      {screen === "login" && <Login />}
      {screen === "invite" && <Invite />}
      {screen === "waiting" && <Waiting />}
      {screen === "home" && <Home />}
      {screen === "tapConfirm" && <TapConfirm />}
      {screen === "muteArchive" && <MuteArchive />}
      {screen === "clearUnread" && <ClearUnread />}
      {screen === "safety" && <Safety />}
      {screen === "myStatus" && <MyStatus />}
      {screen === "ended" && <Ended />}
      {screen === "premium" && <Premium />}
      {screen === "requests" && <Requests />}
      {screen === "messages" && <Messages />}
    </PhoneShell>
  );
}
