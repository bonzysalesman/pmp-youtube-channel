/**
 * PMP Course Progression JavaScript
 * 
 * Handles client-side functionality for course progression navigation
 * including lesson completion tracking and navigation interactions
 */

(function($) {
    'use strict';
    
    /**
     * Course Progression Handler
     */
    const CourseProgression = {
        
        /**
         * Initialize the course progression functionality
         */
        init: function() {
            this.bindEvents();
            this.initKeyboardNavigation();
            this.updateProgressDisplay();
        },
        
        /**
         * Bind event handlers
         */
        bindEvents: function() {
            // Mark lesson complete button
            $(document).on('click', '#mark-lesson-complete', this.markLessonComplete.bind(this));
            
            // Navigation keyboard shortcuts
            $(document).on('keydown', this.handleKeyboardNavigation.bind(this));
            
            // Progress tracking on page load
            $(window).on('load', this.trackLessonView.bind(this));
            
            // Auto-save progress on page unload
            $(window).on('beforeunload', this.saveCurrentProgress.bind(this));
            
            // Navigation link tracking
            $('.pmp-lesson-navigation a').on('click', this.trackNavigationClick.bind(this));
        },
        
        /**
         * Initialize keyboard navigation
         */
        initKeyboardNavigation: function() {
            // Add keyboard navigation hints
            const $navigation = $('.pmp-lesson-navigation');
            if ($navigation.length) {
                $navigation.attr('tabindex', '0');
                
                // Add keyboard hints tooltip
                $navigation.attr('title', 'Use arrow keys to navigate between lessons');
            }
        },
        
        /**
         * Handle keyboard navigation
         * 
         * @param {Event} e Keyboard event
         */
        handleKeyboardNavigation: function(e) {
            // Only handle if not in input fields
            if ($(e.target).is('input, textarea, select')) {
                return;
            }
            
            const $navigation = $('.pmp-lesson-navigation');
            if (!$navigation.length) {
                return;
            }
            
            switch(e.keyCode) {
                case 37: // Left arrow - Previous lesson
                    e.preventDefault();
                    const $prevLink = $navigation.find('.nav-previous a');
                    if ($prevLink.length && !$prevLink.hasClass('disabled')) {
                        window.location.href = $prevLink.attr('href');
                    }
                    break;
                    
                case 39: // Right arrow - Next lesson
                    e.preventDefault();
                    const $nextLink = $navigation.find('.nav-next a');
                    if ($nextLink.length && !$nextLink.hasClass('disabled')) {
                        window.location.href = $nextLink.attr('href');
                    }
                    break;
                    
                case 32: // Spacebar - Mark complete
                    if (e.target === document.body || $(e.target).closest('.pmp-lesson-navigation').length) {
                        e.preventDefault();
                        $('#mark-lesson-complete').trigger('click');
                    }
                    break;
            }
        },
        
        /**
         * Mark lesson as complete
         * 
         * @param {Event} e Click event
         */
        markLessonComplete: function(e) {
            e.preventDefault();
            
            const $button = $(e.currentTarget);
            const lessonId = $button.data('lesson-id');
            
            if (!lessonId) {
                this.showMessage('Error: Lesson ID not found', 'error');
                return;
            }
            
            // Confirm action
            if (!confirm(pmpProgressionData.strings.confirmComplete)) {
                return;
            }
            
            // Disable button and show loading
            $button.prop('disabled', true);
            const originalText = $button.html();
            $button.html('<i class="fas fa-spinner fa-spin me-1"></i>Marking Complete...');
            
            // Send AJAX request
            $.ajax({
                url: pmpProgressionData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pmp_mark_lesson_complete',
                    nonce: pmpProgressionData.nonce,
                    lesson_id: lessonId
                },
                success: (response) => {
                    if (response.success) {
                        this.showMessage(response.data.message, 'success');
                        this.updateLessonCompleteStatus($button, true);
                        this.updateProgressDisplay(response.data.progress);
                        
                        // Auto-navigate to next lesson after delay
                        if (response.data.next_lesson) {
                            setTimeout(() => {
                                if (confirm('Great! Ready for the next lesson?')) {
                                    window.location.href = response.data.next_lesson.url;
                                }
                            }, 2000);
                        }
                    } else {
                        this.showMessage(response.data || pmpProgressionData.strings.error, 'error');
                        $button.prop('disabled', false).html(originalText);
                    }
                },
                error: () => {
                    this.showMessage(pmpProgressionData.strings.error, 'error');
                    $button.prop('disabled', false).html(originalText);
                }
            });
        },
        
        /**
         * Update lesson complete status in UI
         * 
         * @param {jQuery} $button The complete button
         * @param {boolean} completed Whether lesson is completed
         */
        updateLessonCompleteStatus: function($button, completed) {
            if (completed) {
                $button
                    .removeClass('btn-outline-success')
                    .addClass('btn-success')
                    .html('<i class="fas fa-check me-1"></i>Completed')
                    .prop('disabled', true);
                
                // Add completed indicator to navigation
                const $navigation = $('.pmp-lesson-navigation');
                $navigation.addClass('lesson-completed');
                
                // Update any progress indicators on the page
                $('.lesson-status').addClass('completed');
            }
        },
        
        /**
         * Update progress display
         * 
         * @param {number} progressPercentage New progress percentage
         */
        updateProgressDisplay: function(progressPercentage) {
            if (typeof progressPercentage !== 'undefined') {
                // Update progress bars
                $('.progress-bar').each(function() {
                    const $bar = $(this);
                    $bar.css('width', progressPercentage + '%')
                        .attr('aria-valuenow', progressPercentage);
                });
                
                // Update percentage displays
                $('.progress-percentage').text(Math.round(progressPercentage * 10) / 10 + '%');
            }
            
            // Update any course progress widgets
            this.refreshProgressWidgets();
        },
        
        /**
         * Refresh progress widgets on the page
         */
        refreshProgressWidgets: function() {
            $('.pmp-course-progress').each(function() {
                const $widget = $(this);
                
                // Reload progress data via AJAX if needed
                $.ajax({
                    url: pmpProgressionData.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'pmp_get_lesson_progress',
                        nonce: pmpProgressionData.nonce
                    },
                    success: (response) => {
                        if (response.success && response.data.html) {
                            $widget.html(response.data.html);
                        }
                    }
                });
            });
        },
        
        /**
         * Track lesson view for analytics
         */
        trackLessonView: function() {
            const $navigation = $('.pmp-lesson-navigation');
            if (!$navigation.length) {
                return;
            }
            
            const lessonId = $navigation.data('lesson-id');
            if (!lessonId) {
                return;
            }
            
            // Track lesson view
            $.ajax({
                url: pmpProgressionData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pmp_track_lesson_view',
                    nonce: pmpProgressionData.nonce,
                    lesson_id: lessonId,
                    timestamp: Date.now()
                }
            });
        },
        
        /**
         * Track navigation clicks for analytics
         * 
         * @param {Event} e Click event
         */
        trackNavigationClick: function(e) {
            const $link = $(e.currentTarget);
            const direction = $link.closest('.nav-previous').length ? 'previous' : 'next';
            
            // Track navigation usage
            $.ajax({
                url: pmpProgressionData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pmp_track_navigation_click',
                    nonce: pmpProgressionData.nonce,
                    direction: direction,
                    from_lesson: $('.pmp-lesson-navigation').data('lesson-id'),
                    to_url: $link.attr('href')
                }
            });
        },
        
        /**
         * Save current progress before page unload
         */
        saveCurrentProgress: function() {
            const $navigation = $('.pmp-lesson-navigation');
            if (!$navigation.length) {
                return;
            }
            
            const lessonId = $navigation.data('lesson-id');
            if (!lessonId) {
                return;
            }
            
            // Save current lesson as last viewed
            navigator.sendBeacon(pmpProgressionData.ajaxUrl, new URLSearchParams({
                action: 'pmp_save_lesson_progress',
                nonce: pmpProgressionData.nonce,
                lesson_id: lessonId,
                timestamp: Date.now()
            }));
        },
        
        /**
         * Show message to user
         * 
         * @param {string} message Message text
         * @param {string} type Message type (success, error, info)
         */
        showMessage: function(message, type = 'info') {
            // Remove existing messages
            $('.pmp-message').remove();
            
            const alertClass = type === 'error' ? 'alert-danger' : 
                              type === 'success' ? 'alert-success' : 'alert-info';
            
            const $message = $(`
                <div class="alert ${alertClass} alert-dismissible fade show pmp-message" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `);
            
            // Insert message at top of navigation or body
            const $target = $('.pmp-lesson-navigation').length ? 
                           $('.pmp-lesson-navigation') : 
                           $('body');
            
            $message.prependTo($target);
            
            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    $message.fadeOut();
                }, 5000);
            }
        },
        
        /**
         * Initialize progress animations
         */
        initProgressAnimations: function() {
            // Animate progress bars on load
            $('.progress-bar').each(function() {
                const $bar = $(this);
                const targetWidth = $bar.css('width');
                
                $bar.css('width', '0%');
                
                setTimeout(() => {
                    $bar.animate({
                        width: targetWidth
                    }, 1000, 'easeOutCubic');
                }, 500);
            });
        },
        
        /**
         * Handle responsive navigation adjustments
         */
        handleResponsiveNavigation: function() {
            const $navigation = $('.pmp-lesson-navigation');
            
            // Adjust navigation for mobile
            if ($(window).width() < 768) {
                $navigation.addClass('mobile-navigation');
                
                // Stack navigation buttons vertically on very small screens
                if ($(window).width() < 576) {
                    $navigation.addClass('stacked-navigation');
                }
            } else {
                $navigation.removeClass('mobile-navigation stacked-navigation');
            }
        }
    };
    
    /**
     * Initialize when document is ready
     */
    $(document).ready(function() {
        CourseProgression.init();
        CourseProgression.initProgressAnimations();
        CourseProgression.handleResponsiveNavigation();
        
        // Handle window resize
        $(window).on('resize', CourseProgression.handleResponsiveNavigation);
    });
    
})(jQuery);