import { LitElement, html, css } from 'lit';
import { msg as defaultMsg } from '../localization.js';

export class FooterBar extends LitElement {
  static properties = {
    msg: { type: Function }
  };

  constructor() {
    super();
    this.msg = defaultMsg;
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
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 8px 16px;
      background-color: var(--secondary-color);
      border-top: 1px solid var(--border-color);
    }

    footer {
      text-align: center;
    }
  `;

  render() {
    return html`
      <footer>&copy; ${new Date().getFullYear()} ${this.msg('Employee Management App. All rights reserved.')}</footer>
    `;
  }
}

customElements.define('footer-bar', FooterBar);
