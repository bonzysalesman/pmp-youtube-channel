<?php
/**
 * Tests for PMP_Dashboard class
 */

class Test_PMP_Dashboard extends PHPUnit\Framework\TestCase {
    
    private $dashboard;
    private $test_user_id = 1;
    
    public function setUp(): void {
        parent::setUp();
        
        // Set up test user with sample data
        PMP_Mock_User_Helper::setup_test_user($this->test_user_id);
        
        // Create dashboard instance
        $this->dashboard = new PMP_Dashboard($this->test_user_id, 'pmp-prep-course');
    }
    
    public function tearDown(): void {
        PMP_Mock_User_Helper::reset_user_data();
        parent::tearDown();
    }
    
    /**
     * Test constructor initializes properly
     */
    public function test_constructor_initializes_properly() {
        $dashboard = new PMP_Dashboard($this->test_user_id, 'test-course');
        
        $this->assertInstanceOf('PMP_Dashboard', $dashboard);
    }
    
    /**
     * Test get_progress_stats returns valid data structure
     */
    public function test_get_progress_stats_returns_valid_data() {
        $stats = $this->dashboard->get_progress_stats();
        
        $this->assertIsArray($stats);
        
        // Check required keys
        $required_keys = ['percentage', 'completed', 'total', 'current_week', 'lessons_completed', 'time_spent', 'last_activity'];
        foreach ($required_keys as $key) {
            $this->assertArrayHasKey($key, $stats);
        }
        
        // Validate data types and ranges
        $this->assertIsFloat($stats['percentage']);
        $this->assertIsInt($stats['completed']);
        $this->assertIsInt($stats['total']);
        $this->assertIsInt($stats['current_week']);
        $this->assertIsArray($stats['lessons_completed']);
        
        $this->assertGreaterThanOrEqual(0, $stats['percentage']);
        $this->assertLessThanOrEqual(100, $stats['percentage']);
        $this->assertGreaterThanOrEqual(1, $stats['current_week']);
        $this->assertLessThanOrEqual(13, $stats['current_week']);
    }
    
    /**
     * Test get_next_lesson returns proper object structure
     */
    public function test_get_next_lesson_returns_proper_object() {
        $next_lesson = $this->dashboard->get_next_lesson();
        
        $this->assertIsObject($next_lesson);
        
        // Check required properties
        $required_properties = [
            'id', 'title', 'description', 'thumbnail', 'duration', 'url', 
            'week', 'module', 'difficulty', 'eco_tasks', 'prerequisites', 
            'estimated_time', 'completion_rate', 'is_recommended', 'recommendation_reason'
        ];
        
        foreach ($required_properties as $property) {
            $this->assertObjectHasAttribute($property, $next_lesson);
        }
        
        // Validate data types
        $this->assertIsString($next_lesson->id);
        $this->assertIsString($next_lesson->title);
        $this->assertIsString($next_lesson->description);
        $this->assertIsString($next_lesson->url);
        $this->assertIsInt($next_lesson->week);
        $this->assertIsArray($next_lesson->eco_tasks);
        $this->assertIsFloat($next_lesson->completion_rate);
        $this->assertIsBool($next_lesson->is_recommended);
    }
    
    /**
     * Test get_recent_activity returns valid array
     */
    public function test_get_recent_activity_returns_valid_array() {
        $activities = $this->dashboard->get_recent_activity();
        
        $this->assertIsArray($activities);
        
        if (!empty($activities)) {
            $first_activity = $activities[0];
            
            // Check required keys
            $required_keys = ['title', 'type', 'timestamp', 'formatted_time', 'icon', 'color', 'url'];
            foreach ($required_keys as $key) {
                $this->assertArrayHasKey($key, $first_activity);
            }
            
            // Validate activity types
            $valid_types = ['completed', 'started', 'quiz', 'resource', 'achievement', 'welcome', 'system', 'practice', 'review'];
            $this->assertContains($first_activity['type'], $valid_types);
        }
    }
    
