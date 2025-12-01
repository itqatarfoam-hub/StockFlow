// ============================================
// CRM MEETINGS MODULE - Simple List View
// Step 1: Basic display only
// ============================================

const crmMeetingsModule = {
  currentMeetings: [],

  render() {
    return `
      <div class="crm-meetings-page">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">📅 Meetings</h1>
            <p class="page-subtitle">Schedule and track customer meetings</p>
          </div>
          <div class="header-actions">
            <button class="btn-primary" onclick="openMeetingForm()">➕ Schedule Meeting</button>
          </div>
        </div>

        <!-- Today's Meetings -->
        <div class="dashboard-card" style="margin-bottom: 20px;">
          <div class="card-header">
            <h3>📅 Today's Meetings</h3>
          </div>
          <div class="card-body" id="todayMeetingsList">
            <div style="text-align: center; padding: 40px; color: #9ca3af;">
              <p>Loading meetings...</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Meetings -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>🗓️ Upcoming Meetings</h3>
          </div>
          <div class="card-body" id="upcomingMeetingsList">
            <div style="text-align: center; padding: 40px; color: #9ca3af;">
              <p>Loading meetings...</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  attachListeners() {
    console.log('📅 Meetings Module: Attaching listeners...');
    this.loadMeetings();
  },

  async loadMeetings() {
    console.log('📊 Loading meetings...');

    try {
      const response = await fetch('/api/crm/meetings', { credentials: 'same-origin' });

      if (!response.ok) {
        throw new Error('Failed to load meetings');
      }

      const data = await response.json();

      if (data.success) {
        this.currentMeetings = data.meetings || [];
        this.renderMeetingsLists();
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
      this.renderEmptyState();
    }
  },

  renderMeetingsLists() {
    const today = new Date().toISOString().split('T')[0];
    const todayMeetings = this.currentMeetings.filter(m => m.meeting_date?.startsWith(today));
    const upcomingMeetings = this.currentMeetings.filter(m => m.meeting_date > today);

    // Render today's meetings
    const todayContainer = document.getElementById('todayMeetingsList');
    if (todayContainer) {
      if (todayMeetings.length === 0) {
        todayContainer.innerHTML = `
          <div style="text-align: center; padding: 30px; color: #9ca3af;">
            <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
            <p>No meetings today</p>
          </div>
        `;
      } else {
        todayContainer.innerHTML = todayMeetings.map(m => this.renderMeetingCard(m)).join('');
      }
    }

    // Render upcoming meetings
    const upcomingContainer = document.getElementById('upcomingMeetingsList');
    if (upcomingContainer) {
      if (upcomingMeetings.length === 0) {
        upcomingContainer.innerHTML = `
          <div style="text-align: center; padding: 30px; color: #9ca3af;">
            <div style="font-size: 48px; margin-bottom: 10px;">📅</div>
            <p>No upcoming meetings scheduled</p>
          </div>
        `;
      } else {
        upcomingContainer.innerHTML = upcomingMeetings.map(m => this.renderMeetingCard(m)).join('');
      }
    }
  },

  renderMeetingCard(meeting) {
    const date = new Date(meeting.meeting_date);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #3b82f6;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">${meeting.title || 'Untitled Meeting'}</div>
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 5px;">
              🏢 ${meeting.company_name || 'No company'}
            </div>
            <div style="font-size: 12px; color: #9ca3af;">
              📅 ${dateStr} at ${timeStr}
            </div>
          </div>
          <div style="display: flex; gap: 5px;">
            <span class="badge" style="background: #3b82f6; color: white;">${meeting.status || 'scheduled'}</span>
          </div>
        </div>
      </div>
    `;
  },

  renderEmptyState() {
    const todayContainer = document.getElementById('todayMeetingsList');
    const upcomingContainer = document.getElementById('upcomingMeetingsList');

    const emptyHTML = `
      <div style="text-align: center; padding: 30px; color: #9ca3af;">
        <p>No meetings found</p>
      </div>
    `;

    if (todayContainer) todayContainer.innerHTML = emptyHTML;
    if (upcomingContainer) upcomingContainer.innerHTML = emptyHTML;
  }
};

// Export
window.crmMeetingsModule = crmMeetingsModule;
