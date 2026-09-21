import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../../lib/cors";
import { clientKey, rateLimit } from "../../lib/rateLimit";
import { normalizePhone, safeExternalId } from "../../lib/validate";
import {
  collectMobileMoney,
  publicCollect,
} from "../../lib/iotec";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rl = rateLimit(`momo:${clientKey(req)}`, 20, 60_000);
  if (!rl.ok) {
    return res.status(429).json({ error: "Too many requests. Try again shortly." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const phone = normalizePhone(body.phone || "");
    if (!phone) {
      return res.status(400).json({
        error: "Invalid phone. Use digits like 07XXXXXXXX or 2567XXXXXXXX.",
      });
    }
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 150) : undefined;
    const externalId = safeExternalId(body.externalId);

    const { ok, status, result } = await collectMobileMoney({
      payer: phone,
      payerName: name,
      externalId,
    });

    if (!ok) {
      const msg =
        (result.raw as { title?: string; detail?: string; message?: string })
          ?.detail ||
        (result.raw as { message?: string })?.message ||
        (result.raw as { title?: string })?.title ||
        result.statusMessage ||
        `ioTec collect failed (${status})`;
      // Hint if currency rejected
      const hint =
        String(msg).toLowerCase().includes("currency") || status === 400
          ? " If currency is rejected, set IOTEC_CURRENCY=ITX on the server."
          : "";
      return res.status(status >= 400 && status < 600 ? status : 502).json({
        error: String(msg) + hint,
        externalId,
      });
    }

    return res.status(200).json({
      ...publicCollect(result),
      externalId: result.externalId || externalId,
      message:
        "Check your phone for the Mobile Money prompt, then approve the 5,000 UGX payment.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    // Never leak secrets
    const safe = msg.replace(/client_secret=\S+/gi, "client_secret=***");
    return res.status(500).json({ error: safe });
  }
}
