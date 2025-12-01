// ============================================
// MESSAGING API MODULE
// Author: itqatarfoam-hub
// Date: 2025-11-27 12:00:00 UTC
// ============================================

const messagingModule = {
  // Helper to check if we should make API calls (prevents unauthorized calls on page load)
  canMakeApiCalls() {
    // Don't make calls if we're on the login page or if window.app doesn't exist yet
    if (!window.app || !window.app.currentUser) {
      console.log('⚠️ Messaging API: Skipping call - user not authenticated');
      return false;
    }
    return true;
  },

  // Get user's conversations
  async getConversations() {
    if (!this.canMakeApiCalls()) {
      return { success: false, conversations: [], error: 'Not authenticated' };
    }

    try {
      const res = await fetch('/api/messaging/conversations', {
        credentials: 'same-origin'
      });
      const data = await res.json();
      return { success: res.ok, conversations: data.conversations || [], error: data.error };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { success: false, conversations: [], error: error.message };
    }
  },

  // Get messages for a conversation
  async getMessages(conversationId) {
    try {
      const res = await fetch(`/api/messaging/conversations/${conversationId}/messages`, {
        credentials: 'same-origin'
      });
      const data = await res.json();
      return { success: res.ok, messages: data.messages || [], error: data.error };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { success: false, messages: [], error: error.message };
    }
  },

  // Send message
  async sendMessage(conversationId, content, messageType = 'text', fileUrl = null, fileName = null, fileSize = null) {
    try {
      const res = await fetch('/api/messaging/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          conversation_id: conversationId,
          content,
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize
        })
      });
      const data = await res.json();
      return { success: res.ok, id: data.id, error: data.error };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  },

  // Create private conversation
  async createConversation(participantIds, name = null) {
    try {
      const res = await fetch('/api/messaging/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          participant_ids: participantIds,
          name
        })
      });
      const data = await res.json();
      return { success: res.ok, id: data.id, error: data.error };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark message as read
  async markAsRead(messageId) {
    try {
      const res = await fetch(`/api/messaging/messages/${messageId}/read`, {
        method: 'POST',
        credentials: 'same-origin'
      });
      const data = await res.json();
      return { success: res.ok, error: data.error };
    } catch (error) {
      console.error('Error marking as read:', error);
      return { success: false, error: error.message };
    }
  },

  // Get unread count
  async getUnreadCount() {
    if (!this.canMakeApiCalls()) {
      return { success: false, count: 0, error: 'Not authenticated' };
    }

    try {
      const res = await fetch('/api/messaging/unread-count', {
        credentials: 'same-origin'
      });
      const data = await res.json();
      return { success: res.ok, count: data.count || 0, error: data.error };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { success: false, count: 0, error: error.message };
    }
  },

  // Add participant to conversation
  async addParticipant(conversationId, userId) {
    try {
      const res = await fetch(`/api/messaging/conversations/${conversationId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      return { success: res.ok, error: data.error };
    } catch (error) {
      console.error('Error adding participant:', error);
      return { success: false, error: error.message };
    }
  },

  // Get conversation participants
  async getParticipants(conversationId) {
    try {
      const res = await fetch(`/api/messaging/conversations/${conversationId}/participants`, {
        credentials: 'same-origin'
      });
      const data = await res.json();
      return { success: res.ok, participants: data.participants || [], error: data.error };
    } catch (error) {
      console.error('Error fetching participants:', error);
      return { success: false, participants: [], error: error.message };
    }
  },

  // Delete conversation (both sides)
  async deleteConversation(conversationId) {
    try {
      const res = await fetch(`/api/messaging/conversations/${conversationId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      const data = await res.json();
      return { success: res.ok, error: data.error };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete message
  async deleteMessage(messageId) {
    try {
      const res = await fetch(`/api/messaging/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      const data = await res.json();
      return { success: res.ok, error: data.error };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload file
  async uploadFile(conversationId, fileName, fileSize, fileType, fileUrl) {
    try {
      const res = await fetch('/api/messaging/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          conversation_id: conversationId,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          file_url: fileUrl
        })
      });
      const data = await res.json();
      return { success: res.ok, id: data.id, error: data.error };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }
  }
};

window.messagingModule = messagingModule;