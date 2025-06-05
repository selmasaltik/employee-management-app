import { AppLayout } from '../src/layouts/app-layout.js';
import { fixture, assert, html } from '@open-wc/testing';

describe('AppLayout', () => {
  let element;
  
  beforeEach(async () => {
    element = await fixture(html`<app-layout></app-layout>`);
    await element.updateComplete;
  });

  it('is defined', () => {
    const el = document.createElement('app-layout');
    assert.instanceOf(el, AppLayout);
  });

  it('has a main content area with id "outlet"', async () => {
    const main = element.shadowRoot.querySelector('main');
    assert.exists(main, 'Main content area should exist');
    assert.equal(main.id, 'outlet', 'Main content area should have id "outlet"');
  });

  it('renders header and footer components', async () => {
    const header = element.shadowRoot.querySelector('header-bar');
    const footer = element.shadowRoot.querySelector('footer-bar');
    
    assert.exists(header, 'Header component should be rendered');
    assert.exists(footer, 'Footer component should be rendered');
  });

  it('applies correct styles to the main content', async () => {
    const main = element.shadowRoot.querySelector('main');
    const styles = window.getComputedStyle(main);
    
    assert.equal(styles.display, 'block', 'Main should use block display');
    assert.equal(styles.flexGrow, '1', 'Main should take up available space');
    assert.include(styles.padding, '16px', 'Main should have padding');
  });

  it('has a slot for content', async () => {
    const slot = element.shadowRoot.querySelector('slot');
    assert.exists(slot, 'Slot should exist for content projection');
  });
});
