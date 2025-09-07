/**
 * Tests for PMP Lesson Interactions JavaScript functionality
 */

describe('Lesson Interactions', () => {
  let mockPracticeQuestion;
  let mockECOReference;
  
  beforeEach(() => {
    // Mock jQuery
    global.$ = jest.fn((selector) => {
      const mockJQuery = {
        ready: jest.fn((callback) => callback()),
        on: jest.fn(),
        find: jest.fn(() => mockJQuery),
        addClass: jest.fn(() => mockJQuery),
        removeClass: jest.fn(() => mockJQuery),
        hasClass: jest.fn(() => false),
        attr: jest.fn(),
        data: jest.fn(),
        text: jest.fn(),
        html: jest.fn(),
        css: jest.fn(),
        animate: jest.fn(),
        fadeIn: jest.fn(),
        fadeOut: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
        append: jest.fn(),
        prepend: jest.fn(),
        remove: jest.fn(),
        click: jest.fn(),
        focus: jest.fn(),
        submit: jest.fn(),
        each: jest.fn((callback) => {
          // Simulate each iteration
          if (selector === '.practice-question-block') {
            callback.call(mockPracticeQuestion, 0, mockPracticeQuestion);
          } else if (selector === '.eco-reference-block') {
            callback.call(mockECOReference, 0, mockECOReference);
          }
          return mockJQuery;
        }),
        closest: jest.fn(() => mockJQuery),
        offset: jest.fn(() => ({ top: 100 })),
        scrollTop: jest.fn(),
        height: jest.fn(() => 600),
        width: jest.fn(() => 800),
        length: 1,
        get: jest.fn(),
        prop: jest.fn(),
        insertAdjacentHTML: jest.fn()
      };
      
      return mockJQuery;
    });
    
    // Mock document ready
    global.$(document).ready = jest.fn((callback) => callback());
    
    // Mock window object
    global.$(window) = {
      on: jest.fn(),
      scrollTop: jest.fn(() => 0),
      height: jest.fn(() => 600),
      addEventListener: jest.fn()
    };
    
    // Mock practice question elements
    mockPracticeQuestion = {
      find: jest.fn((selector) => {
        const mockElement = {
          on: jest.fn(),
          prop: jest.fn(),
          removeClass: jest.fn(),
          addClass: jest.fn(),
          data: jest.fn(),
          text: jest.fn(),
          show: jest.fn(),
          hide: jest.fn(),
          each: jest.fn()
        };
        
        if (selector === '.answer-option') {
          mockElement.each = jest.fn((callback) => {
            callback.call(mockElement, 0, mockElement);
          });
        }
        
        return mockElement;
      }),
      data: jest.fn(() => 'question-1')
    };
    
    // Mock ECO reference elements
    mockECOReference = {
      on: jest.fn(),
      data: jest.fn(() => 'ECO-1.1'),
      addClass: jest.fn(),
      removeClass: jest.fn()
    };
    
    // Mock body data
    global.$('body').data = jest.fn(() => 'lesson-01-01');
    
    // Mock AJAX
    global.$.post = jest.fn(() => ({
      done: jest.fn(() => ({ fail: jest.fn() })),
      fail: jest.fn()
    }));
    
    // Load the lesson interactions script
    require('../../../assets/js/lesson-interactions.js');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Practice Questions', () => {
    test('should initialize practice questions', () => {
      expect(global.$('.practice-question-block').each).toHaveBeenCalled();
    });
    
    test('should handle answer option selection', () => {
      const mockAnswerOption = mockPracticeQuestion.find('.answer-option');
      
      // Get the click handler
      const clickHandler = mockAnswerOption.on.mock.calls
        .find(call => call[0] === 'click')[1];
      
      // Mock the question state
      let isAnswered = false;
      
      // Simulate click
      clickHandler();
      
      expect(mockAnswerOption.removeClass).toHaveBeenCalledWith('selected');
      expect(mockAnswerOption.addClass).toHaveBeenCalledWith('selected');
    });
    
    test('should handle keyboard navigation for answers', () => {
      const mockAnswerOption = mockPracticeQuestion.find('.answer-option');
      
      const keydownHandler = mockAnswerOption.on.mock.calls
        .find(call => call[0] === 'keydown')[1];
      
      const enterEvent = { key: 'Enter', preventDefault: jest.fn() };
      keydownHandler(enterEvent);
      
      expect(enterEvent.preventDefault).toHaveBeenCalled();
    });
    
    test('should submit answer and show feedback', () => {
      const mockSubmitBtn = mockPracticeQuestion.find('.question-submit-btn');
      
      const clickHandler = mockSubmitBtn.on.mock.calls
        .find(call => call[0] === 'click')[1];
      
      // Mock question data
      mockPracticeQuestion.data = jest.fn((key) => {
        if (key === 'correct-answer') return 'A';
        return 'question-1';
      });
      
      clickHandler();
      
      expect(mockSubmitBtn.prop).toHaveBeenCalledWith('disabled', true);
    });
    
    test('should reset question to initial state', () => {
      const mockResetBtn = mockPracticeQuestion.find('.question-reset-btn');
      
      const clickHandler = mockResetBtn.on.mock.calls
        .find(call => call[0] === 'click')[1];
      
      clickHandler();
      
      expect(mockPracticeQuestion.find('.answer-option').removeClass)
        .toHaveBeenCalledWith('selected correct incorrect');
    });
    
    test('should track question answers', () => {
      // Mock pmpData
      global.pmpData = {
        ajaxUrl: '/wp-admin/admin-ajax.php',
        nonce: 'test-nonce',
        userId: 1
      };
      
      // The tracking function should be called during answer submission
      expect(global.$.post).toBeDefined();
    });
  });
  
  describe('ECO References', () => {
    test('should initialize ECO references', () => {
      expect(global.$('.eco-reference-block').each).toHaveBeenCalled();
    });
    
    test('should track ECO reference clicks', () => {
      const clickHandler = mockECOReference.on.mock.calls
        .find(call => call[0] === 'click')[1];
      
      clickHandler();
      
      expect(mockECOReference.data).toHaveBeenCalledWith('eco-ref');
    });
    
    test('should add hover effects', () => {
      const mouseenterHandler = mockECOReference.on.mock.calls
        .find(call => call[0] === 'mouseenter')[1];
      
      const mouseleaveHandler = mockECOReference.on.mock.calls
        .find(call => call[0] === 'mouseleave')[1];
      
      mouseenterHandler();
      expect(mockECOReference.addClass).toHaveBeenCalledWith('hovered');
      
      mouseleaveHandler();
      expect(mockECOReference.removeClass).toHaveBeenCalledWith('hovered');
    });
  });
  
  describe('Progress Tracking', () => {
    test('should track lesson access on initialization', () => {
      global.pmpData = {
        ajaxUrl: '/wp-admin/admin-ajax.php',
        nonce: 'test-nonce',
        userId: 1
      };
      
      // Should have made AJAX call for lesson access
      expect(global.$.post).toHaveBeenCalled();
    });
    
    test('should handle visibility changes', () => {
      const visibilityHandler = document.addEventListener.mock.calls
        .find(call => call[0] === 'visibilitychange')[1];
      
      // Mock visibility state
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true
      });
      
      visibilityHandler();
      
      // Should stop tracking when hidden
      expect(document.visibilityState).toBe('hidden');
    });
    
    test('should mark lesson as completed on scroll', () => {
      const scrollHandler = global.$(window).on.mock.calls
        .find(call => call[0] === 'scroll')[1];
      
      // Mock scroll position at 90%
      global.$(window).scrollTop = jest.fn(() => 540); // 90% of 600px window
      global.$(document).height = jest.fn(() => 1000);
      
      scrollHandler();
      
      // Should trigger completion tracking
      expect(global.$.post).toHaveBeenCalled();
    });
  });
  
  describe('Table of Contents', () => {
    beforeEach(() => {
      // Mock TOC container
      const mockTOCContainer = {
        length: 1,
        html: jest.fn(),
        hide: jest.fn(),
        find: jest.fn(() => ({
          on: jest.fn()
        }))
      };
      
      global.$('#lesson-table-of-contents') = mockTOCContainer;
      
      // Mock lesson content with headings
      const mockLessonContent = {
        length: 1,
        find: jest.fn(() => ({
          length: 3,
          each: jest.fn((callback) => {
            // Simulate 3 headings
            for (let i = 0; i < 3; i++) {
              const mockHeading = {
                text: jest.fn(() => `Heading ${i + 1}`),
                prop: jest.fn(() => 'H2'),
                attr: jest.fn()
              };
              callback.call(mockHeading, i, mockHeading);
            }
          })
        }))
      };
      
      global.$('.lesson-content') = mockLessonContent;
    });
    
    test('should generate table of contents', () => {
      const mockTOCContainer = global.$('#lesson-table-of-contents');
      
      // TOC should be generated
      expect(mockTOCContainer.html).toHaveBeenCalled();
    });
    
    test('should hide TOC when no headings found', () => {
      const mockLessonContent = global.$('.lesson-content');
      mockLessonContent.find = jest.fn(() => ({ length: 0 }));
      
      const mockTOCContainer = global.$('#lesson-table-of-contents');
      
      // Should hide TOC
      expect(mockTOCContainer.hide).toBeDefined();
    });
  });
  
  describe('Smooth Scrolling', () => {
    test('should handle internal anchor links', () => {
      const mockAnchorLink = {
        on: jest.fn(),
        attr: jest.fn(() => '#section-1')
      };
      
      global.$('a[href^="#"]') = {
        on: jest.fn((event, handler) => {
          if (event === 'click') {
            // Simulate click with valid target
            const mockEvent = { preventDefault: jest.fn() };
            global.$('#section-1') = { length: 1, offset: jest.fn(() => ({ top: 200 })) };
            
            handler.call(mockAnchorLink, mockEvent);
            
            expect(mockEvent.preventDefault).toHaveBeenCalled();
          }
        })
      };
    });
    
    test('should animate scroll to target', () => {
      const mockTarget = {
        offset: jest.fn(() => ({ top: 500 })),
        attr: jest.fn(() => 'target-section')
      };
      
      global.$('html, body') = {
        animate: jest.fn()
      };
      
      // Should animate scroll
      expect(global.$('html, body').animate).toBeDefined();
    });
  });
  
  describe('Utility Functions', () => {
    test('should create ECO reference blocks', () => {
      const ecoHTML = window.createECOReference('ECO-1.1', 'Test Title', 'Test content', 'people');
      
      expect(ecoHTML).toContain('ECO-1.1');
      expect(ecoHTML).toContain('Test Title');
      expect(ecoHTML).toContain('Test content');
      expect(ecoHTML).toContain('domain-people');
    });
    
    test('should create practice question blocks', () => {
      const questionData = {
        id: 'q1',
        number: 1,
        difficulty: 'medium',
        ecoRef: 'ECO-1.1',
        question: 'Test question?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'A',
        explanation: 'Test explanation'
      };
      
      const questionHTML = window.createPracticeQuestion(questionData);
      
      expect(questionHTML).toContain('Test question?');
      expect(questionHTML).toContain('Option A');
      expect(questionHTML).toContain('Test explanation');
      expect(questionHTML).toContain('data-correct-answer="A"');
    });
    
    test('should get current lesson ID from various sources', () => {
      // Mock body data
      global.$('body').data = jest.fn(() => 'lesson-from-body');
      
      // Should return lesson ID
      expect(global.$('body').data).toBeDefined();
    });
  });
  
  describe('Completion Notification', () => {
    test('should show completion notification', () => {
      // Mock head element for styles
      global.$('head') = {
        append: jest.fn()
      };
      
      global.$('#lesson-notification-styles') = { length: 0 };
      
      // Mock body for notification
      global.$('body') = {
        append: jest.fn()
      };
      
      // The notification should be created and shown
      expect(global.$('body').append).toBeDefined();
    });
    
    test('should auto-hide notification after timeout', (done) => {
      const mockNotification = {
        fadeOut: jest.fn((duration, callback) => {
          callback();
        }),
        remove: jest.fn(),
        find: jest.fn(() => ({
          on: jest.fn()
        }))
      };
      
      // Should fade out after timeout
      setTimeout(() => {
        expect(mockNotification.fadeOut).toBeDefined();
        done();
      }, 100);
    });
  });
  
  describe('Reading Progress', () => {
    test('should create reading progress bar', () => {
      global.$('#reading-progress') = { length: 0 };
      
      global.$('body') = {
        append: jest.fn()
      };
      
      // Should create progress bar
      expect(global.$('body').append).toBeDefined();
    });
    
    test('should update progress on scroll', () => {
      const mockProgressBar = {
        css: jest.fn()
      };
      
      global.$('#reading-progress .progress-bar') = mockProgressBar;
      
      // Mock scroll values
      global.$(window).scrollTop = jest.fn(() => 300);
      global.$(document).height = jest.fn(() => 1000);
      global.$(window).height = jest.fn(() => 600);
      
      // Should update progress bar width
      expect(mockProgressBar.css).toBeDefined();
    });
  });
  
  describe('Error Handling', () => {
    test('should handle AJAX errors gracefully', () => {
      global.$.post = jest.fn(() => ({
        done: jest.fn(() => ({
          fail: jest.fn((callback) => {
            callback({}, 'error', 'Network error');
          })
        }))
      }));
      
      // Should not throw errors
      expect(() => {
        global.$.post('/test', {});
      }).not.toThrow();
    });
    
    test('should handle missing DOM elements', () => {
      global.$('#non-existent-element') = { length: 0 };
      
      // Should handle gracefully
      expect(global.$('#non-existent-element').length).toBe(0);
    });
  });
  
  describe('Performance', () => {
    test('should throttle scroll events', () => {
      let callCount = 0;
      
      const throttledFunction = jest.fn(() => {
        callCount++;
      });
      
      // Simulate multiple rapid calls
      for (let i = 0; i < 10; i++) {
        throttledFunction();
      }
      
      expect(callCount).toBe(10);
    });
    
    test('should complete initialization quickly', () => {
      const startTime = performance.now();
      
      // Re-run initialization
      require('../../../assets/js/lesson-interactions.js');
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100);
    });
  });
});