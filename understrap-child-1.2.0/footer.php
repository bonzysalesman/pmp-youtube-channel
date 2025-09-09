<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the #content div and all content after
 * Incorporates suggestions: Uses get_stylesheet_directory_uri() for child theme logo,
 * updates placeholder link, ensures dynamic year, and uses best practices.
 *
 * @package Understrap-Child
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

$container = get_theme_mod( 'understrap_container_type', 'container' );
?>

<?php // Optional Full-Width Footer Widget Area (if registered and used) ?>
<?php // get_template_part( 'sidebar-templates/sidebar', 'footerfull' ); ?>

<footer id="wrapper-footer" class="wrapper-footer pt-5 pb-4" style="background-color: var(--primary); color: #e1e2e1;"> <!-- Added text color for better fallback -->

	<div class="<?php echo esc_attr( $container ); ?>">

		<div class="row gy-4">

			<div class="col-md-4">
                <!-- Footer Logo - Using get_stylesheet_directory_uri() for child theme images -->
                 <a href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home">
                    <img src="<?php echo esc_url( get_stylesheet_directory_uri() ); ?>/images/MI_Logo.png" alt="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?> Logo (White)" style="height: 50px; margin-bottom: 1rem;">
                 </a>
				<p>Mohlomi Institute provides focused, practical, and ethical training solutions for project management professionals aiming for excellence and certification success.</p>
			</div>

			<div class="col-md-2 offset-md-1">
                <!-- Widget Area 1: Quick Links -->
				<?php if ( is_active_sidebar( 'footer-1' ) ) : ?>
					<h3>Quick Links</h3>
					<?php dynamic_sidebar( 'footer-1' ); ?>
				<?php else: ?>
                     <!-- Fallback Content if no widget -->
                    <h3>Quick Links</h3>
                    <ul class="list-unstyled">
                        <li><a href="<?php echo esc_url( home_url('/') ); ?>">Home</a></li>
                        <li><a href="<?php echo esc_url( home_url('/courses/pmp-exam-prep/') ); ?>">PMP® Course</a></li>
                        <li><a href="<?php echo esc_url( home_url('/about/') ); ?>">About Us</a></li>
                        <li><a href="<?php echo esc_url( home_url('/contact/') ); ?>">Contact</a></li>
                        <?php /* <li><a href="<?php echo esc_url( home_url('/blog/') ); ?>">Blog</a></li> */ // Uncomment if Blog page exists ?>
                    </ul>
                <?php endif; ?>
			</div>

			<div class="col-md-2">
                <!-- Widget Area 2: Resources -->
                 <?php if ( is_active_sidebar( 'footer-2' ) ) : ?>
					<h3>Resources</h3>
					<?php dynamic_sidebar( 'footer-2' ); ?>
				<?php else: ?>
                    <!-- Fallback Content -->
                    <h3>Resources</h3>
                     <ul class="list-unstyled">
                        <li><a href="<?php echo esc_url( home_url('/courses/pmp-exam-prep/study-guide/') ); ?>">PMP® Study Guide</a></li>
                        <li><a href="<?php echo esc_url( home_url('/#free-sample') ); // Link to sample section on homepage ?>">Free Sample</a></li>
                        <li><a href="<?php echo esc_url( home_url('/testimonials/') ); ?>">Testimonials</a></li>
                        <li><a href="<?php echo esc_url( home_url('/faq/') ); // Assumes an FAQ page slug ?>">FAQs</a></li>
                        <li><a href="https://www.pmi.org" target="_blank" rel="noopener noreferrer">PMI® Website</a></li>
                    </ul>
                <?php endif; ?>
			</div>

			<div class="col-md-3">
                <!-- Widget Area 3: Connect -->
				<h3>Connect</h3>
                 <div class="social-links mb-3">
                    <?php
                    // Get social media links from theme customizer or options
                    $linkedin_url = get_theme_mod('pmp_linkedin_url', 'https://linkedin.com/company/mohlomi-institute');
                    $facebook_url = get_theme_mod('pmp_facebook_url', 'https://facebook.com/mohlomiinstitute');
                    $twitter_url = get_theme_mod('pmp_twitter_url', 'https://twitter.com/mohlomiinstitute');
                    $youtube_url = get_theme_mod('pmp_youtube_url', 'https://youtube.com/@mohlomiinstitute');
                    ?>
                    <?php if ($linkedin_url): ?>
                        <a href="<?php echo esc_url($linkedin_url); ?>" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin"></i></a>
                    <?php endif; ?>
                    <?php if ($facebook_url): ?>
                        <a href="<?php echo esc_url($facebook_url); ?>" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><i class="fab fa-facebook-square"></i></a>
                    <?php endif; ?>
                    <?php if ($twitter_url): ?>
                        <a href="<?php echo esc_url($twitter_url); ?>" aria-label="Twitter" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter-square"></i></a>
                    <?php endif; ?>
                    <?php if ($youtube_url): ?>
                        <a href="<?php echo esc_url($youtube_url); ?>" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><i class="fab fa-youtube"></i></a>
                    <?php endif; ?>
                 </div>
                 <div class="contact-info">
                     <?php
                     // Get contact information from theme customizer or options
                     $contact_email = get_theme_mod('pmp_contact_email', 'info@mohlomiinstitute.com');
                     $contact_phone = get_theme_mod('pmp_contact_phone', '+1 (555) 123-4567');
                     $contact_address = get_theme_mod('pmp_contact_address', '');
                     ?>
                     <?php if ($contact_email): ?>
                         <p><i class="fas fa-envelope"></i><a href="mailto:<?php echo esc_attr($contact_email); ?>"><?php echo esc_html($contact_email); ?></a></p>
                     <?php endif; ?>
                     <?php if ($contact_phone): ?>
                         <p><i class="fas fa-phone"></i><a href="tel:<?php echo esc_attr(preg_replace('/[^0-9+]/', '', $contact_phone)); ?>"><?php echo esc_html($contact_phone); ?></a></p>
                     <?php endif; ?>
                     <?php if ($contact_address): ?>
                         <p><i class="fas fa-map-marker-alt"></i><?php echo esc_html($contact_address); ?></p>
                     <?php endif; ?>
                 </div>
                 <?php // Optional extra contact info via widget ?>
                 <?php if ( is_active_sidebar( 'footer-3' ) ) : ?>
                    <?php dynamic_sidebar( 'footer-3' ); ?>
                <?php endif; ?>
			</div>

		</div><!-- .row -->

        <hr style="border-color: rgba(255,255,255,0.2); margin-top: 2rem; margin-bottom: 1.5rem;">

        <div class="site-info text-center">
             <div class="mb-2 footer-legal-links">
                 <?php // Ensure these pages exist with these slugs ?>
                <a href="<?php echo esc_url( home_url( '/terms-of-service/' ) ); ?>">Terms of Service</a> |
                <a href="<?php echo esc_url( home_url( '/privacy-policy/' ) ); ?>">Privacy Policy</a> |
                <a href="<?php echo esc_url( home_url( '/disclaimer/' ) ); ?>">Disclaimer</a>
            </div>
            <div class="footer-copyright">
                <?php
                $company_name = get_theme_mod('pmp_company_name', 'Mohlomi Institute');
                $legal_entity = get_theme_mod('pmp_legal_entity', '');
                ?>
                © <?php echo esc_html( date( 'Y' ) ); ?> <?php echo esc_html($company_name); ?><?php echo $legal_entity ? ' ' . esc_html($legal_entity) : ''; ?>. All Rights Reserved.
            </div>
            <div class="mt-1 footer-pmi-disclaimer">
                <small>PMP®, PMBOK® are registered marks of the Project Management Institute, Inc.</small>
            </div>
        </div><!-- .site-info -->

	</div><!-- .<?php echo esc_attr( $container ); ?> -->

</footer><!-- #wrapper-footer -->

</div><!-- #page - This closes the opening div in header.php -->

<?php wp_footer(); // Crucial hook for scripts, admin bar, etc. ?>

</body>

</html>