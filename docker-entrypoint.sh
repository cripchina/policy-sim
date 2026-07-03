#!/bin/sh
set -e

# Run seed if database doesn't exist or is empty
if [ ! -f /app/backend/data/policysim.db ]; then
  echo "Initializing database with seed data..."
  cd /app/backend && npx ts-node src/seed.ts
fi

# Start the server
echo "Starting Policy Simulation Platform..."
cd /app/backend && node dist/main.js
