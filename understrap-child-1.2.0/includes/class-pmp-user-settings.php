<?php
/**
 * PMP User Settings Class
 * 
 * Handles user profile settings and preferences for the PMP dashboard
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class PMP_User_Settings {
    
    private $user_id;
    private $settings_key = 'pmp_user_settings';
    private $default_settings;
    
    /**
     * Constructor
     * 
     * @param int $user_id WordPress user ID
     */
    public function __construct($user_id) {
        $this->user_id = $user_id;
        $this->default_settings = $this->get_default_settings();
        
        // Initialize AJAX handlers
        $this->init_ajax_handlers();
    }
    
    /**
     * Initialize AJAX handlers for settings
     */
    private function init_ajax_handlers() {
        add_action('wp_ajax_pmp_save_user_settings', [$this, 'ajax_save_settings']);
        add_action('wp_ajax_pmp_get_user_settings', [$this, 'ajax_get_settings']);
        add_action('wp_ajax_pmp_reset_user_settings', [$this, 'ajax_reset_settings']);
        add_action('wp_ajax_pmp_update_setting', [$this, 'ajax_update_single_setting']);
    }
    
    /**
     * Get default settings structure
     * 
     * @return array Default settings
     */
    private function get_default_settings(): array {
        return [
            'notifications' => [
                'email_reminders' => true,
                'progress_updates' => true,
                'weekly_summary' => false,
                'achievement_alerts' => true,
                'lesson_reminders' => true,
                'quiz_reminders' => false,
                'community_updates' => false
            ],
            'preferences' => [
                'study_time_goal' => 30,
                'preferred_study_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                'timezone' => 'America/New_York',
                'difficulty_preference' => 'adaptive',
                'auto_advance' => false,
                'show_hints' => true,
                'practice_mode' => 'mixed'
            ],
            'privacy' => [
                'show_progress_publicly' => false,
                'allow_study_buddy_requests' => true,
                'share_achievements' => true,
                'show_online_status' => false,
                'allow_progress_sharing' => true
            ],
            'display' => [
                'dashboard_layout' => 'default',
                'theme_preference' => 'light',
                'compact_mode' => false,
                'show_progress_animations' => true,
                'sidebar_collapsed' => false,
                'cards_per_row' => 'auto'
            ],
            'study' => [
                'reminder_time' => '09:00',
                'break_intervals' => 25,
                'focus_mode' => false,
                'track_study_time' => true,
                'goal_tracking' => true
            ]
        ];
    }
    
    /**
     * Get user settings with fallback to defaults
     * 
     * @return array User settings
     */
    public function get_user_settings(): array {
        $user_settings = get_user_meta($this->user_id, $this->settings_key, true);
        
        if (empty($user_settings) || !is_array($user_settings)) {
            $user_settings = $this->default_settings;
            $this->save_user_settings($user_settings);
        } else {
            // Merge with defaults to ensure all keys exist
            $user_settings = $this->merge_with_defaults($user_settings);
        }
        
        return $user_settings;
    }
    
    /**
     * Merge user settings with defaults to ensure all keys exist
     * 
     * @param array $user_settings Current user settings
     * @return array Merged settings
     */
    private function merge_with_defaults($user_settings): array {
        $merged = $this->default_settings;
        
        foreach ($user_settings as $category => $settings) {
            if (isset($merged[$category]) && is_array($settings)) {
                $merged[$category] = array_merge($merged[$category], $settings);
            } else {
                $merged[$category] = $settings;
            }
        }
        
        return $merged;
    }
    
    /**
     * Save user settings
     * 
     * @param array $settings Settings to save
     * @return bool Success status
     */
    public function save_user_settings($settings): bool {
        // Validate and sanitize settings
        $sanitized_settings = $this->sanitize_settings($settings);
        
        // Save to database
        $result = update_user_meta($this->user_id, $this->settings_key, $sanitized_settings);
        
        // Log the settings change
        $this->log_settings_change($sanitized_settings);
        
        // Trigger action for other plugins/themes
        do_action('pmp_user_settings_updated', $this->user_id, $sanitized_settings);
        
        return $result !== false;
    }
    
    /**
     * Save settings from form submission
     * 
     * @param array $form_data Form data from $_POST
     * @return bool Success status
     */
    public function save_settings($form_data): bool {
        $current_settings = $this->get_user_settings();
        
        // Process notifications
        if (isset($form_data['notifications'])) {
            foreach ($form_data['notifications'] as $key => $value) {
                $current_settings['notifications'][$key] = !empty($value);
            }
        } else {
            // If no notifications are checked, set all to false
            foreach ($current_settings['notifications'] as $key => $value) {
                $current_settings['notifications'][$key] = false;
            }
        }
        
        // Process preferences
        if (isset($form_data['preferences'])) {
            foreach ($form_data['preferences'] as $key => $value) {
                if ($key === 'preferred_study_days') {
                    $current_settings['preferences'][$key] = is_array($value) ? $value : [];
                } elseif ($key === 'study_time_goal') {
                    $current_settings['preferences'][$key] = max(15, min(180, intval($value)));
                } else {
                    $current_settings['preferences'][$key] = sanitize_text_field($value);
                }
            }
        }
        
        // Process privacy settings
        if (isset($form_data['privacy'])) {
            foreach ($form_data['privacy'] as $key => $value) {
                $current_settings['privacy'][$key] = !empty($value);
            }
        } else {
            // If no privacy settings are checked, set all to false
            foreach ($current_settings['privacy'] as $key => $value) {
                $current_settings['privacy'][$key] = false;
            }
        }
        
        // Process display settings
        if (isset($form_data['display'])) {
            foreach ($form_data['display'] as $key => $value) {
                if ($key === 'compact_mode') {
                    $current_settings['display'][$key] = !empty($value);
                } else {
                    $current_settings['display'][$key] = sanitize_text_field($value);
                }
            }
        }
        
        return $this->save_user_settings($current_settings);
    }
    
    /**
     * Sanitize settings before saving
     * 
     * @param array $settings Raw settings
     * @return array Sanitized settings
     */
    private function sanitize_settings($settings): array {
        $sanitized = [];
        
        // Sanitize notifications
        if (isset($settings['notifications'])) {
            foreach ($settings['notifications'] as $key => $value) {
                $sanitized['notifications'][$key] = (bool) $value;
            }
        }
        
        // Sanitize preferences
        if (isset($settings['preferences'])) {
            foreach ($settings['preferences'] as $key => $value) {
                switch ($key) {
                    case 'study_time_goal':
                        $sanitized['preferences'][$key] = max(15, min(180, intval($value)));
                        break;
                    case 'preferred_study_days':
                        $valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                        $sanitized['preferences'][$key] = is_array($value) ? 
                            array_intersect($value, $valid_days) : [];
                        break;
                    case 'timezone':
                        $valid_timezones = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'UTC'];
                        $sanitized['preferences'][$key] = in_array($value, $valid_timezones) ? 
                            $value : 'America/New_York';
                        break;
                    case 'difficulty_preference':
                        $valid_difficulties = ['beginner', 'adaptive', 'advanced'];
                        $sanitized['preferences'][$key] = in_array($value, $valid_difficulties) ? 
                            $value : 'adaptive';
                        break;
                    default:
                        $sanitized['preferences'][$key] = sanitize_text_field($value);
                }
            }
        }
        
        // Sanitize privacy settings
        if (isset($settings['privacy'])) {
            foreach ($settings['privacy'] as $key => $value) {
                $sanitized['privacy'][$key] = (bool) $value;
            }
        }
        
        // Sanitize display settings
        if (isset($settings['display'])) {
            foreach ($settings['display'] as $key => $value) {
                switch ($key) {
                    case 'compact_mode':
                    case 'show_progress_animations':
                    case 'sidebar_collapsed':
                        $sanitized['display'][$key] = (bool) $value;
                        break;
                    case 'dashboard_layout':
                        $valid_layouts = ['default', 'compact', 'detailed'];
                        $sanitized['display'][$key] = in_array($value, $valid_layouts) ? 
                            $value : 'default';
                        break;
                    case 'theme_preference':
                        $valid_themes = ['light', 'dark', 'auto'];
                        $sanitized['display'][$key] = in_array($value, $valid_themes) ? 
                            $value : 'light';
                        break;
                    default:
                        $sanitized['display'][$key] = sanitize_text_field($value);
                }
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Get a specific setting value
     * 
     * @param string $category Setting category
     * @param string $key Setting key
     * @param mixed $default Default value if not found
     * @return mixed Setting value
     */
    public function get_setting($category, $key, $default = null) {
        $settings = $this->get_user_settings();
        
        if (isset($settings[$category][$key])) {
            return $settings[$category][$key];
        }
        
        return $default !== null ? $default : 
            (isset($this->default_settings[$category][$key]) ? 
                $this->default_settings[$category][$key] : null);
    }
    
    /**
     * Update a single setting
     * 
     * @param string $category Setting category
     * @param string $key Setting key
     * @param mixed $value New value
     * @return bool Success status
     */
    public function update_setting($category, $key, $value): bool {
        $settings = $this->get_user_settings();
        
        if (!isset($settings[$category])) {
            $settings[$category] = [];
        }
        
        $settings[$category][$key] = $value;
        
        return $this->save_user_settings($settings);
    }
    
    /**
     * Reset settings to defaults
     * 
     * @return bool Success status
     */
    public function reset_settings(): bool {
        $result = $this->save_user_settings($this->default_settings);
        
        if ($result) {
            $this->log_settings_change($this->default_settings, 'reset');
        }
        
        return $result;
    }
    
    /**
     * Log settings changes for audit trail
     * 
     * @param array $settings New settings
     * @param string $action Action type (update, reset)
     */
    private function log_settings_change($settings, $action = 'update'): void {
        $log_entry = [
            'user_id' => $this->user_id,
            'action' => $action,
            'timestamp' => current_time('mysql'),
            'settings_hash' => md5(serialize($settings))
        ];
        
        // Store in user meta for audit trail (keep last 10 changes)
        $change_log = get_user_meta($this->user_id, 'pmp_settings_change_log', true);
        if (!is_array($change_log)) {
            $change_log = [];
        }
        
        array_unshift($change_log, $log_entry);
        $change_log = array_slice($change_log, 0, 10);
        
        update_user_meta($this->user_id, 'pmp_settings_change_log', $change_log);
    }
    
    /**
     * Get settings change log
     * 
     * @return array Change log entries
     */
    public function get_change_log(): array {
        $change_log = get_user_meta($this->user_id, 'pmp_settings_change_log', true);
        return is_array($change_log) ? $change_log : [];
    }
    
    /**
     * AJAX handler for saving settings
     */
    public function ajax_save_settings(): void {
        check_ajax_referer('pmp_settings_nonce', 'nonce');
        
        if (!current_user_can('read') || get_current_user_id() !== $this->user_id) {
            wp_die('Unauthorized');
        }
        
        $settings = $_POST['settings'] ?? [];
        $result = $this->save_user_settings($settings);
        
        wp_send_json([
            'success' => $result,
            'message' => $result ? 'Settings saved successfully' : 'Failed to save settings'
        ]);
    }
    
    /**
     * AJAX handler for getting settings
     */
    public function ajax_get_settings(): void {
        check_ajax_referer('pmp_settings_nonce', 'nonce');
        
        if (!current_user_can('read') || get_current_user_id() !== $this->user_id) {
            wp_die('Unauthorized');
        }
        
        $settings = $this->get_user_settings();
        
        wp_send_json([
            'success' => true,
            'data' => $settings
        ]);
    }
    
    /**
     * AJAX handler for resetting settings
     */
    public function ajax_reset_settings(): void {
        check_ajax_referer('pmp_settings_nonce', 'nonce');
        
        if (!current_user_can('read') || get_current_user_id() !== $this->user_id) {
            wp_die('Unauthorized');
        }
        
        $result = $this->reset_settings();
        
        wp_send_json([
            'success' => $result,
            'message' => $result ? 'Settings reset to defaults' : 'Failed to reset settings',
            'data' => $result ? $this->get_user_settings() : null
        ]);
    }
    
    /**
     * AJAX handler for updating a single setting
     */
    public function ajax_update_single_setting(): void {
        check_ajax_referer('pmp_settings_nonce', 'nonce');
        
        if (!current_user_can('read') || get_current_user_id() !== $this->user_id) {
            wp_die('Unauthorized');
        }
        
        $category = sanitize_text_field($_POST['category'] ?? '');
        $key = sanitize_text_field($_POST['key'] ?? '');
        $value = $_POST['value'] ?? '';
        
        if (empty($category) || empty($key)) {
            wp_send_json([
                'success' => false,
                'message' => 'Invalid category or key'
            ]);
        }
        
        $result = $this->update_setting($category, $key, $value);
        
        wp_send_json([
            'success' => $result,
            'message' => $result ? 'Setting updated' : 'Failed to update setting'
        ]);
    }
    
    /**
     * Apply user settings to dashboard display
     * 
     * @return array Display settings for dashboard
     */
    public function get_dashboard_display_settings(): array {
        $settings = $this->get_user_settings();
        
        return [
            'layout' => $settings['display']['dashboard_layout'],
            'theme' => $settings['display']['theme_preference'],
            'compact_mode' => $settings['display']['compact_mode'],
            'show_animations' => $settings['display']['show_progress_animations'] ?? true,
            'sidebar_collapsed' => $settings['display']['sidebar_collapsed'] ?? false
        ];
    }
    
    /**
     * Get notification preferences for email/push notifications
     * 
     * @return array Notification settings
     */
    public function get_notification_preferences(): array {
        $settings = $this->get_user_settings();
        return $settings['notifications'];
    }
    
    /**
     * Get study preferences for learning customization
     * 
     * @return array Study preferences
     */
    public function get_study_preferences(): array {
        $settings = $this->get_user_settings();
        return $settings['preferences'];
    }
    
    /**
     * Check if user has enabled a specific notification
     * 
     * @param string $notification_type Type of notification
     * @return bool Whether notification is enabled
     */
    public function is_notification_enabled($notification_type): bool {
        return $this->get_setting('notifications', $notification_type, false);
    }
    
    /**
     * Get user's preferred study time goal
     * 
     * @return int Study time goal in minutes
     */
    public function get_study_time_goal(): int {
        return $this->get_setting('preferences', 'study_time_goal', 30);
    }
    
    /**
     * Get user's preferred study days
     * 
     * @return array Array of preferred study days
     */
    public function get_preferred_study_days(): array {
        return $this->get_setting('preferences', 'preferred_study_days', 
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
    }
    
    /**
     * Export user settings for backup/migration
     * 
     * @return array Exportable settings data
     */
    public function export_settings(): array {
        $settings = $this->get_user_settings();
        
        return [
            'user_id' => $this->user_id,
            'export_date' => current_time('mysql'),
            'settings' => $settings,
            'version' => '1.0'
        ];
    }
    
    /**
     * Import user settings from backup
     * 
     * @param array $import_data Imported settings data
     * @return bool Success status
     */
    public function import_settings($import_data): bool {
        if (!isset($import_data['settings']) || !is_array($import_data['settings'])) {
            return false;
        }
        
        return $this->save_user_settings($import_data['settings']);
    }
}