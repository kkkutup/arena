# Arena — Product & Engineering Roadmap

> **Working name:** Arena · **Tagline:** "Duolingo for trading — compete with your friends."
> A gamified mobile app where people learn by *competing* in trading challenges on live
> markets with virtual money. No real-money wagering, no entry fees, no cash prizes tied
> to rank (see Compliance). Learning content supports the social competition core.

_Created 2026-06-15. First build target: **the backend.**_

---

## 1. Locked decisions

| Area | Decision |
|---|---|
| Backend | **NestJS** standalone API (TypeScript) — REST + WebSocket gateway, JWT, cron, Swagger |
| Database | **PostgreSQL** (managed) via Prisma; **Redis** for cache, leaderboards, jobs, pub/sub |
| Mobile | **React Native + Expo** (TypeScript) — one codebase, iOS + Android, OTA updates |
| Product core | **Social competitions first** — friend leagues, challenges, head-to-head; learning secondary |
| Auth | **Email/password + Google + Apple** sign-in (JWT access + refresh) |
| Reuse | Port the existing `engine.ts` (margin/P&L/liquidation) and Binance price-feed logic |

---

## 2. Product pillars

1. **Compete** — private friend leagues, 1v1 duels, public weekly divisions (Bronze→Diamond, promotion/relegation like Duolingo leagues).
2. **Play** — a fast, friendly paper-trading sandbox per competition; live prices; long/short with leverage caps.
3. **Progress** — XP, streaks, levels, achievements, daily goals; a sense of getting better.
4. **Learn** — bite-size lessons/quizzes that unlock and reinforce concepts (lighter, supporting layer).
5. **Stay compliant** — never let payment touch the leaderboard; virtual money only; prizes (if any) sponsor-funded and decoupled from play.

---

## 3. Architecture (target)

```
                 ┌──────────────────────────┐
   iOS / Android │  React Native (Expo) app │
                 └─────────────┬────────────┘
                  HTTPS REST + WSS │  (+ Expo Push)
                 ┌─────────────▼────────────┐
                 │       NestJS API         │
                 │  Auth · Users · Social   │
                 │  Competitions · Trading  │
                 │  Leagues · Gamification  │
                 │  Notifications · Admin   │
                 │  WS gateway (live prices)│
                 └───┬───────┬───────┬──────┘
                     │       │       │
              ┌──────▼─┐ ┌───▼───┐ ┌─▼─────────┐      ┌──────────────┐
              │Postgres│ │ Redis │ │ BullMQ    │◄─────│ Binance WS   │
              │ Prisma │ │ cache │ │ workers   │ feed │ (market data)│
              └────────┘ │ zsets │ │ liq/cron  │      └──────────────┘
                         │ pubsub│ └───────────┘
                         └───────┘
```

**Why these:** long-lived market WS + background workers (liquidations, league rollovers,
streak resets, notifications) need a real server with cron/queues — exactly what bit us in
Next.js. NestJS + Redis/BullMQ is the conventional, production-grade fit.

---

## 4. Domain model (key entities)

The shift from the web prototype: **positions belong to a `Participation`, not directly to a user.**

- **User** — id, email, passwordHash?, username, displayName, avatar, country, createdAt
- **AuthIdentity** — provider (google|apple), providerUserId, userId
- **RefreshToken** — userId, tokenHash, expiresAt, device
- **ProfileStats** — userId, xp, level, streakCount, lastActiveDate, wins, competitionsPlayed
- **Friendship** — requesterId, addresseeId, status (pending|accepted|blocked)
- **Competition** — id, name, type (private_league | duel | public_division), creatorId,
  instruments[], startingBalance, maxLeverage, startAt, endAt, status
  (scheduled|live|settling|finished), joinCode, maxParticipants, rules
- **Participation** — id, competitionId, userId, cashBalance, finalRank?, finalEquity?, joinedAt
  _(this is the per-competition trading account)_
