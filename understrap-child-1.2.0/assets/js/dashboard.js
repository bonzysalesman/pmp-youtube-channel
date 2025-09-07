/**
 * PMP Dashboard JavaScript
 * Handles dashboard interactions, progress animations, and AJAX updates
 */

(function($) {
    'use strict';

    class PMPDashboard {
        constructor() {
            this.init();
        }

        init() {
            this.bindEvents();
            this.animateProgressCircle();
            this.loadDashboardData();
            this.setupAutoRefresh();
        }

        bindEvents() {
            // Continue learning button click
            $(document).on('click', '.continue-learning-btn', this.handleContinueLearning.bind(this));
            
            // Quick action buttons
            $(document).on('click', '.quick-action-btn', this.handleQuickAction.bind(this));
            
            // Activity timeline interactions
            $(document).on('click', '.activity-item', this.handleActivityClick.bind(this));
            
            // Progress circle hover effects
            $(document).on('mouseenter', '.progress-circle-container', this.handleProgressHover.bind(this));
            $(document).on('mouseleave', '.progress-circle-container', this.handleProgressLeave.bind(this));
            
            // Quick action button hover effects
            $(document).on('mouseenter', '.quick-action-btn', this.handleQuickActionHover.bind(this));
            $(document).on('mouseleave', '.quick-action-btn', this.handleQuickActionLeave.bind(this));
        }

        animateProgressCircle() {
            const progressCircle = document.querySelector('.progress-bar-circle');
            const progressText = document.querySelector('.progress-text');
            if (!progressCircle || !progressText) return;

            // Get target percentage from text content
            const targetPercentage = parseFloat(progressText.textContent) || 0;
            const circumference = 314.16; // 2 * π * 50 (radius)
            const targetOffset = circumference - (circumference * targetPercentage / 100);

            // Start from full circle (no progress)
            progressCircle.style.strokeDashoffset = circumference;
            progressText.textContent = '0%';
            
            // Use CSS transition for smooth animation
            progressCircle.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Animate progress circle and counter
            setTimeout(() => {
                progressCircle.style.strokeDashoffset = targetOffset;
                this.animateProgressCounter(0, targetPercentage, 2000);
            }, 100);

            // Add pulsing effect during animation
            const container = progressCircle.closest('.progress-circle-container');
            if (container) {
                container.classList.add('animating');
                setTimeout(() => {
                    container.classList.remove('animating');
                }, 2000);
            }
        }

        animateProgressCounter(start, end, duration) {
            const progressText = document.querySelector('.progress-text');
            if (!progressText) return;

            const startTime = performance.now();
            const range = end - start;

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Use easing function for smooth animation
                const easedProgress = this.easeOutCubic(progress);
                const currentValue = start + (range * easedProgress);
                
                progressText.textContent = `${currentValue.toFixed(1)}%`;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
        }

        easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        async loadDashboardData() {
            try {
                const response = await this.makeAjaxRequest('pmp_get_dashboard_data', {});
                
                if (response.success) {
                    this.updateDashboardContent(response.data);
                } else {
                    console.warn('Failed to load dashboard data:', response.data);
                    this.showCachedDataWarning();
                }
            } catch (error) {
                console.error('Dashboard data loading error:', error);
                this.showCachedDataWarning();
            }
        }

        updateDashboardContent(data) {
            // Update progress statistics
            if (data.progress) {
                this.updateProgressStats(data.progress);
            }

            // Update next lesson
            if (data.next_lesson) {
                this.updateNextLesson(data.next_lesson);
            }

            // Update recent activity
            if (data.recent_activity) {
                this.updateRecentActivity(data.recent_activity);
            }
        }

        updateProgressStats(progress) {
            // Update progress percentage with animation
            const progressText = document.querySelector('.progress-text');
            if (progressText) {
                const currentPercentage = parseFloat(progressText.textContent) || 0;
                this.animateProgressCounter(currentPercentage, progress.percentage, 1500);
            }

            // Update completed count with animation
            const completedStat = document.querySelector('.stat-number.text-success');
            if (completedStat) {
                const currentCompleted = parseInt(completedStat.textContent) || 0;
                this.animateStatCounter(completedStat, currentCompleted, progress.completed, 1000);
            }

            // Update remaining count with animation
            const remainingStat = document.querySelector('.stat-number.text-primary');
            if (remainingStat) {
                const remaining = progress.total - progress.completed;
                const currentRemaining = parseInt(remainingStat.textContent) || progress.total;
                this.animateStatCounter(remainingStat, currentRemaining, remaining, 1000);
            }

            // Update progress circle with smooth animation
            const progressCircle = document.querySelector('.progress-bar-circle');
            if (progressCircle) {
                const circumference = 314.16;
                const offset = circumference - (circumference * progress.percentage / 100);
                
                progressCircle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                progressCircle.style.strokeDashoffset = offset;
            }

            // Update week badge if available
            if (progress.current_week) {
                const weekBadge = document.querySelector('.dashboard-stats-quick .badge');
                if (weekBadge) {
                    weekBadge.textContent = `Week ${progress.current_week} of 13`;
                }
            }
        }

        animateStatCounter(element, start, end, duration) {
            const startTime = performance.now();
            const range = end - start;

            const updateStat = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const easedProgress = this.easeOutCubic(progress);
                const currentValue = Math.round(start + (range * easedProgress));
                
                element.textContent = currentValue;

                if (progress < 1) {
                    requestAnimationFrame(updateStat);
                }
            };

            requestAnimationFrame(updateStat);
        }

        updateNextLesson(lesson) {
            const lessonTitle = document.querySelector('.lesson-title');
            const lessonDescription = document.querySelector('.lesson-description');
            const lessonThumbnail = document.querySelector('.lesson-thumbnail img');
            const continueBtn = document.querySelector('.btn-primary');

            if (lessonTitle) lessonTitle.textContent = lesson.title;
            if (lessonDescription) lessonDescription.textContent = lesson.description;
            if (lessonThumbnail) {
                lessonThumbnail.src = lesson.thumbnail;
                lessonThumbnail.alt = lesson.title;
            }
            if (continueBtn) continueBtn.href = lesson.url;
        }

        updateRecentActivity(activities) {
            const activityContainer = document.querySelector('.activity-timeline');
            if (!activityContainer) return;

            let activityHTML = '';
            
            if (activities.length > 0) {
                activities.forEach(activity => {
                    activityHTML += `
                        <div class="activity-item d-flex align-items-start mb-3">
                            <div class="activity-icon me-3">
                                <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                                     style="width: 32px; height: 32px;">
                                    <i class="fas fa-check text-white" style="font-size: 12px;"></i>
                                </div>
                            </div>
                            <div class="activity-content">
                                <p class="activity-title mb-1">${activity.title}</p>
                                <small class="text-muted">${activity.timestamp}</small>
                            </div>
                        </div>
                    `;
                });
            } else {
                activityHTML = '<p class="text-muted">No recent activity to display.</p>';
            }

            activityContainer.innerHTML = activityHTML;
        }

        handleContinueLearning(event) {
            event.preventDefault();
            
            const lessonUrl = event.currentTarget.href;
            
            // Track the continue learning action
            this.trackUserAction('continue_learning', {
                lesson_url: lessonUrl,
                timestamp: new Date().toISOString()
            });

            // Navigate to lesson
            window.location.href = lessonUrl;
        }

        handleQuickAction(event) {
            event.preventDefault();
            
            const actionType = event.currentTarget.dataset.action || 'unknown';
            
            // Track quick action
            this.trackUserAction('quick_action', {
                action_type: actionType,
                timestamp: new Date().toISOString()
            });

            // Handle different action types
            switch (actionType) {
                case 'study_guide':
                    this.openStudyGuide();
                    break;
                case 'practice_quiz':
                    this.openPracticeQuiz();
                    break;
                case 'resources':
                    this.openResources();
                    break;
                case 'schedule':
                    this.openSchedule();
                    break;
                default:
                    console.warn('Unknown quick action:', actionType);
            }
        }

        handleActivityClick(event) {
            const activityItem = event.currentTarget;
            const activityTitle = activityItem.querySelector('.activity-title').textContent;
            
            // Add visual feedback
            activityItem.classList.add('activity-clicked');
            setTimeout(() => {
                activityItem.classList.remove('activity-clicked');
            }, 200);

            // Track activity interaction
            this.trackUserAction('activity_click', {
                activity_title: activityTitle,
                timestamp: new Date().toISOString()
            });
        }

        handleProgressHover(event) {
            const progressContainer = event.currentTarget;
            progressContainer.classList.add('progress-hover');
            
            // Show additional progress details
            this.showProgressTooltip(progressContainer);
        }

        handleProgressLeave(event) {
            const progressContainer = event.currentTarget;
            progressContainer.classList.remove('progress-hover');
            
            // Hide progress tooltip
            this.hideProgressTooltip();
        }

        showProgressTooltip(container) {
            // Create tooltip with detailed progress info
            const tooltip = document.createElement('div');
            tooltip.className = 'progress-tooltip';
            tooltip.innerHTML = `
                <div class="tooltip-content">
                    <h6>Progress Details</h6>
                    <p>Keep up the great work!</p>
                </div>
            `;
            
            container.appendChild(tooltip);
            
            // Position tooltip
            setTimeout(() => {
                tooltip.classList.add('show');
            }, 10);
        }

        hideProgressTooltip() {
            const tooltip = document.querySelector('.progress-tooltip');
            if (tooltip) {
                tooltip.classList.remove('show');
                setTimeout(() => {
                    tooltip.remove();
                }, 200);
            }
        }

        openStudyGuide() {
            // Add loading state
            this.showQuickActionLoading('study_guide');
            
            // Navigate to study guide
            setTimeout(() => {
                window.location.href = '/study-guide/';
            }, 300);
        }

        openPracticeQuiz() {
            // Add loading state
            this.showQuickActionLoading('practice_quiz');
            
            // Navigate to practice quiz
            setTimeout(() => {
                window.location.href = '/practice-quiz/';
            }, 300);
        }

        openResources() {
            // Add loading state
            this.showQuickActionLoading('resources');
            
            // Navigate to resources page
            setTimeout(() => {
                window.location.href = '/resources/';
            }, 300);
        }

        openSchedule() {
            // Add loading state
            this.showQuickActionLoading('schedule');
            
            // Navigate to schedule page
            setTimeout(() => {
                window.location.href = '/schedule/';
            }, 300);
        }

        showQuickActionLoading(actionType) {
            const button = document.querySelector(`[data-action="${actionType}"]`);
            if (button) {
                button.classList.add('loading');
                const icon = button.querySelector('i');
                const originalClass = icon.className;
                icon.className = 'fas fa-spinner fa-spin';
                
                // Store original icon class for restoration if needed
                button.dataset.originalIcon = originalClass;
            }
        }

        hideQuickActionLoading(actionType) {
            const button = document.querySelector(`[data-action="${actionType}"]`);
            if (button) {
                button.classList.remove('loading');
                const icon = button.querySelector('i');
                if (button.dataset.originalIcon) {
                    icon.className = button.dataset.originalIcon;
                    delete button.dataset.originalIcon;
                }
            }
        }

        handleQuickActionHover(event) {
            const button = event.currentTarget;
            const actionType = button.dataset.action;
            
            // Add hover effect
            button.classList.add('quick-action-hover');
            
            // Show tooltip with action description
            this.showQuickActionTooltip(button, actionType);
        }

        handleQuickActionLeave(event) {
            const button = event.currentTarget;
            
            // Remove hover effect
            button.classList.remove('quick-action-hover');
            
            // Hide tooltip
            this.hideQuickActionTooltip();
        }

        showQuickActionTooltip(button, actionType) {
            const tooltips = {
                'study_guide': 'Access comprehensive PMP study materials',
                'practice_quiz': 'Test your knowledge with practice questions',
                'resources': 'Download study guides and templates',
                'schedule': 'View your personalized study schedule'
            };

            const tooltip = document.createElement('div');
            tooltip.className = 'quick-action-tooltip';
            tooltip.textContent = tooltips[actionType] || 'Quick action';
            
            button.appendChild(tooltip);
            
            // Position tooltip
            setTimeout(() => {
                tooltip.classList.add('show');
            }, 10);
        }

        hideQuickActionTooltip() {
            const tooltip = document.querySelector('.quick-action-tooltip');
            if (tooltip) {
                tooltip.classList.remove('show');
                setTimeout(() => {
                    tooltip.remove();
                }, 200);
            }
        }

        async trackUserAction(action, data) {
            try {
                await this.makeAjaxRequest('pmp_track_dashboard_action', {
                    action: action,
                    data: JSON.stringify(data)
                });
            } catch (error) {
                console.warn('Failed to track user action:', error);
            }
        }

        setupAutoRefresh() {
            // Refresh dashboard data every 5 minutes
            setInterval(() => {
                this.loadDashboardData();
            }, 5 * 60 * 1000);
        }

        showCachedDataWarning() {
            const warningHTML = `
                <div class="alert alert-info cached-data-warning" role="alert">
                    <i class="fas fa-info-circle me-2"></i>
                    Some data may be outdated. <a href="#" onclick="location.reload()">Refresh</a> to try again.
                </div>
            `;
            
            const container = document.querySelector('.dashboard-content .container');
            if (container) {
                container.insertAdjacentHTML('afterbegin', warningHTML);
            }
        }

        async makeAjaxRequest(action, data) {
            const formData = new FormData();
            formData.append('action', action);
            formData.append('nonce', pmpData.nonce);
            formData.append('user_id', pmpData.userId);
            
            // Add additional data
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });

            const response = await fetch(pmpData.ajaxUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        }

        // Public method to update progress from external sources
        updateProgress(progressData) {
            this.updateProgressStats(progressData);
            this.animateProgressCircle();
            this.updateWeeklyProgress(progressData.current_week);
        }

        updateWeeklyProgress(currentWeek) {
            const weekIndicators = document.querySelectorAll('.week-indicator');
            
            weekIndicators.forEach((indicator, index) => {
                const week = index + 1;
                
                setTimeout(() => {
                    if (week <= currentWeek) {
                        indicator.classList.add('completed');
                    } else {
                        indicator.classList.remove('completed');
                    }
                }, index * 100); // Stagger the animation
            });
        }

        animateStatBars() {
            const progressBars = document.querySelectorAll('.stat-progress-fill');
            
            progressBars.forEach(bar => {
                const targetWidth = bar.style.width;
                bar.style.width = '0%';
                
                setTimeout(() => {
                    bar.style.width = targetWidth;
                }, 500);
            });
        }

        showProgressLoading() {
            const container = document.querySelector('.progress-circle-container');
            if (container) {
                container.classList.add('loading');
            }
        }

        hideProgressLoading() {
            const container = document.querySelector('.progress-circle-container');
            if (container) {
                container.classList.remove('loading');
                container.classList.add('updated');
                
                setTimeout(() => {
                    container.classList.remove('updated');
                }, 600);
            }
        }

        // Public method to add new activity
        addActivity(activity) {
            const activityContainer = document.querySelector('.activity-timeline');
            if (!activityContainer) return;

            const activityHTML = `
                <div class="activity-item d-flex align-items-start mb-3 new-activity">
                    <div class="activity-icon me-3">
                        <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                             style="width: 32px; height: 32px;">
                            <i class="fas fa-check text-white" style="font-size: 12px;"></i>
                        </div>
                    </div>
                    <div class="activity-content">
                        <p class="activity-title mb-1">${activity.title}</p>
                        <small class="text-muted">${activity.timestamp}</small>
                    </div>
                </div>
            `;

            activityContainer.insertAdjacentHTML('afterbegin', activityHTML);

            // Highlight new activity
            const newActivity = activityContainer.querySelector('.new-activity');
            setTimeout(() => {
                newActivity.classList.remove('new-activity');
            }, 3000);
        }
    }

    // Initialize dashboard when DOM is ready
    $(document).ready(function() {
        if (document.body.classList.contains('page-template-page-dashboard')) {
            window.pmpDashboard = new PMPDashboard();
        }
    });

    // Expose dashboard instance globally for external access
    window.PMPDashboard = PMPDashboard;

})(jQuery);      
  /**
         * Handle upcoming lesson interactions
         */
        handleUpcomingLessonClick(event) {
            event.preventDefault();
            const button = $(event.currentTarget);
            const lessonId = button.data('lesson-id');
            const action = button.hasClass('preview-lesson-btn') ? 'preview' : 'start';
            
            if (action === 'preview') {
                this.showLessonPreview(lessonId);
            } else {
                this.startLesson(lessonId);
            }
        }

        /**
         * Show lesson preview modal
         */
        showLessonPreview(lessonId) {
            // Create and show preview modal
            const modal = $(`
                <div class="modal fade" id="lessonPreviewModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-eye me-2"></i>
                                    Lesson Preview
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="text-center py-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="mt-2">Loading lesson preview...</p>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    Close Preview
                                </button>
                                <button type="button" class="btn btn-primary" onclick="window.location.href='#'">
                                    <i class="fas fa-play me-1"></i>
                                    Start Full Lesson
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            
            $('body').append(modal);
            modal.modal('show');
            
            // Load preview content via AJAX
            this.loadLessonPreview(lessonId, modal);
            
            // Clean up modal when closed
            modal.on('hidden.bs.modal', function() {
                modal.remove();
            });
        }

        /**
         * Load lesson preview content
         */
        loadLessonPreview(lessonId, modal) {
            $.ajax({
                url: pmp_dashboard_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'get_lesson_preview',
                    lesson_id: lessonId,
                    nonce: pmp_dashboard_ajax.nonce
                },
                success: (response) => {
                    if (response.success) {
                        modal.find('.modal-body').html(response.data.preview_html);
                        modal.find('.modal-footer .btn-primary').attr('onclick', `window.location.href='${response.data.lesson_url}'`);
                    } else {
                        modal.find('.modal-body').html(`
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Preview not available for this lesson.
                            </div>
                        `);
                    }
                },
                error: () => {
                    modal.find('.modal-body').html(`
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            Error loading lesson preview. Please try again.
                        </div>
                    `);
                }
            });
        }

        /**
         * Start a lesson and track the event
         */
        startLesson(lessonId) {
            // Track lesson start event
            this.trackLessonEvent(lessonId, 'started');
            
            // Update current lesson
            $.ajax({
                url: pmp_dashboard_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'set_current_lesson',
                    lesson_id: lessonId,
                    nonce: pmp_dashboard_ajax.nonce
                },
                success: (response) => {
                    if (response.success) {
                        // Redirect to lesson or update UI
                        console.log('Current lesson updated:', lessonId);
                    }
                }
            });
        }

        /**
         * Track lesson events for analytics
         */
        trackLessonEvent(lessonId, eventType) {
            $.ajax({
                url: pmp_dashboard_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'track_lesson_event',
                    lesson_id: lessonId,
                    event_type: eventType,
                    nonce: pmp_dashboard_ajax.nonce
                }
            });
        }

        /**
         * Update upcoming lessons progress indicators
         */
        updateUpcomingLessonsProgress() {
            $('.upcoming-lesson-item').each((index, item) => {
                const $item = $(item);
                const lessonId = $item.data('lesson-id');
                
                if (lessonId) {
                    this.updateLessonProgressBar(lessonId);
                }
            });
        }

        /**
         * Update individual lesson progress bar
         */
        updateLessonProgressBar(lessonId) {
            const progressBar = $(`.lesson-progress-preview .progress-bar[data-lesson-id="${lessonId}"]`);
            
            if (progressBar.length) {
                $.ajax({
                    url: pmp_dashboard_ajax.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'get_lesson_progress',
                        lesson_id: lessonId,
                        nonce: pmp_dashboard_ajax.nonce
                    },
                    success: (response) => {
                        if (response.success && response.data.progress_percentage !== undefined) {
                            progressBar.css('width', response.data.progress_percentage + '%');
                        }
                    }
                });
            }
        }

        /**
         * Animate upcoming lessons on load
         */
        animateUpcomingLessons() {
            $('.upcoming-lesson-item').each((index, item) => {
                setTimeout(() => {
                    $(item).addClass('animate-in');
                }, index * 100);
            });
        }

        /**
         * Handle lesson item hover effects
         */
        handleLessonHover(event) {
            const $item = $(event.currentTarget);
            const $thumbnail = $item.find('.lesson-thumbnail-small');
            
            // Add subtle scale effect
            $thumbnail.css('transform', 'scale(1.05)');
        }

        /**
         * Handle lesson item hover leave
         */
        handleLessonHoverLeave(event) {
            const $item = $(event.currentTarget);
            const $thumbnail = $item.find('.lesson-thumbnail-small');
            
            // Remove scale effect
            $thumbnail.css('transform', 'scale(1)');
        }
    }

    // Enhanced event binding for upcoming lessons
    $(document).ready(function() {
        const dashboard = new PMPDashboard();
        
        // Bind upcoming lesson events
        $(document).on('click', '.upcoming-lesson-item .btn', dashboard.handleUpcomingLessonClick.bind(dashboard));
        $(document).on('click', '.preview-lesson-btn', dashboard.handleUpcomingLessonClick.bind(dashboard));
        
        // Hover effects for lesson items
        $(document).on('mouseenter', '.upcoming-lesson-item', dashboard.handleLessonHover.bind(dashboard));
        $(document).on('mouseleave', '.upcoming-lesson-item', dashboard.handleLessonHoverLeave.bind(dashboard));
        
        // Animate upcoming lessons on load
        setTimeout(() => {
            dashboard.animateUpcomingLessons();
        }, 500);
        
        // Update progress indicators periodically
        setInterval(() => {
            dashboard.updateUpcomingLessonsProgress();
        }, 30000); // Every 30 seconds
    });

})(jQuery);