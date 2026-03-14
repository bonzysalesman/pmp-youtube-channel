#!/bin/bash

# PMP WordPress Docker Startup Script
set -e

echo "🚀 Starting PMP WordPress Development Environment"
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists, create from example if not
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. You can modify it if needed."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads plugins docker/ssl

# Set permissions for the entrypoint script
chmod +x docker/wordpress/docker-entrypoint.sh

# Pull latest images
echo "📦 Pulling latest Docker images..."
docker-compose pull

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if WordPress is accessible
echo "🔍 Checking WordPress accessibility..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f -s http://localhost:8080 > /dev/null; then
        echo "✅ WordPress is accessible!"
        break
    else
        echo "⏳ Attempt $attempt/$max_attempts - WordPress not ready yet..."
        sleep 5
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ WordPress failed to start properly. Check the logs:"
    echo "   docker-compose logs wordpress"
    exit 1
fi

# Display access information
echo ""
echo "🎉 PMP WordPress Environment is Ready!"
echo "======================================"
echo ""
echo "🌐 WordPress Site:     http://localhost:8080"
echo "👤 Admin Login:        http://localhost:8080/wp-admin"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🗄️  phpMyAdmin:        http://localhost:8081"
echo "   Username: pmp_user"
echo "   Password: pmp_password"
echo ""
echo "📧 Mailhog (Email):    http://localhost:8025"
echo "🧪 Browser Testing:    http://localhost:8080/wp-content/themes/understrap-child/tests/browser-testing.html"
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🔧 Useful Commands:"
echo "   Stop:     docker-compose down"
echo "   Restart:  docker-compose restart"
echo "   Logs:     docker-compose logs -f [service_name]"
echo "   Shell:    docker-compose exec wordpress bash"
echo "   WP-CLI:   docker-compose exec wordpress wp --allow-root [command]"
echo ""
echo "📝 To customize the environment, edit the .env file and restart."
echo ""