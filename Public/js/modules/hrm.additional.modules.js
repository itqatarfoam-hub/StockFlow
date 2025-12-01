// ============================================
// STOCKFLOW - HRM VEHICLES MODULE
// Vehicle Management & Maintenance Tracking
// ============================================

const hrmVehiclesModule = {
    vehicles: [],

    render() {
        return `
      <div class="hrm-vehicles-page">
        <div class="page-header">
          <div class="header-left">
            <h2>🚗 Vehicle Management</h2>
            <p class="page-description">Manage company vehicles and maintenance</p>
          </div>
          <div class="header-actions">
            <button class="btn-primary" onclick="hrmVehiclesModule.openAddVehicle()">
              ➕ Add Vehicle
            </button>
          </div>
        </div>

        <!-- Vehicles Grid -->
        <div id="vehiclesGrid" class="vehicles-grid">
          <div class="loading">Loading vehicles...</div>
        </div>
      </div>
    `;
    },

    async attachListeners(app) {
        this.app = app;
        await this.loadVehicles();
    },

    async loadVehicles() {
        try {
            const response = await fetch('/api/hrm/vehicles', { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                this.vehicles = data.vehicles || [];
                this.renderVehicles();
            }
        } catch (error) {
            console.error('Error loading vehicles:', error);
        }
    },

    renderVehicles() {
        const container = document.getElementById('vehiclesGrid');

        if (!this.vehicles.length) {
            container.innerHTML = '<div class="no-data">No vehicles found</div>';
            return;
        }

        container.innerHTML = this.vehicles.map(v => `
      <div class="vehicle-card">
        <div class="vehicle-header">
          <h3>🚗 ${v.vehicle_type || 'Vehicle'}</h3>
          <span class="plate-number">${v.plate_number}</span>
        </div>
        
        <div class="vehicle-details">
           <p><strong>Model:</strong> ${v.model || 'N/A'}</p>
          <p><strong>Chassis:</strong> ${v.chassis_number || 'N/A'}</p>
          <p><strong>Registration Expiry:</strong> 
            <span class="${this.isExpiring(v.registration_expiry_date) ? 'text-danger' : ''}">
              ${StockFlowUtils.formatDate(v.registration_expiry_date)}
            </span>
          </p>
          <p><strong>Insurance Expiry:</strong> 
            <span class="${this.isExpiring(v.insurance_expiry_date) ? 'text-danger' : ''}">
              ${StockFlowUtils.formatDate(v.insurance_expiry_date)}
            </span>
          </p>
          ${v.assigned_to_name ? `<p><strong>Assigned to:</strong> ${v.assigned_to_name}</p>` : ''}
        </div>

        <div class="vehicle-actions">
          <button class="btn-sm" onclick="hrmVehiclesModule.editVehicle(${v.id})">Edit</button>
          <button class="btn-sm" onclick="hrmVehiclesModule.addMaintenance(${v.id})">Maintenance</button>
          <button class="btn-sm" onclick="hrmVehiclesModule.viewHistory(${v.id})">History</button>
        </div>
      </div>
    `).join('');
    },

    isExpiring(date) {
        if (!date) return false;
        const expiry = new Date(date);
        const today = new Date();
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    },

    openAddVehicle() {
        this.showVehicleModal();
    },

    showVehicleModal(vehicle = null) {
        const isEdit = vehicle !== null;
        const modalHTML = `
      <div id="vehicleModal" class="modal active">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${isEdit ? 'Edit' : 'Add'} Vehicle</h3>
            <button class="modal-close" onclick="hrmVehiclesModule.closeModal()">×</button>
          </div>

          <form id="vehicleForm" class="hrm-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Plate Number</label>
                <input type="text" name="plate_number" class="form-input" required value="${vehicle?.plate_number || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Vehicle Type</label>
                <input type="text" name="vehicle_type" class="form-input" value="${vehicle?.vehicle_type || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Model</label>
                <input type="text" name="model" class="form-input" value="${vehicle?.model || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Chassis Number</label>
                <input type="text" name="chassis_number" class="form-input" value="${vehicle?.chassis_number || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Registration Expiry</label>
                <input type="date" name="registration_expiry_date" class="form-input" value="${vehicle?.registration_expiry_date || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Insurance Expiry</label>
                <input type="date" name="insurance_expiry_date" class="form-input" value="${vehicle?.insurance_expiry_date || ''}">
              </div>
            </div>

            <div class="form-button-group">
              <button type="button" class="btn-secondary" onclick="hrmVehiclesModule.closeModal()">Cancel</button>
              <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Add'} Vehicle</button>
            </div>
          </form>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveVehicle(e.target, vehicle?.id);
        });
    },

    async saveVehicle(form, id = null) {
        const formData = new FormData(form);
        const url = id ? `/api/hrm/vehicles/${id}` : '/api/hrm/vehicles';
        const method = id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, body: formData, credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                ui.showToast(`Vehicle ${id ? 'updated' : 'added'} successfully`, 'success');
                this.closeModal();
                await this.loadVehicles();
            } else {
                ui.showToast(data.error || 'Failed to save vehicle', 'error');
            }
        } catch (error) {
            console.error('Error saving vehicle:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    async editVehicle(id) {
        const vehicle = this.vehicles.find(v => v.id === id);
        this.showVehicleModal(vehicle);
    },

    addMaintenance(id) {
        alert('Maintenance log feature coming soon!');
    },

    viewHistory(id) {
        alert('Vehicle history coming soon!');
    },

    closeModal() {
        const modal = document.getElementById('vehicleModal');
        if (modal) modal.remove();
    }
};

window.hrmVehiclesModule = hrmVehiclesModule;


// ============================================
// STOCKFLOW - HRM DOCUMENTS WORKFLOW MODULE
// Document Management & Tracking
// ============================================

const hrmDocumentsModule = {
    documents: [],

    render() {
        return `
      <div class="hrm-documents-page">
        <div class="page-header">
          <div class="header-left">
            <h2>📄 Document Management</h2>
            <p class="page-description">Manage employee documents and workflow</p>
          </div>
          <div class="header-actions">
            <button class="btn-primary" onclick="hrmDocumentsModule.openUpload()">
              ⬆️ Upload Document
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="leave-tabs">
          <button class="tab-btn active" onclick="hrmDocumentsModule.switchTab('all')">All Documents</button>
          <button class="tab-btn" onclick="hrmDocumentsModule.switchTab('expiring')">Expiring Soon</button>
          <button class="tab-btn" onclick="hrmDocumentsModule.switchTab('categories')">By Category</button>
        </div>

        <!-- Documents List -->
        <div id="documentsContent">
          <div class="loading">Loading documents...</div>
        </div>
      </div>
    `;
    },

    async attachListeners(app) {
        this.app = app;
        await this.loadDocuments();
    },

    async loadDocuments() {
        try {
            const response = await fetch('/api/hrm/documents', { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                this.documents = data.documents || [];
                this.renderDocuments();
            }
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    },

    renderDocuments() {
        const container = document.getElementById('documentsContent');

        if (!this.documents.length) {
            container.innerHTML = '<div class="no-data">No documents found</div>';
            return;
        }

        container.innerHTML = `
      <div class="documents-list">
        ${this.documents.map(doc => `
          <div class="document-item">
            <div class="doc-icon">📄</div>
            <div class="doc-info">
              <h4>${doc.document_name}</h4>
              <p>${doc.employee_name} • ${doc.document_category || 'General'}</p>
              <small>Uploaded: ${StockFlowUtils.formatDate(doc.created_at)}</small>
            </div>
            <div class="doc-actions">
              <a href="${doc.document_path}" target="_blank" class="btn-sm">Download</a>
              <button class="btn-sm" onclick="hrmDocumentsModule.deleteDocument(${doc.id})">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    },

    openUpload() {
        const modalHTML = `
      <div id="docModal" class="modal active">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Upload Document</h3>
            <button class="modal-close" onclick="hrmDocumentsModule.closeModal()">×</button>
          </div>

          <form id="docForm" class="hrm-form">
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label required">Employee</label>
                <select name="employee_id" class="form-input" required id="docEmployeeSelect">
                  <option value="">Select Employee</option>
                </select>
             </div>
              <div class="form-group">
                <label class="form-label required">Document Name</label>
                <input type="text" name="document_name" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" name="document_category" class="form-input">
              </div>
              <div class="form-group full-width">
                <label class="form-label required">File</label>
                <input type="file" name="document" class="form-input" required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
              </div>
            </div>

            <div class="form-button-group">
              <button type="button" class="btn-secondary" onclick="hrmDocumentsModule.closeModal()">Cancel</button>
              <button type="submit" class="btn-primary">Upload</button>
            </div>
          </form>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.loadEmployeesForDoc();

        document.getElementById('docForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.uploadDocument(e.target);
        });
    },

    async loadEmployeesForDoc() {
        try {
            const response = await fetch('/api/hrm/employees?status=Active', { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                const select = document.getElementById('docEmployeeSelect');
                data.employees.forEach(emp => {
                    select.innerHTML += `<option value="${emp.id}">${emp.full_name} (${emp.employee_id})</option>`;
                });
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    },

    async uploadDocument(form) {
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/hrm/documents/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Document uploaded successfully', 'success');
                this.closeModal();
                await this.loadDocuments();
            } else {
                ui.showToast(data.error || 'Failed to upload', 'error');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    switchTab(tab) {
        // Tab switching logic
        this.renderDocuments();
    },

    async deleteDocument(id) {
        if (!confirm('Delete this document?')) return;

        try {
            const response = await fetch(`/api/hrm/documents/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Document deleted', 'success');
                await this.loadDocuments();
            } else {
                ui.showToast(data.error || 'Failed to delete', 'error');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    openExpiryList() {
        // Show expiring documents
    },

    closeModal() {
        const modal = document.getElementById('docModal');
        if (modal) modal.remove();
    }
};

window.hrmDocumentsModule = hrmDocumentsModule;


// ============================================
// STOCKFLOW - HRM PAYROLL MODULE
// Salary Management & Payslip Generation
// ============================================

const hrmPayrollModule = {
    payrolls: [],

    render() {
        return `
      <div class="hrm-payroll-page">
        <div class="page-header">
          <div class="header-left">
            <h2>💰 Payroll Management</h2>
            <p class="page-description">Manage employee salaries and payslips</p>
          </div>
          <div class="header-actions">
            <button class="btn-primary" onclick="hrmPayrollModule.openGeneratePayroll()">
              ➕ Generate Payroll
            </button>
          </div>
        </div>

        <!-- Month Selector -->
        <div class="filters-bar">
          <select id="payrollMonth" onchange="hrmPayrollModule.loadPayrolls()">
            ${this.generateMonthOptions()}
          </select>
          <select id="payrollStatus" onchange="hrmPayrollModule.loadPayrolls()">
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Processed">Processed</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        <!-- Payroll Summary -->
        <div class="payroll-summary">
          <div class="summary-card">
            <h4 id="totalPayroll">$0</h4>
            <p>Total Payroll</p>
          </div>
          <div class="summary-card">
            <h4 id="employeeCount">0</h4>
            <p>Employees</p>
          </div>
          <div class="summary-card">
            <h4 id="avgSalary">$0</h4>
            <p>Average Salary</p>
          </div>
        </div>

        <!-- Payroll Table -->
        <div id="payrollTable">
          <div class="loading">Loading payroll...</div>
        </div>
      </div>
    `;
    },

    async attachListeners(app) {
        this.app = app;
        await this.loadPayrolls();
    },

    async loadPayrolls() {
        try {
            const month = document.getElementById('payrollMonth')?.value;
            const status = document.getElementById('payrollStatus')?.value;

            let url = '/api/hrm/payroll?';
            if (month) url += `month=${month}&`;
            if (status) url += `status=${status}`;

            const response = await fetch(url, { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                this.payrolls = data.payrolls || [];
                this.renderPayrolls();
                this.updateSummary();
            }
        } catch (error) {
            console.error('Error loading payroll:', error);
        }
    },

    renderPayrolls() {
        const container = document.getElementById('payrollTable');

        if (!this.payrolls.length) {
            container.innerHTML = '<div class="no-data">No payroll records found</div>';
            return;
        }

        container.innerHTML = `
      <table class="hrm-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Base Salary</th>
            <th>Overtime</th>
            <th>Deductions</th>
            <th>Net Salary</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.payrolls.map(p => `
            <tr>
              <td>${p.employee_name}</td>
              <td>${StockFlowUtils.formatCurrency(p.base_salary)}</td>
              <td>${StockFlowUtils.formatCurrency(p.overtime_pay || 0)}</td>
              <td>${StockFlowUtils.formatCurrency(p.deductions || 0)}</td>
              <td><strong>${StockFlowUtils.formatCurrency(p.net_salary)}</strong></td>
              <td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
              <td>
                <button class="btn-sm" onclick="hrmPayrollModule.viewPayslip(${p.id})">Payslip</button>
                ${p.status === 'Draft' ? `
                  <button class="btn-sm" onclick="hrmPayrollModule.approvePayroll(${p.id})">Approve</button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    },

    updateSummary() {
        const total = this.payrolls.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0);
        const avg = this.payrolls.length ? total / this.payrolls.length : 0;

        document.getElementById('totalPayroll').textContent = StockFlowUtils.formatCurrency(total);
        document.getElementById('employeeCount').textContent = this.payrolls.length;
        document.getElementById('avgSalary').textContent = StockFlowUtils.formatCurrency(avg);
    },

    generateMonthOptions() {
        const months = [];
        const now = new Date();

        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            months.push(`<option value="${value}" ${i === 0 ? 'selected' : ''}>${label}</option>`);
        }

        return months.join('');
    },

    openGeneratePayroll() {
        alert('Generate payroll for selected month');
    },

    viewPayslip(id) {
        window.open(`/api/hrm/payroll/payslip/${id}`, '_blank');
    },

    async approvePayroll(id) {
        try {
            const response = await fetch(`/api/hrm/payroll/approve/${id}`, {
                method: 'PUT',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Payroll approved', 'success');
                await this.loadPayrolls();
            } else {
                ui.showToast(data.error || 'Failed to approve', 'error');
            }
        } catch (error) {
            console.error('Error approving payroll:', error);
            ui.showToast('An error occurred', 'error');
        }
    }
};

window.hrmPayrollModule = hrmPayrollModule;
