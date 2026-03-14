<?php
/**
 * The template for displaying the footer.
 *
 * @package Understrap-Child
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

$container = get_theme_mod( 'understrap_container_type', 'container' );
?>

<footer id="wrapper-footer" class="wrapper-footer py-5" style="background-color: #f8f9fa; color: #4B5563; border-top: 1px solid #eaeaea;">

	<div class="<?php echo esc_attr( $container ); ?>">

		<div class="row mb-5">
            <!-- Column 1: Brand & Social -->
			<div class="col-md-5 pe-md-5">
                 <h2 class="mb-4" style="font-weight: 900; color: #333; font-size: 1.8rem; letter-spacing: -0.5px;">Mohlomi.</h2>
				<p style="font-size: 0.95rem; line-height: 1.6; color: #6B7280; font-weight: 400; max-width: 90%; margin-bottom: 2rem;">
                    Mohlomi Institute provides focused, practical, and ethical training solutions for project management professionals worldwide.
                </p>
                <div class="footer-social-icons d-flex gap-3">
                    <a href="#" aria-label="LinkedIn" class="text-secondary fs-5" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin"></i></a>
                    <a href="#" aria-label="Instagram" class="text-secondary fs-5" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram"></i></a>
                    <a href="#" aria-label="Twitter" class="text-secondary fs-5" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter"></i></a>
                    <a href="#" aria-label="YouTube" class="text-secondary fs-5" target="_blank" rel="noopener noreferrer"><i class="fab fa-youtube"></i></a>
                </div>
			</div>

            <!-- Column 2: Quick Links -->
			<div class="col-md-3">
				<h3 style="font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 1.5rem;">Quick Links</h3>
                <ul class="list-unstyled footer-links" style="font-size: 0.95rem; font-weight: 500;">
                    <li class="mb-3"><a href="<?php echo esc_url( home_url('/') ); ?>" style="color: #8b5cf6;">Home</a></li>
                    <li class="mb-3"><a href="<?php echo esc_url( home_url('/courses/') ); ?>" style="color: #8b5cf6;">Courses</a></li>
                    <li class="mb-3"><a href="<?php echo esc_url( home_url('/dashboard/') ); ?>" style="color: #8b5cf6;">My Learning</a></li>
                    <li class="mb-3"><a href="<?php echo esc_url( home_url('/resources/') ); ?>" style="color: #8b5cf6;">Resources</a></li>
                    <li class="mb-3"><a href="<?php echo esc_url( home_url('/community/') ); ?>" style="color: #8b5cf6;">Community</a></li>
                </ul>
			</div>

            <!-- Column 3: Support -->
			<div class="col-md-4">
				<h3 style="font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 1.5rem;">Support</h3>
                <ul class="list-unstyled footer-links" style="font-size: 0.95rem; font-weight: 500;">
                    <li class="mb-3"><a href="<?php echo esc_url( home_url('/help-center/') ); ?>" style="color: #8b5cf6;">Help Center</a></li>
                    <li class="mb-3"><a href="<?php echo esc_url( home_url('/contact/') ); ?>" style="color: #8b5cf6;">Contact Us</a></li>
                    <li class="mb-3"><a href="mailto:bonzy.pmp.prep@gmail.com" style="color: #8b5cf6;">Email: bonzy.pmp.prep@gmail.com</a></li>
                    <li class="mb-3"><a href="https://wa.me/26655555555" style="color: #8b5cf6;">WhatsApp: +266 5555 5555</a></li>
                    <li class="mb-3"><a href="<?php echo esc_url( home_url('/faq/') ); ?>" style="color: #8b5cf6;">FAQ</a></li>
                    <li class="mb-3"><a href="<?php echo esc_url( home_url('/privacy-policy/') ); ?>" style="color: #8b5cf6;">Privacy Policy</a></li>
                    <li class="mb-3"><a href="<?php echo esc_url( home_url('/terms-of-service/') ); ?>" style="color: #8b5cf6;">Terms of Service</a></li>
                </ul>
			</div>
		</div><!-- .row -->

        <hr style="border-color: #e5e7eb; margin: 0 0 1.5rem 0;">

        <!-- Bottom Bar -->
        <div class="row align-items-center" style="font-size: 0.85rem; color: #9CA3AF;">
            <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
                © 2025 Mohlomi Institute. All rights reserved.
            </div>
            <div class="col-md-6 text-center text-md-end">
                PMP® is a registered trademark of PMI &nbsp;|&nbsp; Made with <span style="color: #ef4444;">❤️</span> for PMP candidates
            </div>
        </div>

	</div><!-- .container -->

</footer><!-- #wrapper-footer -->

</div><!-- #page -->

<?php wp_footer(); ?>

</body>

</html>