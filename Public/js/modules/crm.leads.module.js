// ============================================
// CRM LEAD MANAGEMENT MODULE
// Kanban board with drag-and-drop functionality
// ============================================

const crmLeadsModule = {
  currentLeads: [],
  currentFilter: 'all',

  render() {
    return `
      <div class="crm-leads-page">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">🎯 Lead Management</h1>
            <p class="page-subtitle">Track and manage your sales pipeline</p>
          </div>
          <div class="header-actions">
            <select id="leadFilterDropdown" class="form-input" onchange="crmLeadsModule.filterLeads(this.value)" style="width: auto; margin-right: 10px;">
              <option value="all">All Leads</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
            <button class="btn-primary" onclick="crmLeadsModule.openCreateLead()">➕ Create Lead</button>
          </div>
        </div>

        <!-- Pipeline Stats -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
          ${this.renderPipelineStats()}
        </div>

        <!-- Kanban Board -->
        <div class="kanban-board" id="leadsKanbanBoard">
          <div style="text-align: center; padding: 40px; color: #9ca3af;">
            <div style="font-size: 48px; margin-bottom: 10px;">⏳</div>
            <p>Loading leads pipeline...</p>
          </div>
        </div>
      </div>
    `;
  },

  renderPipelineStats() {
    const stages = [
      { name: 'New', count: 0, color: '#3b82f6' },
      { name: 'Contacted', count: 0, color: '#8b5cf6' },
      { name: 'Qualified', count: 0, color: '#10b981' },
      { name: 'Proposal', count: 0, color: '#f59e0b' },
      { name: 'Negotiation', count: 0, color: '#ec4899' },
      { name: 'Won', count: 0, color: '#22c55e' },
      { name: 'Lost', count: 0, color: '#ef4444' }
    ];

    return stages.map(stage => `
      <div class="stat-card" style="background: ${stage.color}10; border-left: 4px solid ${stage.color};">
        <div style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">${stage.name}</div>
        <div id="count-${stage.name.toLowerCase()}" style="font-size: 24px; font-weight: 700; color: ${stage.color}; margin-top: 5px;">0</div>
      </div>
    `).join('');
  },

  attachListeners() {
    console.log('🎯 Leads Module: Attaching listeners...');
    this.loadLeads();
  },

  async loadLeads(stage = null) {
    console.log('📊 Loading leads...');

    try {
      let url = '/api/crm/leads';
      if (stage) url += `?stage=${stage}`;

      const response = await fetch(url, { credentials: 'same-origin' });

      if (!response.ok) {
        throw new Error('Failed to load leads');
      }

      const data = await response.json();

      if (data.success) {
        this.currentLeads = data.leads || [];
        this.renderKanbanBoard(this.currentLeads);
        this.updatePipelineStats(this.currentLeads);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      document.getElementById('leadsKanbanBoard').innerHTML = `
        <div style="text-align: center; padding: 40px; color: #ef4444;">
          <p>❌ Error loading leads</p>
          <p style="font-size: 14px; margin-top: 10px;">${error.message}</p>
        </div>
      `;
    }
  },

  renderKanbanBoard(leads) {
    const board = document.getElementById('leadsKanbanBoard');
    if (!board) return;

    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const stageColors = {
      new: '#3b82f6',
      contacted: '#8b5cf6',
      qualified: '#10b981',
      proposal: '#f59e0b',
      negotiation: '#ec4899',
      won: '#22c55e',
      lost: '#ef4444'
    };

    const stageNames = {
      new: 'New',
      contacted: 'Contacted',
      qualified: 'Qualified',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      won: 'Won',
      lost: 'Lost'
    };

    board.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; align-items: start;">
        ${stages.map(stage => {
      const stageLeads = leads.filter(l => (l.stage || 'new').toLowerCase() === stage);

      return `
            <div class="kanban-column" data-stage="${stage}" style="background: #f9fafb; border-radius: 12px; padding: 15px; min-height: 400px; border-top: 4px solid ${stageColors[stage]};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #1f2937; text-transform: uppercase;">${stageNames[stage]}</h3>
                <span style="background: ${stageColors[stage]}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${stageLeads.length}</span>
              </div>
              <div class="kanban-cards" style="display: flex; flex-direction: column; gap: 12px;">
                ${stageLeads.length > 0 ? stageLeads.map(lead => this.renderLeadCard(lead)).join('') : `
                  <div style="text-align: center; padding: 30px; color: #9ca3af; font-size: 13px;">
                    No leads in this stage
                  </div>
                `}
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `;
  },

  renderLeadCard(lead) {
    const value = lead.value ? `$${parseFloat(lead.value).toLocaleString()}` : 'No value';
    const probability = lead.probability || 0;

    return `
      <div class="lead-card" data-lead-id="${lead.id}" 
           style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.2s;"
           onmouseover="this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'"
           onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'"
           onclick="crmLeadsModule.viewLeadDetails('${lead.id}')">
        
        <!-- Lead Title -->
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px; font-size: 14px;">${lead.title}</div>
        
        <!-- Company Name -->
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
          🏢 ${lead.company_name || 'No company'}
        </div>
        
        <!-- Value & Probability -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 13px; font-weight: 600; color: #10b981;">${value}</span>
          <span style="font-size: 12px; color: #6b7280;">${probability}% likelihood</span>
        </div>
        
        <!-- Progress Bar -->
        <div style="background: #e5e7eb; height: 4px; border-radius: 2px; overflow: hidden; margin-bottom: 8px;">
          <div style="background: #10b981; height: 100%; width: ${probability}%; transition: width 0.3s;"></div>
        </div>
        
        <!-- Source & Assigned -->
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af;">
          <span>📍 ${lead.source || 'Unknown'}</span>
          ${lead.assigned_to ? `<span>👤 Assigned</span>` : ''}
        </div>
      </div>
    `;
  },

  updatePipelineStats(leads) {
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

    stages.forEach(stage => {
      const count = leads.filter(l => (l.stage || 'new').toLowerCase() === stage).length;
      const element = document.getElementById(`count-${stage}`);
      if (element) {
        element.textContent = count;
      }
    });
  },

  filterLeads(stage) {
    this.currentFilter = stage;

    if (stage === 'all') {
      this.renderKanbanBoard(this.currentLeads);
    } else {
      const filtered = this.currentLeads.filter(l => (l.stage || 'new').toLowerCase() === stage);
      this.renderKanbanBoard(filtered);
    }
  },

  openCreateLead() {
    if (typeof openLeadForm === 'function') {
      openLeadForm();
    } else {
      alert('Lead form not loaded');
    }
  },

  viewLeadDetails(leadId) {
    if (typeof openLeadForm === 'function') {
      openLeadForm(leadId);
    } else {
      const lead = this.currentLeads.find(l => l.id === leadId);
      if (lead) {
        alert(`Lead Details: \n\nTitle: ${lead.title} \nCompany: ${lead.company_name || 'N/A'} \nValue: ${lead.value ? '$' + lead.value : 'N/A'} \nStage: ${lead.stage || 'new'} \nProbability: ${lead.probability || 0}% `);
      }
    }
  }
};

// Export
window.crmLeadsModule = crmLeadsModule;
