// ============================================
// STOCKFLOW - EVENTS MANAGER MODULE
// Central event handling and coordination
// ============================================

const EventsManager = {
    /**
     * Attach global event listeners
     */
    attachGlobalListeners(app) {
        console.log('🔗 Attaching global event listeners...');

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.removeEventListener('submit', app.boundHandleLogin);
            app.boundHandleLogin = (e) => AuthHandler.handleLogin(app, e);
            loginForm.addEventListener('submit', app.boundHandleLogin);
            console.log('✅ Login form listener attached');
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.removeEventListener('click', app.boundHandleLogout);
            app.boundHandleLogout = () => AuthHandler.handleLogout(app);
            logoutBtn.addEventListener('click', app.boundHandleLogout);
            console.log('✅ Logout button listener attached');
        }

        // Sidebar menu navigation
        this.attachNavigationListeners(app);

        // Modal close on outside click
        this.attachModalListeners(app);

        console.log('✅ Global listeners attached');
    },

    /**
     * Attach navigation listeners
     */
    attachNavigationListeners(app) {
        const menuItems = document.querySelectorAll('.sidebar-menu-item');

        menuItems.forEach(item => {
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                const page = item.dataset.page;

                console.log(`🔄 Navigating to: ${page}`);

                // Check access
                if (!app.hasAccessToPage(page)) {
                    console.warn(`⚠️ Access denied to page: ${page}`);
                    alert('Access Denied');
                    return;
                }

                // Update current page
                app.currentPage = page;

                // Re-render
                await app.render();
                app.attachGlobalListeners();
                app.attachPageSpecificListeners();

                console.log(`✅ Navigated to: ${page}`);
            });
        });

        console.log(`✅ Attached ${menuItems.length} navigation listeners`);
    },

    /**
     * Attach modal event listeners
     */
    attachModalListeners(app) {
        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
                e.target.classList.remove('active');
            }
        });
    },

    /**
     * Attach page-specific listeners
     */
    attachPageSpecificListeners(app) {
        console.log('🔗 Attaching page-specific listeners for:', app.currentPage);

        switch (app.currentPage) {
            case 'dashboard':
                this.attachDashboardListeners(app);
                break;
            case 'products':
                if (window.productsPageModule && productsPageModule.attachListeners) {
                    productsPageModule.attachListeners(app);
                }
                break;
            case 'customers':
                if (window.customersPageModule && customersPageModule.attachListeners) {
                    customersPageModule.attachListeners(app);
                }
                break;
            case 'sales':
                if (window.salesPageModule && salesPageModule.attachListeners) {
                    salesPageModule.attachListeners(app);
                }
                break;
            case 'messaging':
                if (window.messagingPageModule && messagingPageModule.attachListeners) {
                    messagingPageModule.attachListeners(app);
                }
                break;
            case 'settings':
                if (window.settingsPageModule && settingsPageModule.attachListeners) {
                    settingsPageModule.attachListeners(app);
                }
                break;
            case 'users':
                if (window.usersPageModule && usersPageModule.attachListeners) {
                    usersPageModule.attachListeners(app);
                }
                break;

            // CRM pages
            case 'crm':
                if (window.crmDashboardModule && crmDashboardModule.attachListeners) {
                    crmDashboardModule.attachListeners(app);
                }
                break;
            case 'crm-leads':
                if (window.crmLeadsModule && crmLeadsModule.attachListeners) {
                    crmLeadsModule.attachListeners(app);
                }
                break;
            case 'crm-approvals':
                if (window.crmApprovalsModule && crmApprovalsModule.attachListeners) {
                    crmApprovalsModule.attachListeners(app);
                }
                break;
            case 'crm-meetings':
                if (window.crmMeetingsModule && crmMeetingsModule.attachListeners) {
                    crmMeetingsModule.attachListeners(app);
                }
                break;

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
                if (window.hrmMainPageModule && hrmMainPageModule.attachListeners) {
                    hrmMainPageModule.attachListeners(app);
                }
                break;

            case 'my-hr':
                if (window.hrmEmployeeDashboardModule && hrmEmployeeDashboardModule.attachListeners) {
                    hrmEmployeeDashboardModule.attachListeners(app);
                }
                break;
        }

        console.log('✅ Page-specific listeners attached');
    },

    /**
     * Attach dashboard-specific listeners
     */
    attachDashboardListeners(app) {
        UIRenderer.attachRoleDashboardListeners(app);
    },

    /**
     * Debounce helper for search inputs
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Export for use in other modules
window.EventsManager = EventsManager;
