// ============================================
// MESSAGING ROUTES
// Author: itqatarfoam-hub
// Date: 2025-11-27 12:00:00 UTC
// ============================================

const express = require('express');
const router = express.Router();
const messagingService = require('../services/messaging.service');
const { requireAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get user's conversations
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const conversations = await messagingService.getUserConversations(userId);
    res.json({ conversations });
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get conversation messages
router.get('/conversations/:id/messages', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const conversationId = req.params.id;

    const messages = await messagingService.getMessages(conversationId, userId);
    res.json({ messages });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/messages', requireAuth, async (req, res) => {
  try {
    const { conversation_id, content, message_type, file_url, file_name, file_size } = req.body;
    const senderId = req.session.user.id;

    if (!conversation_id || !content) {
      return res.status(400).json({ error: 'Conversation ID and content are required' });
    }

    const messageId = await messagingService.sendMessage({
      conversationId: conversation_id,
      senderId,
      content,
      messageType: message_type || 'text',
      fileUrl: file_url,
      fileName: file_name,
      fileSize: file_size
    });

    res.status(201).json({
      success: true,
      id: messageId,
      message: 'Message sent successfully'
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Create private conversation
router.post('/conversations', requireAuth, async (req, res) => {
  try {
    const { participant_ids, name } = req.body;
    const creatorId = req.session.user.id;

    if (!participant_ids || participant_ids.length === 0) {
      return res.status(400).json({ error: 'At least one participant is required' });
    }

    const conversationId = await messagingService.createPrivateConversation({
      creatorId,
      participantIds: participant_ids,
      name
    });

    res.status(201).json({
      success: true,
      id: conversationId,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    logger.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Mark message as read
router.post('/messages/:id/read', requireAuth, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.session.user.id;

    await messagingService.markAsRead(messageId, userId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Get unread count
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const count = await messagingService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    logger.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Add participant to conversation
router.post('/conversations/:id/participants', requireAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await messagingService.addParticipant(conversationId, user_id);
    res.json({ success: true, message: 'Participant added successfully' });
  } catch (error) {
    logger.error('Error adding participant:', error);
    res.status(500).json({ error: 'Failed to add participant' });
  }
});

// Get conversation participants
router.get('/conversations/:id/participants', requireAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const participants = await messagingService.getParticipants(conversationId);
    res.json({ participants });
  } catch (error) {
    logger.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// Delete conversation (both sides)
router.delete('/conversations/:id', requireAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.session.user.id;

    await messagingService.deleteConversation(conversationId, userId);
    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    logger.error('Error deleting conversation:', error);
    res.status(500).json({ error: error.message || 'Failed to delete conversation' });
  }
});

// Delete message
router.delete('/messages/:id', requireAuth, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.session.user.id;

    await messagingService.deleteMessage(messageId, userId);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({ error: error.message || 'Failed to delete message' });
  }
});

// Upload file
router.post('/upload', requireAuth, async (req, res) => {
  try {
    const { conversation_id, file_name, file_size, file_type, file_url } = req.body;
    const senderId = req.session.user.id;

    if (!conversation_id || !file_name || !file_url) {
      return res.status(400).json({ error: 'Conversation ID, file name, and file URL are required' });
    }

    const messageId = await messagingService.uploadFile({
      conversationId: conversation_id,
      senderId,
      fileName: file_name,
      fileSize: file_size,
      fileType: file_type,
      fileUrl: file_url
    });

    res.status(201).json({
      success: true,
      id: messageId,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    logger.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

module.exports = router;