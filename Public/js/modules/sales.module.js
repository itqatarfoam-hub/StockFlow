// ============================================
// SALES PAGE MODULE - PROFESSIONAL UI
// Order Entry Interface
// Updated: 2025-11-24 05:45:00 UTC
// Author: itqatarfoam-hub
// ============================================

const salesPageModule = {
  render(app) {
    // Filter sales by current user
    const userSales = app.sales?.filter(s => s.created_by === app.currentUser?.username) || [];

    const totalSales = userSales.length;
    const todaySales = userSales.filter(s => {
      const saleDate = new Date(s.sale_date);
      const today = new Date();
      return saleDate.toDateString() === today.toDateString();
    }).length;

    const totalRevenue = userSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

    return `
      <!-- Stats Cards - Compact & Colorful -->
      <!-- Sales Header Banner -->
<div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 16px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 24px;">
  <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: white;">💰 Sales Management</h2>
  <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Create and manage sales orders efficiently</p>
</div>
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
        
        <!-- Total Sales Card -->
        <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; position: relative; overflow: hidden; padding: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
          <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.15); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <p style="color: rgba(255,255,255,0.95); font-size: 11px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Sales</p>
            <p style="color: white; font-size: 28px; font-weight: 800; margin: 8px 0 0 0; line-height: 1;">${totalSales}</p>
          </div>
          <div style="position: absolute; bottom: 8px; right: 10px; font-size: 32px; opacity: 0.25;">📊</div>
        </div>

        <!-- Today's Sales Card -->
        <div class="stat-card" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; position: relative; overflow: hidden; padding: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
          <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.15); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <p style="color: rgba(255,255,255,0.95); font-size: 11px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Today's Sales</p>
            <p style="color: white; font-size: 28px; font-weight: 800; margin: 8px 0 0 0; line-height: 1;">${todaySales}</p>
          </div>
          <div style="position: absolute; bottom: 8px; right: 10px; font-size: 32px; opacity: 0.25;">📅</div>
        </div>

        <!-- Total Revenue Card -->
        <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border: none; position: relative; overflow: hidden; padding: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
          <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.15); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <p style="color: rgba(255,255,255,0.95); font-size: 11px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Revenue</p>
            <p style="color: white; font-size: 28px; font-weight: 800; margin: 8px 0 0 0; line-height: 1;">$${totalRevenue.toFixed(2)}</p>
          </div>
          <div style="position: absolute; bottom: 8px; right: 10px; font-size: 32px; opacity: 0.25;">💰</div>
        </div>
      </div>

      <!-- Main Order Entry Layout -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
        
        <!-- LEFT: Create New Sale - Order Entry -->
        <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; overflow: hidden;">
          
          <!-- Header Bar -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="margin: 0; color: white; font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                💰 Create New Sale
              </h2>
              <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 12px;">Order No: <span id="orderNumber">ORD${Date.now().toString().slice(-8)}</span></p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 11px;">Order Date</p>
              <p style="margin: 2px 0 0 0; color: white; font-size: 13px; font-weight: 600;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>

          <!-- Customer Information Section -->
          <div style="padding: 20px; background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: end;">
              <div style="flex: 1;">
                <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                  👤 Select Customer *
                </label>
                <select 
                  id="saleCustomer" 
                  class="form-select" 
                  required 
                  style="width: 100%; padding: 10px; font-size: 14px; border: 2px solid #e5e7eb; border-radius: 8px; background: white;"
                >
                  <option value="">-- Select Customer --</option>
                  ${app.customers.map(c => `<option value="${c.id}">${c.company_name} (${c.contact_person || 'N/A'})</option>`).join('')}
                </select>
              </div>
              <button 
                type="button" 
                id="addCustomerFromSalesBtn" 
                style="padding: 10px 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3); transition: all 0.2s;" 
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 10px rgba(16, 185, 129, 0.4)'" 
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 6px rgba(16, 185, 129, 0.3)'"
              >
                ➕ New Customer
              </button>
            </div>

            <!-- Customer Details Display -->
            <div id="customerDetails" style="margin-top: 12px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; display: none;">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 12px;">
                <div>
                  <p style="margin: 0; color: #6b7280; font-weight: 500;">Contact Person</p>
                  <p id="custContact" style="margin: 4px 0 0 0; color: #1f2937; font-weight: 600;">-</p>
                </div>
                <div>
                  <p style="margin: 0; color: #6b7280; font-weight: 500;">📧 Email</p>
                  <p id="custEmail" style="margin: 4px 0 0 0; color: #1f2937; font-weight: 600;">-</p>
                </div>
                <div>
                  <p style="margin: 0; color: #6b7280; font-weight: 500;">📱 Mobile</p>
                  <p id="custMobile" style="margin: 4px 0 0 0; color: #1f2937; font-weight: 600;">-</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Items Section -->
          <div style="padding: 20px;">
            <h3 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 700; color: #1f2937; display: flex; align-items: center; gap: 8px;">
              📦 Add Items to Order
            </h3>

            <!-- ⭐ FIXED: Added Total field, changed grid to 6 columns -->
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto; gap: 10px; align-items: end; margin-bottom: 16px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Product *</label>
                <select id="saleProduct" class="form-select" style="padding: 8px; font-size: 13px; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;">
                  <option value="">-- Select Product --</option>
                  ${app.products.filter(p => p.stock > 0).map(p => `<option value="${p.id}" data-price="${p.unit_price}" data-stock="${p.stock}">${p.name} (Stock: ${p.stock})</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Qty *</label>
                <input type="number" id="saleQty" class="form-input" min="1" value="1" style="padding: 8px; font-size: 13px; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;">
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Unit Price</label>
                <input type="number" id="saleUnitPrice" class="form-input" step="0.01" readonly style="padding: 8px; font-size: 13px; border: 1px solid #d1d5db; border-radius: 6px; background: #f3f4f6; width: 100%;">
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Sell Price *</label>
                <input type="number" id="saleSellPrice" class="form-input" step="0.01" min="0" style="padding: 8px; font-size: 13px; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;">
              </div>
              <!-- ⭐ NEW: Total Field -->
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Total</label>
                <input type="number" id="saleItemTotal" class="form-input" step="0.01" readonly style="padding: 8px; font-size: 13px; border: 1px solid #d1d5db; border-radius: 6px; background: #e0f2fe; width: 100%; color: #0369a1; font-weight: 700;">
              </div>
              <div>
                <!-- ⭐ FIXED: Changed to id for proper listener attachment -->
                <button type="button" id="addSaleItemBtn" style="padding: 8px 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(59, 130, 246, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(59, 130, 246, 0.3)'">
                  ➕ Add
                </button>
              </div>
            </div>

            <!-- Items Table -->
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 40px;">#</th>
                    <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 150px;">Product</th>
                    <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Description</th>
                    <th style="padding: 10px; text-align: center; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 60px;">Qty</th>
                    <th style="padding: 10px; text-align: right; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 90px;">Unit Price</th>
                    <th style="padding: 10px; text-align: right; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 90px;">Sell Price</th>
                    <th style="padding: 10px; text-align: right; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 100px;">Total</th>
                    <th style="padding: 10px; text-align: center; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 80px;">Action</th>
                  </tr>
                </thead>
                <tbody id="saleItemsTable">
                  <tr>
                    <td colspan="8" style="padding: 40px; text-align: center; color: #9ca3af; font-size: 13px;">
                      📦 No items added yet. Select a product and click "Add" to start.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Order Total Section -->
          <div style="background: #f9fafb; padding: 20px; border-top: 2px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; gap: 12px;">
                <button type="button" onclick="window.app.clearSaleItems()" style="padding: 10px 20px; background: white; color: #dc2626; border: 2px solid #dc2626; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#dc2626'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='#dc2626';">
                  🗑️ Clear All
                </button>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Order Subtotal</p>
                <p id="saleTotal" style="margin: 0; font-size: 32px; font-weight: 800; color: #1f2937; font-family: monospace; transition: all 0.3s;">$0.00</p>
              </div>
            </div>
            <div style="margin-top: 16px; display: flex; justify-content: flex-end; gap: 12px;">
              <button type="button" onclick="window.app.saveSale()" style="padding: 12px 32px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(16, 185, 129, 0.5)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.4)';">
                ✓ Post Sale
              </button>
            </div>
          </div>

        </div>
        <!-- END LEFT COLUMN -->

        <!-- RIGHT: Recent Sales -->
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; max-height: 800px; overflow-y: auto;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1f2937;">📋 Recent Sales</h3>
          <div id="recentSalesList">
            <p style="text-align: center; padding: 20px; color: #6b7280; font-size: 13px;">Loading...</p>
          </div>
        </div>
      </div>
    `;
  },

  // ⭐ FIXED: Complete attachListeners with proper event handlers
  attachListeners(app) {
    console.log('🔗 Sales: Attaching listeners...');
    this.loadRecentSales(app);

    // Customer selection listener
    const customerSelect = document.getElementById('saleCustomer');
    if (customerSelect) {
      customerSelect.addEventListener('change', () => this.updateCustomerDetails(app));
      console.log('✅ Customer selection listener attached');
    }

    // Product selection listener - auto calculate
    const productSelect = document.getElementById('saleProduct');
    if (productSelect) {
      productSelect.addEventListener('change', () => {
        this.updateProductPrice();
        this.calculateItemTotal(); // Calculate after product changes
      });
      console.log('✅ Product selection listener attached');
    }

    // Quantity change listener - auto calculate
    const qtyInput = document.getElementById('saleQty');
    if (qtyInput) {
      qtyInput.addEventListener('input', () => {
        this.calculateItemTotal(); // Calculate when qty changes
      });
      console.log('✅ Quantity input listener attached');
    }

    // Sell Price change listener - auto calculate
    const sellPriceInput = document.getElementById('saleSellPrice');
    if (sellPriceInput) {
      sellPriceInput.addEventListener('input', () => {
        this.calculateItemTotal(); // Calculate when sell price changes
      });
      console.log('✅ Sell price input listener attached');
    }

    // Add Customer button
    setTimeout(() => {
      const addCustomerBtn = document.getElementById('addCustomerFromSalesBtn');
      if (addCustomerBtn) {
        const newBtn = addCustomerBtn.cloneNode(true);
        addCustomerBtn.parentNode.replaceChild(newBtn, addCustomerBtn);

        newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔘 Add Customer button clicked');
          if (window.app && typeof window.app.openAddCustomer === 'function') {
            window.app.openAddCustomer();
          }
        });
        console.log('✅ Add Customer button listener attached');
      }
    }, 200);

    // ⭐⭐⭐ CRITICAL FIX: Add Sale Item button listener ⭐⭐⭐
    setTimeout(() => {
      const addItemBtn = document.getElementById('addSaleItemBtn');
      if (addItemBtn) {
        console.log('✅ Found Add Sale Item button');

        // Remove any existing onclick
        addItemBtn.removeAttribute('onclick');

        // Clone to remove old listeners
        const newBtn = addItemBtn.cloneNode(true);
        addItemBtn.parentNode.replaceChild(newBtn, addItemBtn);

        newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔘 ========== ADD ITEM BUTTON CLICKED ==========');

          if (!window.app) {
            console.error('❌ window.app not found!');
            alert('ERROR: Application not loaded properly. Please refresh the page.');
            return;
          }

          if (typeof window.app.addSaleItem !== 'function') {
            console.error('❌ addSaleItem method not found!');
            console.log('Available methods:', Object.keys(window.app));
            alert('ERROR: addSaleItem method missing. Please refresh the page.');
            return;
          }

          console.log('✅ Calling window.app.addSaleItem()...');
          window.app.addSaleItem();
          console.log('✅ addSaleItem() completed');
        });

        console.log('✅ ========== Add Sale Item button listener attached ==========');
      } else {
        console.error('❌ Add Sale Item button (id: addSaleItemBtn) NOT FOUND in DOM!');

        // Try to find it by other means
        const allButtons = document.querySelectorAll('button');
        console.log('🔍 Total buttons on page:', allButtons.length);
        allButtons.forEach((btn, i) => {
          if (btn.textContent.includes('Add')) {
            console.log(`  Button ${i}:`, btn.id, btn.textContent.trim());
          }
        });
      }
    }, 300); // Increased timeout to ensure DOM is ready
  },

  // ⭐ NEW: Calculate item total (Qty × Sell Price)
  calculateItemTotal() {
    const qty = parseFloat(document.getElementById('saleQty')?.value) || 0;
    const sellPrice = parseFloat(document.getElementById('saleSellPrice')?.value) || 0;
    const total = qty * sellPrice;

    const totalInput = document.getElementById('saleItemTotal');
    if (totalInput) {
      totalInput.value = total.toFixed(2);
    }

    console.log(`💰 Item total calculated: ${qty} × $${sellPrice.toFixed(2)} = $${total.toFixed(2)}`);

    // NOTE: Do NOT update Order Subtotal here - only when item is added
  },

  updateCustomerDetails(app) {
    const customerId = document.getElementById('saleCustomer').value;
    const detailsDiv = document.getElementById('customerDetails');

    if (!customerId) {
      detailsDiv.style.display = 'none';
      return;
    }

    const customer = app.customers.find(c => c.id === customerId);
    if (customer) {
      document.getElementById('custContact').textContent = customer.contact_person || '-';
      document.getElementById('custEmail').textContent = customer.email || '-';
      document.getElementById('custMobile').textContent = customer.mobile || '-';
      detailsDiv.style.display = 'block';
    }
  },

  updateProductPrice() {
    const productSelect = document.getElementById('saleProduct');
    const selectedOption = productSelect?.options[productSelect.selectedIndex];

    if (selectedOption && selectedOption.value) {
      const unitPrice = parseFloat(selectedOption.dataset.price) || 0;
      const unitPriceInput = document.getElementById('saleUnitPrice');
      const sellPriceInput = document.getElementById('saleSellPrice');

      if (unitPriceInput) {
        unitPriceInput.value = unitPrice.toFixed(2);
      }

      if (sellPriceInput) {
        sellPriceInput.value = unitPrice.toFixed(2);
      }

      console.log(`📦 Product selected - Unit Price: $${unitPrice.toFixed(2)}`);
    } else {
      const unitPriceInput = document.getElementById('saleUnitPrice');
      const sellPriceInput = document.getElementById('saleSellPrice');
      const totalInput = document.getElementById('saleItemTotal');

      if (unitPriceInput) unitPriceInput.value = '';
      if (sellPriceInput) sellPriceInput.value = '';
      if (totalInput) totalInput.value = '';
    }
  },

  loadRecentSales(app) {
    const container = document.getElementById('recentSalesList');
    if (!container) return;

    if (!app.sales || app.sales.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: 40px; color: #9ca3af; font-size: 13px;">No sales yet</p>';
      return;
    }

    const recentSales = app.sales
      .filter(sale => sale.created_by === app.currentUser?.username)
      .slice(0, 10);

    const html = recentSales.map((sale, index) => {
      const customer = app.customers.find(c => c.id === sale.customer_id);
      const saleDate = new Date(sale.sale_date);

      return `
        <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px; background: white; transition: all 0.2s; cursor: pointer;" onmouseover="this.style.borderColor='#667eea'; this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.15)';" onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #1f2937;">${customer ? customer.company_name : 'Unknown'}</p>
              <p style="margin: 0; font-size: 11px; color: #6b7280;">📅 ${saleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <span style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">
              $${sale.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }
};

window.salesPageModule = salesPageModule;