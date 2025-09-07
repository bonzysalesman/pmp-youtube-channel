#!/bin/bash
set -euo pipefail

# WordPress Docker entrypoint script for PMP setup

# Function to wait for database
wait_for_db() {
    echo "Waiting for database connection..."
    while ! mysqladmin ping -h"$WORDPRESS_DB_HOST" --silent; do
        sleep 1
    done
    echo "Database is ready!"
}

# Function to install WordPress if not already installed
install_wordpress() {
    if ! wp core is-installed --allow-root 2>/dev/null; then
        echo "Installing WordPress..."
        
        # Download WordPress core if not present
        if [ ! -f wp-config.php ]; then
            wp core download --allow-root
        fi
        
        # Create wp-config.php
        wp config create \
            --dbname="$WORDPRESS_DB_NAME" \
            --dbuser="$WORDPRESS_DB_USER" \
            --dbpass="$WORDPRESS_DB_PASSWORD" \
            --dbhost="$WORDPRESS_DB_HOST" \
            --allow-root
        
        # Install WordPress
        wp core install \
            --url="http://localhost:8080" \
            --title="PMP Certification Journey" \
            --admin_user="admin" \
            --admin_password="admin123" \
            --admin_email="admin@pmp-journey.local" \
            --allow-root
        
        echo "WordPress installed successfully!"
    else
        echo "WordPress is already installed."
    fi
}

# Function to setup PMP theme and plugins
setup_pmp_environment() {
    echo "Setting up PMP environment..."
    
    # Install and activate Understrap parent theme
    if ! wp theme is-installed understrap --allow-root; then
        wp theme install understrap --activate --allow-root
        echo "Understrap parent theme installed and activated."
    fi
    
    # Activate child theme if it exists
    if wp theme is-installed understrap-child --allow-root; then
        wp theme activate understrap-child --allow-root
        echo "Understrap child theme activated."
    fi
    
    # Install useful plugins
    plugins=(
        "classic-editor"
        "custom-post-type-ui"
        "advanced-custom-fields"
        "wp-super-cache"
        "contact-form-7"
        "yoast-seo"
    )
    
    for plugin in "${plugins[@]}"; do
        if ! wp plugin is-installed "$plugin" --allow-root; then
            wp plugin install "$plugin" --activate --allow-root
            echo "Plugin $plugin installed and activated."
        fi
    done
    
    # Set up permalinks
    wp rewrite structure '/%postname%/' --allow-root
    wp rewrite flush --allow-root
    
    # Create sample content
    create_sample_content
    
    echo "PMP environment setup complete!"
}

# Function to create sample content
create_sample_content() {
    echo "Creating sample PMP content..."
    
    # Create sample pages
    if ! wp post exists --post_type=page --post_title="Dashboard" --allow-root; then
        wp post create --post_type=page --post_title="Dashboard" --post_content="<h1>PMP Learning Dashboard</h1><p>Welcome to your personalized PMP certification journey dashboard.</p>" --post_status=publish --allow-root
    fi
    
    if ! wp post exists --post_type=page --post_title="Resources" --allow-root; then
        wp post create --post_type=page --post_title="Resources" --post_content="<h1>PMP Study Resources</h1><p>Access all your PMP study materials, practice tests, and reference documents.</p>" --post_status=publish --allow-root
    fi
    
    # Create sample courses
    if ! wp post exists --post_type=course --post_title="13-Week PMP Certification Journey" --allow-root; then
        wp post create \
            --post_type=course \
            --post_title="13-Week PMP Certification Journey" \
            --post_content="<p>Complete PMP certification preparation course covering all ECO domains over 13 structured weeks.</p>" \
            --post_excerpt="Comprehensive PMP exam preparation" \
            --post_status=publish \
            --allow-root
    fi
    
    # Create sample lessons
    if ! wp post exists --post_type=lesson --post_title="Week 1: PMP Journey Overview" --allow-root; then
        wp post create \
            --post_type=lesson \
            --post_title="Week 1: PMP Journey Overview" \
            --post_content="<h2>Welcome to Your PMP Certification Journey</h2><p>This lesson introduces you to the PMP certification process and sets expectations for your 13-week journey.</p>" \
            --post_status=publish \
            --allow-root
    fi
    
    if ! wp post exists --post_type=lesson --post_title="Week 2: People Domain Fundamentals" --allow-root; then
        wp post create \
            --post_type=lesson \
            --post_title="Week 2: People Domain Fundamentals" \
            --post_content="<h2>People Domain Overview</h2><p>Learn about team leadership, conflict management, and stakeholder engagement in the People domain.</p>" \
            --post_status=publish \
            --allow-root
    fi
    
    # Create sample resources
    if ! wp post exists --post_type=resource --post_title="PMP Exam Reference Guide" --allow-root; then
        wp post create \
            --post_type=resource \
            --post_title="PMP Exam Reference Guide" \
            --post_content="<p>Comprehensive reference guide covering all PMP exam topics and ECO tasks.</p>" \
            --post_status=publish \
            --allow-root
    fi
    
    echo "Sample content created successfully!"
}

# Function to set proper permissions
set_permissions() {
    echo "Setting file permissions..."
    chown -R www-data:www-data /var/www/html
    find /var/www/html -type d -exec chmod 755 {} \;
    find /var/www/html -type f -exec chmod 644 {} \;
    echo "Permissions set successfully!"
}

# Main execution
main() {
    echo "Starting PMP WordPress setup..."
    
    # Wait for database to be ready
    wait_for_db
    
    # Install WordPress if needed
    install_wordpress
    
    # Setup PMP environment
    setup_pmp_environment
    
    # Set proper permissions
    set_permissions
    
    echo "PMP WordPress setup complete!"
    echo "Access your site at: http://localhost:8080"
    echo "Admin login: admin / admin123"
    echo "phpMyAdmin: http://localhost:8081"
    echo "Mailhog: http://localhost:8025"
    echo "Browser testing: http://localhost:8080/wp-content/themes/understrap-child/tests/browser-testing.html"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

# Execute the original WordPress entrypoint
exec docker-entrypoint.sh "$@"