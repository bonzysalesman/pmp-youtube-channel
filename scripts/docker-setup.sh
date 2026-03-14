#!/bin/bash

# Docker Environment Setup Script for PMP WordPress Integration
# This script sets up the complete Docker environment for development

set -e

echo "🚀 Setting up PMP WordPress Integration Docker Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Create environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.docker ]; then
            cp .env.docker .env
            print_success "Created .env file from .env.docker template"
            print_warning "Please update .env file with your actual API keys and configuration"
        else
            print_error ".env.docker template not found"
            exit 1
        fi
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=(
        "wordpress/plugins"
        "wordpress/mu-plugins"
        "wordpress/uploads"
        "logs"
        "docker/mysql/dev-scripts"
        "docker/nginx/ssl"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created directory: $dir"
        fi
    done
}

# Set up WordPress plugin structure
setup_wordpress_plugin() {
    print_status "Setting up WordPress analytics plugin..."
    
    plugin_dir="wordpress/plugins/pmp-analytics"
    
    if [ ! -d "$plugin_dir" ]; then
        mkdir -p "$plugin_dir"
        
        # Create basic plugin file
        cat > "$plugin_dir/pmp-analytics.php" << 'EOF'
<?php
/**
 * Plugin Name: PMP Analytics Integration
 * Plugin URI: https://pmp-course.com
 * Description: Integrates WordPress with PMP analytics system for comprehensive user tracking and conversion analysis.
 * Version: 1.0.0
 * Author: PMP Course Team
 * License: MIT
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('PMP_ANALYTICS_VERSION', '1.0.0');
define('PMP_ANALYTICS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PMP_ANALYTICS_PLUGIN_URL', plugin_dir_url(__FILE__));

// Initialize plugin
add_action('plugins_loaded', 'pmp_analytics_init');

function pmp_analytics_init() {
    // Plugin initialization code will be added here
    if (is_admin()) {
        add_action('admin_menu', 'pmp_analytics_admin_menu');
    }
    
    // Frontend tracking
    add_action('wp_head', 'pmp_analytics_tracking_script');
    add_action('wp_footer', 'pmp_analytics_footer_script');
}

function pmp_analytics_admin_menu() {
    add_options_page(
        'PMP Analytics Settings',
        'PMP Analytics',
        'manage_options',
        'pmp-analytics',
        'pmp_analytics_settings_page'
    );
}

function pmp_analytics_settings_page() {
    echo '<div class="wrap"><h1>PMP Analytics Integration</h1>';
    echo '<p>Analytics integration settings will be available here.</p>';
    echo '</div>';
}

function pmp_analytics_tracking_script() {
    // Tracking script will be added here
    echo '<!-- PMP Analytics Tracking -->';
}

function pmp_analytics_footer_script() {
    // Footer tracking script will be added here
    echo '<!-- PMP Analytics Footer -->';
}
EOF
        
        print_success "Created WordPress analytics plugin"
    else
        print_warning "WordPress plugin directory already exists"
    fi
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    if docker-compose build; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        exit 1
    fi
}

# Start services
start_services() {
    print_status "Starting Docker services..."
    
    if docker-compose up -d; then
        print_success "Docker services started successfully"
    else
        print_error "Failed to start Docker services"
        exit 1
    fi
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_services_health
}

# Check service health
check_services_health() {
    print_status "Checking service health..."
    
    services=("wordpress" "mysql" "redis" "analytics_api")
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            print_success "$service is running"
        else
            print_warning "$service may not be ready yet"
        fi
    done
    
    # Test WordPress
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|302"; then
        print_success "WordPress is accessible at http://localhost:8080"
    else
        print_warning "WordPress may not be ready yet"
    fi
    
    # Test Analytics API
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health | grep -q "200"; then
        print_success "Analytics API is accessible at http://localhost:3000"
    else
        print_warning "Analytics API may not be ready yet"
    fi
}

# Display access information
show_access_info() {
    print_success "🎉 Docker environment setup complete!"
    echo ""
    echo "📋 Service Access Information:"
    echo "   WordPress:     http://localhost:8080"
    echo "   Analytics API: http://localhost:3000"
    echo "   phpMyAdmin:    http://localhost:8081"
    echo "   Redis:         localhost:6379"
    echo "   MySQL:         localhost:3306"
    echo ""
    echo "🔧 Development Tools (use --profile development):"
    echo "   Adminer:       http://localhost:8082"
    echo "   MailHog:       http://localhost:8025"
    echo "   Traefik:       http://localhost:8080 (dashboard)"
    echo ""
    echo "📚 Next Steps:"
    echo "   1. Complete WordPress setup at http://localhost:8080"
    echo "   2. Activate the Understrap Child theme"
    echo "   3. Enable the PMP Analytics plugin"
    echo "   4. Update .env file with your API keys"
    echo "   5. Test the integration with: npm run test:integration"
    echo ""
    echo "📖 For more information, see docker/README.md"
}

# Main execution
main() {
    echo "Starting Docker environment setup..."
    
    check_docker
    setup_environment
    create_directories
    setup_wordpress_plugin
    build_images
    start_services
    show_access_info
}

# Run main function
main "$@"