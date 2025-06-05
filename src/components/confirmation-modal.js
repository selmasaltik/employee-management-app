import { LitElement, html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { msg } from '../localization.js';

export class ConfirmationModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    title: { type: String },
    message: { type: String },
    confirmText: { type: String },
    cancelText: { type: String },
    loading: { type: Boolean },
    _localizedTitle: { state: true },
    _localizedMessage: { state: true },
    _localizedConfirmText: { state: true },
    _localizedCancelText: { state: true }
  };

  constructor() {
    super();
    this.open = false;
    this.title = 'Are you sure?';
    this.message = 'This action cannot be undone.';
    this.confirmText = 'Confirm';
    this.cancelText = 'Cancel';
    this.loading = false;
    this._boundLocaleChange = this._handleLocaleChange.bind(this);
  }

  static styles = css`
    .modal-overlay {
      position: fixed;
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .modal-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .modal {
      background: var(--white-color);
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transform: translateY(-20px);
      transition: transform 0.3s ease;
      position: relative;
    }

    .modal-overlay.open .modal {
      transform: translateY(0);
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-color);
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--primary-color);
      padding: 0.25rem;
      line-height: 1;
      transition: color 0.2s;
    }

    .modal-body {
      padding: 24px;
      color: var(--modal-body-color);
      line-height: 1.5;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 12px;
    }

    .btn {
      width: 100%;
      padding: 12px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      min-width: 80px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
    
    .btn-confirm {
      background-color: var(--primary-color);
      color: var(--white-color);
      border: 1px solid var(--primary-color);
    }

    .btn-cancel {
      background-color: var(--white-color);
      color: var(--blue-color);
      border: 1px solid var(--blue-color);
    }

    .btn-confirm[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._updateLocalizedStrings();
    window.addEventListener('locale-changed', this._boundLocaleChange);
  }

  disconnectedCallback() {
    window.removeEventListener('locale-changed', this._boundLocaleChange);
    super.disconnectedCallback();
  }

  _handleLocaleChange() {
    this._updateLocalizedStrings();
  }

  _updateLocalizedStrings() {
    this._localizedTitle = this.title ? msg(this.title) : '';
    this._localizedMessage = this.message ? msg(this.message) : '';
    this._localizedConfirmText = this.confirmText ? msg(this.confirmText) : msg('Yes');
    this._localizedCancelText = this.cancelText ? msg(this.cancelText) : msg('No');
    this.requestUpdate();
  }

  updated(changedProperties) {
    if (changedProperties.has('title') || 
        changedProperties.has('message') || 
        changedProperties.has('confirmText') || 
        changedProperties.has('cancelText')) {
      this._updateLocalizedStrings();
    }
  }

  render() {
    const classes = {
      'modal-overlay': true,
      'open': this.open
    };

    return html`
      <div 
        class=${classMap(classes)} 
        @click=${this._handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
      >
        <div class="modal" @click=${e => e.stopPropagation()}>
          <div class="modal-header">
            <h2 id="modal-title" class="modal-title">${this._localizedTitle}</h2>
            <button 
              class="close-button" 
              @click=${this._handleCancel}
              ?disabled=${this.loading}
              aria-label=${msg('Close')}
            >
              &times;
            </button>
          </div>
          <div class="modal-body">
            <p id="modal-message">${this._localizedMessage}</p>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-confirm" 
              @click=${this._handleConfirm}
              ?disabled=${this.loading}
            >
              ${this.loading ? html`<span>${msg('Loading...')}</span>` : this._localizedConfirmText}
            </button>
            <button 
              class="btn btn-cancel" 
              @click=${this._handleCancel}
              ?disabled=${this.loading}
            >
              ${this._localizedCancelText}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _handleOverlayClick(e) {
    if (e.target === e.currentTarget && !this.loading) {
      this._handleCancel();
    }
  }

  _handleCancel() {
    if (this.loading) return;
    this.open = false;
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  _handleConfirm() {
    if (this.loading) return;
    this.dispatchEvent(new CustomEvent('confirm', { bubbles: true, composed: true }));
  }
}

customElements.define('confirmation-modal', ConfirmationModal);
