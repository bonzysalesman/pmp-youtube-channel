/**
 * PMP Progress Tracker JavaScript
 * 
 * Handles interactive progress tracking functionality for the dashboard
 * including real-time updates, animations, and user interactions.
 */

class PMPProgressTracker {
    constructor() {
        this.userId = null;
        this.courseId = 'pmp-prep-course';
        this.progressData = {};
        this.updateInterval = null;
        this.animationQueue = [];
        
        this.init();
    }
    
    /**
     * Initialize the progress tracker
     */
    init() {
        this.bindEvents();
        this.loadProgressData();
        this.startPeriodicUpdates();
        this.initializeAnimations();
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Progress circle hover effects
        const progressCircle = document.getElementById('progress-circle');
        if (progressCircle) {
            progressCircle.addEventListener('mouseenter', () => this.showProgressTooltip());
            progressCircle.addEventListener('mouseleave', () => this.hideProgressTooltip());
            progressCircle.addEventListener('click', () => this.showDetailedProgress());
        }
        
        // Continue learning button tracking
        const continueBtn = document.querySelector('.continue-learning-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', (e) => this.trackLessonStart(e));
        }
        
        // Current lesson interactions
        this.bindCurrentLessonEvents();
        
        // Quick action tracking
        const quickActions = document.querySelectorAll('.quick-action-btn');
        quickActions.forEach(btn => {
            btn.addEventListener('click', (e) => this.trackQuickAction(e));
        });
        
