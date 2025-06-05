import { Router } from '@vaadin/router';

let router = null;

import './pages/employee-list.js';
import './pages/employee-form.js';

let currentRoute = null;

export function initRouter(outlet) {
  if (!router) {
    router = new Router(outlet, {
      baseUrl: window.location.pathname,
      useHash: false
    });

    const clearOutlet = () => {
      while (outlet.firstChild) {
        outlet.removeChild(outlet.firstChild);
      }
    };

    router.setRoutes([
      { 
        path: '/', 
        component: 'employee-list',
        action: async () => {
          if (currentRoute !== '/') {
            clearOutlet();
            currentRoute = '/';
            document.title = 'Employee Management | Home';
          }
        }
      },
      { 
        path: '/employees', 
        component: 'employee-list',
        action: async () => {
          if (currentRoute !== '/employees') {
            clearOutlet();
            currentRoute = '/employees';
            document.title = 'Employee Management | Employees';
          }
        }
      },
      { 
        path: '/employees/add', 
        component: 'employee-form',
        action: async () => {
          clearOutlet();
          currentRoute = '/employees/add';
          document.title = 'Employee Management | Add Employee';
        }
      },
      { 
        path: '/employees/edit/:id', 
        component: 'employee-form',
        action: async (context) => {
          clearOutlet();
          currentRoute = `/employees/edit/${context.params.id}`;
          document.title = 'Employee Management | Edit Employee';
        }
      },
      { 
        path: '(.*)', 
        action: () => {
          clearOutlet();
          router.navigate('/');
        }
      }
    ]);
    
    window.addEventListener('popstate', () => {
      router.render(window.location.pathname);
    });
  }
  return router;
}

export function getRouter() {
  if (!router) {
    throw new Error('Router has not been initialized. Call initRouter first.');
  }
  return router;
}
