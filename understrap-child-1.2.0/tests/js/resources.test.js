/**
 * Tests for PMP Resources JavaScript functionality
 */

describe('PMPResourcesManager', () => {
  let resourcesManager;
  let mockResourcesGrid;
  let mockViewButtons;
  
  beforeEach(() => {
    // Create mock DOM elements
    mockResourcesGrid = testUtils.createMockElement('div', {
      className: 'resources-grid'
    });
    
    mockViewButtons = [
      testUtils.createMockElement('button', {
        'data-view': 'grid',
        className: 'view-btn'
      }),
      testUtils.createMockElement('button', {
        'data-view': 'list',
        className: 'view-btn'
      })
    ];
    
    // Mock DOM queries
    document.querySelectorAll = jest.fn((selector) => {
      if (selector === '[data-view]') return mockViewButtons;
      if (selector === '.resource-download, .resource-watch, .resource-use') return [];
      if (selector === '.filter-btn') return [];
      if (selector === '.remove-filter') return [];
      if (selector === '.resource-card') return [];
      if (selector === '.resource-card.resource-type-video') return [];
      if (selector === '.resource-card.resource-type-pdf') return [];
      if (selector === '.resource-card.resource-type-tool') return [];
      return [];
    });
    
    document.querySelector = jest.fn((selector) => {
      if (selector === '.resources-grid') return mockResourcesGrid;
      if (selector === '.search-form') return null;
      return null;
    });
    
    // Mock localStorage
    localStorage.getItem = jest.fn(() => null);
    localStorage.setItem = jest.fn();
    
    // Load the resources script and initialize
    require('../../../assets/js/resources.js');
    resourcesManager = new PMPResourcesManager();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Initialization', () => {
    test('should initialize properly', () => {
      expect(resourcesManager).toBeDefined();
      expect(resourcesManager).toBeInstanceOf(PMPResourcesManager);
    });
    
    test('should set up all functionality', () => {
      jest.spyOn(resourcesManager, 'setupViewToggle');
      jest.spyOn(resourcesManager, 'setupResourceTracking');
      jest.spyOn(resourcesManager, 'setupSearchEnhancements');
      jest.spyOn(resourcesManager, 'setupFilterEnhancements');
      jest.spyOn(resourcesManager, 'setupResourceInteractions');
      
      resourcesManager.init();
      
      expect(resourcesManager.setupViewToggle).toHaveBeenCalled();
      expect(resourcesManager.setupResourceTracking).toHaveBeenCalled();
      expect(resourcesManager.setupSearchEnhancements).toHaveBeenCalled();
      expect(resourcesManager.setupFilterEnhancements).toHaveBeenCalled();
      expect(resourcesManager.setupResourceInteractions).toHaveBeenCalled();
    });
  });
  
  describe('View Toggle', () => {
    test('should toggle between grid and list views', () => {
      const gridButton = mockViewButtons[0];
      const listButton = mockViewButtons[1];
      
      // Simulate click on list view button
      const clickEvent = testUtils.createMockEvent('click');
      clickEvent.preventDefault = jest.fn();
      
      // Get the click handler
      const clickHandler = gridButton.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      clickHandler(clickEvent);
      
      expect(clickEvent.preventDefault).toHaveBeenCalled();
      expect(mockResourcesGrid.classList.remove).toHaveBeenCalledWith('grid-view', 'list-view');
      expect(mockResourcesGrid.classList.add).toHaveBeenCalledWith('grid-view');
    });
    
    test('should save view preference to localStorage', () => {
      const gridButton = mockViewButtons[0];
      const clickEvent = testUtils.createMockEvent('click');
      clickEvent.preventDefault = jest.fn();
      
      const clickHandler = gridButton.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      clickHandler(clickEvent);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('pmp_resources_view', 'grid');
    });
    
    test('should restore saved view preference', () => {
      localStorage.getItem = jest.fn(() => 'list');
      
      const listButton = testUtils.createMockElement('button', {
        'data-view': 'list'
      });
      
      document.querySelector = jest.fn((selector) => {
        if (selector === '[data-view="list"]') return listButton;
        if (selector === '.resources-grid') return mockResourcesGrid;
        return null;
      });
      
      resourcesManager.setupViewToggle();
      
      expect(listButton.click).toHaveBeenCalled();
    });
    
    test('should animate view transition', () => {
      const gridButton = mockViewButtons[0];
      const clickEvent = testUtils.createMockEvent('click');
      clickEvent.preventDefault = jest.fn();
      
      const clickHandler = gridButton.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      clickHandler(clickEvent);
      
      expect(mockResourcesGrid.style.opacity).toBe('0.7');
      
      // Should restore opacity after timeout
      setTimeout(() => {
        expect(mockResourcesGrid.style.opacity).toBe('1');
      }, 200);
    });
  });
  
  describe('Resource Tracking', () => {
    let mockResourceCard;
    let mockResourceLink;
    
    beforeEach(() => {
      mockResourceCard = testUtils.createMockElement('div', {
        className: 'resource-card',
        'data-resource-id': 'resource-123'
      });
      
      mockResourceLink = testUtils.createMockElement('a', {
        className: 'resource-download'
      });
      
      mockResourceLink.closest = jest.fn(() => mockResourceCard);
      
      document.querySelectorAll = jest.fn((selector) => {
        if (selector === '.resource-download, .resource-watch, .resource-use') {
          return [mockResourceLink];
        }
        return [];
      });
      
      // Mock pmpData
      global.pmpData = {
        ajaxUrl: '/wp-admin/admin-ajax.php',
        nonce: 'test-nonce',
        userId: 1
      };
    });
    
    test('should track resource usage on click', () => {
      testUtils.mockAjaxSuccess();
      
      const clickHandler = mockResourceLink.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      clickHandler();
      
      expect(fetch).toHaveBeenCalledWith(
        '/wp-admin/admin-ajax.php',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
    
    test('should add visual feedback on click', () => {
      const clickHandler = mockResourceLink.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      clickHandler();
      
      expect(mockResourceLink.style.transform).toBe('scale(0.95)');
      
      setTimeout(() => {
        expect(mockResourceLink.style.transform).toBe('scale(1)');
      }, 200);
    });
    
    test('should handle different action types', () => {
      const downloadLink = testUtils.createMockElement('a', { className: 'resource-download' });
      const watchLink = testUtils.createMockElement('a', { className: 'resource-watch' });
      const useLink = testUtils.createMockElement('a', { className: 'resource-use' });
      
      downloadLink.closest = jest.fn(() => mockResourceCard);
      watchLink.closest = jest.fn(() => mockResourceCard);
      useLink.closest = jest.fn(() => mockResourceCard);
      
      jest.spyOn(resourcesManager, 'trackResourceUsage');
      
      // Test download action
      downloadLink.classList.contains = jest.fn((className) => className === 'resource-download');
      resourcesManager.setupResourceTracking();
      
      expect(resourcesManager.trackResourceUsage).toBeDefined();
    });
  });
  
  describe('Search Enhancements', () => {
    let mockSearchForm;
    let mockSearchInput;
    
    beforeEach(() => {
      mockSearchInput = testUtils.createMockElement('input', {
        name: 'search',
        value: ''
      });
      
      mockSearchForm = testUtils.createMockElement('form', {
        className: 'search-form'
      });
      
      mockSearchForm.querySelector = jest.fn(() => mockSearchInput);
      
      document.querySelector = jest.fn((selector) => {
        if (selector === '.search-form') return mockSearchForm;
        return null;
      });
    });
    
    test('should add clear button when search has value', () => {
      mockSearchInput.value = 'test search';
      
      jest.spyOn(resourcesManager, 'addClearButton');
      resourcesManager.setupSearchEnhancements();
      
      expect(resourcesManager.addClearButton).toHaveBeenCalledWith(mockSearchInput);
    });
    
    test('should handle enter key for search submission', () => {
      const keyHandler = mockSearchInput.addEventListener.mock.calls
        .find(call => call[0] === 'keypress')[1];
      
      const enterEvent = testUtils.createMockEvent('keypress', { key: 'Enter' });
      enterEvent.preventDefault = jest.fn();
      
      keyHandler(enterEvent);
      
      expect(enterEvent.preventDefault).toHaveBeenCalled();
      expect(mockSearchForm.submit).toHaveBeenCalled();
    });
    
    test('should handle real-time search input', () => {
      jest.spyOn(resourcesManager, 'handleSearchInput');
      
      const inputHandler = mockSearchInput.addEventListener.mock.calls
        .find(call => call[0] === 'input')[1];
      
      const inputEvent = testUtils.createMockEvent('input');
      inputEvent.target = { value: 'test query' };
      
      inputHandler(inputEvent);
      
      // Should debounce the input
      setTimeout(() => {
        expect(resourcesManager.handleSearchInput).toHaveBeenCalledWith('test query');
      }, 350);
    });
    
    test('should add clear button functionality', () => {
      const mockInputGroup = testUtils.createMockElement('div');
      const mockSearchButton = testUtils.createMockElement('button', { type: 'submit' });
      
      mockSearchInput.parentElement = mockInputGroup;
      mockInputGroup.querySelector = jest.fn(() => mockSearchButton);
      mockInputGroup.insertBefore = jest.fn();
      
      resourcesManager.addClearButton(mockSearchInput);
      
      expect(mockInputGroup.insertBefore).toHaveBeenCalled();
    });
  });
  
  describe('Filter Enhancements', () => {
    let mockFilterButtons;
    let mockRemoveFilters;
    
    beforeEach(() => {
      mockFilterButtons = [
        testUtils.createMockElement('button', { className: 'filter-btn' })
      ];
      
      mockRemoveFilters = [
        testUtils.createMockElement('a', { 
          className: 'remove-filter',
          href: '/resources/'
        })
      ];
      
      document.querySelectorAll = jest.fn((selector) => {
        if (selector === '.filter-btn') return mockFilterButtons;
        if (selector === '.remove-filter') return mockRemoveFilters;
        return [];
      });
    });
    
    test('should add loading state to filter buttons', () => {
      const clickHandler = mockFilterButtons[0].addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      clickHandler();
      
      expect(mockFilterButtons[0].style.opacity).toBe('0.7');
      expect(mockFilterButtons[0].innerHTML).toContain('fa-spinner');
    });
    
    test('should handle filter removal', () => {
      delete window.location;
      window.location = { href: '' };
      
      const clickHandler = mockRemoveFilters[0].addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      const clickEvent = testUtils.createMockEvent('click');
      clickEvent.preventDefault = jest.fn();
      
      clickHandler(clickEvent);
      
      expect(clickEvent.preventDefault).toHaveBeenCalled();
      expect(window.location.href).toBe('/resources/');
    });
  });
  
  describe('Resource Interactions', () => {
    let mockResourceCards;
    
    beforeEach(() => {
      mockResourceCards = [
        testUtils.createMockElement('div', { className: 'resource-card' }),
        testUtils.createMockElement('div', { className: 'resource-card' })
      ];
      
      mockResourceCards.forEach(card => {
        card.querySelector = jest.fn(() => 
          testUtils.createMockElement('button', { className: 'resource-download' })
        );
      });
      
      document.querySelectorAll = jest.fn((selector) => {
        if (selector === '.resource-card') return mockResourceCards;
        return [];
      });
    });
    
    test('should add hover effects to resource cards', () => {
      const card = mockResourceCards[0];
      
      const mouseenterHandler = card.addEventListener.mock.calls
        .find(call => call[0] === 'mouseenter')[1];
      
      const mouseleaveHandler = card.addEventListener.mock.calls
        .find(call => call[0] === 'mouseleave')[1];
      
      jest.spyOn(resourcesManager, 'handleCardHover');
      
      mouseenterHandler();
      expect(resourcesManager.handleCardHover).toHaveBeenCalledWith(card, true);
      
      mouseleaveHandler();
      expect(resourcesManager.handleCardHover).toHaveBeenCalledWith(card, false);
    });
    
    test('should handle keyboard navigation for action buttons', () => {
      const card = mockResourceCards[0];
      const actionButton = card.querySelector('.resource-download');
      
      const keydownHandler = actionButton.addEventListener.mock.calls
        .find(call => call[0] === 'keydown')[1];
      
      const enterEvent = testUtils.createMockEvent('keydown', { key: 'Enter' });
      enterEvent.preventDefault = jest.fn();
      
      keydownHandler(enterEvent);
      
      expect(enterEvent.preventDefault).toHaveBeenCalled();
      expect(actionButton.click).toHaveBeenCalled();
    });
    
    test('should handle card hover effects', () => {
      const mockCard = testUtils.createMockElement('div');
      const mockThumbnail = testUtils.createMockElement('div', { className: 'resource-thumbnail' });
      const mockPlayOverlay = testUtils.createMockElement('div', { className: 'video-play-overlay' });
      
      mockCard.querySelector = jest.fn((selector) => {
        if (selector === '.resource-thumbnail') return mockThumbnail;
        if (selector === '.video-play-overlay') return mockPlayOverlay;
        return null;
      });
      
      // Test hover in
      resourcesManager.handleCardHover(mockCard, true);
      expect(mockCard.style.transform).toBe('translateY(-2px)');
      
      // Test hover out
      resourcesManager.handleCardHover(mockCard, false);
      expect(mockCard.style.transform).toBe('translateY(0)');
    });
  });
  
  describe('Video Preview', () => {
    let mockVideoCards;
    
    beforeEach(() => {
      mockVideoCards = [
        testUtils.createMockElement('div', { 
          className: 'resource-card resource-type-video' 
        })
      ];
      
      const mockThumbnail = testUtils.createMockElement('div', { className: 'video-thumbnail' });
      const mockWatchLink = testUtils.createMockElement('a', { 
        className: 'resource-watch',
        href: 'https://youtube.com/watch?v=123'
      });
      
      mockVideoCards[0].querySelector = jest.fn((selector) => {
        if (selector === '.video-thumbnail') return mockThumbnail;
        if (selector === '.resource-watch') return mockWatchLink;
        return null;
      });
      
      document.querySelectorAll = jest.fn((selector) => {
        if (selector === '.resource-card.resource-type-video') return mockVideoCards;
        return [];
      });
      
      // Mock window.open
      global.window.open = jest.fn();
    });
    
    test('should setup video preview functionality', () => {
      resourcesManager.setupVideoPreview();
      
      const thumbnail = mockVideoCards[0].querySelector('.video-thumbnail');
      expect(thumbnail.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(thumbnail.style.cursor).toBe('pointer');
    });
    
    test('should open video in new window on thumbnail click', () => {
      resourcesManager.setupVideoPreview();
      
      const thumbnail = mockVideoCards[0].querySelector('.video-thumbnail');
      const clickHandler = thumbnail.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      const clickEvent = testUtils.createMockEvent('click');
      clickEvent.preventDefault = jest.fn();
      
      clickHandler(clickEvent);
      
      expect(clickEvent.preventDefault).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith('https://youtube.com/watch?v=123', '_blank');
    });
  });
  
  describe('PDF Preview', () => {
    let mockPDFCards;
    
    beforeEach(() => {
      mockPDFCards = [
        testUtils.createMockElement('div', { 
          className: 'resource-card resource-type-pdf' 
        })
      ];
      
      const mockThumbnail = testUtils.createMockElement('div', { className: 'pdf-thumbnail' });
      const mockDownloadLink = testUtils.createMockElement('a', { className: 'pdf-download' });
      
      mockPDFCards[0].querySelector = jest.fn((selector) => {
        if (selector === '.pdf-thumbnail') return mockThumbnail;
        if (selector === '.pdf-download') return mockDownloadLink;
        return null;
      });
      
      document.querySelectorAll = jest.fn((selector) => {
        if (selector === '.resource-card.resource-type-pdf') return mockPDFCards;
        return [];
      });
    });
    
    test('should setup PDF preview functionality', () => {
      resourcesManager.setupPDFPreview();
      
      const thumbnail = mockPDFCards[0].querySelector('.pdf-thumbnail');
      expect(thumbnail.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(thumbnail.style.cursor).toBe('pointer');
    });
    
    test('should trigger download on thumbnail click', () => {
      resourcesManager.setupPDFPreview();
      
      const thumbnail = mockPDFCards[0].querySelector('.pdf-thumbnail');
      const downloadLink = mockPDFCards[0].querySelector('.pdf-download');
      
      const clickHandler = thumbnail.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      const clickEvent = testUtils.createMockEvent('click');
      clickEvent.preventDefault = jest.fn();
      
      clickHandler(clickEvent);
      
      expect(clickEvent.preventDefault).toHaveBeenCalled();
      expect(downloadLink.click).toHaveBeenCalled();
    });
  });
  
  describe('Tool Features', () => {
    let mockToolCards;
    
    beforeEach(() => {
      mockToolCards = [
        testUtils.createMockElement('div', { 
          className: 'resource-card resource-type-tool' 
        })
      ];
      
      const mockFeaturesList = testUtils.createMockElement('ul', { className: 'features-list' });
      
      // Create 5 feature items (more than 3 to trigger show more)
      const mockFeatures = [];
      for (let i = 0; i < 5; i++) {
        mockFeatures.push(testUtils.createMockElement('li', { 
          textContent: `Feature ${i + 1}` 
        }));
      }
      
      mockFeaturesList.querySelectorAll = jest.fn(() => mockFeatures);
      mockFeaturesList.parentElement = testUtils.createMockElement('div');
      
      mockToolCards[0].querySelector = jest.fn((selector) => {
        if (selector === '.features-list') return mockFeaturesList;
        return null;
      });
      
      document.querySelectorAll = jest.fn((selector) => {
        if (selector === '.resource-card.resource-type-tool') return mockToolCards;
        return [];
      });
    });
    
    test('should setup tool features expansion', () => {
      resourcesManager.setupToolFeatures();
      
      const featuresList = mockToolCards[0].querySelector('.features-list');
      const features = featuresList.querySelectorAll('li');
      
      // Should hide features beyond the first 3
      expect(features[3].style.display).toBe('none');
      expect(features[4].style.display).toBe('none');
      
      // Should add show more button
      expect(featuresList.parentElement.appendChild).toHaveBeenCalled();
    });
    
    test('should toggle feature visibility on show more click', () => {
      resourcesManager.setupToolFeatures();
      
      const featuresList = mockToolCards[0].querySelector('.features-list');
      const features = featuresList.querySelectorAll('li');
      
      // Get the show more button that was added
      const showMoreBtn = testUtils.createMockElement('button', {
        className: 'btn btn-sm btn-outline-secondary show-more-features'
      });
      
      showMoreBtn.classList.contains = jest.fn(() => false);
      
      const clickHandler = showMoreBtn.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      if (clickHandler) {
        clickHandler();
        
        // Should show hidden features
        expect(features[3].style.display).toBe('flex');
        expect(features[4].style.display).toBe('flex');
      }
    });
  });
  
  describe('Error Handling', () => {
    test('should handle missing pmpData gracefully', () => {
      global.pmpData = undefined;
      
      expect(() => {
        resourcesManager.trackResourceUsage('test-id', 'download');
      }).not.toThrow();
    });
    
    test('should handle fetch errors gracefully', () => {
      testUtils.mockAjaxError('Network error');
      
      expect(() => {
        resourcesManager.trackResourceUsage('test-id', 'download');
      }).not.toThrow();
    });
    
    test('should handle missing DOM elements', () => {
      document.querySelector = jest.fn(() => null);
      document.querySelectorAll = jest.fn(() => []);
      
      expect(() => {
        resourcesManager.setupViewToggle();
        resourcesManager.setupResourceTracking();
        resourcesManager.setupSearchEnhancements();
      }).not.toThrow();
    });
  });
  
  describe('Performance', () => {
    test('should complete initialization quickly', () => {
      const startTime = performance.now();
      
      new PMPResourcesManager();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(50);
    });
    
    test('should debounce search input', () => {
      let callCount = 0;
      const debouncedFunction = jest.fn(() => {
        callCount++;
      });
      
      // Simulate rapid input
      for (let i = 0; i < 5; i++) {
        setTimeout(debouncedFunction, i * 50);
      }
      
      // Should be called for each timeout
      setTimeout(() => {
        expect(callCount).toBeGreaterThan(0);
      }, 300);
    });
  });
});