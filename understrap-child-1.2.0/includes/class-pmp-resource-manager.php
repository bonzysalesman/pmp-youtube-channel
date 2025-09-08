<?php
/**
 * PMP Resource Manager Class
 * 
 * Handles downloadable resources, access control, tracking, and categorization
 * for the PMP WordPress theme.
 */

if (!defined('ABSPATH')) {
    exit;
}

class PMP_Resource_Manager {
    
    private $resource_categories = [
        'study-guides' => [
            'name' => 'Study Guides',
            'description' => 'Comprehensive study materials for each week',
            'icon' => 'dashicons-book-alt',
            'access_level' => 'registered'
        ],
        'templates' => [
            'name' => 'Templates',
            'description' => 'Project management templates and forms',
            'icon' => 'dashicons-media-document',
            'access_level' => 'registered'
        ],
        'checklists' => [
            'name' => 'Checklists',
            'description' => 'Process checklists and quick reference guides',
            'icon' => 'dashicons-yes-alt',
            'access_level' => 'registered'
        ],
        'reference-materials' => [
            'name' => 'Reference Materials',
            'description' => 'ECO references and additional reading materials',
            'icon' => 'dashicons-admin-links',
            'access_level' => 'registered'
        ],
        'practice-exams' => [
            'name' => 'Practice Exams',
            'description' => 'Mock exams and practice questions',
            'icon' => 'dashicons-clipboard',
            'access_level' => 'premium'
        ]
    ];
    
    private $upload_dir;
    private $resources_dir;
    
    public function __construct() {
        $this->setup_directories();
        add_action('init', [$this, 'init']);
        add_action('wp_ajax_pmp_download_resource', [$this, 'handle_download']);
        add_action('wp_ajax_nopriv_pmp_download_resource', [$this, 'handle_download']);
        add_shortcode('pmp_resources', [$this, 'resources_shortcode']);
        add_shortcode('pmp_resource_download', [$this, 'download_shortcode']);
    }
    
    public function init() {
        $this->register_resource_post_type();
        $this->enqueue_scripts();
        $this->setup_rewrite_rules();
    }
    
    /**
     * Setup resource directories
     */
    private function setup_directories() {
        $upload_dir = wp_upload_dir();
        $this->upload_dir = $upload_dir['basedir'];
        $this->resources_dir = get_stylesheet_directory() . '/resources/';
        
        // Ensure resources directory exists
        if (!file_exists($this->resources_dir)) {
            wp_mkdir_p($this->resources_dir);
        }
        
        // Create category directories
        foreach ($this->resource_categories as $category => $info) {
            $category_dir = $this->resources_dir . $category . '/';
            if (!file_exists($category_dir)) {
                wp_mkdir_p($category_dir);
            }
            
            // Create .htaccess to protect direct access
            $htaccess_file = $category_dir . '.htaccess';
            if (!file_exists($htaccess_file)) {
                file_put_contents($htaccess_file, "deny from all\n");
            }
        }
    }
    
    /**
     * Register custom post type for resources
     */
    private function register_resource_post_type() {
        $labels = [
            'name' => 'Resources',
            'singular_name' => 'Resource',
            'menu_name' => 'PMP Resources',
            'add_new' => 'Add New Resource',
            'add_new_item' => 'Add New Resource',
            'edit_item' => 'Edit Resource',
            'new_item' => 'New Resource',
            'view_item' => 'View Resource',
            'search_items' => 'Search Resources',
            'not_found' => 'No resources found',
            'not_found_in_trash' => 'No resources found in trash'
        ];
        
        $args = [
            'labels' => $labels,
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'menu_icon' => 'dashicons-download',
            'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'has_archive' => false,
            'rewrite' => false,
            'capability_type' => 'post',
            'show_in_rest' => true
        ];
        
        register_post_type('pmp_resource', $args);
        
        // Register taxonomy for resource categories
        register_taxonomy('resource_category', 'pmp_resource', [
            'labels' => [
                'name' => 'Resource Categories',
                'singular_name' => 'Resource Category'
            ],
            'hierarchical' => true,
            'public' => false,
            'show_ui' => true,
            'show_admin_column' => true
        ]);
    }
    
