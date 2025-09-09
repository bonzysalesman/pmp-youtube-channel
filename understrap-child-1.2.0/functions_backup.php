<?php
/**
 * Understrap Child Theme functions and definitions
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Enqueue parent and child theme stylesheets & scripts.
 */
function understrap_child_enqueue_styles_scripts() {
	// Parent theme stylesheet
    $parenthandle = 'understrap-styles'; // This is 'understrap-style' for v0.9.3 and below
    $theme        = wp_get_theme();
    wp_enqueue_style( $parenthandle, get_template_directory_uri() . '/css/theme.min.css',
        array(), // Add parent theme dependencies if any are listed in parent theme's inc/enqueue.php
        $theme->parent()->get( 'Version' )
    );

    // Child theme stylesheet
    // Loads style.css from the child theme root directory.
    wp_enqueue_style( 'understrap-child-style', get_stylesheet_directory_uri() . '/style.css',
        array( $parenthandle ), // Depends on the parent style
        $theme->get( 'Version' ) // Use child theme's version
    );

    // PMP Components stylesheet
    wp_enqueue_style( 'pmp-components', get_stylesheet_directory_uri() . '/assets/css/pmp-components.css',
        array( 'understrap-child-style' ), // Depends on the child theme style
        $theme->get( 'Version' )
    );
    
    // PMP Navigation stylesheet
    wp_enqueue_style( 'pmp-navigation', get_stylesheet_directory_uri() . '/assets/css/pmp-navigation.css',
        array( 'pmp-components' ), // Depends on the PMP components style
        $theme->get( 'Version' )
    );
    
    // PMP Browser Compatibility stylesheet
    wp_enqueue_style( 'pmp-browser-compatibility', get_stylesheet_directory_uri() . '/assets/css/browser-compatibility.css',
        array( 'pmp-components' ), // Depends on the PMP components style
        $theme->get( 'Version' )
    );
    
    // PMP Dashboard stylesheet
    wp_enqueue_style( 'pmp-dashboard', get_stylesheet_directory_uri() . '/assets/css/dashboard.css',
        array( 'pmp-components' ), // Depends on the PMP components style
        $theme->get( 'Version' )
    );

    // --- Optional: Enqueue other libraries if needed ---
    // Example: Enqueue Font Awesome (ensure it's not already loaded by parent/plugins)
    wp_enqueue_style( 'font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css', array(), '6.0.0-beta3' );

    // Example: Enqueue Ionicons if you are using them
    // wp_enqueue_style('ionicons-css', 'https://unpkg.com/ionicons@5.5.2/dist/css/ionicons.min.css', array(), '5.5.2');

    // Child theme javascript (optional, if you have custom JS)
    // $child_scripts_path = "/js/child-theme.min.js"; // Or just /js/child-theme.js if not minifying
	// if ( file_exists( get_stylesheet_directory() . $child_scripts_path ) ) {
    //    wp_enqueue_script( 'understrap-child-scripts', get_stylesheet_directory_uri() . $child_scripts_path, array('jquery', 'understrap-scripts'), $theme->get( 'Version' ), true );
    // }

    // PMP Navigation JavaScript
    wp_enqueue_script( 'pmp-navigation', get_stylesheet_directory_uri() . '/assets/js/navigation.js', 
        array(), $theme->get( 'Version' ), true );
    
    // PMP Lesson Interactions JavaScript
    wp_enqueue_script( 'pmp-lesson-interactions', get_stylesheet_directory_uri() . '/assets/js/lesson-interactions.js', 
        array('jquery'), $theme->get( 'Version' ), true );
    
    // PMP Dashboard JavaScript
    wp_enqueue_script( 'pmp-dashboard', get_stylesheet_directory_uri() . '/assets/js/dashboard.js', 
        array('jquery'), $theme->get( 'Version' ), true );
    
    // PMP Progress Tracker JavaScript
    wp_enqueue_script( 'pmp-progress-tracker', get_stylesheet_directory_uri() . '/assets/js/progress-tracker.js', 
        array('jquery'), $theme->get( 'Version' ), true );
    
    // PMP Resources JavaScript
    wp_enqueue_script( 'pmp-resources', get_stylesheet_directory_uri() . '/assets/js/resources.js', 
        array('jquery'), $theme->get( 'Version' ), true );
    
    // PMP Lazy Loading JavaScript
    wp_enqueue_script( 'pmp-lazy-loading', get_stylesheet_directory_uri() . '/assets/js/lazy-loading.js', 
        array(), $theme->get( 'Version' ), true );
    
    // PMP Progressive Loading JavaScript
    wp_enqueue_script( 'pmp-progressive-loading', get_stylesheet_directory_uri() . '/assets/js/progressive-loading.js', 
        array('jquery', 'pmp-navigation'), $theme->get( 'Version' ), true );
    
    // PMP Browser Compatibility JavaScript
    wp_enqueue_script( 'pmp-browser-compatibility', get_stylesheet_directory_uri() . '/assets/js/browser-compatibility.js', 
        array(), $theme->get( 'Version' ), true );
    
    // Localize script with necessary data
    wp_localize_script( 'pmp-navigation', 'pmpData', array(
        'nonce' => wp_create_nonce('pmp_nonce'),
        'userId' => get_current_user_id(),
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'restUrl' => rest_url('pmp/v1/')
    ));
    
    // Localize progress tracker script with AJAX data
    wp_localize_script( 'pmp-progress-tracker', 'pmpAjax', array(
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('pmp_ajax_nonce'),
        'userId' => get_current_user_id()
    ));

	// Enable comment-reply script for threaded comments
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'understrap_child_enqueue_styles_scripts' );


