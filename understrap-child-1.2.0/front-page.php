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
    <section id="hero" class="container-fluid vh-100 d-flex align-items-center justify-content-center p-0 position-relative" style="background-image: url('<?php echo get_stylesheet_directory_uri(); ?>/images/hero-bg.jpeg'); background-position: center; background-size: cover; background-repeat: no-repeat;">
        <!-- Whitish semi-transparent overlay -->
        <div class="position-absolute top-0 start-0 w-100 h-100" style="background-color: rgba(245, 245, 250, 0.90);"></div>
        
        <div class="container position-relative z-index-1 text-center py-5 reveal-on-scroll">
            <div class="row justify-content-center">
                <div class="col-lg-10 col-xl-8">
                    <div class="hero-pre-title">PASS YOUR PMP® EXAM THE FIRST TIME:</div>
                    <h1 class="hero-main-title mb-4">PRACTICAL, ECO-FOCUSED PREP</h1>
                    
                    <p class="lead mx-auto mb-5" style="color: var(--secondary); opacity: 0.8; max-width: 650px;">
                        Stop wasting time and money. Get the clear, structured guidance you need, based <strong>directly</strong> on the official PMP® Exam Content Outline (ECO). <strong>700+ page study system</strong> designed by a fellow PMP® candidate.
                    </p>
                    
                    <div class="d-grid gap-3 d-sm-flex justify-content-sm-center mb-5">
                        <a href="#pricing-offers" class="btn btn-lg btn-primary px-5 py-3 fw-bold shadow-sm" style="background-color: var(--cta);">Start Your Journey</a>
                        <a href="#structured-path" class="btn btn-lg btn-outline-primary px-5 py-3 fw-bold">Learn More</a>
                    </div>
                    
                    <!-- Trust Badges -->
                    <div class="d-flex flex-wrap justify-content-center gap-4 text-muted small fw-bold mt-4" style="color: var(--secondary); opacity: 0.7;">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-users me-2" style="color: var(--primary);"></i>
                            <span>1,000+ Students</span>
                        </div>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-star me-2" style="color: var(--gold);"></i>
                            <span>4.9/5 Rating</span>
                        </div>
                        <div class="d-flex align-items-center">
                            <i class="fas fa-check-circle me-2" style="color: var(--primary);"></i>
                            <span>ECO Aligned</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Instructor Section (Elevated) -->
    <section id="author" class="container my-5 pt-5 pb-5 reveal-on-scroll">
        <h2 class="text-center mb-5 fw-bold text-uppercase" style="color: var(--secondary); opacity: 0.6; letter-spacing: 2px;">Meet Your Instructor</h2>
        <div class="row align-items-center">
            <div class="col-lg-7 order-lg-1 pe-lg-5">
                <h3 class="fw-bold mb-1" style="color: var(--primary); font-size: 1.5rem;">BONANG "BONZY" SALEMANE, PMP® CANDIDATE</h3>
                <p class="mb-4" style="color: var(--primary-dark); font-size: 1.05rem;">Postgraduate Diploma in Project Management</p>
                
                <p style="color: var(--secondary); opacity: 0.8; line-height: 1.7;">With over 8 years of hands-on experience leading complex projects across IT infrastructure, financial services, and organizational development, Bonzy brings real-world expertise to PMP® exam preparation. As a current PMP® candidate who has navigated the preparation journey firsthand, he understands exactly what it takes to succeed.</p>
                
                <div class="quote-block my-4">
                    <p class="mb-0" style="color: var(--secondary); opacity: 0.6; line-height: 1.6;">"My goal is simple: to provide you with the most focused, practical, and confidence-building resource possible to conquer the PMP® exam and become a more effective project leader. Your success is my priority."</p>
                </div>
                
                <p class="mb-3 fw-bold" style="color: var(--primary);">Why This Instructor?</p>
                <ul class="list-unstyled">
                    <li class="mb-2" style="color: var(--secondary); opacity: 0.8;"><span class="instructor-check">✓</span> <strong>Real-World Experience:</strong> 8+ years managing complex, multi-stakeholder projects</li>
                    <li class="mb-2" style="color: var(--secondary); opacity: 0.8;"><span class="instructor-check">✓</span> <strong>Academic Foundation:</strong> Postgraduate qualification in Project Management</li>
                    <li class="mb-2" style="color: var(--secondary); opacity: 0.8;"><span class="instructor-check">✓</span> <strong>Practical Perspective:</strong> Deep understanding of both traditional and Agile/Hybrid methodologies</li>
                    <li class="mb-2" style="color: var(--secondary); opacity: 0.8;"><span class="instructor-check">✓</span> <strong>Candidate Experience:</strong> Currently navigating the PMP® journey alongside you</li>
                    <li class="mb-2" style="color: var(--secondary); opacity: 0.8;"><span class="instructor-check">✓</span> <strong>Proven Results:</strong> Built comprehensive 700+ page study system from the ground up</li>
                </ul>
            </div>
            <div class="col-lg-5 order-lg-2 text-center mt-5 mt-lg-0">
                <div class="d-inline-block p-1" style="background-color: transparent;">
                    <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/bonzy-instructor.jpg" alt="Photo of Bonang Bonzy Salemane" class="img-fluid instructor-portrait" style="max-width: 400px;">
                </div>
            </div>
        </div>
    </section>

    <!-- Why Choose Section -->
    <section id="why-choose" class="container my-5 py-5 text-center">
        <h2 class="text-uppercase mb-4 fw-bold" style="color: var(--primary); letter-spacing: 2px;">Why Choose Our PMP Prep?</h2>
        <p class="mb-5 mx-auto" style="color: var(--secondary); opacity: 0.8; font-weight: 500; font-size: 1.1rem; max-width: 800px;">Our comprehensive approach combines the latest ECO guidelines with practical, real-world application.</p>
        <div class="row g-4 justify-content-center stagger-reveal">
            <div class="col-md-3">
                <div class="card h-100 p-4 border-0">
                    <i class="fas fa-file-alt fa-2x mb-4" style="color: var(--gold);"></i>
                    <h5 class="fw-bold mb-3" style="color: var(--secondary); font-size: 1.1rem;">ECO-Aligned Content</h5>
                    <p class="small mb-0" style="color: var(--secondary); opacity: 0.7; line-height: 1.6;">Every lesson directly maps to the official PMP Exam Content Outline for focused, relevant study.</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card h-100 p-4 border-0">
                    <i class="fas fa-chart-line fa-2x mb-4" style="color: var(--gold);"></i>
                    <h5 class="fw-bold mb-3" style="color: var(--secondary); font-size: 1.1rem;">Progress Tracking</h5>
                    <p class="small mb-0" style="color: var(--secondary); opacity: 0.7; line-height: 1.6;">Monitor your learning journey with detailed analytics and personalized study recommendations.</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card h-100 p-4 border-0">
                    <i class="fas fa-mobile-alt fa-2x mb-4" style="color: var(--gold);"></i>
                    <h5 class="fw-bold mb-3" style="color: var(--secondary); font-size: 1.1rem;">Mobile Learning</h5>
                    <p class="small mb-0" style="color: var(--secondary); opacity: 0.7; line-height: 1.6;">Study anywhere with our responsive design and offline-capable progressive web app.</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card h-100 p-4 border-0">
                    <i class="fas fa-calendar-check fa-2x mb-4" style="color: var(--gold);"></i>
                    <h5 class="fw-bold mb-3" style="color: var(--secondary); font-size: 1.1rem;">13-Week Study Plan</h5>
                    <p class="small mb-0" style="color: var(--secondary); opacity: 0.7; line-height: 1.6;">Structured 13-week study plan with daily goals and milestone tracking.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Course Overview Block -->
    <section id="course-overview" class="container-fluid py-5 my-5 reveal-on-scroll" style="background-color: var(--primary-dark);">
        <div class="container py-4">
            <div class="row align-items-center">
                <!-- Left Content -->
                <div class="col-lg-6 text-white pe-lg-5 mb-5 mb-lg-0">
                    <h2 class="fw-bold mb-3" style="letter-spacing: 1px; font-size: 2rem; color: #d1d5db;">PMP CERTIFICATION PREPARATION COURSE</h2>
                    <p class="mb-5" style="font-size: 1.1rem; line-height: 1.6; opacity: 0.9; color: #e0e0e0;">Complete 87-lesson PMP certification preparation course covering all exam domains with ECO-aligned content.</p>
                    
                    <!-- Stats Row -->
                    <div class="row text-center mb-5 g-3 stagger-reveal">
                        <div class="col-6 col-md-3">
                            <h3 class="fw-bold mb-1" style="font-size: 1.6rem; color: #d1d5db;">51</h3>
                            <p class="small text-uppercase mb-0" style="opacity: 0.8; letter-spacing: 1px;">Hours</p>
                        </div>
                        <div class="col-6 col-md-3 border-start border-light border-opacity-25 border-end-sm-0 border-end">
                            <h3 class="fw-bold mb-1" style="font-size: 1.6rem; color: #d1d5db;">13</h3>
                            <p class="small text-uppercase mb-0" style="opacity: 0.8; letter-spacing: 1px;">Quizzes</p>
                        </div>
                        <div class="col-6 col-md-3">
                            <h3 class="fw-bold mb-1" style="font-size: 1.6rem; color: #d1d5db;">4.9</h3>
                            <p class="small text-uppercase mb-0" style="opacity: 0.8; letter-spacing: 1px;">Rating</p>
                        </div>
                        <div class="col-6 col-md-3 border-start border-light border-opacity-25">
                            <h3 class="fw-bold mb-1" style="font-size: 1.6rem; color: #d1d5db;">1,200+</h3>
                            <p class="small text-uppercase mb-0" style="opacity: 0.8; letter-spacing: 1px;">Students</p>
                        </div>
                    </div>

                    <!-- CTA Buttons -->
                    <div class="d-flex flex-wrap gap-3">
                        <a href="#pricing-offers" class="btn fw-bold px-4 py-2" style="background-color: var(--white); color: var(--primary-dark); border-radius: var(--radius-btn);">Start Course</a>
                        <a href="#" class="btn btn-outline-light fw-bold px-4 py-2" style="border-radius: 4px;">Download Syllabus</a>
                    </div>
                </div>
                
                <!-- Right Image/Video Placeholder -->
                <div class="col-lg-6">
                    <div class="position-relative d-inline-block w-100" style="border-radius: 12px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.2);">
                        <!-- Reusing the hero image as requested -->
                        <img src="<?php echo get_stylesheet_directory_uri(); ?>/images/hero-bg.jpeg" alt="Course Preview Video" class="img-fluid w-100" style="object-fit: cover; aspect-ratio: 16/9;">
                        <!-- Play Button Overlay -->
                        <div class="position-absolute top-50 start-50 translate-middle">
                            <button class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center position-relative" style="width: 70px; height: 70px; background-color: rgba(90, 46, 166, 0.9); border: 2px solid white; box-shadow: 0 0 0 10px rgba(255,255,255,0.2);">
                                <i class="fas fa-play fa-lg ms-1 text-white"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Curriculum Grid Section -->
    <section id="curriculum" class="curriculum-section reveal-on-scroll">
        <div class="container">
            <h2 class="text-center text-uppercase mb-4 fw-bold" style="color: var(--primary); letter-spacing: 2px;">Complete 13-Week Study Plan</h2>
            <!-- Phase Switcher Navigation -->
            <div class="phase-switcher-nav reveal-on-scroll">
                <button class="phase-trigger active" data-phase="1">Milestone 1: The Team Foundation</button>
                <button class="phase-trigger" data-phase="2">Milestone 2: Operational Excellence</button>
                <button class="phase-trigger" data-phase="3">Milestone 3: The Mastery Finish Line</button>
            </div>

            <!-- Curriculum Phase Grid -->
            <div class="row g-4 mb-5 justify-content-center stagger-reveal">
                <!-- Column 1 -->
                <div class="col-md-6 col-lg-4 d-flex curriculum-column" data-phase="1">
                    <div class="curriculum-card w-100">
                        <div class="curriculum-phase-1 p-4 text-white text-center rounded-top" style="background-color: var(--primary);">
                            <h5 class="fw-bold mb-1" style="font-size: 1.25rem;">Milestone 1: The Team Foundation</h5>
                            <p class="small mb-0" style="opacity: 0.9;">Weeks 1-4</p>
                        </div>
                        <div class="p-4 bg-white rounded-bottom border border-top-0 border-light shadow-sm h-100 pb-5">
                            <ul class="list-unstyled curriculum-list mb-0" style="color: #4B5563;">
                                <li class="py-3 border-bottom">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week1-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 1:</strong> 
            <span class="flex-grow-1">Introduction & Foundations</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week1-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 1: PMP & Course Overview</li>
                                        <li>Day 2: Resources & ECO</li>
                                        <li>Day 3: PMP Mindset (Part 1)</li>
                                        <li>Day 4: PMP Mindset (Part 2)</li>
                                        <li>Day 5: Foundations Review</li>
                                    </ul>
    </div>
