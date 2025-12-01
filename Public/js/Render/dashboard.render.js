// ====================================================
// STOCKFLOW - DASHBOARD RENDERS
// Role-based dashboard rendering functions
// ====================================================

const DashboardRenders = {

    /**
     * Get role-specific dashboard
   */
    getRoleDashboard(user) {
        let userRole = user?.role?.toLowerCase() || 'user';

        // Handle 'admin' as 'administrator'
        if (userRole === 'admin') {
            userRole = 'administrator';
        }

        // Map role names to dashboard module names
        const dashboardModules = {
            'administrator': window.administratorDashboardModule,
            'admin': window.administratorDashboardModule,
            'manager': window.managerDashboardModule,
            'user': window.userDashboardModule,
            'hr': window.hrDashboardModule,
            'sales': window.salesDashboardModule,
            'purchase': window.purchaseDashboardModule,
            'store': window.storeDashboardModule
        };

        const roleDashboard = dashboardModules[userRole];

        if (roleDashboard) {
            return roleDashboard.render();
        }

        // Fallback
        return window.dashboardPageModule ? dashboardPageModule.render() : this.renderDefaultDashboard(user);
    },

    /**
     * Default dashboard fallback
     */
    renderDefaultDashboard(user) {
        return `
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h1>Welcome, ${user?.full_name || user?.username || 'User'}!</h1>
          <p>Role: ${user?.role || 'N/A'}</p>
        </div>
        
        <div class="dashboard-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; padding: 20px;">
         
          <div class="card" style="padding: 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
            <h3>Products</h3>
            <p class="text-muted">Manage your inventory</p>
          </div>
          
          <div class="card" style="padding: 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">👥</div>
            <h3>Customers</h3>
            <p class="text-muted">Customer management</p>
          </div>
          
          <div class="card" style="padding: 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">🛒</div>
            <h3>Sales</h3>
            <p class="text-muted">Process sales orders</p>
          </div>
          
          <div class="card" style="padding: 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
            <h3>Reports</h3>
            <p class="text-muted">Analytics & insights</p>
          </div>
        </div>
      </div>
    `;
    }
};

// Export for global use
window.DashboardRenders = DashboardRenders;
