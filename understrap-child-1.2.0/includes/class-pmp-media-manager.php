<?php
/**
 * PMP Media Manager Class
 * 
 * Handles media library organization, optimization, and lazy loading
 * for the PMP WordPress theme.
 */

if (!defined('ABSPATH')) {
    exit;
}

class PMP_Media_Manager {
    
    private $media_folders = [
        'course-images' => [
            'week-thumbnails',
            'lesson-images', 
            'infographics'
        ],
        'documents' => [
            'study-guides',
            'templates',
            'checklists',
            'reference-materials'
        ],
        'interactive-content' => [
            'practice-questions',
            'assessments',
            'progress-trackers'
        ]
    ];
    
    public function __construct() {
        add_action('init', [$this, 'init']);
        add_filter('wp_get_attachment_image_attributes', [$this, 'add_lazy_loading'], 10, 3);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_media_scripts']);
    }
    
    public function init() {
        $this->ensure_media_folders_exist();
        $this->setup_media_optimization();
    }
    
    /**
     * Ensure all required media folders exist
     */
    private function ensure_media_folders_exist() {
        $upload_dir = wp_upload_dir();
        $base_path = $upload_dir['basedir'] . '/pmp-course/';
        
        foreach ($this->media_folders as $category => $folders) {
            $category_path = $base_path . $category . '/';
            
            if (!file_exists($category_path)) {
                wp_mkdir_p($category_path);
            }
            
            foreach ($folders as $folder) {
                $folder_path = $category_path . $folder . '/';
                if (!file_exists($folder_path)) {
                    wp_mkdir_p($folder_path);
                }
            }
        }
    }
    
    /**
     * Add lazy loading attributes to images
     */
    public function add_lazy_loading($attr, $attachment, $size) {
        if (!is_admin()) {
            $attr['loading'] = 'lazy';
            $attr['class'] = isset($attr['class']) ? $attr['class'] . ' lazy-load' : 'lazy-load';
        }
        return $attr;
    }
    
    /**
     * Enqueue media-related scripts and styles
     */
    public function enqueue_media_scripts() {
        wp_enqueue_script(
            'pmp-media-lazy-load',
            get_stylesheet_directory_uri() . '/assets/js/lazy-load.js',
            ['jquery'],
            '1.0.0',
            true
        );
        
        wp_enqueue_style(
            'pmp-media-styles',
            get_stylesheet_directory_uri() . '/assets/css/media.css',
            [],
            '1.0.0'
        );
    }
    
    /**
     * Setup media optimization
     */
    private function setup_media_optimization() {
        // Add WebP support
        add_filter('wp_check_filetype_and_ext', [$this, 'add_webp_support'], 10, 4);
        add_filter('upload_mimes', [$this, 'webp_upload_mimes']);
        
        // Optimize image sizes
        add_action('after_setup_theme', [$this, 'add_custom_image_sizes']);
    }
    
    /**
     * Add WebP support
     */
    public function add_webp_support($types, $file, $filename, $mimes) {
        if (false !== strpos($filename, '.webp')) {
            $types['ext'] = 'webp';
            $types['type'] = 'image/webp';
        }
        return $types;
    }
    
    /**
     * Allow WebP uploads
     */
    public function webp_upload_mimes($existing_mimes) {
        $existing_mimes['webp'] = 'image/webp';
        return $existing_mimes;
    }
    
    /**
     * Add custom image sizes for course content
     */
    public function add_custom_image_sizes() {
        // Week thumbnail size
        add_image_size('week-thumbnail', 300, 200, true);
        
        // Lesson image size
        add_image_size('lesson-image', 800, 450, true);
        
        // Infographic size
        add_image_size('infographic', 1200, 800, false);
        
        // Small thumbnail for widgets
        add_image_size('widget-thumb', 150, 100, true);
    }
    
    /**
     * Get organized media by category
     */
    public function get_media_by_category($category, $subfolder = '') {
        $upload_dir = wp_upload_dir();
        $media_path = $upload_dir['basedir'] . '/pmp-course/' . $category . '/';
        
        if ($subfolder) {
            $media_path .= $subfolder . '/';
        }
        
        if (!file_exists($media_path)) {
            return [];
        }
        
        $files = scandir($media_path);
        $media_files = [];
        
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..' && !is_dir($media_path . $file)) {
                $media_files[] = [
                    'filename' => $file,
                    'path' => $media_path . $file,
                    'url' => $upload_dir['baseurl'] . '/pmp-course/' . $category . '/' . ($subfolder ? $subfolder . '/' : '') . $file
                ];
            }
        }
        
        return $media_files;
    }
    
    /**
     * Generate thumbnail for video content
     */
    public function generate_video_thumbnail($video_url, $time = '00:00:01') {
        // This would integrate with YouTube API to get video thumbnails
        // For now, return a placeholder
        return get_stylesheet_directory_uri() . '/images/video-placeholder.jpg';
    }
    
    /**
     * Get optimized image URL
     */
    public function get_optimized_image($attachment_id, $size = 'medium') {
        $image = wp_get_attachment_image_src($attachment_id, $size);
        
        if ($image) {
            return [
                'url' => $image[0],
                'width' => $image[1],
                'height' => $image[2]
            ];
        }
        
        return false;
    }
}

// Initialize the media manager
new PMP_Media_Manager();