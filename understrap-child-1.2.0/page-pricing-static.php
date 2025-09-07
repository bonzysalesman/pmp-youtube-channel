<?php
/**
 * Template Name: Static Pricing Page
 *
 * This template displays statically defined pricing offers.
 * Content for the offers is hardcoded within this file.
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

                <?php while ( have_posts() ) : the_post(); // Standard loop for the page title and any top content ?>
					<header class="entry-header text-center mb-4">
						<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
					</header><!-- .entry-header -->
					<div class="entry-content text-center mb-5">
						<?php the_content(); // Display any introductory content added in the WP editor for this "Pricing" page ?>
					</div><!-- .entry-content -->
				<?php endwhile; // end of the page loop. ?>


                <?php // --- Statically Defined Pricing Offers --- ?>
                <section id="pricing-offers" class="pricing-offers-section">
                    <div class="row justify-content-center">

                        <!-- Offer 1: Study Guide -->
                        <div class="col-md-5 mb-4 d-flex">
                            <div class="card shadow-sm w-100 border-primary">
                                <div class="card-header bg-primary text-white text-center">
                                    <h4 class="my-0 fw-normal">Complete Study Guide</h4>
                                </div>
                                <div class="card-body text-center d-flex flex-column">
                                    <p class="card-text mt-2">Your comprehensive, 700+ page ECO-aligned PDF resource. Includes examples, activities, mindset focus, and practice questions. Perfect for self-paced study.</p>
                                    <h3 class="card-title pricing-card-title my-3">$99.99 <small class="text-muted fw-light">USD</small></h3>
                                    <!-- *** IMPORTANT: Replace # with actual purchase link *** -->
                                    <a href="#" class="btn btn-primary mt-auto w-100">
                                        <i class="fas fa-book-reader me-1"></i> Get the Guide Now
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Offer 2: Full Course -->
                        <div class="col-md-5 mb-4 d-flex">
                             <div class="card shadow-sm w-100 border-success"> <!-- Example: Highlight this one -->
                                <div class="card-header bg-success text-white text-center"> <!-- Example: Highlight this one -->
                                    <h4 class="my-0 fw-normal">Full Prep Course</h4>
                                     <span class="badge bg-light text-success position-absolute top-0 end-0 mt-2 me-2">Most Popular</span>
                                </div>
                                <div class="card-body text-center d-flex flex-column">
                                     <!-- *** IMPORTANT: Update details and price *** -->
                                    <p class="card-text mt-2">The ultimate package. Includes the Study Guide (PDF) PLUS ~40 hours of video lessons, 3 full simulated exams, access to private forum, and instructor Q&A support.</p>
                                    <h3 class="card-title pricing-card-title my-3">$199.99 <small class="text-muted fw-light">USD</small></h3>
                                     <!-- *** IMPORTANT: Replace # with actual enrollment link *** -->
                                    <a href="#" class="btn btn-success mt-auto w-100"> <!-- Example: Highlight this one -->
                                        <i class="fas fa-video me-1"></i> Enroll in the Course
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Add more offer columns here if needed, following the pattern -->

                    </div><!-- .row -->
                </section>

			</main><!-- #main -->

		</div><!-- .row -->

	</div><!-- #content -->

</div><!-- #page-wrapper -->

<?php get_footer(); ?>