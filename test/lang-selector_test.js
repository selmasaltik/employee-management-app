import { assert, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import { LangSelector } from '../src/components/lang-selector.js';

const mockLocalization = {
  getLocale: () => 'en',
  setLocale: () => ({
    then: (cb) => {
      cb(true);
      return { catch: () => {} };
    }
  }),
  msg: (key) => key
};

if (!customElements.get('lang-selector')) {
  customElements.define('lang-selector', class extends LangSelector {
    constructor() {
      super();
      this._setLocale = mockLocalization.setLocale;
    }
  });
}

describe('LangSelector', () => {
  let element;

  beforeEach(async () => {
    element = await fixture(html`<lang-selector></lang-selector>`);
    await element.updateComplete;
  });

  afterEach(() => {
    element.isLoading = false;
    sinon.restore();
  });

  it('should render with default language', () => {
    const img = element.shadowRoot?.querySelector('img');
    assert.exists(img, 'Flag image should exist');
    assert.include(img?.getAttribute('src'), 'en', 'Should show EN flag');
  });

  it('should toggle language when clicked', async () => {
    element.currentLocale = 'tr';
    await element.updateComplete;
    
    element.toggleLanguage();
    assert.isTrue(element.isLoading, 'Should set loading to true');
    assert.equal(element.currentLocale, 'tr', 'Locale should not change immediately');
    
    window.dispatchEvent(new CustomEvent('locale-changed'));

    await element.updateComplete;
    assert.equal(element.currentLocale, 'en', 'Should update to Turkish after locale change');
  });

  it('should update loading state during toggle', () => {
    element.toggleLanguage();
    assert.isTrue(element.isLoading, 'Should set loading to true');
  });

  it('should update flag when currentLocale changes', async () => {
    element.currentLocale = 'tr';
    await element.updateComplete;
    
    const img = element.shadowRoot?.querySelector('img');
    assert.include(img?.getAttribute('src'), 'tr', 'Should show TR flag');
  });
});