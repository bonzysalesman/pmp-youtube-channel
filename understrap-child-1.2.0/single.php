<?php
/**
 * The template for displaying all single posts
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header();

$container = get_theme_mod( 'understrap_container_type', 'container' );
?>

<div class="wrapper" id="single-wrapper">

	<div class="<?php echo esc_attr( $container ); ?>" id="content" tabindex="-1">

		<div class="row">

			<!-- Do the left sidebar check -->
			<?php get_template_part( 'global-templates/left-sidebar-check' ); ?>

			<main class="site-main" id="main">

				<?php
				// Display breadcrumb navigation
				if ( class_exists( 'PMP_Navigation_Manager' ) ) {
					$nav_manager = new PMP_Navigation_Manager();
					$nav_manager->display_breadcrumbs();
				}
				?>

				<?php while ( have_posts() ) : the_post(); ?>

					<?php
					/*
					 * Include the Post-Format-specific template for the content.
					 * If you want to override this in a child theme, then include a file
					 * called content-single-___.php (where ___ is the Post Format name) and that
					 * will be used instead. We specifically want content-single.php
					 */
					get_template_part( 'loop-templates/content-single', get_post_type() );
					?>

					<?php
					// Display post navigation (Previous/Next Post links)
					// This function is typically defined in the parent Understrap theme
					understrap_post_nav();
					?>

					<?php
					// If comments are open or there is at least one comment, load up the comment template.
					if ( comments_open() || get_comments_number() ) :
						comments_template();
					endif;
					?>

				<?php endwhile; // end of the loop. ?>

			</main><!-- #main -->

			<!-- Do the right sidebar check -->
			<?php get_template_part( 'global-templates/right-sidebar-check' ); ?>

		</div><!-- .row -->

	</div><!-- #content -->

</div><!-- #single-wrapper -->

<?php get_footer(); ?>