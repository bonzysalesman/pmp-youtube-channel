<?php
/**
 * Template Name: Dashboard Settings
 * Description: User profile settings page for PMP dashboard
 */

// Ensure user is logged in
if (!is_user_logged_in()) {
    wp_redirect(wp_login_url(get_permalink()));
    exit;
}

get_header();

// Get current user information
$current_user = wp_get_current_user();
$user_id = $current_user->ID;

// Initialize settings handler
$settings_handler = null;
if (class_exists('PMP_User_Settings')) {
    $settings_handler = new PMP_User_Settings($user_id);
    
    // Handle form submission
    if ($_POST && wp_verify_nonce($_POST['pmp_settings_nonce'], 'pmp_save_settings')) {
        $settings_handler->save_settings($_POST);
        $success_message = 'Settings saved successfully!';
    }
    
    $user_settings = $settings_handler->get_user_settings();
} else {
    // Fallback settings for development
    $user_settings = [
        'notifications' => [
            'email_reminders' => true,
            'progress_updates' => true,
            'weekly_summary' => false,
            'achievement_alerts' => true
        ],
        'preferences' => [
            'study_time_goal' => 30,
            'preferred_study_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'timezone' => 'America/New_York',
            'difficulty_preference' => 'adaptive'
        ],
        'privacy' => [
            'show_progress_publicly' => false,
            'allow_study_buddy_requests' => true,
            'share_achievements' => true
        ],
        'display' => [
            'dashboard_layout' => 'default',
            'theme_preference' => 'light',
            'compact_mode' => false
        ]
    ];
}
?>

