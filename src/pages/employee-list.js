import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { generateEmployees } from '../utils/employeeGenerator.js';
import '../components/confirmation-modal.js';
import { msg } from '../localization.js';

const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc'
};

export class EmployeeList extends LitElement {
  static properties = {
    employees: { type: Array },
    viewMode: { type: String },
    searchTerm: { type: String },
    sortField: { type: String },
    sortDirection: { type: String },
    currentPage: { type: Number },
    pageSize: { type: Number },
    totalPages: { type: Number },
    showDeleteModal: { type: Boolean, state: true },
    employeeToDelete: { type: Object, state: true },
    isDeleting: { type: Boolean, state: true },
    _tableColumns: { state: true }
  };

  constructor() {
    super();
    const savedEmployees = localStorage.getItem('employees');
    this.employees = savedEmployees ? JSON.parse(savedEmployees) : generateEmployees(100);
    this.viewMode = 'table';
    this.searchTerm = '';
    this.sortField = 'firstName';
    this.sortDirection = SORT_DIRECTION.ASC;
    this.currentPage = 1;
    this.pageSize = 10;
    this.totalPages = Math.ceil(this.employees.length / this.pageSize);
    this.showDeleteModal = false;
    this.employeeToDelete = null;
    this.isDeleting = false;
    this._boundLocaleChange = this._handleLocaleChange.bind(this);
    this.handleUpdateEmployee = this.handleUpdateEmployee.bind(this);
    this._updateTableColumns();
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadEmployees();

    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('add-employee', this.handleAddEmployee);
    window.removeEventListener('update-employee', this.handleUpdateEmployee);
    window.removeEventListener('locale-changed', this._boundLocaleChange);
    
    window.addEventListener('popstate', this.handlePopState);
    window.addEventListener('add-employee', this.handleAddEmployee);
    window.addEventListener('update-employee', this.handleUpdateEmployee);
    window.addEventListener('locale-changed', this._boundLocaleChange);
    
    this.addEventListener('add-employee', this.handleAddEmployee);
    this.addEventListener('update-employee', this.handleUpdateEmployee);
  }

  disconnectedCallback() {
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('add-employee', this.handleAddEmployee);
    window.removeEventListener('update-employee', this.handleUpdateEmployee);
    window.removeEventListener('locale-changed', this._boundLocaleChange);
    
    this.removeEventListener('add-employee', this.handleAddEmployee);
    this.removeEventListener('update-employee', this.handleUpdateEmployee);
    
    super.disconnectedCallback();
  }
  
  _updateTableColumns() {
    this._tableColumns = [
      { key: 'firstName', label: msg('First Name'), sortable: true },
      { key: 'lastName', label: msg('Last Name'), sortable: true },
      { key: 'doe', label: msg('Date of Employment'), sortable: true },
      { key: 'dob', label: msg('Date of Birth'), sortable: true },
      { key: 'phone', label: msg('Phone'), sortable: false },
      { key: 'email', label: msg('Email'), sortable: true },
      { key: 'department', label: msg('Department'), sortable: true },
      { key: 'position', label: msg('Position'), sortable: true },
      { key: 'actions', label: msg('Actions'), sortable: false }
    ];
  }

  _handleLocaleChange() {
    this._updateTableColumns();
    this.requestUpdate();
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      color: var(--primary-text-color);
    }

    .list-container {
      background-color: var(--white-color);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    header {
      padding: 24px 24px 8px;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--white-color);
    }

    header h2 {
      margin: 0;
      font-size: 28px;
      color: var(--primary-color);
      font-weight: 700;
    }

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .search-container {
      position: relative;
      width: 100%;
      margin: 16px 0;
    }

    .search-container input[type="search"] {
      width: 100%;
      padding: 12px 16px;
      font-size: 16px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-family: inherit;
      transition: all 0.2s;
    }

