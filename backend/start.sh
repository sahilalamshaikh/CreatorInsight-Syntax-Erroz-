#!/bin/bash
echo ""
echo " CreatorInsight — Hackathon Quick Start"
echo " ======================================="
echo ""

source .venv/bin/activate

if [ ! -f creatorinsight.db ]; then
    echo " [1/3] Running database migrations..."
    alembic upgrade head
    echo ""
    echo " [2/3] Seeding demo data..."
    python scripts/seed.py
else
    echo " Database already exists — skipping migrations"
    echo " To reseed: rm creatorinsight.db && bash start.sh"
fi

echo ""
echo " [3/3] Starting API server..."
echo ""
echo " API:   http://localhost:8000"
echo " Docs:  http://localhost:8000/docs"
echo ""
echo " Demo login:"
echo "   Email:    alex@demo.com"
echo "   Password: demo1234"
echo ""
uvicorn app.main:app --reload --port 8000
