<?php
/**
 * PMP Dashboard Class
 * 
 * Handles dashboard functionality including progress tracking,
 * next lesson recommendations, and recent activity display.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class PMP_Dashboard {
    
    private $user_id;
    private $course_id;
    
    /**
     * Constructor
     * 
     * @param int $user_id WordPress user ID
     * @param string $course_id Course identifier (default: 'pmp-prep-course')
     */
    public function __construct($user_id, $course_id = 'pmp-prep-course') {
        $this->user_id = $user_id;
        $this->course_id = $course_id;
        
        // Initialize AJAX handlers
        $this->init_ajax_handlers();
    }
    
    /**
     * Initialize AJAX handlers for progress tracking
     */
    private function init_ajax_handlers() {
        add_action('wp_ajax_get_user_progress', [$this, 'ajax_get_user_progress']);
        add_action('wp_ajax_track_user_event', [$this, 'ajax_track_user_event']);
        add_action('wp_ajax_update_lesson_progress', [$this, 'ajax_update_lesson_progress']);
        add_action('wp_ajax_get_detailed_progress', [$this, 'ajax_get_detailed_progress']);
        add_action('wp_ajax_set_current_lesson', [$this, 'ajax_set_current_lesson']);
        add_action('wp_ajax_mark_lesson_complete', [$this, 'ajax_mark_lesson_complete']);
        add_action('wp_ajax_get_current_lesson', [$this, 'ajax_get_current_lesson']);
    }
    
    /**
     * Render complete dashboard HTML
     * 
     * @return string Dashboard HTML content
     */
    public function render_dashboard(): string {
        $progress_stats = $this->get_progress_stats();
        $next_lesson = $this->get_next_lesson();
        $recent_activity = $this->get_recent_activity();
        
        ob_start();
        ?>
        <div class="pmp-dashboard">
            <div class="dashboard-progress">
                <?php echo $this->render_progress_circle($progress_stats['percentage']); ?>
            </div>
            <div class="dashboard-next-lesson">
                <?php echo $this->render_next_lesson_card($next_lesson); ?>
            </div>
            <div class="dashboard-activity">
                <?php echo $this->render_recent_activity($recent_activity); ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Get user progress statistics
     * 
     * @return array Progress data including percentage, completed count, etc.
     */
    public function get_progress_stats(): array {
        // Get user progress from database
        $user_progress = get_user_meta($this->user_id, 'pmp_course_progress', true);
        
        if (empty($user_progress)) {
            // Initialize default progress
            $user_progress = [
                'percentage' => 0,
                'completed' => 0,
                'total' => 91,
                'current_week' => 1,
                'lessons_completed' => [],
                'time_spent' => 0,
                'last_activity' => current_time('mysql')
            ];
            update_user_meta($this->user_id, 'pmp_course_progress', $user_progress);
        }
        
        // Calculate current week based on progress
        $current_week = min(13, max(1, ceil($user_progress['completed'] / 7)));
        $user_progress['current_week'] = $current_week;
        
        return $user_progress;
    }
    
    /**
     * Get current lesson (lesson user is actively working on)
     * 
     * @return object|null Current lesson data or null if none
     */
    public function get_current_lesson(): ?object {
        $current_lesson_id = get_user_meta($this->user_id, 'pmp_current_lesson', true);
        
        if (empty($current_lesson_id)) {
            // If no current lesson set, use the next lesson as current
            $next_lesson = $this->get_next_lesson();
            if ($next_lesson && $next_lesson->id !== 'completed') {
                $this->set_current_lesson($next_lesson->id);
                return $next_lesson;
            }
            return null;
        }
        
        // Get lesson data for current lesson
        $lesson = $this->get_lesson_by_id($current_lesson_id);
        if (!$lesson) {
            return null;
        }
        
        $progress = $this->get_progress_stats();
        $completed_lessons = $progress['lessons_completed'] ?? [];
        
        return (object) [
            'id' => $lesson['id'],
            'title' => $lesson['title'],
            'description' => $lesson['description'],
            'thumbnail' => $lesson['thumbnail'] ?? $this->get_default_thumbnail(),
            'duration' => $lesson['duration'] ?? '20 minutes',
            'url' => $lesson['url'] ?? home_url('/lesson/' . $lesson['id'] . '/'),
            'week' => $lesson['week'] ?? 1,
            'module' => $lesson['module'] ?? 'Introduction',
            'difficulty' => $lesson['difficulty'] ?? 'Beginner',
            'eco_tasks' => $lesson['eco_tasks'] ?? [],
            'prerequisites' => $lesson['prerequisites'] ?? [],
            'estimated_time' => $lesson['estimated_time'] ?? 20,
            'completion_rate' => $this->get_lesson_completion_rate($lesson['id']),
            'is_current' => true,
            'is_completed' => in_array($lesson['id'], $completed_lessons),
            'progress_percentage' => $this->get_lesson_progress_percentage($lesson['id']),
            'last_accessed' => get_user_meta($this->user_id, 'pmp_lesson_last_accessed_' . $lesson['id'], true),
            'time_spent' => get_user_meta($this->user_id, 'pmp_lesson_time_spent_' . $lesson['id'], true) ?: 0
        ];
    }
    
    /**
     * Set current lesson for user
     * 
     * @param string $lesson_id Lesson identifier
     */
    public function set_current_lesson($lesson_id): void {
        update_user_meta($this->user_id, 'pmp_current_lesson', $lesson_id);
        update_user_meta($this->user_id, 'pmp_lesson_last_accessed_' . $lesson_id, current_time('mysql'));
        
        // Log activity
        $lesson = $this->get_lesson_by_id($lesson_id);
        if ($lesson) {
            $this->log_activity('Started: ' . $lesson['title'], 'started', ['lesson_id' => $lesson_id]);
        }
    }
    
    /**
     * Get lesson progress percentage for a specific lesson
     * 
     * @param string $lesson_id Lesson identifier
     * @return float Progress percentage (0-100)
     */
    private function get_lesson_progress_percentage($lesson_id): float {
        if (class_exists('PMP_Progress_Tracker')) {
            $progress_tracker = new PMP_Progress_Tracker($this->user_id);
            $progress_data = $progress_tracker->get_user_progress_data();
            
            if (isset($progress_data['lesson_progress'][$lesson_id])) {
                return $progress_data['lesson_progress'][$lesson_id]['completion_percentage'] ?? 0;
            }
        }
        
        // Fallback: check if lesson is in completed lessons
        $progress = $this->get_progress_stats();
        $completed_lessons = $progress['lessons_completed'] ?? [];
        
        return in_array($lesson_id, $completed_lessons) ? 100 : 0;
    }
    
    /**
     * Get next lesson recommendation with intelligent suggestions
     * 
     * @return object Next lesson data with enhanced metadata
     */
    public function get_next_lesson(): object {
        $progress = $this->get_progress_stats();
        $completed_lessons = $progress['lessons_completed'] ?? [];
        
        // Get all course lessons
        $lessons = $this->get_course_lessons();
        
        // Find first incomplete lesson
        foreach ($lessons as $lesson) {
            if (!in_array($lesson['id'], $completed_lessons)) {
                return (object) [
                    'id' => $lesson['id'],
                    'title' => $lesson['title'],
                    'description' => $lesson['description'],
                    'thumbnail' => $lesson['thumbnail'] ?? $this->get_default_thumbnail(),
                    'duration' => $lesson['duration'] ?? '20 minutes',
                    'url' => $lesson['url'] ?? home_url('/lesson/' . $lesson['id'] . '/'),
                    'week' => $lesson['week'] ?? 1,
                    'module' => $lesson['module'] ?? 'Introduction',
                    'difficulty' => $lesson['difficulty'] ?? 'Beginner',
                    'eco_tasks' => $lesson['eco_tasks'] ?? [],
                    'prerequisites' => $lesson['prerequisites'] ?? [],
                    'estimated_time' => $lesson['estimated_time'] ?? 20,
                    'completion_rate' => $this->get_lesson_completion_rate($lesson['id']),
                    'is_recommended' => true,
                    'recommendation_reason' => $this->get_recommendation_reason($lesson, $progress)
                ];
            }
        }
        
        // If all lessons completed, return completion message
        return (object) [
            'id' => 'completed',
            'title' => 'Congratulations! 🎉',
            'description' => 'You have completed all lessons in the PMP preparation course. You\'re ready for the exam!',
            'thumbnail' => $this->get_completion_thumbnail(),
            'duration' => '',
            'url' => home_url('/exam-preparation/'),
            'week' => 13,
            'module' => 'Course Complete',
            'difficulty' => 'Expert',
            'eco_tasks' => [],
            'prerequisites' => [],
            'estimated_time' => 0,
            'completion_rate' => 100,
            'is_recommended' => true,
            'recommendation_reason' => 'All course content completed successfully!'
        ];
    }
    
    /**
     * Get lesson completion rate across all users
     * 
     * @param string $lesson_id Lesson identifier
     * @return float Completion rate percentage
     */
    private function get_lesson_completion_rate($lesson_id): float {
        // This would typically query the database for completion statistics
        // For now, return a simulated completion rate
        $completion_rates = [
            'lesson-01-01' => 95.2,
            'lesson-01-02' => 89.7,
            'lesson-02-01' => 87.3,
            'lesson-02-02' => 84.1,
            'lesson-03-01' => 82.5
        ];
        
        return $completion_rates[$lesson_id] ?? 85.0;
    }
    
    /**
     * Get recommendation reason for a lesson
     * 
     * @param array $lesson Lesson data
     * @param array $progress User progress data
     * @return string Recommendation reason
     */
    private function get_recommendation_reason($lesson, $progress): string {
        $reasons = [
            'Next in sequence for Week ' . $lesson['week'],
            'Builds on your previous learning',
            'Essential for ' . $lesson['module'] . ' mastery',
            'High completion rate among students',
            'Key concepts for PMP exam success'
        ];
        
        // Return a contextual reason based on lesson and progress
        if ($lesson['week'] == $progress['current_week']) {
            return 'Continue your current week\'s learning path';
        } elseif ($lesson['week'] == $progress['current_week'] + 1) {
            return 'Ready to advance to the next week';
        }
        
        return $reasons[array_rand($reasons)];
    }
    
    /**
     * Get recent user activity with enhanced details
     * 
     * @param int $limit Number of activities to return
     * @return array Recent activity data with metadata
     */
    public function get_recent_activity($limit = 5): array {
        $activities = get_user_meta($this->user_id, 'pmp_recent_activity', true);
        
        if (empty($activities)) {
            // Return sample activities for new users
            return $this->get_sample_activities();
        }
        
        // Sort by timestamp (most recent first)
        usort($activities, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        // Enhance activities with additional metadata
        $enhanced_activities = [];
        foreach (array_slice($activities, 0, $limit) as $activity) {
            $enhanced_activity = $activity;
            $enhanced_activity['formatted_time'] = $this->format_activity_time($activity['timestamp']);
            $enhanced_activity['icon'] = $this->get_activity_icon($activity['type']);
            $enhanced_activity['color'] = $this->get_activity_color($activity['type']);
            $enhanced_activity['url'] = $this->get_activity_url($activity);
            
            $enhanced_activities[] = $enhanced_activity;
        }
        
        return $enhanced_activities;
    }
    
    /**
     * Get sample activities for new users
     * 
     * @return array Sample activity data
     */
    private function get_sample_activities(): array {
        return [
            [
                'title' => 'Welcome to PMP Prep Course!',
                'type' => 'welcome',
                'timestamp' => current_time('mysql'),
                'formatted_time' => 'Just now',
                'icon' => 'fas fa-star',
                'color' => 'success',
                'url' => home_url('/getting-started/'),
                'meta' => ['action' => 'course_enrollment']
            ],
            [
                'title' => 'Course materials are ready',
                'type' => 'system',
                'timestamp' => date('Y-m-d H:i:s', strtotime('-5 minutes')),
                'formatted_time' => '5 minutes ago',
                'icon' => 'fas fa-book',
                'color' => 'info',
                'url' => home_url('/resources/'),
                'meta' => ['action' => 'materials_ready']
            ]
        ];
    }
    
    /**
     * Format activity timestamp for display
     * 
     * @param string $timestamp MySQL timestamp
     * @return string Formatted time string
     */
    private function format_activity_time($timestamp): string {
        $time_diff = current_time('timestamp') - strtotime($timestamp);
        
        if ($time_diff < 60) {
            return 'Just now';
        } elseif ($time_diff < 3600) {
            $minutes = floor($time_diff / 60);
            return $minutes . ' minute' . ($minutes > 1 ? 's' : '') . ' ago';
        } elseif ($time_diff < 86400) {
            $hours = floor($time_diff / 3600);
            return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
        } elseif ($time_diff < 604800) {
            $days = floor($time_diff / 86400);
            return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
        } else {
            return date('M j, Y', strtotime($timestamp));
        }
    }
    
    /**
     * Get icon for activity type
     * 
     * @param string $type Activity type
     * @return string Font Awesome icon class
     */
    private function get_activity_icon($type): string {
        $icons = [
            'completed' => 'fas fa-check-circle',
            'started' => 'fas fa-play-circle',
            'quiz' => 'fas fa-question-circle',
            'resource' => 'fas fa-download',
            'achievement' => 'fas fa-trophy',
            'welcome' => 'fas fa-star',
            'system' => 'fas fa-info-circle',
            'practice' => 'fas fa-dumbbell',
            'review' => 'fas fa-eye'
        ];
        
        return $icons[$type] ?? 'fas fa-circle';
    }
    
    /**
     * Get color for activity type
     * 
     * @param string $type Activity type
     * @return string Bootstrap color class
     */
    private function get_activity_color($type): string {
        $colors = [
            'completed' => 'success',
            'started' => 'primary',
            'quiz' => 'warning',
            'resource' => 'info',
            'achievement' => 'warning',
            'welcome' => 'success',
            'system' => 'secondary',
            'practice' => 'primary',
            'review' => 'info'
        ];
        
        return $colors[$type] ?? 'secondary';
    }
    
    /**
     * Get URL for activity
     * 
     * @param array $activity Activity data
     * @return string Activity URL
     */
    private function get_activity_url($activity): string {
        if (isset($activity['meta']['lesson_id'])) {
            return home_url('/lesson/' . $activity['meta']['lesson_id'] . '/');
        } elseif (isset($activity['meta']['resource_id'])) {
            return home_url('/resources/#' . $activity['meta']['resource_id']);
        } elseif (isset($activity['url'])) {
            return $activity['url'];
        }
        
        return home_url('/dashboard/');
    }
    
    /**
     * Render circular progress indicator with enhanced SVG
     * 
     * @param float $percentage Progress percentage
     * @return string Enhanced SVG progress circle HTML
     */
    public function render_progress_circle($percentage): string {
        $circumference = 314.16; // 2 * π * 50 (radius)
        $offset = $circumference - ($circumference * $percentage / 100);
        
        ob_start();
        ?>
        <div class="progress-circle-container">
            <svg class="progress-circle" width="120" height="120" viewBox="0 0 120 120">
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#5b28b3;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <radialGradient id="backgroundGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
                    </radialGradient>
                </defs>
                
                <!-- Background circle with subtle gradient -->
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e9ecef" stroke-width="8" opacity="0.3"/>
                
                <!-- Progress circle with gradient and glow -->
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#progressGradient)" stroke-width="8"
                        stroke-linecap="round" stroke-dasharray="<?php echo $circumference; ?>" 
                        stroke-dashoffset="<?php echo $offset; ?>"
                        class="progress-bar-circle" filter="url(#glow)" />
                
                <!-- Progress percentage text -->
                <text x="60" y="62" text-anchor="middle" class="progress-text" 
                      font-size="18" font-weight="bold" fill="#5b28b3">
                    <?php echo number_format($percentage, 1); ?>%
                </text>
                
                <!-- "Complete" label -->
                <text x="60" y="78" text-anchor="middle" class="progress-subtext" 
                      font-size="10" fill="#6b7280" font-weight="500">
                    Complete
                </text>
                
                <!-- Animated dots for visual interest -->
                <?php if ($percentage > 0): ?>
                <circle cx="<?php echo 60 + 50 * cos(deg2rad(-90 + ($percentage * 3.6))); ?>" 
                        cy="<?php echo 60 + 50 * sin(deg2rad(-90 + ($percentage * 3.6))); ?>" 
                        r="3" fill="#5b28b3" opacity="0.8">
                    <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
                </circle>
                <?php endif; ?>
            </svg>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render enhanced progress statistics with animations
     * 
     * @param array $progress Progress data
     * @return string HTML for progress statistics
     */
    public function render_progress_statistics($progress): string {
        ob_start();
        ?>
        <div class="progress-stats">
            <div class="row text-center">
                <div class="col-6">
                    <div class="stat-item">
                        <h6 class="stat-number text-success mb-1" data-target="<?php echo $progress['completed']; ?>">
                            <?php echo $progress['completed']; ?>
                        </h6>
                        <small class="text-muted">Completed</small>
                        <div class="stat-progress-bar">
                            <div class="stat-progress-fill bg-success" 
                                 style="width: <?php echo ($progress['completed'] / $progress['total']) * 100; ?>%"></div>
                        </div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="stat-item">
                        <h6 class="stat-number text-primary mb-1" data-target="<?php echo $progress['total'] - $progress['completed']; ?>">
                            <?php echo $progress['total'] - $progress['completed']; ?>
                        </h6>
                        <small class="text-muted">Remaining</small>
                        <div class="stat-progress-bar">
                            <div class="stat-progress-fill bg-primary" 
                                 style="width: <?php echo (($progress['total'] - $progress['completed']) / $progress['total']) * 100; ?>%"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Additional progress metrics -->
            <div class="row mt-3 text-center">
                <div class="col-12">
                    <div class="progress-metrics">
                        <small class="text-muted d-block mb-1">Weekly Progress</small>
                        <div class="weekly-progress-bar">
                            <?php for ($week = 1; $week <= 13; $week++): ?>
                                <div class="week-indicator <?php echo $week <= $progress['current_week'] ? 'completed' : ''; ?>"
                                     title="Week <?php echo $week; ?>"></div>
                            <?php endfor; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Add activity to user's recent activity log
     * 
     * @param string $title Activity title
     * @param string $type Activity type (completed, started, etc.)
     * @param array $meta Additional metadata
     */
    public function log_activity($title, $type = 'completed', $meta = []): void {
        $activities = get_user_meta($this->user_id, 'pmp_recent_activity', true);
        
        if (!is_array($activities)) {
            $activities = [];
        }
        
        $new_activity = [
            'title' => $title,
            'type' => $type,
            'timestamp' => current_time('mysql'),
            'meta' => $meta
        ];
        
        // Add to beginning of array
        array_unshift($activities, $new_activity);
        
        // Keep only last 20 activities
        $activities = array_slice($activities, 0, 20);
        
        update_user_meta($this->user_id, 'pmp_recent_activity', $activities);
    }
    
    /**
     * Update lesson progress
     * 
     * @param string $lesson_id Lesson identifier
     * @param float $completion_percentage Completion percentage (0-100)
     */
    public function update_lesson_progress($lesson_id, $completion_percentage = 100): void {
        $progress = $this->get_progress_stats();
        
        if ($completion_percentage >= 100 && !in_array($lesson_id, $progress['lessons_completed'])) {
            $progress['lessons_completed'][] = $lesson_id;
            $progress['completed'] = count($progress['lessons_completed']);
            $progress['percentage'] = ($progress['completed'] / $progress['total']) * 100;
            
            // Log completion activity
            $lesson = $this->get_lesson_by_id($lesson_id);
            if ($lesson) {
                $this->log_activity('Completed: ' . $lesson['title'], 'completed', ['lesson_id' => $lesson_id]);
            }
        }
        
        $progress['last_activity'] = current_time('mysql');
        update_user_meta($this->user_id, 'pmp_course_progress', $progress);
    }
    
    /**
     * Get course lessons data
     * 
     * @return array Array of lesson data
     */
    private function get_course_lessons(): array {
        // This would typically come from database or custom post types
        // For now, return sample data structure
        return [
            [
                'id' => 'lesson-01-01',
                'title' => 'PMP Exam Overview',
                'description' => 'Introduction to the PMP certification and exam structure',
                'week' => 1,
                'module' => 'Foundations',
                'duration' => '20 minutes',
                'url' => home_url('/lesson/pmp-exam-overview/'),
                'thumbnail' => get_template_directory_uri() . '/images/lessons/lesson-01-01.jpg'
            ],
            [
                'id' => 'lesson-01-02',
                'title' => 'Project Management Mindset',
                'description' => 'Developing the right mindset for project management success',
                'week' => 1,
                'module' => 'Foundations',
                'duration' => '18 minutes',
                'url' => home_url('/lesson/project-management-mindset/'),
                'thumbnail' => get_template_directory_uri() . '/images/lessons/lesson-01-02.jpg'
            ]
            // Additional lessons would be loaded from database
        ];
    }
    
    /**
     * Get lesson by ID
     * 
     * @param string $lesson_id Lesson identifier
     * @return array|null Lesson data or null if not found
     */
    private function get_lesson_by_id($lesson_id): ?array {
        $lessons = $this->get_course_lessons();
        
        foreach ($lessons as $lesson) {
            if ($lesson['id'] === $lesson_id) {
                return $lesson;
            }
        }
        
        return null;
    }
    
    /**
     * Get default thumbnail URL
     * 
     * @return string Default thumbnail URL
     */
    private function get_default_thumbnail(): string {
        return get_template_directory_uri() . '/images/lesson-placeholder.jpg';
    }
    
    /**
     * Get completion thumbnail URL
     * 
     * @return string Completion thumbnail URL
     */
    private function get_completion_thumbnail(): string {
        return get_template_directory_uri() . '/images/completion-celebration.jpg';
    }
    
    /**
     * Get dashboard summary for quick overview
     * 
     * @return array Dashboard summary data
     */
    public function get_dashboard_summary(): array {
        $progress = $this->get_progress_stats();
        $next_lesson = $this->get_next_lesson();
        
        return [
            'progress_percentage' => $progress['percentage'],
            'lessons_completed' => $progress['completed'],
            'lessons_remaining' => $progress['total'] - $progress['completed'],
            'current_week' => $progress['current_week'],
            'next_lesson_title' => $next_lesson->title,
            'estimated_completion' => $this->calculate_estimated_completion($progress),
            'study_streak' => $this->get_study_streak(),
            'achievements_earned' => $this->get_achievements_count()
        ];
    }
    
    /**
     * Calculate estimated completion date
     * 
     * @param array $progress Progress data
     * @return string Estimated completion date
     */
    private function calculate_estimated_completion($progress): string {
        $remaining_lessons = $progress['total'] - $progress['completed'];
        $avg_lessons_per_week = 7; // Based on course structure
        $weeks_remaining = ceil($remaining_lessons / $avg_lessons_per_week);
        
        $completion_date = date('M j, Y', strtotime("+{$weeks_remaining} weeks"));
        return $completion_date;
    }
    
    /**
     * Get user's current study streak
     * 
     * @return int Study streak in days
     */
    private function get_study_streak(): int {
        $activities = get_user_meta($this->user_id, 'pmp_recent_activity', true);
        if (empty($activities)) {
            return 0;
        }
        
        // Calculate streak based on daily activity
        $streak = 0;
        $current_date = date('Y-m-d');
        
        for ($i = 0; $i < 30; $i++) { // Check last 30 days
            $check_date = date('Y-m-d', strtotime("-{$i} days"));
            $has_activity = false;
            
            foreach ($activities as $activity) {
                if (date('Y-m-d', strtotime($activity['timestamp'])) === $check_date) {
                    $has_activity = true;
                    break;
                }
            }
            
            if ($has_activity) {
                $streak++;
            } else {
                break;
            }
        }
        
        return $streak;
    }
    
    /**
     * Get count of achievements earned
     * 
     * @return int Number of achievements
     */
    private function get_achievements_count(): int {
        $achievements = get_user_meta($this->user_id, 'pmp_achievements', true);
        return is_array($achievements) ? count($achievements) : 0;
    }
    
    /**
     * Get personalized motivational message
     * 
     * @return string Motivational message
     */
    public function get_motivational_message(): string {
        $progress = $this->get_progress_stats();
        $streak = $this->get_study_streak();
        
        if ($progress['percentage'] >= 90) {
            return "You're almost there! Just a few more lessons to complete your PMP journey! 🎯";
        } elseif ($progress['percentage'] >= 75) {
            return "Excellent progress! You're in the final stretch of your PMP preparation! 💪";
        } elseif ($progress['percentage'] >= 50) {
            return "Great work! You're halfway through your PMP certification journey! 🚀";
        } elseif ($progress['percentage'] >= 25) {
            return "You're building momentum! Keep up the consistent learning! 📈";
        } elseif ($streak >= 7) {
            return "Amazing dedication! Your {$streak}-day study streak is impressive! 🔥";
        } else {
            return "Welcome to your PMP journey! Every expert was once a beginner! 🌟";
        }
    }
    
    /**
     * Render current lesson highlighting card
     * 
     * @return string HTML for current lesson card
     */
    public function render_current_lesson_card(): string {
        $current_lesson = $this->get_current_lesson();
        
        if (!$current_lesson) {
            return '<div class="current-lesson-placeholder">
                        <p class="text-muted">No current lesson available</p>
                    </div>';
        }
        
        ob_start();
        ?>
        <div class="current-lesson-card card border-primary" data-lesson-id="<?php echo esc_attr($current_lesson->id); ?>">
            <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <i class="fas fa-play-circle me-2"></i>
                    <span class="fw-bold">Current Lesson</span>
                </div>
                <div class="current-lesson-badges">
                    <?php if ($current_lesson->is_completed): ?>
                        <span class="badge bg-success">
                            <i class="fas fa-check me-1"></i>Completed
                        </span>
                    <?php else: ?>
                        <span class="badge bg-warning">
                            <i class="fas fa-clock me-1"></i>In Progress
                        </span>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <div class="lesson-thumbnail position-relative">
                            <img src="<?php echo esc_url($current_lesson->thumbnail); ?>" 
                                 alt="<?php echo esc_attr($current_lesson->title); ?>"
                                 class="img-fluid rounded">
                            
                            <!-- Progress overlay -->
                            <?php if ($current_lesson->progress_percentage > 0 && $current_lesson->progress_percentage < 100): ?>
                                <div class="progress-overlay">
                                    <div class="progress">
                                        <div class="progress-bar bg-primary" 
                                             style="width: <?php echo $current_lesson->progress_percentage; ?>%"
                                             aria-valuenow="<?php echo $current_lesson->progress_percentage; ?>" 
                                             aria-valuemin="0" 
                                             aria-valuemax="100">
                                        </div>
                                    </div>
                                    <small class="progress-text"><?php echo number_format($current_lesson->progress_percentage, 0); ?>% Complete</small>
                                </div>
                            <?php endif; ?>
                            
                            <!-- Duration badge -->
                            <div class="position-absolute top-0 end-0 m-2">
                                <span class="badge bg-dark bg-opacity-75">
                                    <i class="fas fa-clock me-1"></i><?php echo esc_html($current_lesson->duration); ?>
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="lesson-content">
                            <h5 class="lesson-title text-primary mb-2">
                                <?php echo esc_html($current_lesson->title); ?>
                            </h5>
                            <p class="lesson-description text-muted mb-3">
                                <?php echo esc_html($current_lesson->description); ?>
                            </p>
                            
                            <div class="lesson-meta d-flex flex-wrap gap-2 mb-3">
                                <span class="badge bg-light text-dark">
                                    <i class="fas fa-calendar me-1"></i>Week <?php echo $current_lesson->week; ?>
                                </span>
                                <span class="badge bg-light text-dark">
                                    <i class="fas fa-layer-group me-1"></i><?php echo esc_html($current_lesson->module); ?>
                                </span>
                                <span class="badge bg-light text-dark">
                                    <i class="fas fa-signal me-1"></i><?php echo esc_html($current_lesson->difficulty); ?>
                                </span>
                            </div>
                            
                            <?php if ($current_lesson->last_accessed): ?>
                                <small class="text-muted d-block mb-2">
                                    <i class="fas fa-history me-1"></i>
                                    Last accessed: <?php echo human_time_diff(strtotime($current_lesson->last_accessed), current_time('timestamp')); ?> ago
                                </small>
                            <?php endif; ?>
                            
                            <?php if ($current_lesson->time_spent > 0): ?>
                                <small class="text-muted d-block">
                                    <i class="fas fa-stopwatch me-1"></i>
                                    Time spent: <?php echo gmdate('H:i:s', $current_lesson->time_spent * 60); ?>
                                </small>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="lesson-actions d-grid gap-2">
                            <?php if ($current_lesson->is_completed): ?>
                                <a href="<?php echo esc_url($current_lesson->url); ?>" 
                                   class="btn btn-outline-primary btn-lg">
                                    <i class="fas fa-eye me-2"></i>Review Lesson
                                </a>
                            <?php else: ?>
                                <a href="<?php echo esc_url($current_lesson->url); ?>" 
                                   class="btn btn-primary btn-lg continue-current-lesson-btn"
                                   data-lesson-id="<?php echo esc_attr($current_lesson->id); ?>">
                                    <i class="fas fa-play me-2"></i>
                                    <?php echo $current_lesson->progress_percentage > 0 ? 'Continue' : 'Start'; ?> Lesson
                                </a>
                            <?php endif; ?>
                            
                            <button class="btn btn-outline-secondary btn-sm mark-complete-btn" 
                                    data-lesson-id="<?php echo esc_attr($current_lesson->id); ?>"
                                    <?php echo $current_lesson->is_completed ? 'disabled' : ''; ?>>
                                <i class="fas fa-check me-1"></i>Mark Complete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Progress bar at bottom -->
            <?php if (!$current_lesson->is_completed): ?>
                <div class="card-footer p-0">
                    <div class="progress" style="height: 4px; border-radius: 0;">
                        <div class="progress-bar bg-primary" 
                             style="width: <?php echo $current_lesson->progress_percentage; ?>%"
                             aria-valuenow="<?php echo $current_lesson->progress_percentage; ?>" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render next lesson card
     * 
     * @param object $lesson Lesson data
     * @return string HTML for next lesson card
     */
    private function render_next_lesson_card($lesson): string {
        ob_start();
        ?>
        <div class="next-lesson-card">
            <div class="lesson-thumbnail">
                <img src="<?php echo esc_url($lesson->thumbnail); ?>" 
                     alt="<?php echo esc_attr($lesson->title); ?>"
                     class="img-fluid rounded">
            </div>
            <div class="lesson-content">
                <h6 class="lesson-title"><?php echo esc_html($lesson->title); ?></h6>
                <p class="lesson-description"><?php echo esc_html($lesson->description); ?></p>
                <?php if (!empty($lesson->duration)): ?>
                    <small class="lesson-duration">
                        <i class="fas fa-clock"></i> <?php echo esc_html($lesson->duration); ?>
                    </small>
                <?php endif; ?>
            </div>
            <div class="lesson-action">
                <a href="<?php echo esc_url($lesson->url); ?>" class="btn btn-primary">
                    Continue Learning
                </a>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render recent activity list
     * 
     * @param array $activities Activity data
     * @return string HTML for activity list
     */
    private function render_recent_activity($activities): string {
        ob_start();
        ?>
        <div class="recent-activity-list">
            <?php if (!empty($activities)): ?>
                <?php foreach ($activities as $activity): ?>
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="activity-content">
                            <p class="activity-title"><?php echo esc_html($activity['title']); ?></p>
                            <small class="activity-time">
                                <?php echo human_time_diff(strtotime($activity['timestamp']), current_time('timestamp')) . ' ago'; ?>
                            </small>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p class="no-activity">No recent activity to display.</p>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * AJAX handler for setting current lesson
     */
    public function ajax_set_current_lesson() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        $lesson_id = sanitize_text_field($_POST['lesson_id'] ?? '');
        
        if (empty($lesson_id)) {
            wp_send_json_error('Lesson ID is required');
        }
        
        $this->set_current_lesson($lesson_id);
        
        wp_send_json_success([
            'message' => 'Current lesson updated successfully',
            'current_lesson' => $this->get_current_lesson()
        ]);
    }
    
    /**
     * AJAX handler for marking lesson as complete
     */
    public function ajax_mark_lesson_complete() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        $lesson_id = sanitize_text_field($_POST['lesson_id'] ?? '');
        
        if (empty($lesson_id)) {
            wp_send_json_error('Lesson ID is required');
        }
        
        // Mark lesson as complete
        $this->update_lesson_progress($lesson_id, 100);
        
        // Update current lesson to next lesson
        $next_lesson = $this->get_next_lesson();
        if ($next_lesson && $next_lesson->id !== 'completed') {
            $this->set_current_lesson($next_lesson->id);
        }
        
        wp_send_json_success([
            'message' => 'Lesson marked as complete',
            'current_lesson' => $this->get_current_lesson(),
            'next_lesson' => $this->get_next_lesson(),
            'progress' => $this->get_progress_stats()
        ]);
    }
    
    /**
     * AJAX handler for getting current lesson data
     */
    public function ajax_get_current_lesson() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        $current_lesson = $this->get_current_lesson();
        
        if ($current_lesson) {
            wp_send_json_success($current_lesson);
        } else {
            wp_send_json_error('No current lesson available');
        }
    }
    
    /**
     * AJAX handler for getting user progress data
     */
    public function ajax_get_user_progress() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        // Get user ID (use current user if not specified)
        $user_id = isset($_POST['user_id']) && $_POST['user_id'] !== 'current' 
            ? intval($_POST['user_id']) 
            : get_current_user_id();
        
        // Create progress tracker instance
        if (class_exists('PMP_Progress_Tracker')) {
            $progress_tracker = new PMP_Progress_Tracker($user_id);
            
            $response_data = [
                'overall' => $progress_tracker->get_overall_progress(),
                'domain' => $progress_tracker->get_domain_progress(),
                'weekly' => $progress_tracker->get_weekly_progress(),
                'analytics' => $progress_tracker->get_performance_analytics(),
                'recent_activity' => $this->get_recent_activity(5),
                'next_lesson' => $this->get_next_lesson(),
                'recommendations' => $this->get_lesson_recommendations(),
                'motivational_message' => $this->get_motivational_message()
            ];
            
            wp_send_json_success($response_data);
        } else {
            // Fallback to basic dashboard data
            $response_data = [
                'overall' => $this->get_progress_stats(),
                'recent_activity' => $this->get_recent_activity(5),
                'next_lesson' => $this->get_next_lesson(),
                'motivational_message' => $this->get_motivational_message()
            ];
            
            wp_send_json_success($response_data);
        }
    }
    
    /**
     * AJAX handler for tracking user events
     */
    public function ajax_track_user_event() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        $event_type = sanitize_text_field($_POST['event_type'] ?? '');
        $event_data = json_decode(stripslashes($_POST['event_data'] ?? '{}'), true);
        
        if (empty($event_type)) {
            wp_send_json_error('Event type is required');
        }
        
        // Log the event
        $this->log_activity($event_data['title'] ?? $event_type, $event_type, $event_data);
        
        wp_send_json_success(['message' => 'Event tracked successfully']);
    }
    
    /**
     * AJAX handler for updating lesson progress
     */
    public function ajax_update_lesson_progress() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        $lesson_id = sanitize_text_field($_POST['lesson_id'] ?? '');
        $completion = floatval($_POST['completion_percentage'] ?? 100);
        
        if (empty($lesson_id)) {
            wp_send_json_error('Lesson ID is required');
        }
        
        $this->update_lesson_progress($lesson_id, $completion);
        
        wp_send_json_success([
            'message' => 'Progress updated successfully',
            'progress' => $this->get_progress_stats()
        ]);
    }
    
    /**
     * AJAX handler for getting detailed progress
     */
    public function ajax_get_detailed_progress() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        if (class_exists('PMP_Progress_Tracker')) {
            $progress_tracker = new PMP_Progress_Tracker($this->user_id);
            
            $response_data = [
                'overall' => $progress_tracker->get_overall_progress(),
                'domain' => $progress_tracker->get_domain_progress(),
                'weekly' => $progress_tracker->get_weekly_progress(),
                'analytics' => $progress_tracker->get_performance_analytics()
            ];
            
            wp_send_json_success($response_data);
        } else {
            wp_send_json_error('Progress tracker not available');
        }
    }
    
    /**
     * Get lesson recommendations based on user progress
     * 
     * @return array Array of lesson recommendations
     */
    private function get_lesson_recommendations(): array {
        $progress = $this->get_progress_stats();
        $recommendations = [];
        
        // Add contextual recommendations based on progress
        if ($progress['percentage'] < 25) {
            $recommendations[] = [
                'title' => 'Focus on Foundation Concepts',
                'description' => 'Build a strong foundation with Week 1 materials',
                'type' => 'foundation'
            ];
        } elseif ($progress['percentage'] < 50) {
            $recommendations[] = [
                'title' => 'Practice People Domain Skills',
                'description' => 'Strengthen your understanding of team dynamics',
                'type' => 'people'
            ];
        } elseif ($progress['percentage'] < 75) {
            $recommendations[] = [
                'title' => 'Master Process Domain',
                'description' => 'Focus on project lifecycle and processes',
                'type' => 'process'
            ];
        } else {
            $recommendations[] = [
                'title' => 'Final Exam Preparation',
                'description' => 'Review and practice with mock exams',
                'type' => 'exam_prep'
            ];
        }
        
        return $recommendations;
    } = isset($_POST['user_id']) && $_POST['user_id'] !== 'current' 
            ? intval($_POST['user_id']) 
            : get_current_user_id();
        
        if (!$user_id) {
            wp_send_json_error('User not logged in');
            return;
        }
        
        // Initialize progress tracker
        if (class_exists('PMP_Progress_Tracker')) {
            $progress_tracker = new PMP_Progress_Tracker($user_id);
            
            $progress_data = [
                'overall' => $progress_tracker->get_overall_progress(),
                'domain' => $progress_tracker->get_domain_progress(),
                'weekly' => $progress_tracker->get_weekly_progress(),
                'recent_activity' => $this->get_recent_activity(10),
                'recommendations' => $this->get_personalized_recommendations($user_id),
                'analytics' => $progress_tracker->get_performance_analytics()
            ];
        } else {
            // Fallback to dashboard data
            $dashboard = new PMP_Dashboard($user_id);
            $progress_stats = $dashboard->get_progress_stats();
            
            $progress_data = [
                'overall' => [
                    'percentage' => $progress_stats['percentage'],
                    'completed_lessons' => $progress_stats['completed'],
                    'total_lessons' => $progress_stats['total'],
                    'current_week' => $progress_stats['current_week'],
                    'estimated_completion_date' => $dashboard->calculate_estimated_completion($progress_stats)
                ],
                'recent_activity' => $dashboard->get_recent_activity(10),
                'recommendations' => []
            ];
        }
        
        wp_send_json_success($progress_data);
    }
    
    /**
     * AJAX handler for tracking user events
     */
    public function ajax_track_user_event() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        $user_id = get_current_user_id();
        if (!$user_id) {
            wp_send_json_error('User not logged in');
            return;
        }
        
        $event_type = sanitize_text_field($_POST['event_type']);
        $event_data = json_decode(stripslashes($_POST['event_data']), true);
        
        // Log the event
        $this->log_user_event($user_id, $event_type, $event_data);
        
        wp_send_json_success(['message' => 'Event tracked successfully']);
    }
    
    /**
     * AJAX handler for updating lesson progress
     */
    public function ajax_update_lesson_progress() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        $user_id = get_current_user_id();
        if (!$user_id) {
            wp_send_json_error('User not logged in');
            return;
        }
        
        $lesson_id = sanitize_text_field($_POST['lesson_id']);
        $completion_percentage = floatval($_POST['completion_percentage']);
        $session_data = json_decode(stripslashes($_POST['session_data'] ?? '{}'), true);
        
        // Update progress using progress tracker
        if (class_exists('PMP_Progress_Tracker')) {
            $progress_tracker = new PMP_Progress_Tracker($user_id);
            $progress_tracker->update_lesson_progress($lesson_id, $completion_percentage, $session_data);
        } else {
            // Fallback to dashboard method
            $this->update_lesson_progress($lesson_id, $completion_percentage);
        }
        
        // Return updated progress data
        $updated_progress = $this->get_progress_stats();
        wp_send_json_success($updated_progress);
    }
    
    /**
     * AJAX handler for getting detailed progress data
     */
    public function ajax_get_detailed_progress() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        $user_id = get_current_user_id();
        if (!$user_id) {
            wp_send_json_error('User not logged in');
            return;
        }
        
        if (class_exists('PMP_Progress_Tracker')) {
            $progress_tracker = new PMP_Progress_Tracker($user_id);
            
            $detailed_data = [
                'overall_progress' => $progress_tracker->get_overall_progress(),
                'domain_progress' => $progress_tracker->get_domain_progress(),
                'weekly_progress' => $progress_tracker->get_weekly_progress(),
                'performance_analytics' => $progress_tracker->get_performance_analytics(),
                'milestone_progress' => $progress_tracker->get_milestone_progress(),
                'study_patterns' => $progress_tracker->analyze_study_patterns()
            ];
        } else {
            $detailed_data = [
                'overall_progress' => $this->get_progress_stats(),
                'message' => 'Limited progress data available'
            ];
        }
        
        wp_send_json_success($detailed_data);
    }
    
    /**
     * Log user event for analytics
     * 
     * @param int $user_id User ID
     * @param string $event_type Event type
     * @param array $event_data Event data
     */
    private function log_user_event($user_id, $event_type, $event_data) {
        $events = get_user_meta($user_id, 'pmp_user_events', true);
        
        if (!is_array($events)) {
            $events = [];
        }
        
        $event = [
            'type' => $event_type,
            'data' => $event_data,
            'timestamp' => current_time('mysql'),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? ''
        ];
        
        array_unshift($events, $event);
        
        // Keep only last 100 events
        $events = array_slice($events, 0, 100);
        
        update_user_meta($user_id, 'pmp_user_events', $events);
        
        // Also log to activity feed if it's a significant event
        if (in_array($event_type, ['lesson_started', 'lesson_completed', 'quiz_completed'])) {
            $this->log_activity_from_event($event_type, $event_data);
        }
    }
    
    /**
     * Log activity from event data
     * 
     * @param string $event_type Event type
     * @param array $event_data Event data
     */
    private function log_activity_from_event($event_type, $event_data) {
        $activity_titles = [
            'lesson_started' => 'Started: ' . ($event_data['lesson_title'] ?? 'New Lesson'),
            'lesson_completed' => 'Completed: ' . ($event_data['lesson_title'] ?? 'Lesson'),
            'quiz_completed' => 'Completed Quiz: ' . ($event_data['quiz_title'] ?? 'Practice Quiz')
        ];
        
        $title = $activity_titles[$event_type] ?? 'Activity: ' . $event_type;
        $this->log_activity($title, $event_type, $event_data);
    }
    
    /**
     * Get personalized recommendations for user
     * 
     * @param int $user_id User ID
     * @return array Recommendations
     */
    private function get_personalized_recommendations($user_id) {
        if (class_exists('PMP_Progress_Tracker')) {
            $progress_tracker = new PMP_Progress_Tracker($user_id);
            $analytics = $progress_tracker->get_performance_analytics();
            return $analytics['recommendations'] ?? [];
        }
        
        // Fallback recommendations
        $progress = $this->get_progress_stats();
        $recommendations = [];
        
        if ($progress['percentage'] < 25) {
            $recommendations[] = [
                'type' => 'study_frequency',
                'title' => 'Establish Study Routine',
                'description' => 'Try to study for 20-30 minutes daily to build momentum.',
                'priority' => 'high'
            ];
        } elseif ($progress['percentage'] < 50) {
            $recommendations[] = [
                'type' => 'practice',
                'title' => 'Add Practice Questions',
                'description' => 'Start incorporating practice questions to reinforce learning.',
                'priority' => 'medium'
            ];
        } elseif ($progress['percentage'] < 75) {
            $recommendations[] = [
                'type' => 'review',
                'title' => 'Review Previous Material',
                'description' => 'Review earlier lessons to strengthen your foundation.',
                'priority' => 'medium'
            ];
        } else {
            $recommendations[] = [
                'type' => 'exam_prep',
                'title' => 'Focus on Exam Preparation',
                'description' => 'Start taking full-length practice exams.',
                'priority' => 'high'
            ];
        }
        
        return $recommendations;
    }
}}
