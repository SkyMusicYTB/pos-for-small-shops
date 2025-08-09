# Modular POS (MVP)

Quick start (Docker):

1. Ensure Docker is installed.
2. In repo root, run:

```
docker compose up --build
```

Services:
- db: Postgres 15 with RLS policies. Migrations in `db/migrations` applied at init.
- api: FastAPI at http://localhost:8000 (Swagger UI at `/docs`).
- web: React UI served at http://localhost:5173

Environment (api): see `docker-compose.yml` for env vars.

Schema & RLS:
- All tenant tables have `business_id` with default bound to `current_setting('app.current_business')`.
- RLS policies restrict access to the current business only.
- API sets `SET LOCAL app.current_business = <tenant_uuid>` per-request.

Seed:
- Add a demo tenant and users by running the seed script (coming soon) or manually via SQL.

E2E tests:
- Minimal API-level tests (coming soon).
