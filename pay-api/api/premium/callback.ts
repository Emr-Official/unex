import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../../lib/cors";
import { markPaid } from "../../lib/paidStore";

/**
 * ioTec webhook. Configure this URL in the ioTec Pay portal (Collections callback).
 * Always acknowledge 200. Status poll remains the primary unlock path.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const status = body.status;
    const externalId = body.externalId;
    const id = body.id;
    if (status === "Success" && externalId) {
      markPaid(String(externalId), id ? String(id) : undefined);
    }
  } catch {
    // acknowledge anyway
  }

  return res.status(200).json({ received: true });
}
