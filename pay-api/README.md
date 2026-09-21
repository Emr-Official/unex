# unex Premium pay-api (ioTec · Vercel)

Serverless API that charges **5,000 UGX / month** for unex Premium via ioTec:

| Method | Endpoint | ioTec |
|--------|----------|-------|
| Mobile Money | `POST /api/premium/momo` | `POST https://pay.iotec.io/api/collections/collect` |
| Card | `POST /api/premium/card` | `POST https://pay.iotec.io/api/collections/collect/card` |
| Status | `GET /api/premium/status?id=` | `GET /api/collections/status/{id}` |
| Webhook | `POST /api/premium/callback` | ioTec Collections callback |
| Health | `GET /api/health` | — |

Frontend (GitHub Pages): `https://emr-official.github.io/unex/`  
CORS allows that origin plus localhost.

## Env vars (server only — never commit / never put in the client)

| Name | Required | Notes |
|------|----------|-------|
| `IOTEC_CLIENT_ID` | yes | OAuth client credentials |
| `IOTEC_CLIENT_SECRET` | yes | Never returned to clients |
| `IOTEC_WALLET_ID` | yes | Wallet UUID |
| `IOTEC_CURRENCY` | no | Default `UGX`. If collect rejects currency, set `ITX`. |

OAuth: `POST https://id.iotec.io/connect/token` (`grant_type=client_credentials`) → Bearer token for Pay API.

## Local

```bash
cp .env.example .env   # fill IOTEC_*
npm i
npx vercel dev
```

## Deploy

See [DEPLOY.md](./DEPLOY.md). Needs a Vercel account + `VERCEL_TOKEN` (or interactive `vercel` login).

After deploy, set frontend:

```bash
NEXT_PUBLIC_PAY_API_URL=https://YOUR-PROJECT.vercel.app
```

## Currency note

Swagger lists `UGX`, `ITX`, and `USD`. This API defaults to **UGX** (product price is 5,000 UGX). Some wallets/sandbox modes expect **ITX** — if ioTec returns a currency error, set `IOTEC_CURRENCY=ITX` and redeploy.

## Security

- CORS allowlist (GitHub Pages + localhost)
- Soft in-memory rate limits
- Phone / email validation
- Secrets only on the server; responses never include `client_secret`
