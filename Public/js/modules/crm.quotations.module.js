// ============================================
// CRM QUOTATIONS MODULE - List & Management
// ============================================

const crmQuotationsModule = {
    currentQuotations: [],
    currentFilter: 'all',

    render() {
        return `
      <div class="crm-quotations-page">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">📄 Quotations</h1>
            <p class="page-subtitle">Create and manage sales quotations</p>
          </div>
          <div class="header-actions">
            <button class="btn-primary" onclick="openQuotationForm()">➕ Create Quotation</button>
          </div>
        </div>

        <!-- Filters & Stats -->
        <div class="dashboard-stats" style="margin-bottom: 20px;">
          <div class="stat-card" onclick="crmQuotationsModule.filterQuotations('all')" style="cursor: pointer;">
            <div class="stat-icon">📋</div>
            <div class="stat-details">
              <p class="stat-label">Total</p>
              <h3 class="stat-value" id="totalQuotations">0</h3>
            </div>
          </div>
          <div class="stat-card" onclick="crmQuotationsModule.filterQuotations('draft')" style="cursor: pointer;">
            <div class="stat-icon">✏️</div>
            <div class="stat-details">
              <p class="stat-label">Draft</p>
              <h3 class="stat-value" id="draftQuotations">0</h3>
            </div>
          </div>
          <div class="stat-card" onclick="crmQuotationsModule.filterQuotations('sent')" style="cursor: pointer;">
            <div class="stat-icon">📤</div>
            <div class="stat-details">
              <p class="stat-label">Sent</p>
              <h3 class="stat-value" id="sentQuotations">0</h3>
            </div>
          </div>
          <div class="stat-card" onclick="crmQuotationsModule.filterQuotations('accepted')" style="cursor: pointer;">
            <div class="stat-icon">✅</div>
            <div class="stat-details">
              <p class="stat-label">Accepted</p>
              <h3 class="stat-value" id="acceptedQuotations">0</h3>
            </div>
          </div>
        </div>

        <!-- Quotations List -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>Quotations</h3>
            <div style="display: flex; gap: 10px;">
              <select id="statusFilter" class="form-input" style="width: 150px;" onchange="crmQuotationsModule.filterQuotations(this.value)">
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div class="card-body">
            <div id="quotationsList">
              <div style="text-align: center; padding: 40px; color: #9ca3af;">
                <p>Loading quotations...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    attachListeners() {
        console.log('📄 Quotations Module: Attaching listeners...');
        this.loadQuotations();
    },

    async loadQuotations(status = null) {
        console.log('📊 Loading quotations...');

        try {
            const url = status ? `/api/crm/quotations?status=${status}` : '/api/crm/quotations';
            const response = await fetch(url, { credentials: 'same-origin' });

            if (!response.ok) {
                throw new Error('Failed to load quotations');
            }

            const data = await response.json();

            if (data.success) {
                this.currentQuotations = data.quotations || [];
                this.updateStats();
                this.renderQuotationsList();
            }
        } catch (error) {
            console.error('Error loading quotations:', error);
            this.renderEmptyState();
        }
    },

    updateStats() {
        const total = this.currentQuotations.length;
        const draft = this.currentQuotations.filter(q => q.status === 'draft').length;
        const sent = this.currentQuotations.filter(q => q.status === 'sent').length;
        const accepted = this.currentQuotations.filter(q => q.status === 'accepted').length;

        document.getElementById('totalQuotations').textContent = total;
        document.getElementById('draftQuotations').textContent = draft;
        document.getElementById('sentQuotations').textContent = sent;
        document.getElementById('acceptedQuotations').textContent = accepted;
    },

    filterQuotations(status) {
        this.currentFilter = status;
        document.getElementById('statusFilter').value = status;

        if (status === 'all') {
            this.renderQuotationsList();
        } else {
            this.loadQuotations(status);
        }
    },

    renderQuotationsList() {
        const container = document.getElementById('quotationsList');

        if (!container) return;

        if (this.currentQuotations.length === 0) {
            container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
          <div style="font-size: 64px; margin-bottom: 16px;">📄</div>
          <h3 style="margin: 0 0 8px 0; color: #6b7280;">No quotations yet</h3>
          <p style="margin: 0;">Create your first quotation to get started</p>
          <button class="btn-primary" onclick="openQuotationForm()" style="margin-top: 20px;">➕ Create Quotation</button>
        </div>
      `;
            return;
        }

        const html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Quote #</th>
            <th>Company</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Valid Until</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.currentQuotations.map(q => this.renderQuotationRow(q)).join('')}
        </tbody>
      </table>
    `;

        container.innerHTML = html;
    },

    renderQuotationRow(quotation) {
        const statusColors = {
            draft: '#6b7280',
            sent: '#3b82f6',
            accepted: '#10b981',
            rejected: '#ef4444'
        };

        const statusIcons = {
            draft: '✏️',
            sent: '📤',
            accepted: '✅',
            rejected: '❌'
        };

        const amount = parseFloat(quotation.total_amount || 0).toFixed(2);
        const date = new Date(quotation.quotation_date).toLocaleDateString();
        const validUntil = quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : 'N/A';

        return `
      <tr>
        <td><strong>${quotation.quotation_number || 'N/A'}</strong></td>
        <td>${quotation.company_name || 'Unknown'}</td>
        <td>${date}</td>
        <td><strong>$${amount}</strong></td>
        <td>
          <span class="badge" style="background: ${statusColors[quotation.status]}; color: white;">
            ${statusIcons[quotation.status]} ${quotation.status.toUpperCase()}
          </span>
        </td>
        <td>${validUntil}</td>
        <td>
          <button class="btn-sm btn-secondary" onclick="openQuotationForm('${quotation.id}')">✏️ Edit</button>
          <button class="btn-sm btn-secondary" onclick="crmQuotationsModule.viewQuotation('${quotation.id}')">👁️ View</button>
        </td>
      </tr>
    `;
    },

    viewQuotation(id) {
        // TODO: Implement quotation view/preview
        alert('Quotation view coming soon! For now, click Edit to see details.');
    },

    renderEmptyState() {
        const container = document.getElementById('quotationsList');
        if (container) {
            container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #9ca3af;">
          <p>Error loading quotations</p>
        </div>
      `;
        }
    }
};

// Export
window.crmQuotationsModule = crmQuotationsModule;
