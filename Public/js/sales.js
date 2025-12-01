// ============================================
// STOCKFLOW - SALES MODULE
// Author: itqatarfoam-hub
// Date: 2025-11-23 04:25:48 UTC
// ============================================

const salesModule = {
  // Load all sales
  async loadSales() {
    try {
      const response = await fetch('/api/sales', {
        credentials: 'same-origin'
      });

      const data = await response.json();

      if (response.ok) {
        return data.sales || [];
      } else {
        console.error('Failed to load sales:', data.error);
        return [];
      }
    } catch (error) {
      console.error('Load sales error:', error);
      return [];
    }
  },

  // Create sale
  async createSale(saleData) {
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(saleData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, id: data.id };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to create sale'
        };
      }
    } catch (error) {
      console.error('Create sale error:', error);
      return {
        success: false,
        error: 'Network error'
      };
    }
  },

  // Delete sale
  async deleteSale(id) {
    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to delete sale'
        };
      }
    } catch (error) {
      console.error('Delete sale error:', error);
      return {
        success: false,
        error: 'Network error'
      };
    }
  }
};

window.salesModule = salesModule;