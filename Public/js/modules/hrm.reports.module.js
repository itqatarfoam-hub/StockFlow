// ============================================
// STOCKFLOW - HRM REPORTS MODULE
// Comprehensive HR Reporting System
// ============================================

const hrmReportsModule = {
    currentReport: null,
    reportData: null,

    render() {
        return `
      <div class="hrm-reports-page">
        <div class="page-header">
          <div class="header-left">
            <h2>📊 HR Reports</h2>
            <p class="page-description">Generate and export comprehensive HR reports</p>
          </div>
        </div>

        <!-- Report Selection Grid -->
        <div class="reports-grid">
          <div class="report-card" onclick="hrmReportsModule.selectReport('employees')">
            <div class="report-icon">👥</div>
            <h3>Employee List</h3>
            <p>Complete employee directory with filters</p>
          </div>

          <div class="report-card" onclick="hrmReportsModule.selectReport('leave')">
            <div class="report-icon">🏖️</div>
            <h3>Leave Report</h3>
            <p>Leave requests, balances & history</p>
          </div>

          <div class="report-card" onclick="hrmReportsModule.selectReport('attendance')">
            <div class="report-icon">📊</div>
            <h3>Attendance Report</h3>
            <p>Daily attendance & work hours</p>
          </div>

          <div class="report-card" onclick="hrmReportsModule.selectReport('payroll')">
            <div class="report-icon">💰</div>
            <h3>Payroll Report</h3>
            <p>Salary details & payment history</p>
          </div>

          <div class="report-card" onclick="hrmReportsModule.selectReport('assets')">
            <div class="report-icon">📦</div>
            <h3>Asset Assignment</h3>
            <p>Company assets & assignments</p>
          </div>

          <div class="report-card" onclick="hrmReportsModule.selectReport('vehicles')">
            <div class="report-icon">🚗</div>
            <h3>Vehicle Maintenance</h3>
            <p>Vehicle service & costs</p>
          </div>

          <div class="report-card" onclick="hrmReportsModule.selectReport('expiry')">
            <div class="report-icon">⚠️</div>
            <h3>Document Expiry</h3>
            <p>Expiring documents & alerts</p>
          </div>

          <div class="report-card" onclick="hrmReportsModule.selectReport('department')">
            <div class="report-icon">🏢</div>
            <h3>Department Summary</h3>
            <p>Department-wise statistics</p>
          </div>

          <div class="report-card" onclick="hrmReportsModule.selectReport('joining')">
            <div class="report-icon">📅</div>
            <h3>Joining/Termination</h3>
            <p>Employee movement report</p>
          </div>

          <div class="report-card" onclick="hrmReportsModule.selectReport('documents')">
            <div class="report-icon">📄</div>
            <h3>Document Workflow</h3>
            <p>Issue/submission logs</p>
          </div>

          <div class="report-card" onclick="hrmReportsModule.selectReport('monthly')">
            <div class="report-icon">📈</div>
            <h3>Monthly Statistics</h3>
            <p>Comprehensive monthly analytics</p>
          </div>

          <div class="report-card" onclick="hrmReportsModule.selectReport('custom')">
            <div class="report-icon">⚙️</div>
            <h3>Custom Report</h3>
            <p>Build your own report</p>
          </div>
        </div>
      </div>
    `;
    },

    attachListeners(app) {
        this.app = app;
    },

    selectReport(type) {
        this.currentReport = type;
        this.showReportFilters(type);
    },

    showReportFilters(type) {
        const filters = this.getReportFilters(type);
        const title = this.getReportTitle(type);

        const modalHTML = `
      <div id="reportModal" class="modal active">
        <div class="modal-content large-modal">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" onclick="hrmReportsModule.closeModal()">×</button>
          </div>

          <form id="reportForm" class="hrm-form">
            ${filters}

            <div class="form-button-group">
              <button type="button" class="btn-secondary" onclick="hrmReportsModule.closeModal()">
                Cancel
              </button>
              <button type="button" class="btn-secondary" onclick="hrmReportsModule.generateReport('pdf')">
                📄 Export PDF
              </button>
              <button type="button" class="btn-primary" onclick="hrmReportsModule.generateReport('csv')">
                📊 Export CSV
              </button>
              <button type="submit" class="btn-primary">
                👁️ Preview
              </button>
            </div>
          </form>

          <div id="reportPreview" class="report-preview"></div>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('reportForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.previewReport();
        });
    },

    getReportFilters(type) {
        const commonFilters = `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">From Date</label>
          <input type="date" name="from_date" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">To Date</label>
          <input type="date" name="to_date" class="form-input">
        </div>
      </div>
    `;

        const typeSpecificFilters = {
            employees: `
        ${commonFilters}
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Department</label>
            <select name="department" class="form-input">
              <option value="">All Departments</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select name="status" class="form-input">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Resigned">Resigned</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>
      `,

            leave: `
        ${commonFilters}
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Leave Type</label>
            <select name="leave_type" class="form-input">
              <option value="">All Types</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select name="status" class="form-input">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      `,

            attendance: `
        ${commonFilters}
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Employee</label>
            <select name="employee_id" class="form-input">
              <option value="">All Employees</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Month/Year</label>
            <input type="month" name="month" class="form-input">
          </div>
        </div>
      `,

            payroll: `
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required">Month</label>
            <input type="month" name="month" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label">Department</label>
            <select name="department" class="form-input">
              <option value="">All Departments</option>
            </select>
          </div>
        </div>
      `,

            expiry: `
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Document Type</label>
            <select name="doc_type" class="form-input">
              <option value="">All Types</option>
              <option value="Passport">Passport</option>
              <option value="Visa">Visa</option>
              <option value="Medical_Card">Medical Card</option>
              <option value="Vehicle">Vehicle Documents</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Days Until Expiry</label>
            <input type="number" name="days" class="form-input" value="30" min="0">
          </div>
        </div>
      `,

            department: `
        <div class="form-grid">
          <div class="form-group full-width">
            <label class="form-label">Department</label>
            <select name="department" class="form-input">
              <option value="">All Departments</option>
            </select>
          </div>
        </div>
      `
        };

        return typeSpecificFilters[type] || commonFilters;
    },

    getReportTitle(type) {
        const titles = {
            employees: '📊 Employee List Report',
            leave: '🏖️ Leave Report',
            attendance: '📊 Attendance Report',
            payroll: '💰 Payroll Report',
            assets: '📦 Asset Assignment Report',
            vehicles: '🚗 Vehicle Maintenance Report',
            expiry: '⚠️ Document Expiry Report',
            department: '🏢 Department Summary Report',
            joining: '📅 Joining/Termination Report',
            documents: '📄 Document Workflow Report',
            monthly: '📈 Monthly Statistics Report',
            custom: '⚙️ Custom Report'
        };
        return titles[type] || 'Report';
    },

    async previewReport() {
        const form = document.getElementById('reportForm');
        const formData = new FormData(form);
        const params = new URLSearchParams(formData);

        try {
            const response = await fetch(`/api/hrm/reports/${this.currentReport}?${params}`, {
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.reportData = data.data;
                this.renderPreview();
            } else {
                ui.showToast(data.error || 'Failed to generate report', 'error');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    renderPreview() {
        const preview = document.getElementById('reportPreview');

        if (!this.reportData || !this.reportData.length) {
            preview.innerHTML = '<div class="no-data">No data found for selected filters</div>';
            return;
        }

        // Create table
        const columns = Object.keys(this.reportData[0]);

        let html = `
      <div class="report-preview-header">
        <h4>${this.getReportTitle(this.currentReport)}</h4>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Records: ${this.reportData.length}</p>
      </div>
      
      <div class="table-container">
        <table class="report-table">
          <thead>
            <tr>
              ${columns.map(col => `<th>${this.formatColumnName(col)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${this.reportData.map(row => `
              <tr>
                ${columns.map(col => `<td>${this.formatCellValue(row[col], col)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${this.renderSummary()}
    `;

        preview.innerHTML = html;
    },

    renderSummary() {
        if (this.currentReport === 'payroll') {
            const total = this.reportData.reduce((sum, row) => sum + parseFloat(row.net_salary || 0), 0);
            return `
        <div class="report-summary">
          <h4>Summary</h4>
          <p><strong>Total Payroll:</strong> ${StockFlowUtils.formatCurrency(total)}</p>
          <p><strong>Employees:</strong> ${this.reportData.length}</p>
        </div>
      `;
        }

        if (this.currentReport === 'attendance') {
            const totalDays = this.reportData.filter(r => r.status === 'Present').length;
            const totalHours = this.reportData.reduce((sum, r) => sum + parseFloat(r.work_hours || 0), 0);
            return `
        <div class="report-summary">
          <h4>Summary</h4>
          <p><strong>Total Present Days:</strong> ${totalDays}</p>
          <p><strong>Total Work Hours:</strong> ${totalHours.toFixed(2)}h</p>
        </div>
      `;
        }

        return '';
    },

    formatColumnName(col) {
        return col.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    formatCellValue(value, column) {
        if (value === null || value === undefined) return '-';

        // Format dates
        if (column.includes('date') && value) {
            return new Date(value).toLocaleDateString();
        }

        // Format currency
        if (['salary', 'amount', 'cost', 'pay'].some(word => column.includes(word))) {
            return StockFlowUtils.formatCurrency(value);
        }

        // Format hours
        if (column.includes('hours')) {
            return `${value}h`;
        }

        return value;
    },

    async generateReport(format) {
        const form = document.getElementById('reportForm');
        const formData = new FormData(form);
        const params = new URLSearchParams(formData);
        params.append('format', format);

        const url = `/api/hrm/reports/${this.currentReport}/export?${params}`;
        window.open(url, '_blank');

        ui.showToast(`Report exported as ${format.toUpperCase()}`, 'success');
    },

    closeModal() {
        const modal = document.getElementById('reportModal');
        if (modal) modal.remove();
    }
};

window.hrmReportsModule = hrmReportsModule;
