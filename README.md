# Watchly

Watchly is a website change monitoring tool. Give it a public URL and it periodically scrapes the page, hashes the visible text content, and emails you when something changes.

## Features

- Passwordless, token-based authentication — no stored passwords
- SSRF-protected scraping — validates resolved IPs against private/internal ranges before every request
- Per-account monitor limits and per-recipient email rate limiting to prevent abuse
- Three-state monitor status: `active`, `changed`, `unreachable`
- Change history — last 10 detected changes stored per site
- Configurable check intervals via `node-cron`
- Graceful shutdown handling and startup environment validation
- **Email verification** — alert emails only sent after recipient confirms their address
- **Unsubscribe link** in every alert email — recipients can opt out without needing account access
- **Token recovery** — accounts with a recovery email can request a new token via email
- Pagination on monitor listing

## Tech Stack

**Backend:** Node.js, Express, MongoDB/Mongoose, Cheerio, Nodemailer  
**Frontend:** React, Tailwind CSS  
**Testing:** Jest, Supertest, mongodb-memory-server  
**CI:** GitHub Actions

## Project Structure

```
server/
├── controllers/       # Route handlers
├── services/          # Scraping, hashing, diffing, email logic
│   └── __mocks__/     # Jest manual mocks
├── models/            # Mongoose schemas
├── middleware/        # Token authentication
├── jobs/              # node-cron scheduler
├── config/            # DB connection, env validation
└── tests/             # Jest/Supertest test suite
client/                # React frontend
.github/workflows/     # CI — runs tests on every push
```

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/yugp21/Watchly.git
cd Watchly

# 2. Backend
cd server
cp .env.example .env      # fill in your real values
npm install
npm run dev

# 3. Frontend (in a separate terminal)
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000`.

## Environment Variables

| Variable | Description |
|---|---|
| `NODE_ENV` | Set to `development` locally |
| `PORT` | Backend port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend URL for CORS (e.g. http://localhost:5173) |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP port (587 for TLS) |
| `SMTP_USER` | SMTP username / Gmail address |
| `SMTP_PASS` | SMTP password / Gmail App Password |

## Running Tests

```bash
cd server
npm test
```

Tests run against an in-memory MongoDB instance — no real database or network connection needed. All tests run in isolation.

## How It Works

1. Create an account — you get a username and a one-time token (save it)
2. Add a monitor — enter a public URL, alert email, and check interval
3. A verification email is sent to the alert address — alerts are held until confirmed
4. Watchly scrapes the page on your chosen interval and emails you when content changes
5. Every alert email includes an unsubscribe link — recipients can opt out at any time
6. If you lose your token, request recovery via your account's recovery email

## Security Design

- **SSRF protection:** before scraping any URL, the hostname is resolved to an IP and checked against private/reserved ranges (10.x, 172.16–31.x, 192.168.x, 127.x, 169.254.x, IPv6 loopback) to prevent monitoring internal infrastructure.
- **Token hashing:** auth tokens are hashed with SHA-256 before storage — raw tokens are never persisted to the database.
- **Rate limiting:** applied at the API level (100 req/15 min) and per-recipient on outgoing emails to prevent spam abuse.
- **Email verification:** alert recipients must confirm their address before any change alerts are sent — prevents Watchly being used to send unsolicited emails to strangers.
- **Unsubscribe:** every alert email contains a one-click unsubscribe link that immediately stops future alerts for that monitor.
- **Payload cap:** incoming request bodies are limited to 50KB to prevent memory abuse.
- **Scoped CORS:** only the configured `CLIENT_URL` is allowed — no wildcard origins.
- **Label sanitization:** monitor labels are stripped of HTML and script tags before storage.

## API Endpoints

### Accounts
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/accounts/create` | Create a new account |
| POST | `/api/accounts/import` | Import existing account with token |
| PATCH | `/api/accounts/rename` | Rename account (requires token) |
| DELETE | `/api/accounts/delete` | Delete account and all monitors |
| POST | `/api/accounts/recover` | Request token recovery via recovery email |

### Sites
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/sites` | ✅ | List all monitors (paginated) |
| POST | `/api/sites` | ✅ | Add a new monitor |
| PUT | `/api/sites/:id` | ✅ | Update monitor settings |
| DELETE | `/api/sites/:id` | ✅ | Delete a monitor |
| POST | `/api/sites/check-now/:id` | ✅ | Manually trigger a check |
| GET | `/api/sites/verify-email` | ❌ | Verify alert email (called from email link) |
| GET | `/api/sites/unsubscribe` | ❌ | Unsubscribe from alerts (called from email link) |
| GET | `/api/health` | ❌ | Server health check |

## Known Limitations

- Static HTML scraping only (Cheerio) — JavaScript-rendered SPA pages are not fully supported.
- Email delivery uses SMTP — suitable for personal/demo use, not for high-volume production email.
- Single-process cron scheduler — not designed for horizontal scaling.

## License

MIT — free to use, fork, and learn from.