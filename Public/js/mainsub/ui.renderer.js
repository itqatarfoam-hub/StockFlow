// ============================================
// STOCKFLOW - UI RENDERER MODULE
// Handles all UI rendering operations
// ============================================

const UIRenderer = {
    /**
     * Get page content based on current page
     */
    getPageContent(app) {
        console.log('📄 Getting content for page:', app.currentPage);

        try {
            switch (app.currentPage) {
                // Core pages
                case 'dashboard':
                    return this.getRoleDashboard(app);
                case 'products':
                    return window.productsPageModule ? productsPageModule.render(app) : '<div class="card"><h2>Products module not loaded</h2></div>';
                case 'customers':
                    return window.customersPageModule ? customersPageModule.render(app) : '<div class="card"><h2>Customers module not loaded</h2></div>';
                case 'sales':
                    return window.salesPageModule ? salesPageModule.render(app) : '<div class="card"><h2>Sales module not loaded</h2></div>';
                case 'messaging':
                    return window.messagingPageModule ? messagingPageModule.render(app) : '<div class="card"><h2>Messaging module not loaded</h2></div>';
                case 'users':
                    return window.usersPageModule ? usersPageModule.render(app) : '<div class="card"><h2>Users module not loaded</h2></div>';
                case 'settings':
                    return window.settingsPageModule ? settingsPageModule.render() : '<div class="card"><h2>Settings module not loaded</h2></div>';

                // CRM pages
                case 'crm':
                    return window.crmDashboardModule ? crmDashboardModule.render(app) : '<div class="card"><h2>CRM module not loaded</h2></div>';
                case 'crm-leads':
                    return window.crmLeadsModule ? crmLeadsModule.render(app) : '<div class="card"><h2>CRM Leads module not loaded</h2></div>';
                case 'crm-approvals':
                    return window.crmApprovalsModule ? crmApprovalsModule.render(app) : '<div class="card"><h2>CRM Approvals module not loaded</h2></div>';
                case 'crm-meetings':
                    return window.crmMeetingsModule ? crmMeetingsModule.render(app) : '<div class="card"><h2>CRM Meetings module not loaded</h2></div>';

                // HRM pages - ALL use main HRM page with tabs
                case 'hrm':
                case 'hr':
                case 'hr-employees':
                case 'hr-leave':
                case 'hr-attendance':
                case 'hr-assets':
                case 'hr-vehicles':
                case 'hr-documents':
                case 'hr-payroll':
                case 'hr-reminders':
                case 'hr-reports':
                    return window.hrmMainPageModule ? hrmMainPageModule.render() : '<div class="card"><h2>HRM Main module not loaded</h2></div>';

                case 'my-hr':
                    return window.hrmEmployeeDashboardModule ? hrmEmployeeDashboardModule.render() : '<div class="card"><h2>Employee Portal module not loaded</h2></div>';
                // Reports
                case 'reports':
                    return window.reportsPageModule ? reportsPageModule.render() : '<div class="card"><h2>📊 Reports</h2><p>Reports module not loaded</p></div>';

                default:
                    console.warn('⚠️ Unknown page:', app.currentPage);
                    return '<div style="padding: 40px; text-align: center;"><h2>Page not found</h2><p>Page "' + app.currentPage + '" does not exist</p></div>';
            }
        } catch (error) {
            console.error('❌ Error getting page content:', error);
            return `<div class="card"><h2>Error loading page</h2><p>${error.message}</p></div>`;
        }
    },

    /**
     * Get role-specific dashboard
     */
    getRoleDashboard(app) {
        let userRole = app.currentUser?.role?.toLowerCase() || 'user';

        console.log('🎯 ========== DASHBOARD ROUTING ==========');
        console.log('📋 Current User:', app.currentUser);
        console.log('👤 Original Role:', app.currentUser?.role);
        console.log('🔤 Normalized Role:', userRole);

        // Handle 'admin' as 'administrator'
        if (userRole === 'admin') {
            userRole = 'administrator';
            console.log('✨ Mapping "admin" to "administrator"');
        }

        // Map role names to dashboard module names
        const dashboardModules = {
            'administrator': window.administratorDashboardModule,
            'admin': window.administratorDashboardModule,
            'manager': window.managerDashboardModule,
            'user': window.userDashboardModule,
            'hr': window.hrDashboardModule,
            'sales': window.salesDashboardModule,
            'purchase': window.purchaseDashboardModule,
            'store': window.storeDashboardModule
        };

        console.log('🗺️ Available dashboard modules:', Object.keys(dashboardModules));
        console.log('🔍 Looking for module:', userRole);

        const roleDashboard = dashboardModules[userRole];

        if (roleDashboard) {
            console.log(`✅ SUCCESS: Loading ${userRole} dashboard module`);
            console.log('🎯 ========================================\n');
            return roleDashboard.render();
        } else {
            console.warn(`⚠️ WARNING: No specific dashboard for role '${userRole}'`);
            console.log('🎯 ========================================\n');
            return window.dashboardModule ? dashboardModule.render() : '<div class="card"><h2>Dashboard module not loaded</h2></div>';
        }
    },

    /**
     * Attach role dashboard listeners
     */
    attachRoleDashboardListeners(app) {
        let userRole = app.currentUser?.role?.toLowerCase() || 'user';

        console.log('🔗 ========== ATTACHING DASHBOARD LISTENERS ==========');
        console.log('👤 Role:', userRole);

        if (userRole === 'admin') {
            userRole = 'administrator';
        }

        const dashboardModules = {
            'administrator': window.administratorDashboardModule,
            'admin': window.administratorDashboardModule,
            'manager': window.managerDashboardModule,
            'user': window.userDashboardModule,
            'hr': window.hrDashboardModule,
            'sales': window.salesDashboardModule,
            'purchase': window.purchaseDashboardModule,
            'store': window.storeDashboardModule
        };

        const roleDashboard = dashboardModules[userRole];

        if (roleDashboard && roleDashboard.attachListeners) {
            console.log(`✅ SUCCESS: Attaching ${userRole} dashboard listeners`);
            roleDashboard.attachListeners(app);
        } else if (window.dashboardModule) {
            console.warn(`⚠️ WARNING: No specific dashboard listeners for role '${userRole}'`);
            dashboardModule.attachListeners(app);
        }
        console.log('🔗 ================================================\n');
    },

    /**
     * Render sidebar
     */
    async renderSidebar(app) {
        const user = app.currentUser || {};
        const role = user.role || 'user';

        console.log('🎨 Rendering sidebar for role:', role);

        // Load menu items from database
        let menuItems = await DataLoaders.loadMenuItems(role);

        // If no menus returned, show error (don't use fallback)
        if (menuItems.length === 0) {
            console.error('❌ NO MENUS RETURNED FROM DATABASE!');
            console.error('   Check if /api/menu-items/role/' + role + ' is working');
            console.error('   All menus should have permissions set in database');

            // Show error message instead of empty sidebar
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
                        <div style="padding: 20px; color: #ff6b6b;">
                            <p>⚠️ No menus available</p>
                            <p style="font-size: 12px;">Check server console</p>
                        </div>
                    </div>
                </div>
            `;
        }

        console.log('✅ Visible menu items:', menuItems.length);

        const menuHTML = menuItems.map(item => `
      <a href="#" class="sidebar-menu-item ${app.currentPage === item.page ? 'active' : ''}" data-page="${item.page}">
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
    },

    /**
     * Render topbar
     */
    async renderTopbar(app) {
        const user = app.currentUser || {};
        const formattedDate = StockFlowUtils.formatDate(new Date());

        // Load page title from database
        let pageTitle = 'StockFlow';
        try {
            const titles = await DataLoaders.loadHeaderTitles();
            const titleKey = `${app.currentPage}_title`;
            pageTitle = titles[titleKey] || this.getDefaultPageTitle(app.currentPage);
        } catch (error) {
            console.error('Error loading header title:', error);
            pageTitle = this.getDefaultPageTitle(app.currentPage);
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

    /**
     * Get default page title
     */
    getDefaultPageTitle(page) {
        const defaults = {
            // Core pages
            'dashboard': '📊 Dashboard',
            'products': '📦 Item Management',
            'customers': '👥 Customers',
            'sales': '💰 Sales',
            'messaging': '💬 Messaging',
            'users': '👤 User Management',
            'settings': '⚙️ Settings',
            'reports': '📊 Reports',

            // CRM pages
            'crm': '🏢 CRM Dashboard',
            'crm-leads': '🎯 CRM Leads',
            'crm-approvals': '✅ CRM Approvals',
            'crm-meetings': '📅 Meetings',

            // HRM pages
            'hrm': '🏢 HR Dashboard',
            'hr': '🏢 HR Dashboard',
            'hr-employees': '👥 Employee Management',
            'hr-leave': '🏖️ Leave Management',
            'hr-attendance': '📊 Attendance Management',
            'hr-assets': '📦 Asset Management',
            'hr-vehicles': '🚗 Vehicle Management',
            'hr-documents': '📄 Document Management',
            'hr-payroll': '💰 Payroll Management',
            'hr-reminders': '🔔 Expiry Reminders',
            'hr-reports': '📊 HR Reports',
            'my-hr': '👤 My HR Portal'
        };
        return defaults[page] || 'StockFlow';
    },

    /**
     * Update topbar title without full re-render
     */
    async updateTopbarTitle(app) {
        const titleElement = document.getElementById('topbarTitle');
        if (!titleElement) return;

        try {
            const titles = await DataLoaders.loadHeaderTitles();
            const titleKey = `${app.currentPage}_title`;
            const newTitle = titles[titleKey] || this.getDefaultPageTitle(app.currentPage);
            titleElement.textContent = newTitle;
            console.log(`✅ Updated topbar title to: ${newTitle}`);
        } catch (error) {
            console.error('Error updating topbar title:', error);
        }
    }
};

// Export for use in other modules
window.UIRenderer = UIRenderer;
