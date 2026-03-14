<?php get_header(); ?>

<div class="container my-5">
  <?php
  // Display breadcrumb navigation
  if ( class_exists( 'PMP_Navigation_Manager' ) ) {
      $nav_manager = new PMP_Navigation_Manager();
      $nav_manager->display_breadcrumbs();
  }
  
  if ( have_posts() ) :
    while ( have_posts() ) : the_post();
      the_content();
    endwhile;
  else :
    echo '<p>No content found</p>';
  endif;
  ?>
</div>

<?php get_footer(); ?>