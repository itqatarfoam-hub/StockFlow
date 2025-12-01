// ====================================================
// STOCKFLOW - MESSAGING RENDERS
// Messaging and chat interface
// ====================================================

const MessagingRenders = {

    /**
     * Messaging page (uses module)
     */
    renderMessagingPage() {
        return window.messagingPageModule
            ? messagingPageModule.render(window.app)
            : this.renderMessagingPageFallback();
    },

    /**
     * Fallback messaging page
     */
    renderMessagingPageFallback() {
        return `
      <div class="messaging-container" style="height: calc(100vh - 100px); display: flex; gap: 0;">
        <!-- Conversations List -->
        <div class="conversations-sidebar" style="width: 320px; border-right: 1px solid #e5e7eb; background: white; display: flex; flex-direction: column;">
          <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 16px 0;">💬 Messages</h2>
            <input type="text" placeholder="🔍 Search conversations..." 
                   style=" width: 100%; padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 8px;">
          </div>
          
          <div class="conversations-list" style="flex: 1; overflow-y: auto;">
            <div style="text-align: center; padding: 40px 20px;">
              <div style="font-size: 48px; margin-bottom: 12px; opacity: 0.3;">💬</div>
              <p style="color: #9ca3af; font-size: 14px;">No conversations yet</p>
            </div>
          </div>
        </div>
        
        <!-- Chat Area -->
        <div class="chat-area" style="flex: 1; display: flex; flex-direction: column; background: #f9fafb;">
          <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; background: white;">
            <h3 style="margin: 0;">Select a conversation</h3>
          </div>
          
          <div class="messages-container" style="flex: 1; padding: 20px; overflow-y: auto;">
            <div style="text-align: center; padding-top: 100px;">
              <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.2;">💬</div>
              <p style="color: #9ca3af;">Select a conversation to start messaging</p>
            </div>
          </div>
          
          <div style="padding: 20px; border-top: 1px solid #e5e7eb; background: white;">
            <div style="display: flex; gap: 12px;">
              <input type="text" placeholder="Type a message..." disabled
                     style="flex: 1; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
              <button disabled
                      style="padding: 12px 24px; background: #e5e7eb; color: #9ca3af; border: none; border-radius: 8px; cursor: not-allowed;">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Conversation item
     */
    renderConversationItem(conversation) {
        const isUnread = conversation.unread_count > 0;

        return `
      <div class="conversation-item" onclick="app.openConversation(${conversation.id})"
           style="padding: 16px; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background 0.2s; ${isUnread ? 'background: #eff6ff;' : ''}"
           onmouseover="this.style.background='#f9fafb'"
           onmouseout="this.style.background='${isUnread ? '#eff6ff' : 'white'}'">
        
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; margin-right: 12px;">
            ${this.getInitials(conversation.participant_name)}
          </div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: ${isUnread ? '700' : '600'}; color: #1f2937;">${conversation.participant_name}</div>
              ${isUnread ? `<span style="width: 20px; height: 20px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">${conversation.unread_count}</span>` : ''}
            </div>
            <div style="font-size: 13px; color: #6b7280; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${conversation.last_message || 'No messages'}
            </div>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Message bubble
     */
    renderMessage(message, isOwn = false) {
        return `
      <div style="display: flex; justify-content: ${isOwn ? 'flex-end' : 'flex-start'}; margin-bottom: 16px;">
        <div style="max-width: 60%; padding: 12px 16px; border-radius: 16px; ${isOwn ? 'background: #667eea; color: white;' : 'background: white; color: #1f2937; border: 1px solid #e5e7eb;'}">
          <div style="margin-bottom: 4px;">${message.content}</div>
          <div style="font-size: 11px; ${isOwn ? 'color: rgba(255,255,255,0.8);' : 'color: #9ca3af;'}">
            ${new Date(message.sent_at).toLocaleTimeString()}
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Get initials
     */
    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
};

// Export for global use
window.MessagingRenders = MessagingRenders;
