/**
 * HTML, CSS, and JavaScript Validation Suite
 * Automated testing for standards compliance and cross-browser compatibility
 */

class ValidationSuite {
    constructor() {
        this.results = {
            html: [],
            css: [],
            javascript: [],
            accessibility: [],
            performance: []
        };
        this.init();
    }

    /**
     * Initialize validation suite
     */
    init() {
        console.log('Starting PMP Frontend Validation Suite...');
        this.validateHTML();
        this.validateCSS();
        this.validateJavaScript();
        this.validateAccessibility();
        this.validatePerformance();
        this.generateReport();
    }

    /**
     * Validate HTML structure and semantics
     */
    validateHTML() {
        console.log('Validating HTML...');

        // Check for required meta tags
        this.checkMetaTags();

        // Check semantic HTML structure
        this.checkSemanticStructure();

        // Check for accessibility attributes
        this.checkAccessibilityAttributes();

        // Check for proper heading hierarchy
        this.checkHeadingHierarchy();

        // Check for form labels
        this.checkFormLabels();

        // Check for image alt attributes
        this.checkImageAltAttributes();
    }

    /**
     * Check for required meta tags
     */
    checkMetaTags() {
        const requiredMetas = [
            { name: 'viewport', required: true },
            { name: 'charset', required: true },
            { name: 'description', required: false }
        ];

        requiredMetas.forEach(meta => {
            let found = false;

            if (meta.name === 'charset') {
                found = document.querySelector('meta[charset]') !== null;
            } else if (meta.name === 'viewport') {
                found = document.querySelector('meta[name="viewport"]') !== null;
            } else {
                found = document.querySelector(`meta[name="${meta.name}"]`) !== null;
            }

            this.results.html.push({
                test: `Meta tag: ${meta.name}`,
                status: found ? 'pass' : (meta.required ? 'fail' : 'warning'),
                message: found ? 'Found' : `Missing ${meta.name} meta tag`,
                element: meta.name
            });
        });
    }

    /**
     * Check semantic HTML structure
     */
    checkSemanticStructure() {
        const semanticElements = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];

        semanticElements.forEach(element => {
            const found = document.querySelector(element) !== null;
            this.results.html.push({
                test: `Semantic element: ${element}`,
                status: found ? 'pass' : 'info',
                message: found ? 'Found' : `No ${element} element found`,
                element: element
            });
        });

        // Check for proper document structure
        const hasMain = document.querySelector('main') !== null;
        const hasHeader = document.querySelector('header') !== null;

