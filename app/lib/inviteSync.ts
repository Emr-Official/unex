/** Free invite handshake store (crudcrud). Swap for Supabase later. */
import { CRUD_BASE } from "./apiBase";

const API = `${CRUD_BASE}/invites`;

export type InviteStatus = "pending" | "accepted" | "declined";

export type InviteRecord = {
  _id?: string;
  status: InviteStatus;
  from: string;
  as: string;
  acceptedBy?: string;
  updatedAt?: string;
};

export async function createInviteRecord(input: {
  from: string;
  as: string;
}): Promise<string> {
  const body: InviteRecord = {
    status: "pending",
    from: input.from,
    as: input.as,
    updatedAt: new Date().toISOString(),
  };
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`invite create failed (${res.status})`);
  const data = (await res.json()) as InviteRecord;
  if (!data._id) throw new Error("invite create missing id");
  return data._id;
}

export async function getInviteRecord(
  id: string
): Promise<InviteRecord | null> {
  const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`invite get failed (${res.status})`);
  return (await res.json()) as InviteRecord;
}

async function putInvite(id: string, record: InviteRecord): Promise<void> {
  const { _id: _drop, ...rest } = record;
  const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...rest,
      updatedAt: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`invite update failed (${res.status})`);
}

export async function markInviteAccepted(
  id: string,
  acceptedBy: string
): Promise<void> {
  const current = await getInviteRecord(id);
  if (!current) throw new Error("invite not found");
  await putInvite(id, {
    ...current,
    status: "accepted",
    acceptedBy: acceptedBy || current.as || "them",
  });
}

export async function markInviteDeclined(id: string): Promise<void> {
  const current = await getInviteRecord(id);
  if (!current) return;
  await putInvite(id, { ...current, status: "declined" });
}
