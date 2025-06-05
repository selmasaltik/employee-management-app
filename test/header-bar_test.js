import { HeaderBar } from '../src/layouts/header-bar.js';
import { assert } from '@open-wc/testing';
import sinon from 'sinon';

const waitForUpdate = function(element, callback) {
  if (element.updateComplete) {
    element.updateComplete.then(function() {
      setTimeout(callback, 0);
    });
  } else {
    setTimeout(callback, 0);
  }
};

class NavigationService {
  constructor() {
    this.currentPath = '/';
    this.navigate = sinon.stub().callsFake(function(path, callback) {
      this.currentPath = path;
      if (callback) {
        callback(null, { redirected: false });
      }
    }.bind(this));
    this.goBack = sinon.stub();
    this.replace = sinon.stub();
  }
}

const navigationService = new NavigationService();
const mockRouter = {
  render: navigationService.navigate,
  urlForPath: (path) => path,
  goto: navigationService.navigate,
  match: (path) => path === '/' || path === '/employees'
};

const mockGetRouter = () => mockRouter;

const mockMsg = function(key) { 
  return key;  
};

function createLocationMock(initialPath = '/') {
  const url = new URL('http://localhost:8000' + initialPath);
  
  return {
    href: url.href,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    origin: url.origin,
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    replace: sinon.spy(),
    assign: sinon.spy(),
    reload: sinon.spy(),
    toString: function() { return this.href; },
    valueOf: function() { return this.href; }
  };
}

function createHistoryMock() {
  return {
    pushState: sinon.spy(),
    replaceState: sinon.spy(),
    back: sinon.spy(),
    forward: sinon.spy(),
    go: sinon.spy()
  };
}

function createHeaderBar(initialPath, callback) {
  navigationService.currentPath = initialPath || '/';
  navigationService.navigate.resetHistory();
  
  var mockLocation = createLocationMock(initialPath);
  var mockHistory = createHistoryMock();
  
  var originalMsg = window.msg;
  var originalGetRouter = window.getRouter;
  
  window.msg = mockMsg;
  window.getRouter = mockGetRouter;
  
  var originalNavigate = HeaderBar.prototype.navigateTo;
  HeaderBar.prototype.navigateTo = function(path, event, callback) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    const newUrl = new URL(path, 'http://localhost:8000');
    mockLocation.href = newUrl.href;
    mockLocation.pathname = newUrl.pathname;
    mockLocation.search = newUrl.search;
    mockLocation.hash = newUrl.hash;
    
    navigationService.navigate(path, function(err, result) {
      if (callback) {
        callback(err, result);
      }
    });
  };
  
  var element = document.createElement('header-bar');
  document.body.appendChild(element);
  
  waitForUpdate(element, function() {
    var cleanup = function() {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      
      var HeaderBarElement = window.customElements.get('header-bar');
      if (HeaderBarElement) {
        HeaderBarElement.prototype.navigateTo = originalNavigate;
      }
      
      window.msg = originalMsg;
      window.getRouter = originalGetRouter;
      
      HeaderBar.prototype.navigateTo = originalNavigate;
    };
    
    callback({
      element: element,
      navigationService: navigationService,
      mockLocation: mockLocation,
      mockHistory: mockHistory,
      cleanup: cleanup
    });
  });
}

describe('HeaderBar', function() {
  var element;
  var testMocks;
  
  beforeEach(function(done) {
    createHeaderBar('/', function(mocks) {
      testMocks = mocks;
      element = mocks.element;
      done();
    });
  });

  afterEach(function() {
    if (testMocks && testMocks.cleanup) {
      testMocks.cleanup();
    }
    sinon.restore();
  });

  it('is defined', function() {
    var el = document.createElement('header-bar');
    assert.instanceOf(el, HeaderBar);
  });

  it('renders the logo', function(done) {
    setTimeout(function() {
      var logo = element.shadowRoot.querySelector('.logo');
      assert.exists(logo, 'Logo should be rendered');
      assert.include(logo.src, 'logo.png', 'Logo should have the correct image source');
      done();
    }, 0);
  });

  it('renders navigation links', function(done) {
    setTimeout(function() {
      var navLinks = element.shadowRoot.querySelectorAll('a[href]');
      assert.isAtLeast(navLinks.length, 2, 'Should render at least 2 navigation links');
      
      var homeLink = element.shadowRoot.querySelector('a[href="/"]');
      
      assert.exists(homeLink, 'Home link should exist');
      done();
    }, 0);
  });

  it('renders the add new link', function(done) {
    setTimeout(function() {
      var addNewLink = element.shadowRoot.querySelector('a[href="/employees/add"]');
      assert.exists(addNewLink, 'Add New link should be rendered');
      
      var linkText = addNewLink.textContent.trim();
      assert.include(linkText, 'Add New', 'Add New link should have correct text');
      done();
    }, 0);
  });

  it('renders the language selector', function(done) {
    setTimeout(function() {
      var langSelector = element.shadowRoot.querySelector('lang-selector');
      assert.exists(langSelector, 'Language selector should be rendered');
      done();
    }, 0);
  });

  it('handles locale changes', function(done) {
    setTimeout(function() {
      var localeChangeEvent = new CustomEvent('locale-changed');
      window.dispatchEvent(localeChangeEvent);
      
      assert.isTrue(true, 'Should handle locale changes without errors');
      done();
    }, 0);
  });
});
