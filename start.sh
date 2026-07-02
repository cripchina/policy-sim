#!/bin/bash
set -e

echo "=== Policy Simulation Platform - Start Script ==="
echo ""

# Build frontend
echo "[1/3] Building frontend..."
cd frontend
npm install --silent
npm run build
cd ..

# Build backend
echo "[2/3] Building backend..."
cd backend
npm install --silent
npm run build

# Seed database (if needed)
if [ ! -f data/policysim.db ]; then
  echo "Seeding database..."
  npx ts-node src/seed.ts
fi

# Start server
echo "[3/3] Starting server..."
echo "==================================="
echo "Server: http://localhost:3000"
echo "==================================="
node dist/main.js
