// chatUI.module.js - WhatsApp-like chat UI
// This module renders the chat interface, user list, and handles UI interactions.

const chatUIModule = {
    // Initialize UI components
    init(app) {
        // Create container elements
        const container = document.createElement('div');
        container.id = 'chat-container';
        container.className = 'chat-container';
        document.getElementById('app').appendChild(container);

        // Sidebar for user list
        const sidebar = document.createElement('div');
        sidebar.id = 'chat-sidebar';
        sidebar.className = 'chat-sidebar';
        container.appendChild(sidebar);

        // Main chat area
        const chatArea = document.createElement('div');
        chatArea.id = 'chat-area';
        chatArea.className = 'chat-area';
        container.appendChild(chatArea);

        // Header for conversation title
        const header = document.createElement('div');
        header.id = 'chat-header';
        header.className = 'chat-header';
        chatArea.appendChild(header);

        // Message list
        const messageList = document.createElement('div');
        messageList.id = 'message-list';
        messageList.className = 'message-list';
        chatArea.appendChild(messageList);

        // Input area
        const inputArea = document.createElement('div');
        inputArea.id = 'chat-input-area';
        inputArea.className = 'chat-input-area';
        chatArea.appendChild(inputArea);

        const textarea = document.createElement('textarea');
        textarea.id = 'chat-input';
        textarea.placeholder = 'Type a message...';
        inputArea.appendChild(textarea);

        const sendBtn = document.createElement('button');
        sendBtn.id = 'send-btn';
        sendBtn.textContent = 'Send';
        inputArea.appendChild(sendBtn);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'file-input';
        fileInput.style.display = 'none';
        inputArea.appendChild(fileInput);

        const attachBtn = document.createElement('button');
        attachBtn.id = 'attach-btn';
        attachBtn.textContent = '📎';
        inputArea.appendChild(attachBtn);

        // Event listeners
        sendBtn.addEventListener('click', () => this.sendMessage(app));
        attachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(app, e.target.files[0]));

        // Load user list
        this.loadUserList(app);
    },

    // Load list of users for private chats
    async loadUserList(app) {
        try {
            const res = await fetch('/api/users', { credentials: 'same-origin' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load users');
            const sidebar = document.getElementById('chat-sidebar');
            sidebar.innerHTML = '';
            data.users.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.className = 'user-item';
                userDiv.textContent = user.name || user.username || user.email;
                userDiv.dataset.userid = user.id;
                userDiv.addEventListener('click', () => this.openPrivateChat(app, user.id, userDiv.textContent));
                sidebar.appendChild(userDiv);
            });
        } catch (err) {
            console.error('Error loading users:', err);
        }
    },

    // Open a private conversation
    async openPrivateChat(app, userId, userName) {
        // Create or fetch a conversation with the selected user
        const existing = await messagingModule.getConversations();
        let conv = existing.conversations.find(c => !c.is_group && c.participant_ids.includes(app.currentUser.id) && c.participant_ids.includes(userId));
        if (!conv) {
            const created = await messagingModule.createConversation([app.currentUser.id, userId]);
            if (!created.success) return console.error('Failed to create conversation');
            conv = { id: created.id, name: userName };
        }
        this.loadConversation(app, conv.id, userName);
    },

    // Load a conversation's messages
    async loadConversation(app, conversationId, title) {
        const header = document.getElementById('chat-header');
        header.textContent = title || 'Conversation';
        const messageList = document.getElementById('message-list');
        messageList.innerHTML = '';
        const msgs = await messagingModule.getMessages(conversationId);
        if (!msgs.success) return console.error('Failed to load messages');
        msgs.messages.forEach(msg => this.renderMessage(msg, app.currentUser.id));
        // Store current conversation id for sending
        this.currentConversationId = conversationId;
    },

    // Render a single message bubble
    renderMessage(msg, currentUserId) {
        const messageList = document.getElementById('message-list');
        const bubble = document.createElement('div');
        bubble.className = msg.sender_id === currentUserId ? 'bubble outgoing' : 'bubble incoming';
        if (msg.message_type === 'file' && msg.file_url) {
            const link = document.createElement('a');
            link.href = msg.file_url;
            link.textContent = msg.file_name || 'File';
            link.target = '_blank';
            bubble.appendChild(link);
        } else {
            bubble.textContent = msg.content;
        }
        const time = document.createElement('span');
        time.className = 'timestamp';
        time.textContent = new Date(msg.created_at).toLocaleTimeString();
        bubble.appendChild(time);
        messageList.appendChild(bubble);
        messageList.scrollTop = messageList.scrollHeight;
    },

    // Send a text or file message
    async sendMessage(app) {
        const textarea = document.getElementById('chat-input');
        const content = textarea.value.trim();
        if (!content && !this.pendingFile) return;
        const convId = this.currentConversationId;
        if (!convId) return alert('Select a conversation first');
        if (this.pendingFile) {
            // Upload file first
            const uploadRes = await this.uploadFile(this.pendingFile);
            if (!uploadRes.success) return console.error('File upload failed');
            await messagingModule.sendMessage(convId, '', 'file', uploadRes.fileUrl, uploadRes.fileName, uploadRes.fileSize);
            this.pendingFile = null;
        } else {
            await messagingModule.sendMessage(convId, content);
        }
        textarea.value = '';
        // Refresh messages
        this.loadConversation(app, convId, document.getElementById('chat-header').textContent);
    },

    // Handle file selection
    handleFileUpload(app, file) {
        if (!file) return;
        this.pendingFile = file;
        // Show file name in input placeholder
        document.getElementById('chat-input').placeholder = `File ready: ${file.name}`;
    },

    // Upload file to server (simple implementation using FormData)
    async uploadFile(file) {
        const form = new FormData();
        form.append('file', file);
        try {
            const res = await fetch('/api/messaging/files', {
                method: 'POST',
                credentials: 'same-origin',
                body: form
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            return { success: true, fileUrl: data.url, fileName: file.name, fileSize: file.size };
        } catch (err) {
            console.error('File upload error:', err);
            return { success: false };
        }
    },

    // Create a group chat (simple prompt based UI)
    async createGroupChat(app) {
        const name = prompt('Group name:');
        if (!name) return;
        // For simplicity, ask user to input comma‑separated user IDs
        const ids = prompt('Enter participant IDs (comma separated):');
        if (!ids) return;
        const participantIds = ids.split(',').map(id => id.trim());
        // Ensure current user is included
        if (!participantIds.includes(String(app.currentUser.id))) participantIds.push(String(app.currentUser.id));
        const res = await messagingModule.createConversation(participantIds, name);
        if (res.success) alert('Group created');
        else console.error('Failed to create group');
    }
};

// Expose globally for debugging
window.chatUIModule = chatUIModule;
