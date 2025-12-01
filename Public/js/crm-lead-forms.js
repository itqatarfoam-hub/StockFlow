// ============================================
// CRM LEAD FORMS - CREATE & EDIT
// Clean implementation
// ============================================

function createLeadFormModal() {
    const modalHTML = `
    <div id="leadFormModal" class="modal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h2 id="leadModalTitle">🎯 Create New Lead</h2>
          <button class="close-btn" onclick="ui.closeModal('leadFormModal')">&times;</button>
        </div>
        <div class="modal-body">
          <form id="leadForm">
            <input type="hidden" id="leadId" value="">
            <div id="leadErrorMsg" class="error-message" style="display: none;"></div>
            <div id="leadSuccessMsg" class="success-message" style="display: none;"></div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label">Lead Title *</label>
                <input type="text" id="leadTitle" class="form-input" placeholder="e.g., Website Redesign Project" required>
              </div>

              <div class="form-group">
                <label class="form-label">Company *</label>
                <select id="leadCompany" class="form-input" required>
                  <option value="">Select company</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Lead Source</label>
                <select id="leadSource" class="form-input">
                  <option value="">Select source</option>
                  <option value="Website">Website</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone Call</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Trade Show">Trade Show</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Stage</label>
                <select id="leadStage" class="form-input">
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Estimated Value ($)</label>
                <input type="number" id="leadValue" class="form-input" placeholder="0.00" min="0" step="0.01">
              </div>

              <div class="form-group">
                <label class="form-label">Win Probability (%)</label>
                <input type="number" id="leadProbability" class="form-input" placeholder="50" min="0" max="100" value="50">
              </div>

              <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label">Notes</label>
                <textarea id="leadNotes" class="form-input" rows="3" placeholder="Add any relevant notes..."></textarea>
              </div>
            </div>

            <div class="modal-actions" style="margin-top: 20px;">
              <button type="button" class="btn-secondary" onclick="ui.closeModal('leadFormModal')">Cancel</button>
              <button type="submit" class="btn-primary" id="submitLeadBtn">
                <span id="submitLeadBtnText">💾 Save Lead</span>
                <span id="submitLeadBtnLoader" style="display: none;">⏳ Saving...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

    if (!document.getElementById('leadFormModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('leadForm').addEventListener('submit', handleLeadSubmit);
    }
}

async function openLeadForm(leadId = null) {
    createLeadFormModal();

    document.getElementById('leadForm').reset();
    document.getElementById('leadId').value = leadId || '';
    document.getElementById('leadErrorMsg').style.display = 'none';
    document.getElementById('leadSuccessMsg').style.display = 'none';

    const title = leadId ? '✏️ Edit Lead' : '🎯 Create New Lead';
    document.getElementById('leadModalTitle').textContent = title;

    await loadLeadFormData();

    if (leadId) {
        await loadLeadData(leadId);
    }

    ui.openModal('leadFormModal');
}

async function loadLeadFormData() {
    try {
        const companiesRes = await fetch('/api/crm/companies?status=approved', { credentials: 'same-origin' });
        const companiesData = await companiesRes.json();

        const companySelect = document.getElementById('leadCompany');
        companySelect.innerHTML = '<option value="">Select company</option>';

        if (companiesData.success && companiesData.companies) {
            companiesData.companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.company_name;
                companySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading companies:', error);
    }
}

async function loadLeadData(leadId) {
    try {
        const response = await fetch(`/api/crm/leads/${leadId}`, { credentials: 'same-origin' });
        const data = await response.json();

        if (data.success && data.lead) {
            const lead = data.lead;
            document.getElementById('leadTitle').value = lead.title || '';
            document.getElementById('leadCompany').value = lead.company_id || '';
            document.getElementById('leadSource').value = lead.source || '';
            document.getElementById('leadStage').value = lead.stage || 'new';
            document.getElementById('leadValue').value = lead.value || '';
            document.getElementById('leadProbability').value = lead.probability || 50;
            document.getElementById('leadNotes').value = lead.notes || '';
        }
    } catch (error) {
        console.error('Error loading lead:', error);
    }
}

async function handleLeadSubmit(e) {
    e.preventDefault();

    const errorMsg = document.getElementById('leadErrorMsg');
    const successMsg = document.getElementById('leadSuccessMsg');
    const submitBtn = document.getElementById('submitLeadBtn');
    const btnText = document.getElementById('submitLeadBtnText');
    const btnLoader = document.getElementById('submitLeadBtnLoader');

    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    const leadId = document.getElementById('leadId').value;
    const formData = {
        company_id: document.getElementById('leadCompany').value,
        title: document.getElementById('leadTitle').value.trim(),
        source: document.getElementById('leadSource').value,
        stage: document.getElementById('leadStage').value,
        value: parseFloat(document.getElementById('leadValue').value) || 0,
        probability: parseInt(document.getElementById('leadProbability').value) || 0,
        notes: document.getElementById('leadNotes').value.trim()
    };

    if (!formData.company_id || !formData.title) {
        errorMsg.textContent = 'Company and title are required';
        errorMsg.style.display = 'block';
        return;
    }

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    try {
        const url = leadId ? `/api/crm/leads/${leadId}` : '/api/crm/leads';
        const method = leadId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            successMsg.innerHTML = `<strong>✅ Success!</strong><br>${leadId ? 'Lead updated!' : 'Lead created!'}`;
            successMsg.style.display = 'block';

            document.getElementById('leadForm').reset();

            setTimeout(() => {
                ui.closeModal('leadFormModal');
                if (window.crmLeadsModule && typeof window.crmLeadsModule.loadLeads === 'function') {
                    window.crmLeadsModule.loadLeads();
                }
            }, 1500);

        } else {
            errorMsg.textContent = data.error || 'Failed to save lead';
            errorMsg.style.display = 'block';
        }

    } catch (error) {
        console.error('Error saving lead:', error);
        errorMsg.textContent = 'An error occurred. Please try again.';
        errorMsg.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

window.createLeadFormModal = createLeadFormModal;
window.openLeadForm = openLeadForm;
window.handleLeadSubmit = handleLeadSubmit;
