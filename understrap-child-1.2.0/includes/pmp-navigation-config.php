<?php
/**
 * PMP Navigation Menu Configuration
 * 
 * Defines the main navigation menu structure for the PMP WordPress theme
 * Based on the 13-week course structure and user dashboard requirements
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * PMP Navigation Menu Structure Configuration
 */
class PMP_Navigation_Config {
    
    /**
     * Get the main navigation menu structure
     * 
     * @return array Navigation menu structure
     */
    public static function get_main_menu_structure() {
        return array(
            'home' => array(
                'title' => __( 'Home', 'understrap-child' ),
                'url' => home_url( '/' ),
                'icon' => 'fas fa-home',
                'order' => 10
            ),
            'course-overview' => array(
                'title' => __( 'Course Overview', 'understrap-child' ),
                'url' => home_url( '/course-overview/' ),
                'icon' => 'fas fa-book-open',
                'order' => 20
            ),
            'my-dashboard' => array(
                'title' => __( 'My Dashboard', 'understrap-child' ),
                'url' => home_url( '/dashboard/' ),
                'icon' => 'fas fa-tachometer-alt',
                'order' => 30,
                'show_when_logged_in' => true
            ),
            'lessons' => array(
                'title' => __( 'Lessons', 'understrap-child' ),
                'url' => home_url( '/lessons/' ),
                'icon' => 'fas fa-graduation-cap',
                'order' => 40,
                'children' => array(
                    'week-1-foundation' => array(
                        'title' => __( 'Week 1: Foundation', 'understrap-child' ),
                        'url' => home_url( '/lessons/week-1/' ),
                        'description' => __( 'PMP Overview & Study Strategy', 'understrap-child' ),
                        'color' => '#28a745' // Green for foundation
                    ),
                    'weeks-2-4-people' => array(
                        'title' => __( 'Week 2-4: People', 'understrap-child' ),
                        'url' => home_url( '/lessons/people-domain/' ),
                        'description' => __( 'People Domain (42%)', 'understrap-child' ),
                        'color' => '#28a745' // Green for People domain
                    ),
                    'weeks-5-8-process' => array(
                        'title' => __( 'Week 5-8: Process', 'understrap-child' ),
                        'url' => home_url( '/lessons/process-domain/' ),
                        'description' => __( 'Process Domain (50%)', 'understrap-child' ),
                        'color' => '#007bff' // Blue for Process domain
                    ),
                    'weeks-9-11-business' => array(
                        'title' => __( 'Week 9-11: Business', 'understrap-child' ),
                        'url' => home_url( '/lessons/business-domain/' ),
                        'description' => __( 'Business Environment (8%)', 'understrap-child' ),
                        'color' => '#fd7e14' // Orange for Business domain
                    ),
                    'week-12-review' => array(
                        'title' => __( 'Week 12: Review', 'understrap-child' ),
                        'url' => home_url( '/lessons/week-12/' ),
                        'description' => __( 'Comprehensive Review', 'understrap-child' ),
                        'color' => '#6f42c1' // Purple for review
                    ),
                    'week-13-final-prep' => array(
                        'title' => __( 'Week 13: Final Prep', 'understrap-child' ),
                        'url' => home_url( '/lessons/week-13/' ),
                        'description' => __( 'Final Preparation', 'understrap-child' ),
                        'color' => '#dc3545' // Red for final prep
                    )
                )
            ),
            'resources' => array(
                'title' => __( 'Resources', 'understrap-child' ),
                'url' => home_url( '/resources/' ),
                'icon' => 'fas fa-folder-open',
                'order' => 50,
                'children' => array(
                    'study-guides' => array(
                        'title' => __( 'Study Guides', 'understrap-child' ),
                        'url' => home_url( '/resources/study-guides/' ),
                        'description' => __( 'Downloadable study materials', 'understrap-child' ),
                        'icon' => 'fas fa-file-pdf'
                    ),
                    'practice-exams' => array(
                        'title' => __( 'Practice Exams', 'understrap-child' ),
                        'url' => home_url( '/resources/practice-exams/' ),
                        'description' => __( 'Mock exams and practice questions', 'understrap-child' ),
                        'icon' => 'fas fa-clipboard-check'
                    ),
                    'templates' => array(
                        'title' => __( 'Templates', 'understrap-child' ),
                        'url' => home_url( '/resources/templates/' ),
                        'description' => __( 'Project management templates', 'understrap-child' ),
                        'icon' => 'fas fa-file-alt'
                    ),
                    'eco-reference' => array(
                        'title' => __( 'ECO Reference', 'understrap-child' ),
                        'url' => home_url( '/resources/eco-reference/' ),
                        'description' => __( 'Examination Content Outline', 'understrap-child' ),
                        'icon' => 'fas fa-list-ul'
                    )
                )
            ),
            'progress' => array(
                'title' => __( 'Progress', 'understrap-child' ),
                'url' => home_url( '/progress/' ),
                'icon' => 'fas fa-chart-line',
                'order' => 60,
                'show_when_logged_in' => true
            ),
            'support' => array(
                'title' => __( 'Support', 'understrap-child' ),
                'url' => home_url( '/support/' ),
                'icon' => 'fas fa-life-ring',
                'order' => 70
            )
        );
    }
    
