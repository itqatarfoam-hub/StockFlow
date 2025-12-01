// ====================================================
// STOCKFLOW - SALES RENDERS
// Sales and invoice management screens
// ====================================================

const SalesRenders = {

    /**
     * Sales page (uses module)
     */
    renderSalesPage() {
        return window.salesPageModule
            ? salesPageModule.render(window.app)
            : this.renderSalesPageFallback();
    },

    /**
     * Fallback sales page
     */
    renderSalesPageFallback() {
        return `
      <div class="sales-container">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="margin: 0 0 8px 0;">🛒 Sales</h1>
            <p style="margin: 0; color: #6b7280;">Process and manage sales orders</p>
          </div>
          <button onclick="app.createNewSale()" 
                  style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            ➕ New Sale
          </button>
        </div>
        
        <!-- Sales Stats -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div class="card" style="padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #10b981; margin-bottom: 8px;">$0</div>
            <div style="font-size: 14px; color: #6b7280;">Today's Sales</div>
          </div>
          <div class="card" style="padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #3b82f6; margin-bottom: 8px;">0</div>
            <div style="font-size: 14px; color: #6b7280;">Orders Today</div>
          </div>
          <div class="card" style="padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #f59e0b; margin-bottom: 8px;">$0</div>
            <div style="font-size: 14px; color: #6b7280;">This Month</div>
          </div>
        </div>
        
        <!-- Filters -->
        <div class="card" style="padding: 20px; margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 16px;">
            <input type="text" id="salesSearch" placeholder="🔍 Search sales..." 
                   style="padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
            <input type="date" id="salesStartDate" 
                   style="padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
            <input type="date" id="salesEndDate" 
                   style="padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
            <button onclick="app.refreshSales()" 
                    style="padding: 12px 24px; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer;">
              🔄 Refresh
            </button>
          </div>
        </div>
        
        <!-- Sales List -->
        <div id="salesList" class="card" style="padding: 20px;">
          <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">🛒</div>
            <p style="color: #6b7280;">Loading sales...</p>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Sale row
     */
    renderSaleRow(sale) {
        return `
      <tr style="border-bottom: 1px solid #e5e7eb; cursor: pointer;" 
          onclick="app.viewSale(${sale.id})"
          onmouseover="this.style.backgroundColor='#f9fafb'"
          onmouseout="this.style.backgroundColor='white'">
        <td style="padding: 16px;">#${sale.id}</td>
        <td style="padding: 16px;">${sale.customer_name || 'Walk-in'}</td>
        <td style="padding: 16px;">${new Date(sale.sale_date).toLocaleDateString()}</td>
        <td style="padding: 16px; font-weight: 700; color: #10b981;">$${parseFloat(sale.total_amount || 0).toFixed(2)}</td>
        <td style="padding: 16px;">
          <span style="padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 12px; font-size: 12px; font-weight: 600;">
            ${sale.status || 'Completed'}
          </span>
        </td>
        <td style="padding: 16px;">
          <div style="display: flex; gap: 8px;">
            <button onclick="event.stopPropagation(); app.viewSale(${sale.id})" 
                    style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">
              View
            </button>
            <button onclick="event.stopPropagation(); app.printInvoice(${sale.id})" 
                    style="padding: 6px 12px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">
              Print
            </button>
          </div>
        </td>
      </tr>
    `;
    }
};

// Export for global use
window.SalesRenders = SalesRenders;
