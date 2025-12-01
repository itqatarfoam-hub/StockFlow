// ============================================
// USER DASHBOARD MODULE (Default)
// Author: itqatarfoam-hub
// Date: 2025-11-27 13:59:51 UTC
// ============================================

const userDashboardModule = {
    render() {
        return `
      <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1f2937;">User Dashboard</h2>
        <p style="color: #6b7280; margin: 0 0 24px 0;">Welcome to your personal dashboard.</p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 12px;">
            <div style="font-size: 12px; opacity: 0.9;">My Sales</div>
            <div style="font-size: 32px; font-weight: 700; margin-top: 8px;" id="dashboardMySales">0</div>
          </div>
          <div style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 20px; border-radius: 12px;">
            <div style="font-size: 12px; opacity: 0.9;">Messages</div>
            <div style="font-size: 32px; font-weight: 700; margin-top: 8px;" id="dashboardMessages">0</div>
          </div>
        </div>

        <div style="margin-top: 24px; padding: 20px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1f2937;">📊 My Activity</h3>
          <div id="userSummary">
            <p style="color: #6b7280;">Loading your activity summary...</p>
          </div>
        </div>
      </div>
    `;
    },

    attachListeners(app) {
        console.log('🔗 User Dashboard: Attaching listeners...');
        this.loadStats(app);
    },

    async loadStats(app) {
        try {
            const mySales = document.getElementById('dashboardMySales');
            const messages = document.getElementById('dashboardMessages');

            // Load user's sales
            try {
                const salesRes = await fetch('/api/sales', { credentials: 'same-origin' });
                const salesData = await salesRes.json();
                const userSales = salesData.sales?.filter(s => s.user_id === app.currentUser?.id) || [];
                if (mySales) mySales.textContent = userSales.length;
            } catch (e) {
                if (mySales) mySales.textContent = 'N/A';
            }

            if (messages) messages.textContent = '0';

            const summaryDiv = document.getElementById('userSummary');
            if (summaryDiv) {
                summaryDiv.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
            <div style="padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">Your Performance</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937;">View your sales history and activity</p>
            </div>
            <div style="padding: 16px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                ✅ You're all set! Access your permitted features from the sidebar.
              </p>
            </div>
          </div>
        `;
            }
        } catch (error) {
            console.error('❌ User Dashboard: Failed to load stats:', error);
        }
    }
};

window.userDashboardModule = userDashboardModule;
