// ============================================
// STOCKFLOW - HRM EMPLOYEE SELF-SERVICE DASHBOARD
// Employee Portal for Personal HR Management
// ============================================

const hrmEmployeeDashboardModule = {
    myData: null,

    render() {
        return `
      <div class="hrm-employee-portal">
        <div class="page-header">
          <div class="header-left">
            <h2>👤 My HR Portal</h2>
            <p class="page-description">Manage your personal HR information</p>
          </div>
        </div>

        <!-- Employee Info Summary -->
        <div class="employee-info-card">
          <div class="info-header">
            <div class="employee-avatar" id="empAvatar">
              <span id="empInitials">--</span>
            </div>
            <div class="employee-basic-info">
              <h2 id="empName">Loading...</h2>
              <p id="empPosition">-</p>
              <p class="emp-meta">
                <span id="empId">EMP-000</span> • 
                <span id="empDepartment">Department</span> • 
                <span id="empJoining">Joined: --</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="portal-stats-grid">
          <div class="portal-stat-card">
            <div class="stat-icon">🏖️</div>
            <div class="stat-details">
              <h3 id="leaveBalance">0</h3>
              <p>Annual Leave Balance</p>
            </div>
          </div>
          <div class="portal-stat-card">
            <div class="stat-icon">⏰</div>
            <div class="stat-details">
              <h3 id="workHours">0h</h3>
              <p>This Month Hours</p>
            </div>
          </div>
          <div class="portal-stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-details">
              <h3 id="assignedAssets">0</h3>
              <p>Assigned Assets</p>
            </div>
          </div>
          <div class="portal-stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-details">
              <h3 id="lastSalary">$0</h3>
              <p>Last Salary</p>
            </div>
          </div>
        </div>

        <!-- Portal Sections -->
        <div class="portal-sections">
          <!-- Leave Section -->
          <div class="portal-section">
            <div class="section-header">
              <h3>🏖️ My Leave</h3>
              <button class="btn-sm" onclick="hrmLeaveModule.openApplyLeave()">
                Apply Leave
              </button>
            </div>
            <div id="myLeaveSection">
              <div class="loading">Loading leave data...</div>
            </div>
          </div>

          <!-- Attendance Section -->
          <div class="portal-section">
            <div class="section-header">
              <h3>📊 My Attendance</h3>
              <button class="btn-sm" onclick="hrmEmployeeDashboardModule.viewFullAttendance()">
                View All
              </button>
            </div>
            <div id="myAttendanceSection">
              <div class="loading">Loading attendance...</div>
            </div>
          </div>

          <!-- Assets Section -->
          <div class="portal-section">
            <div class="section-header">
              <h3>📦 My Assets</h3>
            </div>
            <div id="myAssetsSection">
              <div class="loading">Loading assets...</div>
            </div>
          </div>

          <!-- Documents Section -->
          <div class="portal-section">
            <div class="section-header">
              <h3>📄 My Documents</h3>
            </div>
            <div id="myDocumentsSection">
              <div class="loading">Loading documents...</div>
            </div>
          </div>

          <!-- Payslips Section -->
          <div class="portal-section">
            <div class="section-header">
              <h3>💰 My Payslips</h3>
            </div>
            <div id="myPayslipsSection">
              <div class="loading">Loading payslips...</div>
            </div>
          </div>

          <!-- Expiring Documents Alert -->
          <div class="portal-section alert-section">
            <div class="section-header">
              <h3>⚠️ Expiring Documents</h3>
            </div>
            <div id="myExpiringDocs">
              <div class="loading">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    async attachListeners(app) {
        this.app = app;
        await this.loadMyData();
    },

    async loadMyData() {
        await Promise.all([
            this.loadMyProfile(),
            this.loadMyLeave(),
            this.loadMyAttendance(),
            this.loadMyAssets(),
            this.loadMyDocuments(),
            this.loadMyPayslips(),
            this.loadExpiringDocuments()
        ]);
    },

    async loadMyProfile() {
        try {
            const response = await fetch(`/api/hrm/employees/${this.app.currentUser.employee_id}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                this.myData = data.employee;
                this.updateProfileDisplay();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    },

    updateProfileDisplay() {
        const emp = this.myData;

        document.getElementById('empName').textContent = emp.full_name;
        document.getElementById('empPosition').textContent = emp.position || 'Employee';
        document.getElementById('empId').textContent = emp.employee_id;
        document.getElementById('empDepartment').textContent = emp.department || 'N/A';
        document.getElementById('empJoining').textContent = `Joined: ${StockFlowUtils.formatDate(emp.joining_date)}`;

        const initials = emp.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        document.getElementById('empInitials').textContent = initials;

        document.getElementById('lastSalary').textContent = StockFlowUtils.formatCurrency(emp.base_salary || 0);
    },

    async loadMyLeave() {
        try {
            // Load leave balance
            const balanceResp = await fetch('/api/hrm/leave/my-balance', {
                credentials: 'include'
            });
            const balanceData = await balanceResp.json();

            if (balanceData.success) {
                const annual = balanceData.balances.find(b => b.leave_code === 'ANNUAL');
                if (annual) {
                    document.getElementById('leaveBalance').textContent = `${annual.remaining_days}/${annual.total_days}`;
                }
            }

            // Load recent leave requests
            const reqResponse = await fetch('/api/hrm/leave/requests', {
                credentials: 'include'
            });
            const reqData = await reqResponse.json();

            if (reqData.success) {
                const myRequests = reqData.requests.filter(r => r.is_mine).slice(0, 5);
                this.renderMyLeave(myRequests, balanceData.balances || []);
            }
        } catch (error) {
            console.error('Error loading leave:', error);
        }
    },

    renderMyLeave(requests, balances) {
        const container = document.getElementById('myLeaveSection');

        let html = '<div class="leave-balances">';
        balances.forEach(b => {
            html += `
        <div class="balance-item">
          <span class="balance-label">${b.leave_name}:</span>
          <span class="balance-value">${b.remaining_days}/${b.total_days} days</span>
        </div>
      `;
        });
        html += '</div>';

        if (requests.length) {
            html += '<h4>Recent Requests</h4><div class="recent-leaves">';
            requests.forEach(req => {
                html += `
          <div class="leave-item">
            <div class="leave-item-info">
              <strong>${req.leave_name}</strong>
              <span>${StockFlowUtils.formatDate(req.start_date)} - ${StockFlowUtils.formatDate(req.end_date)}</span>
              <small>${req.total_days} days</small>
            </div>
            <span class="status-badge status-${req.status.toLowerCase()}">${req.status}</span>
          </div>
        `;
            });
            html += '</div>';
        } else {
            html += '<p class="no-data">No leave requests</p>';
        }

        container.innerHTML = html;
    },

    async loadMyAttendance() {
        try {
            const response = await fetch('/api/hrm/attendance/monthly-summary', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                const summary = data.summary;
                document.getElementById('workHours').textContent = `${summary.total_hours || 0}h`;

                const html = `
          <div class="attendance-summary">
            <div class="summary-item">
              <span class="summary-label">Present Days:</span>
              <span class="summary-value text-success">${summary.present || 0}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Absent Days:</span>
              <span class="summary-value text-danger">${summary.absent || 0}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total Hours:</span>
              <span class="summary-value">${summary.total_hours || 0}h</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Overtime:</span>
              <span class="summary-value text-success">${summary.overtime || 0}h</span>
            </div>
          </div>
        `;

                document.getElementById('myAttendanceSection').innerHTML = html;
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    },

    async loadMyAssets() {
        try {
            const response = await fetch(`/api/hrm/assets?assigned_to=${this.app.currentUser.employee_id}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                const myAssets = data.assets.filter(a => a.assigned_to === this.app.currentUser.employee_id);
                document.getElementById('assignedAssets').textContent = myAssets.length;

                if (myAssets.length) {
                    const html = `
            <div class="assets-list">
              ${myAssets.map(asset => `
                <div class="asset-item">
                  <div class="asset-icon">📦</div>
                  <div class="asset-info">
                    <strong>${asset.asset_name}</strong>
                    <small>${asset.serial_number || 'N/A'}</small>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
                    document.getElementById('myAssetsSection').innerHTML = html;
                } else {
                    document.getElementById('myAssetsSection').innerHTML = '<p class="no-data">No assets assigned</p>';
                }
            }
        } catch (error) {
            console.error('Error loading assets:', error);
        }
    },

    async loadMyDocuments() {
        try {
            const response = await fetch(`/api/hrm/documents/employee/${this.app.currentUser.employee_id}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.documents.length) {
                const html = `
          <div class="documents-list">
            ${data.documents.map(doc => `
              <div class="document-item">
                <div class="doc-icon">📄</div>
                <div class="doc-info">
                  <strong>${doc.document_name}</strong>
                  <small>${doc.document_category || 'General'}</small>
                </div>
                <a href="${doc.document_path}" target="_blank" class="btn-icon" title="Download">⬇️</a>
              </div>
            `).join('')}
          </div>
        `;
                document.getElementById('myDocumentsSection').innerHTML = html;
            } else {
                document.getElementById('myDocumentsSection').innerHTML = '<p class="no-data">No documents</p>';
            }
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    },

    async loadMyPayslips() {
        try {
            const response = await fetch(`/api/hrm/payroll/employee/${this.app.currentUser.employee_id}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.payslips && data.payslips.length) {
                const html = `
          <div class="payslips-list">
            ${data.payslips.map(slip => `
              <div class="payslip-item">
                <div class="payslip-info">
                  <strong>${slip.month}/${slip.year}</strong>
                  <span>${StockFlowUtils.formatCurrency(slip.net_salary)}</span>
                </div>
                <a href="/api/hrm/payroll/payslip/${slip.id}" target="_blank" class="btn-sm">
                  📄 Download
                </a>
              </div>
            `).join('')}
          </div>
        `;
                document.getElementById('myPayslipsSection').innerHTML = html;
            } else {
                document.getElementById('myPayslipsSection').innerHTML = '<p class="no-data">No payslips available</p>';
            }
        } catch (error) {
            console.error('Error loading payslips:', error);
        }
    },

    async loadExpiringDocuments() {
        try {
            const response = await fetch(`/api/hrm/documents/expiring?employee=${this.app.currentUser.employee_id}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.documents && data.documents.length) {
                const html = `
          <div class="expiring-docs-list">
            ${data.documents.map(doc => {
                    const daysLeft = this.calculateDaysLeft(doc.expiry_date);
                    const urgencyClass = daysLeft < 0 ? 'expired' : daysLeft <= 7 ? 'critical' : 'warning';

                    return `
                <div class="expiring-doc-item ${urgencyClass}">
                  <div class="doc-details">
                    <strong>${doc.item_type}</strong>
                    <small>${doc.item_identifier || ''}</small>
                  </div>
                  <div class="expiry-indicator ${urgencyClass}">
                    ${daysLeft < 0 ? 'EXPIRED' : `${daysLeft} days`}
                  </div>
                </div>
              `;
                }).join('')}
          </div>
        `;
                document.getElementById('myExpiringDocs').innerHTML = html;
            } else {
                document.getElementById('myExpiringDocs').innerHTML = '<p class="no-data text-success">✅ All documents valid</p>';
            }
        } catch (error) {
            console.error('Error loading expiring documents:', error);
        }
    },

    calculateDaysLeft(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    viewFullAttendance() {
        window.location.hash = '#hr-attendance';
    }
};

window.hrmEmployeeDashboardModule = hrmEmployeeDashboardModule;
