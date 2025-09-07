<?php
/**
 * The template for displaying the Course archive (Course Catalog).
 *
 * Uses content-course.php template part for displaying each course summary.
 *
 * @package Understrap-Child
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header();

$container = get_theme_mod( 'understrap_container_type', 'container' );
?>

<div class="wrapper" id="archive-wrapper">

	<div class="<?php echo esc_attr( $container ); ?>" id="content" tabindex="-1">

		<div class="row">

			<!-- Do the left sidebar check -->
			<?php // get_template_part( 'global-templates/left-sidebar-check' ); ?>

			<main class="site-main" id="main">

				<?php if ( have_posts() ) : ?>

					<header class="page-header mb-4 text-center"> <?php // Added text-center ?>
						<?php
						// Use the archive title defined in the CPT registration
						the_archive_title( '<h1 class="page-title">', '</h1>' );
						// Optional: Display archive description if needed
						// the_archive_description( '<div class="taxonomy-description lead">', '</div>' );
						?>
					</header><!-- .page-header -->

                    <?php // Setup the grid structure for the cards ?>
                    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">

                        <?php /* Start the Loop */ ?>
                        <?php while ( have_posts() ) : the_post(); ?>

                            <div class="col d-flex align-items-stretch"> <?php // Added flex classes for equal height cards ?>
                                <?php
                                /*
                                 * Include the Post-Format-specific template for the content.
                                 * In this case, we want loop-templates/content-course.php
                                 */
                                get_template_part( 'loop-templates/content', 'course' );
                                ?>
                            </div><!-- .col -->

                        <?php endwhile; ?>

                    </div><!-- .row -->

				<?php else : ?>

					<?php get_template_part( 'loop-templates/content', 'none' ); ?>

				<?php endif; ?>

				<!-- The pagination component -->
                <div class="mt-5"> <?php // Add margin top to pagination ?>
				    <?php understrap_pagination(); ?>
                </div>

			</main><!-- #main -->

			<!-- Do the right sidebar check -->
			<?php // get_template_part( 'global-templates/right-sidebar-check' ); ?>

		</div><!-- .row -->

	</div><!-- #content -->

</div><!-- #archive-wrapper -->

<?php get_footer(); ?>