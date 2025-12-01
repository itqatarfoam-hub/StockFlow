// Script to add saveSale function to main.js
const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'public', 'js', 'main.js');
let content = fs.readFileSync(mainPath, 'utf8');

// Find a good place to insert - after deleteCustomer function
const insertPattern = /(async deleteCustomer\(customerId\) \{[\s\S]*?\}\s*\}[\s\S]*?\})\s+(\/\/ ========== SALE ITEM MANAGEMENT)/;

const saveSaleFunction = `

  // ========== SAVE SALE ==========
  async saveSale() {
    const customerId = document.getElementById('saleCustomer')?.value;

    if (!customerId) {
      this.showConfirm('Error', 'Please select a customer');
      return;
    }

    if (!this.currentSaleItems || this.currentSaleItems.length === 0) {
      this.showConfirm('Error', 'Please add at least one item to the sale');
      return;
    }

    const total = this.currentSaleItems.reduce((sum, item) => sum + item.total, 0);

    const saleData = {
      customer_id: customerId,
      sale_date: new Date().toISOString(),
      items: this.currentSaleItems,
      total_amount: total
    };

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(saleData)
      });

      const result = await res.json();

      if (!res.ok) {
        this.showConfirm('Error', result.error || 'Failed to create sale');
        return;
      }

      console.log('✅ Sale created successfully');

      this.showConfirm(
        'Success',
        \`✓ Sale created successfully!\\n\\nOrder Total: $\${total.toFixed(2)}\\nItems: \${this.currentSaleItems.length}\`,
        async () => {
          // Clear form
          document.getElementById('saleCustomer').value = '';
          const customerDetails = document.getElementById('customerDetails');
          if (customerDetails) customerDetails.style.display = 'none';
          
          this.currentSaleItems = [];
          this.doRenderSaleItems();
          this.updateSaleTotal();

          // Reload sales and products
          await this.loadSales();
          await this.loadProducts();

          // Re-render sales page to update stats and recent sales
          if (this.currentPage === 'sales' && window.salesPageModule) {
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
              pageContent.innerHTML = window.salesPageModule.render(this);
              window.salesPageModule.attachListeners(this);
            }
          }
        }
      );
    } catch (error) {
      console.error('❌ Error saving sale:', error);
      this.showConfirm('Error', 'An error occurred while saving the sale');
    }
  }

  `;

if (content.match(insertPattern)) {
    content = content.replace(insertPattern, `$1${saveSaleFunction}$2`);
    fs.writeFileSync(mainPath, content, 'utf8');
    console.log('✅ Successfully added saveSale function to main.js');
} else {
    console.log('❌ Could not find insertion point');

    // Try simpler pattern - just before SALE ITEM MANAGEMENT
    const simplePattern = /(\/\/ ========== SALE ITEM MANAGEMENT ==========)/;
    if (content.match(simplePattern)) {
        content = content.replace(simplePattern, `${saveSaleFunction}  $1`);
        fs.writeFileSync(mainPath, content, 'utf8');
        console.log('✅ Successfully added saveSale function to main.js (using simple pattern)');
    } else {
        console.log('❌ Could not find any suitable pattern');
    }
}