    /**
     * Test render_progress_circle generates valid SVG
     */
    public function test_render_progress_circle_generates_valid_svg() {
        $percentage = 75.5;
        $html = $this->dashboard->render_progress_circle($percentage);
        
        $this->assertIsString($html);
        $this->assertNotEmpty($html);
        
        // Check for SVG elements
        $this->assertStringContainsString('<svg', $html);
        $this->assertStringContainsString('progress-circle', $html);
        $this->assertStringContainsString('viewBox="0 0 120 120"', $html);
        
        // Check for progress text
        $this->assertStringContainsString('75.5%', $html);
        $this->assertStringContainsString('Complete', $html);
        
        // Check for accessibility
        $this->assertStringContainsString('text-anchor="middle"', $html);
    }
    
    /**
     * Test render_dashboard generates complete HTML
     */
    public function test_render_dashboard_generates_complete_html() {
        $html = $this->dashboard->render_dashboard();
        
        $this->assertIsString($html);
        $this->assertNotEmpty($html);
        
        // Check for main dashboard structure
        $this->assertStringContainsString('pmp-dashboard', $html);
        $this->assertStringContainsString('dashboard-progress', $html);
        $this->assertStringContainsString('dashboard-next-lesson', $html);
        $this->assertStringContainsString('dashboard-activity', $html);
    }
    
    /**
     * Test log_activity adds activity correctly
     */
    public function test_log_activity_adds_activity_correctly() {
        $initial_activities = $this->dashboard->get_recent_activity();
        $initial_count = count($initial_activities);
        
        $this->dashboard->log_activity('Test Activity', 'completed', ['lesson_id' => 'test-lesson']);
        
        $updated_activities = $this->dashboard->get_recent_activity();
        $updated_count = count($updated_activities);
        
        $this->assertGreaterThan($initial_count, $updated_count);
        
        // Check that new activity is at the top
        $latest_activity = $updated_activities[0];
        $this->assertEquals('Test Activity', $latest_activity['title']);
        $this->assertEquals('completed', $latest_activity['type']);
    }
    
    /**
     * Test update_lesson_progress updates correctly
     */
    public function test_update_lesson_progress_updates_correctly() {
        $lesson_id = 'lesson-test-01';
        $initial_stats = $this->dashboard->get_progress_stats();
        $initial_completed = $initial_stats['completed'];
        
        $this->dashboard->update_lesson_progress($lesson_id, 100);
        
        $updated_stats = $this->dashboard->get_progress_stats();
        
        // Should have one more completed lesson
        $this->assertEquals($initial_completed + 1, $updated_stats['completed']);
        $this->assertContains($lesson_id, $updated_stats['lessons_completed']);
        
        // Percentage should be updated
        $expected_percentage = ($updated_stats['completed'] / $updated_stats['total']) * 100;
        $this->assertEquals($expected_percentage, $updated_stats['percentage']);
    }
    
    /**
     * Test get_dashboard_summary returns comprehensive data
     */
    public function test_get_dashboard_summary_returns_comprehensive_data() {
        $summary = $this->dashboard->get_dashboard_summary();
        
        $this->assertIsArray($summary);
        
        $required_keys = [
            'progress_percentage', 'lessons_completed', 'lessons_remaining', 
            'current_week', 'next_lesson_title', 'estimated_completion', 
            'study_streak', 'achievements_earned'
        ];
        
        foreach ($required_keys as $key) {
            $this->assertArrayHasKey($key, $summary);
        }
        
        // Validate data consistency
        $this->assertEquals(
            $summary['lessons_completed'] + $summary['lessons_remaining'],
            91 // Total lessons in course
        );
    }
    
    /**
     * Test get_motivational_message returns appropriate message
     */
    public function test_get_motivational_message_returns_appropriate_message() {
        $message = $this->dashboard->get_motivational_message();
        
        $this->assertIsString($message);
        $this->assertNotEmpty($message);
        
        // Should contain encouraging language
        $encouraging_words = ['great', 'excellent', 'amazing', 'welcome', 'keep', 'almost'];
        $contains_encouraging = false;
        
        foreach ($encouraging_words as $word) {
            if (stripos($message, $word) !== false) {
                $contains_encouraging = true;
                break;
            }
        }
        
        $this->assertTrue($contains_encouraging, 'Message should contain encouraging language');
    }
    
