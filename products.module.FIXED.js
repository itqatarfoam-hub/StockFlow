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
          <button class="btn-categories" type="button" onclick="window.app.openCategories()">🏷️ Manage Categories</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <p class="stat-label">Total Products</p>
              <p class="stat-value" id="totalProductsCount">0</p>
            </div>
            <div class="stat-icon">📦</div>
          </div>
        </div>

        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <p class="stat-label">Total Value</p>
              <p class="stat-value" id="totalValueCount">$0</p>
            </div>
            <div class="stat-icon">💰</div>
          </div>
        </div>

        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <p class="stat-label">Low Stock Items</p>
              <p class="stat-value" id="lowStockCount">0</p>
            </div>
            <div class="stat-icon">⚠️</div>
          </div>
        </div>
      </div>

      <div class="products-table-wrapper">
        <table class="products-table">
          <thead>
            <tr>
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
            <tr><td colspan="7" style="text-align: center; padding: 40px;">Loading products...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Stock Movements Section -->
      <div style="margin-top: 30px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 16px;">📊 Recent Stock Movements</h2>
        
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
        this.loadProducts(app);
        setTimeout(() => this.loadStockMovements(app), 500);
    },

    async loadProducts(app) {
        try {
            await app.loadProducts();
            await app.loadCategories();

            this.updateStats(app);
            this.renderProductsTable(app);
        } catch (error) {
            console.error('❌ Products: Failed to load:', error);
        }
    },

    updateStats(app) {
        const totalCount = document.getElementById('totalProductsCount');
        const totalValue = document.getElementById('totalValueCount');
        const lowStockCount = document.getElementById('lowStockCount');

        if (totalCount) totalCount.textContent = app.products.length;
        if (totalValue) {
            const value = app.products.reduce((sum, p) => sum + (p.stock * p.unit_price), 0);
            totalValue.textContent = `$${value.toFixed(2)}`;
        }
        if (lowStockCount) {
            lowStockCount.textContent = app.products.filter(p => p.stock < 20).length;
        }
    },

    renderProductsTable(app) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        if (app.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #6b7280;">No products found. Click "Add Product" to get started.</td></tr>';
            return;
        }

        tbody.innerHTML = app.products.map(p => `
      <tr>
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
            <button class="action-btn" title="Edit" onclick="window.app.openEditProduct('${p.id}')">✏️</button>
            <button class="action-btn stock" title="Update Stock" onclick="window.app.openUpdateStock('${p.id}')">📦</button>
            <button class="action-btn delete" title="Delete" onclick="window.app.deleteProductConfirm('${p.id}', '${this.escapeHtml(p.name).replace(/'/g, "\\'")}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
    },

    async loadStockMovements(app) {
        const tbody = document.getElementById('stockMovementsTableBody');
        if (!tbody) return;

        try {
            const res = await fetch('/api/stock-movements', { credentials: 'same-origin' });

            if (!res.ok) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #9ca3af;">Unable to load stock movements</td></tr>';
                return;
            }

            const data = await res.json();
            const movements = data.movements || [];

            if (movements.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #9ca3af;">No stock movements yet</td></tr>';
                return;
            }

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
          <tr>
            <td style="font-size: 12px;">${date}</td>
            <td>${this.escapeHtml(product ? product.name : 'Unknown')}</td>
            <td><span style="color: ${typeColor}; font-weight: 600; text-transform: uppercase; font-size: 11px;">${m.type}</span></td>
            <td style="font-weight: 600;">${m.quantity > 0 ? '+' : ''}${m.quantity}</td>
            <td>${m.stock_before}</td>
            <td style="font-weight: 600;">${m.stock_after}</td>
            <td style="font-size: 12px; color: #6b7280;">${this.escapeHtml(m.reference || '-')}</td>
          </tr>
        `;
            }).join('');

        } catch (error) {
            console.error('❌ Failed to load stock movements:', error);
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #dc2626;">Error loading stock movements</td></tr>';
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
