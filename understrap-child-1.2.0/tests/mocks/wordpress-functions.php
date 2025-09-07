<?php
/**
 * Mock WordPress functions for testing without full WordPress installation
 */

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/../../');
}

// Mock WordPress functions
if (!function_exists('get_user_meta')) {
    function get_user_meta($user_id, $key = '', $single = false) {
        static $user_meta = [];
        
        if (empty($key)) {
            return $user_meta[$user_id] ?? [];
        }
        
        $value = $user_meta[$user_id][$key] ?? '';
        
        if ($single) {
            return $value;
        }
        
        return is_array($value) ? $value : [$value];
    }
}

if (!function_exists('update_user_meta')) {
    function update_user_meta($user_id, $meta_key, $meta_value, $prev_value = '') {
        static $user_meta = [];
        
        if (!isset($user_meta[$user_id])) {
            $user_meta[$user_id] = [];
        }
        
        $user_meta[$user_id][$meta_key] = $meta_value;
        return true;
    }
}

if (!function_exists('get_current_user_id')) {
    function get_current_user_id() {
        return 1; // Default test user ID
    }
}

if (!function_exists('current_time')) {
    function current_time($type, $gmt = 0) {
        switch ($type) {
            case 'mysql':
                return date('Y-m-d H:i:s');
            case 'timestamp':
                return time();
            default:
                return date($type);
        }
    }
}

if (!function_exists('home_url')) {
    function home_url($path = '', $scheme = null) {
        return 'https://example.com' . $path;
    }
}

if (!function_exists('get_template_directory_uri')) {
    function get_template_directory_uri() {
        return 'https://example.com/wp-content/themes/understrap-child';
    }
}

if (!function_exists('esc_attr')) {
    function esc_attr($text) {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('esc_html')) {
    function esc_html($text) {
        return htmlspecialchars($text, ENT_NOQUOTES, 'UTF-8');
    }
}

if (!function_exists('esc_url')) {
    function esc_url($url) {
        return filter_var($url, FILTER_SANITIZE_URL);
    }
}

if (!function_exists('human_time_diff')) {
    function human_time_diff($from, $to = '') {
        if (empty($to)) {
            $to = time();
        }
        
        $diff = abs($to - $from);
        
        if ($diff < MINUTE_IN_SECONDS) {
            return 'less than a minute';
        } elseif ($diff < HOUR_IN_SECONDS) {
            $minutes = round($diff / MINUTE_IN_SECONDS);
            return $minutes . ' minute' . ($minutes > 1 ? 's' : '');
        } elseif ($diff < DAY_IN_SECONDS) {
            $hours = round($diff / HOUR_IN_SECONDS);
            return $hours . ' hour' . ($hours > 1 ? 's' : '');
        } else {
            $days = round($diff / DAY_IN_SECONDS);
            return $days . ' day' . ($days > 1 ? 's' : '');
        }
    }
}

// Define WordPress constants
if (!defined('MINUTE_IN_SECONDS')) {
    define('MINUTE_IN_SECONDS', 60);
}

if (!defined('HOUR_IN_SECONDS')) {
    define('HOUR_IN_SECONDS', 3600);
}

if (!defined('DAY_IN_SECONDS')) {
    define('DAY_IN_SECONDS', 86400);
}

// Mock global $post object
global $post;
$post = (object) [
    'ID' => 1,
    'post_name' => 'lesson-01-01',
    'post_type' => 'lesson',
    'post_title' => 'Test Lesson'
];