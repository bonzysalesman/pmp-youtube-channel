<?php
/**
 * Test file for PMP Next Lesson Widget
 * 
 * This file provides testing functionality for the next lesson preview widget
 * to ensure proper functionality and display.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Test the next lesson widget display
 */
function test_pmp_next_lesson_widget_display() {
    if (!is_user_logged_in()) {
        echo '<div class="alert alert-warning">Please log in to test the next lesson widget.</div>';
        return;
    }
    
    echo '<h3>Next Lesson Widget Display Test</h3>';
    
    // Test widget instantiation
    if (class_exists('PMP_Next_Lesson_Widget')) {
        echo '<div class="alert alert-success">✓ PMP_Next_Lesson_Widget class loaded successfully</div>';
        
        // Create widget instance
        $widget = new PMP_Next_Lesson_Widget();
        
        // Test different widget configurations
        $test_instances = array(
            'minimal' => array(
                'title' => 'Next Lesson',
                'show_description' => false,
                'show_eco_references' => false,
                'show_duration' => false,
                'show_domain_info' => false
            ),
            'standard' => array(
                'title' => 'Coming Up Next',
                'show_description' => true,
                'show_eco_references' => false,
                'show_duration' => true,
                'show_domain_info' => true
            ),
            'detailed' => array(
                'title' => 'Next Lesson Preview',
                'show_description' => true,
                'show_eco_references' => true,
                'show_duration' => true,
                'show_domain_info' => true
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
            
            // Render the widget
            ob_start();
            $widget->widget($args, $instance);
            $widget_output = ob_get_clean();
            
            echo $widget_output;
            echo '</div>';
        }
        
    } else {
        echo '<div class="alert alert-danger">✗ PMP_Next_Lesson_Widget class not found</div>';
    }
}

/**
 * Test widget registration
 */
function test_pmp_next_lesson_widget_registration() {
    echo '<h3>Widget Registration Test</h3>';
    
    global $wp_widget_factory;
    
    if (isset($wp_widget_factory->widgets['PMP_Next_Lesson_Widget'])) {
        echo '<div class="alert alert-success">✓ PMP_Next_Lesson_Widget registered successfully</div>';
    } else {
        echo '<div class="alert alert-danger">✗ PMP_Next_Lesson_Widget not registered</div>';
    }
    
    // Check if widget appears in available widgets
    $available_widgets = $wp_widget_factory->widgets;
    $widget_found = false;
    
    foreach ($available_widgets as $widget_class => $widget_object) {
        if ($widget_class === 'PMP_Next_Lesson_Widget') {
            $widget_found = true;
            echo '<div class="alert alert-info">Widget ID: ' . esc_html($widget_object->id_base) . '</div>';
            echo '<div class="alert alert-info">Widget Name: ' . esc_html($widget_object->name) . '</div>';
            break;
        }
    }
    
    if (!$widget_found) {
        echo '<div class="alert alert-warning">Widget not found in available widgets list</div>';
    }
}

/**
 * Test widget assets (CSS/JS)
 */
function test_pmp_next_lesson_widget_assets() {
    echo '<h3>Widget Assets Test</h3>';
    
    global $wp_styles;
    
    // Check if CSS is registered
    $next_lesson_widget_css_loaded = false;
    if (isset($wp_styles->registered['pmp-next-lesson-widget'])) {
        echo '<div class="alert alert-success">✓ Next lesson widget CSS registered</div>';
        $next_lesson_widget_css_loaded = true;
    } else {
        echo '<div class="alert alert-warning">⚠ Next lesson widget CSS not registered</div>';
    }
    
    // Check if CSS file exists
    $css_path = get_stylesheet_directory() . '/assets/css/next-lesson-widget.css';
    if (file_exists($css_path)) {
        echo '<div class="alert alert-success">✓ Next lesson widget CSS file exists</div>';
    } else {
        echo '<div class="alert alert-danger">✗ Next lesson widget CSS file missing</div>';
    }
    
    // Check file size and modification time
    if (file_exists($css_path)) {
        $file_size = filesize($css_path);
        $file_time = filemtime($css_path);
        echo '<div class="alert alert-info">CSS file size: ' . number_format($file_size) . ' bytes</div>';
        echo '<div class="alert alert-info">CSS last modified: ' . date('Y-m-d H:i:s', $file_time) . '</div>';
    }
}

/**
 * Test lesson data functionality
 */
function test_pmp_next_lesson_data() {
    echo '<h3>Lesson Data Test</h3>';
    
    if (!is_user_logged_in()) {
        echo '<div class="alert alert-warning">Please log in to test lesson data functionality.</div>';
        return;
    }
    
    $user_id = get_current_user_id();
    
    // Test course navigation integration
    if (class_exists('PMP_Course_Navigation')) {
        echo '<div class="alert alert-success">✓ PMP_Course_Navigation class available</div>';
        
        $navigation = new PMP_Course_Navigation($user_id);
        $modules = $navigation->get_course_modules();
        
        echo '<div class="alert alert-info">Available modules: ' . count($modules) . '</div>';
        
        // Test getting completed lessons
        $completed_lessons = get_user_meta($user_id, 'pmp_completed_lessons', true);
        if (!is_array($completed_lessons)) {
            $completed_lessons = [];
        }
        
        echo '<div class="alert alert-info">Completed lessons: ' . count($completed_lessons) . '</div>';
        
        // Find next lesson
        $next_lesson_found = false;
        foreach ($modules as $module) {
            foreach ($module['lessons'] as $lesson) {
                if (!in_array($lesson['id'], $completed_lessons)) {
                    echo '<div class="alert alert-success">✓ Next lesson found: ' . esc_html($lesson['title']) . '</div>';
                    echo '<div class="alert alert-info">Lesson ID: ' . esc_html($lesson['id']) . '</div>';
                    echo '<div class="alert alert-info">Week: ' . esc_html($module['week_number']) . '</div>';
                    echo '<div class="alert alert-info">Domain: ' . esc_html($module['domain_focus']) . '</div>';
                    $next_lesson_found = true;
                    break 2;
                }
            }
        }
        
        if (!$next_lesson_found) {
            echo '<div class="alert alert-warning">No next lesson found (course may be completed)</div>';
        }
        
    } else {
        echo '<div class="alert alert-danger">✗ PMP_Course_Navigation class not available</div>';
    }
}

/**
 * Test widget admin form
 */
function test_pmp_next_lesson_widget_form() {
    echo '<h3>Widget Admin Form Test</h3>';
    
    if (class_exists('PMP_Next_Lesson_Widget')) {
        $widget = new PMP_Next_Lesson_Widget();
        
        // Test form rendering
        $instance = array(
            'title' => 'Test Next Lesson',
            'show_description' => true,
            'show_eco_references' => false,
            'show_duration' => true,
            'show_domain_info' => true
        );
        
        echo '<div class="widget-form-test">';
        echo '<h5>Widget Configuration Form:</h5>';
        echo '<div style="background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">';
        
        ob_start();
        $widget->form($instance);
        $form_output = ob_get_clean();
        
        echo $form_output;
        echo '</div>';
        echo '</div>';
        
        echo '<div class="alert alert-success">✓ Widget form rendered successfully</div>';
        
    } else {
        echo '<div class="alert alert-danger">✗ Cannot test form - widget class not found</div>';
    }
}

// Only run tests for administrators or in debug mode
if (current_user_can('administrator') || (defined('WP_DEBUG') && WP_DEBUG)) {
    
    // Add admin menu for testing
    add_action('admin_menu', function() {
        add_submenu_page(
            'tools.php',
            'Next Lesson Widget Test',
            'Next Lesson Widget Test',
            'manage_options',
            'test-next-lesson-widget',
            function() {
                ?>
                <div class="wrap">
                    <h1>PMP Next Lesson Widget Test Suite</h1>
                    <p class="description">Testing the next lesson preview widget implementation</p>
                    
                    <?php
                    test_pmp_next_lesson_widget_registration();
                    test_pmp_next_lesson_widget_assets();
                    test_pmp_next_lesson_data();
                    test_pmp_next_lesson_widget_display();
                    test_pmp_next_lesson_widget_form();
                    ?>
                    
                    <hr>
                    
                    <h3>Quick Actions</h3>
                    <p>
                        <a href="<?php echo admin_url('widgets.php'); ?>" class="button button-primary">Manage Widgets</a>
                        <a href="<?php echo admin_url('customize.php'); ?>" class="button button-secondary">Customize Theme</a>
                        <a href="<?php echo home_url(); ?>" class="button button-secondary" target="_blank">View Site</a>
                    </p>
                    
                    <h3>Widget Usage Instructions</h3>
                    <div class="notice notice-info">
                        <p><strong>To use the Next Lesson Widget:</strong></p>
                        <ol>
                            <li>Go to <strong>Appearance > Widgets</strong> in the admin menu</li>
                            <li>Find "PMP Next Lesson Preview" in the available widgets</li>
                            <li>Drag it to your desired sidebar area (e.g., "Sidebar 1" or course-specific sidebars)</li>
                            <li>Configure the widget options (title, display settings)</li>
                            <li>Save the widget settings</li>
                            <li>View your site to see the widget in action</li>
                        </ol>
                        <p><strong>Note:</strong> The widget only displays for logged-in users and shows the next uncompleted lesson in their course progression.</p>
                    </div>
                    
                </div>
                <?php
            }
        );
    });
    
}
?>