// ============================================
// MENU MANAGEMENT ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { db, getAllRows, runSQL, getRow } = require('../config/database');

// GET all menu items
router.get('/menu-items', async (req, res) => {
    try {
        const menuItems = await getAllRows(`
      SELECT * FROM menu_items 
      ORDER BY display_order ASC
    `);

        res.json({ success: true, menuItems });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET menu items by role
router.get('/menu-items/role/:role', async (req, res) => {
    try {
        const { role } = req.params;

        console.log(`📋 Fetching menu items for role: ${role}`);

        // Get all active menu items
        const allMenuItems = await getAllRows(`
            SELECT * FROM menu_items 
            WHERE is_active = 1 
            ORDER BY display_order ASC
        `);

        // Filter menu items where user's role is in the permission list
        // permission column contains comma-separated roles like "admin,hr,manager"
        // OR is NULL (accessible to all)
        const menuItems = allMenuItems.filter(item => {
            if (!item.permission || item.permission === '') {
                // No permission set = visible to all
                return true;
            }
            // Check if user's role is in the comma-separated list
            const allowedRoles = item.permission.split(',').map(r => r.trim().toLowerCase());
            return allowedRoles.includes(role.toLowerCase());
        });

        console.log(`✅ Returning ${menuItems.length} menu items for role ${role}`);
        res.json({ success: true, menuItems });
    } catch (error) {
        console.error('Error fetching menu items by role:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// CREATE new menu item
router.post('/menu-items', async (req, res) => {
    try {
        const { name, icon, route, permission, displayOrder } = req.body;

        if (!name || !route || !permission) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, route, permission'
            });
        }

        await runSQL(`
      INSERT INTO menu_items (name, icon, route, permission, display_order)
      VALUES (?, ?, ?, ?, ?)
    `, [name, icon || '📄', route, permission, displayOrder || 99]);

        // Get the last inserted ID
        const menuItem = await getRow('SELECT last_insert_rowid() as id');

        // Create blank page for this menu item
        await runSQL(`
      INSERT INTO menu_pages (menu_item_id, page_title, page_content)
      VALUES (?, ?, ?)
    `, [menuItem.id, name, `<div class="card"><h2>${name}</h2><p>Custom page content goes here...</p></div>`]);

        res.json({
            success: true,
            message: 'Menu item created successfully',
            menuItemId: menuItem.id
        });
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// UPDATE menu item
router.put('/menu-items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, route, permission, displayOrder, isActive } = req.body;

        await runSQL(`
      UPDATE menu_items 
      SET name = ?, icon = ?, route = ?, permission = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, icon, route, permission, displayOrder, isActive ? 1 : 0, id]);

        res.json({ success: true, message: 'Menu item updated successfully' });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE menu item
router.delete('/menu-items/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Don't allow deletion of default menu items (id <= 7)
        if (parseInt(id) <= 7) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete default menu items'
            });
        }

        await runSQL('DELETE FROM menu_items WHERE id = ?', [id]);

        res.json({ success: true, message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET page content for menu item
router.get('/menu-pages/:menuItemId', async (req, res) => {
    try {
        const { menuItemId } = req.params;

        const page = await getRow('SELECT * FROM menu_pages WHERE menu_item_id = ?', [menuItemId]);

        res.json({ success: true, page });
    } catch (error) {
        console.error('Error fetching menu page:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// UPDATE page content
router.put('/menu-pages/:menuItemId', async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const { pageTitle, pageContent } = req.body;

        const existing = await getRow('SELECT id FROM menu_pages WHERE menu_item_id = ?', [menuItemId]);

        if (existing) {
            await runSQL(`
        UPDATE menu_pages 
        SET page_title = ?, page_content = ?, updated_at = CURRENT_TIMESTAMP
        WHERE menu_item_id = ?
      `, [pageTitle, pageContent, menuItemId]);
        } else {
            await runSQL(`
        INSERT INTO menu_pages (menu_item_id, page_title, page_content)
        VALUES (?, ?, ?)
      `, [menuItemId, pageTitle, pageContent]);
        }

        res.json({ success: true, message: 'Page content updated successfully' });
    } catch (error) {
        console.error('Error updating menu page:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
