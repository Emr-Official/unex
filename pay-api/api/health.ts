import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../lib/cors";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  return res.status(200).json({
    ok: true,
    service: "unex-pay-api",
    premiumAmount: 5000,
    currency: process.env.IOTEC_CURRENCY || "UGX",
  });
}
