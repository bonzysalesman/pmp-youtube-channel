<?php
/**
 * Enqueue scripts and styles for user settings
 */

if (!defined('ABSPATH')) {
    exit;
}

// Enqueue settings assets on settings page
add_action('wp_enqueue_scripts', function() {
    if (is_page_template('page-dashboard-settings.php') || 
        (is_page() && get_post_field('post_name') === 'dashboard-settings')) {
        
        // Enqueue settings JavaScript
        wp_enqueue_script(
            'pmp-user-settings',
            get_stylesheet_directory_uri() . '/assets/js/user-settings.js',
            ['jquery', 'bootstrap'],
            '1.0.0',
            true
        );
        
        // Localize script with AJAX data
        wp_localize_script('pmp-user-settings', 'pmpSettingsData', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('pmp_settings_nonce'),
            'userId' => get_current_user_id(),
            'strings' => [
                'saving' => __('Saving...', 'understrap-child'),
                'saved' => __('Settings saved!', 'understrap-child'),
                'error' => __('Error saving settings', 'understrap-child'),
                'confirmReset' => __('Are you sure you want to reset all settings?', 'understrap-child')
            ]
        ]);
        
        // Settings styles are already included in dashboard.css
    }
});

// Add settings link to user profile menu
add_filter('pmp_user_menu_items', function($items) {
    $items['settings'] = [
        'title' => __('Settings', 'understrap-child'),
        'url' => home_url('/dashboard/settings/'),
        'icon' => 'fas fa-cog',
        'order' => 90
    ];
    
    return $items;
});

// Add body class for settings page
add_filter('body_class', function($classes) {
    if (is_page_template('page-dashboard-settings.php') || 
        (is_page() && get_post_field('post_name') === 'dashboard-settings')) {
        $classes[] = 'pmp-settings-page';
    }
    
    return $classes;
});