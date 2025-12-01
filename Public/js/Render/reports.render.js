// ====================================================
// STOCKFLOW - REPORTS RENDERS
// Reports and analytics screens
// ====================================================

const ReportsRenders = {

    /**
     * Reports page
     */
    renderReportsPage() {
        return window.reportsPageModule
            ? reportsPageModule.render(window.app)
            : this.renderReportsPageFallback();
    },

    /**
     * Fallback reports page
     */
    renderReportsPageFallback() {
        return `
      <div class="reports-container">
        <div class="page-header" style="margin-bottom: 24px;">
          <h1 style="margin: 0 0 8px 0;">📊 Reports & Analytics</h1>
          <p style="margin: 0; color: #6b7280;">Business insights and performance metrics</p>
        </div>
        
        <!-- Report Types -->
        <div class="report-types" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px;">
          
          <div class="card" style="padding: 24px; cursor: pointer; transition: all 0.3s;"
               onclick="app.generateReport('sales')"
               onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
               onmouseout="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'">
            <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
            <h3 style="margin: 0 0 8px 0;">Sales Report</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Analyze sales performance and trends</p>
          </div>
          
          <div class="card" style="padding: 24px; cursor: pointer; transition: all 0.3s;"
               onclick="app.generateReport('inventory')"
               onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
               onmouseout="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'">
            <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
            <h3 style="margin: 0 0 8px 0;">Inventory Report</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Stock levels and inventory valuation</p>
          </div>
          
          <div class="card" style="padding: 24px; cursor: pointer; transition: all 0.3s;"
               onclick="app.generateReport('customers')"
               onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
               onmouseout="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'">
            <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
            <h3 style="margin: 0 0 8px 0;">Customer Report</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Customer analytics and behavior</p>
          </div>
          
          <div class="card" style="padding: 24px; cursor: pointer; transition: all 0.3s;"
               onclick="app.generateReport('profit')"
               onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
               onmouseout="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'">
            <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
            <h3 style="margin: 0 0 8px 0;">Profit & Loss</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Financial performance overview</p>
          </div>
          
        </div>
        
        <!-- Quick Stats -->
        <div class="card" style="padding: 32px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 24px 0;">Quick Statistics</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
              <div style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">$0</div>
              <div style="font-size: 14px; opacity: 0.9;">Total Revenue</div>
            </div>
            
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; color: white;">
              <div style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">0</div>
              <div style="font-size: 14px; opacity: 0.9;">Total Orders</div>
            </div>
            
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px; color: white;">
              <div style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">0</div>
              <div style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">0</div>
              <div style="font-size: 14px; opacity: 0.9;">Total Products</div>
            </div>
            
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; color: white;">
              <div style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">0</div>
              <div style="font-size: 14px; opacity: 0.9;">Total Customers</div>
            </div>
          </div>
        </div>
        
        <!-- Custom Report Builder -->
        <div class="card" style="padding: 32px;">
          <h2 style="margin: 0 0 24px 0;">Custom Report</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Report Type</label>
              <select id="customReportType" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
                <option value="sales">Sales</option>
                <option value="inventory">Inventory</option>
                <option value="customers">Customers</option>
                <option value="financial">Financial</option>
              </select>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Date Range</label>
              <select id="customDateRange" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
          
          <button onclick="app.generateCustomReport()" 
                  style="padding: 12px 32px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            📊 Generate Report
          </button>
        </div>
      </div>
    `;
    },

    /**
     * Report result display
     */
    renderReportResult(reportData) {
        return `
      <div class="report-result card" style="padding: 32px; margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="margin: 0;">${reportData.title}</h2>
          <div style="display: flex; gap: 12px;">
            <button onclick="app.exportReport('pdf')" 
                    style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer;">
              📄 PDF
            </button>
            <button onclick="app.exportReport('excel')" 
                    style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer;">
              📊 Excel
            </button>
            <button onclick="app.printReport()" 
                    style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
              🖨️ Print
            </button>
          </div>
        </div>
        
        <div id="reportData">
          ${reportData.content || '<p>No data available</p>'}
        </div>
      </div>
    `;
    }
};

// Export for global use
window.ReportsRenders = ReportsRenders;
