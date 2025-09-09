<?php
/**
 * PMP Next Lesson Preview Widget
 * 
 * WordPress widget for displaying the next lesson in the course progression
 * Integrates with PMP_Course_Navigation for lesson data and progress tracking
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class PMP_Next_Lesson_Widget extends WP_Widget {
    
    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct(
            'pmp_next_lesson_widget',
            __('PMP Next Lesson Preview', 'understrap-child'),
            array(
                'description' => __('Displays the next lesson in the course progression with preview information', 'understrap-child'),
                'classname' => 'pmp-next-lesson-widget'
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
        $title = !empty($instance['title']) ? $instance['title'] : __('Next Lesson', 'understrap-child');
        $show_description = !empty($instance['show_description']);
        $show_eco_references = !empty($instance['show_eco_references']);
        $show_duration = !empty($instance['show_duration']);
        $show_domain_info = !empty($instance['show_domain_info']);
        
        // Get next lesson data
        $next_lesson = $this->get_next_lesson($user_id);
        
        if (!$next_lesson) {
            // Show completion message if no next lesson
            echo $args['before_widget'];
            if ($title) {
                echo $args['before_title'] . apply_filters('widget_title', $title) . $args['after_title'];
            }
            ?>
            <div class="pmp-next-lesson-widget-content">
                <div class="completion-message text-center py-4">
                    <div class="completion-icon mb-3">
                        <i class="fas fa-trophy fa-3x text-warning"></i>
                    </div>
                    <h5 class="completion-title mb-2">Congratulations!</h5>
                    <p class="completion-text text-muted mb-3">
                        You've completed all available lessons. Keep up the great work!
                    </p>
                    <a href="<?php echo esc_url(home_url('/dashboard/')); ?>" 
                       class="btn btn-primary btn-sm">
                        <i class="fas fa-tachometer-alt me-1"></i>
                        View Dashboard
                    </a>
                </div>
            </div>
            <?php
            echo $args['after_widget'];
            return;
        }
        
        echo $args['before_widget'];
        
        if ($title) {
            echo $args['before_title'] . apply_filters('widget_title', $title) . $args['after_title'];
        }
        
        ?>
        <div class="pmp-next-lesson-widget-content">
            
            <!-- Next Lesson Card -->
            <div class="next-lesson-card">
                
                <!-- Lesson Header -->
                <div class="lesson-header mb-3">
                    <div class="lesson-number-badge">
                        <span class="lesson-number">
                            <?php echo esc_html($next_lesson->order); ?>
                        </span>
                    </div>
                    
                    <div class="lesson-title-section">
                        <h5 class="lesson-title mb-1">
                            <?php echo esc_html($next_lesson->title); ?>
                        </h5>
                        
                        <div class="lesson-meta">
                            <span class="week-indicator">
                                <i class="fas fa-calendar-week me-1"></i>
                                Week <?php echo esc_html($next_lesson->week_number); ?>
                            </span>
                            
                            <?php if ($show_duration && !empty($next_lesson->duration)): ?>
                            <span class="duration-indicator">
                                <i class="fas fa-clock me-1"></i>
                                <?php echo esc_html($next_lesson->duration); ?>
                            </span>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
                
                <!-- Lesson Description -->
                <?php if ($show_description && !empty($next_lesson->description)): ?>
                <div class="lesson-description mb-3">
                    <p class="description-text text-muted">
                        <?php echo esc_html($next_lesson->description); ?>
                    </p>
                </div>
                <?php endif; ?>
                
                <!-- Domain Information -->
                <?php if ($show_domain_info && !empty($next_lesson->domain_focus)): ?>
                <div class="domain-info mb-3">
                    <div class="domain-badge domain-<?php echo esc_attr($next_lesson->domain_focus); ?>">
                        <i class="fas fa-layer-group me-1"></i>
                        <?php echo esc_html(ucfirst($next_lesson->domain_focus)); ?> Domain
                        <?php if (!empty($next_lesson->domain_percentage)): ?>
                            <span class="domain-weight">(<?php echo esc_html($next_lesson->domain_percentage); ?>%)</span>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- ECO References -->
                <?php if ($show_eco_references && !empty($next_lesson->eco_references)): ?>
                <div class="eco-references mb-3">
                    <div class="eco-header mb-2">
                        <small class="text-muted">
                            <i class="fas fa-bookmark me-1"></i>
                            ECO References:
                        </small>
                    </div>
                    <div class="eco-tags">
                        <?php foreach ($next_lesson->eco_references as $eco_ref): ?>
                            <span class="eco-tag badge bg-light text-dark me-1 mb-1">
                                <?php echo esc_html($eco_ref); ?>
                            </span>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Lesson Preview -->
                <?php if (!empty($next_lesson->video_thumbnail)): ?>
                <div class="lesson-preview mb-3">
                    <div class="video-thumbnail">
                        <img src="<?php echo esc_url($next_lesson->video_thumbnail); ?>" 
                             alt="<?php echo esc_attr($next_lesson->title); ?> preview"
                             class="img-fluid rounded">
                        <div class="play-overlay">
                            <i class="fas fa-play-circle fa-2x"></i>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Learning Objectives -->
                <?php if (!empty($next_lesson->learning_objectives)): ?>
                <div class="learning-objectives mb-3">
                    <h6 class="objectives-title mb-2">
                        <i class="fas fa-bullseye me-1"></i>
                        What You'll Learn:
                    </h6>
                    <ul class="objectives-list">
                        <?php foreach (array_slice($next_lesson->learning_objectives, 0, 3) as $objective): ?>
                            <li class="objective-item">
                                <small><?php echo esc_html($objective); ?></small>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                <?php endif; ?>
                
                <!-- Prerequisites -->
                <?php if (!empty($next_lesson->prerequisites)): ?>
                <div class="prerequisites mb-3">
                    <div class="alert alert-info py-2 px-3">
                        <small>
                            <i class="fas fa-info-circle me-1"></i>
                            <strong>Prerequisites:</strong> <?php echo esc_html(implode(', ', $next_lesson->prerequisites)); ?>
                        </small>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Action Buttons -->
                <div class="lesson-actions">
                    <div class="d-grid gap-2">
                        <a href="<?php echo esc_url($next_lesson->lesson_url); ?>" 
                           class="btn btn-primary">
                            <i class="fas fa-play me-1"></i>
                            Start Lesson
                        </a>
                        
                        <?php if (!empty($next_lesson->preview_url)): ?>
                        <a href="<?php echo esc_url($next_lesson->preview_url); ?>" 
                           class="btn btn-outline-secondary btn-sm">
                            <i class="fas fa-eye me-1"></i>
                            Preview
                        </a>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- Progress Indicator -->
                <div class="progress-indicator mt-3">
                    <div class="progress-info d-flex justify-content-between align-items-center mb-1">
                        <small class="text-muted">Course Progress</small>
                        <small class="text-muted">
                            <?php echo esc_html($next_lesson->course_progress_percentage); ?>% Complete
                        </small>
                    </div>
                    <div class="progress" style="height: 4px;">
                        <div class="progress-bar bg-success" 
                             role="progressbar" 
                             style="width: <?php echo esc_attr($next_lesson->course_progress_percentage); ?>%"
                             aria-valuenow="<?php echo esc_attr($next_lesson->course_progress_percentage); ?>" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                        </div>
                    </div>
                </div>
                
            </div>
            
        </div>
        
        <!-- Widget JavaScript for interactions -->
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Handle lesson preview interactions
            $('.pmp-next-lesson-widget .video-thumbnail').on('click', function(e) {
                e.preventDefault();
                var lessonUrl = $(this).closest('.next-lesson-card').find('.btn-primary').attr('href');
                if (lessonUrl) {
                    window.location.href = lessonUrl;
                }
            });
            
            // Track widget interactions
            $('.pmp-next-lesson-widget .btn').on('click', function() {
                var action = $(this).hasClass('btn-primary') ? 'start_lesson' : 'preview_lesson';
                
                if (typeof pmpAjax !== 'undefined') {
                    $.post(pmpAjax.ajaxurl, {
                        action: 'track_lesson_interaction',
                        lesson_id: '<?php echo esc_js($next_lesson->id); ?>',
                        interaction_type: action,
                        nonce: pmpAjax.nonce
                    });
                }
            });
        });
        </script>
        
        <?php
        
        echo $args['after_widget'];
    }
    
    /**
     * Get the next lesson for the user
     * 
     * @param int $user_id User ID
     * @return object|null Next lesson object or null if no next lesson
     */
    private function get_next_lesson($user_id) {
        // Get course navigation instance
        if (class_exists('PMP_Course_Navigation')) {
            $navigation = new PMP_Course_Navigation($user_id);
            $modules = $navigation->get_course_modules();
            $completed_lessons = get_user_meta($user_id, 'pmp_completed_lessons', true);
            
            if (!is_array($completed_lessons)) {
                $completed_lessons = [];
            }
            
            // Find the first uncompleted lesson
            foreach ($modules as $module) {
                foreach ($module['lessons'] as $lesson) {
                    if (!in_array($lesson['id'], $completed_lessons)) {
                        // Enhance lesson data with additional information
                        $enhanced_lesson = $this->enhance_lesson_data($lesson, $module);
                        return (object) $enhanced_lesson;
                    }
                }
            }
        }
        
        return null; // No next lesson found (course completed)
    }
    
    /**
     * Enhance lesson data with additional information
     * 
     * @param array $lesson Base lesson data
     * @param array $module Module data
     * @return array Enhanced lesson data
     */
    private function enhance_lesson_data($lesson, $module) {
        // Calculate course progress
        $user_id = get_current_user_id();
        $completed_lessons = get_user_meta($user_id, 'pmp_completed_lessons', true);
        $completed_count = is_array($completed_lessons) ? count($completed_lessons) : 0;
        $total_lessons = 91; // Total lessons in course
        $progress_percentage = round(($completed_count / $total_lessons) * 100, 1);
        
        // Generate video thumbnail URL if video exists
        $video_thumbnail = '';
        if (!empty($lesson['video_url'])) {
            // Extract YouTube video ID and generate thumbnail
            $video_id = $this->extract_youtube_id($lesson['video_url']);
            if ($video_id) {
                $video_thumbnail = "https://img.youtube.com/vi/{$video_id}/mqdefault.jpg";
            }
        }
        
        // Generate lesson URL
        $lesson_url = home_url("/lesson/{$lesson['id']}/");
        
        // Add domain information
        $domain_info = $this->get_domain_info($module['domain_focus']);
        
        // Generate learning objectives (sample data)
        $learning_objectives = $this->generate_learning_objectives($lesson, $module);
        
        // Check for prerequisites
        $prerequisites = $this->get_lesson_prerequisites($lesson['id']);
        
        return array_merge($lesson, [
            'week_number' => $module['week_number'],
            'domain_focus' => $module['domain_focus'],
            'domain_percentage' => $domain_info['percentage'],
            'lesson_url' => $lesson_url,
            'preview_url' => $lesson_url . '?preview=1',
            'video_thumbnail' => $video_thumbnail,
            'course_progress_percentage' => $progress_percentage,
            'learning_objectives' => $learning_objectives,
            'prerequisites' => $prerequisites
        ]);
    }
    
    /**
     * Extract YouTube video ID from URL
     * 
     * @param string $url YouTube URL
     * @return string|null Video ID or null if not found
     */
    private function extract_youtube_id($url) {
        if (preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return $matches[1];
        }
        return null;
    }
    
    /**
     * Get domain information
     * 
     * @param string $domain_focus Domain focus (people, process, business)
     * @return array Domain information
     */
    private function get_domain_info($domain_focus) {
        $domain_map = [
            'people' => ['percentage' => 42, 'color' => '#28a745'],
            'process' => ['percentage' => 50, 'color' => '#007bff'],
            'business' => ['percentage' => 8, 'color' => '#fd7e14'],
            'mixed' => ['percentage' => 100, 'color' => '#6c757d']
        ];
        
        return $domain_map[$domain_focus] ?? $domain_map['mixed'];
    }
    
    /**
     * Generate learning objectives for a lesson
     * 
     * @param array $lesson Lesson data
     * @param array $module Module data
     * @return array Learning objectives
     */
    private function generate_learning_objectives($lesson, $module) {
        // This would typically be stored in lesson metadata
        // For now, generating sample objectives based on lesson title and domain
        $objectives = [];
        
        switch ($module['domain_focus']) {
            case 'people':
                $objectives = [
                    'Understand team dynamics and leadership principles',
                    'Apply conflict resolution techniques',
                    'Develop stakeholder engagement strategies'
                ];
                break;
            case 'process':
                $objectives = [
                    'Master project lifecycle processes',
                    'Apply process group methodologies',
                    'Implement quality management practices'
                ];
                break;
            case 'business':
                $objectives = [
                    'Analyze business environment factors',
                    'Understand organizational influences',
                    'Apply compliance and governance principles'
                ];
                break;
            default:
                $objectives = [
                    'Build foundational PMP knowledge',
                    'Understand exam structure and format',
                    'Develop effective study strategies'
                ];
        }
        
        return $objectives;
    }
    
    /**
     * Get lesson prerequisites
     * 
     * @param string $lesson_id Lesson ID
     * @return array Prerequisites
     */
    private function get_lesson_prerequisites($lesson_id) {
        // This would typically check lesson dependencies
        // For now, returning empty array (no prerequisites)
        return [];
    }
    
    /**
     * Widget form in admin
     * 
     * @param array $instance Widget instance settings
     */
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : __('Next Lesson', 'understrap-child');
        $show_description = !empty($instance['show_description']);
        $show_eco_references = !empty($instance['show_eco_references']);
        $show_duration = !empty($instance['show_duration']);
        $show_domain_info = !empty($instance['show_domain_info']);
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>"><?php _e('Title:', 'understrap-child'); ?></label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text" 
                   value="<?php echo esc_attr($title); ?>">
        </p>
        
        <p>
            <input class="checkbox" type="checkbox" <?php checked($show_description); ?> 
                   id="<?php echo esc_attr($this->get_field_id('show_description')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('show_description')); ?>" />
            <label for="<?php echo esc_attr($this->get_field_id('show_description')); ?>">
                <?php _e('Show Lesson Description', 'understrap-child'); ?>
            </label>
        </p>
        
        <p>
            <input class="checkbox" type="checkbox" <?php checked($show_eco_references); ?> 
                   id="<?php echo esc_attr($this->get_field_id('show_eco_references')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('show_eco_references')); ?>" />
            <label for="<?php echo esc_attr($this->get_field_id('show_eco_references')); ?>">
                <?php _e('Show ECO References', 'understrap-child'); ?>
            </label>
        </p>
        
        <p>
            <input class="checkbox" type="checkbox" <?php checked($show_duration); ?> 
                   id="<?php echo esc_attr($this->get_field_id('show_duration')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('show_duration')); ?>" />
            <label for="<?php echo esc_attr($this->get_field_id('show_duration')); ?>">
                <?php _e('Show Lesson Duration', 'understrap-child'); ?>
            </label>
        </p>
        
        <p>
            <input class="checkbox" type="checkbox" <?php checked($show_domain_info); ?> 
                   id="<?php echo esc_attr($this->get_field_id('show_domain_info')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('show_domain_info')); ?>" />
            <label for="<?php echo esc_attr($this->get_field_id('show_domain_info')); ?>">
                <?php _e('Show Domain Information', 'understrap-child'); ?>
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
        $instance['show_description'] = !empty($new_instance['show_description']);
        $instance['show_eco_references'] = !empty($new_instance['show_eco_references']);
        $instance['show_duration'] = !empty($new_instance['show_duration']);
        $instance['show_domain_info'] = !empty($new_instance['show_domain_info']);
        
        return $instance;
    }
}

/**
 * Register the widget
 */
function register_pmp_next_lesson_widget() {
    register_widget('PMP_Next_Lesson_Widget');
}
add_action('widgets_init', 'register_pmp_next_lesson_widget');