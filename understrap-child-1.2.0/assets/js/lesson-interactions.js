/**
 * PMP Lesson Interactions JavaScript
 * Handles ECO references and practice question interactions
 */

(function($) {
    'use strict';

    // Initialize when document is ready
    $(document).ready(function() {
        initializePracticeQuestions();
        initializeECOReferences();
        initializeLessonProgress();
        initializeTableOfContents();
        initializeSmoothScrolling();
    });

    /**
     * Initialize practice question functionality
     */
    function initializePracticeQuestions() {
        $('.practice-question-block').each(function() {
            const $questionBlock = $(this);
            const $submitBtn = $questionBlock.find('.question-submit-btn');
            const $resetBtn = $questionBlock.find('.question-reset-btn');
            const $answerOptions = $questionBlock.find('.answer-option');
            const $explanation = $questionBlock.find('.answer-explanation');
            const $feedback = $questionBlock.find('.question-feedback');
            
            let selectedAnswer = null;
            let isAnswered = false;

            // Handle answer option selection
            $answerOptions.on('click', function() {
                if (isAnswered) return;

                // Remove previous selection
                $answerOptions.removeClass('selected');
                
                // Add selection to clicked option
                $(this).addClass('selected');
                selectedAnswer = $(this).data('answer');
                
                // Enable submit button
                $submitBtn.prop('disabled', false);
            });

            // Handle keyboard navigation for answer options
            $answerOptions.on('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    $(this).click();
                }
            });

            // Handle submit button click
            $submitBtn.on('click', function() {
                if (!selectedAnswer || isAnswered) return;

                isAnswered = true;
                const correctAnswer = $questionBlock.data('correct-answer');
                const isCorrect = selectedAnswer === correctAnswer;

                // Show correct/incorrect styling
                $answerOptions.each(function() {
                    const $option = $(this);
                    const optionAnswer = $option.data('answer');
                    
                    if (optionAnswer === correctAnswer) {
                        $option.addClass('correct');
                    } else if (optionAnswer === selectedAnswer && !isCorrect) {
                        $option.addClass('incorrect');
                    }
                });

                // Show feedback
                $feedback.removeClass('correct incorrect').addClass(isCorrect ? 'correct' : 'incorrect');
                $feedback.text(isCorrect ? 'Correct! Well done.' : 'Incorrect. Review the explanation below.');
                $feedback.addClass('show');

                // Show explanation
                $explanation.addClass('show');

                // Update button states
                $submitBtn.prop('disabled', true).text('Answered');
                $resetBtn.show();

                // Track answer for analytics
                trackQuestionAnswer($questionBlock.data('question-id'), selectedAnswer, isCorrect);

                // Scroll to explanation if needed
                setTimeout(() => {
                    const explanationTop = $explanation.offset().top;
                    const windowBottom = $(window).scrollTop() + $(window).height();
                    
                    if (explanationTop > windowBottom - 100) {
                        $('html, body').animate({
                            scrollTop: explanationTop - 100
                        }, 500);
                    }
                }, 300);
            });

            // Handle reset button click
            $resetBtn.on('click', function() {
                resetQuestion($questionBlock);
            });

            // Initialize button states
            $submitBtn.prop('disabled', true);
            $resetBtn.hide();
        });
    }

    /**
     * Reset a practice question to initial state
     */
    function resetQuestion($questionBlock) {
        const $submitBtn = $questionBlock.find('.question-submit-btn');
        const $resetBtn = $questionBlock.find('.question-reset-btn');
        const $answerOptions = $questionBlock.find('.answer-option');
        const $explanation = $questionBlock.find('.answer-explanation');
        const $feedback = $questionBlock.find('.question-feedback');

        // Reset answer options
        $answerOptions.removeClass('selected correct incorrect');
        
        // Hide explanation and feedback
        $explanation.removeClass('show');
        $feedback.removeClass('show correct incorrect');
        
        // Reset button states
        $submitBtn.prop('disabled', true).text('Submit Answer');
        $resetBtn.hide();
        
        // Reset state variables
        selectedAnswer = null;
        isAnswered = false;
    }

    /**
     * Initialize ECO reference interactions
     */
    function initializeECOReferences() {
        $('.eco-reference-block').each(function() {
            const $ecoBlock = $(this);
            
            // Add click handler for ECO reference tracking
            $ecoBlock.on('click', function() {
                const ecoRef = $ecoBlock.data('eco-ref');
                if (ecoRef) {
                    trackECOReference(ecoRef);
                }
            });

            // Add hover effects for better UX
            $ecoBlock.on('mouseenter', function() {
                $(this).addClass('hovered');
            }).on('mouseleave', function() {
                $(this).removeClass('hovered');
            });
        });
    }

    /**
     * Initialize lesson progress tracking
     */
    function initializeLessonProgress() {
        // Track lesson access
        const lessonId = $('body').data('lesson-id') || getCurrentLessonId();
        if (lessonId) {
            trackLessonAccess(lessonId);
        }

        // Track reading progress
        let progressTimer;
        let readingTime = 0;
        const PROGRESS_INTERVAL = 5000; // 5 seconds

        function startProgressTracking() {
            progressTimer = setInterval(() => {
                readingTime += PROGRESS_INTERVAL;
                
                // Track progress every 30 seconds
                if (readingTime % 30000 === 0) {
                    trackReadingProgress(lessonId, readingTime);
                }
            }, PROGRESS_INTERVAL);
        }

        function stopProgressTracking() {
            if (progressTimer) {
                clearInterval(progressTimer);
                trackReadingProgress(lessonId, readingTime);
            }
        }

        // Start tracking when page is visible
        if (document.visibilityState === 'visible') {
            startProgressTracking();
        }

        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                startProgressTracking();
            } else {
                stopProgressTracking();
            }
        });

        // Track when leaving page
        $(window).on('beforeunload', () => {
            stopProgressTracking();
        });

        // Mark lesson as completed when reaching bottom
        let hasMarkedComplete = false;
        $(window).on('scroll', throttle(() => {
            if (hasMarkedComplete) return;

            const scrollTop = $(window).scrollTop();
            const windowHeight = $(window).height();
            const documentHeight = $(document).height();
            const scrollPercent = (scrollTop + windowHeight) / documentHeight;

            // Mark as completed when 90% scrolled
            if (scrollPercent >= 0.9) {
                hasMarkedComplete = true;
                markLessonCompleted(lessonId);
            }
        }, 1000));
    }

    /**
     * Track practice question answer
     */
    function trackQuestionAnswer(questionId, selectedAnswer, isCorrect) {
        if (!questionId) return;

        const data = {
            action: 'pmp_track_question_answer',
            nonce: pmpData.nonce,
            question_id: questionId,
            selected_answer: selectedAnswer,
            is_correct: isCorrect,
            user_id: pmpData.userId
        };

        $.post(pmpData.ajaxUrl, data)
            .done(function(response) {
                console.log('Question answer tracked:', response);
            })
            .fail(function(xhr, status, error) {
                console.error('Failed to track question answer:', error);
            });
    }

    /**
     * Track ECO reference interaction
     */
    function trackECOReference(ecoRef) {
        const data = {
            action: 'pmp_track_eco_reference',
            nonce: pmpData.nonce,
            eco_ref: ecoRef,
            user_id: pmpData.userId
        };

        $.post(pmpData.ajaxUrl, data)
            .done(function(response) {
                console.log('ECO reference tracked:', response);
            })
            .fail(function(xhr, status, error) {
                console.error('Failed to track ECO reference:', error);
            });
    }

    /**
     * Track lesson access
     */
    function trackLessonAccess(lessonId) {
        const data = {
            action: 'pmp_track_lesson_access',
            nonce: pmpData.nonce,
            lesson_id: lessonId,
            user_id: pmpData.userId
        };

        $.post(pmpData.ajaxUrl, data)
            .done(function(response) {
                console.log('Lesson access tracked:', response);
            })
            .fail(function(xhr, status, error) {
                console.error('Failed to track lesson access:', error);
            });
    }

    /**
     * Track reading progress
     */
    function trackReadingProgress(lessonId, timeSpent) {
        const data = {
            action: 'pmp_track_reading_progress',
            nonce: pmpData.nonce,
            lesson_id: lessonId,
            time_spent: timeSpent,
            user_id: pmpData.userId
        };

        $.post(pmpData.ajaxUrl, data)
            .done(function(response) {
                console.log('Reading progress tracked:', response);
            })
            .fail(function(xhr, status, error) {
                console.error('Failed to track reading progress:', error);
            });
    }

    /**
     * Mark lesson as completed
     */
    function markLessonCompleted(lessonId) {
        const data = {
            action: 'pmp_mark_lesson_completed',
            nonce: pmpData.nonce,
            lesson_id: lessonId,
            user_id: pmpData.userId
        };

        $.post(pmpData.ajaxUrl, data)
            .done(function(response) {
                console.log('Lesson marked as completed:', response);
                
                // Show completion notification
                showCompletionNotification();
                
                // Update navigation if available
                if (typeof updateNavigationProgress === 'function') {
                    updateNavigationProgress();
                }
            })
            .fail(function(xhr, status, error) {
                console.error('Failed to mark lesson as completed:', error);
            });
    }

    /**
     * Show lesson completion notification
     */
    function showCompletionNotification() {
        const notification = $(`
            <div class="lesson-completion-notification">
                <div class="notification-content">
                    <div class="notification-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    </div>
                    <div class="notification-text">
                        <h4>Lesson Completed!</h4>
                        <p>Great job! Your progress has been saved.</p>
                    </div>
                    <button class="notification-close" aria-label="Close notification">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </div>
        `);

        // Add notification styles
        if (!$('#lesson-notification-styles').length) {
            $('head').append(`
                <style id="lesson-notification-styles">
                    .lesson-completion-notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #059669;
                        color: white;
                        border-radius: 12px;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                        z-index: 10000;
                        animation: slideInRight 0.3s ease-out;
                        max-width: 400px;
                    }
                    
                    .notification-content {
                        display: flex;
                        align-items: center;
                        padding: 1rem 1.5rem;
                        gap: 1rem;
                    }
                    
                    .notification-icon {
                        flex-shrink: 0;
                        width: 32px;
                        height: 32px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .notification-text h4 {
                        margin: 0 0 0.25rem 0;
                        font-size: 1rem;
                        font-weight: 600;
                    }
                    
                    .notification-text p {
                        margin: 0;
                        font-size: 0.875rem;
                        opacity: 0.9;
                    }
                    
                    .notification-close {
                        background: none;
                        border: none;
                        color: white;
                        cursor: pointer;
                        padding: 0.25rem;
                        border-radius: 4px;
                        margin-left: auto;
                        opacity: 0.8;
                        transition: opacity 0.2s ease;
                    }
                    
                    .notification-close:hover {
                        opacity: 1;
                    }
                    
                    @keyframes slideInRight {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    
                    @media (max-width: 768px) {
                        .lesson-completion-notification {
                            top: 10px;
                            right: 10px;
                            left: 10px;
                            max-width: none;
                        }
                    }
                </style>
            `);
        }

        // Add to page
        $('body').append(notification);

        // Handle close button
        notification.find('.notification-close').on('click', function() {
            notification.fadeOut(300, function() {
                $(this).remove();
            });
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.fadeOut(300, function() {
                $(this).remove();
            });
        }, 5000);
    }

    /**
     * Get current lesson ID from URL or page data
     */
    function getCurrentLessonId() {
        // Try to get from body data attribute
        let lessonId = $('body').data('lesson-id');
        
        if (!lessonId) {
            // Try to extract from URL
            const pathParts = window.location.pathname.split('/');
            const lessonIndex = pathParts.indexOf('lesson');
            if (lessonIndex !== -1 && pathParts[lessonIndex + 1]) {
                lessonId = pathParts[lessonIndex + 1];
            }
        }
        
        if (!lessonId) {
            // Try to get from post ID
            const postId = $('article[id^="lesson-"]').attr('id');
            if (postId) {
                lessonId = postId.replace('lesson-', '');
            }
        }
        
        return lessonId;
    }

    /**
     * Throttle function to limit function calls
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
     * Utility function to create ECO reference blocks
     */
    window.createECOReference = function(ecoRef, title, content, domain = 'mixed') {
        return `
            <div class="eco-reference-block domain-${domain}" data-eco-ref="${ecoRef}">
                <div class="eco-reference-header">
                    <div class="eco-reference-number">${ecoRef}</div>
                    <h4 class="eco-reference-title">${title}</h4>
                </div>
                <div class="eco-reference-content">
                    ${content}
                </div>
            </div>
        `;
    };

    /**
     * Utility function to create practice question blocks
     */
    window.createPracticeQuestion = function(questionData) {
        const {
            id,
            number,
            difficulty = 'medium',
            ecoRef,
            question,
            options,
            correctAnswer,
            explanation
        } = questionData;

        const optionsHtml = options.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            return `
                <div class="answer-option" data-answer="${letter}" tabindex="0" role="button" aria-label="Answer option ${letter}">
                    <div class="answer-letter">${letter}</div>
                    <div class="answer-text">${option}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="practice-question-block" data-question-id="${id}" data-correct-answer="${correctAnswer}">
                <div class="practice-question-header">
                    <div class="practice-question-meta">
                        <div class="question-number">Question ${number}</div>
                        <div class="question-difficulty difficulty-${difficulty}">${difficulty}</div>
                        ${ecoRef ? `<div class="question-eco-ref">ECO: ${ecoRef}</div>` : ''}
                    </div>
                    <p class="practice-question-text">${question}</p>
                </div>
                <div class="practice-question-content">
                    <div class="answer-options">
                        ${optionsHtml}
                    </div>
                </div>
                <div class="answer-explanation">
                    <div class="explanation-header">
                        <div class="explanation-icon">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM7 3a1 1 0 012 0v5a1 1 0 01-2 0V3zm2 8a1 1 0 11-2 0 1 1 0 012 0z"/>
                            </svg>
                        </div>
                        <h5 class="explanation-title">Explanation</h5>
                    </div>
                    <div class="explanation-content">
                        ${explanation}
                    </div>
                </div>
                <div class="question-actions">
                    <button class="question-submit-btn" disabled>Submit Answer</button>
                    <div class="question-feedback"></div>
                    <button class="question-reset-btn" style="display: none;">Try Again</button>
                </div>
            </div>
        `;
    };

    /**
     * Initialize table of contents generation
     */
    function initializeTableOfContents() {
        const $tocContainer = $('#lesson-table-of-contents');
        if (!$tocContainer.length) return;

        const $lessonContent = $('.lesson-content');
        if (!$lessonContent.length) return;

        // Find all headings in the lesson content
        const $headings = $lessonContent.find('h1, h2, h3, h4, h5, h6');
        
        if ($headings.length === 0) {
            $tocContainer.hide();
            return;
        }

        // Generate table of contents
        const tocHtml = generateTableOfContents($headings);
        $tocContainer.html(tocHtml);

        // Add click handlers for TOC links
        $tocContainer.find('.toc-link').on('click', function(e) {
            e.preventDefault();
            const targetId = $(this).attr('href').substring(1);
            const $target = $('#' + targetId);
            
            if ($target.length) {
                smoothScrollTo($target, 80); // 80px offset for fixed header
                
                // Update active TOC item
                updateActiveTocItem($(this));
            }
        });

        // Update active TOC item on scroll
        let ticking = false;
        $(window).on('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    updateActiveTocItemOnScroll($headings);
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initial active item update
        updateActiveTocItemOnScroll($headings);
    }

    /**
     * Generate table of contents HTML
     */
    function generateTableOfContents($headings) {
        let tocHtml = `
            <div class="toc-header">
                <div class="toc-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                    </svg>
                </div>
                <h4 class="toc-title">Table of Contents</h4>
            </div>
            <nav class="toc-nav" role="navigation" aria-label="Table of contents">
                <ul class="toc-list">
        `;

        $headings.each(function(index) {
            const $heading = $(this);
            const headingText = $heading.text().trim();
            const headingLevel = parseInt($heading.prop('tagName').substring(1));
            const headingId = generateHeadingId(headingText, index);
            
            // Add ID to heading if it doesn't have one
            if (!$heading.attr('id')) {
                $heading.attr('id', headingId);
            }

            // Create TOC item
            const tocItemClass = `toc-item toc-level-${headingLevel}`;
            tocHtml += `
                <li class="${tocItemClass}">
                    <a href="#${headingId}" class="toc-link" data-level="${headingLevel}">
                        <span class="toc-text">${headingText}</span>
                    </a>
                </li>
            `;
        });

        tocHtml += `
                </ul>
            </nav>
        `;

        return tocHtml;
    }

    /**
     * Generate a unique ID for a heading
     */
    function generateHeadingId(text, index) {
        // Convert to lowercase, replace spaces with hyphens, remove special characters
        let id = text.toLowerCase()
                     .replace(/[^\w\s-]/g, '')
                     .replace(/\s+/g, '-')
                     .replace(/-+/g, '-')
                     .trim('-');
        
        // Ensure it starts with a letter
        if (!/^[a-z]/.test(id)) {
            id = 'heading-' + id;
        }
        
        // Add index to ensure uniqueness
        id += '-' + index;
        
        return id;
    }

    /**
     * Update active TOC item
     */
    function updateActiveTocItem($activeLink) {
        $('.toc-link').removeClass('active');
        $activeLink.addClass('active');
    }

    /**
     * Update active TOC item based on scroll position
     */
    function updateActiveTocItemOnScroll($headings) {
        const scrollTop = $(window).scrollTop();
        const windowHeight = $(window).height();
        let activeHeading = null;

        // Find the heading that's currently in view
        $headings.each(function() {
            const $heading = $(this);
            const headingTop = $heading.offset().top;
            const headingId = $heading.attr('id');

            if (headingTop <= scrollTop + 100) { // 100px offset
                activeHeading = headingId;
            }
        });

        if (activeHeading) {
            const $activeLink = $(`.toc-link[href="#${activeHeading}"]`);
            if ($activeLink.length && !$activeLink.hasClass('active')) {
                updateActiveTocItem($activeLink);
            }
        }
    }

    /**
     * Initialize smooth scrolling for all internal links
     */
    function initializeSmoothScrolling() {
        // Handle all internal anchor links
        $('a[href^="#"]').on('click', function(e) {
            const href = $(this).attr('href');
            
            // Skip if it's just "#" or empty
            if (href === '#' || href.length <= 1) {
                return;
            }

            const $target = $(href);
            if ($target.length) {
                e.preventDefault();
                smoothScrollTo($target, 80);
            }
        });

        // Add smooth scrolling to lesson navigation
        $('.nav-link').on('click', function(e) {
            // Let the default navigation happen for lesson navigation
            // This is for within-page navigation only
        });
    }

    /**
     * Smooth scroll to target element
     */
    function smoothScrollTo($target, offset = 0) {
        const targetTop = $target.offset().top - offset;
        
        $('html, body').animate({
            scrollTop: targetTop
        }, {
            duration: 600,
            easing: 'swing',
            complete: function() {
                // Update URL hash without jumping
                if (history.pushState) {
                    const targetId = $target.attr('id');
                    if (targetId) {
                        history.pushState(null, null, '#' + targetId);
                    }
                }
            }
        });
    }

    /**
     * Initialize reading progress indicator
     */
    function initializeReadingProgress() {
        // Create progress bar if it doesn't exist
        if (!$('#reading-progress').length) {
            $('body').append('<div id="reading-progress"><div class="progress-bar"></div></div>');
        }

        const $progressBar = $('#reading-progress .progress-bar');
        
        $(window).on('scroll', throttle(function() {
            const scrollTop = $(window).scrollTop();
            const documentHeight = $(document).height();
            const windowHeight = $(window).height();
            const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
            
            $progressBar.css('width', Math.min(scrollPercent, 100) + '%');
        }, 16)); // ~60fps
    }

    // Initialize reading progress
    $(document).ready(function() {
        initializeReadingProgress();
    });

})(jQuery);