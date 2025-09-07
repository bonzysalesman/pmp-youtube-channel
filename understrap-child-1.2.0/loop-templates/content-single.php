<?php
/**
 * Single post partial template.
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;
?>

<article <?php post_class('mb-5'); // Add bottom margin for spacing if needed ?> id="post-<?php the_ID(); ?>">

	<header class="entry-header mb-4">

		<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>

		<div class="entry-meta text-muted mb-3 pb-3 border-bottom"> <?php // Added padding/border ?>
			 <?php understrap_posted_on(); // Display date/author ?>
			 <?php if( has_category() ) : ?>
			 	<span class="cat-links ms-1">| Posted in: <?php echo wp_kses_post( get_the_category_list( ', ' ) ); ?></span>
			 <?php endif; ?>
		</div><!-- .entry-meta -->

	</header><!-- .entry-header -->

	<?php // Display Featured Image - often placed after header in single posts ?>
	<?php if ( has_post_thumbnail() ) : ?>
		<div class="entry-image mb-4 text-center"> <?php // Added text-center potentially ?>
			<?php the_post_thumbnail( 'large', array( // Use 'large' or 'full' size
				'class' => 'img-fluid rounded shadow-sm', // Make it responsive, rounded, with shadow
				'alt'   => the_title_attribute( 'echo=0' ),
                'style' => 'max-height: 500px; width: auto;' // Example style constraint
			) ); ?>
		</div>
	<?php endif; ?>

	<div class="entry-content">

		<?php the_content(); // Display the full post content from the editor ?>

		<?php
		// Displays page links for paginated posts (using <!--nextpage--> tag in editor)
		wp_link_pages(
			array(
				'before' => '<div class="page-links">' . __( 'Pages:', 'understrap-child' ),
				'after'  => '</div>',
				'link_before' => '<span class="page-number">',
        		'link_after'  => '</span>',
			)
		);
		?>

	</div><!-- .entry-content -->

	<footer class="entry-footer mt-4 pt-4 border-top"> <?php // Add padding/border ?>
		 <?php $tags_list = get_the_tag_list( '', ', ' ); ?>
		 <?php if ( $tags_list ) : ?>
			<div class="tags-links mb-3">
				<span class="tags-title"><strong>Tags:</strong> </span>
				<?php echo wp_kses_post( $tags_list ); ?>
			</div>
		 <?php endif; ?>
		 <?php // You can add author bio or related posts here if desired ?>
		 <?php // understrap_entry_footer(); // Default footer meta - often redundant here ?>
	</footer><!-- .entry-footer -->

</article><!-- #post-## -->