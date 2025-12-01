// ====================================================
// STOCKFLOW - APP NAVIGATION RENDERS
// Extracted from main.js to reduce file size
// Sidebar and Topbar rendering
// ====================================================

const AppNavigationRenders = {
  // ========== SIDEBAR ==========
  async renderSidebar() {
    const user = this.currentUser || {};
    const role = user.role || 'user';

    console.log(' Rendering sidebar for role:', role);
    console.log(' Role config:', this.roleAccessConfig);

    let menuItems = [];

    try {
      //  Fetch menu items from database based on user role
      console.log(' Fetching menu items from database for role:', role);
      const response = await fetch(`/api/menu-items/role/${role}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.menuItems) {
          menuItems = data.menuItems.map(item => ({
            page: item.route,
            icon: item.icon,
            label: item.name,
            permission: item.permission
          }));
          console.log(' Loaded', menuItems.length, 'menu items from database');
        } else {
          console.warn(' No menu items returned from API');
        }
      } else {
        console.error(' Failed to fetch menu items:', response.status);
      }
    } catch (error) {
      console.error(' Error fetching menu items from database:', error);
    }

    // Fallback to default menu items if database fetch failed
    if (menuItems.length === 0) {
      console.warn(' Using fallback hardcoded menu items');
      const allowedPages = this.roleAccessConfig[role] || this.roleAccessConfig['user'] || [];

      const allMenuItems = [
        {
          page: 'dashboard',
          icon: '',
          label: 'Dashboard',
          permission: 'dashboard'
        },
        {
          page: 'sales',
          icon: '',
          label: 'Sales',
          permission: 'sales'
        },
        {
          page: 'messaging',
          icon: '',
          label: 'Messaging',
          permission: 'messaging'
        },
        {
          page: 'products',
          icon: '',
          label: 'Item Management',
          permission: 'products'
        },
        {
          page: 'customers',
          icon: '',
          label: 'Customers',
          permission: 'customers'
        },
        {
          page: 'settings',
          icon: '',
          label: 'Settings',
          permission: 'settings'
        }
      ];

      menuItems = allMenuItems.filter(item => allowedPages.includes(item.permission));
    }

    console.log(' Visible menu items:', menuItems.length);
    menuItems.forEach(item => {
      console.log(`   ${item.label} (${item.page})`);
    });

    // Generate menu HTML
    const menuHTML = menuItems.map(item => `
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
          <span></span>
          <span>Logout</span>
        </button>
      </div>
    `;
  },

  // ========== TOPBAR ==========
  async renderTopbar() {
    const user = this.currentUser || {};
    const now = new Date();

    const dateOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const formattedDate = now.toLocaleDateString('en-US', dateOptions);

    // Load page title from database
    let pageTitle = 'StockFlow';
    try {
      const response = await fetch('/api/header-titles');
      const data = await response.json();

      if (data.success && data.titles) {
        const titleKey = `${this.currentPage}_title`;
        pageTitle = data.titles[titleKey] || this.getDefaultPageTitle(this.currentPage);
      } else {
        pageTitle = this.getDefaultPageTitle(this.currentPage);
      }
    } catch (error) {
      console.error('Error loading header title:', error);
      pageTitle = this.getDefaultPageTitle(this.currentPage);
    }

    return `
      <div class="topbar">
        <div class="topbar-left">
          <h1 id="topbarTitle">${pageTitle}</h1>
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
  },

  // Helper method to get default page titles
  getDefaultPageTitle(page) {
    const defaults = {
      'dashboard': ' Dashboard',
      'products': ' Item Management',
      'customers': ' Customers',
      'sales': ' Sales',
      'messaging': ' Messaging',
      'users': ' User Management',
      'settings': ' Settings',
      'crm': ' CRM Dashboard',
      'reports': ' Reports'
    };
    return defaults[page] || 'StockFlow';
  },

  // Method to update topbar title without full re-render
  async updateTopbarTitle() {
    const titleElement = document.getElementById('topbarTitle');
    if (!titleElement) return;

    try {
      const response = await fetch('/api/header-titles');
      const data = await response.json();

      if (data.success && data.titles) {
        const titleKey = `${this.currentPage}_title`;
        const newTitle = data.titles[titleKey] || this.getDefaultPageTitle(this.currentPage);
        titleElement.textContent = newTitle;
        console.log(` Updated topbar title to: ${newTitle}`);
      }
    } catch (error) {
      console.error('Error updating topbar title:', error);
    }
  }
};

// Export for global use
window.AppNavigationRenders = AppNavigationRenders;
