import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED = new Set([
  "https://emr-official.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = String(req.headers.origin || "");
  if (origin && ALLOWED.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (!origin) {
    // non-browser / curl
    res.setHeader("Access-Control-Allow-Origin", "https://emr-official.github.io");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}
