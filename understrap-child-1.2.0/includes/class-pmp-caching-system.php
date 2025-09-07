<?php
/**
 * PMP Caching System Class
 * 
 * Handles browser caching, progressive loading, and graceful degradation
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class PMP_Caching_System {
    
    private $cache_duration = 86400; // 24 hours
    private $transient_prefix = 'pmp_cache_';
    
    public function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Browser caching headers
        add_action('wp_head', array($this, 'add_cache_headers'));
        add_action('send_headers', array($this, 'send_cache_headers'));
        
        // Progressive loading AJAX endpoints
        add_action('wp_ajax_pmp_load_dashboard_data', array($this, 'ajax_load_dashboard_data'));
        add_action('wp_ajax_pmp_load_navigation_data', array($this, 'ajax_load_navigation_data'));
        add_action('wp_ajax_pmp_load_progress_data', array($this, 'ajax_load_progress_data'));
        
        // Non-logged-in users (for public content)
        add_action('wp_ajax_nopriv_pmp_load_navigation_data', array($this, 'ajax_load_navigation_data'));
        
        // Service Worker registration
        add_action('wp_footer', array($this, 'register_service_worker'));
        
        // Preload critical resources
        add_action('wp_head', array($this, 'preload_critical_resources'), 5);
        
        // Connection-aware loading
        add_action('wp_footer', array($this, 'add_connection_aware_script'));
    }
    
    /**
     * Add cache headers for static assets
     */
    public function add_cache_headers() {
        if (is_admin()) {
            return;
        }
        
        ?>
        <meta http-equiv="Cache-Control" content="public, max-age=31536000">
        <meta http-equiv="Expires" content="<?php echo gmdate('D, d M Y H:i:s', time() + 31536000); ?> GMT">
        <?php
    }
    
    /**
     * Send HTTP cache headers
     */
    public function send_cache_headers() {
        if (is_admin() || is_user_logged_in()) {
            return;
        }
        
        // Set cache headers for static content
        if ($this->is_static_request()) {
            header('Cache-Control: public, max-age=31536000, immutable');
            header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
        } else {
            // Set shorter cache for dynamic content
            header('Cache-Control: public, max-age=300'); // 5 minutes
        }
    }
    
    /**
     * Check if current request is for static content
     */
    private function is_static_request() {
        $request_uri = $_SERVER['REQUEST_URI'] ?? '';
        $static_extensions = array('.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot');
        
        foreach ($static_extensions as $ext) {
            if (strpos($request_uri, $ext) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * AJAX handler for dashboard data loading
     */
    public function ajax_load_dashboard_data() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_nonce')) {
            wp_send_json_error('Security check failed');
        }
        
        $user_id = intval($_POST['user_id']);
        if (!$user_id) {
            wp_send_json_error('Invalid user ID');
        }
        
        // Check cache first
        $cache_key = $this->transient_prefix . 'dashboard_' . $user_id;
        $cached_data = get_transient($cache_key);
        
        if ($cached_data !== false) {
            wp_send_json_success(array(
                'data' => $cached_data,
                'cached' => true,
                'cache_time' => get_option($cache_key . '_time', time())
            ));
        }
        
        // Load fresh data
        $dashboard_data = $this->load_dashboard_data($user_id);
        
        // Cache the data
        set_transient($cache_key, $dashboard_data, $this->cache_duration);
        update_option($cache_key . '_time', time());
        
        wp_send_json_success(array(
            'data' => $dashboard_data,
            'cached' => false,
            'cache_time' => time()
        ));
    }
    
    /**
     * AJAX handler for navigation data loading
     */
    public function ajax_load_navigation_data() {
        $user_id = is_user_logged_in() ? get_current_user_id() : 0;
        $course_id = sanitize_text_field($_POST['course_id'] ?? 'pmp-prep-course');
        
        // Check cache first
        $cache_key = $this->transient_prefix . 'navigation_' . $user_id . '_' . $course_id;
        $cached_data = get_transient($cache_key);
        
        if ($cached_data !== false) {
            wp_send_json_success(array(
                'data' => $cached_data,
                'cached' => true
            ));
        }
        
        // Load fresh data
        $navigation_data = $this->load_navigation_data($user_id, $course_id);
        
        // Cache the data (shorter cache for navigation)
        set_transient($cache_key, $navigation_data, 1800); // 30 minutes
        
        wp_send_json_success(array(
            'data' => $navigation_data,
            'cached' => false
        ));
    }
    
    /**
     * AJAX handler for progress data loading
     */
    public function ajax_load_progress_data() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'pmp_nonce')) {
            wp_send_json_error('Security check failed');
        }
        
        $user_id = intval($_POST['user_id']);
        if (!$user_id) {
            wp_send_json_error('Invalid user ID');
        }
        
        // Check cache first
        $cache_key = $this->transient_prefix . 'progress_' . $user_id;
        $cached_data = get_transient($cache_key);
        
        if ($cached_data !== false) {
            wp_send_json_success(array(
                'data' => $cached_data,
                'cached' => true
            ));
        }
        
        // Load fresh data
        $progress_data = $this->load_progress_data($user_id);
        
        // Cache the data (shorter cache for progress)
        set_transient($cache_key, $progress_data, 900); // 15 minutes
        
        wp_send_json_success(array(
            'data' => $progress_data,
            'cached' => false
        ));
    }
    
    /**
     * Load dashboard data
     */
    private function load_dashboard_data($user_id) {
        if (class_exists('PMP_Dashboard')) {
            $dashboard = new PMP_Dashboard($user_id);
            return array(
                'progress_stats' => $dashboard->get_progress_stats(),
                'next_lesson' => $dashboard->get_next_lesson(),
                'recent_activity' => $dashboard->get_recent_activity(),
                'quick_stats' => $dashboard->get_quick_stats()
            );
        }
        
        // Fallback data
        return array(
            'progress_stats' => array('percentage' => 0, 'completed' => 0, 'total' => 91),
            'next_lesson' => null,
            'recent_activity' => array(),
            'quick_stats' => array()
        );
    }
    
    /**
     * Load navigation data
     */
    private function load_navigation_data($user_id, $course_id) {
        if (class_exists('PMP_Course_Navigation')) {
            $navigation = new PMP_Course_Navigation($user_id, $course_id);
            return array(
                'modules' => $navigation->get_course_modules(),
                'progress' => $navigation->get_user_progress(),
                'current_lesson' => $navigation->get_current_lesson()
            );
        }
        
        // Fallback data
        return array(
            'modules' => array(),
            'progress' => array(),
            'current_lesson' => null
        );
    }
    
    /**
     * Load progress data
     */
    private function load_progress_data($user_id) {
        if (class_exists('PMP_Progress_Tracker')) {
            $tracker = new PMP_Progress_Tracker($user_id);
            return array(
                'overall_progress' => $tracker->get_overall_progress(),
                'domain_progress' => $tracker->get_domain_progress(),
                'weekly_progress' => $tracker->get_weekly_progress(),
                'time_stats' => $tracker->get_time_statistics()
            );
        }
        
        // Fallback data
        return array(
            'overall_progress' => array('percentage' => 0),
            'domain_progress' => array(),
            'weekly_progress' => array(),
            'time_stats' => array()
        );
    }
    
    /**
     * Register service worker for offline caching
     */
    public function register_service_worker() {
        if (is_admin()) {
            return;
        }
        
        ?>
        <script>
        // Register service worker for offline caching
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('<?php echo get_stylesheet_directory_uri(); ?>/assets/js/sw.js')
                    .then(function(registration) {
                        console.log('ServiceWorker registration successful');
                    })
                    .catch(function(err) {
                        console.log('ServiceWorker registration failed: ', err);
                    });
            });
        }
        </script>
        <?php
    }
    
    /**
     * Preload critical resources
     */
    public function preload_critical_resources() {
        $page_type = $this->get_page_type();
        
        ?>
        <!-- Preload critical API endpoints -->
        <?php if ($page_type === 'dashboard' && is_user_logged_in()): ?>
            <link rel="prefetch" href="<?php echo admin_url('admin-ajax.php?action=pmp_load_dashboard_data'); ?>">
        <?php endif; ?>
        
        <?php if (in_array($page_type, array('lesson', 'course'))): ?>
            <link rel="prefetch" href="<?php echo admin_url('admin-ajax.php?action=pmp_load_navigation_data'); ?>">
        <?php endif; ?>
        
        <!-- Preload next likely page -->
        <?php $this->preload_next_page(); ?>
        <?php
    }
    
    /**
     * Preload next likely page based on current context
     */
    private function preload_next_page() {
        global $post;
        
        if (is_singular('lesson') && $post) {
            // Preload next lesson
            $next_lesson = $this->get_next_lesson($post->ID);
            if ($next_lesson) {
                echo '<link rel="prefetch" href="' . get_permalink($next_lesson->ID) . '">';
            }
        } elseif (is_page('dashboard')) {
            // Preload likely next destinations from dashboard
            echo '<link rel="prefetch" href="' . home_url('/resources/') . '">';
        }
    }
    
    /**
     * Get next lesson (simplified version)
     */
    private function get_next_lesson($current_lesson_id) {
        // This would need proper implementation based on lesson ordering
        return null;
    }
    
    /**
     * Add connection-aware loading script
     */
    public function add_connection_aware_script() {
        ?>
        <script>
        // Connection-aware loading
        (function() {
            'use strict';
            
            // Check connection quality
            function getConnectionQuality() {
                if ('connection' in navigator) {
                    const connection = navigator.connection;
                    const effectiveType = connection.effectiveType;
                    
                    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                        return 'slow';
                    } else if (effectiveType === '3g') {
                        return 'medium';
                    } else {
                        return 'fast';
                    }
                }
                
                // Fallback: measure connection speed
                return measureConnectionSpeed();
            }
            
            // Measure connection speed
            function measureConnectionSpeed() {
                const startTime = performance.now();
                const image = new Image();
                
                return new Promise((resolve) => {
                    image.onload = function() {
                        const endTime = performance.now();
                        const duration = endTime - startTime;
                        
                        if (duration > 1000) {
                            resolve('slow');
                        } else if (duration > 500) {
                            resolve('medium');
                        } else {
                            resolve('fast');
                        }
                    };
                    
                    image.onerror = function() {
                        resolve('slow');
                    };
                    
                    // Use a small test image
                    image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                });
            }
            
            // Adaptive loading based on connection
            function adaptiveLoading() {
                const quality = getConnectionQuality();
                
                if (quality === 'slow') {
                    // Disable non-essential features for slow connections
                    document.body.classList.add('slow-connection');
                    
                    // Disable animations
                    const style = document.createElement('style');
                    style.textContent = `
                        *, *::before, *::after {
                            animation-duration: 0.01ms !important;
                            animation-iteration-count: 1 !important;
                            transition-duration: 0.01ms !important;
                        }
                    `;
                    document.head.appendChild(style);
                    
                    // Reduce image quality
                    const images = document.querySelectorAll('img[data-src]');
                    images.forEach(img => {
                        if (img.dataset.srcLow) {
                            img.dataset.src = img.dataset.srcLow;
                        }
                    });
                    
                    console.log('Slow connection detected - optimizations applied');
                } else if (quality === 'medium') {
                    document.body.classList.add('medium-connection');
                    console.log('Medium connection detected');
                } else {
                    document.body.classList.add('fast-connection');
                    console.log('Fast connection detected');
                }
            }
            
            // Progressive loading for dashboard
            function progressiveLoadDashboard() {
                if (!document.getElementById('pmp-dashboard')) {
                    return;
                }
                
                const quality = getConnectionQuality();
                
                // Load critical content first
                loadDashboardSection('progress', 0);
                
                // Load secondary content based on connection
                const delays = {
                    slow: [2000, 4000, 6000],
                    medium: [1000, 2000, 3000],
                    fast: [500, 1000, 1500]
                };
                
                const sectionDelays = delays[quality] || delays.fast;
                
                setTimeout(() => loadDashboardSection('recent-activity'), sectionDelays[0]);
                setTimeout(() => loadDashboardSection('quick-actions'), sectionDelays[1]);
                setTimeout(() => loadDashboardSection('recommendations'), sectionDelays[2]);
            }
            
            // Load dashboard section
            function loadDashboardSection(section, delay = 0) {
                setTimeout(() => {
                    const element = document.getElementById('dashboard-' + section);
                    if (element) {
                        element.classList.add('loading');
                        
                        // Simulate loading (replace with actual AJAX call)
                        setTimeout(() => {
                            element.classList.remove('loading');
                            element.classList.add('loaded');
                        }, 500);
                    }
                }, delay);
            }
            
            // Initialize on DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    adaptiveLoading();
                    progressiveLoadDashboard();
                });
            } else {
                adaptiveLoading();
                progressiveLoadDashboard();
            }
            
            // Monitor connection changes
            if ('connection' in navigator) {
                navigator.connection.addEventListener('change', adaptiveLoading);
            }
            
        })();
        </script>
        
        <style>
        /* Loading states for progressive loading */
        .loading {
            opacity: 0.6;
            pointer-events: none;
            position: relative;
        }
        
        .loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid var(--pmp-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        .loaded {
            opacity: 1;
            transition: opacity 0.3s ease-in-out;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Slow connection optimizations */
        .slow-connection .card {
            box-shadow: none;
        }
        
        .slow-connection .btn {
            transition: none;
        }
        
        .slow-connection .progress-circle {
            animation: none;
        }
        </style>
        <?php
    }
    
    /**
     * Get current page type
     */
    private function get_page_type() {
        if (is_page('dashboard')) {
            return 'dashboard';
        } elseif (is_singular('lesson')) {
            return 'lesson';
        } elseif (is_singular('course')) {
            return 'course';
        } elseif (is_page('resources')) {
            return 'resources';
        } else {
            return 'default';
        }
    }
    
    /**
     * Clear all PMP caches
     */
    public function clear_all_caches() {
        global $wpdb;
        
        // Clear transients
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
                $this->transient_prefix . '%'
            )
        );
        
        // Clear object cache if available
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
        
        return true;
    }
    
    /**
     * Get cache statistics
     */
    public function get_cache_stats() {
        global $wpdb;
        
        $transient_count = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->options} WHERE option_name LIKE %s",
                '_transient_' . $this->transient_prefix . '%'
            )
        );
        
        return array(
            'transient_count' => intval($transient_count),
            'cache_duration' => $this->cache_duration,
            'cache_prefix' => $this->transient_prefix
        );
    }
}