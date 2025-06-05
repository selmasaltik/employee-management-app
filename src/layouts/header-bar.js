import { LitElement, html, css } from 'lit';
import { getRouter } from '../router.js';
import '../components/lang-selector.js';
import { msg } from '../localization.js';

export class HeaderBar extends LitElement {
  constructor() {
    super();
    this._onLocaleChanged = this._onLocaleChanged.bind(this);
  }

  _onLocaleChanged() {
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('locale-changed', this._onLocaleChanged);
  }

  disconnectedCallback() {
    window.removeEventListener('locale-changed', this._onLocaleChanged);
    super.disconnectedCallback();
  }
  
  static styles = css`
    :host {
      display: block;
      background-color: #fff;
      box-shadow: 0 0 10px -2px #d9d9d9;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 16px;
      height: 60px;
    }
    
    .left, .right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      color: var(--primary-color);
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.2s ease;
      position: relative;
      font-weight: 500;
    }
    
    .nav-item:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .add-button {
      color: var(--primary-color);
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
  `;

  async navigateTo(path, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (window.location.pathname === path) {
      return;
    }
    
    try {
      const router = getRouter();
      const result = await router.render(path);
      if (result && result.redirected) {
        window.history.pushState({}, '', result.redirectUrl);
      } else {
        window.history.pushState({}, '', path);
      }
      this.requestUpdate();
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = path;
    }
  }
  
  isActive(path) {
    return window.location.pathname === path || 
      (path !== '/' && window.location.pathname.startsWith(path + '/'));
  }

  render() {
    return html`
      <header>
        <div class="header-container">
          <div class="left">
            <a href="/" @click=${(e) => this.navigateTo('/', e)}>
              <img class="logo" src="dist/assets/logo.png" alt="${msg('Logo')}" />
            </a>
          </div>
          <div class="right">
            <a href="/employees" class="nav-item" 
              @click=${(e) => this.navigateTo('/employees', e)}>
              <img src="dist/assets/employee.png" alt="${msg('Employees')}" />
              ${msg('Employees')}
            </a>
            <a href="/employees/add" class="nav-item add-button" 
              @click=${(e) => this.navigateTo('/employees/add', e)}>
              <img src="dist/assets/plus.png" alt="${msg('Add New')}" />
              ${msg('Add New')}
            </a>
            <lang-selector></lang-selector>
          </div>
        </div>
      </header>
    `;
  }
}

customElements.define('header-bar', HeaderBar);