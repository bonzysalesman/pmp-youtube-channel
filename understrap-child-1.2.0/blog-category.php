<?php
/**
 * Template for displaying blog category pages.
 *
 * @package MohlomiInstitute
 */

get_header();
?>

<section class="about-header">
  <div class="container">
    <h1>Category: <?php single_cat_title(); ?></h1>
  </div>
</section>

<div class="container my-5">
  <div class="row">
    <div class="col-md-8">
      <!-- Category Description -->
      <div class="mb-4">
        <h2><?php single_cat_title(); ?> Insights</h2>
        <p class="lead"><?php echo category_description(); ?></p>
      </div>

      <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
          <!-- Blog Post -->
          <div class="blog-post">
            <h3 class="blog-post-title"><?php the_title(); ?></h3>
            <p class="blog-post-meta">
              <?php echo get_the_date(); ?> by <?php the_author(); ?>
            </p>
            <p><?php echo wp_trim_words(get_the_excerpt(), 30, '...'); ?></p>
            <a href="<?php the_permalink(); ?>" class="btn btn-outline-primary">Read More</a>
          </div>
        <?php endwhile; ?>

        <!-- Pagination -->
        <div class="pagination mt-4">
          <?php
          echo paginate_links(array(
            'prev_text' => '&laquo; Previous',
            'next_text' => 'Next &raquo;',
          ));
          ?>
        </div>
      <?php else : ?>
        <div class="alert alert-warning">
          No posts found in this category.
        </div>
      <?php endif; ?>
    </div>

    <div class="col-md-4">
      <!-- Sidebar -->
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Categories</h5>
          <ul class="list-unstyled">
            <?php wp_list_categories(array(
              'title_li' => '',
              'exclude' => get_cat_ID(single_cat_title("", false)),
            )); ?>
          </ul>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-body">
          <h5 class="card-title">Recent Posts</h5>
          <ul class="list-unstyled">
            <?php
            $recent_posts = wp_get_recent_posts(array('numberposts' => 5));
            foreach ($recent_posts as $post) {
              echo '<li><a href="' . get_permalink($post["ID"]) . '">' . $post["post_title"] . '</a></li>';
            }
            ?>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<?php get_footer(); ?>