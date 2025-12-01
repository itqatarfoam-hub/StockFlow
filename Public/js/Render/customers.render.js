// ====================================================
// STOCKFLOW - CUSTOMERS RENDERS
// Customer management screens
// ====================================================

const CustomersRenders = {

    /**
     * Customers page (uses module)
     */
    renderCustomersPage() {
        return window.customersPageModule
            ? customersPageModule.render(window.app)
            : this.renderCustomersPageFallback();
    },

    /**
     * Fallback customers page
     */
    renderCustomersPageFallback() {
        return `
      <div class="customers-container">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="margin: 0 0 8px 0;">👥 Customers</h1>
            <p style="margin: 0; color: #6b7280;">Manage your customer relationships</p>
          </div>
          <button onclick="app.openAddCustomerModal()" 
                  style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            ➕ Add Customer
          </button>
        </div>
        
        <!-- Search & Filters -->
        <div class="card" style="padding: 20px; margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 16px;">
            <input type="text" id="customerSearch" placeholder="🔍 Search customers..." 
                   style="padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
            <select id="customerTypeFilter" style="padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
            <button onclick="app.refreshCustomers()" 
                    style="padding: 12px 24px; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer;">
              🔄 Refresh
            </button>
          </div>
        </div>
        
        <!-- Customers Grid -->
        <div id="customersGrid" class="customers-grid">
          <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">👥</div>
            <p style="color: #6b7280;">Loading customers...</p>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Customer card
     */
    renderCustomerCard(customer) {
        return `
      <div class="customer-card card" style="padding: 20px; transition: all 0.3s; cursor: pointer;"
           onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
           onmouseout="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'"
           onclick="app.viewCustomer(${customer.id})">
        
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 700; margin-right: 16px;">
            ${this.getInitials(customer.name)}
          </div>
          <div style="flex: 1;">
            <h3 style="margin: 0 0 4px 0; font-size: 18px; color: #1f2937;">${customer.name}</h3>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">${customer.email || 'No email'}</p>
          </div>
        </div>
        
        <div style="padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">📞 ${customer.phone || 'No phone'}</div>
          <div style="font-size: 12px; color: #6b7280;">📍 ${customer.address || 'No address'}</div>
        </div>
        
        <div style="display: flex; gap: 8px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <button onclick="event.stopPropagation(); app.editCustomer(${customer.id})" 
                  style="flex: 1; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
            ✏️ Edit
          </button>
          <button onclick="event.stopPropagation(); app.viewCustomerOrders(${customer.id})" 
                  style="flex: 1; padding: 8px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
            📋 Orders
          </button>
          <button onclick="event.stopPropagation(); app.deleteCustomer(${customer.id})" 
                  style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
            🗑️
          </button>
        </div>
      </div>
    `;
    },

    /**
     * Get initials from name
     */
    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
};

// Export for global use
window.CustomersRenders = CustomersRenders;
