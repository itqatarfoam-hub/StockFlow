// ============================================
// STOCKFLOW - HRM DASHBOARD MODULE
// HR Admin Dashboard with Widgets
// ============================================

const hrmDashboardModule = {
    /**
     * Render HR Dashboard
     */
    render() {
        return `
      <div class="hrm-dashboard">
        <!-- Dashboard Header -->
        <div class="dashboard-header">
          <h2>🏢 HR Dashboard</h2>
          <div class="dashboard-actions">
            <button class="btn-primary" onclick="hrmDashboardModule.refreshDashboard()">
              🔄 Refresh
            </button>
          </div>
        </div>

        <!-- Stats Cards Row -->
        <div class="stats-grid">
          <div class="stat-card stat-primary">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <div class="stat-value" id="totalEmployees">-</div>
              <div class="stat-label">Total Employees</div>
            </div>
          </div>

          <div class="stat-card stat-warning">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <div class="stat-value" id="expiringDocs">-</div>
              <div class="stat-label">Expiring Documents</div>
            </div>
          </div>

          <div class="stat-card stat-info">
            <div class="stat-icon">🏖️</div>
            <div class="stat-content">
              <div class="stat-value" id="leavesToday">-</div>
              <div class="stat-label">On Leave Today</div>
            </div>
          </div>

          <div class="stat-card stat-success">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-value" id="assignedAssets">-</div>
              <div class="stat-label">Assigned Assets</div>
            </div>
          </div>
        </div>

        <!-- Dashboard Widgets -->
        <div class="dashboard-widgets">
          <!-- Left Column -->
          <div class="widgets-column">
            <!-- Expiring Documents Widget -->
            <div class="dashboard-widget">
              <div class="widget-header">
                <h3>⚠️ Expiring Documents</h3>
                <button class="btn-sm" onclick="hrmDocumentsModule.openExpiryList()">View All</button>
              </div>
              <div class="widget-content" id="expiringDocsList">
                <div class="loading">Loading...</div>
              </div>
            </div>

            <!-- Pending Approvals Widget -->
            <div class="dashboard-widget">
              <div class="widget-header">
                <h3>✅ Pending Approvals</h3>
                <button class="btn-sm" onclick="hrmLeaveModule.openApprovals()">View All</button>
              </div>
              <div class="widget-content" id="pendingApprovalsList">
                <div class="loading">Loading...</div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="widgets-column">
            <!-- Today's Attendance -->
            <div class="dashboard-widget">
              <div class="widget-header">
                <h3>📊 Today's Attendance</h3>
                <button class="btn-sm" onclick="hrmAttendanceModule.openToday()">View Details</button>
              </div>
              <div class="widget-content">
                <div id="attendanceChart" style="height: 200px;"></div>
                <div id="attendanceStats"></div>
              </div>
            </div>

            <!-- Upcoming Renewals -->
            <div class="dashboard-widget">
              <div class="widget-header">
                <h3>🔔 Upcoming Renewals</h3>
              </div>
              <div class="widget-content" id="upcomingRenewalsList">
                <div class="loading">Loading...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Statistics -->
        <div class="dashboard-widget full-width">
          <div class="widget-header">
            <h3>📈 Monthly HR Statistics</h3>
            <select id="statsMonth" onchange="hrmDashboardModule.loadMonthlyStats()">
              ${this.generateMonthOptions()}
            </select>
          </div>
          <div class="widget-content">
            <div id="monthlyStatsChart" style="height: 300px;"></div>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Generate month options for select
     */
    generateMonthOptions() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let options = '';
        for (let i = 0; i < 12; i++) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
            const selected = i === 0 ? 'selected' : '';
            options += `<option value="${year}-${monthIndex + 1}" ${selected}>${months[monthIndex]} ${year}</option>`;
        }
        return options;
    },

    /**
     * Attach event listeners
     */
    async attachListeners() {
        await this.loadDashboardData();
    },

    /**
     * Load all dashboard data
     */
    async loadDashboardData() {
        await Promise.all([
            this.loadStats(),
            this.loadExpiringDocuments(),
            this.loadPendingApprovals(),
            this.loadTodayAttendance(),
            this.loadUpcomingRenewals(),
            this.loadMonthlyStats()
        ]);
    },

    /**
     * Load statistics
     */
    async loadStats() {
        try {
            const response = await fetch('/api/hrm/dashboard/stats', {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to load stats');

            const data = await response.json();

            if (data.success) {
                document.getElementById('totalEmployees').textContent = data.stats.totalEmployees || 0;
                document.getElementById('expiringDocs').textContent = data.stats.expiringDocs || 0;
                document.getElementById('leavesToday').textContent = data.stats.leavesToday || 0;
                document.getElementById('assignedAssets').textContent = data.stats.assignedAssets || 0;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    },

    /**
     * Load expiring documents
     */
    async loadExpiringDocuments() {
        try {
            const response = await fetch('/api/hrm/documents/expiring?days=30', {
                credentials: 'include'
            });

            const data = await response.json();
            const container = document.getElementById('expiringDocsList');

            if (!data.success || !data.documents || data.documents.length === 0) {
                container.innerHTML = '<div class="no-data">✅ No documents expiring soon</div>';
                return;
            }

            let html = '<div class="expiry-list">';
            data.documents.forEach(doc => {
                const daysLeft = this.calculateDaysLeft(doc.expiry_date);
                const urgencyClass = daysLeft < 0 ? 'expired' : daysLeft <= 7 ? 'critical' : 'warning';

                html += `
          <div class="expiry-item ${urgencyClass}">
            <div class="expiry-info">
              <strong>${doc.employee_name}</strong>
              <span>${doc.item_type} - ${doc.item_identifier || ''}</span>
              <small>Expires: ${StockFlowUtils.formatDate(doc.expiry_date)}</small>
            </div>
            <div class="expiry-badge ${urgencyClass}">
              ${daysLeft < 0 ? 'EXPIRED' : `${daysLeft} days`}
            </div>
          </div>
        `;
            });
            html += '</div>';

            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading expiring documents:', error);
            document.getElementById('expiringDocsList').innerHTML = '<div class="error">Failed to load</div>';
        }
    },

    /**
     * Load pending approvals
     */
    async loadPendingApprovals() {
        try {
            const response = await fetch('/api/hrm/leave/pending-approvals', {
                credentials: 'include'
            });

            const data = await response.json();
            const container = document.getElementById('pendingApprovalsList');

            if (!data.success || !data.requests || data.requests.length === 0) {
                container.innerHTML = '<div class="no-data">✅ No pending approvals</div>';
                return;
            }

            let html = '<div class="approval-list">';
            data.requests.slice(0, 5).forEach(req => {
                html += `
          <div class="approval-item">
            <div class="approval-info">
              <strong>${req.employee_name}</strong>
              <span>${req.leave_type} - ${req.total_days} days</span>
              <small>${StockFlowUtils.formatDate(req.start_date)} to ${StockFlowUtils.formatDate(req.end_date)}</small>
            </div>
            <div class="approval-actions">
              <button class="btn-sm btn-success" onclick="hrmLeaveModule.approveLeave(${req.id})">✓</button>
              <button class="btn-sm btn-danger" onclick="hrmLeaveModule.rejectLeave(${req.id})">✗</button>
            </div>
          </div>
        `;
            });
            html += '</div>';

            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading pending approvals:', error);
            document.getElementById('pendingApprovalsList').innerHTML = '<div class="error">Failed to load</div>';
        }
    },

    /**
     * Load today's attendance
     */
    async loadTodayAttendance() {
        try {
            const response = await fetch('/api/hrm/attendance/today-summary', {
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                const stats = data.summary;
                const total = stats.present + stats.absent + stats.onLeave;

                // Simple stats display
                const statsHtml = `
          <div class="attendance-summary">
            <div class="attendance-stat">
              <span class="stat-value text-success">${stats.present}</span>
              <span class="stat-label">Present</span>
            </div>
            <div class="attendance-stat">
              <span class="stat-value text-danger">${stats.absent}</span>
              <span class="stat-label">Absent</span>
            </div>
            <div class="attendance-stat">
              <span class="stat-value text-warning">${stats.onLeave}</span>
              <span class="stat-label">On Leave</span>
            </div>
            <div class="attendance-stat">
              <span class="stat-value">${((stats.present / total) * 100).toFixed(1)}%</span>
              <span class="stat-label">Attendance Rate</span>
            </div>
          </div>
        `;

                document.getElementById('attendanceStats').innerHTML = statsHtml;
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    },

    /**
     * Load upcoming renewals
     */
    async loadUpcomingRenewals() {
        try {
            const response = await fetch('/api/hrm/reminders/upcoming?days=60', {
                credentials: 'include'
            });

            const data = await response.json();
            const container = document.getElementById('upcomingRenewalsList');

            if (!data.success || !data.reminders || data.reminders.length === 0) {
                container.innerHTML = '<div class="no-data">No upcoming renewals</div>';
                return;
            }

            let html = '<div class="renewal-list">';
            data.reminders.slice(0, 5).forEach(reminder => {
                const daysLeft = this.calculateDaysLeft(reminder.expiry_date);
                const priority = reminder.priority || 'Medium';

                html += `
          <div class="renewal-item priority-${priority.toLowerCase()}">
            <div class="renewal-icon">${this.getRenewalIcon(reminder.reminder_type)}</div>
            <div class="renewal-info">
              <strong>${reminder.item_name}</strong>
              <small>${reminder.employee_name || 'Company Asset'}</small>
              <span class="renewal-date">${StockFlowUtils.formatDate(reminder.expiry_date)} (${daysLeft} days)</span>
            </div>
          </div>
        `;
            });
            html += '</div>';

            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading renewals:', error);
            document.getElementById('upcomingRenewalsList').innerHTML = '<div class="error">Failed to load</div>';
        }
    },

    /**
     * Load monthly statistics
     */
    async loadMonthlyStats() {
        const monthValue = document.getElementById('statsMonth')?.value;
        if (!monthValue) return;

        try {
            const [year, month] = monthValue.split('-');
            const response = await fetch(`/api/hrm/dashboard/monthly-stats?year=${year}&month=${month}`, {
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                // Display statistics (implement chart library if needed)
                console.log('Monthly stats:', data.stats);
            }
        } catch (error) {
            console.error('Error loading monthly stats:', error);
        }
    },

    /**
     * Helper: Calculate days left
     */
    calculateDaysLeft(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    /**
     * Helper: Get renewal icon
     */
    getRenewalIcon(type) {
        const icons = {
            'Passport': '🛂',
            'Visa': '📋',
            'National_ID': '🆔',
            'Medical_Card': '🏥',
            'Vehicle_Registration': '🚗',
            'Vehicle_Insurance': '🛡️',
            'Asset_Warranty': '📦',
            'Contract': '📄'
        };
        return icons[type] || '📌';
    },

    /**
     * Refresh dashboard
     */
    async refreshDashboard() {
        ui.showLoading();
        await this.loadDashboardData();
        ui.hideLoading();
        ui.showToast('Dashboard refreshed', 'success');
    }
};

// Export module
window.hrmDashboardModule = hrmDashboardModule;
