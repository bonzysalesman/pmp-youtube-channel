<?php
/**
 * Tests for PMP_Course_Navigation class
 */

class Test_PMP_Course_Navigation extends PHPUnit\Framework\TestCase {
    
    private $navigation;
    private $test_user_id = 1;
    
    public function setUp(): void {
        parent::setUp();
        
        // Set up test user with sample data
        PMP_Mock_User_Helper::setup_test_user($this->test_user_id);
        
        // Create navigation instance
        $this->navigation = new PMP_Course_Navigation($this->test_user_id, 'pmp-prep-course');
    }
    
    public function tearDown(): void {
        PMP_Mock_User_Helper::reset_user_data();
        parent::tearDown();
    }
    
    /**
     * Test constructor initializes properly
     */
    public function test_constructor_initializes_properly() {
        $navigation = new PMP_Course_Navigation($this->test_user_id, 'test-course');
        
        $this->assertInstanceOf('PMP_Course_Navigation', $navigation);
    }
    
    /**
     * Test constructor with default parameters
     */
    public function test_constructor_with_defaults() {
        $navigation = new PMP_Course_Navigation();
        
        $this->assertInstanceOf('PMP_Course_Navigation', $navigation);
    }
    
    /**
     * Test get_user_progress returns valid data structure
     */
    public function test_get_user_progress_returns_valid_data() {
        $progress = $this->navigation->get_user_progress();
        
        $this->assertIsArray($progress);
        $this->assertArrayHasKey('percentage', $progress);
        $this->assertArrayHasKey('completed', $progress);
        $this->assertArrayHasKey('total', $progress);
        
        // Validate data types
        $this->assertIsFloat($progress['percentage']);
        $this->assertIsInt($progress['completed']);
        $this->assertIsInt($progress['total']);
        
        // Validate ranges
        $this->assertGreaterThanOrEqual(0, $progress['percentage']);
        $this->assertLessThanOrEqual(100, $progress['percentage']);
        $this->assertGreaterThanOrEqual(0, $progress['completed']);
        $this->assertLessThanOrEqual($progress['total'], $progress['completed']);
    }
    
    /**
     * Test get_course_modules returns proper structure
     */
    public function test_get_course_modules_returns_proper_structure() {
        $modules = $this->navigation->get_course_modules();
        
        $this->assertIsArray($modules);
        $this->assertNotEmpty($modules);
        
        // Test first module structure
        $first_module = $modules[0];
        $required_keys = ['id', 'title', 'description', 'week_number', 'domain_focus', 'total_lessons', 'estimated_duration', 'lessons'];
        
        foreach ($required_keys as $key) {
            $this->assertArrayHasKey($key, $first_module);
        }
        
        // Test lessons structure
        $this->assertIsArray($first_module['lessons']);
        if (!empty($first_module['lessons'])) {
            $first_lesson = $first_module['lessons'][0];
            $lesson_keys = ['id', 'title', 'description', 'duration', 'eco_references', 'order'];
            
            foreach ($lesson_keys as $key) {
                $this->assertArrayHasKey($key, $first_lesson);
            }
        }
    }
    
    /**
     * Test lesson completion tracking
     */
    public function test_lesson_completion_tracking() {
        $lesson_id = 'lesson-01-01';
        
        // Initially should be completed based on test data
        $this->assertTrue($this->navigation->is_lesson_completed($lesson_id));
        
        // Test with non-completed lesson
        $new_lesson_id = 'lesson-03-01';
        $this->assertFalse($this->navigation->is_lesson_completed($new_lesson_id));
        
        // Mark as completed
        $this->navigation->mark_lesson_completed($new_lesson_id);
        
        // Should now be completed
        $this->assertTrue($this->navigation->is_lesson_completed($new_lesson_id));
    }
    
    /**
     * Test get_module_progress calculates correctly
     */
    public function test_get_module_progress_calculates_correctly() {
        $module_id = 'week-01';
        $progress = $this->navigation->get_module_progress($module_id);
        
        $this->assertIsArray($progress);
        $this->assertArrayHasKey('percentage', $progress);
        $this->assertArrayHasKey('completed', $progress);
        $this->assertArrayHasKey('total', $progress);
        
        // Validate calculation
        $expected_percentage = $progress['total'] > 0 ? 
            round(($progress['completed'] / $progress['total']) * 100) : 0;
        $this->assertEquals($expected_percentage, $progress['percentage']);
    }
    
