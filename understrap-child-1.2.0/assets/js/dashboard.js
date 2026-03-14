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
            // Navigate to study guide or open modal
            window.location.href = '/study-guide/';
        }

        openPracticeQuiz() {
            // Navigate to practice quiz
            window.location.href = '/practice-quiz/';
        }

        openResources() {
            // Navigate to resources page
            window.location.href = '/resources/';
        }

        openSchedule() {
            // Navigate to schedule page
            window.location.href = '/schedule/';
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