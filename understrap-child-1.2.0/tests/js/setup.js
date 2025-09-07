/**
 * Jest setup file for PMP WordPress Frontend JavaScript tests
 */

// Mock jQuery
global.$ = global.jQuery = {
  ready: jest.fn((callback) => callback()),
  on: jest.fn(),
  off: jest.fn(),
  find: jest.fn(() => global.$),
  addClass: jest.fn(() => global.$),
  removeClass: jest.fn(() => global.$),
  hasClass: jest.fn(() => false),
  attr: jest.fn(),
  removeAttr: jest.fn(),
  data: jest.fn(),
  text: jest.fn(),
  html: jest.fn(),
  val: jest.fn(),
  prop: jest.fn(),
  css: jest.fn(),
  animate: jest.fn(),
  fadeIn: jest.fn(),
  fadeOut: jest.fn(),
  show: jest.fn(),
  hide: jest.fn(),
  append: jest.fn(),
  prepend: jest.fn(),
  remove: jest.fn(),
  empty: jest.fn(),
  click: jest.fn(),
  focus: jest.fn(),
  blur: jest.fn(),
  submit: jest.fn(),
  post: jest.fn(() => ({
    done: jest.fn(() => ({ fail: jest.fn() })),
    fail: jest.fn()
  })),
  each: jest.fn(),
  map: jest.fn(),
  filter: jest.fn(),
  closest: jest.fn(() => global.$),
  parent: jest.fn(() => global.$),
  children: jest.fn(() => global.$),
  siblings: jest.fn(() => global.$),
  next: jest.fn(() => global.$),
  prev: jest.fn(() => global.$),
  first: jest.fn(() => global.$),
  last: jest.fn(() => global.$),
  eq: jest.fn(() => global.$),
  get: jest.fn(),
  length: 0,
  offset: jest.fn(() => ({ top: 0, left: 0 })),
  position: jest.fn(() => ({ top: 0, left: 0 })),
  width: jest.fn(),
  height: jest.fn(),
  scrollTop: jest.fn(),
  scrollLeft: jest.fn(),
  insertAdjacentHTML: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  contains: jest.fn(() => false),
  getBoundingClientRect: jest.fn(() => ({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0
  })),
  scrollTo: jest.fn(),
  scrollIntoView: jest.fn()
};

// Mock DOM methods for jQuery objects
global.$.fn = {
  ready: global.$.ready,
  on: global.$.on,
  off: global.$.off,
  find: global.$.find,
  addClass: global.$.addClass,
  removeClass: global.$.removeClass,
  hasClass: global.$.hasClass,
  attr: global.$.attr,
  removeAttr: global.$.removeAttr,
  data: global.$.data,
  text: global.$.text,
  html: global.$.html,
  val: global.$.val,
  prop: global.$.prop,
  css: global.$.css,
  animate: global.$.animate,
  fadeIn: global.$.fadeIn,
  fadeOut: global.$.fadeOut,
  show: global.$.show,
  hide: global.$.hide,
  append: global.$.append,
  prepend: global.$.prepend,
  remove: global.$.remove,
  empty: global.$.empty,
  click: global.$.click,
  focus: global.$.focus,
  blur: global.$.blur,
  submit: global.$.submit,
  each: global.$.each,
  map: global.$.map,
  filter: global.$.filter,
  closest: global.$.closest,
  parent: global.$.parent,
  children: global.$.children,
  siblings: global.$.siblings,
  next: global.$.next,
  prev: global.$.prev,
  first: global.$.first,
  last: global.$.last,
  eq: global.$.eq,
  get: global.$.get,
  offset: global.$.offset,
  position: global.$.position,
  width: global.$.width,
  height: global.$.height,
  scrollTop: global.$.scrollTop,
  scrollLeft: global.$.scrollLeft
};

// Mock window object
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com',
    pathname: '/lesson/test-lesson',
    search: '',
    hash: '',
    origin: 'https://example.com'
  },
  writable: true
});

Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  writable: true
});

Object.defineProperty(window, 'innerHeight', {
  value: 768,
  writable: true
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  }
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16);
});

global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true, data: {} }),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob())
  })
);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock WordPress AJAX data
global.pmpData = {
  ajaxUrl: '/wp-admin/admin-ajax.php',
  nonce: 'test-nonce-12345',
  userId: 1
};

