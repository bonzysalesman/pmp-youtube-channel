<?php
/**
 * Template Name: Testimonials Page
 *
 * This template displays all published testimonials.
 *
 * @package Understrap-Child
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header();

$container = get_theme_mod( 'understrap_container_type', 'container' );
?>

<div class="wrapper" id="page-wrapper">

	<div class="<?php echo esc_attr( $container ); ?>" id="content" tabindex="-1">

		<div class="row">

			<main class="site-main" id="main">

                <?php while ( have_posts() ) : the_post(); // Standard loop for the page itself ?>
					<header class="entry-header text-center mb-4">
						<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
					</header><!-- .entry-header -->
					<div class="entry-content text-center mb-5">
						<?php the_content(); // Display any content added in the WP editor for this page ?>
					</div><!-- .entry-content -->
				<?php endwhile; // end of the page loop. ?>


                <?php
                // --- Custom Query for Testimonials ---
                $paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1; // For pagination
                $args = array(
                    'post_type'      => 'testimonial',
                    'posts_per_page' => 9, // Show 9 per page, adjust as needed
                    'orderby'        => 'date',
                    'order'          => 'DESC',
                    'post_status'    => 'publish',
                    'paged'          => $paged
                );

                $testimonial_query = new WP_Query( $args );

                if ( $testimonial_query->have_posts() ) : ?>

                    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">

                        <?php while ( $testimonial_query->have_posts() ) : $testimonial_query->the_post();
                            $credentials = get_field('testimonial_author_credentials');
                        ?>
                            <div class="col">
                                <div class="card shadow-sm border-0 h-100">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center mb-3">
                                            <?php if ( has_post_thumbnail() ) : ?>
                                                <?php the_post_thumbnail('thumbnail', ['class' => 'rounded-circle me-3', 'style' => 'width: 60px; height: 60px; object-fit: cover;', 'alt' => get_the_title() . ' testimonial photo']); ?>
                                            <?php else: ?>
                                                <div class="rounded-circle me-3 bg-secondary text-white d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; font-size: 1.5rem;">
                                                    <i class="fas fa-user"></i>
                                                </div>
                                            <?php endif; ?>
                                            <div>
                                                <h5 class="mb-0"><?php the_title(); ?></h5>
                                                <?php if ( $credentials ) : ?>
                                                    <small class="text-muted"><?php echo esc_html( $credentials ); ?></small>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                        <p class="card-text fst-italic">"<?php echo wp_strip_all_tags( get_the_content() ); ?>"</p>
                                    </div>
                                </div>
                            </div>
                        <?php endwhile; ?>

                    </div><!-- .row -->

                     <!-- Pagination for testimonials -->
                     <div class="mt-5">
                         <?php understrap_pagination($testimonial_query); // Pass the custom query to pagination ?>
                     </div>

                <?php else : ?>
                    <p class="text-center">No testimonials have been added yet.</p>
                <?php endif;

                // Restore original Post Data
                wp_reset_postdata();
                ?>

			</main><!-- #main -->

		</div><!-- .row -->

	</div><!-- #content -->

</div><!-- #page-wrapper -->

<?php get_footer(); ?>