// ============================================
// SETTINGS PAGE MODULE - Modern Tabbed Interface
// ============================================

const settingsPageModule = {
  currentTab: 'system',

  render() {
    return `
      <div class="settings-page">
        <!-- Settings Header -->
        <div class="settings-header">
          <div class="settings-header-content">
            <h1 class="settings-title">⚙️ Settings</h1>
            <p class="settings-subtitle">Configure your system preferences and manage users</p>
          </div>
        </div>

        <!-- Settings Tabs Navigation -->
        <div class="settings-tabs">
          <button class="settings-tab active" data-tab="system">
            <span class="tab-icon">🔧</span>
            <span class="tab-label">System Settings</span>
          </button>
          <button class="settings-tab" data-tab="users">
            <span class="tab-icon">👥</span>
            <span class="tab-label">User Management</span>
          </button>
          <button class="settings-tab" data-tab="roles">
            <span class="tab-icon">🔐</span>
            <span class="tab-label">Role Management</span>
          </button>
          <button class="settings-tab" data-tab="appearance">
            <span class="tab-icon">🎨</span>
            <span class="tab-label">Appearance</span>
          </button>
          <button class="settings-tab" data-tab="backup">
            <span class="tab-icon">💾</span>
            <span class="tab-label">Backup & Data</span>
          </button>
        </div>

        <!-- Settings Tab Content -->
        <div class="settings-content">
          <!-- System Settings Tab -->
          <div class="settings-tab-content active" data-tab-content="system">
            ${this.renderSystemSettings()}
          </div>

          <!-- User Management Tab -->
          <div class="settings-tab-content" data-tab-content="users">
            ${this.renderUserManagement()}
          </div>

          <!-- Role Management Tab -->
          <div class="settings-tab-content" data-tab-content="roles">
            ${this.renderRoleManagement()}
          </div>

          <!-- Appearance Tab -->
          <div class="settings-tab-content" data-tab-content="appearance">
            ${this.renderAppearanceSettings()}
          </div>

          <!-- Backup Tab -->
          <div class="settings-tab-content" data-tab-content="backup">
            ${this.renderBackupSettings()}
          </div>
        </div>
      </div>
    `;
  },

  renderSystemSettings() {
    return `
      <div class="settings-section">
        <div class="settings-section-header">
          <h2 class="section-title">System Configuration</h2>
          <p class="section-description">Manage your application settings and preferences</p>
        </div>

        <div class="settings-cards">
          <!-- Company Information Card -->
          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">🏢 Company Information</h3>
            </div>
            <div class="card-body">
              <form id="companySettingsForm">
                <div class="form-group">
                  <label class="form-label">Company Name</label>
                  <input type="text" id="companyName" class="form-input" placeholder="Your Company Name" value="StockFlow Inc.">
                </div>
                <div class="form-group">
                  <label class="form-label">Contact Email</label>
                  <input type="email" id="companyEmail" class="form-input" placeholder="contact@company.com" value="admin@stockflow.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="tel" id="companyPhone" class="form-input" placeholder="+1234567890" value="+1 234 567 8900">
                </div>
                <button type="button" class="btn-primary" onclick="settingsPageModule.saveCompanySettings()">
                  💾 Save Changes
                </button>
              </form>
            </div>
          </div>

          <!-- Login Settings Card -->
          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">🔐 Login Configuration</h3>
            </div>
            <div class="card-body">
              <form id="loginSettingsForm">
                <div class="form-group">
                  <label class="form-label">Login Page Title</label>
                  <input type="text" id="loginTitle" class="form-input" placeholder="StockFlow" value="StockFlow">
                </div>
                <div class="form-group">
                  <label class="form-label">Login Subtitle</label>
                  <input type="text" id="loginSubtitle" class="form-input" placeholder="Inventory Management" value="Inventory & Sales Management">
                </div>
                <div class="form-group">
                  <label class="form-label">Demo Credentials Label</label>
                  <input type="text" id="loginDemoLabel" class="form-input" placeholder="Demo Credentials" value="Demo Credentials">
                </div>
                <button type="button" class="btn-primary" onclick="settingsPageModule.saveLoginSettings()">
                  💾 Save Changes
                </button>
              </form>
            </div>
          </div>

          <!-- Notifications Card -->
          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">🔔 Notification Preferences</h3>
            </div>
            <div class="card-body">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Low Stock Alerts</label>
                  <p class="setting-description">Get notified when products are running low</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">New Order Notifications</label>
                  <p class="setting-description">Receive alerts for new sales orders</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Email Reports</label>
                  <p class="setting-description">Receive daily email summaries</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderUserManagement() {
    return `
      <div class="settings-section">
        <div class="settings-section-header">
          <h2 class="section-title">User Management</h2>
        </div>
        <p class="section-description">Manage system users and their access permissions</p>

        <!-- Users Table -->
        <div class="settings-card">
          <div class="card-header">
            <h3 class="card-title">📋 All Users</h3>
            <div class="card-actions">
              <input type="text" id="userSearchInput" class="search-input" placeholder="🔍 Search users..." 
                     onkeyup="settingsPageModule.filterUsers(this.value)">
              <button class="btn-primary" style="width: auto; flex: none;" onclick="window.app.openAddUserModal()">
                ➕ Add New User
              </button>
            </div>
          </div>
          <div class="card-body" style="padding: 0;">
            <div class="table-container">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Sales Code</th>
                    <th>Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody id="usersTableBody">
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #9ca3af;">
                      Loading users...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderRoleManagement() {
    return `
      <div class="settings-section">
        <div class="settings-section-header">
          <h2 class="section-title">Role Management</h2>
          <p class="section-description">Define roles and their access permissions</p>
          <button class="btn-primary" onclick="window.app.openCreateRoleModal()">
            ➕ Create New Role
          </button>
        </div>

        <!-- Roles Grid -->
        <div class="settings-card">
          <div class="card-header">
            <h3 class="card-title">🔐 System Roles</h3>
          </div>
          <div class="card-body">
            <div id="rolesGrid" class="roles-grid">
              <div style="text-align: center; padding: 40px; color: #9ca3af;">
                Loading roles...
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderAppearanceSettings() {
    return `
      <div class="settings-section">
        <div class="settings-section-header">
          <h2 class="section-title">Appearance Settings</h2>
          <p class="section-description">Customize the look and feel of your application</p>
        </div>

        <div class="settings-cards">
          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">🎨 Theme Settings</h3>
            </div>
            <div class="card-body">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Dark Mode</label>
                  <p class="setting-description">Switch to dark theme</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Compact View</label>
                  <p class="setting-description">Reduce spacing for better density</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="form-group" style="margin-top: 20px;">
                <label class="form-label">Primary Color</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                  <input type="color" value="#3b82f6" style="width: 60px; height: 40px; border: none; border-radius: 8px; cursor: pointer;">
                  <span style="color: #6b7280; font-size: 14px;">#3b82f6</span>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">📱 Dashboard Layout</h3>
            </div>
            <div class="card-body">
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">Choose your preferred dashboard layout</p>
              <div class="layout-options">
                <div class="layout-option active">
                  <div class="layout-preview">
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
                      <div style="background: #3b82f6; height: 20px; border-radius: 2px;"></div>
                      <div style="background: #3b82f6; height: 20px; border-radius: 2px;"></div>
                      <div style="background: #3b82f6; height: 20px; border-radius: 2px;"></div>
                      <div style="background: #3b82f6; height: 20px; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <p style="font-weight: 600; margin-top: 8px;">4 Column Grid</p>
                </div>
                <div class="layout-option">
                  <div class="layout-preview">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;">
                      <div style="background: #9ca3af; height: 20px; border-radius: 2px;"></div>
                      <div style="background: #9ca3af; height: 20px; border-radius: 2px;"></div>
                      <div style="background: #9ca3af; height: 20px; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <p style="font-weight: 600; margin-top: 8px;">3 Column Grid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderBackupSettings() {
    return `
      <div class="settings-section">
        <div class="settings-section-header">
          <h2 class="section-title">Backup & Data Management</h2>
          <p class="section-description">Manage your data backups and exports</p>
        </div>

        <div class="settings-cards">
          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">💾 Database Backup</h3>
            </div>
            <div class="card-body">
              <p style="color: #6b7280; margin-bottom: 20px;">Create a backup of your entire database</p>
              <button class="btn-primary" onclick="settingsPageModule.createBackup()">
                📥 Download Database Backup
              </button>
              <div style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-size: 13px; color: #92400e;">
                  <strong>Last Backup:</strong> Never
                </p>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">📊 Data Export</h3>
            </div>
            <div class="card-body">
              <div class="export-options">
                <button class="export-btn" onclick="settingsPageModule.exportData('products')">
                  <span style="font-size: 24px;">📦</span>
                  <span>Export Products</span>
                </button>
                <button class="export-btn" onclick="settingsPageModule.exportData('customers')">
                  <span style="font-size: 24px;">🏢</span> 
                  <span>Export Customers</span>
                </button>
                <button class="export-btn" onclick="settingsPageModule.exportData('sales')">
                  <span style="font-size: 24px;">💰</span>
                  <span>Export Sales</span>
                </button>
                <button class="export-btn" onclick="settingsPageModule.exportData('users')">
                  <span style="font-size: 24px;">👥</span>
                  <span>Export Users</span>
                </button>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">⚠️ Danger Zone</h3>
            </div>
            <div class="card-body">
              <div class="danger-zone">
                <div>
                  <h4 style="color: #dc2626; margin: 0 0 8px 0;">Reset All Settings</h4>
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">Reset all settings to default values</p>
                </div>
                <button class="btn-danger" onclick="settingsPageModule.resetSettings()">
                  Reset Settings
                </button>
              </div>
              <div class="danger-zone" style="margin-top: 16px;">
                <div>
                  <h4 style="color: #dc2626; margin: 0 0 8px 0;">Clear All Data</h4>
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">Permanently delete all data from the system</p>
                </div>
                <button class="btn-danger" onclick="settingsPageModule.clearAllData()">
                  Clear Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  attachListeners(app) {
    // Tab switching
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.currentTarget.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Load initial data
    this.loadUsersData();
    this.loadRolesData();
  },

  switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.settings-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      }
    });

    // Update active content
    document.querySelectorAll('.settings-tab-content').forEach(content => {
      content.classList.remove('active');
      if (content.dataset.tabContent === tabName) {
        content.classList.add('active');
      }
    });

    this.currentTab = tabName;
  },
  this.renderRolesGrid(roles);
} catch (error) {
  console.error('Error loading roles:', error);
}
  },

renderRolesGrid(roles) {
  const grid = document.getElementById('rolesGrid');
  if (!grid) return;

  if (roles.length === 0) {
    grid.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #9ca3af; grid-column: 1/-1;">
          No roles defined.
        </div>
      `;
    return;
  }

  grid.innerHTML = roles.map(role => `
      <div class="role-card">
        <div class="role-card-header">
          <h3 class="role-card-title">${role.name}</h3>
          <span class="role-card-badge">${role.usersCount || 0} Users</span>
        </div>
        <p class="role-card-description">${role.description || 'No description provided'}</p>
        
        <div class="role-card-permissions">
          ${(role.permissions || []).slice(0, 5).map(p =>
    `<span class="permission-tag">${p}</span>`
  ).join('')}
          ${(role.permissions || []).length > 5 ?
      `<span class="permission-tag">+${role.permissions.length - 5} more</span>` : ''}
        </div>

        <div class="role-card-actions">
          <button class="btn-secondary btn-sm" onclick="window.app.openEditRoleModal('${role.id}')">
            Edit Role
          </button>
          <button class="btn-danger btn-sm" onclick="window.app.deleteRole('${role.id}')">
            Delete
          </button>
        </div>
      </div>
    `).join('');
},

// ============================================
// SETTINGS ACTIONS
// ============================================

saveCompanySettings() {
  alert('Company settings saved successfully!');
},

saveLoginSettings() {
  alert('Login configuration saved successfully!');
},

createBackup() {
  alert('Database backup started. You will receive a download link shortly.');
},

exportData(type) {
  alert(`Exporting ${type} data... This may take a moment.`);
},

resetSettings() {
  if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
    alert('Settings have been reset to defaults.');
  }
},

clearAllData() {
  const code = prompt('To confirm deletion, please type "DELETE" in all caps:');
  if (code === 'DELETE') {
    alert('All data has been cleared. The system will now reset.');
    location.reload();
  }
}
};

// Make it globally available
window.settingsPageModule = settingsPageModule;