    /**
     * Get the dashboard sidebar navigation structure
     * 
     * @return array Dashboard navigation structure
     */
    public static function get_dashboard_sidebar_structure() {
        return array(
            'my-progress' => array(
                'title' => __( 'My Progress', 'understrap-child' ),
                'url' => home_url( '/dashboard/progress/' ),
                'icon' => 'fas fa-chart-pie',
                'order' => 10
            ),
            'current-lesson' => array(
                'title' => __( 'Current Lesson', 'understrap-child' ),
                'url' => '#current-lesson',
                'icon' => 'fas fa-play-circle',
                'order' => 20,
                'dynamic' => true
            ),
            'upcoming-lessons' => array(
                'title' => __( 'Upcoming Lessons', 'understrap-child' ),
                'url' => home_url( '/dashboard/upcoming/' ),
                'icon' => 'fas fa-calendar-alt',
                'order' => 30
            ),
            'completed-lessons' => array(
                'title' => __( 'Completed Lessons', 'understrap-child' ),
                'url' => home_url( '/dashboard/completed/' ),
                'icon' => 'fas fa-check-circle',
                'order' => 40
            ),
            'practice-scores' => array(
                'title' => __( 'Practice Scores', 'understrap-child' ),
                'url' => home_url( '/dashboard/scores/' ),
                'icon' => 'fas fa-trophy',
                'order' => 50
            ),
            'study-schedule' => array(
                'title' => __( 'Study Schedule', 'understrap-child' ),
                'url' => home_url( '/dashboard/schedule/' ),
                'icon' => 'fas fa-calendar-week',
                'order' => 60
            ),
            'resources' => array(
                'title' => __( 'Resources', 'understrap-child' ),
                'url' => home_url( '/resources/' ),
                'icon' => 'fas fa-folder-open',
                'order' => 70
            ),
            'settings' => array(
                'title' => __( 'Settings', 'understrap-child' ),
                'url' => home_url( '/dashboard/settings/' ),
                'icon' => 'fas fa-cog',
                'order' => 80
            )
        );
    }
    