/**
 * Load the child theme's text domain
 */
function add_child_theme_textdomain() {
	load_child_theme_textdomain( 'understrap-child', get_stylesheet_directory() . '/languages' );
}
add_action( 'after_setup_theme', 'add_child_theme_textdomain' );


/**
 * Forces the theme_mod to default to Bootstrap 5
 */
function understrap_default_bootstrap_version() {
	return 'bootstrap5';
}
add_filter( 'theme_mod_understrap_bootstrap_version', 'understrap_default_bootstrap_version', 20 );


// --- Register Navigation Menus ---
function understrap_child_register_menus() {
	register_nav_menus(
		array(
			'primary' => __( 'Primary Menu', 'understrap-child' ), // Location used in header.php
			'dashboard-sidebar' => __( 'Dashboard Sidebar', 'understrap-child' ),
			'footer-quick-links' => __( 'Footer Quick Links', 'understrap-child' ),
			'footer-resources' => __( 'Footer Resources', 'understrap-child' ),
			'footer-connect' => __( 'Footer Connect', 'understrap-child' ),
			'mobile-menu' => __( 'Mobile Menu', 'understrap-child' ),
		)
	);
}
add_action( 'init', 'understrap_child_register_menus' );


// --- Register Footer Widget Areas ---
function understrap_child_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Footer Column 1 (Quick Links)', 'understrap-child' ),
			'id'            => 'footer-1',
			'description'   => __( 'Widgets added here will appear in the first footer column.', 'understrap-child' ),
			'before_widget' => '<div id="%1$s" class="footer-widget widget %2$s">', // Added 'widget' class
			'after_widget'  => '</div><!-- .footer-widget -->',
			'before_title'  => '<h3 class="widget-title">',
			'after_title'   => '</h3>',
		)
	);
    register_sidebar(
		array(
			'name'          => __( 'Footer Column 2 (Resources)', 'understrap-child' ),
			'id'            => 'footer-2',
			'description'   => __( 'Widgets added here will appear in the second footer column.', 'understrap-child' ),
			'before_widget' => '<div id="%1$s" class="footer-widget widget %2$s">', // Added 'widget' class
			'after_widget'  => '</div><!-- .footer-widget -->',
			'before_title'  => '<h3 class="widget-title">',
			'after_title'   => '</h3>',
		)
	);
     register_sidebar(
		array(
			'name'          => __( 'Footer Column 3 (Connect Extras)', 'understrap-child' ),
			'id'            => 'footer-3',
			'description'   => __( 'Optional widget area below contact info in the third footer column.', 'understrap-child' ),
			'before_widget' => '<div id="%1$s" class="footer-widget widget %2$s">', // Added 'widget' class
			'after_widget'  => '</div><!-- .footer-widget -->',
			'before_title'  => '<h3 class="widget-title">',
			'after_title'   => '</h3>',
		)
	);
}
add_action( 'widgets_init', 'understrap_child_widgets_init' );


// --- Include Understrap Nav Walker ---
// Ensure the walker file exists in the parent theme's /inc directory
// This path assumes standard Understrap structure. Adjust if necessary.
$navwalker_path = get_template_directory() . '/inc/class-wp-bootstrap-navwalker.php';
if ( file_exists( $navwalker_path ) ) {
    require_once( $navwalker_path );
} else {
    // Add error handling or logging if walker is missing
    error_log('WP Bootstrap Navwalker class not found in parent theme.');
}

// Add your other custom child theme functions below this line...

