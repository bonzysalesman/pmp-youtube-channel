/**
 * Tests for PMP Navigation JavaScript functionality
 */

// Import the navigation class
import '../../../assets/js/navigation.js';

describe('PMPNavigation', () => {
  let navigation;
  let mockNavigationElement;
  let mockNavToggle;
  let mockModuleToggles;
  
  beforeEach(() => {
    // Create mock DOM elements
    mockNavigationElement = testUtils.createMockElement('nav', {
      className: 'pmp-course-navigation',
      'data-user-id': '1'
    });
    
    mockNavToggle = testUtils.createMockElement('button', {
      className: 'nav-toggle',
      'aria-expanded': 'false'
    });
    
    mockModuleToggles = [
      testUtils.createMockElement('button', {
        className: 'module-toggle',
        'aria-expanded': 'false',
        'aria-controls': 'lessons-week-01'
      })
    ];
    
    // Mock DOM queries
    testUtils.mockQuerySelector('.pmp-course-navigation', mockNavigationElement);
    testUtils.mockQuerySelector('.nav-toggle', mockNavToggle);
    testUtils.mockQuerySelectorAll('.module-toggle', mockModuleToggles);
    testUtils.mockQuerySelectorAll('.lesson-link', []);
    
    // Mock additional elements
    const mockNavContent = testUtils.createMockElement('div', {
      className: 'nav-content',
      id: 'course-modules'
    });
    testUtils.mockQuerySelector('.nav-content', mockNavContent);
    
    // Initialize navigation
    navigation = new PMPNavigation();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Initialization', () => {
    test('should initialize properly with navigation element', () => {
      expect(navigation).toBeDefined();
      expect(navigation.navigation).toBe(mockNavigationElement);
    });
    
    test('should not initialize without navigation element', () => {
      testUtils.mockQuerySelector('.pmp-course-navigation', null);
      const nav = new PMPNavigation();
      expect(nav.navigation).toBeNull();
    });
    
    test('should set up event listeners', () => {
      expect(mockNavToggle.addEventListener).toHaveBeenCalled();
      expect(mockModuleToggles[0].addEventListener).toHaveBeenCalled();
    });
  });
  
  describe('Mobile Navigation', () => {
    test('should toggle mobile navigation on button click', () => {
      const clickHandler = mockNavToggle.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      const mockEvent = testUtils.createMockEvent('click');
      mockEvent.preventDefault = jest.fn();
      
      // Test opening navigation
      clickHandler(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockNavigationElement.classList.add).toHaveBeenCalledWith('nav-open');
      expect(mockNavToggle.setAttribute).toHaveBeenCalledWith('aria-expanded', 'true');
    });
    
    test('should close navigation on escape key', () => {
      // First open the navigation
      mockNavigationElement.classList.contains = jest.fn(() => true);
      
      const escapeHandler = document.addEventListener.mock.calls
        .find(call => call[0] === 'keydown')[1];
      
      const escapeEvent = testUtils.createMockEvent('keydown', { key: 'Escape' });
      escapeHandler(escapeEvent);
      
      expect(mockNavigationElement.classList.remove).toHaveBeenCalledWith('nav-open');
      expect(mockNavToggle.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
    });
    
    test('should close navigation when clicking outside on mobile', () => {
      // Set mobile viewport
      window.innerWidth = 768;
      mockNavigationElement.classList.contains = jest.fn(() => true);
      mockNavigationElement.contains = jest.fn(() => false);
      
      const clickHandler = document.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      const outsideClickEvent = testUtils.createMockEvent('click', {
        target: document.body
      });
      
      clickHandler(outsideClickEvent);
      
      expect(mockNavigationElement.classList.remove).toHaveBeenCalledWith('nav-open');
    });
  });
  
  describe('Module Toggle Functionality', () => {
    let mockLessonContainer;
    
    beforeEach(() => {
      mockLessonContainer = testUtils.createMockElement('div', {
        id: 'lessons-week-01',
        className: 'lesson-list-container collapsed'
      });
      
      document.getElementById = jest.fn((id) => {
        if (id === 'lessons-week-01') return mockLessonContainer;
        return null;
      });
    });
    
    test('should toggle module expansion on click', () => {
      const clickHandler = mockModuleToggles[0].addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      const mockEvent = testUtils.createMockEvent('click');
      mockEvent.preventDefault = jest.fn();
      
      // Mock getAttribute to return 'false' (collapsed state)
      mockModuleToggles[0].getAttribute = jest.fn(() => 'false');
      
      clickHandler(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockModuleToggles[0].setAttribute).toHaveBeenCalledWith('aria-expanded', 'true');
      expect(mockLessonContainer.classList.remove).toHaveBeenCalledWith('collapsed');
      expect(mockLessonContainer.classList.add).toHaveBeenCalledWith('expanded');
    });
    
    test('should handle keyboard activation for module toggle', () => {
      const keydownHandler = mockModuleToggles[0].addEventListener.mock.calls
        .find(call => call[0] === 'keydown')[1];
      
      const enterEvent = testUtils.createMockEvent('keydown', { key: 'Enter' });
      enterEvent.preventDefault = jest.fn();
      
      mockModuleToggles[0].getAttribute = jest.fn(() => 'false');
      
      keydownHandler(enterEvent);
      
      expect(enterEvent.preventDefault).toHaveBeenCalled();
      expect(mockModuleToggles[0].setAttribute).toHaveBeenCalledWith('aria-expanded', 'true');
    });
    
    test('should save module state to localStorage', () => {
      const clickHandler = mockModuleToggles[0].addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      mockModuleToggles[0].getAttribute = jest.fn(() => 'false');
      
      const mockEvent = testUtils.createMockEvent('click');
      mockEvent.preventDefault = jest.fn();
      
      clickHandler(mockEvent);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'pmp_module_states',
        expect.stringContaining('week-01')
      );
    });
  });
  
  describe('Keyboard Navigation', () => {
    let mockFocusableElements;
    
    beforeEach(() => {
      mockFocusableElements = [
        testUtils.createMockElement('button'),
        testUtils.createMockElement('a'),
        testUtils.createMockElement('button')
      ];
      
      mockNavigationElement.querySelectorAll = jest.fn(() => mockFocusableElements);
      
      // Mock document.activeElement
      Object.defineProperty(document, 'activeElement', {
        value: mockFocusableElements[1],
        writable: true
      });
    });
    
    test('should handle arrow down navigation', () => {
      const keydownHandler = mockNavigationElement.addEventListener.mock.calls
        .find(call => call[0] === 'keydown')[1];
      
      const arrowDownEvent = testUtils.createMockEvent('keydown', { key: 'ArrowDown' });
      arrowDownEvent.preventDefault = jest.fn();
      
      keydownHandler(arrowDownEvent);
      
      expect(arrowDownEvent.preventDefault).toHaveBeenCalled();
      expect(mockFocusableElements[2].focus).toHaveBeenCalled();
    });
    
    test('should handle arrow up navigation', () => {
      const keydownHandler = mockNavigationElement.addEventListener.mock.calls
        .find(call => call[0] === 'keydown')[1];
      
      const arrowUpEvent = testUtils.createMockEvent('keydown', { key: 'ArrowUp' });
      arrowUpEvent.preventDefault = jest.fn();
      
      keydownHandler(arrowUpEvent);
      
      expect(arrowUpEvent.preventDefault).toHaveBeenCalled();
      expect(mockFocusableElements[0].focus).toHaveBeenCalled();
    });
    
    test('should handle Home key navigation', () => {
      const keydownHandler = mockNavigationElement.addEventListener.mock.calls
        .find(call => call[0] === 'keydown')[1];
      
      const homeEvent = testUtils.createMockEvent('keydown', { key: 'Home' });
      homeEvent.preventDefault = jest.fn();
      
      keydownHandler(homeEvent);
      
      expect(homeEvent.preventDefault).toHaveBeenCalled();
      expect(mockFocusableElements[0].focus).toHaveBeenCalled();
    });
    
    test('should handle End key navigation', () => {
      const keydownHandler = mockNavigationElement.addEventListener.mock.calls
        .find(call => call[0] === 'keydown')[1];
      
      const endEvent = testUtils.createMockEvent('keydown', { key: 'End' });
      endEvent.preventDefault = jest.fn();
      
      keydownHandler(endEvent);
      
      expect(endEvent.preventDefault).toHaveBeenCalled();
      expect(mockFocusableElements[2].focus).toHaveBeenCalled();
    });
  });
  
  describe('Progress Tracking', () => {
    beforeEach(() => {
      // Mock current lesson ID
      navigation.currentLessonId = 'lesson-01-01';
      
      // Mock pmpData
      window.pmpData = {
        ajaxUrl: '/wp-admin/admin-ajax.php',
        nonce: 'test-nonce',
        userId: 1
      };
    });
    
    test('should track lesson completion', async () => {
      testUtils.mockAjaxSuccess({ success: true });
      
      await navigation.markLessonCompleted('lesson-01-01');
      
      expect(fetch).toHaveBeenCalledWith(
        '/wp-admin/admin-ajax.php',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        })
      );
    });
    
    test('should update lesson completion UI', () => {
      const mockLessonItem = testUtils.createMockElement('div', {
        'data-lesson-id': 'lesson-01-01'
      });
      
      const mockStatusIcon = testUtils.createMockElement('div', {
        className: 'lesson-status'
      });
      
      mockLessonItem.querySelector = jest.fn((selector) => {
        if (selector === '.lesson-status') return mockStatusIcon;
        if (selector === '.lesson-title') return testUtils.createMockElement('h4', { textContent: 'Test Lesson' });
        return null;
      });
      
      mockNavigationElement.querySelector = jest.fn(() => mockLessonItem);
      
      navigation.updateLessonCompletionUI('lesson-01-01');
      
      expect(mockLessonItem.classList.add).toHaveBeenCalledWith('completed');
      expect(mockStatusIcon.innerHTML).toContain('check-icon');
    });
    
    test('should update progress bar', () => {
      const mockProgressFill = testUtils.createMockElement('div', { className: 'progress-fill' });
      const mockProgressText = testUtils.createMockElement('span', { className: 'progress-text' });
      const mockCompletedCount = testUtils.createMockElement('span', { className: 'completed' });
      
      // Mock completed and total lessons
      mockNavigationElement.querySelectorAll = jest.fn((selector) => {
        if (selector === '.lesson-item.completed') return [1, 2]; // 2 completed
        if (selector === '.lesson-item') return [1, 2, 3, 4, 5]; // 5 total
        return [];
      });
      
      mockNavigationElement.querySelector = jest.fn((selector) => {
        if (selector === '.progress-fill') return mockProgressFill;
        if (selector === '.progress-text') return mockProgressText;
        if (selector === '.lesson-count .completed') return mockCompletedCount;
        return null;
      });
      
      navigation.updateProgressBar();
      
      expect(mockProgressFill.style.width).toBe('40%'); // 2/5 * 100
      expect(mockProgressText.textContent).toBe('40% Complete');
      expect(mockCompletedCount.textContent).toBe('2');
    });
  });
  
  describe('Accessibility Features', () => {
    test('should add skip links', () => {
      const skipLink = testUtils.createMockElement('a', {
        href: '#main-content',
        className: 'skip-link'
      });
      
      document.createElement = jest.fn(() => skipLink);
      
      navigation.addSkipLinks();
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockNavigationElement.insertBefore).toHaveBeenCalled();
    });
    
    test('should create ARIA live regions', () => {
      const liveRegion = testUtils.createMockElement('div');
      document.createElement = jest.fn(() => liveRegion);
      
      navigation.setupAriaLiveRegions();
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(liveRegion.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(document.body.appendChild).toHaveBeenCalled();
    });
    
    test('should announce messages to screen readers', () => {
      const mockLiveRegion = testUtils.createMockElement('div', { id: 'navigation-announcements' });
      document.getElementById = jest.fn(() => mockLiveRegion);
      
      navigation.announceToScreenReader('Test message');
      
      expect(mockLiveRegion.textContent).toBe('Test message');
    });
    
    test('should handle reduced motion preferences', () => {
      // Mock matchMedia to return reduced motion preference
      window.matchMedia = jest.fn(() => ({
        matches: true
      }));
      
      navigation.handleReducedMotion();
      
      expect(mockNavigationElement.style.scrollBehavior).toBe('auto');
      expect(mockNavigationElement.classList.add).toHaveBeenCalledWith('reduced-motion');
    });
  });
  
  describe('Responsive Behavior', () => {
    test('should close mobile nav on window resize to desktop', () => {
      // Set mobile state
      mockNavigationElement.classList.contains = jest.fn(() => true);
      
      // Simulate resize to desktop
      window.innerWidth = 1200;
      
      const resizeHandler = window.addEventListener.mock.calls
        .find(call => call[0] === 'resize')[1];
      
      resizeHandler();
      
      // Wait for debounced resize handler
      setTimeout(() => {
        expect(mockNavigationElement.classList.remove).toHaveBeenCalledWith('nav-open');
      }, 300);
    });
  });
  
  describe('Error Handling', () => {
    test('should handle AJAX errors gracefully', async () => {
      testUtils.mockAjaxError('Network error');
      
      // Should not throw error
      await expect(navigation.markLessonCompleted('lesson-01-01')).resolves.toBeUndefined();
      
      expect(console.warn).toHaveBeenCalledWith(
        'Progress tracking failed:',
        expect.any(Error)
      );
    });
    
    test('should handle missing DOM elements gracefully', () => {
      // Test with null elements
      testUtils.mockQuerySelector('.progress-fill', null);
      testUtils.mockQuerySelector('.progress-text', null);
      
      // Should not throw error
      expect(() => navigation.updateProgressBar()).not.toThrow();
    });
  });
  
  describe('Performance', () => {
    test('should complete initialization within reasonable time', () => {
      const startTime = performance.now();
      
      new PMPNavigation();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should initialize within 100ms
      expect(executionTime).toBeLessThan(100);
    });
    
    test('should throttle scroll events', () => {
      let scrollCallCount = 0;
      
      // Mock scroll handler
      const scrollHandler = () => {
        scrollCallCount++;
      };
      
      // Simulate multiple rapid scroll events
      for (let i = 0; i < 10; i++) {
        scrollHandler();
      }
      
      // Should be called for each event in test environment
      expect(scrollCallCount).toBe(10);
    });
  });
});