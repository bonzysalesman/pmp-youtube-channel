<?php
/**
 * PMP YouTube Integration Class
 * 
 * Handles YouTube video integration, thumbnails, and progress tracking
 */

if (!defined('ABSPATH')) {
    exit;
}

class PMP_YouTube_Integration {
    
    private $api_key;
    private $channel_id;
    
    public function __construct() {
        $this->api_key = get_option('pmp_youtube_api_key', '');
        $this->channel_id = get_option('pmp_youtube_channel_id', '');
        
        add_action('init', [$this, 'init']);
        add_shortcode('pmp_video', [$this, 'video_shortcode']);
        add_action('wp_ajax_track_video_progress', [$this, 'track_video_progress']);
        add_action('wp_ajax_nopriv_track_video_progress', [$this, 'track_video_progress']);
    }
    
    public function init() {
        $this->enqueue_scripts();
    }
    
    /**
     * Enqueue YouTube integration scripts
     */
    private function enqueue_scripts() {
        add_action('wp_enqueue_scripts', function() {
            wp_enqueue_script(
                'pmp-youtube-integration',
                get_stylesheet_directory_uri() . '/assets/js/youtube-integration.js',
                ['jquery'],
                '1.0.0',
                true
            );
            
            wp_localize_script('pmp-youtube-integration', 'pmpYouTube', [
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('pmp_video_progress'),
                'userId' => get_current_user_id()
            ]);
        });
    }
    
