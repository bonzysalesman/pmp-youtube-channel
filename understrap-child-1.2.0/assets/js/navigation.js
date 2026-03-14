/**
 * PMP Course Navigation JavaScript
 * Handles sidebar interactions, mobile responsiveness, and accessibility features
 */

class PMPNavigation {
    constructor() {
        this.navigation = document.querySelector('.pmp-course-navigation');
        this.navToggle = document.querySelector('.nav-toggle');
        this.mobileNavToggle = document.querySelector('.pmp-mobile-nav-toggle');
        this.navbarCollapse = document.querySelector('#navbarNav');
        this.moduleToggles = document.querySelectorAll('.module-toggle');
        this.lessonLinks = document.querySelectorAll('.lesson-link');
        this.currentLessonId = this.getCurrentLessonId();
        this.isMobile = window.innerWidth <= 991.98;
        
        this.init();
    }
    
    /**
     * Initialize all navigation functionality
     */
    init() {
        this.setupMobileNavigation();
        this.setupMobileToggle();
        this.setupModuleToggles();
        this.setupLessonNavigation();
        this.setupKeyboardNavigation();
        this.setupScrollToActive();
        this.setupProgressTracking();
        this.setupResizeHandler();
        this.setupAccessibilityFeatures();
        this.setupAriaLiveRegions();
        this.setupTouchGestures();
        
        // Set initial state
        this.updateActiveStates();
        this.loadModuleStates();
        this.scrollToCurrentLesson();
        this.announceInitialState();
        
        // Initialize mobile-specific features
        if (this.isMobile) {
            this.initMobileFeatures();
        }
    }
    
