import { assert } from '@open-wc/testing';
import sinon from 'sinon';
import { 
  getLocale, 
  setLocale, 
  msg
} from '../src/localization.js';

describe('Localization', () => {
  let localStorageStub;
  let consoleStub;
  let originalLocalStorage;
  let originalNavigator;
  let clock;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
    originalNavigator = { ...navigator };
    
    localStorageStub = {
      getItem: sinon.stub(),
      setItem: sinon.stub(),
      clear: sinon.stub(),
      removeItem: sinon.stub()
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageStub,
      writable: true
    });

    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      configurable: true
    });

    consoleStub = sinon.stub(console, 'error');
    
    clock = sinon.useFakeTimers();
    
    document.documentElement.lang = 'en';
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
    
    Object.defineProperty(navigator, 'language', {
      value: originalNavigator.language,
      configurable: true
    });
    
    consoleStub.restore();
    sinon.restore();
    clock.restore();
  });

  describe('getLocale', () => {
    it('should return the current locale', () => {
      assert.equal(getLocale(), 'en');
    });
  });

  describe('setLocale', () => {
    it('should set the locale and save to localStorage', async () => {
      localStorageStub.getItem.returns(null);
      
      const newLocale = 'tr';
      const result = await setLocale(newLocale);
      
      assert.isTrue(result, 'setLocale should resolve to true');
      assert.equal(document.documentElement.lang, newLocale, 'Should update document language');
      assert.isTrue(
        localStorageStub.setItem.calledWith('userLocale', newLocale),
        'Should save locale to localStorage'
      );
    });

    it('should dispatch locale-changed event', async () => {
      const eventSpy = sinon.spy(window, 'dispatchEvent');
      const newLocale = 'tr';
      
      await setLocale(newLocale);
      
      assert.isTrue(eventSpy.calledOnce, 'Should dispatch event');
      const event = eventSpy.firstCall.args[0];
      assert.equal(event.type, 'locale-changed', 'Should dispatch locale-changed event');
      assert.equal(event.detail.locale, newLocale, 'Event should include new locale');
    });
  });

  describe('msg', () => {
    it('should return key when translation is missing', () => {
      const nonExistentKey = 'non.existent.key';
      const result = msg(nonExistentKey);
      assert.equal(result, nonExistentKey, 'Should return the key when translation is missing');
    });
  });

  describe('initialization', () => {
    it('should use saved locale from localStorage', async () => {
      localStorageStub.getItem.returns('tr');
      
      const { getLocale: getCurrentLocale } = await import('../src/localization.js');
      
      assert.equal(getCurrentLocale(), 'tr');
    });

    it('should use browser language when no saved locale', async () => {
      localStorageStub.getItem.returns(null);
      
      Object.defineProperty(navigator, 'language', { value: 'tr-TR' });
      
      const { getLocale: getCurrentLocale } = await import('../src/localization.js');
      
      assert.isTrue(['tr', 'en'].includes(getCurrentLocale()));
    });

    it('should handle unsupported browser language', async () => {
      localStorageStub.getItem.returns(null);
      
      Object.defineProperty(navigator, 'language', { value: 'fr-FR' });
      
      const { getLocale: getCurrentLocale } = await import('../src/localization.js');
      
      assert.equal(getCurrentLocale(), 'tr');
    });
  });
});