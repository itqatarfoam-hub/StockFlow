// ============================================
// CATEGORIES MODULE
// Manage product categories
// ============================================

const categoriesModule = (function() {
  async function loadCategories() {
    try {
      if (window.apiCache) {
        return await apiCache.get('categories', async () => {
          const res = await fetch('/api/categories', { credentials: 'same-origin' });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const data = await res.json();
          return data.categories || [];
        });
      } else {
        const res = await fetch('/api/categories', { credentials: 'same-origin' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        return data.categories || [];
      }
    } catch (error) {
      console.error('Load categories error:', error);
      return [];
    }
  }

  async function createCategory(categoryData) {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(categoryData)
      });

      const data = await res.json();

      if (res.ok) {
        if (window.apiCache) {
          apiCache.clear('categories');
        }
        return { success: true, id: data.id };
      }

      return { success: false, error: data.error || 'Failed to create category' };
    } catch (error) {
      console.error('Create category error:', error);
      return { success: false, error: error.message };
    }
  }

  async function updateCategory(id, categoryData) {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(categoryData)
      });

      const data = await res.json();

      if (res.ok) {
        if (window.apiCache) {
          apiCache.clear('categories');
        }
        return { success: true };
      }

      return { success: false, error: data.error || 'Failed to update category' };
    } catch (error) {
      console.error('Update category error:', error);
      return { success: false, error: error.message };
    }
  }

  async function deleteCategory(id) {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      const data = await res.json();

      if (res.ok) {
        if (window.apiCache) {
          apiCache.clear('categories');
        }
        return { success: true };
      }

      return { success: false, error: data.error || 'Failed to delete category' };
    } catch (error) {
      console.error('Delete category error:', error);
      return { success: false, error: error.message };
    }
  }

  return {
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
})();

window.categoriesModule = categoriesModule;