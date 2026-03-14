<?php
/**
 * PMP Course Navigation Class
 * 
 * Handles the enhanced course navigation sidebar with hierarchical structure,
 * progress tracking, and responsive design.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class PMP_Course_Navigation {
    
    private $user_id;
    private $course_id;
    private $current_lesson_id;
    
    /**
     * Constructor
     */
    public function __construct($user_id = null, $course_id = 'pmp-prep-course') {
        $this->user_id = $user_id ?: get_current_user_id();
        $this->course_id = $course_id;
        $this->current_lesson_id = $this->get_current_lesson_id();
    }
    
    /**
     * Render the complete navigation sidebar
     */
    public function render_sidebar() {
        $modules = $this->get_course_modules();
        $user_progress = $this->get_user_progress();
        
        ob_start();
        ?>
        <nav class="pmp-course-navigation" 
             role="navigation" 
             aria-label="Course Navigation"
             data-user-id="<?php echo esc_attr($this->user_id); ?>">
            
            <!-- Navigation Header -->
            <div class="nav-header">
                <div class="course-info">
                    <h2 class="course-title">PMP Prep Course</h2>
                    <div class="progress-summary">
                        <div class="progress-bar-container">
                            <div class="progress-bar" 
                                 role="progressbar" 
                                 aria-valuenow="<?php echo esc_attr($user_progress['percentage']); ?>" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100"
                                 aria-label="Course Progress">
                                <div class="progress-fill" style="width: <?php echo esc_attr($user_progress['percentage']); ?>%"></div>
                            </div>
                            <span class="progress-text"><?php echo esc_html($user_progress['percentage']); ?>% Complete</span>
                        </div>
                        <div class="lesson-count">
                            <span class="completed"><?php echo esc_html($user_progress['completed']); ?></span>
                            <span class="separator">/</span>
                            <span class="total"><?php echo esc_html($user_progress['total']); ?></span>
                            <span class="label">Lessons</span>
                        </div>
                    </div>
                </div>
                
                <!-- Mobile Toggle Button -->
                <button class="nav-toggle" 
                        aria-expanded="false" 
                        aria-controls="course-modules"
                        aria-label="Toggle course navigation">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </div>
            
            <!-- Course Modules -->
            <div class="nav-content" id="course-modules">
                <ul class="module-list" role="list">
                    <?php foreach ($modules as $module): ?>
                        <?php echo $this->render_module($module); ?>
                    <?php endforeach; ?>
                </ul>
            </div>
            
        </nav>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render a single module with its lessons
     */
    private function render_module($module) {
        $module_progress = $this->get_module_progress($module['id']);
        $is_current_module = $this->is_current_module($module['id']);
        $is_expanded = $is_current_module || $this->should_expand_module($module['id']);
        
        ob_start();
        ?>
        <li class="module-item <?php echo $is_current_module ? 'current-module' : ''; ?>" 
            data-module-id="<?php echo esc_attr($module['id']); ?>">
            
            <!-- Module Header -->
            <div class="module-header">
                <button class="module-toggle" 
                        aria-expanded="<?php echo $is_expanded ? 'true' : 'false'; ?>"
                        aria-controls="lessons-<?php echo esc_attr($module['id']); ?>"
                        aria-label="Toggle <?php echo esc_attr($module['title']); ?> lessons">
                    <span class="module-icon">
                        <svg class="chevron-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                </button>
                
                <div class="module-info">
                    <h3 class="module-title">
                        <span class="module-number">Week <?php echo esc_html($module['week_number']); ?></span>
                        <span class="module-name"><?php echo esc_html($module['title']); ?></span>
                    </h3>
                    <div class="module-meta">
                        <span class="lesson-count"><?php echo esc_html($module['total_lessons']); ?> lessons</span>
                        <span class="duration"><?php echo esc_html($module['estimated_duration']); ?></span>
                        <span class="domain-indicator domain-<?php echo esc_attr($module['domain_focus']); ?>">
                            <?php echo esc_html(ucfirst($module['domain_focus'])); ?>
                        </span>
                    </div>
                </div>
                
                <div class="module-progress">
                    <div class="completion-indicator">
                        <?php if ($module_progress['percentage'] == 100): ?>
                            <svg class="check-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                        <?php else: ?>
                            <div class="progress-circle" data-progress="<?php echo esc_attr($module_progress['percentage']); ?>">
                                <svg width="20" height="20" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="8" fill="none" stroke="#e5e7eb" stroke-width="2"/>
                                    <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-dasharray="50.27" 
                                            stroke-dashoffset="<?php echo 50.27 - ($module_progress['percentage'] / 100 * 50.27); ?>"
                                            transform="rotate(-90 10 10)"/>
                                </svg>
                                <span class="progress-text"><?php echo esc_html($module_progress['completed']); ?></span>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            
            <!-- Module Lessons -->
            <div class="lesson-list-container <?php echo $is_expanded ? 'expanded' : 'collapsed'; ?>" 
                 id="lessons-<?php echo esc_attr($module['id']); ?>">
                <ul class="lesson-list" role="list">
                    <?php foreach ($module['lessons'] as $lesson): ?>
                        <?php echo $this->render_lesson($lesson); ?>
                    <?php endforeach; ?>
                </ul>
            </div>
            
        </li>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render a single lesson item
     */
    private function render_lesson($lesson) {
        $is_completed = $this->is_lesson_completed($lesson['id']);
        $is_current = ($lesson['id'] === $this->current_lesson_id);
        $is_accessible = $this->is_lesson_accessible($lesson['id']);
        
        ob_start();
        ?>
        <li class="lesson-item <?php echo $is_current ? 'current-lesson' : ''; ?> <?php echo $is_completed ? 'completed' : ''; ?> <?php echo !$is_accessible ? 'locked' : ''; ?>"
            data-lesson-id="<?php echo esc_attr($lesson['id']); ?>">
            
            <a href="<?php echo esc_url($this->get_lesson_url($lesson['id'])); ?>" 
               class="lesson-link <?php echo !$is_accessible ? 'disabled' : ''; ?>"
               <?php echo !$is_accessible ? 'aria-disabled="true" tabindex="-1"' : ''; ?>
               aria-current="<?php echo $is_current ? 'page' : 'false'; ?>">
                
                <div class="lesson-status">
                    <?php if ($is_completed): ?>
                        <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.707 4.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L7 9.586l5.293-5.293a1 1 0 011.414 0z"/>
                        </svg>
                    <?php elseif (!$is_accessible): ?>
                        <svg class="lock-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4 7V5a4 4 0 118 0v2h1a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1h1zM6 5a2 2 0 114 0v2H6V5z"/>
                        </svg>
                    <?php else: ?>
                        <div class="lesson-number"><?php echo esc_html($lesson['order']); ?></div>
                    <?php endif; ?>
                </div>
                
                <div class="lesson-content">
                    <h4 class="lesson-title"><?php echo esc_html($lesson['title']); ?></h4>
                    <div class="lesson-meta">
                        <span class="duration"><?php echo esc_html($lesson['duration']); ?></span>
                        <?php if (!empty($lesson['eco_references'])): ?>
                            <span class="eco-refs">ECO: <?php echo esc_html(implode(', ', $lesson['eco_references'])); ?></span>
                        <?php endif; ?>
                    </div>
                </div>
                
                <?php if ($is_current): ?>
                    <div class="current-indicator" aria-label="Currently viewing">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                            <circle cx="4" cy="4" r="4"/>
                        </svg>
                    </div>
                <?php endif; ?>
                
            </a>
        </li>
        <?php
        return ob_get_clean();
    }  
  
    /**
     * Get course modules with lessons
     */
    public function get_course_modules() {
        // This would typically fetch from database or custom fields
        // For now, returning sample structure based on the 13-week program
        return [
            [
                'id' => 'week-01',
                'title' => 'PMP Foundations',
                'description' => 'Introduction to PMP concepts and exam structure',
                'week_number' => 1,
                'domain_focus' => 'mixed',
                'total_lessons' => 7,
                'estimated_duration' => '3 hours',
                'lessons' => [
                    [
                        'id' => 'lesson-01-01',
                        'title' => 'PMP Exam Overview',
                        'description' => 'Understanding the PMP certification process',
                        'duration' => '20 minutes',
                        'video_url' => '',
                        'eco_references' => ['ECO-1.1', 'ECO-1.2'],
                        'order' => 1
                    ],
                    [
                        'id' => 'lesson-01-02',
                        'title' => 'PMP Mindset Principles',
                        'description' => 'Developing the right mindset for project management',
                        'duration' => '18 minutes',
                        'video_url' => '',
                        'eco_references' => ['ECO-1.3'],
                        'order' => 2
                    ],
                    [
                        'id' => 'lesson-01-03',
                        'title' => 'Study Strategy Setup',
                        'description' => 'Creating an effective study plan',
                        'duration' => '15 minutes',
                        'video_url' => '',
                        'eco_references' => ['ECO-1.4'],
                        'order' => 3
                    ]
                ]
            ],
            [
                'id' => 'week-02',
                'title' => 'People Domain Fundamentals',
                'description' => 'Team building, leadership, and conflict management',
                'week_number' => 2,
                'domain_focus' => 'people',
                'total_lessons' => 7,
                'estimated_duration' => '3.5 hours',
                'lessons' => [
                    [
                        'id' => 'lesson-02-01',
                        'title' => 'Team Building Basics',
                        'description' => 'Fundamentals of building effective project teams',
                        'duration' => '22 minutes',
                        'video_url' => '',
                        'eco_references' => ['ECO-2.1', 'ECO-2.2'],
                        'order' => 1
                    ],
                    [
                        'id' => 'lesson-02-02',
                        'title' => 'Leadership Styles',
                        'description' => 'Understanding different leadership approaches',
                        'duration' => '25 minutes',
                        'video_url' => '',
                        'eco_references' => ['ECO-2.3'],
                        'order' => 2
                    ]
                ]
            ],
            [
                'id' => 'week-03',
                'title' => 'Process Domain Introduction',
                'description' => 'Project lifecycle and process groups',
                'week_number' => 3,
                'domain_focus' => 'process',
                'total_lessons' => 7,
                'estimated_duration' => '4 hours',
                'lessons' => [
                    [
                        'id' => 'lesson-03-01',
                        'title' => 'Project Lifecycle Overview',
                        'description' => 'Understanding project phases and gates',
                        'duration' => '30 minutes',
                        'video_url' => '',
                        'eco_references' => ['ECO-3.1'],
                        'order' => 1
                    ]
                ]
            ]
        ];
    }
    
    /**
     * Get user progress data
     */
    public function get_user_progress() {
        // This would typically fetch from user meta or progress tracking table
        $completed_lessons = $this->get_completed_lessons_count();
        $total_lessons = 91; // Total lessons in the course
        $percentage = round(($completed_lessons / $total_lessons) * 100, 1);
        
        return [
            'percentage' => $percentage,
            'completed' => $completed_lessons,
            'total' => $total_lessons
        ];
    }
    
    /**
     * Get module progress
     */
    public function get_module_progress($module_id) {
        // This would calculate progress for a specific module
        $module_lessons = $this->get_module_lessons($module_id);
        $completed_count = 0;
        
        foreach ($module_lessons as $lesson) {
            if ($this->is_lesson_completed($lesson['id'])) {
                $completed_count++;
            }
        }
        
        $total_count = count($module_lessons);
        $percentage = $total_count > 0 ? round(($completed_count / $total_count) * 100) : 0;
        
        return [
            'percentage' => $percentage,
            'completed' => $completed_count,
            'total' => $total_count
        ];
    }
    
    /**
     * Check if lesson is completed
     */
    public function is_lesson_completed($lesson_id) {
        // This would check user progress data
        $completed_lessons = get_user_meta($this->user_id, 'pmp_completed_lessons', true);
        return is_array($completed_lessons) && in_array($lesson_id, $completed_lessons);
    }
    
    /**
     * Check if lesson is accessible (not locked)
     */
    private function is_lesson_accessible($lesson_id) {
        // For now, all lessons are accessible
        // In a real implementation, this might check prerequisites
        return true;
    }
    
    /**
     * Check if module is current (contains current lesson)
     */
    private function is_current_module($module_id) {
        if (!$this->current_lesson_id) {
            return false;
        }
        
        return strpos($this->current_lesson_id, $module_id) === 0;
    }
    
    /**
     * Check if module should be expanded
     */
    private function should_expand_module($module_id) {
        // Expand current module and recently accessed modules
        return $this->is_current_module($module_id);
    }
    
    /**
     * Get current lesson ID
     */
    private function get_current_lesson_id() {
        global $post;
        
        if ($post && $post->post_type === 'lesson') {
            return $post->post_name;
        }
        
        // Fallback to user's last accessed lesson
        return get_user_meta($this->user_id, 'pmp_current_lesson', true);
    }
    
    /**
     * Get lesson URL
     */
    private function get_lesson_url($lesson_id) {
        // This would generate the proper lesson URL
        return home_url("/lesson/{$lesson_id}/");
    }
    
    /**
     * Get completed lessons count
     */
    private function get_completed_lessons_count() {
        $completed_lessons = get_user_meta($this->user_id, 'pmp_completed_lessons', true);
        return is_array($completed_lessons) ? count($completed_lessons) : 0;
    }
    
    /**
     * Get lessons for a specific module
     */
    private function get_module_lessons($module_id) {
        $modules = $this->get_course_modules();
        
        foreach ($modules as $module) {
            if ($module['id'] === $module_id) {
                return $module['lessons'];
            }
        }
        
        return [];
    }
    
    /**
     * Mark lesson as completed
     */
    public function mark_lesson_completed($lesson_id) {
        $completed_lessons = get_user_meta($this->user_id, 'pmp_completed_lessons', true);
        if (!is_array($completed_lessons)) {
            $completed_lessons = [];
        }
        
        if (!in_array($lesson_id, $completed_lessons)) {
            $completed_lessons[] = $lesson_id;
            update_user_meta($this->user_id, 'pmp_completed_lessons', $completed_lessons);
        }
    }
    
    /**
     * Get current lesson object
     */
    public function get_current_lesson() {
        if (!$this->current_lesson_id) {
            return null;
        }
        
        $modules = $this->get_course_modules();
        
        foreach ($modules as $module) {
            foreach ($module['lessons'] as $lesson) {
                if ($lesson['id'] === $this->current_lesson_id) {
                    return (object) $lesson;
                }
            }
        }
        
        return null;
    }
}