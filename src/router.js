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

    router.setRoutes([
      { 
        path: '/', 
        component: 'employee-list',
        action: async () => {
          if (currentRoute !== '/') {
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
            currentRoute = '/employees';
            document.title = 'Employee Management | Employees';
          }
        }
      },
      { 
        path: '/employees/add', 
        component: 'employee-form',
        action: async () => {
          if (currentRoute !== '/employees/add') {
            currentRoute = '/employees/add';
            document.title = 'Employee Management | Add Employee';
          }
        }
      },
      { 
        path: '/employees/edit/:id', 
        component: 'employee-form',
        action: async (context) => {
          const newRoute = `/employees/edit/${context.params.id}`;
          if (currentRoute !== newRoute) {
            currentRoute = newRoute;
            document.title = 'Employee Management | Edit Employee';
          }
        }
      },
      { path: '(.*)', redirect: '/' }
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
