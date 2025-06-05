import { FooterBar } from '../src/layouts/footer-bar.js';
import { fixture, assert, html } from '@open-wc/testing';
import sinon from 'sinon';

const mockMsg = (key) => `${key}`;

describe('FooterBar', () => {
  let element;
  
  beforeEach(async () => {
    window.addEventListener = sinon.stub();
    window.removeEventListener = sinon.stub();
    
    element = await fixture(html`
      <footer-bar .msg=${mockMsg}></footer-bar>
    `);
    
    await element.updateComplete;
  });
  
  afterEach(() => {
    window.addEventListener.resetHistory();
    window.removeEventListener.resetHistory();
  });

  afterEach(() => {
    delete window.msg;
  });

  it('is defined', () => {
    const el = document.createElement('footer-bar');
    assert.instanceOf(el, FooterBar);
  });

  it('renders the current year', async () => {
    const currentYear = new Date().getFullYear();
    const footerText = element.shadowRoot.querySelector('footer').textContent;
    
    assert.include(
      footerText,
      currentYear.toString(),
      `Should render the current year (${currentYear})`
    );
  });

  it('renders the translated copyright text', async () => {
    const footerText = element.shadowRoot.querySelector('footer').textContent;
    const currentYear = new Date().getFullYear();
    
    assert.include(
      footerText,
      `© ${currentYear} Employee Management App. All rights reserved.`,
      'Should render the copyright text with current year'
    );
  });

  it('applies correct styles', async () => {
    const footer = element.shadowRoot.querySelector('footer');
    const styles = window.getComputedStyle(footer);
    
    assert.equal(styles.textAlign, 'center', 'Footer text should be centered');
  });

  it('handles locale changes', async () => {
    const originalText = element.shadowRoot.querySelector('footer').textContent;
    
    const newMockMsg = (key) => `new_${key}`;
    element.msg = newMockMsg;
    
    element.requestUpdate();
    await element.updateComplete;
    
    const updatedText = element.shadowRoot.querySelector('footer').textContent;
    
    assert.notEqual(
      updatedText, 
      originalText, 
      'Should update text when msg function changes'
    );
    
    assert.include(
      updatedText,
      'new_Employee Management App. All rights reserved.',
      'Should use the new message function'
    );
  });

  it('cleans up event listeners when disconnected', () => {
    element.disconnectedCallback();
    
    assert.isTrue(
      window.removeEventListener.called,
      'Should remove event listeners when disconnected'
    );
  });
});
