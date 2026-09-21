/**
 * Client for unex Premium pay-api (Vercel + ioTec).
 * Base URL from NEXT_PUBLIC_PAY_API_URL — if unset, UI keeps simulated unlock.
 */

export const PAY_API_URL = (
  process.env.NEXT_PUBLIC_PAY_API_URL || ""
).replace(/\/$/, "");

export function isPayApiConfigured(): boolean {
  return Boolean(PAY_API_URL);
}

export type CollectResponse = {
  id?: string;
  status?: string;
  externalId?: string;
  cardRedirectUrl?: string | null;
  amount?: number;
  currency?: string;
  statusMessage?: string | null;
  message?: string;
  error?: string;
  paidCached?: boolean;
};

async function payFetch(
  path: string,
  init?: RequestInit
): Promise<CollectResponse> {
  if (!PAY_API_URL) {
    throw new Error("Pay API not configured");
  }
  const res = await fetch(`${PAY_API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as CollectResponse;
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export function startMomo(body: {
  phone: string;
  name?: string;
  externalId?: string;
}): Promise<CollectResponse> {
  return payFetch("/api/premium/momo", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function startCard(body: {
  email: string;
  name?: string;
  externalId?: string;
  redirectUrl?: string;
}): Promise<CollectResponse> {
  return payFetch("/api/premium/card", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getStatus(id: string): Promise<CollectResponse> {
  return payFetch(`/api/premium/status?id=${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

/** Poll until Success / Failed / timeout. */
export async function pollUntilSettled(
  id: string,
  opts?: {
    intervalMs?: number;
    maxMs?: number;
    onTick?: (s: CollectResponse) => void;
    signal?: AbortSignal;
  }
): Promise<CollectResponse> {
  const intervalMs = opts?.intervalMs ?? 2500;
  const maxMs = opts?.maxMs ?? 180_000;
  const started = Date.now();
  let last: CollectResponse = { id };

  while (Date.now() - started < maxMs) {
    if (opts?.signal?.aborted) throw new Error("Cancelled");
    last = await getStatus(id);
    opts?.onTick?.(last);
    const st = (last.status || "").toLowerCase();
    if (st === "success") return last;
    if (st === "failed" || st === "rejected" || st === "cancelled") {
      throw new Error(last.statusMessage || `Payment ${last.status}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Timed out waiting for payment. You can try again.");
}

/** Default return URL after hosted card pay (GitHub Pages Premium). */
export function defaultCardRedirectUrl(externalId?: string): string {
  if (typeof window === "undefined") {
    return "https://emr-official.github.io/unex/?premium=1";
  }
  const u = new URL(window.location.href);
  u.searchParams.set("premium", "card");
  if (externalId) u.searchParams.set("externalId", externalId);
  return u.toString();
}
