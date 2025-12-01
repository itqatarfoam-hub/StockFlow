// ============================================
// NOTIFICATIONS ROUTES
// Handle notification operations
// ============================================

const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// ========== GET USER NOTIFICATIONS ==========
router.get('/', requireAuth, (req, res) => {
    const userId = req.session.user.id;

    db.all(
        `SELECT n.*, u.username as from_username, u.full_name as from_full_name
     FROM notifications n
     LEFT JOIN users u ON n.from_user_id = u.id
     WHERE n.to_user_id = ?
     ORDER BY n.created_at DESC
     LIMIT 50`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error('Error fetching notifications:', err);
                return res.status(500).json({ error: 'Failed to fetch notifications' });
            }

            res.json({ notifications: rows || [] });
        }
    );
});

// ========== GET UNREAD COUNT ==========
router.get('/unread-count', requireAuth, (req, res) => {
    const userId = req.session.user.id;

    db.get(
        `SELECT COUNT(*) as count FROM notifications WHERE to_user_id = ? AND is_read = 0`,
        [userId],
        (err, row) => {
            if (err) {
                console.error('Error counting unread notifications:', err);
                return res.status(500).json({ error: 'Failed to count notifications' });
            }

            res.json({ count: row ? row.count : 0 });
        }
    );
});

// ========== CREATE NOTIFICATION ==========
router.post('/', requireAuth, (req, res) => {
    const { type, title, message, to_user_id } = req.body;
    const from_user_id = req.session.user.id;

    if (!type || !title || !message || !to_user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const notificationId = uuidv4();

    db.run(
        `INSERT INTO notifications (id, type, title, message, from_user_id, to_user_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [notificationId, type, title, message, from_user_id, to_user_id],
        function (err) {
            if (err) {
                console.error('Error creating notification:', err);
                return res.status(500).json({ error: 'Failed to create notification' });
            }

            res.json({
                success: true,
                notification: {
                    id: notificationId,
                    type,
                    title,
                    message,
                    from_user_id,
                    to_user_id
                }
            });
        }
    );
});

// ========== CREATE PASSWORD RESET NOTIFICATION ==========
router.post('/password-reset', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    // Get user info
    db.get('SELECT id, username, full_name FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error('Error finding user:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            // For security, don't reveal if user exists or not
            return res.json({ success: true, message: 'If the account exists, an admin has been notified.' });
        }

        // Find all admin users
        db.all('SELECT id FROM users WHERE role = ?', ['admin'], (err, admins) => {
            if (err) {
                console.error('Error finding admins:', err);
                return res.status(500).json({ error: 'Failed to process request' });
            }

            if (!admins || admins.length === 0) {
                return res.status(500).json({ error: 'No administrators found' });
            }

            // Create notification for each admin
            const stmt = db.prepare(
                `INSERT INTO notifications (id, type, title, message, from_user_id, to_user_id)
         VALUES (?, ?, ?, ?, ?, ?)`
            );

            const title = '🔐 Password Reset Request';
            const message = `User "${user.username}" (${user.full_name || 'No name'}) has requested a password reset.`;

            admins.forEach(admin => {
                stmt.run([uuidv4(), 'password_reset', title, message, user.id, admin.id]);
            });

            stmt.finalize((err) => {
                if (err) {
                    console.error('Error creating notifications:', err);
                    return res.status(500).json({ error: 'Failed to notify administrators' });
                }

                res.json({
                    success: true,
                    message: 'Your password reset request has been sent to the administrators.'
                });
            });
        });
    });
});

// ========== MARK NOTIFICATION AS READ ==========
router.put('/:id/read', requireAuth, (req, res) => {
    const notificationId = req.params.id;
    const userId = req.session.user.id;

    db.run(
        `UPDATE notifications 
     SET is_read = 1, read_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND to_user_id = ?`,
        [notificationId, userId],
        function (err) {
            if (err) {
                console.error('Error marking notification as read:', err);
                return res.status(500).json({ error: 'Failed to update notification' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.json({ success: true });
        }
    );
});

// ========== MARK ALL AS READ ==========
router.put('/read-all', requireAuth, (req, res) => {
    const userId = req.session.user.id;

    db.run(
        `UPDATE notifications 
     SET is_read = 1, read_at = CURRENT_TIMESTAMP 
     WHERE to_user_id = ? AND is_read = 0`,
        [userId],
        function (err) {
            if (err) {
                console.error('Error marking all notifications as read:', err);
                return res.status(500).json({ error: 'Failed to update notifications' });
            }

            res.json({ success: true, updated: this.changes });
        }
    );
});

// ========== DELETE NOTIFICATION ==========
router.delete('/:id', requireAuth, (req, res) => {
    const notificationId = req.params.id;
    const userId = req.session.user.id;

    db.run(
        `DELETE FROM notifications WHERE id = ? AND to_user_id = ?`,
        [notificationId, userId],
        function (err) {
            if (err) {
                console.error('Error deleting notification:', err);
                return res.status(500).json({ error: 'Failed to delete notification' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.json({ success: true });
        }
    );
});

// ========== BROADCAST TO ALL USERS ==========
router.post('/broadcast', requireAuth, (req, res) => {
    const { title, message, type } = req.body;
    const from_user_id = req.session.user.id;
    const userRole = req.session.user.role;

    // Only admins can send broadcasts
    if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only administrators can send broadcasts' });
    }

    if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
    }

    // Get all users except the sender
    db.all('SELECT id FROM users WHERE id != ?', [from_user_id], (err, users) => {
        if (err) {
            console.error('Error finding users:', err);
            return res.status(500).json({ error: 'Failed to retrieve users' });
        }

        if (!users || users.length === 0) {
            return res.json({ success: true, userCount: 0, message: 'No users to notify' });
        }


        // Create notification for each user
        const stmt = db.prepare(
            `INSERT INTO notifications (id, type, title, message, from_user_id, to_user_id)
             VALUES (?, ?, ?, ?, ?, ?)`
        );

        const notificationType = type || 'system';  // Use 'system' type for broadcasts
        const prefixedTitle = `📢 ${title}`;

        users.forEach(user => {
            stmt.run([uuidv4(), notificationType, prefixedTitle, message, from_user_id, user.id]);
        });

        stmt.finalize((err) => {
            if (err) {
                console.error('Error creating broadcast notifications:', err);
                return res.status(500).json({ error: 'Failed to send broadcast' });
            }

            res.json({
                success: true,
                userCount: users.length,
                message: `Broadcast sent to ${users.length} user(s)`
            });
        });
    });
});

module.exports = router;
