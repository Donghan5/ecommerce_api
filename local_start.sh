#!/bin/bash
set -e

# --- 설정 ---
DB_CONTAINER="ecommerce_postgres"
MAX_RETRIES=40
# -----------

echo "📝 [1/7] Checking .env file..."
if [ ! -f .env ]; then
  echo "   - .env file not found. Please create one."
  exit 1
else
  echo "   - .env file exists. Let's move to the next step."
fi

echo "🧹 [2/7] Cleaning up artifacts..."
rm -rf dist
find src -name "*.js" -type f -delete
find src -name "*.js.map" -type f -delete

echo "🐳 [3/7] Resetting Docker Environment..."
docker rm -f postgres_db ecommerce_postgres 2>/dev/null || true
docker-compose down -v --remove-orphans
echo "✅ Docker environment is clean."

echo "📦 [4/7] Checking dependencies..."
if [ -d "node_modules" ]; then
  echo "   - Deleting existing node_modules for fresh install..."
  rm -rf node_modules
fi
npm install

echo "🚀 [5/7] Starting Database and Redis..."
docker-compose up -d postgres redis

echo "⏳ [6/7] Waiting for Database to be ready (Max 3 mins)..."
count=0
until docker logs $DB_CONTAINER 2>&1 | grep -q "database system is ready to accept connections"; do
  if [ $count -eq $MAX_RETRIES ]; then
    echo "❌ Timeout: Database took too long to start."
    echo "🔍 Check logs with: docker logs $DB_CONTAINER"
    exit 1
  fi
  count=$((count+1))
  echo "   - Waiting for Postgres... ($count/$MAX_RETRIES)"
  sleep 5
done
echo "✅ Database is ready!"

echo "✨ [7/7] Building and Starting App..."
npm run build
npm run start:dev