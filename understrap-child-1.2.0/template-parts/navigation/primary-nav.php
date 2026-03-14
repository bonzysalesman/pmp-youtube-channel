<?php
/**
 * Primary Navigation Template Part
 * 
 * Displays the main navigation menu with PMP-specific enhancements
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// Get navigation configuration
$nav_config = PMP_Navigation_Config::get_main_menu_structure();
$mobile_config = PMP_Navigation_Config::get_mobile_navigation_config();
?>

<nav id="main-nav" class="navbar navbar-expand-<?php echo esc_attr( $mobile_config['breakpoint'] ); ?> navbar-light bg-white shadow-sm sticky-top" 
     aria-label="<?php esc_attr_e( 'Main Navigation', 'understrap-child' ); ?>"
     role="navigation">

    <div class="<?php echo esc_attr( get_theme_mod( 'understrap_container_type', 'container' ) ); ?>">

        <?php // Site Logo/Brand ?>
        <div class="navbar-brand-wrapper">
            <?php if ( has_custom_logo() ) : ?>
                <?php the_custom_logo(); ?>
            <?php else : ?>
                <a class="navbar-brand" rel="home" href="<?php echo esc_url( home_url( '/' ) ); ?>" 
                   title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" 
                   itemprop="url">
                    <?php bloginfo( 'name' ); ?>
                </a>
            <?php endif; ?>
        </div>

        <?php // Mobile Menu Toggle ?>
        <button class="navbar-toggler" type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#navbarNav" 
                aria-controls="navbarNav" 
                aria-expanded="false" 
                aria-label="<?php esc_attr_e( 'Toggle navigation', 'understrap-child' ); ?>">
            <span class="navbar-toggler-icon"></span>
        </button>

        <?php // Main Navigation Menu ?>
        <div class="collapse navbar-collapse" id="navbarNav">
            <?php
            wp_nav_menu( array(
                'theme_location'  => 'primary',
                'container'       => false,
                'menu_class'      => 'navbar-nav ms-auto me-3 align-items-center pmp-primary-nav',
                'fallback_cb'     => array( 'PMP_Navigation_Manager', 'fallback_menu' ),
                'menu_id'         => 'main-menu',
                'depth'           => 2,
                'walker'          => class_exists( 'Understrap_WP_Bootstrap_Navwalker' ) 
                                   ? new Understrap_WP_Bootstrap_Navwalker() 
                                   : new PMP_Icon_Nav_Walker(),
            ) );
            ?>

            <?php // User Actions & CTA ?>
            <ul class="navbar-nav flex-row align-items-center">
                <?php if ( ! is_user_logged_in() ) : ?>
                    <li class="nav-item nav-no-border ms-lg-2">
                        <a href="#pricing-offers" class="btn btn-primary">
                            <i class="fas fa-rocket me-1"></i> 
                            <?php esc_html_e( 'Get PMP® Ready', 'understrap-child' ); ?>
                        </a>
                    </li>
                <?php endif; ?>
                
                <li class="nav-item nav-no-border dropdown ms-lg-3">
                    <a class="nav-link dropdown-toggle pt-1 px-0 d-flex align-items-center" 
                       href="#" 
                       id="navbarUserDropdown" 
                       role="button" 
                       data-bs-toggle="dropdown" 
                       aria-expanded="false">
                        <?php if ( is_user_logged_in() ) : ?>
                            <?php $current_user = wp_get_current_user(); ?>
                            <span class="d-none d-lg-block me-2">
                                <?php printf( esc_html__( 'Hello, %s', 'understrap-child' ), esc_html( $current_user->display_name ) ); ?>
                            </span>
                        <?php else : ?>
                            <span class="d-none d-lg-block me-2">
                                <?php esc_html_e( 'Hello, Guest', 'understrap-child' ); ?>
                            </span>
                        <?php endif; ?>
                        <i class="fas fa-user-circle fa-lg"></i>
                    </a>
                    
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarUserDropdown">
                        <?php if ( is_user_logged_in() ) : ?>
                            <li>
                                <a class="dropdown-item d-flex align-items-center" 
                                   href="<?php echo esc_url( home_url( '/dashboard/' ) ); ?>">
                                    <i class="fas fa-tachometer-alt me-2"></i> 
                                    <?php esc_html_e( 'My Dashboard', 'understrap-child' ); ?>
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center" 
                                   href="<?php echo esc_url( home_url( '/progress/' ) ); ?>">
                                    <i class="fas fa-chart-line me-2"></i> 
                                    <?php esc_html_e( 'My Progress', 'understrap-child' ); ?>
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center" 
                                   href="<?php echo esc_url( get_edit_user_link() ); ?>">
                                    <i class="fas fa-user me-2"></i> 
                                    <?php esc_html_e( 'My Profile', 'understrap-child' ); ?>
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item text-danger d-flex align-items-center" 
                                   href="<?php echo esc_url( wp_logout_url( home_url( '/' ) ) ); ?>">
                                    <i class="fas fa-sign-out-alt me-2"></i> 
                                    <?php esc_html_e( 'Logout', 'understrap-child' ); ?>
                                </a>
                            </li>
                        <?php else : ?>
                            <li>
                                <a class="dropdown-item d-flex align-items-center" 
                                   href="<?php echo esc_url( wp_login_url( get_permalink() ) ); ?>">
                                    <i class="fas fa-sign-in-alt me-2"></i> 
                                    <?php esc_html_e( 'Login', 'understrap-child' ); ?>
                                </a>
                            </li>
                            <?php if ( get_option( 'users_can_register' ) ) : ?>
                                <li>
                                    <a class="dropdown-item d-flex align-items-center" 
                                       href="<?php echo esc_url( wp_registration_url() ); ?>">
                                        <i class="fas fa-user-plus me-2"></i> 
                                        <?php esc_html_e( 'Register', 'understrap-child' ); ?>
                                    </a>
                                </li>
                            <?php endif; ?>
                        <?php endif; ?>
                    </ul>
                </li>
            </ul>
        </div><!-- .collapse.navbar-collapse -->

    </div><!-- .container -->

</nav><!-- #main-nav -->

<?php
// Add navigation tracking script
if ( is_user_logged_in() ) :
?>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Track navigation clicks
    document.querySelectorAll('.pmp-primary-nav a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Track navigation usage
            if (typeof pmpData !== 'undefined') {
                fetch(pmpData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'pmp_track_navigation_click',
                        nonce: pmpData.nonce,
                        user_id: pmpData.userId,
                        link_url: this.href,
                        link_text: this.textContent.trim()
                    })
                });
            }
        });
    });
});
</script>
<?php endif; ?>