</li>
                                <li class="py-3 border-bottom">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week2-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 2:</strong> 
            <span class="flex-grow-1">Building A Team (Part 1)</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week2-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 8: Build A Team</li>
                                        <li>Day 9: Define Team Ground Rules</li>
                                        <li>Day 10: Negotiate Agreements</li>
                                        <li>Day 11: Empower Team Members</li>
                                        <li>Day 12: Review & Practice</li>
                                    </ul>
    </div>
</li>
                                <li class="py-3 border-bottom">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week3-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 3:</strong> 
            <span class="flex-grow-1">Building A Team (Part 2)</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week3-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 15: Ensure Team Trained</li>
                                        <li>Day 16: Virtual Teams</li>
                                        <li>Day 17: Shared Understanding</li>
                                        <li>Day 18: Review & Practice</li>
                                        <li>Day 19: Practice Test</li>
                                    </ul>
    </div>
</li>
                                <li class="py-3">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week4-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 4:</strong> 
            <span class="flex-grow-1">Starting the Project</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week4-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 22: Determine Methodology</li>
                                        <li>Day 23: Plan & Manage Scope</li>
                                        <li>Day 24-25: Budget/Resources</li>
                                        <li>Day 26: Review & Practice</li>
                                    </ul>
    </div>
</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!-- Column 2 -->
                <div class="col-md-6 col-lg-4 d-flex curriculum-column" data-phase="2">
                    <div class="curriculum-card w-100">
                        <div class="curriculum-phase-2 p-4 text-white text-center rounded-top" style="background-color: var(--primary-dark);">
                            <h5 class="fw-bold mb-1" style="font-size: 1.25rem;">Milestone 2: Operational Excellence</h5>
                            <p class="small mb-0" style="opacity: 0.9;">Weeks 5-8</p>
                        </div>
                        <div class="p-4 bg-white rounded-bottom border border-top-0 border-light shadow-sm h-100 pb-5">
                            <ul class="list-unstyled curriculum-list mb-0" style="color: #4B5563;">
                                <li class="py-3 border-bottom">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week5-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 5:</strong> 
            <span class="flex-grow-1">Starting the Project (P. 2)</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week5-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 29: Plan & Manage Schedule</li>
                                        <li>Day 30: Plan & Manage Quality</li>
                                        <li>Day 31: Integrate Planning</li>
                                        <li>Day 32: Plan Procurement</li>
                                        <li>Day 33: Governance & Closure</li>
                                    </ul>
    </div>
