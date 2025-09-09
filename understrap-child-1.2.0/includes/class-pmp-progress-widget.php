<?php
/**
 * PMP Progress Display Widget
 * 
 * WordPress widget for displaying course progress in the sidebar
 * Integrates with PMP_Progress_Tracker for real-time progress data
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class PMP_Progress_Widget extends WP_Widget {
    
    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct(
            'pmp_progress_widget',
            __('PMP Course Progress', 'understrap-child'),
            array(
                'description' => __('Displays user course progress with detailed statistics and domain breakdown', 'understrap-child'),
                'classname' => 'pmp-progress-widget'
            )
        );
    }
    
    /**
     * Widget output
     * 
     * @param array $args Widget arguments
     * @param array $instance Widget instance settings
     */
    public function widget($args, $instance) {
        // Only show for logged-in users
        if (!is_user_logged_in()) {
            return;
        }
        
        $user_id = get_current_user_id();
        $title = !empty($instance['title']) ? $instance['title'] : __('Course Progress', 'understrap-child');
        $show_domain_breakdown = !empty($instance['show_domain_breakdown']);
        $show_weekly_progress = !empty($instance['show_weekly_progress']);
        $show_statistics = !empty($instance['show_statistics']);
        
        // Get progress data
        if (class_exists('PMP_Progress_Tracker')) {
            $progress_tracker = new PMP_Progress_Tracker($user_id);
            $overall_progress = $progress_tracker->get_overall_progress();
            $domain_progress = $show_domain_breakdown ? $progress_tracker->get_domain_progress() : array();
            $weekly_progress = $show_weekly_progress ? $progress_tracker->get_weekly_progress() : array();
            $analytics = $show_statistics ? $progress_tracker->get_performance_analytics() : array();
        } else {
            // Fallback if progress tracker not available
            $overall_progress = array(
                'percentage' => 0,
                'completed_lessons' => 0,
                'total_lessons' => 91,
                'current_week' => 1,
                'study_time_minutes' => 0
            );
            $domain_progress = array();
            $weekly_progress = array();
            $analytics = array();
        }
        
        echo $args['before_widget'];
        
        if ($title) {
            echo $args['before_title'] . apply_filters('widget_title', $title) . $args['after_title'];
        }
        
        ?>
        <div class="pmp-progress-widget-content">
            
            <!-- Overall Progress Circle -->
            <div class="progress-overview mb-4">
                <div class="progress-circle-container text-center">
                    <?php echo $this->render_progress_circle($overall_progress['percentage']); ?>
                </div>
                
                <div class="progress-stats mt-3">
                    <div class="row text-center">
                        <div class="col-6">
                            <div class="stat-item">
                                <div class="stat-number h5 mb-1 text-success">
                                    <?php echo esc_html($overall_progress['completed_lessons']); ?>
                                </div>
                                <small class="text-muted">Completed</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="stat-item">
                                <div class="stat-number h5 mb-1 text-primary">
                                    <?php echo esc_html($overall_progress['total_lessons'] - $overall_progress['completed_lessons']); ?>
                                </div>
                                <small class="text-muted">Remaining</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Current Week Indicator -->
                <div class="current-week-indicator mt-3 text-center">
                    <span class="badge bg-primary px-3 py-2">
                        <i class="fas fa-calendar-week me-1"></i>
                        Week <?php echo esc_html($overall_progress['current_week']); ?>
                    </span>
                </div>
            </div>
            
            <?php if ($show_statistics && !empty($analytics)): ?>
            <!-- Performance Statistics -->
            <div class="performance-stats mb-4">
                <h6 class="widget-subtitle mb-3">
                    <i class="fas fa-chart-line me-2"></i>
                    Performance Stats
                </h6>
                
                <div class="stats-grid">
                    <?php if (isset($analytics['study_streak_days'])): ?>
                    <div class="stat-row d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">
                            <i class="fas fa-fire text-warning me-1"></i>
                            Study Streak
                        </span>
                        <span class="stat-value fw-bold">
                            <?php echo esc_html($analytics['study_streak_days']); ?> days
                        </span>
                    </div>
                    <?php endif; ?>
                    
                    <?php if (isset($analytics['total_study_time']) && $analytics['total_study_time'] > 0): ?>
                    <div class="stat-row d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">
                            <i class="fas fa-clock text-info me-1"></i>
                            Study Time
                        </span>
                        <span class="stat-value fw-bold">
                            <?php echo esc_html(round($analytics['total_study_time'] / 60, 1)); ?>h
                        </span>
                    </div>
                    <?php endif; ?>
                    
                    <?php if (isset($analytics['average_quiz_score']) && $analytics['average_quiz_score'] > 0): ?>
                    <div class="stat-row d-flex justify-content-between align-items-center mb-2">
                        <span class="stat-label">
                            <i class="fas fa-star text-warning me-1"></i>
                            Avg. Score
                        </span>
                        <span class="stat-value fw-bold">
                            <?php echo esc_html(round($analytics['average_quiz_score'], 1)); ?>%
                        </span>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
            <?php endif; ?>
            
            <?php if ($show_domain_breakdown && !empty($domain_progress)): ?>
            <!-- Domain Progress Breakdown -->
            <div class="domain-progress mb-4">
                <h6 class="widget-subtitle mb-3">
                    <i class="fas fa-layer-group me-2"></i>
                    Domain Progress
                </h6>
                
                <div class="domain-list">
                    <?php foreach ($domain_progress as $domain_key => $domain): ?>
                    <div class="domain-item mb-3">
                        <div class="domain-header d-flex justify-content-between align-items-center mb-1">
                            <span class="domain-name small fw-bold" style="color: <?php echo esc_attr($domain['color']); ?>">
                                <?php echo esc_html($domain['name']); ?>
                            </span>
                            <span class="domain-percentage small text-muted">
                                <?php echo esc_html(round($domain['progress_percentage'], 1)); ?>%
                            </span>
                        </div>
                        
                        <div class="progress mb-1" style="height: 6px;">
                            <div class="progress-bar" 
                                 role="progressbar" 
                                 style="width: <?php echo esc_attr($domain['progress_percentage']); ?>%; background-color: <?php echo esc_attr($domain['color']); ?>"
                                 aria-valuenow="<?php echo esc_attr($domain['progress_percentage']); ?>" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                            </div>
                        </div>
                        
                        <div class="domain-stats small text-muted">
                            <?php echo esc_html($domain['completed']); ?> of <?php echo esc_html($domain['total']); ?> lessons
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>
            
            <?php if ($show_weekly_progress && !empty($weekly_progress)): ?>
            <!-- Weekly Progress Grid -->
            <div class="weekly-progress mb-4">
                <h6 class="widget-subtitle mb-3">
                    <i class="fas fa-calendar-alt me-2"></i>
                    Weekly Progress
                </h6>
                
                <div class="weeks-grid">
                    <?php 
                    $current_week = $overall_progress['current_week'];
                    foreach ($weekly_progress as $week_key => $week): 
                        $week_number = $week['week_number'];
                        $is_current = $week['is_current'];
                        $is_completed = $week['percentage'] >= 100;
                        $is_future = $week_number > $current_week;
                    ?>
                    <div class="week-indicator-item d-flex align-items-center mb-2 <?php echo $is_current ? 'current-week' : ''; ?>">
                        <div class="week-circle me-2 <?php echo $is_completed ? 'completed' : ($is_current ? 'current' : ($is_future ? 'future' : 'in-progress')); ?>">
                            <?php if ($is_completed): ?>
                                <i class="fas fa-check"></i>
                            <?php else: ?>
                                <?php echo esc_html($week_number); ?>
                            <?php endif; ?>
                        </div>
                        
                        <div class="week-info flex-grow-1">
                            <div class="week-label small">
                                Week <?php echo esc_html($week_number); ?>
                                <?php if ($is_current): ?>
                                    <span class="badge bg-primary ms-1" style="font-size: 0.6em;">Current</span>
                                <?php endif; ?>
                            </div>
                            
                            <?php if (!$is_future): ?>
                            <div class="week-progress-bar">
                                <div class="progress" style="height: 3px;">
                                    <div class="progress-bar bg-success" 
                                         role="progressbar" 
                                         style="width: <?php echo esc_attr($week['percentage']); ?>%"
                                         aria-valuenow="<?php echo esc_attr($week['percentage']); ?>" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100">
                                    </div>
                                </div>
                            </div>
                            <?php endif; ?>
                        </div>
                        
                        <div class="week-stats small text-muted">
                            <?php if (!$is_future): ?>
                                <?php echo esc_html($week['completed']); ?>/<?php echo esc_html($week['total']); ?>
                            <?php else: ?>
                                <i class="fas fa-lock"></i>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>
            
            <!-- Action Buttons -->
            <div class="progress-actions">
                <div class="d-grid gap-2">
                    <a href="<?php echo esc_url(home_url('/dashboard/')); ?>" 
                       class="btn btn-primary btn-sm">
                        <i class="fas fa-tachometer-alt me-1"></i>
                        View Dashboard
                    </a>
                    
                    <?php if (isset($overall_progress['current_week'])): ?>
                    <a href="<?php echo esc_url(home_url('/lesson/lesson-' . sprintf('%02d', $overall_progress['current_week']) . '-01/')); ?>" 
                       class="btn btn-outline-primary btn-sm">
                        <i class="fas fa-play me-1"></i>
                        Continue Learning
                    </a>
                    <?php endif; ?>
                </div>
            </div>
            
        </div>
        
        <!-- Widget JavaScript for real-time updates -->
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Auto-refresh progress data every 30 seconds
            setInterval(function() {
                if (typeof pmpAjax !== 'undefined') {
                    $.post(pmpAjax.ajaxurl, {
                        action: 'get_detailed_progress',
                        nonce: pmpAjax.nonce
                    }, function(response) {
                        if (response.success && response.data.overall) {
                            // Update progress percentage
                            $('.pmp-progress-widget .progress-text').text(response.data.overall.percentage.toFixed(1) + '%');
                            
                            // Update completed lessons count
                            $('.pmp-progress-widget .stat-number').first().text(response.data.overall.completed_lessons);
                            
                            // Update remaining lessons count
                            $('.pmp-progress-widget .stat-number').last().text(response.data.overall.total_lessons - response.data.overall.completed_lessons);
                        }
                    });
                }
            }, 30000);
        });
        </script>
        
        <?php
        
        echo $args['after_widget'];
    }
    
    /**
     * Render progress circle SVG
     * 
     * @param float $percentage Progress percentage
     * @return string SVG HTML
     */
    private function render_progress_circle($percentage) {
        $circumference = 188.5; // 2 * π * 30 (radius)
        $offset = $circumference - ($circumference * $percentage / 100);
        
        ob_start();
        ?>
        <div class="progress-circle-widget">
            <svg class="progress-circle" width="80" height="80" viewBox="0 0 80 80">
                <defs>
                    <linearGradient id="progressGradientWidget" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#5b28b3;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
                    </linearGradient>
                </defs>
                
                <!-- Background circle -->
                <circle cx="40" cy="40" r="30" fill="none" stroke="#e9ecef" stroke-width="6" opacity="0.3"/>
                
                <!-- Progress circle -->
                <circle cx="40" cy="40" r="30" fill="none" stroke="url(#progressGradientWidget)" stroke-width="6"
                        stroke-linecap="round" stroke-dasharray="<?php echo $circumference; ?>" 
                        stroke-dashoffset="<?php echo $offset; ?>"
                        class="progress-bar-circle" />
                
                <!-- Progress percentage text -->
                <text x="40" y="42" text-anchor="middle" class="progress-text" 
                      font-size="12" font-weight="bold" fill="#5b28b3">
                    <?php echo number_format($percentage, 1); ?>%
                </text>
                
                <!-- "Complete" label -->
                <text x="40" y="52" text-anchor="middle" class="progress-subtext" 
                      font-size="7" fill="#6b7280" font-weight="500">
                    Complete
                </text>
            </svg>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Widget form in admin
     * 
     * @param array $instance Widget instance settings
     */
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : __('Course Progress', 'understrap-child');
        $show_domain_breakdown = !empty($instance['show_domain_breakdown']);
        $show_weekly_progress = !empty($instance['show_weekly_progress']);
        $show_statistics = !empty($instance['show_statistics']);
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>"><?php _e('Title:', 'understrap-child'); ?></label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text" 
                   value="<?php echo esc_attr($title); ?>">
        </p>
        
        <p>
            <input class="checkbox" type="checkbox" <?php checked($show_domain_breakdown); ?> 
                   id="<?php echo esc_attr($this->get_field_id('show_domain_breakdown')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('show_domain_breakdown')); ?>" />
            <label for="<?php echo esc_attr($this->get_field_id('show_domain_breakdown')); ?>">
                <?php _e('Show Domain Breakdown', 'understrap-child'); ?>
            </label>
        </p>
        
        <p>
            <input class="checkbox" type="checkbox" <?php checked($show_weekly_progress); ?> 
                   id="<?php echo esc_attr($this->get_field_id('show_weekly_progress')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('show_weekly_progress')); ?>" />
            <label for="<?php echo esc_attr($this->get_field_id('show_weekly_progress')); ?>">
                <?php _e('Show Weekly Progress', 'understrap-child'); ?>
            </label>
        </p>
        
        <p>
            <input class="checkbox" type="checkbox" <?php checked($show_statistics); ?> 
                   id="<?php echo esc_attr($this->get_field_id('show_statistics')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('show_statistics')); ?>" />
            <label for="<?php echo esc_attr($this->get_field_id('show_statistics')); ?>">
                <?php _e('Show Performance Statistics', 'understrap-child'); ?>
            </label>
        </p>
        <?php
    }
    
    /**
     * Update widget settings
     * 
     * @param array $new_instance New settings
     * @param array $old_instance Old settings
     * @return array Updated settings
     */
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? sanitize_text_field($new_instance['title']) : '';
        $instance['show_domain_breakdown'] = !empty($new_instance['show_domain_breakdown']);
        $instance['show_weekly_progress'] = !empty($new_instance['show_weekly_progress']);
        $instance['show_statistics'] = !empty($new_instance['show_statistics']);
        
        return $instance;
    }
}

/**
 * Register the widget
 */
function register_pmp_progress_widget() {
    register_widget('PMP_Progress_Widget');
}
add_action('widgets_init', 'register_pmp_progress_widget');