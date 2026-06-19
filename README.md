# Watchly

> A secure, multi-tenant website change monitoring platform — get notified the instant a webpage changes.

Watchly scrapes public web pages, hashes their content with SHA-256, and emails you the moment something changes. No passwords, no sessions — a hashed, token-based identity system, a fully isolated multi-tenant data layer, and hardened against the abuse vectors a real launch would actually face (SSRF, spam, oversized payloads).

---

## What it does

- **Add any public URL** — job boards, exam results, government notices, news pages, product listings
- **Detects content changes** via SHA-256 hashing of scraped page text
- **Sends branded email alerts** with a live content snapshot of what changed
- **Tracks history** — last 10 changes per site with timestamps and snapshots
- **No login required** — secure token-based accounts, importable across devices
- **Background automation** — node-cron checks sites every 1 / 6 / 12 / 24 hours
- **Per-account isolation** — every user only ever sees their own monitors
- **Custom labels** — name your monitors instead of seeing raw URLs
- **Self-service account deletion** — full data removal on demand

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Scraping | Axios, Cheerio — rotating user agents, retry with backoff, SSRF-guarded |
| Hashing | Node.js crypto (SHA-256) |
| Scheduling | node-cron |
| Email | Nodemailer (SMTP, branded HTML templates) |
| Security | express-rate-limit, validator, hashed tokens, scoped CORS, SSRF protection |

---

## Production-Grade Engineering Decisions

Every choice below was made to survive real users, real traffic, and real abuse attempts — not just to pass a demo.

### Security

- **Tokens are never stored in plaintext.** SHA-256 hashed before touching the database. A full DB leak exposes nothing usable.
- **Auth lives in headers, not URLs.** `Authorization: Bearer username:token` — never logged in access logs, browser history, or referrer headers.
- **SSRF protection on every scrape.** Before fetching any URL, the resolved IP is checked against private/internal/link-local ranges (`10.x`, `172.16-31.x`, `192.168.x`, `127.x`, `169.254.x`, IPv6 loopback/ULA). Blocks attempts to use Watchly to probe internal infrastructure or cloud metadata endpoints — including DNS-rebinding attacks, since the check resolves the hostname at request time.
- **Per-recipient email rate limiting.** Any single email address can receive at most 10 Watchly notifications per 24 hours, regardless of how many monitors target it — closes off using Watchly as a spam vector against a stranger's inbox.
- **Response size capped at 5MB** during scraping — prevents memory exhaustion from a malicious or misconfigured target URL.
- **Rate limiting at two tiers** — 100 req/15min globally, 10 req/hour on account creation to stop bulk-account abuse.
- **Server-side validation on every input** — URLs, emails, and usernames validated with the `validator` library, never trusted from the client alone.
- **Scoped CORS** — only the configured `CLIENT_URL` origin is allowed; wildcard CORS was deliberately removed.
- **Payload size capped at 50kb** — blocks malformed/oversized request-body attacks.
- **No stack traces ever reach the client** — a global Express error handler returns generic messages; real errors only go to server logs.
- **Clean 404 handling** — unknown routes return structured JSON, not Express's default HTML error page.

### Reliability

- **Per-account monitor limit (20)** — prevents one account from exhausting scraping resources for everyone else.
- **Duplicate URL prevention** — can't accidentally monitor the same page twice.
- **Scraper retries 3x with backoff** before marking a site unreachable — handles transient network blips instead of false-flagging a working site.
- **Three-state status model** (`active` / `changed` / `unreachable`) instead of binary — accurately reflects real-world scraping outcomes (logins, bot blocks, downtime) rather than hiding them.
- **Auto session recovery** — if a token becomes invalid, the frontend detects the 401, clears the bad session, and prompts re-import — no white screen, no manual intervention.

### UX Engineering

- **React Error Boundary** — a crash anywhere in the component tree shows a recovery screen, not a blank page.
- **Skeleton loading states** — shimmer placeholders matching the final layout, avoiding content jump.
- **Forced credential acknowledgment** — account creation disables "Continue" until the user explicitly confirms they've saved their token (same pattern as password managers and crypto wallets).
- **Fully responsive** — table columns progressively hide across breakpoints instead of breaking layout.
- **Self-service account deletion** with type-to-confirm — irreversible actions require explicit intent, not a single misclick.

