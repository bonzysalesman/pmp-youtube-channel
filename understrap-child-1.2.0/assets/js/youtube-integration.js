/**
 * YouTube Integration for PMP Course
 * Handles video loading, progress tracking, and user interaction
 */

(function($) {
    'use strict';
    
    class YouTubeIntegration {
        constructor() {
            this.players = {};
            this.progressTracking = {};
            this.init();
        }
        
        init() {
            this.setupVideoClickHandlers();
            this.loadYouTubeAPI();
            this.setupProgressTracking();
        }
        
        setupVideoClickHandlers() {
            $(document).on('click', '.video-thumbnail, .video-play-button', (e) => {
                e.preventDefault();
                const $container = $(e.target).closest('.video-container');
                this.loadVideo($container);
            });
        }
        
        loadVideo($container) {
            const videoId = $container.data('video-id');
            const title = $container.data('title');
            const week = $container.data('week');
            const day = $container.data('day');
            
            if (!videoId) return;
            
            // Replace thumbnail with iframe
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&enablejsapi=1`;
            
            const $iframe = $('<iframe>')
                .attr({
                    'src': embedUrl,
                    'title': title,
                    'frameborder': '0',
                    'allowfullscreen': true,
                    'id': `player-${videoId}`
                })
                .attr('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture')
                .addClass('loaded');
            
            $container.html($iframe);
            
            // Initialize progress tracking for this video
            this.initProgressTracking(videoId, week, day);
        }
        
        loadYouTubeAPI() {
            if (window.YT && window.YT.Player) {
                this.onYouTubeAPIReady();
                return;
            }
            
            window.onYouTubeIframeAPIReady = () => {
                this.onYouTubeAPIReady();
            };
            
            if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
        }
        
        onYouTubeAPIReady() {
            // Initialize players for any existing iframes
            $('iframe[id^="player-"]').each((index, iframe) => {
                const videoId = iframe.id.replace('player-', '');
                this.createPlayer(iframe.id, videoId);
            });
        }
        
        createPlayer(elementId, videoId) {
            if (this.players[videoId]) return;
            
            this.players[videoId] = new YT.Player(elementId, {
                events: {
                    'onReady': (event) => this.onPlayerReady(event, videoId),
                    'onStateChange': (event) => this.onPlayerStateChange(event, videoId)
                }
            });
        }
        
        onPlayerReady(event, videoId) {
            console.log(`Player ready for video: ${videoId}`);
            
            // Start progress tracking
            this.startProgressTracking(videoId);
        }
        
        onPlayerStateChange(event, videoId) {
            const player = this.players[videoId];
            
            switch (event.data) {
                case YT.PlayerState.PLAYING:
                    this.onVideoPlay(videoId);
                    break;
                case YT.PlayerState.PAUSED:
                    this.onVideoPause(videoId);
                    break;
                case YT.PlayerState.ENDED:
                    this.onVideoEnd(videoId);
                    break;
            }
        }
        
        onVideoPlay(videoId) {
            console.log(`Video playing: ${videoId}`);
            this.startProgressTracking(videoId);
        }
        
        onVideoPause(videoId) {
            console.log(`Video paused: ${videoId}`);
            this.saveProgress(videoId);
        }
        
        onVideoEnd(videoId) {
            console.log(`Video ended: ${videoId}`);
            this.saveProgress(videoId, 100);
            this.markVideoComplete(videoId);
        }
        
        initProgressTracking(videoId, week, day) {
            this.progressTracking[videoId] = {
                week: week,
                day: day,
                lastProgress: 0,
                interval: null
            };
        }
        
        startProgressTracking(videoId) {
            if (!this.players[videoId] || this.progressTracking[videoId]?.interval) return;
            
            this.progressTracking[videoId].interval = setInterval(() => {
                this.trackProgress(videoId);
            }, 5000); // Track every 5 seconds
        }
        
        stopProgressTracking(videoId) {
            if (this.progressTracking[videoId]?.interval) {
                clearInterval(this.progressTracking[videoId].interval);
                this.progressTracking[videoId].interval = null;
            }
        }
        
        trackProgress(videoId) {
            const player = this.players[videoId];
            if (!player || typeof player.getCurrentTime !== 'function') return;
            
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            if (duration > 0) {
                const progress = Math.round((currentTime / duration) * 100);
                const tracking = this.progressTracking[videoId];
                
                // Only save if progress increased by at least 5%
                if (progress > tracking.lastProgress + 5) {
                    tracking.lastProgress = progress;
                    this.saveProgress(videoId, progress);
                }
            }
        }
        
        saveProgress(videoId, progress = null) {
            const player = this.players[videoId];
            const tracking = this.progressTracking[videoId];
            
            if (!player || !tracking) return;
            
            if (progress === null) {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                progress = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
            }
            
            // Don't save if progress is 0 or hasn't changed significantly
            if (progress === 0 || Math.abs(progress - tracking.lastProgress) < 2) return;
            
            $.ajax({
                url: pmpYouTube.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'track_video_progress',
                    nonce: pmpYouTube.nonce,
                    video_id: videoId,
                    progress: progress,
                    week: tracking.week,
                    day: tracking.day
                },
                success: (response) => {
                    if (response.success) {
                        console.log(`Progress saved: ${videoId} - ${progress}%`);
                        
                        // Trigger custom event
                        $(document).trigger('videoProgressUpdated', {
                            videoId: videoId,
                            progress: progress,
                            completed: response.data.completed
                        });
                    }
                },
                error: (xhr, status, error) => {
                    console.error('Failed to save video progress:', error);
                }
            });
        }
        
        markVideoComplete(videoId) {
            const $container = $(`.video-container[data-video-id="${videoId}"]`);
            $container.addClass('completed');
            
            // Add completion indicator
            if (!$container.find('.completion-badge').length) {
                $container.append('<div class="completion-badge">✓ Completed</div>');
            }
            
            // Update dashboard if present
            this.updateDashboardProgress();
        }
        
        updateDashboardProgress() {
            // Trigger dashboard update
            if (typeof window.pmpDashboard !== 'undefined') {
                window.pmpDashboard.refreshProgress();
            }
        }
        
        setupProgressTracking() {
            // Clean up intervals when page unloads
            $(window).on('beforeunload', () => {
                Object.keys(this.progressTracking).forEach(videoId => {
                    this.stopProgressTracking(videoId);
                    this.saveProgress(videoId);
                });
            });
            
            // Handle visibility change (tab switching)
            document.addEventListener('visibilitychange', () => {
                Object.keys(this.players).forEach(videoId => {
                    if (document.hidden) {
                        this.stopProgressTracking(videoId);
                        this.saveProgress(videoId);
                    } else {
                        this.startProgressTracking(videoId);
                    }
                });
            });
        }
        
        // Public methods for external use
        getVideoProgress(videoId) {
            const player = this.players[videoId];
            if (!player) return 0;
            
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            return duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
        }
        
        seekToProgress(videoId, percentage) {
            const player = this.players[videoId];
            if (!player) return;
            
            const duration = player.getDuration();
            const seekTime = (duration * percentage) / 100;
            
            player.seekTo(seekTime);
        }
    }
    
    // Playlist management
    class PlaylistManager {
        constructor() {
            this.currentPlaylist = [];
            this.currentIndex = 0;
            this.init();
        }
        
        init() {
            this.setupPlaylistControls();
        }
        
        setupPlaylistControls() {
            $(document).on('click', '.playlist-next', () => {
                this.playNext();
            });
            
            $(document).on('click', '.playlist-prev', () => {
                this.playPrevious();
            });
            
            $(document).on('videoProgressUpdated', (e, data) => {
                if (data.completed) {
                    this.autoPlayNext();
                }
            });
        }
        
        loadPlaylist(videos) {
            this.currentPlaylist = videos;
            this.currentIndex = 0;
            this.renderPlaylist();
        }
        
        renderPlaylist() {
            const $container = $('.playlist-container');
            if (!$container.length) return;
            
            let html = '<div class="playlist-items">';
            
            this.currentPlaylist.forEach((video, index) => {
                const isActive = index === this.currentIndex ? 'active' : '';
                html += `
                    <div class="playlist-item ${isActive}" data-index="${index}">
                        <img src="${video.thumbnail}" alt="${video.title}" class="playlist-thumb">
                        <div class="playlist-info">
                            <h5>${video.title}</h5>
                            <span class="playlist-duration">${video.duration || ''}</span>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            $container.html(html);
        }
        
        playNext() {
            if (this.currentIndex < this.currentPlaylist.length - 1) {
                this.currentIndex++;
                this.playCurrentVideo();
            }
        }
        
        playPrevious() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.playCurrentVideo();
            }
        }
        
        playCurrentVideo() {
            const video = this.currentPlaylist[this.currentIndex];
            if (!video) return;
            
            // Update active playlist item
            $('.playlist-item').removeClass('active');
            $(`.playlist-item[data-index="${this.currentIndex}"]`).addClass('active');
            
            // Load video in main player
            const $mainPlayer = $('.main-video-container');
            if ($mainPlayer.length) {
                $mainPlayer.attr('data-video-id', video.video_id);
                $mainPlayer.find('.video-thumbnail').attr('src', video.thumbnail);
            }
        }
        
        autoPlayNext() {
            // Auto-play next video after a short delay
            setTimeout(() => {
                this.playNext();
            }, 2000);
        }
    }
    
    // Initialize when DOM is ready
    $(document).ready(() => {
        window.pmpYouTube = new YouTubeIntegration();
        window.pmpPlaylist = new PlaylistManager();
        
        // Handle playlist item clicks
        $(document).on('click', '.playlist-item', function() {
            const index = parseInt($(this).data('index'));
            window.pmpPlaylist.currentIndex = index;
            window.pmpPlaylist.playCurrentVideo();
        });
    });
    
})(jQuery);