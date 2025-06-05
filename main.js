import './src/layouts/app-layout.js';
import { initRouter } from './src/router.js';

function handleInitialLoad() {
  if (window.location.pathname === '/') {
    window.history.replaceState({}, '', '/employees');
  }
}

async function startApp() {
  handleInitialLoad();
  
  const appLayout = document.querySelector('app-layout');
  
  await customElements.whenDefined('app-layout');
  
  if (appLayout.outlet) {
    const router = initRouter(appLayout.outlet);
    
    router.render(window.location.pathname);
  } else {
    console.error('Outlet not found in app-layout');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