// --- Register Custom Post Type: Course ---
function moh_register_course_cpt() {

	$labels = array(
		'name'                  => _x( 'Courses', 'Post Type General Name', 'understrap-child' ),
		'singular_name'         => _x( 'Course', 'Post Type Singular Name', 'understrap-child' ),
		'menu_name'             => __( 'Courses', 'understrap-child' ),
		'name_admin_bar'        => __( 'Course', 'understrap-child' ),
		'archives'              => __( 'Course Catalog', 'understrap-child' ), // Title for archive page
		'attributes'            => __( 'Course Attributes', 'understrap-child' ),
		'parent_item_colon'     => __( 'Parent Course:', 'understrap-child' ),
		'all_items'             => __( 'All Courses', 'understrap-child' ),
		'add_new_item'          => __( 'Add New Course', 'understrap-child' ),
		'add_new'               => __( 'Add New', 'understrap-child' ),
		'new_item'              => __( 'New Course', 'understrap-child' ),
		'edit_item'             => __( 'Edit Course', 'understrap-child' ),
		'update_item'           => __( 'Update Course', 'understrap-child' ),
		'view_item'             => __( 'View Course', 'understrap-child' ),
		'view_items'            => __( 'View Courses', 'understrap-child' ),
		'search_items'          => __( 'Search Course', 'understrap-child' ),
		'not_found'             => __( 'Not found', 'understrap-child' ),
		'not_found_in_trash'    => __( 'Not found in Trash', 'understrap-child' ),
		'featured_image'        => __( 'Featured Image', 'understrap-child' ),
		'set_featured_image'    => __( 'Set featured image', 'understrap-child' ),
		'remove_featured_image' => __( 'Remove featured image', 'understrap-child' ),
		'use_featured_image'    => __( 'Use as featured image', 'understrap-child' ),
		'insert_into_item'      => __( 'Insert into course', 'understrap-child' ),
		'uploaded_to_this_item' => __( 'Uploaded to this course', 'understrap-child' ),
		'items_list'            => __( 'Courses list', 'understrap-child' ),
		'items_list_navigation' => __( 'Courses list navigation', 'understrap-child' ),
		'filter_items_list'     => __( 'Filter courses list', 'understrap-child' ),
	);
	$args = array(
		'label'                 => __( 'Course', 'understrap-child' ),
		'description'           => __( 'Courses offered by Mohlomi Institute', 'understrap-child' ),
		'labels'                => $labels,
		'supports'              => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes' ), // Added excerpt & page-attributes
		'taxonomies'            => array( 'course_category' ), // Link to custom taxonomy
		'hierarchical'          => false, // Or true if you want parent/child courses
		'public'                => true,
		'show_ui'               => true,
		'show_in_menu'          => true,
		'menu_position'         => 5,
		'menu_icon'             => 'dashicons-welcome-learn-more', // WordPress Dashicon
		'show_in_admin_bar'     => true,
		'show_in_nav_menus'     => true,
		'can_export'            => true,
		'has_archive'           => 'courses', // Sets the archive slug to /courses/
		'exclude_from_search'   => false,
		'publicly_queryable'    => true,
        'rewrite'               => array('slug' => 'courses'), // Set the single slug base
		'capability_type'       => 'post', // Use 'page' if more like static pages
        'show_in_rest'          => true, // Enable Gutenberg editor support
	);
	register_post_type( 'course', $args );

}
add_action( 'init', 'moh_register_course_cpt', 0 );


// --- Register Custom Taxonomy: Course Category ---
function moh_register_course_taxonomy() {

	$labels = array(
		'name'                       => _x( 'Course Categories', 'Taxonomy General Name', 'understrap-child' ),
		'singular_name'              => _x( 'Course Category', 'Taxonomy Singular Name', 'understrap-child' ),
		'menu_name'                  => __( 'Course Categories', 'understrap-child' ),
		'all_items'                  => __( 'All Categories', 'understrap-child' ),
		'parent_item'                => __( 'Parent Category', 'understrap-child' ),
		'parent_item_colon'          => __( 'Parent Category:', 'understrap-child' ),
		'new_item_name'              => __( 'New Category Name', 'understrap-child' ),
		'add_new_item'               => __( 'Add New Category', 'understrap-child' ),
		'edit_item'                  => __( 'Edit Category', 'understrap-child' ),
		'update_item'                => __( 'Update Category', 'understrap-child' ),
		'view_item'                  => __( 'View Category', 'understrap-child' ),
		'separate_items_with_commas' => __( 'Separate categories with commas', 'understrap-child' ),
		'add_or_remove_items'        => __( 'Add or remove categories', 'understrap-child' ),
		'choose_from_most_used'      => __( 'Choose from the most used', 'understrap-child' ),
		'popular_items'              => __( 'Popular Categories', 'understrap-child' ),
		'search_items'               => __( 'Search Categories', 'understrap-child' ),
		'not_found'                  => __( 'Not Found', 'understrap-child' ),
		'no_terms'                   => __( 'No categories', 'understrap-child' ),
		'items_list'                 => __( 'Categories list', 'understrap-child' ),
		'items_list_navigation'      => __( 'Categories list navigation', 'understrap-child' ),
	);
	$args = array(
		'labels'                     => $labels,
		'hierarchical'               => true, // Like post categories (vs. tags)
		'public'                     => true,
		'show_ui'                    => true,
		'show_admin_column'          => true,
		'show_in_nav_menus'          => true,
		'show_tagcloud'              => true,
        'rewrite'                    => array( 'slug' => 'course-category' ),
        'show_in_rest'               => true, // Enable taxonomy in block editor
	);
	register_taxonomy( 'course_category', array( 'course' ), $args ); // Associate with 'course' CPT

}
add_action( 'init', 'moh_register_course_taxonomy', 0 );


