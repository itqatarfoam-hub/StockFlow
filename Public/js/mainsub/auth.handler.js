// ============================================
// STOCKFLOW -AUTH HANDLER MODULE
// Handles authentication operations
// ============================================

const AuthHandler = {
    /**
     * Render login page
     */
    async renderLoginPage() {
        try {
            const settings = await settingsModule.loadLoginSettings();

            const hasCompanyInfo = settings.company_name || settings.contact_email || settings.phone_number;

            const logoDisplay = settings.logo_path
                ? `<img src="${settings.logo_path}" alt="Company Logo" style="max-width: 120px; max-height: 120px; object-fit: contain;">`
                : (settings.logo || '📊');

            let footerSection = '';
            if (hasCompanyInfo) {
                footerSection = `
          <div class="company-info" style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${settings.company_name || ''}</h4>
            ${settings.contact_email ? `<p style="margin: 4px 0; font-size: 13px; color: #6b7280;">📧 ${settings.contact_email}</p>` : ''}
            ${settings.phone_number ? `<p style="margin: 4px 0; font-size: 13px; color: #6b7280;">📞 ${settings.phone_number}</p>` : ''}
          </div>
        `;
            } else {
                footerSection = `
          <div class="demo-credentials">
            <p>Demo Credentials</p>
            <p style="margin-top: 8px; font-weight: 600;">Username: <strong>admin</strong> | Password: <strong>admin123</strong></p>
          </div>
        `;
            }

            return `
        <div class="login-container">
          <div class="login-card">
            <div class="login-header">
              <div class="login-logo">${logoDisplay}</div>
              <div class="login-title">${settings.title || 'StockFlow'}</div>
              <div class="login-subtitle">${settings.subtitle || 'Inventory & Sales Management'}</div>
            </div>

            <form id="loginForm" class="login-form">
              <div id="loginErrorMsg" class="error-message" style="display: none;"></div>

              <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" id="loginUsername" class="form-input" placeholder="Enter username" required autofocus>
              </div>

              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" id="loginPassword" class="form-input" placeholder="Enter password" required>
              </div>

              <button type="submit" class="form-button">Login</button>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; font-size: 13px;">
                <label style="display: flex; align-items: center; gap: 6px; color: #6b7280; cursor: pointer;">
                  <input type="checkbox" id="rememberMe" style="width: 16px; height: 16px; cursor: pointer;">
                  <span>Remember me</span>
                </label>
                <a href="#" id="forgotPasswordLink" style="color: #667eea; text-decoration: none; font-weight: 500;" onclick="event.preventDefault(); AuthHandler.handleForgotPassword();">
                  Forgot Password?
                </a>
              </div>
            </form>

            ${footerSection}
          </div>
        </div>
      `;
        } catch (error) {
            console.error('Failed to load login settings:', error);
            return this.renderFallbackLogin();
        }
    },

    /**
     * Render fallback login page
     */
    renderFallbackLogin() {
        return `
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <div class="login-logo">📊</div>
            <div class="login-title">StockFlow</div>
            <div class="login-subtitle">Inventory & Sales Management</div>
          </div>

          <form id="loginForm" class="login-form">
            <div id="loginErrorMsg" class="error-message" style="display: none;"></div>

            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" id="loginUsername" class="form-input" placeholder="Enter username" required autofocus>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" id="loginPassword" class="form-input" placeholder="Enter password" required>
            </div>

            <button type="submit" class="form-button">Login</button>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; font-size: 13px;">
              <label style="display: flex; align-items: center; gap: 6px; color: #6b7280; cursor: pointer;">
                <input type="checkbox" id="rememberMe" style="width: 16px; height: 16px; cursor: pointer;">
                <span>Remember me</span>
              </label>
              <a href="#" style="color: #667eea; text-decoration: none; font-weight: 500;" onclick="event.preventDefault(); alert('Password reset feature coming soon!');">
                Forgot Password?
              </a>
            </div>
          </form>

          <div class="demo-credentials">
            <p>Demo Credentials</p>
            <p style="margin-top: 8px; font-weight: 600;">Username: <strong>admin</strong> | Password: <strong>admin123</strong></p>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Handle login
     */
    async handleLogin(app, e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        console.log('🔐 ========== LOGIN START ==========');

        const username = document.getElementById('loginUsername')?.value.trim();
        const password = document.getElementById('loginPassword')?.value.trim();

        ui.hideError('loginErrorMsg');

        if (!username || !password) {
            console.error('❌ Missing credentials');
            ui.showError('loginErrorMsg', 'Please enter username and password');
            return;
        }

        try {
            const result = await authModule.login(username, password);

            if (!result.success) {
                console.error('❌ Login failed:', result.error);
                ui.showError('loginErrorMsg', result.error);
                return;
            }

            console.log('✅ Login successful for:', username);
            app.currentUser = result.user;
            app.currentPage = 'dashboard';

            // Clear old data
            app.products = [];
            app.categories = [];
            app.customers = [];
            app.sales = [];
            app.users = [];

            console.log('📦 Loading initial data...');
            await DataLoaders.loadInitialData(app);

            console.log('🔐 Loading role configuration...');
            await DataLoaders.loadRoleConfig(app);
            console.log('✅ Role config loaded for role:', app.currentUser.role);

            console.log('🎨 Rendering dashboard...');
            await app.render();

            console.log('🔗 Attaching listeners...');
            app.attachGlobalListeners();
            app.attachPageSpecificListeners();

            console.log('✅ Login complete!');
            console.log('🔐 ========== LOGIN COMPLETE ==========\n');

        } catch (error) {
            console.error('❌ Login error:', error);
            ui.showError('loginErrorMsg', 'An error occurred. Please try again.');
        }
    },

    /**
     * Handle forgot password
     */
    handleForgotPassword() {
        const modal = document.getElementById('forgotPasswordModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('forgotPasswordUsername').value = '';
            document.getElementById('forgotPasswordError').textContent = '';
        }
    },

    /**
     * Close forgot password modal
     */
    closeForgotPasswordModal() {
        const modal = document.getElementById('forgotPasswordModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Submit forgot password
     */
    async submitForgotPassword(app) {
        const username = document.getElementById('forgotPasswordUsername').value.trim();
        const errorDiv = document.getElementById('forgotPasswordError');

        if (!username) {
            errorDiv.textContent = 'Please enter your username';
            return;
        }

        errorDiv.textContent = '';

        try {
            const result = await notificationsModule.sendPasswordResetRequest(username);

            if (result.success) {
                this.closeForgotPasswordModal();
                app.showConfirm('Success', result.message, () => { }, true);
            } else {
                errorDiv.textContent = result.error || 'Failed to send request';
            }
        } catch (error) {
            console.error('Error:', error);
            errorDiv.textContent = 'An error occurred. Please try again.';
        }
    },

    /**
     * Handle logout
     */
    async handleLogout(app) {
        await authModule.logout();
        app.currentUser = null;
        app.currentPage = 'login';
        await app.render();
        app.attachGlobalListeners();
    }
};

// Export for use in other modules
window.AuthHandler = AuthHandler;
