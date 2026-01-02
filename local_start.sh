#!/bin/bash

set -e

echo "🧹 [1/6] Cleaning up old build artifacts..."
rm -rf dist
find src -name "*.js" -type f -delete
find src -name "*.js.map" -type f -delete


echo "🐳 [2/6] Checking & Resetting Docker Volumes..."
docker-compose down -v --remove-orphans
echo "✅ Docker environment is clean."


echo "📦 [3/6] Checking node_modules..."
if [ -d "node_modules" ]; then
  echo "   - Found existing node_modules. Deleting for fresh install..."
  rm -rf node_modules
else
  echo "   - node_modules not found. Proceeding..."
fi


echo "⬇️ [4/6] Installing dependencies..."
npm install


echo "🚀 [5/6] Starting Database and Redis..."
docker-compose up -d postgres redis


echo "⏳ Waiting for Database to be ready..."
sleep 5


echo "✨ [6/6] Building and Starting App..."
npm run build
npm run start:dev