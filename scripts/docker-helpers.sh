#!/bin/bash

# Docker Helper Scripts for PMP WordPress Integration
# Collection of utility functions for managing the Docker environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start           Start all services"
    echo "  stop            Stop all services"
    echo "  restart         Restart all services"
    echo "  status          Show service status"
    echo "  logs [service]  Show logs (optionally for specific service)"
    echo "  shell [service] Open shell in service container"
    echo "  backup          Backup databases and volumes"
    echo "  restore [file]  Restore from backup file"
    echo "  reset           Reset all data (destructive!)"
    echo "  update          Update and rebuild containers"
    echo "  health          Check service health"
    echo "  dev             Start with development profile"
    echo "  prod            Start with production profile"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs wordpress"
    echo "  $0 shell analytics_api"
    echo "  $0 backup"
}

# Start services
start_services() {
    print_status "Starting Docker services..."
    docker-compose up -d
    print_success "Services started"
    show_service_urls
}

# Stop services
stop_services() {
    print_status "Stopping Docker services..."
    docker-compose down
    print_success "Services stopped"
}

# Restart services
restart_services() {
    print_status "Restarting Docker services..."
    docker-compose restart
    print_success "Services restarted"
    show_service_urls
}

# Show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
}

# Show logs
show_logs() {
    local service=$1
    if [ -n "$service" ]; then
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        print_status "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Open shell in container
open_shell() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service name"
        echo "Available services: wordpress, mysql, redis, analytics_api"
        return 1
    fi
    
    print_status "Opening shell in $service container..."
    
    case $service in
        "wordpress")
            docker-compose exec wordpress bash
            ;;
        "mysql")
            docker-compose exec mysql mysql -u root -p
            ;;
        "redis")
            docker-compose exec redis redis-cli -a redis_password
            ;;
        "analytics_api")
            docker-compose exec analytics_api sh
            ;;
        *)
            docker-compose exec "$service" sh
            ;;
    esac
}

# Backup databases and volumes
backup_data() {
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    print_status "Creating backup in $backup_dir..."
    
    # Backup MySQL databases
    print_status "Backing up MySQL databases..."
    docker-compose exec -T mysql mysqldump -u root -p"root_password" --all-databases > "$backup_dir/mysql_all_databases.sql"
    
    # Backup WordPress uploads
    print_status "Backing up WordPress uploads..."
    docker run --rm -v pmp_wordpress_uploads:/data -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/wordpress_uploads.tar.gz -C /data .
    
    # Backup WordPress core files
    print_status "Backing up WordPress core files..."
    docker run --rm -v pmp_wordpress_data:/data -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/wordpress_data.tar.gz -C /data .
    
    # Backup Redis data
    print_status "Backing up Redis data..."
    docker run --rm -v pmp_redis_data:/data -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/redis_data.tar.gz -C /data .
    
    # Backup analytics data
    print_status "Backing up analytics data..."
    docker run --rm -v pmp_analytics_data:/data -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/analytics_data.tar.gz -C /data .
    
    print_success "Backup completed: $backup_dir"
}

# Restore from backup
restore_data() {
    local backup_file=$1
    if [ -z "$backup_file" ]; then
        print_error "Please specify a backup directory"
        echo "Available backups:"
        ls -la backups/ 2>/dev/null || echo "No backups found"
        return 1
    fi
    
    if [ ! -d "$backup_file" ]; then
        print_error "Backup directory not found: $backup_file"
        return 1
    fi
    
    print_warning "This will overwrite existing data. Are you sure? (y/N)"
    read -r confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        return 0
    fi
    
    print_status "Restoring from backup: $backup_file"
    
    # Stop services
    docker-compose down
    
    # Restore MySQL
    if [ -f "$backup_file/mysql_all_databases.sql" ]; then
        print_status "Restoring MySQL databases..."
        docker-compose up -d mysql
        sleep 10
        docker-compose exec -T mysql mysql -u root -p"root_password" < "$backup_file/mysql_all_databases.sql"
    fi
    
    # Restore volumes
    for volume in wordpress_uploads wordpress_data redis_data analytics_data; do
        if [ -f "$backup_file/${volume}.tar.gz" ]; then
            print_status "Restoring $volume..."
            docker run --rm -v "pmp_${volume}:/data" -v "$(pwd)/$backup_file":/backup alpine tar xzf "/backup/${volume}.tar.gz" -C /data
        fi
    done
    
    # Start all services
    docker-compose up -d
    
    print_success "Restore completed"
}

