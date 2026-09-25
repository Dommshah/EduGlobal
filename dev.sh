#!/usr/bin/env bash
# EduGlobal one-command dev launcher (Linux/macOS)
# - ensures the local Postgres cluster is running
# - starts FastAPI on :8000 and Next.js on :3000
set -e
cd "$(dirname "$0")"

PG_BIN=${PG_BIN:-/usr/lib/postgresql/17/bin}

# 1) Start bundled Postgres cluster if not running
if ! $PG_BIN/pg_ctl -D .pgdata status >/dev/null 2>&1; then
  echo "▶ Starting PostgreSQL…"
  $PG_BIN/pg_ctl -D .pgdata -l .pgdata/logfile -o "-k /tmp" start
  sleep 1
fi

# 2) Seed database (idempotent-ish: reseeds demo data)
echo "▶ Seeding database…"
(cd backend && python3 -m app.seed)

# 3) Start backend
echo "▶ Starting API on http://localhost:8000 …"
(cd backend && python3 -m uvicorn app.main:app --port 8000) &
API_PID=$!

# 4) Start frontend (single URL: /api/* is proxied to the backend)
echo "▶ Starting web on http://localhost:4000 …"
(cd frontend && npm run dev) &
WEB_PID=$!

trap "kill $API_PID $WEB_PID 2>/dev/null" EXIT
echo
echo "✅ EduGlobal running (single URL):"
echo "   App  → http://localhost:4000"
echo "   API via proxy → http://localhost:4000/api/docs · direct → http://localhost:8000/docs"
echo "   Logins → admin@eduglobal.com / Admin@123 · employee@eduglobal.com / Employee@123 · student@eduglobal.com / Student@123"
echo
wait
