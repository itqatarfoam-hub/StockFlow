// ============================================
// ENHANCED SALES DASHBOARD MODULE
// With CRM Integration & Advanced Analytics
// Updated: 2025-11-29
// ============================================

const salesDashboardModule = {
  render() {
    return `
      <div class="sales-dashboard">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">💰 Sales Dashboard</h1>
            <p class="page-subtitle">Track sales performance, CRM leads, and revenue metrics</p>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" onclick="window.app.navigateTo('crm')">🎯 Open CRM</button>
            <button class="btn-primary" onclick="alert('Create new sale')">➕ New Sale</button>
          </div>
        </div>

        <!-- KPI Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
          ${this.renderKPICards()}
        </div>

        <!-- Sales & CRM Integration Row -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px;">
          <!-- Sales Summary -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>📊 Sales Summary</h3>
              <button class="btn-secondary btn-sm" onclick="salesDashboardModule.loadStats()">🔄 Refresh</button>
            </div>
            <div class="card-body">
              <div id="salesSummary" style="min-height: 200px;">
                <div style="text-align: center; padding: 40px; color: #9ca3af;">
                  <p>Loading sales summary...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- CRM Quick Stats -->
          <div class="dashboard-card" style="border-left: 4px solid #10b981;">
            <div class="card-header" style="background: #d1fae5;">
              <h3>🎯 CRM Pipeline</h3>
            </div>
            <div class="card-body">
              <div id="crmQuickStats" style="min-height: 200px;">
                <div style="text-align: center; padding: 40px; color: #9ca3af;">
                  <p>Loading CRM data...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Sales Table -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>📋 Recent Sales</h3>
            <a href="#" onclick="window.app.navigateTo('sales'); return false;" class="btn-secondary btn-sm">View All</a>
          </div>
          <div class="card-body" style="padding: 0;">
            <div id="recentSalesList">
              <div style="text-align: center; padding: 40px; color: #9ca3af;">
                <p>Loading recent sales...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderKPICards() {
    const kpis = [
      { icon: '💰', label: 'Total Sales', value: '0', id: 'totalSales', color: '#667eea' },
      { icon: '📅', label: "Today's Sales", value: '0', id: 'todaySales', color: '#f5576c' },
      { icon: '💵', label: 'Total Revenue', value: '$0', id: 'totalRevenue', color: '#4facfe' },
      { icon: '👥', label: 'Customers', value: '0', id: 'totalCustomers', color: '#43e97b' },
      { icon: '🎯', label: 'Active Leads', value: '0', id: 'activeLeads', color: '#10b981' },
      { icon: '📈', label: 'Avg Sale', value: '$0', id: 'avgSale', color: '#8b5cf6' }
    ];

    return kpis.map(kpi => `
      <div class="stat-card" style="background: linear-gradient(135deg, ${kpi.color}15, ${kpi.color}05); border-left: 4px solid ${kpi.color};">
        <div class="stat-icon" style="font-size: 32px;">${kpi.icon}</div>
        <div class="stat-details">
          <div class="stat-label">${kpi.label}</div>
          <div class="stat-value" id="dashboard${kpi.id}" style="color: ${kpi.color};">${kpi.value}</div>
        </div>
      </div>
    `).join('');
  },

  attachListeners(app) {
    console.log('🔗 Sales Dashboard: Attaching listeners...');
    this.loadStats(app);
    this.loadCRMStats();
  },

  async loadStats(app) {
    try {
      // Load initial data if needed
      if (app && typeof app.loadInitialData === 'function') {
        await app.loadInitialData();
      }

      // Update customers count
      const totalCustomers = document.getElementById('dashboardtotalCustomers');
      if (totalCustomers && app && app.customers) {
        totalCustomers.textContent = app.customers.length;
      }

      // Load sales data
      try {
        const salesRes = await fetch('/api/sales', { credentials: 'same-origin' });
        const salesData = await salesRes.json();
        const sales = salesData.sales || [];

        // Update Total Sales
        const totalSales = document.getElementById('dashboardtotalSales');
        if (totalSales) totalSales.textContent = sales.length;

        // Calculate today's sales
        const today = new Date().toISOString().split('T')[0];
        const todaySalesCount = sales.filter(s => s.date?.startsWith(today)).length;
        const todaySales = document.getElementById('dashboardtodaySales');
        if (todaySales) todaySales.textContent = todaySalesCount;

        // Calculate total revenue
        const revenue = sales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0);
        const totalRevenue = document.getElementById('dashboardtotalRevenue');
        if (totalRevenue) totalRevenue.textContent = `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Calculate average sale
        const avgSale = sales.length > 0 ? (revenue / sales.length) : 0;
        const avgSaleEl = document.getElementById('dashboardavgSale');
        if (avgSaleEl) avgSaleEl.textContent = `$${avgSale.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Update sales summary
        this.renderSalesSummary(sales, revenue, avgSale);

        // Update recent sales table
        this.renderRecentSales(sales.slice(0, 5));

      } catch (e) {
        console.error('Error loading sales data:', e);
      }
    } catch (error) {
      console.error('❌ Sales Dashboard: Failed to load stats:', error);
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
        // Update active leads KPI
        const activeLeads = document.getElementById('dashboardactiveLeads');
        if (activeLeads) {
          activeLeads.textContent = data.stats.activeLeads || 0;
        }

        // Render CRM quick stats
        this.renderCRMQuickStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading CRM stats:', error);
      document.getElementById('crmQuickStats').innerHTML = `
        <div style="text-align: center; padding: 20px; color: #9ca3af;">
          <p style="font-size: 14px;">CRM data unavailable</p>
        </div>
      `;
    }
  },

  renderSalesSummary(sales, revenue, avgSale) {
    const summaryDiv = document.getElementById('salesSummary');
    if (!summaryDiv) return;

    const today = new Date();
    const thisMonth = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
    });

    const thisMonthRevenue = thisMonth.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0);

    summaryDiv.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div style="padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea;">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Average Sale Value</p>
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #667eea;">$${avgSale.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">Across all sales</p>
        </div>
        <div style="padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #10b981;">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">This Month</p>
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #10b981;">${thisMonth.length} sales</p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">Revenue: $${thisMonthRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div style="padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">All-Time Revenue</p>
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #3b82f6;">$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">From ${sales.length} transactions</p>
        </div>
      </div>
    `;
  },

  renderCRMQuickStats(stats) {
    const container = document.getElementById('crmQuickStats');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="padding: 12px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #10b981;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Active Leads</span>
            <span style="font-size: 20px; font-weight: 700; color: #10b981;">${stats.activeLeads || 0}</span>
          </div>
        </div>
        <div style="padding: 12px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #3b82f6;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Companies</span>
            <span style="font-size: 20px; font-weight: 700; color: #3b82f6;">${stats.totalCompanies || 0}</span>
          </div>
        </div>
        <div style="padding: 12px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #f59e0b;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Quotations</span>
            <span style="font-size: 20px; font-weight: 700; color: #f59e0b;">${stats.quotations || 0}</span>
          </div>
        </div>
        <div style="padding: 12px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #ef4444;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Outstanding</span>
            <span style="font-size: 18px; font-weight: 700; color: #ef4444;">$${(stats.outstandingPayments || 0).toLocaleString()}</span>
          </div>
        </div>
        <a href="#" onclick="window.app.navigateTo('crm'); return false;" 
           style="display: block; text-align: center; padding: 12px; background: #10b981; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 8px;">
          🎯 Open Full CRM
        </a>
      </div>
    `;
  },

  renderRecentSales(sales) {
    const container = document.getElementById('recentSalesList');
    if (!container) return;

    if (!sales || sales.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #9ca3af;">
          <div style="font-size: 48px; margin-bottom: 10px;">📋</div>
          <p>No recent sales</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table class="modern-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Product</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${sales.map(sale => `
            <tr>
              <td>${new Date(sale.date).toLocaleDateString()}</td>
              <td>${sale.customer_name || 'N/A'}</td>
              <td>${sale.product_name || 'N/A'}</td>
              <td class="text-right">${sale.quantity || 0}</td>
              <td class="text-right" style="font-weight: 600; color: #10b981;">$${(parseFloat(sale.total_amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
};

window.salesDashboardModule = salesDashboardModule;
