// ============================================
// STOCKFLOW - HRM LEAVE MANAGEMENT MODULE
// Complete Leave Application & Approval System
// ============================================

const hrmLeaveModule = {
    leaveRequests: [],
    leaveTypes: [],
    leaveBalances: [],

    /**
     * Render Leave Management Page
     */
    render() {
        return `
      <div class="hrm-leave-page">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-left">
            <h2>🏖️ Leave Management</h2>
            <p class="page-description">Manage employee leave requests and balances</p>
          </div>
          <div class="header-actions">
            <button class="btn-primary" onclick="hrmLeaveModule.openApplyLeave()">
              ➕ Apply Leave
            </button>
            <button class="btn-secondary" onclick="hrmLeaveModule.openLeaveCalendar()">
              📅 Calendar
            </button>
          </div>
        </div>

        <!-- Leave Summary Cards -->
        <div class="leave-summary-grid">
          <div class="leave-summary-card annual">
            <div class="summary-icon">🏖️</div>
            <div class="summary-info">
              <h3 id="annualBalance">0</h3>
              <p>Annual Leave Balance</p>
            </div>
          </div>
          <div class="leave-summary-card sick">
            <div class="summary-icon">🏥</div>
            <div class="summary-info">
              <h3 id="sickBalance">0</h3>
              <p>Sick Leave Balance</p>
            </div>
          </div>
          <div class="leave-summary-card pending">
            <div class="summary-icon">⏳</div>
            <div class="summary-info">
              <h3 id="pendingRequests">0</h3>
              <p>Pending Requests</p>
            </div>
          </div>
          <div class="leave-summary-card used">
            <div class="summary-icon">📊</div>
            <div class="summary-info">
              <h3 id="usedLeave">0</h3>
              <p>Total Used This Year</p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="leave-tabs">
          <button class="tab-btn active" onclick="hrmLeaveModule.switchTab('my-requests')">
            My Requests
          </button>
          <button class="tab-btn" onclick="hrmLeaveModule.switchTab('pending-approvals')">
            Pending Approvals <span class="badge" id="approvalCount">0</span>
          </button>
          <button class="tab-btn" onclick="hrmLeaveModule.switchTab('all-requests')">
            All Requests
          </button>
          <button class="tab-btn" onclick="hrmLeaveModule.switchTab('leave-types')">
            Leave Types
          </button>
        </div>

        <!-- Tab Content -->
        <div id="leaveTabContent" class="tab-content-area"></div>
      </div>
    `;
    },

    /**
     * Attach listeners
     */
    async attachListeners(app) {
        this.app = app;
        await this.loadLeaveData();
        this.switchTab('my-requests');
    },

    /**
     * Load leave data
     */
    async loadLeaveData() {
        await Promise.all([
            this.loadLeaveTypes(),
            this.loadLeaveBalances(),
            this.loadLeaveRequests()
        ]);
    },

    /**
     * Load leave types
     */
    async loadLeaveTypes() {
        try {
            const response = await fetch('/api/hrm/leave/types', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                this.leaveTypes = data.types || [];
            }
        } catch (error) {
            console.error('Error loading leave types:', error);
        }
    },

    /**
     * Load leave balances
     */
    async loadLeaveBalances() {
        try {
            const response = await fetch('/api/hrm/leave/my-balance', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                this.leaveBalances = data.balances || [];
                this.updateBalanceDisplay();
            }
        } catch (error) {
            console.error('Error loading balances:', error);
        }
    },

    /**
     * Update balance display
     */
    updateBalanceDisplay() {
        const annual = this.leaveBalances.find(b => b.leave_code === 'ANNUAL');
        const sick = this.leaveBalances.find(b => b.leave_code === 'SICK');

        document.getElementById('annualBalance').textContent =
            annual ? `${annual.remaining_days} / ${annual.total_days}` : '0';

        document.getElementById('sickBalance').textContent =
            sick ? `${sick.remaining_days} / ${sick.total_days}` : '0';

        const totalUsed = this.leaveBalances.reduce((sum, b) => sum + parseFloat(b.used_days || 0), 0);
        document.getElementById('usedLeave').textContent = totalUsed.toFixed(1);
    },

    /**
     * Load leave requests
     */
    async loadLeaveRequests() {
        try {
            const response = await fetch('/api/hrm/leave/requests', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                this.leaveRequests = data.requests || [];

                const pending = this.leaveRequests.filter(r => r.status === 'Pending').length;
                document.getElementById('pendingRequests').textContent = pending;

                const approvalCount = this.leaveRequests.filter(r =>
                    r.status === 'Pending' && r.requires_my_approval
                ).length;
                document.getElementById('approvalCount').textContent = approvalCount;
            }
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    },

    /**
     * Switch tab
     */
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event?.target?.classList.add('active');

        const content = document.getElementById('leaveTabContent');

        switch (tab) {
            case 'my-requests':
                content.innerHTML = this.renderMyRequests();
                break;
            case 'pending-approvals':
                content.innerHTML = this.renderPendingApprovals();
                break;
            case 'all-requests':
                content.innerHTML = this.renderAllRequests();
                break;
            case 'leave-types':
                content.innerHTML = this.renderLeaveTypes();
                break;
        }
    },

    /**
     * Render my requests
     */
    renderMyRequests() {
        const myRequests = this.leaveRequests.filter(r => r.is_mine);

        if (!myRequests.length) {
            return '<div class="no-data">No leave requests found</div>';
        }

        let html = '<div class="leave-requests-list">';
        myRequests.forEach(req => {
            html += this.renderLeaveCard(req, true);
        });
        html += '</div>';

        return html;
    },

    /**
     * Render pending approvals
     */
    renderPendingApprovals() {
        const pending = this.leaveRequests.filter(r =>
            r.status === 'Pending' && r.requires_my_approval
        );

        if (!pending.length) {
            return '<div class="no-data">✅ No pending approvals</div>';
        }

        let html = '<div class="leave-requests-list">';
        pending.forEach(req => {
            html += this.renderLeaveCard(req, false, true);
        });
        html += '</div>';

        return html;
    },

    /**
     * Render all requests
     */
    renderAllRequests() {
        let html = `
      <div class="filters-bar">
        <select id="filterLeaveStatus" onchange="hrmLeaveModule.filterRequests()">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select id="filterLeaveType" onchange="hrmLeaveModule.filterRequests()">
          <option value="">All Types</option>
        </select>
        <input type="date" id="filterFromDate" onchange="hrmLeaveModule.filterRequests()" placeholder="From">
        <input type="date" id="filterToDate" onchange="hrmLeaveModule.filterRequests()" placeholder="To">
      </div>
    `;

        html += '<div id="allRequestsList" class="leave-requests-list">';
        this.leaveRequests.forEach(req => {
            html += this.renderLeaveCard(req);
        });
        html += '</div>';

        // Populate leave types filter
        setTimeout(() => {
            const select = document.getElementById('filterLeaveType');
            this.leaveTypes.forEach(type => {
                select.innerHTML += `<option value="${type.id}">${type.leave_name}</option>`;
            });
        }, 100);

        return html;
    },

    /**
     * Render leave card
     */
    renderLeaveCard(req, showCancel = false, showApproval = false) {
        const statusClass = req.status.toLowerCase();
        const leaveType = this.leaveTypes.find(t => t.id === req.leave_type_id);

        return `
      <div class="leave-card status-${statusClass}">
        <div class="leave-card-header">
          <div class="leave-info">
            <h4>${req.employee_name || 'You'}</h4>
            <span class="leave-type">${leaveType?.leave_name || 'Leave'}</span>
          </div>
          <span class="status-badge status-${statusClass}">${req.status}</span>
        </div>
        
        <div class="leave-card-body">
          <div class="leave-dates">
            <div class="date-item">
              <span class="date-label">From</span>
              <span class="date-value">${StockFlowUtils.formatDate(req.start_date)}</span>
            </div>
            <div class="date-separator">→</div>
            <div class="date-item">
              <span class="date-label">To</span>
              <span class="date-value">${StockFlowUtils.formatDate(req.end_date)}</span>
            </div>
            <div class="days-count">
              <strong>${req.total_days}</strong> days
            </div>
          </div>
          
          ${req.reason ? `
            <div class="leave-reason">
              <strong>Reason:</strong> ${req.reason}
            </div>
          ` : ''}
          
          ${req.document_path ? `
            <div class="leave-attachment">
              📎 <a href="${req.document_path}" target="_blank">View Attachment</a>
            </div>
          ` : ''}
          
          ${req.approved_by_name ? `
            <div class="approval-info">
              <small>Approved by ${req.approved_by_name} on ${StockFlowUtils.formatDate(req.approved_date)}</small>
            </div>
          ` : ''}
          
          ${req.rejection_reason ? `
            <div class="rejection-reason">
              <strong>Rejection Reason:</strong> ${req.rejection_reason}
            </div>
          ` : ''}
        </div>
        
        <div class="leave-card-actions">
          ${showCancel && req.status === 'Pending' ? `
            <button class="btn-sm btn-danger" onclick="hrmLeaveModule.cancelLeave(${req.id})">
              Cancel Request
            </button>
          ` : ''}
          
          ${showApproval ? `
            <button class="btn-sm btn-success" onclick="hrmLeaveModule.approveLeave(${req.id})">
              ✓ Approve
            </button>
            <button class="btn-sm btn-danger" onclick="hrmLeaveModule.rejectLeave(${req.id})">
              ✗ Reject
            </button>
          ` : ''}
          
          <button class="btn-sm" onclick="hrmLeaveModule.viewLeaveDetails(${req.id})">
            View Details
          </button>
        </div>
      </div>
    `;
    },

    /**
     * Render leave types
     */
    renderLeaveTypes() {
        let html = `
      <div class="leave-types-grid">
        ${this.leaveTypes.map(type => `
          <div class="leave-type-card" style="border-left: 4px solid ${type.color}">
            <div class="type-header">
              <h3>${type.leave_name}</h3>
              <span class="type-code">${type.leave_code}</span>
            </div>
            <div class="type-info">
              <div class="info-item">
                <span>Default Days/Year:</span>
                <strong>${type.default_days_per_year}</strong>
              </div>
              <div class="info-item">
                <span>Type:</span>
                <strong>${type.paid ? 'Paid' : 'Unpaid'}</strong>
              </div>
              <div class="info-item">
                <span>Requires Approval:</span>
                <strong>${type.requires_approval ? 'Yes' : 'No'}</strong>
              </div>
              <div class="info-item">
                <span>Status:</span>
                <strong class="${type.active ? 'text-success' : 'text-danger'}">
                  ${type.active ? 'Active' : 'Inactive'}
                </strong>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

        return html;
    },

    /**
     * Open apply leave modal
     */
    openApplyLeave() {
        const modalHTML = `
      <div id="leaveModal" class="modal active">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Apply for Leave</h3>
            <button class="modal-close" onclick="hrmLeaveModule.closeModal()">×</button>
          </div>
          
          <form id="leaveForm" class="hrm-form">
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label required">Leave Type</label>
                <select name="leave_type_id" class="form-input" required onchange="hrmLeaveModule.updateLeaveBalance()">
                  <option value="">Select Leave Type</option>
                  ${this.leaveTypes.filter(t => t.active).map(type => `
                    <option value="${type.id}">${type.leave_name} (${type.default_days_per_year} days/year)</option>
                  `).join('')}
                </select>
                <div id="balanceInfo" class="balance-info"></div>
              </div>
              
              <div class="form-group">
                <label class="form-label required">Start Date</label>
                <input type="date" name="start_date" class="form-input" required 
                       onchange="hrmLeaveModule.calculateDays()">
              </div>
              
              <div class="form-group">
                <label class="form-label required">End Date</label>
                <input type="date" name="end_date" class="form-input" required 
                       onchange="hrmLeaveModule.calculateDays()">
              </div>
              
              <div class="form-group full-width">
                <label class="form-label">Total Days</label>
                <input type="number" name="total_days" class="form-input" readonly 
                       style="background: #f3f4f6;">
              </div>
              
              <div class="form-group full-width">
                <label class="form-label">Reason</label>
                <textarea name="reason" class="form-textarea" rows="3" 
                          placeholder="Reason for leave..."></textarea>
              </div>
              
              <div class="form-group full-width">
                <label class="form-label">Attach Document (Optional)</label>
                <input type="file" name="document" class="form-input" 
                       accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
                <small class="text-muted">For sick leave, medical certificate is recommended</small>
              </div>
            </div>
            
            <div class="form-button-group">
              <button type="button" class="btn-secondary" onclick="hrmLeaveModule.closeModal()">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Submit Leave Request
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Set min date to today
        document.querySelector('[name="start_date"]').min = new Date().toISOString().split('T')[0];
        document.querySelector('[name="end_date"]').min = new Date().toISOString().split('T')[0];

        document.getElementById('leaveForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitLeaveRequest(e.target);
        });
    },

    /**
     * Update leave balance display
     */
    updateLeaveBalance() {
        const select = event.target;
        const leaveTypeId = parseInt(select.value);
        const balance = this.leaveBalances.find(b => b.leave_type_id === leaveTypeId);

        const infoDiv = document.getElementById('balanceInfo');
        if (balance) {
            infoDiv.innerHTML = `
        <div class="balance-display">
          <span>Available: <strong>${balance.remaining_days}</strong> days</span>
          <span class="text-muted">(Used: ${balance.used_days} / Total: ${balance.total_days})</span>
        </div>
      `;
            infoDiv.style.display = 'block';
        } else {
            infoDiv.style.display = 'none';
        }
    },

    /**
     * Calculate days between dates
     */
    calculateDays() {
        const startDate = document.querySelector('[name="start_date"]').value;
        const endDate = document.querySelector('[name="end_date"]').value;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            document.querySelector('[name="total_days"]').value = diffDays;
        }
    },

    /**
     * Submit leave request
     */
    async submitLeaveRequest(form) {
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/hrm/leave/apply', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Leave request submitted successfully', 'success');
                this.closeModal();
                await this.loadLeaveData();
                this.switchTab('my-requests');
            } else {
                ui.showToast(data.error || 'Failed to submit request', 'error');
            }
        } catch (error) {
            console.error('Error submitting leave:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    /**
     * Approve leave
     */
    async approveLeave(id) {
        if (!confirm('Approve this leave request?')) return;

        try {
            const response = await fetch(`/api/hrm/leave/approve/${id}`, {
                method: 'PUT',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Leave approved successfully', 'success');
                await this.loadLeaveData();
                this.switchTab('pending-approvals');
            } else {
                ui.showToast(data.error || 'Failed to approve', 'error');
            }
        } catch (error) {
            console.error('Error approving leave:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    /**
     * Reject leave
     */
    async rejectLeave(id) {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const response = await fetch(`/api/hrm/leave/reject/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Leave rejected', 'success');
                await this.loadLeaveData();
                this.switchTab('pending-approvals');
            } else {
                ui.showToast(data.error || 'Failed to reject', 'error');
            }
        } catch (error) {
            console.error('Error rejecting leave:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    /**
     * Cancel leave
     */
    async cancelLeave(id) {
        if (!confirm('Cancel this leave request?')) return;

        try {
            const response = await fetch(`/api/hrm/leave/cancel/${id}`, {
                method: 'PUT',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Leave request cancelled', 'success');
                await this.loadLeaveData();
                this.switchTab('my-requests');
            } else {
                ui.showToast(data.error || 'Failed to cancel', 'error');
            }
        } catch (error) {
            console.error('Error cancelling leave:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    openLeaveCalendar() {
        // Implement calendar view
        alert('Leave calendar view coming soon!');
    },

    viewLeaveDetails(id) {
        // Implement details view
        alert('Leave details view coming soon!');
    },

    filterRequests() {
        // Implement filtering
        console.log('Filtering requests...');
    },

    closeModal() {
        const modal = document.getElementById('leaveModal');
        if (modal) modal.remove();
    }
};

// Export module
window.hrmLeaveModule = hrmLeaveModule;