// --- Register Custom Post Type: Testimonial ---
function moh_register_testimonial_cpt() {

	$labels = array(
		'name'                  => _x( 'Testimonials', 'Post Type General Name', 'understrap-child' ),
		'singular_name'         => _x( 'Testimonial', 'Post Type Singular Name', 'understrap-child' ),
		'menu_name'             => __( 'Testimonials', 'understrap-child' ),
		'name_admin_bar'        => __( 'Testimonial', 'understrap-child' ),
		'archives'              => __( 'Testimonial Archives', 'understrap-child' ),
		'attributes'            => __( 'Testimonial Attributes', 'understrap-child' ),
		'parent_item_colon'     => __( 'Parent Testimonial:', 'understrap-child' ),
		'all_items'             => __( 'All Testimonials', 'understrap-child' ),
		'add_new_item'          => __( 'Add New Testimonial', 'understrap-child' ),
		'add_new'               => __( 'Add New', 'understrap-child' ),
		'new_item'              => __( 'New Testimonial', 'understrap-child' ),
		'edit_item'             => __( 'Edit Testimonial', 'understrap-child' ),
		'update_item'           => __( 'Update Testimonial', 'understrap-child' ),
		'view_item'             => __( 'View Testimonial', 'understrap-child' ),
		'view_items'            => __( 'View Testimonials', 'understrap-child' ),
		'search_items'          => __( 'Search Testimonial', 'understrap-child' ),
		'not_found'             => __( 'Not found', 'understrap-child' ),
		'not_found_in_trash'    => __( 'Not found in Trash', 'understrap-child' ),
		'featured_image'        => __( 'Author Photo', 'understrap-child' ), // Changed label
		'set_featured_image'    => __( 'Set author photo', 'understrap-child' ),
		'remove_featured_image' => __( 'Remove author photo', 'understrap-child' ),
		'use_featured_image'    => __( 'Use as author photo', 'understrap-child' ),
		'insert_into_item'      => __( 'Insert into testimonial', 'understrap-child' ),
		'uploaded_to_this_item' => __( 'Uploaded to this testimonial', 'understrap-child' ),
		'items_list'            => __( 'Testimonials list', 'understrap-child' ),
		'items_list_navigation' => __( 'Testimonials list navigation', 'understrap-child' ),
		'filter_items_list'     => __( 'Filter testimonials list', 'understrap-child' ),
	);
	$args = array(
		'label'                 => __( 'Testimonial', 'understrap-child' ),
		'description'           => __( 'Student and client testimonials', 'understrap-child' ),
		'labels'                => $labels,
		'supports'              => array( 'title', 'editor', 'thumbnail', 'custom-fields' ), // title=Author, editor=Quote, thumbnail=Photo
		'hierarchical'          => false,
		'public'                => false, // Often testimonials don't need individual public pages
		'show_ui'               => true,
		'show_in_menu'          => true,
		'menu_position'         => 20,
		'menu_icon'             => 'dashicons-format-quote',
		'show_in_admin_bar'     => true,
		'show_in_nav_menus'     => false, // Typically not in nav menus
		'can_export'            => true,
		'has_archive'           => false, // We will use a custom page template
		'exclude_from_search'   => true,  // Usually exclude testimonials from site search
		'publicly_queryable'    => false, // Corresponds to 'public' = false
		'rewrite'               => false,
		'capability_type'       => 'post',
        'show_in_rest'          => true, // For block editor if needed, though ACF is often easier here
	);
	register_post_type( 'testimonial', $args );

}
add_action( 'init', 'moh_register_testimonial_cpt', 0 );

// Remember to flush permalinks after adding CPTs! Go to Settings > Permalinks and click Save Changes.

// --- Include PMP Custom Classes ---
require_once get_stylesheet_directory() . '/includes/pmp-navigation-config.php';
require_once get_stylesheet_directory() . '/includes/pmp-navigation-manager.php';
require_once get_stylesheet_directory() . '/includes/pmp-navigation-setup.php';
require_once get_stylesheet_directory() . '/includes/class-pmp-content-types.php';
require_once get_stylesheet_directory() . '/includes/class-pmp-course-navigation.php';
require_once get_stylesheet_directory() . '/includes/class-pmp-course-progression.php';
require_once get_stylesheet_directory() . '/includes/class-pmp-dashboard.php';
require_once get_stylesheet_directory() . '/includes/class-pmp-progress-tracker.php';
require_once get_stylesheet_directory() . '/includes/class-pmp-resources-manager.php';
require_once get_stylesheet_directory() . '/includes/class-pmp-performance-optimizer.php';
require_once get_stylesheet_directory() . '/includes/class-pmp-asset-optimizer.php';
require_once get_stylesheet_directory() . '/includes/class-pmp-caching-system.php';
require_once get_stylesheet_directory() . '/includes/pmp-content-shortcodes.php';
require_once get_stylesheet_directory() . '/includes/pmp-enqueue.php';
require_once get_stylesheet_directory() . '/includes/pmp-progress-integration.php';

// Include test file for development (only for administrators)
if (current_user_can('administrator') || (defined('WP_DEBUG') && WP_DEBUG)) {
    require_once get_stylesheet_directory() . '/test-progress-tracking.php';
}

