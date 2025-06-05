import { LitElement, html, css } from 'lit';
import { getLocale, setLocale } from '../localization.js';

export class LangSelector extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      user-select: none;
    }

    button {
      display: flex;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
    }
    
    .flag {
      width: 24px;
      height: 18px;
      border: 1px solid #ccc;
      border-radius: 3px;
    }
  `;

  static properties = {
    currentLocale: { type: String },
  };

  constructor() {
    super();
    this.currentLocale = getLocale();
  }

  async toggleLanguage() {
    const newLocale = this.currentLocale === 'en' ? 'tr' : 'en';
    await setLocale(newLocale);
    this.currentLocale = newLocale;
  }

  render() {
    return html`
      <button @click=${this.toggleLanguage} title="Change Language">
        <img
          class="flag"
          src="dist/assets/flag_${this.currentLocale}.png"
          alt=${this.currentLocale}
        />
      </button>
    `;
  }
}

customElements.define('lang-selector', LangSelector);
