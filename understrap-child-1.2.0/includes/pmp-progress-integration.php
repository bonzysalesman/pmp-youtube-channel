<?php
/**
 * PMP Progress Tracking Integration
 * 
 * Integrates progress tracking functionality with the dashboard
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Initialize progress tracking integration
 */
function pmp_init_progress_tracking() {
    // Ensure classes are loaded
    if (!class_exists('PMP_Progress_Tracker')) {
        require_once get_stylesheet_directory() . '/includes/class-pmp-progress-tracker.php';
    }
    
    if (!class_exists('PMP_Dashboard')) {
        require_once get_stylesheet_directory() . '/includes/class-pmp-dashboard.php';
    }
    
    // Initialize for logged-in users
    if (is_user_logged_in()) {
        $user_id = get_current_user_id();
        
        // Create global instances
        global $pmp_progress_tracker, $pmp_dashboard;
        $pmp_progress_tracker = new PMP_Progress_Tracker($user_id);
        $pmp_dashboard = new PMP_Dashboard($user_id);
    }
}
add_action('init', 'pmp_init_progress_tracking');

/**
 * Render current lesson highlighting card
 * 
 * @return string HTML for current lesson card
 */
function pmp_render_current_lesson_display() {
    if (!is_user_logged_in()) {
        return '<p>Please log in to view your current lesson.</p>';
    }
    
    global $pmp_dashboard;
    
    if (!$pmp_dashboard) {
        pmp_init_progress_tracking();
    }
    
    return $pmp_dashboard->render_current_lesson_card();
}

/**
 * Render progress tracking display for dashboard
 * 
 * @return string HTML for progress display
 */
function pmp_render_progress_display() {
    if (!is_user_logged_in()) {
        return '<p>Please log in to view your progress.</p>';
    }
    
    global $pmp_progress_tracker, $pmp_dashboard;
    
    if (!$pmp_progress_tracker || !$pmp_dashboard) {
        pmp_init_progress_tracking();
    }
    
    $progress_stats = $pmp_dashboard->get_progress_stats();
    $overall_progress = $pmp_progress_tracker ? $pmp_progress_tracker->get_overall_progress() : $progress_stats;
    
    ob_start();
    ?>
    <div class="progress-display-container" id="pmp-progress-display">
        <div class="card-title">
            <h5 class="mb-0">
                <i class="fas fa-chart-line me-2 text-primary"></i>
                Your Progress
            </h5>
            <button class="progress-refresh-btn" onclick="refreshProgressData()" title="Refresh Progress">
                <i class="fas fa-sync-alt"></i>
            </button>
        </div>
        
        <div class="row align-items-center">
            <div class="col-md-6">
                <?php echo $pmp_dashboard->render_progress_circle($overall_progress['percentage'] ?? $progress_stats['percentage']); ?>
            </div>
            <div class="col-md-6">
                <?php echo $pmp_dashboard->render_progress_statistics($overall_progress); ?>
            </div>
        </div>
        
        <?php if ($pmp_progress_tracker): ?>
        <div class="domain-progress-container">
            <h6 class="mb-3">Domain Progress</h6>
            <div id="domain-progress-list">
                <!-- Domain progress will be loaded via JavaScript -->
            </div>
        </div>
        <?php endif; ?>
        
        <div class="motivational-message mt-3">
            <i class="fas fa-lightbulb me-2"></i>
            <span id="motivational-text"><?php echo $pmp_dashboard->get_motivational_message(); ?></span>
        </div>
    </div>
    
    <script>
    // Refresh progress data function
    function refreshProgressData() {
        if (window.pmpProgressTracker) {
            window.pmpProgressTracker.refreshProgressData();
        }
    }
    
    // Auto-refresh every 5 minutes
    setInterval(refreshProgressData, 300000);
    </script>
    <?php
    return ob_get_clean();
}

/**
 * Shortcode for progress display
 */
function pmp_progress_display_shortcode($atts) {
    $atts = shortcode_atts([
        'user_id' => get_current_user_id(),
        'show_details' => true,
        'show_domains' => true
    ], $atts);
    
    return pmp_render_progress_display();
}
add_shortcode('pmp_progress_display', 'pmp_progress_display_shortcode');

/**
 * Shortcode for current lesson display
 */
function pmp_current_lesson_shortcode($atts) {
    $atts = shortcode_atts([
        'user_id' => get_current_user_id(),
        'show_actions' => true
    ], $atts);
    
    return pmp_render_current_lesson_display();
}
add_shortcode('pmp_current_lesson', 'pmp_current_lesson_shortcode');

/**
 * Add progress display and current lesson to dashboard page automatically
 */
function pmp_add_progress_to_dashboard($content) {
    if (is_page('dashboard') && is_user_logged_in()) {
        $current_lesson_display = pmp_render_current_lesson_display();
        $progress_display = pmp_render_progress_display();
        
        // Add current lesson first, then progress display
        $dashboard_content = '<div class="pmp-dashboard-content">';
        $dashboard_content .= '<div class="row">';
        $dashboard_content .= '<div class="col-12 mb-4">' . $current_lesson_display . '</div>';
        $dashboard_content .= '<div class="col-12 mb-4">' . $progress_display . '</div>';
        $dashboard_content .= '</div>';
        $dashboard_content .= '</div>';
        
        $content = $dashboard_content . $content;
    }
    
    return $content;
}
add_filter('the_content', 'pmp_add_progress_to_dashboard');

