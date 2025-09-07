<?php
/**
 * PMP Navigation Setup Script
 * 
 * Creates the navigation menus programmatically based on the design specifications
 * This script should be run once to set up the initial navigation structure
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * PMP Navigation Setup Class
 */
class PMP_Navigation_Setup {
    
    /**
     * Run the navigation setup
     */
    public static function run_setup() {
        // Ensure navigation manager is loaded
        if ( ! class_exists( 'PMP_Navigation_Manager' ) ) {
            require_once get_stylesheet_directory() . '/includes/pmp-navigation-manager.php';
        }
        
        if ( ! class_exists( 'PMP_Navigation_Config' ) ) {
            require_once get_stylesheet_directory() . '/includes/pmp-navigation-config.php';
        }
        
        $navigation_manager = new PMP_Navigation_Manager();
        
        // Create all navigation menus
        $navigation_manager->create_navigation_menus();
        
        // Set up additional navigation features
        self::setup_navigation_features();
        
        // Create necessary pages for navigation
        self::create_navigation_pages();
        
        return true;
    }
    
    /**
     * Setup additional navigation features
     */
    private static function setup_navigation_features() {
        // Enable menu descriptions
        add_filter( 'walker_nav_menu_start_el', array( __CLASS__, 'nav_menu_description' ), 10, 4 );
        
        // Add navigation CSS classes
        add_filter( 'body_class', array( __CLASS__, 'add_navigation_body_classes' ) );
        
        // Setup mobile navigation
        self::setup_mobile_navigation();
    }
    
    /**
     * Create necessary pages for navigation
     */
    private static function create_navigation_pages() {
        $pages_to_create = array(
            'course-overview' => array(
                'title' => 'Course Overview',
                'content' => '[pmp_course_overview]',
                'template' => 'page-course-overview.php'
            ),
            'dashboard' => array(
                'title' => 'My Dashboard',
                'content' => '[pmp_dashboard]',
                'template' => 'page-dashboard.php'
            ),
            'lessons' => array(
                'title' => 'Lessons',
                'content' => '[pmp_lessons_archive]',
                'template' => 'page-lessons.php'
            ),
            'resources' => array(
                'title' => 'Resources',
                'content' => '[pmp_resources_archive]',
                'template' => 'page-resources.php'
            ),
            'progress' => array(
                'title' => 'My Progress',
                'content' => '[pmp_progress_tracker]',
                'template' => 'page-progress.php'
            ),
            'support' => array(
                'title' => 'Support',
                'content' => '[pmp_support_center]',
                'template' => 'page-support.php'
            )
        );
        
        foreach ( $pages_to_create as $slug => $page_data ) {
            // Check if page already exists
            $existing_page = get_page_by_path( $slug );
            
            if ( ! $existing_page ) {
                $page_id = wp_insert_post( array(
                    'post_title' => $page_data['title'],
                    'post_content' => $page_data['content'],
                    'post_status' => 'publish',
                    'post_type' => 'page',
                    'post_name' => $slug
                ) );
                
                if ( $page_id && ! is_wp_error( $page_id ) ) {
                    // Set page template if specified
                    if ( isset( $page_data['template'] ) ) {
                        update_post_meta( $page_id, '_wp_page_template', $page_data['template'] );
                    }
                    
                    // Add page to navigation tracking
                    update_post_meta( $page_id, '_pmp_navigation_page', true );
                }
            }
        }
    }
    
    /**
     * Setup mobile navigation
     */
    private static function setup_mobile_navigation() {
        $mobile_config = PMP_Navigation_Config::get_mobile_navigation_config();
        
        // Store mobile config in theme options
        update_option( 'pmp_mobile_nav_config', $mobile_config );
        
        // Add mobile navigation CSS
        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_mobile_nav_styles' ) );
    }
    
    /**
     * Enqueue mobile navigation styles
     */
    public static function enqueue_mobile_nav_styles() {
        wp_add_inline_style( 'understrap-child-style', self::get_mobile_nav_css() );
    }
    
