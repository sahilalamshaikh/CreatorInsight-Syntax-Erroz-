# CreatorInsight — Backend API

AI-powered social media growth platform. FastAPI + PostgreSQL + Redis + Celery.

---

## Project structure

```
creatorinsight/
├── app/
│   ├── main.py                  # FastAPI app, middleware, lifespan
│   ├── api/v1/
│   │   ├── router.py            # Aggregates all routers
│   │   └── endpoints/
│   │       ├── auth.py          # Register, login, refresh, /me
│   │       ├── analytics.py     # Overview + per-platform time series
│   │       ├── posts.py         # CRUD + publish + metrics
│   │       ├── ai.py            # Content scoring, growth tips, trending hashtags
│   │       ├── social.py        # OAuth connect/disconnect per platform
│   │       ├── alerts_milestones.py
│   │       └── websocket.py     # Real-time alerts via WebSocket + Redis pub/sub
│   ├── core/
│   │   ├── config.py            # Pydantic settings (reads .env)
│   │   ├── security.py          # JWT encode/decode, bcrypt
│   │   └── dependencies.py      # get_db, get_current_user, get_redis
│   ├── db/
│   │   └── session.py           # Async SQLAlchemy engine + Base
│   ├── models/
│   │   └── models.py            # User, SocialAccount, Post, Analytics, Alert, Milestone
│   ├── schemas/
│   │   └── schemas.py           # Pydantic request/response models
│   └── services/
│       ├── celery_app.py        # Celery app + beat schedule
│       └── tasks/
│           ├── publish.py       # Multi-platform fan-out publishing
│           ├── analytics.py     # Periodic analytics sync
│           └── alerts.py        # Engagement drop/spike detection + milestone checks
├── alembic/                     # Database migrations
├── tests/
│   └── test_api.py
├── scripts/
│   └── setup.sh                 # One-command dev setup
├── docker-compose.yml           # PostgreSQL + Redis + pgAdmin
├── requirements.txt
└── .env.example
```

---

## Quick start

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL (port 5432), Redis (port 6379), and pgAdmin (port 5050).

### 2. Run setup script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This creates a `.venv`, installs all dependencies, copies `.env.example` → `.env`, and runs migrations.

### 3. Edit `.env`

```bash
nano .env
```

Minimum required:
```
SECRET_KEY=your-32-char-secret-here
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/creatorinsight
```

Add social API keys as you get them — the app works without them (OAuth routes return a helpful error).

### 4. Start the server

```bash
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

API docs: **http://localhost:8000/docs**

### 5. Start background workers (optional, needed for publishing + analytics)

```bash
# Terminal 2 — Celery worker
celery -A app.services.celery_app worker --loglevel=info

# Terminal 3 — Celery beat (periodic tasks)
celery -A app.services.celery_app beat --loglevel=info
```

---

## API overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, get JWT tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET  | `/api/v1/auth/me` | Get current user |
| GET  | `/api/v1/analytics/overview` | Cross-platform analytics summary |
| GET  | `/api/v1/analytics/platform/{platform}` | Platform time series (7/30/90d) |
| POST | `/api/v1/posts` | Create post (draft or scheduled) |
| GET  | `/api/v1/posts` | List posts with pagination |
| POST | `/api/v1/posts/{id}/publish` | Trigger immediate publish |
| GET  | `/api/v1/posts/{id}/metrics` | Post performance metrics |
| POST | `/api/v1/ai/feedback` | AI caption score + suggestions |
| GET  | `/api/v1/ai/growth-tips` | Personalised growth tips |
| GET  | `/api/v1/ai/trending-hashtags` | Trending hashtags for niche |
| GET  | `/api/v1/social/accounts` | List connected social accounts |
| GET  | `/api/v1/social/{platform}/connect` | Get OAuth URL |
| DELETE | `/api/v1/social/{platform}/disconnect` | Disconnect account |
| GET  | `/api/v1/alerts` | List alerts (filterable by unread) |
| PATCH | `/api/v1/alerts/{id}/read` | Mark alert read |
| POST | `/api/v1/alerts/read-all` | Mark all alerts read |
| GET  | `/api/v1/milestones` | List goals + progress |
| POST | `/api/v1/milestones` | Create new goal |
| WS   | `/api/v1/ws/alerts?token=...` | Real-time alert stream |
| GET  | `/health` | Health check |

---

## Running tests

```bash
source .venv/bin/activate
pytest tests/ -v
```

Tests use a separate `creatorinsight_test` database (started by `docker compose up -d`).

---

## Adding a social platform API

1. Add credentials to `.env`
2. Implement the OAuth callback in `app/api/v1/endpoints/social.py`
3. Add a fetcher function in `app/services/tasks/analytics.py`
4. Add a publisher task in `app/services/tasks/publish.py`

Each platform is isolated — adding or breaking one doesn't affect others.

---

## Next steps

- [ ] Frontend: Next.js dashboard (connect to these APIs)
- [ ] Implement Instagram Graph API token exchange
- [ ] Implement YouTube Data API v3 analytics
- [ ] Add email verification flow
- [ ] Add Stripe subscription for SaaS billing
- [ ] Deploy: Render (API) + Vercel (frontend) + Render PostgreSQL


**Email:** `alex@demo.com`
**Password:** `demo1234`