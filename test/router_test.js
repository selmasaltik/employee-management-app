import sinon from 'sinon';
import { initRouter, getRouter } from '../src/router.js';

class MockRouter {
  constructor(outlet, options = {}) {
    this.outlet = outlet;
    this.options = options;
    this.routes = [];
  }

  setRoutes(routes) {
    this.routes = Array.isArray(routes) ? routes : [routes];
    return this;
  }

  render(path) {
    const route = this.routes.find(r => {
      if (r.path === path) return true;
      if (r.path.includes(':')) {
        const pathParts = path.split('/');
        const routeParts = r.path.split('/');
        if (pathParts.length !== routeParts.length) return false;
        return routeParts.every((part, i) => part.startsWith(':') ? true : part === pathParts[i]);
      }
      return false;
    });

    if (route && route.action) {
      const params = {};
      if (route.path.includes(':')) {
        const pathParts = path.split('/');
        const routeParts = route.path.split('/');
        routeParts.forEach((part, i) => {
          if (part.startsWith(':')) {
            params[part.slice(1)] = pathParts[i];
          }
        });
      }
      route.action({ params });
    }
  }
}

class EmployeeList extends HTMLElement {}
class EmployeeForm extends HTMLElement {}

if (!customElements.get('employee-list')) {
  customElements.define('employee-list', EmployeeList);
}
if (!customElements.get('employee-form')) {
  customElements.define('employee-form', EmployeeForm);
}

function describe(description, fn) {
  console.log(`\n${description}`);
  fn();
}

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
  } catch (error) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${error.message}`);
  }
}

describe('Router', () => {
  let router;
  let outlet;
  let originalVaadin;

  beforeEach(() => {
    outlet = document.createElement('div');
    document.body.appendChild(outlet);
    
    originalVaadin = window.Vaadin;
    
    window.Vaadin = { Router: MockRouter };
  });

  afterEach(() => {
    window.Vaadin = originalVaadin;
    document.body.removeChild(outlet);
  });

  describe('initRouter', () => {
    it('should create router instance', () => {
      router = initRouter(outlet);
      sinon.assert.match(router instanceof MockRouter, true);
      sinon.assert.match(router.outlet, outlet);
    });

    it('should create router only once', () => {
      const router1 = initRouter(outlet);
      const router2 = initRouter(outlet);
      sinon.assert.match(router1 === router2, true);
    });

    it('should configure correct routes', () => {
      router = initRouter(outlet);
      const paths = router.routes.map(r => r.path);
      const requiredPaths = ['/', '/employees', '/employees/add', '/employees/edit/:id', '(.*)'];
      
      requiredPaths.forEach(path => {
        sinon.assert.match(paths.includes(path), true, `Missing route: ${path}`);
      });
    });
  });

  describe('getRouter', () => {
    it('should return initialized router instance', () => {
      router = initRouter(outlet);
      const retrievedRouter = getRouter();
      sinon.assert.match(retrievedRouter === router, true);
    });

    it('should throw error if router not initialized', () => {
      router = null;
      const stub = sinon.stub(console, 'error');
      getRouter();
      sinon.assert.calledWithMatch(stub, 'Router has not been initialized');
      stub.restore();
    });
  });

  describe('Route Actions', () => {
    let titleSpy;

    beforeEach(() => {
      router = initRouter(outlet);
      titleSpy = sinon.spy(document, 'title', ['set']);
    });

    afterEach(() => {
      titleSpy.set.restore();
    });

    function testRouteTitle(path, expectedTitle) {
      router.render(path);
      sinon.assert.calledWith(titleSpy.set, expectedTitle);
    }

    it('should set correct title for home page', () => {
      testRouteTitle('/', 'Employee Management | Home');
    });

    it('should set correct title for employees page', () => {
      testRouteTitle('/employees', 'Employee Management | Employees');
    });

    it('should set correct title for add employee page', () => {
      testRouteTitle('/employees/add', 'Employee Management | Add Employee');
    });

    it('should set correct title for edit employee page', () => {
      testRouteTitle('/employees/edit/123', 'Employee Management | Edit Employee');
    });

    it('should redirect for unknown routes', () => {
      const renderSpy = sinon.spy(router, 'render');
      router.render('/nonexistent');
      sinon.assert.calledWith(renderSpy, '/');
      renderSpy.restore();
    });
  });

  describe('Popstate Event', () => {
    it('should call render on popstate event', () => {
      router = initRouter(outlet);
      const renderSpy = sinon.spy(router, 'render');
      
      const popStateEvent = new PopStateEvent('popstate');
      window.dispatchEvent(popStateEvent);
      
      sinon.assert.calledWith(renderSpy, window.location.pathname);
      renderSpy.restore();
    });
  });
});