-- Initialize databases for WordPress and Analytics integration
-- This script runs when the MySQL container starts for the first time

-- Create analytics database for integration with existing system
CREATE DATABASE IF NOT EXISTS pmp_analytics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create analytics user with appropriate permissions
CREATE USER IF NOT EXISTS 'analytics'@'%' IDENTIFIED BY 'analytics_password';
GRANT ALL PRIVILEGES ON pmp_analytics.* TO 'analytics'@'%';

-- Grant WordPress user access to analytics database for integration queries
GRANT SELECT, INSERT, UPDATE ON pmp_analytics.* TO 'wordpress'@'%';

-- Create integration tables in analytics database
USE pmp_analytics;

-- Users table for unified user management
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    wordpress_id BIGINT UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    registration_date DATETIME,
    last_login DATETIME,
    user_type ENUM('prospect', 'lead', 'customer', 'subscriber') DEFAULT 'prospect',
    lifetime_value DECIMAL(10,2) DEFAULT 0.00,
    utm_attribution JSON,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_wordpress_id (wordpress_id),
    INDEX idx_user_type (user_type),
    INDEX idx_registration_date (registration_date)
);

-- Events table for tracking all user interactions
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(255) PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    platform VARCHAR(50) DEFAULT 'wordpress',
    source VARCHAR(100),
    page_url TEXT,
    referrer TEXT,
    utm_parameters JSON,
    event_data JSON,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_event_type (event_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_platform (platform),
    INDEX idx_processed (processed),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Purchases table for e-commerce tracking
CREATE TABLE IF NOT EXISTS purchases (
    id VARCHAR(255) PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    wordpress_order_id BIGINT,
    product_id VARCHAR(100),
    product_name VARCHAR(255),
    product_type ENUM('course', 'guide', 'membership', 'other') DEFAULT 'course',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    utm_attribution JSON,
    billing_data JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_product_type (product_type),
    INDEX idx_payment_status (payment_status),
    INDEX idx_wordpress_order_id (wordpress_order_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User journeys table for conversion funnel tracking
CREATE TABLE IF NOT EXISTS user_journeys (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    stage VARCHAR(50) NOT NULL,
    touchpoint VARCHAR(100) NOT NULL,
    timestamp DATETIME NOT NULL,
    source VARCHAR(100),
    medium VARCHAR(100),
    campaign VARCHAR(100),
    page_url TEXT,
    action_taken VARCHAR(100),
    value_generated DECIMAL(10,2) DEFAULT 0.00,
    time_spent INTEGER DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_stage (stage),
    INDEX idx_timestamp (timestamp),
    INDEX idx_touchpoint (touchpoint),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(100) NOT NULL,
    course_name VARCHAR(255),
    enrollment_type ENUM('free', 'paid', 'trial') DEFAULT 'free',
    enrollment_date DATETIME NOT NULL,
    completion_date DATETIME,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed DATETIME,
    status ENUM('active', 'completed', 'cancelled', 'expired') DEFAULT 'active',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_enrollment_date (enrollment_date),
    INDEX idx_status (status),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_course (user_id, course_id)
);

-- Website analytics table
CREATE TABLE IF NOT EXISTS website_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    page_url VARCHAR(500),
    page_views INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_time_on_page INT DEFAULT 0,
    conversions INT DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    traffic_source VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_date (date),
    INDEX idx_page_url (page_url),
    INDEX idx_traffic_source (traffic_source),
    UNIQUE KEY unique_daily_page_source (date, page_url, traffic_source)
);

-- Integration sync status table
CREATE TABLE IF NOT EXISTS integration_sync_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL,
    last_sync_timestamp DATETIME,
    last_sync_id VARCHAR(255),
    records_processed INT DEFAULT 0,
    errors_count INT DEFAULT 0,
    status ENUM('success', 'partial', 'failed') DEFAULT 'success',
    error_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_sync_type (sync_type),
    INDEX idx_last_sync (last_sync_timestamp),
    UNIQUE KEY unique_sync_type (sync_type)
);

-- Insert initial sync status records
INSERT INTO integration_sync_status (sync_type, last_sync_timestamp) VALUES
('wordpress_users', '2024-01-01 00:00:00'),
('wordpress_orders', '2024-01-01 00:00:00'),
('wordpress_analytics', '2024-01-01 00:00:00'),
('youtube_analytics', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE sync_type = sync_type;

-- Flush privileges to ensure all permissions are applied
FLUSH PRIVILEGES;