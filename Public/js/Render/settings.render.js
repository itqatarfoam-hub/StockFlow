// ====================================================
// STOCKFLOW - SETTINGS RENDERS
// Settings and configuration screens
// ====================================================

const SettingsRenders = {

    /**
     * Settings page (uses module)
     */
    renderSettingsPage() {
        return window.settingsPageModule
            ? settingsPageModule.render()
            : this.renderSettingsPageFallback();
    },

    /**
     * Fallback settings page
     */
    renderSettingsPageFallback() {
        return `
      <div class="settings-container">
        <div class="page-header" style="margin-bottom: 24px;">
          <h1 style="margin: 0 0 8px 0;">⚙️ Settings</h1>
          <p style="margin: 0; color: #6b7280;">Configure your system preferences</p>
        </div>
        
        <!-- Settings Tabs -->
        <div class="settings-tabs card" style="padding: 0; margin-bottom: 24px;">
          <div style="display: flex; border-bottom: 2px solid #e5e7eb;">
            <button class="settings-tab active" data-tab="general" onclick="app.switchSettingsTab('general')"
                    style="flex: 1; padding: 16px; background: none; border: none; border-bottom: 3px solid #667eea; cursor: pointer; font-weight: 600; color: #667eea;">
              General
            </button>
            <button class="settings-tab" data-tab="users" onclick="app.switchSettingsTab('users')"
                    style="flex: 1; padding: 16px; background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer;">
              Users
            </button>
            <button class="settings-tab" data-tab="roles" onclick="app.switchSettingsTab('roles')"
                    style="flex: 1; padding: 16px; background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer;">
              Roles
            </button>
            <button class="settings-tab" data-tab="company" onclick="app.switchSettingsTab('company')"
                    style="flex: 1; padding: 16px; background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer;">
              Company
            </button>
          </div>
        </div>
        
        <!-- Settings Content -->
        <div id="settingsContent" class="card" style="padding: 32px;">
          ${this.renderGeneralSettings()}
        </div>
      </div>
    `;
    },

    /**
     * General settings
     */
    renderGeneralSettings() {
        return `
      <div class="settings-section">
        <h2 style="margin: 0 0 24px 0;">General Settings</h2>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">System Name</label>
          <input type="text" value="StockFlow" 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
        </div>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Currency</label>
          <select style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="QAR" selected>QAR - Qatari Riyal</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Timezone</label>
          <select style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
            <option value="UTC">UTC</option>
            <option value="Asia/Qatar" selected>Asia/Qatar (GMT+3)</option>
            <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" checked style="margin-right: 8px;">
            <span>Enable email notifications</span>
          </label>
        </div>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" checked style="margin-right: 8px;">
            <span>Enable low stock alerts</span>
          </label>
        </div>
        
        <button onclick="app.saveSettings()" 
                style="padding: 12px 32px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
          💾 Save Settings
        </button>
      </div>
    `;
    },

    /**
     * User management
     */
    renderUserManagement() {
        return `
      <div class="settings-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="margin: 0;">User Management</h2>
          <button onclick="app.openAddUserModal()" 
                  style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            ➕ Add User
          </button>
        </div>
        
        <div id="usersTable">
          <p style="color: #6b7280;">Loading users...</p>
        </div>
      </div>
    `;
    },

    /**
     * Role management
     */
    renderRoleManagement() {
        return `
      <div class="settings-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="margin: 0;">Role Management</h2>
          <button onclick="app.openAddRoleModal()" 
                  style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            ➕ Add Role
          </button>
        </div>
        
        <div id="rolesTable">
          <p style="color: #6b7280;">Loading roles...</p>
        </div>
      </div>
    `;
    },

    /**
     * Company settings
     */
    renderCompanySettings() {
        return `
      <div class="settings-section">
        <h2 style="margin: 0 0 24px 0;">Company Information</h2>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Company Name</label>
          <input type="text" placeholder="Your Company Name" 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
        </div>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Email</label>
          <input type="email" placeholder="info@company.com" 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
        </div>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Phone</label>
          <input type="tel" placeholder="+974 XXXX XXXX" 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
        </div>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Address</label>
          <textarea rows="3" placeholder="Company Address" 
                    style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; resize: vertical;"></textarea>
        </div>
        
        <button onclick="app.saveCompanyInfo()" 
                style="padding: 12px 32px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
          💾 Save Company Info
        </button>
      </div>
    `;
    }
};

// Export for global use
window.SettingsRenders = SettingsRenders;
