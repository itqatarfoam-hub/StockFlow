// ============================================
// STOCKFLOW - HRM ATTENDANCE MODULE
// Clock In/Out & Attendance Tracking
// ============================================

const hrmAttendanceModule = {
    attendanceRecords: [],
    todayAttendance: null,

    render() {
        return `
      <div class="hrm-attendance-page">
        <div class="page-header">
          <div class="header-left">
            <h2>📊 Attendance Management</h2>
            <p class="page-description">Track employee attendance and work hours</p>
          </div>
          <div class="header-actions">
            <button class="btn-primary" onclick="hrmAttendanceModule.clockInOut()">
              ⏰ Clock In/Out
            </button>
            <button class="btn-secondary" onclick="hrmAttendanceModule.exportAttendance()">
              📥 Export
            </button>
          </div>
        </div>

        <!-- Today's Clock Status -->
        <div class="clock-status-card">
          <div class="clock-info">
            <h3>Today's Attendance</h3>
            <div id="clockStatus" class="clock-status">
              <div class="loading">Loading...</div>
            </div>
          </div>
          <div class="clock-actions">
            <button id="clockBtn" class="btn-large" onclick="hrmAttendanceModule.performClock()">
              <span class="clock-icon">⏱️</span>
              <span id="clockBtnText">Clock In</span>
            </button>
          </div>
        </div>

        <!-- Monthly Summary -->
        <div class="attendance-summary">
          <div class="summary-card">
            <div class="summary-icon">✅</div>
            <div class="summary-data">
              <h4 id="presentDays">0</h4>
              <p>Present Days</p>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">❌</div>
            <div class="summary-data">
              <h4 id="absentDays">0</h4>
              <p>Absent Days</p>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">⏰</div>
            <div class="summary-data">
              <h4 id="totalHours">0h</h4>
              <p>Total Hours</p>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">⚡</div>
            <div class="summary-data">
              <h4 id="overtimeHours">0h</h4>
              <p>Overtime</p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-bar">
          <select id="filterMonth" onchange="hrmAttendanceModule.loadAttendance()">
            ${this.generateMonthOptions()}
          </select>
          <select id="filterEmployee" onchange="hrmAttendanceModule.loadAttendance()">
            <option value="">All Employees</option>
          </select>
        </div>

        <!-- Attendance Table -->
        <div class="attendance-table-container">
          <table class="hrm-table" id="attendanceTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Work Hours</th>
                <th>Overtime</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="attendanceTableBody">
              <tr><td colspan="8" class="loading">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    },

    async attachListeners(app) {
        this.app = app;
        await this.loadTodayStatus();
        await this.loadMonthlySummary();
        await this.loadAttendance();
    },

    async loadTodayStatus() {
        try {
            const response = await fetch('/api/hrm/attendance/today', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                this.todayAttendance = data.attendance;
                this.updateClockDisplay();
            }
        } catch (error) {
            console.error('Error loading today status:', error);
        }
    },

    updateClockDisplay() {
        const statusDiv = document.getElementById('clockStatus');
        const btnText = document.getElementById('clockBtnText');

        if (!this.todayAttendance || !this.todayAttendance.clock_in) {
            statusDiv.innerHTML = '<p class="text-muted">Not clocked in yet</p>';
            btnText.textContent = 'Clock In';
        } else if (this.todayAttendance.clock_out) {
            statusDiv.innerHTML = `
        <div class="clock-details">
          <p><strong>Clocked In:</strong> ${this.todayAttendance.clock_in}</p>
          <p><strong>Clocked Out:</strong> ${this.todayAttendance.clock_out}</p>
          <p><strong>Work Hours:</strong> ${this.todayAttendance.work_hours}h</p>
        </div>
      `;
            btnText.textContent = 'Already Clocked Out';
            document.getElementById('clockBtn').disabled = true;
        } else {
            statusDiv.innerHTML = `
        <div class="clock-details">
          <p><strong>Clocked In:</strong> ${this.todayAttendance.clock_in}</p>
          <p class="text-success">Currently working...</p>
        </div>
      `;
            btnText.textContent = 'Clock Out';
        }
    },

    async performClock() {
        const isClockedIn = this.todayAttendance && this.todayAttendance.clock_in && !this.todayAttendance.clock_out;
        const action = isClockedIn ? 'clock-out' : 'clock-in';

        try {
            const response = await fetch(`/api/hrm/attendance/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: 'Office', // You can get from GPS
                    ip: 'auto'
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                ui.showToast(`Successfully ${isClockedIn ? 'clocked out' : 'clocked in'}`, 'success');
                await this.loadTodayStatus();
                await this.loadMonthlySummary();
            } else {
                ui.showToast(data.error || 'Failed to clock', 'error');
            }
        } catch (error) {
            console.error('Error clocking:', error);
            ui.showToast('An error occurred', 'error');
        }
    },

    async loadMonthlySummary() {
        try {
            const month = document.getElementById('filterMonth')?.value ||
                `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

            const response = await fetch(`/api/hrm/attendance/monthly-summary?month=${month}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                document.getElementById('presentDays').textContent = data.summary.present || 0;
                document.getElementById('absentDays').textContent = data.summary.absent || 0;
                document.getElementById('totalHours').textContent = `${data.summary.total_hours || 0}h`;
                document.getElementById('overtimeHours').textContent = `${data.summary.overtime || 0}h`;
            }
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    },

    async loadAttendance() {
        try {
            const month = document.getElementById('filterMonth')?.value;
            const employeeId = document.getElementById('filterEmployee')?.value;

            let url = '/api/hrm/attendance/records?';
            if (month) url += `month=${month}&`;
            if (employeeId) url += `employee=${employeeId}`;

            const response = await fetch(url, { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                this.renderAttendanceTable(data.records || []);
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    },

    renderAttendanceTable(records) {
        const tbody = document.getElementById('attendanceTableBody');

        if (!records.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="no-data">No attendance records</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(rec => `
      <tr>
        <td>${StockFlowUtils.formatDate(rec.attendance_date)}</td>
        <td>${rec.employee_name}</td>
        <td>${rec.clock_in || '-'}</td>
        <td>${rec.clock_out || '-'}</td>
        <td>${rec.work_hours || '-'}h</td>
        <td class="${rec.overtime_hours > 0 ? 'text-success' : ''}">${rec.overtime_hours || 0}h</td>
        <td><span class="status-badge status-${rec.status.toLowerCase()}">${rec.status}</span></td>
        <td>
          <button class="btn-icon" onclick="hrmAttendanceModule.viewDetails(${rec.id})" title="View">
            👁️
          </button>
        </td>
      </tr>
    `).join('');
    },

    generateMonthOptions() {
        const months = [];
        const now = new Date();

        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            months.push(`<option value="${value}" ${i === 0 ? 'selected' : ''}>${label}</option>`);
        }

        return months.join('');
    },

    exportAttendance() {
        const month = document.getElementById('filterMonth')?.value;
        window.open(`/api/hrm/attendance/export?month=${month}&format=csv`, '_blank');
    },

    viewDetails(id) {
        alert('Attendance details view coming soon!');
    },

    clockInOut() {
        this.performClock();
    },

    openToday() {
        // Navigate to today's attendance
    }
};

window.hrmAttendanceModule = hrmAttendanceModule;