    /**
     * Enqueue scripts and styles
     */
    private function enqueue_scripts() {
        add_action('wp_enqueue_scripts', function() {
            wp_enqueue_script(
                'pmp-resource-manager',
                get_stylesheet_directory_uri() . '/assets/js/resource-manager.js',
                ['jquery'],
                '1.0.0',
                true
            );
            
            wp_localize_script('pmp-resource-manager', 'pmpResources', [
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('pmp_resource_nonce'),
                'userId' => get_current_user_id(),
                'downloadUrl' => home_url('/pmp-download/')
            ]);
            
            wp_enqueue_style(
                'pmp-resources',
                get_stylesheet_directory_uri() . '/assets/css/resources.css',
                [],
                '1.0.0'
            );
        });
    }
    
    /**
     * Setup rewrite rules for secure downloads
     */
    private function setup_rewrite_rules() {
        add_action('init', function() {
            add_rewrite_rule(
                '^pmp-download/([^/]+)/?$',
                'index.php?pmp_download=$matches[1]',
                'top'
            );
        });
        
        add_filter('query_vars', function($vars) {
            $vars[] = 'pmp_download';
            return $vars;
        });
        
        add_action('template_redirect', [$this, 'handle_download_request']);
    }
    
    /**
     * Handle download requests
     */
    public function handle_download_request() {
        $download_id = get_query_var('pmp_download');
        
        if ($download_id) {
            $this->process_download($download_id);
            exit;
        }
    }
    
    /**
     * Process secure download
     */
    private function process_download($resource_id) {
        // Verify user access
        if (!$this->verify_download_access($resource_id)) {
            wp_die('Access denied', 'Download Error', ['response' => 403]);
        }
        
        $resource = $this->get_resource($resource_id);
        
        if (!$resource || !file_exists($resource['file_path'])) {
            wp_die('Resource not found', 'Download Error', ['response' => 404]);
        }
        
        // Track download
        $this->track_download($resource_id, get_current_user_id());
        
        // Serve file
        $this->serve_file($resource);
    }
    
    /**
     * Verify download access
     */
    private function verify_download_access($resource_id) {
        $resource = $this->get_resource($resource_id);
        
        if (!$resource) {
            return false;
        }
        
        $access_level = $resource['access_level'];
        $user_id = get_current_user_id();
        
        switch ($access_level) {
            case 'public':
                return true;
                
            case 'registered':
                return $user_id > 0;
                
            case 'premium':
                return $user_id > 0 && $this->user_has_premium_access($user_id);
                
            case 'admin':
                return current_user_can('administrator');
                
            default:
                return false;
        }
    }
    
    /**
     * Check if user has premium access
     */
    private function user_has_premium_access($user_id) {
        // Check if user has completed certain milestones or has premium subscription
        $completed_lessons = get_user_meta($user_id, 'pmp_completed_lessons', true);
        
        if (!is_array($completed_lessons)) {
            return false;
        }
        
        // Allow premium access if user has completed at least 10 lessons
        return count($completed_lessons) >= 10;
    }
    
    /**
     * Get resource information
     */
    private function get_resource($resource_id) {
        // Try to get from database first
        $post = get_post($resource_id);
        
        if ($post && $post->post_type === 'pmp_resource') {
            $file_path = get_post_meta($resource_id, '_resource_file_path', true);
            $category = get_post_meta($resource_id, '_resource_category', true);
            $access_level = get_post_meta($resource_id, '_resource_access_level', true);
            
            return [
                'id' => $resource_id,
                'title' => $post->post_title,
                'description' => $post->post_content,
                'file_path' => $file_path,
                'category' => $category,
                'access_level' => $access_level ?: 'registered',
                'file_size' => file_exists($file_path) ? filesize($file_path) : 0,
                'mime_type' => wp_check_filetype($file_path)['type']
            ];
        }
        
        return false;
    }
    
