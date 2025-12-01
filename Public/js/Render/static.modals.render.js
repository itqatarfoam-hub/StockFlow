// ====================================================
// STOCKFLOW - STATIC MODALS RENDER
// Extracted from main.js to reduce file size
// All static modal HTML for the application
// ====================================================

const StaticModalsRender = {
  renderModals() {
    return `
      <!-- Confirm Modal -->
      <div id="confirmModal" class="modal">
        <div class="modal-content" style="max-width: 400px;">
          <h3 class="modal-header" id="confirmTitle">Confirm Action</h3>
          <p id="confirmMessage" style="color: #6b7280; margin: 0 0 24px 0; font-size: 14px; white-space: pre-line;"></p>
          <div class="form-button-group">
            <button type="button" class="btn-secondary" id="confirmNo">Cancel</button>
            <button type="button" class="btn-primary" id="confirmYes">Confirm</button>
          </div>
        </div>
      </div>

      <!-- Notifications Modal -->
      <div id="notificationsModal" class="modal">
        <div class="modal-content" style="max-width: 900px;">
          <div class="modal-header">
            <span> Notifications & Tasks</span>
            <button class="modal-close" onclick="notificationsModule.toggleModal()"></button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px;">
            <div id="notificationCount" style="font-size: 14px; color: #6b7280; font-weight: 500;">Loading...</div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <select id="notificationFilter" onchange="notificationsModule.filterNotifications(this.value)" style="
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                color: #374151;
                background: white;
                cursor: pointer;
                outline: none;
                transition: all 0.2s;
              ">
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="all">Show All</option>
              </select>
              <button class="btn-secondary" onclick="notificationsModule.markAllAsRead()" style="
                width: auto;
                padding: 8px 16px;
                font-size: 13px;
              ">Mark All as Read</button>
              <button class="btn-secondary" onclick="notificationsModule.toggleModal()" style="
                width: auto;
                padding: 8px 16px;
                font-size: 13px;
              ">Close</button>
              <!-- Send Notification Button (shown only for broadcast_approval users) -->
              <button id="sendNotificationBtn" class="btn-primary" onclick="window.app.openBroadcastModal()" style="
                width: auto;
                padding: 8px 16px;
                font-size: 13px;
                display: none;
              ">📢 Send Notification</button>
            </div>
          </div>
          <div id="notificationsContainer" style="max-height: 400px; overflow-y: auto; padding-right: 8px;">
            <div style="padding: 60px 20px; text-align: center; color: #9ca3af;">
              <div style="font-size: 48px; margin-bottom: 12px;">🔔</div>
              <div style="font-size: 16px; font-weight: 500;">Loading notifications...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Forgot Password Modal -->
      <div id="forgotPasswordModal" class="modal">
        <div class="modal-content" style="max-width: 450px;">
          <div class="modal-header">
            <span> Forgot Password</span>
            <button class="modal-close" onclick="window.app.closeForgotPasswordModal()"></button>
          </div>
          <p style="color: #6b7280; margin-bottom: 20px; font-size: 14px;">
            Enter your username below and we will send a notification to the administrators to help you reset your password.
          </p>
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" id="forgotPasswordUsername" class="form-input" placeholder="Enter your username" autofocus>
          </div>
          <div id="forgotPasswordError" class="error-message-box"></div>
          <div class="form-button-group">
            <button type="button" class="btn-secondary" onclick="window.app.closeForgotPasswordModal()">Cancel</button>
            <button type="button" class="btn-primary" onclick="window.app.submitForgotPassword()">Send Request</button>
          </div>
        </div>
      </div>
    `;
  }
};

window.StaticModalsRender = StaticModalsRender;
