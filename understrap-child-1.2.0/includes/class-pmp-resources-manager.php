<?php
/**
 * PMP Resources Manager Class
 * 
 * Handles the organization and display of study resources
 * including PDFs, videos, and practice tools.
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

class PMP_Resources_Manager {
    
    private $user_id;
    
    /**
     * Constructor
     *
     * @param int $user_id Current user ID
     */
    public function __construct($user_id = null) {
        $this->user_id = $user_id ?: get_current_user_id();
    }
    
    /**
     * Get resources by category
     *
     * @param string $category Category to filter by
     * @return array Array of resources
     */
    public function get_resources_by_category($category = 'all') {
        $resources = $this->get_all_resources();
        
        if ($category === 'all') {
            return $resources;
        }
        
        return array_filter($resources, function($resource) use ($category) {
            return $resource['category'] === $category;
        });
    }
    
    /**
     * Get all available resources
     *
     * @return array Array of all resources
     */
    private function get_all_resources() {
        // This would typically come from database or custom post types
        // For now, returning sample data structure
        return [
            [
                'id' => 'pmp-formula-guide',
                'title' => 'PMP Formula Reference Guide',
                'description' => 'Complete reference for all PMP exam formulas including EVM, scheduling, and quality metrics.',
                'type' => 'pdf',
                'category' => 'study_guides',
                'file_url' => '/wp-content/uploads/resources/pmp-formulas.pdf',
                'file_size' => '2.4 MB',
                'thumbnail' => '/wp-content/uploads/resources/thumbs/formulas-thumb.jpg',
                'download_count' => 1247,
                'rating' => 4.8,
                'tags' => ['formulas', 'reference', 'calculations'],
                'related_lessons' => ['lesson-06-01', 'lesson-06-02'],
                'created_date' => '2024-01-15',
                'domain' => 'process'
            ],
            [
                'id' => 'eco-task-checklist',
                'title' => 'ECO Task Checklist',
                'description' => 'Comprehensive checklist covering all 35 ECO tasks with study tips and real-world examples.',
                'type' => 'pdf',
                'category' => 'study_guides',
                'file_url' => '/wp-content/uploads/resources/eco-checklist.pdf',
                'file_size' => '1.8 MB',
                'thumbnail' => '/wp-content/uploads/resources/thumbs/eco-thumb.jpg',
                'download_count' => 892,
                'rating' => 4.9,
                'tags' => ['eco', 'checklist', 'exam-prep'],
                'related_lessons' => ['lesson-01-01', 'lesson-13-02'],
                'created_date' => '2024-01-20',
                'domain' => 'mixed'
            ],
            [
                'id' => 'agile-hybrid-guide',
                'title' => 'Agile & Hybrid Approaches Guide',
                'description' => 'Deep dive into agile methodologies and hybrid project management approaches for the PMP exam.',
                'type' => 'pdf',
                'category' => 'study_guides',
                'file_url' => '/wp-content/uploads/resources/agile-hybrid.pdf',
                'file_size' => '3.2 MB',
                'thumbnail' => '/wp-content/uploads/resources/thumbs/agile-thumb.jpg',
                'download_count' => 1156,
                'rating' => 4.7,
                'tags' => ['agile', 'hybrid', 'methodology'],
                'related_lessons' => ['lesson-05-01', 'lesson-05-02'],
                'created_date' => '2024-01-25',
                'domain' => 'process'
            ],
            [
                'id' => 'practice-exam-simulator',
                'title' => 'PMP Practice Exam Simulator',
                'description' => 'Interactive practice exam with 200 questions, detailed explanations, and performance analytics.',
                'type' => 'tool',
                'category' => 'practice_tools',
                'access_url' => '/practice-exam-simulator',
                'thumbnail' => '/wp-content/uploads/resources/thumbs/simulator-thumb.jpg',
                'usage_count' => 2341,
                'rating' => 4.9,
                'tags' => ['practice', 'exam', 'simulator'],
                'features' => ['200 questions', 'Performance analytics', 'Detailed explanations'],
                'created_date' => '2024-02-01',
                'domain' => 'mixed'
            ],
            [
                'id' => 'stakeholder-analysis-tool',
                'title' => 'Stakeholder Analysis Tool',
                'description' => 'Interactive tool for creating stakeholder analysis matrices and engagement strategies.',
                'type' => 'tool',
                'category' => 'practice_tools',
                'access_url' => '/stakeholder-analysis-tool',
                'thumbnail' => '/wp-content/uploads/resources/thumbs/stakeholder-thumb.jpg',
                'usage_count' => 567,
                'rating' => 4.6,
                'tags' => ['stakeholder', 'analysis', 'engagement'],
                'features' => ['Matrix generator', 'Engagement strategies', 'Export options'],
                'created_date' => '2024-02-05',
                'domain' => 'people'
            ],
            [
                'id' => 'risk-register-template',
                'title' => 'Risk Register Template',
                'description' => 'Comprehensive Excel template for risk identification, analysis, and response planning.',
                'type' => 'tool',
                'category' => 'practice_tools',
                'access_url' => '/wp-content/uploads/resources/risk-register-template.xlsx',
                'file_size' => '156 KB',
                'thumbnail' => '/wp-content/uploads/resources/thumbs/risk-thumb.jpg',
                'download_count' => 834,
                'rating' => 4.8,
                'tags' => ['risk', 'template', 'planning'],
                'features' => ['Risk identification', 'Probability/Impact matrix', 'Response strategies'],
                'created_date' => '2024-02-10',
                'domain' => 'process'
            ],
            [
                'id' => 'pmp-overview-video',
                'title' => 'PMP Certification Overview',
                'description' => 'Complete overview of the PMP certification process, exam structure, and study strategies.',
                'type' => 'video',
                'category' => 'videos',
                'video_url' => 'https://youtube.com/watch?v=example1',
                'duration' => '18:45',
                'thumbnail' => '/wp-content/uploads/resources/thumbs/overview-video-thumb.jpg',
                'view_count' => 3421,
                'rating' => 4.7,
                'tags' => ['overview', 'certification', 'exam-prep'],
                'transcript_available' => true,
                'created_date' => '2024-01-10',
                'domain' => 'mixed'
            ],
            [
                'id' => 'agile-fundamentals-video',
                'title' => 'Agile Fundamentals for PMP',
                'description' => 'Essential agile concepts and practices that PMP candidates need to understand.',
                'type' => 'video',
                'category' => 'videos',
                'video_url' => 'https://youtube.com/watch?v=example2',
                'duration' => '22:30',
                'thumbnail' => '/wp-content/uploads/resources/thumbs/agile-video-thumb.jpg',
                'view_count' => 2156,
                'rating' => 4.8,
                'tags' => ['agile', 'fundamentals', 'methodology'],
                'transcript_available' => true,
                'created_date' => '2024-01-18',
                'domain' => 'process'
            ],
            [
                'id' => 'leadership-skills-video',
                'title' => 'Leadership Skills for Project Managers',
                'description' => 'Key leadership competencies and soft skills essential for successful project management.',
                'type' => 'video',
                'category' => 'videos',
                'video_url' => 'https://youtube.com/watch?v=example3',
                'duration' => '25:12',
                'thumbnail' => '/wp-content/uploads/resources/thumbs/leadership-video-thumb.jpg',
                'view_count' => 1789,
                'rating' => 4.9,
                'tags' => ['leadership', 'soft-skills', 'management'],
                'transcript_available' => true,
                'created_date' => '2024-01-22',
                'domain' => 'people'
            ]
        ];
    }
    
    /**
     * Render resource grid
     *
     * @param array $resources Array of resources to display
     * @return string HTML output
     */
    public function render_resource_grid($resources) {
        if (empty($resources)) {
            return '<div class="no-resources"><p>No resources found matching your criteria.</p></div>';
        }
        
        $output = '<div class="resources-grid">';
        
        foreach ($resources as $resource) {
            $output .= $this->render_resource_card($resource);
        }
        
        $output .= '</div>';
        
        return $output;
    }
    
    /**
     * Render individual resource card
     *
     * @param array $resource Resource data
     * @return string HTML output
     */
    public function render_resource_card($resource) {
        $domain_class = 'domain-' . $resource['domain'];
        $type_class = 'resource-type-' . $resource['type'];
        
        $output = '<div class="resource-card ' . $domain_class . ' ' . $type_class . '" data-resource-id="' . esc_attr($resource['id']) . '">';
        
        // Render based on resource type
        switch ($resource['type']) {
            case 'pdf':
                $output .= $this->render_pdf_card_content($resource);
                break;
            case 'video':
                $output .= $this->render_video_card_content($resource);
                break;
            case 'tool':
                $output .= $this->render_tool_card_content($resource);
                break;
            default:
                $output .= $this->render_default_card_content($resource);
                break;
        }
        
        $output .= '</div>'; // .resource-card
        
        return $output;
    }
    
    /**
     * Render PDF resource card content
     *
     * @param array $resource Resource data
     * @return string HTML output
     */
    private function render_pdf_card_content($resource) {
        $output = '';
        
        // PDF Thumbnail with file type indicator
        $output .= '<div class="resource-thumbnail pdf-thumbnail">';
        $output .= '<div class="file-type-indicator">PDF</div>';
        if (isset($resource['thumbnail'])) {
            $output .= '<img src="' . esc_url($resource['thumbnail']) . '" alt="' . esc_attr($resource['title']) . '">';
        } else {
            $output .= '<div class="default-pdf-icon"><i class="fas fa-file-pdf fa-3x"></i></div>';
        }
        $output .= '</div>';
        
        // Content
        $output .= '<div class="resource-content">';
        $output .= '<div class="resource-type-badge pdf-badge"><i class="fas fa-file-pdf"></i> Study Guide</div>';
        $output .= '<h3 class="resource-title">' . esc_html($resource['title']) . '</h3>';
        $output .= '<p class="resource-description">' . esc_html($resource['description']) . '</p>';
        
        // PDF-specific meta information
        $output .= '<div class="resource-meta pdf-meta">';
        if (isset($resource['file_size'])) {
            $output .= '<span class="file-size"><i class="fas fa-file"></i> ' . esc_html($resource['file_size']) . '</span>';
        }
        if (isset($resource['download_count'])) {
            $output .= '<span class="download-count"><i class="fas fa-download"></i> ' . number_format($resource['download_count']) . ' downloads</span>';
        }
        $output .= '<span class="rating"><i class="fas fa-star"></i> ' . $resource['rating'] . '</span>';
        $output .= '</div>';
        
        // Tags
        $output .= $this->render_resource_tags($resource);
        
        // PDF Action button
        $output .= '<div class="resource-actions">';
        $output .= '<a href="' . esc_url($resource['file_url']) . '" class="btn btn-primary resource-download pdf-download" download>';
        $output .= '<i class="fas fa-download"></i> Download PDF';
        $output .= '</a>';
        $output .= '</div>';
        
        $output .= '</div>'; // .resource-content
        
        return $output;
    }
    
    /**
     * Render video resource card content
     *
     * @param array $resource Resource data
     * @return string HTML output
     */
    private function render_video_card_content($resource) {
        $output = '';
        
        // Video Thumbnail with duration overlay
        $output .= '<div class="resource-thumbnail video-thumbnail">';
        $output .= '<div class="video-duration-overlay">' . $resource['duration'] . '</div>';
        $output .= '<div class="video-play-overlay"><i class="fas fa-play-circle fa-3x"></i></div>';
        if (isset($resource['thumbnail'])) {
            $output .= '<img src="' . esc_url($resource['thumbnail']) . '" alt="' . esc_attr($resource['title']) . '">';
        } else {
            $output .= '<div class="default-video-bg"><i class="fas fa-video fa-3x"></i></div>';
        }
        $output .= '</div>';
        
        // Content
        $output .= '<div class="resource-content">';
        $output .= '<div class="resource-type-badge video-badge"><i class="fas fa-play-circle"></i> Video Tutorial</div>';
        $output .= '<h3 class="resource-title">' . esc_html($resource['title']) . '</h3>';
        $output .= '<p class="resource-description">' . esc_html($resource['description']) . '</p>';
        
        // Video-specific meta information
        $output .= '<div class="resource-meta video-meta">';
        $output .= '<span class="video-duration"><i class="fas fa-clock"></i> ' . $resource['duration'] . '</span>';
        if (isset($resource['view_count'])) {
            $output .= '<span class="view-count"><i class="fas fa-eye"></i> ' . number_format($resource['view_count']) . ' views</span>';
        }
        $output .= '<span class="rating"><i class="fas fa-star"></i> ' . $resource['rating'] . '</span>';
        if (isset($resource['transcript_available']) && $resource['transcript_available']) {
            $output .= '<span class="transcript-available"><i class="fas fa-closed-captioning"></i> Transcript</span>';
        }
        $output .= '</div>';
        
        // Tags
        $output .= $this->render_resource_tags($resource);
        
        // Video Action button
        $output .= '<div class="resource-actions">';
        $output .= '<a href="' . esc_url($resource['video_url']) . '" class="btn btn-primary resource-watch video-watch" target="_blank">';
        $output .= '<i class="fas fa-play"></i> Watch Video';
        $output .= '</a>';
        $output .= '</div>';
        
        $output .= '</div>'; // .resource-content
        
        return $output;
    }
    
    /**
     * Render practice tool card content
     *
     * @param array $resource Resource data
     * @return string HTML output
     */
    private function render_tool_card_content($resource) {
        $output = '';
        
        // Tool Thumbnail with interactive indicator
        $output .= '<div class="resource-thumbnail tool-thumbnail">';
        $output .= '<div class="tool-type-indicator">TOOL</div>';
        if (isset($resource['thumbnail'])) {
            $output .= '<img src="' . esc_url($resource['thumbnail']) . '" alt="' . esc_attr($resource['title']) . '">';
        } else {
            $output .= '<div class="default-tool-icon"><i class="fas fa-tools fa-3x"></i></div>';
        }
        $output .= '<div class="interactive-overlay"><i class="fas fa-mouse-pointer"></i> Interactive</div>';
        $output .= '</div>';
        
        // Content
        $output .= '<div class="resource-content">';
        $output .= '<div class="resource-type-badge tool-badge"><i class="fas fa-tools"></i> Practice Tool</div>';
        $output .= '<h3 class="resource-title">' . esc_html($resource['title']) . '</h3>';
        $output .= '<p class="resource-description">' . esc_html($resource['description']) . '</p>';
        
        // Tool features
        if (isset($resource['features']) && !empty($resource['features'])) {
            $output .= '<div class="tool-features">';
            $output .= '<h5 class="features-title">Features:</h5>';
            $output .= '<ul class="features-list">';
            foreach ($resource['features'] as $feature) {
                $output .= '<li><i class="fas fa-check-circle"></i> ' . esc_html($feature) . '</li>';
            }
            $output .= '</ul>';
            $output .= '</div>';
        }
        
        // Tool-specific meta information
        $output .= '<div class="resource-meta tool-meta">';
        if (isset($resource['file_size'])) {
            $output .= '<span class="file-size"><i class="fas fa-file"></i> ' . esc_html($resource['file_size']) . '</span>';
        }
        if (isset($resource['download_count'])) {
            $output .= '<span class="download-count"><i class="fas fa-download"></i> ' . number_format($resource['download_count']) . ' downloads</span>';
        }
        if (isset($resource['usage_count'])) {
            $output .= '<span class="usage-count"><i class="fas fa-users"></i> ' . number_format($resource['usage_count']) . ' uses</span>';
        }
        $output .= '<span class="rating"><i class="fas fa-star"></i> ' . $resource['rating'] . '</span>';
        $output .= '</div>';
        
        // Tags
        $output .= $this->render_resource_tags($resource);
        
        // Tool Action button
        $output .= '<div class="resource-actions">';
        if (isset($resource['file_size'])) {
            // Downloadable tool
            $output .= '<a href="' . esc_url($resource['access_url']) . '" class="btn btn-primary resource-download tool-download" download>';
            $output .= '<i class="fas fa-download"></i> Download Tool';
            $output .= '</a>';
        } else {
            // Interactive tool
            $output .= '<a href="' . esc_url($resource['access_url']) . '" class="btn btn-primary resource-use tool-use" target="_blank">';
            $output .= '<i class="fas fa-external-link-alt"></i> Use Tool';
            $output .= '</a>';
        }
        $output .= '</div>';
        
        $output .= '</div>'; // .resource-content
        
        return $output;
    }
    
    /**
     * Render default resource card content
     *
     * @param array $resource Resource data
     * @return string HTML output
     */
    private function render_default_card_content($resource) {
        $output = '';
        
        // Default Thumbnail
        $output .= '<div class="resource-thumbnail">';
        if (isset($resource['thumbnail'])) {
            $output .= '<img src="' . esc_url($resource['thumbnail']) . '" alt="' . esc_attr($resource['title']) . '">';
        } else {
            $output .= '<div class="default-resource-icon"><i class="fas fa-file fa-3x"></i></div>';
        }
        $output .= '</div>';
        
        // Content
        $output .= '<div class="resource-content">';
        $output .= '<h3 class="resource-title">' . esc_html($resource['title']) . '</h3>';
        $output .= '<p class="resource-description">' . esc_html($resource['description']) . '</p>';
        
        // Meta information
        $output .= '<div class="resource-meta">';
        $output .= '<span class="rating"><i class="fas fa-star"></i> ' . $resource['rating'] . '</span>';
        $output .= '</div>';
        
        // Tags
        $output .= $this->render_resource_tags($resource);
        
        // Action button
        $output .= '<div class="resource-actions">';
        $output .= '<a href="#" class="btn btn-primary resource-access">';
        $output .= '<i class="fas fa-arrow-right"></i> Access';
        $output .= '</a>';
        $output .= '</div>';
        
        $output .= '</div>'; // .resource-content
        
        return $output;
    }
    
    /**
     * Render resource tags
     *
     * @param array $resource Resource data
     * @return string HTML output
     */
    private function render_resource_tags($resource) {
        $output = '';
        
        if (!empty($resource['tags'])) {
            $output .= '<div class="resource-tags">';
            foreach ($resource['tags'] as $tag) {
                $output .= '<span class="tag">' . esc_html($tag) . '</span>';
            }
            $output .= '</div>';
        }
        
        return $output;
    }
    
    /**
     * Get appropriate action button for resource type
     *
     * @param array $resource Resource data
     * @return string HTML button
     */
    private function get_resource_action_button($resource) {
        switch ($resource['type']) {
            case 'pdf':
                return '<a href="' . esc_url($resource['file_url']) . '" class="btn btn-primary resource-download" download>
                    <i class="fas fa-download"></i> Download PDF
                </a>';
                
            case 'video':
                return '<a href="' . esc_url($resource['video_url']) . '" class="btn btn-primary resource-watch" target="_blank">
                    <i class="fas fa-play"></i> Watch Video
                </a>';
                
            case 'tool':
                if (isset($resource['file_size'])) {
                    // Downloadable tool
                    return '<a href="' . esc_url($resource['access_url']) . '" class="btn btn-primary resource-download" download>
                        <i class="fas fa-download"></i> Download Tool
                    </a>';
                } else {
                    // Interactive tool
                    return '<a href="' . esc_url($resource['access_url']) . '" class="btn btn-primary resource-use">
                        <i class="fas fa-external-link-alt"></i> Use Tool
                    </a>';
                }
                
            default:
                return '<a href="#" class="btn btn-primary resource-access">
                    <i class="fas fa-arrow-right"></i> Access
                </a>';
        }
    }
    
    /**
     * Track resource usage
     *
     * @param string $resource_id Resource ID
     * @param int $user_id User ID
     * @return void
     */
    public function track_resource_usage($resource_id, $user_id = null) {
        $user_id = $user_id ?: $this->user_id;
        
        if (!$user_id || !$resource_id) {
            return;
        }
        
        // Get existing resource usage
        $resource_usage = get_user_meta($user_id, 'pmp_resource_usage', true);
        if (!is_array($resource_usage)) {
            $resource_usage = [];
        }
        
        // Track usage
        if (!isset($resource_usage[$resource_id])) {
            $resource_usage[$resource_id] = [];
        }
        
        $resource_usage[$resource_id][] = current_time('mysql');
        
        // Keep only last 50 accesses per resource
        $resource_usage[$resource_id] = array_slice($resource_usage[$resource_id], -50);
        
        update_user_meta($user_id, 'pmp_resource_usage', $resource_usage);
    }
    
    /**
     * Get popular resources
     *
     * @param int $limit Number of resources to return
     * @return array Array of popular resources
     */
    public function get_popular_resources($limit = 6) {
        $resources = $this->get_all_resources();
        
        // Sort by download/usage/view count
        usort($resources, function($a, $b) {
            $count_a = $a['download_count'] ?? $a['usage_count'] ?? $a['view_count'] ?? 0;
            $count_b = $b['download_count'] ?? $b['usage_count'] ?? $b['view_count'] ?? 0;
            return $count_b - $count_a;
        });
        
        return array_slice($resources, 0, $limit);
    }
    
    /**
     * Get available categories
     *
     * @return array Array of categories
     */
    public function get_categories() {
        return [
            'all' => [
                'name' => 'All Resources',
                'icon' => 'fas fa-th-large',
                'description' => 'Browse all available study resources'
            ],
            'study_guides' => [
                'name' => 'Study Guides',
                'icon' => 'fas fa-book',
                'description' => 'Comprehensive guides and reference materials'
            ],
            'videos' => [
                'name' => 'Videos',
                'icon' => 'fas fa-play-circle',
                'description' => 'Video tutorials and explanations'
            ],
            'practice_tools' => [
                'name' => 'Practice Tools',
                'icon' => 'fas fa-tools',
                'description' => 'Interactive tools and templates'
            ]
        ];
    }
    
    /**
     * Get resource statistics
     *
     * @return array Statistics array
     */
    public function get_resource_stats() {
        $resources = $this->get_all_resources();
        $categories = $this->get_categories();
        
        $stats = [
            'total' => count($resources),
            'by_category' => []
        ];
        
        foreach ($categories as $cat_key => $category) {
            if ($cat_key === 'all') continue;
            
            $count = count(array_filter($resources, function($resource) use ($cat_key) {
                return $resource['category'] === $cat_key;
            }));
            
            $stats['by_category'][$cat_key] = $count;
        }
        
        return $stats;
    }
}