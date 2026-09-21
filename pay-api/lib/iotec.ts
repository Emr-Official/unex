const TOKEN_URL = "https://id.iotec.io/connect/token";
const PAY_BASE = "https://pay.iotec.io";

const PREMIUM_AMOUNT = 5000;
const PAYER_NOTE = "unex Premium 1 month";

type TokenCache = { accessToken: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export function getWalletId(): string {
  return requireEnv("IOTEC_WALLET_ID");
}

/** Prefer UGX; set IOTEC_CURRENCY=ITX if wallet rejects UGX. */
export function getCurrency(): "UGX" | "ITX" | "USD" {
  const c = (process.env.IOTEC_CURRENCY || "UGX").toUpperCase();
  if (c === "ITX" || c === "USD" || c === "UGX") return c;
  return "UGX";
}

export function premiumAmount(): number {
  return PREMIUM_AMOUNT;
}

export function payerNote(): string {
  return PAYER_NOTE;
}

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 15_000) {
    return tokenCache.accessToken;
  }
  const clientId = requireEnv("IOTEC_CLIENT_ID");
  const clientSecret = requireEnv("IOTEC_CLIENT_SECRET");
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    const msg = data.error_description || data.error || `token HTTP ${res.status}`;
    throw new Error(`ioTec auth failed: ${msg}`);
  }
  const expiresIn = Number(data.expires_in || 300);
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + expiresIn * 1000,
  };
  return data.access_token;
}

async function iotecFetch(path: string, init: RequestInit = {}): Promise<{
  ok: boolean;
  status: number;
  data: Record<string, unknown>;
}> {
  const token = await getAccessToken();
  const res = await fetch(`${PAY_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, data };
}

export type CollectResult = {
  id?: string;
  status?: string;
  externalId?: string;
  cardRedirectUrl?: string | null;
  amount?: number;
  currency?: string;
  statusMessage?: string | null;
  raw: Record<string, unknown>;
};

function mapCollect(data: Record<string, unknown>): CollectResult {
  return {
    id: data.id as string | undefined,
    status: data.status as string | undefined,
    externalId: data.externalId as string | undefined,
    cardRedirectUrl: (data.cardRedirectUrl as string | null | undefined) ?? null,
    amount: data.amount as number | undefined,
    currency: data.currency as string | undefined,
    statusMessage: (data.statusMessage as string | null | undefined) ?? null,
    raw: data,
  };
}

export async function collectMobileMoney(opts: {
  payer: string;
  payerName?: string;
  externalId: string;
}): Promise<{ ok: boolean; status: number; result: CollectResult }> {
  const payload = {
    category: "MobileMoney",
    currency: getCurrency(),
    walletId: getWalletId(),
    externalId: opts.externalId,
    payer: opts.payer,
    payerName: opts.payerName || undefined,
    payerNote: PAYER_NOTE,
    amount: PREMIUM_AMOUNT,
  };
  const { ok, status, data } = await iotecFetch("/api/collections/collect", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { ok, status, result: mapCollect(data) };
}

export async function collectCard(opts: {
  email: string;
  payerName?: string;
  externalId: string;
  redirectUrl?: string;
}): Promise<{ ok: boolean; status: number; result: CollectResult }> {
  const payload: Record<string, unknown> = {
    category: "Card",
    currency: getCurrency(),
    walletId: getWalletId(),
    externalId: opts.externalId,
    payer: opts.email,
    payerName: opts.payerName || undefined,
    payerNote: PAYER_NOTE,
    amount: PREMIUM_AMOUNT,
  };
  if (opts.redirectUrl) payload.redirectUrl = opts.redirectUrl;
  const { ok, status, data } = await iotecFetch("/api/collections/collect/card", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { ok, status, result: mapCollect(data) };
}

export async function getCollectionStatus(id: string): Promise<{
  ok: boolean;
  status: number;
  result: CollectResult;
}> {
  const { ok, status, data } = await iotecFetch(
    `/api/collections/status/${encodeURIComponent(id)}`,
    { method: "GET" }
  );
  return { ok, status, result: mapCollect(data) };
}

/** Public-safe subset for API responses (never secrets). */
export function publicCollect(result: CollectResult) {
  return {
    id: result.id,
    status: result.status,
    externalId: result.externalId,
    cardRedirectUrl: result.cardRedirectUrl,
    amount: result.amount,
    currency: result.currency,
    statusMessage: result.statusMessage,
  };
}
