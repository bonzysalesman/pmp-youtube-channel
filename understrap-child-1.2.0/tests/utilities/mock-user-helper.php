<?php
/**
 * Mock User Helper for PMP WordPress Frontend Tests
 */

class PMP_Mock_User_Helper {
    
    private static $user_meta = [];
    
    /**
     * Set up a mock user with test data
     */
    public static function setup_test_user($user_id = 1, $progress_data = null) {
        if ($progress_data === null) {
            $progress_data = PMP_Test_Data_Provider::get_sample_user_progress();
        }
        
        self::$user_meta[$user_id] = [
            'pmp_course_progress' => $progress_data,
            'pmp_completed_lessons' => $progress_data['lessons_completed'],
            'pmp_current_lesson' => 'lesson-01-03',
            'pmp_recent_activity' => PMP_Test_Data_Provider::get_sample_activities(),
            'pmp_achievements' => ['first_lesson_completed']
        ];
        
        // Override WordPress functions to use our test data
        add_filter('get_user_meta_test_data', function($value, $user_id, $key) {
            return self::$user_meta[$user_id][$key] ?? $value;
        }, 10, 3);
    }
    
    /**
     * Reset user data
     */
    public static function reset_user_data() {
        self::$user_meta = [];
    }
    
    /**
     * Get user meta for testing
     */
    public static function get_user_meta($user_id, $key, $single = false) {
        $value = self::$user_meta[$user_id][$key] ?? '';
        
        if ($single) {
            return $value;
        }
        
        return is_array($value) ? $value : [$value];
    }
    
    /**
     * Update user meta for testing
     */
    public static function update_user_meta($user_id, $key, $value) {
        if (!isset(self::$user_meta[$user_id])) {
            self::$user_meta[$user_id] = [];
        }
        
        self::$user_meta[$user_id][$key] = $value;
        return true;
    }
    
    /**
     * Create a user with specific completion status
     */
    public static function create_user_with_completion($user_id, $completed_lessons = [], $percentage = 0) {
        $progress_data = [
            'percentage' => $percentage,
            'completed' => count($completed_lessons),
            'total' => 91,
            'current_week' => max(1, ceil(count($completed_lessons) / 7)),
            'lessons_completed' => $completed_lessons,
            'time_spent' => count($completed_lessons) * 20,
            'last_activity' => current_time('mysql')
        ];
        
        self::setup_test_user($user_id, $progress_data);
        return $progress_data;
    }
    
    /**
     * Create a new user (no progress)
     */
    public static function create_new_user($user_id) {
        return self::create_user_with_completion($user_id, [], 0);
    }
    
    /**
     * Create a user with partial progress
     */
    public static function create_partial_progress_user($user_id) {
        $completed_lessons = ['lesson-01-01', 'lesson-01-02', 'lesson-02-01'];
        return self::create_user_with_completion($user_id, $completed_lessons, 33.0);
    }
    
    /**
     * Create a user with completed course
     */
    public static function create_completed_user($user_id) {
        $all_lessons = [];
        for ($week = 1; $week <= 13; $week++) {
            for ($lesson = 1; $lesson <= 7; $lesson++) {
                $all_lessons[] = sprintf('lesson-%02d-%02d', $week, $lesson);
            }
        }
        
        return self::create_user_with_completion($user_id, $all_lessons, 100.0);
    }
}