</li>
                                <li class="py-3 border-bottom">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week6-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 6:</strong> 
            <span class="flex-grow-1">Doing the Work (Part 1)</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week6-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 36: Assess & Manage Risks</li>
                                        <li>Day 37: Execute for Value</li>
                                        <li>Day 38: Manage Communications</li>
                                        <li>Day 39: Engage Stakeholders</li>
                                        <li>Day 40: Review & Practice</li>
                                    </ul>
    </div>
</li>
                                <li class="py-3 border-bottom">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week7-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 7:</strong> 
            <span class="flex-grow-1">Doing the Work (Part 2)</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week7-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 43: Manage Artifacts</li>
                                        <li>Day 44: Manage Changes</li>
                                        <li>Day 45: Manage Issues</li>
                                        <li>Day 46: Knowledge Transfer</li>
                                        <li>Day 47: Review & Practice</li>
                                    </ul>
    </div>
</li>
                                <li class="py-3">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week8-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 8:</strong> 
            <span class="flex-grow-1">Mid-Point Assessment</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week8-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 50: WG 3 Review</li>
                                        <li>Day 51: WG 3 Practice Test</li>
                                        <li>Day 52: Test Review</li>
                                        <li>Day 53: Mid-Point Review</li>
                                        <li>Day 54: Mid-Point Practice</li>
                                    </ul>
    </div>
