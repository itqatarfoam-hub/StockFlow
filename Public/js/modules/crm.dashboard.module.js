// ============================================
// CRM DASHBOARD MODULE
// Complete CRM overview with KPIs and widgets
// ============================================

const crmDashboardModule = {
  render() {
    return `
      <div class="crm-dashboard">
        <!-- CRM Header Banner -->
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 16px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: white;">🎯 CRM Dashboard</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Customer Relationship Management Overview</p>
        </div>

        <!-- Quick Action Button -->
        <div style="margin-bottom: 24px; text-align: right;">
          <button class="btn-primary" onclick="crmDashboardModule.openCompanyRegistration()" style="background: linear-gradient(135deg, #7c3aed, #a855f7);">
            ➕ Register New Company
          </button>
        </div>

        <!-- KPI Cards Grid -->
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
          ${this.renderKPICards()}
        </div>

        <!-- Quick Actions & Recent Activity -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px;">
          <!-- Charts Section -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>📊 Sales Performance</h3>
            </div>
            <div class="card-body">
              <div id="salesChart" style="height: 300px; display: flex; align-items: center; justify-content: center; color: #9ca3af;">
                Monthly sales chart will be displayed here
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>🔔 Recent Activity</h3>
            </div>
            <div class="card-body">
              <div id="recentActivity" style="max-height: 300px; overflow-y: auto;">
                ${this.renderRecentActivity()}
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Approvals (Manager Only) -->
        <div id="pendingApprovalsSection" style="margin-bottom: 30px;">
          ${this.renderPendingApprovals()}
        </div>

        <!-- Active Leads Pipeline -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>🎯 Active Leads Pipeline</h3>
            <a href="#" onclick="window.app.navigateTo('crm-leads'); return false;" class="btn-secondary btn-sm">View All Leads</a>
          </div>
          <div class="card-body">
            ${this.renderLeadsPipeline()}
          </div>
        </div>

        <!--Today's Meetings -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>📅 Today's Meetings</h3>
            <a href="#" onclick="window.app.navigateTo('crm-meetings'); return false;" class="btn-secondary btn-sm">View All</a>
          </div>
          <div class="card-body">
            <div id="todayMeetings">
              ${this.renderTodayMeetings()}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderKPICards() {
    const kpis = [
      { icon: '🏢', label: 'Total Companies', value: '0', color: '#3b82f6', change: '+0%' },
      { icon: '🎯', label: 'Active Leads', value: '0', color: '#10b981', change: '+0%' },
      { icon: '⏳', label: 'Pending Approvals', value: '0', color: '#f59e0b', change: '' },
      { icon: '📅', label: 'Meetings Today', value: '0', color: '#8b5cf6', change: '' },
      { icon: '📄', label: 'Quotations', value: '0', color: '#ec4899', change: '+0%' },
      { icon: '🏭', label: 'In Production', value: '0', color: '#06b6d4', change: '' },
      { icon: '🚚', label: 'Pending Delivery', value: '0', color: '#f97316', change: '' },
      { icon: '💰', label: 'Outstanding Payments', value: '$0', color: '#ef4444', change: '' }
    ];

    return kpis.map(kpi => `
      <div class="stat-card" style="background: linear-gradient(135deg, ${kpi.color}15, ${kpi.color}05); border-left: 4px solid ${kpi.color};">
        <div class="stat-icon" style="font-size: 32px;">${kpi.icon}</div>
        <div class="stat-details">
          <div class="stat-label">${kpi.label}</div>
          <div class="stat-value" style="color: ${kpi.color};">${kpi.value}</div>
          ${kpi.change ? `<div class="stat-change" style="color: ${kpi.color}; font-size: 12px;">${kpi.change}</div>` : ''}
        </div>
      </div>
    `).join('');
  },

  renderRecentActivity() {
    return `
      <div style="color: #9ca3af; text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 10px;">📋</div>
        <p>No recent activity</p>
        <p style="font-size: 13px; margin-top: 5px;">Activities will appear here</p>
      </div>
    `;
  },

  renderPendingApprovals() {
    const user = window.app?.currentUser || {};
    const isManager = user.role === 'admin' || user.role === 'manager';

    if (!isManager) {
      return '';
    }

    return `
      <div class="dashboard-card" style="border-left: 4px solid #f59e0b;">
        <div class="card-header" style="background: #fef3c7;">
          <h3>⏳ Pending Company Approvals</h3>
          <div style="display: flex; gap: 10px; align-items: center;">
            <span class="badge" style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 12px;">0 Pending</span>
            <a href="#" onclick="window.app.navigateTo('crm-approvals'); return false;" class="btn-secondary btn-sm">View All</a>
          </div>
        </div>
        <div class="card-body">
          <div style="color: #9ca3af; text-align: center; padding: 30px;">
            <p>No pending approvals</p>
            <p style="font-size: 13px; margin-top: 5px;">New registrations will appear here</p>
          </div>
        </div>
      </div>
    `;
  },

  renderLeadsPipeline() {
    const stages = [
      { name: 'New', count: 0, color: '#3b82f6' },
      { name: 'Contacted', count: 0, color: '#8b5cf6' },
      { name: 'Qualified', count: 0, color: '#10b981' },
      { name: 'Proposal', count: 0, color: '#f59e0b' },
      { name: 'Negotiation', count: 0, color: '#ec4899' },
      { name: 'Won', count: 0, color: '#22c55e' }
    ];

    return `
      <div style="display: flex; gap: 15px; justify-content: space-between;">
        ${stages.map(stage => `
          <div style="flex: 1; text-align: center; padding: 20px; background: ${stage.color}10; border-radius: 8px; border-top: 3px solid ${stage.color};">
            <div style="font-size: 24px; font-weight: 700; color: ${stage.color}; margin-bottom: 5px;">${stage.count}</div>
            <div style="font-size: 12px; color: #6b7280; font-weight: 500;">${stage.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderTodayMeetings() {
    return `
      <div style="color: #9ca3af; text-align: center; padding: 30px;">
        <div style="font-size: 40px; margin-bottom: 10px;">📅</div>
        <p>No meetings scheduled for today</p>
        <button class="btn-primary btn-sm" style="margin-top: 15px;" onclick="alert('Meeting creation will be available soon')">
          ➕ Schedule Meeting
        </button>
      </div>
    `;
  },

  openCompanyRegistration() {
    if (typeof createCompanyRegistrationModal === 'function') {
      createCompanyRegistrationModal();
      ui.openModal('companyRegistrationModal');
    } else {
      alert('Company registration form will open here.\n\nThis feature is coming soon!');
    }
  },

  attachListeners() {
    console.log('🎯 CRM Dashboard: Attaching listeners...');
    this.loadDashboardData();
  },

  async loadDashboardData() {
    console.log('📊 Loading CRM dashboard data...');

    try {
      const response = await fetch('/api/crm/dashboard/stats', {
        credentials: 'same-origin'
      });

      if (!response.ok) {
        console.error('Failed to load CRM stats');
        return;
      }

      const data = await response.json();

      if (data.success && data.stats) {
        this.updateKPICards(data.stats);
      }
    } catch (error) {
      console.error('Error loading CRM dashboard data:', error);
    }
  },

  updateKPICards(stats) {
    // Update each KPI card with real data
    const kpiData = [
      { selector: '.stat-card:nth-child(1) .stat-value', value: stats.totalCompanies },
      { selector: '.stat-card:nth-child(2) .stat-value', value: stats.activeLeads },
      { selector: '.stat-card:nth-child(3) .stat-value', value: stats.pendingApprovals },
      { selector: '.stat-card:nth-child(4) .stat-value', value: stats.meetingsToday },
      { selector: '.stat-card:nth-child(5) .stat-value', value: stats.quotations },
      { selector: '.stat-card:nth-child(6) .stat-value', value: stats.inProduction },
      { selector: '.stat-card:nth-child(7) .stat-value', value: stats.pendingDeliveries },
      { selector: '.stat-card:nth-child(8) .stat-value', value: `$${stats.outstandingPayments.toLocaleString()}` }
    ];

    kpiData.forEach(kpi => {
      const element = document.querySelector(kpi.selector);
      if (element) {
        element.textContent = kpi.value;
      }
    });

    // Update pending approvals badge if user is manager/admin
    const user = window.app?.currentUser || {};
    const isManager = user.role === 'admin' || user.role === 'manager';

    if (isManager && stats.pendingApprovals > 0) {
      const badge = document.querySelector('#pendingApprovalsSection .badge');
      if (badge) {
        badge.textContent = `${stats.pendingApprovals} Pending`;
      }
    }

    console.log('✅ KPI cards updated with live data');
  }
};

// Export
window.crmDashboardModule = crmDashboardModule;
