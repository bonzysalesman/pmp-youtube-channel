<?php
/**
 * The template for displaying single course posts
 * 
 * This template creates an enhanced course overview page with hero section,
 * course statistics, and module listings as specified in requirements 2.1-2.6
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header();

$container = get_theme_mod( 'understrap_container_type', 'container' );

// Get course data
$course_id = get_the_ID();
$course_title = get_the_title();
$course_description = get_the_excerpt();
$course_content = get_the_content();
$featured_image = get_the_post_thumbnail_url($course_id, 'large');

// Course statistics (these would typically come from custom fields or calculated values)
$total_modules = 13;
$total_lessons = 91;
$total_hours = '40+';
$course_level = get_post_meta($course_id, 'course_level', true) ?: 'Intermediate';
$course_duration = get_post_meta($course_id, 'course_duration', true) ?: '13 weeks';

// Initialize navigation class for course modules
$navigation = new PMP_Course_Navigation(get_current_user_id(), 'pmp-prep-course');
$course_modules = $navigation->get_course_modules();
?>

<div class="wrapper" id="single-course-wrapper">

    <!-- Breadcrumb Navigation -->
    <div class="breadcrumb-container bg-light py-3">
        <div class="<?php echo esc_attr( $container ); ?>">
            <?php
            // Display breadcrumb navigation using the navigation manager
            if ( class_exists( 'PMP_Navigation_Manager' ) ) {
                $nav_manager = new PMP_Navigation_Manager();
                $nav_manager->display_breadcrumbs();
            }
            ?>
        </div>
    </div>

    <!-- Hero Section -->
    <section class="course-hero py-5" style="background: linear-gradient(135deg, #5b28b3 0%, #7c3aed 100%);">
        <div class="<?php echo esc_attr( $container ); ?>">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <div class="hero-content text-white">
                        <h1 class="hero-title display-4 fw-bold mb-3">
                            <?php echo esc_html($course_title); ?>
                        </h1>
                        
                        <?php if ($course_description): ?>
                            <p class="hero-description lead mb-4">
                                <?php echo esc_html($course_description); ?>
                            </p>
                        <?php endif; ?>
                        
                        <!-- Course Statistics -->
                        <div class="course-stats row g-3 mb-4">
                            <div class="col-6 col-md-3">
                                <div class="stat-item d-flex align-items-center">
                                    <div class="stat-icon me-3">
                                        <i class="fas fa-calendar-alt fa-2x text-warning"></i>
                                    </div>
                                    <div class="stat-content">
                                        <div class="stat-number fw-bold fs-4"><?php echo esc_html($total_modules); ?></div>
                                        <div class="stat-label small">Modules</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-6 col-md-3">
                                <div class="stat-item d-flex align-items-center">
                                    <div class="stat-icon me-3">
                                        <i class="fas fa-play-circle fa-2x text-success"></i>
                                    </div>
                                    <div class="stat-content">
                                        <div class="stat-number fw-bold fs-4"><?php echo esc_html($total_lessons); ?></div>
                                        <div class="stat-label small">Lessons</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-6 col-md-3">
                                <div class="stat-item d-flex align-items-center">
                                    <div class="stat-icon me-3">
                                        <i class="fas fa-clock fa-2x text-info"></i>
                                    </div>
                                    <div class="stat-content">
                                        <div class="stat-number fw-bold fs-4"><?php echo esc_html($total_hours); ?></div>
                                        <div class="stat-label small">Hours</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-6 col-md-3">
                                <div class="stat-item d-flex align-items-center">
                                    <div class="stat-icon me-3">
                                        <i class="fas fa-signal fa-2x text-danger"></i>
                                    </div>
                                    <div class="stat-content">
                                        <div class="stat-number fw-bold fs-5"><?php echo esc_html($course_level); ?></div>
                                        <div class="stat-label small">Level</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Start Course Button -->
                        <div class="hero-actions">
                            <a href="<?php echo esc_url(home_url('/lesson/lesson-01-01/')); ?>" 
                               class="btn btn-warning btn-lg px-4 py-3 fw-bold">
                                <i class="fas fa-play me-2"></i>Start the Course
                            </a>
                            <span class="ms-3 small opacity-75">
                                <i class="fas fa-users me-1"></i>Join 1,000+ students
                            </span>
                        </div>
                    </div>
                </div>
                
                <?php if ($featured_image): ?>
                    <div class="col-lg-4">
                        <div class="hero-image text-center">
                            <img src="<?php echo esc_url($featured_image); ?>" 
                                 alt="<?php echo esc_attr($course_title); ?>" 
                                 class="img-fluid rounded shadow-lg"
                                 style="max-height: 400px; object-fit: cover;">
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Course Content -->
    <div class="<?php echo esc_attr( $container ); ?>" id="content" tabindex="-1">
        <div class="row">
            <div class="col-12">
                <main class="site-main" id="main">
                    
                    <!-- Course Overview Content -->
                    <?php if ($course_content): ?>
                        <section class="course-overview py-5">
                            <div class="row">
                                <div class="col-lg-8">
                                    <h2 class="section-title mb-4">Course Overview</h2>
                                    <div class="course-content">
                                        <?php echo wp_kses_post($course_content); ?>
                                    </div>
                                </div>
                                <div class="col-lg-4">
                                    <div class="course-info-sidebar">
                                        <div class="card border-0 shadow-sm">
                                            <div class="card-body">
                                                <h5 class="card-title">Course Details</h5>
                                                <ul class="list-unstyled">
                                                    <li class="mb-2">
                                                        <i class="fas fa-calendar text-primary me-2"></i>
                                                        <strong>Duration:</strong> <?php echo esc_html($course_duration); ?>
                                                    </li>
                                                    <li class="mb-2">
                                                        <i class="fas fa-signal text-primary me-2"></i>
                                                        <strong>Level:</strong> <?php echo esc_html($course_level); ?>
                                                    </li>
                                                    <li class="mb-2">
                                                        <i class="fas fa-certificate text-primary me-2"></i>
                                                        <strong>Certificate:</strong> PMP Preparation
                                                    </li>
                                                    <li class="mb-2">
                                                        <i class="fas fa-language text-primary me-2"></i>
                                                        <strong>Language:</strong> English
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    <?php endif; ?>

                    <!-- Course Modules Section -->
                    <section class="course-modules py-5 bg-light">
                        <div class="row">
                            <div class="col-12">
                                <h2 class="section-title text-center mb-5">Course Modules</h2>
                                <p class="text-center text-muted mb-5">
                                    Complete 13 weeks of structured learning with <?php echo esc_html($total_lessons); ?> lessons
                                </p>
                                
                                <!-- Module Listings -->
                                <div class="modules-container">
                                    <?php foreach ($course_modules as $module): ?>
                                        <div class="module-card mb-4">
                                            <div class="card border-0 shadow-sm">
                                                <div class="card-body p-4">
                                                    <div class="row align-items-center">
                                                        <div class="col-lg-8">
                                                            <div class="module-header mb-3">
                                                                <div class="d-flex align-items-center mb-2">
                                                                    <span class="module-week-badge me-3">
                                                                        Week <?php echo esc_html($module['week_number']); ?>
                                                                    </span>
                                                                    <span class="domain-badge domain-<?php echo esc_attr($module['domain_focus']); ?>">
                                                                        <?php echo esc_html(ucfirst($module['domain_focus'])); ?> Domain
                                                                    </span>
                                                                </div>
                                                                <h3 class="module-title mb-2">
                                                                    <?php echo esc_html($module['title']); ?>
                                                                </h3>
                                                                <p class="module-description text-muted mb-3">
                                                                    <?php echo esc_html($module['description']); ?>
                                                                </p>
                                                                <div class="module-meta d-flex align-items-center gap-3">
                                                                    <span class="meta-item">
                                                                        <i class="fas fa-play-circle text-primary me-1"></i>
                                                                        <?php echo esc_html($module['total_lessons']); ?> lessons
                                                                    </span>
                                                                    <span class="meta-item">
                                                                        <i class="fas fa-clock text-primary me-1"></i>
                                                                        <?php echo esc_html($module['estimated_duration']); ?>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            <!-- Lesson Cards -->
                                                            <div class="lessons-preview">
                                                                <h5 class="lessons-title mb-3">Lessons in this module:</h5>
                                                                <div class="row g-3">
                                                                    <?php foreach (array_slice($module['lessons'], 0, 3) as $lesson): ?>
                                                                        <div class="col-md-4">
                                                                            <div class="lesson-card">
                                                                                <div class="lesson-thumbnail">
                                                                                    <?php if (!empty($lesson['video_url'])): ?>
                                                                                        <img src="https://img.youtube.com/vi/<?php echo esc_attr(substr($lesson['video_url'], -11)); ?>/mqdefault.jpg" 
                                                                                             alt="<?php echo esc_attr($lesson['title']); ?>" 
                                                                                             class="img-fluid rounded">
                                                                                    <?php else: ?>
                                                                                        <div class="placeholder-thumbnail d-flex align-items-center justify-content-center rounded">
                                                                                            <i class="fas fa-play-circle fa-3x text-primary opacity-50"></i>
                                                                                        </div>
                                                                                    <?php endif; ?>
                                                                                    <div class="duration-overlay">
                                                                                        <?php echo esc_html($lesson['duration']); ?>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="lesson-info mt-2">
                                                                                    <h6 class="lesson-title mb-1">
                                                                                        <?php echo esc_html($lesson['title']); ?>
                                                                                    </h6>
                                                                                    <p class="lesson-description small text-muted mb-2">
                                                                                        <?php echo esc_html($lesson['description']); ?>
                                                                                    </p>
                                                                                    <?php if (!empty($lesson['eco_references'])): ?>
                                                                                        <div class="eco-tags">
                                                                                            <?php foreach ($lesson['eco_references'] as $eco_ref): ?>
                                                                                                <span class="eco-tag"><?php echo esc_html($eco_ref); ?></span>
                                                                                            <?php endforeach; ?>
                                                                                        </div>
                                                                                    <?php endif; ?>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    <?php endforeach; ?>
                                                                    
                                                                    <?php if (count($module['lessons']) > 3): ?>
                                                                        <div class="col-md-4">
                                                                            <div class="lesson-card more-lessons-card d-flex align-items-center justify-content-center">
                                                                                <div class="text-center">
                                                                                    <i class="fas fa-plus-circle fa-2x text-primary mb-2"></i>
                                                                                    <p class="mb-0 small text-muted">
                                                                                        +<?php echo count($module['lessons']) - 3; ?> more lessons
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    <?php endif; ?>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div class="col-lg-4">
                                                            <div class="module-actions text-lg-end">
                                                                <div class="module-progress-info mb-3">
                                                                    <?php 
                                                                    $module_progress = $navigation->get_module_progress($module['id']);
                                                                    if ($module_progress['percentage'] > 0): 
                                                                    ?>
                                                                        <div class="progress mb-2" style="height: 8px;">
                                                                            <div class="progress-bar bg-success" 
                                                                                 role="progressbar" 
                                                                                 style="width: <?php echo esc_attr($module_progress['percentage']); ?>%"
                                                                                 aria-valuenow="<?php echo esc_attr($module_progress['percentage']); ?>" 
                                                                                 aria-valuemin="0" 
                                                                                 aria-valuemax="100">
                                                                            </div>
                                                                        </div>
                                                                        <small class="text-muted">
                                                                            <?php echo esc_html($module_progress['completed']); ?> of <?php echo esc_html($module_progress['total']); ?> lessons completed
                                                                        </small>
                                                                    <?php else: ?>
                                                                        <small class="text-muted">Not started</small>
                                                                    <?php endif; ?>
                                                                </div>
                                                                
                                                                <div class="module-buttons">
                                                                    <?php if ($module['week_number'] == 1): ?>
                                                                        <a href="<?php echo esc_url(home_url('/lesson/' . $module['lessons'][0]['id'] . '/')); ?>" 
                                                                           class="btn btn-primary btn-lg mb-2 w-100">
                                                                            <i class="fas fa-play me-2"></i>Start Module
                                                                        </a>
                                                                    <?php else: ?>
                                                                        <a href="<?php echo esc_url(home_url('/lesson/' . $module['lessons'][0]['id'] . '/')); ?>" 
                                                                           class="btn btn-outline-primary btn-lg mb-2 w-100">
                                                                            <i class="fas fa-eye me-2"></i>View Module
                                                                        </a>
                                                                    <?php endif; ?>
                                                                    
                                                                    <button class="btn btn-outline-secondary w-100" 
                                                                            type="button" 
                                                                            data-bs-toggle="collapse" 
                                                                            data-bs-target="#module-<?php echo esc_attr($module['id']); ?>-details" 
                                                                            aria-expanded="false">
                                                                        <i class="fas fa-list me-2"></i>View All Lessons
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- Collapsible Full Lesson List -->
                                                    <div class="collapse mt-4" id="module-<?php echo esc_attr($module['id']); ?>-details">
                                                        <div class="border-top pt-4">
                                                            <h5 class="mb-3">All Lessons in Week <?php echo esc_html($module['week_number']); ?></h5>
                                                            <div class="row g-2">
                                                                <?php foreach ($module['lessons'] as $index => $lesson): ?>
                                                                    <div class="col-md-6">
                                                                        <div class="lesson-list-item d-flex align-items-center p-2 rounded">
                                                                            <div class="lesson-number me-3">
                                                                                <?php echo esc_html($index + 1); ?>
                                                                            </div>
                                                                            <div class="lesson-info flex-grow-1">
                                                                                <h6 class="mb-0"><?php echo esc_html($lesson['title']); ?></h6>
                                                                                <small class="text-muted"><?php echo esc_html($lesson['duration']); ?></small>
                                                                            </div>
                                                                            <a href="<?php echo esc_url(home_url('/lesson/' . $lesson['id'] . '/')); ?>" 
                                                                               class="btn btn-sm btn-outline-primary">
                                                                                <i class="fas fa-play"></i>
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                <?php endforeach; ?>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                    </section>

                </main><!-- #main -->
            </div>
        </div><!-- .row -->
    </div><!-- #content -->

</div><!-- #single-course-wrapper -->

<?php get_footer(); ?>