    /**
     * Track download activity
     */
    private function track_download($resource_id, $user_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'pmp_resource_downloads';
        
        // Create table if it doesn't exist
        $this->create_downloads_table();
        
        // Insert download record
        $wpdb->insert(
            $table_name,
            [
                'resource_id' => $resource_id,
                'user_id' => $user_id,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                'download_date' => current_time('mysql')
            ],
            ['%d', '%d', '%s', '%s', '%s']
        );
        
        // Update download count
        $current_count = get_post_meta($resource_id, '_download_count', true);
        update_post_meta($resource_id, '_download_count', intval($current_count) + 1);
        
        // Update user's download history
        $user_downloads = get_user_meta($user_id, 'pmp_resource_downloads', true);
        if (!is_array($user_downloads)) {
            $user_downloads = [];
        }
        
        $user_downloads[] = [
            'resource_id' => $resource_id,
            'download_date' => current_time('mysql')
        ];
        
        // Keep only last 100 downloads
        $user_downloads = array_slice($user_downloads, -100);
        update_user_meta($user_id, 'pmp_resource_downloads', $user_downloads);
    }
    
    /**
     * Create downloads tracking table
     */
    private function create_downloads_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'pmp_resource_downloads';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            resource_id bigint(20) NOT NULL,
            user_id bigint(20) DEFAULT NULL,
            ip_address varchar(45) NOT NULL,
            user_agent text,
            download_date datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY resource_id (resource_id),
            KEY user_id (user_id),
            KEY download_date (download_date)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Serve file for download
     */
    private function serve_file($resource) {
        $file_path = $resource['file_path'];
        $filename = basename($file_path);
        $file_size = $resource['file_size'];
        $mime_type = $resource['mime_type'];
        
        // Set headers
        header('Content-Type: ' . $mime_type);
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . $file_size);
        header('Cache-Control: private, must-revalidate');
        header('Pragma: private');
        header('Expires: 0');
        
        // Clear output buffer
        if (ob_get_level()) {
            ob_end_clean();
        }
        
