<?php
/**
 * Test file for Footer Widget Setup
 * This file helps verify that footer widgets are properly configured
 * 
 * Usage: Include this file in functions.php during development to test widget areas
 */

// Exit if accessed directly
defined( 'ABSPATH' ) || exit;

/**
 * Test Footer Widget Areas
 * This function checks if footer widget areas are properly registered
 */
function pmp_test_footer_widgets() {
    if (!current_user_can('administrator')) {
        return;
    }
    
    global $wp_registered_sidebars;
    
    $footer_widgets = array(
        'footer-1' => 'Footer Column 1 (Quick Links)',
        'footer-2' => 'Footer Column 2 (Resources)', 
        'footer-3' => 'Footer Column 3 (Connect Extras)'
    );
    
    echo '<div class="notice notice-info"><p><strong>PMP Footer Widget Test Results:</strong></p><ul>';
    
    foreach ($footer_widgets as $widget_id => $widget_name) {
        if (isset($wp_registered_sidebars[$widget_id])) {
            echo '<li>✅ ' . esc_html($widget_name) . ' - Registered</li>';
        } else {
            echo '<li>❌ ' . esc_html($widget_name) . ' - NOT Registered</li>';
        }
    }
    
    echo '</ul></div>';
}

/**
 * Test Theme Customizer Settings
 */
function pmp_test_customizer_settings() {
    if (!current_user_can('administrator')) {
        return;
    }
    
    $settings = array(
        'pmp_linkedin_url' => get_theme_mod('pmp_linkedin_url'),
        'pmp_facebook_url' => get_theme_mod('pmp_facebook_url'),
        'pmp_twitter_url' => get_theme_mod('pmp_twitter_url'),
        'pmp_youtube_url' => get_theme_mod('pmp_youtube_url'),
        'pmp_contact_email' => get_theme_mod('pmp_contact_email'),
        'pmp_contact_phone' => get_theme_mod('pmp_contact_phone'),
        'pmp_company_name' => get_theme_mod('pmp_company_name')
    );
    
    echo '<div class="notice notice-info"><p><strong>PMP Customizer Settings:</strong></p><ul>';
    
    foreach ($settings as $setting_key => $setting_value) {
        $status = !empty($setting_value) ? '✅' : '⚠️';
        $value = !empty($setting_value) ? esc_html($setting_value) : 'Not set';
        echo '<li>' . $status . ' ' . esc_html($setting_key) . ': ' . $value . '</li>';
    }
    
    echo '</ul></div>';
}

// Only show tests in admin area for administrators
if (is_admin() && current_user_can('administrator')) {
    add_action('admin_notices', 'pmp_test_footer_widgets');
    add_action('admin_notices', 'pmp_test_customizer_settings');
}

/**
 * Add admin menu for footer widget testing
 */
function pmp_add_footer_test_menu() {
    add_theme_page(
        'Footer Widget Test',
        'Footer Test',
        'manage_options',
        'pmp-footer-test',
        'pmp_footer_test_page'
    );
}
add_action('admin_menu', 'pmp_add_footer_test_menu');

/**
 * Footer test page content
 */
function pmp_footer_test_page() {
    ?>
    <div class="wrap">
        <h1>PMP Footer Widget Test</h1>
        
        <div class="card">
            <h2>Widget Areas Status</h2>
            <?php pmp_test_footer_widgets(); ?>
        </div>
        
        <div class="card">
            <h2>Customizer Settings</h2>
            <?php pmp_test_customizer_settings(); ?>
        </div>
        
        <div class="card">
            <h2>Instructions</h2>
            <p>To complete the footer widget setup:</p>
            <ol>
                <li>Go to <strong>Appearance > Widgets</strong> to add content to footer widget areas</li>
                <li>Go to <strong>Appearance > Customize > PMP Footer Settings</strong> to configure social media and contact information</li>
                <li>Test the footer on the frontend to ensure proper display and responsiveness</li>
            </ol>
        </div>
        
        <div class="card">
            <h2>Quick Actions</h2>
            <p>
                <a href="<?php echo admin_url('widgets.php'); ?>" class="button button-primary">Manage Widgets</a>
                <a href="<?php echo admin_url('customize.php'); ?>" class="button button-secondary">Customize Theme</a>
                <a href="<?php echo home_url(); ?>" class="button button-secondary" target="_blank">View Site</a>
            </p>
        </div>
    </div>
    
    <style>
        .card {
            background: #fff;
            border: 1px solid #ccd0d4;
            border-radius: 4px;
            margin: 20px 0;
            padding: 20px;
        }
        .card h2 {
            margin-top: 0;
        }
    </style>
    <?php
}