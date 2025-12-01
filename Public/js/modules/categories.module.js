// ============================================
// CATEGORIES MODULE - Complete from app.js
// Author: itqatarfoam-hub
// Date: 2025-11-23 05:10:37 UTC
// Current user: itqatarfoam-hub
// ============================================

const categoriesPageModule = {
  render() {
    return `
      <div class="page-header">
        <h1>📋 Category Management</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">Manage product categories</p>
      </div>

      <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937;">Categories List</h2>
        <div id="categoriesList">
          <p style="text-align: center; padding: 40px; color: #6b7280;">Loading categories...</p>
        </div>
      </div>
    `;
  },

  attachListeners(app) {
    console.log('🔗 Categories: Attaching listeners...');
    this.loadCategories(app);
  },

  async loadCategories(app) {
    try {
      await app.loadCategories();
      this.renderCategoriesList(app);
    } catch (error) {
      console.error('❌ Categories: Failed to load:', error);
    }
  },

  renderCategoriesList(app) {
    const container = document.getElementById('categoriesList');
    if (!container) return;

    if (app.categories.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: 40px; color: #6b7280;">No categories found. Create one using "Manage Categories" in Products page.</p>';
      return;
    }

    const sortedCategories = [...app.categories].sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
        ${sortedCategories.map((cat, index) => `
          <div class="category-item">
            <div class="category-item-index">${index + 1}</div>
            <div class="category-item-info">
              <p class="category-item-name">${this.escapeHtml(cat.name)}</p>
              <p class="category-item-desc">${this.escapeHtml(cat.description || 'No description')}</p>
            </div>
            <div class="category-item-actions">
              <button class="btn-small btn-edit" onclick="window.app.editCategory('${cat.id}')">Edit</button>
              <button class="btn-small btn-delete" onclick="window.app.deleteCategoryConfirm('${cat.id}', '${this.escapeHtml(cat.name).replace(/'/g, "\\'")}')">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
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

window.categoriesPageModule = categoriesPageModule;