# Backend B1–B4 — built & live

Built autonomously while you were away. **The full backend (auth + market data + trading +
competitions) is deployed and verified working in production over HTTPS.**

## Base URL
**https://95-216-202-119.sslip.io/v1** (auto-HTTPS via Caddy; socket.io at the root for live prices)

## API surface (all tested end-to-end against the live server)

### B1 — Auth & users
| Method | Path | Body / notes |
|---|---|---|
| POST | `/auth/register` | `{email, password, username}` → `{user, accessToken, refreshToken}` |
| POST | `/auth/login` | `{email, password}` |
| POST | `/auth/refresh` | `{refreshToken}` → new pair (old refresh is revoked = rotation) |
| POST | `/auth/logout` | `{refreshToken}` |
| GET | `/me` | Bearer token → user + stats |
| PATCH | `/me` | `{displayName?, avatarUrl?, country?}` |

JWT access (15m) + rotating refresh (hashed in DB, 30d). bcrypt password hashing. Verified:
rotation, 401s on bad/missing token, 409 on duplicate.

### B2 — Market data
| Method | Path | Notes |
|---|---|---|
| GET | `/market/instruments` | 5 crypto instruments |
| GET | `/market/prices` | live prices (server WS to Binance) |
| GET | `/market/candles?symbol=&interval=&limit=` | OHLC candles |
| WS | socket.io `prices` event | broadcasts prices ~1/s |

### B3 — Trading (auth required)
| Method | Path | Notes |
|---|---|---|
| GET | `/competitions/:id/positions` | account state: cash, equity, free margin, open positions w/ live P&L |
| POST | `/competitions/:id/positions` | `{symbol, side, qty, leverage}` → open |
| POST | `/competitions/:id/positions/:posId/close` | realize P&L into balance |

Liquidations swept every 10s (cron). Verified: margin/liq math exact, equity ticks live,
guards (leverage>max → 400, instrument-not-in-comp → 400).

### B4 — Competitions (auth required)
| Method | Path | Notes |
|---|---|---|
| POST | `/competitions` | `{name, type, instruments, startingBalance, maxLeverage, durationHours}` → creates + joins, LIVE |
| GET | `/competitions` | my competitions (rank/equity/return) |
| GET | `/competitions/public` | open public divisions |
| POST | `/competitions/join` | `{code}` → join private by code |
| POST | `/competitions/:id/join` | join public |
| GET | `/competitions/:id` | detail + my summary |
| GET | `/competitions/:id/leaderboard` | live equity-ranked rows (`isMe` flag) |

Verified: multi-user join-by-code, live leaderboard ranking.

## Deploy / ops
- `docker-compose.prod.yml` now runs **api + postgres + redis + caddy**, all `restart: unless-stopped`.
- New env on the server: `JWT_SECRET` (strong, generated), `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL_DAYS`.
- Deploy = `tar` source to `/opt/arena/backend` → `docker compose -f docker-compose.prod.yml up -d --build`.
- All backend commits on branch **`mobile-app`** (not pushed/merged).

## ⛔ Needs your input (couldn't do without you)
1. **Google / Apple sign-in** — endpoints are stubbed but need OAuth **client IDs** (set `GOOGLE_CLIENT_ID` / `APPLE_CLIENT_ID` env) + mobile SDK setup. Email/password works fully now.
2. **Wire the mobile app to this backend** — build the `httpClient` (`mobile/src/api`), point the session store at real `/auth`, swap `useMockPriceFeed` for the socket.io feed. This is buildable but **needs on-device testing** (your phone) to verify, so I left it for when you're back. The mock types already match the API shapes, so it's a contained job.
3. **SSH hardening** — still password-auth + the `alyeska` root password (deferred per your "pentest expert later"). Change that password whenever convenient.

## Not built yet (next backend milestones)
- B5 social (friends API), B6 leagues/divisions, B7 gamification (XP/streaks), B8 notifications, B9 lessons, admin, hardening.
