// ============================================
// SETTINGS PAGE MODULE  - Enhanced with Company Info & Header Titles
// ============================================

const settingsPageModule = {
  currentTab: 'system',

  render() {
    return `
      <div class="settings-page">
        <div class="settings-header">
          <div class="settings-header-content">
            <h1 class="settings-title">⚙️ Settings</h1>
            <p class="settings-subtitle">Configure your system preferences and manage users</p>
          </div>
        </div>

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

        <div class="settings-content">
          <div class="settings-tab-content active" data-tab-content="system">
            ${this.renderSystemSettings()}
          </div>
          <div class="settings-tab-content" data-tab-content="users">
            ${this.renderUserManagement()}
          </div>
          <div class="settings-tab-content" data-tab-content="roles">
            ${this.renderRoleManagement()}
          </div>
          <div class="settings-tab-content" data-tab-content="appearance">
            ${this.renderAppearanceSettings()}
          </div>
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
          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">🏢 Company Information</h3>
            </div>
            <div class="card-body">
              <div id="companyInfoDisplay" style="margin-bottom: 20px;">
                <p style="color: #6b7280; margin-bottom: 15px;">Configure company details displayed on the login screen</p>
                <div class="company-info-preview" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f9fafb; border-radius: 8px; margin-bottom: 15px;">
                  <div id="logoPreview" style="font-size: 48px;">📊</div>
                  <div style="flex: 1;">
                    <div id="companyNameDisplay" style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">Loading...</div>
                    <div id="contactEmailDisplay" style="font-size: 14px; color: #6b7280; margin-bottom: 3px;">-</div>
                    <div id="phoneNumberDisplay" style="font-size: 14px; color: #6b7280;">-</div>
                  </div>
                </div>
              </div>
              <button type="button" class="btn-primary" onclick="settingsPageModule.openCompanyInfoModal()">✏️ Edit Company Information</button>
            </div>
          </div>

          <!-- Auto-Logout Settings Card -->
          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">⏱️ Auto-Logout Settings</h3>
            </div>
            <div class="card-body">
              <p style="color: #6b7280; margin-bottom: 20px;">
                Automatically log out inactive users after a specified time period
              </p>
              <div class="form-group" style="margin-bottom: 20px;">
                <label class="form-label">Inactivity Timeout (minutes)</label>
                <div style="display: flex; align-items: center; gap: 15px;">
                  <input 
                    type="number" 
                    id="autoLogoutMinutes" 
                    class="form-input" 
                    style="max-width: 150px;" 
                    min="1" 
                    max="1440" 
                    value="30"
                  >
                  <span style="color: #6b7280; font-size: 14px;">minutes</span>
                </div>
                <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                  Users will be logged out after this period of inactivity (1-1440 minutes)
                </p>
              </div>
              <button 
                type="button" 
                class="btn-primary" 
                onclick="settingsPageModule.saveAutoLogoutSettings()"
              >
                💾 Save Auto-Logout Settings
              </button>
            </div>
          </div>

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
          <p class="section-description">Manage system users and their access permissions</p>
        </div>

        <div class="settings-card">
          <div class="card-header">
            <h3 class="card-title">📋 All Users</h3>
            <div class="card-actions">
              <input type="text" id="userSearchInput" class="search-input" placeholder="🔍 Search users..." onkeyup="settingsPageModule.filterUsers(this.value)">
              <button class="btn-primary" style="width: auto; flex: none;" onclick="window.app.openAddUserModal()">➕ Add New User</button>
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
                    <td colspan="6" style="text-align: center; padding: 40px; color: #9ca3af;">Loading users...</td>
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
          <button class="btn-primary" onclick="window.app.openCreateRoleModal()">➕ Create New Role</button>
        </div>
        

        <div class="settings-card">
          <div class="card-header">
            <h3 class="card-title">🔐 System Roles</h3>
          </div>
          <div class="card-body">
            <div id="rolesGrid" class="roles-grid">
              <div style="text-align: center; padding: 40px; color: #9ca3af;">Loading roles...</div>
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
              <h3 class="card-title">📝 Header Titles</h3>
            </div>
            <div class="card-body">
              <p style="color: #6b7280; margin-bottom: 20px;">
                Customize the page titles displayed in the top bar for all pages
              </p>
              <button type="button" class="btn-primary" onclick="settingsPageModule.openHeaderTitlesModal()">✏️ Edit Header Titles</button>
            </div>
          </div>

          <div class="settings-card">
            <div class="card-header">
              <h3 class="card-title">📋 Menu Management</h3>
            </div>
            <div class="card-body">
              <p style="color: #6b7280; margin-bottom: 20px;">
                Create and manage custom menu items with their own pages
              </p>
              <button type="button" class="btn-primary" style="width: auto;" onclick="menuManagementModule.openMenuManagementModal()">📋 Manage Menu Items</button>
            </div>
          </div>

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
              <button class="btn-primary" onclick="settingsPageModule.createBackup()">📥 Download Database Backup</button>
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
                <button class="export-btn" onclick="settingsPageModule.exportData('users')">
                  <span style="font-size: 24px;">👥</span>
                  <span>Export Users</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async saveAutoLogoutSettings() {
    const minutes = document.getElementById('autoLogoutMinutes').value;

    if (!minutes || minutes < 1 || minutes > 1440) {
      window.app.showConfirm('Invalid Input', ' Please enter a valid timeout between 1 and 1440 minutes.');
      return;
    }

    try {
      const response = await fetch('/api/auto-logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_logout_minutes: parseInt(minutes) })
      });

      const data = await response.json();

      if (data.success) {
        window.app.showConfirm('Success', 'Auto-logout settings saved successfully!\\n\\nUsers will now be automatically logged out after ' + minutes + ' minutes of inactivity.');
        if (window.autoLogoutManager) {
          window.autoLogoutManager.updateTimeout(parseInt(minutes));
        }
      } else {
        window.app.showConfirm('Error', ' Failed to save auto-logout settings.\\n\\nPlease try again.');
      }
    } catch (error) {
      console.error('Error saving auto-logout settings:', error);
      window.app.showConfirm('Error', ' An error occurred while saving auto-logout settings.\\n\\nPlease check your connection and try again.');
    }
  },

  async loadAutoLogoutSettings() {
    try {
      const response = await fetch('/api/auto-logout');  // ✅ CORRECT PATH
      const data = await response.json();

      if (data.success && data.auto_logout_minutes) {
        const input = document.getElementById('autoLogoutMinutes');
        if (input) {
          input.value = data.auto_logout_minutes;
        }
      }
    } catch (error) {
      console.error('Error loading auto-logout settings:', error);
    }
  },

  attachListeners(app) {
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.currentTarget.dataset.tab;
        this.switchTab(tabName);
      });
    });

    this.loadUsersData();
    this.loadRolesData();
    this.loadCompanyInfo();
    this.loadAutoLogoutSettings();
  },

  switchTab(tabName) {
    document.querySelectorAll('.settings-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      }
    });

    document.querySelectorAll('.settings-tab-content').forEach(content => {
      content.classList.remove('active');
      if (content.dataset.tabContent === tabName) {
        content.classList.add('active');
      }
    });

    this.currentTab = tabName;
  },

  async loadUsersData() {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      const users = data.users || [];
      this.renderUsersTable(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  },

  renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #9ca3af;">No users found. Click "Add New User" to create one.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map((user, index) => {
      return `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-avatar">👤</div>
              <div>
                <div class="user-name">${user.fullName || user.username}</div>
                <div class="user-email">${user.email || 'No email'}</div>
              </div>
            </div>
          </td>
          <td><span class="username-code">@${user.username}</span></td>
          <td><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
          <td>${user.salesCode || '-'}</td>
          <td><span class="status-badge status-active">Active</span></td>
          <td class="text-right">
            <button class="btn-icon" onclick="window.app.openEditUserModal('${user.id}')" title="Edit User">✏️</button>
            <button class="btn-icon btn-danger" onclick="window.app.deleteUser('${user.id}')" title="Delete User">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterUsers(searchTerm) {
    const rows = document.querySelectorAll('#usersTableBody tr');
    const term = searchTerm.toLowerCase();
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  },

  async loadRolesData() {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      const roles = data.roles || [];
      this.renderRolesGrid(roles);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  },

  renderRolesGrid(roles) {
    const grid = document.getElementById('rolesGrid');
    if (!grid) return;

    if (roles.length === 0) {
      grid.innerHTML = '<div style="text-align: center; padding: 40px; color: #9ca3af; grid-column: 1/-1;">No roles defined.</div>';
      return;
    }

    grid.innerHTML = roles.map((role, index) => {
      const permissions = role.permissions || [];
      const permissionTags = permissions.slice(0, 5).map(p => `<span class="permission-tag">${p}</span>`).join('');
      const moreTag = permissions.length > 5 ? `<span class="permission-tag">+${permissions.length - 5} more</span>` : '';

      return `
        <div class="role-card">
          <div class="role-card-header">
            <h3 class="role-card-title">${role.name}</h3>
            <span class="role-card-badge">${role.usersCount || 0} Users</span>
          </div>
          <p class="role-card-description">${role.description || 'No description provided'}</p>
          <div class="role-card-permissions">${permissionTags}${moreTag}</div>
          <div class="role-card-actions">
            <button class="btn-secondary btn-sm" onclick="window.app.openEditRoleModal('${role.id}')">Edit Role</button>
            <button class="btn-danger btn-sm" onclick="window.app.deleteRole('${role.id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  },

  async loadCompanyInfo() {
    try {
      const response = await fetch('/api/company-info');
      const data = await response.json();

      if (data.success) {
        const info = data.info;
        const companyNameEl = document.getElementById('companyNameDisplay');
        const emailEl = document.getElementById('contactEmailDisplay');
        const phoneEl = document.getElementById('phoneNumberDisplay');
        const logoEl = document.getElementById('logoPreview');

        if (companyNameEl) companyNameEl.textContent = info.company_name || 'Not set';
        if (emailEl) emailEl.textContent = info.contact_email || 'Not set';
        if (phoneEl) phoneEl.textContent = info.phone_number || 'Not set';

        if (logoEl && info.logo_path) {
          logoEl.innerHTML = `<img src="${info.logo_path}" alt="Logo" style="max-width: 100px; max-height: 100px; object-fit: contain;">`;
        }
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  },

  openCompanyInfoModal() {
    if (!document.getElementById('companyInfoModal')) {
      this.createCompanyInfoModal();
    }
    ui.openModal('companyInfoModal');
    this.loadCompanyInfoForm();
  },

  createCompanyInfoModal() {
    const modalHTML = `
      <div id="companyInfoModal" class="modal">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h2 id="companyInfoModalTitle">Edit Company Information</h2>
            <button class="close-btn" onclick="ui.closeModal('companyInfoModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="companyInfoForm">
              <div id="companyInfoErrorMsg" class="error-message" style="display: none;"></div>

              <div class="form-group">
                <label class="form-label">Company Logo</label>
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                  <div id="currentLogo" style="font-size: 48px;">📊</div>
                  <div style="flex: 1;">
                    <input type="file" id="companyLogo" class="form-input" accept="image/*" onchange="settingsPageModule.handleLogoPreview(event)">
                    <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0;">Upload company logo to display on login screen</p>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Company Name</label>
                <input type="text" id="companyNameInput" class="form-input" placeholder="Enter company name" required>
              </div>

              <div class="form-group">
                <label class="form-label">Contact Email</label>
                <input type="email" id="contactEmailInput" class="form-input" placeholder="contact@company.com">
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" id="phoneNumberInput" class="form-input" placeholder="+1 234 567 8900">
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" onclick="ui.closeModal('companyInfoModal')">Cancel</button>
                <button type="submit" class="btn-primary" id="saveCompanyInfoBtn">💾 Save Information</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('companyInfoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCompanyInfo();
    });
  },

  async loadCompanyInfoForm() {
    try {
      const response = await fetch('/api/company-info');
      const data = await response.json();

      if (data.success) {
        const info = data.info;
        document.getElementById('companyNameInput').value = info.company_name || '';
        document.getElementById('contactEmailInput').value = info.contact_email || '';
        document.getElementById('phoneNumberInput').value = info.phone_number || '';

        if (info.logo_path) {
          document.getElementById('currentLogo').innerHTML = `<img src="${info.logo_path}" alt="Logo" style="max-width: 80px; max-height: 80px; object-fit: contain;">`;
        }
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  },

  handleLogoPreview(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('currentLogo').innerHTML = `<img src="${e.target.result}" alt="Logo Preview" style="max-width: 80px; max-height: 80px; object-fit: contain;">`;
      };
      reader.readAsDataURL(file);
    }
  },

  async saveCompanyInfo() {
    const errorMsg = document.getElementById('companyInfoErrorMsg');
    errorMsg.style.display = 'none';

    const companyName = document.getElementById('companyNameInput').value.trim();
    const contactEmail = document.getElementById('contactEmailInput').value.trim();
    const phoneNumber = document.getElementById('phoneNumberInput').value.trim();
    const logoFile = document.getElementById('companyLogo').files[0];

    if (!companyName) {
      errorMsg.textContent = 'Company name is required';
      errorMsg.style.display = 'block';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('company_name', companyName);
      formData.append('contact_email', contactEmail);
      formData.append('phone_number', phoneNumber);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await fetch('/api/company-info', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        ui.closeModal('companyInfoModal');
        this.loadCompanyInfo();
        window.app.showConfirm('Success', '✓ Company information updated successfully!');
      } else {
        errorMsg.textContent = data.error || 'Failed to save company information';
        errorMsg.style.display = 'block';
      }
    } catch (error) {
      console.error('Error saving company info:', error);
      errorMsg.textContent = 'An error occurred while saving';
      errorMsg.style.display = 'block';
    }
  },

  // ========== HEADER TITLES FUNCTIONS ==========

  openHeaderTitlesModal() {
    if (!document.getElementById('headerTitlesModal')) {
      this.createHeaderTitlesModal();
    }
    ui.openModal('headerTitlesModal');
    this.loadHeaderTitlesForm();
  },

  createHeaderTitlesModal() {
    const modalHTML = `
      <div id="headerTitlesModal" class="modal">
        <div class="modal-content" style="max-width: 700px;">
          <div class="modal-header">
            <h2>📝 Edit Header Titles</h2>
            <button class="close-btn" onclick="ui.closeModal('headerTitlesModal')">&times;</button>
          </div>
          <div class="modal-body">
            <p style="color: #6b7280; margin-bottom: 24px; font-size: 14px;">
              Customize the titles that appear in the top bar for each page. Include emojis for a more visual experience.
            </p>
            
            <form id="headerTitlesForm">
              <div id="headerTitlesErrorMsg" class="error-message" style="display: none;"></div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                  <label class="form-label">Dashboard Title</label>
                  <input type="text" id="dashboardTitle" class="form-input" placeholder="📊 Dashboard" required>
                </div>

                <div class="form-group">
                  <label class="form-label">Sales Title</label>
                  <input type="text" id="salesTitle" class="form-input" placeholder="💰 Sales" required>
                </div>

                <div class="form-group">
                  <label class="form-label">Messaging Title</label>
                  <input type="text" id="messagingTitle" class="form-input" placeholder="💬 Messaging" required>
                </div>

                <div class="form-group">
                  <label class="form-label">Item Management Title</label>
                  <input type="text" id="productsTitle" class="form-input" placeholder="📦 Item Management" required>
                </div>

                <div class="form-group">
                  <label class="form-label">Customers Title</label>
                  <input type="text" id="customersTitle" class="form-input" placeholder="👥 Customers" required>
                </div>

                <div class="form-group">
                  <label class="form-label">Settings Title</label>
                  <input type="text" id="settingsTitle" class="form-input" placeholder="⚙️ Settings" required>
                </div>

                <div class="form-group">
                  <label class="form-label">User Management Title</label>
                  <input type="text" id="usersTitle" class="form-input" placeholder="👤 User Management" required>
                </div>
              </div>

              <div class="modal-actions" style="margin-top: 24px;">
                <button type="button" class="btn-secondary" onclick="ui.closeModal('headerTitlesModal')">Cancel</button>
                <button type="submit" class="btn-primary">💾 Save Titles</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('headerTitlesForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveHeaderTitles();
    });
  },

  async loadHeaderTitlesForm() {
    try {
      const response = await fetch('/api/header-titles');
      const data = await response.json();

      if (data.success && data.titles) {
        const t = data.titles;
        document.getElementById('dashboardTitle').value = t.dashboard_title || '📊 Dashboard';
        document.getElementById('salesTitle').value = t.sales_title || '💰 Sales';
        document.getElementById('messagingTitle').value = t.messaging_title || '💬 Messaging';
        document.getElementById('productsTitle').value = t.products_title || '📦 Item Management';
        document.getElementById('customersTitle').value = t.customers_title || '👥 Customers';
        document.getElementById('settingsTitle').value = t.settings_title || '⚙️ Settings';
        document.getElementById('usersTitle').value = t.users_title || '👤 User Management';
      }
    } catch (error) {
      console.error('Error loading header titles:', error);
    }
  },

  async saveHeaderTitles() {
    const errorMsg = document.getElementById('headerTitlesErrorMsg');
    errorMsg.style.display = 'none';

    try {
      const titles = {
        dashboard_title: document.getElementById('dashboardTitle').value.trim(),
        sales_title: document.getElementById('salesTitle').value.trim(),
        messaging_title: document.getElementById('messagingTitle').value.trim(),
        products_title: document.getElementById('productsTitle').value.trim(),
        customers_title: document.getElementById('customersTitle').value.trim(),
        settings_title: document.getElementById('settingsTitle').value.trim(),
        users_title: document.getElementById('usersTitle').value.trim()
      };

      // Validate all fields are filled
      const emptyFields = Object.values(titles).filter(val => !val);
      if (emptyFields.length > 0) {
        errorMsg.textContent = 'All title fields are required';
        errorMsg.style.display = 'block';
        return;
      }

      const response = await fetch('/api/header-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(titles)
      });

      const data = await response.json();

      if (data.success) {
        ui.closeModal('headerTitlesModal');
        window.app.showConfirm('Success', '✓ Header titles updated successfully! Refresh the page to see changes.');

        // Update the topbar title immediately if we're on one of those pages
        if (window.app && window.app.currentPage) {
          window.app.updateTopbarTitle();
        }
      } else {
        errorMsg.textContent = data.error || 'Failed to save header titles';
        errorMsg.style.display = 'block';
      }
    } catch (error) {
      console.error('Error saving header titles:', error);
      errorMsg.textContent = 'An error occurred while saving';
      errorMsg.style.display = 'block';
    }
  },

  createBackup() {
    alert('Database backup started. You will receive a download link shortly.');
  },

  exportData(type) {
    alert('Exporting ' + type + ' data... This may take a moment.');
  }
};

window.settingsPageModule = settingsPageModule;