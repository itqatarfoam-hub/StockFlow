// ============================================
// DASHBOARD MODULE - Enhanced from app.js
// Author: itqatarfoam-hub
// Date: 2025-11-23 05:08:18 UTC
// ============================================

const dashboardModule = {
  render() {
    return `
      <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1f2937;">Overview</h2>
        <p style="color: #6b7280; margin: 0 0 24px 0;">Welcome to StockFlow Dashboard. Manage your inventory here.</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 12px;">
            <div style="font-size: 12px; opacity: 0.9;">Total Products</div>
            <div style="font-size: 32px; font-weight: 700; margin-top: 8px;" id="dashboardTotalProducts">0</div>
          </div>
          <div style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 20px; border-radius: 12px;">
            <div style="font-size: 12px; opacity: 0.9;">Total Categories</div>
            <div style="font-size: 32px; font-weight: 700; margin-top: 8px;" id="dashboardTotalCategories">0</div>
          </div>
          <div style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 20px; border-radius: 12px;">
            <div style="font-size: 12px; opacity: 0.9;">Total Stock</div>
            <div style="font-size: 32px; font-weight: 700; margin-top: 8px;" id="dashboardTotalStock">0</div>
          </div>
        </div>

        <div style="margin-top: 24px; padding: 20px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1f2937;">📊 Inventory Summary</h3>
          <div id="inventorySummary">
            <p style="color: #6b7280;">Loading inventory summary...</p>
          </div>
        </div>
      </div>
    `;
  },

  attachListeners(app) {
    console.log('🔗 Dashboard: Attaching listeners...');
    this.loadStats(app);
  },

  async loadStats(app) {
    try {
      await app.loadInitialData();

      // Update dashboard counters
      const totalProducts = document.getElementById('dashboardTotalProducts');
      const totalCategories = document.getElementById('dashboardTotalCategories');
      const totalStock = document.getElementById('dashboardTotalStock');

      if (totalProducts) totalProducts.textContent = app.products.length;
      if (totalCategories) totalCategories.textContent = app.categories.length;
      if (totalStock) totalStock.textContent = app.products.reduce((sum, p) => sum + p.stock, 0);

      // Update inventory summary
      const summaryDiv = document.getElementById('inventorySummary');
      if (summaryDiv && app.products.length > 0) {
        const totalStockUnits = app.products.reduce((sum, p) => sum + p.stock, 0);
        const totalValue = app.products.reduce((sum, p) => sum + (p.stock * p.unit_price), 0);
        const lowStock = app.products.filter(p => p.stock < 20).length;

        summaryDiv.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
            <div style="padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">Total Stock Units</p>
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">${totalStockUnits}</p>
            </div>
            <div style="padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">Inventory Value</p>
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">$${totalValue.toFixed(2)}</p>
            </div>
            <div style="padding: 16px; background: white; border-radius: 8px; border-left: 4px solid ${lowStock > 0 ? '#ef4444' : '#10b981'};">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">Low Stock Items</p>
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${lowStock > 0 ? '#ef4444' : '#10b981'};">${lowStock}</p>
            </div>
          </div>
          <div style="margin-top: 16px; padding: 16px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              ✅ System running smoothly | Last updated: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC
            </p>
          </div>
        `;
      } else if (summaryDiv) {
        summaryDiv.innerHTML = '<p style="color: #6b7280;">No inventory data available. Start by adding products.</p>';
      }
    } catch (error) {
      console.error('❌ Dashboard: Failed to load stats:', error);
    }
  }
};

window.dashboardModule = dashboardModule;