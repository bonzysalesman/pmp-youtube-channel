-- Migrate existing SQLite data structure to MySQL for integration
-- This script creates MySQL equivalents of the existing SQLite tables

USE pmp_analytics;

-- Migrate existing projects table structure
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_name (name)
);

-- Migrate existing tasks table structure
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    week_number INT,
    day_number INT,
    task_type VARCHAR(50), -- 'video', 'chunk', 'practice', 'review'
    eco_tasks JSON, -- JSON array of ECO task references
    due_date DATE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_status (status),
    INDEX idx_week_day (week_number, day_number),
    INDEX idx_task_type (task_type),
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Migrate existing content_chunks table structure
CREATE TABLE IF NOT EXISTS content_chunks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chunk_name VARCHAR(255) NOT NULL UNIQUE,
    week_number INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    domain VARCHAR(50) NOT NULL, -- 'People', 'Process', 'Business Environment'
    eco_tasks JSON, -- JSON array of ECO tasks covered
    estimated_read_time INT DEFAULT 0, -- in minutes
    difficulty_rating DECIMAL(3,2) DEFAULT 3.00, -- 1-5 scale
    word_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'review', 'published'
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_week_number (week_number),
    INDEX idx_domain (domain),
    INDEX idx_status (status),
    INDEX idx_chunk_name (chunk_name)
);

-- Migrate existing videos table structure
CREATE TABLE IF NOT EXISTS videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(255) UNIQUE, -- YouTube video ID when published
    week_number INT NOT NULL,
    day_number INT,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    duration_minutes INT DEFAULT 0,
    video_type VARCHAR(50), -- 'daily-study', 'practice', 'review', 'intro'
    primary_chunk VARCHAR(255), -- Reference to main content chunk
    eco_tasks JSON, -- JSON array of ECO tasks covered
    script_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'draft', 'review', 'final'
    production_status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'recording', 'editing', 'published'
    thumbnail_status VARCHAR(50) DEFAULT 'pending',
    scheduled_date DATE,
    published_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_video_id (video_id),
    INDEX idx_week_day (week_number, day_number),
    INDEX idx_video_type (video_type),
    INDEX idx_production_status (production_status)
);

-- Migrate existing video_analytics table structure
CREATE TABLE IF NOT EXISTS video_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(255) NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    watch_time_minutes INT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    click_through_rate DECIMAL(5,2) DEFAULT 0.00,
    recorded_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_video_id (video_id),
    INDEX idx_recorded_date (recorded_date),
    
    FOREIGN KEY (video_id) REFERENCES videos(video_id) ON DELETE CASCADE
);

-- Migrate existing learning_progress table structure
CREATE TABLE IF NOT EXISTS learning_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    week_number INT NOT NULL,
    chunk_name VARCHAR(255),
    video_id VARCHAR(255),
    progress_type VARCHAR(50) NOT NULL, -- 'chunk_read', 'video_watched', 'practice_completed'
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_spent_minutes INT DEFAULT 0,
    practice_score DECIMAL(5,2),
    notes TEXT,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_week_number (week_number),
    INDEX idx_progress_type (progress_type),
    
    UNIQUE KEY unique_user_content_progress (user_id, chunk_name, video_id, progress_type)
);

-- Migrate existing user_feedback table structure
CREATE TABLE IF NOT EXISTS user_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'chunk', 'video', 'week', 'overall'
    content_id VARCHAR(255) NOT NULL, -- chunk_name, video_id, week_number, etc.
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    difficulty_rating INT CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    usefulness_rating INT CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
    improvement_suggestions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_content_type_id (content_type, content_id),
    INDEX idx_rating (rating)
);

-- Migrate existing eco_task_coverage table structure
CREATE TABLE IF NOT EXISTS eco_task_coverage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    eco_task_id VARCHAR(10) NOT NULL, -- e.g., '1.1', '2.16', '3.4'
    eco_task_name VARCHAR(500) NOT NULL,
    domain VARCHAR(50) NOT NULL, -- 'People', 'Process', 'Business Environment'
    primary_chunk VARCHAR(255),
    supporting_chunks JSON, -- JSON array
    video_references JSON, -- JSON array
    coverage_depth VARCHAR(20) DEFAULT 'comprehensive', -- 'basic', 'intermediate', 'comprehensive'
    practice_questions INT DEFAULT 0,
    real_world_examples INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_eco_task_id (eco_task_id),
    INDEX idx_domain (domain),
    
    UNIQUE KEY unique_eco_task (eco_task_id)
);

-- Migrate existing content_cross_references table structure
CREATE TABLE IF NOT EXISTS content_cross_references (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL, -- 'chunk', 'video'
    source_id VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'chunk', 'video', 'eco_task'
    target_id VARCHAR(255) NOT NULL,
    reference_type VARCHAR(50) NOT NULL, -- 'prerequisite', 'related', 'follow_up', 'practice'
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_source (source_type, source_id),
    INDEX idx_target (target_type, target_id),
    INDEX idx_reference_type (reference_type),
    
    UNIQUE KEY unique_cross_reference (source_type, source_id, target_type, target_id, reference_type)
);

-- Migrate existing community_engagement table structure
CREATE TABLE IF NOT EXISTS community_engagement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(50) NOT NULL, -- 'youtube', 'discord', 'linkedin', 'website'
    engagement_type VARCHAR(50) NOT NULL, -- 'comment', 'question', 'success_story', 'feedback'
    content_reference VARCHAR(255), -- video_id, chunk_name, week_number
    user_identifier VARCHAR(255),
    message TEXT,
    sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
    response_required BOOLEAN DEFAULT FALSE,
    responded_at TIMESTAMP NULL,
    response_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_platform (platform),
    INDEX idx_engagement_type (engagement_type),
    INDEX idx_response_required (response_required),
    INDEX idx_created_at (created_at)
);

