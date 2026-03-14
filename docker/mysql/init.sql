-- Initialize PMP WordPress Database
-- This script runs when the MySQL container starts for the first time

-- Create additional database for testing if needed
CREATE DATABASE IF NOT EXISTS pmp_wordpress_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON pmp_wordpress.* TO 'pmp_user'@'%';
GRANT ALL PRIVILEGES ON pmp_wordpress_test.* TO 'pmp_user'@'%';

-- Create custom tables for PMP functionality
USE pmp_wordpress;

-- Progress tracking table
CREATE TABLE IF NOT EXISTS wp_pmp_progress (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    user_id bigint(20) NOT NULL,
    lesson_id bigint(20) NOT NULL,
    progress_percentage decimal(5,2) DEFAULT 0.00,
    time_spent int(11) DEFAULT 0,
    completed_at datetime DEFAULT NULL,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY user_lesson (user_id, lesson_id),
    KEY user_id (user_id),
    KEY lesson_id (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics table
CREATE TABLE IF NOT EXISTS wp_pmp_analytics (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    event_type varchar(50) NOT NULL,
    event_data longtext,
    user_id bigint(20),
    post_id bigint(20),
    session_id varchar(100),
    ip_address varchar(45),
    user_agent text,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY event_type (event_type),
    KEY user_id (user_id),
    KEY post_id (post_id),
    KEY created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course structure table
CREATE TABLE IF NOT EXISTS wp_pmp_course_structure (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    week_number tinyint(2) NOT NULL,
    day_number tinyint(1) NOT NULL,
    lesson_title varchar(255) NOT NULL,
    lesson_type enum('intro', 'daily', 'practice', 'review') DEFAULT 'daily',
    eco_tasks text,
    duration_minutes smallint(3) DEFAULT 20,
    difficulty_level tinyint(1) DEFAULT 2,
    is_published boolean DEFAULT false,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY week_day (week_number, day_number),
    KEY lesson_type (lesson_type),
    KEY is_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample course structure data
INSERT IGNORE INTO wp_pmp_course_structure (week_number, day_number, lesson_title, lesson_type, eco_tasks, duration_minutes, difficulty_level, is_published) VALUES
(1, 1, 'PMP Certification Journey Overview', 'intro', '1.1,2.1,3.1', 25, 1, true),
(1, 2, 'Project Management Fundamentals', 'daily', '1.2,2.2', 20, 1, true),
(1, 3, 'PMP Exam Structure and Strategy', 'daily', '1.3,2.3', 20, 1, true),
(1, 4, 'Study Planning and Time Management', 'daily', '1.4', 15, 1, true),
(1, 5, 'Introduction to ECO Domains', 'daily', '1.1,2.1,3.1', 20, 2, true),
(1, 6, 'Week 1 Practice Questions', 'practice', '1.1,1.2,1.3,1.4', 25, 2, true),
(1, 7, 'Week 1 Review and Assessment', 'review', '1.1,1.2,1.3,1.4', 20, 1, true),

(2, 1, 'People Domain Introduction', 'intro', '1.1,1.2,1.6', 25, 2, true),
(2, 2, 'Team Building Fundamentals', 'daily', '1.6,1.12', 20, 2, true),
(2, 3, 'Conflict Management Strategies', 'daily', '1.1', 20, 2, true),
(2, 4, 'Negotiation and Empowerment', 'daily', '1.8,1.4', 20, 2, true),
(2, 5, 'Communication and Collaboration', 'daily', '1.9,1.10', 20, 2, true),
(2, 6, 'People Domain Practice', 'practice', '1.1,1.4,1.6,1.8,1.9', 25, 3, true),
(2, 7, 'People Domain Review', 'review', '1.1,1.4,1.6,1.8,1.9,1.10,1.12', 20, 2, true);

-- User preferences table
CREATE TABLE IF NOT EXISTS wp_pmp_user_preferences (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    user_id bigint(20) NOT NULL,
    preference_key varchar(100) NOT NULL,
    preference_value longtext,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY user_preference (user_id, preference_key),
    KEY user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

FLUSH PRIVILEGES;