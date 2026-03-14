<?php
/**
 * Tests for PMP_Progress_Tracker class
 */

class Test_PMP_Progress_Tracker extends PHPUnit\Framework\TestCase {
    
    private $progress_tracker;
    private $test_user_id = 1;
    
    public function setUp(): void {
        parent::setUp();
        
        // Set up test user with sample data
        PMP_Mock_User_Helper::setup_test_user($this->test_user_id);
        
        // Create progress tracker instance
        $this->progress_tracker = new PMP_Progress_Tracker($this->test_user_id, 'pmp-prep-course');
    }
    
    public function tearDown(): void {
        PMP_Mock_User_Helper::reset_user_data();
        parent::tearDown();
    }
    
    /**
     * Test constructor initializes properly
     */
    public function test_constructor_initializes_properly() {
        $tracker = new PMP_Progress_Tracker($this->test_user_id, 'test-course');
        
        $this->assertInstanceOf('PMP_Progress_Tracker', $tracker);
    }
    
    /**
     * Test get_overall_progress returns valid structure
     */
    public function test_get_overall_progress_returns_valid_structure() {
        $progress = $this->progress_tracker->get_overall_progress();
        
        $this->assertIsArray($progress);
        
        // Check required keys
        $required_keys = [
            'percentage', 'completed_lessons', 'total_lessons', 'current_week',
            'total_time_spent', 'average_session_time', 'lessons_per_week',
            'estimated_completion_date', 'last_activity', 'study_streak',
            'weekly_goals_met', 'performance_trend'
        ];
        
        foreach ($required_keys as $key) {
            $this->assertArrayHasKey($key, $progress);
        }
        
        // Validate data types and ranges
        $this->assertIsFloat($progress['percentage']);
        $this->assertIsInt($progress['completed_lessons']);
        $this->assertIsInt($progress['total_lessons']);
        $this->assertIsInt($progress['current_week']);
        
        $this->assertGreaterThanOrEqual(0, $progress['percentage']);
        $this->assertLessThanOrEqual(100, $progress['percentage']);
        $this->assertGreaterThanOrEqual(1, $progress['current_week']);
        $this->assertLessThanOrEqual(13, $progress['current_week']);
    }
    
    /**
     * Test get_domain_progress returns proper structure
     */
    public function test_get_domain_progress_returns_proper_structure() {
        $domain_progress = $this->progress_tracker->get_domain_progress();
        
        $this->assertIsArray($domain_progress);
        
        // Check for all three domains
        $expected_domains = ['people', 'process', 'business_environment'];
        foreach ($expected_domains as $domain) {
            $this->assertArrayHasKey($domain, $domain_progress);
            
            $domain_data = $domain_progress[$domain];
            $required_keys = [
                'percentage', 'completed_lessons', 'total_lessons', 'average_score',
                'time_spent', 'strengths', 'areas_for_improvement'
            ];
            
            foreach ($required_keys as $key) {
                $this->assertArrayHasKey($key, $domain_data);
            }
            
            // Validate data types
            $this->assertIsFloat($domain_data['percentage']);
            $this->assertIsInt($domain_data['completed_lessons']);
            $this->assertIsInt($domain_data['total_lessons']);
            $this->assertIsArray($domain_data['strengths']);
            $this->assertIsArray($domain_data['areas_for_improvement']);
        }
    }
    
    /**
     * Test get_weekly_progress returns 13 weeks
     */
    public function test_get_weekly_progress_returns_thirteen_weeks() {
        $weekly_progress = $this->progress_tracker->get_weekly_progress();
        
        $this->assertIsArray($weekly_progress);
        $this->assertCount(13, $weekly_progress);
        
        // Check structure of first week
        $week_1 = $weekly_progress['week_1'];
        $required_keys = [
            'week_number', 'percentage', 'completed_lessons', 'total_lessons',
            'time_spent', 'average_score', 'started_date', 'completed_date',
            'goal_met', 'focus_domain'
        ];
        
        foreach ($required_keys as $key) {
            $this->assertArrayHasKey($key, $week_1);
        }
        
        $this->assertEquals(1, $week_1['week_number']);
        $this->assertEquals(7, $week_1['total_lessons']);
        $this->assertIsBool($week_1['goal_met']);
    }
    
    /**
     * Test update_lesson_progress updates correctly
     */
    public function test_update_lesson_progress_updates_correctly() {
        $lesson_id = 'lesson-test-01';
        $completion_percentage = 75.5;
        
        // Update lesson progress
        $this->progress_tracker->update_lesson_progress($lesson_id, $completion_percentage, [
            'session_time' => 25
        ]);
        
        // Get lesson progress
        $lesson_progress = $this->progress_tracker->get_lesson_progress($lesson_id);
        
        $this->assertEquals($lesson_id, $lesson_progress['lesson_id']);
        $this->assertEquals($completion_percentage, $lesson_progress['completion_percentage']);
        $this->assertFalse($lesson_progress['completed']); // Not 100% yet
        $this->assertEquals(25, $lesson_progress['time_spent']);
        $this->assertEquals(1, $lesson_progress['attempts']);
    }
    
