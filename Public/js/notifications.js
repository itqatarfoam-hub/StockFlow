// ============================================
// NOTIFICATIONS MODULE
// Handle notifications UI and interactions
// ============================================

if (typeof notificationsModule === 'undefined') {
    var notificationsModule = {
        notifications: [],
        unreadCount: 0,
        isOpen: false,

        // ========== INITIALIZE ==========
        init() {
            this.currentFilter = 'unread'; // Default to unread
            this.loadUnreadCount();
            // Poll for new notifications every 30 seconds
            setInterval(() => this.loadUnreadCount(), 30000);
        },

        // ========== LOAD UNREAD COUNT ==========
        async loadUnreadCount() {
            try {
                const res = await fetch('/api/notifications/unread-count', {
                    credentials: 'same-origin'
                });
                const data = await res.json();

                this.unreadCount = data.count || 0;
                this.updateBadge();
            } catch (error) {
                console.error('Failed to load unread count:', error);
            }
        },

        // ========== UPDATE BADGE ==========
        updateBadge() {
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                badge.textContent = this.unreadCount;
                badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
            }
        },

        // ========== LOAD NOTIFICATIONS ==========
        async loadNotifications() {
            try {
                const res = await fetch('/api/notifications', {
                    credentials: 'same-origin'
                });
                const data = await res.json();

                this.notifications = data.notifications || [];
                this.renderNotifications();

                // Update the count display in the modal
                this.updateNotificationCount();
            } catch (error) {
                console.error('Failed to load notifications:', error);
            }
        },

        // ========== TOGGLE MODAL ==========
        toggleModal() {
            const modal = document.getElementById('notificationsModal');

            if (modal) {
                if (modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    this.isOpen = false;
                } else {
                    modal.classList.add('active');
                    this.isOpen = true;

                    // Set filter dropdown to unread by default
                    const filterDropdown = document.getElementById('notificationFilter');
                    if (filterDropdown) {
                        filterDropdown.value = 'unread';
                    }
                    this.currentFilter = 'unread';

                    // Show/hide Send Notification button based on broadcast_approval
                    this.updateSendNotificationButton();

                    this.loadNotifications();
                }
            }
        },

        // ========== UPDATE NOTIFICATION COUNT ==========
        updateNotificationCount() {
            const countEl = document.getElementById('notificationCount');
            if (countEl) {
                const unreadCount = this.notifications.filter(n => !n.is_read).length;
                const totalCount = this.notifications.length;

                if (totalCount === 0) {
                    countEl.textContent = 'No notifications';
                } else if (unreadCount === 0) {
                    countEl.textContent = `${totalCount} notification${totalCount > 1 ? 's' : ''} (all read)`;
                } else {
                    countEl.textContent = `${unreadCount} unread of ${totalCount} total`;
                }
            }
        },

        // ========== RENDER NOTIFICATIONS IN LIST ==========
        renderNotifications() {
            const container = document.getElementById('notificationsContainer');
            if (!container) return;

            // Apply filter if exists
            const activeFilter = this.currentFilter || 'all';
            let filteredNotifications = this.notifications;

            if (activeFilter === 'unread') {
                filteredNotifications = this.notifications.filter(n => !n.is_read);
            } else if (activeFilter === 'read') {
                filteredNotifications = this.notifications.filter(n => n.is_read);
            }

            // Empty state
            if (filteredNotifications.length === 0) {
                const emptyMessage = activeFilter === 'unread'
                    ? 'No unread notifications'
                    : activeFilter === 'read'
                        ? 'No read notifications'
                        : 'No notifications or tasks';

                container.innerHTML = `
                    <div style="text-align: center; padding: 80px 20px; color: #9ca3af;">
                        <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">🔔</div>
                        <div style="font-size: 18px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">${emptyMessage}</div>
                        <div style="font-size: 14px; color: #9ca3af;">You're all caught up!</div>
                    </div>
                `;
                return;
            }

            // Render notifications as list
            container.innerHTML = filteredNotifications.map(n => `
                <div class="notification-item-card ${n.is_read ? 'read' : 'unread'}" data-id="${n.id}" style="
                    background: ${n.is_read ? '#ffffff' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'};
                    border: 1px solid ${n.is_read ? '#e5e7eb' : '#3b82f6'};
                    border-left: 4px solid ${n.is_read ? '#d1d5db' : '#3b82f6'};
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 16px;
                    transition: all 0.3s;
                    box-shadow: ${n.is_read ? '0 1px 3px rgba(0,0,0,0.05)' : '0 4px 12px rgba(59, 130, 246, 0.15)'};
                    opacity: ${n.is_read ? '0.75' : '1'};
                ">
                    <div style="display: flex; gap: 16px;">
                        <!-- Icon -->
                        <div style="
                            width: 56px;
                            height: 56px;
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 28px;
                            flex-shrink: 0;
                            background: ${this.getTypeBackground(n.type)};
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        ">
                            ${this.getTypeIcon(n.type)}
                        </div>
                        
                        <!-- Content -->
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1f2937; line-height: 1.3;">
                                    ${this.escapeHtml(n.title)}
                                </h3>
                                ${!n.is_read ? '<span style="background: #3b82f6; color: white; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">New</span>' : ''}
                            </div>
                            
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                ${this.escapeHtml(n.message)}
                            </p>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
                                <span style="font-size: 12px; color: #9ca3af; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                                    <span style="font-size: 14px;">🕐</span>
                                    ${this.formatTime(n.created_at)}
                                </span>
                                
                                ${!n.is_read ? `
                                    <button 
                                        onclick="notificationsModule.markAsRead('${n.id}')" 
                                        style="
                                            background: linear-gradient(135deg, #667eea, #764ba2);
                                            color: white;
                                            border: none;
                                            padding: 8px 18px;
                                            border-radius: 8px;
                                            font-size: 13px;
                                            font-weight: 600;
                                            cursor: pointer;
                                            transition: all 0.2s;
                                            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                                            display: flex;
                                            align-items: center;
                                            gap: 6px;
                                        "
                                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'"
                                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.3)'"
                                    >
                                        <span style="font-size: 14px;">✓</span>
                                        <span>Mark as Read</span>
                                    </button>
                                ` : `
                                    <span style="font-size: 13px; color: #10b981; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                        <span style="font-size: 16px;">✓</span>
                                        <span>Read</span>
                                    </span>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        },

        // ========== MARK AS READ ==========
        async markAsRead(notificationId) {
            try {
                const res = await fetch(`/api/notifications/${notificationId}/read`, {
                    method: 'PUT',
                    credentials: 'same-origin'
                });

                if (res.ok) {
                    const notification = this.notifications.find(n => n.id === notificationId);
                    if (notification) {
                        notification.is_read = 1;
                        notification.read_at = new Date().toISOString();
                    }

                    this.unreadCount = Math.max(0, this.unreadCount - 1);
                    this.updateBadge();
                    this.renderNotifications();
                    this.updateNotificationCount();
                }
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        },

        // ========== MARK ALL AS READ ==========
        async markAllAsRead() {
            try {
                const res = await fetch('/api/notifications/read-all', {
                    method: 'PUT',
                    credentials: 'same-origin'
                });

                if (res.ok) {
                    this.notifications.forEach(n => {
                        n.is_read = 1;
                        n.read_at = new Date().toISOString();
                    });

                    this.unreadCount = 0;
                    this.updateBadge();
                    this.renderNotifications();
                    this.updateNotificationCount();
                }
            } catch (error) {
                console.error('Failed to mark all as read:', error);
            }
        },

        // ========== SEND PASSWORD RESET NOTIFICATION ==========
        async sendPasswordResetRequest(username) {
            try {
                const res = await fetch('/api/notifications/password-reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });

                const data = await res.json();

                if (data.success) {
                    return { success: true, message: data.message };
                } else {
                    return { success: false, error: data.error };
                }
            } catch (error) {
                console.error('Failed to send password reset request:', error);
                return { success: false, error: 'Network error' };
            }
        },

        // ========== HELPER FUNCTIONS ==========
        getTypeIcon(type) {
            const icons = {
                'password_reset': '🔐',
                'system': '⚙️',
                'message': '💬',
                'alert': '⚠️'
            };
            return icons[type] || '🔔';
        },

        getTypeClass(type) {
            return `notification-type-${type}`;
        },

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        formatTime(datetime) {
            const date = new Date(datetime);
            const now = new Date();
            const diff = now - date;

            if (diff < 60000) return 'Just now';
            if (diff < 3600000) {
                const minutes = Math.floor(diff / 60000);
                return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            }
            if (diff < 86400000) {
                const hours = Math.floor(diff / 3600000);
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            }
            if (diff < 604800000) {
                const days = Math.floor(diff / 86400000);
                return `${days} day${days > 1 ? 's' : ''} ago`;
            }

            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        },

        getTypeBackground(type) {
            const backgrounds = {
                'password_reset': 'linear-gradient(135deg, #fef3c7, #fde68a)',
                'system': 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                'message': 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                'alert': 'linear-gradient(135deg, #fee2e2, #fecaca)'
            };
            return backgrounds[type] || 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
        },

        // ========== FILTER NOTIFICATIONS ==========
        filterNotifications(filter) {
            this.currentFilter = filter;

            // Update filter button states
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if (btn.dataset.filter === filter) {
                    btn.classList.add('active');
                    btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                    btn.style.color = 'white';
                } else {
                    btn.classList.remove('active');
                    btn.style.background = 'white';
                    btn.style.color = '#6b7280';
                }
            });

            // Re-render with filter
            this.renderNotifications();
            this.updateNotificationCount();
        },

        // ========== UPDATE SEND NOTIFICATION BUTTON ==========
        updateSendNotificationButton() {
            const sendBtn = document.getElementById('sendNotificationBtn');
            if (!sendBtn) return;

            // Check if user has broadcast_approval
            const checkUser = async () => {
                try {
                    const res = await fetch('/api/auth/check', { credentials: 'same-origin' });
                    const data = await res.json();

                    if (data.authenticated && data.user && data.user.broadcast_approval === 1) {
                        sendBtn.style.display = 'block';
                    } else {
                        sendBtn.style.display = 'none';
                    }
                } catch (error) {
                    console.error('Failed to check user broadcast approval:', error);
                    sendBtn.style.display = 'none';
                }
            };

            checkUser();
        }
    };

    window.notificationsModule = notificationsModule;
}