</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!-- Column 3 -->
                <div class="col-md-6 col-lg-4 d-flex curriculum-column" data-phase="3">
                    <div class="curriculum-card w-100">
                        <div class="curriculum-phase-3 p-4 text-white text-center rounded-top" style="background-color: var(--gold);">
                            <h5 class="fw-bold mb-1" style="font-size: 1.25rem;">Milestone 3: The Mastery Finish Line</h5>
                            <p class="small mb-0" style="opacity: 0.9;">Weeks 9-13</p>
                        </div>
                        <div class="p-4 bg-white rounded-bottom border border-top-0 border-light shadow-sm h-100 pb-5">
                            <ul class="list-unstyled curriculum-list mb-0" style="color: #4B5563;">
                                <li class="py-3 border-bottom">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week9-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 9:</strong> 
            <span class="flex-grow-1">Keeping on Track (Part 1)</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week9-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 57: Lead A Team</li>
                                        <li>Day 58: Support Performance</li>
                                        <li>Day 59: Remove Impediments</li>
                                        <li>Day 60: Manage Conflict</li>
                                        <li>Day 61: Review & Practice</li>
                                    </ul>
    </div>
</li>
                                <li class="py-3 border-bottom">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week10-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 10:</strong> 
            <span class="flex-grow-1">Keeping on Track (Part 2)</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week10-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 64: Collaborate with Stakeholders</li>
                                        <li>Day 65: Mentor Stakeholders</li>
                                        <li>Day 66: Performance Through EQ</li>
                                        <li>Day 67: Review & Practice</li>
                                        <li>Day 68: Practice Test</li>
                                    </ul>
    </div>
