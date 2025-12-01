// ============================================
// STOCKFLOW - HRM REMINDERS MODULE
// Automated Expiry Tracking & Notifications
// ============================================

const hrmRemindersModule = {
    reminders: [],

    render() {
        return `
      <div class="hrm-reminders-page">
        <div class="page-header">
          <div class="header-left">
            <h2>🔔 Expiry Reminders</h2>
            <p class="page-description">Track document expiries and renewals</p>
          </div>
        </div>

        <!-- Priority Filter -->
        <div class="filters-bar">
          <select id="priorityFilter" onchange="hrmRemindersModule.filterReminders()">
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select id="typeFilter" onchange="hrmRemindersModule.filterReminders()">
            <option value="">All Types</option>
            <option value="Passport">Passport</option>
            <option value="Visa">Visa</option>
            <option value="Medical_Card">Medical Card</option>
            <option value="Vehicle">Vehicle Documents</option>
          </select>
          <select id="statusFilter" onchange="hrmRemindersModule.filterReminders()">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Notified">Notified</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <!-- Reminders List -->
        <div id="remindersList">
          <div class="loading">Loading reminders...</div>
        </div>
      </div>
    `;
    },

    async attachListeners(app) {
        this.app = app;
        await this.loadReminders();
    },

    async loadReminders() {
        try {
            const response = await fetch('/api/hrm/reminders/upcoming?days=90', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                this.reminders = data.reminders || [];
                this.renderReminders();
            }
        } catch (error) {
            console.error('Error loading reminders:', error);
        }
    },

    renderReminders() {
        const container = document.getElementById('remindersList');

        if (!this.reminders.length) {
            container.innerHTML = '<div class="no-data">✅ No upcoming expiries</div>';
            return;
        }

        // Group by priority
        const grouped = {
            Critical: [],
            High: [],
            Medium: [],
            Low: []
        };

        this.reminders.forEach(r => {
            grouped[r.priority].push(r);
        });

        let html = '';

        Object.keys(grouped).forEach(priority => {
            if (grouped[priority].length) {
                html += `
          <div class="reminder-section priority-${priority.toLowerCase()}">
            <h3>${priority} Priority (${grouped[priority].length})</h3>
            <div class="reminders-list">
              ${grouped[priority].map(r => this.renderReminderCard(r)).join('')}
            </div>
          </div>
        `;
            }
        });

        container.innerHTML = html;
    },

    renderReminderCard(reminder) {
        const daysLeft = this.calculateDaysLeft(reminder.expiry_date);
        const isExpired = daysLeft < 0;

        return `
      <div class="reminder-card ${isExpired ? 'expired' : ''}">
        <div class="reminder-icon">${this.getIcon(reminder.reminder_type)}</div>
        <div class="reminder-info">
          <h4>${reminder.item_name}</h4>
          <p class="reminder-details">
            ${reminder.employee_name ? `Employee: ${reminder.employee_name}` : 'Company Asset'}<br>
            Type: ${reminder.reminder_type.replace(/_/g, ' ')}<br>
            Expires: ${StockFlowUtils.formatDate(reminder.expiry_date)}
            <span class="days-indicator ${isExpired ? 'expired' : daysLeft <= 7 ? 'critical' : 'warning'}">
              ${isExpired ? 'EXPIRED' : `${daysLeft} days left`}
            </span>
          </p>
        </div>
        <div class="reminder-actions">
          <button class="btn-sm" onclick="hrmRemindersModule.markRenewed(${reminder.id})">
            ✓ Renewed
          </button>
          <button class="btn-sm" onclick="hrmRemindersModule.sendNotification(${reminder.id})">
            📧 Notify
          </button>
        </div>
      </div>
    `;
    },

    getIcon(type) {
        const icons = {
            'Passport': '🛂',
            'Visa': '📋',
            'National_ID': '🆔',
            'Medical_Card': '🏥',
            'Vehicle_Registration': '🚗',
            'Vehicle_Insurance': '🛡️',
            'Asset_Warranty': '📦',
            'Contract': '📄'
        };
        return icons[type] || '📌';
    },

    calculateDaysLeft(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    async markRenewed(id) {
        const newExpiry = prompt('Enter new expiry date (YYYY-MM-DD):');
        if (!newExpiry) return;

        try {
            const response = await fetch(`/api/hrm/reminders/${id}/renew`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_expiry: newExpiry }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Marked as renewed', 'success');
                await this.loadReminders();
            } else {
                ui.showToast(data.error || 'Failed to update', 'error');
            }
        } catch (error) {
            console.error('Error marking renewed:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    async sendNotification(id) {
        try {
            const response = await fetch(`/api/hrm/reminders/${id}/notify`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast('Notification sent', 'success');
                await this.loadReminders();
            } else {
                ui.showToast(data.error || 'Failed to send', 'error');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    filterReminders() {
        // Filter implementation
        this.renderReminders();
    }
};

window.hrmRemindersModule = hrmRemindersModule;
