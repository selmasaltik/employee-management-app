import { ConfirmationModal } from '../src/components/confirmation-modal.js';
import { fixture, assert, html } from '@open-wc/testing';
import sinon from 'sinon';

const mockMsg = (key) => key;

async function createModal(properties = {}) {
  window.msg = mockMsg;
  
  const element = await fixture(html`
    <confirmation-modal
      .open=${properties.open !== undefined ? properties.open : false}
      .title=${properties.title || ''}
      .message=${properties.message || ''}
      .confirmText=${properties.confirmText || ''}
      .cancelText=${properties.cancelText || ''}
      .loading=${properties.loading || false}
    ></confirmation-modal>
  `);
  
  await element.updateComplete;
  return element;
}

describe('ConfirmationModal', () => {
  let element;
  
  beforeEach(() => {
    sinon.restore();
  });

  it('is defined', () => {
    const el = document.createElement('confirmation-modal');
    assert.instanceOf(el, ConfirmationModal);
  });

  it('renders with default props when no properties are set', async () => {
    element = await createModal({ open: true });
    
    const title = element.shadowRoot.querySelector('.modal-title');
    const message = element.shadowRoot.querySelector('.modal-body p');
    
    assert.equal(title.textContent, '', 'Should render default title');
    assert.include(message.textContent, '', 'Should render default message');
    
    const confirmButton = element.shadowRoot.querySelector('.btn-confirm');
    const cancelButton = element.shadowRoot.querySelector('.btn-cancel');
    
    assert.include(confirmButton.textContent.trim(), 'Yes', 'Should render default confirm text');
    assert.include(cancelButton.textContent.trim(), 'No', 'Should render default cancel text');
  });

  it('applies custom properties when provided', async () => {
    const customProps = {
      open: true,
      title: 'Custom Title',
      message: 'Custom message',
      confirmText: 'Yes, delete',
      cancelText: 'No, keep it'
    };
    
    element = await createModal(customProps);
    
    const title = element.shadowRoot.querySelector('.modal-title');
    const message = element.shadowRoot.querySelector('.modal-body p');
    
    assert.equal(title.textContent, 'Custom Title', 'Should render custom title');
    assert.include(message.textContent, 'Custom message', 'Should render custom message');
    
    const confirmButton = element.shadowRoot.querySelector('.btn-confirm');
    const cancelButton = element.shadowRoot.querySelector('.btn-cancel');
    
    assert.include(confirmButton.textContent.trim(), 'Yes, delete', 'Should render custom confirm text');
    assert.include(cancelButton.textContent.trim(), 'No, keep it', 'Should render custom cancel text');
  });

  it('emits confirm event when confirm button is clicked', async () => {
    element = await createModal({ open: true });
    const confirmSpy = sinon.spy();
    element.addEventListener('confirm', confirmSpy);
    
    const confirmButton = element.shadowRoot.querySelector('.btn-confirm');
    confirmButton.click();
    
    assert.isTrue(confirmSpy.calledOnce, 'Should emit confirm event');
  });

  it('emits close event when cancel button is clicked', async () => {
    element = await createModal({ open: true });
    const closeSpy = sinon.spy();
    element.addEventListener('close', closeSpy);
    
    const cancelButton = element.shadowRoot.querySelector('.btn-cancel');
    cancelButton.click();
    
    assert.isTrue(closeSpy.calledOnce, 'Should emit close event');
  });

  it('emits close event when overlay is clicked', async () => {
    element = await createModal({ open: true });
    const closeSpy = sinon.spy();
    element.addEventListener('close', closeSpy);
    
    const overlay = element.shadowRoot.querySelector('.modal-overlay');
    overlay.click();
    
    assert.isTrue(closeSpy.calledOnce, 'Should emit close event when overlay is clicked');
  });

  it('does not emit close event when modal content is clicked', async () => {
    element = await createModal({ open: true });
    const closeSpy = sinon.spy();
    element.addEventListener('close', closeSpy);
    
    const modal = element.shadowRoot.querySelector('.modal');
    modal.click();
    
    assert.isFalse(closeSpy.called, 'Should not emit close event when modal content is clicked');
  });

  it('disables buttons when loading is true', async () => {
    element = await createModal({ open: true, loading: true });
    
    const confirmButton = element.shadowRoot.querySelector('.btn-confirm');
    const cancelButton = element.shadowRoot.querySelector('.btn-cancel');
    const closeButton = element.shadowRoot.querySelector('.close-button');
    
    assert.isTrue(confirmButton.disabled, 'Confirm button should be disabled');
    assert.isTrue(cancelButton.disabled, 'Cancel button should be disabled');
    assert.isTrue(closeButton.disabled, 'Close button should be disabled');
    
    assert.include(confirmButton.textContent.trim(), 'Loading...', 'Should show loading text');
  });

  it('updates when locale changes', async () => {
    element = await createModal({ 
      open: true,
      title: 'Title',
      message: 'Message',
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    });
    
    const initialTitle = element.shadowRoot.querySelector('.modal-title').textContent;
    
    window.msg = () => initialTitle;
    
    window.dispatchEvent(new CustomEvent('locale-changed'));
    await element.updateComplete;
    
    const updatedTitle = element.shadowRoot.querySelector('.modal-title').textContent;
    
    assert.equal(updatedTitle, 'Title', 'Should update text when locale changes');
  });

  it('has proper ARIA attributes', async () => {
    element = await createModal({ open: true });
    
    const overlay = element.shadowRoot.querySelector('.modal-overlay');
    const title = element.shadowRoot.querySelector('.modal-title');
    const message = element.shadowRoot.querySelector('.modal-body p');
    
    assert.equal(overlay.getAttribute('role'), 'dialog', 'Should have dialog role');
    assert.equal(overlay.getAttribute('aria-modal'), 'true', 'Should have aria-modal="true"');
    assert.equal(overlay.getAttribute('aria-labelledby'), 'modal-title', 'Should reference title element');
    assert.equal(overlay.getAttribute('aria-describedby'), 'modal-message', 'Should reference message element');
    
    assert.equal(title.id, 'modal-title', 'Title should have correct ID');
    assert.equal(message.id, 'modal-message', 'Message should have correct ID');
  });
});
