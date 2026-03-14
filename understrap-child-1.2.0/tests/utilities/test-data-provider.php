<?php
/**
 * Test Data Provider for PMP WordPress Frontend Tests
 */

class PMP_Test_Data_Provider {
    
    /**
     * Get sample course modules data
     */
    public static function get_sample_course_modules() {
        return [
            [
                'id' => 'week-01',
                'title' => 'PMP Foundations',
                'description' => 'Introduction to PMP concepts and exam structure',
                'week_number' => 1,
                'domain_focus' => 'mixed',
                'total_lessons' => 3,
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
                'total_lessons' => 2,
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
            ]
        ];
    }
    
    /**
     * Get sample user progress data
     */
    public static function get_sample_user_progress() {
        return [
            'percentage' => 40.0,
            'completed' => 2,
            'total' => 5,
            'current_week' => 1,
            'lessons_completed' => ['lesson-01-01', 'lesson-01-02'],
            'time_spent' => 38,
            'last_activity' => '2024-02-15 14:30:00'
        ];
    }
    
    /**
     * Get sample lesson data
     */
    public static function get_sample_lesson() {
        return [
            'id' => 'lesson-01-01',
            'title' => 'PMP Exam Overview',
            'description' => 'Introduction to the PMP certification and exam structure',
            'week' => 1,
            'module' => 'Foundations',
            'duration' => '20 minutes',
            'url' => 'https://example.com/lesson/pmp-exam-overview/',
            'thumbnail' => 'https://example.com/wp-content/themes/understrap-child/images/lessons/lesson-01-01.jpg',
            'difficulty' => 'Beginner',
            'eco_tasks' => ['ECO-1.1', 'ECO-1.2'],
            'prerequisites' => [],
            'estimated_time' => 20
        ];
    }
    
    /**
     * Get sample activity data
     */
    public static function get_sample_activities() {
        return [
            [
                'title' => 'Completed: PMP Exam Overview',
                'type' => 'completed',
                'timestamp' => '2024-02-15 14:30:00',
                'meta' => ['lesson_id' => 'lesson-01-01']
            ],
            [
                'title' => 'Started: PMP Mindset Principles',
                'type' => 'started',
                'timestamp' => '2024-02-15 14:00:00',
                'meta' => ['lesson_id' => 'lesson-01-02']
            ],
            [
                'title' => 'Downloaded: Study Guide PDF',
                'type' => 'resource',
                'timestamp' => '2024-02-15 13:45:00',
                'meta' => ['resource_id' => 'study-guide-pdf']
            ]
        ];
    }
    
    /**
     * Get sample dashboard summary
     */
    public static function get_sample_dashboard_summary() {
        return [
            'progress_percentage' => 40.0,
            'lessons_completed' => 2,
            'lessons_remaining' => 3,
            'current_week' => 1,
            'next_lesson_title' => 'Study Strategy Setup',
            'estimated_completion' => 'Mar 15, 2024',
            'study_streak' => 3,
            'achievements_earned' => 1
        ];
    }
    
    /**
     * Get sample module progress
     */
    public static function get_sample_module_progress() {
        return [
            'percentage' => 67,
            'completed' => 2,
            'total' => 3
        ];
    }
}