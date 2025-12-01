// ====================================================
// STOCKFLOW - PRODUCTS RENDERS
// Product management screens
// ====================================================

const ProductsRenders = {

    /**
     * Products page (uses module)
     */
    renderProductsPage() {
        return window.productsPageModule
            ? productsPageModule.render(window.app)
            : this.renderProductsPageFallback();
    },

    /**
     * Fallback products page
     */
    renderProductsPageFallback() {
        return `
      <div class="products-container">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="margin: 0 0 8px 0;">📦 Products</h1>
            <p style="margin: 0; color: #6b7280;">Manage your inventory</p>
          </div>
          <button onclick="app.openAddProductModal()" 
                  style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            ➕ Add Product
          </button>
        </div>
        
        <!-- Filters -->
        <div class="card" style="padding: 20px; margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 16px;">
            <input type="text" id="productSearch" placeholder="🔍 Search products..." 
                   style="padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
            <select id="categoryFilter" style="padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
              <option value="">All Categories</option>
            </select>
            <select id="locationFilter" style="padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
              <option value="">All Locations</option>
            </select>
            <button onclick="app.refreshProducts()" 
                    style="padding: 12px 24px; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer;">
              🔄 Refresh
            </button>
          </div>
        </div>
        
        <!-- Products Grid -->
        <div id="productsGrid" class="products-grid">
          <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">📦</div>
            <p style="color: #6b7280;">Loading products...</p>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Product card
     */
    renderProductCard(product) {
        const lowStock = product.quantity < product.min_stock;

        return `
      <div class="product-card card" style="padding: 20px; transition: all 0.3s; cursor: pointer;"
           onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
           onmouseout="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'"
           onclick="app.viewProduct(${product.id})">
        
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 18px; color: #1f2937;">${product.name}</h3>
          ${lowStock ? '<span style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Low Stock</span>' : ''}
        </div>
        
        <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">SKU: ${product.sku || 'N/A'}</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">Price</div>
            <div style="font-size: 18px; font-weight: 700; color: #10b981;">$${parseFloat(product.price || 0).toFixed(2)}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">Stock</div>
            <div style="font-size: 18px; font-weight: 700; color: ${lowStock ? '#ef4444' : '#3b82f6'};">${product.quantity || 0}</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 8px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <button onclick="event.stopPropagation(); app.editProduct(${product.id})" 
                  style="flex: 1; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
            ✏️ Edit
          </button>
          <button onclick="event.stopPropagation(); app.deleteProduct(${product.id})" 
                  style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
            🗑️
          </button>
        </div>
      </div>
    `;
    }
};

// Export for global use
window.ProductsRenders = ProductsRenders;
