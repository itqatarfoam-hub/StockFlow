// ============================================
// STOCKFLOW - HRM MAIN PAGE WITH TABS
// Unified HRM interface similar to settings page
// ============================================

const hrmMainPageModule = {
    currentTab: 'dashboard',

    render() {
        return `
      <div class="settings-page hrm-page">
        <div class="settings-header">
          <div class="settings-header-content">
            <h1 class="settings-title">🏢 HR Management</h1>
            <p class="settings-subtitle">Comprehensive Human Resource Management System</p>
          </div>
        </div>

        <div class="settings-tabs">
          <button class="settings-tab active" data-tab="dashboard">
            <span class="tab-icon">📊</span>
            <span class="tab-label">Dashboard</span>
          </button>
          <button class="settings-tab" data-tab="employees">
            <span class="tab-icon">👥</span>
            <span class="tab-label">Employees</span>
          </button>
          <button class="settings-tab" data-tab="leave">
            <span class="tab-icon">🏖️</span>
            <span class="tab-label">Leave</span>
          </button>
          <button class="settings-tab" data-tab="attendance">
            <span class="tab-icon">📊</span>
            <span class="tab-label">Attendance</span>
          </button>
          <button class="settings-tab" data-tab="assets">
            <span class="tab-icon">📦</span>
            <span class="tab-label">Assets</span>
          </button>
          <button class="settings-tab" data-tab="vehicles">
            <span class="tab-icon">🚗</span>
            <span class="tab-label">Vehicles</span>
          </button>
          <button class="settings-tab" data-tab="documents">
            <span class="tab-icon">📄</span>
            <span class="tab-label">Documents</span>
          </button>
          <button class="settings-tab" data-tab="payroll">
            <span class="tab-icon">💰</span>
            <span class="tab-label">Payroll</span>
          </button>
          <button class="settings-tab" data-tab="reminders">
            <span class="tab-icon">🔔</span>
            <span class="tab-label">Reminders</span>
          </button>
          <button class="settings-tab" data-tab="reports">
            <span class="tab-icon">📊</span>
            <span class="tab-label">Reports</span>
          </button>
        </div>

        <div class="settings-content">
          <div class="settings-tab-content active" data-tab-content="dashboard">
            ${window.hrmDashboardModule ? hrmDashboardModule.render() : '<div>Loading...</div>'}
          </div>
          <div class="settings-tab-content" data-tab-content="employees">
            ${window.hrmEmployeesModule ? hrmEmployeesModule.render() : '<div>Loading...</div>'}
          </div>
          <div class="settings-tab-content" data-tab-content="leave">
            ${window.hrmLeaveModule ? hrmLeaveModule.render() : '<div>Loading...</div>'}
          </div>
          <div class="settings-tab-content" data-tab-content="attendance">
            ${window.hrmAttendanceModule ? hrmAttendanceModule.render() : '<div>Loading...</div>'}
          </div>
          <div class="settings-tab-content" data-tab-content="assets">
            ${window.hrmAssetsModule ? hrmAssetsModule.render() : '<div>Loading...</div>'}
          </div>
          <div class="settings-tab-content" data-tab-content="vehicles">
            ${window.hrmVehiclesModule ? hrmVehiclesModule.render() : '<div>Loading...</div>'}
          </div>
          <div class="settings-tab-content" data-tab-content="documents">
            ${window.hrmDocumentsModule ? hrmDocumentsModule.render() : '<div>Loading...</div>'}
          </div>
          <div class="settings-tab-content" data-tab-content="payroll">
            ${window.hrmPayrollModule ? hrmPayrollModule.render() : '<div>Loading...</div>'}
          </div>
          <div class="settings-tab-content" data-tab-content="reminders">
            ${window.hrmRemindersModule ? hrmRemindersModule.render() : '<div>Loading...</div>'}
          </div>
          <div class="settings-tab-content" data-tab-content="reports">
            ${window.hrmReportsModule ? hrmReportsModule.render() : '<div>Loading...</div>'}
          </div>
        </div>
      </div>
    `;
    },

    attachListeners(app) {
        // Attach tab switching listeners
        const tabs = document.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName, app);
            });
        });

        // Attach listeners for the current tab
        this.attachTabListeners(this.currentTab, app);
    },

    switchTab(tabName, app) {
        // Update tab buttons
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.settings-tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.dataset.tabContent === tabName) {
                content.classList.add('active');
            }
        });

        this.currentTab = tabName;

        // Attach listeners for the newly active tab
        this.attachTabListeners(tabName, app);
    },

    attachTabListeners(tabName, app) {
        // Attach module-specific listeners based on active tab
        switch (tabName) {
            case 'dashboard':
                if (window.hrmDashboardModule && hrmDashboardModule.attachListeners) {
                    hrmDashboardModule.attachListeners(app);
                }
                break;
            case 'employees':
                if (window.hrmEmployeesModule && hrmEmployeesModule.attachListeners) {
                    hrmEmployeesModule.attachListeners(app);
                }
                break;
            case 'leave':
                if (window.hrmLeaveModule && hrmLeaveModule.attachListeners) {
                    hrmLeaveModule.attachListeners(app);
                }
                break;
            case 'attendance':
                if (window.hrmAttendanceModule && hrmAttendanceModule.attachListeners) {
                    hrmAttendanceModule.attachListeners(app);
                }
                break;
            case 'assets':
                if (window.hrmAssetsModule && hrmAssetsModule.attachListeners) {
                    hrmAssetsModule.attachListeners(app);
                }
                break;
            case 'vehicles':
                if (window.hrmVehiclesModule && hrmVehiclesModule.attachListeners) {
                    hrmVehiclesModule.attachListeners(app);
                }
                break;
            case 'documents':
                if (window.hrmDocumentsModule && hrmDocumentsModule.attachListeners) {
                    hrmDocumentsModule.attachListeners(app);
                }
                break;
            case 'payroll':
                if (window.hrmPayrollModule && hrmPayrollModule.attachListeners) {
                    hrmPayrollModule.attachListeners(app);
                }
                break;
            case 'reminders':
                if (window.hrmRemindersModule && hrmRemindersModule.attachListeners) {
                    hrmRemindersModule.attachListeners(app);
                }
                break;
            case 'reports':
                if (window.hrmReportsModule && hrmReportsModule.attachListeners) {
                    hrmReportsModule.attachListeners(app);
                }
                break;
        }
    }
};

// Export globally
window.hrmMainPageModule = hrmMainPageModule;
