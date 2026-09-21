import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../../lib/cors";
import { clientKey, rateLimit } from "../../lib/rateLimit";
import { getCollectionStatus, publicCollect } from "../../lib/iotec";
import { isPaid, markPaid } from "../../lib/paidStore";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rl = rateLimit(`status:${clientKey(req)}`, 60, 60_000);
  if (!rl.ok) {
    return res.status(429).json({ error: "Too many requests. Try again shortly." });
  }

  try {
    const id = String(req.query.id || "").trim();
    if (!id || id.length > 80) {
      return res.status(400).json({ error: "Query id (collection id) is required." });
    }

    const { ok, status, result } = await getCollectionStatus(id);
    if (!ok) {
      return res.status(status >= 400 && status < 600 ? status : 502).json({
        error: result.statusMessage || `Status lookup failed (${status})`,
        id,
      });
    }

    if (result.status === "Success" && result.externalId) {
      markPaid(result.externalId, result.id);
    }

    return res.status(200).json({
      ...publicCollect(result),
      paidCached: result.externalId ? isPaid(result.externalId) : false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: msg });
  }
}
