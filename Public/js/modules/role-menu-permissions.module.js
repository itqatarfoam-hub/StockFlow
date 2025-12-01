// ============================================
// ROLE MENU PERMISSIONS MODULE
// Handles dynamic loading of menu permissions from database
// ============================================

const roleMenuPermissionsModule = {

    /**
     * Fetch active menu items from database
     */
    async fetchActiveMenuItems() {
        try {
            const response = await fetch('/api/menu-items', {
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (!data.success) {
                console.error('Failed to fetch menu items:', data.error);
                return [];
            }

            // Filter only active menu items and sort by display order
            const activeMenus = (data.menuItems || [])
                .filter(item => item.is_active === 1)
                .sort((a, b) => a.display_order - b.display_order);

            console.log('✅ Loaded active menu items:', activeMenus.length);
            return activeMenus;

        } catch (error) {
            console.error('❌ Error fetching menu items:', error);
            return [];
        }
    },

    /**
     * Render permission checkboxes HTML (compact version)
     */
    renderPermissionCheckboxes(menuItems, selectedPermissions = [], inputName = 'role_permissions') {
        if (!menuItems || menuItems.length === 0) {
            return '<p style="text-align: center; color: #9ca3af; padding: 20px;">No active menu items available</p>';
        }

        return menuItems.map(item => {
            const isChecked = selectedPermissions.includes(item.permission);

            return `
        <label style="display: flex; align-items: center; padding: 8px 12px; margin-bottom: 6px; border-radius: 6px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent;" onmouseover="this.style.background='#f3f4f6'; this.style.borderColor='#e5e7eb'" onmouseout="this.style.background='transparent'; this.style.borderColor='transparent'">
          <input type="checkbox" name="${inputName}" value="${item.permission}" ${isChecked ? 'checked' : ''} style="margin-right: 12px; width: 16px; height: 16px; cursor: pointer;">
          <span style="font-size: 18px; margin-right: 10px;">${item.icon}</span>
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: 600; font-size: 13px; color: #1f2937;">${this.escapeHtml(item.name)}</p>
            <p style="margin: 0; font-size: 11px; color: #9ca3af;">${item.route}</p>
          </div>
        </label>
      `;
        }).join('');
    },

    /**
     * Load permissions for Create Role modal
     */
    async loadCreateRolePermissions() {
        const container = document.getElementById('createRolePermissionsContainer');
        if (!container) {
            console.error('Create role permissions container not found');
            return;
        }

        // Show loading state
        container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Loading menu items...</p>';

        // Fetch and render active menu items
        const menuItems = await this.fetchActiveMenuItems();
        const html = this.renderPermissionCheckboxes(menuItems, [], 'role_permissions');

        container.innerHTML = html;
    },

    /**
     * Load permissions for Edit Role modal
     */
    async loadEditRolePermissions(rolePermissions = []) {
        const container = document.getElementById('editRolePermissionsContainer');
        if (!container) {
            console.error('Edit role permissions container not found');
            return;
        }

        // Show loading state
        container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Loading menu items...</p>';

        // Fetch and render active menu items with selected permissions
        const menuItems = await this.fetchActiveMenuItems();
        const html = this.renderPermissionCheckboxes(menuItems, rolePermissions, 'edit_role_permissions');

        container.innerHTML = html;
    },

    /**
     * Escape HTML to prevent XSS
     */
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
};

// Make it globally available
window.roleMenuPermissionsModule = roleMenuPermissionsModule;
