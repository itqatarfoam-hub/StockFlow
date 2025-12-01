// ============================================
// STOCKFLOW - MAIN APPLICATION (COMPLETE FIXED)
// Author: itqatarfoam-hub
// Date: 2025-11-23 05:45:33 UTC
// ============================================

class StockFlowApp {
  constructor() {
    console.log('🚀 StockFlow initializing...');
    console.log('📅 Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):', new Date().toISOString().replace('T', ' ').substring(0, 19));
    console.log("👤 Current user's login:", 'itqatarfoam-hub');

    this.currentUser = null;
    this.currentPage = 'login';
    this.products = [];
    this.categories = [];
    this.locations = [];
    this.customers = [];
    this.sales = [];
    this.users = [];
    this.roles = [];
    this.editingProductId = null;
    this.editingCustomerId = null;
    this.editingUserId = null;
    this.editingCategoryId = null;
    this.editingLocationId = null;
    this.editingRoleId = null;
    this.currentSaleItems = [];

    console.log('✅ StockFlowApp initialized');

    // Role-based access
    this.roleAccessConfig = {
      admin: ['dashboard', 'sales', 'messaging', 'products', 'customers', 'users', 'settings'],
      manager: ['dashboard', 'sales', 'messaging', 'products', 'customers', 'settings'],
      user: ['dashboard', 'sales', 'messaging', 'settings']
    };

    this.init();
  }

  // ========== INITIALIZATION ==========
  async init() {
    await this.checkAuth();
    await this.render();
    this.attachGlobalListeners();
  }

  async checkAuth() {
    const result = await authModule.checkAuth();

    if (result.authenticated) {
      this.currentUser = result.user;
      this.currentPage = 'dashboard';
      console.log('✅ Authenticated as:', this.currentUser.username);

      // Load role configuration to ensure menu and permissions are correct
      await this.loadRoleConfig();
    } else {
      this.currentPage = 'login';
      console.log('❌ Not authenticated - showing login page');
    }
  }

  async loadInitialData() {
    try {
      console.log('📦 Loading products, categories, and customers...');

      // Load data in parallel
      const [products, categories, customers] = await Promise.all([
        this.loadProducts(),
        this.loadCategories(),
        this.loadCustomers()
      ]);

      console.log(`✅ Loaded: ${this.products.length} products, ${this.categories.length} categories, ${this.customers.length} customers`);

      return true;
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
      return false;
    }
  }

  async loadProducts() {
    this.products = await productsModule.loadProducts();
  }

  async loadCategories() {
    this.categories = await categoriesModule.loadCategories();
  }

  async loadCustomers() {
    this.customers = await customersModule.loadCustomers();
  }

  async loadSalesData() {
    try {
      const [salesRes, customersRes] = await Promise.all([
        fetch('/api/sales', { credentials: 'same-origin' }),
        fetch('/api/customers', { credentials: 'same-origin' })
      ]);

      const salesData = await salesRes.json();
      const customersData = await customersRes.json();

      this.sales = salesData.sales || [];
      this.customers = customersData.customers || [];
      this.updateCustomerDropdown();
    } catch (e) {
      console.error('❌ Error loading sales data:', e);
    }
  }

  // ========== LOAD ROLE CONFIGURATION ==========
  async loadRoleConfig() {
    try {
      console.log('📡 Fetching role configurations from database...');

      const response = await fetch('/api/roles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('❌ Failed to load role config:', response.status);
        // Keep the default configuration if API fails
        return;
      }

      const data = await response.json();

      if (!data.roles || !Array.isArray(data.roles)) {
        console.error('❌ Invalid role data received');
        return;
      }

      console.log('✅ Received', data.roles.length, 'roles from database');
      this.roles = data.roles;

      // Build roleAccessConfig from database roles
      const newConfig = {};

      data.roles.forEach(role => {
        const permissions = Array.isArray(role.permissions)
          ? role.permissions
          : (typeof role.permissions === 'string' ? JSON.parse(role.permissions) : []);

        newConfig[role.name] = permissions;
        console.log(`  📋 ${role.name}:`, permissions);
      });

      // Update the role access configuration
      this.roleAccessConfig = newConfig;

      console.log('✅ Role configuration updated successfully');

    } catch (error) {
      console.error('❌ Error loading role config:', error);
      // Keep the default configuration if there's an error
    }
  }

