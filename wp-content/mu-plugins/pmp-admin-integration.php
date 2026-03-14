<?php
/**
 * Plugin Name: PMP Course Admin Integration
 * Description: Makes PMP course content, categories, and metadata visible in WordPress admin
 * Version: 1.0.0
 * Author: PMP Course System
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class PMP_Admin_Integration {
    
    public function __construct() {
        add_action('init', array($this, 'register_post_type'));
        add_action('init', array($this, 'register_taxonomies'));
        add_action('add_meta_boxes', array($this, 'add_meta_boxes'));
        add_action('save_post', array($this, 'save_meta_boxes'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_filter('manage_lesson_posts_columns', array($this, 'add_lesson_columns'));
        add_action('manage_lesson_posts_custom_column', array($this, 'fill_lesson_columns'), 10, 2);
        add_filter('manage_edit-lesson_sortable_columns', array($this, 'make_lesson_columns_sortable'));
    }
    
    /**
     * Register the Lesson custom post type
     */
    public function register_post_type() {
        $labels = array(
            'name'                  => 'PMP Lessons',
            'singular_name'         => 'Lesson',
            'menu_name'             => 'PMP Course',
            'name_admin_bar'        => 'Lesson',
            'archives'              => 'Lesson Archives',
            'attributes'            => 'Lesson Attributes',
            'parent_item_colon'     => 'Parent Lesson:',
            'all_items'             => 'All Lessons',
            'add_new_item'          => 'Add New Lesson',
            'add_new'               => 'Add New',
            'new_item'              => 'New Lesson',
            'edit_item'             => 'Edit Lesson',
            'update_item'           => 'Update Lesson',
            'view_item'             => 'View Lesson',
            'view_items'            => 'View Lessons',
            'search_items'          => 'Search Lessons',
            'not_found'             => 'Not found',
            'not_found_in_trash'    => 'Not found in Trash',
            'featured_image'        => 'Featured Image',
            'set_featured_image'    => 'Set featured image',
            'remove_featured_image' => 'Remove featured image',
            'use_featured_image'    => 'Use as featured image',
            'insert_into_item'      => 'Insert into lesson',
            'uploaded_to_this_item' => 'Uploaded to this lesson',
            'items_list'            => 'Lessons list',
            'items_list_navigation' => 'Lessons list navigation',
            'filter_items_list'     => 'Filter lessons list',
        );
        
        $args = array(
            'label'                 => 'Lesson',
            'description'           => 'PMP Course Lessons',
            'labels'                => $labels,
            'supports'              => array('title', 'editor', 'excerpt', 'thumbnail', 'comments', 'custom-fields'),
            'taxonomies'            => array('lesson_category'),
            'hierarchical'          => false,
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'menu_position'         => 5,
            'menu_icon'             => 'dashicons-book-alt',
            'show_in_admin_bar'     => true,
            'show_in_nav_menus'     => true,
            'can_export'            => true,
            'has_archive'           => true,
            'exclude_from_search'   => false,
            'publicly_queryable'    => true,
            'capability_type'       => 'post',
            'show_in_rest'          => true,
        );
        
        register_post_type('lesson', $args);
    }
    
    /**
     * Register taxonomies
     */
    public function register_taxonomies() {
        // Lesson Categories
        $labels = array(
            'name'                       => 'Lesson Categories',
            'singular_name'              => 'Lesson Category',
            'menu_name'                  => 'Categories',
            'all_items'                  => 'All Categories',
            'parent_item'                => 'Parent Category',
            'parent_item_colon'          => 'Parent Category:',
            'new_item_name'              => 'New Category Name',
            'add_new_item'               => 'Add New Category',
            'edit_item'                  => 'Edit Category',
            'update_item'                => 'Update Category',
            'view_item'                  => 'View Category',
            'separate_items_with_commas' => 'Separate categories with commas',
            'add_or_remove_items'        => 'Add or remove categories',
            'choose_from_most_used'      => 'Choose from the most used',
            'popular_items'              => 'Popular Categories',
            'search_items'               => 'Search Categories',
            'not_found'                  => 'Not Found',
            'no_terms'                   => 'No categories',
            'items_list'                 => 'Categories list',
            'items_list_navigation'      => 'Categories list navigation',
        );
        
        $args = array(
            'labels'                     => $labels,
            'hierarchical'               => true,
            'public'                     => true,
            'show_ui'                    => true,
            'show_admin_column'          => true,
            'show_in_nav_menus'          => true,
            'show_tagcloud'              => true,
            'show_in_rest'               => true,
        );
        
        register_taxonomy('lesson_category', array('lesson'), $args);
    }
    
    /**
     * Add meta boxes
     */
    public function add_meta_boxes() {
        add_meta_box(
            'pmp_lesson_details',
            'Lesson Details',
            array($this, 'lesson_details_callback'),
            'lesson',
            'normal',
            'high'
        );
        
        add_meta_box(
            'pmp_eco_tasks',
            'ECO Tasks & References',
            array($this, 'eco_tasks_callback'),
            'lesson',
            'side',
            'default'
        );
        
        add_meta_box(
            'pmp_lesson_stats',
            'Lesson Statistics',
            array($this, 'lesson_stats_callback'),
            'lesson',
            'side',
            'default'
        );
    }
    
    /**
     * Lesson details meta box callback
     */
    public function lesson_details_callback($post) {
        wp_nonce_field('pmp_lesson_details_nonce', 'pmp_lesson_details_nonce');
        
        $week_number = get_post_meta($post->ID, 'week_number', true);
        $domain = get_post_meta($post->ID, 'domain', true);
        $chunk_name = get_post_meta($post->ID, 'chunk_name', true);
        $difficulty_rating = get_post_meta($post->ID, 'difficulty_rating', true);
        $key_learning_outcomes = get_post_meta($post->ID, 'key_learning_outcomes', true);
        
        if (is_string($key_learning_outcomes)) {
            $key_learning_outcomes = json_decode($key_learning_outcomes, true);
        }
        ?>
        <table class="form-table">
            <tr>
                <th><label for="week_number">Week Number</label></th>
                <td>
                    <select name="week_number" id="week_number">
                        <?php for ($i = 1; $i <= 13; $i++): ?>
                            <option value="<?php echo $i; ?>" <?php selected($week_number, $i); ?>>
                                Week <?php echo $i; ?>
                            </option>
                        <?php endfor; ?>
                    </select>
                </td>
            </tr>
            <tr>
                <th><label for="domain">Domain</label></th>
                <td>
                    <select name="domain" id="domain">
                        <option value="Foundation" <?php selected($domain, 'Foundation'); ?>>Foundation</option>
                        <option value="People" <?php selected($domain, 'People'); ?>>People (42%)</option>
                        <option value="Process" <?php selected($domain, 'Process'); ?>>Process (50%)</option>
                        <option value="Business Environment" <?php selected($domain, 'Business Environment'); ?>>Business Environment (8%)</option>
                        <option value="General" <?php selected($domain, 'General'); ?>>General</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th><label for="chunk_name">Chunk Name</label></th>
                <td><input type="text" name="chunk_name" id="chunk_name" value="<?php echo esc_attr($chunk_name); ?>" class="regular-text" readonly /></td>
            </tr>
            <tr>
                <th><label for="difficulty_rating">Difficulty Rating</label></th>
                <td>
                    <input type="number" name="difficulty_rating" id="difficulty_rating" value="<?php echo esc_attr($difficulty_rating); ?>" min="1" max="5" step="0.1" />
                    <p class="description">1 = Very Easy, 5 = Very Difficult</p>
                </td>
            </tr>
            <tr>
                <th><label for="key_learning_outcomes">Key Learning Outcomes</label></th>
                <td>
                    <textarea name="key_learning_outcomes" id="key_learning_outcomes" rows="4" class="large-text"><?php 
                        if (is_array($key_learning_outcomes)) {
                            echo esc_textarea(implode("\n", $key_learning_outcomes));
                        } else {
                            echo esc_textarea($key_learning_outcomes);
                        }
                    ?></textarea>
                    <p class="description">One outcome per line</p>
                </td>
            </tr>
        </table>
        <?php
    }
    
    /**
     * ECO tasks meta box callback
     */
    public function eco_tasks_callback($post) {
        $eco_tasks = get_post_meta($post->ID, 'eco_tasks', true);
        $video_references = get_post_meta($post->ID, 'video_references', true);
        
        if (is_string($eco_tasks)) {
            $eco_tasks = json_decode($eco_tasks, true);
        }
        if (is_string($video_references)) {
            $video_references = json_decode($video_references, true);
        }
        ?>
        <p><strong>ECO Tasks:</strong></p>
        <textarea name="eco_tasks" rows="3" class="widefat"><?php 
            if (is_array($eco_tasks)) {
                echo esc_textarea(implode("\n", $eco_tasks));
            } else {
                echo esc_textarea($eco_tasks);
            }
        ?></textarea>
        <p class="description">One ECO task per line</p>
        
        <p><strong>Video References:</strong></p>
        <textarea name="video_references" rows="3" class="widefat"><?php 
            if (is_array($video_references)) {
                echo esc_textarea(implode("\n", $video_references));
            } else {
                echo esc_textarea($video_references);
            }
        ?></textarea>
        <p class="description">One video reference per line</p>
        <?php
    }
    
    /**
     * Lesson statistics meta box callback
     */
    public function lesson_stats_callback($post) {
        $estimated_read_time = get_post_meta($post->ID, 'estimated_read_time', true);
        $word_count = get_post_meta($post->ID, 'word_count', true);
        $file_path = get_post_meta($post->ID, 'file_path', true);
        ?>
        <p><strong>Estimated Read Time:</strong> <?php echo esc_html($estimated_read_time); ?> minutes</p>
        <p><strong>Word Count:</strong> <?php echo esc_html($word_count); ?> words</p>
        <p><strong>Source File:</strong><br><code><?php echo esc_html($file_path); ?></code></p>
        <?php
    }
    
    /**
     * Save meta box data
     */
    public function save_meta_boxes($post_id) {
        if (!isset($_POST['pmp_lesson_details_nonce']) || !wp_verify_nonce($_POST['pmp_lesson_details_nonce'], 'pmp_lesson_details_nonce')) {
            return;
        }
        
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        // Save lesson details
        if (isset($_POST['week_number'])) {
            update_post_meta($post_id, 'week_number', sanitize_text_field($_POST['week_number']));
        }
        
        if (isset($_POST['domain'])) {
            update_post_meta($post_id, 'domain', sanitize_text_field($_POST['domain']));
        }
        
        if (isset($_POST['difficulty_rating'])) {
            update_post_meta($post_id, 'difficulty_rating', floatval($_POST['difficulty_rating']));
        }
        
        if (isset($_POST['key_learning_outcomes'])) {
            $outcomes = array_filter(array_map('trim', explode("\n", $_POST['key_learning_outcomes'])));
            update_post_meta($post_id, 'key_learning_outcomes', json_encode($outcomes));
        }
        
        if (isset($_POST['eco_tasks'])) {
            $tasks = array_filter(array_map('trim', explode("\n", $_POST['eco_tasks'])));
            update_post_meta($post_id, 'eco_tasks', json_encode($tasks));
        }
        
        if (isset($_POST['video_references'])) {
            $videos = array_filter(array_map('trim', explode("\n", $_POST['video_references'])));
            update_post_meta($post_id, 'video_references', json_encode($videos));
        }
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_submenu_page(
            'edit.php?post_type=lesson',
            'Course Overview',
            'Course Overview',
            'manage_options',
            'pmp-course-overview',
            array($this, 'course_overview_page')
        );
        
        add_submenu_page(
            'edit.php?post_type=lesson',
            'Cross References',
            'Cross References',
            'manage_options',
            'pmp-cross-references',
            array($this, 'cross_references_page')
        );
    }
    
    /**
     * Course overview admin page
     */
    public function course_overview_page() {
        global $wpdb;
        
        // Get lesson statistics
        $total_lessons = wp_count_posts('lesson')->publish;
        
        $weeks_data = $wpdb->get_results("
            SELECT 
                pm.meta_value as week_number,
                COUNT(*) as lesson_count,
                pm2.meta_value as domain
            FROM {$wpdb->postmeta} pm
            JOIN {$wpdb->posts} p ON pm.post_id = p.ID
            LEFT JOIN {$wpdb->postmeta} pm2 ON p.ID = pm2.post_id AND pm2.meta_key = 'domain'
            WHERE pm.meta_key = 'week_number' 
            AND p.post_type = 'lesson' 
            AND p.post_status = 'publish'
            GROUP BY pm.meta_value, pm2.meta_value
            ORDER BY CAST(pm.meta_value AS UNSIGNED)
        ");
        
        $domain_stats = $wpdb->get_results("
            SELECT 
                pm.meta_value as domain,
                COUNT(*) as lesson_count
            FROM {$wpdb->postmeta} pm
            JOIN {$wpdb->posts} p ON pm.post_id = p.ID
            WHERE pm.meta_key = 'domain' 
            AND p.post_type = 'lesson' 
            AND p.post_status = 'publish'
            GROUP BY pm.meta_value
        ");
        ?>
        <div class="wrap">
            <h1>PMP Course Overview</h1>
            
            <div class="pmp-stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div class="postbox">
                    <h2 class="hndle">Course Statistics</h2>
                    <div class="inside">
                        <p><strong>Total Lessons:</strong> <?php echo $total_lessons; ?></p>
                        <p><strong>Total Weeks:</strong> 13</p>
                        <p><strong>Completion Status:</strong> <?php echo round(($total_lessons / 91) * 100, 1); ?>%</p>
                    </div>
                </div>
                
                <div class="postbox">
                    <h2 class="hndle">Domain Distribution</h2>
                    <div class="inside">
                        <?php foreach ($domain_stats as $stat): ?>
                            <p><strong><?php echo esc_html($stat->domain); ?>:</strong> <?php echo $stat->lesson_count; ?> lessons</p>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
            
            <div class="postbox">
                <h2 class="hndle">Week-by-Week Breakdown</h2>
                <div class="inside">
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th>Week</th>
                                <th>Domain Focus</th>
                                <th>Lessons</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                            $current_week = 0;
                            foreach ($weeks_data as $week): 
                                if ($week->week_number != $current_week):
                                    $current_week = $week->week_number;
                            ?>
                            <tr>
                                <td>Week <?php echo esc_html($week->week_number); ?></td>
                                <td>
                                    <span class="domain-badge domain-<?php echo strtolower(str_replace(' ', '-', $week->domain)); ?>">
                                        <?php echo esc_html($week->domain); ?>
                                    </span>
                                </td>
                                <td><?php echo $week->lesson_count; ?></td>
                                <td><span class="status-complete">✅ Complete</span></td>
                            </tr>
                            <?php 
                                endif;
                            endforeach; 
                            ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <style>
        .domain-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: white;
        }
        .domain-foundation { background-color: #6c757d; }
        .domain-people { background-color: #28a745; }
        .domain-process { background-color: #007bff; }
        .domain-business-environment { background-color: #fd7e14; }
        .domain-general { background-color: #6f42c1; }
        .status-complete { color: #28a745; font-weight: bold; }
        </style>
        <?php
    }
    
    /**
     * Cross references admin page
     */
    public function cross_references_page() {
        $eco_mapping = get_option('pmp_eco_task_mapping', array());
        $video_mapping = get_option('pmp_video_mapping', array());
        ?>
        <div class="wrap">
            <h1>Cross References</h1>
            
            <div class="postbox">
                <h2 class="hndle">ECO Task Mapping</h2>
                <div class="inside">
                    <?php if (!empty($eco_mapping)): ?>
                        <p><strong>Status:</strong> ✅ Loaded (<?php echo count($eco_mapping); ?> mappings)</p>
                        <details>
                            <summary>View ECO Mappings</summary>
                            <pre style="background: #f1f1f1; padding: 10px; overflow: auto; max-height: 300px;"><?php echo esc_html(json_encode($eco_mapping, JSON_PRETTY_PRINT)); ?></pre>
                        </details>
                    <?php else: ?>
                        <p><strong>Status:</strong> ❌ No ECO mappings found</p>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="postbox">
                <h2 class="hndle">Video Mapping</h2>
                <div class="inside">
                    <?php if (!empty($video_mapping)): ?>
                        <p><strong>Status:</strong> ✅ Loaded (<?php echo count($video_mapping); ?> mappings)</p>
                        <details>
                            <summary>View Video Mappings</summary>
                            <pre style="background: #f1f1f1; padding: 10px; overflow: auto; max-height: 300px;"><?php echo esc_html(json_encode($video_mapping, JSON_PRETTY_PRINT)); ?></pre>
                        </details>
                    <?php else: ?>
                        <p><strong>Status:</strong> ❌ No video mappings found</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Add custom columns to lesson list
     */
    public function add_lesson_columns($columns) {
        $new_columns = array();
        $new_columns['cb'] = $columns['cb'];
        $new_columns['title'] = $columns['title'];
        $new_columns['week'] = 'Week';
        $new_columns['domain'] = 'Domain';
        $new_columns['difficulty'] = 'Difficulty';
        $new_columns['read_time'] = 'Read Time';
        $new_columns['lesson_category'] = $columns['taxonomy-lesson_category'];
        $new_columns['date'] = $columns['date'];
        
        return $new_columns;
    }
    
    /**
     * Fill custom columns
     */
    public function fill_lesson_columns($column, $post_id) {
        switch ($column) {
            case 'week':
                $week = get_post_meta($post_id, 'week_number', true);
                echo $week ? 'Week ' . esc_html($week) : '—';
                break;
                
            case 'domain':
                $domain = get_post_meta($post_id, 'domain', true);
                if ($domain) {
                    echo '<span class="domain-badge domain-' . strtolower(str_replace(' ', '-', $domain)) . '">' . esc_html($domain) . '</span>';
                } else {
                    echo '—';
                }
                break;
                
            case 'difficulty':
                $difficulty = get_post_meta($post_id, 'difficulty_rating', true);
                if ($difficulty) {
                    $stars = str_repeat('★', floor($difficulty)) . str_repeat('☆', 5 - floor($difficulty));
                    echo '<span title="' . esc_attr($difficulty) . '/5">' . $stars . '</span>';
                } else {
                    echo '—';
                }
                break;
                
            case 'read_time':
                $time = get_post_meta($post_id, 'estimated_read_time', true);
                echo $time ? esc_html($time) . ' min' : '—';
                break;
        }
    }
    
    /**
     * Make columns sortable
     */
    public function make_lesson_columns_sortable($columns) {
        $columns['week'] = 'week_number';
        $columns['domain'] = 'domain';
        $columns['difficulty'] = 'difficulty_rating';
        $columns['read_time'] = 'estimated_read_time';
        
        return $columns;
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'lesson') !== false) {
            wp_add_inline_style('wp-admin', '
                .domain-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    color: white;
                    display: inline-block;
                }
                .domain-foundation { background-color: #6c757d; }
                .domain-people { background-color: #28a745; }
                .domain-process { background-color: #007bff; }
                .domain-business-environment { background-color: #fd7e14; }
                .domain-general { background-color: #6f42c1; }
            ');
        }
    }
}

// Initialize the plugin
new PMP_Admin_Integration();

// Add activation hook to flush rewrite rules
register_activation_hook(__FILE__, function() {
    flush_rewrite_rules();
});
?>