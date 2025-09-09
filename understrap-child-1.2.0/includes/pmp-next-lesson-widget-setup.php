<?php
/**
 * PMP Next Lesson Widget Setup and Integration
 * 
 * Helper functions for setting up and integrating the next lesson widget
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Add next lesson widget to course-related pages automatically
 */
function pmp_auto_add_next_lesson_widget() {
    // Only add on course-related pages
    if (is_singular('lesson') || is_page('dashboard') || is_singular('course')) {
        
        // Check if widget is not already in sidebar
        $sidebar_widgets = get_option('widget_pmp_next_lesson_widget', array());
        
        if (empty($sidebar_widgets)) {
            // Auto-add widget with default settings
            $widget_instance = array(
                'title' => 'Next Lesson',
                'show_description' => true,
                'show_duration' => true,
                'show_domain_info' => true,
                'show_eco_references' => false
            );
            
            // Add to sidebar-1 by default
            $sidebar_widgets = get_option('sidebars_widgets', array());
            
            if (!isset($sidebar_widgets['sidebar-1'])) {
                $sidebar_widgets['sidebar-1'] = array();
            }
            
            // Check if our widget is already there
            $widget_found = false;
            foreach ($sidebar_widgets['sidebar-1'] as $widget_id) {
                if (strpos($widget_id, 'pmp_next_lesson_widget') === 0) {
                    $widget_found = true;
                    break;
                }
            }
            
            if (!$widget_found) {
                // Add widget to sidebar
                $widget_id = 'pmp_next_lesson_widget-' . time();
                $sidebar_widgets['sidebar-1'][] = $widget_id;
                
                // Save widget instance
                $widget_instances = get_option('widget_pmp_next_lesson_widget', array());
                $widget_instances[time()] = $widget_instance;
                
                update_option('widget_pmp_next_lesson_widget', $widget_instances);
                update_option('sidebars_widgets', $sidebar_widgets);
            }
        }
    }
}

/**
 * Render next lesson widget directly (for use in templates)
 * 
 * @param array $args Widget arguments
 * @param array $instance Widget instance settings
 */
function pmp_render_next_lesson_widget($args = array(), $instance = array()) {
    if (!class_exists('PMP_Next_Lesson_Widget')) {
        return;
    }
    
    // Default arguments
    $default_args = array(
        'before_widget' => '<div class="widget pmp-next-lesson-widget">',
        'after_widget' => '</div>',
        'before_title' => '<h4 class="widget-title">',
        'after_title' => '</h4>'
    );
    
    // Default instance
    $default_instance = array(
        'title' => 'Next Lesson',
        'show_description' => true,
        'show_duration' => true,
        'show_domain_info' => true,
        'show_eco_references' => false
    );
    
    $args = wp_parse_args($args, $default_args);
    $instance = wp_parse_args($instance, $default_instance);
    
    $widget = new PMP_Next_Lesson_Widget();
    $widget->widget($args, $instance);
}

/**
 * Shortcode for next lesson widget
 * 
 * Usage: [pmp_next_lesson title="Coming Up Next" show_description="1" show_duration="1"]
 */
function pmp_next_lesson_shortcode($atts) {
    $atts = shortcode_atts(array(
        'title' => 'Next Lesson',
        'show_description' => '1',
        'show_duration' => '1',
        'show_domain_info' => '1',
        'show_eco_references' => '0',
        'class' => ''
    ), $atts);
    
    $args = array(
        'before_widget' => '<div class="widget pmp-next-lesson-widget shortcode-widget ' . esc_attr($atts['class']) . '">',
        'after_widget' => '</div>',
        'before_title' => '<h4 class="widget-title">',
        'after_title' => '</h4>'
    );
    
    $instance = array(
        'title' => $atts['title'],
        'show_description' => (bool) $atts['show_description'],
        'show_duration' => (bool) $atts['show_duration'],
        'show_domain_info' => (bool) $atts['show_domain_info'],
        'show_eco_references' => (bool) $atts['show_eco_references']
    );
    
    ob_start();
    pmp_render_next_lesson_widget($args, $instance);
    return ob_get_clean();
}
add_shortcode('pmp_next_lesson', 'pmp_next_lesson_shortcode');

/**
 * Add next lesson widget to course sidebar automatically
 */
function pmp_add_next_lesson_to_course_sidebar() {
    // Only on course-related pages
    if (is_singular('lesson') || is_singular('course') || is_page('dashboard')) {
        
        // Add widget to course sidebar if it exists
        if (is_active_sidebar('course-sidebar')) {
            add_action('dynamic_sidebar_before', function($sidebar_id) {
                if ($sidebar_id === 'course-sidebar') {
                    pmp_render_next_lesson_widget();
                }
            });
        }
    }
}
add_action('wp', 'pmp_add_next_lesson_to_course_sidebar');