    /**
     * Get the footer widget navigation structure
     * 
     * @return array Footer navigation structure organized by columns
     */
    public static function get_footer_navigation_structure() {
        return array(
            'column-1-quick-links' => array(
                'title' => __( 'Quick Links', 'understrap-child' ),
                'items' => array(
                    'course-overview' => array(
                        'title' => __( 'Course Overview', 'understrap-child' ),
                        'url' => home_url( '/course-overview/' )
                    ),
                    'lesson-schedule' => array(
                        'title' => __( 'Lesson Schedule', 'understrap-child' ),
                        'url' => home_url( '/lessons/' )
                    ),
                    'practice-exams' => array(
                        'title' => __( 'Practice Exams', 'understrap-child' ),
                        'url' => home_url( '/resources/practice-exams/' )
                    ),
                    'study-resources' => array(
                        'title' => __( 'Study Resources', 'understrap-child' ),
                        'url' => home_url( '/resources/' )
                    )
                )
            ),
            'column-2-resources' => array(
                'title' => __( 'Resources', 'understrap-child' ),
                'items' => array(
                    'download-center' => array(
                        'title' => __( 'Download Center', 'understrap-child' ),
                        'url' => home_url( '/resources/downloads/' )
                    ),
                    'eco-reference' => array(
                        'title' => __( 'ECO Reference', 'understrap-child' ),
                        'url' => home_url( '/resources/eco-reference/' )
                    ),
                    'study-templates' => array(
                        'title' => __( 'Study Templates', 'understrap-child' ),
                        'url' => home_url( '/resources/templates/' )
                    ),
                    'faq' => array(
                        'title' => __( 'FAQ', 'understrap-child' ),
                        'url' => home_url( '/faq/' )
                    )
                )
            ),
            'column-3-connect' => array(
                'title' => __( 'Connect', 'understrap-child' ),
                'items' => array(
                    'contact' => array(
                        'title' => __( 'Contact Information', 'understrap-child' ),
                        'url' => home_url( '/contact/' ),
                        'type' => 'contact'
                    ),
                    'social-media' => array(
                        'title' => __( 'Social Media Links', 'understrap-child' ),
                        'type' => 'social'
                    ),
                    'newsletter' => array(
                        'title' => __( 'Newsletter Signup', 'understrap-child' ),
                        'type' => 'newsletter'
                    ),
                    'support' => array(
                        'title' => __( 'Support Links', 'understrap-child' ),
                        'url' => home_url( '/support/' )
                    )
                )
            )
        );
    }
    
    /**
     * Get breadcrumb navigation configuration
     * 
     * @return array Breadcrumb configuration
     */
    public static function get_breadcrumb_config() {
        return array(
            'separator' => ' / ',
            'home_text' => __( 'Home', 'understrap-child' ),
            'show_current' => true,
            'show_on_front' => false,
            'custom_post_types' => array(
                'lesson' => array(
                    'archive_text' => __( 'Lessons', 'understrap-child' ),
                    'archive_url' => home_url( '/lessons/' )
                ),
                'resource' => array(
                    'archive_text' => __( 'Resources', 'understrap-child' ),
                    'archive_url' => home_url( '/resources/' )
                )
            ),
            'custom_pages' => array(
                'dashboard' => array(
                    'text' => __( 'Dashboard', 'understrap-child' ),
                    'url' => home_url( '/dashboard/' )
                ),
                'resources' => array(
                    'text' => __( 'Resources', 'understrap-child' ),
                    'url' => home_url( '/resources/' )
                ),
                'lessons' => array(
                    'text' => __( 'Lessons', 'understrap-child' ),
                    'url' => home_url( '/lessons/' )
                ),
                'progress' => array(
                    'text' => __( 'Progress', 'understrap-child' ),
                    'url' => home_url( '/progress/' )
                ),
                'support' => array(
                    'text' => __( 'Support', 'understrap-child' ),
                    'url' => home_url( '/support/' )
                )
            )
        );
    }
    
    /**
     * Get mobile navigation configuration
     * 
     * @return array Mobile navigation settings
     */
    public static function get_mobile_navigation_config() {
        return array(
            'breakpoint' => 'lg', // Bootstrap breakpoint
            'collapse_behavior' => 'accordion',
            'show_icons' => true,
            'show_descriptions' => false,
            'max_depth' => 2
        );
    }
    
    /**
     * Get user role-based menu visibility rules
     * 
     * @return array Role-based visibility configuration
     */
    public static function get_role_based_visibility() {
        return array(
            'logged_out' => array(
                'hide' => array( 'my-dashboard', 'progress' ),
                'show' => array( 'home', 'course-overview', 'lessons', 'resources', 'support' )
            ),
            'subscriber' => array(
                'show_all' => true
            ),
            'student' => array(
                'show_all' => true,
                'additional' => array( 'advanced-resources' )
            ),
            'instructor' => array(
                'show_all' => true,
                'additional' => array( 'instructor-dashboard', 'student-management' )
            ),
            'administrator' => array(
                'show_all' => true,
                'additional' => array( 'admin-panel', 'site-settings' )
            )
        );
    }
}