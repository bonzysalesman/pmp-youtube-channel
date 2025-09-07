<?php
/**
 * PMP Progress Tracker Class
 * 
 * Handles comprehensive progress tracking and analytics for the PMP course.
 * Tracks lesson completion, domain progress, time spent, and generates insights.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class PMP_Progress_Tracker {
    
    private $user_id;
    private $course_id;
    
    /**
     * Constructor
     * 
     * @param int $user_id WordPress user ID
     * @param string $course_id Course identifier
     */
    public function __construct($user_id, $course_id = 'pmp-prep-course') {
        $this->user_id = $user_id;
        $this->course_id = $course_id;
    }
    
    /**
     * Update lesson progress with detailed tracking
     * 
     * @param string $lesson_id Lesson identifier
     * @param float $completion_percentage Completion percentage (0-100)
     * @param array $additional_data Additional tracking data
     */
    public function update_lesson_progress($lesson_id, $completion_percentage, $additional_data = []) {
        $progress_data = $this->get_lesson_progress($lesson_id);
        
        // Update progress data
        $progress_data['lesson_id'] = $lesson_id;
        $progress_data['completion_percentage'] = max(0, min(100, $completion_percentage));
        $progress_data['last_updated'] = current_time('mysql');
        $progress_data['time_spent'] = ($progress_data['time_spent'] ?? 0) + ($additional_data['session_time'] ?? 0);
        $progress_data['attempts'] = ($progress_data['attempts'] ?? 0) + 1;
        
        // Track completion
        if ($completion_percentage >= 100 && !$progress_data['completed']) {
            $progress_data['completed'] = true;
            $progress_data['completion_date'] = current_time('mysql');
            $this->mark_lesson_completed($lesson_id);
        }
        
        // Store lesson-specific progress
        $this->update_lesson_meta($lesson_id, $progress_data);
        
        // Update overall course progress
        $this->update_overall_progress();
        
        // Update domain-specific progress
        $this->update_domain_progress($lesson_id);
        
        // Log progress event
        $this->log_progress_event($lesson_id, 'progress_updated', [
            'completion_percentage' => $completion_percentage,
            'session_data' => $additional_data
        ]);
    }
    
    /**
     * Get overall course progress
     * 
     * @return array Comprehensive progress data
     */
    public function get_overall_progress() {
        $progress = get_user_meta($this->user_id, 'pmp_overall_progress', true);
        
        if (empty($progress)) {
            $progress = $this->initialize_progress_data();
        }
        
        // Ensure all required fields exist
        $default_progress = [
            'percentage' => 0.0,
            'completed_lessons' => 0,
            'total_lessons' => 91,
            'current_week' => 1,
            'total_time_spent' => 0,
            'average_session_time' => 0,
            'lessons_per_week' => 0,
            'estimated_completion_date' => null,
            'last_activity' => null,
            'study_streak' => 0,
            'weekly_goals_met' => 0,
            'performance_trend' => 'stable'
        ];
        
        return array_merge($default_progress, $progress);
    }
    
    /**
     * Get domain-based progress (People, Process, Business Environment)
     * 
     * @return array Domain progress breakdown
     */
    public function get_domain_progress() {
        $domain_progress = get_user_meta($this->user_id, 'pmp_domain_progress', true);
        
        if (empty($domain_progress)) {
            $domain_progress = [
                'people' => [
                    'percentage' => 0.0,
                    'completed_lessons' => 0,
                    'total_lessons' => 38, // 42% of 91 lessons
                    'average_score' => 0,
                    'time_spent' => 0,
                    'strengths' => [],
                    'areas_for_improvement' => []
                ],
                'process' => [
                    'percentage' => 0.0,
                    'completed_lessons' => 0,
                    'total_lessons' => 46, // 50% of 91 lessons
                    'average_score' => 0,
                    'time_spent' => 0,
                    'strengths' => [],
                    'areas_for_improvement' => []
                ],
                'business_environment' => [
                    'percentage' => 0.0,
                    'completed_lessons' => 0,
                    'total_lessons' => 7, // 8% of 91 lessons
                    'average_score' => 0,
                    'time_spent' => 0,
                    'strengths' => [],
                    'areas_for_improvement' => []
                ]
            ];
        }
        
        return $domain_progress;
    }
    
    /**
     * Get weekly progress breakdown
     * 
     * @return array Weekly progress data
     */
    public function get_weekly_progress() {
        $weekly_progress = get_user_meta($this->user_id, 'pmp_weekly_progress', true);
        
        if (empty($weekly_progress)) {
            $weekly_progress = [];
            for ($week = 1; $week <= 13; $week++) {
                $weekly_progress["week_{$week}"] = [
                    'week_number' => $week,
                    'percentage' => 0.0,
                    'completed_lessons' => 0,
                    'total_lessons' => 7,
                    'time_spent' => 0,
                    'average_score' => 0,
                    'started_date' => null,
                    'completed_date' => null,
                    'goal_met' => false,
                    'focus_domain' => $this->get_week_focus_domain($week)
                ];
            }
        }
        
        return $weekly_progress;
    }
    
    /**
     * Calculate estimated completion date based on current progress
     * 
     * @return string Formatted completion date
     */
    public function calculate_estimated_completion() {
        $overall_progress = $this->get_overall_progress();
        $weekly_progress = $this->get_weekly_progress();
        
        $completed_lessons = $overall_progress['completed_lessons'];
        $remaining_lessons = $overall_progress['total_lessons'] - $completed_lessons;
        
        if ($remaining_lessons <= 0) {
            return 'Course completed!';
        }
        
        // Calculate average lessons per week based on recent activity
        $recent_weeks = array_slice($weekly_progress, -4, 4, true); // Last 4 weeks
        $total_recent_lessons = 0;
        $active_weeks = 0;
        
        foreach ($recent_weeks as $week_data) {
            if ($week_data['completed_lessons'] > 0) {
                $total_recent_lessons += $week_data['completed_lessons'];
                $active_weeks++;
            }
        }
        
        $avg_lessons_per_week = $active_weeks > 0 ? $total_recent_lessons / $active_weeks : 7;
        $avg_lessons_per_week = max(1, $avg_lessons_per_week); // Minimum 1 lesson per week
        
        $weeks_remaining = ceil($remaining_lessons / $avg_lessons_per_week);
        $completion_date = date('M j, Y', strtotime("+{$weeks_remaining} weeks"));
        
        return $completion_date;
    }
    
    /**
     * Get detailed lesson progress
     * 
     * @param string $lesson_id Lesson identifier
     * @return array Lesson progress data
     */
    public function get_lesson_progress($lesson_id) {
        $lesson_progress = get_user_meta($this->user_id, "pmp_lesson_progress_{$lesson_id}", true);
        
        if (empty($lesson_progress)) {
            $lesson_progress = [
                'lesson_id' => $lesson_id,
                'completion_percentage' => 0,
                'completed' => false,
                'time_spent' => 0,
                'attempts' => 0,
                'first_started' => null,
                'last_updated' => null,
                'completion_date' => null,
                'quiz_scores' => [],
                'notes' => '',
                'bookmarked' => false
            ];
        }
        
        return $lesson_progress;
    }
    
    /**
     * Get performance analytics and insights
     * 
     * @return array Performance analytics data
     */
    public function get_performance_analytics() {
        $overall_progress = $this->get_overall_progress();
        $domain_progress = $this->get_domain_progress();
        $weekly_progress = $this->get_weekly_progress();
        
        return [
            'overall_performance' => [
                'completion_rate' => $overall_progress['percentage'],
                'pace' => $this->calculate_learning_pace(),
                'consistency' => $this->calculate_study_consistency(),
                'efficiency' => $this->calculate_learning_efficiency()
            ],
            'domain_strengths' => $this->identify_domain_strengths($domain_progress),
            'areas_for_improvement' => $this->identify_improvement_areas($domain_progress),
            'study_patterns' => $this->analyze_study_patterns(),
            'recommendations' => $this->generate_recommendations(),
            'milestones' => $this->get_milestone_progress(),
            'comparative_performance' => $this->get_comparative_performance()
        ];
    }
    
    /**
     * Mark lesson as completed
     * 
     * @param string $lesson_id Lesson identifier
     */
    private function mark_lesson_completed($lesson_id) {
        $completed_lessons = get_user_meta($this->user_id, 'pmp_completed_lessons', true);
        
        if (!is_array($completed_lessons)) {
            $completed_lessons = [];
        }
        
        if (!in_array($lesson_id, $completed_lessons)) {
            $completed_lessons[] = $lesson_id;
            update_user_meta($this->user_id, 'pmp_completed_lessons', $completed_lessons);
        }
    }
    
    /**
     * Update overall course progress
     */
    private function update_overall_progress() {
        $completed_lessons = get_user_meta($this->user_id, 'pmp_completed_lessons', true);
        $completed_count = is_array($completed_lessons) ? count($completed_lessons) : 0;
        
        $overall_progress = $this->get_overall_progress();
        $overall_progress['completed_lessons'] = $completed_count;
        $overall_progress['percentage'] = ($completed_count / 91) * 100;
        $overall_progress['current_week'] = min(13, max(1, ceil($completed_count / 7)));
        $overall_progress['last_activity'] = current_time('mysql');
        
        // Update study streak
        $overall_progress['study_streak'] = $this->calculate_study_streak();
        
        // Update estimated completion
        $overall_progress['estimated_completion_date'] = $this->calculate_estimated_completion();
        
        update_user_meta($this->user_id, 'pmp_overall_progress', $overall_progress);
    }
    
    /**
     * Update domain-specific progress
     * 
     * @param string $lesson_id Lesson identifier
     */
    private function update_domain_progress($lesson_id) {
        $domain = $this->get_lesson_domain($lesson_id);
        $domain_progress = $this->get_domain_progress();
        
        if (isset($domain_progress[$domain])) {
            $completed_lessons = get_user_meta($this->user_id, 'pmp_completed_lessons', true);
            $domain_completed = 0;
            
            // Count completed lessons in this domain
            foreach ($completed_lessons as $completed_lesson) {
                if ($this->get_lesson_domain($completed_lesson) === $domain) {
                    $domain_completed++;
                }
            }
            
            $domain_progress[$domain]['completed_lessons'] = $domain_completed;
            $domain_progress[$domain]['percentage'] = 
                ($domain_completed / $domain_progress[$domain]['total_lessons']) * 100;
            
            update_user_meta($this->user_id, 'pmp_domain_progress', $domain_progress);
        }
    }
    
    /**
     * Get lesson domain based on lesson ID
     * 
     * @param string $lesson_id Lesson identifier
     * @return string Domain (people, process, business_environment)
     */
    private function get_lesson_domain($lesson_id) {
        // Extract week number from lesson ID (e.g., lesson-02-01 -> week 2)
        if (preg_match('/lesson-(\d+)-/', $lesson_id, $matches)) {
            $week = intval($matches[1]);
            
            // Domain mapping based on course structure
            if ($week >= 2 && $week <= 4) {
                return 'people';
            } elseif ($week >= 5 && $week <= 8) {
                return 'process';
            } elseif ($week >= 9 && $week <= 11) {
                return 'business_environment';
            }
        }
        
        return 'mixed'; // Default for intro/review weeks
    }
    
    /**
     * Get week focus domain
     * 
     * @param int $week Week number
     * @return string Focus domain
     */
    private function get_week_focus_domain($week) {
        if ($week >= 2 && $week <= 4) {
            return 'people';
        } elseif ($week >= 5 && $week <= 8) {
            return 'process';
        } elseif ($week >= 9 && $week <= 11) {
            return 'business_environment';
        }
        
        return 'mixed';
    }
    
    /**
     * Initialize progress data for new user
     * 
     * @return array Initial progress data
     */
    private function initialize_progress_data() {
        $initial_data = [
            'percentage' => 0.0,
            'completed_lessons' => 0,
            'total_lessons' => 91,
            'current_week' => 1,
            'total_time_spent' => 0,
            'last_activity' => current_time('mysql'),
            'study_streak' => 0,
            'started_date' => current_time('mysql')
        ];
        
        update_user_meta($this->user_id, 'pmp_overall_progress', $initial_data);
        return $initial_data;
    }
    
    /**
     * Update lesson-specific metadata
     * 
     * @param string $lesson_id Lesson identifier
     * @param array $progress_data Progress data
     */
    private function update_lesson_meta($lesson_id, $progress_data) {
        update_user_meta($this->user_id, "pmp_lesson_progress_{$lesson_id}", $progress_data);
    }
    
    /**
     * Log progress event for analytics
     * 
     * @param string $lesson_id Lesson identifier
     * @param string $event_type Event type
     * @param array $event_data Event data
     */
    private function log_progress_event($lesson_id, $event_type, $event_data = []) {
        $events = get_user_meta($this->user_id, 'pmp_progress_events', true);
        
        if (!is_array($events)) {
            $events = [];
        }
        
        $event = [
            'lesson_id' => $lesson_id,
            'event_type' => $event_type,
            'timestamp' => current_time('mysql'),
            'data' => $event_data
        ];
        
        array_unshift($events, $event);
        
        // Keep only last 100 events
        $events = array_slice($events, 0, 100);
        
        update_user_meta($this->user_id, 'pmp_progress_events', $events);
    }
    
    /**
     * Calculate study streak
     * 
     * @return int Study streak in days
     */
    private function calculate_study_streak() {
        $events = get_user_meta($this->user_id, 'pmp_progress_events', true);
        
        if (empty($events)) {
            return 0;
        }
        
        $streak = 0;
        $current_date = date('Y-m-d');
        
        for ($i = 0; $i < 30; $i++) { // Check last 30 days
            $check_date = date('Y-m-d', strtotime("-{$i} days"));
            $has_activity = false;
            
            foreach ($events as $event) {
                if (date('Y-m-d', strtotime($event['timestamp'])) === $check_date) {
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
     * Calculate learning pace
     * 
     * @return string Pace description (ahead, on-track, behind)
     */
    private function calculate_learning_pace() {
        $overall_progress = $this->get_overall_progress();
        $weeks_since_start = $this->get_weeks_since_start();
        
        if ($weeks_since_start <= 0) {
            return 'just-started';
        }
        
        $expected_lessons = $weeks_since_start * 7;
        $actual_lessons = $overall_progress['completed_lessons'];
        
        if ($actual_lessons >= $expected_lessons * 1.1) {
            return 'ahead';
        } elseif ($actual_lessons >= $expected_lessons * 0.9) {
            return 'on-track';
        } else {
            return 'behind';
        }
    }
    
    /**
     * Calculate study consistency
     * 
     * @return float Consistency score (0-100)
     */
    private function calculate_study_consistency() {
        $events = get_user_meta($this->user_id, 'pmp_progress_events', true);
        
        if (empty($events) || count($events) < 7) {
            return 0;
        }
        
        // Analyze activity distribution over last 7 days
        $daily_activity = [];
        for ($i = 0; $i < 7; $i++) {
            $date = date('Y-m-d', strtotime("-{$i} days"));
            $daily_activity[$date] = 0;
        }
        
        foreach ($events as $event) {
            $event_date = date('Y-m-d', strtotime($event['timestamp']));
            if (isset($daily_activity[$event_date])) {
                $daily_activity[$event_date]++;
            }
        }
        
        $active_days = count(array_filter($daily_activity));
        return ($active_days / 7) * 100;
    }
    
    /**
     * Calculate learning efficiency
     * 
     * @return float Efficiency score (0-100)
     */
    private function calculate_learning_efficiency() {
        $overall_progress = $this->get_overall_progress();
        
        if ($overall_progress['total_time_spent'] <= 0) {
            return 0;
        }
        
        $expected_time_per_lesson = 20; // minutes
        $actual_time_per_lesson = $overall_progress['total_time_spent'] / max(1, $overall_progress['completed_lessons']);
        
        // Efficiency is better when actual time is close to expected time
        $efficiency = 100 - abs($actual_time_per_lesson - $expected_time_per_lesson);
        return max(0, min(100, $efficiency));
    }
    
    /**
     * Identify domain strengths
     * 
     * @param array $domain_progress Domain progress data
     * @return array Strength analysis
     */
    private function identify_domain_strengths($domain_progress) {
        $strengths = [];
        
        foreach ($domain_progress as $domain => $data) {
            if ($data['percentage'] >= 80) {
                $strengths[] = [
                    'domain' => $domain,
                    'percentage' => $data['percentage'],
                    'level' => 'excellent'
                ];
            } elseif ($data['percentage'] >= 60) {
                $strengths[] = [
                    'domain' => $domain,
                    'percentage' => $data['percentage'],
                    'level' => 'good'
                ];
            }
        }
        
        return $strengths;
    }
    
    /**
     * Identify areas for improvement
     * 
     * @param array $domain_progress Domain progress data
     * @return array Improvement areas
     */
    private function identify_improvement_areas($domain_progress) {
        $improvements = [];
        
        foreach ($domain_progress as $domain => $data) {
            if ($data['percentage'] < 40) {
                $improvements[] = [
                    'domain' => $domain,
                    'percentage' => $data['percentage'],
                    'priority' => 'high',
                    'recommendation' => "Focus more time on {$domain} domain concepts"
                ];
            } elseif ($data['percentage'] < 60) {
                $improvements[] = [
                    'domain' => $domain,
                    'percentage' => $data['percentage'],
                    'priority' => 'medium',
                    'recommendation' => "Review and practice {$domain} domain materials"
                ];
            }
        }
        
        return $improvements;
    }
    
    /**
     * Analyze study patterns
     * 
     * @return array Study pattern analysis
     */
    private function analyze_study_patterns() {
        $events = get_user_meta($this->user_id, 'pmp_progress_events', true);
        
        if (empty($events)) {
            return [];
        }
        
        $patterns = [
            'preferred_study_times' => $this->analyze_study_times($events),
            'session_lengths' => $this->analyze_session_lengths($events),
            'weekly_distribution' => $this->analyze_weekly_distribution($events),
            'learning_velocity' => $this->analyze_learning_velocity($events)
        ];
        
        return $patterns;
    }
    
    /**
     * Generate personalized recommendations
     * 
     * @return array Recommendations
     */
    private function generate_recommendations() {
        $overall_progress = $this->get_overall_progress();
        $domain_progress = $this->get_domain_progress();
        $pace = $this->calculate_learning_pace();
        
        $recommendations = [];
        
        // Pace-based recommendations
        if ($pace === 'behind') {
            $recommendations[] = [
                'type' => 'pace',
                'priority' => 'high',
                'title' => 'Increase Study Frequency',
                'description' => 'Consider studying more frequently to catch up with the recommended pace.'
            ];
        } elseif ($pace === 'ahead') {
            $recommendations[] = [
                'type' => 'pace',
                'priority' => 'low',
                'title' => 'Great Progress!',
                'description' => 'You\'re ahead of schedule. Consider reviewing previous materials for reinforcement.'
            ];
        }
        
        // Domain-based recommendations
        foreach ($domain_progress as $domain => $data) {
            if ($data['percentage'] < 50) {
                $recommendations[] = [
                    'type' => 'domain',
                    'priority' => 'medium',
                    'title' => "Focus on " . ucfirst($domain) . " Domain",
                    'description' => "Spend extra time on {$domain} concepts to improve your understanding."
                ];
            }
        }
        
        return $recommendations;
    }
    
    /**
     * Get milestone progress
     * 
     * @return array Milestone data
     */
    private function get_milestone_progress() {
        $overall_progress = $this->get_overall_progress();
        $completed = $overall_progress['completed_lessons'];
        
        $milestones = [
            ['lessons' => 10, 'title' => 'Getting Started', 'achieved' => $completed >= 10],
            ['lessons' => 25, 'title' => 'Quarter Complete', 'achieved' => $completed >= 25],
            ['lessons' => 45, 'title' => 'Halfway There', 'achieved' => $completed >= 45],
            ['lessons' => 70, 'title' => 'Three Quarters', 'achieved' => $completed >= 70],
            ['lessons' => 91, 'title' => 'Course Complete', 'achieved' => $completed >= 91]
        ];
        
        return $milestones;
    }
    
    /**
     * Get comparative performance data
     * 
     * @return array Comparative data
     */
    private function get_comparative_performance() {
        // This would typically compare against other users
        // For now, return sample comparative data
        return [
            'percentile' => 75, // User is in 75th percentile
            'average_completion_time' => '10 weeks',
            'user_projected_time' => $this->calculate_estimated_completion(),
            'faster_than_percent' => 68
        ];
    }
    
    /**
     * Get weeks since course start
     * 
     * @return int Weeks since start
     */
    private function get_weeks_since_start() {
        $overall_progress = $this->get_overall_progress();
        $start_date = $overall_progress['started_date'] ?? current_time('mysql');
        
        $weeks = (strtotime(current_time('mysql')) - strtotime($start_date)) / (7 * 24 * 60 * 60);
        return max(0, floor($weeks));
    }
    
    /**
     * Analyze study times from events
     * 
     * @param array $events Progress events
     * @return array Study time analysis
     */
    private function analyze_study_times($events) {
        $hour_counts = array_fill(0, 24, 0);
        
        foreach ($events as $event) {
            $hour = intval(date('H', strtotime($event['timestamp'])));
            $hour_counts[$hour]++;
        }
        
        $peak_hour = array_search(max($hour_counts), $hour_counts);
        
        return [
            'peak_hour' => $peak_hour,
            'distribution' => $hour_counts,
            'preferred_time' => $this->get_time_period($peak_hour)
        ];
    }
    
    /**
     * Analyze session lengths
     * 
     * @param array $events Progress events
     * @return array Session length analysis
     */
    private function analyze_session_lengths($events) {
        // This would require more detailed session tracking
        // For now, return sample data
        return [
            'average_length' => 25, // minutes
            'preferred_length' => '20-30 minutes',
            'efficiency_peak' => 22 // minutes
        ];
    }
    
    /**
     * Analyze weekly distribution
     * 
     * @param array $events Progress events
     * @return array Weekly distribution
     */
    private function analyze_weekly_distribution($events) {
        $day_counts = array_fill(0, 7, 0);
        
        foreach ($events as $event) {
            $day = intval(date('w', strtotime($event['timestamp'])));
            $day_counts[$day]++;
        }
        
        return [
            'distribution' => $day_counts,
            'most_active_day' => array_search(max($day_counts), $day_counts),
            'least_active_day' => array_search(min($day_counts), $day_counts)
        ];
    }
    
    /**
     * Analyze learning velocity
     * 
     * @param array $events Progress events
     * @return array Velocity analysis
     */
    private function analyze_learning_velocity($events) {
        if (count($events) < 2) {
            return ['trend' => 'insufficient_data'];
        }
        
        // Calculate lessons per week over time
        $recent_velocity = count(array_filter($events, function($event) {
            return strtotime($event['timestamp']) > strtotime('-1 week');
        }));
        
        return [
            'recent_velocity' => $recent_velocity,
            'trend' => $recent_velocity > 7 ? 'increasing' : ($recent_velocity < 5 ? 'decreasing' : 'stable')
        ];
    }
    
    /**
     * Get time period description
     * 
     * @param int $hour Hour (0-23)
     * @return string Time period
     */
    private function get_time_period($hour) {
        if ($hour >= 6 && $hour < 12) {
            return 'morning';
        } elseif ($hour >= 12 && $hour < 18) {
            return 'afternoon';
        } elseif ($hour >= 18 && $hour < 22) {
            return 'evening';
        } else {
            return 'night';
        }
    }
}