- **Position** — id, participationId, symbol, side, qty, leverage, entryPrice, margin,
  liquidationPrice, status (open|closed|liquidated), closePrice?, realizedPnl?, timestamps
- **Division / LeagueWeek + DivisionMembership** — weekly cohorts, tier, promotion/relegation
- **Achievement + UserAchievement** — unlockable badges
- **Lesson / Unit / Quiz / LessonProgress** — learning content (secondary)
- **DeviceToken** — userId, expoPushToken, platform
- **Notification** — userId, type, payload, readAt
- **Setting** (admin config) · **AdminLog** (audit)

---

## 5. Backend roadmap — **PHASE 1 (first target)**

Milestones are ordered by dependency. Each ships behind tests + Swagger docs.

### B0 — Foundation & tooling
- NestJS app, TypeScript strict, ESLint/Prettier, `.env` config module + schema validation
- Postgres + Prisma (port & extend the schema), first migration; Redis connection
- Docker Compose (api + postgres + redis) for local dev
- Health/readiness endpoints, structured logging (Pino), global error filter
- GitHub Actions CI (lint, typecheck, test, build)
- **Exit:** `docker compose up` runs the API; CI green.

### B1 — Auth & users
- Email/password (argon2 hashing), Google + Apple OAuth (Passport strategies)
- JWT access (short) + refresh (rotating, hashed in DB); logout/revoke
- `/auth/*`, `/me`, profile create/update, username uniqueness, avatar upload (S3/R2)
- Guards + decorators; rate-limit auth endpoints
- **Exit:** a client can register/login via all three methods and call an authed endpoint.

### B2 — Market data service
- Server-owned Binance WS (reuse our fix), in-memory + Redis price cache, reconnect
- WS gateway (socket.io) streaming live prices to mobile clients; REST snapshot fallback
- Instrument registry (symbols, precision, leverage caps) — DB-backed, admin-editable
- **Exit:** clients receive live ticks over WSS; server has authoritative prices.

### B3 — Trading engine (port + adapt)
- Port `engine.ts` (margin, P&L, ROE, liquidation) as a tested domain module
- Order service against **Participation** balances; open/close long/short with leverage
- Liquidation worker (BullMQ) sweeping open positions against live price
- **Exit:** open/close/liquidate works inside a competition sandbox; unit-tested math.

### B4 — Competitions & participations
- Create/join competitions: types (private_league, duel, public_division), join codes
- Lifecycle state machine + scheduler (scheduled→live→settling→finished) via cron
- Join/leave, capacity, per-competition starting balance & rules
- Settlement: freeze, final ranks, archive
- **Exit:** two users can create, join, trade in, and settle a shared competition.

### B5 — Social graph
- Friend requests/accept/block; friends list; basic public profiles & stats
- Activity feed primitives (friend joined/won a competition)
- **Exit:** users can friend each other and see friends’ profiles & results.

### B6 — Leaderboards & leagues
- Real-time per-competition ranking via **Redis sorted sets** (equity-keyed)
- Duolingo-style weekly **divisions**: assignment, tiers, promotion/relegation cron job
- Global + friends leaderboards
- **Exit:** live leaderboards update in real time; weekly league rollover runs automatically.

### B7 — Gamification
- XP rules, levels, daily goals; **streaks** with timezone-aware daily reset job
- Achievements engine (event-driven unlocks)
- **Exit:** trading/competing awards XP; streaks and badges work and persist.

### B8 — Notifications
- Device-token registry; Expo Push (→ FCM/APNs) integration
- Event triggers: competition start/end, friend activity, streak reminders, liquidation, league promotion
- Per-user preferences
- **Exit:** push notifications fire for key events; opt-out respected.

### B9 — Learning content (secondary)
- Lesson/unit/quiz models + progress tracking; content authoring via admin
- XP integration (completing lessons grants XP)
- **Exit:** a user can complete a lesson and earn XP.