  // ========== RENDERING ==========
  async render() {
    const appDiv = document.getElementById('app');
    if (!appDiv) {
      console.error('❌ App div not found');
      return;
    }

    let content = '';

    if (this.currentPage === 'login') {
      console.log('🎨 Rendering login page');
      content = await this.renderLoginPage();
    } else {
      console.log('🎨 Rendering dashboard layout for page:', this.currentPage);
      // Dashboard layout with sidebar + main content
      content = `
        <div class="dashboard-container">
          ${this.renderSidebar()}
          <div class="main-content">
            ${this.renderTopbar()}
            <div class="page-container" id="pageContent">
              ${this.getPageContent()}
            </div>
          </div>
          ${this.renderModals()}
        </div>
      `;
    }

    appDiv.innerHTML = content;
    console.log('✅ Rendered page:', this.currentPage);

    // Log menu items AFTER rendering
    setTimeout(() => {
      const menuItems = document.querySelectorAll('.sidebar-menu-item');
      console.log('🔍 Menu items after render:', menuItems.length);
      menuItems.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.dataset.page} - ${item.textContent.trim()}`);
      });
    }, 50);
  } // ← FIXED: Properly closes render() method

  getPageContent() {
    console.log('📄 Getting content for page:', this.currentPage);

    try {
      switch (this.currentPage) {
        case 'dashboard':
          return this.getRoleDashboard();
        case 'products':
          return window.productsPageModule ? productsPageModule.render(this) : '<div class="card"><h2>Products module not loaded</h2></div>';
        case 'customers':
          return window.customersPageModule ? customersPageModule.render(this) : '<div class="card"><h2>Customers module not loaded</h2></div>';
        case 'sales':
          return window.salesPageModule ? salesPageModule.render(this) : '<div class="card"><h2>Sales module not loaded</h2></div>';
        case 'messaging':
          return window.messagingPageModule ? messagingPageModule.render(this) : '<div class="card"><h2>Messaging module not loaded</h2></div>';
        case 'users':
          return window.usersPageModule ? usersPageModule.render(this) : '<div class="card"><h2>Users module not loaded</h2></div>';
        case 'settings':
          return window.settingsPageModule ? settingsPageModule.render() : '<div class="card"><h2>Settings module not loaded</h2></div>';
        default:
          return '<div style="padding: 40px; text-align: center;"><h2>Page not found</h2></div>';
      }
    } catch (error) {
      console.error('❌ Error getting page content:', error);
      return `<div class="card"><h2>Error loading page</h2><p>${error.message}</p></div>`;
    }
  }

  // ========== ROLE-BASED DASHBOARD ROUTING ==========
  getRoleDashboard() {
    let userRole = this.currentUser?.role?.toLowerCase() || 'user';

    console.log('🎯 ========== DASHBOARD ROUTING ==========');
    console.log('📋 Current User:', this.currentUser);
    console.log('👤 Original Role:', this.currentUser?.role);
    console.log('🔤 Normalized Role:', userRole);

    // Handle 'admin' as 'administrator'
    if (userRole === 'admin') {
      userRole = 'administrator';
      console.log('✨ Mapping "admin" to "administrator"');
    }

    // Map role names to dashboard module names
    const dashboardModules = {
      'administrator': window.administratorDashboardModule,
      'admin': window.administratorDashboardModule, // Support both variations
      'manager': window.managerDashboardModule,
      'user': window.userDashboardModule,
      'hr': window.hrDashboardModule,
      'sales': window.salesDashboardModule,
      'purchase': window.purchaseDashboardModule,
      'store': window.storeDashboardModule
    };

    console.log('🗺️ Available dashboard modules:', Object.keys(dashboardModules));
    console.log('🔍 Looking for module:', userRole);

    // Get role-specific dashboard module
    const roleDashboard = dashboardModules[userRole];

    if (roleDashboard) {
      console.log(`✅ SUCCESS: Loading ${userRole} dashboard module`);
      console.log('📦 Module found:', roleDashboard);
      console.log('🎯 ========================================\n');
      return roleDashboard.render();
    } else {
      // Fallback to default dashboard
      console.warn(`⚠️ WARNING: No specific dashboard for role '${userRole}'`);
      console.warn('📋 Available roles:', Object.keys(dashboardModules).join(', '));
      console.warn('🔄 Falling back to default dashboard');
      console.log('🎯 ========================================\n');
      return window.dashboardModule ? dashboardModule.render() : '<div class="card"><h2>Dashboard module not loaded</h2></div>';
    }
  }

  attachRoleDashboardListeners() {
    let userRole = this.currentUser?.role?.toLowerCase() || 'user';

    console.log('🔗 ========== ATTACHING DASHBOARD LISTENERS ==========');
    console.log('👤 Role:', userRole);

    // Handle 'admin' as 'administrator'
    if (userRole === 'admin') {
      userRole = 'administrator';
      console.log('✨ Mapping "admin" to "administrator"');
    }

    // Map role names to dashboard module names
    const dashboardModules = {
      'administrator': window.administratorDashboardModule,
      'admin': window.administratorDashboardModule, // Support both variations
      'manager': window.managerDashboardModule,
      'user': window.userDashboardModule,
      'hr': window.hrDashboardModule,
      'sales': window.salesDashboardModule,
      'purchase': window.purchaseDashboardModule,
      'store': window.storeDashboardModule
    };

    // Get role-specific dashboard module
    const roleDashboard = dashboardModules[userRole];

    if (roleDashboard && roleDashboard.attachListeners) {
      console.log(`✅ SUCCESS: Attaching ${userRole} dashboard listeners`);
      console.log('🔗 ================================================\n');
      roleDashboard.attachListeners(this);
    } else if (window.dashboardModule) {
      console.warn(`⚠️ WARNING: No specific dashboard listeners for role '${userRole}'`);
      console.warn('🔄 Using default dashboard listeners');
      console.log('🔗 ================================================\n');
      dashboardModule.attachListeners(this);
    } else {
      console.error('❌ ERROR: No dashboard module found at all!');
      console.log('🔗 ================================================\n');
    }
  }
  // ========== SIDEBAR ==========
  // ========== SIDEBAR ==========
  renderSidebar() {
    const user = this.currentUser || {};
    const role = user.role || 'user';

    console.log('🎨 Rendering sidebar for role:', role);
    console.log('📋 Role config:', this.roleAccessConfig);

    // Get allowed pages for this role
    const allowedPages = this.roleAccessConfig[role] || this.roleAccessConfig['user'] || [];
    console.log('✅ Allowed pages:', allowedPages);

    // Define all possible menu items with their permissions
    const menuItems = [
      {
        page: 'dashboard',
        icon: '📊',
        label: 'Dashboard',
        permission: 'dashboard'
      },
      {
        page: 'sales',
        icon: '💰',
        label: 'Sales',
        permission: 'sales'
      },
      {
        page: 'messaging',
        icon: '💬',
        label: 'Messaging',
        permission: 'messaging'
      },
      {
        page: 'products',
        icon: '📦',
        label: 'Item Management',
        permission: 'products'
      },
      {
        page: 'customers',
        icon: '👥',
        label: 'Customers',
        permission: 'customers'
      },

      {
        page: 'settings',
        icon: '⚙️',
        label: 'Settings',
        permission: 'settings'
      }
    ];

    // Filter menu items based on permissions
    const visibleMenuItems = menuItems.filter(item => {
      const hasAccess = allowedPages.includes(item.permission);
      console.log(`  ${item.label}: ${hasAccess ? '✓ SHOW' : '✗ HIDE'}`);
      return hasAccess;
    });

    console.log('✅ Visible menu items:', visibleMenuItems.length);

    // Generate menu HTML
    const menuHTML = visibleMenuItems.map(item => `
      <a href="#" class="sidebar-menu-item ${this.currentPage === item.page ? 'active' : ''}" data-page="${item.page}">
        <span>${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `).join('');

    return `
      <div class="sidebar">
        <div class="sidebar-logo">
          <div class="sidebar-logo-badge">SF</div>
          <div class="sidebar-logo-text">
            <h2>StockFlow</h2>
            <p>Inventory System</p>
          </div>
        </div>

        <div class="sidebar-menu">
          ${menuHTML}
        </div>

        <button class="sidebar-logout" id="logoutBtn">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    `;
  }


  // ========== TOPBAR ==========
  renderTopbar() {
    const user = this.currentUser || {};
    const now = new Date();

    const dateOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const formattedDate = now.toLocaleDateString('en-US', dateOptions);

    const pageTitles = {
      'dashboard': '📊 Dashboard',
      'products': '📦 Item Management',
      'customers': '👥 Customers',
      'sales': '💰 Sales',
      'messaging': '💬 Messaging',
      'users': '👤 User Management',
      'settings': '⚙️ Settings'
    };

    const pageTitle = pageTitles[this.currentPage] || 'StockFlow';

    return `
      <div class="topbar">
        <div class="topbar-left">
          <h1>${pageTitle}</h1>
        </div>
        <div class="topbar-right">
          <div class="topbar-username">${user.username || 'User'} <span style="color: #6b7280; font-size: 11px;">| ${(user.role || 'user').toUpperCase()}</span></div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="notification-bell-container">
              <button class="notification-bell-btn" onclick="notificationsModule.toggleModal()" title="Notifications">
                🔔
                <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
              </button>
            </div>
            <div class="topbar-date">${formattedDate}</div>
          </div>
        </div>
      </div>
    `;
  }

  // ========== LOGIN PAGE ==========
  async renderLoginPage() {
    try {
      const settings = await settingsModule.loadLoginSettings();

      // Determine if we should show company info or demo credentials
      const hasCompanyInfo = settings.company_name || settings.contact_email || settings.phone_number;

      // Build the logo display
      const logoDisplay = settings.logo_path
        ? `<img src="${settings.logo_path}" alt="Company Logo" style="max-width: 120px; max-height: 120px; object-fit: contain;">`
        : (settings.logo || '📊');

      // Build company info or demo credentials section
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
                <a href="#" id="forgotPasswordLink" style="color: #667eea; text-decoration: none; font-weight: 500;" onclick="event.preventDefault(); window.app.handleForgotPassword();">
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
    }
  }

  async handleLogin(e) {
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
      this.currentUser = result.user;
      this.currentPage = 'dashboard';

      // Clear old data
      this.products = [];
      this.categories = [];
      this.customers = [];
      this.sales = [];
      this.users = [];

      console.log('📦 Loading initial data...');
      await this.loadInitialData();

      // ⭐ CRITICAL: Load role configuration BEFORE rendering
      console.log('🔐 Loading role configuration...');
      await this.loadRoleConfig();
      console.log('✅ Role config loaded for role:', this.currentUser.role);
      console.log('📋 Allowed pages:', this.roleAccessConfig[this.currentUser.role]);

      console.log('🎨 Rendering dashboard...');
      await this.render();

      console.log('🔗 Attaching listeners...');
      this.attachGlobalListeners();
      this.attachPageSpecificListeners();

      console.log('✅ Login complete!');
      console.log('🔐 ========== LOGIN COMPLETE ==========\n');

    } catch (error) {
      console.error('❌ Login error:', error);
      ui.showError('loginErrorMsg', 'An error occurred. Please try again.');
    }
  }

  handleForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
      modal.classList.add('active');
      document.getElementById('forgotPasswordUsername').value = '';
      document.getElementById('forgotPasswordError').textContent = '';
    }
  }

  closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  async submitForgotPassword() {
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
        this.showConfirm('Success', result.message, () => { }, true);
      } else {
        errorDiv.textContent = result.error || 'Failed to send request';
      }
    } catch (error) {
      console.error('Error:', error);
      errorDiv.textContent = 'An error occurred. Please try again.';
    }
  }

  async handleLogout() {
    await authModule.logout();
    this.currentUser = null;
    this.currentPage = 'login';
    await this.render();
    this.attachGlobalListeners();
  }

  // ========== ROLE-BASED ACCESS ==========
  hasAccessToPage(page) {
    const userRole = this.currentUser?.role || 'user';
    const allowedPages = this.roleAccessConfig[userRole] || this.roleAccessConfig.user;
    return allowedPages.includes(page);
  }

  // ========== MODALS ==========
  renderModals() {
    return `
      <!-- Confirm Modal -->
      <div id="confirmModal" class="modal">
        <div class="modal-content" style="max-width: 400px;">
          <h3 class="modal-header" id="confirmTitle">Confirm Action</h3>
          <p id="confirmMessage" style="color: #6b7280; margin: 0 0 24px 0; font-size: 14px; white-space: pre-line;"></p>
          <div class="form-button-group">
            <button type="button" class="btn-secondary" id="confirmNo">Cancel</button>
            <button type="button" class="btn-primary" id="confirmYes">Confirm</button>
          </div>
        </div>
      </div>

      <!-- Notifications Modal -->
      <div id="notificationsModal" class="modal">
        <div class="modal-content" style="max-width: 900px;">
          <div class="modal-header">
            <span>🔔 Notifications & Tasks</span>
            <button class="modal-close" onclick="notificationsModule.toggleModal()">×</button>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
            <button class="btn-secondary btn-sm" onclick="notificationsModule.markAllAsRead()">Mark All as Read</button>
          </div>
          <div id="notificationsGrid" class="notifications-grid">
            <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; color: #9ca3af;">
              <div style="font-size: 48px; margin-bottom: 12px;">🔔</div>
              <div style="font-size: 16px; font-weight: 500;">Loading notifications...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Forgot Password Modal -->
      <div id="forgotPasswordModal" class="modal">
        <div class="modal-content" style="max-width: 450px;">
          <div class="modal-header">
            <span>🔐 Forgot Password</span>
            <button class="modal-close" onclick="window.app.closeForgotPasswordModal()">×</button>
          </div>
          <p style="color: #6b7280; margin-bottom: 20px; font-size: 14px;">
            Enter your username below and we'll send a notification to the administrators to help you reset your password.
          </p>
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" id="forgotPasswordUsername" class="form-input" placeholder="Enter your username" autofocus>
          </div>
          <div id="forgotPasswordError" class="error-message-box"></div>
          <div class="form-button-group">
            <button type="button" class="btn-secondary" onclick="window.app.closeForgotPasswordModal()">Cancel</button>
            <button type="button" class="btn-primary" onclick="window.app.submitForgotPassword()">Send Request</button>
          </div>
        </div>
      </div>

      <!-- Stock Update Modal -->
      <div id="stockModal" class="modal">
        <div class="modal-content" style="max-width: 650px;">
          <h3 class="modal-header">📦 Update Stock</h3>
          <form id="stockForm">
            <!-- Row 1: Location and Product ID -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Location</label>
                <input type="text" id="stockProductLocation" class="form-input" readonly style="background: #f3f4f6;">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Product ID</label>
                <input type="text" id="stockProductId" class="form-input" readonly style="background: #f3f4f6;">
              </div>
            </div>

            <!-- Row 2: Product Name and Category -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Product Name</label>
                <input type="text" id="stockProductName" class="form-input" readonly style="background: #f3f4f6;">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Category</label>
                <input type="text" id="stockProductCategory" class="form-input" readonly style="background: #f3f4f6;">
              </div>
            </div>

            <!-- Row 3: Current Stock, Quantity Change, Update Date -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Current Stock</label>
                <input type="text" id="stockCurrent" class="form-input" readonly style="background: #f3f4f6; font-weight: bold;">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Quantity Change *</label>
                <input type="number" id="stockNewQuantity" class="form-input" placeholder="e.g. 10 or -5" required>
                <p style="margin: 4px 0 0 0; font-size: 10px; color: #6b7280;">+/- to add/remove</p>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Update Date *</label>
                <input type="date" id="stockUpdateDate" class="form-input" required>
              </div>
            </div>

            <!-- Row 4: Notes (Full Width) -->
            <div class="form-group">
              <label class="form-label">Notes (Optional)</label>
              <textarea id="stockNotes" class="form-textarea" placeholder="Reason for update..." style="min-height: 70px;"></textarea>
            </div>
            
            <div class="error-message-box" id="stockErrorMsg"></div>

            <div class="form-button-group">
              <button type="submit" class="btn-primary">Update Stock</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeStockModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Product Modal -->
      <div id="productModal" class="modal">
        <div class="modal-content" style="max-width: 650px;">
          <h3 class="modal-header" id="productModalTitle">Add New Product</h3>
          <div class="error-message-box" id="productErrorMsg"></div>
          <form id="productForm">
            <!-- Row 1: Location and Category -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Location *</label>
                <select id="productLocation" class="form-select" required>
                  <option value="">Select Location</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Category *</label>
                <select id="productCategory" class="form-select" required>
                  <option value="">Select Category</option>
                </select>
              </div>
            </div>

            <!-- Row 2: Product ID and Product Name -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Product ID *</label>
                <input type="text" id="productId" class="form-input" placeholder="e.g. PROD-001" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Product Name *</label>
                <input type="text" id="productName" class="form-input" placeholder="e.g. Wireless Mouse" required>
              </div>
            </div>

            <!-- Row 3: Description (Full Width) -->
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="productDescription" class="form-textarea" placeholder="Product description" style="min-height: 70px;"></textarea>
            </div>

            <!-- Row 4: Stock, Unit Price, Entry Date -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Stock Quantity *</label>
                <input type="number" id="productStock" class="form-input" placeholder="0" min="0" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Unit Price *</label>
                <input type="number" id="productUnitPrice" class="form-input" placeholder="0.00" min="0" step="0.01" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Entry Date *</label>
                <input type="date" id="productEntryDate" class="form-input" required>
              </div>
            </div>

            <div class="form-button-group">
              <button type="submit" class="btn-primary" id="productSubmitBtn">Add Product</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeProductModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Category Modal -->
      <div id="editCategoryModal" class="modal">
        <div class="modal-content" style="max-width: 500px;">
          <h3 class="modal-header">Edit Category</h3>
          <form id="editCategoryForm">
            <div class="form-group">
              <label class="form-label">Category Name *</label>
              <input type="text" id="editCategoryName" class="form-input" placeholder="Category name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="editCategoryDescription" class="form-textarea" placeholder="Category description (optional)" style="min-height: 80px;"></textarea>
            </div>
            <div class="error-message-box" id="editCategoryErrorMsg" style="font-size: 12px; margin-bottom: 12px;"></div>
            <div class="form-button-group">
              <button type="submit" class="btn-primary">✓ Update Category</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeEditCategoryModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

<!-- Create Role Modal -->
      <div id="createRoleModal" class="modal">
        <div class="modal-content" style="max-width: 600px;">
          <h3 class="modal-header">🔐 Create New Role</h3>
          <form id="createRoleForm">
            <div class="form-group">
              <label class="form-label">Role Name * (lowercase, no spaces)</label>
              <input type="text" id="roleName" class="form-input" placeholder="e.g., sales_manager" required pattern="[a-z_]+" maxlength="50">
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">Use lowercase letters and underscores only</p>
            </div>

            <div class="form-group">
              <label class="form-label">Display Name *</label>
              <input type="text" id="roleDisplayName" class="form-input" placeholder="e.g., Sales Manager" required maxlength="100">
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="roleDescription" class="form-textarea" placeholder="Describe this role's responsibilities..." style="min-height: 60px;" maxlength="200"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Menu Permissions * (Select at least one)</label>
              <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <label style="display: flex; align-items: center; padding: 10px; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                  <input type="checkbox" name="role_permissions" value="dashboard" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
                  <span style="font-size: 20px; margin-right: 8px;">📊</span>
                  <div>
                    <p style="margin: 0; font-weight: 600; font-size: 14px; color: #1f2937;">Dashboard</p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">View statistics and overview</p>
                  </div>
                </label>

                <label style="display: flex; align-items: center; padding: 10px; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                  <input type="checkbox" name="role_permissions" value="sales" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
                  <span style="font-size: 20px; margin-right: 8px;">💰</span>
                  <div>
                    <p style="margin: 0; font-weight: 600; font-size: 14px; color: #1f2937;">Sales</p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Create and manage sales transactions</p>
                  </div>
                </label>

                <label style="display: flex; align-items: center; padding: 10px; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                  <input type="checkbox" name="role_permissions" value="messaging" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
                  <span style="font-size: 20px; margin-right: 8px;">💬</span>
                  <div>
                    <p style="margin: 0; font-weight: 600; font-size: 14px; color: #1f2937;">Messaging</p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Chat with team members</p>
                  </div>
                </label>

                <label style="display: flex; align-items: center; padding: 10px; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                  <input type="checkbox" name="role_permissions" value="products" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
                  <span style="font-size: 20px; margin-right: 8px;">📦</span>
                  <div>
                    <p style="margin: 0; font-weight: 600; font-size: 14px; color: #1f2937;">Item Management</p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Manage products and inventory</p>
                  </div>
                </label>

                <label style="display: flex; align-items: center; padding: 10px; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                  <input type="checkbox" name="role_permissions" value="customers" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
                  <span style="font-size: 20px; margin-right: 8px;">👥</span>
                  <div>
                    <p style="margin: 0; font-weight: 600; font-size: 14px; color: #1f2937;">Customers</p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Manage customer information</p>
                  </div>
                </label>

                <label style="display: flex; align-items: center; padding: 10px; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                  <input type="checkbox" name="role_permissions" value="users" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
                  <span style="font-size: 20px; margin-right: 8px;">👤</span>
                  <div>
                    <p style="margin: 0; font-weight: 600; font-size: 14px; color: #1f2937;">User Management</p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Manage users and roles</p>
                  </div>
                </label>

                <label style="display: flex; align-items: center; padding: 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                  <input type="checkbox" name="role_permissions" value="settings" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
                  <span style="font-size: 20px; margin-right: 8px;">⚙️</span>
                  <div>
                    <p style="margin: 0; font-weight: 600; font-size: 14px; color: #1f2937;">Settings</p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Configure system settings</p>
                  </div>
                </label>
              </div>
            </div>

            <div class="error-message-box" id="createRoleErrorMsg" style="font-size: 12px; margin-bottom: 12px;"></div>

            <div class="form-button-group">
              <button type="submit" class="btn-primary">✓ Create Role</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeCreateRoleModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Role Modal -->
      <div id="editRoleModal" class="modal">
        <div class="modal-content" style="max-width: 600px;">
          <h3 class="modal-header">✏️ Edit Role Permissions</h3>
          <form id="editRoleForm">
            <input type="hidden" id="editRoleId">
            
            <div class="form-group">
              <label class="form-label">Role Name</label>
              <input type="text" id="editRoleName" class="form-input" readonly style="background: #f3f4f6;">
            </div>

            <div class="form-group">
              <label class="form-label">Display Name *</label>
              <input type="text" id="editRoleDisplayName" class="form-input" placeholder="e.g., Sales Manager" required maxlength="100">
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="editRoleDescription" class="form-textarea" placeholder="Describe this role's responsibilities..." style="min-height: 60px;" maxlength="200"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Menu Permissions * (Select at least one)</label>
              <div id="editRolePermissionsContainer" style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <!-- Permissions will be populated here -->
              </div>
            </div>

            <div class="error-message-box" id="editRoleErrorMsg" style="font-size: 12px; margin-bottom: 12px;"></div>

            <div class="form-button-group">
              <button type="submit" class="btn-primary">✓ Update Role</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeEditRoleModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

       <!-- Categories Modal -->
      <div id="categoriesModal" class="modal">
        <div class="modal-content">
          <h3 class="modal-header">Manage Categories</h3>
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Add New Category</h4>
            <form id="categoryForm">
              <div class="form-group" style="margin-bottom: 12px;">
                <input type="text" id="categoryName" class="form-input" placeholder="Category name (e.g. Electronics)" required>
              </div>
              <div class="form-group" style="margin-bottom: 12px;">
                <textarea id="categoryDescription" class="form-textarea" placeholder="Description (optional)" style="min-height: 60px;"></textarea>
              </div>
              <div class="error-message-box" id="categoryErrorMsg" style="font-size: 11px; margin-bottom: 12px;"></div>
              <button type="submit" class="btn-primary" style="width: 100%;">Add Category</button>
            </form>
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Existing Categories (<span id="categoryCount">0</span>)</h4>
          <div class="categories-list" id="categoriesList">Loading...</div>
          <button type="button" class="btn-secondary" style="width: 100%; margin-top: 16px;" onclick="window.app.closeCategoriesModal()">Done</button>
        </div>
      </div>

       <!-- Locations Modal -->
      <div id="locationsModal" class="modal">
        <div class="modal-content">
          <h3 class="modal-header">Manage Locations</h3>
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Add New Location</h4>
            <form id="locationForm">
              <div class="form-group" style="margin-bottom: 12px;">
                <input type="text" id="locationName" class="form-input" placeholder="Location name (e.g. Warehouse A)" required>
              </div>
              <div class="form-group" style="margin-bottom: 12px;">
                <textarea id="locationDescription" class="form-textarea" placeholder="Description (optional)" style="min-height: 60px;"></textarea>
              </div>
              <div class="error-message-box" id="locationErrorMsg" style="font-size: 11px; margin-bottom: 12px;"></div>
              <button type="submit" class="btn-primary" style="width: 100%;">Add Location</button>
            </form>
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Existing Locations (<span id="locationCount">0</span>)</h4>
          <div class="locations-list" id="locationsList">Loading...</div>
          <button type="button" class="btn-secondary" style="width: 100%; margin-top: 16px;" onclick="window.app.closeLocationsModal()">Done</button>
        </div>
      </div>

      <!-- Edit Location Modal -->
      <div id="editLocationModal" class="modal">
        <div class="modal-content" style="max-width: 500px;">
          <h3 class="modal-header">Edit Location</h3>
          <form id="editLocationForm">
            <div class="form-group">
              <label class="form-label">Location Name *</label>
              <input type="text" id="editLocationName" class="form-input" placeholder="Location name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="editLocationDescription" class="form-textarea" placeholder="Location description (optional)" style="min-height: 80px;"></textarea>
            </div>
            <div class="error-message-box" id="editLocationErrorMsg" style="font-size: 12px; margin-bottom: 12px;"></div>
            <div class="form-button-group">
              <button type="submit" class="btn-primary">✓ Update Location</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeEditLocationModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

       <!-- Reports Modal -->
      <div id="reportsModal" class="modal">
        <div class="modal-content" style="max-width: 700px;">
          <h3 class="modal-header">📊 Stock Movement Report</h3>
          
          <div class="form-group">
            <label class="form-label">Date Range *</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="font-size: 12px; color: #6b7280; margin-bottom: 4px; display: block;">From Date</label>
                <input type="date" id="reportStartDate" class="form-input" required>
              </div>
              <div>
                <label style="font-size: 12px; color: #6b7280; margin-bottom: 4px; display: block;">To Date</label>
                <input type="date" id="reportEndDate" class="form-input" required>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Quick Date Ranges</label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="window.app.setDateRange('today')">Today</button>
              <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="window.app.setDateRange('week')">This Week</button>
              <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="window.app.setDateRange('month')">This Month</button>
              <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="window.app.setDateRange('all')">All Time</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Filter by Category (Optional)</label>
            <select id="reportCategory" class="form-select">
              <option value="all">All Categories</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Filter by Product (Optional)</label>
            <select id="reportProduct" class="form-select">
              <option value="all">All Products</option>
            </select>
          </div>

          <div class="error-message-box" id="reportsErrorMsg" style="font-size: 12px; margin-bottom: 12px;"></div>

          <div class="form-button-group">
            <button type="button" class="btn-primary" onclick="window.app.generateReport()">📄 Generate Report</button>
            <button type="button" class="btn-secondary" onclick="window.app.closeReportsModal()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Report Preview Modal -->
      <div id="reportPreviewModal" class="modal">
        <div class="modal-content" style="max-width: 1200px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 class="modal-header" style="margin: 0;">📄 Report Preview</h3>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn-primary" onclick="window.app.printReport()" style="padding: 8px 16px; font-size: 14px;">🖨️ Print</button>
              <button type="button" class="btn-success" onclick="window.app.exportReportPDF()" style="padding: 8px 16px; font-size: 14px; background: #10b981;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">📥 Export PDF</button>
              <button type="button" class="btn-success" onclick="window.app.exportReportExcel()" style="padding: 8px 16px; font-size: 14px; background: #059669;" onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">📊 Export Excel</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeReportPreview()">✕ Close</button>
            </div>
          </div>
          
          <div id="reportContentContainer" style="flex: 1; overflow-y: auto; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
            <!-- Report content will be inserted here -->
          </div>
        </div>
      </div>

      <!-- Item Reports Modal -->
      <div id="itemReportsModal" class="modal">
        <div class="modal-content" style="max-width: 600px;">
          <h3 class="modal-header">📊 Item Reports</h3>
          <form id="itemReportsForm">
            
            <!-- Report Type Selection -->
            <div class="form-group">
              <label class="form-label">Report Type *</label>
              <select id="itemReportType" class="form-select" required>
                <option value="">Select Report Type</option>
                <option value="inventory_summary">📦 Inventory Summary</option>
                <option value="low_stock">⚠️ Low Stock Alert</option>
                <option value="stock_valuation">💰 Stock Valuation</option>
                <option value="stock_movements">📊 Stock Movements</option>
              </select>
            </div>

            <!-- Date Range -->
            <div class="form-group">
              <label class="form-label">Date Range *</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="font-size: 12px; color: #6b7280; margin-bottom: 4px; display: block;">From Date</label>
                  <input type="date" id="itemReportStartDate" class="form-input" required>
                </div>
                <div>
                  <label style="font-size: 12px; color: #6b7280; margin-bottom: 4px; display: block;">To Date</label>
                  <input type="date" id="itemReportEndDate" class="form-input" required>
                </div>
              </div>
            </div>

            <!-- Quick Date Ranges -->
            <div class="form-group">
              <label class="form-label">Quick Date Ranges</label>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="window.app.setItemReportDateRange('today')">Today</button>
                <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="window.app.setItemReportDateRange('week')">This Week</button>
                <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="window.app.setItemReportDateRange('month')">This Month</button>
                <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="window.app.setItemReportDateRange('all')">All Time</button>
              </div>
            </div>

            <!-- Location Filter -->
            <div class="form-group">
              <label class="form-label">Filter by Location (Optional)</label>
              <select id="itemReportLocationFilter" class="form-select">
                <option value="all">All Locations</option>
              </select>
            </div>

            <!-- Category Filter -->
            <div class="form-group">
              <label class="form-label">Filter by Category (Optional)</label>
              <select id="itemReportCategoryFilter" class="form-select">
                <option value="all">All Categories</option>
              </select>
            </div>

            <!-- Product Filter -->
            <div class="form-group">
              <label class="form-label">Filter by Product (Optional)</label>
              <select id="itemReportProductFilter" class="form-select">
                <option value="all">All Products</option>
              </select>
            </div>

            <!-- Stock Level Filter -->
            <div class="form-group">
              <label class="form-label">Stock Level Filter</label>
              <select id="itemReportStockFilter" class="form-select">
                <option value="all">All Stock Levels</option>
                <option value="out_of_stock">🔴 Out of Stock (0)</option>
                <option value="low_stock">⚠️ Low Stock (< 20)</option>
                <option value="in_stock">✅ In Stock (> 0)</option>
                <option value="high_stock">📈 High Stock (> 100)</option>
              </select>
            </div>

            <div class="error-message-box" id="itemReportsErrorMsg"></div>

            <div class="form-button-group">
              <button type="button" class="btn-primary" onclick="window.app.generateItemReport()">📄 Generate Report</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeItemReportsModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

<!-- New Chat Modal -->
      <div id="newChatModal" class="modal">
        <div class="modal-content" style="max-width: 600px;">
          <h3 class="modal-header">💬 Start New Chat</h3>
          <form id="newChatForm">
            <div class="form-group">
              <label class="form-label">Chat Name (Optional)</label>
              <input type="text" id="newChatName" class="form-input" placeholder="e.g., Project Team Chat" maxlength="100">
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">Leave empty for auto-generated name</p>
            </div>

            <div class="form-group">
              <label class="form-label">Select People *</label>
              <div id="newChatUsersList" style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #f9fafb;">
                <p style="text-align: center; padding: 20px; color: #6b7280;">Loading users...</p>
              </div>
            </div>

            <div class="error-message-box" id="newChatErrorMsg" style="font-size: 12px; margin-bottom: 12px;"></div>

            <div class="form-button-group">
              <button type="submit" class="btn-primary">✓ Create Chat</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeNewChatModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Participant Modal -->
      <div id="addParticipantModal" class="modal">
        <div class="modal-content" style="max-width: 500px;">
          <h3 class="modal-header">➕ Add Person to Chat</h3>
          <form id="addParticipantForm">
            <div class="form-group">
              <label class="form-label">Select Person *</label>
              <div id="addParticipantUsersList" style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #f9fafb;">
                <p style="text-align: center; padding: 20px; color: #6b7280;">Loading users...</p>
              </div>
            </div>

            <div class="error-message-box" id="addParticipantErrorMsg" style="font-size: 12px; margin-bottom: 12px;"></div>

            <div class="form-button-group">
              <button type="submit" class="btn-primary">✓ Add Person</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeAddParticipantModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Customer Modal -->
      <div id="customerModal" class="modal">
        <div class="modal-content">
          <h3 class="modal-header" id="customerModalTitle">Add New Customer</h3>
          <div class="error-message-box" id="customerErrorMsg"></div>
          <form id="customerForm">
            <!-- Customer ID (hidden for new, shown for edit) -->
            <div class="form-group" id="customerIdField" style="display: none;">
              <label class="form-label">Customer ID</label>
              <input type="text" id="customerId" class="form-input" readonly style="background: #f3f4f6;">
            </div>

            <!-- Company Name -->
            <div class="form-group">
              <label class="form-label">Company Name *</label>
              <input type="text" id="customerCompany" class="form-input" required placeholder="Enter company name">
            </div>

            <!-- Contact Person -->
            <div class="form-group">
              <label class="form-label">Contact Person</label>
              <input type="text" id="customerContact" class="form-input" placeholder="Enter contact person name">
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="customerEmail" class="form-input" placeholder="email@example.com">
            </div>

            <!-- Mobile -->
            <div class="form-group">
              <label class="form-label">Mobile</label>
              <input type="tel" id="customerMobile" class="form-input" placeholder="+1234567890">
            </div>

            <!-- Location -->
            <div class="form-group">
              <label class="form-label">Location</label>
              <input type="text" id="customerLocation" class="form-input" placeholder="Enter location">
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea id="customerNotes" class="form-textarea" rows="3" placeholder="Additional notes..."></textarea>
            </div>


            <!-- Buttons -->
            <div class="form-button-group">
              <button type="submit" id="customerSubmitBtn" class="btn-primary">Create Customer</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeCustomerModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>


      <!-- Broadcast Modal -->
      <div id="broadcastModal" class="modal">
        <div class="modal-content" style="max-width: 450px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">📢 Broadcast Message</h3>
            <button type="button" class="modal-close" onclick="window.app.closeBroadcastModal()">×</button>
          </div>
          <p style="color: #6b7280; margin: -8px 0 16px 0; font-size: 13px;">
            Send a notification to all users
          </p>
          <form id="broadcastForm">
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label" style="margin-bottom: 6px;">Title</label>
              <input type="text" id="broadcastTitle" class="form-input" placeholder="e.g., System Update" required maxlength="100" style="font-size: 14px;">
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label" style="margin-bottom: 6px;">Message</label>
              <textarea id="broadcastMessage" class="form-textarea" placeholder="Enter your message..." style="min-height: 90px; font-size: 14px; resize: vertical;" required maxlength="500"></textarea>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #9ca3af; text-align: right;" id="broadcastCharCount">0/500</p>
            </div>

            <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 3px solid #f59e0b; padding: 8px 10px; margin-bottom: 14px; border-radius: 4px;">
              <div style="display: flex; gap: 8px;">
                <span style="font-size: 16px;">⚠️</span>
                <p style="margin: 0; font-size: 11px; color: #78350f; line-height: 1.4;">This will be sent to all users and cannot be undone.</p>
              </div>
            </div>

            <div class="error-message-box" id="broadcastErrorMsg" style="font-size: 11px; margin-bottom: 12px;"></div>

            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button type="button" class="btn-secondary" onclick="window.app.closeBroadcastModal()" style="padding: 8px 16px; font-size: 13px;">Cancel</button>
              <button type="submit" class="btn-primary" style="padding: 8px 20px; font-size: 13px;">Send</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  showConfirm(title, message, onConfirm, onCancel) {
    console.log('💬 Showing confirm dialog:', title);

    const modal = document.getElementById('confirmModal');
    if (!modal) {
      console.error('❌ Confirm modal not found');
      return;
    }

    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;

    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');

    // Clone buttons to remove old event listeners
    const newYesBtn = yesBtn.cloneNode(true);
    const newNoBtn = noBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    noBtn.parentNode.replaceChild(newNoBtn, noBtn);

    // YES/CONFIRM button
    newYesBtn.onclick = () => {
      console.log('✅ User clicked Confirm');
      modal.classList.remove('active');
      modal.style.display = 'none';

      if (onConfirm && typeof onConfirm === 'function') {
        onConfirm();
      }
    };

    // NO/CANCEL button
    newNoBtn.onclick = () => {
      console.log('❌ User clicked Cancel');
      modal.classList.remove('active');
      modal.style.display = 'none';

      if (onCancel && typeof onCancel === 'function') {
        onCancel();
      }
    };

    // Show modal
    modal.classList.add('active');
    modal.style.display = 'flex';
  }

  //========= 
  openAddUser() {
    console.log('👤 Opening Add User Modal');
    this.editingUserId = null;

    document.getElementById('userModalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userErrorMsg').textContent = '';

    const userIdField = document.getElementById('userIdField');
    if (userIdField) {
      userIdField.style.display = 'none';
    }

    const usernameField = document.getElementById('userName');
    if (usernameField) {
      usernameField.readOnly = false;
      usernameField.style.background = 'white';
    }

    document.getElementById('userSubmitBtn').textContent = 'Create User';
    document.getElementById('userPassword').required = true;
    document.getElementById('userPassword').placeholder = 'Enter password';

    // Load roles dynamically
    this.updateUserRoleDropdown();

    ui.openModal('userModal');
    console.log('✅ Add user modal opened');
  }

  updateUserRoleDropdown() {
    const select = document.getElementById('userRole');
    if (!select) return;

    select.innerHTML = '';

    // Add system roles
    const systemRoles = [
      { value: 'admin', label: 'Admin - Full Access', desc: 'Complete system control' },
      { value: 'manager', label: 'Manager - Dashboard, Sales & Products', desc: 'Manage operations' },
      { value: 'user', label: 'User - Dashboard & Sales Only', desc: 'Basic access' }
    ];

    systemRoles.forEach(role => {
      const option = document.createElement('option');
      option.value = role.value;
      option.textContent = role.label;
      select.appendChild(option);
    });

    // Add custom roles
    if (this.roles && this.roles.length > 0) {
      const customRoles = this.roles.filter(r => r.is_system !== 1);

      if (customRoles.length > 0) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = '─── Custom Roles ───';

        customRoles.forEach(role => {
          const option = document.createElement('option');
          option.value = role.name;
          option.textContent = `${role.display_name} - ${role.permissions?.length || 0} permissions`;
          optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
      }
    }
  }

  // ========== USER MANAGEMENT METHODS ==========
  openAddUserModal() {
    console.log('🔓 Opening Add User Modal');
    this.editingUserId = null;

    const modal = document.getElementById('userModal');
    if (!modal) {
      console.error('❌ userModal not found!');
      this.createUserModal();
      return;
    }

    document.getElementById('userModalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userErrorMsg').innerHTML = '';
    document.getElementById('userIdField').style.display = 'none';
    document.getElementById('userPassword').placeholder = 'Enter password';
    document.getElementById('userPassword').required = true;
    document.getElementById('userSubmitBtn').textContent = 'Create User';

    ui.openModal('userModal');
  }

  //================== user edit method ==================
  openEditUser(id) {
    console.log('✏️ Opening Edit User Modal:', id);

    const user = this.users.find(u => u.id === id);
    if (!user) {
      console.error('❌ User not found:', id);
      this.showConfirm('Error', 'User not found');
      return;
    }

    this.editingUserId = id;

    document.getElementById('userModalTitle').textContent = 'Edit User';
    document.getElementById('userName').value = user.username;
    document.getElementById('userName').readOnly = true;
    document.getElementById('userName').style.background = '#f3f4f6';

    document.getElementById('userFullName').value = user.full_name || '';
    document.getElementById('userSalesCode').value = user.sales_code || '';
    document.getElementById('userEmail').value = user.email || '';
    document.getElementById('userRole').value = user.role;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').required = false;
    document.getElementById('userPassword').placeholder = 'Leave empty to keep current password';

    const userIdField = document.getElementById('userIdField');
    if (userIdField) {
      userIdField.style.display = 'block';
      document.getElementById('userId').value = user.id.substring(0, 8).toUpperCase();
    }

    document.getElementById('userSubmitBtn').textContent = 'Update User';
    document.getElementById('userErrorMsg').textContent = '';

    this.updateUserRoleDropdown();

    setTimeout(() => {
      document.getElementById('userRole').value = user.role;
    }, 100);

    ui.openModal('userModal');
    console.log('✅ Edit user modal opened for:', user.username);
  }

  populateUserRoles() {
    const roleSelect = document.getElementById('userRole');
    if (!roleSelect) return;

    if (this.roles && this.roles.length > 0) {
      roleSelect.innerHTML = '';
      this.roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.name;
        option.textContent = role.display_name || role.name.charAt(0).toUpperCase() + role.name.slice(1);
        roleSelect.appendChild(option);
      });
    }
  }

  openAddUserModal() {
    console.log('➕ Opening Add User Modal');

    const modal = document.getElementById('userModal');
    if (!modal) {
      this.createUserModal();
    }

    this.populateUserRoles();

    document.getElementById('userModalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userIdField').style.display = 'none';
    document.getElementById('userErrorMsg').textContent = '';
    document.getElementById('userSubmitBtn').textContent = 'Create User';

    const pwdInput = document.getElementById('userPassword');
    pwdInput.required = true;
    pwdInput.placeholder = 'Enter password';

    this.editingUserId = null;
    ui.openModal('userModal');
  }

  async openEditUserModal(userId) {
    console.log('✏️ Opening Edit User Modal for:', userId);

    try {
      const res = await fetch(`/api/users/${userId}`, { credentials: 'same-origin' });
      const data = await res.json();

      if (!res.ok) {
        this.showConfirm('Error', data.error || 'Failed to load user');
        return;
      }

      const user = data.user;
      this.editingUserId = user.id;

      const modal = document.getElementById('userModal');
      if (!modal) {
        this.createUserModal();
      }

      document.getElementById('userModalTitle').textContent = 'Edit User';
      document.getElementById('userId').value = user.id;
      document.getElementById('userName').value = user.username;
      document.getElementById('userFullName').value = user.full_name || '';
      const salesCodeInput = document.getElementById('userSalesCode');
      if (salesCodeInput) salesCodeInput.value = user.sales_code || '';
      document.getElementById('userEmail').value = user.email || '';

      this.populateUserRoles();
      document.getElementById('userRole').value = user.role;
      document.getElementById('userPassword').value = '';
      document.getElementById('userPassword').placeholder = 'Leave blank to keep current password';
      document.getElementById('userPassword').required = false;
      document.getElementById('userIdField').style.display = 'block';
      document.getElementById('userErrorMsg').innerHTML = '';
      document.getElementById('userSubmitBtn').textContent = 'Update User';

      ui.openModal('userModal');
    } catch (e) {
      this.showConfirm('Error', `Network error: ${e.message}`);
    }
  }

  closeUserModal() {
    console.log('❌ Closing User Modal');
    ui.closeModal('userModal');
  }

  deleteUserConfirm(userId, userName) {
    console.log('🗑️ Delete user confirm:', userId, userName);

    if (userId === this.currentUser.id) {
      this.showConfirm('Error', 'You cannot delete your own account');
      return;
    }

    this.showConfirm(
      'Delete User',
      `Are you sure you want to delete "${userName}"?\n\nThis action cannot be undone.`,
      () => this.deleteUser(userId)
    );
  }

  async deleteUser(userId) {
    try {
      const result = await usersModule.deleteUser(userId);

      if (!result.success) {
        this.showConfirm('Error', result.error || 'Failed to delete user');
        return;
      }

      this.showConfirm('Success', '✓ User deleted successfully!', () => {
        if (this.currentPage === 'users') {
          usersPageModule.loadUsersList(this);
          usersPageModule.loadUsersListCard(this);
        }
      });
    } catch (e) {
      this.showConfirm('Error', `Network error: ${e.message}`);
    }
  }

  async handleUserFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('💾 ========== SAVE USER START ==========');

    const username = document.getElementById('userName').value.trim();
    const fullName = document.getElementById('userFullName').value.trim();
    const salesCode = document.getElementById('userSalesCode')?.value.trim() || '';
    const email = document.getElementById('userEmail').value.trim();
    const role = document.getElementById('userRole').value;
    const password = document.getElementById('userPassword').value.trim();

    const errorMsg = document.getElementById('userErrorMsg');
    errorMsg.textContent = '';

    console.log('📝 Form data:', { username, fullName, salesCode, email, role, passwordLength: password.length, editing: !!this.editingUserId });

    // Validation
    if (!username || !fullName || !role) {
      errorMsg.textContent = '❌ Username, full name, and role are required';
      return;
    }

    if (username.length < 3) {
      errorMsg.textContent = '❌ Username must be at least 3 characters';
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errorMsg.textContent = '❌ Username can only contain letters, numbers, underscores and hyphens';
      return;
    }

    // Check username uniqueness for NEW users
    if (!this.editingUserId) {
      const existingUser = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (existingUser) {
        console.error('❌ Username already exists:', username);
        errorMsg.textContent = `❌ Username "${username}" is already taken. Please choose a different username.`;
        return;
      }
    }

    // Only require password for new users
    if (!this.editingUserId && !password) {
      errorMsg.textContent = '❌ Password is required for new users';
      return;
    }

    if (password && password.length < 6) {
      errorMsg.textContent = '❌ Password must be at least 6 characters';
      return;
    }

    if (email && !this.isValidEmail(email)) {
      errorMsg.textContent = '❌ Invalid email address';
      return;
    }

    const userData = {
      username,
      full_name: fullName,
      sales_code: salesCode || null,
      email: email || null,
      role
    };

    // Only include password if provided
    if (password) {
      userData.password = password;
    }

    console.log('📤 Sending user data:', { ...userData, password: password ? '***' : 'not provided' });

    try {
      let result;

      if (this.editingUserId) {
        console.log('✏️ Updating user:', this.editingUserId);
        result = await usersModule.updateUser(this.editingUserId, userData);
      } else {
        console.log('➕ Creating new user');
        result = await usersModule.createUser(userData);
      }

      if (!result.success) {
        console.error('❌ Save failed:', result.error);

        if (result.error.includes('UNIQUE constraint') || result.error.includes('already exists')) {
          errorMsg.textContent = `❌ Username "${username}" is already taken. Please choose a different username.`;
        } else {
          errorMsg.textContent = `❌ ${result.error || 'Failed to save user'}`;
        }
        return;
      }

      console.log('✅ User saved successfully');
      console.log('💾 ========== SAVE USER COMPLETE ==========\n');

      this.showConfirm(
        'Success',
        `✓ User "${username}" ${this.editingUserId ? 'updated' : 'created'} successfully!`,
        async () => {
          this.closeUserModal();
          this.editingUserId = null;

          // Reload users list (on Settings page)
          if ((this.currentPage === 'settings' || this.currentPage === 'users') && window.usersPageModule) {
            await usersPageModule.loadUsers(this);
          }
        }
      );
    } catch (error) {
      console.error('❌ Error saving user:', error);
      errorMsg.textContent = `❌ ${error.message || 'An error occurred. Please try again.'}`;
    }
  }

  createUserModal() {
    console.log('🔨 Creating user modal dynamically');

    const modalHTML = `
      <div id="userModal" class="modal">
        <div class="modal-content">
          <h3 class="modal-header" id="userModalTitle">Add New User</h3>
          <div class="error-message-box" id="userErrorMsg"></div>
          <form id="userForm">
            <div class="form-group" id="userIdField" style="display: none;">
              <label class="form-label">User ID</label>
              <input type="text" id="userId" class="form-input" readonly style="background: #f3f4f6;">
            </div>
            <div class="form-group">
              <label class="form-label">Username *</label>
              <input type="text" id="userName" class="form-input" placeholder="Enter username" required>
            </div>
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" id="userFullName" class="form-input" placeholder="Enter full name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Sales Code (Optional)</label>
              <input type="text" id="userSalesCode" class="form-input" placeholder="Enter sales code">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="userEmail" class="form-input" placeholder="Enter email (optional)">
            </div>
            <div class="form-group">
              <label class="form-label">Role</label>
              <select id="userRole" class="form-select">
                <option value="admin">Admin - Full Access</option>
                <option value="manager">Manager - Dashboard, Sales & Products</option>
                <option value="user">User - Dashboard & Sales Only</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Password *</label>
              <input type="password" id="userPassword" class="form-input" placeholder="Enter password" required>
            </div>
            <div class="form-button-group">
              <button type="submit" class="btn-primary" id="userSubmitBtn">Create User</button>
              <button type="button" class="btn-secondary" onclick="ui.closeModal('userModal')">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Add to modals if not exists
    const modalsContainer = document.querySelector('.dashboard-container');
    if (modalsContainer) {
      modalsContainer.insertAdjacentHTML('beforeend', modalHTML);

      // Attach form submit listener
      setTimeout(() => {
        const userForm = document.getElementById('userForm');
        if (userForm) {
          userForm.addEventListener('submit', (e) => this.handleUserFormSubmit(e));
          console.log('✅ User form submit listener attached');
        }
      }, 100);
    }
  }

  // ========== QUICK ADD CUSTOMER FROM SALES PAGE ==========
  openAddCustomerQuick() {
    console.log('👥 Opening quick add customer from sales page');

    // Reset form
    this.editingCustomerId = null;

    document.getElementById('customerModalTitle').textContent = 'Add New Customer';
    document.getElementById('customerForm').reset();
    document.getElementById('customerErrorMsg').textContent = '';
    document.getElementById('customerIdField').style.display = 'none';
    document.getElementById('customerSubmitBtn').textContent = 'Create Customer';

    // Open modal
    ui.openModal('customerModal');
    console.log('✅ Customer modal opened from sales page');
  }

  openAddCustomer() {
    console.log('👥 Opening Add Customer modal');

    this.editingCustomerId = null;

    document.getElementById('customerModalTitle').textContent = 'Add New Customer';
    document.getElementById('customerForm').reset();
    document.getElementById('customerErrorMsg').textContent = '';

    const customerIdField = document.getElementById('customerIdField');
    if (customerIdField) {
      customerIdField.style.display = 'none';
    }

    document.getElementById('customerSubmitBtn').textContent = 'Create Customer';

    ui.openModal('customerModal');
    console.log('✅ Customer modal opened');
  }

  // ========== SALE ITEM MANAGEMENT ==========
  addSaleItem() {
    console.log('📦 Adding sale item...');

    const productSelect = document.getElementById('saleProduct');
    const qtyInput = document.getElementById('saleQty');
    const unitPriceInput = document.getElementById('saleUnitPrice');
    const sellPriceInput = document.getElementById('saleSellPrice');

    if (!productSelect || !qtyInput || !sellPriceInput || !unitPriceInput) {
      console.error('❌ Form elements not found');
      return;
    }

    const productId = productSelect.value;
    const qty = parseInt(qtyInput.value);
    const sellPrice = parseFloat(sellPriceInput.value);
    const unitPrice = parseFloat(unitPriceInput.value);

    console.log('📝 Form values:', { productId, qty, sellPrice, unitPrice });

    // Validation
    if (!productId) {
      this.showConfirm('Error', '❌ Please select a product');
      return;
    }

    if (!qty || qty < 1 || isNaN(qty)) {
      this.showConfirm('Error', '❌ Please enter a valid quantity (minimum 1)');
      return;
    }

    if (sellPrice === undefined || sellPrice < 0 || isNaN(sellPrice)) {
      this.showConfirm('Error', '❌ Please enter a valid selling price');
      return;
    }

    const product = this.products.find(p => p.id === productId);
    if (!product) {
      console.error('❌ Product not found:', productId);
      this.showConfirm('Error', '❌ Product not found');
      return;
    }

    console.log('✅ Product found:', product.name);

    if (qty > product.stock) {
      this.showConfirm('Error', `❌ Insufficient stock!\n\nRequested: ${qty}\nAvailable: ${product.stock}`);
      return;
    }

    // Initialize currentSaleItems if undefined
    if (!this.currentSaleItems) {
      console.warn('⚠️ currentSaleItems was undefined, initializing...');
      this.currentSaleItems = [];
    }

    // Create item object
    const item = {
      product_id: productId,
      product_name: product.name,
      product_description: product.description || '', // ← ADD THIS LINE
      qty: qty,
      unit_price: unitPrice || product.unit_price,
      selling_price: sellPrice,
      total: qty * sellPrice
    };

    console.log('📦 Item to add:', item);

    // Add to array
    this.currentSaleItems.push(item);
    console.log('✅ Item added to array! Total items:', this.currentSaleItems.length);

    // ⭐⭐⭐ UPDATE UI ⭐⭐⭐
    console.log('🎨 Calling renderSaleItems()...');
    this.doRenderSaleItems(); // Using different name to avoid conflicts

    console.log('💰 Calling updateSaleTotal()...');
    this.updateSaleTotal();

    // Reset form
    productSelect.value = '';
    qtyInput.value = '1';
    unitPriceInput.value = '';
    sellPriceInput.value = '';

    const totalInput = document.getElementById('saleItemTotal');
    if (totalInput) totalInput.value = '';

    console.log('✅ Sale item added successfully and table updated!');
  }

  // Using different method name to avoid conflicts
  doRenderSaleItems() {
    console.log('🎨 ========== DO RENDER SALE ITEMS START ==========');
    console.log('📊 Items to render:', this.currentSaleItems?.length || 0);

    const tbody = document.getElementById('saleItemsTable');

    if (!tbody) {
      console.error('❌ Table body not found!');
      return;
    }

    console.log('✓ Table body found');

    if (!this.currentSaleItems || this.currentSaleItems.length === 0) {
      console.log('Empty items, showing placeholder');
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="padding: 40px; text-align: center; color: #9ca3af; font-size: 13px;">
            📦 No items added yet. Select a product and click "Add" to start.
          </td>
        </tr>
      `;
      return;
    }

    console.log('Building rows for', this.currentSaleItems.length, 'items...');

    // Clear existing content
    tbody.innerHTML = '';

    // Build rows with event listeners (not inline onclick)
    for (let i = 0; i < this.currentSaleItems.length; i++) {
      const item = this.currentSaleItems[i];
      console.log(`  Row ${i + 1}:`, item.product_name, '$' + item.total.toFixed(2));

      const bgColor = i % 2 === 0 ? 'white' : '#f9fafb';

      // Create row element
      const row = document.createElement('tr');
      row.style.cssText = `border-bottom: 1px solid #e5e7eb; background: ${bgColor}; transition: all 0.3s ease;`;
      row.onmouseover = function () { this.style.background = '#f0f9ff'; };
      row.onmouseout = function () { this.style.background = bgColor; };

      // Build row HTML
      row.innerHTML = `
        <td style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600;">${i + 1}</td>
        <td style="padding: 12px; color: #1f2937; font-weight: 700; font-size: 13px;">${this.escapeHtml(item.product_name)}</td>
        <td style="padding: 12px; color: #6b7280; font-size: 12px; font-style: italic; line-height: 1.4; max-width: 300px;">${this.escapeHtml(item.product_description || '-')}</td>
        <td style="padding: 12px; text-align: center; font-weight: 700; color: #1f2937;  border-radius: 4px;">${item.qty}</td>
        <td style="padding: 12px; text-align: right; color: #6b7280; font-family: monospace; font-size: 12px;">$${item.unit_price.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; color: #10b981; font-weight: 700; font-family: monospace;">$${item.selling_price.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; font-weight: 800; color: #1f2937; font-family: monospace; font-size: 14px;">$${item.total.toFixed(2)}</td>
        <td style="padding: 12px; text-align: center;">
          <button type="button" class="remove-item-btn" data-index="${i}" style="padding: 7px 14px; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px;" title="Remove this item from the order">
            <span>🗑️</span>
            <span>Remove</span>
          </button>
        </td>
      `;

      // Attach event listener to button
      const removeBtn = row.querySelector('.remove-item-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const index = parseInt(e.currentTarget.getAttribute('data-index'));
          console.log('🗑️ Remove button clicked for index:', index);
          this.removeSaleItem(index);
        });

        // Add hover effects
        removeBtn.addEventListener('mouseover', function () {
          this.style.background = '#fecaca';
          this.style.borderColor = '#dc2626';
          this.style.transform = 'scale(1.05)';
        });

        removeBtn.addEventListener('mouseout', function () {
          this.style.background = '#fee2e2';
          this.style.borderColor = '#fecaca';
          this.style.transform = 'scale(1)';
        });
      }

