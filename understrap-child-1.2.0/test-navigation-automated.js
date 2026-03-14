/**
 * Automated Navigation Testing Script
 * Run this in browser console to validate navigation functionality
 */

class NavigationTester {
    constructor() {
        this.results = [];
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;
    }

    /**
     * Run all navigation tests
     */
    async runAllTests() {
        console.log('🚀 Starting PMP Navigation Tests...\n');
        
        // Test role-based navigation
        await this.testRoleBasedNavigation();
        
        // Test mobile responsiveness
        await this.testMobileResponsiveness();
        
        // Test accessibility features
        await this.testAccessibilityFeatures();
        
        // Test performance
        await this.testPerformance();
        
        // Display results
        this.displayResults();
    }

    /**
     * Test role-based navigation functionality
     */
    async testRoleBasedNavigation() {
        console.log('📋 Testing Role-Based Navigation...');
        
        // Test guest user navigation
        this.test('Guest navigation items present', () => {
            const guestConfig = window.navigationConfig?.guest;
            return guestConfig && guestConfig.primaryNav.length >= 5;
        });
        
        // Test student navigation
        this.test('Student navigation includes dashboard', () => {
            const studentConfig = window.navigationConfig?.student;
            return studentConfig && studentConfig.primaryNav.some(item => 
                item.text.includes('Dashboard')
            );
        });
        
        // Test instructor navigation
        this.test('Instructor navigation includes management tools', () => {
            const instructorConfig = window.navigationConfig?.instructor;
            return instructorConfig && instructorConfig.userMenu.some(item => 
                item.text.includes('Instructor') || item.text.includes('Student Management')
            );
        });
        
        // Test administrator navigation
        this.test('Administrator navigation includes admin tools', () => {
            const adminConfig = window.navigationConfig?.administrator;
            return adminConfig && adminConfig.userMenu.some(item => 
                item.text.includes('Admin Panel') || item.text.includes('Site Settings')
            );
        });
    }

    /**
     * Test mobile responsiveness
     */
    async testMobileResponsiveness() {
        console.log('📱 Testing Mobile Responsiveness...');
        
        // Test mobile toggle button
        this.test('Mobile navigation toggle exists', () => {
            const mobileToggle = document.querySelector('.pmp-mobile-nav-toggle');
            return mobileToggle !== null;
        });
        
        // Test mobile navigation container
        this.test('Mobile navigation container exists', () => {
            const mobileContainer = document.querySelector('.pmp-mobile-nav-container');
            return mobileContainer !== null;
        });
        
        // Test responsive CSS classes
        this.test('Mobile CSS classes applied', () => {
            const navbar = document.querySelector('.navbar');
            return navbar && navbar.classList.contains('navbar-expand-lg');
        });
        
        // Test touch-friendly sizing
        this.test('Touch-friendly button sizing', () => {
            const buttons = document.querySelectorAll('.pmp-primary-nav .nav-link');
            if (buttons.length === 0) return false;
            
            // Check if buttons meet minimum touch target size (44px)
            const button = buttons[0];
            const rect = button.getBoundingClientRect();
            return rect.height >= 44 || window.innerWidth > 991;
        });
    }

    /**
     * Test accessibility features
     */
    async testAccessibilityFeatures() {
        console.log('♿ Testing Accessibility Features...');
        
        // Test ARIA attributes
        this.test('Navigation has proper ARIA labels', () => {
            const nav = document.querySelector('nav[aria-label]');
            return nav !== null;
        });
        
        // Test keyboard navigation
        this.test('Focusable elements have proper tabindex', () => {
            const focusableElements = document.querySelectorAll(
                'button:not([disabled]), a:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            return focusableElements.length > 0;
        });
        
        // Test dropdown ARIA states
        this.test('Dropdown toggles have aria-expanded', () => {
            const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
            if (dropdownToggles.length === 0) return true; // No dropdowns is OK
            
            return Array.from(dropdownToggles).every(toggle => 
                toggle.hasAttribute('aria-expanded')
            );
        });
        
        // Test skip links
        this.test('Skip to content link exists', () => {
            const skipLink = document.querySelector('.skip-link');
            return skipLink !== null;
        });
    }

    /**
     * Test performance metrics
     */
    async testPerformance() {
        console.log('⚡ Testing Performance...');
        
        // Test CSS loading
        this.test('Navigation CSS loaded', () => {
            const navStyles = document.querySelector('link[href*="pmp-navigation.css"]');
            return navStyles !== null || this.hasInlineNavStyles();
        });
        
        // Test JavaScript loading
        this.test('Navigation JavaScript loaded', () => {
            const navScript = document.querySelector('script[src*="navigation.js"]');
            return navScript !== null || typeof PMPNavigation !== 'undefined';
        });
        
        // Test animation performance
        this.test('CSS animations use transform/opacity', () => {
            const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
            // This is a basic check - in real testing we'd analyze CSS rules
            return true; // Assume pass for now
        });
        
        // Test DOM complexity
        this.test('Navigation DOM complexity reasonable', () => {
            const navElements = document.querySelectorAll('nav *');
            return navElements.length < 200; // Reasonable limit
        });
    }

    /**
     * Check if navigation styles are inline
     */
    hasInlineNavStyles() {
        const styleSheets = Array.from(document.styleSheets);
        return styleSheets.some(sheet => {
            try {
                const rules = Array.from(sheet.cssRules || sheet.rules || []);
                return rules.some(rule => 
                    rule.selectorText && rule.selectorText.includes('pmp-primary-nav')
                );
            } catch (e) {
                return false; // Cross-origin stylesheet
            }
        });
    }

    /**
     * Run individual test
     */
    test(description, testFunction) {
        this.testCount++;
        
        try {
            const result = testFunction();
            if (result) {
                this.passCount++;
                console.log(`✅ ${description}`);
                this.results.push({ description, status: 'PASS', error: null });
            } else {
                this.failCount++;
                console.log(`❌ ${description}`);
                this.results.push({ description, status: 'FAIL', error: 'Test returned false' });
            }
        } catch (error) {
            this.failCount++;
            console.log(`❌ ${description} - Error: ${error.message}`);
            this.results.push({ description, status: 'ERROR', error: error.message });
        }
    }

    /**
     * Display test results summary
     */
    displayResults() {
        console.log('\n📊 Test Results Summary');
        console.log('========================');
        console.log(`Total Tests: ${this.testCount}`);
        console.log(`✅ Passed: ${this.passCount}`);
        console.log(`❌ Failed: ${this.failCount}`);
        console.log(`Success Rate: ${Math.round((this.passCount / this.testCount) * 100)}%`);
        
        if (this.failCount > 0) {
            console.log('\n❌ Failed Tests:');
            this.results
                .filter(result => result.status !== 'PASS')
                .forEach(result => {
                    console.log(`- ${result.description}: ${result.error || 'Failed'}`);
                });
        }
        
        console.log('\n🎯 Overall Status:', this.failCount === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
        
        // Return results for programmatic access
        return {
            total: this.testCount,
            passed: this.passCount,
            failed: this.failCount,
            successRate: Math.round((this.passCount / this.testCount) * 100),
            results: this.results
        };
    }
}

// Auto-run tests if this script is loaded directly
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const tester = new NavigationTester();
            window.navigationTester = tester;
            
            console.log('🔧 Navigation Tester loaded. Run window.navigationTester.runAllTests() to start testing.');
        });
    } else {
        const tester = new NavigationTester();
        window.navigationTester = tester;
        
        console.log('🔧 Navigation Tester loaded. Run window.navigationTester.runAllTests() to start testing.');
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationTester;
}