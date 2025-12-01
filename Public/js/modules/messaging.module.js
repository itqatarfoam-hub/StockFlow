// ============================================
// MESSAGING PAGE MODULE - WhatsApp Style
// Author: itqatarfoam-hub
// Date: 2025-11-27 13:16:00 UTC
// FINAL WORKING VERSION with Badge Fix
// ============================================

const messagingPageModule = {
  currentConversationId: null,
  conversations: [],
  messages: [],
  pollingInterval: null,
  selectedFile: null,

  render(app) {
    const user = app.currentUser || {};
    console.log('🔍 Current User:', user);
    console.log('🔍 Broadcast Approval:', user.broadcast_approval);

    return `
  <!-- Messaging Header -->
  <div style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="margin: 0 0 4px 0; font-size: 28px; font-weight: 700;">💬 Internal Messaging</h1>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Secure team communication with file sharing</p>
      </div>
      <div style="text-align: right; display: flex; gap: 12px; justify-content: flex-end;">
        ${user.broadcast_approval === 1 ? `
        <button type="button" class="btn-primary" onclick="window.app.openBroadcastModal()" style="background: white; color: #667eea; padding: 10px 20px; font-size: 14px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          📢 Broadcast
        </button>
        ` : ''}
        <button type="button" class="btn-primary" onclick="window.app.openNewChatModal()" style="background: white; color: #25D366; padding: 10px 20px; font-size: 14px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ➕ New Chat
        </button>
      </div>
    </div>
  </div>

      <!-- Main Messaging Layout -->
      <div style="display: grid; grid-template-columns: 380px 1fr; gap: 0; height: calc(100vh - 280px); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Conversations List (Left Sidebar) -->
        <div style="background: #f0f2f5; border-right: 1px solid #d1d7db; display: flex; flex-direction: column; overflow: hidden;">
          <div style="padding: 20px; background: #ededed; border-bottom: 1px solid #d1d7db;">
            <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #111b21;">Chats</h3>
            <div style="margin-top: 12px; position: relative;">
              <input type="text" id="searchChats" placeholder="Search or start new chat" style="width: 100%; padding: 10px 40px 10px 40px; border: none; border-radius: 8px; background: white; font-size: 14px;">
              <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 16px;">🔍</span>
            </div>
          </div>
          <div id="conversationsList" style="flex: 1; overflow-y: auto; background: white;">
            <p style="text-align: center; padding: 40px 20px; color: #667781;">Loading conversations...</p>
          </div>
        </div>

        <!-- Chat Area (Right Side) -->
        <div style="background: #efeae2; display: flex; flex-direction: column; overflow: hidden; position: relative;">
          
          <!-- Chat Header -->
          <div id="chatHeader" style="padding: 16px 20px; background: #f0f2f5; border-bottom: 1px solid #d1d7db; display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); display: flex; align-items: center; justify-content: center; font-size: 20px; color: white;">👤</div>
                <div>
                  <h3 id="chatTitle" style="margin: 0 0 2px 0; font-size: 16px; font-weight: 600; color: #111b21;">Select a conversation</h3>
                  <p id="chatSubtitle" style="margin: 0; font-size: 13px; color: #667781;">Click on a chat to start messaging</p>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button type="button" onclick="window.app.openConversationInfo()" style="padding: 8px 12px; font-size: 20px; background: transparent; border: none; border-radius: 6px; cursor: pointer;" title="Info">ℹ️</button>
                <button type="button" id="deleteConversationBtn" onclick="window.app.deleteCurrentConversation()" style="padding: 8px 12px; font-size: 20px; background: transparent; border: none; border-radius: 6px; cursor: pointer; display: none;" title="Delete conversation">🗑️</button>
              </div>
            </div>
          </div>

          <!-- Messages Area with WhatsApp Pattern Background -->
          <div id="messagesContainer" style="flex: 1; overflow-y: auto; padding: 20px; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZWZlYWUyIi8+PHBhdGggZD0iTTAgNTBMNTAgMEwxMDAgNTBMNTAgMTAwWiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjAyIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg=='); background-repeat: repeat;">
            <div style="text-align: center; padding: 80px 20px; color: #667781;">
              <div style="font-size: 80px; margin-bottom: 16px; opacity: 0.6;">💬</div>
              <h3 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 400; color: #41525d;">Welcome to Messaging</h3>
              <p style="margin: 0; font-size: 14px; color: #667781;">Select a chat to start messaging</p>
            </div>
          </div>

          <!-- Message Input Area -->
          <div id="messageInputArea" style="padding: 12px 20px; background: #f0f2f5; border-top: 1px solid #d1d7db; display: none;">
            <form id="messageForm" style="display: flex; gap: 8px; align-items: flex-end;">
              <div style="display: flex; gap: 6px;">
                <label for="fileInput" style="padding: 10px 12px; background: transparent; border: none; border-radius: 50%; cursor: pointer; font-size: 24px; transition: background 0.2s;" title="Attach file" onmouseover="this.style.background='#d1d7db'" onmouseout="this.style.background='transparent'">
                  📎
                </label>
                <input type="file" id="fileInput" style="display: none;" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onchange="window.app.handleFileSelect(event)">
              </div>
              <div style="flex: 1; position: relative;">
                <div id="filePreview" style="display: none; margin-bottom: 8px; padding: 10px; background: white; border-radius: 8px; border: 1px solid #d1d7db;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span id="fileIcon" style="font-size: 24px;">📄</span>
                      <div>
                        <p id="fileName" style="margin: 0; font-size: 13px; font-weight: 600; color: #111b21;"></p>
                        <p id="fileSize" style="margin: 0; font-size: 11px; color: #667781;"></p>
                      </div>
                    </div>
                    <button type="button" onclick="window.app.clearFileSelection()" style="padding: 4px 8px; background: transparent; border: none; cursor: pointer; font-size: 18px;">❌</button>
                  </div>
                </div>
                <textarea id="messageInput" class="form-input" placeholder="Type a message..." rows="1" style="width: 100%; padding: 12px 16px; font-size: 15px; border: none; border-radius: 8px; background: white; resize: none; font-family: inherit; line-height: 1.5;" onkeypress="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();window.app.messagingPageModule.sendMessage(window.app);}"></textarea>
              </div>
              <button type="submit" style="padding: 12px 12px; background: #25D366; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 20px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='#1da851'" onmouseout="this.style.background='#25D366'">
                📨
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  attachListeners(app) {
    console.log('🔗 Messaging: Attaching listeners...');

    this.loadConversations(app);

    // Start polling for new messages (every 5 seconds)
    this.startPolling(app);

    // Message form submission
    setTimeout(() => {
      const messageForm = document.getElementById('messageForm');
      if (messageForm) {
        messageForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.sendMessage(app);
        });
      }
    }, 200);
  },

  async loadConversations(app) {
    try {
      const result = await messagingModule.getConversations();

      if (!result.success) {
        console.error('Failed to load conversations:', result.error);
        this.renderConversationsError();
        return;
      }

      this.conversations = result.conversations || [];
      this.renderConversations(app);
    } catch (error) {
      console.error('Error loading conversations:', error);
      this.renderConversationsError();
    }
  },

  renderConversationsError() {
    const container = document.getElementById('conversationsList');
    if (!container) return;

    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #667781;">
        <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Failed to load conversations</p>
        <p style="margin: 0; font-size: 12px;">Please refresh the page</p>
      </div>
    `;
  },

  renderConversations(app) {
    const container = document.getElementById('conversationsList');
    if (!container) return;

    if (this.conversations.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #667781;">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.4;">💬</div>
          <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #41525d;">No conversations yet</p>
          <p style="margin: 0; font-size: 13px;">Start a new chat to get started</p>
        </div>
      `;
      return;
    }

    const html = this.conversations.map(conv => {
      const isActive = this.currentConversationId === conv.id;
      const unreadBadge = conv.unread_count > 0 ? `<span style="min-width: 20px; height: 20px; background: #25D366; color: white; padding: 2px 6px; border-radius: 10px; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center;">${conv.unread_count}</span>` : '';
      const conversationName = conv.name || 'Private Chat';
      const lastMessage = conv.last_message ? this.truncate(conv.last_message, 35) : 'No messages yet';
      const timeAgo = conv.last_message_at ? this.timeAgo(conv.last_message_at) : '';

      return `
        <div onclick="window.app.openConversation('${conv.id}')" style="padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #f0f2f5; transition: background 0.2s; background: ${isActive ? '#f0f2f5' : 'white'};" onmouseover="if(!this.style.background.includes('f0f2f5')) this.style.background='#f5f6f6'" onmouseout="if(!this.style.background.includes('f0f2f5')) this.style.background='white'">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, ${conv.type === 'group' ? '#128C7E' : '#25D366'} 0%, ${conv.type === 'group' ? '#075E54' : '#128C7E'} 100%); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
              ${conv.type === 'group' ? '👥' : '👤'}
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <p style="margin: 0; font-weight: 600; font-size: 16px; color: #111b21; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${this.escapeHtml(conversationName)}</p>
                <div style="display: flex; align-items: center; gap: 8px; margin-left: 8px;">
                  ${timeAgo ? `<span style="font-size: 12px; color: ${isActive ? '#25D366' : '#667781'}; white-space: nowrap;">${timeAgo}</span>` : ''}
                  ${unreadBadge}
                </div>
              </div>
              <p style="margin: 0; font-size: 14px; color: #667781; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHtml(lastMessage)}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  },

  async openConversation(app, conversationId) {
    console.log('📂 Opening conversation:', conversationId);

    this.currentConversationId = conversationId;

    // Update UI
    document.getElementById('chatHeader').style.display = 'block';
    document.getElementById('messageInputArea').style.display = 'block';
    document.getElementById('deleteConversationBtn').style.display = 'block';

    // Load messages and mark as read (true = mark as read when user opens)
    await this.loadMessages(app, conversationId, true);

    // Update header
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      document.getElementById('chatTitle').textContent = conversation.name || 'Private Chat';
      const participantInfo = conversation.type === 'group' ? `Group • ${conversation.message_count || 0} messages` : 'Private Chat';
      document.getElementById('chatSubtitle').textContent = participantInfo;
    }

    // Re-render conversations to show active state
    this.renderConversations(app);
  },

  async loadMessages(app, conversationId, markAsRead = false) {
    try {
      const result = await messagingModule.getMessages(conversationId);

      if (!result.success) {
        console.error('Failed to load messages:', result.error);
        return;
      }

      this.messages = result.messages || [];
      this.renderMessages(app);

      // Only mark as read if explicitly requested (when user actively opens conversation)
      if (markAsRead && this.messages.length > 0) {
        const unreadMessages = this.messages.filter(msg => msg.sender_id !== app.currentUser.id);
        for (const msg of unreadMessages) {
          await messagingModule.markAsRead(msg.id).catch(err => console.log('Mark as read error:', err));
        }

        // Clear unread badge for this conversation
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation && conversation.unread_count > 0) {
          conversation.unread_count = 0;
          this.renderConversations(app);
          await this.updateUnreadCount(app);
        }
      }

      // Scroll to bottom
      setTimeout(() => {
        const container = document.getElementById('messagesContainer');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  },

  renderMessages(app) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    if (this.messages.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 80px 20px; color: #667781;">
          <div style="font-size: 80px; margin-bottom: 16px; opacity: 0.6;">💬</div>
          <h3 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 400; color: #41525d;">No messages yet</h3>
          <p style="margin: 0; font-size: 14px;">Be the first to send a message!</p>
        </div>
      `;
      return;
    }

    const currentUserId = app.currentUser.id;
    let lastDate = null;

    const html = this.messages.map(msg => {
      const isOwn = msg.sender_id === currentUserId;
      const time = new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const senderName = msg.sender_full_name || msg.sender_name || 'Unknown';

      // Date separator
      const msgDate = new Date(msg.created_at).toLocaleDateString();
      let dateSeparator = '';
      if (msgDate !== lastDate) {
        lastDate = msgDate;
        const dateLabel = this.formatDateLabel(new Date(msg.created_at));
        dateSeparator = `
          <div style="text-align: center; margin: 20px 0;">
            <span style="background: #e5ddd5; color: #667781; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 500;">${dateLabel}</span>
          </div>
        `;
      }

      return `
        ${dateSeparator}
        <div style="display: flex; justify-content: ${isOwn ? 'flex-end' : 'flex-start'}; margin-bottom: 4px; animation: slideIn 0.3s ease;">
          <div style="max-width: 65%; position: relative; group;">
            ${!isOwn ? `<p style="margin: 0 0 4px 12px; font-size: 12px; font-weight: 600; color: #667781;">${this.escapeHtml(senderName)}</p>` : ''}
            <div style="background: ${isOwn ? '#d9fdd3' : 'white'}; color: #111b21; padding: 8px 12px 6px 12px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); position: relative;">
              ${msg.message_type === 'file' || msg.message_type === 'image' ? this.renderFileMessage(msg, isOwn) : `<p style="margin: 0 0 4px 0; font-size: 14px; line-height: 1.5; word-wrap: break-word;">${this.escapeHtml(msg.content)}</p>`}
              <div style="display: flex; justify-content: flex-end; align-items: center; gap: 4px;">
                <span style="font-size: 11px; color: #667781;">${time}</span>
                ${isOwn ? '<span style="font-size: 14px; color: #53bdeb;">✓✓</span>' : ''}
              </div>
              ${isOwn ? `<button onclick="window.app.deleteMessage('${msg.id}')" style="position: absolute; top: -8px; right: -8px; background: #f44336; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; display: none; opacity: 0; transition: opacity 0.2s;" class="delete-msg-btn" title="Delete message">🗑️</button>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    // Add hover effect for delete buttons
    container.querySelectorAll('[style*="group"]').forEach(group => {
      const deleteBtn = group.querySelector('.delete-msg-btn');
      if (deleteBtn) {
        group.addEventListener('mouseenter', () => {
          deleteBtn.style.display = 'flex';
          deleteBtn.style.alignItems = 'center';
          deleteBtn.style.justifyContent = 'center';
          setTimeout(() => deleteBtn.style.opacity = '1', 10);
        });
        group.addEventListener('mouseleave', () => {
          deleteBtn.style.opacity = '0';
          setTimeout(() => deleteBtn.style.display = 'none', 200);
        });
      }
    });
  },

  renderFileMessage(msg, isOwn) {
    const fileIcon = msg.message_type === 'image' ? '🖼️' : '📎';
    const fileName = msg.file_name || 'File';
    const fileSize = msg.file_size ? this.formatFileSize(msg.file_size) : '';

    // MEDIUM-SIZED IMAGE THUMBNAILS (300px max)
    if (msg.message_type === 'image' && msg.file_url) {
      return `
        <div>
          <a href="${msg.file_url}" target="_blank" download="${fileName}" style="text-decoration: none;">
            <img 
              src="${msg.file_url}" 
              alt="${this.escapeHtml(fileName)}" 
              style="max-width: 300px; max-height: 300px; width: auto; height: auto; border-radius: 8px; margin-bottom: 4px; cursor: pointer; object-fit: cover; display: block;" 
              onclick="event.preventDefault(); event.stopPropagation(); window.open('${msg.file_url}', '_blank');"
              title="Click to view full size"
            >
          </a>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #667781;">${this.escapeHtml(fileName)} • ${fileSize}</p>
        </div>
      `;
    }

    // FILE DOWNLOAD CARD
    return `
      <div>
        <div style="background: ${isOwn ? '#c8e6c9' : '#f0f2f5'}; padding: 12px; border-radius: 8px; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 32px;">${fileIcon}</span>
            <div style="flex: 1; min-width: 0;">
              <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHtml(fileName)}</p>
              ${fileSize ? `<p style="margin: 0; font-size: 12px; color: #667781;">${fileSize}</p>` : ''}
            </div>
            ${msg.file_url ? `<a href="${msg.file_url}" target="_blank" download="${fileName}" style="padding: 8px 12px; background: #25D366; color: white; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap;">💾 Save</a>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  async sendMessage(app) {
    const input = document.getElementById('messageInput');
    if (!input) return;

    const content = input.value.trim();

    // Check if file is selected
    if (this.selectedFile) {
      await this.sendFileMessage(app);
      return;
    }

    if (!content || !this.currentConversationId) return;

    try {
      const result = await messagingModule.sendMessage(this.currentConversationId, content);

      if (!result.success) {
        app.showConfirm('Error', result.error || 'Failed to send message');
        return;
      }

      // Clear input
      input.value = '';
      input.style.height = 'auto';

      // Reload messages WITHOUT marking as read (false = don't mark as read)
      await this.loadMessages(app, this.currentConversationId, false);

      // Reload conversations to update last message
      await this.loadConversations(app);
    } catch (error) {
      console.error('Error sending message:', error);
      app && app.showConfirm && app.showConfirm('Error', 'Failed to send message');
    }
  },

  async sendFileMessage(app) {
    if (!this.selectedFile || !this.currentConversationId) return;

    const input = document.getElementById('messageInput');

    try {
      // Show uploading state
      if (input) {
        input.disabled = true;
        input.placeholder = 'Uploading file...';
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      console.log('📤 Uploading file:', this.selectedFile.name);

      // Upload file to server
      const uploadResponse = await fetch('/api/files/upload-file', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const uploadData = await uploadResponse.json();

      if (!uploadData.success || !uploadData.file) {
        throw new Error('File upload failed - no file data returned');
      }

      console.log('✅ File uploaded:', uploadData.file.url);

      // Now send the message with the uploaded file info
      const result = await messagingModule.uploadFile(
        this.currentConversationId,
        uploadData.file.name,
        uploadData.file.size,
        uploadData.file.type,
        uploadData.file.url
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to create file message');
      }

      console.log('✅ File message created');

      // Clear file selection
      this.clearFileSelection();

      // Re-enable input
      if (input) {
        input.disabled = false;
        input.placeholder = 'Type a message...';
      }

      // Reload messages
      await this.loadMessages(app, this.currentConversationId, false);

      // Reload conversations to update last message
      await this.loadConversations(app);

    } catch (error) {
      console.error('❌ Error sending file:', error);

      app && app.showConfirm && app.showConfirm('Error', `Failed to upload file:\n\n${error.message}`);

      // Re-enable input
      if (input) {
        input.disabled = false;
        input.placeholder = 'Type a message...';
      }
    }
  },

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      window.app && window.app.showConfirm('Error', `File is too large!\n\nMaximum size is 10MB.\nYour file is ${this.formatFileSize(file.size)}.`);
      event.target.value = '';
      return;
    }

    this.selectedFile = file;

    // Show file preview
    const preview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileIcon = document.getElementById('fileIcon');

    if (preview && fileName && fileSize && fileIcon) {
      fileName.textContent = file.name;
      fileSize.textContent = this.formatFileSize(file.size);

      // Set appropriate icon
      if (file.type.startsWith('image/')) {
        fileIcon.textContent = '🖼️';
      } else if (file.type.includes('pdf')) {
        fileIcon.textContent = '📄';
      } else if (file.type.includes('word') || file.type.includes('document')) {
        fileIcon.textContent = '📝';
      } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
        fileIcon.textContent = '📊';
      } else {
        fileIcon.textContent = '📎';
      }

      preview.style.display = 'block';
    }
  },

  clearFileSelection() {
    this.selectedFile = null;
    const preview = document.getElementById('filePreview');
    const fileInput = document.getElementById('fileInput');

    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';
  },

  async deleteMessage(messageId) {
    if (!window.app) return;

    window.app.showConfirm(
      '🗑️ Delete Message',
      'Delete this message?\n\nThis action cannot be undone.',
      async () => {
        try {
          const result = await messagingModule.deleteMessage(messageId);

          if (!result.success) {
            window.app.showConfirm('Error', '❌ Failed to delete message:\n\n' + (result.error || 'Unknown error'));
            return;
          }

          // Reload messages
          await this.loadMessages(window.app, this.currentConversationId, false);
        } catch (error) {
          console.error('Error deleting message:', error);
          window.app.showConfirm('Error', '❌ Network error occurred while deleting message');
        }
      }
    );
  },

  async deleteCurrentConversation() {
    if (!this.currentConversationId || !window.app) return;

    // Get conversation details for the warning
    const conversation = this.conversations.find(c => c.id === this.currentConversationId);
    const conversationName = conversation?.name || 'Private Chat';
    const messageCount = conversation?.message_count || 0;

    window.app.showConfirm(
      '⚠️ Delete Conversation',
      `Delete "${conversationName}" for ALL participants?\n\n⚠️ WARNING: This will:\n• Delete ALL ${messageCount} message${messageCount !== 1 ? 's' : ''}\n• Remove this chat for EVERYONE\n• Cannot be undone\n\nAre you absolutely sure?`,
      async () => {
        try {
          const result = await messagingModule.deleteConversation(this.currentConversationId);

          if (!result.success) {
            window.app.showConfirm('Error', '❌ Failed to delete conversation:\n\n' + (result.error || 'Unknown error'));
            return;
          }

          // Clear current conversation
          this.currentConversationId = null;

          // Hide chat area
          document.getElementById('chatHeader').style.display = 'none';
          document.getElementById('messageInputArea').style.display = 'none';

          // Show success message
          const container = document.getElementById('messagesContainer');
          if (container) {
            container.innerHTML = `
              <div style="text-align: center; padding: 80px 20px; color: #667781;">
                <div style="font-size: 80px; margin-bottom: 16px; opacity: 0.6;">✅</div>
                <h3 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 400; color: #41525d;">Conversation Deleted</h3>
                <p style="margin: 0; font-size: 14px; color: #667781;">The conversation has been permanently deleted for all participants</p>
              </div>
            `;
          }

          // Reload conversations
          await this.loadConversations(window.app);

          // Show success notification
          window.app.showConfirm('Success', `✅ Conversation "${conversationName}" has been permanently deleted for all participants`);
        } catch (error) {
          console.error('Error deleting conversation:', error);
          window.app.showConfirm('Error', '❌ Network error occurred while deleting conversation');
        }
      }
    );
  },

  startPolling(app) {
    // Clear existing interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // Poll every 5 seconds
    this.pollingInterval = setInterval(async () => {
      if (this.currentConversationId) {
        // Don't mark as read during polling - only when user actively opens
        await this.loadMessages(app, this.currentConversationId, false);
      }
      await this.loadConversations(app);
      await this.updateUnreadCount(app);
    }, 5000);
  },

  async updateUnreadCount(app) {
    try {
      const result = await messagingModule.getUnreadCount();
      if (result.success && result.count > 0) {
        // Update unread badge in sidebar
        const messagingMenuItem = document.querySelector('[data-page="messaging"]');
        if (messagingMenuItem) {
          let badge = messagingMenuItem.querySelector('.unread-badge');
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'unread-badge';
            badge.style.cssText = 'position: absolute; top: 8px; right: 8px; background: #25D366; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px; font-weight: 700;';
            messagingMenuItem.style.position = 'relative';
            messagingMenuItem.appendChild(badge);
          }
          badge.textContent = result.count;
        }
      } else {
        // Remove badge if count is 0
        const messagingMenuItem = document.querySelector('[data-page="messaging"]');
        if (messagingMenuItem) {
          const badge = messagingMenuItem.querySelector('.unread-badge');
          if (badge) badge.remove();
        }
      }
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  },

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  },

  // Helper functions
  escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  },

  truncate(text, length) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
  },

  timeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateString).toLocaleDateString();
  },

  formatDateLabel(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  },

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
};

window.messagingPageModule = messagingPageModule;