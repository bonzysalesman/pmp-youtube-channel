#!/bin/bash

# PMP WordPress Docker Stop Script
set -e

echo "🛑 Stopping PMP WordPress Development Environment"
echo "==============================================="

# Stop and remove containers
echo "📦 Stopping containers..."
docker-compose down

# Optional: Remove volumes (uncomment if you want to reset everything)
# echo "🗑️  Removing volumes..."
# docker-compose down -v

# Optional: Remove images (uncomment if you want to clean up completely)
# echo "🧹 Removing images..."
# docker-compose down --rmi all

echo ""
echo "✅ PMP WordPress Environment Stopped"
echo ""
echo "🔧 To start again: ./docker-start.sh"
echo "🗑️  To reset completely: docker-compose down -v --rmi all"
echo ""