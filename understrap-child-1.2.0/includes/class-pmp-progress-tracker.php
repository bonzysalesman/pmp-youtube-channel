<?php
/**
 * PMP Progress Tracker Class
 * 
 * Handles detailed progress tracking functionality including
 * lesson completion, domain progress, performance analytics,
 * and real-time progress updates.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class PMP_Progress_Tracker {
    
    private $user_id;
    private $course_id;
    private $progress_data;
    
    /**
     * Constructor
     * 
     * @param int $user_id WordPress user ID
     * @param string $course_id Course identifier (default: 'pmp-prep-course')
     */
    public function __construct($user_id, $course_id = 'pmp-prep-course') {
        $this->user_id = $user_id;
        $this->course_id = $course_id;
        $this->progress_data = null;
        
        // Initialize AJAX handlers
        $this->init_ajax_handlers();
    }
    
    /**
     * Initialize AJAX handlers for progress tracking
     */
    private function init_ajax_handlers() {
        add_action('wp_ajax_get_detailed_progress', [$this, 'ajax_get_detailed_progress']);
        add_action('wp_ajax_update_lesson_progress', [$this, 'ajax_update_lesson_progress']);
        add_action('wp_ajax_get_performance_analytics', [$this, 'ajax_get_performance_analytics']);
        add_action('wp_ajax_get_domain_progress', [$this, 'ajax_get_domain_progress']);
        add_action('wp_ajax_track_lesson_event', [$this, 'ajax_track_lesson_event']);
    }
    
    /**
     * Get overall progress for the user
     * 
     * @return array Overall progress data
     */
    public function get_overall_progress(): array {
        $progress = $this->get_user_progress_data();
        
        return [
            'percentage' => $progress['overall_percentage'] ?? 0,
            'completed_lessons' => $progress['completed_lessons_count'] ?? 0,
            'total_lessons' => $progress['total_lessons'] ?? 91,
            'current_week' => $progress['current_week'] ?? 1,
            'study_time_minutes' => $progress['total_study_time'] ?? 0,
            'last_activity' => $progress['last_activity'] ?? null,
            'estimated_completion_date' => $this->calculate_estimated_completion($progress),
            'study_streak_days' => $this->get_study_streak(),
            'achievements_count' => $this->get_achievements_count()
        ];
    }
    
    /**
     * Get domain-specific progress
     * 
     * @return array Domain progress breakdown
     */
    public function get_domain_progress(): array {
        $progress = $this->get_user_progress_data();
        $domain_lessons = $this->get_domain_lesson_mapping();
        
        $domains = [
            'people' => [
                'name' => 'People Domain',
                'percentage' => 42,
                'color' => '#10b981', // Green
                'completed' => 0,
                'total' => 0,
                'progress_percentage' => 0
            ],
            'process' => [
                'name' => 'Process Domain',
                'percentage' => 50,
                'color' => '#3b82f6', // Blue
                'completed' => 0,
                'total' => 0,
                'progress_percentage' => 0
            ],
            'business' => [
                'name' => 'Business Environment',
                'percentage' => 8,
                'color' => '#f59e0b', // Orange
                'completed' => 0,
                'total' => 0,
                'progress_percentage' => 0
            ]
        ];
        
        $completed_lessons = $progress['completed_lessons'] ?? [];
        
        foreach ($domain_lessons as $domain => $lessons) {
            if (isset($domains[$domain])) {
                $domains[$domain]['total'] = count($lessons);
                $domains[$domain]['completed'] = count(array_intersect($completed_lessons, $lessons));
                $domains[$domain]['progress_percentage'] = $domains[$domain]['total'] > 0 
                    ? ($domains[$domain]['completed'] / $domains[$domain]['total']) * 100 
                    : 0;
            }
        }
        
        return $domains;
    }
    
    /**
     * Get weekly progress breakdown
     * 
     * @return array Weekly progress data
     */
    public function get_weekly_progress(): array {
        $progress = $this->get_user_progress_data();
        $completed_lessons = $progress['completed_lessons'] ?? [];
        $weekly_progress = [];
        
        for ($week = 1; $week <= 13; $week++) {
            $week_lessons = $this->get_week_lessons($week);
            $completed_count = count(array_intersect($completed_lessons, $week_lessons));
            $total_count = count($week_lessons);
            
            $weekly_progress["week_{$week}"] = [
                'week_number' => $week,
                'completed' => $completed_count,
                'total' => $total_count,
                'percentage' => $total_count > 0 ? ($completed_count / $total_count) * 100 : 0,
                'is_current' => $week == ($progress['current_week'] ?? 1),
                'lessons' => $week_lessons
            ];
        }
        
        return $weekly_progress;
    }
    
    /**
     * Update lesson progress
     * 
     * @param string $lesson_id Lesson identifier
     * @param float $completion_percentage Completion percentage (0-100)
     * @param array $metadata Additional metadata (session_time, quiz_score, etc.)
     */
    public function update_lesson_progress($lesson_id, $completion_percentage = 100, $metadata = []): void {
        $progress = $this->get_user_progress_data();
        
        // Initialize arrays if they don't exist
        if (!isset($progress['completed_lessons'])) {
            $progress['completed_lessons'] = [];
        }
        if (!isset($progress['lesson_progress'])) {
            $progress['lesson_progress'] = [];
        }
        
        // Update lesson progress
        $progress['lesson_progress'][$lesson_id] = [
            'completion_percentage' => $completion_percentage,
            'last_accessed' => current_time('mysql'),
            'session_time' => $metadata['session_time'] ?? 0,
            'quiz_score' => $metadata['quiz_score'] ?? null,
            'attempts' => ($progress['lesson_progress'][$lesson_id]['attempts'] ?? 0) + 1
        ];
        
        // Mark as completed if 100%
        if ($completion_percentage >= 100 && !in_array($lesson_id, $progress['completed_lessons'])) {
            $progress['completed_lessons'][] = $lesson_id;
        }
        
        // Update overall statistics
        $progress['completed_lessons_count'] = count($progress['completed_lessons']);
        $progress['overall_percentage'] = ($progress['completed_lessons_count'] / 91) * 100;
        $progress['current_week'] = $this->calculate_current_week($progress['completed_lessons_count']);
        $progress['last_activity'] = current_time('mysql');
        
        // Add to study time
        if (isset($metadata['session_time'])) {
            $progress['total_study_time'] = ($progress['total_study_time'] ?? 0) + $metadata['session_time'];
        }
        
        // Save progress
        $this->save_user_progress_data($progress);
        
        // Log activity
        $this->log_progress_activity($lesson_id, 'lesson_completed', $metadata);
    }
    
    /**
     * Get performance analytics
     * 
     * @return array Performance analytics data
     */
    public function get_performance_analytics(): array {
        $progress = $this->get_user_progress_data();
        $lesson_progress = $progress['lesson_progress'] ?? [];
        
        $analytics = [
            'average_session_time' => 0,
            'average_quiz_score' => 0,
            'total_study_time' => $progress['total_study_time'] ?? 0,
            'lessons_per_week' => 0,
            'completion_rate' => 0,
            'study_consistency' => 0,
            'performance_trend' => 'stable',
            'strengths' => [],
            'areas_for_improvement' => []
        ];
        
        if (!empty($lesson_progress)) {
            // Calculate averages
            $total_session_time = 0;
            $total_quiz_scores = 0;
            $quiz_count = 0;
            $session_count = 0;
            
            foreach ($lesson_progress as $lesson_data) {
                if (isset($lesson_data['session_time']) && $lesson_data['session_time'] > 0) {
                    $total_session_time += $lesson_data['session_time'];
                    $session_count++;
                }
                
                if (isset($lesson_data['quiz_score']) && $lesson_data['quiz_score'] !== null) {
                    $total_quiz_scores += $lesson_data['quiz_score'];
                    $quiz_count++;
                }
            }
            
            $analytics['average_session_time'] = $session_count > 0 ? $total_session_time / $session_count : 0;
            $analytics['average_quiz_score'] = $quiz_count > 0 ? $total_quiz_scores / $quiz_count : 0;
            
            // Calculate completion rate
            $analytics['completion_rate'] = ($progress['completed_lessons_count'] ?? 0) / 91 * 100;
            
            // Calculate lessons per week (based on activity)
            $weeks_active = $this->get_weeks_active();
            $analytics['lessons_per_week'] = $weeks_active > 0 ? ($progress['completed_lessons_count'] ?? 0) / $weeks_active : 0;
            
            // Determine performance trend
            $analytics['performance_trend'] = $this->calculate_performance_trend($lesson_progress);
            
            // Identify strengths and areas for improvement
            $domain_progress = $this->get_domain_progress();
            foreach ($domain_progress as $domain => $data) {
                if ($data['progress_percentage'] >= 80) {
                    $analytics['strengths'][] = $data['name'];
                } elseif ($data['progress_percentage'] < 50) {
                    $analytics['areas_for_improvement'][] = $data['name'];
                }
            }
        }
        
        return $analytics;
    }
    
    /**
     * Get user progress data from database
     * 
     * @return array Progress data
     */
    private function get_user_progress_data(): array {
        if ($this->progress_data === null) {
            $this->progress_data = get_user_meta($this->user_id, 'pmp_detailed_progress', true);
            
            if (empty($this->progress_data)) {
                $this->progress_data = $this->initialize_progress_data();
            }
        }
        
        return $this->progress_data;
    }
    
    /**
     * Save user progress data to database
     * 
     * @param array $progress_data Progress data to save
     */
    private function save_user_progress_data($progress_data): void {
        $this->progress_data = $progress_data;
        update_user_meta($this->user_id, 'pmp_detailed_progress', $progress_data);
    }
    
    /**
     * Initialize default progress data
     * 
     * @return array Default progress structure
     */
    private function initialize_progress_data(): array {
        return [
            'completed_lessons' => [],
            'lesson_progress' => [],
            'completed_lessons_count' => 0,
            'total_lessons' => 91,
            'overall_percentage' => 0,
            'current_week' => 1,
            'total_study_time' => 0,
            'last_activity' => current_time('mysql'),
            'start_date' => current_time('mysql'),
            'achievements' => [],
            'milestones' => []
        ];
    }
    
    /**
     * Get domain to lesson mapping
     * 
     * @return array Domain lesson mapping
     */
    private function get_domain_lesson_mapping(): array {
        return [
            'people' => [
                // Week 2-4 lessons (People Domain - 42%)
                'lesson-02-01', 'lesson-02-02', 'lesson-02-03', 'lesson-02-04', 'lesson-02-05',
                'lesson-03-01', 'lesson-03-02', 'lesson-03-03', 'lesson-03-04', 'lesson-03-05',
                'lesson-04-01', 'lesson-04-02', 'lesson-04-03', 'lesson-04-04', 'lesson-04-05',
                // Additional people-focused lessons
                'lesson-02-06', 'lesson-02-07', 'lesson-03-06', 'lesson-03-07', 'lesson-04-06', 'lesson-04-07'
            ],
            'process' => [
                // Week 5-8 lessons (Process Domain - 50%)
                'lesson-05-01', 'lesson-05-02', 'lesson-05-03', 'lesson-05-04', 'lesson-05-05',
                'lesson-06-01', 'lesson-06-02', 'lesson-06-03', 'lesson-06-04', 'lesson-06-05',
                'lesson-07-01', 'lesson-07-02', 'lesson-07-03', 'lesson-07-04', 'lesson-07-05',
                'lesson-08-01', 'lesson-08-02', 'lesson-08-03', 'lesson-08-04', 'lesson-08-05',
                // Additional process-focused lessons
                'lesson-05-06', 'lesson-05-07', 'lesson-06-06', 'lesson-06-07', 'lesson-07-06', 'lesson-07-07',
                'lesson-08-06', 'lesson-08-07'
            ],
            'business' => [
                // Week 9-11 lessons (Business Environment - 8%)
                'lesson-09-01', 'lesson-09-02', 'lesson-09-03', 'lesson-09-04', 'lesson-09-05',
                'lesson-10-01', 'lesson-10-02', 'lesson-10-03', 'lesson-10-04', 'lesson-10-05',
                'lesson-11-01', 'lesson-11-02', 'lesson-11-03', 'lesson-11-04', 'lesson-11-05',
                // Foundation and review lessons
                'lesson-01-01', 'lesson-01-02', 'lesson-01-03', 'lesson-01-04', 'lesson-01-05'
            ]
        ];
    }
    
    /**
     * Get lessons for a specific week
     * 
     * @param int $week Week number (1-13)
     * @return array Lesson IDs for the week
     */
    private function get_week_lessons($week): array {
        $lessons = [];
        
        for ($day = 1; $day <= 7; $day++) {
            $lessons[] = sprintf('lesson-%02d-%02d', $week, $day);
        }
        
        return $lessons;
    }
    
    /**
     * Calculate current week based on completed lessons
     * 
     * @param int $completed_count Number of completed lessons
     * @return int Current week number
     */
    private function calculate_current_week($completed_count): int {
        return min(13, max(1, ceil($completed_count / 7)));
    }
    
    /**
     * Calculate estimated completion date
     * 
     * @param array $progress Progress data
     * @return string Estimated completion date
     */
    private function calculate_estimated_completion($progress): string {
        $remaining_lessons = 91 - ($progress['completed_lessons_count'] ?? 0);
        
        if ($remaining_lessons <= 0) {
            return 'Completed';
        }
        
        // Calculate average lessons per week based on current progress
        $weeks_active = $this->get_weeks_active();
        $avg_lessons_per_week = $weeks_active > 0 ? ($progress['completed_lessons_count'] ?? 0) / $weeks_active : 7;
        
        // Ensure minimum progress rate
        $avg_lessons_per_week = max($avg_lessons_per_week, 3);
        
        $weeks_remaining = ceil($remaining_lessons / $avg_lessons_per_week);
        $completion_date = date('M j, Y', strtotime("+{$weeks_remaining} weeks"));
        
        return $completion_date;
    }
    
    /**
     * Get number of weeks user has been active
     * 
     * @return int Number of active weeks
     */
    private function get_weeks_active(): int {
        $progress = $this->get_user_progress_data();
        $start_date = $progress['start_date'] ?? current_time('mysql');
        
        $weeks = ceil((strtotime(current_time('mysql')) - strtotime($start_date)) / (7 * 24 * 60 * 60));
        return max(1, $weeks);
    }
    
    /**
     * Get study streak in days
     * 
     * @return int Study streak days
     */
    private function get_study_streak(): int {
        $activities = get_user_meta($this->user_id, 'pmp_progress_activities', true);
        
        if (empty($activities)) {
            return 0;
        }
        
        $streak = 0;
        $current_date = date('Y-m-d');
        
        for ($i = 0; $i < 30; $i++) {
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
     * Get achievements count
     * 
     * @return int Number of achievements
     */
    private function get_achievements_count(): int {
        $progress = $this->get_user_progress_data();
        return count($progress['achievements'] ?? []);
    }
    
    /**
     * Calculate performance trend
     * 
     * @param array $lesson_progress Lesson progress data
     * @return string Performance trend (improving, declining, stable)
     */
    private function calculate_performance_trend($lesson_progress): string {
        if (count($lesson_progress) < 5) {
            return 'stable';
        }
        
        // Get recent quiz scores
        $recent_scores = [];
        $lessons_by_date = [];
        
        foreach ($lesson_progress as $lesson_id => $data) {
            if (isset($data['quiz_score']) && isset($data['last_accessed'])) {
                $lessons_by_date[$data['last_accessed']] = $data['quiz_score'];
            }
        }
        
        // Sort by date and get last 5 scores
        ksort($lessons_by_date);
        $recent_scores = array_slice($lessons_by_date, -5, 5, true);
        
        if (count($recent_scores) < 3) {
            return 'stable';
        }
        
        $scores = array_values($recent_scores);
        $first_half = array_slice($scores, 0, ceil(count($scores) / 2));
        $second_half = array_slice($scores, floor(count($scores) / 2));
        
        $first_avg = array_sum($first_half) / count($first_half);
        $second_avg = array_sum($second_half) / count($second_half);
        
        $difference = $second_avg - $first_avg;
        
        if ($difference > 5) {
            return 'improving';
        } elseif ($difference < -5) {
            return 'declining';
        } else {
            return 'stable';
        }
    }
    
    /**
     * Log progress activity
     * 
     * @param string $lesson_id Lesson ID
     * @param string $activity_type Activity type
     * @param array $metadata Additional metadata
     */
    private function log_progress_activity($lesson_id, $activity_type, $metadata = []): void {
        $activities = get_user_meta($this->user_id, 'pmp_progress_activities', true);
        
        if (!is_array($activities)) {
            $activities = [];
        }
        
        $activity = [
            'lesson_id' => $lesson_id,
            'activity_type' => $activity_type,
            'timestamp' => current_time('mysql'),
            'metadata' => $metadata
        ];
        
        array_unshift($activities, $activity);
        
        // Keep only last 100 activities
        $activities = array_slice($activities, 0, 100);
        
        update_user_meta($this->user_id, 'pmp_progress_activities', $activities);
    }
    
    /**
     * AJAX handler for getting detailed progress
     */
    public function ajax_get_detailed_progress() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        $response = [
            'success' => true,
            'data' => [
                'overall' => $this->get_overall_progress(),
                'domain' => $this->get_domain_progress(),
                'weekly' => $this->get_weekly_progress(),
                'analytics' => $this->get_performance_analytics()
            ]
        ];
        
        wp_send_json($response);
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
        $metadata = json_decode(stripslashes($_POST['metadata'] ?? '{}'), true);
        
        if (empty($lesson_id)) {
            wp_send_json_error('Lesson ID is required');
        }
        
        $this->update_lesson_progress($lesson_id, $completion, $metadata);
        
        wp_send_json_success([
            'message' => 'Progress updated successfully',
            'overall_progress' => $this->get_overall_progress()
        ]);
    }
    
    /**
     * AJAX handler for getting performance analytics
     */
    public function ajax_get_performance_analytics() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        wp_send_json_success($this->get_performance_analytics());
    }
    
    /**
     * AJAX handler for getting domain progress
     */
    public function ajax_get_domain_progress() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        wp_send_json_success($this->get_domain_progress());
    }
    
    /**
     * AJAX handler for tracking lesson events
     */
    public function ajax_track_lesson_event() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
            wp_die('Security check failed');
        }
        
        $lesson_id = sanitize_text_field($_POST['lesson_id'] ?? '');
        $event_type = sanitize_text_field($_POST['event_type'] ?? '');
        $metadata = json_decode(stripslashes($_POST['metadata'] ?? '{}'), true);
        
        if (empty($lesson_id) || empty($event_type)) {
            wp_send_json_error('Lesson ID and event type are required');
        }
        
        $this->log_progress_activity($lesson_id, $event_type, $metadata);
        
        wp_send_json_success(['message' => 'Event tracked successfully']);
    }
}