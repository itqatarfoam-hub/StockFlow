// ============================================
// HR DASHBOARD MODULE
// Author: itqatarfoam-hub
// Date: 2025-11-27 13:59:51 UTC
// ============================================

const hrDashboardModule = {
    render() {
        return `
      <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1f2937;">HR Dashboard</h2>
        <p style="color: #6b7280; margin: 0 0 24px 0;">Human resources and user management overview.</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 12px;">
            <div style="font-size: 12px; opacity: 0.9;">Total Users</div>
            <div style="font-size: 32px; font-weight: 700; margin-top: 8px;" id="dashboardTotalUsers">0</div>
          </div>
          <div style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 20px; border-radius: 12px;">
            <div style="font-size: 12px; opacity: 0.9;">Total Roles</div>
            <div style="font-size: 32px; font-weight: 700; margin-top: 8px;" id="dashboardTotalRoles">0</div>
          </div>
          <div style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 20px; border-radius: 12px;">
            <div style="font-size: 12px; opacity: 0.9;">Active Sessions</div>
            <div style="font-size: 32px; font-weight: 700; margin-top: 8px;" id="dashboardActiveSessions">1</div>
          </div>
        </div>

        <div style="margin-top: 24px; padding: 20px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1f2937;">👥 HR Summary</h3>
          <div id="hrSummary">
            <p style="color: #6b7280;">Loading HR summary...</p>
          </div>
        </div>
      </div>
    `;
    },

    attachListeners(app) {
        console.log('🔗 HR Dashboard: Attaching listeners...');
        this.loadStats(app);
    },

    async loadStats(app) {
        try {
            const totalUsers = document.getElementById('dashboardTotalUsers');
            const totalRoles = document.getElementById('dashboardTotalRoles');

            // Load users
            try {
                const usersRes = await fetch('/api/users', { credentials: 'same-origin' });
                const usersData = await usersRes.json();
                if (totalUsers) totalUsers.textContent = usersData.users?.length || 0;
            } catch (e) {
                if (totalUsers) totalUsers.textContent = 'N/A';
            }

            // Load roles
            try {
                const rolesRes = await fetch('/api/roles', { credentials: 'same-origin' });
                const rolesData = await rolesRes.json();
                if (totalRoles) totalRoles.textContent = rolesData.roles?.length || 0;
            } catch (e) {
                if (totalRoles) totalRoles.textContent = 'N/A';
            }

            const summaryDiv = document.getElementById('hrSummary');
            if (summaryDiv) {
                summaryDiv.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
            <div style="padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">User Management</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937;">Monitor and manage all user accounts and permissions</p>
            </div>
            <div style="padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">Role Configuration</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937;">Create and manage user roles and access permissions</p>
            </div>
          </div>
        `;
            }
        } catch (error) {
            console.error('❌ HR Dashboard: Failed to load stats:', error);
        }
    }
};

window.hrDashboardModule = hrDashboardModule;
