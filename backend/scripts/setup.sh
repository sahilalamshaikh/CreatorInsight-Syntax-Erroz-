#!/usr/bin/env bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}CreatorInsight — backend setup${NC}"
echo "================================"

# 1. Python version check
python3 --version | grep -q "3.1" || { echo "Python 3.10+ required"; exit 1; }

# 2. Virtual environment
if [ ! -d ".venv" ]; then
  echo -e "\n${YELLOW}Creating virtual environment...${NC}"
  python3 -m venv .venv
fi
source .venv/bin/activate

# 3. Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "Dependencies installed."

# 4. .env file
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "\n${YELLOW}.env created from .env.example${NC}"
  echo "  → Edit .env and set DATABASE_URL, SECRET_KEY, and social API keys."
else
  echo ".env already exists, skipping."
fi

# 5. Database
echo -e "\n${YELLOW}Running database migrations...${NC}"
if alembic upgrade head 2>/dev/null; then
  echo "Migrations applied."
else
  echo -e "${YELLOW}Migrations skipped — make sure PostgreSQL is running and DATABASE_URL is set in .env${NC}"
fi

echo -e "\n${GREEN}Setup complete!${NC}"
echo ""
echo "Start the API server:"
echo "  source .venv/bin/activate"
echo "  uvicorn app.main:app --reload --port 8000"
echo ""
echo "Start the Celery worker (new terminal):"
echo "  source .venv/bin/activate"
echo "  celery -A app.services.celery_app worker --loglevel=info"
echo ""
echo "Start Celery beat scheduler (new terminal):"
echo "  source .venv/bin/activate"
echo "  celery -A app.services.celery_app beat --loglevel=info"
echo ""
echo "API docs: http://localhost:8000/docs"
