# Shoreline Dental Chat

AI chat assistant API for [Shoreline Dental Chicago](https://shorelinedentalchicago.com). Replaces the vendor chatbot with an in-house solution at ~$10-15/mo.

## Stack

- **Runtime:** Next.js 16 on Vercel
- **LLM:** Claude Haiku 4.5 via OpenRouter
- **Rate Limiting:** Upstash Redis (sliding window, 20 req/60s per IP)
- **Lead Storage:** Upstash Redis
- **Email Notifications:** Resend

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Streaming SSE chat (public, CORS-protected) |
| GET | `/api/leads` | Retrieve captured leads (Bearer token auth) |

See [API.md](API.md) for full integration documentation.

## Setup

```bash
cp .env.example .env.local
# Fill in your keys (see .env.example for descriptions)
npm install
npm run dev
```

Open http://localhost:3000 for the test chat UI.

## Deploy

```bash
# Set env vars in Vercel dashboard, then:
vercel deploy
```

Required env vars: `OPENROUTER_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`, `LEAD_NOTIFICATION_EMAIL`, `LEADS_API_KEY`