</li>
                                <li class="py-3 border-bottom">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week11-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 11:</strong> 
            <span class="flex-grow-1">Business Environment</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week11-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 71: Plan & Manage Compliance</li>
                                        <li>Day 72: Evaluate Benefits/Value</li>
                                        <li>Day 73: Evaluate External Changes</li>
                                        <li>Day 74: Support Org Change</li>
                                        <li>Day 75: Review & Practice Test</li>
                                    </ul>
    </div>
</li>
                                <li class="py-3 border-bottom">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week12-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 12:</strong> 
            <span class="flex-grow-1">Final Review & Practice</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week12-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 78: Full Practice Exam #1</li>
                                        <li>Day 79: Detailed Review</li>
                                        <li>Day 80: Targeted Review</li>
                                        <li>Day 81: Full Practice Exam #2</li>
                                        <li>Day 82: Final Polish</li>
                                    </ul>
    </div>
</li>
                                <li class="py-3">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#week13-details" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">Week 13:</strong> 
            <span class="flex-grow-1">Exam Week Logistics</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="week13-details">
        <ul class="daily-breakdown-list mt-2">
                                        <li>Day 85: Light Review & Logistics</li>
                                        <li>Day 86: Exam Day</li>
                                        <li>Day 87: Post-Exam Celebration!</li>
                                    </ul>
    </div>