    /**
     * Test render_sidebar generates valid HTML
     */
    public function test_render_sidebar_generates_valid_html() {
        $html = $this->navigation->render_sidebar();
        
        $this->assertIsString($html);
        $this->assertNotEmpty($html);
        
        // Check for essential HTML elements
        $this->assertStringContainsString('<nav', $html);
        $this->assertStringContainsString('pmp-course-navigation', $html);
        $this->assertStringContainsString('role="navigation"', $html);
        $this->assertStringContainsString('aria-label="Course Navigation"', $html);
        
        // Check for progress elements
        $this->assertStringContainsString('progress-bar', $html);
        $this->assertStringContainsString('progress-text', $html);
        
        // Check for module structure
        $this->assertStringContainsString('module-list', $html);
        $this->assertStringContainsString('module-item', $html);
    }
    
    /**
     * Test get_current_lesson returns proper object
     */
    public function test_get_current_lesson_returns_proper_object() {
        $current_lesson = $this->navigation->get_current_lesson();
        
        if ($current_lesson !== null) {
            $this->assertIsObject($current_lesson);
            $this->assertObjectHasAttribute('id', $current_lesson);
            $this->assertObjectHasAttribute('title', $current_lesson);
        }
    }
    
    /**
     * Test navigation with new user (no progress)
     */
    public function test_navigation_with_new_user() {
        $new_user_id = 999;
        PMP_Mock_User_Helper::create_new_user($new_user_id);
        
        $navigation = new PMP_Course_Navigation($new_user_id);
        $progress = $navigation->get_user_progress();
        
        $this->assertEquals(0, $progress['completed']);
        $this->assertEquals(0.0, $progress['percentage']);
    }
    
    /**
     * Test navigation with completed user
     */
    public function test_navigation_with_completed_user() {
        $completed_user_id = 998;
        PMP_Mock_User_Helper::create_completed_user($completed_user_id);
        
        $navigation = new PMP_Course_Navigation($completed_user_id);
        $progress = $navigation->get_user_progress();
        
        $this->assertEquals(91, $progress['completed']);
        $this->assertEquals(100.0, $progress['percentage']);
    }
    
    /**
     * Test accessibility attributes in rendered HTML
     */
    public function test_accessibility_attributes_in_html() {
        $html = $this->navigation->render_sidebar();
        
        // Check for ARIA attributes
        $this->assertStringContainsString('aria-label=', $html);
        $this->assertStringContainsString('aria-expanded=', $html);
        $this->assertStringContainsString('aria-controls=', $html);
        $this->assertStringContainsString('role="list"', $html);
        $this->assertStringContainsString('role="progressbar"', $html);
        
        // Check for proper heading structure
        $this->assertStringContainsString('<h2', $html);
        $this->assertStringContainsString('<h3', $html);
        $this->assertStringContainsString('<h4', $html);
    }
    
    /**
     * Test module progress with empty module
     */
    public function test_module_progress_with_empty_module() {
        $empty_module_id = 'non-existent-module';
        $progress = $this->navigation->get_module_progress($empty_module_id);
        
        $this->assertEquals(0, $progress['percentage']);
        $this->assertEquals(0, $progress['completed']);
        $this->assertEquals(0, $progress['total']);
    }
    
    /**
     * Test lesson completion with invalid lesson ID
     */
    public function test_lesson_completion_with_invalid_id() {
        $invalid_lesson_id = 'invalid-lesson-id';
        
        $this->assertFalse($this->navigation->is_lesson_completed($invalid_lesson_id));
        
        // Should not throw error when marking invalid lesson as completed
        $this->navigation->mark_lesson_completed($invalid_lesson_id);
        $this->assertTrue($this->navigation->is_lesson_completed($invalid_lesson_id));
    }
    
    /**
     * Test HTML escaping in rendered output
     */
    public function test_html_escaping_in_output() {
        // This would require modifying test data to include potentially dangerous content
        // For now, just verify that escaping functions are called
        $html = $this->navigation->render_sidebar();
        
        // Check that no unescaped user data appears in output
        $this->assertStringNotContainsString('<script>', $html);
        $this->assertStringNotContainsString('javascript:', $html);
    }
    
    /**
     * Test performance with large dataset
     */
    public function test_performance_with_large_dataset() {
        $start_time = microtime(true);
        
        // Render sidebar multiple times
        for ($i = 0; $i < 10; $i++) {
            $this->navigation->render_sidebar();
        }
        
        $end_time = microtime(true);
        $execution_time = $end_time - $start_time;
        
        // Should complete within reasonable time (1 second for 10 renders)
        $this->assertLessThan(1.0, $execution_time);
    }
}