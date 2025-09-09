<?php
/**
 * Test Progress Widget Implementation
 * 
 * Test file to verify the progress widget functionality
 * Only accessible to administrators or in debug mode
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Only allow administrators or debug mode
if (!current_user_can('administrator') && (!defined('WP_DEBUG') || !WP_DEBUG)) {
    wp_die('Access denied');
}

/**
 * Test Progress Widget Display
 */
function test_pmp_progress_widget_display() {
    if (!is_user_logged_in()) {
        echo '<div class="alert alert-warning">Please log in to test the progress widget.</div>';
        return;
    }
    
    $user_id = get_current_user_id();
    
    echo '<div class="test-section">';
    echo '<h3>Progress Widget Test</h3>';
    
    // Test widget instantiation
    if (class_exists('PMP_Progress_Widget')) {
        echo '<div class="alert alert-success">✓ PMP_Progress_Widget class loaded successfully</div>';
        
        // Create widget instance
        $widget = new PMP_Progress_Widget();
        
        // Test widget with different configurations
        $test_instances = array(
            'basic' => array(
                'title' => 'Basic Progress',
                'show_domain_breakdown' => false,
                'show_weekly_progress' => false,
                'show_statistics' => false
            ),
            'full' => array(
                'title' => 'Complete Progress Display',
                'show_domain_breakdown' => true,
                'show_weekly_progress' => true,
                'show_statistics' => true
            ),
            'domains_only' => array(
                'title' => 'Domain Progress Only',
                'show_domain_breakdown' => true,
                'show_weekly_progress' => false,
                'show_statistics' => false
            )
        );
        
        foreach ($test_instances as $test_name => $instance) {
            echo '<div class="widget-test mb-4">';
            echo '<h4>Test Configuration: ' . ucfirst(str_replace('_', ' ', $test_name)) . '</h4>';
            
            $args = array(
                'before_widget' => '<div class="test-widget">',
                'after_widget' => '</div>',
                'before_title' => '<h5 class="test-widget-title">',
                'after_title' => '</h5>'
            );
            
            ob_start();
            $widget->widget($args, $instance);
            $widget_output = ob_get_clean();
            
            echo $widget_output;
            echo '</div>';
        }
        
    } else {
        echo '<div class="alert alert-danger">✗ PMP_Progress_Widget class not found</div>';
    }
    
    echo '</div>';
}

/**
 * Test Progress Tracker Integration
 */
function test_pmp_progress_tracker_integration() {
    if (!is_user_logged_in()) {
        return;
    }
    
    $user_id = get_current_user_id();
    
    echo '<div class="test-section">';
    echo '<h3>Progress Tracker Integration Test</h3>';
    
    if (class_exists('PMP_Progress_Tracker')) {
        echo '<div class="alert alert-success">✓ PMP_Progress_Tracker class available</div>';
        
        $progress_tracker = new PMP_Progress_Tracker($user_id);
        
        // Test overall progress
        $overall_progress = $progress_tracker->get_overall_progress();
        echo '<div class="test-data">';
        echo '<h4>Overall Progress Data:</h4>';
        echo '<pre>' . print_r($overall_progress, true) . '</pre>';
        echo '</div>';
        
        // Test domain progress
        $domain_progress = $progress_tracker->get_domain_progress();
        echo '<div class="test-data">';
        echo '<h4>Domain Progress Data:</h4>';
        echo '<pre>' . print_r($domain_progress, true) . '</pre>';
        echo '</div>';
        
        // Test weekly progress
        $weekly_progress = $progress_tracker->get_weekly_progress();
        echo '<div class="test-data">';
        echo '<h4>Weekly Progress Data (first 3 weeks):</h4>';
        $sample_weekly = array_slice($weekly_progress, 0, 3, true);
        echo '<pre>' . print_r($sample_weekly, true) . '</pre>';
        echo '</div>';
        
    } else {
        echo '<div class="alert alert-danger">✗ PMP_Progress_Tracker class not found</div>';
    }
    
    echo '</div>';
}

/**
 * Test Widget Registration
 */
function test_widget_registration() {
    global $wp_widget_factory;
    
    echo '<div class="test-section">';
    echo '<h3>Widget Registration Test</h3>';
    
    if (isset($wp_widget_factory->widgets['PMP_Progress_Widget'])) {
        echo '<div class="alert alert-success">✓ PMP_Progress_Widget registered successfully</div>';
    } else {
        echo '<div class="alert alert-danger">✗ PMP_Progress_Widget not registered</div>';
    }
    
    // Test sidebar registration
    global $wp_registered_sidebars;
    
    if (isset($wp_registered_sidebars['course-sidebar'])) {
        echo '<div class="alert alert-success">✓ Course sidebar registered successfully</div>';
        echo '<div class="sidebar-info">';
        echo '<h4>Course Sidebar Configuration:</h4>';
        echo '<pre>' . print_r($wp_registered_sidebars['course-sidebar'], true) . '</pre>';
        echo '</div>';
    } else {
        echo '<div class="alert alert-danger">✗ Course sidebar not registered</div>';
    }
    
    echo '</div>';
}