    /**
     * Get mobile navigation CSS
     * 
     * @return string CSS styles
     */
    private static function get_mobile_nav_css() {
        return '
        /* PMP Mobile Navigation Styles */
        @media (max-width: 991.98px) {
            .pmp-primary-nav .nav-item.has-icon .nav-link::before {
                content: attr(data-icon);
                font-family: "Font Awesome 5 Free";
                font-weight: 900;
                margin-right: 0.5rem;
            }
            
            .pmp-primary-nav .dropdown-menu {
                background-color: #f8f9fa;
                border: none;
                box-shadow: inset 0 1px 0 rgba(0,0,0,.1);
            }
            
            .pmp-primary-nav .dropdown-item {
                padding: 0.75rem 1.5rem;
                font-size: 0.9rem;
            }
            
            .pmp-primary-nav .dropdown-item.has-color {
                border-left: 3px solid var(--item-color, #007bff);
            }
        }
        
        /* Dashboard Sidebar Navigation */
        .pmp-dashboard-nav {
            padding: 0;
            margin: 0;
        }
        
        .pmp-dashboard-nav .menu-item {
            margin-bottom: 0.5rem;
        }
        
        .pmp-dashboard-nav .menu-item a {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            color: #495057;
            text-decoration: none;
            border-radius: 0.375rem;
            transition: all 0.2s ease-in-out;
        }
        
        .pmp-dashboard-nav .menu-item a:hover,
        .pmp-dashboard-nav .menu-item.current-page a {
            background-color: #e9ecef;
            color: #007bff;
        }
        
        .pmp-dashboard-nav .menu-item.has-icon a i {
            width: 1.25rem;
            margin-right: 0.75rem;
        }
        
        /* Breadcrumb Navigation */
        .pmp-breadcrumbs {
            margin-bottom: 1.5rem;
        }
        
        .pmp-breadcrumbs .breadcrumb {
            background-color: transparent;
            padding: 0;
            margin-bottom: 0;
        }
        
        .pmp-breadcrumbs .breadcrumb-item + .breadcrumb-item::before {
            content: "/";
            color: #6c757d;
        }
        
        /* Footer Navigation */
        .footer-widget .menu {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .footer-widget .menu-item {
            margin-bottom: 0.5rem;
        }
        
        .footer-widget .menu-item a {
            color: #6c757d;
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.2s ease-in-out;
        }
        
        .footer-widget .menu-item a:hover {
            color: #007bff;
        }
        ';
    }
    
    /**
     * Add navigation menu descriptions
     */
    public static function nav_menu_description( $item_output, $item, $depth, $args ) {
        if ( isset( $args->theme_location ) && $args->theme_location === 'primary' ) {
            $description = get_post_meta( $item->ID, '_menu_item_description', true );
            if ( $description ) {
                $item_output = str_replace( 
                    '</a>', 
                    '<small class="nav-description d-block text-muted">' . esc_html( $description ) . '</small></a>', 
                    $item_output 
                );
            }
        }
        
        return $item_output;
    }
    
    /**
     * Add navigation-related body classes
     */
    public static function add_navigation_body_classes( $classes ) {
        // Add class for navigation style
        $classes[] = 'pmp-navigation-enabled';
        
        // Add class for mobile navigation
        if ( wp_is_mobile() ) {
            $classes[] = 'pmp-mobile-nav';
        }
        
        // Add class for logged-in users
        if ( is_user_logged_in() ) {
            $classes[] = 'pmp-user-logged-in';
        }
        
        return $classes;
    }
    
    /**
     * Get setup status
     * 
     * @return bool Whether setup has been completed
     */
    public static function is_setup_complete() {
        return get_option( 'pmp_navigation_setup_complete', false );
    }
    
    /**
     * Mark setup as complete
     */
    public static function mark_setup_complete() {
        update_option( 'pmp_navigation_setup_complete', true );
        update_option( 'pmp_navigation_setup_date', current_time( 'mysql' ) );
    }
    
    /**
     * Reset navigation setup
     */
    public static function reset_setup() {
        // Delete created menus
        $menus = array(
            'PMP Primary Navigation',
            'PMP Dashboard Sidebar',
            'PMP Footer - Quick Links',
            'PMP Footer - Resources',
            'PMP Footer - Connect'
        );
        
        foreach ( $menus as $menu_name ) {
            $menu = wp_get_nav_menu_object( $menu_name );
            if ( $menu ) {
                wp_delete_nav_menu( $menu->term_id );
            }
        }
        
        // Reset options
        delete_option( 'pmp_navigation_setup_complete' );
        delete_option( 'pmp_navigation_setup_date' );
        delete_option( 'pmp_mobile_nav_config' );
        
        // Clear menu locations
        set_theme_mod( 'nav_menu_locations', array() );
    }
}

// Auto-run setup if not already completed
add_action( 'after_setup_theme', function() {
    if ( ! PMP_Navigation_Setup::is_setup_complete() ) {
        // Only run on admin or when specifically requested
        if ( is_admin() || isset( $_GET['pmp_setup_nav'] ) ) {
            PMP_Navigation_Setup::run_setup();
            PMP_Navigation_Setup::mark_setup_complete();
        }
    }
} );

// Add admin menu for navigation management
add_action( 'admin_menu', function() {
    add_submenu_page(
        'themes.php',
        'PMP Navigation Setup',
        'PMP Navigation',
        'manage_options',
        'pmp-navigation-setup',
        function() {
            ?>
            <div class="wrap">
                <h1>PMP Navigation Setup</h1>
                
                <?php if ( PMP_Navigation_Setup::is_setup_complete() ) : ?>
                    <div class="notice notice-success">
                        <p><strong>Navigation setup is complete!</strong></p>
                        <p>Setup completed on: <?php echo esc_html( get_option( 'pmp_navigation_setup_date' ) ); ?></p>
                    </div>
                    
                    <p>
                        <a href="<?php echo admin_url( 'nav-menus.php' ); ?>" class="button button-primary">
                            Manage Navigation Menus
                        </a>
                        <a href="<?php echo add_query_arg( 'action', 'reset', admin_url( 'themes.php?page=pmp-navigation-setup' ) ); ?>" 
                           class="button button-secondary" 
                           onclick="return confirm('Are you sure you want to reset the navigation setup?');">
                            Reset Navigation Setup
                        </a>
                    </p>
                <?php else : ?>
                    <div class="notice notice-warning">
                        <p><strong>Navigation setup is not complete.</strong></p>
                    </div>
                    
                    <p>
                        <a href="<?php echo add_query_arg( 'action', 'setup', admin_url( 'themes.php?page=pmp-navigation-setup' ) ); ?>" 
                           class="button button-primary">
                            Run Navigation Setup
                        </a>
                    </p>
                <?php endif; ?>
                
                <h2>Navigation Structure</h2>
                <p>The PMP navigation system includes:</p>
                <ul>
                    <li><strong>Primary Navigation:</strong> Main site navigation with course structure</li>
                    <li><strong>Dashboard Sidebar:</strong> User dashboard navigation</li>
                    <li><strong>Footer Menus:</strong> Quick links, resources, and connect sections</li>
                    <li><strong>Mobile Navigation:</strong> Responsive mobile menu</li>
                    <li><strong>Breadcrumbs:</strong> Contextual navigation</li>
                </ul>
            </div>
            <?php
        }
    );
} );

// Handle admin actions
add_action( 'admin_init', function() {
    if ( isset( $_GET['page'] ) && $_GET['page'] === 'pmp-navigation-setup' ) {
        if ( isset( $_GET['action'] ) ) {
            switch ( $_GET['action'] ) {
                case 'setup':
                    PMP_Navigation_Setup::run_setup();
                    PMP_Navigation_Setup::mark_setup_complete();
                    wp_redirect( admin_url( 'themes.php?page=pmp-navigation-setup&setup=complete' ) );
                    exit;
                    
                case 'reset':
                    PMP_Navigation_Setup::reset_setup();
                    wp_redirect( admin_url( 'themes.php?page=pmp-navigation-setup&reset=complete' ) );
                    exit;
            }
        }
    }
} );