### B10 — Admin & moderation
- Admin auth (separate from users), dashboard APIs: users, competitions, content, config
- Moderation (ban/mute, report handling), feature flags / settings, audit log
- **Exit:** an operator can manage users, competitions, content, and config.

### B11 — Production hardening
- Global rate limiting (Redis), input validation everywhere, secrets management
- Observability: Sentry (errors), request/trace logging, metrics, uptime checks
- API versioning (`/v1`), pagination standards, OpenAPI published
- Load test (k6) on price WS + competition flows; security review; backups + migration runbook
- **Exit:** documented, monitored, rate-limited, load-tested API on staging.

---

## 6. Mobile roadmap — PHASE 2 (after backend MVP: B0–B8)

- **M0** Expo app skeleton, design system (Duolingo-style: rounded, playful, mascot, bold color, haptics), navigation, API client + auth/token storage (SecureStore)
- **M1** Onboarding + auth (email/Google/Apple), profile setup
- **M2** Home: streak, daily goal, your competitions, friends’ activity
- **M3** Trading sandbox screen: live chart, instrument list, order ticket, positions, P&L (reuse lightweight-charts via RN wrapper or a chart lib)
- **M4** Competitions: create/join (codes, invite friends), competition detail + live leaderboard
- **M5** Leagues & global leaderboards; promotion/relegation animations
- **M6** Social: find/add friends, profiles, duels
- **M7** Gamification UI: XP/level-up, streak flames, achievements, celebratory animations & sound
- **M8** Lessons UI (secondary)
- **M9** Push notifications, deep links, settings
- **M10** Polish, accessibility, store assets, beta (TestFlight + Google Play internal)

## 7. Launch — PHASE 3
- Closed beta → fix → App Store + Play submission (Apple sign-in compliance, privacy labels, KVKK/GDPR consent)
- Analytics (PostHog), crash reporting, basic growth loops (invite friends → both get XP)
- Monetization later: subscription (RevenueCat) for premium tools/leagues/cosmetics — **never** pay-to-win or pay-to-rank

---

## 8. Cross-cutting (applies throughout)
- **Compliance:** virtual money only; no entry fees; no cash prizes tied to rank; lawyer review before any prize/monetization (per council). KVKK/GDPR consent + data export/delete.
- **Security:** argon2, rotating refresh tokens, rate limiting, input validation, least-privilege, dependency scanning.
- **Testing:** unit (engine, services), integration (auth, competition flows), e2e on critical paths.
- **DevOps:** Docker, CI/CD, managed Postgres (Neon/Supabase/RDS) + Redis (Upstash), staging + prod, DB backups, migration discipline.

## 9. Suggested sequencing (solo founder)
1. **B0 → B1 → B2 → B3 → B4** = the playable core (auth + live prices + trade + compete). This is the first real milestone — demo-able end to end.
2. **B5 → B6 → B7 → B8** = the social/gamified loop that makes it Duolingo-like.
3. Start **mobile M0–M4** in parallel once B1–B4 are stable (API contract frozen via Swagger).
4. **B9–B11** + **M5–M10** → beta → launch.

## 10. Open questions / risks
- Final **brand name** (Arena vs new Duolingo-style name) — affects store listings, domains.
- Chart rendering on RN (native chart lib vs WebView lightweight-charts) — validate early in M3.
- Market data licensing at scale (Binance public is fine for now; confirm ToS for a published app).
- Real skill vs chance framing for store review + compliance — keep "practice/learn" framing dominant.
- Content authoring load for lessons (B9) — keep minimal until core loop proven.

---

## 11. What we build first (concrete next step)
**B0 — Foundation.** Scaffold the NestJS monorepo (`arena/backend`), wire Postgres + Prisma
(porting the schema) + Redis, Docker Compose, config validation, health checks, logging, and CI.
Then immediately B1 (auth) and B2 (market data) to reach a vertical slice fast.
