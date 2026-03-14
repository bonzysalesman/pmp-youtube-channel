/**
 * PMP Lazy Loading JavaScript
 * 
 * Handles lazy loading of images and other assets for improved performance
 */

(function() {
    'use strict';
    
    // Configuration
    const config = {
        rootMargin: '50px 0px',
        threshold: 0.01,
        loadingClass: 'lazy-loading',
        loadedClass: 'lazy-loaded',
        errorClass: 'lazy-error'
    };
    
    // Performance tracking
    let lazyLoadStats = {
        totalImages: 0,
        loadedImages: 0,
        errorImages: 0,
        startTime: performance.now()
    };
    
    /**
     * Initialize lazy loading
     */
    function initLazyLoading() {
        // Check for Intersection Observer support
        if ('IntersectionObserver' in window) {
            initIntersectionObserver();
        } else {
            // Fallback for older browsers
            initScrollListener();
        }
        
        // Initialize lazy loading for dynamically added content
        initMutationObserver();
        
        // Track performance
        trackLazyLoadingPerformance();
    }
    
    /**
     * Initialize Intersection Observer for modern browsers
     */
    function initIntersectionObserver() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: config.rootMargin,
            threshold: config.threshold
        });
        
        // Observe all lazy images
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            lazyLoadStats.totalImages++;
            imageObserver.observe(img);
        });
        
        console.log(`Lazy loading initialized for ${lazyImages.length} images using Intersection Observer`);
    }
    
    /**
     * Fallback scroll listener for older browsers
     */
    function initScrollListener() {
        let lazyImages = document.querySelectorAll('img[data-src]');
        lazyLoadStats.totalImages = lazyImages.length;
        
        function checkImages() {
            lazyImages.forEach((img, index) => {
                if (isInViewport(img)) {
                    loadImage(img);
                    lazyImages.splice(index, 1);
                }
            });
            
            // Remove listener when all images are loaded
            if (lazyImages.length === 0) {
                window.removeEventListener('scroll', throttledCheck);
                window.removeEventListener('resize', throttledCheck);
            }
        }
        
        // Throttled scroll handler
        const throttledCheck = throttle(checkImages, 100);
        
        window.addEventListener('scroll', throttledCheck);
        window.addEventListener('resize', throttledCheck);
        
        // Initial check
        checkImages();
        
        console.log(`Lazy loading initialized for ${lazyLoadStats.totalImages} images using scroll listener`);
    }
    
    /**
     * Load individual image
     */
    function loadImage(img) {
        // Add loading class
        img.classList.add(config.loadingClass);
        
        // Create new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = function() {
            // Update src and remove data-src
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            
            // Update classes
            img.classList.remove(config.loadingClass);
            img.classList.add(config.loadedClass);
            
            // Add fade-in animation
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease-in-out';
            
            // Trigger fade-in
            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });
            
            // Update stats
            lazyLoadStats.loadedImages++;
            
            // Trigger custom event
            img.dispatchEvent(new CustomEvent('lazyLoaded', {
                detail: { src: img.src }
            }));
        };
        
        imageLoader.onerror = function() {
            // Handle error
            img.classList.remove(config.loadingClass);
            img.classList.add(config.errorClass);
            
            // Set fallback image or hide
            img.src = img.dataset.fallback || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
            img.alt = 'Image failed to load';
            
            // Update stats
            lazyLoadStats.errorImages++;
            
            console.warn('Failed to load lazy image:', img.dataset.src);
        };
        
        // Start loading
        imageLoader.src = img.dataset.src;
    }
    
    /**
     * Check if element is in viewport (fallback method)
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top >= -50 &&
            rect.left >= -50 &&
            rect.bottom <= windowHeight + 50 &&
            rect.right <= windowWidth + 50
        );
    }
    
    /**
     * Throttle function for performance
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Initialize mutation observer for dynamic content
     */
    function initMutationObserver() {
        if ('MutationObserver' in window) {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) { // Element node
                                // Check if the node itself is a lazy image
                                if (node.tagName === 'IMG' && node.dataset.src) {
                                    initLazyImage(node);
                                }
                                
                                // Check for lazy images within the node
                                const lazyImages = node.querySelectorAll && node.querySelectorAll('img[data-src]');
                                if (lazyImages) {
                                    lazyImages.forEach(img => initLazyImage(img));
                                }
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    
    /**
     * Initialize lazy loading for a single image
     */
    function initLazyImage(img) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: config.rootMargin,
                threshold: config.threshold
            });
            
            observer.observe(img);
        } else {
            // Fallback: load immediately for dynamic content
            loadImage(img);
        }
        
        lazyLoadStats.totalImages++;
    }
    
    /**
     * Track lazy loading performance
     */
    function trackLazyLoadingPerformance() {
        // Track when all images are loaded
        const checkAllLoaded = setInterval(() => {
            const totalProcessed = lazyLoadStats.loadedImages + lazyLoadStats.errorImages;
            
            if (totalProcessed >= lazyLoadStats.totalImages && lazyLoadStats.totalImages > 0) {
                clearInterval(checkAllLoaded);
                
                const endTime = performance.now();
                const totalTime = endTime - lazyLoadStats.startTime;
                
                console.log('Lazy Loading Performance:', {
                    totalImages: lazyLoadStats.totalImages,
                    loadedImages: lazyLoadStats.loadedImages,
                    errorImages: lazyLoadStats.errorImages,
                    totalTime: Math.round(totalTime) + 'ms',
                    successRate: Math.round((lazyLoadStats.loadedImages / lazyLoadStats.totalImages) * 100) + '%'
                });
                
                // Send performance data to analytics if available
                if (window.gtag) {
                    gtag('event', 'lazy_loading_complete', {
                        'custom_parameter_1': lazyLoadStats.totalImages,
                        'custom_parameter_2': Math.round(totalTime)
                    });
                }
            }
        }, 100);
        
        // Clear interval after 30 seconds to prevent memory leaks
        setTimeout(() => {
            clearInterval(checkAllLoaded);
        }, 30000);
    }
    
    /**
     * Preload critical images above the fold
     */
    function preloadCriticalImages() {
        // Find images that are likely above the fold
        const criticalImages = document.querySelectorAll('img[data-src]');
        let preloadCount = 0;
        
        criticalImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            
            // Preload images that are currently visible or very close
            if (rect.top < window.innerHeight + 100 && preloadCount < 3) {
                loadImage(img);
                preloadCount++;
            }
        });
    }
    
    /**
     * Handle page visibility changes
     */
    function handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // Resume lazy loading when page becomes visible
            preloadCriticalImages();
        }
    }
    
    /**
     * Initialize on DOM ready
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLazyLoading);
        } else {
            initLazyLoading();
        }
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Preload critical images immediately
        preloadCriticalImages();
    }
    
    // Public API
    window.PMP_LazyLoading = {
        init: init,
        loadImage: loadImage,
        stats: lazyLoadStats,
        config: config
    };
    
    // Auto-initialize
    init();
    
})();

/**
 * CSS for lazy loading animations and states
 */
const lazyLoadingCSS = `
    .lazy-load {
        transition: opacity 0.3s ease-in-out;
    }
    
    .lazy-loading {
        opacity: 0.7;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
    }
    
    .lazy-loaded {
        opacity: 1;
    }
    
    .lazy-error {
        opacity: 0.5;
        filter: grayscale(100%);
    }
    
    @keyframes loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
    
    /* Reduce motion for users who prefer it */
    @media (prefers-reduced-motion: reduce) {
        .lazy-load,
        .lazy-loading,
        .lazy-loaded {
            transition: none;
            animation: none;
        }
    }
`;

// Inject CSS
if (document.head) {
    const style = document.createElement('style');
    style.textContent = lazyLoadingCSS;
    document.head.appendChild(style);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = lazyLoadingCSS;
        document.head.appendChild(style);
    });
}