// --- Initialize Performance Optimizer ---
if (class_exists('PMP_Performance_Optimizer')) {
    new PMP_Performance_Optimizer();
}

// --- Initialize Asset Optimizer ---
if (class_exists('PMP_Asset_Optimizer') && !WP_DEBUG) {
    $pmp_asset_optimizer = new PMP_Asset_Optimizer();
    
    // Add admin menu for cache management
    add_action('admin_menu', array($pmp_asset_optimizer, 'add_admin_menu'));
}

// --- Initialize Caching System ---
if (class_exists('PMP_Caching_System')) {
    new PMP_Caching_System();
}

// --- AJAX Handlers for Progress Tracking ---
add_action('wp_ajax_pmp_mark_lesson_completed', 'pmp_handle_lesson_completion');
add_action('wp_ajax_pmp_track_lesson_access', 'pmp_handle_lesson_access');
add_action('wp_ajax_pmp_track_question_answer', 'pmp_handle_question_answer');
add_action('wp_ajax_pmp_track_eco_reference', 'pmp_handle_eco_reference');
add_action('wp_ajax_pmp_track_reading_progress', 'pmp_handle_reading_progress');

// --- AJAX Handlers for Dashboard ---
add_action('wp_ajax_pmp_get_dashboard_data', 'pmp_handle_get_dashboard_data');
add_action('wp_ajax_pmp_track_dashboard_action', 'pmp_handle_track_dashboard_action');

// --- AJAX Handlers for Resources ---
add_action('wp_ajax_pmp_track_resource_usage', 'pmp_handle_track_resource_usage');

function pmp_handle_lesson_completion() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_nonce')) {
        wp_die('Security check failed');
    }
    
    $lesson_id = sanitize_text_field($_POST['lesson_id']);
    $user_id = intval($_POST['user_id']);
    
    if ($user_id && $lesson_id) {
        $completed_lessons = get_user_meta($user_id, 'pmp_completed_lessons', true);
        if (!is_array($completed_lessons)) {
            $completed_lessons = [];
        }
        
        if (!in_array($lesson_id, $completed_lessons)) {
            $completed_lessons[] = $lesson_id;
            update_user_meta($user_id, 'pmp_completed_lessons', $completed_lessons);
        }
        
        wp_send_json_success(['message' => 'Lesson marked as completed']);
    } else {
        wp_send_json_error(['message' => 'Invalid data']);
    }
}

function pmp_handle_lesson_access() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_nonce')) {
        wp_die('Security check failed');
    }
    
    $lesson_id = sanitize_text_field($_POST['lesson_id']);
    $user_id = intval($_POST['user_id']);
    
    if ($user_id && $lesson_id) {
        update_user_meta($user_id, 'pmp_current_lesson', $lesson_id);
        update_user_meta($user_id, 'pmp_last_access', current_time('mysql'));
        
        wp_send_json_success(['message' => 'Lesson access tracked']);
    } else {
        wp_send_json_error(['message' => 'Invalid data']);
    }
}

function pmp_handle_question_answer() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_nonce')) {
        wp_die('Security check failed');
    }
    
    $question_id = sanitize_text_field($_POST['question_id']);
    $selected_answer = sanitize_text_field($_POST['selected_answer']);
    $is_correct = filter_var($_POST['is_correct'], FILTER_VALIDATE_BOOLEAN);
    $user_id = intval($_POST['user_id']);
    
    if ($user_id && $question_id) {
        // Get existing question answers
        $question_answers = get_user_meta($user_id, 'pmp_question_answers', true);
        if (!is_array($question_answers)) {
            $question_answers = [];
        }
        
        // Store answer data
        $question_answers[$question_id] = [
            'selected_answer' => $selected_answer,
            'is_correct' => $is_correct,
            'timestamp' => current_time('mysql'),
            'attempts' => isset($question_answers[$question_id]['attempts']) ? $question_answers[$question_id]['attempts'] + 1 : 1
        ];
        
        update_user_meta($user_id, 'pmp_question_answers', $question_answers);
        
        wp_send_json_success(['message' => 'Question answer tracked']);
    } else {
        wp_send_json_error(['message' => 'Invalid data']);
    }
}

function pmp_handle_eco_reference() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_nonce')) {
        wp_die('Security check failed');
    }
    
    $eco_ref = sanitize_text_field($_POST['eco_ref']);
    $user_id = intval($_POST['user_id']);
    
    if ($user_id && $eco_ref) {
        // Get existing ECO interactions
        $eco_interactions = get_user_meta($user_id, 'pmp_eco_interactions', true);
        if (!is_array($eco_interactions)) {
            $eco_interactions = [];
        }
        
        // Track interaction
        if (!isset($eco_interactions[$eco_ref])) {
            $eco_interactions[$eco_ref] = [];
        }
        
        $eco_interactions[$eco_ref][] = current_time('mysql');
        
        update_user_meta($user_id, 'pmp_eco_interactions', $eco_interactions);
        
        wp_send_json_success(['message' => 'ECO reference tracked']);
    } else {
        wp_send_json_error(['message' => 'Invalid data']);
    }
}

