// ============================================
// STOCKFLOW - MAIN APPLICATION (COMPLETE FIXED)
// Author: itqatarfoam-hub
// Date: 2025-11-23 05:45:33 UTC
// ============================================

class StockFlowApp {
  constructor() {
    console.log('🚀 StockFlow initializing...');
    console.log('Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):', new Date().toISOString().replace('T', ' ').substring(0, 19));
    console.log("Current user's login:", 'itqatarfoam-hub');
    
    this.currentPage = 'login';
    this.currentUser = null;
    this.editingProductId = null;
    this.editingCategoryId = null;
    this.editingCustomerId = null;
    this.editingUserId = null;
    
    // Data storage
    this.products = [];
    this.categories = [];
    this.customers = [];
    this.sales = [];
    this.users = [];
    this.currentSaleItems = [];
    
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
    } else {
      this.currentPage = 'login';
      console.log('❌ Not authenticated - showing login page');
    }
  }

  async loadInitialData() {
    try {
      await Promise.all([
        this.loadProducts(),
        this.loadCategories(),
        this.loadCustomers()
      ]);
      console.log('✅ Initial data loaded');
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
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

  // ========== RENDERING ==========
  async render() {
    const appDiv = document.getElementById('app');
    if (!appDiv) {
      console.error('❌ #app div not found!');
      return;
    }

    let content = '';

    if (this.currentPage === 'login') {
      console.log('🎨 Rendering login page');
      content = await this.renderLoginPage();
    } else {
      console.log('🎨 Rendering dashboard layout');
      const sidebar = this.renderSidebar();
      console.log('📏 Sidebar HTML length:', sidebar.length);
      
      content = `
        <div class="dashboard-container">
          ${sidebar}
          <div class="main-content">
            ${this.renderTopbar()}
            <div class="page-container">
              <div id="pageContent">
                ${this.getPageContent()}
              </div>
            </div>
          </div>
        </div>
        ${this.renderModals()}
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
  }

    getPageContent() {
    console.log('📄 Getting content for page:', this.currentPage);
    
    try {
      switch (this.currentPage) {
        case 'dashboard':
          return window.dashboardModule ? dashboardModule.render() : '<div class="card"><h2>Dashboard module not loaded</h2></div>';
        case 'products':
          return window.productsPageModule ? productsPageModule.render() : '<div class="card"><h2>Products module not loaded</h2></div>';
        case 'customers':
          return window.customersPageModule ? customersPageModule.render() : '<div class="card"><h2>Customers module not loaded</h2></div>';
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

      // ========== SIDEBAR ==========
    // ========== SIDEBAR ==========
   renderSidebar() {
    const user = this.currentUser || {};
    const role = user.role || 'user';
    
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
          <a href="#" class="sidebar-menu-item ${this.currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
            <span>📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" class="sidebar-menu-item ${this.currentPage === 'sales' ? 'active' : ''}" data-page="sales">
            <span>💰</span>
            <span>Sales</span>
          </a>
          <a href="#" class="sidebar-menu-item ${this.currentPage === 'messaging' ? 'active' : ''}" data-page="messaging">
            <span>💬</span>
            <span>Messaging</span>
          </a>
          ${role !== 'user' ? `
          <a href="#" class="sidebar-menu-item ${this.currentPage === 'products' ? 'active' : ''}" data-page="products">
            <span>📦</span>
            <span>Item Management</span>
          </a>
          <a href="#" class="sidebar-menu-item ${this.currentPage === 'customers' ? 'active' : ''}" data-page="customers">
            <span>👥</span>
            <span>Customers</span>
          </a>
          ` : ''}
          ${role === 'admin' ? `
          <a href="#" class="sidebar-menu-item ${this.currentPage === 'users' ? 'active' : ''}" data-page="users">
            <span>👤</span>
            <span>User Management</span>
          </a>
          ` : ''}
          <a href="#" class="sidebar-menu-item ${this.currentPage === 'settings' ? 'active' : ''}" data-page="settings">
            <span>⚙️</span>
            <span>Settings</span>
          </a>
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
          <div class="topbar-date">${formattedDate}</div>
        </div>
      </div>
    `;
  }

  // ========== LOGIN PAGE ==========
  async renderLoginPage() {
    try {
      const settings = await settingsModule.loadLoginSettings();
      
      return `
        <div class="login-container">
          <div class="login-card">
            <div class="login-header">
              <div class="login-logo">${settings.logo || '📊'}</div>
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
            </form>

            <div class="demo-credentials">
              <p>${settings.demo_label || 'Demo Credentials'}</p>
              <p style="margin-top: 8px; font-weight: 600;">Username: <strong>admin</strong> | Password: <strong>admin123</strong></p>
            </div>
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
    if (e) e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const errorMsg = document.getElementById('loginErrorMsg');
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';

    if (!username || !password) {
      errorMsg.textContent = 'Please enter username and password';
      errorMsg.style.display = 'block';
      return;
    }

    try {
      const result = await authModule.login(username, password);

      if (!result.success) {
        errorMsg.textContent = result.error;
        errorMsg.style.display = 'block';
        return;
      }

      console.log('✅ Login successful:', username);
      this.currentUser = result.user;
      this.currentPage = 'dashboard';
      
      // Render first
      await this.render();
      
      // Then attach listeners AFTER render completes
      setTimeout(() => {
        console.log('🔗 Attaching listeners after login...');
        this.attachGlobalListeners();
        this.attachPageSpecificListeners();
      }, 200);
      
      // Load data last
      await this.loadInitialData();
      
    } catch (error) {
      console.error('❌ Login error:', error);
      errorMsg.textContent = 'An error occurred. Please try again.';
      errorMsg.style.display = 'block';
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

<!-- User Modal -->
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

            <!-- Product Modal -->
      <div id="productModal" class="modal">
        <div class="modal-content">
          <h3 class="modal-header" id="productModalTitle">Add New Product</h3>
          <div class="error-message-box" id="productErrorMsg"></div>
          <form id="productForm">
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select id="productCategory" class="form-select" required>
                <option value="">Select Category</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Product ID *</label>
              <input type="text" id="productId" class="form-input" placeholder="e.g. PROD-001" required>
            </div>
            <div class="form-group">
              <label class="form-label">Product Name *</label>
              <input type="text" id="productName" class="form-input" placeholder="e.g. Wireless Mouse" required>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="productDescription" class="form-textarea" placeholder="Product description"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Stock Quantity *</label>
              <input type="number" id="productStock" class="form-input" placeholder="0" min="0" required>
            </div>
            <div class="form-group">
              <label class="form-label">Unit Price *</label>
              <input type="number" id="productUnitPrice" class="form-input" placeholder="0.00" min="0" step="0.01" required>
            </div>
            <div class="form-group">
              <label class="form-label">Entry Date *</label>
              <input type="date" id="productEntryDate" class="form-input" required>
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

      <!-- Stock Update Modal -->
      <div id="stockModal" class="modal">
        <div class="modal-content">
          <h3 class="modal-header">Update Product Stock</h3>
          <div class="error-message-box" id="stockErrorMsg"></div>
          <form id="stockForm">
            <div class="form-group">
              <label class="form-label">Product ID</label>
              <input type="text" id="stockProductId" class="form-input" readonly style="background: #f3f4f6;">
            </div>
            <div class="form-group">
              <label class="form-label">Product Name</label>
              <input type="text" id="stockProductName" class="form-input" readonly style="background: #f3f4f6;">
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <input type="text" id="stockProductCategory" class="form-input" readonly style="background: #f3f4f6;">
            </div>
            <div class="form-group">
              <label class="form-label">Current Stock</label>
              <input type="number" id="stockCurrent" class="form-input" readonly style="background: #f3f4f6;">
            </div>
            <div class="form-group">
              <label class="form-label">Quantity Change * (use - to reduce)</label>
              <input type="number" id="stockNewQuantity" class="form-input" placeholder="e.g. 10 to add, -5 to remove" required>
            </div>
            <div class="form-group">
              <label class="form-label">Update Date *</label>
              <input type="date" id="stockUpdateDate" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Notes (Optional)</label>
              <textarea id="stockNotes" class="form-textarea" placeholder="Add notes about stock update" style="min-height: 60px;"></textarea>
            </div>
            <div class="form-button-group">
              <button type="submit" class="btn-primary">Update Stock</button>
              <button type="button" class="btn-secondary" onclick="window.app.closeStockModal()">Cancel</button>
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
    `;
  }

  showConfirm(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');
    
    const newYesBtn = yesBtn.cloneNode(true);
    const newNoBtn = noBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    noBtn.parentNode.replaceChild(newNoBtn, noBtn);
    
    newYesBtn.onclick = () => {
      modal.classList.remove('active');
      if (onConfirm) onConfirm();
    };
    
    newNoBtn.onclick = () => {
      modal.classList.remove('active');
    };
    
    modal.classList.add('active');
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
      document.getElementById('userEmail').value = user.email || '';
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
    console.log('📝 User form submitted');

    const userId = document.getElementById('userId').value.trim();
    const userName = document.getElementById('userName').value.trim();
    const userFullName = document.getElementById('userFullName').value.trim();
    const userEmail = document.getElementById('userEmail').value.trim();
    const userRole = document.getElementById('userRole').value.trim();
    const userPassword = document.getElementById('userPassword').value.trim();
    const errorMsg = document.getElementById('userErrorMsg');

    errorMsg.innerHTML = '';

    if (!userName || !userFullName) {
      errorMsg.innerHTML = '❌ Username and full name are required';
      return;
    }

    if (!this.editingUserId && !userPassword) {
      errorMsg.innerHTML = '❌ Password is required for new users';
      return;
    }

    if (userPassword && userPassword.length < 6) {
      errorMsg.innerHTML = '❌ Password must be at least 6 characters';
      return;
    }

    try {
      if (this.editingUserId) {
        // Update existing user
        const updateData = {
          username: userName,
          full_name: userFullName,
          email: userEmail,
          role: userRole
        };

        if (userPassword) {
          updateData.password = userPassword;
        }

        const result = await usersModule.updateUser(userId, updateData);

        if (!result.success) {
          errorMsg.innerHTML = `❌ ${result.error || 'Failed to update user'}`;
          return;
        }

        this.showConfirm('Success', `✓ User "${userFullName}" updated successfully!`, () => {
          ui.closeModal('userModal');
          document.getElementById('userForm').reset();
          if (this.currentPage === 'users') {
            usersPageModule.loadUsersList(this);
            usersPageModule.loadUsersListCard(this);
          }
        });
      } else {
        // Create new user
        const createData = {
          username: userName,
          full_name: userFullName,
          password: userPassword,
          email: userEmail,
          role: userRole
        };

        const result = await usersModule.createUser(createData);

        if (!result.success) {
          errorMsg.innerHTML = `❌ ${result.error || 'Failed to create user'}`;
          return;
        }

        this.showConfirm('Success', `✓ User "${userFullName}" created successfully!`, () => {
          ui.closeModal('userModal');
          document.getElementById('userForm').reset();
          if (this.currentPage === 'users') {
            usersPageModule.loadUsersList(this);
            usersPageModule.loadUsersListCard(this);
          }
        });
      }
    } catch (e) {
      errorMsg.innerHTML = `❌ Network error: ${e.message}`;
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
    }
  }

  // ========== SALES MANAGEMENT ==========
  updateCustomerDropdown() {
    const select = document.getElementById('saleCustomer');
    if (select) {
      select.innerHTML = '<option value="">-- Choose Customer --</option>';
      this.customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = `${customer.company_name} (${customer.contact_person}) - ${customer.mobile}`;
        select.appendChild(option);
      });
    }
  }

  addSaleItem() {
    console.log('➕ Adding sale item');
    const item = {
      id: Date.now(),
      product_id: '',
      product_name: '',
      unit_price: 0,
      qty: 0,
      selling_price: 0,
      total: 0
    };
    
    this.currentSaleItems.push(item);
    this.renderSaleItems();
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

  removeSaleItem(index) {
    console.log('🗑️ Removing sale item:', index);
    this.currentSaleItems.splice(index, 1);
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
    console.log('💾 Submitting customer...');

    const companyInput = document.getElementById('customerCompany');
    const personInput = document.getElementById('customerPerson');
    const emailInput = document.getElementById('customerEmail');
    const mobileInput = document.getElementById('customerMobile');
    const addressInput = document.getElementById('customerAddress');
    const notesInput = document.getElementById('customerNotes');
    const errorMsg = document.getElementById('customerErrorMsg');

    if (!companyInput || !personInput || !mobileInput || !errorMsg) {
      console.error('❌ Form elements not found');
      return;
    }

    const company = companyInput.value.trim();
    const person = personInput.value.trim();
    const email = emailInput ? emailInput.value.trim() : '';
    const mobile = mobileInput.value.trim();
    const address = addressInput ? addressInput.value.trim() : '';
    const notes = notesInput ? notesInput.value.trim() : '';

    errorMsg.innerHTML = '';

    const companyWarning = document.getElementById('companyDuplicateWarning');
    const emailWarning = document.getElementById('emailWarning');
    const mobileWarning = document.getElementById('mobileWarning');

    if (companyWarning) companyWarning.style.display = 'none';
    if (emailWarning) emailWarning.style.display = 'none';
    if (mobileWarning) mobileWarning.style.display = 'none';

    // Validation
    if (!company) {
      errorMsg.innerHTML = '❌ Company name is required';
      companyInput.focus();
      return;
    }

    if (company.length < 3) {
      errorMsg.innerHTML = '❌ Company name must be at least 3 characters';
      companyInput.focus();
      return;
    }

    const duplicateCustomer = this.customers.find(c => 
      c.company_name.toLowerCase().trim() === company.toLowerCase().trim()
    );

    if (duplicateCustomer) {
      if (companyWarning) companyWarning.style.display = 'block';
      errorMsg.innerHTML = `❌ Company "${company}" already exists`;
      companyInput.focus();
      return;
    }

    if (!person) {
      errorMsg.innerHTML = '❌ Contact person is required';
      personInput.focus();
      return;
    }

    if (person.length < 2) {
      errorMsg.innerHTML = '❌ Contact person must be at least 2 characters';
      personInput.focus();
      return;
    }

    if (email && !this.isValidEmail(email)) {
      if (emailWarning) emailWarning.style.display = 'block';
      errorMsg.innerHTML = '❌ Invalid email address';
      if (emailInput) emailInput.focus();
      return;
    }

    if (!mobile) {
      errorMsg.innerHTML = '❌ Mobile number is required';
      mobileInput.focus();
      return;
    }

    const mobileDigitsOnly = mobile.replace(/\D/g, '');
    if (mobileDigitsOnly.length < 7) {
      if (mobileWarning) mobileWarning.style.display = 'block';
      errorMsg.innerHTML = '❌ Mobile must have at least 7 digits';
      mobileInput.focus();
      return;
    }

    const customerData = {
      company_name: company,
      contact_person: person,
      email: email,
      mobile: mobile,
      location: address,
      notes: notes
    };

    this.showConfirm(
      '✓ Confirm New Customer',
      `Company: ${company}\nContact: ${person}\nMobile: ${mobile}\n\nCreated by: ${this.currentUser.username}\nDate: ${new Date().toLocaleDateString()}`,
      () => {
        this.saveCustomer(customerData);
      }
    );
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
  openAddProduct() {
    console.log('📦 Opening Add Product Modal');
    this.editingProductId = null;
    
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productErrorMsg').textContent = '';
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('productEntryDate').value = today;
    
    this.updateCategoryDropdown();
    document.getElementById('productSubmitBtn').textContent = 'Add Product';
    
    ui.openModal('productModal');
  }

  closeProductModal() {
    ui.closeModal('productModal');
    document.getElementById('productForm').reset();
    document.getElementById('productErrorMsg').textContent = '';
  }

  async handleAddProduct(e) {
    e.preventDefault();
    console.log('💾 Saving product...');

    const product_id = document.getElementById('productId').value.trim();
    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const category_id = document.getElementById('productCategory').value;
    const stock = parseInt(document.getElementById('productStock').value);
    const unit_price = parseFloat(document.getElementById('productUnitPrice').value);
    const created_at = document.getElementById('productEntryDate').value;

    const errorMsg = document.getElementById('productErrorMsg');
    errorMsg.textContent = '';

    if (!product_id || !name || !category_id || isNaN(stock) || isNaN(unit_price)) {
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
          product_id, name, description, category_id, stock, unit_price, created_at
        });
      } else {
        result = await productsModule.createProduct({
          product_id, name, description, category_id, stock, unit_price, created_at
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

  openEditProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;

    this.editingProductId = id;
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productCategory').value = product.category_id;
    document.getElementById('productId').value = product.product_id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productUnitPrice').value = product.unit_price;
    document.getElementById('productEntryDate').value = new Date(product.created_at).toISOString().split('T')[0];
    document.getElementById('productSubmitBtn').textContent = 'Update Product';
    document.getElementById('productErrorMsg').textContent = '';
    
    this.updateCategoryDropdown();
    
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

  // ========== STOCK MANAGEMENT ==========
  openUpdateStock(id) {
    console.log('📦 Opening Update Stock Modal for:', id);
    
    const product = this.products.find(p => p.id === id);
    if (!product) {
      console.error('❌ Product not found:', id);
      return;
    }

    this.editingProductId = id;
    
    // Populate the form
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
      
      const result = await productsModule.updateStock(this.editingProductId, newStock);

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


      // Sidebar menu items
      const menuItems = document.querySelectorAll('.sidebar-menu-item');
      console.log(`📍 Found ${menuItems.length} menu items`);
      
      menuItems.forEach((item) => {
        const page = item.dataset.page;
        console.log(`  - Menu item: ${page}`);
        
        item.addEventListener('click', (e) => {
          e.preventDefault();
          console.log(`🔗 Clicked: ${page}`);
          
          if (!page) return;

          // Check access
          if (!this.hasAccessToPage(page)) {
            this.showConfirm(
              '❌ Access Denied',
              `You don't have permission to access ${page}.\n\nYour role: ${this.currentUser?.role?.toUpperCase() || 'USER'}`
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
            'categories': '📋 Categories',
            'customers': '👥 Customers',
            'sales': '💰 Sales',
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
          if (window.dashboardModule) dashboardModule.attachListeners(this);
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

              const stockForm = document.getElementById('stockForm');
              if (stockForm) {
                console.log('✅ Stock form found');
                stockForm.addEventListener('submit', (e) => this.handleUpdateStock(e));
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
        case 'users':
          if (window.usersPageModule) {
            usersPageModule.attachListeners(this);
            
            // Attach user form listener
            setTimeout(() => {
              const userForm = document.getElementById('userForm');
              if (userForm) {
                console.log('✅ User form found, attaching listener');
                userForm.addEventListener('submit', (e) => this.handleUserFormSubmit(e));
              } else {
                console.warn('⚠️ User form not found');
              }
            }, 200);
          }
          break;
        case 'settings':
          if (window.settingsPageModule) settingsPageModule.attachListeners(this);
          break;
      }
    }, 100);
  }
}

// ========== INITIALIZE APP ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('📋 DOM Content Loaded - Starting StockFlow');
  console.log('Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):', new Date().toISOString().replace('T', ' ').substring(0, 19));
  console.log("Current user's login:", 'itqatarfoam-hub');
  
  window.app = new StockFlowApp();
});