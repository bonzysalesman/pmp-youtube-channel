<?php
/**
 * Template Name: Course Navigation Demo
 * 
 * Demonstrates the course progression navigation functionality
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header();
?>

<div class="wrapper" id="course-navigation-demo-wrapper">
    <div class="<?php echo esc_attr( get_theme_mod( 'understrap_container_type', 'container' ) ); ?>" id="content" tabindex="-1">
        <div class="row">
            <div class="col-md-12">
                
                <header class="page-header mb-4">
                    <h1 class="page-title">Course Progression Navigation Demo</h1>
                    <p class="lead">This page demonstrates the course progression navigation system for the PMP certification course.</p>
                </header>
                
                <!-- Demo Section 1: Basic Navigation -->
                <section class="demo-section mb-5">
                    <h2>Basic Lesson Navigation</h2>
                    <p>This shows the navigation for Week 1, Day 1 (first lesson):</p>
                    
                    <?php echo do_shortcode( '[pmp_lesson_navigation lesson_id="1" show_progress="true" show_domain_info="true"]' ); ?>
                </section>
                
                <!-- Demo Section 2: Mid-Course Navigation -->
                <section class="demo-section mb-5">
                    <h2>Mid-Course Navigation</h2>
                    <p>This shows the navigation for Week 5, Day 1 (Process domain start):</p>
                    
                    <?php echo do_shortcode( '[pmp_lesson_navigation lesson_id="29" show_progress="true" show_domain_info="true"]' ); ?>
                </section>
                
                <!-- Demo Section 3: Compact Navigation -->
                <section class="demo-section mb-5">
                    <h2>Compact Navigation</h2>
                    <p>This shows a compact version suitable for sidebars or smaller spaces:</p>
                    
                    <?php echo do_shortcode( '[pmp_lesson_navigation lesson_id="15" show_progress="false" show_domain_info="false" compact="true"]' ); ?>
                </section>
                
                <!-- Demo Section 4: Course Progress Widget -->
                <section class="demo-section mb-5">
                    <h2>Course Progress Widget</h2>
                    <p>This shows the overall course progress (requires login to see actual progress):</p>
                    
                    <div class="row">
                        <div class="col-md-8">
                            <?php echo do_shortcode( '[pmp_course_progress show_details="true" show_by_domain="true"]' ); ?>
                        </div>
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Navigation Features</h5>
                                </div>
                                <div class="card-body">
                                    <ul class="list-unstyled">
                                        <li class="mb-2">
                                            <i class="fas fa-check text-success me-2"></i>
                                            Previous/Next lesson navigation
                                        </li>
                                        <li class="mb-2">
                                            <i class="fas fa-check text-success me-2"></i>
                                            Domain color coding
                                        </li>
                                        <li class="mb-2">
                                            <i class="fas fa-check text-success me-2"></i>
                                            Progress tracking
                                        </li>
                                        <li class="mb-2">
                                            <i class="fas fa-check text-success me-2"></i>
                                            Lesson completion marking
                                        </li>
                                        <li class="mb-2">
                                            <i class="fas fa-check text-success me-2"></i>
                                            Keyboard navigation (arrow keys)
                                        </li>
                                        <li class="mb-2">
                                            <i class="fas fa-check text-success me-2"></i>
                                            Mobile responsive design
                                        </li>
                                        <li class="mb-2">
                                            <i class="fas fa-check text-success me-2"></i>
                                            Accessibility compliant
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Demo Section 5: Course Structure Overview -->
                <section class="demo-section mb-5">
                    <h2>Course Structure Overview</h2>
                    <p>The course progression system manages 91 lessons across 13 weeks:</p>
                    
                    <div class="row">
                        <?php
                        // Get course structure for display
                        $course_structure = PMP_Course_Progression::get_course_structure();
                        $weeks = array();
                        
                        // Group lessons by week
                        foreach ( $course_structure as $lesson ) {
                            $weeks[ $lesson['week'] ][] = $lesson;
                        }
                        
                        // Display first few weeks as examples
                        $display_weeks = array_slice( $weeks, 0, 4, true );
                        
                        foreach ( $display_weeks as $week_num => $week_lessons ) :
                            $domain = $week_lessons[0]['domain'];
                            $domain_colors = array(
                                'foundation' => '#6c757d',
                                'people' => '#28a745',
                                'process' => '#007bff',
                                'business' => '#fd7e14'
                            );
                            $color = $domain_colors[ $domain ] ?? '#6c757d';
                        ?>
                            <div class="col-md-3 mb-3">
                                <div class="card h-100" style="border-left: 4px solid <?php echo esc_attr( $color ); ?>;">
                                    <div class="card-header" style="background-color: <?php echo esc_attr( $color ); ?>10;">
                                        <h6 class="mb-0" style="color: <?php echo esc_attr( $color ); ?>;">
                                            Week <?php echo esc_html( $week_num ); ?>: <?php echo esc_html( ucfirst( $domain ) ); ?>
                                        </h6>
                                    </div>
                                    <div class="card-body">
                                        <small class="text-muted">
                                            <?php echo esc_html( count( $week_lessons ) ); ?> lessons
                                        </small>
                                        <ul class="list-unstyled mt-2 mb-0">
                                            <?php foreach ( array_slice( $week_lessons, 0, 3 ) as $lesson ) : ?>
                                                <li class="mb-1">
                                                    <small>
                                                        Day <?php echo esc_html( $lesson['day'] ); ?>: 
                                                        <?php echo esc_html( wp_trim_words( $lesson['title'], 4 ) ); ?>
                                                    </small>
                                                </li>
                                            <?php endforeach; ?>
                                            <?php if ( count( $week_lessons ) > 3 ) : ?>
                                                <li class="mb-1">
                                                    <small class="text-muted">
                                                        ... and <?php echo esc_html( count( $week_lessons ) - 3 ); ?> more
                                                    </small>
                                                </li>
                                            <?php endif; ?>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    
                    <div class="alert alert-info">
                        <h6><i class="fas fa-info-circle me-2"></i>Total Course Statistics</h6>
                        <div class="row">
                            <div class="col-md-3">
                                <strong><?php echo esc_html( count( $course_structure ) ); ?></strong><br>
                                <small>Total Lessons</small>
                            </div>
                            <div class="col-md-3">
                                <strong>13</strong><br>
                                <small>Weeks</small>
                            </div>
                            <div class="col-md-3">
                                <strong>3</strong><br>
                                <small>Domains</small>
                            </div>
                            <div class="col-md-3">
                                <strong>91</strong><br>
                                <small>Days of Content</small>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Demo Section 6: Keyboard Navigation -->
                <section class="demo-section mb-5">
                    <h2>Keyboard Navigation</h2>
                    <p>The navigation system supports keyboard shortcuts for better accessibility:</p>
                    
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Navigation Shortcuts</h6>
                                    <ul class="list-unstyled">
                                        <li class="mb-2">
                                            <kbd>←</kbd> Previous lesson
                                        </li>
                                        <li class="mb-2">
                                            <kbd>→</kbd> Next lesson
                                        </li>
                                        <li class="mb-2">
                                            <kbd>Space</kbd> Mark lesson complete
                                        </li>
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <h6>Accessibility Features</h6>
                                    <ul class="list-unstyled">
                                        <li class="mb-2">
                                            <i class="fas fa-check text-success me-2"></i>
                                            Screen reader support
                                        </li>
                                        <li class="mb-2">
                                            <i class="fas fa-check text-success me-2"></i>
                                            High contrast mode
                                        </li>
                                        <li class="mb-2">
                                            <i class="fas fa-check text-success me-2"></i>
                                            Reduced motion support
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Demo Section 7: Implementation Notes -->
                <section class="demo-section mb-5">
                    <h2>Implementation Notes</h2>
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Shortcodes Available</h6>
                            <div class="bg-light p-3 rounded">
                                <code>[pmp_lesson_navigation]</code><br>
                                <small class="text-muted">Main navigation component</small><br><br>
                                
                                <code>[pmp_course_progress]</code><br>
                                <small class="text-muted">Progress tracking widget</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6>PHP Classes</h6>
                            <div class="bg-light p-3 rounded">
                                <code>PMP_Course_Progression</code><br>
                                <small class="text-muted">Main progression logic</small><br><br>
                                
                                <code>PMP_Navigation_Manager</code><br>
                                <small class="text-muted">Navigation management</small>
                            </div>
                        </div>
                    </div>
                </section>
                
            </div>
        </div>
    </div>
</div>

<script>
// Demo page enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add demo highlighting
    document.querySelectorAll('.demo-section').forEach(function(section, index) {
        section.style.animationDelay = (index * 0.1) + 's';
        section.classList.add('fade-in');
    });
    
    // Add keyboard navigation demo
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName.toLowerCase() === 'body') {
            switch(e.keyCode) {
                case 37: // Left arrow
                    console.log('Previous lesson navigation triggered');
                    break;
                case 39: // Right arrow
                    console.log('Next lesson navigation triggered');
                    break;
                case 32: // Spacebar
                    console.log('Mark complete action triggered');
                    e.preventDefault();
                    break;
            }
        }
    });
});
</script>

<style>
.demo-section {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

kbd {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    padding: 0.125rem 0.25rem;
    font-size: 0.875em;
}
</style>

<?php
get_footer();
?>