/** Lightweight in-memory rate limit (per instance; fine for soft abuse control). */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000
): { ok: boolean; remaining: number } {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;
  const remaining = Math.max(0, limit - b.count);
  return { ok: b.count <= limit, remaining };
}

export function clientKey(req: { headers: Record<string, unknown>; socket?: { remoteAddress?: string } }): string {
  const xf = req.headers["x-forwarded-for"];
  const forwarded = Array.isArray(xf) ? xf[0] : String(xf || "");
  const ip =
    (forwarded.split(",")[0] || "").trim() ||
    String(req.headers["x-real-ip"] || "") ||
    req.socket?.remoteAddress ||
    "unknown";
  return ip;
}
