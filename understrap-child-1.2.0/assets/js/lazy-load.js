/**
 * Lazy Loading Implementation for PMP Course Media
 */

(function($) {
    'use strict';
    
    class LazyLoader {
        constructor() {
            this.images = [];
            this.observer = null;
            this.init();
        }
        
        init() {
            // Check if Intersection Observer is supported
            if ('IntersectionObserver' in window) {
                this.setupIntersectionObserver();
            } else {
                // Fallback for older browsers
                this.setupScrollListener();
            }
            
            this.findLazyImages();
        }
        
        setupIntersectionObserver() {
            const options = {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, options);
        }
        
        setupScrollListener() {
            let ticking = false;
            
            const checkImages = () => {
                this.images.forEach((img, index) => {
                    if (this.isInViewport(img)) {
                        this.loadImage(img);
                        this.images.splice(index, 1);
                    }
                });
                ticking = false;
            };
            
            $(window).on('scroll resize', () => {
                if (!ticking) {
                    requestAnimationFrame(checkImages);
                    ticking = true;
                }
            });
            
            // Initial check
            checkImages();
        }
        
        findLazyImages() {
            const lazyImages = document.querySelectorAll('img[data-src], img.lazy-load');
            
            lazyImages.forEach(img => {
                if (this.observer) {
                    this.observer.observe(img);
                } else {
                    this.images.push(img);
                }
            });
        }
        
        loadImage(img) {
            // Show loading placeholder
            img.classList.add('loading');
            
            const actualSrc = img.dataset.src || img.src;
            const tempImg = new Image();
            
            tempImg.onload = () => {
                img.src = actualSrc;
                img.classList.remove('loading');
                img.classList.add('loaded');
                
                // Trigger custom event
                $(img).trigger('imageLoaded');
            };
            
            tempImg.onerror = () => {
                img.classList.remove('loading');
                img.classList.add('error');
                console.warn('Failed to load image:', actualSrc);
            };
            
            tempImg.src = actualSrc;
        }
        
        isInViewport(element) {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            
            return (
                rect.top <= windowHeight + 50 &&
                rect.bottom >= -50
            );
        }
    }
    
    // Video lazy loading
    class VideoLazyLoader {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupVideoObserver();
        }
        
        setupVideoObserver() {
            const videos = document.querySelectorAll('iframe[data-src]');
            
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadVideo(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    rootMargin: '100px'
                });
                
                videos.forEach(video => observer.observe(video));
            } else {
                // Fallback: load all videos immediately
                videos.forEach(video => this.loadVideo(video));
            }
        }
        
        loadVideo(iframe) {
            iframe.src = iframe.dataset.src;
            iframe.classList.add('loaded');
        }
    }
    
    // Thumbnail generation for videos
    class ThumbnailGenerator {
        constructor() {
            this.init();
        }
        
        init() {
            this.generateYouTubeThumbnails();
        }
        
        generateYouTubeThumbnails() {
            $('.youtube-video').each((index, element) => {
                const $video = $(element);
                const videoId = this.extractVideoId($video.data('video-url'));
                
                if (videoId) {
                    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                    const $thumbnail = $('<img>')
                        .attr('src', thumbnailUrl)
                        .attr('alt', $video.data('title') || 'Video thumbnail')
                        .addClass('video-thumbnail lazy-load');
                    
                    $video.prepend($thumbnail);
                }
            });
        }
        
        extractVideoId(url) {
            const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
            const match = url.match(regex);
            return match ? match[1] : null;
        }
    }
    
    // Performance monitoring
    class MediaPerformanceMonitor {
        constructor() {
            this.loadTimes = [];
            this.init();
        }
        
        init() {
            $(document).on('imageLoaded', 'img', (e) => {
                this.trackImageLoad(e.target);
            });
            
            // Report performance after page load
            $(window).on('load', () => {
                setTimeout(() => this.reportPerformance(), 2000);
            });
        }
        
        trackImageLoad(img) {
            const loadTime = performance.now();
            this.loadTimes.push({
                src: img.src,
                loadTime: loadTime,
                size: {
                    width: img.naturalWidth,
                    height: img.naturalHeight
                }
            });
        }
        
        reportPerformance() {
            if (this.loadTimes.length > 0) {
                const avgLoadTime = this.loadTimes.reduce((sum, item) => sum + item.loadTime, 0) / this.loadTimes.length;
                
                console.log('Media Performance Report:', {
                    totalImages: this.loadTimes.length,
                    averageLoadTime: Math.round(avgLoadTime) + 'ms',
                    slowestImage: this.loadTimes.reduce((prev, current) => 
                        (prev.loadTime > current.loadTime) ? prev : current
                    )
                });
            }
        }
    }
    
    // Initialize when DOM is ready
    $(document).ready(() => {
        new LazyLoader();
        new VideoLazyLoader();
        new ThumbnailGenerator();
        
        // Only enable performance monitoring in development
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
            new MediaPerformanceMonitor();
        }
    });
    
})(jQuery);