@echo off
echo.
echo  CreatorInsight — Hackathon Quick Start
echo  =======================================
echo.

:: Activate venv
call .venv\Scripts\activate.bat

:: Check if DB exists
if not exist creatorinsight.db (
    echo  [1/3] Running database migrations...
    alembic upgrade head
    echo.
    echo  [2/3] Seeding demo data...
    python scripts/seed.py
) else (
    echo  Database already exists — skipping migrations
    echo  To reseed: delete creatorinsight.db and run start.bat again
)

echo.
echo  [3/3] Starting API server...
echo.
echo  API:   http://localhost:8000
echo  Docs:  http://localhost:8000/docs
echo.
echo  Demo login:
echo    Email:    alex@demo.com
echo    Password: demo1234
echo.
uvicorn app.main:app --reload --port 8000