      // Add row to tbody
      tbody.appendChild(row);
    }

    console.log('✅ Rows appended, total:', tbody.children.length);
    console.log('🎨 ========== DO RENDER COMPLETE ==========\n');
  }

  // Keep both names pointing to same function
  renderSaleItems() {
    this.doRenderSaleItems();
  }

  removeSaleItem(index) {
    console.log('🗑️ ========== REMOVE ITEM START ==========');
    console.log('📍 Removing item at index:', index);
    console.log('📊 Current items before removal:', this.currentSaleItems?.length);

    if (!this.currentSaleItems || this.currentSaleItems.length === 0) {
      console.warn('⚠️ No items to remove');
      return;
    }

    if (index < 0 || index >= this.currentSaleItems.length) {
      console.error('❌ Invalid index:', index, '(array length:', this.currentSaleItems.length + ')');
      return;
    }

    const removedItem = this.currentSaleItems[index];
    console.log('🗑️ Item to remove:', removedItem.product_name, `Qty: ${removedItem.qty}`, `Total: $${removedItem.total.toFixed(2)}`);

    // Remove from array
    this.currentSaleItems.splice(index, 1);
    console.log('✅ Item removed from array');
    console.log('📊 Remaining items:', this.currentSaleItems.length);

    // Re-render table (this will automatically re-number items)
    console.log('🎨 Re-rendering table...');
    this.doRenderSaleItems();

    // Update total
    console.log('💰 Updating total...');
    this.updateSaleTotal();

    console.log('✅ Item removed successfully');
    console.log('🗑️ ========== REMOVE ITEM COMPLETE ==========\n');
  }



  removeSaleItem(index) {
    console.log('🗑️ Removing item at index:', index);

    if (!this.currentSaleItems || this.currentSaleItems.length === 0) {
      console.warn('⚠️ No items to remove');
      return;
    }

    const removedItem = this.currentSaleItems[index];
    console.log('🗑️ Removing:', removedItem.product_name, `$${removedItem.total.toFixed(2)}`);

    this.currentSaleItems.splice(index, 1);
    console.log('✅ Item removed. Remaining items:', this.currentSaleItems.length);

    this.renderSaleItems();
    this.updateSaleTotal();
  }

  // ========== REMOVE SINGLE ITEM ==========
  removeSaleItem(index) {
    console.log('🗑️ ========== REMOVE ITEM START ==========');
    console.log('📍 Index to remove:', index);
    console.log('📊 Items before removal:', this.currentSaleItems?.length);

    if (!this.currentSaleItems || this.currentSaleItems.length === 0) {
      console.error('❌ No items to remove - array is empty');
      return;
    }

    if (index < 0 || index >= this.currentSaleItems.length) {
      console.error('❌ Invalid index:', index, '(valid range: 0 to', this.currentSaleItems.length - 1 + ')');
      return;
    }

    const removedItem = this.currentSaleItems[index];
    console.log('🗑️ Removing:', removedItem.product_name, `Total: $${removedItem.total.toFixed(2)}`);

    // Remove from array
    this.currentSaleItems.splice(index, 1);
    console.log('✅ Item removed from array');
    console.log('📊 Items after removal:', this.currentSaleItems.length);

    // CRITICAL: Re-render table
    console.log('🎨 Calling doRenderSaleItems...');
    this.doRenderSaleItems();
    console.log('✅ Table re-rendered');

    // CRITICAL: Update total
    console.log('💰 Calling updateSaleTotal...');
    this.updateSaleTotal();
    console.log('✅ Total updated');

    console.log('🗑️ ========== REMOVE ITEM COMPLETE ==========\n');
  }

  // ========== CLEAR ALL ITEMS ==========
  clearSaleItems() {
    console.log('🗑️ ========== CLEAR ALL ITEMS START ==========');
    console.log('📊 Current items:', this.currentSaleItems?.length || 0);

    if (!this.currentSaleItems || this.currentSaleItems.length === 0) {
      console.log('⚠️ No items to clear');
      this.showConfirm('Info', 'No items to clear');
      return;
    }

    const itemCount = this.currentSaleItems.length;
    const totalAmount = this.currentSaleItems.reduce((sum, item) => sum + (item.total || 0), 0);

    console.log('📋 Items to clear:', itemCount);
    console.log('💰 Total amount to clear:', `$${totalAmount.toFixed(2)}`);

    this.showConfirm(
      'Clear All Items',
      `Are you sure you want to remove all ${itemCount} items from this sale?\n\nTotal amount: $${totalAmount.toFixed(2)}\n\nThis action cannot be undone.`,
      () => {
        console.log('✅ User confirmed - clearing all items');

        // Clear array
        this.currentSaleItems = [];
        console.log('✅ Items array cleared');

        // Re-render table using doRenderSaleItems (NOT renderSaleItems)
        console.log('🎨 Calling doRenderSaleItems...');
        this.doRenderSaleItems();
        console.log('✅ Table re-rendered (should show empty state)');

        // Update total
        console.log('💰 Calling updateSaleTotal...');
        this.updateSaleTotal();
        console.log('✅ Total updated (should be $0.00)');

        // Reset form fields
        const productSelect = document.getElementById('saleProduct');
        const qtyInput = document.getElementById('saleQty');
        const unitPriceInput = document.getElementById('saleUnitPrice');
        const sellPriceInput = document.getElementById('saleSellPrice');
        const totalInput = document.getElementById('saleItemTotal');

        if (productSelect) productSelect.value = '';
        if (qtyInput) qtyInput.value = '1';
        if (unitPriceInput) unitPriceInput.value = '';
        if (sellPriceInput) sellPriceInput.value = '';
        if (totalInput) totalInput.value = '';

        console.log('✅ Form fields reset');
        console.log('🗑️ ========== CLEAR ALL ITEMS COMPLETE ==========\n');
      }
    );
  }

  // ========== UPDATE SALE TOTAL ==========
  updateSaleTotal() {
    console.log('💰 ========== UPDATE SALE TOTAL START ==========');

    // Initialize if needed
    if (!this.currentSaleItems) {
      this.currentSaleItems = [];
    }

    console.log('📊 Calculating total for', this.currentSaleItems.length, 'items');

    // Calculate total
    const total = this.currentSaleItems.reduce((sum, item) => {
      const itemTotal = item.total || 0;
      console.log(`  • ${item.product_name}: $${itemTotal.toFixed(2)}`);
      return sum + itemTotal;
    }, 0);

    console.log(`📊 Calculated Total: $${total.toFixed(2)}`);

    // Find and update the total element
    let totalElement = document.getElementById('saleTotal');

    if (!totalElement) {
      console.warn('⚠️ saleTotal not found by ID, searching alternatives...');

      // Try finding by style
      const allParagraphs = document.querySelectorAll('p');
      allParagraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text.startsWith('$') && p.style.fontSize.includes('32px')) {
          totalElement = p;
          totalElement.id = 'saleTotal';
          console.log('✓ Found total element by style');
        }
      });
    }

    if (!totalElement) {
      // Try finding by parent text "Order Subtotal"
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.textContent.includes('Order Subtotal')) {
          const nextP = el.nextElementSibling;
          if (nextP && nextP.tagName === 'P') {
            totalElement = nextP;
            totalElement.id = 'saleTotal';
            console.log('✓ Found total element as sibling');
          } else {
            const pElements = el.querySelectorAll('p');
            pElements.forEach(p => {
              if (p.textContent.includes('$')) {
                totalElement = p;
                totalElement.id = 'saleTotal';
                console.log('✓ Found total element as child');
              }
            });
          }
        }
      });
    }

    if (totalElement) {
      const oldValue = totalElement.textContent;
      totalElement.textContent = `$${total.toFixed(2)}`;
      console.log(`✅ Total updated: ${oldValue} → $${total.toFixed(2)}`);

      // Add animation
      totalElement.style.transition = 'all 0.3s ease';
      totalElement.style.transform = 'scale(1.1)';
      totalElement.style.color = total === 0 ? '#dc2626' : '#10b981';

      setTimeout(() => {
        totalElement.style.transform = 'scale(1)';
        totalElement.style.color = '#1f2937';
      }, 300);
    } else {
      console.error('❌ Could not find sale total element!');
    }

    console.log('💰 ========== UPDATE SALE TOTAL COMPLETE ==========\n');
  }

  async saveSale() {
    const customerId = document.getElementById('saleCustomer').value;

    if (!customerId) {
      this.showConfirm('Error', 'Please select a customer');
      return;
    }

    if (this.currentSaleItems.length === 0) {
      this.showConfirm('Error', 'Please add at least one item to the sale');
      return;
    }

    const total = this.currentSaleItems.reduce((sum, item) => sum + item.total, 0);

    const saleData = {
      customer_id: customerId,
      sale_date: new Date().toISOString(),
      items: this.currentSaleItems,
      total_amount: total
    };

    try {
      const result = await salesModule.createSale(saleData);

      if (!result.success) {
        this.showConfirm('Error', result.error || 'Failed to create sale');
        return;
      }

      this.showConfirm(
        'Success',
        `✓ Sale created successfully!\n\nOrder Total: $${total.toFixed(2)}\nItems: ${this.currentSaleItems.length}`,
        async () => {
          // Clear form
          document.getElementById('saleCustomer').value = '';
          document.getElementById('customerDetails').style.display = 'none';
          this.currentSaleItems = [];
          this.renderSaleItems();
          this.updateSaleTotal();

          // Reload data
          await this.loadSales();
          await this.loadProducts();

          if (this.currentPage === 'sales' && window.salesPageModule) {
            salesPageModule.loadRecentSales(this);
          }
        }
      );
    } catch (error) {
      console.error('❌ Error saving sale:', error);
      this.showConfirm('Error', 'An error occurred while saving the sale');
    }
  }

  renderSaleItems() {
    const container = document.getElementById('saleItemsContainer');
    if (!container) return;

    if (this.currentSaleItems.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #6b7280; font-size: 13px; padding: 20px;">Click "Add Item" to add products to this sale</p>';
      this.calculateSaleTotal();
      return;
    }

    const html = this.currentSaleItems.map((item, index) => `
      <div style="padding: 14px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; margin-bottom: 10px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 11px; color: #6b7280; font-weight: 600; display: block; margin-bottom: 4px;">Product *</label>
            <select class="form-select" style="padding: 6px; font-size: 13px;" onchange="window.app.updateSaleItemProduct(${index}, this.value)">
              <option value="">-- Select Product --</option>
              ${this.products.map(p => `<option value="${p.id}" ${item.product_id === p.id ? 'selected' : ''}>${p.product_id} - ${p.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size: 11px; color: #6b7280; font-weight: 600; display: block; margin-bottom: 4px;">Quantity *</label>
            <input type="number" class="form-input" style="padding: 6px; font-size: 13px;" min="1" value="${item.qty}" onchange="window.app.updateSaleItem(${index}, 'qty', this.value)">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 11px; color: #6b7280; font-weight: 600; display: block; margin-bottom: 4px;">Unit Price</label>
            <input type="number" class="form-input" style="padding: 6px; font-size: 13px; background: #f3f4f6;" step="0.01" value="${item.unit_price.toFixed(2)}" readonly>
          </div>
          <div>
            <label style="font-size: 11px; color: #6b7280; font-weight: 600; display: block; margin-bottom: 4px;">Selling Price *</label>
            <input type="number" class="form-input" style="padding: 6px; font-size: 13px;" step="0.01" min="0" value="${item.selling_price.toFixed(2)}" onchange="window.app.updateSaleItem(${index}, 'selling_price', this.value)">
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #e5e7eb;">
          <span style="font-size: 13px; font-weight: 600; color: #1f2937;">Item Total: <span style="color: #10b981;">$${item.total.toFixed(2)}</span></span>
          <button type="button" onclick="window.app.removeSaleItem(${index})" style="padding: 6px 12px; font-size: 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">🗑️ Remove</button>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
    this.calculateSaleTotal();
  }

  updateSaleItemProduct(index, productId) {
    if (!productId) return;
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.currentSaleItems[index].product_id = productId;
      this.currentSaleItems[index].product_name = product.name;
      this.currentSaleItems[index].unit_price = product.unit_price;
      this.currentSaleItems[index].selling_price = product.unit_price;
      this.renderSaleItems();
    }
  }

  updateSaleItem(index, field, value) {
    this.currentSaleItems[index][field] = parseFloat(value) || 0;
    if (field === 'selling_price') {
      if (this.currentSaleItems[index].selling_price < this.currentSaleItems[index].unit_price) {
        this.currentSaleItems[index].selling_price = this.currentSaleItems[index].unit_price;
      }
    }
    this.currentSaleItems[index].total = this.currentSaleItems[index].qty * this.currentSaleItems[index].selling_price;
    this.renderSaleItems();
  }


  calculateSaleTotal() {
    const subtotal = this.currentSaleItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const total = subtotal;

    const subtotalEl = document.getElementById('saleSubtotal');
    const totalEl = document.getElementById('saleTotal');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  }

  async handleRoleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('💾 ========== SAVE ROLE FORM SUBMIT ==========');

    const roleName = document.getElementById('roleName')?.value.trim();
    const displayName = document.getElementById('roleDisplayName')?.value.trim();
    const description = document.getElementById('roleDescription')?.value.trim();

    // Get selected permissions
    const permissionCheckboxes = document.querySelectorAll('input[name="rolePermissions"]:checked');
    const permissions = Array.from(permissionCheckboxes).map(cb => cb.value);

    const errorMsg = document.getElementById('roleErrorMsg');
    if (errorMsg) errorMsg.textContent = '';

    console.log('📝 Role form values:', {
      roleName,
      displayName,
      permissions,
      description,
      editing: !!this.editingRoleId
    });

    // Validation
    if (!displayName || permissions.length === 0) {
      const msg = '❌ Display name and at least one permission are required';
      console.error(msg);
      if (errorMsg) errorMsg.textContent = msg;
      return;
    }

    // For new roles, validate name
    if (!this.editingRoleId && !roleName) {
      const msg = '❌ Role name is required';
      console.error(msg);
      if (errorMsg) errorMsg.textContent = msg;
      return;
    }

    const roleData = {
      display_name: displayName,
      permissions: permissions,
      description: description || ''
    };

    // Only include name for new roles
    if (!this.editingRoleId) {
      roleData.name = roleName.toLowerCase().replace(/\s+/g, '_');
    }

    console.log('📤 Sending role data:', roleData);

    try {
      let result;

      if (this.editingRoleId) {
        console.log('✏️ Updating role:', this.editingRoleId);

        const res = await fetch(`/api/roles/${this.editingRoleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify(roleData)
        });

        const data = await res.json();
        console.log('📡 Response status:', res.status);
        console.log('📦 Response data:', data);

        if (!res.ok) {
          console.error('❌ Update failed:', data.error);
          if (errorMsg) errorMsg.textContent = `❌ ${data.error}`;
          return;
        }

        result = { success: true };
      } else {
        console.log('➕ Creating new role');

        const res = await fetch('/api/roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify(roleData)
        });

        const data = await res.json();
        console.log('📡 Response status:', res.status);
        console.log('📦 Response data:', data);

        if (!res.ok) {
          console.error('❌ Create failed:', data.error);
          if (errorMsg) errorMsg.textContent = `❌ ${data.error}`;
          return;
        }

        result = { success: true, id: data.id };
      }

      console.log('✅ Role saved successfully');
      console.log('💾 ========== SAVE ROLE COMPLETE ==========\n');

      // ⭐ Close modal first
      this.closeRoleModal();
      this.editingRoleId = null;

      // ⭐ Reload roles list
      console.log('🔄 Reloading roles...');
      if (this.currentPage === 'users' && window.usersPageModule) {
        await window.usersPageModule.loadRoles(this);
      }

      // ⭐ Show success message
      setTimeout(() => {
        this.showConfirm(
          'Success',
          `✓ Role "${displayName}" ${this.editingRoleId ? 'updated' : 'created'} successfully!`
        );
      }, 300);

    } catch (error) {
      console.error('❌ Error in handleRoleFormSubmit:', error);
      if (errorMsg) {
        errorMsg.textContent = `❌ ${error.message || 'An error occurred'}`;
      }
    }
  }


  async handleSalesFormSubmit(e) {
    e.preventDefault();
    console.log('💾 Submitting sale...');

    const saleDate = document.getElementById('saleDate').value;
    const customerId = document.getElementById('saleCustomer').value;
    const errorMsg = document.getElementById('saleErrorMsg');

    errorMsg.innerHTML = '';

    if (!saleDate || !customerId) {
      errorMsg.innerHTML = '❌ Please select date and customer';
      return;
    }

    if (this.currentSaleItems.length === 0) {
      errorMsg.innerHTML = '❌ Please add at least one item to the sale';
      return;
    }

    for (let item of this.currentSaleItems) {
      if (!item.product_id) {
        errorMsg.innerHTML = '❌ All items must have a product selected';
        return;
      }
      if (item.qty <= 0) {
        errorMsg.innerHTML = '❌ All items must have quantity greater than 0';
        return;
      }
      const product = this.products.find(p => p.id === item.product_id);
      if (product && item.qty > product.stock) {
        errorMsg.innerHTML = `❌ Not enough stock for ${product.name} (Available: ${product.stock})`;
        return;
      }
    }

    const totalAmount = this.currentSaleItems.reduce((sum, item) => sum + item.total, 0);

    this.showConfirm(
      'Confirm Sale',
      `Complete this sale?\n\nTotal Amount: $${totalAmount.toFixed(2)}\nItems: ${this.currentSaleItems.length}\nCustomer: ${this.customers.find(c => c.id === customerId)?.company_name}`,
      () => this.completeSale(saleDate, customerId)
    );
  }

  async completeSale(saleDate, customerId) {
    try {
      console.log('💰 Completing sale...');
      const totalAmount = this.currentSaleItems.reduce((sum, item) => sum + item.total, 0);

      const saleData = {
        customer_id: customerId,
        sale_date: saleDate,
        total_amount: totalAmount,
        items: this.currentSaleItems.map(item => ({
          product_id: item.product_id,
          qty: parseInt(item.qty),
          unit_price: item.unit_price,
          selling_price: item.selling_price,
          total: item.total
        }))
      };

      const result = await salesModule.createSale(saleData);

      if (!result.success) {
        this.showConfirm('Error', result.error || 'Failed to complete sale');
        return;
      }

      console.log('✅ Sale completed successfully');

      // Reset form
      this.currentSaleItems = [];
      document.getElementById('salesForm').reset();
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('saleDate').value = today;

      this.showConfirm(
        'Success',
        `✓ Sale completed successfully!\n\nTotal Amount: $${totalAmount.toFixed(2)}\nSale ID: ${result.id}`,
        () => {
          this.loadSalesData();
          this.loadProducts();
          this.renderSaleItems();
        }
      );
    } catch (e) {
      console.error('❌ Error completing sale:', e);
      this.showConfirm('Error', `Network error: ${e.message}`);
    }
  }

  // ========== CUSTOMER MANAGEMENT ==========
  renderCustomerListInSales() {
    const container = document.getElementById('saleCustomerList');
    if (!container) return;

    if (this.customers.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: 20px; color: #6b7280; font-size: 13px;">No customers available. Add a new customer first.</p>';
      return;
    }

    const html = this.customers.map(customer => {
      const createdDate = new Date(customer.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const customerId = customer.id.substring(0, 8).toUpperCase();

      return `
        <div style="padding: 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; transition: all 0.2s;" 
             onclick="window.app.selectCustomerFromList('${customer.id}')" 
             onmouseover="this.style.borderColor='#667eea'; this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.15)';"
             onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div>
              <p style="margin: 0 0 4px 0; font-weight: 700; font-size: 14px; color: #1f2937;">${this.escapeHtml(customer.company_name)}</p>
              <p style="margin: 0; font-size: 11px; color: #6b7280;">ID: ${customerId}</p>
            </div>
            <span style="background: #667eea; color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">CUSTOMER</span>
          </div>

          <div style="background: #f9fafb; padding: 10px; border-radius: 6px; margin-bottom: 10px; font-size: 12px; line-height: 1.6;">
            <p style="margin: 0 0 4px 0;"><strong>👤</strong> ${this.escapeHtml(customer.contact_person)}</p>
            <p style="margin: 0 0 4px 0;"><strong>📱</strong> ${this.escapeHtml(customer.mobile)}</p>
            ${customer.email ? `<p style="margin: 0;"><strong>📧</strong> ${this.escapeHtml(customer.email)}</p>` : ''}
          </div>

          <div style="font-size: 10px; color: #6b7280; margin-bottom: 10px;">
            <strong>Created:</strong> ${createdDate}
          </div>

          <button type="button" onclick="event.stopPropagation(); window.app.selectCustomerFromList('${customer.id}')" style="width: 100%; padding: 8px; background: #667eea; color: white; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#5568d3';" onmouseout="this.style.background='#667eea';">
            ✓ Select for Sale
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    const countDisplay = document.getElementById('customerCountDisplay');
    if (countDisplay) {
      countDisplay.textContent = this.customers.length;
    }
  }

  selectCustomerFromList(customerId) {
    console.log('✅ Selecting customer:', customerId);
    const select = document.getElementById('saleCustomer');
    if (select) {
      select.value = customerId;
      const event = new Event('change', { bubbles: true });
      select.dispatchEvent(event);

      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  refreshCustomerList() {
    console.log('🔄 Refreshing customer list...');
    this.loadSalesData();
    setTimeout(() => {
      this.renderCustomerListInSales();
    }, 300);
  }

  async handleCustomerFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('💾 Saving customer...');

    const company = document.getElementById('customerCompany').value.trim();
    const contact = document.getElementById('customerContact').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const mobile = document.getElementById('customerMobile').value.trim();
    const location = document.getElementById('customerLocation').value.trim();
    const notes = document.getElementById('customerNotes').value.trim();

    const errorMsg = document.getElementById('customerErrorMsg');
    errorMsg.textContent = '';

    if (!company) {
      errorMsg.textContent = '❌ Company name is required';
      return;
    }

    const customerData = {
      company_name: company,
      contact_person: contact,
      email,
      mobile,
      location,
      notes
    };

    try {
      let result;
      let newCustomerId = null;

      if (this.editingCustomerId) {
        console.log('✏️ Updating customer:', this.editingCustomerId);
        result = await customersModule.updateCustomer(this.editingCustomerId, customerData);
        newCustomerId = this.editingCustomerId;
      } else {
        console.log('➕ Creating new customer');
        result = await customersModule.createCustomer(customerData);
        newCustomerId = result.id;
      }

      if (!result.success) {
        errorMsg.textContent = `❌ ${result.error || 'Failed to save customer'}`;
        return;
      }

      console.log('✅ Customer saved successfully, ID:', newCustomerId);

      this.showConfirm(
        'Success',
        `✓ Customer "${company}" ${this.editingCustomerId ? 'updated' : 'created'} successfully!`,
        async () => {
          this.closeCustomerModal();
          this.editingCustomerId = null;

          // Reload customers
          console.log('🔄 Reloading customers list...');
          await this.loadCustomers();
          console.log('✅ Customers reloaded, total:', this.customers.length);

          // If on sales page, refresh customer dropdown and auto-select new customer
          if (this.currentPage === 'sales') {
            console.log('📝 Refreshing customer dropdown on sales page');
            this.refreshCustomerDropdown(newCustomerId);
          }

          // If on customers page, refresh list
          if (this.currentPage === 'customers' && window.customersPageModule) {
            customersPageModule.loadCustomers(this);
          }
        }
      );
    } catch (error) {
      console.error('❌ Error saving customer:', error);
      errorMsg.textContent = `❌ ${error.message || 'An error occurred. Please try again.'}`;
    }
  }

  // New method to refresh customer dropdown
  refreshCustomerDropdown(selectCustomerId = null) {
    const customerSelect = document.getElementById('saleCustomer');
    if (!customerSelect) {
      console.warn('⚠️ Customer dropdown not found');
      return;
    }

    console.log('🔄 Refreshing customer dropdown with', this.customers.length, 'customers');

    // Save current value if not selecting a new one
    const currentValue = selectCustomerId || customerSelect.value;

    // Rebuild options
    customerSelect.innerHTML = '<option value="">-- Select Customer --</option>';

    this.customers.forEach(customer => {
      const option = document.createElement('option');
      option.value = customer.id;
      option.textContent = `${customer.company_name} (${customer.contact_person || 'N/A'})`;
      customerSelect.appendChild(option);
    });

    // Select the customer (new or previously selected)
    if (currentValue) {
      customerSelect.value = currentValue;
      console.log('✅ Auto-selected customer:', currentValue);

      // Trigger change event to update customer details
      customerSelect.dispatchEvent(new Event('change'));
    }

    console.log('✅ Customer dropdown refreshed');
  }

  closeCustomerModal() {
    ui.closeModal('customerModal');
    document.getElementById('customerForm').reset();
    document.getElementById('customerErrorMsg').textContent = '';
    this.editingCustomerId = null;
    console.log('✅ Customer modal closed');
  }

  async saveCustomer(customerData) {
    try {
      console.log('💾 Saving customer:', customerData);
      const result = await customersModule.createCustomer(customerData);

      if (!result.success) {
        this.showConfirm('❌ Error', result.error || 'Failed to add customer');
        return;
      }

      console.log('✅ Customer saved successfully');

      // Reset form
      const customerForm = document.getElementById('customerForm');
      if (customerForm) customerForm.reset();

      const customerErrorMsg = document.getElementById('customerErrorMsg');
      if (customerErrorMsg) customerErrorMsg.innerHTML = '';

      const companyWarning = document.getElementById('companyDuplicateWarning');
      const emailWarning = document.getElementById('emailWarning');
      const mobileWarning = document.getElementById('mobileWarning');

      if (companyWarning) companyWarning.style.display = 'none';
      if (emailWarning) emailWarning.style.display = 'none';
      if (mobileWarning) mobileWarning.style.display = 'none';

      this.showConfirm(
        '✅ Customer Added',
        `✓ "${customerData.company_name}" created successfully!\n\nID: ${result.id}\nCreated by: ${this.currentUser.username}`,
        () => {
          this.loadSalesData();
          setTimeout(() => {
            this.renderCustomerListInSales();
            this.updateCustomerDropdown();
          }, 500);
        }
      );
    } catch (e) {
      console.error('❌ Save customer error:', e);
      this.showConfirm('Error', `Network error: ${e.message}`);
    }
  }

  isValidEmail(email) {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ========== PRODUCT MANAGEMENT ==========
  async openAddProduct() {
    console.log('📦 Opening Add Product Modal');
    this.editingProductId = null;

    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productSubmitBtn').textContent = 'Add Product';
    document.getElementById('productErrorMsg').textContent = '';

    // Set default date to today
    document.getElementById('productEntryDate').value = new Date().toISOString().split('T')[0];

    // Ensure locations are loaded
    if (!this.locations || this.locations.length === 0) {
      await this.loadLocations();
    }

    // Populate dropdowns
    this.updateCategoryDropdown();
    this.updateLocationDropdown();

    ui.openModal('productModal');
  }

  async handleAddProduct(e) {
    e.preventDefault();
    console.log('💾 Saving product...');

    const product_id = document.getElementById('productId').value.trim();
    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const category_id = document.getElementById('productCategory').value;
    const location_id = document.getElementById('productLocation').value;
    const stock = parseInt(document.getElementById('productStock').value);
    const unit_price = parseFloat(document.getElementById('productUnitPrice').value);
    const created_at = document.getElementById('productEntryDate').value;

    const errorMsg = document.getElementById('productErrorMsg');
    errorMsg.textContent = '';

    if (!product_id || !name || !category_id || !location_id || isNaN(stock) || isNaN(unit_price)) {
      errorMsg.textContent = '❌ Please fill in all required fields';
      return;
    }

    if (stock < 0 || unit_price < 0) {
      errorMsg.textContent = '❌ Stock and price cannot be negative';
      return;
    }

    try {
      let result;
      if (this.editingProductId) {
        result = await productsModule.updateProduct(this.editingProductId, {
          product_id, name, description, category_id, location_id, stock, unit_price, created_at
        });
      } else {
        result = await productsModule.createProduct({
          product_id, name, description, category_id, location_id, stock, unit_price, created_at
        });
      }

      if (!result.success) {
        errorMsg.textContent = result.error;
        return;
      }

      console.log('✅ Product saved successfully');
      this.showConfirm(
        'Success',
        `✓ Product "${name}" ${this.editingProductId ? 'updated' : 'added'} successfully!`,
        async () => {
          this.closeProductModal();
          await this.loadProducts();
          if (this.currentPage === 'products') {
            productsPageModule.loadProducts(this);
          }
        }
      );
    } catch (error) {
      console.error('❌ Error saving product:', error);
      errorMsg.textContent = 'An error occurred. Please try again.';
    }
  }

  updateCategoryDropdown() {
    const select = document.getElementById('productCategory');
    if (!select) return;

    select.innerHTML = '<option value="">Select Category</option>';

    const sortedCategories = [...this.categories].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    sortedCategories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  }

  updateLocationDropdown() {
    const select = document.getElementById('productLocation');
    if (!select) return;

    select.innerHTML = '<option value="">Select Location</option>';

    const sortedLocations = [...this.locations].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    sortedLocations.forEach(loc => {
      const option = document.createElement('option');
      option.value = loc.id;
      option.textContent = loc.name;
      select.appendChild(option);
    });
  }

  async openEditProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;

    this.editingProductId = id;
    document.getElementById('productModalTitle').textContent = 'Edit Product';

    // Ensure locations are loaded
    if (!this.locations || this.locations.length === 0) {
      await this.loadLocations();
    }

    // First update dropdowns so options are available
    this.updateCategoryDropdown();
    this.updateLocationDropdown();

    // Now set all the form values (including the category and location selection)
    document.getElementById('productCategory').value = product.category_id;
    document.getElementById('productLocation').value = product.location_id || '';
    document.getElementById('productId').value = product.product_id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productUnitPrice').value = product.unit_price;
    document.getElementById('productEntryDate').value = new Date(product.created_at).toISOString().split('T')[0];
    document.getElementById('productSubmitBtn').textContent = 'Update Product';
    document.getElementById('productErrorMsg').textContent = '';

    ui.openModal('productModal');
  }

  deleteProductConfirm(id, name) {
    this.showConfirm(
      'Delete Product',
      `Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`,
      () => this.deleteProduct(id)
    );
  }

  async deleteProduct(id) {
    try {
      const result = await productsModule.deleteProduct(id);

      if (!result.success) {
        this.showConfirm('Error', result.error);
        return;
      }

      this.showConfirm('Success', '✓ Product deleted successfully!', async () => {
        await this.loadProducts();
        if (this.currentPage === 'products') {
          productsPageModule.loadProducts(this);
        }
      });
    } catch (error) {
      console.error('❌ Error deleting product:', error);
    }
  }

  closeProductModal() {
    ui.closeModal('productModal');
    document.getElementById('productForm').reset();
    document.getElementById('productErrorMsg').textContent = '';
    this.editingProductId = null;
    console.log('✅ Product modal closed');
  }

  // ========== CATEGORY MANAGEMENT ==========
  openCategories() {
    console.log('📋 Opening Categories Modal');
    this.cleanCategoriesModal();
    ui.openModal('categoriesModal');
    this.loadCategoriesList();
  }

  closeCategoriesModal() {
    ui.closeModal('categoriesModal');
    this.cleanCategoriesModal();
  }

  cleanCategoriesModal() {
    const nameInput = document.getElementById('categoryName');
    const descInput = document.getElementById('categoryDescription');
    const errorMsg = document.getElementById('categoryErrorMsg');

    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (errorMsg) errorMsg.textContent = '';
  }

  async loadCategoriesList() {
    try {
      await this.loadCategories();

      const sortedCategories = [...this.categories].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      const html = sortedCategories.map((c) => {
        return `
          <div class="category-item">
            <div class="category-item-info">
              <p class="category-item-name">${this.escapeHtml(c.name)}</p>
              <p class="category-item-desc">${this.escapeHtml(c.description || 'No description')}</p>
            </div>
            <div class="category-item-actions">
              <button class="btn-small btn-edit" type="button" onclick="window.app.editCategory('${c.id}')">Edit</button>
              <button class="btn-small btn-delete" type="button" onclick="window.app.deleteCategoryConfirm('${c.id}', '${this.escapeHtml(c.name).replace(/'/g, "\\'")}')">Delete</button>
            </div>
          </div>
        `;
      }).join('');

      const listContainer = document.getElementById('categoriesList');
      if (listContainer) {
        listContainer.innerHTML = html || '<p style="color: #6b7280; text-align: center; padding: 20px;">No categories yet</p>';
      }

      const categoryCount = document.getElementById('categoryCount');
      if (categoryCount) {
        categoryCount.textContent = this.categories.length;
      }
    } catch (e) {
      console.error('❌ Error loading categories:', e);
    }
  }

  async handleAddCategory(e) {
    e.preventDefault();
    console.log('💾 Saving category...');

    const categoryNameInput = document.getElementById('categoryName');
    const categoryDescInput = document.getElementById('categoryDescription');
    const errorMsg = document.getElementById('categoryErrorMsg');

    const name = categoryNameInput.value.trim();
    const description = categoryDescInput.value.trim();

    if (errorMsg) errorMsg.textContent = '';

    if (!name) {
      if (errorMsg) errorMsg.textContent = '❌ Category name is required';
      return;
    }

    if (name.length < 2) {
      if (errorMsg) errorMsg.textContent = '❌ Category name must be at least 2 characters';
      return;
    }

    try {
      const result = await categoriesModule.createCategory({ name, description });

      if (!result.success) {
        if (errorMsg) errorMsg.textContent = `❌ ${result.error}`;
        return;
      }

      console.log('✅ Category saved successfully');
      this.showConfirm(
        'Success',
        `✓ Category "${name}" added successfully!`,
        () => {
          categoryNameInput.value = '';
          categoryDescInput.value = '';
          if (errorMsg) errorMsg.textContent = '';
          this.loadCategoriesList();
          this.loadProducts();
        }
      );
    } catch (e) {
      console.error('❌ Error saving category:', e);
      if (errorMsg) errorMsg.textContent = `❌ Network error: ${e.message}`;
    }
  }

  editCategory(id) {
    console.log('✏️ Opening Edit Category Modal for:', id);

    const category = this.categories.find(c => c.id === id);
    if (!category) {
      console.error('❌ Category not found:', id);
      return;
    }

    // Store the editing category ID
    this.editingCategoryId = id;

    // Populate the form
    document.getElementById('editCategoryName').value = category.name;
    document.getElementById('editCategoryDescription').value = category.description || '';
    document.getElementById('editCategoryErrorMsg').textContent = '';

    // Open the modal
    ui.openModal('editCategoryModal');
  }

  closeEditCategoryModal() {
    ui.closeModal('editCategoryModal');
    document.getElementById('editCategoryForm').reset();
    document.getElementById('editCategoryErrorMsg').textContent = '';
    this.editingCategoryId = null;
  }

  async handleEditCategory(e) {
    e.preventDefault();
    console.log('💾 Updating category...');

    if (!this.editingCategoryId) {
      console.error('❌ No category ID for editing');
      return;
    }

    const nameInput = document.getElementById('editCategoryName');
    const descInput = document.getElementById('editCategoryDescription');
    const errorMsg = document.getElementById('editCategoryErrorMsg');

    const name = nameInput.value.trim();
    const description = descInput.value.trim();

    errorMsg.textContent = '';

    // Validation
    if (!name) {
      errorMsg.textContent = '❌ Category name is required';
      nameInput.focus();
      return;
    }

    if (name.length < 2) {
      errorMsg.textContent = '❌ Category name must be at least 2 characters';
      nameInput.focus();
      return;
    }

    // Check for duplicates (excluding current category)
    const duplicate = this.categories.find(c =>
      c.id !== this.editingCategoryId &&
      c.name.toLowerCase().trim() === name.toLowerCase().trim()
    );

    if (duplicate) {
      errorMsg.textContent = `❌ Category "${name}" already exists`;
      nameInput.focus();
      return;
    }

    try {
      const result = await categoriesModule.updateCategory(this.editingCategoryId, {
        name: name,
        description: description
      });

      if (!result.success) {
        errorMsg.textContent = `❌ ${result.error || 'Failed to update category'}`;
        return;
      }

      console.log('✅ Category updated successfully');
      this.showConfirm(
        'Success',
        `✓ Category updated to "${name}" successfully!`,
        () => {
          this.closeEditCategoryModal();
          this.loadCategoriesList();
          this.loadProducts();
        }
      );
    } catch (e) {
      console.error('❌ Error updating category:', e);
      errorMsg.textContent = `❌ Network error: ${e.message}`;
    }
  }

  deleteCategoryConfirm(id, name) {
    const categoryProducts = this.products.filter(p => p.category_id === id);

    if (categoryProducts.length > 0) {
      this.showConfirm(
        '⚠️ Cannot Delete Category',
        `"${name}" has ${categoryProducts.length} product(s).\n\nDelete or move all products first.`
      );
      return;
    }

    this.showConfirm(
      'Delete Category',
      `Are you sure you want to delete "${name}"?`,
      () => this.deleteCategory(id)
    );
  }

  async deleteCategory(id) {
    try {
      const categoryName = this.categories.find(c => c.id === id)?.name;

      const result = await categoriesModule.deleteCategory(id);

      if (!result.success) {
        this.showConfirm('Error', result.error || 'Failed to delete category');
        return;
      }

      this.showConfirm('Success', `✓ Category "${categoryName}" deleted successfully!`, () => {
        this.loadCategoriesList();
        this.loadProducts();
      });
    } catch (e) {
      this.showConfirm('Error', `Network error: ${e.message}`);
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  // ========== MESSAGING METHODS ==========
  openConversation(conversationId) {
    console.log('📂 Opening conversation:', conversationId);
    if (window.messagingPageModule) {
      messagingPageModule.openConversation(this, conversationId);
    }
  }

  openNewChatModal() {
    console.log('💬 Opening new chat modal');
    ui.openModal('newChatModal');
    this.loadUsersForNewChat();
  }

  closeNewChatModal() {
    ui.closeModal('newChatModal');
    document.getElementById('newChatForm').reset();
    document.getElementById('newChatErrorMsg').textContent = '';
  }

  async loadUsersForNewChat() {
    try {
      const res = await fetch('/api/users', { credentials: 'same-origin' });
      const data = await res.json();

      if (!res.ok) return;

      const users = data.users || [];
      const container = document.getElementById('newChatUsersList');
      if (!container) return;

      const html = users
        .filter(u => u.id !== this.currentUser.id)
        .map(user => `
          <label style="display: flex; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
            <input type="checkbox" name="participants" value="${user.id}" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
            <div>
              <p style="margin: 0 0 2px 0; font-weight: 600; font-size: 14px; color: #1f2937;">${this.escapeHtml(user.full_name || user.username)}</p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">@${this.escapeHtml(user.username)} • ${user.role.toUpperCase()}</p>
            </div>
          </label>
        `).join('');

      container.innerHTML = html || '<p style="text-align: center; padding: 20px; color: #6b7280;">No users available</p>';
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async handleNewChatSubmit(e) {
    e.preventDefault();
    console.log('💾 Creating new chat...');

    const chatName = document.getElementById('newChatName').value.trim();
    const checkboxes = document.querySelectorAll('input[name="participants"]:checked');
    const participantIds = Array.from(checkboxes).map(cb => cb.value);
    const errorMsg = document.getElementById('newChatErrorMsg');

    errorMsg.textContent = '';

    if (participantIds.length === 0) {
      errorMsg.textContent = '❌ Please select at least one person';
      return;
    }

    try {
      const result = await messagingModule.createConversation(participantIds, chatName || null);

      if (!result.success) {
        errorMsg.textContent = `❌ ${result.error || 'Failed to create chat'}`;
        return;
      }

      console.log('✅ Chat created successfully');
      this.showConfirm(
        'Success',
        `✓ Chat created successfully!${chatName ? `\n\nChat name: ${chatName}` : ''}`,
        () => {
          this.closeNewChatModal();
          if (this.currentPage === 'messaging' && window.messagingPageModule) {
            messagingPageModule.loadConversations(this);
          }
        }
      );
    } catch (error) {
      console.error('❌ Error creating chat:', error);
      errorMsg.textContent = `❌ Network error: ${error.message}`;
    }
  }

  openAddParticipantModal() {
    console.log('➕ Opening add participant modal');
    if (!window.messagingPageModule || !messagingPageModule.currentConversationId) {
      this.showConfirm('Error', 'No conversation selected');
      return;
    }
    ui.openModal('addParticipantModal');
    this.loadUsersForAddParticipant();
  }

  closeAddParticipantModal() {
    ui.closeModal('addParticipantModal');
    document.getElementById('addParticipantForm').reset();
    document.getElementById('addParticipantErrorMsg').textContent = '';
  }

  async loadUsersForAddParticipant() {
    try {
      const res = await fetch('/api/users', { credentials: 'same-origin' });
      const data = await res.json();

      if (!res.ok) return;

      const users = data.users || [];

      // Get current participants
      const conversationId = messagingPageModule.currentConversationId;
      const participantsResult = await messagingModule.getParticipants(conversationId);
      const currentParticipantIds = participantsResult.participants.map(p => p.id);

      const container = document.getElementById('addParticipantUsersList');
      if (!container) return;

      const html = users
        .filter(u => u.id !== this.currentUser.id && !currentParticipantIds.includes(u.id))
        .map(user => `
          <label style="display: flex; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
            <input type="radio" name="new_participant" value="${user.id}" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
            <div>
              <p style="margin: 0 0 2px 0; font-weight: 600; font-size: 14px; color: #1f2937;">${this.escapeHtml(user.full_name || user.username)}</p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">@${this.escapeHtml(user.username)} • ${user.role.toUpperCase()}</p>
            </div>
          </label>
        `).join('');

      container.innerHTML = html || '<p style="text-align: center; padding: 20px; color: #6b7280;">All users are already in this conversation</p>';
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async handleAddParticipantSubmit(e) {
    e.preventDefault();
    console.log('➕ Adding participant...');

    const selectedRadio = document.querySelector('input[name="new_participant"]:checked');
    const errorMsg = document.getElementById('addParticipantErrorMsg');

    errorMsg.textContent = '';

    if (!selectedRadio) {
      errorMsg.textContent = '❌ Please select a person to add';
      return;
    }

    const userId = selectedRadio.value;
    const conversationId = messagingPageModule.currentConversationId;

    try {
      const result = await messagingModule.addParticipant(conversationId, userId);

      if (!result.success) {
        errorMsg.textContent = `❌ ${result.error || 'Failed to add participant'}`;
        return;
      }

      console.log('✅ Participant added successfully');
      this.showConfirm(
        'Success',
        '✓ Person added to conversation!',
        () => {
          this.closeAddParticipantModal();
          if (window.messagingPageModule) {
            messagingPageModule.loadConversations(this);
          }
        }
      );
    } catch (error) {
      console.error('❌ Error adding participant:', error);
      errorMsg.textContent = `❌ Network error: ${error.message}`;
    }
  }

  openFileUploadModal() {
    console.log('📎 File upload modal (not implemented yet)');
    this.showConfirm('Coming Soon', 'File upload feature will be available in the next update!');
  }

  insertEmoji(emoji) {
    const input = document.getElementById('messageInput');
    if (input) {
      input.value += emoji;
      input.focus();
    }
  }

  handleFileSelect(event) {
    if (window.messagingPageModule) {
      messagingPageModule.handleFileSelect(event);
    }
  }

  clearFileSelection() {
    if (window.messagingPageModule) {
      messagingPageModule.clearFileSelection();
    }
  }

  deleteMessage(messageId) {
    if (window.messagingPageModule) {
      messagingPageModule.deleteMessage(messageId);
    }
  }

  deleteCurrentConversation() {
    if (window.messagingPageModule) {
      messagingPageModule.deleteCurrentConversation();
    }
  }

  openConversationInfo() {
    if (!window.messagingPageModule || !messagingPageModule.currentConversationId) {
      this.showConfirm('Info', 'No conversation selected');
      return;
    }

    const conversation = messagingPageModule.conversations.find(c => c.id === messagingPageModule.currentConversationId);
    if (!conversation) {
      this.showConfirm('Info', 'Conversation not found');
      return;
    }

    const info = `
      📬 Conversation: ${conversation.name || 'Private Chat'}
      💬 Type: ${conversation.type === 'group' ? 'Group Chat' : 'Private Chat'}
      📨 Messages: ${conversation.message_count || 0}
      🔔 Unread: ${conversation.unread_count || 0}
      📅 Created: ${new Date(conversation.created_at).toLocaleString()}
    `;

    this.showConfirm('Conversation Info', info);
  }

  // ========== STOCK MANAGEMENT ==========
  async openUpdateStock(id) {
    console.log('📦 Opening Update Stock Modal for:', id);

    const product = this.products.find(p => p.id === id);
    if (!product) {
      console.error('❌ Product not found:', id);
      return;
    }

    // Ensure locations are loaded for location_name display
    if (!this.locations || this.locations.length === 0) {
      await this.loadLocations();
    }

    this.editingProductId = id;

    // Populate the form
    document.getElementById('stockProductLocation').value = product.location_name || 'Unknown';
    document.getElementById('stockProductId').value = product.product_id;
    document.getElementById('stockProductName').value = product.name;
    document.getElementById('stockProductCategory').value = product.category_name || 'Unknown';
    document.getElementById('stockCurrent').value = product.stock;
    document.getElementById('stockNewQuantity').value = '';
    document.getElementById('stockNotes').value = '';
    document.getElementById('stockErrorMsg').textContent = '';

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('stockUpdateDate').value = today;

    ui.openModal('stockModal');
  }

  closeStockModal() {
    ui.closeModal('stockModal');
    document.getElementById('stockForm').reset();
    document.getElementById('stockErrorMsg').textContent = '';
    this.editingProductId = null;
  }

  async handleUpdateStock(e) {
    e.preventDefault();
    console.log('💾 Updating stock...');

    if (!this.editingProductId) {
      console.error('❌ No product selected');
      this.showConfirm('Error', 'No product selected');
      return;
    }

    const product = this.products.find(p => p.id === this.editingProductId);
    if (!product) {
      console.error('❌ Product not found');
      return;
    }

    const quantityInput = document.getElementById('stockNewQuantity').value.trim();
    const updateDate = document.getElementById('stockUpdateDate').value.trim();
    const notes = document.getElementById('stockNotes').value.trim();

    const errorMsg = document.getElementById('stockErrorMsg');
    errorMsg.textContent = '';

    // Validation
    if (!quantityInput) {
      errorMsg.textContent = '❌ Quantity change is required';
      return;
    }

    const quantityChange = parseInt(quantityInput);

    if (isNaN(quantityChange)) {
      errorMsg.textContent = '❌ Quantity must be a valid number (use - for subtraction)';
      return;
    }

    if (quantityChange === 0) {
      errorMsg.textContent = '❌ Quantity change cannot be zero';
      return;
    }

    if (!updateDate) {
      errorMsg.textContent = '❌ Update date is required';
      return;
    }

    const currentStock = product.stock;
    const newStock = currentStock + quantityChange;

    if (newStock < 0) {
      errorMsg.textContent = '❌ Cannot reduce stock below 0';
      return;
    }

    const action = quantityChange > 0 ? `Add ${quantityChange}` : `Remove ${Math.abs(quantityChange)}`;

    this.showConfirm(
      'Confirm Stock Update',
      `${action} to stock for "${product.product_id}"?\n\nCurrent: ${currentStock}\nChange: ${quantityChange > 0 ? '+' : ''}${quantityChange}\nNew: ${newStock}\n\n${notes ? 'Notes: ' + notes : ''}`,
      () => {
        this.saveStockUpdate(newStock, updateDate, notes);
      }
    );
  }

  async saveStockUpdate(newStock, updateDate, notes) {
    try {
      console.log('💾 Saving stock update:', { newStock, updateDate, notes });

      const result = await productsModule.updateStock(this.editingProductId, newStock, notes);

      if (!result.success) {
        this.showConfirm('Error', result.error || 'Failed to update stock');
        return;
      }

      const product = this.products.find(p => p.id === this.editingProductId);

      console.log('✅ Stock updated successfully');
      this.showConfirm(
        'Success',
        `✓ Stock updated successfully for "${product.product_id}"!\n\nNew stock: ${newStock}`,
        async () => {
          this.closeStockModal();
          await this.loadProducts();
          if (this.currentPage === 'products') {
            productsPageModule.loadProducts(this);
            // Reload stock movements to show the new update immediately
            setTimeout(() => {
              if (window.productsPageModule && typeof productsPageModule.loadStockMovements === 'function') {
                productsPageModule.loadStockMovements(this);
              }
            }, 500);
          }
        }
      );
    } catch (e) {
      console.error('❌ Error saving stock update:', e);
      this.showConfirm('Error', `Network error: ${e.message}`);
    }
  }

  // ========== CATEGORY MANAGEMENT ==========
  openCategories() {
    console.log('📋 Opening Categories Modal');
    this.cleanCategoriesModal();
    ui.openModal('categoriesModal');
    this.loadCategoriesList();
  }

  closeCategoriesModal() {
    ui.closeModal('categoriesModal');
    this.cleanCategoriesModal();
  }

  cleanCategoriesModal() {
    const nameInput = document.getElementById('categoryName');
    const descInput = document.getElementById('categoryDescription');
    const errorMsg = document.getElementById('categoryErrorMsg');

    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (errorMsg) errorMsg.textContent = '';
  }

  async loadCategoriesList() {
    try {
      await this.loadCategories();

      const sortedCategories = [...this.categories].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      const html = sortedCategories.map((c) => {
        return `
          <div class="category-item">
            <div class="category-item-info">
              <p class="category-item-name">${this.escapeHtml(c.name)}</p>
              <p class="category-item-desc">${this.escapeHtml(c.description || 'No description')}</p>
            </div>
            <div class="category-item-actions">
              <button class="btn-small btn-edit" type="button" onclick="window.app.editCategory('${c.id}')">Edit</button>
              <button class="btn-small btn-delete" type="button" onclick="window.app.deleteCategoryConfirm('${c.id}', '${this.escapeHtml(c.name).replace(/'/g, "\\'")}')">Delete</button>
            </div>
          </div>
        `;
      }).join('');

      const listContainer = document.getElementById('categoriesList');
      if (listContainer) {
        listContainer.innerHTML = html || '<p style="color: #6b7280; text-align: center; padding: 20px;">No categories yet</p>';
      }

      const categoryCount = document.getElementById('categoryCount');
      if (categoryCount) {
        categoryCount.textContent = this.categories.length;
      }
    } catch (e) {
      console.error('❌ Error loading categories:', e);
    }
  }

  async handleAddCategory(e) {
    e.preventDefault();
    console.log('💾 Saving category...');

    const categoryNameInput = document.getElementById('categoryName');
    const categoryDescInput = document.getElementById('categoryDescription');
    const errorMsg = document.getElementById('categoryErrorMsg');

    const name = categoryNameInput.value.trim();
    const description = categoryDescInput.value.trim();

    if (errorMsg) errorMsg.textContent = '';

    if (!name) {
      if (errorMsg) errorMsg.textContent = '❌ Category name is required';
      return;
    }

    if (name.length < 2) {
      if (errorMsg) errorMsg.textContent = '❌ Category name must be at least 2 characters';
      return;
    }

    try {
      const result = await categoriesModule.createCategory({ name, description });

      if (!result.success) {
        if (errorMsg) errorMsg.textContent = `❌ ${result.error}`;
        return;
      }

      console.log('✅ Category saved successfully');
      this.showConfirm(
        'Success',
        `✓ Category "${name}" added successfully!`,
        () => {
          categoryNameInput.value = '';
          categoryDescInput.value = '';
          if (errorMsg) errorMsg.textContent = '';
          this.loadCategoriesList();
          this.loadProducts();
        }
      );
    } catch (e) {
      console.error('❌ Error saving category:', e);
      if (errorMsg) errorMsg.textContent = `❌ Network error: ${e.message}`;
    }
  }

  editCategory(id) {
    console.log('✏️ Opening Edit Category Modal for:', id);

    const category = this.categories.find(c => c.id === id);
    if (!category) {
      console.error('❌ Category not found:', id);
      return;
    }

    // Store the editing category ID
    this.editingCategoryId = id;

    // Populate the form
    document.getElementById('editCategoryName').value = category.name;
    document.getElementById('editCategoryDescription').value = category.description || '';
    document.getElementById('editCategoryErrorMsg').textContent = '';

    // Open the modal
    ui.openModal('editCategoryModal');
  }

  closeEditCategoryModal() {
    ui.closeModal('editCategoryModal');
    document.getElementById('editCategoryForm').reset();
    document.getElementById('editCategoryErrorMsg').textContent = '';
    this.editingCategoryId = null;
  }

  async handleEditCategory(e) {
    e.preventDefault();
    console.log('💾 Updating category...');

    if (!this.editingCategoryId) {
      console.error('❌ No category ID for editing');
      return;
    }

    const nameInput = document.getElementById('editCategoryName');
    const descInput = document.getElementById('editCategoryDescription');
    const errorMsg = document.getElementById('editCategoryErrorMsg');

    const name = nameInput.value.trim();
    const description = descInput.value.trim();

    errorMsg.textContent = '';

    // Validation
    if (!name) {
      errorMsg.textContent = '❌ Category name is required';
      nameInput.focus();
      return;
    }

    if (name.length < 2) {
      errorMsg.textContent = '❌ Category name must be at least 2 characters';
      nameInput.focus();
      return;
    }

    // Check for duplicates (excluding current category)
    const duplicate = this.categories.find(c =>
      c.id !== this.editingCategoryId &&
      c.name.toLowerCase().trim() === name.toLowerCase().trim()
    );

    if (duplicate) {
      errorMsg.textContent = `❌ Category "${name}" already exists`;
      nameInput.focus();
      return;
    }

    try {
      const result = await categoriesModule.updateCategory(this.editingCategoryId, {
        name: name,
        description: description
      });

      if (!result.success) {
        errorMsg.textContent = `❌ ${result.error || 'Failed to update category'}`;
        return;
      }

      console.log('✅ Category updated successfully');
      this.showConfirm(
        'Success',
        `✓ Category updated to "${name}" successfully!`,
        () => {
          this.closeEditCategoryModal();
          this.loadCategoriesList();
          this.loadProducts();
        }
      );
    } catch (e) {
      console.error('❌ Error updating category:', e);
      errorMsg.textContent = `❌ Network error: ${e.message}`;
    }
  }

  deleteCategoryConfirm(id, name) {
    const categoryProducts = this.products.filter(p => p.category_id === id);

    if (categoryProducts.length > 0) {
      this.showConfirm(
        '⚠️ Cannot Delete Category',
        `"${name}" has ${categoryProducts.length} product(s).\n\nDelete or move all products first.`
      );
      return;
    }

    this.showConfirm(
      'Delete Category',
      `Are you sure you want to delete "${name}"?`,
      () => this.deleteCategory(id)
    );
  }

  async deleteCategory(id) {
    try {
      const categoryName = this.categories.find(c => c.id === id)?.name;

      const result = await categoriesModule.deleteCategory(id);

      if (!result.success) {
        this.showConfirm('Error', result.error || 'Failed to delete category');
        return;
      }

      this.showConfirm('Success', `✓ Category "${categoryName}" deleted successfully!`, () => {
        this.loadCategoriesList();
        this.loadProducts();
      });
    } catch (e) {
      this.showConfirm('Error', `Network error: ${e.message}`);
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  // ========== ROLE MANAGEMENT METHODS ==========

  openCreateRoleModal() {
    console.log('🔐 Opening Create Role Modal');
    document.getElementById('createRoleForm').reset();
    document.getElementById('createRoleErrorMsg').textContent = '';
    ui.openModal('createRoleModal');
  }

  closeCreateRoleModal() {
    console.log('🚪 Closing Create Role Modal');
    ui.closeModal('createRoleModal');
    document.getElementById('createRoleForm').reset();
    document.getElementById('createRoleErrorMsg').textContent = '';
  }

  openEditRoleModal(roleId) {
    console.log('✏️ ========== OPEN EDIT ROLE MODAL ==========');
    console.log('🆔 Role ID:', roleId);

    const role = this.roles.find(r => r.id === roleId);
    if (!role) {
      console.error('❌ Role not found:', roleId);
      this.showConfirm('Error', 'Role not found');
      return;
    }

    console.log('✓ Role found:', role.display_name);

    // Populate form
    document.getElementById('editRoleId').value = roleId;
    document.getElementById('editRoleName').value = role.name;
    document.getElementById('editRoleDisplayName').value = role.display_name || '';
    document.getElementById('editRoleDescription').value = role.description || '';
    document.getElementById('editRoleErrorMsg').textContent = '';

    // Populate permissions
    const permissionsContainer = document.getElementById('editRolePermissionsContainer');
    const allPermissions = [
      { id: 'dashboard', icon: '📊', name: 'Dashboard', desc: 'View statistics and overview' },
      { id: 'sales', icon: '💰', name: 'Sales', desc: 'Create and manage sales transactions' },
      { id: 'messaging', icon: '💬', name: 'Messaging', desc: 'Chat with team members' },
      { id: 'products', icon: '📦', name: 'Item Management', desc: 'Manage products and inventory' },
      { id: 'customers', icon: '👥', name: 'Customers', desc: 'Manage customer information' },
      { id: 'users', icon: '👤', name: 'User Management', desc: 'Manage users and roles' },
      { id: 'settings', icon: '⚙️', name: 'Settings', desc: 'Configure system settings' }
    ];

    const rolePermissions = Array.isArray(role.permissions) ? role.permissions : [];

    const html = allPermissions.map(perm => {
      const isChecked = rolePermissions.includes(perm.id);
      return `
        <label style="display: flex; align-items: center; padding: 10px; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
          <input type="checkbox" name="edit_role_permissions" value="${perm.id}" ${isChecked ? 'checked' : ''} style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
          <span style="font-size: 20px; margin-right: 8px;">${perm.icon}</span>
          <div>
            <p style="margin: 0; font-weight: 600; font-size: 14px; color: #1f2937;">${perm.name}</p>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">${perm.desc}</p>
          </div>
        </label>
      `;
    }).join('');

    permissionsContainer.innerHTML = html;

    ui.openModal('editRoleModal');
    console.log('✅ Edit role modal opened');
  }

  closeEditRoleModal() {
    console.log('🚪 Closing Edit Role Modal');

    if (window.ui && typeof window.ui.closeModal === 'function') {
      window.ui.closeModal('editRoleModal');
    } else {
      const modal = document.getElementById('editRoleModal');
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
      }
    }

    const editRoleForm = document.getElementById('editRoleForm');
    if (editRoleForm) {
      editRoleForm.reset();
    }

    const errorMsg = document.getElementById('editRoleErrorMsg');
    if (errorMsg) {
      errorMsg.textContent = '';
    }

    const permissionsContainer = document.getElementById('editRolePermissionsContainer');
    if (permissionsContainer) {
      permissionsContainer.innerHTML = '';
    }

    console.log('✅ Edit Role Modal closed');
  }

  closeRoleModal() {
    // Legacy method - redirects to closeEditRoleModal
    this.closeEditRoleModal();
  }

  async handleCreateRoleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('💾 ========== CREATE ROLE START ==========');

    const roleName = document.getElementById('roleName')?.value.trim();
    const displayName = document.getElementById('roleDisplayName')?.value.trim();
    const description = document.getElementById('roleDescription')?.value.trim();

    const permissionCheckboxes = document.querySelectorAll('input[name="role_permissions"]:checked');
    const permissions = Array.from(permissionCheckboxes).map(cb => cb.value);

    const errorMsg = document.getElementById('createRoleErrorMsg');
    if (errorMsg) errorMsg.textContent = '';

    if (!roleName || !displayName || permissions.length === 0) {
      const msg = '❌ Role name, display name, and at least one permission are required';
      console.error(msg);
      if (errorMsg) errorMsg.textContent = msg;
      return;
    }

    if (!/^[a-z_]+$/.test(roleName)) {
      const msg = '❌ Role name must contain only lowercase letters and underscores';
      console.error(msg);
      if (errorMsg) errorMsg.textContent = msg;
      return;
    }

    const roleData = {
      name: roleName,
      display_name: displayName,
      permissions: permissions,
      description: description || ''
    };

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(roleData)
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('❌ Create failed:', data.error);
        if (errorMsg) errorMsg.textContent = `❌ ${data.error}`;
        return;
      }

      console.log('✅ Role created successfully');
      this.closeCreateRoleModal();

      if (this.currentPage === 'users' && window.usersPageModule) {
        await window.usersPageModule.loadRoles(this);
      }

      setTimeout(() => {
        this.showConfirm('Success', `✓ Role "${displayName}" created successfully!`);
      }, 300);

    } catch (error) {
      console.error('❌ Error in handleCreateRoleSubmit:', error);
      if (errorMsg) {
        errorMsg.textContent = `❌ ${error.message || 'An error occurred'}`;
      }
    }
  }

  async handleEditRoleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('💾 ========== UPDATE ROLE VALIDATION START ==========');
    console.log('📅 Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):', new Date().toISOString().replace('T', ' ').substring(0, 19));
    console.log("👤 Current user's login:", 'itqatarfoam-hub');

    const roleId = document.getElementById('editRoleId')?.value;
    const displayName = document.getElementById('editRoleDisplayName')?.value.trim();
    const description = document.getElementById('editRoleDescription')?.value.trim();

    const permissionCheckboxes = document.querySelectorAll('input[name="edit_role_permissions"]:checked');
    const permissions = Array.from(permissionCheckboxes).map(cb => cb.value);

    const errorMsg = document.getElementById('editRoleErrorMsg');
    if (errorMsg) errorMsg.textContent = '';

    console.log('📝 Edit role form values:', {
      roleId,
      displayName,
      permissions,
      description
    });

    // Validation
    if (!roleId) {
      const msg = '❌ Role ID missing';
      console.error(msg);
      if (errorMsg) errorMsg.textContent = msg;
      return;
    }

    if (!displayName || permissions.length === 0) {
      const msg = '❌ Display name and at least one permission are required';
      console.error(msg);
      if (errorMsg) errorMsg.textContent = msg;
      return;
    }

    // Find the role being edited
    const role = this.roles.find(r => r.id === roleId);
    if (!role) {
      const msg = '❌ Role not found';
      console.error(msg);
      if (errorMsg) errorMsg.textContent = msg;
      return;
    }

    console.log('✅ Validation passed');

    // Format permissions for display
    const permissionIcons = {
      dashboard: '📊 Dashboard',
      sales: '💰 Sales',
      messaging: '💬 Messaging',
      products: '📦 Item Management',
      customers: '👥 Customers',
      users: '👤 User Management',
      settings: '⚙️ Settings'
    };

    const permissionsList = permissions.map(p => permissionIcons[p] || p).join('\n');

    // Check if it's the current user's role
    const isCurrentUserRole = role.name === this.currentUser.role;
    const warningMessage = isCurrentUserRole
      ? '\n\n⚠️ WARNING: This is YOUR current role.\nChanges will affect your menu immediately!'
      : '';

    // ⭐ SHOW CONFIRMATION BEFORE DOING ANYTHING ⭐
    console.log('❓ Showing confirmation dialog...');
    this.showConfirm(
      '💾 Confirm Role Update',
      `Update role "${displayName}"?\n\nPermissions (${permissions.length}):\n${permissionsList}${warningMessage}\n\nThis action will affect all users with this role.`,
      async () => {
        // ⭐ User clicked CONFIRM - now save
        console.log('✅ User confirmed - proceeding with save');
        await this.saveRoleUpdate(roleId, displayName, description, permissions, role.name);
      },
      () => {
        // ⭐ User clicked CANCEL - do nothing, modal stays open
        console.log('❌ User cancelled - no changes made');
      }
    );
  }

  // ⭐ SAVE ROLE UPDATE (only called after confirmation) ⭐
  async saveRoleUpdate(roleId, displayName, description, permissions, roleName) {
    console.log('💾 ========== SAVE ROLE UPDATE START ==========');
    console.log('📅 Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):', new Date().toISOString().replace('T', ' ').substring(0, 19));

    const roleData = {
      display_name: displayName,
      permissions: permissions,
      description: description || ''
    };

    console.log('📤 Sending update to API:', roleData);

    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(roleData)
      });

      console.log('📡 Response status:', res.status);
      const data = await res.json();
      console.log('📦 Response data:', data);

      if (!res.ok) {
        console.error('❌ Update failed:', data.error);

        // Show error but DON'T close modal
        const errorMsg = document.getElementById('editRoleErrorMsg');
        if (errorMsg) {
          errorMsg.textContent = `❌ ${data.error}`;
        }

        this.showConfirm('Error', `❌ Failed to update role:\n\n${data.error}`);
        return;
      }

      console.log('✅ Role updated successfully in database');

      // ⭐ ONLY NOW close the modal
      console.log('🚪 Closing edit role modal...');
      this.closeEditRoleModal();

      // ⭐ Reload role configuration
      console.log('🔄 Reloading role configuration...');
      await this.loadRoleConfig();

      // ⭐ Re-render sidebar if current user's role was updated
      const isCurrentUserRole = roleName === this.currentUser.role;
      if (isCurrentUserRole) {
        console.log('⚠️ Current user\'s role was updated! Re-rendering entire app...');
        await this.render();
        this.attachGlobalListeners();
      }

      // Reload roles list on users page
      if (this.currentPage === 'users' && window.usersPageModule) {
        console.log('🔄 Reloading roles list...');
        await window.usersPageModule.loadRoles(this);
      }

      console.log('💾 ========== SAVE ROLE UPDATE COMPLETE ==========\n');

      // ⭐ Show success message (no callback, just info)
      this.showConfirm(
        '✅ Success',
        `Role "${displayName}" updated successfully!${isCurrentUserRole ? '\n\n✓ Your menu has been updated.' : ''}`
      );

    } catch (error) {
      console.error('❌ Error saving role update:', error);
      console.error('Stack:', error.stack);

      // Show error but DON'T close modal
      const errorMsg = document.getElementById('editRoleErrorMsg');
      if (errorMsg) {
        errorMsg.textContent = `❌ Network error: ${error.message}`;
      }

      this.showConfirm('Error', `❌ Network error:\n\n${error.message}`);
    }
  }

  // ⭐ NEW METHOD: Actually save the role update ⭐
  async saveRoleUpdate(roleId, displayName, description, permissions, roleName) {
    console.log('💾 ========== SAVE ROLE UPDATE START ==========');

    const roleData = {
      display_name: displayName,
      permissions: permissions,
      description: description || ''
    };

    console.log('📤 Sending update to API:', roleData);

    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(roleData)
      });

      console.log('📡 Response status:', res.status);
      const data = await res.json();
      console.log('📦 Response data:', data);

      if (!res.ok) {
        console.error('❌ Update failed:', data.error);
        this.showConfirm('Error', `❌ Failed to update role:\n\n${data.error}`);
        return;
      }

      console.log('✅ Role updated successfully in database');

      // ⭐ Close modal AFTER successful save
      this.closeEditRoleModal();

      // ⭐ Reload role configuration
      console.log('🔄 Reloading role configuration...');
      await this.loadRoleConfig();

      // ⭐ Re-render sidebar if current user's role was updated
      const isCurrentUserRole = roleName === this.currentUser.role;
      if (isCurrentUserRole) {
        console.log('⚠️ Current user\'s role was updated! Re-rendering entire app...');
        await this.render();
        this.attachGlobalListeners();
      }

      // Reload roles list on users page
      if (this.currentPage === 'users' && window.usersPageModule) {
        await window.usersPageModule.loadRoles(this);
      }

      console.log('💾 ========== SAVE ROLE UPDATE COMPLETE ==========\n');

      // ⭐ Show success message AFTER everything is done
      setTimeout(() => {
        this.showConfirm(
          '✅ Success',
          `Role "${displayName}" updated successfully!${isCurrentUserRole ? '\n\n✓ Your menu has been updated.' : ''}`
        );
      }, 300);

    } catch (error) {
      console.error('❌ Error saving role update:', error);
      this.showConfirm('Error', `❌ Network error:\n\n${error.message}`);
    }
  }

  deleteRoleConfirm(roleId, roleName) {
    this.showConfirm(
      'Delete Role',
      `Are you sure you want to delete role "${roleName}"?\n\nUsers with this role will need to be reassigned.\n\nThis action cannot be undone.`,
      () => this.deleteRole(roleId)
    );
  }

  async deleteRole(roleId) {
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      const data = await res.json();

      if (!res.ok) {
        this.showConfirm('Error', data.error || 'Failed to delete role');
        return;
      }

      this.showConfirm('Success', '✓ Role deleted successfully!', () => {
        if (this.currentPage === 'users' && window.usersPageModule) {
          usersPageModule.loadRoles(this);
        }
      });
    } catch (error) {
      console.error('❌ Error deleting role:', error);
      this.showConfirm('Error', `Network error: ${error.message}`);
    }
  }

  async loadRoleConfig() {
    console.log('🔐 ========== LOAD ROLE CONFIG START ==========');

    try {
      const res = await fetch('/api/roles', { credentials: 'same-origin' });
      const data = await res.json();

      if (!res.ok) {
        console.error('❌ Failed to load roles');
        return;
      }

      this.roles = data.roles || [];
      console.log('✅ Loaded', this.roles.length, 'roles');

      // Build role access config from database roles
      const newConfig = {};

      this.roles.forEach(role => {
        const permissions = Array.isArray(role.permissions) ? role.permissions : [];
        newConfig[role.name] = permissions;
        console.log(`  📋 ${role.name}: [${permissions.join(', ')}]`);
      });

      // Update the config
      this.roleAccessConfig = newConfig;

      console.log('✅ Role configuration updated');
      console.log('📋 Final config:', this.roleAccessConfig);
      console.log('🔐 ========== LOAD ROLE CONFIG COMPLETE ==========\n');

      return true;
    } catch (error) {
      console.error('❌ Error loading role config:', error);

      // Fallback to default config
      this.roleAccessConfig = {
        admin: ['dashboard', 'sales', 'messaging', 'products', 'customers', 'users', 'settings'],
        manager: ['dashboard', 'sales', 'messaging', 'products', 'customers', 'settings'],
        user: ['dashboard', 'sales', 'messaging', 'settings']
      };

      return false;
    }
  }

  // ========== EVENT LISTENERS ==========
  attachGlobalListeners() {
    console.log('🔗 Attaching global listeners...');

    setTimeout(() => {
      // Logout button
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        console.log('✅ Logout button found');
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleLogout();
        });
      }
      setTimeout(() => {
        const editCategoryForm = document.getElementById('editCategoryForm');
        if (editCategoryForm && !editCategoryForm.dataset.listenerAttached) {
          console.log('✅ Attaching edit category form listener globally');
          editCategoryForm.addEventListener('submit', (e) => this.handleEditCategory(e));
          editCategoryForm.dataset.listenerAttached = 'true';
        }
      }, 500);

      // Customer form listener
      setTimeout(() => {
        const customerForm = document.getElementById('customerForm');
        if (customerForm && !customerForm.dataset.listenerAttached) {
          console.log('✅ Attaching customer form listener');
          customerForm.addEventListener('submit', (e) => this.handleCustomerFormSubmit(e));
          customerForm.dataset.listenerAttached = 'true';
        }
      }, 500);

      // Create and Edit role forms
      setTimeout(() => {
        const createRoleForm = document.getElementById('createRoleForm');
        if (createRoleForm && !createRoleForm.dataset.listenerAttached) {
          console.log('✅ Attaching create role form listener');
          createRoleForm.addEventListener('submit', (e) => this.handleCreateRoleSubmit(e));
          createRoleForm.dataset.listenerAttached = 'true';
        }

        const editRoleForm = document.getElementById('editRoleForm');
        if (editRoleForm && !editRoleForm.dataset.listenerAttached) {
          console.log('✅ Attaching edit role form listener');
          editRoleForm.addEventListener('submit', (e) => this.handleEditRoleSubmit(e));
          editRoleForm.dataset.listenerAttached = 'true';
        }
      }, 500);

      // New chat form
      setTimeout(() => {
        const newChatForm = document.getElementById('newChatForm');
        if (newChatForm && !newChatForm.dataset.listenerAttached) {
          console.log('✅ Attaching new chat form listener');
          newChatForm.addEventListener('submit', (e) => this.handleNewChatSubmit(e));
          newChatForm.dataset.listenerAttached = 'true';
        }

        const addParticipantForm = document.getElementById('addParticipantForm');
        if (addParticipantForm && !addParticipantForm.dataset.listenerAttached) {
          console.log('✅ Attaching add participant form listener');
          addParticipantForm.addEventListener('submit', (e) => this.handleAddParticipantSubmit(e));
          addParticipantForm.dataset.listenerAttached = 'true';
        }
      }, 500);

      // Stock form (can be opened from anywhere)
      setTimeout(() => {
        const stockForm = document.getElementById('stockForm');
        if (stockForm && !stockForm.dataset.listenerAttached) {
          console.log('✅ Attaching stock form listener globally');
          stockForm.addEventListener('submit', (e) => this.handleUpdateStock(e));
          stockForm.dataset.listenerAttached = 'true';
        }
      }, 500);
      // User form
      setTimeout(() => {
        const userForm = document.getElementById('userForm');
        if (userForm && !userForm.dataset.listenerAttached) {
          console.log('✅ Attaching user form listener globally');
          userForm.addEventListener('submit', (e) => this.handleUserFormSubmit(e));
          userForm.dataset.listenerAttached = 'true';
        }
      }, 500);



      // Sidebar menu items
      const menuItems = document.querySelectorAll('.sidebar-menu-item');
      console.log(`📍 Found ${menuItems.length} menu items`);

      menuItems.forEach((item) => {
        const page = item.dataset.page;

        item.addEventListener('click', (e) => {
          e.preventDefault();
          console.log(`🔗 Clicked: ${page}`);

          if (!page) return;

          // ⭐ CRITICAL: Check access with updated role config
          const userRole = this.currentUser?.role || 'user';
          const allowedPages = this.roleAccessConfig[userRole] || [];

          console.log(`🔐 Checking access for ${userRole}:`, allowedPages);

          if (!allowedPages.includes(page)) {
            console.error(`❌ Access denied to ${page} for role ${userRole}`);
            this.showConfirm(
              '❌ Access Denied',
              `You don't have permission to access ${page}.\n\nYour role: ${userRole.toUpperCase()}\n\nAllowed pages: ${allowedPages.join(', ')}`
            );
            return;
          }

          // Update active state
          document.querySelectorAll('.sidebar-menu-item').forEach(m => m.classList.remove('active'));
          item.classList.add('active');

          // Change page
          this.currentPage = page;
          console.log(`📄 Navigating to: ${page}`);

          // Update topbar title
          const pageTitles = {
            'dashboard': '📊 Dashboard',
            'products': '📦 Item Management',
            'customers': '👥 Customers',
            'sales': '💰 Sales',
            'messaging': '💬 Messaging',
            'users': '👤 User Management',
            'settings': '⚙️ Settings'
          };
          const topbarTitle = document.querySelector('.topbar-left h1');
          if (topbarTitle) {
            topbarTitle.textContent = pageTitles[page] || 'StockFlow';
          }

          // Render page content
          const pageContent = document.getElementById('pageContent');
          if (pageContent) {
            pageContent.innerHTML = this.getPageContent();
            this.attachPageSpecificListeners();
          }
        });
      });

      // Login form
      const loginForm = document.getElementById('loginForm');
      if (loginForm) {
        console.log('✅ Login form found');
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
      }

      // Attach page-specific listeners
      this.attachPageSpecificListeners();
    }, 100);
  }

  attachPageSpecificListeners() {
    console.log('🔗 Attaching page-specific listeners for:', this.currentPage);

    setTimeout(() => {
      switch (this.currentPage) {
        case 'dashboard':
          this.attachRoleDashboardListeners();
          break;
        case 'products':
          if (window.productsPageModule) {
            productsPageModule.attachListeners(this);

            // Attach form listeners
            setTimeout(() => {
              const productForm = document.getElementById('productForm');
              if (productForm) {
                console.log('✅ Product form found');
                productForm.addEventListener('submit', (e) => this.handleAddProduct(e));
              }

              const categoryForm = document.getElementById('categoryForm');
              if (categoryForm) {
                console.log('✅ Category form found');
                categoryForm.addEventListener('submit', (e) => this.handleAddCategory(e));
              }

              const editCategoryForm = document.getElementById('editCategoryForm');
              if (editCategoryForm) {
                console.log('✅ Edit category form found');
                editCategoryForm.addEventListener('submit', (e) => this.handleEditCategory(e));
              }

              const locationForm = document.getElementById('locationForm');
              if (locationForm) {
                console.log('✅ Location form found');
                locationForm.addEventListener('submit', (e) => this.handleAddLocation(e));
              }

              const editLocationForm = document.getElementById('editLocationForm');
              if (editLocationForm) {
                console.log('✅ Edit location form found');
                editLocationForm.addEventListener('submit', (e) => this.handleEditLocation(e));
              }

              const stockForm = document.getElementById('stockForm');
              if (stockForm) {
                console.log('✅ Stock form found');
                stockForm.addEventListener('submit', (e) => this.handleUpdateStock(e));
              }

              // FIX: Explicitly attach listeners to buttons
              const addProductBtn = document.querySelector('.btn-add-product');
              if (addProductBtn) {
                console.log('✅ Add Product button found');
                addProductBtn.onclick = (e) => {
                  e.preventDefault();
                  this.openAddProduct();
                };
              }

              const categoriesBtn = document.querySelector('.btn-categories');
              if (categoriesBtn) {
                console.log('✅ Categories button found');
                categoriesBtn.onclick = (e) => {
                  e.preventDefault();
                  this.openCategories();
                };
              }

              // FIX: Event delegation for table actions
              const tableBody = document.getElementById('productsTableBody');
              if (tableBody) {
                console.log('✅ Products table body found for delegation');
                tableBody.addEventListener('click', (e) => {
                  const target = e.target.closest('button');
                  if (!target) return;

                  const id = target.dataset.id;
                  if (!id) return;

                  if (target.classList.contains('edit-btn') || target.title === 'Edit') {
                    e.preventDefault();
                    this.openEditProduct(id);
                  } else if (target.classList.contains('stock-btn') || target.title === 'Update Stock') {
                    e.preventDefault();
                    this.openUpdateStock(id);
                  } else if (target.classList.contains('delete-btn') || target.title === 'Delete') {
                    e.preventDefault();
                    const name = target.dataset.name || 'Product';
                    this.deleteProductConfirm(id, name);
                  }
                });
              }
            }, 200);
          }
          break;
        case 'categories':
          if (window.categoriesPageModule) categoriesPageModule.attachListeners(this);
          break;
        case 'customers':
          if (window.customersPageModule) customersPageModule.attachListeners(this);
          break;
        case 'sales':
          if (window.salesPageModule) salesPageModule.attachListeners(this);
          break;
        case 'messaging':
          if (window.messagingPageModule) {
            messagingPageModule.attachListeners(this);
            console.log('✅ Messaging page listeners attached');
          }
          break;
        case 'users':
          if (window.usersPageModule) {
            usersPageModule.attachListeners(this);

            // Make sure edit/delete buttons work
            setTimeout(() => {
              console.log('✅ User management page listeners attached');
            }, 200);
          }
          break;
        case 'settings':
          if (window.settingsPageModule) settingsPageModule.attachListeners(this);
          break;
      }
    }, 100);
  }

  // ========== REPORTS MANAGEMENT ==========
  openReportsModal() {
    console.log('📊 Opening Reports Modal');

    // Reset form
    document.getElementById('reportsErrorMsg').textContent = '';

    // Set default dates (last 30 days)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);

    document.getElementById('reportStartDate').value = lastMonth.toISOString().split('T')[0];
    document.getElementById('reportEndDate').value = today.toISOString().split('T')[0];

    // Populate category dropdown
    const categorySelect = document.getElementById('reportCategory');
    categorySelect.innerHTML = '<option value="all">All Categories</option>';
    this.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });

    // Populate product dropdown
    const productSelect = document.getElementById('reportProduct');
    productSelect.innerHTML = '<option value="all">All Products</option>';
    this.products.forEach(prod => {
      const option = document.createElement('option');
      option.value = prod.id;
      option.textContent = `${prod.product_id} - ${prod.name}`;
      productSelect.appendChild(option);
    });

    ui.openModal('reportsModal');
  }

  closeReportsModal() {
    ui.closeModal('reportsModal');
  }

  setDateRange(range) {
    const today = new Date();
    let startDate = new Date();

    switch (range) {
      case 'today':
        startDate = today;
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // Start from 2020
        break;
    }

    document.getElementById('reportStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('reportEndDate').value = today.toISOString().split('T')[0];
  }

  async generateReport() {
    const errorMsg = document.getElementById('reportsErrorMsg');
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const categoryId = document.getElementById('reportCategory').value;
    const productId = document.getElementById('reportProduct').value;

    errorMsg.textContent = '';

    if (!startDate || !endDate) {
      errorMsg.textContent = '❌ Please select both start and end dates';
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      errorMsg.textContent = '❌ Start date cannot be after end date';
      return;
    }

    try {
      console.log('📊 Generating stock movement report...');

      // Fetch stock movements from API
      const result = await fetch(`/api/stock-movements?startDate=${startDate}&endDate=${endDate}`, {
        credentials: 'same-origin'
      });

      if (!result.ok) {
        throw new Error('Failed to fetch stock movements');
      }

      const data = await result.json();
      let stockMovements = data.movements || [];

      console.log('📦 Fetched', stockMovements.length, 'stock movements');

      // Filter by category if selected
      if (categoryId !== 'all') {
        const productsInCategory = this.products
          .filter(p => p.category_id === categoryId)
          .map(p => p.id);

        stockMovements = stockMovements.filter(sm =>
          productsInCategory.includes(sm.product_id)
        );

        console.log('📦 Filtered by category:', stockMovements.length, 'movements');
      }

      // Filter by product if selected
      if (productId !== 'all') {
        stockMovements = stockMovements.filter(sm => sm.product_id === productId);
        console.log('📦 Filtered by product:', stockMovements.length, 'movements');
      }

      // Build report title
      let reportTitle = `Stock Movement Report (${startDate} to ${endDate})`;

      if (categoryId !== 'all') {
        const category = this.categories.find(c => c.id === categoryId);
        reportTitle += ` - ${category ? category.name : 'Unknown'} Category`;
      }

      if (productId !== 'all') {
        const product = this.products.find(p => p.id === productId);
        reportTitle += ` - ${product ? product.product_id : 'Unknown'} Product`;
      }

      // Calculate summary
      const totalMovements = stockMovements.length;
      const additions = stockMovements.filter(sm => sm.type === 'in').reduce((sum, sm) => sum + (sm.quantity || 0), 0);
      const reductions = stockMovements.filter(sm => sm.type === 'out').reduce((sum, sm) => sum + (sm.quantity || 0), 0);

      const reportData = {
        type: 'stock-movement',
        title: reportTitle,
        data: stockMovements,
        startDate,
        endDate,
        categoryId,
        productId,
        summary: {
          totalMovements,
          additions,
          reductions,
          netChange: additions - reductions
        }
      };

      this.displayReportPreview(reportData);
      this.closeReportsModal();

    } catch (error) {
      console.error('❌ Error generating report:', error);
      errorMsg.textContent = `❌ ${error.message}`;
    }
  }

  async generateDateReport() {
    const dateRangeType = document.getElementById('dateRangeType').value;
    let startDate = '';
    let endDate = '';

    const today = new Date();

    switch (dateRangeType) {
      case 'today':
        startDate = endDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'custom':
        startDate = document.getElementById('reportStartDate').value;
        endDate = document.getElementById('reportEndDate').value;
        if (!startDate || !endDate) {
          throw new Error('Please select both start and end dates');
        }
        break;
    }

    // Filter products by date range
    const filteredProducts = this.products.filter(p => {
      const createdDate = new Date(p.created_at).toISOString().split('T')[0];
      return createdDate >= startDate && createdDate <= endDate;
    });

    return {
      type: 'date',
      title: `Products Report (${startDate} to ${endDate})`,
      data: filteredProducts,
      summary: {
        totalProducts: filteredProducts.length,
        totalValue: filteredProducts.reduce((sum, p) => sum + (p.stock * p.unit_price), 0),
        totalStock: filteredProducts.reduce((sum, p) => sum + p.stock, 0)
      }
    };
  }

  async generateCategoryReport() {
    const categoryId = document.getElementById('reportCategory').value;

    let filteredProducts = this.products;
    let categoryName = 'All Categories';

    if (categoryId !== 'all') {
      filteredProducts = this.products.filter(p => p.category_id === categoryId);
      const category = this.categories.find(c => c.id === categoryId);
      categoryName = category ? category.name : 'Unknown';
    }

    // Group by category
    const categoryGroups = {};
    filteredProducts.forEach(p => {
      const category = this.categories.find(c => c.id === p.category_id);
      const catName = category ? category.name : 'Uncategorized';

      if (!categoryGroups[catName]) {
        categoryGroups[catName] = {
          products: [],
          totalStock: 0,
          totalValue: 0
        };
      }

      categoryGroups[catName].products.push(p);
      categoryGroups[catName].totalStock += p.stock;
      categoryGroups[catName].totalValue += p.stock * p.unit_price;
    });

    return {
      type: 'category',
      title: `Category Report - ${categoryName}`,
      data: categoryGroups,
      summary: {
        totalProducts: filteredProducts.length,
        totalCategories: Object.keys(categoryGroups).length,
        totalValue: filteredProducts.reduce((sum, p) => sum + (p.stock * p.unit_price), 0),
        totalStock: filteredProducts.reduce((sum, p) => sum + p.stock, 0)
      }
    };
  }

  async generateProductReport() {
    const productId = document.getElementById('reportProduct').value;

    let filteredProducts = this.products;
    let productName = 'All Products';

    if (productId !== 'all') {
      filteredProducts = this.products.filter(p => p.id === productId);
      const product = this.products.find(p => p.id === productId);
      productName = product ? `${product.product_id} - ${product.name}` : 'Unknown';
    }

    return {
      type: 'product',
      title: `Product Report - ${productName}`,
      data: filteredProducts,
      summary: {
        totalProducts: filteredProducts.length,
        totalValue: filteredProducts.reduce((sum, p) => sum + (p.stock * p.unit_price), 0),
        totalStock: filteredProducts.reduce((sum, p) => sum + p.stock, 0),
        lowStock: filteredProducts.filter(p => p.stock < 10).length
      }
    };
  }

  async generateStockMovementReport() {
    const startDate = document.getElementById('stockMovementStartDate').value;
    const endDate = document.getElementById('stockMovementEndDate').value;

    if (!startDate || !endDate) {
      throw new Error('Please select both start and end dates');
    }

    // This would normally fetch from an API
    // For now, using a placeholder
    return {
      type: 'stock-movement',
      title: `Stock Movement Report (${startDate} to ${endDate})`,
      data: [],
      summary: {
        totalMovements: 0,
        additions: 0,
        reductions: 0
      }
    };
  }

  displayReportPreview(reportData, reportTitle) {
    const container = document.getElementById('reportContentContainer');

    let html = `
      <div class="report-header" style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
        <h1 style="color: #1f2937; font-size: 28px; margin: 0 0 8px 0;">StockFlow Inventory System</h1>
        <h2 style="color: #2563eb; font-size: 20px; margin: 0 0 8px 0;">${reportData.title}</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">Generated on: ${new Date().toLocaleString()}</p>
      </div>
    `;

    // Add summary section
    html += `
      <div class="report-summary" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 16px 0; font-weight: 600;">📊 Summary</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          ${Object.entries(reportData.summary).map(([key, value]) => `
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0; text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0;">
                ${typeof value === 'number' && key.includes('Value') ?
        `QAR ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
        value.toLocaleString()}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add data table based on report type
    if (reportData.type === 'stock-movement') {
      html += this.renderStockMovementTable(reportData.data);
    } else if (reportData.type === 'category') {
      html += this.renderCategoryReportTable(reportData.data);
    } else {
      html += this.renderProductReportTable(reportData.data);
    }

    container.innerHTML = html;
    ui.openModal('reportPreviewModal');
  }

  renderStockMovementTable(movements) {
    if (!movements || movements.length === 0) {
      return '<p style="text-align: center; color: #6b7280; padding: 40px;">No stock movements found for the selected criteria.</p>';
    }

    return `
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Date</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Product</th>
            <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Type</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Quantity</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Before</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">After</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Reference</th>
          </tr>
        </thead>
        <tbody>
          ${movements.map(sm => {
      const product = this.products.find(p => p.id === sm.product_id);
      const productName = product ? `${product.product_id} - ${product.name}` : 'Unknown';

      const typeLabels = { 'in': '📈 Addition', 'out': '📉 Reduction', 'adjustment': '⚙️ Adjustment' };
      const movementType = typeLabels[sm.type] || sm.type;

      const typeColors = { 'in': '#10b981', 'out': '#ef4444', 'adjustment': '#f59e0b' };
      const typeColor = typeColors[sm.type] || '#6b7280';

      return `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px;">${new Date(sm.created_at).toLocaleDateString()} ${new Date(sm.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                <td style="padding: 10px; font-weight: 500;">${productName}</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background: ${typeColor}15; color: ${typeColor}; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                    ${movementType}
                  </span>
                </td>
                <td style="padding: 10px; text-align: right; font-weight: 600; color: ${typeColor};">
                  ${sm.type === 'in' ? '+' : sm.type === 'out' ? '-' : ''}${sm.quantity || 0}
                </td>
                <td style="padding: 10px; text-align: right;">${sm.stock_before || 0}</td>
                <td style="padding: 10px; text-align: right; font-weight: 600;">${sm.stock_after || 0}</td>
                <td style="padding: 10px; color: #6b7280; font-size: 12px;">${sm.reference || 'N/A'}</td>
              </tr>
            `;
    }).join('')}
        </tbody>
      </table>
    `;
  }

  renderProductReportTable(products) {
    if (!products || products.length === 0) {
      return '<p style="text-align: center; color: #6b7280; padding: 40px;">No data available for this report.</p>';
    }

    return `
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Category</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Product ID</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Product Name</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Stock</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Unit Price</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Total Value</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Entry Date</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => {
      const category = this.categories.find(c => c.id === p.category_id);
      return `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px;">${category ? category.name : 'N/A'}</td>
                <td style="padding: 10px; font-family: monospace;">${p.product_id}</td>
                <td style="padding: 10px;">${p.name}</td>
                <td style="padding: 10px; text-align: right; ${p.stock < 10 ? 'color: #dc2626; font-weight: 600;' : ''}">${p.stock}</td>
                <td style="padding: 10px; text-align: right;">QAR ${p.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 10px; text-align: right; font-weight: 600;">QAR ${(p.stock * p.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 10px;">${new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            `;
    }).join('')}
        </tbody>
      </table>
    `;
  }

  renderCategoryReportTable(categoryGroups) {
    let html = '';

    Object.entries(categoryGroups).forEach(([categoryName, data]) => {
      html += `
        <div style="margin-bottom: 30px;">
          <h3 style="background: #2563eb; color: white; padding: 12px; border-radius: 6px; font-size: 16px; margin: 0 0 16px 0;">
            ${categoryName} (${data.products.length} products)
          </h3>
          ${this.renderProductReportTable(data.products)}
          <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin-top: 8px; display: flex; justify-content: space-between; font-weight: 600;">
            <span>Subtotal:</span>
            <span>QAR ${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      `;
    });

    return html;
  }

  closeReportPreview() {
    ui.closeModal('reportPreviewModal');
  }

  printReport() {
    const reportContent = document.getElementById('reportContentContainer').innerHTML;
    const printWindow = window.open('', '', 'width=1200,height=800');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>StockFlow Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        ${reportContent}
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  }

  exportReportPDF() {
    this.showConfirm('Feature Coming Soon', 'PDF export functionality will be available in the next update!');
  }

  exportReportExcel() {
    this.showConfirm('Feature Coming Soon', 'Excel export functionality will be available in the next update!');
  }


  // ========== LOCATION MANAGEMENT ==========

  async loadLocations() {
    this.locations = await locationsModule.loadLocations();
    console.log(`✅ Loaded ${this.locations.length} locations`);
  }

  openLocations() {
    console.log('📍 Opening Locations Modal');
    this.cleanLocationsModal();
    this.loadLocationsList();
    ui.openModal('locationsModal');
  }

  closeLocationsModal() {
    ui.closeModal('locationsModal');
    this.cleanLocationsModal();
  }

  cleanLocationsModal() {
    const nameInput = document.getElementById('locationName');
    const descInput = document.getElementById('locationDescription');
    const errorMsg = document.getElementById('locationErrorMsg');

    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (errorMsg) errorMsg.textContent = '';
  }

  async loadLocationsList() {
    await this.loadLocations();

    const container = document.getElementById('locationsList');
    if (!container) return;

    if (this.locations.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: 20px; color: #6b7280;">No locations yet. Add one above!</p>';
      return;
    }

    const html = this.locations.map((loc, index) => `
      <div class="location-item">
        <div class="location-item-info">
          <p class="location-item-name">${this.escapeHtml(loc.name)}</p>
          <p class="location-item-desc">${this.escapeHtml(loc.description || 'No description')}</p>
        </div>
        <div class="location-item-actions">
          <button type="button" onclick="window.app.editLocation('${loc.id}')" class="btn-small btn-edit" style="margin-right: 4px;">Edit</button>
          <button type="button" onclick="window.app.deleteLocationConfirm('${loc.id}', '${this.escapeHtml(loc.name)}')" class="btn-small btn-delete">Delete</button>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;

    // Update count if element exists
    const countEl = document.getElementById('locationCount');
    if (countEl) countEl.textContent = this.locations.length;
  }

  async handleAddLocation(e) {
    e.preventDefault();

    const name = document.getElementById('locationName').value.trim();
    const description = document.getElementById('locationDescription').value.trim();
    const errorMsg = document.getElementById('locationErrorMsg');

    if (!name) {
      errorMsg.textContent = '❌ Location name is required';
      return;
    }

    try {
      const result = await locationsModule.createLocation({ name, description });

      if (!result.success) {
        errorMsg.textContent = `❌ ${result.error}`;
        return;
      }

      this.showConfirm('Success', `✓ Location "${name}" added successfully!`, async () => {
        this.cleanLocationsModal();
        await this.loadLocationsList();
      });
    } catch (error) {
      errorMsg.textContent = `❌ ${error.message}`;
    }
  }

  editLocation(id) {
    const location = this.locations.find(l => l.id === id);
    if (!location) return;

    this.editingLocationId = id;
    document.getElementById('editLocationName').value = location.name;
    document.getElementById('editLocationDescription').value = location.description || '';
    document.getElementById('editLocationErrorMsg').textContent = '';

    ui.openModal('editLocationModal');
  }

  closeEditLocationModal() {
    ui.closeModal('editLocationModal');
    document.getElementById('editLocationForm').reset();
    document.getElementById('editLocationErrorMsg').textContent = '';
    this.editingLocationId = null;
  }

  async handleEditLocation(e) {
    e.preventDefault();

    const name = document.getElementById('editLocationName').value.trim();
    const description = document.getElementById('editLocationDescription').value.trim();
    const errorMsg = document.getElementById('editLocationErrorMsg');

    if (!name) {
      errorMsg.textContent = '❌ Location name is required';
      return;
    }

    try {
      const result = await locationsModule.updateLocation(this.editingLocationId, { name, description });

      if (!result.success) {
        errorMsg.textContent = `❌ ${result.error}`;
        return;
      }

      this.showConfirm('Success', `✓ Location "${name}" updated successfully!`, async () => {
        this.closeEditLocationModal();
        await this.loadLocationsList();
      });
    } catch (error) {
      errorMsg.textContent = `❌ ${error.message}`;
    }
  }

  deleteLocationConfirm(id, name) {
    this.showConfirm(
      'Delete Location',
      `Are you sure you want to delete "${name}"?\n\nProducts in this location will need to be reassigned.\n\nThis action cannot be undone.`,
      () => this.deleteLocation(id)
    );
  }

  async deleteLocation(id) {
    try {
      const locationName = this.locations.find(l => l.id === id)?.name;
      const result = await locationsModule.deleteLocation(id);

      if (!result.success) {
        this.showConfirm('Error', result.error || 'Failed to delete location');
        return;
      }

      this.showConfirm('Success', `✓ Location "${locationName}" deleted successfully!`, async () => {
        await this.loadLocationsList();
      });
    } catch (error) {
      this.showConfirm('Error', `Network error: ${error.message}`);
    }
  }

  // ========== ITEM REPORTS ==========

  async openItemReportsModal() {
    console.log('📊 Opening Item Reports Modal');

    // Populate dropdowns with filters
    await this.updateItemReportFilters();

    // Set default dates to this month
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('itemReportEndDate').value = today;
    this.setItemReportDateRange('month');

    // Clear error message
    document.getElementById('itemReportsErrorMsg').textContent = '';

    ui.openModal('itemReportsModal');
  }

  closeItemReportsModal() {
    ui.closeModal('itemReportsModal');
    document.getElementById('itemReportsForm').reset();
    document.getElementById('itemReportsErrorMsg').textContent = '';
  }

  async updateItemReportFilters() {
    // Ensure data is loaded
    if (!this.locations || this.locations.length === 0) {
      await this.loadLocations();
    }
    if (!this.categories || this.categories.length === 0) {
      await this.loadCategories();
    }
    if (!this.products || this.products.length === 0) {
      await this.loadProducts();
    }

    // Populate Location Filter
    const locationFilter = document.getElementById('itemReportLocationFilter');
    if (locationFilter) {
      locationFilter.innerHTML = '<option value="all">All Locations</option>';
      this.locations.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc.id;
        option.textContent = loc.name;
        locationFilter.appendChild(option);
      });
    }

    // Populate Category Filter
    const categoryFilter = document.getElementById('itemReportCategoryFilter');
    if (categoryFilter) {
      categoryFilter.innerHTML = '<option value="all">All Categories</option>';
      this.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categoryFilter.appendChild(option);
      });
    }

    // Populate Product Filter
    const productFilter = document.getElementById('itemReportProductFilter');
    if (productFilter) {
      productFilter.innerHTML = '<option value="all">All Products</option>';
      this.products.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id;
        option.textContent = `${prod.product_id} - ${prod.name}`;
        productFilter.appendChild(option);
      });
    }
  }

  setItemReportDateRange(range) {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    let startDate;

    switch (range) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'all':
        startDate = '2020-01-01';
        break;
      default:
        startDate = endDate;
    }

    document.getElementById('itemReportStartDate').value = startDate;
    document.getElementById('itemReportEndDate').value = endDate;
  }

  async generateItemReport() {
    const reportType = document.getElementById('itemReportType').value;
    const startDate = document.getElementById('itemReportStartDate').value;
    const endDate = document.getElementById('itemReportEndDate').value;
    const locationFilter = document.getElementById('itemReportLocationFilter').value;
    const categoryFilter = document.getElementById('itemReportCategoryFilter').value;
    const productFilter = document.getElementById('itemReportProductFilter').value;
    const stockFilter = document.getElementById('itemReportStockFilter').value;

    const errorMsg = document.getElementById('itemReportsErrorMsg');
    errorMsg.textContent = '';

    if (!reportType || !startDate || !endDate) {
      errorMsg.textContent = '❌ Please select report type and date range';
      return;
    }

    try {
      console.log('📊 Generating item report:', reportType);

      // Apply filters to products
      let filteredProducts = [...this.products];

      // Location filter
      if (locationFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.location_id === locationFilter);
      }

      // Category filter
      if (categoryFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category_id === categoryFilter);
      }

      // Product filter
      if (productFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.id === productFilter);
      }

      // Stock level filter
      if (stockFilter !== 'all') {
        switch (stockFilter) {
          case 'out_of_stock':
            filteredProducts = filteredProducts.filter(p => p.stock === 0);
            break;
          case 'low_stock':
            filteredProducts = filteredProducts.filter(p => p.stock > 0 && p.stock < 20);
            break;
          case 'in_stock':
            filteredProducts = filteredProducts.filter(p => p.stock > 0);
            break;
          case 'high_stock':
            filteredProducts = filteredProducts.filter(p => p.stock > 100);
            break;
        }
      }

      // Generate report based on type
      this.renderItemReport(reportType, filteredProducts, { startDate, endDate });

    } catch (error) {
      console.error('❌ Error generating report:', error);
      errorMsg.textContent = `Error: ${error.message}`;
    }
  }

  renderItemReport(reportType, products, options) {
    let reportContent = '';
    const reportTitle = this.getItemReportTitle(reportType);

    switch (reportType) {
      case 'inventory_summary':
        reportContent = this.generateInventorySummary(products);
        break;
      case 'low_stock':
        reportContent = this.generateLowStockReport(products);
        break;
      case 'stock_valuation':
        reportContent = this.generateStockValuationReport(products);
        break;
      case 'stock_movements':
        reportContent = '<div style="padding: 20px;"><p>Stock Movements report requires additional data. This feature will be implemented soon.</p></div>';
        break;
      default:
        reportContent = '<p>Report type not yet implemented</p>';
    }

    // Display in report preview modal (reuse existing one)
    const container = document.getElementById('reportContentContainer');
    if (container) {
      container.innerHTML = reportContent;
      ui.openModal('reportPreviewModal');
      this.closeItemReportsModal();
    } else {
      // Fallback to showing in confirmation dialog
      this.showConfirm(reportTitle, reportContent);
    }
  }

  getItemReportTitle(reportType) {
    const titles = {
      'inventory_summary': '📦 Inventory Summary Report',
      'stock_movements': '📊 Stock Movements Report',
      'low_stock': '⚠️ Low Stock Alert Report',
      'stock_valuation': '💰 Stock Valuation Report'
    };
    return titles[reportType] || 'Item Report';
  }

  generateInventorySummary(products) {
    const totalItems = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.unit_price), 0);
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 20).length;

    return `
      <div style="padding: 20px;">
        <h2 style="margin-bottom: 20px;">📦 Inventory Summary Report</h2>
        
        <h3 style="margin-top: 30px;">Summary Statistics</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr style="background: #f9fafb;"><td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Total Products:</strong></td><td style="padding: 12px; border: 1px solid #e5e7eb;">${totalItems}</td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Total Stock Units:</strong></td><td style="padding: 12px; border: 1px solid #e5e7eb;">${totalStock}</td></tr>
          <tr style="background: #f9fafb;"><td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Total Value:</strong></td><td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>$${totalValue.toFixed(2)}</strong></td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Out of Stock:</strong></td><td style="padding: 12px; border: 1px solid #e5e7eb; color: ${outOfStock > 0 ? '#dc2626' : '#10b981'};">${outOfStock}</td></tr>
          <tr style="background: #f9fafb;"><td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Low Stock (< 20):</strong></td><td style="padding: 12px; border: 1px solid #e5e7eb; color: ${lowStock > 0 ? '#f59e0b' : '#10b981'};">${lowStock}</td></tr>
        </table>

        <h3 style="margin-top: 30px;">Product Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #1f2937; color: white;">
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Product ID</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Name</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Category</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Location</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">Stock</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">Unit Price</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">Value</th>
            </tr>
          </thead>
          <tbody>
            ${products.map((p, i) => `
              <tr style="${i % 2 === 0 ? 'background: #f9fafb;' : ''}">
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${this.escapeHtml(p.product_id)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${this.escapeHtml(p.name)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${this.escapeHtml(p.category_name)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${this.escapeHtml(p.location_name || 'N/A')}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; ${p.stock < 20 ? 'color: #dc2626; font-weight: 600;' : ''}">${p.stock}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">$${p.unit_price.toFixed(2)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${(p.stock * p.unit_price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  generateLowStockReport(products) {
    const lowStockItems = products.filter(p => p.stock < 20);

    return `
      <div style="padding: 20px;">
        <h2 style="margin-bottom: 20px;">⚠️ Low Stock Alert Report</h2>
        <p style="font-size: 16px; margin-bottom: 30px;"><strong>Total Low Stock Items:</strong> ${lowStockItems.length}</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #fef2f2; color: #991b1b;">
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Product ID</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Product Name</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Category</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Location</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">Current Stock</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${lowStockItems.map((p, i) => `
              <tr style="${i % 2 === 0 ? 'background: #fffbeb;' : ''}">
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${this.escapeHtml(p.product_id)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 500;">${this.escapeHtml(p.name)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${this.escapeHtml(p.category_name)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${this.escapeHtml(p.location_name || 'N/A')}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; color: ${p.stock === 0 ? '#dc2626' : '#f59e0b'}; font-weight: 700; font-size: 16px;">
                  ${p.stock}
                </td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">
                  ${p.stock === 0 ? '<span style="color: #dc2626; font-weight: 600;">🔴 Out of Stock</span>' : '<span style="color: #f59e0b; font-weight: 600;">⚠️ Low Stock</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  generateStockValuationReport(products) {
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.unit_price), 0);

    // Group by category
    const byCategory = {};
    products.forEach(p => {
      const cat = p.category_name || 'Uncategorized';
      if (!byCategory[cat]) {
        byCategory[cat] = { count: 0, value: 0 };
      }
      byCategory[cat].count++;
      byCategory[cat].value += p.stock * p.unit_price;
    });

    return `
      <div style="padding: 20px;">
        <h2 style="margin-bottom: 20px;">💰 Stock Valuation Report</h2>
        <p style="font-size: 18px; margin-bottom: 30px;"><strong>Total Inventory Value:</strong> <span style="color: #10b981; font-size: 24px;">$${totalValue.toFixed(2)}</span></p>

        <h3 style="margin-top: 30px;">Valuation by Category</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <thead>
            <tr style="background: #10b981; color: white;">
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Category</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">Items</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">Value</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">% of Total</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(byCategory).map(([cat, data], i) => `
              <tr style="${i % 2 === 0 ? 'background: #f0fdf4;' : ''}">
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 500;">${cat}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${data.count}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${data.value.toFixed(2)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${((data.value / totalValue) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="margin-top: 30px;">All Products</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #1f2937; color: white;">
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Product</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Category</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">Stock</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">Unit Price</th>
              <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">Total Value</th>
            </tr>
          </thead>
          <tbody>
            ${products.map((p, i) => `
              <tr style="${i % 2 === 0 ? 'background: #f9fafb;' : ''}">
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 500;">${this.escapeHtml(p.name)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${this.escapeHtml(p.category_name)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${p.stock}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">$${p.unit_price.toFixed(2)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #10b981;">$${(p.stock * p.unit_price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ========== BROADCAST MESSAGING ==========
  openBroadcastModal() {
    console.log('📢 Opening broadcast modal');

    // Reset form
    const form = document.getElementById('broadcastForm');
    if (form) form.reset();

    // Clear errors
    const errorMsg = document.getElementById('broadcastErrorMsg');
    if (errorMsg) errorMsg.textContent = '';

    // Reset character count
    const charCount = document.getElementById('broadcastCharCount');
    if (charCount) charCount.textContent = '0 / 500 characters';

    // Open modal
    ui.openModal('broadcastModal');

    // Add character count listener
    const messageField = document.getElementById('broadcastMessage');
    if (messageField) {
      messageField.addEventListener('input', () => {
        const count = messageField.value.length;
        if (charCount) {
          charCount.textContent = `${count} / 500 characters`;
          charCount.style.color = count > 450 ? '#ef4444' : '#6b7280';
        }
      });
    }

    // Add form submit listener
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendBroadcastMessage();
      }, { once: true });
    }
  }

  closeBroadcastModal() {
    console.log('📢 Closing broadcast modal');
    ui.closeModal('broadcastModal');
  }

  async sendBroadcastMessage() {
    const title = document.getElementById('broadcastTitle').value.trim();
    const message = document.getElementById('broadcastMessage').value.trim();
    const errorMsg = document.getElementById('broadcastErrorMsg');

    // Validate
    if (!title || !message) {
      errorMsg.textContent = 'Please fill in all required fields';
      return;
    }

    if (title.length > 100 || message.length > 500) {
      errorMsg.textContent = 'Message exceeds maximum length';
      return;
    }

    try {
      // Show confirmation
      this.showConfirm(
        '📢 Confirm Broadcast',
        `Send this message to all users?\n\nTitle: "${title}"\n\nThis action cannot be undone.`,
        async () => {
          try {
            const response = await fetch('/api/notifications/broadcast', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'same-origin',
              body: JSON.stringify({
                title: title,
                message: message,
                type: 'system'  // Use 'system' type for broadcasts
              })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
              throw new Error(result.error || 'Failed to send broadcast');
            }

            // Close modal
            this.closeBroadcastModal();

            // Show success
            this.showConfirm(
              '✅ Success',
              `Broadcast sent successfully to ${result.userCount || 'all'} user(s)!`,
              () => { },
              true  // Single button
            );

          } catch (error) {
            console.error('Broadcast error:', error);
            this.showConfirm('Error', `Failed to send broadcast:\n\n${error.message}`);
          }
        }
      );
    } catch (error) {
      console.error('Broadcast error:', error);
      errorMsg.textContent = `Error: ${error.message}`;
    }
  }
}

// ========== INITIALIZE APP ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('📋 DOM Content Loaded - Starting StockFlow');
  console.log('Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):', new Date().toISOString().replace('T', ' ').substring(0, 19));
  console.log("Current user's login:", 'itqatarfoam-hub');

  window.app = new StockFlowApp();
});
