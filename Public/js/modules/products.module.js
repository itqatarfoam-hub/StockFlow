// ============================================
// PRODUCTS MODULE - Complete with Stock Movements
// Author: itqatarfoam-hub
// Date: 2025-11-26
// ============================================

const productsPageModule = {
  render() {
    return `
      <div class="products-header">
        <div>
          <h1 class="products-title">Item Management</h1>
          <p class="products-subtitle">Manage your product catalog</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-add-product" type="button" onclick="window.app.openAddProduct()">+ Add Product</button>
          <button class="btn-locations" type="button" onclick="window.app.openLocations()">📍 Manage Locations</button>
          <button class="btn-categories" type="button" onclick="window.app.openCategories()">🏷️ Manage Categories</button>
        </div>
      </div>

      <!-- Stats Cards - Dashboard Style (4 Cards Side by Side) -->
      <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
        
        <!-- Total Locations Card -->
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; position: relative; overflow: hidden; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <p class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Locations</p>
            <p class="stat-value" style="color: white; font-size: 32px; font-weight: 700; margin: 0;" id="totalLocationsCount">0</p>
          </div>
          <div style="position: absolute; bottom: 12px; right: 16px; font-size: 40px; opacity: 0.3;">📍</div>
        </div>

        <!-- Total Categories Card -->
        <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; position: relative; overflow: hidden; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <p class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Categories</p>
            <p class="stat-value" style="color: white; font-size: 32px; font-weight: 700; margin: 0;" id="totalCategoriesCount">0</p>
          </div>
          <div style="position: absolute; bottom: 12px; right: 16px; font-size: 40px; opacity: 0.3;">🏷️</div>
        </div>

        <!-- Total Products Card -->
        <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border: none; position: relative; overflow: hidden; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <p class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Products</p>
            <p class="stat-value" style="color: white; font-size: 32px; font-weight: 700; margin: 0;" id="totalProductsCount">0</p>
          </div>
          <div style="position: absolute; bottom: 12px; right: 16px; font-size: 40px; opacity: 0.3;">📦</div>
        </div>

        <!-- Low Stock Items Card -->
        <div class="stat-card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border: none; position: relative; overflow: hidden; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <p class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Low Stock Items</p>
            <p class="stat-value" style="color: white; font-size: 32px; font-weight: 700; margin: 0;" id="lowStockCount">0</p>
          </div>
          <div style="position: absolute; bottom: 12px; right: 16px; font-size: 40px; opacity: 0.3;">⚠️</div>
        </div>
      </div>

      <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 20px;">
        <div style="flex: 1; position: relative;">
          <input type="text" id="productSearchInput" placeholder="Search by location, category, ID, name, description, price..." 
            style="width: 100%; padding: 12px 40px 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e5e7eb'">
          <button id="clearSearchBtn" onclick="window.productsPageModule.clearSearch(window.app)" 
            style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 18px; cursor: pointer; color: #9ca3af; display: none; padding: 4px;">✕</button>
        </div>
        <button type="button" class="btn-add-product" onclick="window.app.openItemReportsModal()" style="white-space: nowrap;">
          <span>📊</span> Item Reports
        </button>
      </div>

      <div class="products-table-wrapper">
        <table class="products-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Category</th>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Stock Qty</th>
              <th>Unit Price</th>
              <th>Entry Date</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="productsTableBody">
            <tr><td colspan="8" style="text-align: center; padding: 40px;">Loading products...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Stock Movements Section -->
      <div style="margin-top: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h2 style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0;">📊 Recent Stock Movements</h2>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn-reports" onclick="window.app.openReportsModal()" style="padding: 6px 14px; font-size: 13px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-weight: 500;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">📄 Reports</button>
              <button type="button" onclick="window.productsPageModule.loadStockMovements(window.app)" style="padding: 6px 12px; font-size: 13px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">🔄 Refresh</button>
            </div>
        </div>
        
        <div class="products-table-wrapper">
          <table class="products-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Before</th>
                <th>After</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody id="stockMovementsTableBody">
              <tr><td colspan="7" style="text-align: center; padding: 40px;">Loading stock movements...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  attachListeners(app) {
    console.log('🔗 Products: Attaching listeners...');
    this.loadProducts(app).then(() => {
      this.loadStockMovements(app);
    });

    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(app, e.target.value));
    }
  },

  async loadProducts(app) {
    try {
      await app.loadProducts();
      await app.loadCategories();
      await app.loadLocations();

      this.updateStats(app);
      this.renderProductsTable(app);
    } catch (error) {
      console.error('❌ Products: Failed to load:', error);
    }
  },

  handleSearch(app, query) {
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
      clearBtn.style.display = query ? 'block' : 'none';
    }

    if (!query) {
      this.renderProductsTable(app);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const minRows = 5;
    const filteredProducts = app.products.filter(p =>
      (p.location_name && p.location_name.toLowerCase().includes(lowerQuery)) ||
      (p.category_name && p.category_name.toLowerCase().includes(lowerQuery)) ||
      (p.product_id && p.product_id.toLowerCase().includes(lowerQuery)) ||
      (p.name && p.name.toLowerCase().includes(lowerQuery)) ||
      (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
      (p.unit_price && p.unit_price.toString().includes(lowerQuery))
    );

    this.renderProductsTable(app, filteredProducts);
  },

  clearSearch(app) {
    const input = document.getElementById('productSearchInput');
    if (input) {
      input.value = '';
      input.focus();
      this.handleSearch(app, '');
    }
  },

  updateStats(app) {
    const totalLocations = document.getElementById('totalLocationsCount');
    const totalCategories = document.getElementById('totalCategoriesCount');
    const totalCount = document.getElementById('totalProductsCount');
    const lowStockCount = document.getElementById('lowStockCount');

    if (totalLocations) totalLocations.textContent = app.locations?.length || 0;
    if (totalCategories) totalCategories.textContent = app.categories?.length || 0;
    if (totalCount) totalCount.textContent = app.products.length;
    if (lowStockCount) {
      lowStockCount.textContent = app.products.filter(p => p.stock < 20).length;
    }
  },

  renderProductsTable(app, products = null) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const productsToRender = products || app.products;

    if (productsToRender.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #6b7280;">No products found matching your search.</td></tr>';
      return;
    }

    tbody.innerHTML = productsToRender.map(p => `
      <tr style="height: 50px;">
        <td><span class="category-badge" style="background: #e0e7ff; color: #3730a3;">${this.escapeHtml(p.location_name || 'Unknown')}</span></td>
        <td><span class="category-badge">${this.escapeHtml(p.category_name || 'Unknown')}</span></td>
        <td><div class="product-name">${this.escapeHtml(p.product_id)}</div></td>
        <td>
          <div class="product-name">${this.escapeHtml(p.name)}</div>
          <div class="product-desc">${this.escapeHtml(p.description || 'No description')}</div>
        </td>
        <td style="font-weight: 600; color: ${p.stock < 20 ? '#dc2626' : '#10b981'};">${p.stock}</td>
        <td>$${parseFloat(p.unit_price).toFixed(2)}</td>
        <td>${new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
        <td>
          <div class="actions-cell">
            <button class="action-btn edit-btn" title="Edit" data-id="${p.id}" onclick="window.app.openEditProduct('${p.id}')">✏️</button>
            <button class="action-btn stock-btn" title="Update Stock" data-id="${p.id}" onclick="window.app.openUpdateStock('${p.id}')">📦</button>
            <button class="action-btn delete-btn" title="Delete" data-id="${p.id}" data-name="${this.escapeHtml(p.name).replace(/"/g, '&quot;')}" onclick="window.app.deleteProductConfirm('${p.id}', '${this.escapeHtml(p.name).replace(/'/g, "\\'")}')" >🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  async loadStockMovements(app) {
    console.log('📊 Loading stock movements...');
    const tbody = document.getElementById('stockMovementsTableBody');
    if (!tbody) {
      console.error('❌ Stock movements table body not found');
      return;
    }

    // Show loading state
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #6b7280;">Loading stock movements...</td></tr>';

    try {
      // Ensure products are loaded for name lookup
      if (!app.products || app.products.length === 0) {
        console.log('📦 Products not loaded yet, fetching...');
        await app.loadProducts();
      }

      const res = await fetch('/api/stock-movements', { credentials: 'same-origin' });
      console.log('📊 Stock movements API response status:', res.status);

      if (!res.ok) {
        console.error('❌ Failed to fetch stock movements:', res.statusText);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #dc2626;">Unable to load stock movements</td></tr>';
        return;
      }

      const data = await res.json();
      console.log('📊 Stock movements data:', data);
      const movements = data.movements || [];

      if (movements.length === 0) {
        console.log('ℹ️ No stock movements found');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #9ca3af;">No stock movements yet</td></tr>';
        return;
      }

      console.log(`✅ Rendering ${movements.length} stock movements`);

      tbody.innerHTML = movements.slice(0, 20).map(m => {
        const product = app.products.find(p => p.id === m.product_id);
        const date = new Date(m.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const typeColors = {
          'in': '#10b981',
          'out': '#dc2626',
          'adjustment': '#f59e0b'
        };
        const typeColor = typeColors[m.type] || '#6b7280';

        return `
          <tr style="height: 50px;">
            <td style="font-size: 12px;">${date}</td>
            <td>${this.escapeHtml(product ? product.name : 'Unknown Product')}</td>
            <td><span style="color: ${typeColor}; font-weight: 600; text-transform: uppercase; font-size: 11px;">${m.type}</span></td>
            <td style="font-weight: 600;">${m.quantity > 0 ? '+' : ''}${m.quantity}</td>
            <td>${m.stock_before}</td>
            <td style="font-weight: 600;">${m.stock_after}</td>
            <td style="font-size: 12px; color: #6b7280;">${this.escapeHtml(m.reference ? m.reference : '-')}</td>
          </tr>
        `;
      }).join('');

    } catch (error) {
      console.error('❌ Failed to load stock movements:', error);
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: #dc2626;">Error loading stock movements: ${error.message}</td></tr>`;
    }
  },

  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
};

window.productsPageModule = productsPageModule;
