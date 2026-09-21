import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../../lib/cors";
import { clientKey, rateLimit } from "../../lib/rateLimit";
import { isValidEmail, safeExternalId } from "../../lib/validate";
import { collectCard, publicCollect } from "../../lib/iotec";

const DEFAULT_REDIRECT =
  "https://emr-official.github.io/unex/?premium=card&paid=1";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rl = rateLimit(`card:${clientKey(req)}`, 20, 60_000);
  if (!rl.ok) {
    return res.status(429).json({ error: "Too many requests. Try again shortly." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Valid email is required for card pay." });
    }
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 150) : undefined;
    const externalId = safeExternalId(body.externalId);
    let redirectUrl =
      typeof body.redirectUrl === "string" ? body.redirectUrl.trim() : "";
    if (redirectUrl && !/^https:\/\//i.test(redirectUrl)) {
      return res.status(400).json({ error: "redirectUrl must be https." });
    }
    if (!redirectUrl) {
      redirectUrl = `${DEFAULT_REDIRECT}&id=PENDING&externalId=${encodeURIComponent(externalId)}`;
    }

    const { ok, status, result } = await collectCard({
      email,
      payerName: name,
      externalId,
      redirectUrl,
    });

    if (!ok) {
      const msg =
        (result.raw as { detail?: string; message?: string; title?: string })
          ?.detail ||
        (result.raw as { message?: string })?.message ||
        (result.raw as { title?: string })?.title ||
        result.statusMessage ||
        `ioTec card collect failed (${status})`;
      const hint =
        String(msg).toLowerCase().includes("currency") || status === 400
          ? " If currency is rejected, set IOTEC_CURRENCY=ITX on the server."
          : "";
      return res.status(status >= 400 && status < 600 ? status : 502).json({
        error: String(msg) + hint,
        externalId,
      });
    }

    const cardRedirectUrl = result.cardRedirectUrl;
    if (!cardRedirectUrl) {
      return res.status(502).json({
        error: "ioTec did not return cardRedirectUrl.",
        ...publicCollect(result),
        externalId: result.externalId || externalId,
      });
    }

    return res.status(200).json({
      ...publicCollect(result),
      cardRedirectUrl,
      externalId: result.externalId || externalId,
      message: "Redirect to the hosted card page to complete payment.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    const safe = msg.replace(/client_secret=\S+/gi, "client_secret=***");
    return res.status(500).json({ error: safe });
  }
}
