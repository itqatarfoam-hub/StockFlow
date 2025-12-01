// ============================================
// SETTINGS MODULE - Complete from app.js
// Author: itqatarfoam-hub
// Date: 2025-11-23 05:42:18 UTC
// ============================================

const settingsPageModule = {
  render() {
    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937;">🎨 Customize Login Form</h2>
          <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 13px;">Personalize the login page appearance</p>
          
          <form id="loginFormCustomizationForm">
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Logo Icon *</label>
              <input type="text" id="loginLogo" class="form-input" placeholder="e.g. 📊" maxlength="2" required style="padding: 7px 11px; font-size: 14px; width: 100%; text-align: center;">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">App Title *</label>
              <input type="text" id="loginTitle" class="form-input" placeholder="e.g. Qatar Foam" required style="padding: 7px 11px; font-size: 12px; width: 100%;">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">App Subtitle *</label>
              <input type="text" id="loginSubtitle" class="form-input" placeholder="e.g. Inventory & Sales" required style="padding: 7px 11px; font-size: 12px; width: 100%;">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Credentials Label *</label>
              <input type="text" id="loginDemoLabel" class="form-input" placeholder="e.g. Demo Credentials" required style="padding: 7px 11px; font-size: 12px; width: 100%;">
            </div>
            <div class="error-message-box" id="loginFormErrorMsg" style="font-size: 11px; margin-bottom: 12px;"></div>
            <button type="submit" class="btn-primary" style="width: auto; padding: 8px 12px; font-size: 12px; font-weight: 600;">
              💾 Save Login Form Settings
            </button>
          </form>
        </div>

        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937;">🔐 Login Form Preview</h2>
          <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 13px;">How the login page appears to users</p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; text-align: center;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: bold; margin: 0 auto 16px;" id="previewLogo">📊</div>
            <h3 style="font-size: 24px; font-weight: 700; color: white; margin: 0 0 4px 0;" id="previewTitle">StockFlow</h3>
            <p style="font-size: 14px; color: rgba(255,255,255,0.9); margin: 0 0 20px 0;" id="previewSubtitle">Inventory & Sales</p>
            <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-top: 24px;">
              <p style="font-size: 12px; color: rgba(255,255,255,0.9); margin: 0; font-weight: 600;" id="previewDemoLabel">Demo Credentials</p>
            </div>
          </div>
        </div>

        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700; color: #1f2937;">🔐 Change Password</h2>
          <p style="margin: 0 0 16px 0; font-size: 12px; color: #6b7280;">Update your login password securely</p>
          <form id="changePasswordForm">
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Current Password *</label>
              <input type="password" id="currentPassword" class="form-input" placeholder="Enter current password" required style="padding: 7px 11px; font-size: 12px; width: 100%;">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">New Password *</label>
              <input type="password" id="newPassword" class="form-input" placeholder="Enter new password (min 6 chars)" required style="padding: 7px 11px; font-size: 12px; width: 100%;">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Confirm New Password *</label>
              <input type="password" id="confirmPassword" class="form-input" placeholder="Confirm new password" required style="padding: 7px 11px; font-size: 12px; width: 100%;">
            </div>
            <div class="error-message-box" id="passwordErrorMsg" style="font-size: 11px; margin-bottom: 12px;"></div>
            <button type="submit" class="btn-primary" style="width: auto; padding: 8px 12px; font-size: 12px; font-weight: 600;">
              🔒 Update Password
            </button>
          </form>
        </div>

        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700; color: #1f2937;">ℹ️ System Information</h2>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #1f2937;"><strong>Version:</strong> 1.0.0</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #1f2937;"><strong>Created by:</strong> itqatarfoam-hub</p>
            <p style="margin: 0; font-size: 13px; color: #1f2937;"><strong>Date:</strong> 2025-11-23 05:42:18 UTC</p>
          </div>
        </div>
      </div>
    `;
  },

  attachListeners(app) {
    console.log('🔗 Settings: Attaching listeners...');

    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Change password submitted');
      });
    }

    // Login customization form
    const loginFormCustomizationForm = document.getElementById('loginFormCustomizationForm');
    if (loginFormCustomizationForm) {
      loginFormCustomizationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Login form customization submitted');
      });
    }

    // Update preview in real-time
    const logoInput = document.getElementById('loginLogo');
    const titleInput = document.getElementById('loginTitle');
    const subtitleInput = document.getElementById('loginSubtitle');
    const demoLabelInput = document.getElementById('loginDemoLabel');

    if (logoInput) logoInput.addEventListener('input', () => this.updatePreview());
    if (titleInput) titleInput.addEventListener('input', () => this.updatePreview());
    if (subtitleInput) subtitleInput.addEventListener('input', () => this.updatePreview());
    if (demoLabelInput) demoLabelInput.addEventListener('input', () => this.updatePreview());
    
    // Load current settings
    this.loadSettings();
  },

  updatePreview() {
    const logo = document.getElementById('loginLogo')?.value || '📊';
    const title = document.getElementById('loginTitle')?.value || 'StockFlow';
    const subtitle = document.getElementById('loginSubtitle')?.value || 'Inventory & Sales';
    const demoLabel = document.getElementById('loginDemoLabel')?.value || 'Demo Credentials';

    const previewLogo = document.getElementById('previewLogo');
    const previewTitle = document.getElementById('previewTitle');
    const previewSubtitle = document.getElementById('previewSubtitle');
    const previewDemoLabel = document.getElementById('previewDemoLabel');

    if (previewLogo) previewLogo.textContent = logo;
    if (previewTitle) previewTitle.textContent = title;
    if (previewSubtitle) previewSubtitle.textContent = subtitle;
    if (previewDemoLabel) previewDemoLabel.textContent = demoLabel;
  },

  async loadSettings() {
    try {
      const res = await fetch('/api/login-settings', { credentials: 'same-origin' });
      const data = await res.json();
      
      const settings = data.settings || {};
      const logo = settings.logo || '📊';
      const title = settings.title || 'StockFlow';
      const subtitle = settings.subtitle || 'Inventory & Sales Management';
      const demoLabel = settings.demo_label || 'Demo Credentials';

      const logoInput = document.getElementById('loginLogo');
      const titleInput = document.getElementById('loginTitle');
      const subtitleInput = document.getElementById('loginSubtitle');
      const demoLabelInput = document.getElementById('loginDemoLabel');

      if (logoInput) logoInput.value = logo;
      if (titleInput) titleInput.value = title;
      if (subtitleInput) subtitleInput.value = subtitle;
      if (demoLabelInput) demoLabelInput.value = demoLabel;

      this.updatePreview();
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }
};

window.settingsPageModule = settingsPageModule;