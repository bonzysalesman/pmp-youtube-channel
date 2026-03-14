/**
 * PMP Progressive Loading JavaScript
 * 
 * Handles progressive loading of dashboard and navigation data
 */

(function() {
    'use strict';
    
    // Configuration
    const config = {
        apiUrl: pmpData?.ajaxUrl || '/wp-admin/admin-ajax.php',
        nonce: pmpData?.nonce || '',
        userId: pmpData?.userId || 0,
        retryAttempts: 3,
        retryDelay: 1000,
        timeout: 10000
    };
    
    // Loading states
    const loadingStates = {
        dashboard: false,
        navigation: false,
        progress: false
    };
    
    // Cache for loaded data
    const dataCache = new Map();
    
    /**
     * Initialize progressive loading
     */
    function init() {
        // Load dashboard data if on dashboard page
        if (document.getElementById('pmp-dashboard')) {
            loadDashboardData();
        }
        
        // Load navigation data if navigation exists
        if (document.querySelector('.pmp-navigation')) {
            loadNavigationData();
        }
        
        // Set up intersection observer for lazy loading sections
        setupSectionObserver();
        
        // Handle connection changes
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', handleConnectionChange);
        }
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    /**
     * Load dashboard data progressively
     */
    async function loadDashboardData() {
        if (loadingStates.dashboard || !config.userId) {
            return;
        }
        
        loadingStates.dashboard = true;
        
        try {
            // Show loading state
            showLoadingState('dashboard');
            
            // Load critical data first (progress)
            const progressData = await loadData('pmp_load_progress_data', {
                user_id: config.userId,
                nonce: config.nonce
            });
            
            if (progressData.success) {
                updateProgressDisplay(progressData.data);
            }
            
            // Load secondary data with delay based on connection
            const connectionQuality = getConnectionQuality();
            const delays = {
                slow: [2000, 4000],
                medium: [1000, 2000],
                fast: [500, 1000]
            };
            
            const [activityDelay, recommendationsDelay] = delays[connectionQuality] || delays.fast;
            
            // Load recent activity
            setTimeout(async () => {
                try {
                    const activityData = await loadData('pmp_load_dashboard_data', {
                        user_id: config.userId,
                        nonce: config.nonce,
                        section: 'activity'
                    });
                    
                    if (activityData.success) {
                        updateActivityDisplay(activityData.data);
                    }
                } catch (error) {
                    console.warn('Failed to load activity data:', error);
                }
            }, activityDelay);
            
            // Load recommendations
            setTimeout(async () => {
                try {
                    const recommendationsData = await loadData('pmp_load_dashboard_data', {
                        user_id: config.userId,
                        nonce: config.nonce,
                        section: 'recommendations'
                    });
                    
                    if (recommendationsData.success) {
                        updateRecommendationsDisplay(recommendationsData.data);
                    }
                } catch (error) {
                    console.warn('Failed to load recommendations:', error);
                }
            }, recommendationsDelay);
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            showErrorState('dashboard', error.message);
        } finally {
            loadingStates.dashboard = false;
            hideLoadingState('dashboard');
        }
    }
    
    /**
     * Load navigation data progressively
     */
    async function loadNavigationData() {
        if (loadingStates.navigation) {
            return;
        }
        
        loadingStates.navigation = true;
        
        try {
            showLoadingState('navigation');
            
            const navigationData = await loadData('pmp_load_navigation_data', {
                course_id: 'pmp-prep-course',
                user_id: config.userId
            });
            
            if (navigationData.success) {
                updateNavigationDisplay(navigationData.data);
            }
            
        } catch (error) {
            console.error('Failed to load navigation data:', error);
            showErrorState('navigation', error.message);
        } finally {
            loadingStates.navigation = false;
            hideLoadingState('navigation');
        }
    }
    
    /**
     * Generic data loading function with retry logic
     */
    async function loadData(action, data, attempt = 1) {
        const cacheKey = `${action}_${JSON.stringify(data)}`;
        
        // Check cache first
        if (dataCache.has(cacheKey)) {
            const cached = dataCache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes
                return cached.data;
            }
        }
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            
            const formData = new FormData();
            formData.append('action', action);
            
            for (const [key, value] of Object.entries(data)) {
                formData.append(key, value);
            }
            
            const response = await fetch(config.apiUrl, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Cache successful results
            if (result.success) {
                dataCache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
            }
            
            return result;
            
        } catch (error) {
            console.warn(`Attempt ${attempt} failed for ${action}:`, error.message);
            
            if (attempt < config.retryAttempts) {
                // Exponential backoff
                const delay = config.retryDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
                return loadData(action, data, attempt + 1);
            }
            
            throw error;
        }
    }
    
    /**
     * Update progress display
     */
    function updateProgressDisplay(data) {
        const progressElement = document.getElementById('progress-circle');
        if (progressElement && data.data) {
            const percentage = data.data.overall_progress?.percentage || 0;
            
            // Update circular progress
            const circle = progressElement.querySelector('.progress-bar-circle');
            if (circle) {
                const circumference = 314.16;
                const offset = circumference - (circumference * percentage / 100);
                circle.style.strokeDashoffset = offset;
            }
            
            // Update text
            const text = progressElement.querySelector('.progress-text');
            if (text) {
                text.textContent = `${percentage.toFixed(1)}%`;
            }
            
            // Update stats
            updateProgressStats(data.data);
        }
    }
    
    /**
     * Update progress statistics
     */
    function updateProgressStats(data) {
        const stats = data.overall_progress || {};
        
        // Update completed count
        const completedElement = document.querySelector('.stat-number.text-success');
        if (completedElement && stats.completed !== undefined) {
            animateNumber(completedElement, stats.completed);
        }
        
        // Update remaining count
        const remainingElement = document.querySelector('.stat-number.text-primary');
        if (remainingElement && stats.remaining !== undefined) {
            animateNumber(remainingElement, stats.remaining);
        }
    }
    
    /**
     * Update activity display
     */
    function updateActivityDisplay(data) {
        const activityContainer = document.querySelector('.activity-timeline');
        if (activityContainer && data.data?.recent_activity) {
            const activities = data.data.recent_activity;
            
            activityContainer.innerHTML = '';
            
            activities.forEach(activity => {
                const activityElement = createActivityElement(activity);
                activityContainer.appendChild(activityElement);
            });
            
            // Animate in
            activityContainer.classList.add('loaded');
        }
    }
    
    /**
     * Create activity element
     */
    function createActivityElement(activity) {
        const div = document.createElement('div');
        div.className = 'activity-item d-flex align-items-start mb-3';
        
        div.innerHTML = `
            <div class="activity-icon me-3">
                <div class="bg-${activity.color || 'primary'} rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                    <i class="${activity.icon || 'fas fa-check'} text-white" style="font-size: 12px;"></i>
                </div>
            </div>
            <div class="activity-content flex-grow-1">
                <p class="activity-title mb-1">${escapeHtml(activity.title)}</p>
                <small class="text-muted">${escapeHtml(activity.timestamp)}</small>
            </div>
        `;
        
        return div;
    }
    
    /**
     * Update recommendations display
     */
    function updateRecommendationsDisplay(data) {
        const recommendationsContainer = document.querySelector('.recommendations-container');
        if (recommendationsContainer && data.data?.recommendations) {
            // Implementation for recommendations
            recommendationsContainer.classList.add('loaded');
        }
    }
    
    /**
     * Update navigation display
     */
    function updateNavigationDisplay(data) {
        const navigationContainer = document.querySelector('.pmp-navigation');
        if (navigationContainer && data.data) {
            // Update navigation with fresh data
            updateNavigationProgress(data.data);
            navigationContainer.classList.add('loaded');
        }
    }
    
    /**
     * Update navigation progress indicators
     */
    function updateNavigationProgress(data) {
        if (!data.progress) return;
        
        const progressData = data.progress;
        
        // Update lesson completion indicators
        Object.keys(progressData).forEach(lessonId => {
            const lessonElement = document.querySelector(`[data-lesson-id="${lessonId}"]`);
            if (lessonElement) {
                if (progressData[lessonId].completed) {
                    lessonElement.classList.add('completed');
                } else if (progressData[lessonId].started) {
                    lessonElement.classList.add('in-progress');
                }
            }
        });
    }
    
    /**
     * Show loading state for a section
     */
    function showLoadingState(section) {
        const element = document.getElementById(`${section}-loading`) || 
                       document.querySelector(`.${section}-container`);
        
        if (element) {
            element.classList.add('loading');
        }
    }
    
    /**
     * Hide loading state for a section
     */
    function hideLoadingState(section) {
        const element = document.getElementById(`${section}-loading`) || 
                       document.querySelector(`.${section}-container`);
        
        if (element) {
            element.classList.remove('loading');
        }
    }
    
    /**
     * Show error state
     */
    function showErrorState(section, message) {
        const element = document.querySelector(`.${section}-container`);
        if (element) {
            element.classList.add('error');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-warning';
            errorDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                Unable to load ${section} data. <button class="btn btn-link p-0" onclick="location.reload()">Retry</button>
            `;
            
            element.appendChild(errorDiv);
        }
    }
    
    /**
     * Setup intersection observer for lazy loading sections
     */
    function setupSectionObserver() {
        if (!('IntersectionObserver' in window)) {
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target.dataset.section;
                    if (section) {
                        loadSectionData(section);
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            rootMargin: '100px 0px'
        });
        
        // Observe lazy-loadable sections
        document.querySelectorAll('[data-lazy-section]').forEach(section => {
            observer.observe(section);
        });
    }
    
    /**
     * Load data for a specific section
     */
    async function loadSectionData(section) {
        try {
            const data = await loadData(`pmp_load_${section}_data`, {
                user_id: config.userId,
                nonce: config.nonce
            });
            
            if (data.success) {
                updateSectionDisplay(section, data.data);
            }
        } catch (error) {
            console.warn(`Failed to load ${section} data:`, error);
        }
    }
    
    /**
     * Update section display
     */
    function updateSectionDisplay(section, data) {
        const element = document.querySelector(`[data-section="${section}"]`);
        if (element) {
            element.classList.add('loaded');
            // Section-specific update logic would go here
        }
    }
    
    /**
     * Get connection quality
     */
    function getConnectionQuality() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const effectiveType = connection.effectiveType;
            
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                return 'slow';
            } else if (effectiveType === '3g') {
                return 'medium';
            } else {
                return 'fast';
            }
        }
        
        return 'fast'; // Default assumption
    }
    
    /**
     * Handle connection changes
     */
    function handleConnectionChange() {
        const quality = getConnectionQuality();
        console.log('Connection changed to:', quality);
        
        // Adjust loading behavior based on new connection
        if (quality === 'slow') {
            // Pause non-critical loading
            clearTimeout(window.pmpLoadingTimeouts);
        } else if (quality === 'fast') {
            // Resume or accelerate loading
            if (!loadingStates.dashboard) {
                loadDashboardData();
            }
        }
    }
    
    /**
     * Handle page visibility changes
     */
    function handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // Refresh data when page becomes visible
            const now = Date.now();
            const staleThreshold = 300000; // 5 minutes
            
            dataCache.forEach((cached, key) => {
                if (now - cached.timestamp > staleThreshold) {
                    dataCache.delete(key);
                }
            });
            
            // Reload critical data if stale
            if (!loadingStates.dashboard) {
                loadDashboardData();
            }
        }
    }
    
    /**
     * Animate number changes
     */
    function animateNumber(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        requestAnimationFrame(updateNumber);
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Public API
    window.PMP_ProgressiveLoading = {
        init: init,
        loadDashboardData: loadDashboardData,
        loadNavigationData: loadNavigationData,
        clearCache: () => dataCache.clear(),
        getLoadingStates: () => ({ ...loadingStates })
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();