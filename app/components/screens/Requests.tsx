"use client";

import { useEffect, useState } from "react";
import { Btn, Card, Eyebrow, Pill, Sub } from "../ui";
import { useUnex } from "@/lib/store";
import {
  DirectRequest,
  formatPhoneDisplay,
  listInboundRequests,
  updateRequestStatus,
} from "@/lib/accountSync";
import { markInviteAccepted } from "@/lib/inviteSync";

export function Requests() {
  const {
    myPhone,
    myName,
    setScreen,
    acceptInvite,
    showToast,
    pairState,
    isPremium,
  } = useUnex();
  const [items, setItems] = useState<DirectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!myPhone) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await listInboundRequests(myPhone);
      setItems(list);
    } catch {
      showToast("couldn’t load requests");
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 4000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myPhone]);

  const accept = async (req: DirectRequest) => {
    if (!req._id) return;
    if (pairState === "paired" && !isPremium) {
      showToast("free plan: one connection — see Premium");
      setScreen("premium");
      return;
    }
    setBusyId(req._id);
    try {
      if (req.inviteId) {
        await markInviteAccepted(req.inviteId, myName || myPhone);
      }
      await updateRequestStatus(req._id, "accepted", req);
      await acceptInvite(req.fromName || formatPhoneDisplay(req.fromPhone), req.inviteId || null);
      showToast("connected with " + formatPhoneDisplay(req.fromPhone));
    } catch {
      showToast("accept failed — try again");
    }
    setBusyId(null);
    void load();
  };

  const decline = async (req: DirectRequest) => {
    if (!req._id) return;
    setBusyId(req._id);
    try {
      await updateRequestStatus(req._id, "declined", req);
      showToast("declined " + formatPhoneDisplay(req.fromPhone));
    } catch {
      showToast("couldn’t decline");
    }
    setBusyId(null);
    void load();
  };

  return (
    <div className="flex flex-col flex-1 gap-3">
      <Eyebrow>inbox</Eyebrow>
      <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
        Direct requests
      </h2>
      <Sub>
        Requests to your WhatsApp number on unex. Accept or Decline stays in
        your hands — nothing is sent on WhatsApp itself.
      </Sub>

      {loading && <Pill tone="muted">loading…</Pill>}

      {!loading && items.length === 0 && (
        <Card soft className="text-center">
          <Sub className="m-0">No pending requests.</Sub>
        </Card>
      )}

      {items.map((req) => (
        <Card key={req._id} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-[0.9rem] text-[#f3f0f8]">
                {req.fromName}
              </p>
              <p className="text-[0.72rem] text-[#9b93a8]">
                {formatPhoneDisplay(req.fromPhone)}
              </p>
            </div>
            <Pill>pending</Pill>
          </div>
          <div className="flex gap-2">
            <Btn
              className="flex-1"
              disabled={busyId === req._id}
              onClick={() => void accept(req)}
            >
              accept
            </Btn>
            <Btn
              variant="ghost"
              className="flex-1"
              disabled={busyId === req._id}
              onClick={() => void decline(req)}
            >
              decline
            </Btn>
          </div>
        </Card>
      ))}

      <Btn variant="subtle" className="mt-auto" onClick={() => setScreen("invite")}>
        back to invite
      </Btn>
    </div>
  );
}
