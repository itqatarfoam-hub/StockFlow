// ============================================
// CUSTOMERS MODULE
// Manage customers
// ============================================

const customersModule = (function() {
  async function loadCustomers() {
    try {
      if (window.apiCache) {
        return await apiCache.get('customers', async () => {
          const res = await fetch('/api/customers', { credentials: 'same-origin' });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const data = await res.json();
          return data.customers || [];
        });
      } else {
        const res = await fetch('/api/customers', { credentials: 'same-origin' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        return data.customers || [];
      }
    } catch (error) {
      console.error('Load customers error:', error);
      return [];
    }
  }

  async function createCustomer(customerData) {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(customerData)
      });

      const data = await res.json();

      if (res.ok) {
        if (window.apiCache) {
          apiCache.clear('customers');
        }
        return { success: true, id: data.id };
      }

      return { success: false, error: data.error || 'Failed to create customer' };
    } catch (error) {
      console.error('Create customer error:', error);
      return { success: false, error: error.message };
    }
  }

  async function updateCustomer(id, customerData) {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(customerData)
      });

      const data = await res.json();

      if (res.ok) {
        if (window.apiCache) {
          apiCache.clear('customers');
        }
        return { success: true };
      }

      return { success: false, error: data.error || 'Failed to update customer' };
    } catch (error) {
      console.error('Update customer error:', error);
      return { success: false, error: error.message };
    }
  }

  async function deleteCustomer(id) {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      const data = await res.json();

      if (res.ok) {
        if (window.apiCache) {
          apiCache.clear('customers');
        }
        return { success: true };
      }

      return { success: false, error: data.error || 'Failed to delete customer' };
    } catch (error) {
      console.error('Delete customer error:', error);
      return { success: false, error: error.message };
    }
  }

  return {
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
})();

window.customersModule = customersModule;