        // Read and output file
        readfile($file_path);
    }
    
    /**
     * Resources shortcode
     * Usage: [pmp_resources category="study-guides" limit="10"]
     */
    public function resources_shortcode($atts) {
        $atts = shortcode_atts([
            'category' => '',
            'limit' => 10,
            'access_level' => '',
            'layout' => 'grid'
        ], $atts);
        
        $resources = $this->get_resources([
            'category' => $atts['category'],
            'limit' => intval($atts['limit']),
            'access_level' => $atts['access_level']
        ]);
        
        ob_start();
        $this->render_resources($resources, $atts['layout']);
        return ob_get_clean();
    }
    
    /**
     * Download shortcode
     * Usage: [pmp_resource_download id="123" text="Download Now"]
     */
    public function download_shortcode($atts) {
        $atts = shortcode_atts([
            'id' => '',
            'text' => 'Download',
            'class' => 'btn btn-primary',
            'icon' => 'dashicons-download'
        ], $atts);
        
        if (empty($atts['id'])) {
            return '<p>Error: Resource ID is required.</p>';
        }
        
        $resource = $this->get_resource($atts['id']);
        
        if (!$resource) {
            return '<p>Error: Resource not found.</p>';
        }
        
        $can_download = $this->verify_download_access($atts['id']);
        
        ob_start();
        ?>
        <div class="pmp-resource-download" data-resource-id="<?php echo esc_attr($atts['id']); ?>">
            <?php if ($can_download): ?>
                <a href="<?php echo home_url('/pmp-download/' . $atts['id']); ?>" 
                   class="<?php echo esc_attr($atts['class']); ?> pmp-download-link"
                   data-resource-id="<?php echo esc_attr($atts['id']); ?>">
                    <span class="<?php echo esc_attr($atts['icon']); ?>"></span>
                    <?php echo esc_html($atts['text']); ?>
                </a>
                <div class="resource-info">
                    <small>
                        <?php echo esc_html($this->format_file_size($resource['file_size'])); ?>
                        | <?php echo esc_html($this->get_file_type($resource['file_path'])); ?>
                    </small>
                </div>
            <?php else: ?>
                <div class="access-denied">
                    <p>Access to this resource requires <?php echo esc_html($resource['access_level']); ?> access.</p>
                    <?php if (!is_user_logged_in()): ?>
                        <a href="<?php echo wp_login_url(get_permalink()); ?>" class="btn btn-secondary">
                            Login to Download
                        </a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Get resources based on criteria
     */
    public function get_resources($args = []) {
        $defaults = [
            'category' => '',
            'limit' => -1,
            'access_level' => '',
            'orderby' => 'title',
            'order' => 'ASC'
        ];
        
        $args = wp_parse_args($args, $defaults);
        
        $query_args = [
            'post_type' => 'pmp_resource',
            'post_status' => 'publish',
            'posts_per_page' => $args['limit'],
            'orderby' => $args['orderby'],
            'order' => $args['order']
        ];
        
        if (!empty($args['category'])) {
            $query_args['meta_query'][] = [
                'key' => '_resource_category',
                'value' => $args['category'],
                'compare' => '='
            ];
        }
        
        if (!empty($args['access_level'])) {
            $query_args['meta_query'][] = [
                'key' => '_resource_access_level',
                'value' => $args['access_level'],
                'compare' => '='
            ];
        }
        
        $query = new WP_Query($query_args);
        $resources = [];
        
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $resource_id = get_the_ID();
                $resource = $this->get_resource($resource_id);
                
                if ($resource) {
                    $resources[] = $resource;
                }
            }
            wp_reset_postdata();
        }
        
        return $resources;
    }
    
    /**
     * Render resources
     */
    private function render_resources($resources, $layout = 'grid') {
        if (empty($resources)) {
            echo '<p>No resources found.</p>';
            return;
        }
        
        $layout_class = $layout === 'list' ? 'resources-list' : 'resources-grid';
        ?>
        <div class="pmp-resources <?php echo esc_attr($layout_class); ?>">
            <?php foreach ($resources as $resource): ?>
                <div class="resource-item" data-category="<?php echo esc_attr($resource['category']); ?>">
                    <div class="resource-header">
                        <h4><?php echo esc_html($resource['title']); ?></h4>
                        <span class="resource-category">
                            <?php echo esc_html($this->resource_categories[$resource['category']]['name'] ?? $resource['category']); ?>
                        </span>
                    </div>
                    
                    <?php if (!empty($resource['description'])): ?>
                        <div class="resource-description">
                            <?php echo wp_kses_post(wp_trim_words($resource['description'], 20)); ?>
                        </div>
                    <?php endif; ?>
                    
                    <div class="resource-meta">
                        <span class="file-size"><?php echo esc_html($this->format_file_size($resource['file_size'])); ?></span>
                        <span class="file-type"><?php echo esc_html($this->get_file_type($resource['file_path'])); ?></span>
                        <span class="download-count">
                            <?php echo intval(get_post_meta($resource['id'], '_download_count', true)); ?> downloads
                        </span>
                    </div>
                    
                    <div class="resource-actions">
                        <?php echo do_shortcode('[pmp_resource_download id="' . $resource['id'] . '"]'); ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        <?php
    }
    
    /**
     * Format file size
     */
    private function format_file_size($bytes) {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
    
    /**
     * Get file type from extension
     */
    private function get_file_type($file_path) {
        $extension = strtoupper(pathinfo($file_path, PATHINFO_EXTENSION));
        
        $types = [
            'PDF' => 'PDF Document',
            'DOC' => 'Word Document',
            'DOCX' => 'Word Document',
            'XLS' => 'Excel Spreadsheet',
            'XLSX' => 'Excel Spreadsheet',
            'PPT' => 'PowerPoint Presentation',
            'PPTX' => 'PowerPoint Presentation',
            'ZIP' => 'Archive',
            'RAR' => 'Archive',
            'TXT' => 'Text File',
            'CSV' => 'CSV File'
        ];
        
        return $types[$extension] ?? $extension;
    }
    
    /**
     * Get download analytics
     */
    public function get_download_analytics($resource_id = null, $days = 30) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'pmp_resource_downloads';
        $date_limit = date('Y-m-d H:i:s', strtotime("-{$days} days"));
        
        $where_clause = "WHERE download_date >= %s";
        $params = [$date_limit];
        
        if ($resource_id) {
            $where_clause .= " AND resource_id = %d";
            $params[] = $resource_id;
        }
        
        $query = "SELECT 
                    resource_id,
                    COUNT(*) as download_count,
                    COUNT(DISTINCT user_id) as unique_users,
                    DATE(download_date) as download_date
                  FROM {$table_name} 
                  {$where_clause}
                  GROUP BY resource_id, DATE(download_date)
                  ORDER BY download_date DESC";
        
        return $wpdb->get_results($wpdb->prepare($query, $params));
    }
}

// Initialize the resource manager
new PMP_Resource_Manager();