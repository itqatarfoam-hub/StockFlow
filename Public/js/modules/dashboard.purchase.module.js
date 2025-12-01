// ============================================
// PURCHASE DASHBOARD MODULE
// Author: itqatarfoam-hub
// Date: 2025-11-27 13:59:51 UTC
// ============================================

const purchaseDashboardModule = {
    render() {
        return `
      <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1f2937;">Purchase Dashboard</h2>
        <p style="color: #6b7280; margin: 0 0 24px 0;">Monitor purchasing activities and supplier relationships.</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 12px;">
            <div style="font-size: 12px; opacity: 0.9;">Total Products</div>
            <div style="font-size: 32px; font-weight: 700; margin-top: 8px;" id="dashboardTotalProducts">0</div>
          </div>
          <div style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 20px; border-radius: 12px;">
            <div style="font-size: 12px; opacity: 0.9;">Low Stock Items</div>
            <div style="font-size: 32px; font-weight: 700; margin-top: 8px;" id="dashboardLowStock">0</div>
          </div>
          <div style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 20px; border-radius: 12px;">
            <div style="font-size: 12px; opacity: 0.9;">Purchase Value</div>
            <div style="font-size: 32px; font-weight: 700; margin-top: 8px;" id="dashboardPurchaseValue">$0</div>
          </div>
        </div>

        <div style="margin-top: 24px; padding: 20px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1f2937;">📊 Purchase Summary</h3>
          <div id="purchaseSummary">
            <p style="color: #6b7280;">Loading purchase summary...</p>
          </div>
        </div>
      </div>
    `;
    },

    attachListeners(app) {
        console.log('🔗 Purchase Dashboard: Attaching listeners...');
        this.loadStats(app);
    },

    async loadStats(app) {
        try {
            await app.loadInitialData();

            const totalProducts = document.getElementById('dashboardTotalProducts');
            const lowStock = document.getElementById('dashboardLowStock');
            const purchaseValue = document.getElementById('dashboardPurchaseValue');

            if (totalProducts) totalProducts.textContent = app.products.length;

            const lowStockCount = app.products.filter(p => p.stock < 20).length;
            if (lowStock) lowStock.textContent = lowStockCount;

            const totalValue = app.products.reduce((sum, p) => sum + (p.stock * p.unit_price), 0);
            if (purchaseValue) purchaseValue.textContent = `$${totalValue.toFixed(2)}`;

            const summaryDiv = document.getElementById('purchaseSummary');
            if (summaryDiv && app.products.length > 0) {
                summaryDiv.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
            <div style="padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">Items Requiring Reorder</p>
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">${lowStockCount}</p>
            </div>
            <div style="padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">Total Categories</p>
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">${app.categories.length}</p>
            </div>
            <div style="padding: 16px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                💡 Monitor stock levels regularly to ensure timely reordering
              </p>
            </div>
          </div>
        `;
            } else if (summaryDiv) {
                summaryDiv.innerHTML = '<p style="color: #6b7280;">No data available.</p>';
            }
        } catch (error) {
            console.error('❌ Purchase Dashboard: Failed to load stats:', error);
        }
    }
};

window.purchaseDashboardModule = purchaseDashboardModule;
