# PayLater Microservices

PayLater is a microservices-based pay-later platform with a React frontend, API gateway, and Go services (user, merchant, transaction, admin, report).

## Quick start (Docker — recommended)

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:9090 |
| MySQL (from host) | localhost:3307 |

**Dev admin login** (seeded on first DB init only):

| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `admin123` |
| Role | `SUPER_ADMIN` |

To re-seed the database: `docker compose down -v` then `docker compose up --build`.

Verify gateway: `GET http://localhost:9090/health`

## Frontend development (Vite)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

- Set `VITE_API_BASE_URL=/api` in `frontend/.env`
- Vite proxies `/api/*` → `http://localhost:9090` (see `frontend/vite.config.ts`)
- Start the gateway (and backends) before using the UI

## Frontend API modes

| Mode | `VITE_API_BASE_URL` | How API calls reach gateway |
|------|---------------------|-----------------------------|
| Vite dev | `/api` | Vite dev-server proxy strips `/api` and forwards to `:9090` |
| Docker frontend | `http://localhost:9090` | Browser calls gateway directly (CORS allows `:3000`) |
| Docker + `/api` | `/api` | Nginx in frontend container proxies `/api` to gateway |

## Local Go + Docker MySQL only

1. Start MySQL: `docker compose up mysql -d`
2. Copy `.env.example` into each `services/*/.env` and set:
   - `DB_HOST=localhost`, `DB_PORT=3307`, `DB_PASSWORD=Go123`
   - Service URLs pointing to `http://localhost:9091` … `9095`
   - Same `JWT_SECRET` and `INTERNAL_SERVICE_TOKEN` across all services
3. Start services in order: user → merchant → admin → transaction → report → gateway
4. Seed admin manually if volume already exists (see `docker/mysql/init.sql`)

## Verification

```bash
# Frontend
cd frontend && npm run typecheck && npm run build && npm test

# Go (merchant + transaction)
cd services/merchant && go test ./...
cd services/transaction && go test ./...
```

## E2E happy path

1. Register user → login → purchase → payback
2. Register merchant (or admin creates one) → merchant login
3. Admin login → manage users, merchants, transactions, reports
4. SUPER_ADMIN → create/delete admin accounts