// Mock WordPress functions
global.wp = {
  ajax: {
    post: jest.fn(() => Promise.resolve({ success: true }))
  }
};

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock MutationObserver
global.MutationObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => [])
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: jest.fn(() => ({
    getPropertyValue: jest.fn(() => ''),
    width: '0px',
    height: '0px',
    display: 'block',
    opacity: '1',
    transform: 'none'
  }))
});

// Mock document methods
Object.defineProperty(document, 'visibilityState', {
  value: 'visible',
  writable: true
});

// Mock createElement to return elements with basic properties
const originalCreateElement = document.createElement;
document.createElement = jest.fn((tagName) => {
  const element = originalCreateElement.call(document, tagName);
  
  // Add common properties and methods
  element.style = {};
  element.classList = {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(() => false),
    toggle: jest.fn()
  };
  element.setAttribute = jest.fn();
  element.getAttribute = jest.fn();
  element.removeAttribute = jest.fn();
  element.addEventListener = jest.fn();
  element.removeEventListener = jest.fn();
  element.dispatchEvent = jest.fn();
  element.focus = jest.fn();
  element.blur = jest.fn();
  element.click = jest.fn();
  element.scrollIntoView = jest.fn();
  element.getBoundingClientRect = jest.fn(() => ({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0
  }));
  
  return element;
});

// Mock querySelector and querySelectorAll
document.querySelector = jest.fn();
document.querySelectorAll = jest.fn(() => []);
document.getElementById = jest.fn();
document.getElementsByClassName = jest.fn(() => []);
document.getElementsByTagName = jest.fn(() => []);

// Mock body with common properties
Object.defineProperty(document, 'body', {
  value: {
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(() => false),
      toggle: jest.fn()
    },
    style: {},
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    insertBefore: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dataset: {},
    getAttribute: jest.fn(),
    setAttribute: jest.fn()
  },
  writable: true
});

// Setup DOM testing utilities
export const createMockElement = (tagName = 'div', attributes = {}) => {
  const element = document.createElement(tagName);
  
  Object.keys(attributes).forEach(key => {
    if (key === 'className') {
      element.className = attributes[key];
    } else if (key === 'innerHTML') {
      element.innerHTML = attributes[key];
    } else if (key === 'textContent') {
      element.textContent = attributes[key];
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });
  
  return element;
};

export const createMockEvent = (type, properties = {}) => {
  const event = new Event(type);
  Object.assign(event, properties);
  return event;
};

export const mockQuerySelector = (selector, element = null) => {
  document.querySelector.mockImplementation((sel) => {
    if (sel === selector) {
      return element;
    }
    return null;
  });
};

export const mockQuerySelectorAll = (selector, elements = []) => {
  document.querySelectorAll.mockImplementation((sel) => {
    if (sel === selector) {
      return elements;
    }
    return [];
  });
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  
  // Reset fetch
  fetch.mockClear();
  
  // Reset DOM mocks
  document.querySelector.mockReturnValue(null);
  document.querySelectorAll.mockReturnValue([]);
  
  // Reset window properties
  window.innerWidth = 1024;
  window.innerHeight = 768;
  document.visibilityState = 'visible';
});

// Global test utilities
global.testUtils = {
  createMockElement,
  createMockEvent,
  mockQuerySelector,
  mockQuerySelectorAll,
  
  // Wait for async operations
  waitFor: (callback, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        try {
          const result = callback();
          if (result) {
            resolve(result);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout waiting for condition'));
          } else {
            setTimeout(check, 10);
          }
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(error);
          } else {
            setTimeout(check, 10);
          }
        }
      };
      
      check();
    });
  },
  
  // Simulate user interactions
  simulateClick: (element) => {
    const event = createMockEvent('click', { target: element });
    element.click();
    return event;
  },
  
  simulateKeydown: (element, key) => {
    const event = createMockEvent('keydown', { key, target: element });
    element.dispatchEvent(event);
    return event;
  },
  
  // Mock AJAX responses
  mockAjaxSuccess: (data = {}) => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data })
    });
  },
  
  mockAjaxError: (error = 'Network error') => {
    fetch.mockRejectedValueOnce(new Error(error));
  }
};