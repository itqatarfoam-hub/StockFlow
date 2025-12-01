// ============================================
// PRODUCTS MODULE
// Manage products
// ============================================

const productsModule = (function () {
  async function loadProducts() {
    try {
      if (window.apiCache) {
        return await apiCache.get('products', async () => {
          const res = await fetch('/api/products', { credentials: 'same-origin' });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const data = await res.json();
          return data.products || [];
        });
      } else {
        const res = await fetch('/api/products', { credentials: 'same-origin' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        return data.products || [];
      }
    } catch (error) {
      console.error('Load products error:', error);
      return [];
    }
  }

  async function createProduct(productData) {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(productData)
      });

      const data = await res.json();

      if (res.ok) {
        if (window.apiCache) {
          apiCache.clear('products');
        }
        return { success: true, id: data.id };
      }

      return { success: false, error: data.error || 'Failed to create product' };
    } catch (error) {
      console.error('Create product error:', error);
      return { success: false, error: error.message };
    }
  }

  async function updateProduct(id, productData) {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(productData)
      });

      const data = await res.json();

      if (res.ok) {
        if (window.apiCache) {
          apiCache.clear('products');
        }
        return { success: true };
      }

      return { success: false, error: data.error || 'Failed to update product' };
    } catch (error) {
      console.error('Update product error:', error);
      return { success: false, error: error.message };
    }
  }

  async function deleteProduct(id) {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      const data = await res.json();

      if (res.ok) {
        if (window.apiCache) {
          apiCache.clear('products');
        }
        return { success: true };
      }

      return { success: false, error: data.error || 'Failed to delete product' };
    } catch (error) {
      console.error('Delete product error:', error);
      return { success: false, error: error.message };
    }
  }

  async function updateStock(id, newStock, notes) {
    try {
      console.log('📦 productsModule.updateStock called with:', { id, newStock, notes });

      const res = await fetch(`/api/products/${encodeURIComponent(id)}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ stock: newStock, notes: notes })
      });

      const data = await res.json();

      if (res.ok) {
        if (window.apiCache) {
          apiCache.clear('products');
        }
        return { success: true };
      }

      return { success: false, error: data.error || 'Failed to update stock' };
    } catch (error) {
      console.error('Update stock error:', error);
      console.error('Error details:', { name: error.name, message: error.message });
      return { success: false, error: error.message };
    }
  }

  return {
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock
  };
})();

window.productsModule = productsModule;