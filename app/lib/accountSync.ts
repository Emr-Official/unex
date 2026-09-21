/** Free account + direct-request store keyed by WhatsApp number (crudcrud). */
import { CRUD_BASE } from "./apiBase";

const BASE = CRUD_BASE;
const USERS = `${BASE}/users`;
const REQUESTS = `${BASE}/requests`;

export type UserRecord = {
  _id?: string;
  /** Normalized WhatsApp / phone digits with country code, e.g. 2567... */
  phone: string;
  displayName: string;
  updatedAt?: string;
};

export type DirectRequest = {
  _id?: string;
  toPhone: string;
  fromPhone: string;
  fromName: string;
  status: "pending" | "accepted" | "declined";
  inviteId?: string;
  updatedAt?: string;
};

/** Keep digits only; strip leading 00 → treat as international. */
export function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  return d;
}

export function formatPhoneDisplay(phone: string): string {
  const p = normalizePhone(phone);
  if (!p) return "";
  return `+${p}`;
}

export async function upsertUser(
  phone: string,
  displayName: string
): Promise<UserRecord> {
  const p = normalizePhone(phone);
  if (p.length < 9) throw new Error("phone required");
  const all = await listUsers();
  const existing = all.find((u) => u.phone === p);
  const body = {
    phone: p,
    displayName: displayName.trim() || p,
    updatedAt: new Date().toISOString(),
  };
  if (existing?._id) {
    const res = await fetch(`${USERS}/${existing._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("user update failed");
    return { ...body, _id: existing._id };
  }
  const res = await fetch(USERS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("user create failed");
  return (await res.json()) as UserRecord;
}

export async function listUsers(): Promise<UserRecord[]> {
  const res = await fetch(USERS, { cache: "no-store" });
  if (!res.ok) return [];
  const all = (await res.json()) as Array<UserRecord & { handle?: string }>;
  // migrate old handle-shaped records if any
  return all
    .map((u) => ({
      _id: u._id,
      phone: u.phone || "",
      displayName: u.displayName,
      updatedAt: u.updatedAt,
    }))
    .filter((u) => !!u.phone);
}

export async function findUserByPhone(
  phone: string
): Promise<UserRecord | null> {
  const p = normalizePhone(phone);
  const all = await listUsers();
  return all.find((u) => u.phone === p) || null;
}

export async function createDirectRequest(input: {
  toPhone: string;
  fromPhone: string;
  fromName: string;
  inviteId: string;
}): Promise<DirectRequest> {
  const toPhone = normalizePhone(input.toPhone);
  const fromPhone = normalizePhone(input.fromPhone);
  if (!toPhone || !fromPhone) throw new Error("phones required");
  if (toPhone === fromPhone) throw new Error("can’t request yourself");

  const body: Omit<DirectRequest, "_id"> = {
    toPhone,
    fromPhone,
    fromName: input.fromName,
    status: "pending",
    inviteId: input.inviteId,
    updatedAt: new Date().toISOString(),
  };
  const res = await fetch(REQUESTS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("request create failed");
  return (await res.json()) as DirectRequest;
}

export async function listInboundRequests(
  myPhone: string
): Promise<DirectRequest[]> {
  const p = normalizePhone(myPhone);
  const res = await fetch(REQUESTS, { cache: "no-store" });
  if (!res.ok) return [];
  const all = (await res.json()) as Array<
    DirectRequest & { toHandle?: string; fromHandle?: string }
  >;
  return all.filter((r) => {
    const to = r.toPhone || "";
    return to === p && r.status === "pending";
  });
}

export async function updateRequestStatus(
  id: string,
  status: "accepted" | "declined",
  current: DirectRequest
): Promise<void> {
  const { _id: _drop, ...rest } = current;
  const res = await fetch(`${REQUESTS}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...rest,
      status,
      updatedAt: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error("request update failed");
}
