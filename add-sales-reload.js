// Script to add sales loading and update functionality to main.js
const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'public', 'js', 'main.js');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. Find where to add loadSales method (after loadCustomers)
const loadCustomersPattern = /(async loadCustomers\(\) \{[\s\S]*?\})\r?\n/;

const loadSalesMethod = `
  async loadSales() {
    try {
      const res = await fetch('/api/sales', { credentials: 'same-origin' });
      if (!res.ok) {
        console.error('❌ Failed to load sales');
        this.sales = [];
        return [];
      }
      const data = await res.json();
      this.sales = data.sales || [];
      console.log(\`✅ Loaded \${this.sales.length} sales\`);
      return this.sales;
    } catch (error) {
      console.error('❌ Error loading sales:', error);
      this.sales = [];
      return [];
    }
  }
`;

if (content.match(loadCustomersPattern)) {
    content = content.replace(loadCustomersPattern, `$1\r\n${loadSalesMethod}\r\n`);
    console.log('✅ Added loadSales method');
} else {
    console.log('❌ Could not find loadCustomers pattern');
}

// 2. Update loadInitialData to include sales
const loadInitialDataPattern = /(async loadInitialData\(\) \{[\s\S]*?await this\.loadCustomers\(\);)/;

if (content.match(loadInitialDataPattern)) {
    content = content.replace(loadInitialDataPattern, `$1\r\n      await this.loadSales();`);
    console.log('✅ Updated loadInitialData to load sales');
} else {
    console.log('⚠️ Could not update loadInitialData');
}

// 3. Find the saveSale or completeSale function and ensure it reloads data
// First, let's search for where sales are posted
const postSalePattern = /(const result = await salesModule\.createSale\(saleData\);[\s\S]*?if \(!result\.success\) \{[\s\S]*?\}[\s\S]*?)(this\.showConfirm\([\s\S]*?'Success',[\s\S]*?async \(\) => \{)/;

const updateAfterSale = `
          // Reload sales data to update stats and recent list
          await this.loadSales();
          await this.loadProducts();

          // Re-render the sales page to update stats cards
          if (this.currentPage === 'sales') {
            const pageContent = document.getElementById('pageContent');
            if (pageContent && window.salesPageModule) {
              pageContent.innerHTML = window.salesPageModule.render(this);
              window.salesPageModule.attachListeners(this);
            }
          }
`;

// Try a simpler pattern
const simpleSalePattern = /(salesModule\.createSale[\s\S]{0,300}showConfirm\(\s*'Success'[\s\S]{0,100}async \(\) => \{)/;

if (content.match(simpleSalePattern)) {
    content = content.replace(simpleSalePattern, (match) => {
        return match + updateAfterSale;
    });
    console.log('✅ Updated sale completion to reload data and re-render');
} else {
    console.log('⚠️ Could not find sale completion pattern');
}

// Write the updated content
fs.writeFileSync(mainPath, content, 'utf8');
console.log('✅ Script completed successfully!');