function pmp_handle_reading_progress() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_nonce')) {
        wp_die('Security check failed');
    }
    
    $lesson_id = sanitize_text_field($_POST['lesson_id']);
    $time_spent = intval($_POST['time_spent']);
    $user_id = intval($_POST['user_id']);
    
    if ($user_id && $lesson_id && $time_spent > 0) {
        // Get existing reading progress
        $reading_progress = get_user_meta($user_id, 'pmp_reading_progress', true);
        if (!is_array($reading_progress)) {
            $reading_progress = [];
        }
        
        // Update time spent for this lesson
        if (!isset($reading_progress[$lesson_id])) {
            $reading_progress[$lesson_id] = 0;
        }
        
        $reading_progress[$lesson_id] = max($reading_progress[$lesson_id], $time_spent);
        
        update_user_meta($user_id, 'pmp_reading_progress', $reading_progress);
        
        wp_send_json_success(['message' => 'Reading progress tracked']);
    } else {
        wp_send_json_error(['message' => 'Invalid data']);
    }
}

function pmp_handle_get_dashboard_data() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_nonce')) {
        wp_die('Security check failed');
    }
    
    $user_id = intval($_POST['user_id']);
    
    if ($user_id) {
        // Initialize dashboard class
        if (class_exists('PMP_Dashboard')) {
            $dashboard = new PMP_Dashboard($user_id);
            
            $data = [
                'progress' => $dashboard->get_progress_stats(),
                'next_lesson' => $dashboard->get_next_lesson(),
                'recent_activity' => $dashboard->get_recent_activity()
            ];
            
            wp_send_json_success($data);
        } else {
            wp_send_json_error(['message' => 'Dashboard class not available']);
        }
    } else {
        wp_send_json_error(['message' => 'Invalid user ID']);
    }
}

function pmp_handle_track_dashboard_action() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_nonce')) {
        wp_die('Security check failed');
    }
    
    $action = sanitize_text_field($_POST['action']);
    $data = sanitize_text_field($_POST['data']);
    $user_id = intval($_POST['user_id']);
    
    if ($user_id && $action) {
        // Get existing dashboard actions
        $dashboard_actions = get_user_meta($user_id, 'pmp_dashboard_actions', true);
        if (!is_array($dashboard_actions)) {
            $dashboard_actions = [];
        }
        
        // Add new action
        $dashboard_actions[] = [
            'action' => $action,
            'data' => $data,
            'timestamp' => current_time('mysql'),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ];
        
        // Keep only last 100 actions
        $dashboard_actions = array_slice($dashboard_actions, -100);
        
        update_user_meta($user_id, 'pmp_dashboard_actions', $dashboard_actions);
        
        wp_send_json_success(['message' => 'Dashboard action tracked']);
    } else {
        wp_send_json_error(['message' => 'Invalid data']);
    }
}

function pmp_handle_track_resource_usage() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'pmp_nonce')) {
        wp_die('Security check failed');
    }
    
    $resource_id = sanitize_text_field($_POST['resource_id']);
    $action_type = sanitize_text_field($_POST['action_type']);
    $user_id = intval($_POST['user_id']);
    
    if ($user_id && $resource_id) {
        // Get existing resource usage
        $resource_usage = get_user_meta($user_id, 'pmp_resource_usage', true);
        if (!is_array($resource_usage)) {
            $resource_usage = [];
        }
        
        // Track usage with action type
        if (!isset($resource_usage[$resource_id])) {
            $resource_usage[$resource_id] = [];
        }
        
        $resource_usage[$resource_id][] = [
            'action' => $action_type,
            'timestamp' => current_time('mysql'),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ];
        
        // Keep only last 50 accesses per resource
        $resource_usage[$resource_id] = array_slice($resource_usage[$resource_id], -50);
        
        update_user_meta($user_id, 'pmp_resource_usage', $resource_usage);
        
        wp_send_json_success(['message' => 'Resource usage tracked', 'action' => $action_type]);
    } else {
        wp_send_json_error(['message' => 'Invalid data']);
    }
}

add_filter('show_admin_bar', '__return_false');

// --- WordPress Infrastructure Integration ---

/**
 * Integrate with existing analytics tracking systems
 */
function pmp_integrate_analytics() {
    // Google Analytics integration
    if (function_exists('gtag')) {
        add_action('wp_footer', 'pmp_track_lesson_views');
        add_action('wp_footer', 'pmp_track_progress_events');
    }
    
    // WordPress analytics plugins compatibility
    if (class_exists('MonsterInsights_Frontend')) {
        add_filter('monsterinsights_frontend_output_analytics_src', 'pmp_monsterinsights_integration');
    }
    
    // Jetpack Stats compatibility
    if (class_exists('Jetpack_Stats')) {
        add_action('wp_head', 'pmp_jetpack_stats_integration');
    }
}
add_action('init', 'pmp_integrate_analytics');

/**
 * Track lesson views for analytics
 */