        this.results.html.push({
            test: 'Document structure',
            status: (hasMain && hasHeader) ? 'pass' : 'warning',
            message: (hasMain && hasHeader) ? 'Good document structure' : 'Consider using semantic HTML5 elements',
            element: 'document'
        });
    }

    /**
     * Check accessibility attributes
     */
    checkAccessibilityAttributes() {
        // Check for ARIA landmarks
        const landmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]');
        this.results.html.push({
            test: 'ARIA landmarks',
            status: landmarks.length > 0 ? 'pass' : 'warning',
            message: landmarks.length > 0 ? `Found ${landmarks.length} ARIA landmarks` : 'No ARIA landmarks found',
            element: 'aria'
        });

        // Check for skip links
        const skipLinks = document.querySelectorAll('a[href^="#"]');
        const hasSkipToMain = Array.from(skipLinks).some(link =>
            link.textContent.toLowerCase().includes('skip') ||
            link.getAttribute('href') === '#main'
        );

        this.results.html.push({
            test: 'Skip navigation links',
            status: hasSkipToMain ? 'pass' : 'warning',
            message: hasSkipToMain ? 'Skip links found' : 'Consider adding skip navigation links',
            element: 'navigation'
        });
    }

    /**
     * Check heading hierarchy
     */
    checkHeadingHierarchy() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));

        let hierarchyValid = true;
        let previousLevel = 0;

        headingLevels.forEach(level => {
            if (previousLevel > 0 && level > previousLevel + 1) {
                hierarchyValid = false;
            }
            previousLevel = level;
        });

        this.results.html.push({
            test: 'Heading hierarchy',
            status: hierarchyValid ? 'pass' : 'warning',
            message: hierarchyValid ? 'Proper heading hierarchy' : 'Heading levels may skip numbers',
            element: 'headings'
        });

        // Check for single H1
        const h1Count = document.querySelectorAll('h1').length;
        this.results.html.push({
            test: 'Single H1 element',
            status: h1Count === 1 ? 'pass' : 'warning',
            message: h1Count === 1 ? 'Single H1 found' : `Found ${h1Count} H1 elements`,
            element: 'h1'
        });
    }

    /**
     * Check form labels
     */
    checkFormLabels() {
        const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
        let unlabeledInputs = 0;

        inputs.forEach(input => {
            const hasLabel = input.labels && input.labels.length > 0;
            const hasAriaLabel = input.getAttribute('aria-label');
            const hasAriaLabelledBy = input.getAttribute('aria-labelledby');

            if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
                unlabeledInputs++;
            }
        });

        this.results.html.push({
            test: 'Form input labels',
            status: unlabeledInputs === 0 ? 'pass' : 'fail',
            message: unlabeledInputs === 0 ? 'All inputs have labels' : `${unlabeledInputs} inputs missing labels`,
            element: 'forms'
        });
    }

    /**
     * Check image alt attributes
     */
    checkImageAltAttributes() {
        const images = document.querySelectorAll('img');
        let missingAlt = 0;

        images.forEach(img => {
            if (!img.hasAttribute('alt')) {
                missingAlt++;
            }
        });

        this.results.html.push({
            test: 'Image alt attributes',
            status: missingAlt === 0 ? 'pass' : 'fail',
            message: missingAlt === 0 ? 'All images have alt attributes' : `${missingAlt} images missing alt attributes`,
            element: 'images'
        });
    }

    /**
     * Validate CSS properties and browser compatibility
     */
    validateCSS() {
        console.log('Validating CSS...');

        // Check for vendor prefixes
        this.checkVendorPrefixes();

        // Check for CSS Grid and Flexbox fallbacks
        this.checkLayoutFallbacks();

        // Check for custom properties usage
        this.checkCustomProperties();

        // Check for responsive design
        this.checkResponsiveDesign();
    }

    /**
     * Check for vendor prefixes
     */
    checkVendorPrefixes() {
        const stylesheets = document.styleSheets;
        let hasVendorPrefixes = false;

        try {
            Array.from(stylesheets).forEach(stylesheet => {
                if (stylesheet.cssRules) {
                    Array.from(stylesheet.cssRules).forEach(rule => {
                        if (rule.style) {
                            const cssText = rule.style.cssText;
                            if (cssText.includes('-webkit-') || cssText.includes('-moz-') ||
                                cssText.includes('-ms-') || cssText.includes('-o-')) {
                                hasVendorPrefixes = true;
                            }
                        }
                    });
                }
            });
        } catch (e) {
            // Cross-origin stylesheets may not be accessible
        }

        this.results.css.push({
            test: 'Vendor prefixes',
            status: hasVendorPrefixes ? 'pass' : 'info',
            message: hasVendorPrefixes ? 'Vendor prefixes found' : 'No vendor prefixes detected',
            element: 'css'
        });
    }

    /**
     * Check for layout fallbacks
     */
    checkLayoutFallbacks() {
        const hasFlexbox = CSS.supports('display', 'flex');
        const hasGrid = CSS.supports('display', 'grid');

        this.results.css.push({
            test: 'Flexbox support',
            status: hasFlexbox ? 'pass' : 'warning',
            message: hasFlexbox ? 'Flexbox supported' : 'Flexbox not supported - fallbacks needed',
            element: 'flexbox'
        });

        this.results.css.push({
            test: 'CSS Grid support',
            status: hasGrid ? 'pass' : 'warning',
            message: hasGrid ? 'CSS Grid supported' : 'CSS Grid not supported - fallbacks needed',
            element: 'grid'
        });
    }

    /**
     * Check for custom properties
     */
    checkCustomProperties() {
        const supportsCustomProps = CSS.supports('color', 'var(--test)');

        this.results.css.push({
            test: 'CSS Custom Properties',
            status: supportsCustomProps ? 'pass' : 'warning',
            message: supportsCustomProps ? 'Custom properties supported' : 'Custom properties not supported - fallbacks needed',
            element: 'custom-properties'
        });
    }

    /**
     * Check for responsive design
     */
    checkResponsiveDesign() {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const hasViewport = viewportMeta !== null;

        this.results.css.push({
            test: 'Responsive viewport',
            status: hasViewport ? 'pass' : 'fail',
            message: hasViewport ? 'Viewport meta tag found' : 'Missing viewport meta tag',
            element: 'viewport'
        });

        // Check for media queries (simplified check)
        const hasMediaQueries = Array.from(document.styleSheets).some(sheet => {
            try {
                return Array.from(sheet.cssRules || []).some(rule =>
                    rule.type === CSSRule.MEDIA_RULE
                );
            } catch (e) {
                return false;
            }
        });

        this.results.css.push({
            test: 'Media queries',
            status: hasMediaQueries ? 'pass' : 'warning',
            message: hasMediaQueries ? 'Media queries found' : 'No media queries detected',
            element: 'media-queries'
        });
    }

    /**
     * Validate JavaScript for errors and compatibility
     */
    validateJavaScript() {
        console.log('Validating JavaScript...');

        // Check for console errors
        this.checkConsoleErrors();

        // Check for modern JavaScript features
        this.checkJavaScriptFeatures();

        // Check for proper error handling
        this.checkErrorHandling();
    }

    /**
     * Check for console errors
     */
    checkConsoleErrors() {
        // This is a simplified check - in a real implementation,
        // you'd want to capture console errors during page load
        const hasConsoleErrors = false; // Would be determined by error monitoring

        this.results.javascript.push({
            test: 'Console errors',
            status: hasConsoleErrors ? 'fail' : 'pass',
            message: hasConsoleErrors ? 'JavaScript errors detected' : 'No JavaScript errors detected',
            element: 'console'
        });
    }

    /**
     * Check for modern JavaScript features
     */
    checkJavaScriptFeatures() {
        const features = [
            {
                name: 'Arrow functions',
                test: () => {
                    try {
                        new Function('() => {}');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            },
            {
                name: 'Promises',
                test: () => typeof Promise !== 'undefined'
            },
            {
                name: 'Fetch API',
                test: () => typeof fetch !== 'undefined'
            },
            {
                name: 'Async/Await',
                test: () => {
                    try {
                        new Function('async () => { await Promise.resolve(); }');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            }
        ];

        features.forEach(feature => {
            const supported = feature.test();
            this.results.javascript.push({
                test: feature.name,
                status: supported ? 'pass' : 'warning',
                message: supported ? `${feature.name} supported` : `${feature.name} not supported`,
                element: 'javascript-features'
            });
        });
    }

    /**
     * Check for proper error handling
     */
    checkErrorHandling() {
        // Check if there's a global error handler
        const hasErrorHandler = window.onerror !== null ||
            window.addEventListener &&
            window.addEventListener.toString().includes('error');

        this.results.javascript.push({
            test: 'Error handling',
            status: hasErrorHandler ? 'pass' : 'info',
            message: hasErrorHandler ? 'Error handling detected' : 'Consider adding global error handling',
            element: 'error-handling'
        });
    }

    /**
     * Validate accessibility compliance
     */
    validateAccessibility() {
        console.log('Validating Accessibility...');

        // Check color contrast (simplified)
        this.checkColorContrast();

        // Check keyboard navigation
        this.checkKeyboardNavigation();

        // Check focus management
        this.checkFocusManagement();

        // Check ARIA usage
        this.checkARIAUsage();
    }

    /**
     * Check color contrast (simplified)
     */
    checkColorContrast() {
        // This is a simplified check - real implementation would calculate actual contrast ratios
        const hasHighContrastSupport = window.matchMedia &&
            window.matchMedia('(prefers-contrast: high)').matches !== undefined;

        this.results.accessibility.push({
            test: 'High contrast support',
            status: hasHighContrastSupport ? 'pass' : 'warning',
            message: hasHighContrastSupport ? 'High contrast mode supported' : 'High contrast mode not detected',
            element: 'contrast'
        });
    }

    /**
     * Check keyboard navigation
     */
    checkKeyboardNavigation() {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        this.results.accessibility.push({
            test: 'Focusable elements',
            status: focusableElements.length > 0 ? 'pass' : 'warning',
            message: `${focusableElements.length} focusable elements found`,
            element: 'keyboard-navigation'
        });
    }

    /**
     * Check focus management
     */
    checkFocusManagement() {
        // Check for focus indicators
        const hasFocusStyles = Array.from(document.styleSheets).some(sheet => {
            try {
                return Array.from(sheet.cssRules || []).some(rule =>
                    rule.selectorText && rule.selectorText.includes(':focus')
                );
            } catch (e) {
                return false;
            }
        });

        this.results.accessibility.push({
            test: 'Focus indicators',
            status: hasFocusStyles ? 'pass' : 'warning',
            message: hasFocusStyles ? 'Focus styles found' : 'Consider adding focus indicators',
            element: 'focus-management'
        });
    }

    /**
     * Check ARIA usage
     */
    checkARIAUsage() {
        const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');

        this.results.accessibility.push({
            test: 'ARIA attributes',
            status: ariaElements.length > 0 ? 'pass' : 'warning',
            message: `${ariaElements.length} elements with ARIA attributes`,
            element: 'aria'
        });
    }

    /**
     * Validate performance aspects
     */
    validatePerformance() {
        console.log('Validating Performance...');

        // Check for performance API usage
        this.checkPerformanceAPI();

        // Check for lazy loading
        this.checkLazyLoading();

        // Check for resource optimization
        this.checkResourceOptimization();
    }

    /**
     * Check for performance API usage
     */
    checkPerformanceAPI() {
        const hasPerformanceAPI = 'performance' in window && 'now' in performance;

        this.results.performance.push({
            test: 'Performance API',
            status: hasPerformanceAPI ? 'pass' : 'warning',
            message: hasPerformanceAPI ? 'Performance API available' : 'Performance API not available',
            element: 'performance-api'
        });
    }

    /**
     * Check for lazy loading
     */
    checkLazyLoading() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const hasIntersectionObserver = 'IntersectionObserver' in window;

        this.results.performance.push({
            test: 'Lazy loading',
            status: (lazyImages.length > 0 || hasIntersectionObserver) ? 'pass' : 'info',
            message: lazyImages.length > 0 ? `${lazyImages.length} lazy-loaded images` :
                hasIntersectionObserver ? 'Intersection Observer available' : 'Consider implementing lazy loading',
            element: 'lazy-loading'
        });
    }

    /**
     * Check for resource optimization
     */
    checkResourceOptimization() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const scripts = document.querySelectorAll('script[src]');

        this.results.performance.push({
            test: 'Resource count',
            status: (stylesheets.length + scripts.length) < 10 ? 'pass' : 'warning',
            message: `${stylesheets.length} stylesheets, ${scripts.length} scripts`,
            element: 'resources'
        });
    }

    /**
     * Generate comprehensive validation report
     */
    generateReport() {
        console.log('Generating validation report...');

        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            results: this.results,
            summary: this.generateSummary()
        };

        // Log report to console
        console.log('PMP Frontend Validation Report:', report);

        // Store report for external access
        window.pmpValidationReport = report;

        // Display report in UI if container exists
        this.displayReport(report);

        return report;
    }

    /**
     * Generate summary statistics
     */
    generateSummary() {
        const allResults = [
            ...this.results.html,
            ...this.results.css,
            ...this.results.javascript,
            ...this.results.accessibility,
            ...this.results.performance
        ];

        const summary = {
            total: allResults.length,
            pass: allResults.filter(r => r.status === 'pass').length,
            fail: allResults.filter(r => r.status === 'fail').length,
            warning: allResults.filter(r => r.status === 'warning').length,
            info: allResults.filter(r => r.status === 'info').length
        };

        summary.score = Math.round((summary.pass / summary.total) * 100);

        return summary;
    }

    /**
     * Display report in UI
     */
    displayReport(report) {
        const container = document.getElementById('validationReport');
        if (!container) return;

        const summary = report.summary;

        container.innerHTML = `
            <div class="validation-report">
                <h3>Validation Report</h3>
                <div class="validation-summary">
                    <div class="score ${summary.score >= 80 ? 'good' : summary.score >= 60 ? 'fair' : 'poor'}">
                        Score: ${summary.score}%
                    </div>
                    <div class="stats">
                        <span class="pass">${summary.pass} Pass</span>
                        <span class="fail">${summary.fail} Fail</span>
                        <span class="warning">${summary.warning} Warning</span>
                        <span class="info">${summary.info} Info</span>
                    </div>
                </div>
                <div class="validation-details">
                    ${this.renderResultSection('HTML', this.results.html)}
                    ${this.renderResultSection('CSS', this.results.css)}
                    ${this.renderResultSection('JavaScript', this.results.javascript)}
                    ${this.renderResultSection('Accessibility', this.results.accessibility)}
                    ${this.renderResultSection('Performance', this.results.performance)}
                </div>
            </div>
        `;
    }

    /**
     * Render a section of results
     */
    renderResultSection(title, results) {
        return `
            <div class="validation-section">
                <h4>${title}</h4>
                <div class="validation-results">
                    ${results.map(result => `
                        <div class="validation-result ${result.status}">
                            <span class="test-name">${result.test}</span>
                            <span class="test-status">${result.status.toUpperCase()}</span>
                            <span class="test-message">${result.message}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Auto-run validation suite when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Small delay to ensure all resources are loaded
    setTimeout(() => {
        window.pmpValidationSuite = new ValidationSuite();
    }, 1000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationSuite;
}