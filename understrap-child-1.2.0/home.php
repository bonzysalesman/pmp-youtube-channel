<?php
/**
 * The template for displaying the Blog Posts Index (designated Posts page).
 *
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header();

$container = get_theme_mod( 'understrap_container_type', 'container' ); // Get container type from theme options
?>

<div class="wrapper" id="index-wrapper">

	<div class="<?php echo esc_attr( $container ); ?>" id="content" tabindex="-1">

		<div class="row">

			<!-- Do the left sidebar check -->
			<?php // get_template_part( 'global-templates/left-sidebar-check' ); // Uncomment if using left sidebar ?>

			<main class="site-main" id="main">

				<?php if ( have_posts() ) : ?>

					<?php /* Start the Loop */ ?>
                    <header class="page-header mb-4">
                        <?php
                            // Display the title of the page designated as the Posts Page
                            $blog_page_id = get_option( 'page_for_posts' );
                            echo '<h1 class="page-title">' . esc_html( get_the_title( $blog_page_id ) ) . '</h1>';
                        ?>
                        <?php
                            // Optional: Add an archive description if needed
                            // the_archive_description( '<div class="taxonomy-description">', '</div>' );
                        ?>
                    </header><!-- .page-header -->

					<?php while ( have_posts() ) : the_post(); ?>

						<?php
						/*
						 * Include the Post-Format-specific template for the content.
						 * If you want to override this in a child theme, then include a file
						 * called content-___.php (where ___ is the Post Format name) and that will be used instead.
						 *
						 * We are using the customized content.php from the child theme's loop-templates directory.
						 */
						get_template_part( 'loop-templates/content', get_post_format() );
						?>

					<?php endwhile; ?>

				<?php else : ?>

					<?php get_template_part( 'loop-templates/content', 'none' ); ?>

				<?php endif; ?>

				<!-- The pagination component -->
				<?php understrap_pagination(); ?>

			</main><!-- #main -->

			<!-- Do the right sidebar check -->
			<?php get_template_part( 'global-templates/right-sidebar-check' ); ?>

		</div><!-- .row -->

	</div><!-- #content -->

</div><!-- #index-wrapper -->

<?php get_footer(); ?>