/**
 * AJAX handler for refreshing progress data
 */
function pmp_ajax_refresh_progress() {
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
        wp_die('Security check failed');
    }
    
    if (!is_user_logged_in()) {
        wp_send_json_error('User not logged in');
    }
    
    $user_id = get_current_user_id();
    $dashboard = new PMP_Dashboard($user_id);
    
    $response_data = [
        'progress_stats' => $dashboard->get_progress_stats(),
        'motivational_message' => $dashboard->get_motivational_message(),
        'timestamp' => current_time('mysql')
    ];
    
    if (class_exists('PMP_Progress_Tracker')) {
        $progress_tracker = new PMP_Progress_Tracker($user_id);
        $response_data['detailed_progress'] = $progress_tracker->get_overall_progress();
        $response_data['domain_progress'] = $progress_tracker->get_domain_progress();
    }
    
    wp_send_json_success($response_data);
}
add_action('wp_ajax_pmp_refresh_progress', 'pmp_ajax_refresh_progress');

/**
 * AJAX handler for getting current lesson data
 */
function pmp_ajax_get_current_lesson() {
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
        wp_die('Security check failed');
    }
    
    if (!is_user_logged_in()) {
        wp_send_json_error('User not logged in');
    }
    
    $user_id = get_current_user_id();
    $dashboard = new PMP_Dashboard($user_id);
    
    $current_lesson = $dashboard->get_current_lesson();
    
    if ($current_lesson) {
        wp_send_json_success($current_lesson);
    } else {
        wp_send_json_error('No current lesson available');
    }
}
add_action('wp_ajax_pmp_get_current_lesson', 'pmp_ajax_get_current_lesson');

/**
 * AJAX handler for setting current lesson
 */
function pmp_ajax_set_current_lesson() {
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_ajax_nonce')) {
        wp_die('Security check failed');
    }
    
    if (!is_user_logged_in()) {
        wp_send_json_error('User not logged in');
    }
    
    $lesson_id = sanitize_text_field($_POST['lesson_id'] ?? '');
    
    if (empty($lesson_id)) {
        wp_send_json_error('Lesson ID is required');
    }
    
    $user_id = get_current_user_id();
    $dashboard = new PMP_Dashboard($user_id);
    
    $dashboard->set_current_lesson($lesson_id);
    
    wp_send_json_success([
        'message' => 'Current lesson updated successfully',
        'current_lesson' => $dashboard->get_current_lesson()
    ]);
}
add_action('wp_ajax_pmp_set_current_lesson', 'pmp_ajax_set_current_lesson');

/**
 * Enqueue progress tracking assets on dashboard page
 */
function pmp_enqueue_progress_assets() {
    if (is_page('dashboard')) {
        wp_enqueue_style(
            'pmp-dashboard-progress',
            get_stylesheet_directory_uri() . '/assets/css/dashboard.css',
            ['understrap-styles'],
            filemtime(get_stylesheet_directory() . '/assets/css/dashboard.css')
        );
        
        wp_enqueue_script(
            'pmp-progress-tracker',
            get_stylesheet_directory_uri() . '/assets/js/progress-tracker.js',
            ['jquery'],
            filemtime(get_stylesheet_directory() . '/assets/js/progress-tracker.js'),
            true
        );
        
        // Localize script with additional progress data
        wp_localize_script('pmp-progress-tracker', 'pmpProgressData', [
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('pmp_ajax_nonce'),
            'userId' => get_current_user_id(),
            'refreshInterval' => 300000, // 5 minutes
            'enableRealTimeUpdates' => true
        ]);
    }
}
add_action('wp_enqueue_scripts', 'pmp_enqueue_progress_assets', 20);

/**
 * Add progress tracking meta box to user profile
 */
function pmp_add_progress_meta_box() {
    add_meta_box(
        'pmp_user_progress',
        'PMP Course Progress',
        'pmp_render_user_progress_meta_box',
        'user',
        'normal',
        'high'
    );
}
add_action('show_user_profile', 'pmp_add_progress_meta_box');
add_action('edit_user_profile', 'pmp_add_progress_meta_box');

/**
 * Render user progress meta box
 */
function pmp_render_user_progress_meta_box($user) {
    if (class_exists('PMP_Dashboard')) {
        $dashboard = new PMP_Dashboard($user->ID);
        $progress = $dashboard->get_progress_stats();
        
        echo '<table class="form-table">';
        echo '<tr><th>Overall Progress</th><td>' . number_format($progress['percentage'], 1) . '%</td></tr>';
        echo '<tr><th>Lessons Completed</th><td>' . $progress['completed'] . ' of ' . $progress['total'] . '</td></tr>';
        echo '<tr><th>Current Week</th><td>Week ' . $progress['current_week'] . '</td></tr>';
        echo '<tr><th>Last Activity</th><td>' . date('M j, Y g:i A', strtotime($progress['last_activity'])) . '</td></tr>';
        echo '</table>';
    } else {
        echo '<p>Progress tracking not available.</p>';
    }
}