        // Activity item interactions
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleActivityClick(e));
        });
        
        // Refresh progress data
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshProgressData();
            }
        });
        
        // Window focus events for real-time updates
        window.addEventListener('focus', () => this.onWindowFocus());
        window.addEventListener('blur', () => this.onWindowBlur());
    }
    
    /**
     * Bind current lesson specific events
     */
    bindCurrentLessonEvents() {
        // Continue current lesson button
        const continueCurrentBtn = document.querySelector('.continue-current-lesson-btn');
        if (continueCurrentBtn) {
            continueCurrentBtn.addEventListener('click', (e) => this.handleContinueCurrentLesson(e));
        }
        
        // Mark complete button
        const markCompleteBtn = document.querySelector('.mark-complete-btn');
        if (markCompleteBtn) {
            markCompleteBtn.addEventListener('click', (e) => this.handleMarkComplete(e));
        }
        
        // Current lesson card interactions
        const currentLessonCard = document.querySelector('.current-lesson-card');
        if (currentLessonCard) {
            currentLessonCard.addEventListener('mouseenter', () => this.highlightCurrentLesson());
            currentLessonCard.addEventListener('mouseleave', () => this.unhighlightCurrentLesson());
            
            // Add click tracking for the entire card
            currentLessonCard.addEventListener('click', (e) => this.handleCurrentLessonCardClick(e));
        }
        
        // Auto-highlight current lesson if it's active
        this.autoHighlightCurrentLesson();
    }
    
    /**
     * Handle current lesson card click
     */
    handleCurrentLessonCardClick(event) {
        // Don't trigger if clicking on buttons
        if (event.target.closest('.btn')) {
            return;
        }
        
        const lessonCard = event.target.closest('.current-lesson-card');
        const lessonId = lessonCard.dataset.lessonId;
        
        // Track card interaction
        this.sendTrackingData('current_lesson_card_clicked', {
            lesson_id: lessonId,
            timestamp: new Date().toISOString()
        });
        
        // Add visual feedback
        lessonCard.classList.add('lesson-active');
        setTimeout(() => {
            lessonCard.classList.remove('lesson-active');
        }, 2000);
    }
    
    /**
     * Auto-highlight current lesson based on user activity
     */
    autoHighlightCurrentLesson() {
        const currentLessonCard = document.querySelector('.current-lesson-card');
        if (currentLessonCard) {
            // Check if lesson is in progress
            const progressBar = currentLessonCard.querySelector('.progress-bar');
            if (progressBar) {
                const progress = parseFloat(progressBar.style.width) || 0;
                if (progress > 0 && progress < 100) {
                    currentLessonCard.classList.add('lesson-active');
                }
            }
        }
    }
    
    /**
     * Load initial progress data
     */
    async loadProgressData() {
        try {
            this.showLoadingState();
            
            const response = await this.fetchProgressData();
            if (response.success) {
                this.progressData = response.data;
                this.updateProgressDisplay();
                this.animateProgressElements();
            } else {
                this.handleProgressError(response.error);
            }
        } catch (error) {
            console.error('Failed to load progress data:', error);
            this.handleProgressError(error.message);
        } finally {
            this.hideLoadingState();
        }
    }
    
    /**
     * Fetch progress data from server
     */
    async fetchProgressData() {
        try {
            const response = await fetch(pmpAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_user_progress',
                    nonce: pmpAjax.nonce,
                    user_id: pmpAjax.userId || 'current'
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.data || 'Failed to fetch progress data');
            }
            
            return result;
        } catch (error) {
            console.error('Error fetching progress data:', error);
            throw error;
        }
    }
    
    /**
     * Update progress display elements
     */
    updateProgressDisplay() {
        this.updateProgressCircle();
        this.updateProgressStats();
        this.updateWeeklyProgress();
        this.updateRecentActivity();
        this.updateRecommendations();
    }
    
    /**
     * Update the circular progress indicator
     */
    updateProgressCircle() {
        const circle = document.querySelector('.progress-bar-circle');
        const text = document.querySelector('.progress-text');
        
        if (!circle || !text || !this.progressData.overall) return;
        
        const percentage = this.progressData.overall.percentage || 0;
        const circumference = 314.16; // 2 * π * 50 (radius)
        const offset = circumference - (circumference * percentage / 100);
        
        // Animate the circle
        circle.style.strokeDashoffset = offset;
        
        // Animate the text
        this.animateNumber(text, 0, percentage, 2000, 1);
        
        // Add completion effects
        if (percentage >= 100) {
            this.addCompletionEffects();
        }
    }
    
    /**
     * Update progress statistics
     */
    updateProgressStats() {
        if (!this.progressData.overall) return;
        
        const data = this.progressData.overall;
        
        // Update completed lessons
        const completedElement = document.querySelector('.stat-number.text-success');
        if (completedElement) {
            this.animateNumber(completedElement, 0, data.completed_lessons || 0, 1500);
        }
        
        // Update remaining lessons
        const remainingElement = document.querySelector('.stat-number.text-primary');
        if (remainingElement) {
            const remaining = (data.total_lessons || 91) - (data.completed_lessons || 0);
            this.animateNumber(remainingElement, 0, remaining, 1500);
        }
        
        // Update week indicator
        const weekBadge = document.querySelector('.dashboard-stats-quick .badge');
        if (weekBadge && data.current_week) {
            weekBadge.textContent = `Week ${data.current_week} of 13`;
        }
        
        // Add progress bars to stats
        this.addProgressBars();
    }
    
    /**
     * Update weekly progress indicators
     */
    updateWeeklyProgress() {
        if (!this.progressData.weekly) return;
        
        // Create or update weekly progress bar
        let weeklyBar = document.querySelector('.weekly-progress-bar');
        if (!weeklyBar) {
            weeklyBar = this.createWeeklyProgressBar();
        }
        
        const weeklyData = this.progressData.weekly;
        const indicators = weeklyBar.querySelectorAll('.week-indicator');
        
        indicators.forEach((indicator, index) => {
            const weekKey = `week_${index + 1}`;
            const weekData = weeklyData[weekKey];
            
            if (weekData && weekData.percentage >= 100) {
                indicator.classList.add('completed');
            } else {
                indicator.classList.remove('completed');
            }
        });
    }
    
    /**
     * Update recent activity display
     */
    updateRecentActivity() {
        if (!this.progressData.recent_activity) return;
        
        const timeline = document.querySelector('.activity-timeline');
        if (!timeline) return;
        
        // Clear existing activities
        timeline.innerHTML = '';
        
        // Add new activities
        this.progressData.recent_activity.forEach((activity, index) => {
            const activityElement = this.createActivityElement(activity);
            timeline.appendChild(activityElement);
            
            // Animate in with delay
            setTimeout(() => {
                activityElement.classList.add('slideIn');
            }, index * 100);
        });
        
        // Add "View All" button if not exists
        this.ensureViewAllButton();
    }
    
    /**
     * Update recommendations display
     */
    updateRecommendations() {
        if (!this.progressData.recommendations) return;
        
        const nextLesson = document.querySelector('.lesson-description').parentElement;
        const existingRec = nextLesson.querySelector('.recommendation-reason');
        
        if (this.progressData.recommendations.length > 0 && !existingRec) {
            const recommendation = this.progressData.recommendations[0];
            const recElement = this.createRecommendationElement(recommendation);
            nextLesson.appendChild(recElement);
        }
    }
    
    /**
     * Animate number changes
     */
    animateNumber(element, start, end, duration, decimals = 0) {
        const startTime = performance.now();
        const difference = end - start;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (difference * easeOut);
            
            element.textContent = current.toFixed(decimals);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Show progress tooltip
     */
    showProgressTooltip() {
        if (!this.progressData.overall) return;
        
        const container = document.getElementById('progress-circle');
        let tooltip = container.querySelector('.progress-tooltip');
        
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'progress-tooltip';
            container.appendChild(tooltip);
        }
        
        const data = this.progressData.overall;
        const completionDate = data.estimated_completion_date || 'Not calculated';
        
        tooltip.innerHTML = `
            <strong>${data.completed_lessons || 0}</strong> of <strong>${data.total_lessons || 91}</strong> lessons completed<br>
            <small>Estimated completion: ${completionDate}</small>
        `;
        
        tooltip.classList.add('show');
    }
    
    /**
     * Hide progress tooltip
     */
    hideProgressTooltip() {
        const tooltip = document.querySelector('.progress-tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }
    
    /**
     * Show detailed progress modal/page
     */
    showDetailedProgress() {
        // This would typically open a detailed progress page or modal
        console.log('Showing detailed progress view');
        
        // For now, just add a visual feedback
        const container = document.getElementById('progress-circle');
        container.classList.add('animating');
        
        setTimeout(() => {
            container.classList.remove('animating');
        }, 2000);
    }
    
    /**
     * Track lesson start
     */
    trackLessonStart(event) {
        const lessonId = event.target.dataset.lessonId;
        
        // Send tracking data
        this.sendTrackingData('lesson_started', {
            lesson_id: lessonId,
            timestamp: new Date().toISOString(),
            source: 'dashboard'
        });
        
        // Visual feedback
        event.target.classList.add('clicked');
        setTimeout(() => {
            event.target.classList.remove('clicked');
        }, 200);
    }
    
    /**
     * Track quick action usage
     */
    trackQuickAction(event) {
        const action = event.target.closest('.quick-action-btn').dataset.action;
        
        this.sendTrackingData('quick_action_used', {
            action: action,
            timestamp: new Date().toISOString()
        });
        
        // Visual feedback
        event.target.closest('.quick-action-btn').style.transform = 'scale(0.95)';
        setTimeout(() => {
            event.target.closest('.quick-action-btn').style.transform = '';
        }, 150);
    }
    
    /**
     * Handle activity item clicks
     */
    handleActivityClick(event) {
        const activityItem = event.target.closest('.activity-item');
        const activityType = activityItem.dataset.activityType;
        
        // Add visual feedback
        activityItem.classList.add('activity-clicked');
        setTimeout(() => {
            activityItem.classList.remove('activity-clicked');
        }, 200);
        
        // Track interaction
        this.sendTrackingData('activity_clicked', {
            activity_type: activityType,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Send tracking data to server
     */
    async sendTrackingData(eventType, data) {
        try {
            await fetch(pmpAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'track_user_event',
                    nonce: pmpAjax.nonce,
                    event_type: eventType,
                    event_data: JSON.stringify(data)
                })
            });
        } catch (error) {
            console.error('Failed to send tracking data:', error);
        }
    }
    
    /**
     * Show loading state
     */
    showLoadingState() {
        const progressContainer = document.getElementById('progress-circle');
        if (progressContainer) {
            progressContainer.classList.add('loading');
        }
    }
    
    /**
     * Hide loading state
     */
    hideLoadingState() {
        const progressContainer = document.getElementById('progress-circle');
        if (progressContainer) {
            progressContainer.classList.remove('loading');
        }
    }
    
    /**
     * Handle progress errors
     */
    handleProgressError(error) {
        console.error('Progress tracking error:', error);
        
        // Show user-friendly error message
        const progressCard = document.querySelector('.progress-circle-container').closest('.card');
        if (progressCard) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-warning mt-3';
            errorDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                Unable to load latest progress data. <a href="#" onclick="location.reload()">Refresh page</a> to try again.
            `;
            progressCard.appendChild(errorDiv);
        }
    }
    
    /**
     * Refresh progress data
     */
    async refreshProgressData() {
        await this.loadProgressData();
        
        // Show success feedback
        const progressContainer = document.getElementById('progress-circle');
        if (progressContainer) {
            progressContainer.classList.add('updated');
            setTimeout(() => {
                progressContainer.classList.remove('updated');
            }, 600);
        }
    }
    
    /**
     * Start periodic updates
     */
    startPeriodicUpdates() {
        // Update every 5 minutes when page is active
        this.updateInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.loadProgressData();
                this.refreshCurrentLessonHighlighting();
            }
        }, 300000); // 5 minutes
        
        // More frequent updates for current lesson (every 30 seconds)
        this.currentLessonInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.refreshCurrentLessonHighlighting();
            }
        }, 30000); // 30 seconds
    }
    
    /**
     * Stop periodic updates
     */
    stopPeriodicUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    /**
     * Handle window focus
     */
    onWindowFocus() {
        // Refresh data when user returns to tab
        this.loadProgressData();
    }
    
    /**
     * Handle window blur
     */
    onWindowBlur() {
        // Could pause certain animations or reduce update frequency
    }
    
    /**
     * Initialize animations
     */
    initializeAnimations() {
        // Animate elements on page load
        setTimeout(() => {
            this.animateProgressElements();
        }, 500);
    }
    
    /**
     * Animate progress elements
     */
    animateProgressElements() {
        // Animate progress bars
        const progressBars = document.querySelectorAll('.stat-progress-fill');
        progressBars.forEach((bar, index) => {
            setTimeout(() => {
                const width = bar.dataset.width || '0%';
                bar.style.width = width;
            }, index * 200);
        });
        
        // Animate activity items
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    /**
     * Add completion effects
     */
    addCompletionEffects() {
        // Add confetti or celebration animation
        const progressContainer = document.getElementById('progress-circle');
        if (progressContainer) {
            progressContainer.classList.add('completed');
            
            // Could add confetti library here
            this.showCompletionMessage();
        }
    }
    
    /**
     * Show completion message
     */
    showCompletionMessage() {
        // Show congratulations message
        const message = document.createElement('div');
        message.className = 'alert alert-success mt-3 completion-message';
        message.innerHTML = `
            <i class="fas fa-trophy me-2"></i>
            <strong>Congratulations!</strong> You've completed the PMP preparation course!
        `;
        
        const progressCard = document.querySelector('.progress-circle-container').closest('.card-body');
        progressCard.appendChild(message);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            message.remove();
        }, 10000);
    }
    
    /**
     * Create weekly progress bar
     */
    createWeeklyProgressBar() {
        const progressStats = document.querySelector('.progress-stats');
        const weeklyBar = document.createElement('div');
        weeklyBar.className = 'weekly-progress-bar';
        
        for (let i = 0; i < 13; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'week-indicator';
            indicator.title = `Week ${i + 1}`;
            weeklyBar.appendChild(indicator);
        }
        
        progressStats.appendChild(weeklyBar);
        return weeklyBar;
    }
    
    /**
     * Add progress bars to stats
     */
    addProgressBars() {
        const statItems = document.querySelectorAll('.stat-item');
        
        statItems.forEach((item, index) => {
            if (!item.querySelector('.stat-progress-bar')) {
                const progressBar = document.createElement('div');
                progressBar.className = 'stat-progress-bar';
                
                const progressFill = document.createElement('div');
                progressFill.className = `stat-progress-fill ${index === 0 ? 'bg-success' : 'bg-primary'}`;
                
                // Calculate width based on progress
                const percentage = index === 0 ? 
                    (this.progressData.overall?.percentage || 0) : 
                    100 - (this.progressData.overall?.percentage || 0);
                
                progressFill.dataset.width = `${percentage}%`;
                progressBar.appendChild(progressFill);
                item.appendChild(progressBar);
            }
        });
    }
    
    /**
     * Create activity element
     */
    createActivityElement(activity) {
        const activityDiv = document.createElement('div');
        activityDiv.className = 'activity-item d-flex align-items-start mb-3';
        activityDiv.dataset.activityType = activity.type || 'default';
        
        activityDiv.innerHTML = `
            <div class="activity-icon me-3">
                <div class="bg-${activity.color || 'primary'} rounded-circle d-flex align-items-center justify-content-center"
                     style="width: 32px; height: 32px;">
                    <i class="${activity.icon || 'fas fa-check'} text-white" style="font-size: 12px;"></i>
                </div>
            </div>
            <div class="activity-content flex-grow-1">
                <p class="activity-title mb-1">${activity.title}</p>
                <small class="text-muted">${activity.formatted_time || activity.timestamp}</small>
            </div>
            ${activity.url && activity.url !== '#' ? `
                <div class="activity-action">
                    <a href="${activity.url}" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            ` : ''}
        `;
        
        return activityDiv;
    }
    
    /**
     * Create recommendation element
     */
    createRecommendationElement(recommendation) {
        const recDiv = document.createElement('div');
        recDiv.className = 'recommendation-reason';
        
        recDiv.innerHTML = `
            <small class="text-primary">
                <i class="fas fa-lightbulb me-1"></i>
                ${recommendation.description || recommendation.title}
            </small>
        `;
        
        return recDiv;
    }
    
    /**
     * Ensure view all button exists
     */
    ensureViewAllButton() {
        const timeline = document.querySelector('.activity-timeline');
        const card = timeline.closest('.card-body');
        
        if (!card.querySelector('.btn-outline-primary')) {
            const buttonDiv = document.createElement('div');
            buttonDiv.className = 'text-center mt-4';
            buttonDiv.innerHTML = `
                <a href="#" class="btn btn-outline-primary btn-sm">
                    View All Activity
                </a>
            `;
            card.appendChild(buttonDiv);
        }
    }
    
    /**
     * Handle continue current lesson button click
     */
    handleContinueCurrentLesson(event) {
        const lessonId = event.target.dataset.lessonId;
        
        // Track lesson start
        this.sendTrackingData('current_lesson_continued', {
            lesson_id: lessonId,
            timestamp: new Date().toISOString(),
            source: 'current_lesson_card'
        });
        
        // Visual feedback
        event.target.classList.add('clicked');
        setTimeout(() => {
            event.target.classList.remove('clicked');
        }, 200);
        
        // Update last accessed time
        this.updateLessonAccess(lessonId);
    }
    
    /**
     * Handle mark complete button click
     */
    async handleMarkComplete(event) {
        event.preventDefault();
        
        const lessonId = event.target.dataset.lessonId;
        const button = event.target;
        
        // Show loading state
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Marking Complete...';
        button.disabled = true;
        
        try {
            const response = await fetch(pmpAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'mark_lesson_complete',
                    nonce: pmpAjax.nonce,
                    lesson_id: lessonId
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success feedback
                button.innerHTML = '<i class="fas fa-check me-1"></i>Completed!';
                button.classList.remove('btn-outline-secondary');
                button.classList.add('btn-success');
                
                // Update progress display
                this.updateProgressDisplay();
                
                // Show completion notification
                this.showCompletionNotification(lessonId);
                
                // Refresh current lesson display after delay
                setTimeout(() => {
                    this.refreshCurrentLessonDisplay();
                }, 2000);
                
            } else {
                throw new Error(result.data || 'Failed to mark lesson complete');
            }
        } catch (error) {
            console.error('Error marking lesson complete:', error);
            
            // Show error state
            button.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>Error';
            button.classList.add('btn-danger');
            
            // Reset after delay
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('btn-danger');
                button.disabled = false;
            }, 3000);
        }
    }
    
    /**
     * Highlight current lesson card
     */
    highlightCurrentLesson() {
        const currentLessonCard = document.querySelector('.current-lesson-card');
        if (currentLessonCard) {
            currentLessonCard.style.transform = 'translateY(-4px)';
            currentLessonCard.style.boxShadow = '0 12px 24px rgba(91, 40, 179, 0.25)';
        }
    }
    
    /**
     * Remove highlight from current lesson card
     */
    unhighlightCurrentLesson() {
        const currentLessonCard = document.querySelector('.current-lesson-card');
        if (currentLessonCard) {
            currentLessonCard.style.transform = '';
            currentLessonCard.style.boxShadow = '';
        }
    }
    
    /**
     * Update lesson access time
     */
    async updateLessonAccess(lessonId) {
        try {
            await fetch(pmpAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'set_current_lesson',
                    nonce: pmpAjax.nonce,
                    lesson_id: lessonId
                })
            });
        } catch (error) {
            console.error('Failed to update lesson access:', error);
        }
    }
    
    /**
     * Show completion notification
     */
    showCompletionNotification(lessonId) {
        const notification = document.createElement('div');
        notification.className = 'lesson-completion-notification';
        notification.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-trophy me-2"></i>
                <strong>Lesson Completed!</strong> Great job on finishing this lesson.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    /**
     * Refresh current lesson display
     */
    async refreshCurrentLessonDisplay() {
        try {
            const response = await fetch(pmpAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_current_lesson',
                    nonce: pmpAjax.nonce
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update current lesson display
                this.updateCurrentLessonCard(result.data);
            }
        } catch (error) {
            console.error('Failed to refresh current lesson display:', error);
        }
    }
    
    /**
     * Update current lesson card with new data
     */
    updateCurrentLessonCard(lessonData) {
        const currentLessonCard = document.querySelector('.current-lesson-card');
        if (currentLessonCard && lessonData) {
            // Update lesson title
            const titleElement = currentLessonCard.querySelector('.lesson-title');
            if (titleElement) {
                titleElement.textContent = lessonData.title;
            }
            
            // Update progress bar
            const progressBars = currentLessonCard.querySelectorAll('.progress-bar');
            progressBars.forEach(bar => {
                bar.style.width = lessonData.progress_percentage + '%';
                bar.setAttribute('aria-valuenow', lessonData.progress_percentage);
            });
            
            // Update badges
            const badge = currentLessonCard.querySelector('.current-lesson-badges .badge');
            if (badge) {
                if (lessonData.is_completed) {
                    badge.className = 'badge bg-success';
                    badge.innerHTML = '<i class="fas fa-check me-1"></i>Completed';
                } else {
                    badge.className = 'badge bg-warning';
                    badge.innerHTML = '<i class="fas fa-clock me-1"></i>In Progress';
                }
            }
            
            // Re-bind events for updated elements
            this.bindCurrentLessonEvents();
        }
    }
    
    /**
     * Refresh current lesson highlighting
     */
    async refreshCurrentLessonHighlighting() {
        try {
            const response = await fetch(pmpAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'pmp_get_current_lesson',
                    nonce: pmpAjax.nonce
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.updateCurrentLessonCard(result.data);
            }
        } catch (error) {
            console.error('Failed to refresh current lesson highlighting:', error);
        }
    }
    
    /**
     * Format time ago string
     */
    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) {
            return 'just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return minutes + ' minute' + (minutes > 1 ? 's' : '') + ' ago';
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return days + ' day' + (days > 1 ? 's' : '') + ' ago';
        }
    }
    
    /**
     * Cleanup when page unloads
     */
    cleanup() {
        this.stopPeriodicUpdates();
        
        // Stop current lesson updates
        if (this.currentLessonInterval) {
            clearInterval(this.currentLessonInterval);
            this.currentLessonInterval = null;
        }
        
        // Remove event listeners
        window.removeEventListener('focus', this.onWindowFocus);
        window.removeEventListener('blur', this.onWindowBlur);
    }
}

// Initialize progress tracker when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on dashboard page
    if (document.body.classList.contains('page-template-page-dashboard')) {
        // Check if AJAX variables are available
        if (typeof pmpAjax === 'undefined') {
            console.warn('PMP AJAX variables not loaded. Progress tracking may not work properly.');
            // Create fallback object
            window.pmpAjax = {
                ajaxurl: '/wp-admin/admin-ajax.php',
                nonce: '',
                userId: 'current'
            };
        }
        
        window.pmpProgressTracker = new PMPProgressTracker();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.pmpProgressTracker) {
        window.pmpProgressTracker.cleanup();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PMPProgressTracker;
}