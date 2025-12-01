// ============================================
// CRM COMPANY REGISTRATION MODAL
// ============================================

function createCompanyRegistrationModal() {
    const modalHTML = `
    <div id="companyRegistrationModal" class="modal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h2>🏢 Company Registration</h2>
          <button class="close-btn" onclick="ui.closeModal('companyRegistrationModal')">&times;</button>
        </div>
        <div class="modal-body">
          <form id="companyRegistrationForm">
            <div id="companyRegErrorMsg" class="error-message" style="display: none;"></div>
            <div id="companyRegSuccessMsg" class="success-message" style="display: none;"></div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <!-- Company Name -->
              <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label">Company Name *</label>
                <input type="text" id="companyName" class="form-input" placeholder="Enter company name" required>
              </div>

              <!-- Contact Person -->
              <div class="form-group">
                <label class="form-label">Contact Person *</label>
                <input type="text" id="contactPerson" class="form-input" placeholder="Full name" required>
              </div>

              <!-- Phone -->
              <div class="form-group">
                <label class="form-label">Phone Number *</label>
                <input type="tel" id="companyPhone" class="form-input" placeholder="+1234567890" required>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label class="form-label">Email Address *</label>
                <input type="email" id="companyEmail" class="form-input" placeholder="email@company.com" required>
              </div>

              <!-- Website -->
              <div class="form-group">
                <label class="form-label">Website</label>
                <input type="url" id="companyWebsite" class="form-input" placeholder="https://company.com">
              </div>

              <!-- Address -->
              <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label">Address</label>
                <textarea id="companyAddress" class="form-input" rows="2" placeholder="Company address"></textarea>
              </div>

              <!-- Industry Type -->
              <div class="form-group">
                <label class="form-label">Industry Type</label>
                <select id="industryType" class="form-input">
                  <option value="">Select industry</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Construction">Construction</option>
                  <option value="Education">Education</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <!-- Number of Employees -->
              <div class="form-group">
                <label class="form-label">Number of Employees</label>
                <select id="numEmployees" class="form-input">
                  <option value="">Select range</option>
                  <option value="1">1-10</option>
                  <option value="10">11-50</option>
                  <option value="50">51-200</option>
                  <option value="200">201-500</option>
                  <option value="500">500+</option>
                </select>
              </div>
            </div>

            <div class="modal-actions" style="margin-top: 20px;">
              <button type="button" class="btn-secondary" onclick="ui.closeModal('companyRegistrationModal')">Cancel</button>
              <button type="submit" class="btn-primary" id="submitCompanyBtn">
                <span id="submitBtnText">📝 Submit for Approval</span>
                <span id="submitBtnLoader" style="display: none;">⏳ Submitting...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

    // Add modal to page if it doesn't exist
    if (!document.getElementById('companyRegistrationModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Attach form submit handler
        document.getElementById('companyRegistrationForm').addEventListener('submit', handleCompanySubmit);
    }
}

async function handleCompanySubmit(e) {
    e.preventDefault();

    const errorMsg = document.getElementById('companyRegErrorMsg');
    const successMsg = document.getElementById('companyRegSuccessMsg');
    const submitBtn = document.getElementById('submitCompanyBtn');
    const btnText = document.getElementById('submitBtnText');
    const btnLoader = document.getElementById('submitBtnLoader');

    // Hide messages
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    // Get form values
    const formData = {
        company_name: document.getElementById('companyName').value.trim(),
        contact_person: document.getElementById('contactPerson').value.trim(),
        phone: document.getElementById('companyPhone').value.trim(),
        email: document.getElementById('companyEmail').value.trim(),
        website: document.getElementById('companyWebsite').value.trim(),
        address: document.getElementById('companyAddress').value.trim(),
        industry_type: document.getElementById('industryType').value,
        num_employees: parseInt(document.getElementById('numEmployees').value) || 0
    };

    // Validate required fields
    if (!formData.company_name || !formData.contact_person || !formData.phone || !formData.email) {
        errorMsg.textContent = 'Please fill in all required fields';
        errorMsg.style.display = 'block';
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    try {
        const response = await fetch('/api/crm/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            // Show success message
            successMsg.innerHTML = `
        <strong>✅ Success!</strong><br>
        ${data.message}<br>
        <small>You will be notified once your company is approved by our team.</small>
      `;
            successMsg.style.display = 'block';

            // Reset form
            document.getElementById('companyRegistrationForm').reset();

            // Close modal after 3 seconds
            setTimeout(() => {
                ui.closeModal('companyRegistrationModal');
                // Refresh dashboard if on CRM page
                if (window.crmDashboardModule && typeof window.crmDashboardModule.loadDashboardData === 'function') {
                    window.crmDashboardModule.loadDashboardData();
                }
            }, 3000);

        } else {
            errorMsg.textContent = data.error || 'Failed to register company';
            errorMsg.style.display = 'block';
        }

    } catch (error) {
        console.error('Error submitting company:', error);
        errorMsg.textContent = 'An error occurred. Please try again.';
        errorMsg.style.display = 'block';
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Make functions globally available
window.createCompanyRegistrationModal = createCompanyRegistrationModal;
window.handleCompanySubmit = handleCompanySubmit;
