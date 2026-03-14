/**
 * Browser Compatibility and Feature Detection
 * Handles cross-browser compatibility and progressive enhancement
 */

class BrowserCompatibility {
    constructor() {
        this.browserInfo = this.detectBrowser();
        this.features = this.detectFeatures();
        this.init();
    }
    
    /**
     * Initialize compatibility checks and polyfills
     */
    init() {
        this.addBrowserClasses();
        this.loadPolyfills();
        this.optimizeForBrowser();
        this.setupFallbacks();
        
        // Log browser info for debugging
        if (window.console && console.log) {
            console.log('PMP Browser Info:', this.browserInfo);
            console.log('PMP Feature Support:', this.features);
        }
    }
    
    /**
     * Detect browser type and version
     */
    detectBrowser() {
        const ua = navigator.userAgent;
        const browser = {
            name: 'unknown',
            version: 0,
            mobile: false,
            tablet: false
        };
        
        // Chrome
        if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edge') === -1) {
            browser.name = 'chrome';
            browser.version = parseInt(ua.match(/Chrome\/(\d+)/)[1]);
        }
        // Firefox
        else if (ua.indexOf('Firefox') > -1) {
            browser.name = 'firefox';
            browser.version = parseInt(ua.match(/Firefox\/(\d+)/)[1]);
        }
        // Safari
        else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
            browser.name = 'safari';
            const match = ua.match(/Version\/(\d+)/);
            browser.version = match ? parseInt(match[1]) : 0;
        }
        // Edge
        else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) {
            browser.name = 'edge';
            const match = ua.match(/(?:Edge|Edg)\/(\d+)/);
            browser.version = match ? parseInt(match[1]) : 0;
        }
        // Internet Explorer
        else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
            browser.name = 'ie';
            const match = ua.match(/(?:MSIE |rv:)(\d+)/);
            browser.version = match ? parseInt(match[1]) : 0;
        }
        
        // Mobile detection
        browser.mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        browser.tablet = /iPad|Android(?!.*Mobile)/i.test(ua);
        
        return browser;
    }
    
    /**
     * Detect browser feature support
     */
    detectFeatures() {
        return {
            // CSS Features
            flexbox: this.supportsCSS('display', 'flex'),
            grid: this.supportsCSS('display', 'grid'),
            customProperties: this.supportsCSS('--test', 'test'),
            transforms: this.supportsCSS('transform', 'translateX(1px)'),
            transitions: this.supportsCSS('transition', 'all 1s'),
            animations: this.supportsCSS('animation', 'test 1s'),
            
            // JavaScript Features
            es6: this.supportsES6(),
            fetch: typeof fetch !== 'undefined',
            promises: typeof Promise !== 'undefined',
            intersectionObserver: 'IntersectionObserver' in window,
            webp: this.supportsWebP(),
            
            // Touch and interaction
            touch: 'ontouchstart' in window,
            pointerEvents: 'onpointerdown' in window,
            
            // Storage
            localStorage: this.supportsLocalStorage(),
            sessionStorage: this.supportsSessionStorage(),
            
            // Media
            video: !!document.createElement('video').canPlayType,
            audio: !!document.createElement('audio').canPlayType
        };
    }
    
    /**
     * Check CSS property support
     */
    supportsCSS(property, value) {
        const element = document.createElement('div');
        element.style[property] = value;
        return element.style[property] === value;
    }
    
    /**
     * Check ES6 support
     */
    supportsES6() {
        try {
            new Function('(a = 0) => a');
            return true;
        } catch (err) {
            return false;
        }
    }
    
    /**
     * Check WebP support
     */
    supportsWebP() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }
    
    /**
     * Check localStorage support
     */
    supportsLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Check sessionStorage support
     */
    supportsSessionStorage() {
        try {
            const test = 'test';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Add browser-specific classes to document
     */
    addBrowserClasses() {
        const classes = [
            `browser-${this.browserInfo.name}`,
            `browser-version-${this.browserInfo.version}`,
            this.browserInfo.mobile ? 'is-mobile' : 'is-desktop',
            this.browserInfo.tablet ? 'is-tablet' : ''
        ].filter(Boolean);
        
        // Add feature classes
        Object.keys(this.features).forEach(feature => {
            classes.push(this.features[feature] ? `supports-${feature}` : `no-${feature}`);
        });
        
        document.documentElement.className += ' ' + classes.join(' ');
    }
    
    /**
     * Load necessary polyfills
     */
    loadPolyfills() {
        const polyfills = [];
        
        // ES6 Polyfills
        if (!this.features.es6) {
            polyfills.push('es6-polyfill');
        }
        
        // Fetch polyfill
        if (!this.features.fetch) {
            polyfills.push('fetch-polyfill');
        }
        
        // Promise polyfill
        if (!this.features.promises) {
            polyfills.push('promise-polyfill');
        }
        
        // Intersection Observer polyfill
        if (!this.features.intersectionObserver) {
            polyfills.push('intersection-observer-polyfill');
        }
        
        // Load polyfills dynamically
        this.loadPolyfillScripts(polyfills);
    }
    
    /**
     * Load polyfill scripts
     */
    loadPolyfillScripts(polyfills) {
        polyfills.forEach(polyfill => {
            const script = document.createElement('script');
            script.src = `https://polyfill.io/v3/polyfill.min.js?features=${polyfill}`;
            script.async = true;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Browser-specific optimizations
     */
    optimizeForBrowser() {
        // Safari-specific optimizations
        if (this.browserInfo.name === 'safari') {
            this.optimizeForSafari();
        }
        
        // Firefox-specific optimizations
        if (this.browserInfo.name === 'firefox') {
            this.optimizeForFirefox();
        }
        
        // Edge-specific optimizations
        if (this.browserInfo.name === 'edge') {
            this.optimizeForEdge();
        }
        
        // IE-specific optimizations
        if (this.browserInfo.name === 'ie') {
            this.optimizeForIE();
        }
        
        // Mobile optimizations
        if (this.browserInfo.mobile) {
            this.optimizeForMobile();
        }
    }
    
    /**
     * Safari-specific optimizations
     */
    optimizeForSafari() {
        // Fix Safari flexbox bugs
        const style = document.createElement('style');
        style.textContent = `
            .safari-flex-fix {
                -webkit-flex-shrink: 0;
                flex-shrink: 0;
            }
        `;
        document.head.appendChild(style);
        
        // Add webkit prefixes for animations
        document.documentElement.classList.add('webkit-animations');
    }
    
    /**
     * Firefox-specific optimizations
     */
    optimizeForFirefox() {
        // Firefox scrollbar styling
        const style = document.createElement('style');
        style.textContent = `
            .firefox-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #888 #f1f1f1;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Edge-specific optimizations
     */
    optimizeForEdge() {
        // Edge-specific CSS fixes
        const style = document.createElement('style');
        style.textContent = `
            .edge-grid-fix {
                display: -ms-grid;
                display: grid;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * IE-specific optimizations
     */
    optimizeForIE() {
        // IE11 and below fallbacks
        if (this.browserInfo.version <= 11) {
            // Load IE-specific polyfills
            this.loadIEPolyfills();
            
            // Add IE-specific styles
            const style = document.createElement('style');
            style.textContent = `
                .ie-fallback {
                    display: block !important;
                }
                .ie-hide {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Mobile-specific optimizations
     */
    optimizeForMobile() {
        // Disable hover effects on mobile
        const style = document.createElement('style');
        style.textContent = `
            @media (hover: none) {
                .hover-effect:hover {
                    transform: none !important;
                    box-shadow: none !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Add touch-friendly classes
        document.documentElement.classList.add('touch-device');
    }
    
    /**
     * Load IE-specific polyfills
     */
    loadIEPolyfills() {
        const polyfills = [
            'https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js',
            'https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.min.js'
        ];
        
        polyfills.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Load synchronously for IE
            document.head.appendChild(script);
        });
    }
    
    /**
     * Setup fallbacks for unsupported features
     */
    setupFallbacks() {
        // Flexbox fallback
        if (!this.features.flexbox) {
            this.setupFlexboxFallback();
        }
        
        // Grid fallback
        if (!this.features.grid) {
            this.setupGridFallback();
        }
        
        // Custom properties fallback
        if (!this.features.customProperties) {
            this.setupCustomPropertiesFallback();
        }
        
        // Intersection Observer fallback
        if (!this.features.intersectionObserver) {
            this.setupIntersectionObserverFallback();
        }
    }
    
    /**
     * Flexbox fallback using floats and inline-block
     */
    setupFlexboxFallback() {
        const style = document.createElement('style');
        style.textContent = `
            .no-flexbox .flex-container {
                display: block;
                overflow: hidden;
            }
            .no-flexbox .flex-item {
                float: left;
                display: inline-block;
            }
            .no-flexbox .flex-center {
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Grid fallback using flexbox or floats
     */
    setupGridFallback() {
        const style = document.createElement('style');
        style.textContent = `
            .no-grid .grid-container {
                display: flex;
                flex-wrap: wrap;
            }
            .no-grid .grid-item {
                flex: 1 1 auto;
                min-width: 300px;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Custom properties fallback
     */
    setupCustomPropertiesFallback() {
        // Define fallback values for CSS custom properties
        const fallbackValues = {
            '--primary-color': '#5b28b3',
            '--secondary-color': '#28a745',
            '--text-color': '#333333',
            '--background-color': '#ffffff'
        };
        
        const style = document.createElement('style');
        let css = '.no-custom-properties {';
        Object.keys(fallbackValues).forEach(property => {
            const value = fallbackValues[property];
            const cssProperty = property.replace('--', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            css += `${cssProperty}: ${value};`;
        });
        css += '}';
        
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    /**
     * Intersection Observer fallback using scroll events
     */
    setupIntersectionObserverFallback() {
        if (!window.IntersectionObserver) {
            // Simple polyfill for basic intersection detection
            window.IntersectionObserver = class {
                constructor(callback, options = {}) {
                    this.callback = callback;
                    this.options = options;
                    this.elements = new Set();
                    this.setupScrollListener();
                }
                
                observe(element) {
                    this.elements.add(element);
                    this.checkIntersection(element);
                }
                
                unobserve(element) {
                    this.elements.delete(element);
                }
                
                disconnect() {
                    this.elements.clear();
                    window.removeEventListener('scroll', this.scrollHandler);
                }
                
                setupScrollListener() {
                    this.scrollHandler = () => {
                        this.elements.forEach(element => {
                            this.checkIntersection(element);
                        });
                    };
                    window.addEventListener('scroll', this.scrollHandler, { passive: true });
                }
                
                checkIntersection(element) {
                    const rect = element.getBoundingClientRect();
                    const isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;
                    
                    this.callback([{
                        target: element,
                        isIntersecting: isIntersecting,
                        intersectionRatio: isIntersecting ? 1 : 0
                    }]);
                }
            };
        }
    }
    
    /**
     * Get browser compatibility report
     */
    getCompatibilityReport() {
        return {
            browser: this.browserInfo,
            features: this.features,
            recommendations: this.getRecommendations()
        };
    }
    
    /**
     * Get browser-specific recommendations
     */
    getRecommendations() {
        const recommendations = [];
        
        if (this.browserInfo.name === 'ie' && this.browserInfo.version < 11) {
            recommendations.push('Consider upgrading to a modern browser for the best experience');
        }
        
        if (!this.features.flexbox) {
            recommendations.push('Your browser has limited layout support. Some features may appear differently');
        }
        
        if (!this.features.fetch) {
            recommendations.push('Network requests may be slower in your browser');
        }
        
        if (this.browserInfo.mobile && !this.features.touch) {
            recommendations.push('Touch interactions may not work optimally');
        }
        
        return recommendations;
    }
}

// Initialize browser compatibility on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    window.pmpBrowserCompatibility = new BrowserCompatibility();
    
    // Expose compatibility info globally for debugging
    window.pmpCompatibilityReport = window.pmpBrowserCompatibility.getCompatibilityReport();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserCompatibility;
}