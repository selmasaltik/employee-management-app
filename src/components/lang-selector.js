import { LitElement, html, css } from 'lit';
import { getLocale, setLocale, msg } from '../localization.js';

export class LangSelector extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      user-select: none;
    }

    button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .flag {
      width: 24px;
      height: 16px;
      border-radius: 2px;
      object-fit: cover;
    }
  `;

  static properties = {
    currentLocale: { type: String },
    isLoading: { type: Boolean, state: true }
  };

  constructor() {
    super();
    this.currentLocale = getLocale();
    this.isLoading = false;
    this._boundLocaleChange = this._handleLocaleChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('locale-changed', this._boundLocaleChange);
  }

  disconnectedCallback() {
    window.removeEventListener('locale-changed', this._boundLocaleChange);
    super.disconnectedCallback();
  }

  _handleLocaleChange() {
    this.currentLocale = getLocale();
  }

  async toggleLanguage() {
    if (this.isLoading) return;
    
    const newLocale = this.currentLocale === 'en' ? 'tr' : 'en';
    this.isLoading = true;
    
    try {
      await setLocale(newLocale);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    const languageName = this.currentLocale === 'en' ? msg('English') : msg('Turkish');
    const flagSrc = `/assets/flag_${this.currentLocale}.png`;
    
    return html`
      <button 
        @click=${this.toggleLanguage} 
        title=${languageName}
        ?disabled=${this.isLoading}
        aria-label=${msg('Change Language')}
      >
        <img
          class="flag"
          src=${flagSrc}
          alt=${languageName}
          aria-hidden="true"
        />
        ${this.isLoading ? html`<span>${msg('Loading...')}</span>` : ''}
      </button>
    `;
  }
}

customElements.define('lang-selector', LangSelector);
