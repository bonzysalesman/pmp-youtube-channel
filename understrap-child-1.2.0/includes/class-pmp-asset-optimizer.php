<?php
/**
 * PMP Asset Optimizer Class
 * 
 * Handles CSS and JavaScript minification, combination, and optimization
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class PMP_Asset_Optimizer {
    
    private $cache_dir;
    private $cache_url;
    private $version;
    
    public function __construct() {
        $this->cache_dir = WP_CONTENT_DIR . '/cache/pmp-assets/';
        $this->cache_url = WP_CONTENT_URL . '/cache/pmp-assets/';
        $this->version = get_option('pmp_asset_version', '1.0.0');
        
        $this->init_hooks();
        $this->ensure_cache_directory();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        add_action('wp_enqueue_scripts', array($this, 'optimize_enqueued_assets'), 999);
        add_action('admin_init', array($this, 'maybe_regenerate_assets'));
        add_action('wp_ajax_pmp_clear_asset_cache', array($this, 'clear_asset_cache'));
        add_filter('style_loader_src', array($this, 'optimize_css_src'), 10, 2);
        add_filter('script_loader_src', array($this, 'optimize_js_src'), 10, 2);
    }
    
    /**
     * Ensure cache directory exists
     */
    private function ensure_cache_directory() {
        if (!file_exists($this->cache_dir)) {
            wp_mkdir_p($this->cache_dir);
            
            // Create .htaccess for cache headers
            $htaccess_content = "
# Cache static assets for 1 year
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css \"access plus 1 year\"
    ExpiresByType application/javascript \"access plus 1 year\"
</IfModule>

# Add cache headers
<IfModule mod_headers.c>
    <FilesMatch \"\.(css|js)$\">
        Header set Cache-Control \"public, max-age=31536000, immutable\"
    </FilesMatch>
</IfModule>
";
            file_put_contents($this->cache_dir . '.htaccess', $htaccess_content);
        }
    }
    
    /**
     * Optimize enqueued assets
     */
    public function optimize_enqueued_assets() {
        global $wp_styles, $wp_scripts;
        
        if (is_admin() || WP_DEBUG) {
            return; // Skip optimization in admin or debug mode
        }
        
        // Combine and minify CSS
        $this->combine_css_files();
        
        // Combine and minify JavaScript
        $this->combine_js_files();
    }
    
    /**
     * Combine CSS files
     */
    private function combine_css_files() {
        global $wp_styles;
        
        $pmp_styles = array();
        $combined_content = '';
        $combined_hash = '';
        
        // Collect PMP-specific styles
        foreach ($wp_styles->queue as $handle) {
            if (strpos($handle, 'pmp-') === 0 || $handle === 'understrap-child-style') {
                $style = $wp_styles->registered[$handle];
                if ($style && $this->is_local_file($style->src)) {
                    $pmp_styles[] = $handle;
                    $file_path = $this->get_local_file_path($style->src);
                    if (file_exists($file_path)) {
                        $content = file_get_contents($file_path);
                        $combined_content .= $this->process_css_content($content, $style->src);
                        $combined_hash .= filemtime($file_path);
                    }
                }
            }
        }
        
        if (!empty($pmp_styles)) {
            $cache_key = 'pmp-combined-' . md5($combined_hash) . '.css';
            $cache_file = $this->cache_dir . $cache_key;
            $cache_url = $this->cache_url . $cache_key;
            
            // Generate combined file if it doesn't exist
            if (!file_exists($cache_file)) {
                $minified_content = $this->minify_css($combined_content);
                file_put_contents($cache_file, $minified_content);
            }
            
            // Dequeue individual styles and enqueue combined
            foreach ($pmp_styles as $handle) {
                wp_dequeue_style($handle);
            }
            
            wp_enqueue_style('pmp-combined', $cache_url, array(), $this->version);
        }
    }
    
    /**
     * Combine JavaScript files
     */
    private function combine_js_files() {
        global $wp_scripts;
        
        $pmp_scripts = array();
        $combined_content = '';
        $combined_hash = '';
        
        // Collect PMP-specific scripts (excluding jQuery and critical scripts)
        foreach ($wp_scripts->queue as $handle) {
            if (strpos($handle, 'pmp-') === 0 && $handle !== 'pmp-navigation') {
                $script = $wp_scripts->registered[$handle];
                if ($script && $this->is_local_file($script->src)) {
                    $pmp_scripts[] = $handle;
                    $file_path = $this->get_local_file_path($script->src);
                    if (file_exists($file_path)) {
                        $content = file_get_contents($file_path);
                        $combined_content .= $this->process_js_content($content, $handle);
                        $combined_hash .= filemtime($file_path);
                    }
                }
            }
        }
        
        if (!empty($pmp_scripts)) {
            $cache_key = 'pmp-combined-' . md5($combined_hash) . '.js';
            $cache_file = $this->cache_dir . $cache_key;
            $cache_url = $this->cache_url . $cache_key;
            
            // Generate combined file if it doesn't exist
            if (!file_exists($cache_file)) {
                $minified_content = $this->minify_js($combined_content);
                file_put_contents($cache_file, $minified_content);
            }
            
            // Dequeue individual scripts and enqueue combined
            foreach ($pmp_scripts as $handle) {
                wp_dequeue_script($handle);
            }
            
            wp_enqueue_script('pmp-combined', $cache_url, array('jquery'), $this->version, true);
        }
    }
    
    /**
     * Process CSS content (handle relative URLs, etc.)
     */
    private function process_css_content($content, $original_src) {
        // Convert relative URLs to absolute
        $base_url = dirname($original_src);
        
        $content = preg_replace_callback(
            '/url\s*\(\s*[\'"]?([^\'")]+)[\'"]?\s*\)/i',
            function($matches) use ($base_url) {
                $url = $matches[1];
                
                // Skip data URLs and absolute URLs
                if (strpos($url, 'data:') === 0 || strpos($url, 'http') === 0 || strpos($url, '//') === 0) {
                    return $matches[0];
                }
                
                // Convert relative to absolute
                if (strpos($url, '/') !== 0) {
                    $url = $base_url . '/' . $url;
                }
                
                return 'url(' . $url . ')';
            },
            $content
        );
        
        return $content . "\n";
    }
    
    /**
     * Process JavaScript content
     */
    private function process_js_content($content, $handle) {
        // Add semicolon if missing and wrap in IIFE for safety
        $content = rtrim($content, "; \t\n\r\0\x0B");
        if (!empty($content) && substr($content, -1) !== ';') {
            $content .= ';';
        }
        
        return "/* {$handle} */\n" . $content . "\n\n";
    }
    
    /**
     * Minify CSS content
     */
    private function minify_css($css) {
        // Remove comments
        $css = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css);
        
        // Remove whitespace
        $css = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '    ', '    '), '', $css);
        
        // Remove unnecessary spaces
        $css = preg_replace('/\s+/', ' ', $css);
        $css = preg_replace('/\s*{\s*/', '{', $css);
        $css = preg_replace('/;\s*}/', '}', $css);
        $css = preg_replace('/\s*;\s*/', ';', $css);
        $css = preg_replace('/\s*:\s*/', ':', $css);
        $css = preg_replace('/\s*,\s*/', ',', $css);
        $css = preg_replace('/\s*>\s*/', '>', $css);
        $css = preg_replace('/\s*\+\s*/', '+', $css);
        $css = preg_replace('/\s*~\s*/', '~', $css);
        
        // Remove trailing semicolon before closing brace
        $css = str_replace(';}', '}', $css);
        
        return trim($css);
    }
    
    /**
     * Minify JavaScript content
     */
    private function minify_js($js) {
        // Basic JavaScript minification
        // Remove single-line comments (but preserve URLs)
        $js = preg_replace('/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/', '', $js);
        
        // Remove extra whitespace
        $js = preg_replace('/\s+/', ' ', $js);
        
        // Remove spaces around operators and punctuation
        $js = preg_replace('/\s*([{}();,:])\s*/', '$1', $js);
        
        // Remove spaces around operators
        $js = preg_replace('/\s*([=+\-*\/&|!<>])\s*/', '$1', $js);
        
        return trim($js);
    }
    
    /**
     * Check if file is local
     */
    private function is_local_file($src) {
        $site_url = site_url();
        return strpos($src, $site_url) === 0 || strpos($src, '/') === 0;
    }
    
    /**
     * Get local file path from URL
     */
    private function get_local_file_path($src) {
        $site_url = site_url();
        
        if (strpos($src, $site_url) === 0) {
            $relative_path = str_replace($site_url, '', $src);
        } else {
            $relative_path = $src;
        }
        
        // Remove query parameters
        $relative_path = strtok($relative_path, '?');
        
        return ABSPATH . ltrim($relative_path, '/');
    }
    
    /**
     * Optimize CSS source URLs
     */
    public function optimize_css_src($src, $handle) {
        // Add version parameter for cache busting
        if (strpos($handle, 'pmp-') === 0) {
            $src = add_query_arg('v', $this->version, $src);
        }
        
        return $src;
    }
    
    /**
     * Optimize JavaScript source URLs
     */
    public function optimize_js_src($src, $handle) {
        // Add version parameter for cache busting
        if (strpos($handle, 'pmp-') === 0) {
            $src = add_query_arg('v', $this->version, $src);
        }
        
        return $src;
    }
    
    /**
     * Maybe regenerate assets on theme/plugin updates
     */
    public function maybe_regenerate_assets() {
        $current_version = get_option('pmp_asset_version', '1.0.0');
        $theme_version = wp_get_theme()->get('Version');
        
        if (version_compare($current_version, $theme_version, '<')) {
            $this->clear_asset_cache();
            update_option('pmp_asset_version', $theme_version);
        }
    }
    
    /**
     * Clear asset cache
     */
    public function clear_asset_cache() {
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        // Remove all cached files
        $files = glob($this->cache_dir . '*');
        foreach ($files as $file) {
            if (is_file($file) && pathinfo($file, PATHINFO_EXTENSION) !== 'htaccess') {
                unlink($file);
            }
        }
        
        // Update version to force regeneration
        $new_version = time();
        update_option('pmp_asset_version', $new_version);
        $this->version = $new_version;
        
        if (wp_doing_ajax()) {
            wp_send_json_success('Asset cache cleared successfully');
        }
    }
    
    /**
     * Get cache statistics
     */
    public function get_cache_stats() {
        $files = glob($this->cache_dir . '*.{css,js}', GLOB_BRACE);
        $total_size = 0;
        $file_count = count($files);
        
        foreach ($files as $file) {
            $total_size += filesize($file);
        }
        
        return array(
            'file_count' => $file_count,
            'total_size' => $total_size,
            'total_size_formatted' => size_format($total_size),
            'cache_dir' => $this->cache_dir,
            'version' => $this->version
        );
    }
    
    /**
     * Add admin menu for cache management
     */
    public function add_admin_menu() {
        add_submenu_page(
            'themes.php',
            'PMP Asset Cache',
            'Asset Cache',
            'manage_options',
            'pmp-asset-cache',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Admin page for cache management
     */
    public function admin_page() {
        $stats = $this->get_cache_stats();
        ?>
        <div class="wrap">
            <h1>PMP Asset Cache Management</h1>
            
            <div class="card">
                <h2>Cache Statistics</h2>
                <table class="form-table">
                    <tr>
                        <th>Cached Files</th>
                        <td><?php echo esc_html($stats['file_count']); ?></td>
                    </tr>
                    <tr>
                        <th>Total Size</th>
                        <td><?php echo esc_html($stats['total_size_formatted']); ?></td>
                    </tr>
                    <tr>
                        <th>Cache Version</th>
                        <td><?php echo esc_html($stats['version']); ?></td>
                    </tr>
                    <tr>
                        <th>Cache Directory</th>
                        <td><code><?php echo esc_html($stats['cache_dir']); ?></code></td>
                    </tr>
                </table>
            </div>
            
            <div class="card">
                <h2>Cache Actions</h2>
                <p>Clear the asset cache to force regeneration of combined and minified files.</p>
                <button type="button" class="button button-secondary" id="clear-cache-btn">
                    Clear Asset Cache
                </button>
            </div>
        </div>
        
        <script>
        document.getElementById('clear-cache-btn').addEventListener('click', function() {
            if (confirm('Are you sure you want to clear the asset cache?')) {
                fetch(ajaxurl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'action=pmp_clear_asset_cache&_wpnonce=' + '<?php echo wp_create_nonce('pmp_clear_cache'); ?>'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Asset cache cleared successfully!');
                        location.reload();
                    } else {
                        alert('Error clearing cache: ' + data.data);
                    }
                });
            }
        });
        </script>
        <?php
    }
}