// ============================================
// CRM MEETING FORM - Complete Implementation
// ============================================

function createMeetingFormModal() {
    const modalHTML = `
    <div id="meetingFormModal" class="modal">
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2 id="meetingFormTitle">📅 Schedule Meeting</h2>
          <button class="close-btn" onclick="ui.closeModal('meetingFormModal')">&times;</button>
        </div>
        <div class="modal-body">
          <form id="meetingForm">
            <input type="hidden" id="meetingId">
            
            <div class="form-group">
              <label class="form-label">Meeting Title *</label>
              <input type="text" id="meetingTitle" class="form-input" placeholder="e.g., Product Demo" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Company *</label>
              <select id="meetingCompany" class="form-input" required>
                <option value="">Select company</option>
              </select>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div class="form-group">
                <label class="form-label">Date *</label>
                <input type="date" id="meetingDate" class="form-input" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">Time *</label>
                <input type="time" id="meetingTime" class="form-input" required>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Location</label>
              <input type="text" id="meetingLocation" class="form-input" placeholder="e.g., Office, Zoom, Client site">
            </div>
            
            <div class="form-group">
              <label class="form-label">Meeting Type</label>
              <select id="meetingType" class="form-input">
                <option value="initial">Initial Meeting</option>
                <option value="follow_up">Follow-up</option>
                <option value="presentation">Presentation</option>
                <option value="negotiation">Negotiation</option>
                <option value="closing">Closing</option>
                <option value="support">Support</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Agenda/Notes</label>
              <textarea id="meetingNotes" class="form-input" rows="3" placeholder="Meeting agenda, topics to discuss..."></textarea>
            </div>
            
            <div id="meetingErrorMsg" class="error-message" style="display: none;"></div>
            <div id="meetingSuccessMsg" class="success-message" style="display: none;"></div>
            
            <div class="modal-actions">
              <button type="button" class="btn-secondary" onclick="ui.closeModal('meetingFormModal')">Cancel</button>
              <button type="submit" class="btn-primary" id="submitMeetingBtn">
                <span id="submitMeetingText">💾 Schedule Meeting</span>
                <span id="submitMeetingLoader" style="display: none;">⏳ Scheduling...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

    if (!document.getElementById('meetingFormModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Attach form submit
        document.getElementById('meetingForm').addEventListener('submit', handleMeetingSubmit);

        // Set min date to today
        const dateInput = document.getElementById('meetingDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }
    }
}

async function openMeetingForm(meetingId = null) {
    createMeetingFormModal();

    // Reset form
    document.getElementById('meetingForm').reset();
    document.getElementById('meetingId').value = meetingId || '';
    document.getElementById('meetingErrorMsg').style.display = 'none';
    document.getElementById('meetingSuccessMsg').style.display = 'none';

    // Update title
    const title = meetingId ? '✏️ Edit Meeting' : '📅 Schedule Meeting';
    document.getElementById('meetingFormTitle').textContent = title;

    // Load companies
    await loadMeetingCompanies();

    // If editing, load meeting data
    if (meetingId) {
        await loadMeetingData(meetingId);
    } else {
        // Set default date/time
        const now = new Date();
        document.getElementById('meetingDate').value = now.toISOString().split('T')[0];
        document.getElementById('meetingTime').value = '10:00';
    }

    ui.openModal('meetingFormModal');
}

async function loadMeetingCompanies() {
    try {
        const response = await fetch('/api/crm/companies?status=approved', {
            credentials: 'same-origin'
        });
        const data = await response.json();

        const select = document.getElementById('meetingCompany');
        select.innerHTML = '<option value="">Select company</option>';

        if (data.success && data.companies) {
            data.companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.company_name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading companies:', error);
    }
}

async function loadMeetingData(meetingId) {
    try {
        const response = await fetch(`/api/crm/meetings/${meetingId}`, {
            credentials: 'same-origin'
        });
        const data = await response.json();

        if (data.success && data.meeting) {
            const meeting = data.meeting;
            const datetime = new Date(meeting.meeting_date);

            document.getElementById('meetingTitle').value = meeting.title || '';
            document.getElementById('meetingCompany').value = meeting.company_id || '';
            document.getElementById('meetingDate').value = datetime.toISOString().split('T')[0];
            document.getElementById('meetingTime').value = datetime.toTimeString().slice(0, 5);
            document.getElementById('meetingLocation').value = meeting.location || '';
            document.getElementById('meetingType').value = meeting.meeting_type || 'initial';
            document.getElementById('meetingNotes').value = meeting.notes || '';
        }
    } catch (error) {
        console.error('Error loading meeting:', error);
    }
}

async function handleMeetingSubmit(e) {
    e.preventDefault();

    const errorMsg = document.getElementById('meetingErrorMsg');
    const successMsg = document.getElementById('meetingSuccessMsg');
    const submitBtn = document.getElementById('submitMeetingBtn');
    const btnText = document.getElementById('submitMeetingText');
    const btnLoader = document.getElementById('submitMeetingLoader');

    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    const meetingId = document.getElementById('meetingId').value;
    const date = document.getElementById('meetingDate').value;
    const time = document.getElementById('meetingTime').value;
    const meetingDate = `${date} ${time}:00`;

    const formData = {
        company_id: document.getElementById('meetingCompany').value,
        title: document.getElementById('meetingTitle').value.trim(),
        meeting_date: meetingDate,
        location: document.getElementById('meetingLocation').value.trim(),
        meeting_type: document.getElementById('meetingType').value,
        notes: document.getElementById('meetingNotes').value.trim(),
        status: 'scheduled'
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
        const url = meetingId ? `/api/crm/meetings/${meetingId}` : '/api/crm/meetings';
        const method = meetingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            successMsg.innerHTML = `<strong>✅ Success!</strong><br>${meetingId ? 'Meeting updated!' : 'Meeting scheduled!'}`;
            successMsg.style.display = 'block';

            document.getElementById('meetingForm').reset();

            setTimeout(() => {
                ui.closeModal('meetingFormModal');
                if (window.crmMeetingsModule && typeof window.crmMeetingsModule.loadMeetings === 'function') {
                    window.crmMeetingsModule.loadMeetings();
                }
            }, 1500);

        } else {
            errorMsg.textContent = data.error || 'Failed to save meeting';
            errorMsg.style.display = 'block';
        }

    } catch (error) {
        console.error('Error saving meeting:', error);
        errorMsg.textContent = 'An error occurred. Please try again.';
        errorMsg.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Export to global scope
window.createMeetingFormModal = createMeetingFormModal;
window.openMeetingForm = openMeetingForm;
window.handleMeetingSubmit = handleMeetingSubmit;
