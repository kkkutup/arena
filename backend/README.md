# Arena — Backend (NestJS)

Production API for Arena: auth, social graph, trading competitions, live market
data, leagues, gamification. See `../ROADMAP.md` for the full plan.

## Stack
NestJS 11 · Prisma 6 + PostgreSQL · Redis (ioredis) · Pino logging · Terminus health · Docker

## Local development

Prereqs: Node 22+, Docker.

```bash
cp .env.example .env          # adjust if needed
npm install
npm run db:up                 # start Postgres + Redis (docker)
npm run migrate:dev           # create/apply DB migrations + generate client
npm run start:dev             # API on http://localhost:8080
```

Check it's alive:
```bash
curl http://localhost:8080/health/live   # liveness
curl http://localhost:8080/health        # readiness (DB + Redis)
```

## Conventions
- API routes are URI-versioned under `/v1/*` (health endpoints are version-neutral).
- Env is validated at boot (`src/config/env.validation.ts`) — the app refuses to start if misconfigured.
- `PrismaService` and the Redis client are global providers; inject anywhere.

## Layout
```
src/
  config/      env validation
  prisma/      PrismaService + global module
  redis/       ioredis provider (global)
  health/      liveness + readiness
  main.ts      bootstrap (pino, validation, versioning, CORS)
prisma/
  schema.prisma   domain model
```

## Production (Hetzner)
On the VPS (Docker installed), with a `.env` containing a strong `POSTGRES_PASSWORD`:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
The API container runs `prisma migrate deploy` on start, then boots. Postgres/Redis
are internal-only; put a reverse proxy (Caddy/nginx) in front of the API for TLS.
Nightly backups: wire `scripts/backup.sh` into cron.

## Scripts
| Command | Does |
|---|---|
| `npm run start:dev` | watch-mode dev server |
| `npm run db:up` / `db:down` | start/stop Postgres + Redis |
| `npm run migrate:dev` | create + apply a migration (dev) |
| `npm run migrate:deploy` | apply migrations (prod/CI) |
| `npm run prisma:studio` | browse the DB |
| `npm run build` / `test` / `lint` | build / test / lint |
