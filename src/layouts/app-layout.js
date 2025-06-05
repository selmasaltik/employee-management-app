import { LitElement, html, css } from 'lit';
import './header-bar.js';
import './footer-bar.js';

export class AppLayout extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    
    main {
      flex: 1;
      padding: 16px;
      background-image: url('dist/assets/lion_bg.png');
      background-repeat: no-repeat;
      background-position: right bottom;
      background-size: auto;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    
    @media (max-width: var(--bs-breakpoint-md)) {
      main {
        padding: 8px;
      }
    }
  `;

  firstUpdated() {
    this.outlet = this.renderRoot.querySelector('#outlet');
  }

  render() {
    return html`
      <header-bar></header-bar>
      <main id="outlet" role="main">
        <slot></slot>
      </main>
      <footer-bar></footer-bar>
    `;
  }
}

customElements.define('app-layout', AppLayout);