function pmp_track_lesson_views() {
    if (is_singular('lesson')) {
        global $post;
        $lesson_id = $post->ID;
        $week_number = get_post_meta($lesson_id, '_lesson_week_number', true);
        $day_number = get_post_meta($lesson_id, '_lesson_day_number', true);
        
        echo "<script>
        if (typeof gtag !== 'undefined') {
            gtag('event', 'lesson_view', {
                'lesson_id': '{$lesson_id}',
                'week_number': '{$week_number}',
                'day_number': '{$day_number}',
                'lesson_title': '" . esc_js($post->post_title) . "'
            });
        }
        </script>";
    }
}

/**
 * Track progress events for analytics
 */
function pmp_track_progress_events() {
    if (is_user_logged_in()) {
        echo "<script>
        document.addEventListener('DOMContentLoaded', function() {
            // Track lesson completion
            document.addEventListener('pmp_lesson_completed', function(e) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'lesson_completed', {
                        'lesson_id': e.detail.lesson_id,
                        'completion_time': e.detail.completion_time
                    });
                }
            });
            
            // Track practice question answers
            document.addEventListener('pmp_question_answered', function(e) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'practice_question', {
                        'question_id': e.detail.question_id,
                        'is_correct': e.detail.is_correct
                    });
                }
            });
        });
        </script>";
    }
}

/**
 * MonsterInsights integration
 */
function pmp_monsterinsights_integration($src) {
    // Add custom tracking for PMP events
    return $src;
}

/**
 * Jetpack Stats integration
 */
function pmp_jetpack_stats_integration() {
    if (is_singular(array('lesson', 'course', 'resource'))) {
        // Add custom Jetpack tracking
        echo "<!-- PMP Jetpack Integration -->";
    }
}

/**
 * Plugin compatibility checks and integrations
 */
function pmp_ensure_plugin_compatibility() {
    // WooCommerce compatibility
    if (class_exists('WooCommerce')) {
        add_action('woocommerce_init', 'pmp_woocommerce_integration');
    }
    
    // LearnDash compatibility
    if (class_exists('SFWD_LMS')) {
        add_action('learndash_init', 'pmp_learndash_integration');
    }
    
    // Yoast SEO compatibility
    if (class_exists('WPSEO_Options')) {
        add_filter('wpseo_metabox_prio', 'pmp_yoast_metabox_priority');
        add_filter('wpseo_sitemap_exclude_post_type', 'pmp_yoast_sitemap_exclude');
    }
    
    // Elementor compatibility
    if (class_exists('Elementor\Plugin')) {
        add_action('elementor/widgets/widgets_registered', 'pmp_elementor_widgets');
    }
    
    // Contact Form 7 compatibility
    if (class_exists('WPCF7')) {
        add_action('wpcf7_init', 'pmp_cf7_integration');
    }
}
add_action('plugins_loaded', 'pmp_ensure_plugin_compatibility');

/**
 * WooCommerce integration for course sales
 */
function pmp_woocommerce_integration() {
    // Add course products integration
    add_filter('woocommerce_product_data_tabs', 'pmp_woo_course_tab');
    add_action('woocommerce_product_data_panels', 'pmp_woo_course_panel');
    add_action('woocommerce_process_product_meta', 'pmp_woo_save_course_data');
}

/**
 * LearnDash integration for LMS features
 */
function pmp_learndash_integration() {
    // Sync PMP lessons with LearnDash lessons
    add_action('save_post_lesson', 'pmp_sync_learndash_lesson');
    add_filter('learndash_course_steps', 'pmp_add_learndash_steps');
}

/**
 * Yoast SEO metabox priority
 */
function pmp_yoast_metabox_priority() {
    return 'low'; // Move Yoast metabox below PMP metaboxes
}

/**
 * Yoast sitemap exclusions
 */
function pmp_yoast_sitemap_exclude($excluded) {
    // Don't exclude our custom post types from sitemap
    return $excluded;
}

/**
 * Elementor widgets integration
 */
function pmp_elementor_widgets() {
    // Register custom PMP widgets for Elementor
    require_once get_stylesheet_directory() . '/includes/elementor-widgets.php';
}

/**
 * Contact Form 7 integration
 */
function pmp_cf7_integration() {
    // Add custom form tags for PMP data
    add_action('wpcf7_init', 'pmp_add_cf7_shortcodes');
}

/**
 * Database integration and migration
 */
function pmp_database_integration() {
    global $wpdb;
    
    // Check if we need to create custom tables
    $table_name = $wpdb->prefix . 'pmp_progress';
    
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        pmp_create_custom_tables();
    }
    
    // Migrate existing user meta to new structure if needed
    pmp_migrate_user_progress();
}
add_action('after_setup_theme', 'pmp_database_integration');

/**
 * Create custom database tables
 */
