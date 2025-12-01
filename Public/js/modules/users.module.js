// ============================================
// USER MANAGEMENT PAGE MODULE - CLEAN VERSION
// Author: itqatarfoam-hub 
// Date: 2025-11-29
// ============================================

const usersPageModule = {
  render(app) {
    const totalUsers = app.users?.length || 0;
    const adminCount = app.users?.filter(u => u.role === 'admin').length || 0;
    const managerCount = app.users?.filter(u => u.role === 'manager').length || 0;
    const userCount = app.users?.filter(u => u.role === 'user').length || 0;

    return `
      <!-- Stats Cards -->
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <p class="stat-label">Total Users</p>
          <p class="stat-value">${totalUsers}</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
          <p class="stat-label">Administrators</p>
          <p class="stat-value">${adminCount}</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
          <p class="stat-label">Managers</p>
          <p class="stat-value">${managerCount}</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
          <p class="stat-label">Regular Users</p>
          <p class="stat-value">${userCount}</p>
        </div>
      </div>

      <!-- Main Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- User Management -->
        <div class="card">
          <h2>👥 User Management</h2>
          <p style="margin-bottom: 16px; color: #6b7280;">Create and manage user accounts</p>
          <button type="button" id="addUserBtn" class="btn-primary">➕ Add User</button>
          <div style="margin-top: 20px;">
            <h4>All Users (<span id="userCount">${totalUsers}</span>)</h4>
            <div id="usersListContainer" style="max-height: 500px; overflow-y: auto;">
              <p style="text-align: center; padding: 20px;">Loading users...</p>
            </div>
          </div>
        </div>

        <!-- Role Management -->
        <div class="card">
          <h2>🔐 Role Management</h2>
          <p style="margin-bottom: 16px; color: #6b7280;">Define roles and permissions</p>
          <button type="button" id="createRoleBtn" class="btn-primary">➕ Create Role</button>
          <div style="margin-top: 20px;">
            <h4>Available Roles (<span id="roleCount">0</span>)</h4>
            <div id="rolesListContainer" style="max-height: 500px; overflow-y: auto;">
              <p style="text-align: center; padding: 20px;">Loading roles...</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  attachListeners(app) {
    this.loadUsers(app);
    this.loadRoles(app);

    setTimeout(() => {
      const addUserBtn = document.getElementById('addUserBtn');
      if (addUserBtn) {
        addUserBtn.addEventListener('click', () => app.openAddUser());
      }

      const createRoleBtn = document.getElementById('createRoleBtn');
      if (createRoleBtn) {
        createRoleBtn.addEventListener('click', () => app.openCreateRoleModal());
      }
    }, 100);
  },

  async loadUsers(app) {
    const container = document.getElementById('usersListContainer');
    const countDisplay = document.getElementById('userCount');
    if (!container) return;

    try {
      await app.loadUsers();

      if (countDisplay) {
        countDisplay.textContent = app.users?.length || 0;
      }

      if (!app.users || app.users.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #6b7280;">No users found</p>';
        return;
      }

      const html = app.users.map((user, index) => `
        <div class="list-item">
          <div>
            <h3>${index + 1}. ${app.escapeHtml(user.full_name)}</h3>
            <p>@${app.escapeHtml(user.username)} • ${app.escapeHtml(user.role)}</p>
          </div>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn-small btn-edit" onclick="window.app.openEditUser('${user.id}')">✏️</button>
            <button type="button" class="btn-small btn-delete" onclick="window.app.deleteUserConfirm('${user.id}', '${app.escapeHtml(user.username).replace(/'/g, "\\'")}')">🗑️</button>
          </div>
        </div>
      `).join('');

      container.innerHTML = html;
    } catch (error) {
      console.error('Error loading users:', error);
      container.innerHTML = '<p style="text-align: center; padding: 40px; color: #ef4444;">Failed to load users</p>';
    }
  },

  async loadRoles(app) {
    const container = document.getElementById('rolesListContainer');
    const countDisplay = document.getElementById('roleCount');
    if (!container) return;

    try {
      await app.loadRoles();

      if (countDisplay) {
        countDisplay.textContent = app.roles?.length || 0;
      }

      if (!app.roles || app.roles.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #6b7280;">No roles found</p>';
        return;
      }

      const html = app.roles.map(role => {
        const isSystem = role.is_system === 1;
        return `
          <div class="list-item" style="background: ${isSystem ? '#f9fafb' : 'white'};">
            <div>
              <h3>${app.escapeHtml(role.display_name)} ${isSystem ? '<span class="badge">SYSTEM</span>' : '<span class="badge badge-warning">CUSTOM</span>'}</h3>
            </div>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-small btn-edit" onclick="window.app.openEditRoleModal('${role.id}')">✏️ Edit</button>
              ${!isSystem ? `<button type="button" class="btn-small btn-delete" onclick="window.app.deleteRoleConfirm('${role.id}', '${app.escapeHtml(role.display_name).replace(/'/g, "\\'")}')">🗑️</button>` : ''}
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = html;
    } catch (error) {
      console.error('Error loading roles:', error);
      container.innerHTML = '<p style="text-align: center; padding: 40px; color: #ef4444;">Failed to load roles</p>';
    }
  }
};

window.usersPageModule = usersPageModule;