# Reset all data (destructive)
reset_data() {
    print_warning "This will DELETE ALL DATA including databases, uploads, and configurations!"
    print_warning "Are you absolutely sure? Type 'RESET' to confirm:"
    read -r confirm
    if [ "$confirm" != "RESET" ]; then
        print_status "Reset cancelled"
        return 0
    fi
    
    print_status "Resetting all data..."
    
    # Stop and remove containers, networks, and volumes
    docker-compose down -v --remove-orphans
    
    # Remove all volumes
    docker volume rm pmp_wordpress_data pmp_wordpress_uploads pmp_mysql_data pmp_redis_data pmp_analytics_data 2>/dev/null || true
    
    # Remove any orphaned containers
    docker container prune -f
    
    print_success "All data reset. Run 'start' to initialize fresh environment."
}

# Update and rebuild containers
update_containers() {
    print_status "Updating and rebuilding containers..."
    
    # Pull latest base images
    docker-compose pull
    
    # Rebuild custom images
    docker-compose build --no-cache
    
    # Restart services
    docker-compose up -d
    
    print_success "Containers updated and rebuilt"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Check container status
    docker-compose ps
    
    echo ""
    print_status "Testing service endpoints..."
    
    # Test WordPress
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|302"; then
        print_success "✓ WordPress (http://localhost:8080)"
    else
        print_error "✗ WordPress not responding"
    fi
    
    # Test Analytics API
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health | grep -q "200"; then
        print_success "✓ Analytics API (http://localhost:3000)"
    else
        print_error "✗ Analytics API not responding"
    fi
    
    # Test phpMyAdmin
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 | grep -q "200"; then
        print_success "✓ phpMyAdmin (http://localhost:8081)"
    else
        print_warning "✗ phpMyAdmin not responding"
    fi
    
    # Test MySQL connection
    if docker-compose exec -T mysql mysqladmin -u root -p"root_password" ping 2>/dev/null | grep -q "alive"; then
        print_success "✓ MySQL database"
    else
        print_error "✗ MySQL database not responding"
    fi
    
    # Test Redis connection
    if docker-compose exec -T redis redis-cli -a redis_password ping 2>/dev/null | grep -q "PONG"; then
        print_success "✓ Redis cache"
    else
        print_error "✗ Redis cache not responding"
    fi
}

# Start with development profile
start_dev() {
    print_status "Starting with development profile..."
    docker-compose --profile development up -d
    print_success "Development environment started"
    show_dev_urls
}

# Start with production profile
start_prod() {
    print_status "Starting with production profile..."
    docker-compose --profile production up -d
    print_success "Production environment started"
    show_service_urls
}

# Show service URLs
show_service_urls() {
    echo ""
    print_success "🌐 Service URLs:"
    echo "   WordPress:     http://localhost:8080"
    echo "   Analytics API: http://localhost:3000"
    echo "   phpMyAdmin:    http://localhost:8081"
}

# Show development URLs
show_dev_urls() {
    show_service_urls
    echo "   Adminer:       http://localhost:8082"
    echo "   MailHog:       http://localhost:8025"
    echo "   Traefik:       http://localhost:8080 (dashboard)"
}

# Main command handler
case "${1:-help}" in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "shell")
        open_shell "$2"
        ;;
    "backup")
        backup_data
        ;;
    "restore")
        restore_data "$2"
        ;;
    "reset")
        reset_data
        ;;
    "update")
        update_containers
        ;;
    "health")
        check_health
        ;;
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "help"|*)
        show_usage
        ;;
esac