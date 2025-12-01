// ============================================
// STOCKFLOW - DATA LOADERS MODULE
// Handles all data loading operations
// ============================================

const DataLoaders = {
    /**
     * Load all initial data
     */
    async loadInitialData(app) {
        try {
            console.log('📦 Loading products, categories, and customers...');

            // Load data in parallel
            const [products, categories, customers] = await Promise.all([
                this.loadProducts(app),
                this.loadCategories(app),
                this.loadCustomers(app)
            ]);

            console.log(`✅ Loaded: ${app.products.length} products, ${app.categories.length} categories, ${app.customers.length} customers`);

            return true;
        } catch (error) {
            console.error('❌ Failed to load initial data:', error);
            return false;
        }
    },

    /**
     * Load products
     */
    async loadProducts(app) {
        app.products = await productsModule.loadProducts();
    },

    /**
     * Load categories
     */
    async loadCategories(app) {
        app.categories = await categoriesModule.loadCategories();
    },

    /**
     * Load customers
     */
    async loadCustomers(app) {
        app.customers = await customersModule.loadCustomers();
    },

    /**
     * Load sales data
     */
    async loadSalesData(app) {
        try {
            const [salesRes, customersRes] = await Promise.all([
                fetch('/api/sales', { credentials: 'same-origin' }),
                fetch('/api/customers', { credentials: 'same-origin' })
            ]);

            const salesData = await salesRes.json();
            const customersData = await customersRes.json();

            app.sales = salesData.sales || [];
            app.customers = customersData.customers || [];

            if (app.updateCustomerDropdown) {
                app.updateCustomerDropdown();
            }
        } catch (e) {
            console.error('❌ Error loading sales data:', e);
        }
    },

    /**
     * Load role configuration from database
     */
    async loadRoleConfig(app) {
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
                return;
            }

            const data = await response.json();

            if (!data.roles || !Array.isArray(data.roles)) {
                console.error('❌ Invalid role data received');
                return;
            }

            console.log('✅ Received', data.roles.length, 'roles from database');
            app.roles = data.roles;

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
            app.roleAccessConfig = newConfig;

            console.log('✅ Role configuration updated successfully');

        } catch (error) {
            console.error('❌ Error loading role config:', error);
        }
    },

    /**
     * Load menu items for a role
     */
    async loadMenuItems(role) {
        try {
            console.log('📡 Fetching menu items from database for role:', role);
            const response = await fetch(`/api/menu-items/role/${role}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.menuItems) {
                    const menuItems = data.menuItems.map(item => ({
                        page: item.route,
                        icon: item.icon,
                        label: item.name,
                        permission: item.permission
                    }));
                    console.log('✅ Loaded', menuItems.length, 'menu items from database');
                    return menuItems;
                }
            }

            console.warn('⚠️ No menu items returned from API');
            return [];
        } catch (error) {
            console.error('❌ Error fetching menu items from database:', error);
            return [];
        }
    },

    /**
     * Load users
     */
    async loadUsers() {
        try {
            const response = await fetch('/api/users', {
                credentials: 'include'
            });
            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error('❌ Error loading users:', error);
            return [];
        }
    },

    /**
     * Load roles
     */
    async loadRoles() {
        try {
            const response = await fetch('/api/roles', {
                credentials: 'include'
            });
            const data = await response.json();
            return data.roles || [];
        } catch (error) {
            console.error('❌ Error loading roles:', error);
            return [];
        }
    },

    /**
     * Load header titles
     */
    async loadHeaderTitles() {
        try {
            const response = await fetch('/api/header-titles');
            const data = await response.json();

            if (data.success && data.titles) {
                return data.titles;
            }
            return {};
        } catch (error) {
            console.error('Error loading header titles:', error);
            return {};
        }
    },

    /**
     * Load locations
     */
    async loadLocations() {
        try {
            const response = await fetch('/api/locations', {
                credentials: 'include'
            });
            const data = await response.json();
            return data.locations || [];
        } catch (error) {
            console.error('❌ Error loading locations:', error);
            return [];
        }
    }
};

// Export for use in other modules
window.DataLoaders = DataLoaders;
