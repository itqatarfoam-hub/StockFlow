// ============================================
// STOCKFLOW - HRM ASSET MANAGEMENT MODULE
// Company Assets & Assignment Tracking
// ============================================

const hrmAssetsModule = {
    assets: [],
    assignments: [],

    render() {
        return `
      <div class="hrm-assets-page">
        <div class="page-header">
          <div class="header-left">
            <h2>📦 Asset Management</h2>
            <p class="page-description">Track company assets and assignments</p>
          </div>
          <div class="header-actions">
            <button class="btn-primary" onclick="hrmAssetsModule.openAddAsset()">
              ➕ Add Asset
            </button>
            <button class="btn-secondary" onclick="hrmAssetsModule.openAssignAsset()">
              🔄 Assign Asset
            </button>
          </div>
        </div>

        <!-- Asset Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-value" id="totalAssets">0</div>
              <div class="stat-label">Total Assets</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value" id="assignedAssets">0</div>
              <div class="stat-label">Assigned</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📍</div>
            <div class="stat-content">
              <div class="stat-value" id="availableAssets">0</div>
              <div class="stat-label">Available</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <div class="stat-value" id="warrantyExpiring">0</div>
              <div class="stat-label">Warranty Expiring</div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-bar">
          <input type="text" id="assetSearch" placeholder="🔍 Search assets..." 
                 oninput="hrmAssetsModule.filterAssets()">
          <select id="filterCategory" onchange="hrmAssetsModule.filterAssets()">
            <option value="">All Categories</option>
            <option value="Laptop">Laptop</option>
            <option value="Phone">Phone</option>
            <option value="Equipment">Equipment</option>
            <option value="Tools">Tools</option>
          </select>
          <select id="filterStatus" onchange="hrmAssetsModule.filterAssets()">
            <option value="">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="available">Available</option>
          </select>
        </div>

        <!-- Assets Grid -->
        <div id="assetsGrid" class="assets-grid">
          <div class="loading">Loading assets...</div>
        </div>
      </div>
    `;
    },

    async attachListeners(app) {
        this.app = app;
        await this.loadAssets();
        this.updateStats();
    },

    async loadAssets() {
        try {
            const response = await fetch('/api/hrm/assets', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                this.assets = data.assets || [];
                this.renderAssets();
            }
        } catch (error) {
            console.error('Error loading assets:', error);
        }
    },

    renderAssets() {
        const container = document.getElementById('assetsGrid');

        if (!this.assets.length) {
            container.innerHTML = '<div class="no-data">No assets found</div>';
            return;
        }

        container.innerHTML = this.assets.map(asset => `
      <div class="asset-card ${asset.currently_assigned ? 'assigned' : 'available'}">
        <div class="asset-header">
          <h3>${asset.asset_name}</h3>
          <span class="asset-category">${asset.asset_category}</span>
        </div>
        
        <div class="asset-details">
          <div class="detail-item">
            <span class="detail-label">Serial:</span>
            <span class="detail-value">${asset.serial_number || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Model:</span>
            <span class="detail-value">${asset.model || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Value:</span>
            <span class="detail-value">${StockFlowUtils.formatCurrency(asset.asset_value || 0)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Condition:</span>
            <span class="condition-badge condition-${asset.condition_status?.toLowerCase()}">${asset.condition_status}</span>
          </div>
          ${asset.currently_assigned ? `
            <div class="detail-item">
              <span class="detail-label">Assigned to:</span>
              <span class="detail-value"><strong>${asset.assigned_to_name}</strong></span>
            </div>
          ` : ''}
          ${asset.warranty_expiry ? `
            <div class="detail-item">
              <span class="detail-label">Warranty:</span>
              <span class="detail-value ${this.isWarrantyExpiring(asset.warranty_expiry) ? 'text-danger' : ''}">
                ${StockFlowUtils.formatDate(asset.warranty_expiry)}
              </span>
            </div>
          ` : ''}
        </div>

        <div class="asset-actions">
          <button class="btn-icon" onclick="hrmAssetsModule.editAsset(${asset.id})" title="Edit">
            ✏️
          </button>
          ${!asset.currently_assigned ? `
            <button class="btn-icon" onclick="hrmAssetsModule.assignAssetModal(${asset.id})" title="Assign">
              🔄
            </button>
          ` : `
            <button class="btn-icon" onclick="hrmAssetsModule.returnAsset(${asset.id})" title="Return">
              ↩️
            </button>
          `}
          <button class="btn-icon" onclick="hrmAssetsModule.viewHistory(${asset.id})" title="History">
            📜
          </button>
          <button class="btn-icon" onclick="hrmAssetsModule.deleteAsset(${asset.id})" title="Delete">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
    },

    openAddAsset() {
        this.showAssetModal();
    },

    showAssetModal(asset = null) {
        const isEdit = asset !== null;
        const modalHTML = `
      <div id="assetModal" class="modal active">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${isEdit ? 'Edit' : 'Add'} Asset</h3>
            <button class="modal-close" onclick="hrmAssetsModule.closeModal()">×</button>
          </div>

          <form id="assetForm" class="hrm-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Asset Name</label>
                <input type="text" name="asset_name" class="form-input" required 
                       value="${asset?.asset_name || ''}">
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <select name="asset_category" class="form-input">
                  <option value="">Select Category</option>
                  <option value="Laptop" ${asset?.asset_category === 'Laptop' ? 'selected' : ''}>Laptop</option>
                  <option value="Phone" ${asset?.asset_category === 'Phone' ? 'selected' : ''}>Phone</option>
                  <option value="Equipment" ${asset?.asset_category === 'Equipment' ? 'selected' : ''}>Equipment</option>
                  <option value="Tools" ${asset?.asset_category === 'Tools' ? 'selected' : ''}>Tools</option>
                  <option value="Other" ${asset?.asset_category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Serial Number</label>
                <input type="text" name="serial_number" class="form-input" 
                       value="${asset?.serial_number || ''}">
              </div>

              <div class="form-group">
                <label class="form-label">Model</label>
                <input type="text" name="model" class="form-input" 
                       value="${asset?.model || ''}">
              </div>

              <div class="form-group">
                <label class="form-label">Purchase Date</label>
                <input type="date" name="purchase_date" class="form-input" 
                       value="${asset?.purchase_date || ''}">
              </div>

              <div class="form-group">
                <label class="form-label">Warranty Expiry</label>
                <input type="date" name="warranty_expiry" class="form-input" 
                       value="${asset?.warranty_expiry || ''}">
              </div>

              <div class="form-group">
                <label class="form-label">Asset Value</label>
                <input type="number" name="asset_value" class="form-input" step="0.01" 
                       value="${asset?.asset_value || ''}">
              </div>

              <div class="form-group">
                <label class="form-label">Condition</label>
                <select name="condition_status" class="form-input">
                  <option value="Excellent" ${asset?.condition_status === 'Excellent' ? 'selected' : ''}>Excellent</option>
                  <option value="Good" ${asset?.condition_status === 'Good' ? 'selected' : ''}>Good</option>
                  <option value="Fair" ${asset?.condition_status === 'Fair' ? 'selected' : ''}>Fair</option>
                  <option value="Poor" ${asset?.condition_status === 'Poor' ? 'selected' : ''}>Poor</option>
                  <option value="Damaged" ${asset?.condition_status === 'Damaged' ? 'selected' : ''}>Damaged</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label class="form-label">Notes</label>
                <textarea name="notes" class="form-textarea" rows="3">${asset?.notes || ''}</textarea>
              </div>
            </div>

            <div class="form-button-group">
              <button type="button" class="btn-secondary" onclick="hrmAssetsModule.closeModal()">Cancel</button>
              <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Add'} Asset</button>
            </div>
          </form>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('assetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveAsset(e.target, asset?.id);
        });
    },

    async saveAsset(form, id = null) {
        const formData = new FormData(form);
        const url = id ? `/api/hrm/assets/${id}` : '/api/hrm/assets';
        const method = id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast(`Asset ${id ? 'updated' : 'added'} successfully`, 'success');
                this.closeModal();
                await this.loadAssets();
            } else {
                ui.showToast(data.error || 'Failed to save asset', 'error');
            }
        } catch (error) {
            console.error('Error saving asset:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    assignAssetModal(assetId) {
        const asset = this.assets.find(a => a.id === assetId);

        const modalHTML = `
      <div id="assignModal" class="modal active">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Assign Asset: ${asset.asset_name}</h3>
            <button class="modal-close" onclick="hrmAssetsModule.closeModal('assignModal')">×</button>
          </div>

          <form id="assignForm" class="hrm-form">
            <input type="hidden" name="asset_id" value="${assetId}">
            
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label required">Assign to Employee</label>
                <select name="employee_id" class="form-input" required id="employeeSelect">
                  <option value="">Select Employee</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label required">Issue Date</label>
                <input type="date" name="issue_date" class="form-input" required 
                       value="${new Date().toISOString().split('T')[0]}">
              </div>

              <div class="form-group">
                <label class="form-label">Expected Return Date</label>
                <input type="date" name="expected_return_date" class="form-input">
              </div>

              <div class="form-group full-width">
                <label class="form-label">Handover Document</label>
                <input type="file" name="handover_document" class="form-input" accept=".pdf,.jpg,.png">
              </div>

              <div class="form-group full-width">
                <label class="form-label">Condition on Issue</label>
                <input type="text" name="condition_on_issue" class="form-input" 
                       value="${asset.condition_status}" placeholder="Good, Excellent, etc.">
              </div>
            </div>

            <div class="form-button-group">
              <button type="button" class="btn-secondary" onclick="hrmAssetsModule.closeModal('assignModal')">Cancel</button>
              <button type="submit" class="btn-primary">Assign Asset</button>
            </div>
          </form>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        this.loadEmployeesForSelect();

        document.getElementById('assignForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.performAssignment(e.target);
        });
    },

    async loadEmployeesForSelect() {
        try {
            const response = await fetch('/api/hrm/employees?status=Active', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                const select = document.getElementById('employeeSelect');
                data.employees.forEach(emp => {
                    select.innerHTML += `<option value="${emp.id}">${emp.full_name} (${emp.employee_id})</option>`;
                });
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    },

    async performAssignment(form) {
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/hrm/assets/assign', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Asset assigned successfully', 'success');
                this.closeModal('assignModal');
                await this.loadAssets();
            } else {
                ui.showToast(data.error || 'Failed to assign asset', 'error');
            }
        } catch (error) {
            console.error('Error assigning asset:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    async returnAsset(assetId) {
        const asset = this.assets.find(a => a.id === assetId);

        const modalHTML = `
      <div id="returnModal" class="modal active">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Return Asset: ${asset.asset_name}</h3>
            <button class="modal-close" onclick="hrmAssetsModule.closeModal('returnModal')">×</button>
          </div>

          <form id="returnForm" class="hrm-form">
            <input type="hidden" name="asset_id" value="${assetId}">
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Return Date</label>
                <input type="date" name="actual_return_date" class="form-input" required 
                       value="${new Date().toISOString().split('T')[0]}">
              </div>

              <div class="form-group">
                <label class="form-label">Condition on Return</label>
                <input type="text" name="condition_on_return" class="form-input" placeholder="Good, Damaged, etc.">
              </div>

              <div class="form-group full-width">
                <label class="form-label">Damage Notes</label>
                <textarea name="damage_notes" class="form-textarea" rows="3"></textarea>
              </div>

              <div class="form-group full-width">
                <label class="form-label">Return Document</label>
                <input type="file" name="return_document" class="form-input" accept=".pdf,.jpg,.png">
              </div>
            </div>

            <div class="form-button-group">
              <button type="button" class="btn-secondary" onclick="hrmAssetsModule.closeModal('returnModal')">Cancel</button>
              <button type="submit" class="btn-primary">Process Return</button>
            </div>
          </form>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('returnForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.processReturn(e.target, assetId);
        });
    },

    async processReturn(form, assetId) {
        const formData = new FormData(form);

        try {
            const response = await fetch(`/api/hrm/assets/return/${assetId}`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Asset returned successfully', 'success');
                this.closeModal('returnModal');
                await this.loadAssets();
            } else {
                ui.showToast(data.error || 'Failed to process return', 'error');
            }
        } catch (error) {
            console.error('Error processing return:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    updateStats() {
        const total = this.assets.length;
        const assigned = this.assets.filter(a => a.currently_assigned).length;
        const available = total - assigned;
        const warrantyExpiring = this.assets.filter(a =>
            a.warranty_expiry && this.isWarrantyExpiring(a.warranty_expiry)
        ).length;

        document.getElementById('totalAssets').textContent = total;
        document.getElementById('assignedAssets').textContent = assigned;
        document.getElementById('availableAssets').textContent = available;
        document.getElementById('warrantyExpiring').textContent = warrantyExpiring;
    },

    isWarrantyExpiring(date) {
        const expiry = new Date(date);
        const today = new Date();
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    },

    filterAssets() {
        // Implement filtering logic
        this.renderAssets();
    },

    async editAsset(id) {
        const asset = this.assets.find(a => a.id === id);
        this.showAssetModal(asset);
    },

    async deleteAsset(id) {
        if (!confirm('Delete this asset?')) return;

        try {
            const response = await fetch(`/api/hrm/assets/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Asset deleted successfully', 'success');
                await this.loadAssets();
            } else {
                ui.showToast(data.error || 'Failed to delete', 'error');
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    viewHistory(id) {
        alert('Asset history view coming soon!');
    },

    openAssignAsset() {
        alert('Select an available asset to assign');
    },

    closeModal(id = 'assetModal') {
        const modal = document.getElementById(id);
        if (modal) modal.remove();
    }
};

window.hrmAssetsModule = hrmAssetsModule;
