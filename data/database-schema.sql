-- PMP YouTube Channel Content Management Database Schema
-- SQLite database for tracking content, progress, and analytics

-- Projects table for task management
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table for content production tracking
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    week_number INTEGER,
    day_number INTEGER,
    task_type TEXT, -- 'video', 'chunk', 'practice', 'review'
    eco_tasks TEXT, -- JSON array of ECO task references
    due_date DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Content chunks tracking
CREATE TABLE IF NOT EXISTS content_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chunk_name TEXT NOT NULL UNIQUE,
    week_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    domain TEXT NOT NULL, -- 'People', 'Process', 'Business Environment'
    eco_tasks TEXT, -- JSON array of ECO tasks covered
    estimated_read_time INTEGER, -- in minutes
    difficulty_rating REAL DEFAULT 3.0, -- 1-5 scale
    word_count INTEGER,
    status TEXT DEFAULT 'draft', -- 'draft', 'review', 'published'
    file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video content tracking
CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT UNIQUE, -- YouTube video ID when published
    week_number INTEGER NOT NULL,
    day_number INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    video_type TEXT, -- 'daily-study', 'practice', 'review', 'intro'
    primary_chunk TEXT, -- Reference to main content chunk
    eco_tasks TEXT, -- JSON array of ECO tasks covered
    script_status TEXT DEFAULT 'pending', -- 'pending', 'draft', 'review', 'final'
    production_status TEXT DEFAULT 'planning', -- 'planning', 'recording', 'editing', 'published'
    thumbnail_status TEXT DEFAULT 'pending',
    scheduled_date DATE,
    published_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video performance analytics
CREATE TABLE IF NOT EXISTS video_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    watch_time_minutes INTEGER DEFAULT 0,
    engagement_rate REAL DEFAULT 0.0,
    completion_rate REAL DEFAULT 0.0,
    click_through_rate REAL DEFAULT 0.0,
    recorded_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (video_id) REFERENCES videos(video_id)
);

-- User learning progress tracking
CREATE TABLE IF NOT EXISTS learning_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    user_email TEXT,
    week_number INTEGER NOT NULL,
    chunk_name TEXT,
    video_id TEXT,
    progress_type TEXT NOT NULL, -- 'chunk_read', 'video_watched', 'practice_completed'
    completion_percentage REAL DEFAULT 0.0,
    time_spent_minutes INTEGER DEFAULT 0,
    practice_score REAL,
    notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, chunk_name, video_id, progress_type)
);

-- User feedback and ratings
CREATE TABLE IF NOT EXISTS user_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'chunk', 'video', 'week', 'overall'
    content_id TEXT NOT NULL, -- chunk_name, video_id, week_number, etc.
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
    improvement_suggestions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ECO task coverage tracking
CREATE TABLE IF NOT EXISTS eco_task_coverage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eco_task_id TEXT NOT NULL, -- e.g., '1.1', '2.16', '3.4'
    eco_task_name TEXT NOT NULL,
    domain TEXT NOT NULL, -- 'People', 'Process', 'Business Environment'
    primary_chunk TEXT,
    supporting_chunks TEXT, -- JSON array
    video_references TEXT, -- JSON array
    coverage_depth TEXT DEFAULT 'comprehensive', -- 'basic', 'intermediate', 'comprehensive'
    practice_questions INTEGER DEFAULT 0,
    real_world_examples INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(eco_task_id)
);

-- Content cross-references
CREATE TABLE IF NOT EXISTS content_cross_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL, -- 'chunk', 'video'
    source_id TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'chunk', 'video', 'eco_task'
    target_id TEXT NOT NULL,
    reference_type TEXT NOT NULL, -- 'prerequisite', 'related', 'follow_up', 'practice'
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_type, source_id, target_type, target_id, reference_type)
);

-- Community engagement tracking
CREATE TABLE IF NOT EXISTS community_engagement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL, -- 'youtube', 'discord', 'linkedin', 'website'
    engagement_type TEXT NOT NULL, -- 'comment', 'question', 'success_story', 'feedback'
    content_reference TEXT, -- video_id, chunk_name, week_number
    user_identifier TEXT,
    message TEXT,
    sentiment TEXT, -- 'positive', 'neutral', 'negative'
    response_required BOOLEAN DEFAULT FALSE,
    responded_at TIMESTAMP,
    response_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Study group and cohort tracking
CREATE TABLE IF NOT EXISTS study_cohorts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cohort_name TEXT NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE,
    target_exam_date DATE,
    member_count INTEGER DEFAULT 0,
    completion_rate REAL DEFAULT 0.0,
    average_score REAL DEFAULT 0.0,
    status TEXT DEFAULT 'active', -- 'planning', 'active', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cohort member progress
CREATE TABLE IF NOT EXISTS cohort_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cohort_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    user_email TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    current_week INTEGER DEFAULT 1,
    overall_progress REAL DEFAULT 0.0,
    exam_date DATE,
    exam_result TEXT, -- 'passed', 'failed', 'scheduled', 'not_taken'
    certification_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cohort_id) REFERENCES study_cohorts(id),
    UNIQUE(cohort_id, user_id)
);

-- Content performance metrics
CREATE TABLE IF NOT EXISTS content_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date DATE DEFAULT CURRENT_DATE,
    total_chunks INTEGER DEFAULT 0,
    total_videos INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    completion_rate REAL DEFAULT 0.0,
    average_engagement REAL DEFAULT 0.0,
    total_study_hours INTEGER DEFAULT 0,
    certification_success_rate REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_tasks_week_day ON tasks(week_number, day_number);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_chunks_week ON content_chunks(week_number);
CREATE INDEX IF NOT EXISTS idx_videos_week_day ON videos(week_number, day_number);
CREATE INDEX IF NOT EXISTS idx_progress_user_week ON learning_progress(user_id, week_number);
CREATE INDEX IF NOT EXISTS idx_feedback_content ON user_feedback(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_eco_task_domain ON eco_task_coverage(domain);
CREATE INDEX IF NOT EXISTS idx_engagement_platform ON community_engagement(platform);
CREATE INDEX IF NOT EXISTS idx_cohort_members_user ON cohort_members(user_id);

-- Insert initial project
INSERT OR IGNORE INTO projects (name, description) VALUES 
('PMP YouTube Channel', '13-Week PMP Certification Journey - Complete content creation and management project');

-- Insert ECO task coverage data
INSERT OR IGNORE INTO eco_task_coverage (eco_task_id, eco_task_name, domain, primary_chunk) VALUES
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
('3.4', 'Support Organisational Change', 'Business Environment', 'chunk-11-org-change.md');