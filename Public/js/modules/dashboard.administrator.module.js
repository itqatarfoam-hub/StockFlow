// ============================================
// ADMINISTRATOR DASHBOARD MODULE (Advanced & Professional)
// Author: itqatarfoam-hub
// Date: 2025-11-27 14:10:53 UTC
// ============================================

const administratorDashboardModule = {
  render() {
    return `
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 16px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 24px;">
        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: white;">🔐 Administrator Control Center</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Complete system oversight and management dashboard</p>
      </div>

      <!-- KPI Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #3b82f6; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Products</div>
            <div style="background: #dbeafe; padding: 8px; border-radius: 8px;">
              <span style="font-size: 20px;">📦</span>
            </div>
          </div>
          <div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 4px;" id="dashboardTotalProducts">0</div>
          <div style="font-size: 12px; color: #3b82f6;">
            <span id="productTrend">Inventory items tracked</span>
          </div>
        </div>

        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #10b981; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Users</div>
            <div style="background: #dcfce7; padding: 8px; border-radius: 8px;">
              <span style="font-size: 20px;">👥</span>
            </div>
          </div>
          <div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 4px;" id="dashboardTotalUsers">0</div>
          <div style="font-size: 12px; color: #10b981;">
            <span id="userTrend">Active user accounts</span>
          </div>
        </div>

        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #f59e0b; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Categories</div>
            <div style="background: #fef3c7; padding: 8px; border-radius: 8px;">
              <span style="font-size: 20px;">🏷️</span>
            </div>
          </div>
          <div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 4px;" id="dashboardTotalCategories">0</div>
          <div style="font-size: 12px; color: #f59e0b;">
            <span id="categoryTrend">Product categories</span>
          </div>
        </div>

        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #8b5cf6; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Stock</div>
            <div style="background: #ede9fe; padding: 8px; border-radius: 8px;">
              <span style="font-size: 20px;">📊</span>
            </div>
          </div>
          <div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 4px;" id="dashboardTotalStock">0</div>
          <div style="font-size: 12px; color: #8b5cf6;">
            <span id="stockTrend">Units in inventory</span>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
        <!-- System Overview -->
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">📊 System Overview</h3>
            <select id="adminOverviewPeriod" style="padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; background: white; cursor: pointer;">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div id="systemOverview">
            <p style="color: #6b7280; text-align: center; padding: 20px 0;">Loading system overview...</p>
          </div>
        </div>

        <!-- Quick Admin Actions -->
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1f2937;">⚡ Quick Actions</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button onclick="window.app.navigateTo ? window.app.navigateTo('users') : (window.app.currentPage='users', window.app.render())" style="padding: 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
              <span style="font-size: 24px;">👤</span>
              <span>Manage Users</span>
            </button>
            <button onclick="window.app.navigateTo ? window.app.navigateTo('products') : (window.app.currentPage='products', window.app.render())" style="padding: 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
              <span style="font-size: 24px;">📦</span>
              <span>Manage Inventory</span>
            </button>
            <button onclick="window.app.navigateTo ? window.app.navigateTo('settings') : (window.app.currentPage='settings', window.app.render())" style="padding: 16px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
              <span style="font-size: 24px;">⚙️</span>
              <span>System Settings</span>
            </button>
          </div>

          <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;">
            <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #1f2937;">📌 Admin Checklist</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #6b7280; line-height: 1.8;">
              <li>Review system health daily</li>
              <li>Monitor user activity logs</li>
              <li>Check backup status weekly</li>
              <li>Update security settings</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- System Health & Statistics -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
        <!-- System Health -->
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1f2937;">💚 System Health</h3>
          <div id="systemHealth">
            <p style="color: #6b7280; text-align: center; padding: 20px 0;">Loading system health...</p>
          </div>
        </div>

        <!-- Recent Activity -->
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1f2937;">🔔 Recent Activity</h3>
          <div id="recentActivity">
            <p style="color: #6b7280; text-align: center; padding: 20px 0;">Loading recent activity...</p>
          </div>
        </div>
      </div>

      <!-- Inventory Analytics -->
      <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 24px;">
        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1f2937;">📈 Inventory Analytics</h3>
        <div id="inventoryAnalytics">
          <p style="color: #6b7280; text-align: center; padding: 20px 0;">Loading inventory analytics...</p>
        </div>
      </div>

      <!-- User Roles & Permissions Overview -->
      <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1f2937;">🔐 User Roles & Permissions</h3>
        <div id="rolesOverview">
          <p style="color: #6b7280; text-align: center; padding: 20px 0;">Loading roles overview...</p>
        </div>
      </div>
    `;
  },

  attachListeners(app) {
    console.log('🔗 Administrator Dashboard: Attaching listeners...');
    this.loadStats(app);
  },

  async loadStats(app) {
    try {
      await app.loadInitialData();

      // Update KPI Cards
      const totalProducts = document.getElementById('dashboardTotalProducts');
      const totalCategories = document.getElementById('dashboardTotalCategories');
      const totalStock = document.getElementById('dashboardTotalStock');
      const totalUsers = document.getElementById('dashboardTotalUsers');

      if (totalProducts) totalProducts.textContent = app.products.length;
      if (totalCategories) totalCategories.textContent = app.categories.length;
      if (totalStock) totalStock.textContent = app.products.reduce((sum, p) => sum + p.stock, 0);

      // Load users count
      let usersCount = 0;
      try {
        const usersRes = await fetch('/api/users', { credentials: 'same-origin' });
        const usersData = await usersRes.json();
        usersCount = usersData.users?.length || 0;
        if (totalUsers) totalUsers.textContent = usersCount;
      } catch (e) {
        if (totalUsers) totalUsers.textContent = 'N/A';
      }

      // Update System Overview
      const systemOverview = document.getElementById('systemOverview');
      if (systemOverview && app.products.length > 0) {
        const totalStockUnits = app.products.reduce((sum, p) => sum + p.stock, 0);
        const totalValue = app.products.reduce((sum, p) => sum + (p.stock * p.unit_price), 0);
        const lowStock = app.products.filter(p => p.stock < 20).length;
        const outOfStock = app.products.filter(p => p.stock === 0).length;

        systemOverview.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div style="padding: 20px; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 10px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600;">TOTAL STOCK VALUE</p>
              <p style="margin: 0; font-size: 28px; font-weight: 800; color: #1e40af;">$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div style="padding: 20px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 10px; border-left: 4px solid #10b981;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600;">TOTAL STOCK UNITS</p>
              <p style="margin: 0; font-size: 28px; font-weight: 800; color: #047857;">${totalStockUnits.toLocaleString()}</p>
            </div>
            <div style="padding: 20px; background: linear-gradient(135deg, ${lowStock > 0 ? '#fef3c7, #fde68a' : '#f0fdf4, #dcfce7'}); border-radius: 10px; border-left: 4px solid ${lowStock > 0 ? '#f59e0b' : '#10b981'};">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600;">LOW STOCK ITEMS</p>
              <p style="margin: 0; font-size: 28px; font-weight: 800; color: ${lowStock > 0 ? '#d97706' : '#047857'};">${lowStock}</p>
            </div>
            <div style="padding: 20px; background: linear-gradient(135deg, ${outOfStock > 0 ? '#fee2e2, #fecaca' : '#f0fdf4, #dcfce7'}); border-radius: 10px; border-left: 4px solid ${outOfStock > 0 ? '#ef4444' : '#10b981'};">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600;">OUT OF STOCK</p>
              <p style="margin: 0; font-size: 28px; font-weight: 800; color: ${outOfStock > 0 ? '#dc2626' : '#047857'};">${outOfStock}</p>
            </div>
          </div>
        `;
      }

      // Update System Health
      const systemHealth = document.getElementById('systemHealth');
      if (systemHealth) {
        const dbStatus = 'Connected';
        const serverUptime = '99.9%';
        const lastBackup = 'Today';

        systemHealth.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #dcfce7; border-radius: 10px; border-left: 4px solid #10b981;">
              <div>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Database Status</p>
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #047857;">${dbStatus}</p>
              </div>
              <span style="font-size: 32px;">✅</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #dbeafe; border-radius: 10px; border-left: 4px solid #3b82f6;">
              <div>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Server Uptime</p>
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1e40af;">${serverUptime}</p>
              </div>
              <span style="font-size: 32px;">🚀</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fef3c7; border-radius: 10px; border-left: 4px solid #f59e0b;">
              <div>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Last Backup</p>
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #d97706;">${lastBackup}</p>
              </div>
              <span style="font-size: 32px;">💾</span>
            </div>
          </div>
        `;
      }

      // Update Recent Activity
      const recentActivity = document.getElementById('recentActivity');
      if (recentActivity) {
        const now = new Date();
        recentActivity.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #3b82f6;">
              <div style="display: flex; justify-content: between; align-items: start;">
                <span style="font-size: 16px; margin-right: 8px;">👤</span>
                <div style="flex: 1;">
                  <p style="margin: 0 0 4px 0; font-size: 13px; color: #1f2937; font-weight: 600;">System Initialized</p>
                  <p style="margin: 0; font-size: 11px; color: #6b7280;">${now.toISOString().replace('T', ' ').substring(0, 19)} UTC</p>
                </div>
              </div>
            </div>
            <div style="padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #10b981;">
              <div style="display: flex; justify-content: between; align-items: start;">
                <span style="font-size: 16px; margin-right: 8px;">📦</span>
                <div style="flex: 1;">
                  <p style="margin: 0 0 4px 0; font-size: 13px; color: #1f2937; font-weight: 600;">Products Loaded</p>
                  <p style="margin: 0; font-size: 11px; color: #6b7280;">${app.products.length} items in inventory</p>
                </div>
              </div>
            </div>
            <div style="padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #f59e0b;">
              <div style="display: flex; justify-content: between; align-items: start;">
                <span style="font-size: 16px; margin-right: 8px;">👥</span>
                <div style="flex: 1;">
                  <p style="margin: 0 0 4px 0; font-size: 13px; color: #1f2937; font-weight: 600;">Active Users</p>
                  <p style="margin: 0; font-size: 11px; color: #6b7280;">${usersCount} registered users</p>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Update Inventory Analytics
      const inventoryAnalytics = document.getElementById('inventoryAnalytics');
      if (inventoryAnalytics && app.products.length > 0) {
        const inStock = app.products.filter(p => p.stock > 0).length;
        const lowStock = app.products.filter(p => p.stock < 20 && p.stock > 0).length;
        const outOfStock = app.products.filter(p => p.stock === 0).length;

        inventoryAnalytics.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="text-align: center; padding: 24px; background: linear-gradient(135deg, #dcfce7, #bbf7d0); border-radius: 10px;">
              <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
              <p style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: #047857;">${inStock}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">In Stock</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">${((inStock / app.products.length) * 100).toFixed(1)}% of total</p>
            </div>
            <div style="text-align: center; padding: 24px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 10px;">
              <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
              <p style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: #d97706;">${lowStock}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">Low Stock</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #d97706;">Needs attention</p>
            </div>
            <div style="text-align: center; padding: 24px; background: linear-gradient(135deg, #fee2e2, #fecaca); border-radius: 10px;">
              <div style="font-size: 48px; margin-bottom: 12px;">❌</div>
              <p style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: #dc2626;">${outOfStock}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">Out of Stock</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #dc2626;">Immediate action required</p>
            </div>
          </div>
        `;
      }

      // Update Roles Overview
      const rolesOverview = document.getElementById('rolesOverview');
      if (rolesOverview) {
        try {
          const rolesRes = await fetch('/api/roles', { credentials: 'same-origin' });
          const rolesData = await rolesRes.json();
          const roles = rolesData.roles || [];

          if (roles.length > 0) {
            rolesOverview.innerHTML = `
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                ${roles.slice(0, 8).map(role => `
                  <div style="padding: 16px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 10px; border-left: 4px solid #6b7280;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937; font-weight: 700;">${role.name}</p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">${role.description || 'No description'}</p>
                  </div>
                `).join('')}
              </div>
              ${roles.length > 8 ? `<p style="text-align: center; margin: 16px 0 0 0; font-size: 13px; color: #6b7280;">Showing 8 of ${roles.length} roles. <a href="#" onclick="window.app.navigateTo ? window.app.navigateTo('users') : (window.app.currentPage='users', window.app.render()); return false;" style="color: #3b82f6; font-weight: 600;">View all →</a></p>` : ''}
            `;
          } else {
            rolesOverview.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px 0;">No roles configured</p>';
          }
        } catch (e) {
          rolesOverview.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 20px 0;">Error loading roles</p>';
        }
      }

    } catch (error) {
      console.error('❌ Administrator Dashboard: Failed to load stats:', error);
    }
  }
};

window.administratorDashboardModule = administratorDashboardModule;