    /**
     * Video shortcode for embedding YouTube videos
     * 
     * Usage: [pmp_video id="VIDEO_ID" title="Video Title" week="1" day="1"]
     */
    public function video_shortcode($atts) {
        $atts = shortcode_atts([
            'id' => '',
            'title' => '',
            'week' => '',
            'day' => '',
            'autoplay' => 'false',
            'lazy' => 'true'
        ], $atts);
        
        if (empty($atts['id'])) {
            return '<p>Error: Video ID is required.</p>';
        }
        
        $video_id = sanitize_text_field($atts['id']);
        $title = sanitize_text_field($atts['title']);
        $week = intval($atts['week']);
        $day = intval($atts['day']);
        $lazy = $atts['lazy'] === 'true';
        
        $thumbnail_url = $this->get_video_thumbnail($video_id);
        $embed_url = $this->get_embed_url($video_id, $atts['autoplay'] === 'true');
        
        ob_start();
        ?>
        <div class="video-container pmp-video" 
             data-video-id="<?php echo esc_attr($video_id); ?>"
             data-week="<?php echo esc_attr($week); ?>"
             data-day="<?php echo esc_attr($day); ?>"
             data-title="<?php echo esc_attr($title); ?>">
            
            <?php if ($lazy): ?>
                <img src="<?php echo esc_url($thumbnail_url); ?>" 
                     alt="<?php echo esc_attr($title); ?>" 
                     class="video-thumbnail lazy-load"
                     data-video-url="<?php echo esc_url($embed_url); ?>">
                <div class="video-play-button"></div>
            <?php else: ?>
                <iframe src="<?php echo esc_url($embed_url); ?>"
                        title="<?php echo esc_attr($title); ?>"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        class="loaded"></iframe>
            <?php endif; ?>
            
            <?php if ($title): ?>
                <div class="video-info">
                    <h4><?php echo esc_html($title); ?></h4>
                    <?php if ($week && $day): ?>
                        <p class="video-meta">Week <?php echo $week; ?>, Day <?php echo $day; ?></p>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Get video thumbnail URL
     */
    public function get_video_thumbnail($video_id, $quality = 'maxresdefault') {
        $qualities = ['maxresdefault', 'hqdefault', 'mqdefault', 'default'];
        
        if (!in_array($quality, $qualities)) {
            $quality = 'maxresdefault';
        }
        
        return "https://img.youtube.com/vi/{$video_id}/{$quality}.jpg";
    }
    
    /**
     * Get YouTube embed URL
     */
    private function get_embed_url($video_id, $autoplay = false) {
        $params = [
            'rel' => 0,
            'modestbranding' => 1,
            'showinfo' => 0
        ];
        
        if ($autoplay) {
            $params['autoplay'] = 1;
        }
        
        $query_string = http_build_query($params);
        return "https://www.youtube.com/embed/{$video_id}?{$query_string}";
    }
    
    /**
     * Track video progress via AJAX
     */
    public function track_video_progress() {
        check_ajax_referer('pmp_video_progress', 'nonce');
        
        $user_id = get_current_user_id();
        if (!$user_id) {
            wp_die('User not logged in');
        }
        
        $video_id = sanitize_text_field($_POST['video_id']);
        $progress = floatval($_POST['progress']);
        $week = intval($_POST['week']);
        $day = intval($_POST['day']);
        
        // Get existing progress
        $user_progress = get_user_meta($user_id, 'pmp_video_progress', true);
        if (!is_array($user_progress)) {
            $user_progress = [];
        }
        
        // Update progress
        $user_progress[$video_id] = [
            'progress' => $progress,
            'week' => $week,
            'day' => $day,
            'last_watched' => current_time('mysql'),
            'completed' => $progress >= 90 // Consider 90% as completed
        ];
        
        update_user_meta($user_id, 'pmp_video_progress', $user_progress);
        
        wp_send_json_success([
            'message' => 'Progress updated',
            'progress' => $progress,
            'completed' => $progress >= 90
        ]);
    }
    
    /**
     * Get user's video progress
     */
    public function get_user_video_progress($user_id = null, $video_id = null) {
        if (!$user_id) {
            $user_id = get_current_user_id();
        }
        
        $progress = get_user_meta($user_id, 'pmp_video_progress', true);
        if (!is_array($progress)) {
            return $video_id ? null : [];
        }
        
        return $video_id ? ($progress[$video_id] ?? null) : $progress;
    }
    
    /**
     * Get video metadata from YouTube API
     */
    public function get_video_metadata($video_id) {
        if (empty($this->api_key)) {
            return false;
        }
        
        $cache_key = 'pmp_video_meta_' . $video_id;
        $cached = get_transient($cache_key);
        
        if ($cached !== false) {
            return $cached;
        }
        
        $url = "https://www.googleapis.com/youtube/v3/videos";
        $params = [
            'id' => $video_id,
            'part' => 'snippet,contentDetails,statistics',
            'key' => $this->api_key
        ];
        
        $response = wp_remote_get($url . '?' . http_build_query($params));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (empty($data['items'])) {
            return false;
        }
        
        $video = $data['items'][0];
        $metadata = [
            'title' => $video['snippet']['title'],
            'description' => $video['snippet']['description'],
            'duration' => $this->parse_duration($video['contentDetails']['duration']),
            'published_at' => $video['snippet']['publishedAt'],
            'view_count' => intval($video['statistics']['viewCount']),
            'like_count' => intval($video['statistics']['likeCount'] ?? 0),
            'thumbnail' => $video['snippet']['thumbnails']['high']['url']
        ];
        
        // Cache for 1 hour
        set_transient($cache_key, $metadata, HOUR_IN_SECONDS);
        
        return $metadata;
    }
    
    /**
     * Parse YouTube duration format (PT4M13S) to seconds
     */
    private function parse_duration($duration) {
        $interval = new DateInterval($duration);
        return ($interval->h * 3600) + ($interval->i * 60) + $interval->s;
    }
    
    /**
     * Get playlist videos
     */
    public function get_playlist_videos($playlist_id) {
        if (empty($this->api_key)) {
            return [];
        }
        
        $cache_key = 'pmp_playlist_' . $playlist_id;
        $cached = get_transient($cache_key);
        
        if ($cached !== false) {
            return $cached;
        }
        
        $url = "https://www.googleapis.com/youtube/v3/playlistItems";
        $params = [
            'playlistId' => $playlist_id,
            'part' => 'snippet',
            'maxResults' => 50,
            'key' => $this->api_key
        ];
        
        $response = wp_remote_get($url . '?' . http_build_query($params));
        
        if (is_wp_error($response)) {
            return [];
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        $videos = [];
        if (!empty($data['items'])) {
            foreach ($data['items'] as $item) {
                $videos[] = [
                    'video_id' => $item['snippet']['resourceId']['videoId'],
                    'title' => $item['snippet']['title'],
                    'description' => $item['snippet']['description'],
                    'position' => $item['snippet']['position'],
                    'thumbnail' => $item['snippet']['thumbnails']['medium']['url']
                ];
            }
        }
        
        // Cache for 30 minutes
        set_transient($cache_key, $videos, 30 * MINUTE_IN_SECONDS);
        
        return $videos;
    }
}

// Initialize YouTube integration
new PMP_YouTube_Integration();