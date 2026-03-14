<?php
/**
 * Single Lesson Template
 * 
 * Template for displaying individual lesson content with course progression navigation
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header();
?>

<div class="wrapper" id="single-lesson-wrapper">
    <div class="<?php echo esc_attr( get_theme_mod( 'understrap_container_type', 'container' ) ); ?>" id="content" tabindex="-1">
        <div class="row">
            
            <?php
            // Get lesson metadata
            global $post;
            $lesson_week = get_post_meta( $post->ID, '_lesson_week_number', true );
            $lesson_day = get_post_meta( $post->ID, '_lesson_day_number', true );
            $lesson_domain = get_post_meta( $post->ID, '_lesson_domain', true );
            $eco_tasks = get_post_meta( $post->ID, '_lesson_eco_tasks', true );
            
            // Determine lesson ID for progression navigation
            $lesson_progression_id = null;
            if ( $lesson_week && $lesson_day ) {
                $lesson_data = PMP_Course_Progression::get_lesson_by_week_day( $lesson_week, $lesson_day );
                $lesson_progression_id = $lesson_data ? $lesson_data['id'] : null;
            }
            ?>
            
            <!-- Main Content Column -->
            <div class="col-md-8" id="primary">
                <main class="site-main" id="main">
                    
                    <?php
                    // Display breadcrumb navigation
                    if ( class_exists( 'PMP_Navigation_Manager' ) ) {
                        $nav_manager = new PMP_Navigation_Manager();
                        $nav_manager->display_breadcrumbs();
                    }
                    ?>
                    
                    <?php while ( have_posts() ) : the_post(); ?>
                        
                        <article <?php post_class(); ?> id="post-<?php the_ID(); ?>">
                            
                            <!-- Lesson Header -->
                            <header class="entry-header lesson-header">
                                <?php if ( $lesson_domain ) : ?>
                                    <div class="lesson-domain-indicator mb-3">
                                        <?php
                                        $domain_colors = array(
                                            'people' => '#28a745',
                                            'process' => '#007bff',
                                            'business' => '#fd7e14',
                                            'foundation' => '#6c757d',
                                            'review' => '#6f42c1',
                                            'final' => '#dc3545'
                                        );
                                        $domain_color = $domain_colors[ $lesson_domain ] ?? '#6c757d';
                                        ?>
                                        <span class="badge" style="background-color: <?php echo esc_attr( $domain_color ); ?>; font-size: 0.875rem;">
                                            <?php echo esc_html( ucfirst( $lesson_domain ) ); ?> Domain
                                        </span>
                                        <?php if ( $lesson_week && $lesson_day ) : ?>
                                            <span class="lesson-position text-muted ms-2">
                                                Week <?php echo esc_html( $lesson_week ); ?>, Day <?php echo esc_html( $lesson_day ); ?>
                                            </span>
                                        <?php endif; ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
                                
                                <?php if ( $eco_tasks && is_array( $eco_tasks ) ) : ?>
                                    <div class="lesson-eco-tasks mb-3">
                                        <h6 class="text-muted mb-2">
                                            <i class="fas fa-tasks me-1"></i>
                                            ECO Tasks Covered:
                                        </h6>
                                        <ul class="list-unstyled">
                                            <?php foreach ( $eco_tasks as $task ) : ?>
                                                <li class="mb-1">
                                                    <i class="fas fa-check-circle text-success me-2"></i>
                                                    <?php echo esc_html( $task ); ?>
                                                </li>
                                            <?php endforeach; ?>
                                        </ul>
                                    </div>
                                <?php endif; ?>
                            </header>
                            
                            <!-- Course Progression Navigation (Top) -->
                            <?php if ( $lesson_progression_id ) : ?>
                                <div class="lesson-navigation-top">
                                    <?php echo do_shortcode( '[pmp_lesson_navigation lesson_id="' . $lesson_progression_id . '" show_progress="true" show_domain_info="false"]' ); ?>
                                </div>
                            <?php endif; ?>
                            
                            <!-- Lesson Content -->
                            <div class="entry-content lesson-content">
                                <?php
                                the_content();
                                
                                wp_link_pages( array(
                                    'before' => '<div class="page-links">' . __( 'Pages:', 'understrap-child' ),
                                    'after'  => '</div>',
                                ) );
                                ?>
                            </div>
                            
                            <!-- Lesson Resources -->
                            <?php
                            $lesson_resources = get_post_meta( $post->ID, '_lesson_resources', true );
                            if ( $lesson_resources && is_array( $lesson_resources ) ) :
                            ?>
                                <div class="lesson-resources mt-4 p-3 bg-light rounded">
                                    <h5 class="mb-3">
                                        <i class="fas fa-folder-open me-2"></i>
                                        Lesson Resources
                                    </h5>
                                    <div class="row">
                                        <?php foreach ( $lesson_resources as $resource ) : ?>
                                            <div class="col-md-6 mb-2">
                                                <a href="<?php echo esc_url( $resource['url'] ); ?>" 
                                                   class="d-flex align-items-center text-decoration-none"
                                                   target="_blank">
                                                    <i class="<?php echo esc_attr( $resource['icon'] ?? 'fas fa-file' ); ?> me-2"></i>
                                                    <?php echo esc_html( $resource['title'] ); ?>
                                                </a>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php endif; ?>
                            
                            <!-- Course Progression Navigation (Bottom) -->
                            <?php if ( $lesson_progression_id ) : ?>
                                <div class="lesson-navigation-bottom mt-4">
                                    <?php echo do_shortcode( '[pmp_lesson_navigation lesson_id="' . $lesson_progression_id . '" show_progress="false" show_domain_info="false"]' ); ?>
                                </div>
                            <?php endif; ?>
                            
                            <!-- Lesson Footer -->
                            <footer class="entry-footer lesson-footer mt-4 pt-3 border-top">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <div class="lesson-meta">
                                            <?php
                                            $estimated_time = get_post_meta( $post->ID, '_lesson_estimated_time', true );
                                            if ( $estimated_time ) :
                                            ?>
                                                <span class="estimated-time text-muted">
                                                    <i class="fas fa-clock me-1"></i>
                                                    Estimated time: <?php echo esc_html( $estimated_time ); ?> minutes
                                                </span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    <div class="col-md-6 text-md-end">
                                        <div class="lesson-actions">
                                            <?php if ( is_user_logged_in() ) : ?>
                                                <button type="button" 
                                                        class="btn btn-success btn-sm" 
                                                        id="mark-lesson-complete"
                                                        data-lesson-id="<?php echo esc_attr( $lesson_progression_id ); ?>">
                                                    <i class="fas fa-check me-1"></i>
                                                    Mark Complete
                                                </button>
                                            <?php else : ?>
                                                <a href="<?php echo esc_url( wp_login_url( get_permalink() ) ); ?>" 
                                                   class="btn btn-primary btn-sm">
                                                    <i class="fas fa-sign-in-alt me-1"></i>
                                                    Login to Track Progress
                                                </a>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                            </footer>
                            
                        </article>
                        
                    <?php endwhile; ?>
                    
                </main>
            </div>
            
            <!-- Sidebar -->
            <div class="col-md-4" id="secondary">
                <aside class="widget-area lesson-sidebar">
                    
                    <!-- Course Progress Widget -->
                    <?php if ( is_user_logged_in() ) : ?>
                        <div class="widget lesson-progress-widget">
                            <?php echo do_shortcode( '[pmp_course_progress show_details="true" show_by_domain="true"]' ); ?>
                        </div>
                    <?php endif; ?>
                    
                    <!-- Week Overview Widget -->
                    <?php if ( $lesson_week ) : ?>
                        <div class="widget week-overview-widget">
                            <h5 class="widget-title">Week <?php echo esc_html( $lesson_week ); ?> Overview</h5>
                            <div class="week-lessons">
                                <?php
                                $week_lessons = PMP_Course_Progression::get_lessons_by_week( $lesson_week );
                                if ( $week_lessons ) :
                                ?>
                                    <ul class="list-unstyled">
                                        <?php foreach ( $week_lessons as $week_lesson ) : ?>
                                            <li class="mb-2">
                                                <a href="<?php echo esc_url( $week_lesson['url'] ); ?>" 
                                                   class="d-flex align-items-center text-decoration-none <?php echo ( $week_lesson['id'] === $lesson_progression_id ) ? 'fw-bold text-primary' : ''; ?>">
                                                    <span class="lesson-day-number me-2 badge bg-secondary">
                                                        <?php echo esc_html( $week_lesson['day'] ); ?>
                                                    </span>
                                                    <span class="lesson-title-short">
                                                        <?php echo esc_html( wp_trim_words( $week_lesson['title'], 6 ) ); ?>
                                                    </span>
                                                </a>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <!-- Domain Resources Widget -->
                    <?php if ( $lesson_domain ) : ?>
                        <div class="widget domain-resources-widget">
                            <h5 class="widget-title">
                                <?php echo esc_html( ucfirst( $lesson_domain ) ); ?> Domain Resources
                            </h5>
                            <div class="domain-resources">
                                <ul class="list-unstyled">
                                    <li class="mb-2">
                                        <a href="/resources/study-guides/<?php echo esc_attr( $lesson_domain ); ?>-domain/" 
                                           class="d-flex align-items-center text-decoration-none">
                                            <i class="fas fa-file-pdf me-2"></i>
                                            Study Guide
                                        </a>
                                    </li>
                                    <li class="mb-2">
                                        <a href="/resources/practice-exams/<?php echo esc_attr( $lesson_domain ); ?>-questions/" 
                                           class="d-flex align-items-center text-decoration-none">
                                            <i class="fas fa-question-circle me-2"></i>
                                            Practice Questions
                                        </a>
                                    </li>
                                    <li class="mb-2">
                                        <a href="/resources/templates/<?php echo esc_attr( $lesson_domain ); ?>-templates/" 
                                           class="d-flex align-items-center text-decoration-none">
                                            <i class="fas fa-file-alt me-2"></i>
                                            Templates
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <!-- Standard Sidebar Widgets -->
                    <?php dynamic_sidebar( 'sidebar-1' ); ?>
                    
                </aside>
            </div>
            
        </div>
    </div>
</div>

<?php
get_footer();
?>