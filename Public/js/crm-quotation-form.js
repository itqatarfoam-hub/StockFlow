// ============================================
// CRM QUOTATION FORM - Complete Builder
// ============================================

let quotationLineItems = [];

function createQuotationFormModal() {
    const modalHTML = `
    <div id="quotationFormModal" class="modal">
      <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h2 id="quotationFormTitle">📄 Create Quotation</h2>
          <button class="close-btn" onclick="ui.closeModal('quotationFormModal')">&times;</button>
        </div>
        <div class="modal-body">
          <form id="quotationForm">
            <input type="hidden" id="quotationId">
            
            <!-- Basic Info -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
              <div class="form-group">
                <label class="form-label">Company *</label>
                <select id="quotationCompany" class="form-input" required>
                  <option value="">Select company</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Quotation Number *</label>
                <input type="text" id="quotationNumber" class="form-input" placeholder="AUTO" readonly style="background: #f3f4f6;">
              </div>
              
              <div class="form-group">
                <label class="form-label">Date *</label>
                <input type="date" id="quotationDate" class="form-input" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">Valid Until *</label>
                <input type="date" id="quotationValidUntil" class="form-input" required>
              </div>
            </div>

            <!-- Line Items -->
            <div class="form-group" style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <label class="form-label" style="margin: 0;">Line Items *</label>
                <button type="button" class="btn-secondary" onclick="addQuotationLineItem()">➕ Add Item</button>
              </div>
              
              <div id="lineItemsContainer" style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div id="lineItemsList"></div>
              </div>
            </div>

            <!-- Totals -->
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px; max-width: 400px; margin-left: auto;">
                <div>Subtotal:</div>
                <div><strong id="quotationSubtotal">$0.00</strong></div>
                
                <div>Tax (<span id="taxRateDisplay">0</span>%):</div>
                <div><strong id="quotationTax">$0.00</strong></div>
                
                <div>Discount:</div>
                <div><strong id="quotationDiscountAmount">$0.00</strong></div>
                
                <div style="border-top: 2px solid #d1d5db; padding-top: 10px; font-size: 18px;">Total:</div>
                <div style="border-top: 2px solid #d1d5db; padding-top: 10px; font-size: 18px;"><strong id="quotationTotal">$0.00</strong></div>
              </div>
            </div>

            <!-- Additional Fields -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
              <div class="form-group">
                <label class="form-label">Tax Rate (%)</label>
                <input type="number" id="quotationTaxRate" class="form-input" value="0" min="0" max="100" step="0.01" onchange="calculateQuotationTotals()">
              </div>
              
              <div class="form-group">
                <label class="form-label">Discount ($)</label>
                <input type="number" id="quotationDiscount" class="form-input" value="0" min="0" step="0.01" onchange="calculateQuotationTotals()">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Terms & Conditions</label>
              <textarea id="quotationTerms" class="form-input" rows="3" placeholder="Payment terms, delivery conditions, etc."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea id="quotationNotes" class="form-input" rows="2" placeholder="Internal notes (not visible to customer)"></textarea>
            </div>

            <div id="quotationErrorMsg" class="error-message" style="display: none;"></div>
            <div id="quotationSuccessMsg" class="success-message" style="display: none;"></div>
            
            <div class="modal-actions">
              <button type="button" class="btn-secondary" onclick="ui.closeModal('quotationFormModal')">Cancel</button>
              <button type="button" class="btn-secondary" onclick="saveQuotationAsDraft()">💾 Save as Draft</button>
              <button type="submit" class="btn-primary">✅ Save & Send</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

    if (!document.getElementById('quotationFormModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('quotationForm').addEventListener('submit', handleQuotationSubmit);
    }
}

async function openQuotationForm(quotationId = null) {
    createQuotationFormModal();

    // Reset
    document.getElementById('quotationForm').reset();
    document.getElementById('quotationId').value = quotationId || '';
    document.getElementById('quotationErrorMsg').style.display = 'none';
    document.getElementById('quotationSuccessMsg').style.display = 'none';
    quotationLineItems = [];

    const title = quotationId ? '✏️ Edit Quotation' : '📄 Create Quotation';
    document.getElementById('quotationFormTitle').textContent = title;

    // Set dates
    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    document.getElementById('quotationDate').value = today;
    document.getElementById('quotationValidUntil').value = validUntil.toISOString().split('T')[0];

    // Load companies
    await loadQuotationCompanies();

    if (quotationId) {
        await loadQuotationData(quotationId);
    } else {
        // Generate quotation number
        generateQuotationNumber();
        // Add one default line item
        addQuotationLineItem();
    }

    ui.openModal('quotationFormModal');
}

async function loadQuotationCompanies() {
    try {
        const response = await fetch('/api/crm/companies?status=approved', { credentials: 'same-origin' });
        const data = await response.json();

        const select = document.getElementById('quotationCompany');
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

function generateQuotationNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    document.getElementById('quotationNumber').value = `QT-${year}${month}-${random}`;
}

function addQuotationLineItem() {
    const item = {
        id: Date.now(),
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
    };

    quotationLineItems.push(item);
    renderLineItems();
}

function removeLineItem(id) {
    quotationLineItems = quotationLineItems.filter(item => item.id !== id);
    renderLineItems();
    calculateQuotationTotals();
}

function renderLineItems() {
    const container = document.getElementById('lineItemsList');

    if (quotationLineItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">No items added</p>';
        return;
    }

    const html = quotationLineItems.map(item => `
    <div style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 10px; align-items: center;">
        <input type="text" class="form-input" placeholder="Item description" value="${item.description}" 
          onchange="updateLineItem(${item.id}, 'description', this.value)">
        
        <input type="number" class="form-input" placeholder="Qty" value="${item.quantity}" min="1" step="1"
          onchange="updateLineItem(${item.id}, 'quantity', this.value)">
        
        <input type="number" class="form-input" placeholder="Price" value="${item.unit_price}" min="0" step="0.01"
          onchange="updateLineItem(${item.id}, 'unit_price', this.value)">
        
        <div style="text-align: right; font-weight: 600;">$${item.total.toFixed(2)}</div>
        
        <button type="button" class="btn-sm btn-secondary" style="color: #ef4444;" onclick="removeLineItem(${item.id})">✕</button>
      </div>
    </div>
  `).join('');

    container.innerHTML = html;
}

function updateLineItem(id, field, value) {
    const item = quotationLineItems.find(i => i.id === id);
    if (item) {
        item[field] = field === 'description' ? value : parseFloat(value) || 0;
        item.total = item.quantity * item.unit_price;
        renderLineItems();
        calculateQuotationTotals();
    }
}

function calculateQuotationTotals() {
    const subtotal = quotationLineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = parseFloat(document.getElementById('quotationTaxRate').value) || 0;
    const discount = parseFloat(document.getElementById('quotationDiscount').value) || 0;

    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax - discount;

    document.getElementById('quotationSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('quotationTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('quotationDiscountAmount').textContent = `$${discount.toFixed(2)}`;
    document.getElementById('quotationTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('taxRateDisplay').textContent = taxRate;
}

async function saveQuotationAsDraft() {
    await saveQuotation('draft');
}

async function handleQuotationSubmit(e) {
    e.preventDefault();
    await saveQuotation('sent');
}

async function saveQuotation(status) {
    const errorMsg = document.getElementById('quotationErrorMsg');
    const successMsg = document.getElementById('quotationSuccessMsg');

    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    if (quotationLineItems.length === 0) {
        errorMsg.textContent = 'Please add at least one line item';
        errorMsg.style.display = 'block';
        return;
    }

    const quotationId = document.getElementById('quotationId').value;
    const subtotal = quotationLineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = parseFloat(document.getElementById('quotationTaxRate').value) || 0;
    const discount = parseFloat(document.getElementById('quotationDiscount').value) || 0;
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax - discount;

    const formData = {
        company_id: document.getElementById('quotationCompany').value,
        quotation_number: document.getElementById('quotationNumber').value,
        quotation_date: document.getElementById('quotationDate').value,
        valid_until: document.getElementById('quotationValidUntil').value,
        subtotal,
        tax_rate: taxRate,
        tax_amount: tax,
        discount_amount: discount,
        total_amount: total,
        terms: document.getElementById('quotationTerms').value.trim(),
        notes: document.getElementById('quotationNotes').value.trim(),
        status,
        line_items: quotationLineItems
    };

    if (!formData.company_id) {
        errorMsg.textContent = 'Please select a company';
        errorMsg.style.display = 'block';
        return;
    }

    try {
        const url = quotationId ? `/api/crm/quotations/${quotationId}` : '/api/crm/quotations';
        const method = quotationId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            const action = status === 'draft' ? 'saved as draft' : 'sent';
            successMsg.innerHTML = `<strong>✅ Success!</strong><br>Quotation ${action}!`;
            successMsg.style.display = 'block';

            setTimeout(() => {
                ui.closeModal('quotationFormModal');
                if (window.crmQuotationsModule) {
                    window.crmQuotationsModule.loadQuotations();
                }
            }, 1500);
        } else {
            errorMsg.textContent = data.error || 'Failed to save quotation';
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        console.error('Error saving quotation:', error);
        errorMsg.textContent = 'An error occurred. Please try again.';
        errorMsg.style.display = 'block';
    }
}

// Export to global
window.createQuotationFormModal = createQuotationFormModal;
window.openQuotationForm = openQuotationForm;
window.addQuotationLineItem = addQuotationLineItem;
window.removeLineItem = removeLineItem;
window.updateLineItem = updateLineItem;
window.calculateQuotationTotals = calculateQuotationTotals;
window.saveQuotationAsDraft = saveQuotationAsDraft;
window.handleQuotationSubmit = handleQuotationSubmit;
