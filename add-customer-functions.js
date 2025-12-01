// Script to add customer edit and delete functions to main.js
const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'public', 'js', 'main.js');
let content = fs.readFileSync(mainPath, 'utf8');

// Find the location after openAddCustomer function and before addSaleItem
const searchPattern = /(\s+ui\.openModal\('customerModal'\);\s+console\.log\('✅ Customer modal opened'\);\s+}\s+)(\/\/ ========== SALE ITEM MANAGEMENT ==========)/;

const customerFunctions = `
  // ========== CUSTOMER EDIT AND DELETE METHODS ==========
  openEditCustomerModal(customerId) {
    console.log('✏️ Opening Edit Customer Modal for:', customerId);
    
    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) {
      console.error('❌ Customer not found:', customerId);
      this.showConfirm('Error', 'Customer not found');
      return;
    }

    this.editingCustomerId = customerId;
    
    document.getElementById('customerModalTitle').textContent = 'Edit Customer';
    document.getElementById('companyName').value = customer.company_name || '';
    document.getElementById('contactPerson').value = customer.contact_person || '';
    document.getElementById('customerEmail').value = customer.email || '';
    document.getElementById('customerMobile').value = customer.mobile || '';
    document.getElementById('customerLocation').value = customer.location || '';
    
    const customerIdField = document.getElementById('customerIdField');
    if (customerIdField) {
      customerIdField.style.display = 'block';
      const customerIdInput = document.getElementById('customerId');
      if (customerIdInput) {
        customerIdInput.value = customer.id.substring(0, 8).toUpperCase();
      }
    }
    
    document.getElementById('customerSubmitBtn').textContent = 'Update Customer';
    document.getElementById('customerErrorMsg').textContent = '';
    
    ui.openModal('customerModal');
    console.log('✅ Edit customer modal opened for:', customer.company_name);
  }

  deleteCustomerConfirm(customerId, customerName) {
    console.log('🗑️ Delete customer confirm:', customerId, customerName);
    
    this.showConfirm(
      'Delete Customer',
      \`Are you sure you want to delete "\${customerName}"?\\n\\nThis action cannot be undone.\`,
      () => this.deleteCustomer(customerId)
    );
  }

  async deleteCustomer(customerId) {
    console.log('🗑️ Deleting customer:', customerId);
    
    try {
      const res = await fetch(\`/api/customers/\${customerId}\`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('❌ Failed to delete customer:', data.error);
        this.showConfirm('Error', data.error || 'Failed to delete customer');
        return;
      }

      console.log('✅ Customer deleted successfully');
      this.showConfirm('Success', '✓ Customer deleted successfully!', async () => {
        // Reload customers
        await this.loadCustomers();
        
        // Re-render customers page if we're on it
        if (this.currentPage === 'customers') {
          const pageContent = document.getElementById('pageContent');
          if (pageContent && window.customersPageModule) {
            pageContent.innerHTML = window.customersPageModule.render(this);
            window.customersPageModule.attachListeners(this);
          }
        }
      });
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      this.showConfirm('Error', \`Network error: \${error.message}\`);
    }
  }

  `;

const replacement = `$1${customerFunctions}$2`;

if (content.match(searchPattern)) {
    content = content.replace(searchPattern, replacement);
    fs.writeFileSync(mainPath, content, 'utf8');
    console.log('✅ Successfully added customer management functions to main.js');
} else {
    console.error('❌ Could not find the pattern to replace');
    console.log('Searching for simpler pattern...');

    // Try a simpler pattern
    const simplePattern = /(openAddCustomer\(\) \{[\s\S]*?ui\.openModal\('customerModal'\);[\s\S]*?\})\s+(\/\/ ========== SALE ITEM MANAGEMENT)/;

    if (content.match(simplePattern)) {
        content = content.replace(simplePattern, `$1\n${customerFunctions}\n  $2`);
        fs.writeFileSync(mainPath, content, 'utf8');
        console.log('✅ Successfully added customer management functions to main.js (using simpler pattern)');
    } else {
        console.error('❌ Could not find any suitable pattern to insert functions');
    }
}