---

## Architecture

```
React Frontend (token sent via Authorization header)
        ↓
Express REST API
        ↓
Middleware:  Rate Limiter → Scoped CORS → Auth (hashed token check)
        ↓
Controllers  →  Service Layer
  ├── Scraper    → Axios + Cheerio, SSRF-guarded, rotating UAs, 3x retry
  ├── Hasher     → SHA-256 via Node.js crypto
  ├── Differ     → Hash comparison
  └── Mailer     → Nodemailer, per-recipient rate-limited, branded HTML
        ↓
MongoDB (Atlas) — every query scoped by accountUsername
        ↓
node-cron Scheduler (hourly tick, per-site interval awareness)
```

---

## Change Detection Flow

```
User submits URL
  → validate URL/email format
  → check account monitor limit (max 20)
  → check for duplicate URL
        ↓
Resolve hostname → reject private/internal IPs (SSRF guard)
        ↓
Scrape HTML → extract visible text → SHA-256 hash → store as baseline
        ↓
node-cron runs every hour, filters sites whose interval has elapsed
        ↓
Re-scrape → new hash → compare to stored baseline
        ↓
Changed?     → status: "changed"     → save snapshot → check email rate limit → send alert → update history
Unchanged?   → status: "active"      → continue monitoring
Unreachable? → status: "unreachable" → retry on next scheduled cycle
```

---

## Account System

No passwords. No sessions. No JWT — intentional, not a shortcut.

- Create an account → receive a `username` + a 64-character cryptographically random `token`
- Token is shown **exactly once**, then SHA-256 hashed before it ever reaches the database
- "Continue" is disabled until the user confirms they saved it
- Import an existing account on any device with `username` + `token`
- Rename anytime — all monitors automatically reassigned server-side
- Delete permanently — type-to-confirm, wipes account + every monitor irreversibly

---

## Folder Structure

```
watchly/
├── server/
│   ├── config/db.js
│   ├── models/
│   │   ├── Site.js
│   │   ├── Account.js
│   │   └── EmailLog.js
│   ├── controllers/
│   │   ├── siteController.js
│   │   └── accountController.js
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── siteRoutes.js
│   │   └── accountRoutes.js
│   ├── services/
│   │   ├── scraper.js
│   │   ├── hashService.js
│   │   ├── diffChecker.js
│   │   └── mailService.js
│   ├── jobs/monitorJob.js
│   ├── app.js
│   └── server.js
└── client/
    └── src/
        ├── components/
        ├── hooks/useSites.js
        ├── services/api.js
        └── pages/Home.jsx
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/accounts/create` | — | Create account (username optional) |
| `POST` | `/api/accounts/import` | — | Import account with username + token |
| `PATCH` | `/api/accounts/rename` | Header | Rename account, reassigns all monitors |
| `DELETE` | `/api/accounts/delete` | Header | Permanently delete account + all monitors |
| `GET` | `/api/sites` | Header | Get all monitors for the authenticated account |
| `POST` | `/api/sites` | Header | Add a new monitor (validated, limit-checked, SSRF-guarded) |
| `DELETE` | `/api/sites/:id` | Header | Delete a monitor |
| `POST` | `/api/sites/check-now/:id` | Header | Trigger an instant manual check |

**Auth header format:** `Authorization: Bearer <username>:<token>`

---

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/watchly.git
cd watchly

# Server
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, CLIENT_URL, SMTP credentials

# Client
cd ../client
npm install
```

Run both:

```bash
cd server && npm run dev    # http://localhost:5000
cd client && npm run dev    # http://localhost:5173
```

### Environment variables (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/watchly
CLIENT_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_16_char_app_password
```

---

## Known Limitations (Honest Disclosure)

- Scraping cannot access pages requiring login or heavy client-side JavaScript rendering — no headless browser by design, keeps the project lightweight and fast.
- SMTP via Gmail is suitable for demo/portfolio scale; real production volume would swap in a transactional email provider (Resend, SendGrid, Postmark) for deliverability.
- No HTTPS/custom domain until deployed — identical behavior once deployed behind Render/Vercel, which provision TLS automatically.

---

## License

MIT — free to use, fork, and learn from.
