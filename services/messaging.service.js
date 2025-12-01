// ============================================
// MESSAGING SERVICE
// Author: itqatarfoam-hub
// Date: 2025-11-23 07:50:00 UTC
// ============================================

const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class MessagingService {
  // Get all conversations for a user
  async getUserConversations(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          c.*,
          COUNT(DISTINCT m.id) as message_count,
          COUNT(DISTINCT CASE WHEN m.sender_id != ? AND mr.id IS NULL THEN m.id END) as unread_count,
          MAX(m.created_at) as last_message_at,
          (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
        FROM conversations c
        INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
        LEFT JOIN messages m ON c.id = m.conversation_id
        LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = ?
        WHERE cp.user_id = ?
        GROUP BY c.id
        ORDER BY last_message_at DESC
      `;

      db.all(query, [userId, userId, userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // Get conversation by ID
  async getConversationById(conversationId, userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          c.*,
          GROUP_CONCAT(DISTINCT u.username) as participants
        FROM conversations c
        INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
        LEFT JOIN users u ON cp.user_id = u.id
        WHERE c.id = ? AND EXISTS (
          SELECT 1 FROM conversation_participants 
          WHERE conversation_id = c.id AND user_id = ?
        )
        GROUP BY c.id
      `;

      db.get(query, [conversationId, userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  // Get messages for a conversation
  async getMessages(conversationId, userId, limit = 50) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          m.*,
          u.username as sender_name,
          u.full_name as sender_full_name,
          EXISTS (
            SELECT 1 FROM message_reads 
            WHERE message_id = m.id AND user_id = ?
          ) as is_read_by_me
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at DESC
        LIMIT ?
      `;

      db.all(query, [userId, conversationId, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve((rows || []).reverse());
        }
      });
    });
  }

  // Send message
  async sendMessage({ conversationId, senderId, content, messageType = 'text', fileUrl = null, fileName = null, fileSize = null }) {
    return new Promise((resolve, reject) => {
      const messageId = uuidv4();

      db.run(
        `INSERT INTO messages (id, conversation_id, sender_id, message_type, content, file_url, file_name, file_size)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [messageId, conversationId, senderId, messageType, content, fileUrl, fileName, fileSize],
        (err) => {
          if (err) {
            reject(err);
          } else {
            // Update conversation timestamp
            db.run(
              'UPDATE conversations SET updated_at = datetime("now") WHERE id = ?',
              [conversationId]
            );
            resolve(messageId);
          }
        }
      );
    });
  }

  // Create private conversation
  async createPrivateConversation({ creatorId, participantIds, name = null }) {
    return new Promise((resolve, reject) => {
      const conversationId = uuidv4();
      const type = participantIds.length > 1 ? 'group' : 'private';

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Create conversation
        db.run(
          `INSERT INTO conversations (id, name, type, created_by)
           VALUES (?, ?, ?, ?)`,
          [conversationId, name, type, creatorId],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }

            // Add creator as participant
            const allParticipants = [creatorId, ...participantIds];
            const uniqueParticipants = [...new Set(allParticipants)];

            const stmt = db.prepare(
              `INSERT INTO conversation_participants (id, conversation_id, user_id)
               VALUES (?, ?, ?)`
            );

            for (const userId of uniqueParticipants) {
              stmt.run(uuidv4(), conversationId, userId);
            }

            stmt.finalize((err) => {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
              } else {
                db.run('COMMIT', (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                  } else {
                    resolve(conversationId);
                  }
                });
              }
            });
          }
        );
      });
    });
  }

  // Mark message as read
  async markAsRead(messageId, userId) {
    return new Promise((resolve, reject) => {
      const readId = uuidv4();

      db.run(
        `INSERT OR IGNORE INTO message_reads (id, message_id, user_id)
         VALUES (?, ?, ?)`,
        [readId, messageId, userId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  // Get unread message count
  async getUnreadCount(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(DISTINCT m.id) as unread_count
        FROM messages m
        INNER JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
        LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = ?
        WHERE cp.user_id = ? AND m.sender_id != ? AND mr.id IS NULL
      `;

      db.get(query, [userId, userId, userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.unread_count || 0);
        }
      });
    });
  }

  // Add participant to conversation
  async addParticipant(conversationId, userId) {
    return new Promise((resolve, reject) => {
      const participantId = uuidv4();

      db.run(
        `INSERT INTO conversation_participants (id, conversation_id, user_id)
         VALUES (?, ?, ?)`,
        [participantId, conversationId, userId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
    });
  }

  // Get conversation participants
  async getParticipants(conversationId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          u.id,
          u.username,
          u.full_name,
          cp.joined_at
        FROM conversation_participants cp
        INNER JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = ?
        ORDER BY cp.joined_at ASC
      `;

      db.all(query, [conversationId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // Delete conversation (for all participants - both sides)
  async deleteConversation(conversationId, userId) {
    return new Promise((resolve, reject) => {
      // Verify user is a participant
      const verifyQuery = `
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = ? AND user_id = ?
      `;

      db.get(verifyQuery, [conversationId, userId], (err, row) => {
        if (err) {
          return reject(err);
        }
        if (!row) {
          return reject(new Error('User is not a participant of this conversation'));
        }

        // Delete conversation (CASCADE will handle participants and messages)
        db.run(
          'DELETE FROM conversations WHERE id = ?',
          [conversationId],
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          }
        );
      });
    });
  }

  // Delete a specific message
  async deleteMessage(messageId, userId) {
    return new Promise((resolve, reject) => {
      // Verify user is the sender
      const verifyQuery = 'SELECT sender_id FROM messages WHERE id = ?';

      db.get(verifyQuery, [messageId], (err, row) => {
        if (err) {
          return reject(err);
        }
        if (!row) {
          return reject(new Error('Message not found'));
        }
        if (row.sender_id !== userId) {
          return reject(new Error('Only the sender can delete this message'));
        }

        // Delete message
        db.run('DELETE FROM messages WHERE id = ?', [messageId], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    });
  }

  // Upload file (store file metadata)
  async uploadFile({ conversationId, senderId, fileName, fileSize, fileType, fileUrl }) {
    return new Promise((resolve, reject) => {
      const messageId = uuidv4();
      const messageType = fileType?.startsWith('image/') ? 'image' : 'file';
      const content = `Sent ${messageType === 'image' ? 'an image' : 'a file'}: ${fileName}`;

      db.run(
        `INSERT INTO messages (id, conversation_id, sender_id, message_type, content, file_url, file_name, file_size)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [messageId, conversationId, senderId, messageType, content, fileUrl, fileName, fileSize],
        (err) => {
          if (err) {
            reject(err);
          } else {
            // Update conversation timestamp
            db.run(
              'UPDATE conversations SET updated_at = datetime("now") WHERE id = ?',
              [conversationId]
            );
            resolve(messageId);
          }
        }
      );
    });
  }
}

module.exports = new MessagingService();