function pmp_create_custom_tables() {
    global $wpdb;
    
    $charset_collate = $wpdb->get_charset_collate();
    
    // Progress tracking table
    $table_name = $wpdb->prefix . 'pmp_progress';
    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        lesson_id bigint(20) NOT NULL,
        progress_percentage decimal(5,2) DEFAULT 0.00,
        time_spent int(11) DEFAULT 0,
        completed_at datetime DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY user_lesson (user_id, lesson_id),
        KEY user_id (user_id),
        KEY lesson_id (lesson_id)
    ) $charset_collate;";
    
    // Analytics table
    $analytics_table = $wpdb->prefix . 'pmp_analytics';
    $analytics_sql = "CREATE TABLE $analytics_table (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        event_type varchar(50) NOT NULL,
        event_data longtext,
        user_id bigint(20),
        post_id bigint(20),
        session_id varchar(100),
        ip_address varchar(45),
        user_agent text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY event_type (event_type),
        KEY user_id (user_id),
        KEY post_id (post_id),
        KEY created_at (created_at)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
    dbDelta($analytics_sql);
}

/**
 * Migrate existing user progress data
 */
function pmp_migrate_user_progress() {
    // Check if migration is needed
    $migration_done = get_option('pmp_progress_migration_done', false);
    
    if (!$migration_done) {
        global $wpdb;
        
        // Get all users with existing progress data
        $users_with_progress = $wpdb->get_results("
            SELECT user_id, meta_value 
            FROM {$wpdb->usermeta} 
            WHERE meta_key = 'pmp_completed_lessons'
        ");
        
        foreach ($users_with_progress as $user_progress) {
            $completed_lessons = maybe_unserialize($user_progress->meta_value);
            
            if (is_array($completed_lessons)) {
                foreach ($completed_lessons as $lesson_id) {
                    // Insert into new progress table
                    $wpdb->insert(
                        $wpdb->prefix . 'pmp_progress',
                        array(
                            'user_id' => $user_progress->user_id,
                            'lesson_id' => $lesson_id,
                            'progress_percentage' => 100.00,
                            'completed_at' => current_time('mysql')
                        ),
                        array('%d', '%d', '%f', '%s')
                    );
                }
            }
        }
        
        update_option('pmp_progress_migration_done', true);
    }
}

/**
 * REST API enhancements for external integrations
 */
function pmp_enhance_rest_api() {
    // Add custom fields to REST API responses
    add_action('rest_api_init', function() {
        // Add lesson meta to REST API
        register_rest_field('lesson', 'lesson_meta', array(
            'get_callback' => function($post) {
                return array(
                    'duration' => get_post_meta($post['id'], '_lesson_duration', true),
                    'video_url' => get_post_meta($post['id'], '_lesson_video_url', true),
                    'eco_tasks' => get_post_meta($post['id'], '_lesson_eco_tasks', true),
                    'difficulty' => get_post_meta($post['id'], '_lesson_difficulty', true),
                    'week_number' => get_post_meta($post['id'], '_lesson_week_number', true),
                    'day_number' => get_post_meta($post['id'], '_lesson_day_number', true)
                );
            }
        ));
        
        // Add course meta to REST API
        register_rest_field('course', 'course_meta', array(
            'get_callback' => function($post) {
                return array(
                    'total_lessons' => get_post_meta($post['id'], '_course_total_lessons', true),
                    'total_hours' => get_post_meta($post['id'], '_course_total_hours', true),
                    'total_modules' => get_post_meta($post['id'], '_course_total_modules', true),
                    'level' => get_post_meta($post['id'], '_course_level', true)
                );
            }
        ));
    });
}
add_action('init', 'pmp_enhance_rest_api');

/**
 * Cache integration and optimization
 */
function pmp_cache_integration() {
    // WP Rocket compatibility
    if (function_exists('rocket_clean_domain')) {
        add_action('pmp_progress_updated', 'pmp_clear_rocket_cache');
    }
    
    // W3 Total Cache compatibility
    if (function_exists('w3tc_flush_all')) {
        add_action('pmp_content_updated', 'pmp_clear_w3tc_cache');
    }
    
    // WP Super Cache compatibility
    if (function_exists('wp_cache_clear_cache')) {
        add_action('pmp_content_updated', 'pmp_clear_wpsc_cache');
    }
}
add_action('init', 'pmp_cache_integration');

/**
 * Clear WP Rocket cache on progress updates
 */
function pmp_clear_rocket_cache($user_id) {
    if (function_exists('rocket_clean_user')) {
        rocket_clean_user($user_id);
    }
}

/**
 * Clear W3 Total Cache on content updates
 */
function pmp_clear_w3tc_cache() {
    if (function_exists('w3tc_flush_posts')) {
        w3tc_flush_posts();
    }
}

/**
 * Clear WP Super Cache on content updates
 */
function pmp_clear_wpsc_cache() {
    if (function_exists('wp_cache_clear_cache')) {
        wp_cache_clear_cache();
    }
}

?>/
/ Include PMP User Settings class
require_once get_stylesheet_directory() . '/includes/class-pmp-user-settings.php';

// Initialize user settings for logged-in users
add_action('init', function() {
    if (is_user_logged_in()) {
        global $pmp_user_settings;
        $pmp_user_settings = new PMP_User_Settings(get_current_user_id());
    }
});// Includ
e settings enqueue functionality
require_once get_stylesheet_directory() . '/includes/pmp-enqueue-settings.php';