    /**
     * Test dashboard with new user
     */
    public function test_dashboard_with_new_user() {
        $new_user_id = 999;
        PMP_Mock_User_Helper::create_new_user($new_user_id);
        
        $dashboard = new PMP_Dashboard($new_user_id);
        $stats = $dashboard->get_progress_stats();
        
        $this->assertEquals(0, $stats['completed']);
        $this->assertEquals(0.0, $stats['percentage']);
        $this->assertEquals(1, $stats['current_week']);
        
        // Should have default progress structure
        $this->assertArrayHasKey('lessons_completed', $stats);
        $this->assertEmpty($stats['lessons_completed']);
    }
    
    /**
     * Test dashboard with completed user
     */
    public function test_dashboard_with_completed_user() {
        $completed_user_id = 998;
        PMP_Mock_User_Helper::create_completed_user($completed_user_id);
        
        $dashboard = new PMP_Dashboard($completed_user_id);
        $next_lesson = $dashboard->get_next_lesson();
        
        // Should return completion message
        $this->assertEquals('completed', $next_lesson->id);
        $this->assertStringContainsString('Congratulations', $next_lesson->title);
        $this->assertEquals(13, $next_lesson->week);
    }
    
    /**
     * Test progress circle with edge cases
     */
    public function test_progress_circle_with_edge_cases() {
        // Test with 0%
        $html_zero = $this->dashboard->render_progress_circle(0);
        $this->assertStringContainsString('0.0%', $html_zero);
        
        // Test with 100%
        $html_complete = $this->dashboard->render_progress_circle(100);
        $this->assertStringContainsString('100.0%', $html_complete);
        
        // Test with decimal
        $html_decimal = $this->dashboard->render_progress_circle(33.7);
        $this->assertStringContainsString('33.7%', $html_decimal);
    }
    
    /**
     * Test activity logging with different types
     */
    public function test_activity_logging_with_different_types() {
        $activity_types = ['completed', 'started', 'quiz', 'resource', 'achievement'];
        
        foreach ($activity_types as $type) {
            $this->dashboard->log_activity("Test {$type} activity", $type);
        }
        
        $activities = $this->dashboard->get_recent_activity();
        
        // Should have at least the activities we just added
        $this->assertGreaterThanOrEqual(count($activity_types), count($activities));
        
        // Check that different types are handled
        $found_types = array_column($activities, 'type');
        foreach ($activity_types as $type) {
            $this->assertContains($type, $found_types);
        }
    }
    
    /**
     * Test render methods return non-empty strings
     */
    public function test_render_methods_return_non_empty_strings() {
        $progress_stats = $this->dashboard->get_progress_stats();
        $next_lesson = $this->dashboard->get_next_lesson();
        $activities = $this->dashboard->get_recent_activity();
        
        // Test progress statistics rendering
        $progress_html = $this->dashboard->render_progress_statistics($progress_stats);
        $this->assertIsString($progress_html);
        $this->assertNotEmpty($progress_html);
        
        // All render methods should return valid HTML
        $dashboard_html = $this->dashboard->render_dashboard();
        $this->assertStringContainsString('<div', $dashboard_html);
    }
    
    /**
     * Test performance of dashboard rendering
     */
    public function test_dashboard_rendering_performance() {
        $start_time = microtime(true);
        
        // Render dashboard multiple times
        for ($i = 0; $i < 5; $i++) {
            $this->dashboard->render_dashboard();
        }
        
        $end_time = microtime(true);
        $execution_time = $end_time - $start_time;
        
        // Should complete within reasonable time (0.5 seconds for 5 renders)
        $this->assertLessThan(0.5, $execution_time);
    }
}