<div class="wrapper" id="page-wrapper">
    <div class="container-fluid" id="content" tabindex="-1">
        <div class="row">
            <main class="col-12">
                <?php
                // Display breadcrumb navigation
                if (class_exists('PMP_Navigation_Manager')) {
                    $nav_manager = new PMP_Navigation_Manager();
                    $nav_manager->display_breadcrumbs();
                }
                ?>
                
                <!-- Settings Header -->
                <section class="settings-header">
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h1 class="mb-2">
                                    <i class="fas fa-cog me-2"></i>
                                    Profile Settings
                                </h1>
                                <p class="lead mb-0">
                                    Customize your learning experience and preferences
                                </p>
                            </div>
                            <div class="col-md-4 text-md-end">
                                <a href="<?php echo home_url('/dashboard/'); ?>" class="btn btn-outline-primary">
                                    <i class="fas fa-arrow-left me-2"></i>
                                    Back to Dashboard
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Settings Content -->
                <section class="settings-content">
                    <div class="container">
                        <?php if (isset($success_message)): ?>
                            <div class="alert alert-success alert-dismissible fade show" role="alert">
                                <i class="fas fa-check-circle me-2"></i>
                                <?php echo esc_html($success_message); ?>
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        <?php endif; ?>
                        
                        <div class="row">
                            <!-- Settings Navigation -->
                            <div class="col-lg-3 col-md-4">
                                <div class="settings-nav-card card border-0 shadow-sm mb-4">
                                    <div class="card-body p-0">
                                        <nav class="settings-nav">
                                            <ul class="nav nav-pills flex-column">
                                                <li class="nav-item">
                                                    <a class="nav-link active" href="#notifications" data-bs-toggle="pill">
                                                        <i class="fas fa-bell me-2"></i>
                                                        Notifications
                                                    </a>
                                                </li>
                                                <li class="nav-item">
                                                    <a class="nav-link" href="#preferences" data-bs-toggle="pill">
                                                        <i class="fas fa-sliders-h me-2"></i>
                                                        Study Preferences
                                                    </a>
                                                </li>
                                                <li class="nav-item">
                                                    <a class="nav-link" href="#privacy" data-bs-toggle="pill">
                                                        <i class="fas fa-shield-alt me-2"></i>
                                                        Privacy
                                                    </a>
                                                </li>
                                                <li class="nav-item">
                                                    <a class="nav-link" href="#display" data-bs-toggle="pill">
                                                        <i class="fas fa-palette me-2"></i>
                                                        Display
                                                    </a>
                                                </li>
                                                <li class="nav-item">
                                                    <a class="nav-link" href="#account" data-bs-toggle="pill">
                                                        <i class="fas fa-user me-2"></i>
                                                        Account Info
                                                    </a>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </div>

                            <!-- Settings Forms -->
                            <div class="col-lg-9 col-md-8">
                                <form method="post" class="settings-form" id="pmp-settings-form">
                                    <?php wp_nonce_field('pmp_save_settings', 'pmp_settings_nonce'); ?>
                                    
                                    <div class="tab-content">
                                        <!-- Notifications Settings -->
                                        <div class="tab-pane fade show active" id="notifications">
                                            <div class="card border-0 shadow-sm">
                                                <div class="card-header bg-white">
                                                    <h5 class="mb-0">
                                                        <i class="fas fa-bell me-2 text-primary"></i>
                                                        Notification Preferences
                                                    </h5>
                                                </div>
                                                <div class="card-body">
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div class="form-check form-switch mb-3">
                                                                <input class="form-check-input" type="checkbox" 
                                                                       id="email_reminders" name="notifications[email_reminders]"
                                                                       <?php checked($user_settings['notifications']['email_reminders']); ?>>
                                                                <label class="form-check-label" for="email_reminders">
                                                                    <strong>Email Reminders</strong>
                                                                    <small class="d-block text-muted">
                                                                        Receive daily study reminders via email
                                                                    </small>
                                                                </label>
                                                            </div>
                                                            
                                                            <div class="form-check form-switch mb-3">
                                                                <input class="form-check-input" type="checkbox" 
                                                                       id="progress_updates" name="notifications[progress_updates]"
                                                                       <?php checked($user_settings['notifications']['progress_updates']); ?>>
                                                                <label class="form-check-label" for="progress_updates">
                                                                    <strong>Progress Updates</strong>
                                                                    <small class="d-block text-muted">
                                                                        Get notified when you complete milestones
                                                                    </small>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        
                                                        <div class="col-md-6">
                                                            <div class="form-check form-switch mb-3">
                                                                <input class="form-check-input" type="checkbox" 
                                                                       id="weekly_summary" name="notifications[weekly_summary]"
                                                                       <?php checked($user_settings['notifications']['weekly_summary']); ?>>
                                                                <label class="form-check-label" for="weekly_summary">
                                                                    <strong>Weekly Summary</strong>
                                                                    <small class="d-block text-muted">
                                                                        Receive weekly progress summaries
                                                                    </small>
                                                                </label>
                                                            </div>
                                                            
                                                            <div class="form-check form-switch mb-3">
                                                                <input class="form-check-input" type="checkbox" 
                                                                       id="achievement_alerts" name="notifications[achievement_alerts]"
                                                                       <?php checked($user_settings['notifications']['achievement_alerts']); ?>>
                                                                <label class="form-check-label" for="achievement_alerts">
                                                                    <strong>Achievement Alerts</strong>
                                                                    <small class="d-block text-muted">
                                                                        Celebrate your achievements with notifications
                                                                    </small>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Study Preferences -->
                                        <div class="tab-pane fade" id="preferences">
                                            <div class="card border-0 shadow-sm">
                                                <div class="card-header bg-white">
                                                    <h5 class="mb-0">
                                                        <i class="fas fa-sliders-h me-2 text-primary"></i>
                                                        Study Preferences
                                                    </h5>
                                                </div>
                                                <div class="card-body">
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div class="mb-3">
                                                                <label for="study_time_goal" class="form-label">
                                                                    <strong>Daily Study Goal (minutes)</strong>
                                                                </label>
                                                                <input type="number" class="form-control" 
                                                                       id="study_time_goal" name="preferences[study_time_goal]"
                                                                       value="<?php echo esc_attr($user_settings['preferences']['study_time_goal']); ?>"
                                                                       min="15" max="180" step="15">
                                                                <small class="form-text text-muted">
                                                                    Set your daily study time goal (15-180 minutes)
                                                                </small>
                                                            </div>
                                                            
                                                            <div class="mb-3">
                                                                <label class="form-label">
                                                                    <strong>Preferred Study Days</strong>
                                                                </label>
                                                                <div class="study-days-grid">
                                                                    <?php 
                                                                    $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                                                                    $day_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                                                                    foreach ($days as $index => $day): 
                                                                        $checked = in_array($day, $user_settings['preferences']['preferred_study_days']);
                                                                    ?>
                                                                        <div class="form-check form-check-inline">
                                                                            <input class="form-check-input" type="checkbox" 
                                                                                   id="day_<?php echo $day; ?>" 
                                                                                   name="preferences[preferred_study_days][]"
                                                                                   value="<?php echo $day; ?>"
                                                                                   <?php checked($checked); ?>>
                                                                            <label class="form-check-label" for="day_<?php echo $day; ?>">
                                                                                <?php echo $day_labels[$index]; ?>
                                                                            </label>
                                                                        </div>
                                                                    <?php endforeach; ?>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div class="col-md-6">
                                                            <div class="mb-3">
                                                                <label for="timezone" class="form-label">
                                                                    <strong>Timezone</strong>
                                                                </label>
                                                                <select class="form-select" id="timezone" name="preferences[timezone]">
                                                                    <option value="America/New_York" <?php selected($user_settings['preferences']['timezone'], 'America/New_York'); ?>>Eastern Time</option>
                                                                    <option value="America/Chicago" <?php selected($user_settings['preferences']['timezone'], 'America/Chicago'); ?>>Central Time</option>
                                                                    <option value="America/Denver" <?php selected($user_settings['preferences']['timezone'], 'America/Denver'); ?>>Mountain Time</option>
                                                                    <option value="America/Los_Angeles" <?php selected($user_settings['preferences']['timezone'], 'America/Los_Angeles'); ?>>Pacific Time</option>
                                                                    <option value="UTC" <?php selected($user_settings['preferences']['timezone'], 'UTC'); ?>>UTC</option>
                                                                </select>
                                                            </div>
                                                            
                                                            <div class="mb-3">
                                                                <label for="difficulty_preference" class="form-label">
                                                                    <strong>Difficulty Preference</strong>
                                                                </label>
                                                                <select class="form-select" id="difficulty_preference" name="preferences[difficulty_preference]">
                                                                    <option value="beginner" <?php selected($user_settings['preferences']['difficulty_preference'], 'beginner'); ?>>Beginner Friendly</option>
                                                                    <option value="adaptive" <?php selected($user_settings['preferences']['difficulty_preference'], 'adaptive'); ?>>Adaptive (Recommended)</option>
                                                                    <option value="advanced" <?php selected($user_settings['preferences']['difficulty_preference'], 'advanced'); ?>>Advanced Challenge</option>
                                                                </select>
                                                                <small class="form-text text-muted">
                                                                    Adaptive mode adjusts difficulty based on your progress
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Privacy Settings -->
                                        <div class="tab-pane fade" id="privacy">
                                            <div class="card border-0 shadow-sm">
                                                <div class="card-header bg-white">
                                                    <h5 class="mb-0">
                                                        <i class="fas fa-shield-alt me-2 text-primary"></i>
                                                        Privacy Settings
                                                    </h5>
                                                </div>
                                                <div class="card-body">
                                                    <div class="privacy-settings">
                                                        <div class="form-check form-switch mb-4">
                                                            <input class="form-check-input" type="checkbox" 
                                                                   id="show_progress_publicly" name="privacy[show_progress_publicly]"
                                                                   <?php checked($user_settings['privacy']['show_progress_publicly']); ?>>
                                                            <label class="form-check-label" for="show_progress_publicly">
                                                                <strong>Show Progress Publicly</strong>
                                                                <small class="d-block text-muted">
                                                                    Allow others to see your course progress and achievements
                                                                </small>
                                                            </label>
                                                        </div>
                                                        
                                                        <div class="form-check form-switch mb-4">
                                                            <input class="form-check-input" type="checkbox" 
                                                                   id="allow_study_buddy_requests" name="privacy[allow_study_buddy_requests]"
                                                                   <?php checked($user_settings['privacy']['allow_study_buddy_requests']); ?>>
                                                            <label class="form-check-label" for="allow_study_buddy_requests">
                                                                <strong>Allow Study Buddy Requests</strong>
                                                                <small class="d-block text-muted">
                                                                    Let other students send you study buddy requests
                                                                </small>
                                                            </label>
                                                        </div>
                                                        
                                                        <div class="form-check form-switch mb-4">
                                                            <input class="form-check-input" type="checkbox" 
                                                                   id="share_achievements" name="privacy[share_achievements]"
                                                                   <?php checked($user_settings['privacy']['share_achievements']); ?>>
                                                            <label class="form-check-label" for="share_achievements">
                                                                <strong>Share Achievements</strong>
                                                                <small class="d-block text-muted">
                                                                    Share your achievements and milestones with the community
                                                                </small>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Display Settings -->
                                        <div class="tab-pane fade" id="display">
                                            <div class="card border-0 shadow-sm">
                                                <div class="card-header bg-white">
                                                    <h5 class="mb-0">
                                                        <i class="fas fa-palette me-2 text-primary"></i>
                                                        Display Preferences
                                                    </h5>
                                                </div>
                                                <div class="card-body">
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div class="mb-3">
                                                                <label for="dashboard_layout" class="form-label">
                                                                    <strong>Dashboard Layout</strong>
                                                                </label>
                                                                <select class="form-select" id="dashboard_layout" name="display[dashboard_layout]">
                                                                    <option value="default" <?php selected($user_settings['display']['dashboard_layout'], 'default'); ?>>Default Layout</option>
                                                                    <option value="compact" <?php selected($user_settings['display']['dashboard_layout'], 'compact'); ?>>Compact Layout</option>
                                                                    <option value="detailed" <?php selected($user_settings['display']['dashboard_layout'], 'detailed'); ?>>Detailed Layout</option>
                                                                </select>
                                                            </div>
                                                            
                                                            <div class="mb-3">
                                                                <label for="theme_preference" class="form-label">
                                                                    <strong>Theme Preference</strong>
                                                                </label>
                                                                <select class="form-select" id="theme_preference" name="display[theme_preference]">
                                                                    <option value="light" <?php selected($user_settings['display']['theme_preference'], 'light'); ?>>Light Theme</option>
                                                                    <option value="dark" <?php selected($user_settings['display']['theme_preference'], 'dark'); ?>>Dark Theme</option>
                                                                    <option value="auto" <?php selected($user_settings['display']['theme_preference'], 'auto'); ?>>Auto (System)</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        
                                                        <div class="col-md-6">
                                                            <div class="form-check form-switch mb-3">
                                                                <input class="form-check-input" type="checkbox" 
                                                                       id="compact_mode" name="display[compact_mode]"
                                                                       <?php checked($user_settings['display']['compact_mode']); ?>>
                                                                <label class="form-check-label" for="compact_mode">
                                                                    <strong>Compact Mode</strong>
                                                                    <small class="d-block text-muted">
                                                                        Show more content in less space
                                                                    </small>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Account Information -->
                                        <div class="tab-pane fade" id="account">
                                            <div class="card border-0 shadow-sm">
                                                <div class="card-header bg-white">
                                                    <h5 class="mb-0">
                                                        <i class="fas fa-user me-2 text-primary"></i>
                                                        Account Information
                                                    </h5>
                                                </div>
                                                <div class="card-body">
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div class="mb-3">
                                                                <label class="form-label"><strong>Username</strong></label>
                                                                <input type="text" class="form-control" 
                                                                       value="<?php echo esc_attr($current_user->user_login); ?>" 
                                                                       readonly>
                                                            </div>
                                                            
                                                            <div class="mb-3">
                                                                <label class="form-label"><strong>Email</strong></label>
                                                                <input type="email" class="form-control" 
                                                                       value="<?php echo esc_attr($current_user->user_email); ?>" 
                                                                       readonly>
                                                                <small class="form-text text-muted">
                                                                    To change your email, please contact support
                                                                </small>
                                                            </div>
                                                        </div>
                                                        
                                                        <div class="col-md-6">
                                                            <div class="mb-3">
                                                                <label class="form-label"><strong>Display Name</strong></label>
                                                                <input type="text" class="form-control" 
                                                                       value="<?php echo esc_attr($current_user->display_name); ?>" 
                                                                       readonly>
                                                            </div>
                                                            
                                                            <div class="mb-3">
                                                                <label class="form-label"><strong>Member Since</strong></label>
                                                                <input type="text" class="form-control" 
                                                                       value="<?php echo date('F j, Y', strtotime($current_user->user_registered)); ?>" 
                                                                       readonly>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="account-actions mt-4">
                                                        <a href="<?php echo esc_url(get_edit_user_link()); ?>" 
                                                           class="btn btn-outline-primary me-2">
                                                            <i class="fas fa-edit me-2"></i>
                                                            Edit Profile
                                                        </a>
                                                        <a href="<?php echo esc_url(wp_logout_url(home_url())); ?>" 
                                                           class="btn btn-outline-secondary">
                                                            <i class="fas fa-sign-out-alt me-2"></i>
                                                            Logout
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Save Button -->
                                    <div class="settings-actions mt-4">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div class="settings-status">
                                                <span class="text-muted" id="settings-status">
                                                    <i class="fas fa-info-circle me-1"></i>
                                                    Changes are saved automatically
                                                </span>
                                            </div>
                                            <div class="settings-buttons">
                                                <button type="button" class="btn btn-outline-secondary me-2" id="reset-settings">
                                                    <i class="fas fa-undo me-2"></i>
                                                    Reset to Defaults
                                                </button>
                                                <button type="submit" class="btn btn-primary" id="save-settings">
                                                    <i class="fas fa-save me-2"></i>
                                                    Save Settings
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>
</div>

<?php get_footer(); ?>