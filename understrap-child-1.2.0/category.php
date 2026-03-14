<?php
/**
 * Template for displaying category pages.
 *
 * @package MohlomiInstitute
 */

get_header();
?>

<div class="container my-5">
  <h1 class="text-center mb-4" style="color: var(--primary);">
    <?php single_cat_title(); ?>
  </h1>
  <p class="lead text-center">
    <?php echo category_description(); ?>
  </p>

  <div class="row row-cols-1 row-cols-md-3 g-4">
    <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
      <div class="col">
        <div class="card h-100">
          <?php if (has_post_thumbnail()) : ?>
            <img src="<?php the_post_thumbnail_url('medium'); ?>" class="card-img-top course-card-img" alt="<?php the_title(); ?>">
          <?php else : ?>
            <img src="<?php echo get_template_directory_uri(); ?>/images/default-course.jpg" class="card-img-top course-card-img" alt="Default image">
          <?php endif; ?>
          <div class="card-body">
            <h5 class="card-title"><?php the_title(); ?></h5>
            <p class="card-text"><?php echo wp_trim_words(get_the_excerpt(), 20, '...'); ?></p>
            <a href="<?php the_permalink(); ?>" class="btn btn-primary">Learn More</a>
          </div>
        </div>
      </div>
    <?php endwhile; else : ?>
      <div class="col-12">
        <div class="alert alert-warning text-center">
          No posts found in this category.
        </div>
      </div>
    <?php endif; ?>
  </div>

  <div class="pagination mt-4">
    <?php
    echo paginate_links(array(
      'prev_text' => '&laquo; Previous',
      'next_text' => 'Next &raquo;',
    ));
    ?>
  </div>
</div>

<?php get_footer(); ?>