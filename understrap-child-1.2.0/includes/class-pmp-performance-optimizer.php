<?php
/**
 * PMP Performance Optimizer Class
 * 
 * Handles performance optimizations including lazy loading, asset optimization,
 * and critical CSS inlining for the PMP WordPress theme.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class PMP_Performance_Optimizer {
    
    private $critical_css_cache = [];
    private $lazy_load_enabled = true;
    
    public function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Lazy loading hooks
        add_filter('the_content', array($this, 'add_lazy_loading_to_images'));
        add_filter('post_thumbnail_html', array($this, 'add_lazy_loading_to_thumbnails'), 10, 5);
        add_filter('wp_get_attachment_image_attributes', array($this, 'add_lazy_loading_attributes'), 10, 3);
        
        // Asset optimization hooks
        add_action('wp_enqueue_scripts', array($this, 'optimize_asset_loading'), 999);
        add_action('wp_head', array($this, 'inline_critical_css'), 1);
        add_action('wp_footer', array($this, 'defer_non_critical_css'));
        
        // Performance monitoring
        add_action('wp_footer', array($this, 'add_performance_monitoring'));
        
        // Preload critical resources
        add_action('wp_head', array($this, 'preload_critical_resources'), 5);
    }
    
    /**
     * Add lazy loading to images in content
     */
    public function add_lazy_loading_to_images($content) {
        if (!$this->lazy_load_enabled || is_admin() || is_feed()) {
            return $content;
        }
        
        // Skip if already has loading attribute
        if (strpos($content, 'loading=') !== false) {
            return $content;
        }
        
        // Add lazy loading to img tags
        $content = preg_replace_callback(
            '/<img([^>]+?)src=[\'"]?([^\'"\s>]+)[\'"]?([^>]*)>/i',
            array($this, 'add_lazy_loading_callback'),
            $content
        );
        
        return $content;
    }
    
    /**
     * Callback for adding lazy loading attributes
     */
    private function add_lazy_loading_callback($matches) {
        $img_tag = $matches[0];
        $before_src = $matches[1];
        $src = $matches[2];
        $after_src = $matches[3];
        
        // Skip if image is above the fold (first few images)
        static $image_count = 0;
        $image_count++;
        
        // Don't lazy load first 2 images (likely above the fold)
        if ($image_count <= 2) {
            return $img_tag;
        }
        
        // Skip if already has loading attribute
        if (strpos($img_tag, 'loading=') !== false) {
            return $img_tag;
        }
        
        // Create placeholder image (1x1 transparent pixel)
        $placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        
        // Build new img tag with lazy loading
        $new_img = '<img' . $before_src . 
                   'src="' . $placeholder . '" ' .
                   'data-src="' . $src . '" ' .
                   'loading="lazy" ' .
                   'class="lazy-load" ' .
                   $after_src . '>';
        
        return $new_img;
    }
    
    /**
     * Add lazy loading to post thumbnails
     */
    public function add_lazy_loading_to_thumbnails($html, $post_id, $post_thumbnail_id, $size, $attr) {
        if (!$this->lazy_load_enabled || is_admin()) {
            return $html;
        }
        
        // Skip if already has loading attribute
        if (strpos($html, 'loading=') !== false) {
            return $html;
        }
        
        // Add lazy loading attributes
        $html = str_replace('<img', '<img loading="lazy"', $html);
        
        return $html;
    }
    
    /**
     * Add lazy loading attributes to attachment images
     */
    public function add_lazy_loading_attributes($attr, $attachment, $size) {
        if (!$this->lazy_load_enabled || is_admin()) {
            return $attr;
        }
        
        // Don't add to first few images (above the fold)
        static $attachment_count = 0;
        $attachment_count++;
        
        if ($attachment_count > 2) {
            $attr['loading'] = 'lazy';
            $attr['class'] = isset($attr['class']) ? $attr['class'] . ' lazy-load' : 'lazy-load';
        }
        
        return $attr;
    }
    
    /**
     * Optimize asset loading
     */
    public function optimize_asset_loading() {
        // Defer non-critical JavaScript
        add_filter('script_loader_tag', array($this, 'defer_non_critical_scripts'), 10, 3);
        
        // Preconnect to external domains
        add_action('wp_head', array($this, 'add_preconnect_links'), 5);
        
        // Remove unused CSS/JS on specific pages
        $this->remove_unused_assets();
    }
    
    /**
     * Defer non-critical JavaScript files
     */
    public function defer_non_critical_scripts($tag, $handle, $src) {
        // Critical scripts that should not be deferred
        $critical_scripts = array(
            'jquery',
            'jquery-core',
            'jquery-migrate',
            'pmp-navigation' // Keep navigation interactive
        );
        
        // Don't defer critical scripts or admin scripts
        if (in_array($handle, $critical_scripts) || is_admin()) {
            return $tag;
        }
        
        // Add defer attribute to non-critical scripts
        if (strpos($tag, 'defer') === false) {
            $tag = str_replace(' src', ' defer src', $tag);
        }
        
        return $tag;
    }
    
    /**
     * Inline critical CSS
     */
    public function inline_critical_css() {
        $page_type = $this->get_page_type();
        $critical_css = $this->get_critical_css($page_type);
        
        if (!empty($critical_css)) {
            echo '<style id="critical-css">' . $critical_css . '</style>';
        }
    }
    
    /**
     * Get critical CSS based on page type
     */
    private function get_critical_css($page_type) {
        // Check cache first
        if (isset($this->critical_css_cache[$page_type])) {
            return $this->critical_css_cache[$page_type];
        }
        
        $critical_css = '';
        
        switch ($page_type) {
            case 'dashboard':
                $critical_css = $this->get_dashboard_critical_css();
                break;
            case 'lesson':
                $critical_css = $this->get_lesson_critical_css();
                break;
            case 'course':
                $critical_css = $this->get_course_critical_css();
                break;
            case 'resources':
                $critical_css = $this->get_resources_critical_css();
                break;
            default:
                $critical_css = $this->get_default_critical_css();
        }
        
        // Cache the result
        $this->critical_css_cache[$page_type] = $critical_css;
        
        return $critical_css;
    }
    
    /**
     * Get dashboard critical CSS
     */
    private function get_dashboard_critical_css() {
        return '
        /* Dashboard Critical CSS */
        .dashboard-welcome { background: #f8f9fa; }
        .dashboard-welcome h1 { color: var(--pmp-primary); font-size: 2.5rem; margin-bottom: 0.5rem; }
        .dashboard-welcome .lead { color: #6c757d; }
        .card { border: none; box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075); border-radius: 0.5rem; }
        .progress-circle { transform: rotate(-90deg); }
        .progress-bar-circle { transition: stroke-dashoffset 1s ease-in-out; }
        .btn-primary { background-color: var(--pmp-primary); border-color: var(--pmp-primary); }
        .text-primary { color: var(--pmp-primary) !important; }
        ';
    }
    
    /**
     * Get lesson critical CSS
     */
    private function get_lesson_critical_css() {
        return '
        /* Lesson Critical CSS */
        .lesson-wrapper { min-height: 100vh; }
        .lesson-sidebar { background: #f8f9fa; padding: 1rem; border-radius: 0.5rem; }
        .lesson-main { max-width: 65ch; }
        .lesson-header { margin-bottom: 2rem; }
        .lesson-title { color: var(--pmp-primary); font-size: 2rem; margin-bottom: 1rem; }
        .lesson-meta { display: flex; gap: 1rem; margin-bottom: 1rem; color: #6c757d; }
        .lesson-content { line-height: 1.7; }
        .breadcrumb { background: transparent; padding: 0; margin-bottom: 1rem; }
        ';
    }
    
    /**
     * Get course critical CSS
     */
    private function get_course_critical_css() {
        return '
        /* Course Critical CSS */
        .course-hero { background: linear-gradient(135deg, var(--pmp-primary), var(--pmp-secondary)); color: white; padding: 4rem 0; }
        .course-stats { display: flex; gap: 2rem; margin-top: 2rem; }
        .stat-item { text-align: center; }
        .module-section { margin-bottom: 3rem; }
        .lesson-card { border: 1px solid #e9ecef; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; }
        .btn-primary { background-color: var(--pmp-primary); border-color: var(--pmp-primary); }
        ';
    }
    
    /**
     * Get resources critical CSS
     */
    private function get_resources_critical_css() {
        return '
        /* Resources Critical CSS */
        .resources-header { background: #f8f9fa; padding: 3rem 0; }
        .resource-category { margin-bottom: 3rem; }
        .resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .resource-card { border: 1px solid #e9ecef; border-radius: 0.5rem; padding: 1.5rem; transition: transform 0.2s; }
        .resource-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        ';
    }
    
    /**
     * Get default critical CSS
     */
    private function get_default_critical_css() {
        return '
        /* Default Critical CSS */
        :root {
            --pmp-primary: #5b28b3;
            --pmp-primary-dark: #4c1d95;
            --pmp-secondary: #7c3aed;
            --pmp-people: #059669;
            --pmp-process: #1e40af;
            --pmp-business: #c2410c;
        }
        body { font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .container { max-width: 1200px; }
        .btn { border-radius: 0.375rem; font-weight: 600; }
        .card { border-radius: 0.5rem; }
        .text-primary { color: var(--pmp-primary) !important; }
        ';
    }
    
    /**
     * Defer non-critical CSS
     */
    public function defer_non_critical_css() {
        ?>
        <script>
        // Load non-critical CSS asynchronously
        function loadCSS(href, before, media) {
            var doc = window.document;
            var ss = doc.createElement("link");
            var ref;
            if (before) {
                ref = before;
            } else {
                var refs = (doc.body || doc.getElementsByTagName("head")[0]).childNodes;
                ref = refs[refs.length - 1];
            }
            var sheets = doc.styleSheets;
            ss.rel = "stylesheet";
            ss.href = href;
            ss.media = "only x";
            function ready(cb) {
                if (doc.body) {
                    return cb();
                }
                setTimeout(function() {
                    ready(cb);
                });
            }
            ready(function() {
                ref.parentNode.insertBefore(ss, (before ? ref : ref.nextSibling));
            });
            var onloadcssdefined = function(cb) {
                var resolvedHref = ss.href;
                var i = sheets.length;
                while (i--) {
                    if (sheets[i].href === resolvedHref) {
                        return cb();
                    }
                }
                setTimeout(function() {
                    onloadcssdefined(cb);
                });
            };
            function loadCB() {
                if (ss.addEventListener) {
                    ss.removeEventListener("load", loadCB);
                }
                ss.media = media || "all";
            }
            if (ss.addEventListener) {
                ss.addEventListener("load", loadCB);
            }
            ss.onloadcssdefined = onloadcssdefined;
            onloadcssdefined(loadCB);
            return ss;
        }
        
        // Load deferred stylesheets
        <?php
        $deferred_styles = $this->get_deferred_stylesheets();
        foreach ($deferred_styles as $style) {
            echo 'loadCSS("' . esc_url($style) . '");';
        }
        ?>
        </script>
        <?php
    }
    
    /**
     * Get list of stylesheets to defer
     */
    private function get_deferred_stylesheets() {
        $styles = array();
        
        // Add non-critical stylesheets
        $styles[] = get_stylesheet_directory_uri() . '/assets/css/pmp-components.css';
        
        // Add Font Awesome if not critical
        if (!$this->is_font_awesome_critical()) {
            $styles[] = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
        }
        
        return $styles;
    }
    
    /**
     * Check if Font Awesome is critical for current page
     */
    private function is_font_awesome_critical() {
        $page_type = $this->get_page_type();
        
        // Font Awesome is critical for dashboard and navigation
        return in_array($page_type, array('dashboard', 'lesson'));
    }
    
    /**
     * Add preconnect links for external resources
     */
    public function add_preconnect_links() {
        ?>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com">
        <?php
    }
    
    /**
     * Preload critical resources
     */
    public function preload_critical_resources() {
        $page_type = $this->get_page_type();
        
        // Preload critical fonts
        ?>
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
        <?php
        
        // Preload critical JavaScript
        if ($page_type === 'dashboard') {
            ?>
            <link rel="preload" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/js/dashboard.js" as="script">
            <?php
        } elseif ($page_type === 'lesson') {
            ?>
            <link rel="preload" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/js/lesson-interactions.js" as="script">
            <?php
        }
    }
    
    /**
     * Remove unused assets on specific pages
     */
    private function remove_unused_assets() {
        $page_type = $this->get_page_type();
        
        // Remove dashboard scripts from non-dashboard pages
        if ($page_type !== 'dashboard') {
            wp_dequeue_script('pmp-dashboard');
            wp_deregister_script('pmp-dashboard');
        }
        
        // Remove lesson scripts from non-lesson pages
        if ($page_type !== 'lesson') {
            wp_dequeue_script('pmp-lesson-interactions');
            wp_deregister_script('pmp-lesson-interactions');
        }
        
        // Remove resources scripts from non-resources pages
        if ($page_type !== 'resources') {
            wp_dequeue_script('pmp-resources');
            wp_deregister_script('pmp-resources');
        }
    }
    
    /**
     * Get current page type for optimization
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
     * Add performance monitoring script
     */
    public function add_performance_monitoring() {
        if (WP_DEBUG || current_user_can('manage_options')) {
            ?>
            <script>
            // Performance monitoring for development
            window.addEventListener('load', function() {
                if (window.performance && window.performance.timing) {
                    var timing = window.performance.timing;
                    var loadTime = timing.loadEventEnd - timing.navigationStart;
                    var domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
                    
                    console.log('Page Load Time: ' + loadTime + 'ms');
                    console.log('DOM Ready Time: ' + domReady + 'ms');
                    
                    // Log slow loading times
                    if (loadTime > 3000) {
                        console.warn('Slow page load detected: ' + loadTime + 'ms');
                    }
                }
                
                // Monitor lazy loading
                if (typeof IntersectionObserver !== 'undefined') {
                    var lazyImages = document.querySelectorAll('.lazy-load');
                    console.log('Lazy loading enabled for ' + lazyImages.length + ' images');
                }
            });
            </script>
            <?php
        }
    }
    
    /**
     * Enable/disable lazy loading
     */
    public function set_lazy_loading($enabled) {
        $this->lazy_load_enabled = $enabled;
    }
    
    /**
     * Clear critical CSS cache
     */
    public function clear_critical_css_cache() {
        $this->critical_css_cache = array();
    }
}