import { EmployeeForm } from '../src/pages/employee-form.js';
import { fixture, assert, html } from '@open-wc/testing';

const mockMsg = (key) => `translated_${key}`;

const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();

async function createEmployeeForm() {
  window.msg = mockMsg;
  
  const element = await fixture(html`
    <employee-form
      .employee=${{
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@sourtimes.org',
        phone: '+(90) 555 123 45 67',
        department: 'Tech',
        position: 'Senior',
        dob: '1990-01-01',
        doe: '2020-01-01'
      }}
      ?isEditMode=${true}
    ></employee-form>
  `);
  
  await element.updateComplete;
  return element;
}

describe('EmployeeForm', () => {
  let element;
  let originalLocalStorage;
  
  beforeEach(async () => {
    originalLocalStorage = { ...window.localStorage };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
      writable: true
    });
    
    mockLocalStorage.clear();
  });
  
  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true
    });
  });

  it('is defined', () => {
    const el = document.createElement('employee-form');
    assert.instanceOf(el, EmployeeForm);
  });

  it('renders a basic form structure', async () => {
    const el = document.createElement('employee-form');
    document.body.appendChild(el);
    
    try {
      await customElements.whenDefined('employee-form');
      
      await el.updateComplete;
      
      console.log('Element:', el);
      console.log('Shadow root exists:', !!el.shadowRoot);
      
      if (el.shadowRoot) {
        console.log('Shadow root content:', el.shadowRoot.innerHTML);
        
        const hasContent = el.shadowRoot.innerHTML.trim().length > 0;
        console.log('Shadow root has content:', hasContent);
        
        const forms = el.shadowRoot.querySelectorAll('form');
        console.log('Found forms:', forms.length);
        
        if (forms.length === 0) {
          console.log('No forms found, checking for any rendered elements:');
          console.log(el.shadowRoot.children);
        }
      }
      
      assert.isTrue(!!el.shadowRoot, 'Component should have a shadow root');
      
      if (el.shadowRoot) {
        const hasContent = el.shadowRoot.innerHTML.trim().length > 0;
        assert.isTrue(hasContent, 'Shadow root should have content');
      }
      
    } finally {
      document.body.removeChild(el);
    }
  });

  it('validates form fields', async () => {
    element = await createEmployeeForm();
    
    assert.isTrue(element.validateField('email', 'test@example.com'), 'Should accept valid email');
    assert.isFalse(element.validateField('email', 'invalid-email'), 'Should reject invalid email');
    
    assert.isFalse(element.validateField('firstName', ''), 'Should require first name');
  });

  it('formats phone numbers correctly', async () => {
    element = await createEmployeeForm();
    
    const testNumber = '5551234567';
    const formatted = element.formatPhoneNumber(testNumber);
    assert.equal(formatted, '+(90) 555 123 45 67', 'Should format phone number correctly');
    
    const alreadyFormatted = '+(90) 555 123 45 67';
    const reformatted = element.formatPhoneNumber(alreadyFormatted);
    assert.equal(reformatted, '+(90) 555 123 45 67', 'Should handle already formatted numbers');
  });
});