    /**
     * Test lesson completion at 100%
     */
    public function test_lesson_completion_at_hundred_percent() {
        $lesson_id = 'lesson-completion-test';
        
        // Complete lesson
        $this->progress_tracker->update_lesson_progress($lesson_id, 100, [
            'session_time' => 20
        ]);
        
        $lesson_progress = $this->progress_tracker->get_lesson_progress($lesson_id);
        
        $this->assertTrue($lesson_progress['completed']);
        $this->assertNotNull($lesson_progress['completion_date']);
        $this->assertEquals(100, $lesson_progress['completion_percentage']);
    }
    
    /**
     * Test calculate_estimated_completion returns valid date
     */
    public function test_calculate_estimated_completion_returns_valid_date() {
        $completion_date = $this->progress_tracker->calculate_estimated_completion();
        
        $this->assertIsString($completion_date);
        
        // Should either be a valid date format or completion message
        if ($completion_date !== 'Course completed!') {
            $this->assertMatchesRegularExpression('/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/', $completion_date);
        }
    }
    
    /**
     * Test get_performance_analytics returns comprehensive data
     */
    public function test_get_performance_analytics_returns_comprehensive_data() {
        $analytics = $this->progress_tracker->get_performance_analytics();
        
        $this->assertIsArray($analytics);
        
        $required_sections = [
            'overall_performance', 'domain_strengths', 'areas_for_improvement',
            'study_patterns', 'recommendations', 'milestones', 'comparative_performance'
        ];
        
        foreach ($required_sections as $section) {
            $this->assertArrayHasKey($section, $analytics);
        }
        
        // Check overall performance structure
        $overall = $analytics['overall_performance'];
        $performance_keys = ['completion_rate', 'pace', 'consistency', 'efficiency'];
        
        foreach ($performance_keys as $key) {
            $this->assertArrayHasKey($key, $overall);
        }
        
        // Validate pace values
        $valid_paces = ['just-started', 'ahead', 'on-track', 'behind'];
        $this->assertContains($overall['pace'], $valid_paces);
    }
    
    /**
     * Test get_lesson_progress with new lesson
     */
    public function test_get_lesson_progress_with_new_lesson() {
        $new_lesson_id = 'lesson-new-test';
        $progress = $this->progress_tracker->get_lesson_progress($new_lesson_id);
        
        $this->assertIsArray($progress);
        $this->assertEquals($new_lesson_id, $progress['lesson_id']);
        $this->assertEquals(0, $progress['completion_percentage']);
        $this->assertFalse($progress['completed']);
        $this->assertEquals(0, $progress['time_spent']);
        $this->assertEquals(0, $progress['attempts']);
        $this->assertNull($progress['first_started']);
        $this->assertNull($progress['completion_date']);
    }
    
    /**
     * Test progress tracking with multiple lessons
     */
    public function test_progress_tracking_with_multiple_lessons() {
        $lessons = ['lesson-multi-01', 'lesson-multi-02', 'lesson-multi-03'];
        
        foreach ($lessons as $index => $lesson_id) {
            $this->progress_tracker->update_lesson_progress($lesson_id, 100, [
                'session_time' => 20
            ]);
        }
        
        $overall_progress = $this->progress_tracker->get_overall_progress();
        
        // Should have increased completed lessons count
        $this->assertGreaterThanOrEqual(3, $overall_progress['completed_lessons']);
        
        // Percentage should be updated
        $expected_percentage = ($overall_progress['completed_lessons'] / 91) * 100;
        $this->assertEquals($expected_percentage, $overall_progress['percentage']);
    }
    
    /**
     * Test domain progress calculation
     */
    public function test_domain_progress_calculation() {
        // Complete lessons from different domains
        $people_lesson = 'lesson-02-01'; // Week 2 = People domain
        $process_lesson = 'lesson-05-01'; // Week 5 = Process domain
        $business_lesson = 'lesson-09-01'; // Week 9 = Business Environment domain
        
        $this->progress_tracker->update_lesson_progress($people_lesson, 100);
        $this->progress_tracker->update_lesson_progress($process_lesson, 100);
        $this->progress_tracker->update_lesson_progress($business_lesson, 100);
        
        $domain_progress = $this->progress_tracker->get_domain_progress();
        
        // Each domain should have at least one completed lesson
        $this->assertGreaterThan(0, $domain_progress['people']['completed_lessons']);
        $this->assertGreaterThan(0, $domain_progress['process']['completed_lessons']);
        $this->assertGreaterThan(0, $domain_progress['business_environment']['completed_lessons']);
    }
    
    /**
     * Test progress bounds validation
     */
    public function test_progress_bounds_validation() {
        $lesson_id = 'lesson-bounds-test';
        
        // Test negative percentage
        $this->progress_tracker->update_lesson_progress($lesson_id, -10);
        $progress = $this->progress_tracker->get_lesson_progress($lesson_id);
        $this->assertEquals(0, $progress['completion_percentage']);
        
        // Test over 100 percentage
        $this->progress_tracker->update_lesson_progress($lesson_id, 150);
        $progress = $this->progress_tracker->get_lesson_progress($lesson_id);
        $this->assertEquals(100, $progress['completion_percentage']);
    }
    
