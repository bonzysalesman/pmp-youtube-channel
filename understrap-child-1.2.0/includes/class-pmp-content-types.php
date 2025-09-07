<?php

/**
 * PMP Content Types Integration Class
 * 
 * Handles integration with existing WordPress custom post types and taxonomies
 * Provides methods for content management and data retrieval
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined('ABSPATH') || exit;

class PMP_Content_Types
{

    /**
     * Constructor
     */
    public function __construct()
    {
        add_action('init', array($this, 'register_lesson_post_type'));
        add_action('init', array($this, 'register_module_taxonomy'));
        add_action('init', array($this, 'register_domain_taxonomy'));
        add_action('init', array($this, 'register_resource_post_type'));

        // Add meta boxes for custom fields
        add_action('add_meta_boxes', array($this, 'add_lesson_meta_boxes'));
        add_action('add_meta_boxes', array($this, 'add_course_meta_boxes'));
        add_action('add_meta_boxes', array($this, 'add_resource_meta_boxes'));

        // Save meta box data
        add_action('save_post', array($this, 'save_lesson_meta'));
        add_action('save_post', array($this, 'save_course_meta'));
        add_action('save_post', array($this, 'save_resource_meta'));

        // Add REST API endpoints
        add_action('rest_api_init', array($this, 'register_rest_endpoints'));
    }

    /**
     * Register Lesson Custom Post Type
     */
    public function register_lesson_post_type()
    {
        $labels = array(
            'name'                  => _x('Lessons', 'Post Type General Name', 'understrap-child'),
            'singular_name'         => _x('Lesson', 'Post Type Singular Name', 'understrap-child'),
            'menu_name'             => __('Lessons', 'understrap-child'),
            'name_admin_bar'        => __('Lesson', 'understrap-child'),
            'archives'              => __('Lesson Archives', 'understrap-child'),
            'attributes'            => __('Lesson Attributes', 'understrap-child'),
            'parent_item_colon'     => __('Parent Lesson:', 'understrap-child'),
            'all_items'             => __('All Lessons', 'understrap-child'),
            'add_new_item'          => __('Add New Lesson', 'understrap-child'),
            'add_new'               => __('Add New', 'understrap-child'),
            'new_item'              => __('New Lesson', 'understrap-child'),
            'edit_item'             => __('Edit Lesson', 'understrap-child'),
            'update_item'           => __('Update Lesson', 'understrap-child'),
            'view_item'             => __('View Lesson', 'understrap-child'),
            'view_items'            => __('View Lessons', 'understrap-child'),
            'search_items'          => __('Search Lesson', 'understrap-child'),
            'not_found'             => __('Not found', 'understrap-child'),
            'not_found_in_trash'    => __('Not found in Trash', 'understrap-child'),
        );

        $args = array(
            'label'                 => __('Lesson', 'understrap-child'),
            'description'           => __('Individual lessons within courses', 'understrap-child'),
            'labels'                => $labels,
            'supports'              => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes'),
            'taxonomies'            => array('course_module', 'pmp_domain'),
            'hierarchical'          => false,
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'menu_position'         => 6,
            'menu_icon'             => 'dashicons-book-alt',
            'show_in_admin_bar'     => true,
            'show_in_nav_menus'     => true,
            'can_export'            => true,
            'has_archive'           => 'lessons',
            'exclude_from_search'   => false,
            'publicly_queryable'    => true,
            'rewrite'               => array('slug' => 'lessons'),
            'capability_type'       => 'post',
            'show_in_rest'          => true,
        );

        register_post_type('lesson', $args);
    }

    /**
     * Register Course Module Taxonomy
     */
    public function register_module_taxonomy()
    {
        $labels = array(
            'name'                       => _x('Course Modules', 'Taxonomy General Name', 'understrap-child'),
            'singular_name'              => _x('Course Module', 'Taxonomy Singular Name', 'understrap-child'),
            'menu_name'                  => __('Course Modules', 'understrap-child'),
            'all_items'                  => __('All Modules', 'understrap-child'),
            'parent_item'                => __('Parent Module', 'understrap-child'),
            'parent_item_colon'          => __('Parent Module:', 'understrap-child'),
            'new_item_name'              => __('New Module Name', 'understrap-child'),
            'add_new_item'               => __('Add New Module', 'understrap-child'),
            'edit_item'                  => __('Edit Module', 'understrap-child'),
            'update_item'                => __('Update Module', 'understrap-child'),
            'view_item'                  => __('View Module', 'understrap-child'),
        );

        $args = array(
            'labels'                     => $labels,
            'hierarchical'               => true,
            'public'                     => true,
            'show_ui'                    => true,
            'show_admin_column'          => true,
            'show_in_nav_menus'          => true,
            'show_tagcloud'              => false,
            'rewrite'                    => array('slug' => 'module'),
            'show_in_rest'               => true,
        );

        register_taxonomy('course_module', array('lesson', 'course'), $args);
    }

    /**
     * Register PMP Domain Taxonomy
     */
    public function register_domain_taxonomy()
    {
        $labels = array(
            'name'                       => _x('PMP Domains', 'Taxonomy General Name', 'understrap-child'),
            'singular_name'              => _x('PMP Domain', 'Taxonomy Singular Name', 'understrap-child'),
            'menu_name'                  => __('PMP Domains', 'understrap-child'),
            'all_items'                  => __('All Domains', 'understrap-child'),
        );

        $args = array(
            'labels'                     => $labels,
            'hierarchical'               => false,
            'public'                     => true,
            'show_ui'                    => true,
            'show_admin_column'          => true,
            'show_in_nav_menus'          => true,
            'show_tagcloud'              => false,
            'rewrite'                    => array('slug' => 'domain'),
            'show_in_rest'               => true,
        );

        register_taxonomy('pmp_domain', array('lesson', 'course'), $args);
    }

    /**
     * Register Resource Custom Post Type
     */
    public function register_resource_post_type()
    {
        $labels = array(
            'name'                  => _x('Resources', 'Post Type General Name', 'understrap-child'),
            'singular_name'         => _x('Resource', 'Post Type Singular Name', 'understrap-child'),
            'menu_name'             => __('Resources', 'understrap-child'),
            'name_admin_bar'        => __('Resource', 'understrap-child'),
            'all_items'             => __('All Resources', 'understrap-child'),
            'add_new_item'          => __('Add New Resource', 'understrap-child'),
            'add_new'               => __('Add New', 'understrap-child'),
            'new_item'              => __('New Resource', 'understrap-child'),
            'edit_item'             => __('Edit Resource', 'understrap-child'),
            'update_item'           => __('Update Resource', 'understrap-child'),
            'view_item'             => __('View Resource', 'understrap-child'),
        );

        $args = array(
            'label'                 => __('Resource', 'understrap-child'),
            'description'           => __('Study resources and materials', 'understrap-child'),
            'labels'                => $labels,
            'supports'              => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
            'hierarchical'          => false,
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'menu_position'         => 7,
            'menu_icon'             => 'dashicons-media-document',
            'show_in_admin_bar'     => true,
            'show_in_nav_menus'     => true,
            'can_export'            => true,
            'has_archive'           => 'resources',
            'exclude_from_search'   => false,
            'publicly_queryable'    => true,
            'rewrite'               => array('slug' => 'resources'),
            'capability_type'       => 'post',
            'show_in_rest'          => true,
        );

        register_post_type('resource', $args);
    }

    /**
     * Add meta boxes for lessons
     */
    public function add_lesson_meta_boxes()
    {
        add_meta_box(
            'lesson_details',
            __('Lesson Details', 'understrap-child'),
            array($this, 'lesson_details_callback'),
            'lesson',
            'normal',
            'high'
        );
    }

    /**
     * Add meta boxes for courses
     */
    public function add_course_meta_boxes()
    {
        add_meta_box(
            'course_details',
            __('Course Details', 'understrap-child'),
            array($this, 'course_details_callback'),
            'course',
            'normal',
            'high'
        );
    }

    /**
     * Add meta boxes for resources
     */
    public function add_resource_meta_boxes()
    {
        add_meta_box(
            'resource_details',
            __('Resource Details', 'understrap-child'),
            array($this, 'resource_details_callback'),
            'resource',
            'normal',
            'high'
        );
    }

    /**
     * Lesson details meta box callback
     */
    public function lesson_details_callback($post)
    {
        wp_nonce_field('lesson_meta_nonce', 'lesson_meta_nonce');

        $duration = get_post_meta($post->ID, '_lesson_duration', true);
        $video_url = get_post_meta($post->ID, '_lesson_video_url', true);
        $eco_tasks = get_post_meta($post->ID, '_lesson_eco_tasks', true);
        $difficulty = get_post_meta($post->ID, '_lesson_difficulty', true);
        $week_number = get_post_meta($post->ID, '_lesson_week_number', true);
        $day_number = get_post_meta($post->ID, '_lesson_day_number', true);

        echo '<table class="form-table">';
        echo '<tr><th><label for="lesson_duration">' . __('Duration (minutes)', 'understrap-child') . '</label></th>';
        echo '<td><input type="number" id="lesson_duration" name="lesson_duration" value="' . esc_attr($duration) . '" /></td></tr>';

        echo '<tr><th><label for="lesson_video_url">' . __('Video URL', 'understrap-child') . '</label></th>';
        echo '<td><input type="url" id="lesson_video_url" name="lesson_video_url" value="' . esc_attr($video_url) . '" class="regular-text" /></td></tr>';

        echo '<tr><th><label for="lesson_eco_tasks">' . __('ECO Tasks (comma-separated)', 'understrap-child') . '</label></th>';
        echo '<td><input type="text" id="lesson_eco_tasks" name="lesson_eco_tasks" value="' . esc_attr($eco_tasks) . '" class="regular-text" /></td></tr>';

        echo '<tr><th><label for="lesson_difficulty">' . __('Difficulty Level', 'understrap-child') . '</label></th>';
        echo '<td><select id="lesson_difficulty" name="lesson_difficulty">';
        echo '<option value="1"' . selected($difficulty, '1', false) . '>Beginner</option>';
        echo '<option value="2"' . selected($difficulty, '2', false) . '>Intermediate</option>';
        echo '<option value="3"' . selected($difficulty, '3', false) . '>Advanced</option>';
        echo '</select></td></tr>';

        echo '<tr><th><label for="lesson_week_number">' . __('Week Number', 'understrap-child') . '</label></th>';
        echo '<td><input type="number" id="lesson_week_number" name="lesson_week_number" value="' . esc_attr($week_number) . '" min="1" max="13" /></td></tr>';

        echo '<tr><th><label for="lesson_day_number">' . __('Day Number', 'understrap-child') . '</label></th>';
        echo '<td><input type="number" id="lesson_day_number" name="lesson_day_number" value="' . esc_attr($day_number) . '" min="1" max="7" /></td></tr>';

        echo '</table>';
    }

    /**
     * Course details meta box callback
     */
    public function course_details_callback($post)
    {
        wp_nonce_field('course_meta_nonce', 'course_meta_nonce');

        $total_lessons = get_post_meta($post->ID, '_course_total_lessons', true);
        $total_hours = get_post_meta($post->ID, '_course_total_hours', true);
        $total_modules = get_post_meta($post->ID, '_course_total_modules', true);
        $course_level = get_post_meta($post->ID, '_course_level', true);

        echo '<table class="form-table">';
        echo '<tr><th><label for="course_total_lessons">' . __('Total Lessons', 'understrap-child') . '</label></th>';
        echo '<td><input type="number" id="course_total_lessons" name="course_total_lessons" value="' . esc_attr($total_lessons) . '" /></td></tr>';

        echo '<tr><th><label for="course_total_hours">' . __('Total Hours', 'understrap-child') . '</label></th>';
        echo '<td><input type="number" id="course_total_hours" name="course_total_hours" value="' . esc_attr($total_hours) . '" step="0.5" /></td></tr>';

        echo '<tr><th><label for="course_total_modules">' . __('Total Modules', 'understrap-child') . '</label></th>';
        echo '<td><input type="number" id="course_total_modules" name="course_total_modules" value="' . esc_attr($total_modules) . '" /></td></tr>';

        echo '<tr><th><label for="course_level">' . __('Course Level', 'understrap-child') . '</label></th>';
        echo '<td><select id="course_level" name="course_level">';
        echo '<option value="beginner"' . selected($course_level, 'beginner', false) . '>Beginner</option>';
        echo '<option value="intermediate"' . selected($course_level, 'intermediate', false) . '>Intermediate</option>';
        echo '<option value="advanced"' . selected($course_level, 'advanced', false) . '>Advanced</option>';
        echo '</select></td></tr>';

        echo '</table>';
    }

    /**
     * Resource details meta box callback
     */
    public function resource_details_callback($post)
    {
        wp_nonce_field('resource_meta_nonce', 'resource_meta_nonce');

        $resource_type = get_post_meta($post->ID, '_resource_type', true);
        $file_url = get_post_meta($post->ID, '_resource_file_url', true);
        $file_size = get_post_meta($post->ID, '_resource_file_size', true);
        $download_count = get_post_meta($post->ID, '_resource_download_count', true);

        echo '<table class="form-table">';
        echo '<tr><th><label for="resource_type">' . __('Resource Type', 'understrap-child') . '</label></th>';
        echo '<td><select id="resource_type" name="resource_type">';
        echo '<option value="pdf"' . selected($resource_type, 'pdf', false) . '>PDF</option>';
        echo '<option value="video"' . selected($resource_type, 'video', false) . '>Video</option>';
        echo '<option value="tool"' . selected($resource_type, 'tool', false) . '>Practice Tool</option>';
        echo '<option value="article"' . selected($resource_type, 'article', false) . '>Article</option>';
        echo '</select></td></tr>';

        echo '<tr><th><label for="resource_file_url">' . __('File URL', 'understrap-child') . '</label></th>';
        echo '<td><input type="url" id="resource_file_url" name="resource_file_url" value="' . esc_attr($file_url) . '" class="regular-text" /></td></tr>';

        echo '<tr><th><label for="resource_file_size">' . __('File Size', 'understrap-child') . '</label></th>';
        echo '<td><input type="text" id="resource_file_size" name="resource_file_size" value="' . esc_attr($file_size) . '" placeholder="e.g., 2.4 MB" /></td></tr>';

        echo '<tr><th><label for="resource_download_count">' . __('Download Count', 'understrap-child') . '</label></th>';
        echo '<td><input type="number" id="resource_download_count" name="resource_download_count" value="' . esc_attr($download_count) . '" readonly /></td></tr>';

        echo '</table>';
    }

    /**
     * Save lesson meta data
     */
    public function save_lesson_meta($post_id)
    {
        if (!isset($_POST['lesson_meta_nonce']) || !wp_verify_nonce($_POST['lesson_meta_nonce'], 'lesson_meta_nonce')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        $fields = array(
            'lesson_duration' => '_lesson_duration',
            'lesson_video_url' => '_lesson_video_url',
            'lesson_eco_tasks' => '_lesson_eco_tasks',
            'lesson_difficulty' => '_lesson_difficulty',
            'lesson_week_number' => '_lesson_week_number',
            'lesson_day_number' => '_lesson_day_number'
        );

        foreach ($fields as $field => $meta_key) {
            if (isset($_POST[$field])) {
                update_post_meta($post_id, $meta_key, sanitize_text_field($_POST[$field]));
            }
        }
    }

    /**
     * Save course meta data
     */
    public function save_course_meta($post_id)
    {
        if (!isset($_POST['course_meta_nonce']) || !wp_verify_nonce($_POST['course_meta_nonce'], 'course_meta_nonce')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        $fields = array(
            'course_total_lessons' => '_course_total_lessons',
            'course_total_hours' => '_course_total_hours',
            'course_total_modules' => '_course_total_modules',
            'course_level' => '_course_level'
        );

        foreach ($fields as $field => $meta_key) {
            if (isset($_POST[$field])) {
                update_post_meta($post_id, $meta_key, sanitize_text_field($_POST[$field]));
            }
        }
    }

    /**
     * Save resource meta data
     */
    public function save_resource_meta($post_id)
    {
        if (!isset($_POST['resource_meta_nonce']) || !wp_verify_nonce($_POST['resource_meta_nonce'], 'resource_meta_nonce')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        $fields = array(
            'resource_type' => '_resource_type',
            'resource_file_url' => '_resource_file_url',
            'resource_file_size' => '_resource_file_size',
            'resource_download_count' => '_resource_download_count'
        );

        foreach ($fields as $field => $meta_key) {
            if (isset($_POST[$field])) {
                update_post_meta($post_id, $meta_key, sanitize_text_field($_POST[$field]));
            }
        }
    }

    /**
     * Register REST API endpoints
     */
    public function register_rest_endpoints()
    {
        register_rest_route('pmp/v1', '/lessons', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_lessons'),
            'permission_callback' => '__return_true'
        ));

        register_rest_route('pmp/v1', '/courses', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_courses'),
            'permission_callback' => '__return_true'
        ));

        register_rest_route('pmp/v1', '/resources', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_resources'),
            'permission_callback' => '__return_true'
        ));
    }

    /**
     * Get lessons via REST API
     */
    public function get_lessons($request)
    {
        $args = array(
            'post_type' => 'lesson',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'meta_key' => '_lesson_week_number',
            'orderby' => 'meta_value_num',
            'order' => 'ASC'
        );

        $lessons = get_posts($args);
        $formatted_lessons = array();

        foreach ($lessons as $lesson) {
            $formatted_lessons[] = array(
                'id' => $lesson->ID,
                'title' => $lesson->post_title,
                'content' => $lesson->post_content,
                'duration' => get_post_meta($lesson->ID, '_lesson_duration', true),
                'video_url' => get_post_meta($lesson->ID, '_lesson_video_url', true),
                'eco_tasks' => get_post_meta($lesson->ID, '_lesson_eco_tasks', true),
                'difficulty' => get_post_meta($lesson->ID, '_lesson_difficulty', true),
                'week_number' => get_post_meta($lesson->ID, '_lesson_week_number', true),
                'day_number' => get_post_meta($lesson->ID, '_lesson_day_number', true),
                'permalink' => get_permalink($lesson->ID)
            );
        }

        return rest_ensure_response($formatted_lessons);
    }

    /**
     * Get courses via REST API
     */
    public function get_courses($request)
    {
        $args = array(
            'post_type' => 'course',
            'post_status' => 'publish',
            'posts_per_page' => -1
        );

        $courses = get_posts($args);
        $formatted_courses = array();

        foreach ($courses as $course) {
            $formatted_courses[] = array(
                'id' => $course->ID,
                'title' => $course->post_title,
                'content' => $course->post_content,
                'excerpt' => $course->post_excerpt,
                'total_lessons' => get_post_meta($course->ID, '_course_total_lessons', true),
                'total_hours' => get_post_meta($course->ID, '_course_total_hours', true),
                'total_modules' => get_post_meta($course->ID, '_course_total_modules', true),
                'level' => get_post_meta($course->ID, '_course_level', true),
                'permalink' => get_permalink($course->ID),
                'featured_image' => get_the_post_thumbnail_url($course->ID, 'large')
            );
        }

        return rest_ensure_response($formatted_courses);
    }

    /**
     * Get resources via REST API
     */
    public function get_resources($request)
    {
        $args = array(
            'post_type' => 'resource',
            'post_status' => 'publish',
            'posts_per_page' => -1
        );

        $resources = get_posts($args);
        $formatted_resources = array();

        foreach ($resources as $resource) {
            $formatted_resources[] = array(
                'id' => $resource->ID,
                'title' => $resource->post_title,
                'content' => $resource->post_content,
                'excerpt' => $resource->post_excerpt,
                'type' => get_post_meta($resource->ID, '_resource_type', true),
                'file_url' => get_post_meta($resource->ID, '_resource_file_url', true),
                'file_size' => get_post_meta($resource->ID, '_resource_file_size', true),
                'download_count' => get_post_meta($resource->ID, '_resource_download_count', true),
                'permalink' => get_permalink($resource->ID),
                'featured_image' => get_the_post_thumbnail_url($resource->ID, 'medium')
            );
        }

        return rest_ensure_response($formatted_resources);
    }

    /**
     * Get course structure for navigation
     */
    public static function get_course_structure($course_id = null)
    {
        $structure = array();

        // Get all modules
        $modules = get_terms(array(
            'taxonomy' => 'course_module',
            'hide_empty' => false,
            'orderby' => 'meta_value_num',
            'meta_key' => 'module_order',
            'order' => 'ASC'
        ));

        foreach ($modules as $module) {
            $module_data = array(
                'id' => $module->term_id,
                'name' => $module->name,
                'description' => $module->description,
                'week_number' => get_term_meta($module->term_id, 'week_number', true),
                'lessons' => array()
            );

            // Get lessons for this module
            $lessons = get_posts(array(
                'post_type' => 'lesson',
                'post_status' => 'publish',
                'posts_per_page' => -1,
                'tax_query' => array(
                    array(
                        'taxonomy' => 'course_module',
                        'field' => 'term_id',
                        'terms' => $module->term_id
                    )
                ),
                'meta_key' => '_lesson_day_number',
                'orderby' => 'meta_value_num',
                'order' => 'ASC'
            ));

            foreach ($lessons as $lesson) {
                $module_data['lessons'][] = array(
                    'id' => $lesson->ID,
                    'title' => $lesson->post_title,
                    'duration' => get_post_meta($lesson->ID, '_lesson_duration', true),
                    'day_number' => get_post_meta($lesson->ID, '_lesson_day_number', true),
                    'permalink' => get_permalink($lesson->ID)
                );
            }

            $structure[] = $module_data;
        }

        return $structure;
    }

    /**
     * Get analytics integration data
     */
    public static function get_analytics_data($user_id = null)
    {
        if (!$user_id) {
            $user_id = get_current_user_id();
        }

        $analytics = array(
            'total_lessons' => wp_count_posts('lesson')->publish,
            'total_courses' => wp_count_posts('course')->publish,
            'total_resources' => wp_count_posts('resource')->publish,
            'user_progress' => array()
        );

        if ($user_id) {
            $completed_lessons = get_user_meta($user_id, 'pmp_completed_lessons', true);
            $analytics['user_progress'] = array(
                'completed_lessons' => is_array($completed_lessons) ? count($completed_lessons) : 0,
                'completion_percentage' => is_array($completed_lessons) ?
                    round((count($completed_lessons) / $analytics['total_lessons']) * 100, 2) : 0
            );
        }

        return $analytics;
    }
}

// Initialize the class
new PMP_Content_Types();
