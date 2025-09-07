<?php

/**
 * Template Name: Student Dashboard
 * Description: PMP Student Learning Dashboard with progress tracking
 */

// Ensure user is logged in
if (!is_user_logged_in()) {
    wp_redirect(wp_login_url(get_permalink()));
    exit;
}

get_header();

// Get current user information
$current_user = wp_get_current_user();
$user_id = $current_user->ID;
$user_name = $current_user->display_name;

// Initialize dashboard class if it exists
if (class_exists('PMP_Dashboard')) {
    $dashboard = new PMP_Dashboard($user_id);
    $progress_stats = $dashboard->get_progress_stats();
    $next_lesson = $dashboard->get_next_lesson();
    $recent_activity = $dashboard->get_recent_activity();
} else {
    // Fallback data for development
    $progress_stats = [
        'percentage' => 45.5,
        'completed' => 41,
        'total' => 91,
        'current_week' => 7
    ];
    $next_lesson = (object) [
        'title' => 'Risk Management Fundamentals',
        'description' => 'Learn the core concepts of project risk management and identification techniques.',
        'thumbnail' => get_template_directory_uri() . '/images/lesson-placeholder.jpg',
        'duration' => '22 minutes',
        'url' => '#'
    ];
    $recent_activity = [
        ['title' => 'Completed: Stakeholder Engagement', 'timestamp' => '2 hours ago'],
        ['title' => 'Started: Quality Management', 'timestamp' => '1 day ago'],
        ['title' => 'Completed: Communication Planning', 'timestamp' => '2 days ago']
    ];
}
?>