-- Migrate existing study_cohorts table structure
CREATE TABLE IF NOT EXISTS study_cohorts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cohort_name VARCHAR(255) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE,
    target_exam_date DATE,
    member_count INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active', -- 'planning', 'active', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_cohort_name (cohort_name),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
);

-- Migrate existing cohort_members table structure
CREATE TABLE IF NOT EXISTS cohort_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cohort_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    join_date DATE DEFAULT (CURRENT_DATE),
    current_week INT DEFAULT 1,
    overall_progress DECIMAL(5,2) DEFAULT 0.00,
    exam_date DATE,
    exam_result VARCHAR(20), -- 'passed', 'failed', 'scheduled', 'not_taken'
    certification_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_cohort_id (cohort_id),
    INDEX idx_user_id (user_id),
    INDEX idx_join_date (join_date),
    
    FOREIGN KEY (cohort_id) REFERENCES study_cohorts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cohort_user (cohort_id, user_id)
);

-- Migrate existing content_metrics table structure
CREATE TABLE IF NOT EXISTS content_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    metric_date DATE DEFAULT (CURRENT_DATE),
    total_chunks INT DEFAULT 0,
    total_videos INT DEFAULT 0,
    total_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_engagement DECIMAL(5,2) DEFAULT 0.00,
    total_study_hours INT DEFAULT 0,
    certification_success_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_metric_date (metric_date),
    UNIQUE KEY unique_daily_metrics (metric_date)
);

-- Insert initial project data
INSERT INTO projects (name, description) VALUES 
('PMP YouTube Channel', '13-Week PMP Certification Journey - Complete content creation and management project')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert ECO task coverage data
INSERT INTO eco_task_coverage (eco_task_id, eco_task_name, domain, primary_chunk) VALUES
-- People Domain (42%)
('1.1', 'Manage Conflict', 'People', 'chunk-02-conflict.md'),
('1.2', 'Lead A Team', 'People', 'chunk-04-leadership.md'),
('1.3', 'Support Team Performance', 'People', 'chunk-03-team-performance.md'),
('1.4', 'Empower Team Members & Stakeholders', 'People', 'chunk-02-empowerment.md'),
('1.5', 'Ensure Team Members & Stakeholders are Adequately Trained', 'People', 'chunk-03-training.md'),
('1.6', 'Build A Team', 'People', 'chunk-02-team-basics.md'),
('1.7', 'Address & Remove Impediments, Obstacles, & Blockers for the Team', 'People', 'chunk-04-impediments.md'),
('1.8', 'Negotiate Project Agreements', 'People', 'chunk-02-negotiation.md'),
('1.9', 'Collaborate with Stakeholders', 'People', 'chunk-04-collaboration.md'),
('1.10', 'Build Shared Understanding', 'People', 'chunk-04-collaboration.md'),
('1.11', 'Engage and Support Virtual Teams', 'People', 'chunk-03-virtual-teams.md'),
('1.12', 'Define Team Ground Rules', 'People', 'chunk-02-team-basics.md'),
('1.13', 'Mentor Relevant Stakeholders', 'People', 'chunk-03-mentoring.md'),
('1.14', 'Promote Team Performance through the Application of Emotional Intelligence', 'People', 'chunk-03-team-performance.md'),

-- Process Domain (50%)
('2.1', 'Execute Projects with Urgency for Business Value', 'Process', 'chunk-09-execution.md'),
('2.2', 'Manage Communications', 'Process', 'chunk-07-communications.md'),
('2.3', 'Assess and Manage Risks', 'Process', 'chunk-07-risk.md'),
('2.4', 'Engage Stakeholders', 'Process', 'chunk-08-stakeholders.md'),
('2.5', 'Plan and Manage Budget and Resources', 'Process', 'chunk-06-resources.md'),
('2.6', 'Plan and Manage Schedule', 'Process', 'chunk-06-schedule.md'),
('2.7', 'Plan and Manage Quality', 'Process', 'chunk-07-quality.md'),
('2.8', 'Plan and Manage Scope', 'Process', 'chunk-06-scope.md'),
('2.9', 'Integrate Project Planning Activities', 'Process', 'chunk-05-integration.md'),
('2.10', 'Manage Project Changes', 'Process', 'chunk-09-changes.md'),
('2.11', 'Plan and Manage Procurement', 'Process', 'chunk-08-procurement.md'),
('2.12', 'Manage Project Artefacts', 'Process', 'chunk-08-artifacts.md'),
('2.13', 'Determine Appropriate Methodology', 'Process', 'chunk-05-methodology.md'),
('2.14', 'Establish Project Governance Structure', 'Process', 'chunk-05-governance.md'),
('2.15', 'Manage Project Issues', 'Process', 'chunk-10-issues.md'),
('2.16', 'Ensure Knowledge Transfer for Project Continuity', 'Process', 'chunk-10-knowledge.md'),
('2.17', 'Plan and Manage Project/Phase Closure or Transitions', 'Process', 'chunk-11-closure.md'),

-- Business Environment Domain (8%)
('3.1', 'Plan and Manage Project Compliance', 'Business Environment', 'chunk-10-compliance.md'),
('3.2', 'Evaluate and Deliver Project Benefits and Value', 'Business Environment', 'chunk-09-value.md'),
('3.3', 'Evaluate External Business Environment Changes', 'Business Environment', 'chunk-11-business-env.md'),
('3.4', 'Support Organisational Change', 'Business Environment', 'chunk-11-org-change.md')
ON DUPLICATE KEY UPDATE 
    eco_task_name = VALUES(eco_task_name),
    domain = VALUES(domain),
    primary_chunk = VALUES(primary_chunk);