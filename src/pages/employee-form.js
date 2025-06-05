import { LitElement, html, css } from 'lit';
import { msg } from '../localization.js';

export class EmployeeForm extends LitElement {
  static properties = {
    employee: { type: Object },
    isEditMode: { type: Boolean },
    formErrors: { type: Object },
    employeeId: { type: String },
    loading: { type: Boolean }
  };

  constructor() {
    super();
    this.employee = null;
    this.isEditMode = false;
    this.formErrors = {};
    this.employeeId = null;
    this.loading = false;
    this.handleRouteChange = this.handleRouteChange.bind(this);
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
      padding: 0 16px;
      box-sizing: border-box;
    }

    .form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 32px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      width: 100%;
      box-sizing: border-box;
    }

    .form-title {
      font-size: 28px;
      color: var(--text-color);
      margin: 0 0 32px 0;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;
      font-weight: 700;
    }

    .form-group {
      margin-bottom: 32px;
      width: 100%;
    }

    label {
      display: block;
      margin-bottom: 16px;
      font-weight: 600;
      color: var(--text-color);
      font-size: 15px;
    }

    label.required::after {
      content: ' *';
      color: #e53e3e;
    }

    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="date"],
    select {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 16px;
      font-family: var(--font-family);
      transition: all 0.2s ease;
      background-color: #fff;
      color: var(--text-color);
      max-width: 100%;
      box-sizing: border-box;
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(255, 102, 0, 0.2);
    }

    .error {
      color: #e53e3e;
      font-size: 13px;
      margin-top: 6px;
      display: block;
      line-height: 1.4;
    }

    .form-actions {
      margin-top: 40px;
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-right: 8px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }

    button {
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 120px;
      text-align: center;
    }

    button[type="submit"] {
      background-color: var(--primary-color);
      color: white;
    }

    button[type="submit"]:hover:not(:disabled) {
      background-color: #e65c00;
      text-decoration: none;
    }

    button[type="submit"]:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    button[type="reset"] {
      background-color: #f5f5f5;
      color: var(--text-color);
      border: 1px solid #d1d5db;
    }

    button[type="reset"]:hover {
      background-color: #e8e8e8;
      text-decoration: none;
    }

    .two-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 8px;
      width: 100%;
    }

    @media (max-width: var(--bs-breakpoint-md)) {
      .form-container {
        padding: 24px;
      }
      
      .two-columns {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      
      .form-actions {
        flex-direction: column;
        gap: 12px;
      }
      
      button {
        width: 100%;
        margin: 0;
      }
    }
    
    @media (max-width: var(--bs-breakpoint-sm)) {
      .form-container {
        padding: 16px;
        margin: 8px 0;
        border-radius: 0;
        box-shadow: none;
      }
    }
  `;

  validateField(name, value) {
    const errors = { ...this.formErrors };
    
    if (!value) {
      errors[name] = 'This field is required';
    } else {
      delete errors[name];
      
      if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[name] = 'Please enter a valid email address';
      }
      
      if (name === 'phone') {
        const digits = value.replace(/\D/g, '');
        if (!/^(5\d{9}|90\d{10})$/.test(digits)) {
          errors[name] = 'Please enter a valid phone number in format: +(90) 5XX XXX XX XX';
        }
      }
      
      if (name === 'dob') {
        const dob = new Date(value);
        const today = new Date();
        if (dob >= today) {
          errors[name] = 'Date of birth must be in the past';
        }
      }
      
      if (name === 'doe') {
        const doe = new Date(value);
        const today = new Date();
        if (doe > today) {
          errors[name] = 'Date of employment cannot be in the future';
        }
      }
    }
    
    this.formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  handleInput(e) {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    if (name === 'phone') {
      let digits = value.replace(/\D/g, '');
      
      if (value.includes('+(90)')) {
        digits = digits.replace(/^90/, '');
      }
      
      digits = digits.substring(0, 10);
      
      let formatted = '';
      if (digits.length > 0) {
        formatted = '+(90) ' + digits.substring(0, 3);
        if (digits.length > 3) {
          formatted += ' ' + digits.substring(3, 6);
          if (digits.length > 6) {
            formatted += ' ' + digits.substring(6, 8);
            if (digits.length > 8) {
              formatted += ' ' + digits.substring(8, 10);
            }
          }
        }
      }
      
      processedValue = formatted;
      
      if (e.target.value !== processedValue) {
        e.target.value = processedValue;
      }
    }
    
    if (this.employee) {
      this.employee = { ...this.employee, [name]: processedValue };
    } else {
      this.employee = { [name]: processedValue };
    }
    
    this.formErrors = { ...this.formErrors, [name]: '' };
    
    this.validateField(name, processedValue);
    
    this.requestUpdate();
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  formatPhoneNumber(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    
    let formatted = '';
    if (digits.length > 0) {
      const cleanDigits = digits.startsWith('90') ? digits.substring(2) : digits.startsWith('0') ? digits.substring(1) : digits;
      
      formatted = '+(90) ' + cleanDigits.substring(0, 3);
      if (cleanDigits.length > 3) {
        formatted += ' ' + cleanDigits.substring(3, 6);
        if (cleanDigits.length > 6) {
          formatted += ' ' + cleanDigits.substring(6, 8);
          if (cleanDigits.length > 8) {
            formatted += ' ' + cleanDigits.substring(8, 10);
          }
        }
      }
    }
    return formatted;
  }

  validatePhone(phone) {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    return /^(5\d{9}|90\d{10})$/.test(digits);
  }

  validateDates(dob, doe) {
    const dobDate = new Date(dob);
    const doeDate = new Date(doe);
    const today = new Date();
    
    const minDob = new Date();
    minDob.setFullYear(minDob.getFullYear() - 65);
    
    const maxDob = new Date();
    maxDob.setFullYear(maxDob.getFullYear() - 18);
    
    if (dobDate >= today) {
      return 'Date of birth must be in the past';
    }
    
    if (dobDate < minDob) {
      return 'Employee is too old (max 65 years)';
    }
    
    if (dobDate > maxDob) {
      return 'Employee must be at least 18 years old';
    }
    
    if (doeDate > today) {
      return 'Date of employment cannot be in the future';
    }
    
    const minDoe = new Date(dobDate);
    minDoe.setFullYear(minDoe.getFullYear() + 18);
    
    if (doeDate < minDoe) {
      return 'Employee must be at least 18 years old at the time of employment';
    }
    
    return null;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const employeeData = Object.fromEntries(formData.entries());
    
    this.formErrors = {};
    
    if (employeeData.phone) {
      const digits = employeeData.phone.replace(/\D/g, '');
      if (digits.length === 10) {
        employeeData.phone = `+(90) ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 8)} ${digits.substring(8, 10)}`;
      } else if (digits.startsWith('90') && digits.length === 12) {
        employeeData.phone = `+${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5, 8)} ${digits.substring(8, 10)} ${digits.substring(10, 12)}`;
      }
    }
    
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'department', 'position', 'dob', 'doe'];
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!employeeData[field]?.trim()) {
        this.formErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
    });
    
    if (employeeData.email && !this.validateEmail(employeeData.email)) {
      this.formErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (employeeData.phone && !this.validatePhone(employeeData.phone)) {
      this.formErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }
    
    if (employeeData.dob && employeeData.doe) {
      const dateValidation = this.validateDates(employeeData.dob, employeeData.doe);
      if (dateValidation) {
        this.formErrors.doe = dateValidation;
        isValid = false;
      }
    }
    
    if (!isValid) {
      this.requestUpdate();
      return;
    }
    
    this.loading = true;
    this.requestUpdate();
    
    try {
      this.loading = true;
      this.requestUpdate();
      
      const formattedEmployee = { ...employeeData };
      
      if (formattedEmployee.phone) {
        const digits = formattedEmployee.phone.replace(/\D/g, '');
        if (digits.length === 10) {
          formattedEmployee.phone = `+(90) ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 8)} ${digits.substring(8, 10)}`;
        } else if (digits.startsWith('90') && digits.length === 12) {
          formattedEmployee.phone = `+${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5, 8)} ${digits.substring(8, 10)} ${digits.substring(10, 12)}`;
        }
      }
      
      let employee;
      
      if (this.isEditMode && this.employee) {
        employee = {
          ...this.employee,
          ...formattedEmployee,
          id: this.employeeId
        };
      } else {
        employee = {
          ...formattedEmployee,
          id: Date.now().toString()
        };
      }
      
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const updatedEmployees = this.isEditMode 
        ? employees.map(emp => emp.id === employee.id ? employee : emp)
        : [...employees, employee];
      
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      
      const eventName = this.isEditMode ? 'update-employee' : 'add-employee';
      const event = new CustomEvent(eventName, {
        detail: { employee },
        bubbles: true,
        composed: true
      });
      
      window.dispatchEvent(event);
      
      this.dispatchEvent(event);
      
      window.history.pushState({}, '', '/employees');
      window.dispatchEvent(new CustomEvent('popstate'));
      
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  fetchEmployee(id) {
    try {
      this.loading = true;
      this.requestUpdate();
      
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const employee = employees.find(emp => emp.id === id);
      
      if (employee) {
        const formattedEmployee = {
          ...employee,
          dob: employee.dob ? employee.dob.split('T')[0] : '',
          doe: employee.doe ? employee.doe.split('T')[0] : ''
        };
        
        this.employee = formattedEmployee;
        this.employeeId = id;
        this.isEditMode = true;
        
        this.requestUpdate();
        
        setTimeout(() => {
          const form = this.shadowRoot && this.shadowRoot.querySelector('form');
          if (form) {
            Object.entries(formattedEmployee).forEach(([key, value]) => {
              if (key !== 'id' && form[key]) {
                form[key].value = value || '';
              }
            });
          }
          this.loading = false;
          this.requestUpdate();
        }, 0);
        
        return; 
      } else {
        console.error('Employee not found');
        window.history.pushState({}, '', '/employees');
        window.dispatchEvent(new CustomEvent('popstate'));
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      window.history.pushState({}, '', '/employees');
      window.dispatchEvent(new CustomEvent('popstate'));
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  handleRouteChange() {
    const path = window.location.pathname;
    
    const editMatch = path.match(/^\/employees\/edit\/([^/]+)$/);
    
    if (editMatch) {
      const employeeId = editMatch[1];
      this.employeeId = employeeId;
      this.isEditMode = true;
      this.fetchEmployee(employeeId);
    } else if (path === '/employees/add') {
      this.isEditMode = false;
      this.employee = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        dob: '',
        doe: ''
      };
      this.loading = false;
      this.requestUpdate();
    } else if (path.startsWith('/employees/edit/')) {
      const id = path.split('/').pop();
      this.employeeId = id;
      this.isEditMode = true;
      this.fetchEmployee(id);
    } else if (path === '/employees') {
      return;
    } else {
      window.history.pushState({}, '', '/employees');
      window.dispatchEvent(new CustomEvent('popstate'));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.loading = true;
    this.handleRouteChange();
    window.addEventListener('popstate', this.handleRouteChange);
    setTimeout(() => {
      this.loading = false;
      this.requestUpdate();
    }, 0);
  }

  firstUpdated() {
    super.firstUpdated();
  }
  
  disconnectedCallback() {
    window.removeEventListener('popstate', this.handleRouteChange);
    super.disconnectedCallback();
  }

  formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  getPlaceholder(name) {
    const placeholders = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@sourtimes.org',
      phone: '+(90) 5__ ___ __ __',
      department: 'Select department',
      position: 'Select position',
      dob: 'YYYY-MM-DD',
      doe: 'YYYY-MM-DD'
    };
    return placeholders[name] || '';
  }

  renderFormField(label, name, type = 'text', required = false, options = null) {
    let value = this.employee ? 
      (type === 'date' ? this.formatDateForInput(this.employee[name]) : this.employee[name] || '') : '';
    const error = this.formErrors[name];
    const placeholder = this.getPlaceholder(name);
    
    if (name === 'phone') {
      if (value) {
        value = this.formatPhoneNumber(value);
      }
      
      return html`
        <div class="form-group">
          <label class="${required ? 'required' : ''}" for="phone">${label}</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            .value="${value || ''}"
            ?required=${required}
            @input=${this.handleInput}
            class="${error ? 'error-border' : ''}"
            ?disabled=${this.loading}
            placeholder="+(90) 5__ ___ __ __"
            pattern="^\\+90\\d{10}$"
            title="Please enter a valid phone number in format: +(90) 5XX XXX XX XX"
            inputmode="numeric"
          />
          ${error ? html`<span class="error">${error}</span>` : ''}
        </div>
      `;
    }
    
    return html`
      <div class="form-group">
        <label class="${required ? 'required' : ''}" for=${name}>${label}</label>
        ${options
          ? html`
              <select 
                id=${name}
                name=${name}
                ?required=${required}
                @input=${this.handleInput}
                class=${error ? 'error-border' : ''}
                ?disabled=${this.loading}
              >
                <option value="" ?selected=${!value} disabled>Select ${label}</option>
                ${options.map(option => 
                  html`<option 
                    value=${option} 
                    ?selected=${value === option}
                    ?disabled=${this.loading}
                  >
                    ${option}
                  </option>`
                )}
              </select>
            `
          : html`
              <input
                .type=${type}
                id=${name}
                name=${name}
                .value=${value || ''}
                ?required=${required}
                @input=${this.handleInput}
                class=${error ? 'error-border' : ''}
                ?disabled=${this.loading}
                placeholder=${placeholder}
              />
            `
        }
        ${error ? html`<span class="error">${error}</span>` : ''}
      </div>
    `;
  }

  render() {
    const departments = ['Analytics', 'Tech'];
    const positions = ['Junior', 'Medior', 'Senior'];
    
    if (this.loading) {
      return html`
        <div class="form-container" style="text-align: center; padding: 40px;">
          <div style="font-size: 18px; margin-bottom: 16px;">Loading employee data...</div>
          <div style="color: #666;">Please wait while we load the employee information.</div>
        </div>
      `;
    }
    
    return html`
      <div class="form-container">
        <h1 class="form-title">
          ${this.isEditMode ? 'Edit Employee' : 'Add New Employee'}
        </h1>
        
        <form @submit=${this.handleSubmit} @reset=${() => this.formErrors = {}}>
          <div class="two-columns">
            ${this.renderFormField('First Name', 'firstName', 'text', true, '', this.employee?.firstName || '')}
            ${this.renderFormField('Last Name', 'lastName', 'text', true, '', this.employee?.lastName || '')}
          </div>
          
          <div class="two-columns">
            ${this.renderFormField('Date of Birth', 'dob', 'date', true, '', this.employee?.dob || '')}
            ${this.renderFormField('Date of Employment', 'doe', 'date', true, '', this.employee?.doe || '')}
          </div>
          
          ${this.renderFormField('Email Address', 'email', 'email', true, '', this.employee?.email || '')}
          ${this.renderFormField('Phone Number', 'phone', 'tel', true, '', this.employee?.phone || '')}
          
          <div class="two-columns">
            ${this.renderFormField('Department', 'department', 'select', true, departments, this.employee?.department || '')}
            ${this.renderFormField('Position', 'position', 'select', true, positions, this.employee?.position || '')}
          </div>
          
          <div class="form-actions">
            <button type="reset" ?disabled=${this.loading}>${msg('Cancel')}</button>
            <button 
              type="submit" 
              ?disabled=${Object.keys(this.formErrors).length > 0 || this.loading}
            >
              ${this.isEditMode ? msg('Update') : msg('Create')}
            </button>
          </div>
        </form>
      </div>
    `;
  }
}

customElements.define('employee-form', EmployeeForm);
