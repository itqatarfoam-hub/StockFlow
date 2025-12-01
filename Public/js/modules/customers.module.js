// ============================================
// CUSTOMERS PAGE MODULE - MODERN UI REDESIGN
// Gradient cards, grid layout, enhanced UX
// Author: itqatarfoam-hub
// Date: 2025-11-25
// ============================================

const customersPageModule = {
  /**
   * Render the Customers Page with modern design.
   * Features: Gradient stat cards, enhanced search, grid layout
   */
  render(app) {
    console.log('🎨 Rendering Customers Page (Modern UI)...');

    const totalCustomers = app.customers?.length || 0;
    const activeCustomers = app.customers?.filter(c => c.is_active !== false).length || totalCustomers;
    const recentCustomers = app.customers?.filter(c => {
      const created = new Date(c.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return created >= thirtyDaysAgo;
    }).length || 0;

    return `
      <!-- Stats Cards - Dashboard Style -->
      <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
        
        <!-- Total Customers Card -->
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; position: relative; overflow: hidden; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <p class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Customers</p>
            <p class="stat-value" style="color: white; font-size: 32px; font-weight: 700; margin: 0;">${totalCustomers}</p>
          </div>
          <div style="position: absolute; bottom: 12px; right: 16px; font-size: 40px; opacity: 0.3;">🏢</div>
        </div>

        <!-- Active Customers Card -->
        <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; position: relative; overflow: hidden; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <p class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Active Customers</p>
            <p class="stat-value" style="color: white; font-size: 32px; font-weight: 700; margin: 0;">$<span>${activeCustomers}</p>
          </div>
          <div style="position: absolute; bottom: 12px; right: 16px; font-size: 40px; opacity: 0.3;">✅</div>
        </div>

        <!-- Recent Additions Card -->
        <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border: none; position: relative; overflow: hidden; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <p class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Recent (30 days)</p>
            <p class="stat-value" style="color: white; font-size: 32px; font-weight: 700; margin: 0;">${recentCustomers}</p>
          </div>
          <div style="position: absolute; bottom: 12px; right: 16px; font-size: 40px; opacity: 0.3;">⭐</div>
        </div>

        <!-- Avg Orders Card -->
        <div class="stat-card" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; position: relative; overflow: hidden; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <p class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Orders</p>
            <p class="stat-value" style="color: white; font-size: 32px; font-weight: 700; margin: 0;">--</p>
          </div>
          <div style="position: absolute; bottom: 12px; right: 16px; font-size: 40px; opacity: 0.3;">💰</div>
        </div>
      </div>

      <!-- Enhanced Search Bar -->
      <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; border: 1px solid #e5e7eb;">
        <div style="position: relative;">
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; z-index: 1;">🔍</span>
          <input 
            type="text" 
            id="customerSearchInput" 
            placeholder="Search by company name, contact person, email, or mobile number..." 
            style="width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s;"
            onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102, 126, 234, 0.1)';"
            onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
          >
        </div>
      </div>

      <!-- Customer Grid -->
      <div id="customerListContainer">
        ${this.renderCustomerList(app.customers)}
      </div>
    `;
  },

  /**
   * Render customer list as modern grid cards
   * @param {Array} customers - Array of customer objects
   */
  renderCustomerList(customers) {
    console.log('🔄 Rendering Customer Grid with', customers.length, 'customers');

    if (!customers || customers.length === 0) {
      return `
        <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 1px solid #e5e7eb;">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">🏢</div>
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1f2937;">No customers found</h3>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Add your first customer to get started!</p>
        </div>
      `;
    }

    const customerCards = customers.map(customer => {
      const createdAt = new Date(customer.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      return `
        <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: white; transition: all 0.2s ease; cursor: pointer;" 
          onmouseover="this.style.borderColor='#667eea'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.15)'; this.style.transform='translateY(-2px)';" 
          onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'; this.style.transform='translateY(0)';">
          
          <!-- Company Name & Icon -->
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
              🏢
            </div>
            <div style="flex: 1; min-width: 0;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${this.escapeHtml(customer.company_name)}
              </h3>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${this.escapeHtml(customer.contact_person || 'No contact person')}
              </p>
            </div>
          </div>
          
          <!-- Contact Info -->
          <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
            ${customer.email ? `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 14px; flex-shrink: 0;">📧</span>
              <p style="margin: 0; font-size: 13px; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${this.escapeHtml(customer.email)}
              </p>
            </div>
            ` : ''}
            ${customer.mobile ? `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 14px; flex-shrink: 0;">📱</span>
              <p style="margin: 0; font-size: 13px; color: #374151;">
                ${this.escapeHtml(customer.mobile)}
              </p>
            </div>
            ` : ''}
            ${customer.location ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 14px; flex-shrink: 0;">📍</span>
              <p style="margin: 0; font-size: 13px; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${this.escapeHtml(customer.location)}
              </p>
            </div>
            ` : ''}
          </div>
          
          <!-- Footer: Created Date & Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #6b7280; font-weight: 500;">
              📅 ${createdAt}
            </span>
            <div style="display: flex; gap: 6px;">
              <button 
                onclick="event.stopPropagation(); window.app.openEditCustomerModal('${this.escapeHtml(customer.id)}');" 
                style="padding: 6px 12px; font-size: 11px; background: #667eea; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                onmouseover="this.style.background='#5568d3';"
                onmouseout="this.style.background='#667eea';">
                ✏️ Edit
              </button>
              <button 
                onclick="event.stopPropagation(); window.app.deleteCustomerConfirm('${this.escapeHtml(customer.id)}', '${this.escapeHtml(customer.company_name).replace(/'/g, "\\'")}');" 
                style="padding: 6px 12px; font-size: 11px; background: #ef4444; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                onmouseover="this.style.background='#dc2626';"
                onmouseout="this.style.background='#ef4444';">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div id="customersGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
        ${customerCards}
      </div>
    `;
  },

  /**
   * Attach page-specific event listeners
   */
  attachListeners(app) {
    console.log('🔗 Attaching Customers Page Listeners');

    // Search functionality
    const customerSearchInput = document.getElementById('customerSearchInput');
    if (customerSearchInput) {
      customerSearchInput.addEventListener('input', (e) => {
        const searchValue = e.target.value.toLowerCase();
        const filteredCustomers = app.customers.filter((customer) => {
          return (
            customer.company_name.toLowerCase().includes(searchValue) ||
            (customer.contact_person || '').toLowerCase().includes(searchValue) ||
            (customer.email || '').toLowerCase().includes(searchValue) ||
            (customer.mobile || '').toLowerCase().includes(searchValue)
          );
        });

        const customerListContainer = document.getElementById('customerListContainer');
        if (customerListContainer) {
          customerListContainer.innerHTML = this.renderCustomerList(filteredCustomers);
        }
      });
    }
  },

  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} text - The text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  },
};

// Expose the page module for external use
window.customersPageModule = customersPageModule;