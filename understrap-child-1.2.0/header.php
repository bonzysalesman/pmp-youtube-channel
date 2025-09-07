<?php
/**
 * The header for our theme.
 *
 * Displays all of the <head> section and everything up till the main content area.
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// Determine container type (usually 'container' or 'container-fluid')
$container = get_theme_mod( 'understrap_container_type', 'container' );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<link rel="profile" href="http://gmpg.org/xfn/11">
	<?php wp_head(); // Crucial hook for plugins and WordPress core ?>
  <?php
if (is_page('courses-overview')) { ?>
<style type="text/css">
@media (min-width: 1200px) {
    .container, .container-lg, .container-md, .container-sm, .container-xl {
        max-width: 100% !important;
    }
}
</style>
<?php } ?>
</head>

<body <?php body_class(); ?>>
<?php do_action( 'wp_body_open' ); // Hook for plugins like Google Tag Manager ?>
<div class="site" id="page">

	<!-- ******************* The Navbar Area ******************* -->
	<header id="wrapper-navbar" class="wrapper-navbar" itemscope itemtype="http://schema.org/WebSite">

		<a class="skip-link screen-reader-text sr-only" href="#content"><?php esc_html_e( 'Skip to content', 'understrap' ); ?></a>

		<nav id="main-nav" class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top" aria-label="<?php esc_attr_e( 'Main Navigation', 'understrap-child' ); ?>">

			<div class="<?php echo esc_attr( $container ); ?>">

				<?php // --- Site Logo --- ?>
                <?php if ( has_custom_logo() ) : ?>
                    <?php the_custom_logo(); ?>
                <?php else : ?>
                    <?php // Fallback to site title if no logo is set in Customizer ?>
                    <a class="navbar-brand" rel="home" href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" itemprop="url"><?php bloginfo( 'name' ); ?></a>
                <?php endif; ?>
                <?php // --- OR Hardcoded Logo (if not using Customizer logo) ---
                /*
                <a class="navbar-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>">
                   <img src="<?php echo esc_url( get_stylesheet_directory_uri() ); ?>/images/MI_Logo.png" alt="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?> Logo" style="height: 60px;">
                </a>
                */
                ?>

                <?php // --- Navbar Toggler for Mobile --- ?>
				<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="<?php esc_attr_e( 'Toggle navigation', 'understrap-child' ); ?>">
					<span class="navbar-toggler-icon"></span>
				</button>

                <?php // --- Main Navigation Menu --- ?>
				<div class="collapse navbar-collapse" id="navbarNav">
					<?php
					wp_nav_menu(
						array(
							'theme_location'  => 'primary', // Matches the location registered in functions.php
							'container'       => false, // Don't wrap in extra div
							'menu_class'      => 'navbar-nav ms-auto me-3 align-items-center', // Main menu items, auto margin left, margin end, vertically aligned
							'fallback_cb'     => '', // Don't show pages if menu not set
							'menu_id'         => 'main-menu',
							'depth'           => 2, // Allow dropdowns
							'walker'          => new Understrap_WP_Bootstrap_Navwalker(), // Use Understrap's Bootstrap 5 walker
						)
					);
					?>

                    <?php // --- Manually Added CTA Button & User Dropdown --- ?>
                    <ul class="navbar-nav flex-row align-items-center"> <?php // Use flex-row to keep them inline at larger sizes ?>
                         <li class="nav-item nav-no-border ms-lg-2">
                            <a href="#pricing-offers" class="btn btn-primary">
                                <i class="fas fa-rocket me-1"></i> Get PMP® Ready
                            </a>
                        </li>
                        <li class="nav-item nav-no-border dropdown ms-lg-3">
                            <a class="nav-link dropdown-toggle pt-1 px-0 d-flex align-items-center" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <?php if ( is_user_logged_in() ) : ?>
                                    <?php $current_user = wp_get_current_user(); ?>
                                    <span class="d-none d-lg-block me-2">Hello, <?php echo esc_html( $current_user->display_name ); ?></span>
                                <?php else : ?>
                                    <span class="d-none d-lg-block me-2">Hello, Guest</span>
                                <?php endif; ?>
                                <i class="fas fa-user-circle fa-lg"></i>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarUserDropdown">
                                <?php if ( is_user_logged_in() ) : ?>
                                    <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url( get_edit_user_link() ); // Standard profile link ?>"><i class="fas fa-user me-1"></i> My Profile</a></li>
                                    <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url( home_url('/my-account/my-courses/') ); // Example link - adjust based on your setup ?>"><i class="fas fa-chalkboard-teacher me-1"></i> My Courses</a></li>
                                    <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url( home_url('/my-account/settings/') ); // Example link ?>"><i class="fas fa-cog me-1"></i> Settings</a></li>
                                    <?php /* Add Messages/Support if needed */ ?>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger d-flex align-items-center" href="<?php echo esc_url( wp_logout_url( home_url('/') ) ); ?>"><i class="fas fa-sign-out-alt me-1"></i> Logout</a></li>
                                <?php else : ?>
                                    <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url( wp_login_url( get_permalink() ) ); // Redirect back to current page after login ?>"><i class="fas fa-sign-in-alt me-1"></i> Login</a></li>
                                    <?php if ( get_option( 'users_can_register' ) ) : // Check if registration is enabled ?>
                                        <li><a class="dropdown-item d-flex align-items-center" href="<?php echo esc_url( wp_registration_url() ); ?>"><i class="fas fa-user-plus me-1"></i> Register</a></li>
                                    <?php endif; ?>
                                <?php endif; ?>
                            </ul>
                        </li>
                    </ul>
				</div><!-- .collapse.navbar-collapse -->

			</div><!-- .container -->

		</nav><!-- #main-nav -->

	</header><!-- #wrapper-navbar end -->

    <?php // The opening div for content is usually handled by template files like index.php, page.php etc. ?>
    <?php // It's typically <div class="wrapper" id="page-wrapper"> <div class="container" id="content"> ... </div> </div> ?>
    <?php // We leave the header open, ready for the content template to start. ?>