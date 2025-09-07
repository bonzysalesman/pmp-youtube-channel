<?php
/**
 * PMP Enqueue Scripts and Styles
 * 
 * Handles enqueuing of PMP-specific CSS and JavaScript files
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Enqueue PMP styles and scripts
 */
function pmp_enqueue_assets() {
    // Enqueue PMP Components CSS
    wp_enqueue_style(
        'pmp-components',
        get_stylesheet_directory_uri() . '/assets/css/pmp-components.css',
        array('understrap-styles'),
        filemtime(get_stylesheet_directory() . '/assets/css/pmp-components.css')
    );
    
    // Enqueue PMP Navigation JavaScript
    wp_enqueue_script(
        'pmp-navigation',
        get_stylesheet_directory_uri() . '/assets/js/navigation.js',
        array('jquery'),
        filemtime(get_stylesheet_directory() . '/assets/js/navigation.js'),
        true
    );
    
    // Enqueue PMP Progress Tracker JavaScript
    wp_enqueue_script(
        'pmp-progress-tracker',
        get_stylesheet_directory_uri() . '/assets/js/progress-tracker.js',
        array('jquery'),
        filemtime(get_stylesheet_directory() . '/assets/js/progress-tracker.js'),
        true
    );
    
    // Enqueue PMP Dashboard JavaScript
    wp_enqueue_script(
        'pmp-dashboard',
        get_stylesheet_directory_uri() . '/assets/js/dashboard.js',
        array('jquery'),
        filemtime(get_stylesheet_directory() . '/assets/js/dashboard.js'),
        true
    );
    
    // Localize script for AJAX
    wp_localize_script('pmp-navigation', 'pmp_ajax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('pmp_nonce'),
        'user_id' => get_current_user_id()
    ));
}
add_action('wp_enqueue_scripts', 'pmp_enqueue_assets');

/**
 * Enqueue Google Fonts
 */
function pmp_enqueue_fonts() {
    wp_enqueue_style(
        'pmp-google-fonts',
        'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&display=swap',
        array(),
        null
    );
}
add_action('wp_enqueue_scripts', 'pmp_enqueue_fonts');

/**
 * Add custom CSS variables for PMP theme colors
 */
function pmp_add_css_variables() {
    ?>
    <style>
        :root {
            --pmp-primary: #5b28b3;
            --pmp-primary-dark: #4c1d95;
            --pmp-secondary: #7c3aed;
            --pmp-people: #059669;
            --pmp-process: #1e40af;
            --pmp-business: #c2410c;
            --pmp-gray-50: #f9fafb;
            --pmp-gray-100: #f3f4f6;
            --pmp-gray-200: #e5e7eb;
            --pmp-gray-300: #d1d5db;
            --pmp-gray-400: #9ca3af;
            --pmp-gray-500: #6b7280;
            --pmp-gray-600: #4b5563;
            --pmp-gray-700: #374151;
            --pmp-gray-800: #1f2937;
            --pmp-gray-900: #111827;
        }
    </style>
    <?php
}
add_action('wp_head', 'pmp_add_css_variables');

/**
 * Add body classes for PMP pages
 */
function pmp_body_classes($classes) {
    global $post;
    
    if (is_singular('lesson')) {
        $classes[] = 'pmp-lesson-page';
    }
    
    if (is_singular('course')) {
        $classes[] = 'pmp-course-page';
    }
    
    if (is_page('dashboard')) {
        $classes[] = 'pmp-dashboard-page';
    }
    
    if (is_page('resources')) {
        $classes[] = 'pmp-resources-page';
    }
    
    return $classes;
}
add_filter('body_class', 'pmp_body_classes');