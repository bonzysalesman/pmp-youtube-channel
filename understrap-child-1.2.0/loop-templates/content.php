<?php
/**
 * Post rendering content according to caller of get_template_part.
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;
?>

<article <?php post_class('mb-5 card shadow-sm border-0'); // Added card classes for structure ?> id="post-<?php the_ID(); ?>">

	<?php // Display Featured Image above the header/title inside the card ?>
	<?php if ( has_post_thumbnail() ) : ?>
		<div class="entry-image card-img-top-container"> <?php // Optional container class ?>
			<a href="<?php echo esc_url( get_permalink() ); ?>" rel="bookmark">
				<?php
                // Using medium_large size for better performance on archives
				the_post_thumbnail( 'medium_large', array(
					'class' => 'card-img-top', // Bootstrap class to make it fit the card top nicely
					'style' => 'height: 250px; object-fit: cover;', // Set a fixed height and cover
                    'alt'   => the_title_attribute( 'echo=0' ),
				) );
				?>
			</a>
		</div>
	<?php endif; ?>

	<div class="card-body d-flex flex-column"> <?php // Use flexbox for layout ?>

        <header class="entry-header">
            <?php
            // Post Title
            the_title(
                sprintf( '<h2 class="entry-title card-title h4"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), // Make title slightly smaller (h4)
                '</a></h2>'
            );
            ?>

            <?php if ( 'post' === get_post_type() ) : ?>
                <div class="entry-meta text-muted mb-3 small"> <?php // Use small class for meta ?>
                    <?php understrap_posted_on(); // Function from parent theme for date/author ?>
                    <span class="cat-links ms-1">| Categories: <?php echo wp_kses_post( get_the_category_list( ', ' ) ); ?></span>
                     <?php $tags_list = get_the_tag_list( '', ', ' ); ?>
                     <?php if ( $tags_list ) : ?>
                        <span class="tags-links d-block mt-1">Tags: <?php echo wp_kses_post( $tags_list ); ?></span> <?php // Display tags on new line ?>
                     <?php endif; ?>
                </div><!-- .entry-meta -->
            <?php endif; ?>

        </header><!-- .entry-header -->

        <div class="entry-summary card-text mb-3"> <?php // Added card-text class ?>
            <?php the_excerpt(); // Display the post excerpt ?>
        </div><!-- .entry-summary -->

        <footer class="entry-footer mt-auto"> <?php // Push footer to bottom ?>
             <a href="<?php the_permalink(); ?>" class="btn btn-sm btn-outline-primary">Read More<i class="fas fa-arrow-right ms-1"></i></a>
             <?php // understrap_entry_footer(); // You might not need the default footer bits here ?>
        </footer><!-- .entry-footer -->

    </div><!-- .card-body -->

</article><!-- #post-## -->