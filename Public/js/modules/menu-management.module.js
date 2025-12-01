// ============================================
// MENU MANAGEMENT MODULE
// Handles custom menu items and pages
// ============================================

const menuManagementModule = {

  async openMenuManagementModal() {
    await this.createMenuManagementModal();
    await this.loadMenuItems();
    document.getElementById('menuManagementModal').style.display = 'flex';
  },

  async createMenuManagementModal() {
    const existingModal = document.getElementById('menuManagementModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modalHTML = `
      <div id="menuManagementModal" class="modal">
        <div class="modal-content" style="max-width: 900px;">
          <div class="modal-header">
            <h2>📋 Menu Management</h2>
          </div>
          <div class="modal-body">
            <div class="card-actions" style="margin-bottom: 20px; display: flex; gap: 10px;">
              <button class="btn-primary" style="width: auto;" onclick="menuManagementModule.openAddMenuItemModal()">
                ➕ Add New Menu Item
              </button>
              <button class="btn-secondary" style="width: auto;" onclick="document.getElementById('menuManagementModal').style.display='none'">
                ✖ Close
              </button>
            </div>
            
            <div class="table-container" style="max-height: 500px; overflow-y: auto;">
              <table class="modern-table">
                <thead style="position: sticky; top: 0; background: white; z-index: 1;">
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Route</th>
                    <th>Permission</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody id="menuItemsTableBody">
                  <tr>
                    <td colspan="7" style="text-align: center; padding: 40px;">Loading...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async loadMenuItems() {
    try {
      const response = await fetch('/api/menu-items');
      const data = await response.json();

      if (data.success) {
        this.renderMenuItemsTable(data.menuItems || []);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  },

  renderMenuItemsTable(menuItems) {
    const tbody = document.getElementById('menuItemsTableBody');
    if (!tbody) return;

    if (menuItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: #9ca3af;">
            No menu items found
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = menuItems.map(item => {
      const isDefault = item.id <= 7;
      const statusColor = item.is_active
        ? 'background: #dcfce7; color: #166534; border: 1px solid #86efac;'
        : 'background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;';

      return `
        <tr>
          <td style="font-size: 24px;">${item.icon}</td>
          <td>${item.name}</td>
          <td><code>${item.route}</code></td>
          <td><span class="role-badge">${item.permission}</span></td>
          <td>${item.display_order}</td>
          <td>
            <span 
              class="status-badge" 
              style="cursor: pointer; ${statusColor} padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;" 
              onclick="menuManagementModule.toggleMenuStatus(${item.id}, ${item.is_active ? 0 : 1})"
              title="Click to ${item.is_active ? 'hide' : 'show'} in menu"
            >
              ${item.is_active ? 'Visible' : 'Hidden'}
            </span>
          </td>
          <td class="text-right">
            <button class="btn-icon" onclick="menuManagementModule.editMenuItem(${item.id})" title="Edit">
              ✏️
            </button>
            ${!isDefault ? `
              <button class="btn-icon btn-danger" onclick="menuManagementModule.deleteMenuItem(${item.id})" title="Delete">
                🗑️
              </button>
            ` : '<span style="color: #9ca3af; font-size: 12px; margin-left: 8px;">System</span>'}
          </td>
        </tr>
      `;
    }).join('');
  },

  async toggleMenuStatus(id, newStatus) {
    try {
      const response = await fetch(`/api/menu-items`);
      const data = await response.json();
      const item = data.menuItems.find(m => m.id === id);

      if (!item) return;

      // Update directly without confirmation dialog
      const updateResponse = await fetch(`/api/menu-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          icon: item.icon,
          route: item.route,
          permission: item.permission,
          displayOrder: item.display_order,
          isActive: newStatus
        })
      });

      const updateData = await updateResponse.json();

      if (updateData.success) {
        await this.loadMenuItems();
        const statusText = newStatus === 1 ? 'visible' : 'hidden';
        window.app.showConfirm('Success', `"${item.name}" is now ${statusText}!`);
      } else {
        window.app.showConfirm('Error', `Failed to update: ${updateData.error}`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      window.app.showConfirm('Error', 'An error occurred');
    }
  },

  openAddMenuItemModal() {
    const modalHTML = `
      <div id="addMenuItemModal" class="modal" style="display: flex;">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h2>➕ Add New Menu Item</h2>
            <button class="btn-secondary" style="width: auto;" onclick="document.getElementById('addMenuItemModal').remove()">✖ Close</button>
          </div>
          <div class="modal-body">
            <form id="addMenuItemForm" onsubmit="event.preventDefault(); menuManagementModule.saveMenuItem();">
              <div class="form-group">
                <label class="form-label">Menu Name *</label>
                <input type="text" id="menuItemName" class="form-input" required placeholder="e.g., Reports">
              </div>

              <div class="form-group">
                <label class="form-label">Icon (Emoji)</label>
                <input type="text" id="menuItemIcon" class="form-input" placeholder="📊" value="📄" maxlength="10">
              </div>

              <div class="form-group">
                <label class="form-label">Route *</label>
                <input type="text" id="menuItemRoute" class="form-input" required placeholder="e.g., reports">
                <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                  Lowercase, no spaces. This will be the URL route.
                </p>
              </div>

              <div class="form-group">
                <label class="form-label">Permission *</label>
                <input type="text" id="menuItemPermission" class="form-input" required placeholder="e.g., reports">
                <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                  This permission must exist in role configurations.
                </p>
              </div>

              <div class="form-group">
                <label class="form-label">Display Order</label>
                <input type="number" id="menuItemOrder" class="form-input" value="99" min="1">
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="document.getElementById('addMenuItemModal').remove()">
                  Cancel
                </button>
                <button type="submit" class="btn-primary">
                  💾 Create Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async saveMenuItem() {
    const name = document.getElementById('menuItemName').value.trim();
    const icon = document.getElementById('menuItemIcon').value.trim() || '📄';
    const route = document.getElementById('menuItemRoute').value.trim().toLowerCase();
    const permission = document.getElementById('menuItemPermission').value.trim().toLowerCase();
    const displayOrder = parseInt(document.getElementById('menuItemOrder').value) || 99;

    if (!name || !route || !permission) {
      window.app.showConfirm('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          icon,
          route,
          permission,
          displayOrder
        })
      });

      const data = await response.json();

      if (data.success) {
        window.app.showConfirm('Success', 'Menu item created successfully!\\n\\nPlease reload the page to see the new menu item.');
        document.getElementById('addMenuItemModal').remove();
        await this.loadMenuItems();
      } else {
        window.app.showConfirm('Error', `Failed to create menu item: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      window.app.showConfirm('Error', 'An error occurred while saving the menu item');
    }
  },

  async deleteMenuItem(id) {
    const confirmed = confirm('Are you sure you want to delete this menu item?\\n\\nThis will remove it from all user menus and delete the associated page.');

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/menu-items/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        window.app.showConfirm('Success', 'Menu item deleted successfully!\\n\\nPlease reload the page to see the changes.');
        await this.loadMenuItems();
      } else {
        window.app.showConfirm('Error', `Failed to delete: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      window.app.showConfirm('Error', 'An error occurred while deleting the menu item');
    }
  },

  async editMenuItem(id) {
    try {
      const response = await fetch(`/api/menu-items`);
      const data = await response.json();
      const item = data.menuItems.find(m => m.id === id);

      if (!item) {
        window.app.showConfirm('Error', 'Menu item not found');
        return;
      }

      const modalHTML = `
        <div id="editMenuItemModal" class="modal" style="display: flex;">
          <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
              <h2>✏️ Edit Menu Item</h2>
              <button class="btn-secondary" style="width: auto;" onclick="document.getElementById('editMenuItemModal').remove()">✖ Close</button>
            </div>
            <div class="modal-body">
              <form id="editMenuItemForm" onsubmit="event.preventDefault(); menuManagementModule.updateMenuItem(${id});">
                <div class="form-group">
                  <label class="form-label">Menu Name *</label>
                  <input type="text" id="editMenuItemName" class="form-input" required value="${item.name}">
                </div>

                <div class="form-group">
                  <label class="form-label">Icon (Emoji)</label>
                  <input type="text" id="editMenuItemIcon" class="form-input" value="${item.icon}" maxlength="10">
                </div>

                <div class="form-group">
                  <label class="form-label">Route *</label>
                  <input type="text" id="editMenuItemRoute" class="form-input" required value="${item.route}" ${id <= 7 ? 'readonly' : ''}>
                  <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                    ${id <= 7 ? 'Route cannot be changed for system menu items' : 'Lowercase, no spaces'}
                  </p>
                </div>

                <div class="form-group">
                  <label class="form-label">Permission *</label>
                  <input type="text" id="editMenuItemPermission" class="form-input" required value="${item.permission}" ${id <= 7 ? 'readonly' : ''}>
                  <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                    ${id <= 7 ? 'Permission cannot be changed for system menu items' : 'Must exist in role configurations'}
                  </p>
                </div>

                <div class="form-group">
                  <label class="form-label">Display Order</label>
                  <input type="number" id="editMenuItemOrder" class="form-input" value="${item.display_order}" min="1">
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn-secondary" onclick="document.getElementById('editMenuItemModal').remove()">
                    Cancel
                  </button>
                  <button type="submit" class="btn-primary">
                    💾 Update Menu Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
      console.error('Error loading menu item:', error);
      window.app.showConfirm('Error', 'Failed to load menu item');
    }
  },

  async updateMenuItem(id) {
    const name = document.getElementById('editMenuItemName').value.trim();
    const icon = document.getElementById('editMenuItemIcon').value.trim() || ' 📄';
    const route = document.getElementById('editMenuItemRoute').value.trim().toLowerCase();
    const permission = document.getElementById('editMenuItemPermission').value.trim().toLowerCase();
    const displayOrder = parseInt(document.getElementById('editMenuItemOrder').value) || 99;

    if (!name || !route || !permission) {
      window.app.showConfirm('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/menu-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          icon,
          route,
          permission,
          displayOrder,
          isActive: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        window.app.showConfirm('Success', 'Menu item updated successfully!\\n\\nPlease reload the page to see changes.');
        document.getElementById('editMenuItemModal').remove();
        await this.loadMenuItems();
      } else {
        window.app.showConfirm('Error', `Failed to update: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      window.app.showConfirm('Error', 'An error occurred while updating');
    }
  }
};

// Make it globally available
window.menuManagementModule = menuManagementModule;