</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Study Schedule Footer -->
            <div class="study-schedule-footer">
                <h5 class="text-center fw-bold mb-4" style="margin-top: 60px;">Weekly Study Schedule (7-10 hours)</h5>
                <div class="row g-4 text-center">
                    <div class="col-md-3">
                        <div class="schedule-icon mx-auto" style="background-color: var(--primary);">M-F</div>
                        <h6 class="fw-bold">Monday-Friday</h6>
                        <p class="small text-muted">1-2 hours daily study sessions</p>
                    </div>
                    <div class="col-md-3">
                        <div class="schedule-icon mx-auto" style="background-color: var(--cta);">Sat</div>
                        <h6 class="fw-bold">Saturday</h6>
                        <p class="small text-muted">2-3 hour review and practice session</p>
                    </div>
                    <div class="col-md-3">
                        <div class="schedule-icon mx-auto" style="background-color: var(--success);">Sun</div>
                        <h6 class="fw-bold">Sunday</h6>
                        <p class="small text-muted">Rest or light review</p>
                    </div>
                    <div class="col-md-3">
                        <div class="schedule-icon mx-auto" style="background-color: var(--gold);">87</div>
                        <h6 class="fw-bold">Total Lessons</h6>
                        <p class="small text-muted">Complete ECO coverage</p>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <!-- Target Audience Section -->
    <section id="is-this-right" class="container my-5 py-5 reveal-on-scroll">
        <h2 class="text-center fw-bold text-uppercase mb-5">Is This Course Right For You?</h2>
        <div class="table-responsive">
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th class="feature-col">Feature</th>
                        <th class="text-center">Self-Study Guide</th>
                        <th class="text-center">Guide + Community</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="feature-col">ECO-Aligned Content</td>
                        <td class="text-center"><i class="fas fa-check-circle check-icon"></i></td>
                        <td class="text-center"><i class="fas fa-check-circle check-icon"></i></td>
                    </tr>
                    <tr>
                        <td class="feature-col">PMP® Mindset Focus</td>
                        <td class="text-center"><i class="fas fa-check-circle check-icon"></i></td>
                        <td class="text-center"><i class="fas fa-check-circle check-icon"></i></td>
                    </tr>
                    <tr>
                        <td class="feature-col">Weekly Group Calls</td>
                        <td class="text-center"><i class="fas fa-times-circle cross-icon"></i></td>
                        <td class="text-center"><i class="fas fa-check-circle check-icon"></i></td>
                    </tr>
                    <tr>
                        <td class="feature-col">Accountability Partner</td>
                        <td class="text-center"><i class="fas fa-times-circle cross-icon"></i></td>
                        <td class="text-center"><i class="fas fa-check-circle check-icon"></i></td>
                    </tr>
                    <tr>
                        <td class="feature-col">Q&A with Instructor</td>
                        <td class="text-center"><i class="fas fa-times-circle cross-icon"></i></td>
                        <td class="text-center"><i class="fas fa-check-circle check-icon"></i></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- Value Comparison Section -->
    <section id="value-comparison" class="bg-light py-5">
        <div class="container my-5">
            <div class="row align-items-center g-5">
                <div class="col-lg-6">
                    <h2 class="fw-bold text-uppercase mb-4">The PMP Mastery Framework vs. Generic Courses</h2>
                    <p class="mb-4">Most PMP® prep courses are overwhelming, expensive, and filled with "filler" content. We've stripped away the noise to give you exactly what you need to pass.</p>
                    <ul class="list-unstyled mb-0">
                        <li class="mb-3 d-flex align-items-top">
                            <i class="fas fa-plus-circle text-primary me-3 mt-1"></i>
                            <div>
                                <strong>Focused on the ECO:</strong> We don't just teach project management; we teach you how to pass the PMP® exam based on the actual exam outline.
                            </div>
                        </li>
                        <li class="mb-3 d-flex align-items-top">
                            <i class="fas fa-plus-circle text-primary me-3 mt-1"></i>
                            <div>
                                <strong>Practical Mindset:</strong> Learn the "situational thinking" required for the 180 questions, not just rote memorization.
                            </div>
                        </li>
                        <li class="mb-3 d-flex align-items-top">
                            <i class="fas fa-plus-circle text-primary me-3 mt-1"></i>
                            <div>
                                <strong>Affordable Excellence:</strong> Get premium-quality prep at a fraction of the cost of traditional bootcamps.
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="col-lg-6">
                    <div class="card value-card">
                        <div class="value-card-header">
                            <h3 class="fw-bold mb-0">Unbeatable Value</h3>
                            <p class="mb-0 opacity-75">Save Thousands in Prep Costs</p>
                        </div>
                        <div class="card-body p-4 p-md-5">
                            <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                                <span>Traditional Bootcamp</span>
                                <span class="text-muted text-decoration-line-through font-monospace">$2,500+</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                                <span>Standard Study Books</span>
                                <span class="text-muted text-decoration-line-through font-monospace">$150+</span>
                            </div>
                            <div class="d-flex justify-content-between mb-4">
                                <span class="fw-bold">PMP Mastery System</span>
                                <span class="text-primary fw-bold font-monospace">$99+</span>
                            </div>
                            <a href="#pricing-offers" class="btn btn-primary w-100 btn-lg shadow">Get the System Now</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing/Offers Section -->
    <section id="pricing-offers" class="container my-5 py-5 reveal-on-scroll"> <!-- Anchor target for links -->
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