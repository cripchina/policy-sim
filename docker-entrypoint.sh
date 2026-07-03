#!/bin/sh
set -e

# Start the server (app auto-seeds on first startup)
echo "Starting Policy Simulation Platform..."
cd /app/backend && node dist/main.js
