<?php
/**
 * Test Progress Tracking Implementation
 * 
 * This file can be used to test the progress tracking functionality
 * by simulating user progress and verifying the display updates.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Test progress tracking functionality
 */
function test_pmp_progress_tracking() {
    // Only run for administrators
    if (!current_user_can('administrator')) {
        return;
    }
    
    $user_id = get_current_user_id();
    
    // Test 1: Initialize progress tracker
    if (class_exists('PMP_Progress_Tracker')) {
        $progress_tracker = new PMP_Progress_Tracker($user_id);
        echo "<h3>✅ PMP_Progress_Tracker class loaded successfully</h3>";
        
        // Test 2: Get overall progress
        $overall_progress = $progress_tracker->get_overall_progress();
        echo "<h4>Overall Progress:</h4>";
        echo "<pre>" . print_r($overall_progress, true) . "</pre>";
        
        // Test 3: Update lesson progress
        $test_lesson_id = 'lesson-01-01';
        $progress_tracker->update_lesson_progress($test_lesson_id, 100, [
            'session_time' => 25,
            'quiz_score' => 85
        ]);
        echo "<h4>✅ Updated progress for {$test_lesson_id}</h4>";
        
        // Test 4: Get domain progress
        $domain_progress = $progress_tracker->get_domain_progress();
        echo "<h4>Domain Progress:</h4>";
        echo "<pre>" . print_r($domain_progress, true) . "</pre>";
        
        // Test 5: Get performance analytics
        $analytics = $progress_tracker->get_performance_analytics();
        echo "<h4>Performance Analytics:</h4>";
        echo "<pre>" . print_r($analytics, true) . "</pre>";
        
    } else {
        echo "<h3>❌ PMP_Progress_Tracker class not found</h3>";
    }
    
    // Test dashboard functionality
    if (class_exists('PMP_Dashboard')) {
        $dashboard = new PMP_Dashboard($user_id);
        echo "<h3>✅ PMP_Dashboard class loaded successfully</h3>";
        
        // Test dashboard methods
        $progress_stats = $dashboard->get_progress_stats();
        echo "<h4>Dashboard Progress Stats:</h4>";
        echo "<pre>" . print_r($progress_stats, true) . "</pre>";
        
        $next_lesson = $dashboard->get_next_lesson();
        echo "<h4>Next Lesson:</h4>";
        echo "<pre>" . print_r($next_lesson, true) . "</pre>";
        
        $recent_activity = $dashboard->get_recent_activity();
        echo "<h4>Recent Activity:</h4>";
        echo "<pre>" . print_r($recent_activity, true) . "</pre>";
        
    } else {
        echo "<h3>❌ PMP_Dashboard class not found</h3>";
    }
    
    // Test AJAX endpoints
    echo "<h3>Testing AJAX Endpoints:</h3>";
    echo "<p>AJAX URL: " . admin_url('admin-ajax.php') . "</p>";
    echo "<p>Nonce: " . wp_create_nonce('pmp_ajax_nonce') . "</p>";
    echo "<p>User ID: " . $user_id . "</p>";
    
    // JavaScript test
    ?>
    <script>
    // Test AJAX functionality
    if (typeof jQuery !== 'undefined') {
        console.log('✅ jQuery loaded');
        
        // Test progress data fetch
        jQuery.post(ajaxurl, {
            action: 'get_user_progress',
            nonce: '<?php echo wp_create_nonce('pmp_ajax_nonce'); ?>',
            user_id: 'current'
        }, function(response) {
            console.log('✅ AJAX get_user_progress response:', response);
        }).fail(function(xhr, status, error) {
            console.error('❌ AJAX get_user_progress failed:', error);
        });
        
    } else {
        console.error('❌ jQuery not loaded');
    }
    
    // Test progress tracker initialization
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof PMPProgressTracker !== 'undefined') {
            console.log('✅ PMPProgressTracker class available');
        } else {
            console.error('❌ PMPProgressTracker class not found');
        }
    });
    </script>
    <?php
}

/**
 * Add test page for administrators
 */
function add_pmp_progress_test_page() {
    if (current_user_can('administrator') && isset($_GET['pmp_test_progress'])) {
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <title>PMP Progress Tracking Test</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                h4 { color: #666; margin-top: 20px; }
                pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
                .success { color: #28a745; }
                .error { color: #dc3545; }
            </style>
        </head>
        <body>
            <h1>PMP Progress Tracking Test Results</h1>
            <p><strong>Test URL:</strong> <?php echo home_url('?pmp_test_progress=1'); ?></p>
            <p><strong>Dashboard URL:</strong> <?php echo home_url('/dashboard/'); ?></p>
            
            <?php
            // Load WordPress
            wp_head();
            
            // Run tests
            test_pmp_progress_tracking();
            
            wp_footer();
            ?>
        </body>
        </html>
        <?php
        exit;
    }
}
add_action('init', 'add_pmp_progress_test_page');

/**
 * Add admin notice with test link
 */
function pmp_progress_test_admin_notice() {
    if (current_user_can('administrator')) {
        $test_url = home_url('?pmp_test_progress=1');
        echo '<div class="notice notice-info is-dismissible">';
        echo '<p><strong>PMP Progress Tracking:</strong> ';
        echo '<a href="' . esc_url($test_url) . '" target="_blank">Test Progress Tracking Implementation</a>';
        echo '</p>';
        echo '</div>';
    }
}
add_action('admin_notices', 'pmp_progress_test_admin_notice');