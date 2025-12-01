// ============================================
// CRM MANAGER APPROVAL MODULE
// For managers to review and approve/reject companies
// ============================================

const crmApprovalModule = {
    render() {
        return `
      <div class="crm-approvals-page">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">⏳ Company Approvals</h1>
            <p class="page-subtitle">Review and approve pending company registrations</p>
          </div>
        </div>

        <!-- Pending Companies List -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>📋 Pending Company Registrations</h3>
            <button class="btn-secondary btn-sm" onclick="crmApprovalModule.loadPendingCompanies()">🔄 Refresh</button>
          </div>
          <div class="card-body" style="padding: 0;">
            <div id="pendingCompaniesList">
              <div style="text-align: center; padding: 40px; color: #9ca3af;">
                <div style="font-size: 48px; margin-bottom: 10px;">⏳</div>
                <p>Loading pending companies...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    attachListeners() {
        console.log('⏳ CRM Approvals: Attaching listeners...');
        this.loadPendingCompanies();
    },

    async loadPendingCompanies() {
        console.log('📊 Loading pending companies...');

        try {
            const response = await fetch('/api/crm/companies?status=pending', {
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Failed to load companies');
            }

            const data = await response.json();

            if (data.success) {
                this.renderCompaniesList(data.companies || []);
            }
        } catch (error) {
            console.error('Error loading pending companies:', error);
            document.getElementById('pendingCompaniesList').innerHTML = `
        <div style="text-align: center; padding: 40px; color: #ef4444;">
          <p>❌ Error loading companies</p>
          <p style="font-size: 14px; margin-top: 10px;">${error.message}</p>
        </div>
      `;
        }
    },

    renderCompaniesList(companies) {
        const container = document.getElementById('pendingCompaniesList');

        if (!companies || companies.length === 0) {
            container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #9ca3af;">
          <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
          <p>No pending approvals</p>
          <p style="font-size: 14px; margin-top: 5px;">All companies have been reviewed</p>
        </div>
      `;
            return;
        }

        container.innerHTML = `
      <table class="modern-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact Person</th>
            <th>Industry</th>
            <th>Employees</th>
            <th>Registered</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${companies.map(company => this.renderCompanyRow(company)).join('')}
        </tbody>
      </table>
    `;
    },

    renderCompanyRow(company) {
        const registeredDate = new Date(company.created_at).toLocaleDateString();

        return `
      <tr id="company-row-${company.id}">
        <td>
          <div>
            <div style="font-weight: 600; color: #1f2937;">${company.company_name}</div>
            <div style="font-size: 12px; color: #6b7280;">${company.email}</div>
          </div>
        </td>
        <td>
          <div>
            <div>${company.contact_person}</div>
            <div style="font-size: 12px; color: #6b7280;">${company.phone}</div>
          </div>
        </td>
        <td><span class="badge" style="background: #3b82f6; color: white;">${company.industry_type || 'Not specified'}</span></td>
        <td>${company.num_employees || 'N/A'}</td>
        <td>${registeredDate}</td>
        <td class="text-right">
          <button class="btn-icon" onclick="crmApprovalModule.viewCompanyDetails('${company.id}')" title="View Details">👁️</button>
          <button class="btn-icon" style="background: #10b981; color: white;" onclick="crmApprovalModule.approveCompany('${company.id}', '${company.company_name}')" title="Approve">✓</button>
          <button class="btn-icon btn-danger" onclick="crmApprovalModule.rejectCompany('${company.id}', '${company.company_name}')" title="Reject">✗</button>
        </td>
      </tr>
    `;
    },

    viewCompanyDetails(companyId) {
        // Open details modal (to be implemented)
        alert(`View details for company: ${companyId}\n\nDetailed view will be implemented soon.`);
    },

    async approveCompany(companyId, companyName) {
        if (!confirm(`Approve "${companyName}"?\n\nThis company will be activated and can start using the CRM system.`)) {
            return;
        }

        const notes = prompt('Enter approval notes (optional):', 'Approved for partnership');

        try {
            const response = await fetch(`/api/crm/companies/${companyId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ notes: notes || '' })
            });

            const data = await response.json();

            if (data.success) {
                // Remove row from table
                const row = document.getElementById(`company-row-${companyId}`);
                if (row) {
                    row.style.backgroundColor = '#d1fae5';
                    setTimeout(() => {
                        row.remove();
                        // Reload if no more companies
                        const tbody = document.querySelector('#pendingCompaniesList tbody');
                        if (tbody && tbody.children.length === 0) {
                            this.loadPendingCompanies();
                        }
                    }, 500);
                }

                alert(`✅ ${companyName} has been approved!`);

                // Refresh CRM dashboard if it's open
                if (window.crmDashboardModule && typeof window.crmDashboardModule.loadDashboardData === 'function') {
                    window.crmDashboardModule.loadDashboardData();
                }
            } else {
                alert(`❌ Failed to approve: ${data.error}`);
            }
        } catch (error) {
            console.error('Error approving company:', error);
            alert('❌ An error occurred while approving the company');
        }
    },

    async rejectCompany(companyId, companyName) {
        const notes = prompt(`Reject "${companyName}"?\n\nPlease provide a reason for rejection:`, '');

        if (!notes || notes.trim() === '') {
            alert('Rejection reason is required');
            return;
        }

        try {
            const response = await fetch(`/api/crm/companies/${companyId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ notes: notes.trim() })
            });

            const data = await response.json();

            if (data.success) {
                // Remove row from table
                const row = document.getElementById(`company-row-${companyId}`);
                if (row) {
                    row.style.backgroundColor = '#fee2e2';
                    setTimeout(() => {
                        row.remove();
                        // Reload if no more companies
                        const tbody = document.querySelector('#pendingCompaniesList tbody');
                        if (tbody && tbody.children.length === 0) {
                            this.loadPendingCompanies();
                        }
                    }, 500);
                }

                alert(`✗ ${companyName} has been rejected`);

                // Refresh CRM dashboard if it's open
                if (window.crmDashboardModule && typeof window.crmDashboardModule.loadDashboardData === 'function') {
                    window.crmDashboardModule.loadDashboardData();
                }
            } else {
                alert(`❌ Failed to reject: ${data.error}`);
            }
        } catch (error) {
            console.error('Error rejecting company:', error);
            alert('❌ An error occurred while rejecting the company');
        }
    }
};

// Export
window.crmApprovalModule = crmApprovalModule;
