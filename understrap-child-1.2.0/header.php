<?php

/**
 * The header for our theme.
 *
 * Displays all of the <head> section and everything up till the main content area.
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined('ABSPATH') || exit;

// Determine container type (usually 'container' or 'container-fluid')
$container = get_theme_mod('understrap_container_type', 'container');
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="profile" href="http://gmpg.org/xfn/11">
    <?php wp_head(); // Crucial hook for plugins and WordPress core 
    ?>
    <?php
    if (is_page('courses-overview')) { ?>
        <style type="text/css">
            @media (min-width: 1200px) {

                .container,
                .container-lg,
                .container-md,
                .container-sm,
                .container-xl {
                    max-width: 100% !important;
                }
            }
        </style>
    <?php } ?>
</head>

<body <?php body_class(); ?>>
    <?php do_action('wp_body_open'); // Hook for plugins like Google Tag Manager 
    ?>
    <div class="site" id="page">

        <!-- ******************* The Navbar Area ******************* -->
        <header id="wrapper-navbar" class="wrapper-navbar" itemscope itemtype="http://schema.org/WebSite">

            <a class="skip-link screen-reader-text sr-only" href="#content"><?php esc_html_e('Skip to content', 'understrap'); ?></a>

            <nav id="main-nav" class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top" aria-label="<?php esc_attr_e('Main Navigation', 'understrap-child'); ?>">

                <div class="<?php echo esc_attr($container); ?>">

                    <?php // --- Site Logo --- 
                    ?>
                    <?php if (has_custom_logo()) : ?>
                        <?php the_custom_logo(); ?>
                    <?php else : ?>
                        <?php // Fallback to site title if no logo is set in Customizer 
                        ?>
                        <a class="navbar-brand" rel="home" href="<?php echo esc_url(home_url('/')); ?>" title="<?php echo esc_attr(get_bloginfo('name', 'display')); ?>" itemprop="url"><?php bloginfo('name'); ?></a>
                    <?php endif; ?>
                    <?php // --- OR Hardcoded Logo (if not using Customizer logo) ---
                    /*
                <a class="navbar-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>">
                   <img src="<?php echo esc_url( get_stylesheet_directory_uri() ); ?>/images/MI_Logo.png" alt="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?> Logo" style="height: 60px;">
                </a>
                */
                    ?>

                    <?php // --- Enhanced Navbar Toggler for Mobile --- 
                    ?>
                    <button class="navbar-toggler pmp-mobile-nav-toggle" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="<?php esc_attr_e('Toggle navigation menu', 'understrap-child'); ?>">
                        <span class="navbar-toggler-icon"></span>
                        <span class="sr-only"><?php esc_html_e('Menu', 'understrap-child'); ?></span>
                    </button>

                    <?php // --- Enhanced Main Navigation Menu --- 
                    ?>
                    <div class="collapse navbar-collapse pmp-mobile-nav-container" id="navbarNav">
                        <?php
                        wp_nav_menu(
                            array(
                                'theme_location'  => 'primary', // Matches the location registered in functions.php
                                'container'       => false, // Don't wrap in extra div
                                'menu_class'      => 'navbar-nav ms-auto me-3 align-items-lg-center pmp-primary-nav', // Enhanced classes for mobile responsiveness
                                'fallback_cb'     => '', // Don't show pages if menu not set
                                'menu_id'         => 'main-menu',
                                'depth'           => 2, // Allow dropdowns
                                'walker'          => new Understrap_WP_Bootstrap_Navwalker(), // Use Understrap's Bootstrap 5 walker
                            )
                        );
                        ?>

                        <?php // --- Enhanced CTA Button & User Dropdown for Mobile --- 
                        ?>
                        <ul class="navbar-nav flex-lg-row align-items-lg-center pmp-mobile-actions"> <?php // Enhanced mobile-responsive classes 
                                                                                                        ?>
                            <li class="nav-item nav-no-border ms-lg-2">
                                <a href="#pricing-offers" class="btn btn-primary pmp-cta-button">
                                    <i class="fas fa-rocket me-1"></i>
                                    <span class="d-none d-sm-inline">Get PMP® Ready</span>
                                    <span class="d-sm-none">Get Started</span>
                                </a>
                            </li>
                            <li class="nav-item nav-no-border dropdown ms-lg-3">
                                <a class="nav-link dropdown-toggle pt-1 px-0 d-flex align-items-center pmp-user-dropdown" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="<?php esc_attr_e('User account menu', 'understrap-child'); ?>">
                                    <?php if (is_user_logged_in()) : ?>
                                        <?php $current_user = wp_get_current_user(); ?>
                                        <span class="d-none d-lg-block me-2">Hello, <?php echo esc_html($current_user->display_name); ?></span>
                                        <span class="d-lg-none me-2"><?php echo esc_html($current_user->display_name); ?></span>
                                    <?php else : ?>
                                        <span class="d-none d-lg-block me-2">Hello, Guest</span>
                                        <span class="d-lg-none me-2">Account</span>
                                    <?php endif; ?>
                                    <i class="fas fa-user-circle fa-lg"></i>
                                </a>
                                <ul class="dropdown-menu dropdown-menu-end pmp-user-menu" aria-labelledby="navbarUserDropdown">
                                    <?php if (is_user_logged_in()) : ?>
                                        <?php
                                        // Get current user and roles
                                        $current_user = wp_get_current_user();
                                        $user_roles = $current_user->roles;
                                        $is_admin = in_array('administrator', $user_roles);
                                        $is_instructor = in_array('instructor', $user_roles);
                                        $is_student = in_array('student', $user_roles);
                                        ?>
                                        
                                        <!-- Basic user menu items -->
                                        <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(get_edit_user_link()); ?>"><i class="fas fa-user me-2"></i> My Profile</a></li>
                                        <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(home_url('/dashboard/')); ?>"><i class="fas fa-tachometer-alt me-2"></i> Dashboard</a></li>
                                        <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(home_url('/progress/')); ?>"><i class="fas fa-chart-line me-2"></i> My Progress</a></li>
                                        <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(home_url('/resources/')); ?>"><i class="fas fa-folder-open me-2"></i> Resources</a></li>
                                        
                                        <?php if ($is_student || $is_instructor || $is_admin) : ?>
                                            <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(home_url('/resources/advanced/')); ?>"><i class="fas fa-star me-2"></i> Advanced Resources</a></li>
                                        <?php endif; ?>
                                        
                                        <?php if ($is_instructor || $is_admin) : ?>
                                            <li>
                                                <hr class="dropdown-divider">
                                            </li>
                                            <li><h6 class="dropdown-header">Instructor Tools</h6></li>
                                            <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(home_url('/instructor/dashboard/')); ?>"><i class="fas fa-chalkboard-teacher me-2"></i> Instructor Dashboard</a></li>
                                            <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(home_url('/instructor/students/')); ?>"><i class="fas fa-users me-2"></i> Student Management</a></li>
                                        <?php endif; ?>
                                        
                                        <?php if ($is_admin) : ?>
                                            <li>
                                                <hr class="dropdown-divider">
                                            </li>
                                            <li><h6 class="dropdown-header">Administration</h6></li>
                                            <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(admin_url()); ?>"><i class="fas fa-cogs me-2"></i> Admin Panel</a></li>
                                            <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(admin_url('options-general.php')); ?>"><i class="fas fa-sliders-h me-2"></i> Site Settings</a></li>
                                        <?php endif; ?>
                                        
                                        <li>
                                            <hr class="dropdown-divider">
                                        </li>
                                        <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(home_url('/support/')); ?>"><i class="fas fa-life-ring me-2"></i> Support</a></li>
                                        <li>
                                            <hr class="dropdown-divider">
                                        </li>
                                        <li><a class="dropdown-item text-danger d-flex align-items-center" href="<?php echo esc_url(wp_logout_url(home_url('/'))); ?>"><i class="fas fa-sign-out-alt me-2"></i> Logout</a></li>
                                    <?php else : ?>
                                        <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(wp_login_url(get_permalink())); ?>"><i class="fas fa-sign-in-alt me-2"></i> Login</a></li>
                                        <?php if (get_option('users_can_register')) : ?>
                                            <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(wp_registration_url()); ?>"><i class="fas fa-user-plus me-2"></i> Register</a></li>
                                        <?php endif; ?>
                                        <li>
                                            <hr class="dropdown-divider">
                                        </li>
                                        <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url(home_url('/course-overview/')); ?>"><i class="fas fa-book-open me-2"></i> Course Overview</a></li>
                                    <?php endif; ?>
                                </ul>
                            </li>
                        </ul>
                    </div><!-- .collapse.navbar-collapse -->

                </div><!-- .container -->

            </nav><!-- #main-nav -->

        </header><!-- #wrapper-navbar end -->

        <?php // The opening div for content is usually handled by template files like index.php, page.php etc. 
        ?>
        <?php // It's typically <div class="wrapper" id="page-wrapper"> <div class="container" id="content"> ... </div> </div> 
        ?>
        <?php // We leave the header open, ready for the content template to start. 
        ?>