    /**
     * Setup enhanced mobile navigation
     */
    setupMobileNavigation() {
        if (!this.mobileNavToggle || !this.navbarCollapse) return;
        
        // Enhanced mobile navigation toggle
        this.mobileNavToggle.addEventListener('click', (e) => {
            const isExpanded = this.mobileNavToggle.getAttribute('aria-expanded') === 'true';
            this.toggleMainMobileNav(!isExpanded);
        });
        
        // Close navigation when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (this.isMobile && 
                this.navbarCollapse.classList.contains('show') &&
                !this.navbarCollapse.contains(e.target) &&
                !this.mobileNavToggle.contains(e.target)) {
                this.closeMainMobileNav();
            }
        });
        
        // Close navigation on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navbarCollapse.classList.contains('show')) {
                this.closeMainMobileNav();
                this.mobileNavToggle.focus();
            }
        });
        
        // Handle Bootstrap collapse events
        this.navbarCollapse.addEventListener('shown.bs.collapse', () => {
            this.onMobileNavOpen();
        });
        
        this.navbarCollapse.addEventListener('hidden.bs.collapse', () => {
            this.onMobileNavClose();
        });
    }
    
    /**
     * Setup mobile navigation toggle (for course navigation)
     */
    setupMobileToggle() {
        if (!this.navToggle) return;
        
        this.navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileNav();
        });
        
        // Close navigation when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (this.isMobile && 
                this.navigation && this.navigation.classList.contains('nav-open') &&
                !this.navigation.contains(e.target)) {
                this.closeMobileNav();
            }
        });
        
        // Close navigation on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navigation && this.navigation.classList.contains('nav-open')) {
                this.closeMobileNav();
                this.navToggle.focus();
            }
        });
    }
    
    /**
     * Toggle mobile navigation
     */
    toggleMobileNav() {
        const isOpen = this.navigation.classList.contains('nav-open');
        
        if (isOpen) {
            this.closeMobileNav();
        } else {
            this.openMobileNav();
        }
    }
    
    /**
     * Open mobile navigation
     */
    openMobileNav() {
        this.navigation.classList.add('nav-open');
        this.navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Focus first focusable element in navigation
        const firstFocusable = this.navigation.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
    
    /**
     * Close mobile navigation
     */
    closeMobileNav() {
        if (this.navigation) {
            this.navigation.classList.remove('nav-open');
        }
        if (this.navToggle) {
            this.navToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
    }
    
    /**
     * Toggle main mobile navigation
     */
    toggleMainMobileNav(show) {
        if (show) {
            this.openMainMobileNav();
        } else {
            this.closeMainMobileNav();
        }
    }
    
    /**
     * Open main mobile navigation
     */
    openMainMobileNav() {
        this.mobileNavToggle.setAttribute('aria-expanded', 'true');
        this.mobileNavToggle.classList.add('active');
        
        // Prevent body scroll on mobile when nav is open
        if (this.isMobile) {
            document.body.style.overflow = 'hidden';
        }
        
        // Focus management
        setTimeout(() => {
            const firstFocusable = this.navbarCollapse.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 100);
        
        // Announce to screen readers
        this.announceToScreenReader('Navigation menu opened');
    }
    
    /**
     * Close main mobile navigation
     */
    closeMainMobileNav() {
        this.mobileNavToggle.setAttribute('aria-expanded', 'false');
        this.mobileNavToggle.classList.remove('active');
        document.body.style.overflow = '';
        
        // Use Bootstrap's collapse method if available
        if (window.bootstrap && window.bootstrap.Collapse) {
            const bsCollapse = window.bootstrap.Collapse.getInstance(this.navbarCollapse);
            if (bsCollapse) {
                bsCollapse.hide();
            }
        }
        
        // Announce to screen readers
        this.announceToScreenReader('Navigation menu closed');
    }
    
    /**
     * Handle mobile navigation open event
     */
    onMobileNavOpen() {
        // Add mobile-specific classes or behaviors
        document.body.classList.add('mobile-nav-open');
        
        // Setup mobile-specific event listeners
        this.setupMobileNavListeners();
    }
    
    /**
     * Handle mobile navigation close event
     */
    onMobileNavClose() {
        document.body.classList.remove('mobile-nav-open');
        document.body.style.overflow = '';
        
        // Clean up mobile-specific event listeners
        this.cleanupMobileNavListeners();
    }
    
    /**
     * Setup mobile-specific navigation listeners
     */
    setupMobileNavListeners() {
        // Handle swipe gestures to close navigation
        this.setupSwipeToClose();
        
        // Enhanced touch interactions for dropdown menus
        this.enhanceDropdownTouch();
    }
    
    /**
     * Clean up mobile navigation listeners
     */
    cleanupMobileNavListeners() {
        // Remove swipe listeners
        this.removeSwipeListeners();
    }
    
    /**
     * Setup module toggle functionality
     */
    setupModuleToggles() {
        this.moduleToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleModule(toggle);
            });
            
            // Handle keyboard activation
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleModule(toggle);
                }
            });
        });
    }
    
    /**
     * Toggle module expansion
     */
    toggleModule(toggle) {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const moduleId = toggle.getAttribute('aria-controls');
        const lessonContainer = document.getElementById(moduleId);
        
        if (!lessonContainer) return;
        
        // Update ARIA state
        toggle.setAttribute('aria-expanded', !isExpanded);
        
        // Toggle visual state
        if (isExpanded) {
            lessonContainer.classList.remove('expanded');
            lessonContainer.classList.add('collapsed');
        } else {
            lessonContainer.classList.remove('collapsed');
            lessonContainer.classList.add('expanded');
        }
        
        // Smooth animation
        this.animateModuleToggle(lessonContainer, !isExpanded);
        
        // Save state to localStorage
        this.saveModuleState(moduleId.replace('lessons-', ''), !isExpanded);
        
        // Announce state change to screen readers
        const moduleTitle = toggle.closest('.module-header')?.querySelector('.module-title')?.textContent;
        const action = !isExpanded ? 'expanded' : 'collapsed';
        this.announceToScreenReader(`${moduleTitle || 'Module'} ${action}`);
        
        // Update focus management for expanded/collapsed state
        if (!isExpanded) {
            // When expanding, focus might need to be managed
            const firstLesson = lessonContainer.querySelector('.lesson-link');
            if (firstLesson) {
                firstLesson.setAttribute('tabindex', '0');
            }
        }
    }
    
    /**
     * Animate module toggle with smooth transition
     */
    animateModuleToggle(container, expanding) {
        if (expanding) {
            // Get the natural height
            container.style.maxHeight = 'none';
            const height = container.scrollHeight;
            container.style.maxHeight = '0';
            
            // Force reflow
            container.offsetHeight;
            
            // Animate to natural height
            container.style.maxHeight = height + 'px';
            
            // Clean up after animation
            setTimeout(() => {
                container.style.maxHeight = 'none';
            }, 300);
        } else {
            // Set current height
            container.style.maxHeight = container.scrollHeight + 'px';
            
            // Force reflow
            container.offsetHeight;
            
            // Animate to 0
            container.style.maxHeight = '0';
        }
    }
    
    /**
     * Setup lesson navigation
     */
    setupLessonNavigation() {
        this.lessonLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't prevent default - let normal navigation happen
                // But track the lesson access
                const lessonId = link.closest('.lesson-item').dataset.lessonId;
                this.trackLessonAccess(lessonId);
                
                // Close mobile nav if open
                if (window.innerWidth <= 1024) {
                    this.closeMobileNav();
                }
            });
        });
    }
    
    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        this.navigation.addEventListener('keydown', (e) => {
            const focusableElements = this.getFocusableElements();
            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.focusNext(focusableElements, currentIndex);
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    this.focusPrevious(focusableElements, currentIndex);
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    focusableElements[0]?.focus();
                    break;
                    
                case 'End':
                    e.preventDefault();
                    focusableElements[focusableElements.length - 1]?.focus();
                    break;
            }
        });
    }
    
    /**
     * Get all focusable elements in navigation
     */
    getFocusableElements() {
        return this.navigation.querySelectorAll(
            'button:not([disabled]), a:not([disabled]):not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"])'
        );
    }
    
    /**
     * Focus next element
     */
    focusNext(elements, currentIndex) {
        const nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0;
        elements[nextIndex]?.focus();
    }
    
    /**
     * Focus previous element
     */
    focusPrevious(elements, currentIndex) {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1;
        elements[prevIndex]?.focus();
    }
    
    /**
     * Setup smooth scrolling to active lesson
     */
    setupScrollToActive() {
        // Scroll to current lesson on page load
        setTimeout(() => {
            this.scrollToCurrentLesson();
        }, 100);
    }
    
    /**
     * Scroll to current lesson in navigation
     */
    scrollToCurrentLesson() {
        const currentLesson = this.navigation.querySelector('.lesson-item.current-lesson');
        if (!currentLesson) return;
        
        const navContent = this.navigation.querySelector('.nav-content');
        if (!navContent) return;
        
        // Ensure parent module is expanded
        const moduleContainer = currentLesson.closest('.lesson-list-container');
        if (moduleContainer && moduleContainer.classList.contains('collapsed')) {
            const moduleToggle = moduleContainer.previousElementSibling.querySelector('.module-toggle');
            if (moduleToggle) {
                this.toggleModule(moduleToggle);
            }
        }
        
        // Smooth scroll to lesson
        setTimeout(() => {
            const lessonRect = currentLesson.getBoundingClientRect();
            const navRect = navContent.getBoundingClientRect();
            const scrollTop = navContent.scrollTop;
            const targetScroll = scrollTop + lessonRect.top - navRect.top - 100; // 100px offset
            
            navContent.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }, 100);
    }
    
    /**
     * Setup progress tracking
     */
    setupProgressTracking() {
        // Track lesson completion when user spends time on lesson
        if (this.currentLessonId) {
            this.startProgressTracking();
        }
    }
    
    /**
     * Start tracking progress for current lesson
     */
    startProgressTracking() {
        let timeSpent = 0;
        const trackingInterval = setInterval(() => {
            timeSpent += 1;
            
            // Mark as completed after 30 seconds (adjust as needed)
            if (timeSpent >= 30) {
                this.markLessonCompleted(this.currentLessonId);
                clearInterval(trackingInterval);
            }
        }, 1000);
        
        // Clear interval when user leaves page
        window.addEventListener('beforeunload', () => {
            clearInterval(trackingInterval);
        });
    }
    
    /**
     * Mark lesson as completed
     */
    markLessonCompleted(lessonId) {
        // Send AJAX request to mark lesson as completed
        const data = {
            action: 'pmp_mark_lesson_completed',
            lesson_id: lessonId,
            user_id: this.getCurrentUserId(),
            nonce: window.pmpData?.nonce || ''
        };
        
        fetch(window.pmpData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.updateLessonCompletionUI(lessonId);
                this.updateProgressBar();
            }
        })
        .catch(error => {
            console.warn('Progress tracking failed:', error);
        });
    }
    
    /**
     * Update lesson completion UI
     */
    updateLessonCompletionUI(lessonId) {
        const lessonItem = this.navigation.querySelector(`[data-lesson-id="${lessonId}"]`);
        if (!lessonItem) return;
        
        lessonItem.classList.add('completed');
        
        const statusIcon = lessonItem.querySelector('.lesson-status');
        if (statusIcon) {
            statusIcon.innerHTML = `
                <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M13.707 4.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L7 9.586l5.293-5.293a1 1 0 011.414 0z"/>
                </svg>
            `;
            statusIcon.setAttribute('aria-label', 'Lesson completed');
        }
        
        // Update ARIA attributes
        const lessonLink = lessonItem.querySelector('.lesson-link');
        if (lessonLink) {
            const currentLabel = lessonLink.getAttribute('aria-label') || '';
            if (!currentLabel.includes('completed')) {
                lessonLink.setAttribute('aria-label', currentLabel + ', completed');
            }
        }
        
        // Update status description for screen readers
        const statusDesc = lessonItem.querySelector(`#lesson-${lessonId}-status`);
        if (statusDesc) {
            statusDesc.textContent = this.getLessonStatusDescription(lessonItem);
        }
        
        // Announce completion to screen readers
        const lessonTitle = lessonItem.querySelector('.lesson-title')?.textContent;
        this.announceToScreenReader(`${lessonTitle || 'Lesson'} marked as completed`);
    }
    
    /**
     * Update progress bar
     */
    updateProgressBar() {
        const completedLessons = this.navigation.querySelectorAll('.lesson-item.completed').length;
        const totalLessons = this.navigation.querySelectorAll('.lesson-item').length;
        const percentage = Math.round((completedLessons / totalLessons) * 100);
        
        const progressFill = this.navigation.querySelector('.progress-fill');
        const progressText = this.navigation.querySelector('.progress-text');
        const completedCount = this.navigation.querySelector('.lesson-count .completed');
        
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        
        if (progressText) {
            progressText.textContent = percentage + '% Complete';
        }
        
        if (completedCount) {
            completedCount.textContent = completedLessons;
        }
        
        // Update progress bar ARIA attributes
        const progressBar = this.navigation.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.setAttribute('role', 'progressbar');
            progressBar.setAttribute('aria-valuenow', percentage);
            progressBar.setAttribute('aria-valuemin', '0');
            progressBar.setAttribute('aria-valuemax', '100');
            progressBar.setAttribute('aria-label', `Course progress: ${percentage}% complete, ${completedLessons} of ${totalLessons} lessons completed`);
        }
        
        // Announce progress update to screen readers
        const progressRegion = document.getElementById('progress-updates');
        if (progressRegion) {
            progressRegion.textContent = `Progress updated: ${percentage}% complete`;
        }
    }
    
    /**
     * Setup window resize handler
     */
    setupResizeHandler() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasMobile = this.isMobile;
                this.isMobile = window.innerWidth <= 991.98;
                
                // Close mobile nav if window becomes large
                if (window.innerWidth > 991.98) {
                    if (this.navigation && this.navigation.classList.contains('nav-open')) {
                        this.closeMobileNav();
                    }
                    if (this.navbarCollapse && this.navbarCollapse.classList.contains('show')) {
                        this.closeMainMobileNav();
                    }
                    document.body.style.overflow = '';
                }
                
                // Initialize mobile features if switching to mobile
                if (!wasMobile && this.isMobile) {
                    this.initMobileFeatures();
                }
                
                // Update navigation layout for new screen size
                this.updateNavigationLayout();
            }, 250);
        });
    }
    
    /**
     * Setup touch gestures for mobile navigation
     */
    setupTouchGestures() {
        if (!('ontouchstart' in window)) return;
        
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        
        // Add touch event listeners to navigation
        if (this.navbarCollapse) {
            this.navbarCollapse.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            this.navbarCollapse.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        }
    }
    
    /**
     * Handle touch start for swipe gestures
     */
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
    }
    
    /**
     * Handle touch end for swipe gestures
     */
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        this.handleSwipeGesture();
    }
    
    /**
     * Process swipe gesture
     */
    handleSwipeGesture() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const minSwipeDistance = 50;
        
        // Swipe up to close mobile navigation
        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -minSwipeDistance) {
            if (this.navbarCollapse && this.navbarCollapse.classList.contains('show')) {
                this.closeMainMobileNav();
            }
        }
    }
    
    /**
     * Initialize mobile-specific features
     */
    initMobileFeatures() {
        // Add mobile-specific classes
        document.body.classList.add('pmp-mobile-navigation');
        
        // Setup mobile dashboard toggle if it exists
        this.setupMobileDashboardToggle();
        
        // Enhance dropdown behavior for touch
        this.enhanceDropdownTouch();
        
        // Setup mobile-specific accessibility features
        this.setupMobileAccessibility();
    }
    
    /**
     * Setup mobile dashboard toggle
     */
    setupMobileDashboardToggle() {
        const dashboardToggle = document.querySelector('.pmp-mobile-dashboard-toggle');
        const dashboardNav = document.querySelector('.pmp-dashboard-nav');
        
        if (!dashboardToggle || !dashboardNav) return;
        
        dashboardToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isActive = dashboardToggle.classList.contains('active');
            
            if (isActive) {
                dashboardToggle.classList.remove('active');
                dashboardNav.style.display = 'none';
                dashboardToggle.setAttribute('aria-expanded', 'false');
            } else {
                dashboardToggle.classList.add('active');
                dashboardNav.style.display = 'block';
                dashboardToggle.setAttribute('aria-expanded', 'true');
            }
        });
    }
    
    /**
     * Enhance dropdown behavior for touch devices
     */
    enhanceDropdownTouch() {
        const dropdownToggles = this.navbarCollapse.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            // Prevent double-tap issues on mobile
            toggle.addEventListener('touchend', (e) => {
                e.preventDefault();
                
                // Toggle dropdown manually for better mobile experience
                const dropdown = toggle.nextElementSibling;
                if (dropdown && dropdown.classList.contains('dropdown-menu')) {
                    const isShown = dropdown.classList.contains('show');
                    
                    // Close all other dropdowns first
                    this.closeAllDropdowns();
                    
                    if (!isShown) {
                        dropdown.classList.add('show');
                        toggle.setAttribute('aria-expanded', 'true');
                    }
                }
            });
        });
    }
    
    /**
     * Close all dropdown menus
     */
    closeAllDropdowns() {
        const dropdowns = this.navbarCollapse.querySelectorAll('.dropdown-menu.show');
        const toggles = this.navbarCollapse.querySelectorAll('.dropdown-toggle[aria-expanded="true"]');
        
        dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
        toggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
    }
    
    /**
     * Setup mobile-specific accessibility features
     */
    setupMobileAccessibility() {
        // Add mobile-specific ARIA labels
        if (this.mobileNavToggle) {
            this.mobileNavToggle.setAttribute('aria-label', 'Toggle mobile navigation menu');
        }
        
        // Enhance focus management for mobile
        this.setupMobileFocusManagement();
    }
    
    /**
     * Setup mobile focus management
     */
    setupMobileFocusManagement() {
        // Trap focus within mobile navigation when open
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.navbarCollapse.classList.contains('show')) {
                this.trapFocusInMobileNav(e);
            }
        });
    }
    
    /**
     * Trap focus within mobile navigation
     */
    trapFocusInMobileNav(e) {
        const focusableElements = this.navbarCollapse.querySelectorAll(
            'a:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    /**
     * Update navigation layout for screen size changes
     */
    updateNavigationLayout() {
        // Update mobile-specific classes and behaviors
        if (this.isMobile) {
            document.body.classList.add('pmp-mobile-navigation');
        } else {
            document.body.classList.remove('pmp-mobile-navigation', 'mobile-nav-open');
        }
        
        // Update ARIA attributes based on screen size
        this.updateAriaForScreenSize();
    }
    
    /**
     * Update ARIA attributes based on screen size
     */
    updateAriaForScreenSize() {
        if (this.mobileNavToggle) {
            if (this.isMobile) {
                this.mobileNavToggle.removeAttribute('hidden');
                this.mobileNavToggle.setAttribute('tabindex', '0');
            } else {
                this.mobileNavToggle.setAttribute('aria-expanded', 'false');
            }
        }
    }
    
    /**
     * Setup swipe to close functionality
     */
    setupSwipeToClose() {
        // Already handled in setupTouchGestures
    }
    
    /**
     * Remove swipe listeners
     */
    removeSwipeListeners() {
        // Clean up if needed
    }
    
    /**
     * Update active states
     */
    updateActiveStates() {
        // Remove all current states
        this.navigation.querySelectorAll('.current-lesson, .current-module').forEach(el => {
            el.classList.remove('current-lesson', 'current-module');
        });
        
        if (!this.currentLessonId) return;
        
        // Add current lesson state
        const currentLessonItem = this.navigation.querySelector(`[data-lesson-id="${this.currentLessonId}"]`);
        if (currentLessonItem) {
            currentLessonItem.classList.add('current-lesson');
            
            // Add current module state
            const moduleItem = currentLessonItem.closest('.module-item');
            if (moduleItem) {
                moduleItem.classList.add('current-module');
            }
        }
    }
    
    /**
     * Track lesson access
     */
    trackLessonAccess(lessonId) {
        // Update last accessed lesson
        const data = {
            action: 'pmp_track_lesson_access',
            lesson_id: lessonId,
            user_id: this.getCurrentUserId(),
            nonce: window.pmpData?.nonce || ''
        };
        
        fetch(window.pmpData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        })
        .catch(error => {
            console.warn('Lesson access tracking failed:', error);
        });
    }
    
    /**
     * Save module state to localStorage
     */
    saveModuleState(moduleId, isExpanded) {
        const moduleStates = JSON.parse(localStorage.getItem('pmp_module_states') || '{}');
        moduleStates[moduleId] = isExpanded;
        localStorage.setItem('pmp_module_states', JSON.stringify(moduleStates));
    }
    
    /**
     * Load module states from localStorage
     */
    loadModuleStates() {
        const moduleStates = JSON.parse(localStorage.getItem('pmp_module_states') || '{}');
        
        Object.entries(moduleStates).forEach(([moduleId, isExpanded]) => {
            const toggle = this.navigation.querySelector(`[aria-controls="lessons-${moduleId}"]`);
            if (toggle && isExpanded) {
                // Expand the module without animation on load
                const container = document.getElementById(`lessons-${moduleId}`);
                if (container) {
                    toggle.setAttribute('aria-expanded', 'true');
                    container.classList.remove('collapsed');
                    container.classList.add('expanded');
                }
            }
        });
    }
    
    /**
     * Get current lesson ID from page
     */
    getCurrentLessonId() {
        // Try to get from body class or data attribute
        const body = document.body;
        const lessonMatch = body.className.match(/lesson-([^\s]+)/);
        
        if (lessonMatch) {
            return lessonMatch[1];
        }
        
        // Try to get from URL
        const urlMatch = window.location.pathname.match(/\/lesson\/([^\/]+)/);
        if (urlMatch) {
            return urlMatch[1];
        }
        
        return null;
    }
    
    /**
     * Get current user ID
     */
    getCurrentUserId() {
        return window.pmpData?.userId || 0;
    }
    
    /**
     * Setup comprehensive accessibility features
     */
    setupAccessibilityFeatures() {
        // Add skip links
        this.addSkipLinks();
        
        // Enhance ARIA attributes
        this.enhanceAriaAttributes();
        
        // Setup roving tabindex for better keyboard navigation
        this.setupRovingTabindex();
        
        // Add screen reader announcements
        this.setupScreenReaderAnnouncements();
        
        // Handle reduced motion preferences
        this.handleReducedMotion();
    }
    
    /**
     * Add skip links for keyboard navigation
     */
    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.setAttribute('tabindex', '0');
        
        // Insert at the beginning of the navigation
        this.navigation.insertBefore(skipLink, this.navigation.firstChild);
        
        // Add skip to navigation link in main content if it exists
        const mainContent = document.getElementById('main-content') || document.querySelector('main');
        if (mainContent) {
            const skipToNav = document.createElement('a');
            skipToNav.href = '#pmp-course-navigation';
            skipToNav.className = 'skip-link';
            skipToNav.textContent = 'Skip to course navigation';
            skipToNav.setAttribute('tabindex', '0');
            
            mainContent.insertBefore(skipToNav, mainContent.firstChild);
        }
    }
    
    /**
     * Enhance ARIA attributes for better screen reader support
     */
    enhanceAriaAttributes() {
        // Add navigation landmark
        this.navigation.setAttribute('role', 'navigation');
        this.navigation.setAttribute('aria-label', 'Course Navigation');
        
        // Add region for progress summary
        const progressSummary = this.navigation.querySelector('.progress-summary');
        if (progressSummary) {
            progressSummary.setAttribute('role', 'region');
            progressSummary.setAttribute('aria-label', 'Course Progress Summary');
        }
        
        // Enhance module and lesson ARIA attributes
        this.moduleToggles.forEach((toggle, index) => {
            const moduleId = toggle.getAttribute('aria-controls');
            const moduleContainer = document.getElementById(moduleId);
            
            if (moduleContainer) {
                // Add proper ARIA attributes to module
                toggle.setAttribute('aria-describedby', `${moduleId}-desc`);
                moduleContainer.setAttribute('role', 'group');
                moduleContainer.setAttribute('aria-labelledby', toggle.id || `module-toggle-${index}`);
                
                // Add description for screen readers
                const moduleHeader = toggle.closest('.module-header');
                const moduleTitle = moduleHeader?.querySelector('.module-title');
                if (moduleTitle && !document.getElementById(`${moduleId}-desc`)) {
                    const desc = document.createElement('div');
                    desc.id = `${moduleId}-desc`;
                    desc.className = 'sr-only';
                    desc.textContent = `Module containing ${moduleContainer.querySelectorAll('.lesson-item').length} lessons`;
                    moduleHeader.appendChild(desc);
                }
            }
        });
        
        // Enhance lesson ARIA attributes
        this.lessonLinks.forEach((link, index) => {
            const lessonItem = link.closest('.lesson-item');
            if (lessonItem) {
                const lessonId = lessonItem.dataset.lessonId;
                const lessonTitle = link.querySelector('.lesson-title')?.textContent;
                const lessonDuration = link.querySelector('.lesson-meta')?.textContent;
                
                // Add comprehensive ARIA label
                let ariaLabel = lessonTitle || `Lesson ${index + 1}`;
                if (lessonDuration) {
                    ariaLabel += `, ${lessonDuration}`;
                }
                
                if (lessonItem.classList.contains('completed')) {
                    ariaLabel += ', completed';
                }
                
                if (lessonItem.classList.contains('current-lesson')) {
                    ariaLabel += ', current lesson';
                }
                
                link.setAttribute('aria-label', ariaLabel);
                link.setAttribute('aria-describedby', `lesson-${lessonId}-status`);
                
                // Add status description
                const statusDesc = document.createElement('div');
                statusDesc.id = `lesson-${lessonId}-status`;
                statusDesc.className = 'sr-only';
                statusDesc.textContent = this.getLessonStatusDescription(lessonItem);
                lessonItem.appendChild(statusDesc);
            }
        });
    }
    
    /**
     * Setup roving tabindex for better keyboard navigation
     */
    setupRovingTabindex() {
        const focusableElements = this.getFocusableElements();
        
        // Set initial tabindex values
        focusableElements.forEach((element, index) => {
            element.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });
        
        // Handle focus changes
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                // Remove tabindex from all elements
                focusableElements.forEach(el => el.setAttribute('tabindex', '-1'));
                // Set current element as tabbable
                element.setAttribute('tabindex', '0');
            });
        });
    }
    
    /**
     * Setup screen reader announcements
     */
    setupScreenReaderAnnouncements() {
        // Create live region for announcements
        if (!document.getElementById('navigation-announcements')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'navigation-announcements';
            liveRegion.className = 'aria-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
    }
    
    /**
     * Setup ARIA live regions for dynamic updates
     */
    setupAriaLiveRegions() {
        // Progress updates live region
        const progressRegion = document.createElement('div');
        progressRegion.id = 'progress-updates';
        progressRegion.className = 'aria-live-region';
        progressRegion.setAttribute('aria-live', 'polite');
        progressRegion.setAttribute('aria-atomic', 'false');
        document.body.appendChild(progressRegion);
        
        // Navigation state live region
        const navStateRegion = document.createElement('div');
        navStateRegion.id = 'navigation-state';
        navStateRegion.className = 'aria-live-region';
        navStateRegion.setAttribute('aria-live', 'assertive');
        navStateRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(navStateRegion);
    }
    
    /**
     * Handle reduced motion preferences
     */
    handleReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Disable smooth scrolling
            this.navigation.style.scrollBehavior = 'auto';
            
            // Add class to disable animations
            this.navigation.classList.add('reduced-motion');
        }
    }
    
    /**
     * Announce initial navigation state to screen readers
     */
    announceInitialState() {
        const totalLessons = this.navigation.querySelectorAll('.lesson-item').length;
        const completedLessons = this.navigation.querySelectorAll('.lesson-item.completed').length;
        const currentLesson = this.navigation.querySelector('.lesson-item.current-lesson');
        
        let announcement = `Course navigation loaded. ${totalLessons} lessons total, ${completedLessons} completed.`;
        
        if (currentLesson) {
            const lessonTitle = currentLesson.querySelector('.lesson-title')?.textContent;
            announcement += ` Currently on ${lessonTitle || 'current lesson'}.`;
        }
        
        this.announceToScreenReader(announcement);
    }
    
    /**
     * Get lesson status description for screen readers
     */
    getLessonStatusDescription(lessonItem) {
        const statuses = [];
        
        if (lessonItem.classList.contains('completed')) {
            statuses.push('completed');
        }
        
        if (lessonItem.classList.contains('current-lesson')) {
            statuses.push('current lesson');
        }
        
        if (lessonItem.classList.contains('locked')) {
            statuses.push('locked');
        }
        
        const ecoRefs = lessonItem.querySelector('.eco-refs')?.textContent;
        if (ecoRefs) {
            statuses.push(`covers ${ecoRefs}`);
        }
        
        return statuses.length > 0 ? statuses.join(', ') : 'available';
    }
    
    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'navigation-state' : 'navigation-announcements';
        const liveRegion = document.getElementById(regionId);
        
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PMPNavigation();
});

// Export for potential external use
window.PMPNavigation = PMPNavigation;