<?php
/**
 * PMP Course Progression Navigation
 * 
 * Handles navigation between lessons in the 13-week PMP course structure
 * Provides next/previous lesson functionality and progress tracking
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * PMP Course Progression Class
 */
class PMP_Course_Progression {
    
    /**
     * Course structure mapping
     * 
     * @var array
     */
    private static $course_structure = array();
    
    /**
     * Initialize the course progression system
     */
    public function __construct() {
        add_action( 'init', array( $this, 'init_course_structure' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_progression_scripts' ) );
        add_shortcode( 'pmp_lesson_navigation', array( $this, 'render_lesson_navigation' ) );
        add_shortcode( 'pmp_course_progress', array( $this, 'render_course_progress' ) );
        
        // AJAX handlers for progression tracking
        add_action( 'wp_ajax_pmp_mark_lesson_complete', array( $this, 'mark_lesson_complete' ) );
        add_action( 'wp_ajax_pmp_get_next_lesson', array( $this, 'get_next_lesson' ) );
        add_action( 'wp_ajax_pmp_get_lesson_progress', array( $this, 'get_lesson_progress' ) );
    }
    
    /**
     * Initialize the course structure from content mapping
     */
    public function init_course_structure() {
        // Load the video-to-chunk mapping for lesson structure
        $mapping_file = get_template_directory() . '/../src/content/cross-references/video-to-chunk-mapping.json';
        
        if ( file_exists( $mapping_file ) ) {
            $mapping_content = file_get_contents( $mapping_file );
            $video_mapping = json_decode( $mapping_content, true );
            
            if ( $video_mapping ) {
                self::$course_structure = $this->build_lesson_sequence( $video_mapping );
            }
        }
        
        // Fallback structure if mapping file not found
        if ( empty( self::$course_structure ) ) {
            self::$course_structure = $this->get_default_course_structure();
        }
    }
    
    /**
     * Build lesson sequence from video mapping
     * 
     * @param array $video_mapping Video to chunk mapping data
     * @return array Structured lesson sequence
     */
    private function build_lesson_sequence( $video_mapping ) {
        $lessons = array();
        $lesson_index = 1;
        
        foreach ( $video_mapping as $week_key => $week_data ) {
            $week_number = (int) str_replace( 'week_', '', $week_key );
            
            foreach ( $week_data as $day_key => $day_data ) {
                $day_number = (int) str_replace( 'day_', '', $day_key );
                
                $lessons[] = array(
                    'id' => $lesson_index,
                    'week' => $week_number,
                    'day' => $day_number,
                    'title' => $day_data['video_title'] ?? "Week {$week_number} Day {$day_number}",
                    'slug' => sanitize_title( $day_data['video_title'] ?? "week-{$week_number}-day-{$day_number}" ),
                    'chunk' => $day_data['primary_chunk'] ?? '',
                    'sections' => $day_data['sections_covered'] ?? array(),
                    'eco_tasks' => $day_data['eco_tasks'] ?? array(),
                    'url' => home_url( "/lessons/week-{$week_number}/day-{$day_number}/" ),
                    'domain' => $this->get_lesson_domain( $week_number ),
                    'color' => $this->get_domain_color( $this->get_lesson_domain( $week_number ) )
                );
                
                $lesson_index++;
            }
        }
        
        return $lessons;
    }
    
    /**
     * Get lesson domain based on week number
     * 
     * @param int $week_number Week number
     * @return string Domain name
     */
    private function get_lesson_domain( $week_number ) {
        if ( $week_number === 1 ) {
            return 'foundation';
        } elseif ( $week_number >= 2 && $week_number <= 4 ) {
            return 'people';
        } elseif ( $week_number >= 5 && $week_number <= 8 ) {
            return 'process';
        } elseif ( $week_number >= 9 && $week_number <= 11 ) {
            return 'business';
        } elseif ( $week_number === 12 ) {
            return 'review';
        } elseif ( $week_number === 13 ) {
            return 'final';
        }
        
        return 'general';
    }
    
    /**
     * Get domain color
     * 
     * @param string $domain Domain name
     * @return string Color code
     */
    private function get_domain_color( $domain ) {
        $colors = array(
            'foundation' => '#6c757d', // Gray
            'people' => '#28a745',     // Green
            'process' => '#007bff',    // Blue
            'business' => '#fd7e14',   // Orange
            'review' => '#6f42c1',     // Purple
            'final' => '#dc3545',      // Red
            'general' => '#6c757d'     // Gray
        );
        
        return $colors[ $domain ] ?? '#6c757d';
    }
    
    /**
     * Get default course structure if mapping file not available
     * 
     * @return array Default lesson structure
     */
    private function get_default_course_structure() {
        $lessons = array();
        $lesson_index = 1;
        
        // 13 weeks, 7 days each (91 lessons total)
        for ( $week = 1; $week <= 13; $week++ ) {
            for ( $day = 1; $day <= 7; $day++ ) {
                $lessons[] = array(
                    'id' => $lesson_index,
                    'week' => $week,
                    'day' => $day,
                    'title' => "Week {$week} Day {$day}",
                    'slug' => "week-{$week}-day-{$day}",
                    'url' => home_url( "/lessons/week-{$week}/day-{$day}/" ),
                    'domain' => $this->get_lesson_domain( $week ),
                    'color' => $this->get_domain_color( $this->get_lesson_domain( $week ) )
                );
                
                $lesson_index++;
            }
        }
        
        return $lessons;
    }
    
    /**
     * Get lesson by ID
     * 
     * @param int $lesson_id Lesson ID
     * @return array|null Lesson data or null if not found
     */
    public static function get_lesson_by_id( $lesson_id ) {
        foreach ( self::$course_structure as $lesson ) {
            if ( $lesson['id'] === (int) $lesson_id ) {
                return $lesson;
            }
        }
        
        return null;
    }
    
    /**
     * Get lesson by week and day
     * 
     * @param int $week Week number
     * @param int $day Day number
     * @return array|null Lesson data or null if not found
     */
    public static function get_lesson_by_week_day( $week, $day ) {
        foreach ( self::$course_structure as $lesson ) {
            if ( $lesson['week'] === (int) $week && $lesson['day'] === (int) $day ) {
                return $lesson;
            }
        }
        
        return null;
    }
    
    /**
     * Get next lesson
     * 
     * @param int $current_lesson_id Current lesson ID
     * @return array|null Next lesson data or null if at end
     */
    public static function get_next_lesson( $current_lesson_id ) {
        $next_id = (int) $current_lesson_id + 1;
        return self::get_lesson_by_id( $next_id );
    }
    
    /**
     * Get previous lesson
     * 
     * @param int $current_lesson_id Current lesson ID
     * @return array|null Previous lesson data or null if at beginning
     */
    public static function get_previous_lesson( $current_lesson_id ) {
        $prev_id = (int) $current_lesson_id - 1;
        return $prev_id > 0 ? self::get_lesson_by_id( $prev_id ) : null;
    }
    
    /**
     * Get lessons by week
     * 
     * @param int $week_number Week number
     * @return array Lessons in the specified week
     */
    public static function get_lessons_by_week( $week_number ) {
        $week_lessons = array();
        
        foreach ( self::$course_structure as $lesson ) {
            if ( $lesson['week'] === (int) $week_number ) {
                $week_lessons[] = $lesson;
            }
        }
        
        return $week_lessons;
    }
    
    /**
     * Get lessons by domain
     * 
     * @param string $domain Domain name
     * @return array Lessons in the specified domain
     */
    public static function get_lessons_by_domain( $domain ) {
        $domain_lessons = array();
        
        foreach ( self::$course_structure as $lesson ) {
            if ( $lesson['domain'] === $domain ) {
                $domain_lessons[] = $lesson;
            }
        }
        
        return $domain_lessons;
    }
    
    /**
     * Get user's current lesson
     * 
     * @param int $user_id User ID (optional, defaults to current user)
     * @return array|null Current lesson data
     */
    public static function get_user_current_lesson( $user_id = null ) {
        if ( ! $user_id ) {
            $user_id = get_current_user_id();
        }
        
        if ( ! $user_id ) {
            return null;
        }
        
        $current_lesson_id = get_user_meta( $user_id, 'pmp_current_lesson_id', true );
        
        if ( ! $current_lesson_id ) {
            // Default to first lesson
            $current_lesson_id = 1;
            update_user_meta( $user_id, 'pmp_current_lesson_id', $current_lesson_id );
        }
        
        return self::get_lesson_by_id( $current_lesson_id );
    }
    
    /**
     * Get user's completed lessons
     * 
     * @param int $user_id User ID (optional, defaults to current user)
     * @return array Array of completed lesson IDs
     */
    public static function get_user_completed_lessons( $user_id = null ) {
        if ( ! $user_id ) {
            $user_id = get_current_user_id();
        }
        
        if ( ! $user_id ) {
            return array();
        }
        
        $completed = get_user_meta( $user_id, 'pmp_completed_lessons', true );
        return is_array( $completed ) ? $completed : array();
    }
    
    /**
     * Calculate user's progress percentage
     * 
     * @param int $user_id User ID (optional, defaults to current user)
     * @return float Progress percentage (0-100)
     */
    public static function get_user_progress_percentage( $user_id = null ) {
        $completed_lessons = self::get_user_completed_lessons( $user_id );
        $total_lessons = count( self::$course_structure );
        
        if ( $total_lessons === 0 ) {
            return 0;
        }
        
        return ( count( $completed_lessons ) / $total_lessons ) * 100;
    }
    
    /**
     * Render lesson navigation shortcode
     * 
     * @param array $atts Shortcode attributes
     * @return string Navigation HTML
     */
    public function render_lesson_navigation( $atts ) {
        $atts = shortcode_atts( array(
            'lesson_id' => null,
            'show_progress' => 'true',
            'show_domain_info' => 'true',
            'compact' => 'false'
        ), $atts );
        
        $current_lesson_id = $atts['lesson_id'] ? (int) $atts['lesson_id'] : null;
        
        // Try to get lesson ID from URL or user progress
        if ( ! $current_lesson_id ) {
            global $wp_query;
            
            // Check if we're on a lesson page
            if ( isset( $wp_query->query_vars['week'] ) && isset( $wp_query->query_vars['day'] ) ) {
                $week = (int) $wp_query->query_vars['week'];
                $day = (int) $wp_query->query_vars['day'];
                $lesson = self::get_lesson_by_week_day( $week, $day );
                $current_lesson_id = $lesson ? $lesson['id'] : null;
            }
            
            // Fallback to user's current lesson
            if ( ! $current_lesson_id ) {
                $current_lesson = self::get_user_current_lesson();
                $current_lesson_id = $current_lesson ? $current_lesson['id'] : 1;
            }
        }
        
        $current_lesson = self::get_lesson_by_id( $current_lesson_id );
        $previous_lesson = self::get_previous_lesson( $current_lesson_id );
        $next_lesson = self::get_next_lesson( $current_lesson_id );
        
        if ( ! $current_lesson ) {
            return '<p class="alert alert-warning">Lesson not found.</p>';
        }
        
        $compact_class = $atts['compact'] === 'true' ? ' compact' : '';
        
        ob_start();
        ?>
        <div class="pmp-lesson-navigation<?php echo esc_attr( $compact_class ); ?>" data-lesson-id="<?php echo esc_attr( $current_lesson_id ); ?>">
            
            <?php if ( $atts['show_domain_info'] === 'true' ) : ?>
                <div class="lesson-domain-info mb-3">
                    <div class="domain-badge" style="background-color: <?php echo esc_attr( $current_lesson['color'] ); ?>;">
                        <span class="domain-name"><?php echo esc_html( ucfirst( $current_lesson['domain'] ) ); ?> Domain</span>
                        <span class="lesson-position">Week <?php echo esc_html( $current_lesson['week'] ); ?>, Day <?php echo esc_html( $current_lesson['day'] ); ?></span>
                    </div>
                </div>
            <?php endif; ?>
            
            <div class="lesson-navigation-controls d-flex justify-content-between align-items-center">
                <div class="nav-previous">
                    <?php if ( $previous_lesson ) : ?>
                        <a href="<?php echo esc_url( $previous_lesson['url'] ); ?>" 
                           class="btn btn-outline-secondary d-flex align-items-center"
                           title="<?php echo esc_attr( $previous_lesson['title'] ); ?>">
                            <i class="fas fa-chevron-left me-2"></i>
                            <span class="d-none d-md-inline">Previous Lesson</span>
                            <span class="d-md-none">Previous</span>
                        </a>
                    <?php else : ?>
                        <span class="btn btn-outline-secondary disabled">
                            <i class="fas fa-chevron-left me-2"></i>
                            <span class="d-none d-md-inline">Previous Lesson</span>
                            <span class="d-md-none">Previous</span>
                        </span>
                    <?php endif; ?>
                </div>
                
                <div class="current-lesson-info text-center flex-grow-1 mx-3">
                    <h5 class="lesson-title mb-1"><?php echo esc_html( $current_lesson['title'] ); ?></h5>
                    <?php if ( $atts['show_progress'] === 'true' ) : ?>
                        <div class="lesson-progress">
                            <small class="text-muted">
                                Lesson <?php echo esc_html( $current_lesson_id ); ?> of <?php echo esc_html( count( self::$course_structure ) ); ?>
                                (<?php echo esc_html( number_format( ( $current_lesson_id / count( self::$course_structure ) ) * 100, 1 ) ); ?>%)
                            </small>
                        </div>
                    <?php endif; ?>
                </div>
                
                <div class="nav-next">
                    <?php if ( $next_lesson ) : ?>
                        <a href="<?php echo esc_url( $next_lesson['url'] ); ?>" 
                           class="btn btn-primary d-flex align-items-center"
                           title="<?php echo esc_attr( $next_lesson['title'] ); ?>">
                            <span class="d-none d-md-inline">Next Lesson</span>
                            <span class="d-md-none">Next</span>
                            <i class="fas fa-chevron-right ms-2"></i>
                        </a>
                    <?php else : ?>
                        <span class="btn btn-success">
                            <i class="fas fa-trophy me-2"></i>
                            <span class="d-none d-md-inline">Course Complete!</span>
                            <span class="d-md-none">Complete!</span>
                        </span>
                    <?php endif; ?>
                </div>
            </div>
            
            <?php if ( $atts['compact'] === 'false' ) : ?>
                <div class="lesson-actions mt-3 text-center">
                    <button type="button" 
                            class="btn btn-outline-success btn-sm me-2" 
                            id="mark-lesson-complete"
                            data-lesson-id="<?php echo esc_attr( $current_lesson_id ); ?>">
                        <i class="fas fa-check me-1"></i>
                        Mark Complete
                    </button>
                    
                    <button type="button" 
                            class="btn btn-outline-info btn-sm" 
                            data-bs-toggle="modal" 
                            data-bs-target="#lesson-overview-modal">
                        <i class="fas fa-list me-1"></i>
                        Lesson Overview
                    </button>
                </div>
            <?php endif; ?>
        </div>
        
        <?php if ( $atts['compact'] === 'false' ) : ?>
            <!-- Lesson Overview Modal -->
            <div class="modal fade" id="lesson-overview-modal" tabindex="-1" aria-labelledby="lesson-overview-modal-label" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="lesson-overview-modal-label">
                                <?php echo esc_html( $current_lesson['title'] ); ?>
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <?php if ( ! empty( $current_lesson['sections'] ) ) : ?>
                                <h6>Topics Covered:</h6>
                                <ul class="list-unstyled">
                                    <?php foreach ( $current_lesson['sections'] as $section ) : ?>
                                        <li><i class="fas fa-check-circle text-success me-2"></i><?php echo esc_html( $section ); ?></li>
                                    <?php endforeach; ?>
                                </ul>
                            <?php endif; ?>
                            
                            <?php if ( ! empty( $current_lesson['eco_tasks'] ) ) : ?>
                                <h6 class="mt-3">ECO Tasks:</h6>
                                <ul class="list-unstyled">
                                    <?php foreach ( $current_lesson['eco_tasks'] as $task ) : ?>
                                        <li><i class="fas fa-tasks text-primary me-2"></i><?php echo esc_html( $task ); ?></li>
                                    <?php endforeach; ?>
                                </ul>
                            <?php endif; ?>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <?php if ( $next_lesson ) : ?>
                                <a href="<?php echo esc_url( $next_lesson['url'] ); ?>" class="btn btn-primary">
                                    Next Lesson <i class="fas fa-chevron-right ms-1"></i>
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        <?php endif; ?>
        
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render course progress shortcode
     * 
     * @param array $atts Shortcode attributes
     * @return string Progress HTML
     */
    public function render_course_progress( $atts ) {
        $atts = shortcode_atts( array(
            'user_id' => null,
            'show_details' => 'true',
            'show_by_domain' => 'false'
        ), $atts );
        
        $user_id = $atts['user_id'] ? (int) $atts['user_id'] : get_current_user_id();
        
        if ( ! $user_id ) {
            return '<p class="alert alert-info">Please log in to view your progress.</p>';
        }
        
        $progress_percentage = self::get_user_progress_percentage( $user_id );
        $completed_lessons = self::get_user_completed_lessons( $user_id );
        $total_lessons = count( self::$course_structure );
        $current_lesson = self::get_user_current_lesson( $user_id );
        
        ob_start();
        ?>
        <div class="pmp-course-progress">
            <div class="progress-header mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Course Progress</h5>
                    <span class="badge bg-primary"><?php echo esc_html( number_format( $progress_percentage, 1 ) ); ?>%</span>
                </div>
                <div class="progress mt-2" style="height: 10px;">
                    <div class="progress-bar bg-success" 
                         role="progressbar" 
                         style="width: <?php echo esc_attr( $progress_percentage ); ?>%"
                         aria-valuenow="<?php echo esc_attr( $progress_percentage ); ?>" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
                <small class="text-muted">
                    <?php echo esc_html( count( $completed_lessons ) ); ?> of <?php echo esc_html( $total_lessons ); ?> lessons completed
                </small>
            </div>
            
            <?php if ( $atts['show_details'] === 'true' ) : ?>
                <div class="progress-details">
                    <?php if ( $current_lesson ) : ?>
                        <div class="current-lesson-card card border-primary mb-3">
                            <div class="card-body">
                                <h6 class="card-title">
                                    <i class="fas fa-play-circle text-primary me-2"></i>
                                    Current Lesson
                                </h6>
                                <p class="card-text">
                                    <strong><?php echo esc_html( $current_lesson['title'] ); ?></strong><br>
                                    <small class="text-muted">Week <?php echo esc_html( $current_lesson['week'] ); ?>, Day <?php echo esc_html( $current_lesson['day'] ); ?></small>
                                </p>
                                <a href="<?php echo esc_url( $current_lesson['url'] ); ?>" class="btn btn-primary btn-sm">
                                    Continue Learning
                                </a>
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ( $atts['show_by_domain'] === 'true' ) : ?>
                        <div class="progress-by-domain">
                            <h6>Progress by Domain</h6>
                            <?php
                            $domains = array( 'people', 'process', 'business' );
                            foreach ( $domains as $domain ) :
                                $domain_lessons = self::get_lessons_by_domain( $domain );
                                $domain_completed = array_intersect( $completed_lessons, wp_list_pluck( $domain_lessons, 'id' ) );
                                $domain_percentage = count( $domain_lessons ) > 0 ? ( count( $domain_completed ) / count( $domain_lessons ) ) * 100 : 0;
                                $domain_color = $this->get_domain_color( $domain );
                            ?>
                                <div class="domain-progress mb-2">
                                    <div class="d-flex justify-content-between">
                                        <span style="color: <?php echo esc_attr( $domain_color ); ?>;">
                                            <i class="fas fa-circle me-1"></i>
                                            <?php echo esc_html( ucfirst( $domain ) ); ?> Domain
                                        </span>
                                        <span><?php echo esc_html( number_format( $domain_percentage, 1 ) ); ?>%</span>
                                    </div>
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar" 
                                             style="width: <?php echo esc_attr( $domain_percentage ); ?>%; background-color: <?php echo esc_attr( $domain_color ); ?>;"
                                             role="progressbar" 
                                             aria-valuenow="<?php echo esc_attr( $domain_percentage ); ?>" 
                                             aria-valuemin="0" 
                                             aria-valuemax="100">
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
        
        return ob_get_clean();
    }
    
    /**
     * Enqueue progression scripts and styles
     */
    public function enqueue_progression_scripts() {
        wp_enqueue_script(
            'pmp-course-progression',
            get_stylesheet_directory_uri() . '/assets/js/course-progression.js',
            array( 'jquery' ),
            '1.0.0',
            true
        );
        
        wp_localize_script( 'pmp-course-progression', 'pmpProgressionData', array(
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce' => wp_create_nonce( 'pmp_progression_nonce' ),
            'userId' => get_current_user_id(),
            'strings' => array(
                'lessonCompleted' => __( 'Lesson marked as complete!', 'understrap-child' ),
                'error' => __( 'An error occurred. Please try again.', 'understrap-child' ),
                'confirmComplete' => __( 'Mark this lesson as complete?', 'understrap-child' )
            )
        ) );
    }
    
    /**
     * AJAX handler to mark lesson as complete
     */
    public function mark_lesson_complete() {
        check_ajax_referer( 'pmp_progression_nonce', 'nonce' );
        
        $user_id = get_current_user_id();
        $lesson_id = (int) $_POST['lesson_id'];
        
        if ( ! $user_id || ! $lesson_id ) {
            wp_die( 'Invalid request' );
        }
        
        $completed_lessons = self::get_user_completed_lessons( $user_id );
        
        if ( ! in_array( $lesson_id, $completed_lessons ) ) {
            $completed_lessons[] = $lesson_id;
            update_user_meta( $user_id, 'pmp_completed_lessons', $completed_lessons );
            
            // Update current lesson to next lesson
            $next_lesson = self::get_next_lesson( $lesson_id );
            if ( $next_lesson ) {
                update_user_meta( $user_id, 'pmp_current_lesson_id', $next_lesson['id'] );
            }
        }
        
        wp_send_json_success( array(
            'message' => __( 'Lesson marked as complete!', 'understrap-child' ),
            'progress' => self::get_user_progress_percentage( $user_id ),
            'next_lesson' => $next_lesson
        ) );
    }
    
    /**
     * Get total course structure
     * 
     * @return array Complete course structure
     */
    public static function get_course_structure() {
        return self::$course_structure;
    }
}

// Initialize the course progression system
new PMP_Course_Progression();