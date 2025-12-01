// ============================================
// ENHANCED MANAGER DASHBOARD MODULE
// With CRM Integration & Team Management
// Updated: 2025-11-29
// ============================================

const managerDashboardModule = {
  render() {
    return `
      <div class="manager-dashboard">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">📊 Manager Dashboard</h1>
            <p class="page-subtitle">Operational oversight, team performance, and CRM management</p>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" onclick="window.app.navigateTo('crm-approvals')">⏳ Pending Approvals</button>
            <button class="btn-primary" onclick="window.app.navigateTo('crm')">🎯 CRM Dashboard</button>
          </div>
        </div>

        <!-- KPI Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 30px;">
          ${this.renderKPICards()}
        </div>

        <!-- CRM & Inventory Overview Row -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
          <!-- CRM Management -->
          <div class="dashboard-card" style="border-left: 4px solid #f59e0b;">
            <div class="card-header" style="background: #fef3c7;">
              <h3>🎯 CRM Management</h3>
              <a href="#" onclick="window.app.navigateTo('crm'); return false;" class="btn-secondary btn-sm">Open CRM</a>
            </div>
            <div class="card-body">
              <div id="crmManagementStats" style="min-height: 200px;">
                <div style="text-align: center; padding: 40px; color: #9ca3af;">
                  <p>Loading CRM data...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Inventory Overview -->
          <div class="dashboard-card" style="border-left: 4px solid #3b82f6;">
            <div class="card-header" style="background: #dbeafe;">
              <h3>📦 Inventory Overview</h3>
            </div>
            <div class="card-body">
              <div id="inventorySummary" style="min-height: 200px;">
                <div style="text-align: center; padding: 40px; color: #9ca3af;">
                  <p>Loading inventory data...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Performance & Quick Actions -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px;">
          <!-- Team Performance -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>👥 Team Performance</h3>
            </div>
            <div class="card-body">
              <div id="teamPerformance">
                <div style="text-align: center; padding: 40px; color: #9ca3af;">
                  <p>Team performance metrics will appear here</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="dashboard-card" style="border-left: 4px solid #10b981;">
            <div class="card-header" style="background: #d1fae5;">
              <h3>⚡ Quick Actions</h3>
            </div>
            <div class="card-body">
              ${this.renderQuickActions()}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderKPICards() {
    const kpis = [
      { icon: '📦', label: 'Total Products', value: '0', id: 'totalProducts', color: '#667eea' },
      { icon: '💰', label: 'Total Sales', value: '0', id: 'totalSales', color: '#f5576c' },
      { icon: '📊', label: 'Total Stock', value: '0', id: 'totalStock', color: '#4facfe' },
      { icon: '👥', label: 'Customers', value: '0', id: 'totalCustomers', color: '#43e97b' },
      { icon: '🏢', label: 'CRM Companies', value: '0', id: 'crmCompanies', color: '#3b82f6' },
      { icon: '⏳', label: 'Pending Approvals', value: '0', id: 'pendingApprovals', color: '#f59e0b' },
      { icon: '🎯', label: 'Active Leads', value: '0', id: 'activeLeads', color: '#10b981' },
      { icon: '📄', label: 'Quotations', value: '0', id: 'quotations', color: '#8b5cf6' }
    ];

    return kpis.map(kpi => `
      <div class="stat-card" style="background: linear-gradient(135deg, ${kpi.color}15, ${kpi.color}05); border-left: 4px solid ${kpi.color};">
        <div class="stat-icon" style="font-size: 28px;">${kpi.icon}</div>
        <div class="stat-details">
          <div class="stat-label">${kpi.label}</div>
          <div class="stat-value" id="dashboard${kpi.id}" style="color: ${kpi.color};">${kpi.value}</div>
        </div>
      </div>
    `).join('');
  },

  renderQuickActions() {
    return `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="window.app.navigateTo('crm-approvals')">
          ⏳ Review Approvals
        </button>
        <button class="btn-secondary" style="width: 100%; justify-content: center;" onclick="window.app.navigateTo('crm')">
          🎯 Open CRM
        </button>
        <button class="btn-secondary" style="width: 100%; justify-content: center;" onclick="window.app.navigateTo('products')">
          📦 Manage Inventory
        </button>
        <button class="btn-secondary" style="width: 100%; justify-content: center;" onclick="window.app.navigateTo('users')">
          👥 Manage Team
        </button>
        <button class="btn-secondary" style="width: 100%; justify-content: center;" onclick="window.app.navigateTo('settings')">
          ⚙️ System Settings
        </button>
      </div>
    `;
  },

  attachListeners(app) {
    console.log('🔗 Manager Dashboard: Attaching listeners...');
    this.loadStats(app);
    this.loadCRMStats();
  },

  async loadStats(app) {
    try {
      // Load initial data
      if (app && typeof app.loadInitialData === 'function') {
        await app.loadInitialData();
      }

      // Update basic stats
      const totalProducts = document.getElementById('dashboardtotalProducts');
      const totalStock = document.getElementById('dashboardtotalStock');
      const totalCustomers = document.getElementById('dashboardtotalCustomers');

      if (totalProducts && app && app.products) {
        totalProducts.textContent = app.products.length;
      }

      if (totalStock && app && app.products) {
        const stockCount = app.products.reduce((sum, p) => sum + (p.stock || 0), 0);
        totalStock.textContent = stockCount;
      }

      if (totalCustomers && app && app.customers) {
        totalCustomers.textContent = app.customers.length;
      }

      // Load sales data
      try {
        const salesRes = await fetch('/api/sales', { credentials: 'same-origin' });
        const salesData = await salesRes.json();
        const totalSales = document.getElementById('dashboardtotalSales');
        if (totalSales) {
          totalSales.textContent = salesData.sales?.length || 0;
        }
      } catch (e) {
        console.error('Error loading sales:', e);
      }

      // Render inventory summary
      this.renderInventorySummary(app);

    } catch (error) {
      console.error('❌ Manager Dashboard: Failed to load stats:', error);
    }
  },

  async loadCRMStats() {
    try {
      const response = await fetch('/api/crm/dashboard/stats', {
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to load CRM stats');
      }

      const data = await response.json();

      if (data.success && data.stats) {
        // Update CRM KPIs
        const crmCompanies = document.getElementById('dashboardcrmCompanies');
        const pendingApprovals = document.getElementById('dashboardpendingApprovals');
        const activeLeads = document.getElementById('dashboardactiveLeads');
        const quotations = document.getElementById('dashboardquotations');

        if (crmCompanies) crmCompanies.textContent = data.stats.totalCompanies || 0;
        if (pendingApprovals) pendingApprovals.textContent = data.stats.pendingApprovals || 0;
        if (activeLeads) activeLeads.textContent = data.stats.activeLeads || 0;
        if (quotations) quotations.textContent = data.stats.quotations || 0;

        // Render CRM management stats
        this.renderCRMManagementStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading CRM stats:', error);
    }
  },

  renderInventorySummary(app) {
    const summaryDiv = document.getElementById('inventorySummary');
    if (!summaryDiv) return;

    if (!app || !app.products || app.products.length === 0) {
      summaryDiv.innerHTML = '<p style="color: #9ca3af; text-align: center;">No inventory data available</p>';
      return;
    }

    const totalStockUnits = app.products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = app.products.reduce((sum, p) => sum + ((p.stock || 0) * (p.unit_price || 0)), 0);
    const lowStock = app.products.filter(p => (p.stock || 0) < 20).length;

    summaryDiv.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea;">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Total Stock Units</p>
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #667eea;">${totalStockUnits.toLocaleString()}</p>
        </div>
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #10b981;">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Inventory Value</p>
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #10b981;">$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid ${lowStock > 0 ? '#ef4444' : '#10b981'};">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Low Stock Items</p>
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: ${lowStock > 0 ? '#ef4444' : '#10b981'};">${lowStock}</p>
          ${lowStock > 0 ? '<p style="margin: 8px 0 0 0; font-size: 12px; color: #ef4444;">⚠️ Attention required</p>' : ''}
        </div>
      </div>
    `;
  },

  renderCRMManagementStats(stats) {
    const container = document.getElementById('crmManagementStats');
    if (!container) return;

    const needsAttention = stats.pendingApprovals > 0;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${needsAttention ? `
          <div style="padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 13px; color: #92400e; font-weight: 600;">⚠️ NEEDS ATTENTION</span>
              <span style="font-size: 24px; font-weight: 700; color: #f59e0b;">${stats.pendingApprovals}</span>
            </div>
            <p style="margin: 0; font-size: 12px; color: #92400e;">Pending company approvals</p>
            <a href="#" onclick="window.app.navigateTo('crm-approvals'); return false;" 
               style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #f59e0b; color: white; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 600;">
              Review Now →
            </a>
          </div>
        ` : ''}
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Total Companies</span>
            <span style="font-size: 24px; font-weight: 700; color: #3b82f6;">${stats.totalCompanies || 0}</span>
          </div>
        </div>

        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Active Leads</span>
            <span style="font-size: 24px; font-weight: 700; color: #10b981;">${stats.activeLeads || 0}</span>
          </div>
        </div>

        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #8b5cf6;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Quotations</span>
            <span style="font-size: 24px; font-weight: 700; color: #8b5cf6;">${stats.quotations || 0}</span>
          </div>
        </div>

        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #ef4444;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Outstanding Payments</span>
            <span style="font-size: 20px; font-weight: 700; color: #ef4444;">$${(stats.outstandingPayments || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  }
};

window.managerDashboardModule = managerDashboardModule;
