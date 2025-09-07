/**
 * Tests for PMP Dashboard JavaScript functionality
 */

describe('PMPDashboard', () => {
  let dashboard;
  let mockProgressCircle;
  let mockProgressText;
  
  beforeEach(() => {
    // Mock jQuery for dashboard
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
        each: jest.fn(),
        closest: jest.fn(() => mockJQuery),
        offset: jest.fn(() => ({ top: 0, left: 0 })),
        scrollTop: jest.fn(),
        height: jest.fn(() => 600),
        width: jest.fn(() => 800),
        length: 1,
        get: jest.fn(),
        insertAdjacentHTML: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => [])
      };
      
      // Return different mocks based on selector
      if (selector === document) {
        return {
          ready: jest.fn((callback) => callback()),
          on: jest.fn()
        };
      }
      
      return mockJQuery;
    });
    
    // Extend $ with static methods
    global.$.post = jest.fn(() => ({
      done: jest.fn(() => ({ fail: jest.fn() })),
      fail: jest.fn()
    }));
    
    // Mock DOM elements
    mockProgressCircle = testUtils.createMockElement('circle', {
      className: 'progress-bar-circle'
    });
    
    mockProgressText = testUtils.createMockElement('text', {
      className: 'progress-text',
      textContent: '75.5%'
    });
    
    // Mock document.querySelector
    document.querySelector = jest.fn((selector) => {
      if (selector === '.progress-bar-circle') return mockProgressCircle;
      if (selector === '.progress-text') return mockProgressText;
      if (selector === '.dashboard-content .container') return testUtils.createMockElement('div');
      return null;
    });
    
    // Mock document.querySelectorAll
    document.querySelectorAll = jest.fn((selector) => {
      if (selector === '.week-indicator') return [
        testUtils.createMockElement('div'),
        testUtils.createMockElement('div'),
        testUtils.createMockElement('div')
      ];
      return [];
    });
    
    // Mock body class check
    document.body.classList.contains = jest.fn(() => true);
    
    // Load the dashboard script
    require('../../../assets/js/dashboard.js');
    
    // Get the dashboard instance
    dashboard = window.pmpDashboard;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Initialization', () => {
    test('should initialize dashboard when DOM is ready', () => {
      expect(dashboard).toBeDefined();
      expect(dashboard).toBeInstanceOf(window.PMPDashboard);
    });
    
    test('should bind event handlers', () => {
      expect(global.$(document).on).toHaveBeenCalled();
    });
  });
  
  describe('Progress Circle Animation', () => {
    test('should animate progress circle to target percentage', () => {
      dashboard.animateProgressCircle();
      
      expect(mockProgressCircle.style.transition).toContain('stroke-dashoffset');
      expect(mockProgressCircle.style.strokeDashoffset).toBeDefined();
    });
    
    test('should animate progress counter', () => {
      const startValue = 0;
      const endValue = 75.5;
      const duration = 1000;
      
      dashboard.animateProgressCounter(startValue, endValue, duration);
      
      // Should start animation
      expect(requestAnimationFrame).toHaveBeenCalled();
    });
    
    test('should use easing function for smooth animation', () => {
      const result = dashboard.easeOutCubic(0.5);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
      expect(typeof result).toBe('number');
    });
  });
  
  describe('Dashboard Data Loading', () => {
    test('should load dashboard data successfully', async () => {
      const mockData = {
        progress: { percentage: 75.5, completed: 34, total: 91 },
        next_lesson: { title: 'Test Lesson', url: '/lesson/test' },
        recent_activity: [{ title: 'Completed lesson', timestamp: '2 hours ago' }]
      };
      
      testUtils.mockAjaxSuccess(mockData);
      
      await dashboard.loadDashboardData();
      
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
    
    test('should handle dashboard data loading errors', async () => {
      testUtils.mockAjaxError('Network error');
      
      await dashboard.loadDashboardData();
      
      expect(console.error).toHaveBeenCalledWith(
        'Dashboard data loading error:',
        expect.any(Error)
      );
    });
    
    test('should show cached data warning on error', () => {
      dashboard.showCachedDataWarning();
      
      const container = document.querySelector('.dashboard-content .container');
      expect(container.insertAdjacentHTML).toHaveBeenCalledWith(
        'afterbegin',
        expect.stringContaining('cached-data-warning')
      );
    });
  });
  
  describe('Progress Updates', () => {
    test('should update progress statistics', () => {
      const progressData = {
        percentage: 80.0,
        completed: 36,
        total: 91,
        current_week: 6
      };
      
      const mockCompletedStat = testUtils.createMockElement('h6', {
        className: 'stat-number text-success',
        textContent: '34'
      });
      
      const mockRemainingStat = testUtils.createMockElement('h6', {
        className: 'stat-number text-primary',
        textContent: '57'
      });
      
      document.querySelector = jest.fn((selector) => {
        if (selector === '.progress-text') return mockProgressText;
        if (selector === '.stat-number.text-success') return mockCompletedStat;
        if (selector === '.stat-number.text-primary') return mockRemainingStat;
        if (selector === '.progress-bar-circle') return mockProgressCircle;
        return null;
      });
      
      dashboard.updateProgressStats(progressData);
      
      expect(mockProgressCircle.style.transition).toContain('stroke-dashoffset');
    });
    
    test('should animate stat counters', () => {
      const mockElement = testUtils.createMockElement('span', { textContent: '30' });
      
      dashboard.animateStatCounter(mockElement, 30, 35, 1000);
      
      expect(requestAnimationFrame).toHaveBeenCalled();
    });
    
    test('should update weekly progress indicators', () => {
      const mockIndicators = [
        testUtils.createMockElement('div'),
        testUtils.createMockElement('div'),
        testUtils.createMockElement('div')
      ];
      
      document.querySelectorAll = jest.fn(() => mockIndicators);
      
      dashboard.updateWeeklyProgress(2);
      
      // Should add completed class to first 2 indicators
      setTimeout(() => {
        expect(mockIndicators[0].classList.add).toHaveBeenCalledWith('completed');
        expect(mockIndicators[1].classList.add).toHaveBeenCalledWith('completed');
      }, 300);
    });
  });
  
  describe('User Interactions', () => {
    test('should handle continue learning button click', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        currentTarget: { href: '/lesson/next-lesson' }
      };
      
      // Mock window.location
      delete window.location;
      window.location = { href: '' };
      
      dashboard.handleContinueLearning(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(window.location.href).toBe('/lesson/next-lesson');
    });
    
    test('should handle quick action buttons', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        currentTarget: { dataset: { action: 'study_guide' } }
      };
      
      delete window.location;
      window.location = { href: '' };
      
      dashboard.handleQuickAction(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(window.location.href).toBe('/study-guide/');
    });
    
    test('should handle activity item clicks', () => {
      const mockActivityTitle = testUtils.createMockElement('p', {
        className: 'activity-title',
        textContent: 'Test Activity'
      });
      
      const mockEvent = {
        currentTarget: {
          querySelector: jest.fn(() => mockActivityTitle),
          classList: {
            add: jest.fn(),
            remove: jest.fn()
          }
        }
      };
      
      dashboard.handleActivityClick(mockEvent);
      
      expect(mockEvent.currentTarget.classList.add).toHaveBeenCalledWith('activity-clicked');
    });
    
    test('should handle progress hover effects', () => {
      const mockContainer = testUtils.createMockElement('div');
      const mockEvent = { currentTarget: mockContainer };
      
      dashboard.handleProgressHover(mockEvent);
      
      expect(mockContainer.classList.add).toHaveBeenCalledWith('progress-hover');
    });
  });
  
  describe('Content Updates', () => {
    test('should update next lesson content', () => {
      const lessonData = {
        title: 'New Lesson Title',
        description: 'New lesson description',
        thumbnail: '/images/new-lesson.jpg',
        url: '/lesson/new-lesson'
      };
      
      const mockTitle = testUtils.createMockElement('h4', { className: 'lesson-title' });
      const mockDescription = testUtils.createMockElement('p', { className: 'lesson-description' });
      const mockThumbnail = testUtils.createMockElement('img');
      const mockButton = testUtils.createMockElement('a', { className: 'btn btn-primary' });
      
      document.querySelector = jest.fn((selector) => {
        if (selector === '.lesson-title') return mockTitle;
        if (selector === '.lesson-description') return mockDescription;
        if (selector === '.lesson-thumbnail img') return mockThumbnail;
        if (selector === '.btn-primary') return mockButton;
        return null;
      });
      
      dashboard.updateNextLesson(lessonData);
      
      expect(mockTitle.textContent).toBe('New Lesson Title');
      expect(mockDescription.textContent).toBe('New lesson description');
      expect(mockThumbnail.src).toBe('/images/new-lesson.jpg');
      expect(mockButton.href).toBe('/lesson/new-lesson');
    });
    
    test('should update recent activity list', () => {
      const activities = [
        { title: 'Completed Lesson 1', timestamp: '2 hours ago' },
        { title: 'Started Lesson 2', timestamp: '1 hour ago' }
      ];
      
      const mockContainer = testUtils.createMockElement('div', { className: 'activity-timeline' });
      document.querySelector = jest.fn(() => mockContainer);
      
      dashboard.updateRecentActivity(activities);
      
      expect(mockContainer.innerHTML).toContain('Completed Lesson 1');
      expect(mockContainer.innerHTML).toContain('Started Lesson 2');
    });
    
    test('should handle empty activity list', () => {
      const mockContainer = testUtils.createMockElement('div', { className: 'activity-timeline' });
      document.querySelector = jest.fn(() => mockContainer);
      
      dashboard.updateRecentActivity([]);
      
      expect(mockContainer.innerHTML).toContain('No recent activity');
    });
  });
  
  describe('Progress Tooltips', () => {
    test('should show progress tooltip on hover', () => {
      const mockContainer = testUtils.createMockElement('div');
      
      dashboard.showProgressTooltip(mockContainer);
      
      expect(mockContainer.appendChild).toHaveBeenCalled();
    });
    
    test('should hide progress tooltip', () => {
      const mockTooltip = testUtils.createMockElement('div', { className: 'progress-tooltip' });
      document.querySelector = jest.fn(() => mockTooltip);
      
      dashboard.hideProgressTooltip();
      
      expect(mockTooltip.classList.remove).toHaveBeenCalledWith('show');
    });
  });
  
  describe('User Action Tracking', () => {
    test('should track user actions via AJAX', async () => {
      testUtils.mockAjaxSuccess();
      
      await dashboard.trackUserAction('test_action', { test: 'data' });
      
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
    
    test('should handle tracking errors gracefully', async () => {
      testUtils.mockAjaxError('Tracking failed');
      
      await dashboard.trackUserAction('test_action', {});
      
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to track user action:',
        expect.any(Error)
      );
    });
  });
  
  describe('Auto Refresh', () => {
    test('should set up auto refresh interval', () => {
      jest.spyOn(global, 'setInterval');
      
      dashboard.setupAutoRefresh();
      
      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        5 * 60 * 1000 // 5 minutes
      );
    });
  });
  
  describe('Public API Methods', () => {
    test('should update progress via public method', () => {
      const progressData = {
        percentage: 85.0,
        completed: 38,
        current_week: 7
      };
      
      jest.spyOn(dashboard, 'updateProgressStats');
      jest.spyOn(dashboard, 'animateProgressCircle');
      jest.spyOn(dashboard, 'updateWeeklyProgress');
      
      dashboard.updateProgress(progressData);
      
      expect(dashboard.updateProgressStats).toHaveBeenCalledWith(progressData);
      expect(dashboard.animateProgressCircle).toHaveBeenCalled();
      expect(dashboard.updateWeeklyProgress).toHaveBeenCalledWith(7);
    });
    
    test('should add new activity via public method', () => {
      const mockContainer = testUtils.createMockElement('div', { className: 'activity-timeline' });
      document.querySelector = jest.fn(() => mockContainer);
      
      const newActivity = {
        title: 'New Activity',
        timestamp: 'Just now'
      };
      
      dashboard.addActivity(newActivity);
      
      expect(mockContainer.insertAdjacentHTML).toHaveBeenCalledWith(
        'afterbegin',
        expect.stringContaining('New Activity')
      );
    });
  });
  
  describe('Loading States', () => {
    test('should show progress loading state', () => {
      const mockContainer = testUtils.createMockElement('div', { className: 'progress-circle-container' });
      document.querySelector = jest.fn(() => mockContainer);
      
      dashboard.showProgressLoading();
      
      expect(mockContainer.classList.add).toHaveBeenCalledWith('loading');
    });
    
    test('should hide progress loading state', () => {
      const mockContainer = testUtils.createMockElement('div', { className: 'progress-circle-container' });
      document.querySelector = jest.fn(() => mockContainer);
      
      dashboard.hideProgressLoading();
      
      expect(mockContainer.classList.remove).toHaveBeenCalledWith('loading');
      expect(mockContainer.classList.add).toHaveBeenCalledWith('updated');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle missing DOM elements gracefully', () => {
      document.querySelector = jest.fn(() => null);
      
      expect(() => {
        dashboard.updateProgressStats({ percentage: 50 });
      }).not.toThrow();
    });
    
    test('should handle AJAX request failures', async () => {
      const mockFormData = new FormData();
      global.FormData = jest.fn(() => mockFormData);
      mockFormData.append = jest.fn();
      
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(dashboard.makeAjaxRequest('test_action', {})).rejects.toThrow('Network error');
    });
  });
  
  describe('Performance', () => {
    test('should complete initialization quickly', () => {
      const startTime = performance.now();
      
      new window.PMPDashboard();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(50);
    });
    
    test('should animate progress efficiently', () => {
      const startTime = performance.now();
      
      dashboard.animateProgressCircle();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(10);
    });
  });
});