    /**
     * Test weekly progress calculation
     */
    public function test_weekly_progress_calculation() {
        $weekly_progress = $this->progress_tracker->get_weekly_progress();
        
        // Test week focus domains
        $this->assertEquals('mixed', $weekly_progress['week_1']['focus_domain']);
        $this->assertEquals('people', $weekly_progress['week_2']['focus_domain']);
        $this->assertEquals('people', $weekly_progress['week_3']['focus_domain']);
        $this->assertEquals('people', $weekly_progress['week_4']['focus_domain']);
        $this->assertEquals('process', $weekly_progress['week_5']['focus_domain']);
        $this->assertEquals('process', $weekly_progress['week_8']['focus_domain']);
        $this->assertEquals('business_environment', $weekly_progress['week_9']['focus_domain']);
        $this->assertEquals('business_environment', $weekly_progress['week_11']['focus_domain']);
        $this->assertEquals('mixed', $weekly_progress['week_12']['focus_domain']);
    }
    
    /**
     * Test performance analytics with completed user
     */
    public function test_performance_analytics_with_completed_user() {
        $completed_user_id = 998;
        PMP_Mock_User_Helper::create_completed_user($completed_user_id);
        
        $tracker = new PMP_Progress_Tracker($completed_user_id);
        $analytics = $tracker->get_performance_analytics();
        
        $this->assertEquals(100, $analytics['overall_performance']['completion_rate']);
        
        // Should have milestones achieved
        $milestones = $analytics['milestones'];
        foreach ($milestones as $milestone) {
            $this->assertTrue($milestone['achieved']);
        }
    }
    
    /**
     * Test performance analytics with new user
     */
    public function test_performance_analytics_with_new_user() {
        $new_user_id = 999;
        PMP_Mock_User_Helper::create_new_user($new_user_id);
        
        $tracker = new PMP_Progress_Tracker($new_user_id);
        $analytics = $tracker->get_performance_analytics();
        
        $this->assertEquals(0, $analytics['overall_performance']['completion_rate']);
        $this->assertEquals('just-started', $analytics['overall_performance']['pace']);
        
        // Should have no milestones achieved
        $milestones = $analytics['milestones'];
        foreach ($milestones as $milestone) {
            $this->assertFalse($milestone['achieved']);
        }
    }
    
    /**
     * Test lesson progress persistence
     */
    public function test_lesson_progress_persistence() {
        $lesson_id = 'lesson-persistence-test';
        
        // Update progress multiple times
        $this->progress_tracker->update_lesson_progress($lesson_id, 25, ['session_time' => 10]);
        $this->progress_tracker->update_lesson_progress($lesson_id, 50, ['session_time' => 15]);
        $this->progress_tracker->update_lesson_progress($lesson_id, 75, ['session_time' => 20]);
        
        $progress = $this->progress_tracker->get_lesson_progress($lesson_id);
        
        // Should have latest progress
        $this->assertEquals(75, $progress['completion_percentage']);
        
        // Should accumulate time spent
        $this->assertEquals(45, $progress['time_spent']); // 10 + 15 + 20
        
        // Should track attempts
        $this->assertEquals(3, $progress['attempts']);
    }
    
    /**
     * Test estimated completion with different progress levels
     */
    public function test_estimated_completion_with_different_progress_levels() {
        // Test with partial progress user
        $partial_user_id = 997;
        PMP_Mock_User_Helper::create_partial_progress_user($partial_user_id);
        
        $tracker = new PMP_Progress_Tracker($partial_user_id);
        $completion_date = $tracker->calculate_estimated_completion();
        
        $this->assertIsString($completion_date);
        $this->assertNotEquals('Course completed!', $completion_date);
        
        // Should be a future date
        $completion_timestamp = strtotime($completion_date);
        $this->assertGreaterThan(time(), $completion_timestamp);
    }
    
    /**
     * Test performance with large dataset
     */
    public function test_performance_with_large_dataset() {
        $start_time = microtime(true);
        
        // Simulate updating progress for many lessons
        for ($i = 1; $i <= 20; $i++) {
            $lesson_id = sprintf('lesson-perf-%02d', $i);
            $this->progress_tracker->update_lesson_progress($lesson_id, 100, [
                'session_time' => rand(15, 30)
            ]);
        }
        
        // Get analytics
        $analytics = $this->progress_tracker->get_performance_analytics();
        
        $end_time = microtime(true);
        $execution_time = $end_time - $start_time;
        
        // Should complete within reasonable time (2 seconds)
        $this->assertLessThan(2.0, $execution_time);
        
        // Should still return valid analytics
        $this->assertIsArray($analytics);
        $this->assertArrayHasKey('overall_performance', $analytics);
    }
}