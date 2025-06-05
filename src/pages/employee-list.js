import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { generateEmployees } from '../utils/employeeGenerator.js';
import '../components/confirmation-modal.js';

const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc'
};

const TABLE_COLUMNS = [
  { key: 'firstName', label: 'First Name', sortable: true },
  { key: 'lastName', label: 'Last Name', sortable: true },
  { key: 'doe', label: 'Date of Employment', sortable: true },
  { key: 'dob', label: 'Date of Birth', sortable: true },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'position', label: 'Position', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
];

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
    isDeleting: { type: Boolean, state: true }
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
    
    this.handleUpdateEmployee = this.handleUpdateEmployee.bind(this);
  }

  firstUpdated() {
    const modal = this.renderRoot.querySelector('confirmation-modal');
    console.log('Confirmation modal element:', modal);
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadEmployees();

    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('add-employee', this.handleAddEmployee);
    window.removeEventListener('update-employee', this.handleUpdateEmployee);
    
    window.addEventListener('popstate', this.handlePopState);
    window.addEventListener('add-employee', this.handleAddEmployee);
    window.addEventListener('update-employee', this.handleUpdateEmployee);
    
    this.addEventListener('add-employee', this.handleAddEmployee);
    this.addEventListener('update-employee', this.handleUpdateEmployee);
  }

  disconnectedCallback() {
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('add-employee', this.handleAddEmployee);
    window.removeEventListener('update-employee', this.handleUpdateEmployee);
    
    this.removeEventListener('add-employee', this.handleAddEmployee);
    this.removeEventListener('update-employee', this.handleUpdateEmployee);
    
    super.disconnectedCallback();
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      box-sizing: border-box;
      font-family: var(--font-family, Arial, sans-serif);
      color: var(--text-color, #333);
    }

    .list-container {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    header {
      padding: 24px 24px 8px;
      border-bottom: 1px solid #eee;
      background: #fff;
    }

    header h2 {
      margin: 0;
      font-size: 28px;
      color: var(--primary-color, #ff6600);
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
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-family: inherit;
      transition: all 0.2s;
    }

    .search-container input[type="search"]:focus {
      outline: none;
      border-color: var(--primary-color, #ff6600);
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
      background: #f5f5f5;
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
      border-bottom: 1px solid #eee;
      font-size: 15px;
      white-space: nowrap;
    }

    th {
      background-color: #fff;
      color: var(--primary-color);
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.8px;
    }

    tbody tr {
      transition: background-color 0.2s;
    }

    tbody tr:hover {
      background-color: #f9fafb;
    }

    .list-view {
      padding: 16px;
    }

    .list-item {
      background: #fff;
      border: 1px solid #eee;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 16px;
      transition: all 0.2s;
    }

    .list-item:hover {
      border-color: var(--primary-color, #ff6600);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .list-item > div {
      margin: 8px 0;
      display: flex;
      flex-wrap: wrap;
    }

    .list-item strong {
      min-width: 160px;
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
      color: #6b7280;
    }

    .empty-state p {
      margin: 8px 0 0;
      color: #9ca3af;
    }

    th.sortable {
      cursor: pointer;
      user-select: none;
      position: relative;
      padding-right: 24px;
    }

    th.sortable:hover {
      background-color: #f5f5f5;
    }

    .sort-icon {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: #666;
    }

    th.sorted {
      color: var(--primary-color);
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

    @media (max-width: var(--bs-breakpoint-md)) {
      :host {
        padding: 0;
      }

      .list-container {
        border-radius: 0;
        box-shadow: none;
      }

      header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        padding: 16px;
      }

      .header-actions {
        flex-direction: column;
        gap: 16px;
      }

      .search-container {
        max-width: 100%;
      }

      .view-toggle {
        align-self: flex-start;
      }

      .table-container {
        border-radius: 0;
      }

      th, td {
        padding: 12px 8px;
      }
    }

    @media (max-width: var(--bs-breakpoint-sm)) {
      .list-item > div {
        flex-direction: column;
        gap: 4px;
      }

      .list-item strong {
        min-width: 100%;
        margin-bottom: 4px;
      }
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

      if (this.sortField === 'doe' || this.sortField === 'dob') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      } else if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return this.sortDirection === SORT_DIRECTION.ASC ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === SORT_DIRECTION.ASC ? 1 : -1;
      }
      return 0;
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
            <h2>Employee List</h2>
            <div class="header-actions">
              <div class="view-toggle">
                <button
                  @click=${() => this.changeView('table')}
                  ?selected=${this.viewMode === 'table'}
                  aria-label="Table View"
                >
                  <img class="view-icon" src="dist/assets/table.png" alt="Table View" />
                </button>
                <button
                  @click=${() => this.changeView('list')}
                  ?selected=${this.viewMode === 'list'}
                  aria-label="List View"
                >
                  <img class="view-icon" src="dist/assets/list.png" alt="List View" />
                </button>
              </div>
            </div>
          </div>
          <div class="search-container">
            <input
              type="search"
              placeholder="Search by name or email"
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
          title="Are you sure?"
          message="${this.employeeToDelete ? `Selected Employee record of ${this.employeeToDelete.firstName} ${this.employeeToDelete.lastName} will be deleted.` : 'Are you sure you want to delete this employee? This action cannot be undone.'}"
          confirmText="Proceed"
          cancelText="Cancel"
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
          aria-label="First page"
        >
          <img class="pagination-icon" src="dist/assets/double-left-arrow.png" alt="Double Left Arrow" />
        </button>
        <button 
          @click=${() => this.handlePageChange(Math.max(1, this.currentPage - 1))}
          ?disabled=${this.currentPage === 1}
          aria-label="Previous page"
        >
          <img class="pagination-icon" src="dist/assets/left-arrow.png" alt="Left Arrow" />
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
              aria-label="Page ${pageNum}"
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
          aria-label="Next page"
        >
          <img class="pagination-icon" src="dist/assets/right-arrow.png" alt="Right Arrow" />
        </button>
        <button 
          @click=${() => this.handlePageChange(this.totalPages)}
          ?disabled=${this.currentPage === this.totalPages}
          aria-label="Last page"
        >
          <img class="pagination-icon" src="dist/assets/double-right-arrow.png" alt="Double Right Arrow" />
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
              ${TABLE_COLUMNS.map(column => html`
                <th 
                  @click=${() => column.sortable && this.handleSort(column.key)}
                  class="${column.sortable ? 'sortable' : ''} ${this.sortField === column.key ? 'sorted' : ''}"
                >
                  ${column.label}
                  ${column.sortable ? html`
                    <span class="sort-icon">
                      ${this.sortField === column.key 
                        ? this.sortDirection === SORT_DIRECTION.ASC ? '↑' : '↓'
                        : '↕'}
                    </span>
                  ` : ''}
                </th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${paginatedEmployees.length === 0 ? html`
              <tr>
                <td colspan="${TABLE_COLUMNS.length}" class="empty-state">
                  <div>No employees found</div>
                  <p>Try adjusting your search or add a new employee</p>
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
                    <img src="dist/assets/edit.png" alt="Edit" />
                  </button>
                  <button class="delete" @click=${(e) => this.showDeleteConfirmation(emp, e)}>
                    <img src="dist/assets/delete.png" alt="Delete" />
                  </button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
        ${this.renderPagination()}
      </div>
    `;
  }

  renderList(paginatedEmployees) {
    return html`
      <div class="list-view">
        ${paginatedEmployees.length === 0 ? html`
          <div class="empty-state">
            <div>No employees found</div>
            <p>Try adjusting your search or add a new employee</p>
          </div>
        ` : paginatedEmployees.map(emp => html`
          <div class="list-item">
            <div><strong>First Name:</strong> ${emp.firstName || '-'}</div>
            <div><strong>Last Name:</strong> ${emp.lastName || '-'}</div>
            <div><strong>Date of Employment:</strong> ${emp.doe ? new Date(emp.doe).toLocaleDateString() : '-'}</div>
            <div><strong>Date of Birth:</strong> ${emp.dob ? new Date(emp.dob).toLocaleDateString() : '-'}</div>
            <div><strong>Phone:</strong> ${emp.phone || '-'}</div>
            <div><strong>Email:</strong> ${emp.email || '-'}</div>
            <div><strong>Department:</strong> ${emp.department || '-'}</div>
            <div><strong>Position:</strong> ${emp.position || '-'}</div>
            <div class="actions">
              <button class="edit" @click=${(e) => {
                e.stopPropagation();
                this.editEmployee(emp);
              }}>
                <img src="dist/assets/edit.png" alt="Edit" />
              </button>
              <button class="delete" @click=${(e) => this.showDeleteConfirmation(emp, e)}>
                <img src="dist/assets/delete.png" alt="Delete" />
              </button>
            </div>
          </div>
        `)}
        ${this.renderPagination()}
      </div>
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
