// ============================================
// STOCKFLOW - STREAMLINED MAIN APPLICATION
// Orchestration layer using modular architecture
// Author: itqatarfoam-hub
// Date: 2025-11-30 (Refactored)
// ============================================

class StockFlowApp {
    constructor() {
        console.log('🚀 StockFlow initializing (Modular Architecture)...');
        console.log('📅 Current Date and Time:', new Date().toISOString().replace('T', ' ').substring(0, 19));
        console.log('👤 Current user:', 'itqatarfoam-hub');

        // Application state
        this.currentUser = null;
        this.currentPage = 'login';

        // Data arrays
        this.products = [];
        this.categories = [];
        this.locations = [];
        this.customers = [];
        this.sales = [];
        this.users = [];
        this.roles = [];

        // Editing state
        this.editingProductId = null;
        this.editingCustomerId = null;
        this.editingUserId = null;
        this.editingCategoryId = null;
        this.editingLocationId = null;
        this.editingRoleId = null;
        this.currentSaleItems = [];

        // Role-based access (default config, will be overridden from DB)
        this.roleAccessConfig = {
            admin: ['dashboard', 'sales', 'messaging', 'products', 'customers', 'users', 'settings'],
            manager: ['dashboard', 'sales', 'messaging', 'products', 'customers', 'settings'],
            user: ['dashboard', 'sales', 'messaging', 'settings']
        };

        // Bound event handlers for cleanup
        this.boundHandleLogin = null;
        this.boundHandleLogout = null;
        this.currentUser = result.user;
        this.currentPage = 'dashboard';
        console.log('✅ Authenticated as:', this.currentUser.username);
        await DataLoaders.loadRoleConfig(this);
    } else {
    this.currentPage = 'login';
    console.log('❌ Not authenticated - showing login page');
}
    }

    // ========== DATA LOADING (Delegated to DataLoaders module) ==========
    async loadInitialData() {
    return await DataLoaders.loadInitialData(this);
}

    async loadProducts() {
    await DataLoaders.loadProducts(this);
}

    async loadCategories() {
    await DataLoaders.loadCategories(this);
}

    async loadCustomers() {
    await DataLoaders.loadCustomers(this);
}

    async loadSalesData() {
    await DataLoaders.loadSalesData(this);
}

    async loadRoleConfig() {
    await DataLoaders.loadRoleConfig(this);
}

    // ========== RENDERING (Delegated to UIRenderer module) ==========
    async render() {
    const appDiv = document.getElementById('app');
    if (!appDiv) {
        console.error('❌ App div not found');
        return;
    }

    let content = '';

    if (this.currentPage === 'login') {
        console.log('🎨 Rendering login page');
        content = await AuthHandler.renderLoginPage();
    } else {
        console.log('🎨 Rendering dashboard layout for page:', this.currentPage);
        const topbar = await UIRenderer.renderTopbar(this);
        const sidebar = await UIRenderer.renderSidebar(this);
        content = `
        <div class="dashboard-container">
          ${sidebar}
          <div class="main-content">
            ${topbar}
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
}

getPageContent() {
    return UIRenderer.getPageContent(this);
}

getRoleDashboard() {
    return UIRenderer.getRoleDashboard(this);
}

    async renderSidebar() {
    return await UIRenderer.renderSidebar(this);
}

    async renderTopbar() {
    return await UIRenderer.renderTopbar(this);
}

getDefaultPageTitle(page) {
    return UIRenderer.getDefaultPageTitle(page);
}

    async updateTopbarTitle() {
    await UIRenderer.updateTopbarTitle(this);
}

    // ========== AUTHENTICATION (Delegated to AuthHandler module) ==========
    async renderLoginPage() {
    return await AuthHandler.renderLoginPage();
}

    async handleLogin(e) {
    await AuthHandler.handleLogin(this, e);
}

handleForgotPassword() {
    AuthHandler.handleForgotPassword();
}

closeForgotPasswordModal() {
    AuthHandler.closeForgotPasswordModal();
}

    async submitForgotPassword() {
    await AuthHandler.submitForgotPassword(this);
}

    async handleLogout() {
    await AuthHandler.handleLogout(this);
}

// ========== ROLE-BASED ACCESS ==========
hasAccessToPage(page) {
    const userRole = this.currentUser?.role || 'user';
    const allowedPages = this.roleAccessConfig[userRole] || this.roleAccessConfig.user;
    return allowedPages.includes(page);
}

// ========== MODALS (Keep for now - can be extracted later) ==========
renderModals() {
    // Return empty for now - modals will be added as needed
    // This can be extracted to ModalManager module if needed
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
    `;
}

showConfirm(title, message, onConfirm, onCancel) {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;

    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    modal.classList.add('active');

    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');

    yesBtn.onclick = () => {
        modal.classList.remove('active');
        if (onConfirm) onConfirm();
    };

    noBtn.onclick = () => {
        modal.classList.remove('active');
        if (onCancel) onCancel();
    };
}

// ========== EVENT LISTENERS (Delegated to EventsManager module) ==========
attachGlobalListeners() {
    EventsManager.attachGlobalListeners(this);
}

attachPageSpecificListeners() {
    EventsManager.attachPageSpecificListeners(this);
}

attachRoleDashboardListeners() {
    UIRenderer.attachRoleDashboardListeners(this);
}

    // Note: Product, Customer, User, Sales methods remain in main.js for now
    // They call existing page modules which handle the heavy lifting
    // To further reduce size, these can be moved to dedicated management modules
}

// Initialize app
console.log('💫 Loading StockFlow Application...');
const app = new StockFlowApp();
window.app = app;
console.log('✅ StockFlow ready!');
