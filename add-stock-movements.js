const fs = require('fs');
const path = require('path');

const productsModulePath = path.join(__dirname, 'public', 'js', 'modules', 'products.module.js');

// Read the file
let content = fs.readFileSync(productsModulePath, 'utf8');

// Add stock movements HTML section before the closing backtick in render()
const oldClosing = `      </div>
    \`;
  },`;

const newClosing = `      </div>

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
    \`;
  },`;

content = content.replace(oldClosing, newClosing);

// Add loadStockMovements method before escapeHtml
const insertLoadStockMovements = `
  async loadStockMovements(app) {
    const tbody = document.getElementById('stockMovementsTableBody');
    if (!tbody) return;

    try {
      // Fetch stock movements from API
      const res = await fetch('/api/stock-movements', {
        credentials: 'same-origin'
      });

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

      // Render stock movements (most recent first)
      tbody.innerHTML = movements.slice(0, 20).map(m => {
        const product = app.products.find(p => p.id === m.product_id);
        const productName = product ? product.name : 'Unknown';
        const date = new Date(m.created_at).toLocaleDateString('en-US', {
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

        return \`
          <tr>
            <td style="font-size: 12px;">\${date}</td>
            <td>\${this.escapeHtml(productName)}</td>
            <td><span style="color: \${typeColor}; font-weight: 600; text-transform: uppercase; font-size: 11px;">\${m.type}</span></td>
            <td style="font-weight: 600;">\${m.quantity > 0 ? '+' : ''}\${m.quantity}</td>
            <td>\${m.stock_before}</td>
            <td style="font-weight: 600;">\${m.stock_after}</td>
            <td style="font-size: 12px; color: #6b7280;">\${this.escapeHtml(m.reference || '-')}</td>
          </tr>
        \`;
      }).join('');

    } catch (error) {
      console.error('❌ Failed to load stock movements:', error);
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #dc2626;">Error loading stock movements</td></tr>';
    }
  },

`;

// Find where to insert (before escapeHtml method)
content = content.replace('  escapeHtml(text) {', insertLoadStockMovements + '  escapeHtml(text) {');

// Update attachListeners to also load stock movements
const oldAttachListeners = `  attachListeners(app) {
    console.log('🔗 Products: Attaching listeners...');
    this.loadProducts(app);
  },`;

const newAttachListeners = `  attachListeners(app) {
    console.log('🔗 Products: Attaching listeners...');
    this.loadProducts(app);
    this.loadStockMovements(app);
  },`;

content = content.replace(oldAttachListeners, newAttachListeners);

// Write back
fs.writeFileSync(productsModulePath, content, 'utf8');
console.log('✅ Successfully added stock movements section!');
console.log('   - Stock movements table added below products list');
console.log('   - loadStockMovements method added');
console.log('   - Loads from /api/stock-movements endpoint');