/**
 * Register course-specific sidebar for widgets
 */
function pmp_register_course_sidebar() {
    register_sidebar(array(
        'name' => __('Course Sidebar', 'understrap-child'),
        'id' => 'course-sidebar',
        'description' => __('Widgets for course-related pages (lessons, dashboard)', 'understrap-child'),
        'before_widget' => '<div id="%1$s" class="widget course-widget %2$s">',
        'after_widget' => '</div>',
        'before_title' => '<h4 class="widget-title">',
        'after_title' => '</h4>',
    ));
}
add_action('widgets_init', 'pmp_register_course_sidebar');

/**
 * AJAX handler for lesson interaction tracking
 */
function pmp_track_lesson_interaction() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
        wp_die('Security check failed');
    }
    
    $lesson_id = sanitize_text_field($_POST['lesson_id']);
    $interaction_type = sanitize_text_field($_POST['interaction_type']);
    $user_id = get_current_user_id();
    
    if (!$user_id) {
        wp_send_json_error('User not logged in');
    }
    
    // Track the interaction
    $interactions = get_user_meta($user_id, 'pmp_lesson_interactions', true);
    if (!is_array($interactions)) {
        $interactions = array();
    }
    
    $interactions[] = array(
        'lesson_id' => $lesson_id,
        'interaction_type' => $interaction_type,
        'timestamp' => current_time('timestamp'),
        'source' => 'next_lesson_widget'
    );
    
    update_user_meta($user_id, 'pmp_lesson_interactions', $interactions);
    
    wp_send_json_success(array(
        'message' => 'Interaction tracked successfully',
        'lesson_id' => $lesson_id,
        'interaction_type' => $interaction_type
    ));
}
add_action('wp_ajax_track_lesson_interaction', 'pmp_track_lesson_interaction');

/**
 * Enqueue AJAX script for widget interactions
 */
function pmp_next_lesson_widget_ajax_script() {
    if (is_user_logged_in()) {
        wp_localize_script('jquery', 'pmpAjax', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('pmp_ajax_nonce')
        ));
    }
}
add_action('wp_enqueue_scripts', 'pmp_next_lesson_widget_ajax_script');

/**
 * Add widget to lesson pages automatically
 */
function pmp_add_next_lesson_widget_to_lesson_pages($content) {
    // Only on single lesson pages
    if (is_singular('lesson') && is_main_query() && in_the_loop()) {
        
        // Add widget after content
        $widget_html = '';
        
        ob_start();
        pmp_render_next_lesson_widget(array(
            'before_widget' => '<div class="widget pmp-next-lesson-widget lesson-page-widget mt-4">',
            'after_widget' => '</div>',
            'before_title' => '<h4 class="widget-title">',
            'after_title' => '</h4>'
        ), array(
            'title' => 'What\'s Next?',
            'show_description' => true,
            'show_duration' => true,
            'show_domain_info' => true,
            'show_eco_references' => true
        ));
        $widget_html = ob_get_clean();
        
        $content .= $widget_html;
    }
    
    return $content;
}
// Uncomment the line below to automatically add widget to lesson content
// add_filter('the_content', 'pmp_add_next_lesson_widget_to_lesson_pages');

/**
 * Helper function to check if user has next lesson
 */
function pmp_user_has_next_lesson($user_id = null) {
    if (!$user_id) {
        $user_id = get_current_user_id();
    }
    
    if (!$user_id) {
        return false;
    }
    
    if (!class_exists('PMP_Course_Navigation')) {
        return false;
    }
    
    $navigation = new PMP_Course_Navigation($user_id);
    $modules = $navigation->get_course_modules();
    $completed_lessons = get_user_meta($user_id, 'pmp_completed_lessons', true);
    
    if (!is_array($completed_lessons)) {
        $completed_lessons = array();
    }
    
    // Check if there are any uncompleted lessons
    foreach ($modules as $module) {
        foreach ($module['lessons'] as $lesson) {
            if (!in_array($lesson['id'], $completed_lessons)) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Get next lesson data for user
 */
function pmp_get_user_next_lesson($user_id = null) {
    if (!$user_id) {
        $user_id = get_current_user_id();
    }
    
    if (!$user_id || !class_exists('PMP_Next_Lesson_Widget')) {
        return null;
    }
    
    $widget = new PMP_Next_Lesson_Widget();
    
    // Use reflection to access private method
    $reflection = new ReflectionClass($widget);
    $method = $reflection->getMethod('get_next_lesson');
    $method->setAccessible(true);
    
    return $method->invoke($widget, $user_id);
}
?>