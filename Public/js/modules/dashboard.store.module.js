// ============================================
// STORE DASHBOARD MODULE (Advanced & Professional)
// Author: itqatarfoam-hub
// Date: 2025-11-27 13:59:51 UTC
// ============================================

const storeDashboardModule = {
    render() {
        return `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 24px;">
        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: white;">📦 Store Management Dashboard</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Real-time inventory tracking and stock management</p>
      </div>

      <!-- KPI Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #667eea; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Items</div>
            <div style="background: #eef2ff; padding: 8px; border-radius: 8px;">
              <span style="font-size: 20px;">📦</span>
            </div>
          </div>
          <div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 4px;" id="storeTotalProducts">0</div>
          <div style="font-size: 12px; color: #10b981;">
            <span id="storeProductTrend">↑ 12% from last month</span>
          </div>
        </div>

        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #10b981; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">In Stock</div>
            <div style="background: #dcfce7; padding: 8px; border-radius: 8px;">
              <span style="font-size: 20px;">✅</span>
            </div>
          </div>
          <div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 4px;" id="storeInStock">0</div>
          <div style="font-size: 12px; color: #6b7280;">
            <span id="storeInStockPercent">0% of total items</span>
          </div>
        </div>

        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #f59e0b; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Low Stock</div>
            <div style="background: #fef3c7; padding: 8px; border-radius: 8px;">
              <span style="font-size: 20px;">⚠️</span>
            </div>
          </div>
          <div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 4px;" id="storeLowStock">0</div>
          <div style="font-size: 12px; color: #f59e0b;">
            <span id="storeLowStockPercent">Needs immediate attention</span>
          </div>
        </div>

        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #3b82f6; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Stock Value</div>
            <div style="background: #dbeafe; padding: 8px; border-radius: 8px;">
              <span style="font-size: 20px;">💰</span>
            </div>
          </div>
          <div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 4px;" id="storeStockValue">$0</div>
          <div style="font-size: 12px; color: #3b82f6;">
            <span id="storeValueTrend">Total inventory value</span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
        <!-- Stock Level Analytics -->
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">📊 Stock Level Analytics</h3>
            <select id="storeAnalyticsPeriod" style="padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; background: white; cursor: pointer;">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <div id="stockLevelChart" style="min-height: 300px;">
            <div style="text-align: center; padding: 60px 0; color: #6b7280;">
              <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
              <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">Stock Analytics</p>
              <p style="margin: 8px 0 0 0; font-size: 14px;">Visual representation of stock levels over time</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1f2937;">⚡ Quick Actions</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button onclick="window.app.navigateTo('products')" style="padding: 16px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
              <span style="font-size: 24px;">➕</span>
              <span>Add New Product</span>
            </button>
            <button onclick="window.app.navigateTo('products')" style="padding: 16px; background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
              <span style="font-size: 24px;">📦</span>
              <span>Update Stock Levels</span>
            </button>
            <button onclick="window.app.navigateTo('products')" style="padding: 16px; background: linear-gradient(135deg, #fa709a, #fee140); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
              <span style="font-size: 24px;">📋</span>
              <span>View All Inventory</span>
            </button>
          </div>

          <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;">
            <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #1f2937;">📌 Store Tips</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #6b7280; line-height: 1.8;">
              <li>Check low stock items daily</li>
              <li>Update stock after receiving shipments</li>
              <li>Review stock movements weekly</li>
              <li>Report discrepancies immediately</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Low Stock Items Alert -->
      <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 24px;">
        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1f2937;">⚠️ Low Stock Alerts</h3>
        <div id="lowStockItems">
          <p style="color: #6b7280; text-align: center; padding: 20px 0;">Loading low stock items...</p>
        </div>
      </div>

      <!-- Recent Stock Movements -->
      <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1f2937;">📝 Recent Stock Movements</h3>
        <div id="recentMovements">
          <p style="color: #6b7280; text-align: center; padding: 20px 0;">Loading recent movements...</p>
        </div>
      </div>
    `;
    },

    attachListeners(app) {
        console.log('🔗 Store Dashboard: Attaching listeners...');
        this.loadStats(app);
    },

    async loadStats(app) {
        try {
            await app.loadInitialData();

            const totalProducts = app.products.length;
            const inStock = app.products.filter(p => p.stock > 0).length;
            const lowStock = app.products.filter(p => p.stock < 20 && p.stock > 0).length;
            const outOfStock = app.products.filter(p => p.stock === 0).length;
            const totalValue = app.products.reduce((sum, p) => sum + (p.stock * p.unit_price), 0);

            // Update KPI cards
            const storeTotalProducts = document.getElementById('storeTotalProducts');
            const storeInStock = document.getElementById('storeInStock');
            const storeLowStock = document.getElementById('storeLowStock');
            const storeStockValue = document.getElementById('storeStockValue');
            const storeInStockPercent = document.getElementById('storeInStockPercent');

            if (storeTotalProducts) storeTotalProducts.textContent = totalProducts;
            if (storeInStock) storeInStock.textContent = inStock;
            if (storeLowStock) storeLowStock.textContent = lowStock;
            if (storeStockValue) storeStockValue.textContent = `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            if (storeInStockPercent) {
                const percent = totalProducts > 0 ? ((inStock / totalProducts) * 100).toFixed(1) : 0;
                storeInStockPercent.textContent = `${percent}% of total items`;
            }

            // Update low stock items
            const lowStockItems = document.getElementById('lowStockItems');
            if (lowStockItems) {
                const lowStockProducts = app.products.filter(p => p.stock < 20 && p.stock > 0).slice(0, 5);

                if (lowStockProducts.length > 0) {
                    lowStockItems.innerHTML = `
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Category</th>
                    <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Current Stock</th>
                    <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${lowStockProducts.map(p => {
                        const category = app.categories.find(c => c.id === p.category_id);
                        const statusColor = p.stock < 10 ? '#ef4444' : '#f59e0b';
                        const statusText = p.stock < 10 ? 'Critical' : 'Low';
                        return `
                      <tr style="border-bottom: 1px solid #f3f4f6;">
                        <td style="padding: 12px; font-size: 14px; color: #1f2937; font-weight: 500;">${p.name}</td>
                        <td style="padding: 12px; font-size: 14px; color: #6b7280;">${category ? category.name : 'N/A'}</td>
                        <td style="padding: 12px; text-align: center; font-size: 16px; font-weight: 700; color: ${statusColor};">${p.stock}</td>
                        <td style="padding: 12px; text-align: center;">
                          <span style="padding: 4px 12px; background: ${statusColor}22; color: ${statusColor}; border-radius: 12px; font-size: 12px; font-weight: 600;">${statusText}</span>
                        </td>
                      </tr>
                    `;
                    }).join('')}
                </tbody>
              </table>
            </div>
            ${lowStockProducts.length < app.products.filter(p => p.stock < 20 && p.stock > 0).length ?
                            `<p style="text-align: center; margin: 16px 0 0 0; font-size: 13px; color: #6b7280;">
                Showing 5 of ${app.products.filter(p => p.stock < 20 && p.stock > 0).length} low stock items. 
                <a href="#" onclick="window.app.navigateTo('products'); return false;" style="color: #667eea; font-weight: 600;">View all →</a>
              </p>` : ''}
          `;
                } else {
                    lowStockItems.innerHTML = `
            <div style="text-align: center; padding: 40px 0;">
              <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
              <p style="margin: 0; font-size: 16px; font-weight: 600; color: #10b981;">All Stock Levels Healthy</p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">No items currently below low stock threshold</p>
            </div>
          `;
                }
            }

            // Update recent movements (mock data for now)
            const recentMovements = document.getElementById('recentMovements');
            if (recentMovements) {
                // In a real implementation, you'd fetch this from the stock_movements table
                recentMovements.innerHTML = `
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Date</th>
                  <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Product</th>
                  <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Type</th>
                  <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                  <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td colspan="5" style="padding: 40px; text-align: center; color: #6b7280; font-size: 14px;">
                    <div style="font-size: 36px; margin-bottom: 12px;">📦</div>
                    No recent stock movements available
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
            }

        } catch (error) {
            console.error('❌ Store Dashboard: Failed to load stats:', error);
        }
    }
};

window.storeDashboardModule = storeDashboardModule;
