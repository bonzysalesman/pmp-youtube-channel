
<?php
/**
 * Template for displaying single blog posts with centered content and no sidebar.
 *
 * @package MohlomiInstitute
 */

get_header();
?>
<!--
<article>
    <section class="blog-post-header">
        <?php if (has_post_thumbnail()) : ?>
            <img src="<?php the_post_thumbnail_url('full'); ?>" alt="<?php the_title(); ?>" loading="lazy">
        <?php else : ?>
            <img src="<?php echo get_template_directory_uri(); ?>/images/default-blog.jpg" alt="Default Blog Image" loading="lazy">
        <?php endif; ?>
    </section>

    <div class="container">
        <div class="row">
            <div class="col-md-8 offset-md-2">
                <h1 class="text-center my-5"><?php the_title(); ?></h1>
                <p class="blog-post-meta text-center">
                    <?php echo get_the_date(); ?> by <?php the_author(); ?>
                </p>

                <div class="blog-post-content">
                    <?php the_content(); ?>
                </div>
            </div>
        </div>
    </div>
</article>
-->

<article>
    <section class="blog-post-header">
      <img src="./images/agile_hybrid.jpeg" alt="Related Image" loading="lazy">
    </section>

    <div class="container">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <h1 class="text-center my-5">Mastering Agile Methodologies for the PMP® Exam</h1>
          <p class="blog-post-meta text-center">October 26, 2023 by Bonzy Salesman</p>

          <div class="blog-post-content">
            <p>
              In today's dynamic project management landscape, Agile methodologies have become crucial for PMP® exam
              preparation. Understanding and applying Agile principles can significantly improve your chances of
              success.
            </p>

            <h2>What is Agile?</h2>
            <p>
              Agile is an iterative and incremental approach to project management, focusing on flexibility,
              collaboration, and customer satisfaction. Unlike traditional waterfall methods, Agile allows for changes
              throughout the project lifecycle.
            </p>

            <h3>Key Agile Concepts</h3>
            <ul>
              <li><strong>Iterative Development:</strong> Breaking down projects into smaller, manageable iterations.</li>
              <li><strong>Continuous Feedback:</strong> Regularly seeking feedback from stakeholders to adapt to changing needs.</li>
              <li><strong>Self-Organizing Teams:</strong> Empowering teams to make decisions and manage their work.</li>
            </ul>

            <blockquote>
              "Agile is not just a methodology; it's a mindset." - Bonzy Salesman
            </blockquote>

            <h2>Applying Agile to PMP® Exam Prep</h2>
            <p>
              To effectively prepare for the PMP® exam with Agile methodologies in mind, consider these tips:
            </p>
            <ol>
              <li><strong>Understand Agile Frameworks:</strong> Familiarize yourself with Scrum, Kanban, and Lean.</li>
              <li><strong>Practice Adaptive Planning:</strong> Learn to adjust your study plans based on your progress.</li>
              <li><strong>Collaborate with Peers:</strong> Engage in group study sessions for knowledge sharing.</li>
            </ol>

            <p>
              By integrating Agile principles into your PMP® exam preparation, you can develop a flexible and
              responsive approach to your studies, ensuring you're well-prepared for the exam.
            </p>
            
          </div>
        </div>
      </div>
    </div>
  </article>

<footer class="bg-light py-4 mt-4">
    <div class="container">
        <div class="row">
            <div class="col-md-6">
                <img src="<?php echo get_template_directory_uri(); ?>/images/MI_Logo.png" alt="Logo" style="height: 60px; z-index: 999; position: relative; border: 1px solid #FEFEFE;">
                <p style="color: #282828; line-height: 1.6;">Mohlomi Institute is an ethical, manifold space that brings together individuals who otherwise wouldn't meet and gives them a place and a process to get things done.</p>
            </div>

            <div class="col-md-3">
                <h3>Quick Links</h3>
                <ul class="list-unstyled">
                    <li><a href="<?php echo home_url(); ?>" class="text-decoration-none text-dark">Home</a></li>
                    <li><a href="<?php echo home_url('/about/'); ?>" class="text-decoration-none text-dark">About</a></li>
                    <li><a href="<?php echo home_url('/courses/'); ?>" class="text-decoration-none text-dark">Courses</a></li>
                    <li><a href="<?php echo home_url('/testimonials/'); ?>" class="text-decoration-none text-dark">Testimonials</a></li>
                    <li><a href="<?php echo home_url('/pricing/'); ?>" class="text-decoration-none text-dark">Pricing</a></li>
                    <li><a href="<?php echo home_url('/contact/'); ?>" class="text-decoration-none text-dark">Contact Us</a></li>
                </ul>
            </div>

            <div class="col-md-3">
                <h3>Connect With Us</h3>
                <ul class="list-unstyled social-links">
                    <li><a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a></li>
                    <li><a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a></li>
                    <li><a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a></li>
                </ul>
            </div>
        </div>
        <hr />
        <div class="text-center mt-4">
            <div>© Mohlomi Institute Trust (Reg No: ) 2025</div>
        </div>
    </div>
</footer>

<?php get_footer(); ?>