<div class="wrapper" id="page-wrapper">
    <div class="container-fluid" id="content" tabindex="-1">
        <div class="row">
            <!-- Main Dashboard Content -->
            <main class="col-12">
                <?php
                // Display breadcrumb navigation
                if ( class_exists( 'PMP_Navigation_Manager' ) ) {
                    $nav_manager = new PMP_Navigation_Manager();
                    $nav_manager->display_breadcrumbs();
                }
                ?>
                
                <!-- Welcome Section -->
                <section class="dashboard-welcome py-4">
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h1 class="display-5 fw-bold text-primary mb-2">
                                    Welcome back, <?php echo esc_html($user_name); ?>!
                                </h1>
                                <p class="lead text-muted mb-0">
                                    Continue your PMP certification journey. You're making great progress!
                                </p>
                            </div>
                            <div class="col-md-4 text-md-end">
                                <div class="dashboard-stats-quick">
                                    <span class="badge bg-success fs-6 px-3 py-2">
                                        Week <?php echo esc_html($progress_stats['current_week']); ?> of 13
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Dashboard Grid -->
                <section class="dashboard-content py-4">
                    <div class="container">
                        <div class="row g-4">
                            <!-- Progress Overview Card -->
                            <div class="col-lg-4 col-md-6">
                                <div class="card h-100 border-0 shadow-sm">
                                    <div class="card-body text-center p-4">
                                        <h5 class="card-title text-primary mb-4">Your Progress</h5>

                                        <!-- Circular Progress Indicator -->
                                        <div class="progress-circle-container mb-4" id="progress-circle">
                                            <svg class="progress-circle" width="120" height="120" viewBox="0 0 120 120">
                                                <circle cx="60" cy="60" r="50" fill="none" stroke="#e9ecef" stroke-width="8" />
                                                <circle cx="60" cy="60" r="50" fill="none" stroke="#5b28b3" stroke-width="8"
                                                    stroke-linecap="round" stroke-dasharray="314.16"
                                                    stroke-dashoffset="<?php echo 314.16 - (314.16 * $progress_stats['percentage'] / 100); ?>"
                                                    class="progress-bar-circle" />
                                                <text x="60" y="65" text-anchor="middle" class="progress-text"
                                                    font-size="18" font-weight="bold" fill="#5b28b3">
                                                    <?php echo number_format($progress_stats['percentage'], 1); ?>%
                                                </text>
                                            </svg>
                                        </div>

                                        <!-- Progress Stats -->
                                        <div class="progress-stats">
                                            <div class="row text-center">
                                                <div class="col-6">
                                                    <div class="stat-item">
                                                        <h6 class="stat-number text-success mb-1">
                                                            <?php echo esc_html($progress_stats['completed']); ?>
                                                        </h6>
                                                        <small class="text-muted">Completed</small>
                                                    </div>
                                                </div>
                                                <div class="col-6">
                                                    <div class="stat-item">
                                                        <h6 class="stat-number text-primary mb-1">
                                                            <?php echo esc_html($progress_stats['total'] - $progress_stats['completed']); ?>
                                                        </h6>
                                                        <small class="text-muted">Remaining</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Continue Learning Card -->
                            <div class="col-lg-8 col-md-6">
                                <div class="card h-100 border-0 shadow-sm">
                                    <div class="card-body p-4">
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <h5 class="card-title text-primary mb-0">Continue Learning</h5>
                                            <span class="badge bg-light text-dark">Next Lesson</span>
                                        </div>

                                        <div class="row align-items-center">
                                            <div class="col-md-3">
                                                <div class="lesson-thumbnail position-relative">
                                                    <img src="<?php echo esc_url($next_lesson->thumbnail); ?>"
                                                        alt="<?php echo esc_attr($next_lesson->title); ?>"
                                                        class="img-fluid rounded">
                                                    <?php if (!empty($next_lesson->duration)): ?>
                                                        <div class="duration-badge position-absolute bottom-0 end-0 bg-dark text-white px-2 py-1 rounded-start">
                                                            <small><?php echo esc_html($next_lesson->duration); ?></small>
                                                        </div>
                                                    <?php endif; ?>
                                                    <?php if (isset($next_lesson->difficulty)): ?>
                                                        <div class="difficulty-badge position-absolute top-0 start-0 bg-primary text-white px-2 py-1 rounded-end">
                                                            <small><?php echo esc_html($next_lesson->difficulty); ?></small>
                                                        </div>
                                                    <?php endif; ?>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="lesson-meta mb-2">
                                                    <span class="badge bg-light text-dark me-2">
                                                        Week <?php echo esc_html($next_lesson->week); ?>
                                                    </span>
                                                    <span class="badge bg-secondary">
                                                        <?php echo esc_html($next_lesson->module); ?>
                                                    </span>
                                                </div>
                                                <h6 class="lesson-title mb-2">
                                                    <?php echo esc_html($next_lesson->title); ?>
                                                </h6>
                                                <p class="lesson-description text-muted mb-2">
                                                    <?php echo esc_html($next_lesson->description); ?>
                                                </p>
                                                <?php if (isset($next_lesson->recommendation_reason)): ?>
                                                    <div class="recommendation-reason">
                                                        <small class="text-primary">
                                                            <i class="fas fa-lightbulb me-1"></i>
                                                            <?php echo esc_html($next_lesson->recommendation_reason); ?>
                                                        </small>
                                                    </div>
                                                <?php endif; ?>
                                                <div class="lesson-stats mt-2">
                                                    <small class="text-muted me-3">
                                                        <i class="fas fa-clock me-1"></i>
                                                        <?php echo esc_html($next_lesson->estimated_time ?? $next_lesson->duration); ?>
                                                    </small>
                                                    <?php if (isset($next_lesson->completion_rate)): ?>
                                                        <small class="text-muted">
                                                            <i class="fas fa-users me-1"></i>
                                                            <?php echo number_format($next_lesson->completion_rate, 1); ?>% completion rate
                                                        </small>
                                                    <?php endif; ?>
                                                </div>
                                            </div>
                                            <div class="col-md-3 text-md-end">
                                                <?php if ($next_lesson->id === 'completed'): ?>
                                                    <a href="<?php echo esc_url($next_lesson->url); ?>"
                                                        class="btn btn-success btn-lg">
                                                        <i class="fas fa-graduation-cap me-2"></i>
                                                        Exam Prep
                                                    </a>
                                                <?php else: ?>
                                                    <a href="<?php echo esc_url($next_lesson->url); ?>"
                                                        class="btn btn-primary btn-lg continue-learning-btn"
                                                        data-lesson-id="<?php echo esc_attr($next_lesson->id); ?>">
                                                        Continue
                                                        <i class="fas fa-arrow-right ms-2"></i>
                                                    </a>
                                                    <div class="mt-2">
                                                        <small class="text-muted">
                                                            Estimated: <?php echo esc_html($next_lesson->estimated_time ?? 20); ?> min
                                                        </small>
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Recent Activity Card -->
                            <div class="col-lg-6">
                                <div class="card h-100 border-0 shadow-sm">
                                    <div class="card-body p-4">
                                        <h5 class="card-title text-primary mb-4">Recent Activity</h5>

                                        <div class="activity-timeline">
                                            <?php if (!empty($recent_activity)): ?>
                                                <?php foreach ($recent_activity as $activity): ?>
                                                    <div class="activity-item d-flex align-items-start mb-3"
                                                        data-activity-type="<?php echo esc_attr($activity['type'] ?? 'default'); ?>">
                                                        <div class="activity-icon me-3">
                                                            <div class="bg-<?php echo esc_attr($activity['color'] ?? 'primary'); ?> rounded-circle d-flex align-items-center justify-content-center"
                                                                style="width: 32px; height: 32px;">
                                                                <i class="<?php echo esc_attr($activity['icon'] ?? 'fas fa-check'); ?> text-white" style="font-size: 12px;"></i>
                                                            </div>
                                                        </div>
                                                        <div class="activity-content flex-grow-1">
                                                            <?php if (!empty($activity['url']) && $activity['url'] !== '#'): ?>
                                                                <a href="<?php echo esc_url($activity['url']); ?>" class="activity-link text-decoration-none">
                                                                    <p class="activity-title mb-1">
                                                                        <?php echo esc_html($activity['title']); ?>
                                                                    </p>
                                                                </a>
                                                            <?php else: ?>
                                                                <p class="activity-title mb-1">
                                                                    <?php echo esc_html($activity['title']); ?>
                                                                </p>
                                                            <?php endif; ?>
                                                            <small class="text-muted">
                                                                <?php echo esc_html($activity['formatted_time'] ?? $activity['timestamp']); ?>
                                                            </small>
                                                        </div>
                                                        <?php if (!empty($activity['url']) && $activity['url'] !== '#'): ?>
                                                            <div class="activity-action">
                                                                <a href="<?php echo esc_url($activity['url']); ?>"
                                                                    class="btn btn-sm btn-outline-secondary">
                                                                    <i class="fas fa-arrow-right"></i>
                                                                </a>
                                                            </div>
                                                        <?php endif; ?>
                                                    </div>
                                                <?php endforeach; ?>
                                            <?php else: ?>
                                                <div class="no-activity text-center py-4">
                                                    <i class="fas fa-clock text-muted mb-2" style="font-size: 2rem;"></i>
                                                    <p class="text-muted mb-0">No recent activity to display.</p>
                                                    <small class="text-muted">Start learning to see your progress here!</small>
                                                </div>
                                            <?php endif; ?>
                                        </div>

                                        <div class="text-center mt-4">
                                            <a href="#" class="btn btn-outline-primary btn-sm">
                                                View All Activity
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Quick Actions Card -->
                            <div class="col-lg-6">
                                <div class="card h-100 border-0 shadow-sm">
                                    <div class="card-body p-4">
                                        <h5 class="card-title text-primary mb-4">Quick Actions</h5>

                                        <div class="row g-3">
                                            <div class="col-6">
                                                <a href="#" class="btn btn-outline-primary w-100 py-3">
                                                    <i class="fas fa-book-open d-block mb-2"></i>
                                                    <small>Study Guide</small>
                                                </a>
                                            </div>
                                            <div class="col-6">
                                                <a href="#" class="btn btn-outline-success w-100 py-3">
                                                    <i class="fas fa-question-circle d-block mb-2"></i>
                                                    <small>Practice Quiz</small>
                                                </a>
                                            </div>
                                            <div class="col-6">
                                                <a href="#" class="btn btn-outline-info w-100 py-3">
                                                    <i class="fas fa-download d-block mb-2"></i>
                                                    <small>Resources</small>
                                                </a>
                                            </div>
                                            <div class="col-6">
                                                <a href="#" class="btn btn-outline-warning w-100 py-3">
                                                    <i class="fas fa-calendar d-block mb-2"></i>
                                                    <small>Schedule</small>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div><!-- .row -->
    </div><!-- #content -->
</div><!-- #page-wrapper -->

<?php
get_footer();
?>