    .search-container input[type="search"]:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(255, 102, 0, 0.2);
    }

    .view-toggle {
      display: flex;
      border-radius: 4px;
      padding: 4px;
    }

    .view-toggle button {
      padding: 8px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .view-toggle button[selected] {
      background: var(--secondary-color);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .view-icon {
      width: 20px;
      height: 20px;
      opacity: 0.8;
    }

    .table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
    }

    th, td {
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
      font-size: 15px;
      white-space: nowrap;
    }

    th {
      background-color: var(--white-color);
      color: var(--primary-color);
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.8px;
    }

    tbody tr {
      transition: background-color 0.2s;
    }

    tbody tr:hover {
      background-color: var(--secondary-color);
    }

    .list-view {
      padding: 16px;
    }

    .list-item {
      background-color: var(--white-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 16px;
      transition: all 0.2s;
    }

    .list-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .list-item > div {
      margin: 8px 0;
      display: flex;
      flex-wrap: wrap;
    }

    .list-item strong {
      color: var(--primary-color);
      font-weight: 600;
      margin-right: 8px;
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
    }

    .actions button {
      padding: 8px 16px;
      background: none;
      border: none;
      border-radius: 0;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .actions button img {
      width: 16px;
      height: 16px;
    }

    .empty-state {
      padding: 48px 16px;
      text-align: center;
      color: var(--bg-color);
    }

    .empty-state p {
      margin: 8px 0 0;
      color: var(--secondary-text-color);
    }

    th.sortable {
      cursor: pointer;
      user-select: none;
      position: relative;
    }

    th.sortable:hover {
      background-color: var(--secondary-color);
    }

    .sort-icon {
      margin-left: 4px;
      display: inline-flex;
      align-items: center;
      height: 12px;
    }

    .sort-arrow {
      width: 12px;
      height: 12px;
      object-fit: contain;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    
    th.sortable:hover .sort-arrow {
      opacity: 1;
    }
    
    th.sorted .sort-arrow {
      opacity: 1;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px 0;
      gap: 8px;
      flex-wrap: wrap;
    }

    .pagination button {
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      transition: all 0.2s;
    }

    .pagination-icon {
      width: auto;
      height: 20px;
    }


    .pagination button.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  loadEmployees() {
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      this.employees = JSON.parse(savedEmployees);
      this.totalPages = Math.ceil(this.employees.length / this.pageSize);
    }
  }

  sortEmployees(employees) {
    return [...employees].sort((a, b) => {
      let valueA = a[this.sortField];
      let valueB = b[this.sortField];
      
      if (valueA === null || valueA === undefined) {
        return this.sortDirection === SORT_DIRECTION.ASC ? 1 : -1;
      }
      if (valueB === null || valueB === undefined) {
        return this.sortDirection === SORT_DIRECTION.ASC ? -1 : 1;
      }
      
      if (typeof valueA === 'string') {
        valueA = valueA.trim().toLowerCase();
        valueB = typeof valueB === 'string' ? valueB.trim().toLowerCase() : String(valueB).toLowerCase();
      } else if (typeof valueB === 'string') {
        valueA = String(valueA).toLowerCase();
        valueB = valueB.trim().toLowerCase();
      }
      
      if (this.sortField === 'doe' || this.sortField === 'dob') {
        const dateA = new Date(valueA).getTime();
        const dateB = new Date(valueB).getTime();
        
        if (isNaN(dateA) || isNaN(dateB)) {
          if (isNaN(dateA) && !isNaN(dateB)) return 1;
          if (!isNaN(dateA) && isNaN(dateB)) return -1;
          return 0;
        }
        
        return this.sortDirection === SORT_DIRECTION.ASC 
          ? dateA - dateB 
          : dateB - dateA;
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === SORT_DIRECTION.ASC 
          ? valueA - valueB 
          : valueB - valueA;
      }
      
      const options = { sensitivity: 'base', numeric: true };
      let comparison;
      
      try {
        comparison = String(valueA).localeCompare(String(valueB), undefined, options);
      } catch (e) {
        const strA = String(valueA);
        const strB = String(valueB);
        comparison = strA < strB ? -1 : (strA > strB ? 1 : 0);
      }
      
      return this.sortDirection === SORT_DIRECTION.ASC ? comparison : -comparison;
    });
  }

  handleSort(field) {
    if (field === this.sortField) {
      this.sortDirection = this.sortDirection === SORT_DIRECTION.ASC 
        ? SORT_DIRECTION.DESC 
        : SORT_DIRECTION.ASC;
    } else {
      this.sortField = field;
      this.sortDirection = SORT_DIRECTION.ASC;
    }
  }

  handlePageChange(page) {
    this.currentPage = page;
  }

  getFilteredEmployees() {
    return this.employees.filter(emp =>
      (emp.firstName?.toLowerCase() || '').includes(this.searchTerm.toLowerCase()) ||
      (emp.lastName?.toLowerCase() || '').includes(this.searchTerm.toLowerCase()) ||
      (emp.email?.toLowerCase() || '').includes(this.searchTerm.toLowerCase())
    );
  }

  getPaginatedEmployees(employees) {
    this.totalPages = Math.max(1, Math.ceil(employees.length / this.pageSize));
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const sortedEmployees = this.sortEmployees(employees);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return sortedEmployees.slice(startIndex, startIndex + this.pageSize);
  }

  render() {
    const filteredEmployees = this.getFilteredEmployees();
    const paginatedEmployees = this.getPaginatedEmployees(filteredEmployees);

    return html`
      <div class="list-container">
        <header>
          <div class="header-main">
            <h2>${msg('Employee List')}</h2>
            <div class="header-actions">
              <div class="view-toggle">
                <button
                  @click=${() => this.changeView('table')}
                  ?selected=${this.viewMode === 'table'}
                  aria-label=${msg('Table View')}
                >
                  <img class="view-icon" src="dist/assets/table.png" alt=${msg('Table View')} />
                </button>
                <button
                  @click=${() => this.changeView('list')}
                  ?selected=${this.viewMode === 'list'}
                  aria-label=${msg('List View')}
                >
                  <img class="view-icon" src="dist/assets/list.png" alt=${msg('List View')} />
                </button>
              </div>
            </div>
          </div>
          <div class="search-container">
            <input
              type="search"
              placeholder="${msg('Search by name or email')}"
              @input=${this.onSearchInput}
              .value=${this.searchTerm}
            />
          </div>
        </header>

        ${this.viewMode === 'table' 
          ? this.renderTable(paginatedEmployees) 
          : this.renderList(paginatedEmployees)}

        <confirmation-modal
          id="deleteModal"
          title="${msg('Are you sure?')}"
          .message=${this.employeeToDelete ? 
            msg('Selected Employee record of {0} {1} will be deleted.')
              .replace('{0}', this.employeeToDelete.firstName || '')
              .replace('{1}', this.employeeToDelete.lastName || '') : 
            msg('Are you sure you want to delete this employee? This action cannot be undone.')}
          confirmText="${msg('Proceed')}"
          cancelText="${msg('Cancel')}"
          ?open=${this.showDeleteModal}
          @confirm=${this.confirmDelete}
          @close=${this.closeDeleteModal}
          ?loading=${this.isDeleting}
        ></confirmation-modal>
      </div>
    `;
  }

  renderPagination() {
    if (this.totalPages <= 1) return null;
    
    return html`
      <div class="pagination">
        <button 
          @click=${() => this.handlePageChange(1)} 
          ?disabled=${this.currentPage === 1}
          aria-label=${msg('First page')}
        >
          <img class="pagination-icon" src="dist/assets/double-left-arrow.png" alt=${msg('First page')} />
        </button>
        <button 
          @click=${() => this.handlePageChange(Math.max(1, this.currentPage - 1))}
          ?disabled=${this.currentPage === 1}
          aria-label=${msg('Previous page')}
        >
          <img class="pagination-icon" src="dist/assets/left-arrow.png" alt=${msg('Previous page')} />
        </button>
        
        ${Array.from({ length: Math.min(5, this.totalPages) }, (_, i) => {
          let pageNum;
          if (this.totalPages <= 5) {
            pageNum = i + 1;
          } else if (this.currentPage <= 3) {
            pageNum = i + 1;
          } else if (this.currentPage >= this.totalPages - 2) {
            pageNum = this.totalPages - 4 + i;
          } else {
            pageNum = this.currentPage - 2 + i;
          }
          return html`
            <button 
              @click=${() => this.handlePageChange(pageNum)}
              aria-label=${msg('Page {0}', [pageNum])}
              class="${this.currentPage === pageNum ? 'active' : ''}"
              aria-current=${ifDefined(this.currentPage === pageNum ? 'page' : undefined)}
            >
              ${pageNum}
            </button>
          `;
        })}
        
        <button 
          @click=${() => this.handlePageChange(Math.min(this.totalPages, this.currentPage + 1))}
          ?disabled=${this.currentPage === this.totalPages}
          aria-label=${msg('Next page')}
        >
          <img class="pagination-icon" src="dist/assets/right-arrow.png" alt=${msg('Next page')} />
        </button>
        <button 
          @click=${() => this.handlePageChange(this.totalPages)}
          ?disabled=${this.currentPage === this.totalPages}
          aria-label=${msg('Last page')}
        >
          <img class="pagination-icon" src="dist/assets/double-right-arrow.png" alt=${msg('Last page')} />
        </button>
      </div>
    `;
  }

  renderTable(paginatedEmployees) {
    return html`
      <div class="table-container">
        <table>
          <thead>
            <tr>
              ${this._tableColumns.map(column => html`
                <th 
                  @click=${() => column.sortable && this.handleSort(column.key)}
                  class="${column.sortable ? 'sortable' : ''} ${this.sortField === column.key ? 'sorted' : ''}"
                >
                  ${column.label}
                  ${column.sortable ? html`
                    <span class="sort-icon">
                      ${this.sortField === column.key 
                        ? html`
                            <img 
                              src="dist/assets/sort-${this.sortDirection === SORT_DIRECTION.ASC ? 'asc' : 'desc'}-arrow.png" 
                              alt="${this.sortDirection === SORT_DIRECTION.ASC ? 'Sort ascending' : 'Sort descending'}"
                              class="sort-arrow"
                            />
                          `
                        : html`
                            <img 
                              src="dist/assets/double-sort-arrow.png" 
                              alt="Sort"
                              class="sort-arrow"
                            />
                          `
                      }
                    </span>
                  ` : ''}
                </th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${paginatedEmployees.length === 0 ? html`
              <tr>
                <td colspan="${this._tableColumns.length}" class="empty-state">
                  <div>${msg('No employees found')}</div>
                  <p>${msg('Try adjusting your search or add a new employee')}</p>
                </td>
              </tr>
            ` : paginatedEmployees.map(emp => html`
              <tr>
                <td>${emp.firstName || '-'}</td>
                <td>${emp.lastName || '-'}</td>
                <td>${emp.doe ? new Date(emp.doe).toLocaleDateString() : '-'}</td>
                <td>${emp.dob ? new Date(emp.dob).toLocaleDateString() : '-'}</td>
                <td>${emp.phone || '-'}</td>
                <td>${emp.email || '-'}</td>
                <td>${emp.department || '-'}</td>
                <td>${emp.position || '-'}</td>
                <td class="actions">
                  <button class="edit" @click=${(e) => {
                    e.stopPropagation();
                    this.editEmployee(emp);
                  }}>
                    <img src="dist/assets/edit.png" alt="${msg('Edit')}" />
                  </button>
                  <button class="delete" @click=${(e) => this.showDeleteConfirmation(emp, e)}>
                    <img src="dist/assets/delete.png" alt="${msg('Delete')}" />
                  </button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
      ${this.renderPagination()}
    `;
  }

  renderList(paginatedEmployees) {
    return html`
      <div class="list-view">
        ${paginatedEmployees.length === 0 ? html`
          <div class="empty-state">
            <div>${msg('No employees found')}</div>
            <p>${msg('Try adjusting your search or add a new employee')}</p>
          </div>
        ` : paginatedEmployees.map(emp => html`
          <div class="list-item">
            <div><strong>${msg('First Name')}:</strong> ${emp.firstName || '-'}</div>
            <div><strong>${msg('Last Name')}:</strong> ${emp.lastName || '-'}</div>
            <div><strong>${msg('Date of Employment')}:</strong> ${emp.doe ? new Date(emp.doe).toLocaleDateString() : '-'}</div>
            <div><strong>${msg('Date of Birth')}:</strong> ${emp.dob ? new Date(emp.dob).toLocaleDateString() : '-'}</div>
            <div><strong>${msg('Phone')}:</strong> ${emp.phone || '-'}</div>
            <div><strong>${msg('Email')}:</strong> ${emp.email || '-'}</div>
            <div><strong>${msg('Department')}:</strong> ${emp.department || '-'}</div>
            <div><strong>${msg('Position')}:</strong> ${emp.position || '-'}</div>
            <div class="actions">
              <button class="edit" @click=${(e) => {
                e.stopPropagation();
                this.editEmployee(emp);
              }}>
                <img src="dist/assets/edit.png" alt=${msg('Edit')} />
              </button>
              <button class="delete" @click=${(e) => this.showDeleteConfirmation(emp, e)}>
                <img src="dist/assets/delete.png" alt=${msg('Delete')} />
              </button>
            </div>
          </div>
        `)}
      </div>
      ${this.renderPagination()}
    `;
  }

  changeView(mode) {
    this.viewMode = mode;
  }

  onSearchInput(e) {
    this.searchTerm = e.target.value;
  }

  showDeleteConfirmation(employee, event) {
    event.stopPropagation();
    this.employeeToDelete = employee;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.employeeToDelete = null;
    this.isDeleting = false;
    this.requestUpdate(); 
  }

  confirmDelete() {
    if (!this.employeeToDelete) return;
    
    this.isDeleting = true;
    this.requestUpdate(); 
    
    setTimeout(() => {
      try {
        const updatedEmployees = this.employees.filter(emp => emp.id !== this.employeeToDelete.id);
        this.employees = [...updatedEmployees]; 
        localStorage.setItem('employees', JSON.stringify(updatedEmployees));
        
        const filteredEmployees = this.getFilteredEmployees();
        this.totalPages = Math.max(1, Math.ceil(filteredEmployees.length / this.pageSize));
        if (this.currentPage > this.totalPages) {
          this.currentPage = Math.max(1, this.totalPages);
        }
        
        this.closeDeleteModal();
      } catch (error) {
        console.error('Error deleting employee:', error);
        this.isDeleting = false;
        this.requestUpdate();
      }
    }, 500);
  }
  
  deleteEmployee(employee) {
    this.showDeleteConfirmation(employee);
  }

  editEmployee(employee) {
    if (employee && employee.id) {
      window.history.pushState({}, '', `/employees/edit/${employee.id}`);
      window.dispatchEvent(new CustomEvent('popstate'));
    }
  }

  handleUpdateEmployee = (e) => {
    e.stopPropagation();
    const { employee } = e.detail;
    
    const currentEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    
    const index = currentEmployees.findIndex(emp => emp.id === employee.id);
    
    if (index !== -1) {
      const updatedEmployees = [
        ...currentEmployees.slice(0, index),
        { ...employee },
        ...currentEmployees.slice(index + 1)
      ];
      
      this.employees = updatedEmployees;
      
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      
      this.requestUpdate();
      
      this.totalPages = Math.ceil(updatedEmployees.length / this.pageSize);
    }
  }

  handleAddEmployee = (e) => {
    e.stopPropagation();
    const { employee } = e.detail;
    
    const updatedEmployees = [...this.employees, employee];
    
    this.employees = updatedEmployees;
    
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    
    this.totalPages = Math.ceil(updatedEmployees.length / this.pageSize);
    
    this.requestUpdate();
    
    window.history.pushState({}, '', '/employees');
    window.dispatchEvent(new CustomEvent('popstate'));
  }
}

customElements.define('employee-list', EmployeeList);