/**
 * Test CSS and JavaScript Loading
 */
function test_assets_loading() {
    global $wp_styles, $wp_scripts;
    
    echo '<div class="test-section">';
    echo '<h3>Assets Loading Test</h3>';
    
    // Check CSS
    $progress_widget_css_loaded = false;
    if (isset($wp_styles->registered['pmp-progress-widget'])) {
        echo '<div class="alert alert-success">✓ Progress widget CSS registered</div>';
        $progress_widget_css_loaded = true;
    } else {
        echo '<div class="alert alert-warning">⚠ Progress widget CSS not registered</div>';
    }
    
    // Check if CSS file exists
    $css_path = get_stylesheet_directory() . '/assets/css/progress-widget.css';
    if (file_exists($css_path)) {
        echo '<div class="alert alert-success">✓ Progress widget CSS file exists</div>';
    } else {
        echo '<div class="alert alert-danger">✗ Progress widget CSS file missing</div>';
    }
    
    // Check AJAX localization
    if (wp_script_is('pmp-progress-tracker', 'enqueued')) {
        echo '<div class="alert alert-success">✓ Progress tracker JavaScript enqueued</div>';
    } else {
        echo '<div class="alert alert-warning">⚠ Progress tracker JavaScript not enqueued</div>';
    }
    
    echo '</div>';
}

/**
 * Simulate Progress Data for Testing
 */
function simulate_test_progress_data() {
    if (!is_user_logged_in()) {
        return;
    }
    
    $user_id = get_current_user_id();
    
    echo '<div class="test-section">';
    echo '<h3>Simulate Test Data</h3>';
    
    // Create sample progress data
    $sample_progress = array(
        'completed_lessons' => array('lesson-01-01', 'lesson-01-02', 'lesson-01-03'),
        'lesson_progress' => array(
            'lesson-01-01' => array(
                'completion_percentage' => 100,
                'last_accessed' => current_time('mysql'),
                'session_time' => 25,
                'quiz_score' => 85
            ),
            'lesson-01-02' => array(
                'completion_percentage' => 100,
                'last_accessed' => date('Y-m-d H:i:s', strtotime('-1 day')),
                'session_time' => 30,
                'quiz_score' => 92
            ),
            'lesson-01-03' => array(
                'completion_percentage' => 75,
                'last_accessed' => date('Y-m-d H:i:s', strtotime('-2 hours')),
                'session_time' => 15,
                'quiz_score' => null
            )
        ),
        'completed_lessons_count' => 3,
        'total_lessons' => 91,
        'overall_percentage' => 3.3,
        'current_week' => 1,
        'total_study_time' => 70,
        'last_activity' => current_time('mysql'),
        'start_date' => date('Y-m-d H:i:s', strtotime('-1 week')),
        'achievements' => array('first_lesson', 'first_week'),
        'milestones' => array()
    );
    
    // Save test data
    update_user_meta($user_id, 'pmp_detailed_progress', $sample_progress);
    
    echo '<div class="alert alert-info">✓ Sample progress data created for testing</div>';
    echo '<div class="test-data">';
    echo '<h4>Sample Data Created:</h4>';
    echo '<pre>' . print_r($sample_progress, true) . '</pre>';
    echo '</div>';
    
    echo '</div>';
}

// Run tests if this is a test request
if (isset($_GET['test_progress_widget'])) {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>PMP Progress Widget Test</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <?php wp_head(); ?>
        <style>
            .test-section {
                margin: 2rem 0;
                padding: 1.5rem;
                border: 1px solid #dee2e6;
                border-radius: 8px;
            }
            .test-data {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 4px;
                margin: 1rem 0;
            }
            .test-widget {
                max-width: 400px;
                margin: 1rem 0;
            }
            pre {
                font-size: 0.8rem;
                max-height: 300px;
                overflow-y: auto;
            }
        </style>
    </head>
    <body>
        <div class="container mt-4">
            <h1>PMP Progress Widget Test Suite</h1>
            <p class="lead">Testing the progress display widget implementation</p>
            
            <?php
            test_widget_registration();
            test_assets_loading();
            
            if (isset($_GET['simulate_data'])) {
                simulate_test_progress_data();
            }
            
            test_pmp_progress_tracker_integration();
            test_pmp_progress_widget_display();
            ?>
            
            <div class="test-actions mt-4">
                <a href="?test_progress_widget=1&simulate_data=1" class="btn btn-primary">
                    <i class="fas fa-database me-1"></i>
                    Simulate Test Data
                </a>
                <a href="<?php echo admin_url('widgets.php'); ?>" class="btn btn-secondary">
                    <i class="fas fa-cogs me-1"></i>
                    Manage Widgets
                </a>
                <a href="<?php echo home_url(); ?>" class="btn btn-outline-primary">
                    <i class="fas fa-home me-1"></i>
                    Back to Site
                </a>
            </div>
        </div>
        
        <?php wp_footer(); ?>
    </body>
    </html>
    <?php
    exit;
}
?>