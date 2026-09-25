# 🌍 EduGlobal — International Education Consultancy Platform

A full-stack, production-ready platform for an international study-abroad consultancy:
luxury glassmorphism UI, 3D globe hero, AI counselor, CRM pipeline, three role-based
dashboards with analytics, and 21 fully functional pages.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Three.js (3D globe) · FastAPI · PostgreSQL · SQLAlchemy · JWT auth

---

## ✨ Features

| Area | Highlights |
|---|---|
| **Public site (18 pages)** | Home with interactive 3D globe, Destinations, Universities + detail pages, Courses search, Services, About, Testimonials, Blog + posts, FAQ, Support, Contact, Enquiry form, AI Counselor (full page + floating widget) |
| **Auth** | Unified login with Student / Counselor / Admin tabs, registration, JWT tokens, middleware-protected routes, role-based redirects |
| **Student dashboard** | Analytics overview, application tracking with document checklist + journey timeline, application wizard, support tickets |
| **Employee (CRM) dashboard** | Pipeline stats, drag-and-drop enquiry Kanban, assigned application management, contact inbox, ticket desk |
| **Admin dashboard** | Platform analytics (users, conversions, top universities, demand by destination), user management (create/role-change/delete), university catalog management, global CRM view, support desk |
| **AI Counselor (EduGuide)** | Retrieval-style backend over the live university/country catalog, suggestion chips, per-user history persistence, anonymous session support |

## 🚀 Quick start (local)

**Prereqs:** Node 18+, Python 3.11+, PostgreSQL running locally.

```bash
# 1) Database (adjust to your setup; or use docker-compose below)
createdb eduglobal

# 2) Backend
cd backend
pip install -r requirements.txt
python -m app.seed          # creates schema + rich demo data
uvicorn app.main:app --reload --port 8000

# 3) Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:3000
```

### One-command demo (Linux/macOS)

```bash
./dev.sh
```

## 🔑 Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@eduglobal.com` | `Admin@123` |
| Counselor | `employee@eduglobal.com` | `Employee@123` |
| Student | `student@eduglobal.com` | `Student@123` |

The login page has one-click **Autofill demo credentials** buttons for each role.

## 🐳 Deployment

```bash
# Build & run everything (Postgres + API + web) with Docker Compose:
docker compose up --build -d
# → Everything on ONE URL: http://localhost:4000  (API proxied under /api)
```

The compose file runs API migrations/seed automatically on first boot
(`SEED_ON_START=1`). Point `NEXT_PUBLIC_API_URL` at your public API domain when
deploying the frontend separately (Vercel, Render, Fly.io, EC2…).

## 🗂 Project structure

```
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + CORS
│   │   ├── models.py          # 12 SQLAlchemy models
│   │   ├── auth_utils.py      # bcrypt-style hashing + JWT
│   │   ├── deps.py            # get_current_user / require_role
│   │   ├── ai.py              # EduGuide AI counselor engine
│   │   ├── seed.py            # demo data seeder
│   │   └── routers/           # public, auth, crm, admin
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/                   # 21 routes (pages + dashboards)
│   ├── components/            # Globe (three.js), ChatWidget, DashShell, cards…
│   ├── lib/                   # api client, auth context, formatting
│   ├── middleware.ts          # route protection
│   └── tailwind.config.ts
├── docker-compose.yml
├── dev.sh
└── README.md
```

## 📡 API overview

- `POST /auth/register` · `POST /auth/login` · `GET /auth/me`
- `GET /countries[/{slug}]` · `GET /universities[/{slug}][/courses]` · `GET /courses` · `GET /stats` · `GET /testimonials` · `GET /blog[/{slug}]`
- `POST /chat` (public + authed) · `GET /chat/history`
- `POST /contact` · `GET|POST /tickets` · `PATCH /tickets/{id}`
- `GET|POST /applications` · `GET|PATCH /applications/{id}` · `POST /applications/{id}/documents/{docId}`
- `GET|POST /enquiries` · `PATCH /enquiries/{id}` · `GET /crm/summary`
- `GET /contacts` · `PATCH /contacts/{id}` *(staff)*
- `GET /admin/analytics` · user & university CRUD *(admin)*

Interactive docs: **http://localhost:8000/docs** (or via the single-URL proxy: http://localhost:4000/api/docs)

## 🔒 Security notes

- Passwords hashed with passlib (PBKDF2-SHA256); JWTs carry `sub` + `role` claims.
- All `/applications`, `/enquiries`, `/tickets`, `/admin/*` routes enforce role-based access.
- Set a strong `JWT_SECRET` and real CORS origins in production (`backend/.env`).

## 🧪 Verified

- `tsc --noEmit` — clean · `next build` — 21/21 routes compile
- Full smoke test: 18 public pages → 200, dashboards redirect unauthenticated users,
  RBAC returns 401, AI chat responds, student application listing works.
