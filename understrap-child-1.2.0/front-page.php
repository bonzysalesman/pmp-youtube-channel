<?php
/**
 * Front Page Template
 *
 * Displays the static homepage content. Uses hardcoded structure based on previous designs
 * and incorporates suggestions for dynamic links, image paths, and content alignment
 * from the PMP Study Guide teaser.
 *
 * @package Understrap-Child
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header(); // Includes header.php from child theme
?>

<main id="main" class="site-main" role="main">

    <!-- Hero Section -->
    <section id="hero" class="container-fluid vh-100 d-flex align-items-center p-0">
        <div class="row w-100 m-0">
            <div class="col-lg-6 p-0 order-lg-2">
                <div class="bg-image" style="background-image: url('<?php echo get_stylesheet_directory_uri(); ?>/images/pmp_one.jpeg'); height: 100vh; background-position: center; background-size: cover; mask-image: linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));">
                    <!-- Background image set via inline style -->
                </div>
            </div>
            <div class="col-lg-6 d-flex align-items-center justify-content-center order-lg-1 py-5">
                <div class="text-center px-3">
                    <h1 class="display-4 mb-3">Pass Your PMP® Exam the First Time: Practical, ECO-Focused Prep.</h1>
                    <p class="lead mb-4">Stop wasting time and money. Get the clear, structured guidance you need, based *directly* on the official PMP® Exam Content Outline (ECO). Designed for serious first-time passers by a fellow PMP® candidate.</p>
                    <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                        <a href="#pricing-offers" class="btn btn-primary btn-lg me-sm-2 mb-2 mb-sm-0">Get the Study Guide</a>
                        <a href="#study-group" class="btn btn-outline-secondary btn-lg">Join the Study Group</a> <!-- Updated CTA & Link -->
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Problem/Solution Section -->
    <section id="problem-solution" class="container my-5 py-5">
        <div class="row align-items-center">
            <div class="col-md-6 order-md-2">
                <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/543.jpeg" class="img-fluid rounded shadow-sm" alt="Project manager looking thoughtfully at plans" style="max-height: 480px;" />
            </div>
            <div class="col-md-6 order-md-1">
                <h2 class="mb-4">Stop Guessing What to Study. Start Preparing Effectively.</h2>
                <p>Are you lost in a sea of PMP® prep materials, unsure what really matters for the exam? Many candidates waste valuable time on outdated information or struggle to connect theory to the exam's situational questions.</p>
                <p>This guide cuts through the noise, created out of the need for a clear, affordable path focused *only* on what the exam tests. We focus exclusively on the official PMP® Exam Content Outline (ECO) – the exact blueprint for the exam. You'll learn precisely what you need to know for the People, Process, and Business Environment domains, integrated with the critical Agile and Hybrid approaches tested today.</p>
            </div>
        </div>
    </section>

    <!-- Highlights Section (Included 'Built for You') -->
    <section id="highlights" class="container my-5 py-5 bg-light rounded">
        <h2 class="text-center mb-5">Why Choose Mohlomi Institute for PMP® Prep?</h2>
        <div class="row">
            <!-- Card 1 -->
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body text-center d-flex flex-column">
                        <i class="fas fa-bullseye fa-3x mb-3 text-primary"></i>
                        <h5 class="card-title">ECO-Aligned Structure</h5>
                        <p class="card-text mt-auto">Maps directly to the PMP® Exam Content Outline domains, tasks, and enablers – study what's actually tested.</p>
                    </div>
                </div>
            </div>
            <!-- Card 2 -->
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body text-center d-flex flex-column">
                        <i class="fas fa-brain fa-3x mb-3 text-primary"></i>
                        <h5 class="card-title">Master the PMP® Mindset</h5>
                        <p class="card-text mt-auto">Learn the proactive, collaborative, value-driven approach essential for exam success and effective leadership.</p>
                    </div>
                </div>
            </div>
             <!-- Card 3: Built for You -->
             <div class="col-md-4 mb-4">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body text-center d-flex flex-column">
                         <i class="fas fa-user-friends fa-3x mb-3 text-primary"></i>
                        <h5 class="card-title">Built for You</h5>
                        <p class="card-text mt-auto">Designed by a PMP® candidate facing the same challenges. Practical, affordable, and focused on first-time success.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Structured Path Section -->
    <section id="structured-path" class="container my-5 py-5">
        <h2 class="text-center mb-5">Your Structured Path to PMP® Exam Success</h2>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <!-- Card 1 -->
            <div class="col">
                <div class="card shadow-sm border-0 h-100">
                    <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/eco_outline.png" class="card-img-top" alt="Blueprint Icon representing ECO focus" style="height: 200px; object-fit: cover;">
                    <div class="card-body text-center">
                        <h5 class="card-title">Laser-Focused on the ECO</h5>
                        <p class="card-text">Master the domains, tasks, and enablers specified in the official PMP® Exam Content Outline. Study smarter, not harder.</p>
                    </div>
                </div>
            </div>
            <!-- Card 2 -->
            <div class="col">
                <div class="card shadow-sm border-0 h-100">
                    <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/5678.jpeg" class="card-img-top" alt="Brain icon representing PMP Mindset" style="height: 200px; object-fit: cover;">
                    <div class="card-body text-center">
                        <h5 class="card-title">Master the PMP® Mindset</h5>
                        <p class="card-text">Learn the critical thinking and decision-making principles PMI expects, essential for tackling complex situational questions.</p>
                    </div>
                </div>
            </div>
            <!-- Card 3 -->
            <div class="col">
                <div class="card shadow-sm border-0 h-100">
                    <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/agile_hybrid.jpeg" class="card-img-top" alt="Intertwined arrows representing Agile and Hybrid" style="height: 200px; object-fit: cover;">
                    <div class="card-body text-center">
                        <h5 class="card-title">Agile & Hybrid Integrated</h5>
                        <p class="card-text">Gain confidence with clear explanations and examples of the Agile and Hybrid approaches heavily featured on the current exam.</p>
                    </div>
                </div>
            </div>
            <!-- Card 4 -->
            <div class="col">
                <div class="card shadow-sm border-0 h-100">
                    <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/9876.jpeg" class="card-img-top" alt="Checkmark icon representing practical application" style="height: 200px; object-fit: cover;">
                    <div class="card-body text-center">
                        <h5 class="card-title">Practical Application Focus</h5>
                        <p class="card-text">Go beyond theory with real-world examples, practical activities, and PMP®-style questions woven throughout the guide.</p>
                    </div>
                </div>
            </div>
            <!-- Card 5 -->
            <div class="col">
                <div class="card shadow-sm border-0 h-100">
                    <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/expert_guidance.png" class="card-img-top" alt="Graduation cap or expert icon" style="height: 200px; object-fit: cover;">
                    <div class="card-body text-center">
                        <h5 class="card-title">Expert Guidance</h5>
                        <p class="card-text">Learn from Bonzy Salesman, PMP®, a seasoned project leader with extensive real-world and training experience.</p>
                    </div>
                </div>
            </div>
             <!-- Card 6 - Community/Support -->
             <div class="col">
              <div class="card shadow-sm border-0 h-100">
                 <i class="fas fa-users fa-3x my-4 text-primary text-center"></i>
                <div class="card-body text-center">
                  <h5 class="card-title">Join the Study Group</h5>
                  <p class="card-text">Connect with fellow PMP® candidates for accountability, discussion, and shared resources.</p>
                </div>
              </div>
            </div>
        </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="container my-5 py-5 bg-light rounded">
        <h2 class="text-center mb-5">What Our Students Say</h2>
        <div class="row">
            <!-- Testimonial 1 -->
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/user1.png" alt="Photo of John Doe" class="rounded-circle me-3" style="width: 60px; height: 60px; object-fit: cover;">
                            <div>
                                <h5 class="mb-0">John Doe</h5>
                                <small class="text-muted">PMP® Certified</small>
                            </div>
                        </div>
                        <p class="card-text fst-italic">"The PMP Exam Preparation Course was incredibly thorough and focused exactly on what the ECO covered. Helped me pass the exam with flying colors on my first try!"</p>
                    </div>
                </div>
            </div>
            <!-- Testimonial 2 -->
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/user2.png" alt="Photo of Jane Smith" class="rounded-circle me-3" style="width: 60px; height: 60px; object-fit: cover;">
                            <div>
                                <h5 class="mb-0">Jane Smith</h5>
                                <small class="text-muted">PMP® Certified</small>
                            </div>
                        </div>
                        <p class="card-text fst-italic">"I highly recommend this guide to anyone serious about the PMP. The focus on the PMP Mindset and practical examples made all the difference for the situational questions."</p>
                    </div>
                </div>
            </div>
            <!-- Testimonial 3 -->
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/user3.png" alt="Photo of Michael Brown" class="rounded-circle me-3" style="width: 60px; height: 60px; object-fit: cover;">
                            <div>
                                <h5 class="mb-0">Michael Brown</h5>
                                <small class="text-muted">PMP® Certified</small>
                            </div>
                        </div>
                        <p class="card-text fst-italic">"The ECO alignment and clear explanations of Agile/Hybrid concepts were exactly what I needed. Thanks to Mohlomi Institute, I felt fully prepared."</p>
                    </div>
                </div>
            </div>
        </div>
         <div class="text-center mt-4">
            <a href="<?php echo esc_url( home_url('/testimonials/') ); ?>" class="btn btn-outline-primary">View All Testimonials</a>
        </div>
    </section>

    <!-- Domains/Approach Section (Optional - can be removed if Curriculum section covers it well) -->
    <section id="approach" class="container my-5 py-5">
        <div class="row align-items-center">
            <div class="col-md-6">
                <h2 class="mb-4">Master All PMP® Exam Domains</h2>
                <p>Our structured approach, guided by the PMP® Exam Content Outline, ensures you cover every essential area tested:</p>
                 <ul>
                    <li><strong>People (42%)</strong>: Leading teams, managing conflict, supporting performance, engaging stakeholders.</li>
                    <li><strong>Process (50%)</strong>: Mastering technical project management across predictive, agile, and hybrid environments.</li>
                    <li><strong>Business Environment (8%)</strong>: Connecting projects to strategy, ensuring compliance, delivering value.</li>
                    <li><strong>The PMP® Mindset</strong>: Integrating critical thinking for situational questions.</li>
                    <li><strong>Exam Prep Strategies</strong>: Proven techniques for study and test-taking.</li>
                </ul>
                <a href="<?php echo esc_url( home_url( '/courses/pmp-exam-prep/study-guide/' ) ); // Link to guide details ?>" class="btn btn-outline-primary mt-3">View Detailed Guide Outline</a>
            </div>
            <div class="col-md-6 text-center">
                <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/exam_domains_pie.png" class="img-fluid rounded shadow-sm" alt="Pie chart showing PMP Exam Domain weightings: People 42%, Process 50%, Business Environment 8%" />
            </div>
        </div>
    </section>

    <!-- Author Section -->
    <section id="author" class="container my-5 py-5 bg-light rounded">
        <h2 class="text-center mb-5">Your Guide: Bonzy Salesman, PMP®</h2>
        <div class="row justify-content-center">
            <div class="col-md-8 text-center">
                <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/1685529853437.jpeg" alt="Photo of Bonzy Salesman" class="rounded-circle mb-4 shadow" style="width: 120px; height: 120px; object-fit: cover;">
                <p class="lead fst-italic mb-4">“I couldn’t afford the official prep books or courses, so I built my own guide — and now I’m sharing it with others on the same journey.”</p>
                <p>Learn from Bonzy Salesman, a PMP® certified project leader and postgraduate with over 15 years of real-world experience. Bonzy created this guide providing the clear, practical, ECO-focused preparation needed for first-time exam success.</p>
                 <!-- Update href to actual bio page/section -->
                <a href="<?php echo esc_url( home_url('/about/#bonzy') ); // Example link to anchor on about page ?>" class="btn btn-outline-primary mt-3">Learn More About Bonzy</a>
            </div>
        </div>
    </section>

    <!-- Pricing/Offers Section -->
    <section id="pricing-offers" class="container my-5 py-5"> <!-- Anchor target for links -->
        <h2 class="text-center mb-5">Ready to Achieve PMP® Success? Get Started Today!</h2>
        <div class="row justify-content-center">
            <!-- Offer 1: Study Guide -->
            <div class="col-md-5 mb-4">
                <div class="card shadow-sm border-primary h-100">
                    <div class="card-header bg-primary text-white text-center">
                        <h4 class="my-0 fw-normal">Complete Study Guide (PDF)</h4>
                    </div>
                    <div class="card-body text-center d-flex flex-column">
                        <p class="card-text mt-2">Your comprehensive, 700+ page ECO-aligned text resource. Includes examples, activities, mindset focus, and practice questions. Perfect for self-paced study.</p>
                        <h3 class="card-title pricing-card-title my-3">$99.99 <small class="text-muted fw-light">USD</small></h3>
                        <!-- *** IMPORTANT: Replace # with actual purchase link/product ID *** -->
                        <a href="#" class="btn btn-primary mt-auto w-100">
                            <i class="fas fa-book-reader me-1"></i> Get the Guide Now
                        </a>
                    </div>
                </div>
            </div>
            <!-- Offer 2: Study Group + Guide -->
            <div class="col-md-5 mb-4">
                 <div class="card shadow-sm border-success h-100"> <!-- Highlighted offer -->
                     <div class="card-header bg-success text-white text-center">
                         <h4 class="my-0 fw-normal">Study Guide + Community</h4>
                         <span class="badge bg-light text-success position-absolute top-0 end-0 mt-2 me-2">Recommended</span>
                     </div>
                    <div class="card-body text-center d-flex flex-column">
                         <!-- *** IMPORTANT: Update details and price *** -->
                        <p class="card-text mt-2">Includes the Complete Study Guide (PDF) PLUS access to our supportive weekly study group for accountability, discussion, and shared resources.</p>
                        <h3 class="card-title pricing-card-title my-3">$149.99 <small class="text-muted fw-light">USD</small></h3> <!-- Example Price -->
                         <!-- *** IMPORTANT: Replace # with actual enrollment/purchase link *** -->
                        <a href="#" class="btn btn-success mt-auto w-100"> <!-- Highlighted button -->
                            <i class="fas fa-users me-1"></i> Join the Group & Get Guide
                        </a>
                    </div>
                </div>
            </div>
             <!-- Optional: Add separate Full Course card if it exists beyond Guide + Group -->
        </div>
    </section>

    <!-- Study Group Details Section -->
     <section id="study-group" class="container my-5 py-5 bg-light rounded"> <!-- Anchor target for button -->
        <h2 class="text-center mb-4">Join the PMP® Prep Study Group</h2>
        <div class="row justify-content-center">
            <div class="col-md-8 text-center">
                <p class="lead">Don't study alone! Our supportive community helps you stay motivated and accountable.</p>
                 <ul class="list-unstyled text-start d-inline-block mb-4">
                     <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Weekly focus topics aligned with the guide.</li>
                     <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Shared resources and study templates.</li>
                     <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Live group discussions and Q&A.</li>
                     <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Accountability partners and peer support.</li>
                 </ul>
                 <p>Access included with the "Study Guide + Community" package, or contact us for group-only options.</p>
                 <a href="<?php echo esc_url( home_url('/contact/') ); // Link to contact page ?>" class="btn btn-outline-primary mt-3">Contact Us About the Study Group</a>
            </div>
        </div>
    </section>


    <!-- Lead Magnet Section -->
    <section id="free-sample" class="container my-5 py-5 border-top"> <!-- Added border-top for separation -->
        <h2 class="text-center mb-4">Get a FREE Sample Chapter!</h2>
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="text-center">
                    <p>Not sure yet? Download a free chapter covering **"Mastering the PMP® Mindset for Situational Questions"** and see the quality and ECO-focus for yourself.</p>
                     <!-- *** IMPORTANT: Update form action to your actual processing URL *** -->
                    <form action="#" method="POST">
                        <div class="mb-3">
                            <label for="sample-email" class="form-label visually-hidden">Email address</label>
                            <input type="email" class="form-control form-control-lg" id="sample-email" name="email" placeholder="Enter your email address" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="fas fa-download me-1"></i> Download Free Chapter
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>

</main><!-- #main -->

<?php get_footer(); // Loads the footer.php template. ?>