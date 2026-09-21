# Deploy unex pay-api to Vercel

`VERCEL_TOKEN` was **not** present in box secrets when this was scaffolded. Follow these steps on a machine with Vercel access (or add `VERCEL_TOKEN` / `card.VERCEL_TOKEN` and re-run deploy).

## 1. Install CLI

```bash
npm i -g vercel
cd /workspace/unex/pay-api
npm i
```

## 2. Link / deploy

Interactive:

```bash
vercel login
vercel link          # create project e.g. unex-pay-api
```

Or with a token (CI / agent):

```bash
export VERCEL_TOKEN=...   # do not print it
vercel link --yes --token "$VERCEL_TOKEN"
vercel --prod --yes --token "$VERCEL_TOKEN"
```

## 3. Set env vars (Production + Preview)

Pull values from box secrets `card.IOTEC_CLIENT_ID`, `card.IOTEC_CLIENT_SECRET`, `card.IOTEC_WALLET_ID` — **do not echo them**.

```bash
# Prefer vercel env add (prompts for value, or pipe without logging):
printf '%s' "$IOTEC_CLIENT_ID"     | vercel env add IOTEC_CLIENT_ID production --token "$VERCEL_TOKEN"
printf '%s' "$IOTEC_CLIENT_SECRET" | vercel env add IOTEC_CLIENT_SECRET production --token "$VERCEL_TOKEN"
printf '%s' "$IOTEC_WALLET_ID"     | vercel env add IOTEC_WALLET_ID production --token "$VERCEL_TOKEN"
printf '%s' "UGX"                  | vercel env add IOTEC_CURRENCY production --token "$VERCEL_TOKEN"

# Repeat for preview if desired, then redeploy:
vercel --prod --yes --token "$VERCEL_TOKEN"
```

One-shot deploy with env (still avoid printing):

```bash
vercel --prod --yes --token "$VERCEL_TOKEN" \
  --env IOTEC_CLIENT_ID="$IOTEC_CLIENT_ID" \
  --env IOTEC_CLIENT_SECRET="$IOTEC_CLIENT_SECRET" \
  --env IOTEC_WALLET_ID="$IOTEC_WALLET_ID" \
  --env IOTEC_CURRENCY=UGX
```

## 4. Note the API URL

Example: `https://unex-pay-api.vercel.app`

Smoke test:

```bash
curl -sS https://YOUR-PROJECT.vercel.app/api/health
```

## 5. Wire frontend + GitHub Pages

```bash
cd /workspace/unex/app
export NEXT_PUBLIC_PAY_API_URL=https://YOUR-PROJECT.vercel.app
export NEXT_PUBLIC_BASE_PATH=/unex
npm run build
# force-push out/ to gh-pages (do not touch backup branches)
```

Set the same `NEXT_PUBLIC_PAY_API_URL` in any future static builds.

## 6. ioTec portal callback (optional)

In [pay.iotec.io](https://pay.iotec.io) → wallet → Settings → Callback URLs:

- Category: **Collection**
- URL: `https://YOUR-PROJECT.vercel.app/api/premium/callback`

Status polling from the app is the primary unlock path; webhook is best-effort (Vercel memory is ephemeral).

## 7. Test

**MoMo**

```bash
curl -sS -X POST https://YOUR-PROJECT.vercel.app/api/premium/momo \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://emr-official.github.io' \
  -d '{"phone":"0111777771","name":"Test"}'
# Approve prompt on phone (sandbox numbers: 011177777x = Success)
# Then: GET /api/premium/status?id=<id>
```

**Card**

```bash
curl -sS -X POST https://YOUR-PROJECT.vercel.app/api/premium/card \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://emr-official.github.io' \
  -d '{"email":"you@example.com","name":"Test"}'
# Open cardRedirectUrl in a browser, pay, return to unex Premium page; poll status.
```

## Blocker checklist

- [ ] `VERCEL_TOKEN` or `vercel login`
- [ ] `IOTEC_*` env on the Vercel project
- [ ] Frontend rebuild with `NEXT_PUBLIC_PAY_API_URL`
- [ ] If UGX rejected → `IOTEC_CURRENCY=ITX`
