"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useUnex } from "@/lib/store";
import {
  defaultCardRedirectUrl,
  isPayApiConfigured,
  pollUntilSettled,
  startCard,
  startMomo,
} from "@/lib/payApi";
import { Btn, Card, Eyebrow, Sub } from "../ui";

type PayMode = "idle" | "momo" | "card" | "polling" | "done";

const inputClass =
  "w-full rounded-xl bg-[#14111a] border border-[rgba(196,181,253,0.25)] px-3 py-2.5 text-[0.85rem] text-[#f3f0f8] placeholder:text-[#6b6478] outline-none focus:border-[rgba(196,181,253,0.55)]";

export function Premium() {
  const { isPremium, unlockPremium, goHome, myName, showToast } = useUnex();
  const apiReady = isPayApiConfigured();

  const [mode, setMode] = useState<PayMode>("idle");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Resume after card redirect (?premium=card) — id from query or sessionStorage
  useEffect(() => {
    if (!apiReady || isPremium || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const premium = params.get("premium");
    if (!premium) return;
    let id = params.get("id");
    if (!id || id === "PENDING") {
      id = sessionStorage.getItem("unex_premium_collect_id");
    }
    if (id) void resumePoll(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, isPremium]);

  async function resumePoll(id: string) {
    setMode("polling");
    setBusy(true);
    setError(null);
    setStatusLine("Confirming card payment…");
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      await pollUntilSettled(id, {
        signal: ac.signal,
        onTick: (s) =>
          setStatusLine(`Status: ${s.status || "Pending"}…`),
      });
      unlockPremium();
      setMode("done");
      setStatusLine("Payment successful — Premium unlocked.");
      showToast("Premium unlocked");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment check failed");
      setMode("idle");
    } finally {
      setBusy(false);
    }
  }

  async function onMomo(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!apiReady) return;
    setBusy(true);
    setMode("polling");
    setStatusLine("Sending Mobile Money request…");
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const started = await startMomo({
        phone: phone.trim(),
        name: myName || undefined,
      });
      if (!started.id) throw new Error("No collection id from pay API");
      setStatusLine(
        "Approve the 5,000 UGX prompt on your phone… (waiting)"
      );
      await pollUntilSettled(started.id, {
        signal: ac.signal,
        onTick: (s) =>
          setStatusLine(
            `Phone prompt · status: ${s.status || "Pending"}…`
          ),
      });
      unlockPremium();
      setMode("done");
      setStatusLine("Payment successful — Premium unlocked.");
      showToast("Premium unlocked");
    } catch (err) {
      setError(err instanceof Error ? err.message : "MoMo payment failed");
      setMode("momo");
    } finally {
      setBusy(false);
    }
  }

  async function onCard(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!apiReady) return;
    setBusy(true);
    setStatusLine("Opening secure card page…");
    try {
      const externalId = `unex-card-${Date.now()}`;
      const started = await startCard({
        email: email.trim(),
        name: myName || undefined,
        externalId,
        redirectUrl: defaultCardRedirectUrl(externalId),
      });
      if (!started.cardRedirectUrl) {
        throw new Error("No card redirect URL from pay API");
      }
      // Persist id for return poll
      if (started.id && typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("unex_premium_collect_id", started.id);
      }
      window.location.href = started.cardRedirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Card payment failed");
      setBusy(false);
      setMode("card");
      setStatusLine(null);
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-3">
      <Eyebrow>unex+</Eyebrow>
      <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#f3f0f8]">
        Premium
      </h2>
      <Sub>
        <span className="text-[#f3f0f8] font-semibold">5,000 UGX / month</span>
        {" — "}
        more connections and higher daily taps. Pay with Mobile Money or card
        via ioTec.
      </Sub>

      <Card soft className="flex flex-col gap-2">
        <p className="text-[0.85rem] text-[#f3f0f8] font-semibold">Free</p>
        <ul className="text-[0.78rem] text-[#9b93a8] leading-relaxed list-disc pl-4 space-y-1">
          <li>1 active connection</li>
          <li>Button taps, status &amp; mood</li>
          <li>Mute, archive, live pin signal</li>
        </ul>
      </Card>

      <Card className="flex flex-col gap-2 border-[rgba(249,168,212,0.35)]">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[0.85rem] text-[#f3f0f8] font-semibold">Premium</p>
          <p className="text-[0.72rem] text-[#f9a8d4] font-semibold">
            5,000 UGX/mo
          </p>
        </div>
        <ul className="text-[0.78rem] text-[#9b93a8] leading-relaxed list-disc pl-4 space-y-1">
          <li>Multiple connections</li>
          <li>More taps per day (15)</li>
        </ul>
      </Card>

      {isPremium ? (
        <>
          <Card soft className="text-center">
            <p className="text-[0.85rem] text-[#a7f3d0] font-semibold">
              Premium is on
            </p>
            <Sub className="m-0 mt-1">
              Thanks for supporting unex. Billing renews monthly when live.
            </Sub>
          </Card>
          <Btn onClick={() => goHome()}>back home</Btn>
        </>
      ) : (
        <>
          {apiReady ? (
            <>
              {mode === "idle" || mode === "done" ? (
                <div className="flex flex-col gap-2">
                  <Btn onClick={() => setMode("momo")} disabled={busy}>
                    Pay with MoMo — 5,000 UGX
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() => setMode("card")}
                    disabled={busy}
                  >
                    Pay with card — 5,000 UGX
                  </Btn>
                </div>
              ) : null}

              {mode === "momo" || (mode === "polling" && phone) ? (
                <Card className="flex flex-col gap-2">
                  <p className="text-[0.8rem] text-[#f3f0f8] font-semibold">
                    Mobile Money
                  </p>
                  <Sub className="m-0">
                    Enter your MTN or Airtel number. You&apos;ll get a prompt on
                    your phone — approve <strong>5,000 UGX</strong> for one
                    month of Premium.
                  </Sub>
                  <form onSubmit={onMomo} className="flex flex-col gap-2">
                    <input
                      className={inputClass}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="07XXXXXXXX"
                      value={phone}
                      onChange={(ev) => setPhone(ev.target.value)}
                      disabled={busy}
                      required
                    />
                    <Btn type="submit" disabled={busy || !phone.trim()}>
                      {busy ? "Waiting for phone…" : "Send MoMo prompt"}
                    </Btn>
                    <Btn
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => {
                        abortRef.current?.abort();
                        setMode("idle");
                        setStatusLine(null);
                        setError(null);
                      }}
                    >
                      cancel
                    </Btn>
                  </form>
                </Card>
              ) : null}

              {mode === "card" ? (
                <Card className="flex flex-col gap-2">
                  <p className="text-[0.8rem] text-[#f3f0f8] font-semibold">
                    Card (Visa / Mastercard)
                  </p>
                  <Sub className="m-0">
                    We&apos;ll open ioTec&apos;s hosted card page. After you
                    pay, you&apos;ll return here and Premium unlocks when
                    status is Success.
                  </Sub>
                  <form onSubmit={onCard} className="flex flex-col gap-2">
                    <input
                      className={inputClass}
                      type="email"
                      autoComplete="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      disabled={busy}
                      required
                    />
                    <Btn type="submit" disabled={busy || !email.trim()}>
                      {busy ? "Redirecting…" : "Continue to card page"}
                    </Btn>
                    <Btn
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => {
                        setMode("idle");
                        setError(null);
                        setStatusLine(null);
                      }}
                    >
                      cancel
                    </Btn>
                  </form>
                </Card>
              ) : null}

              {mode === "polling" && !phone ? (
                <Card soft>
                  <Sub className="m-0">{statusLine || "Confirming payment…"}</Sub>
                </Card>
              ) : null}
            </>
          ) : (
            <>
              <Btn onClick={unlockPremium}>Unlock Premium — simulated</Btn>
              <Btn variant="ghost" disabled title="Set NEXT_PUBLIC_PAY_API_URL">
                Pay with MoMo (API not configured)
              </Btn>
              <Btn variant="ghost" disabled title="Set NEXT_PUBLIC_PAY_API_URL">
                Pay with card (API not configured)
              </Btn>
            </>
          )}

          {statusLine && mode !== "idle" ? (
            <p className="text-[0.72rem] text-center text-[#9b93a8]">
              {statusLine}
            </p>
          ) : null}
          {error ? (
            <p className="text-[0.72rem] text-center text-[#fb7185]">{error}</p>
          ) : null}

          <Btn variant="ghost" onClick={() => goHome()} disabled={busy}>
            not now
          </Btn>
          <p className="text-[0.65rem] text-center text-[#6b6478]">
            {apiReady
              ? "Real charge via ioTec · 5,000 UGX for one month."
              : "Demo mode: NEXT_PUBLIC_PAY_API_URL unset — simulated unlock only."}
          </p>
        </>
      )}
    </div>
  );
}
