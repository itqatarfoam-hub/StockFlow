// ============================================
// ROLES ROUTES - FIXED UPDATE ENDPOINT
// Author: itqatarfoam-hub
// Date: 2025-11-24 09:42:17 UTC
// ============================================

const express = require('express');
const { db } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// ========== GET ALL ROLES ==========
router.get('/', (req, res) => {
  console.log('📥 Fetching all roles');

  db.all('SELECT * FROM roles ORDER BY is_system DESC, name ASC', [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching roles:', err);
      return res.status(500).json({ error: 'Failed to fetch roles' });
    }

    // Parse permissions JSON for each role
    const roles = rows.map(role => ({
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : []
    }));

    console.log('✅ Found', roles.length, 'roles');
    res.json({ roles });
  });
});

// ========== GET ROLE BY ID ==========
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log('📥 Fetching role:', id);

  db.get('SELECT * FROM roles WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('❌ Error fetching role:', err);
      return res.status(500).json({ error: 'Failed to fetch role' });
    }

    if (!row) {
      console.error('❌ Role not found:', id);
      return res.status(404).json({ error: 'Role not found' });
    }

    // Parse permissions
    const role = {
      ...row,
      permissions: row.permissions ? JSON.parse(row.permissions) : []
    };

    console.log('✅ Role found:', role.name);
    res.json({ role });
  });
});

// ========== CREATE ROLE ==========
router.post('/', (req, res) => {
  console.log('➕ ========== CREATE ROLE START ==========');
  console.log('📦 Request body:', req.body);

  const { name, display_name, permissions, description } = req.body;

  // Validation
  if (!name || !display_name || !permissions) {
    console.error('❌ Missing required fields');
    return res.status(400).json({ 
      error: 'Name, display name, and permissions are required' 
    });
  }

  try {
    const roleId = require('uuid').v4();
    const permissionsJson = JSON.stringify(permissions);

    console.log('💾 Creating role:', {
      id: roleId,
      name,
      display_name,
      permissions: permissions.length + ' items',
      description
    });

    db.run(
      `INSERT INTO roles (id, name, display_name, permissions, description, is_system)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [roleId, name, display_name, permissionsJson, description || ''],
      function(err) {
        if (err) {
          console.error('❌ Database error:', err);
          
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ 
              error: `Role name "${name}" already exists` 
            });
          }
          
          return res.status(500).json({ error: 'Failed to create role' });
        }

        console.log('✅ Role created successfully');
        console.log('➕ ========== CREATE ROLE COMPLETE ==========\n');
        
        res.status(201).json({
          success: true,
          id: roleId,
          role: {
            id: roleId,
            name,
            display_name,
            permissions,
            description,
            is_system: 0
          }
        });
      }
    );
  } catch (error) {
    console.error('❌ Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// ========== UPDATE ROLE ==========
router.put('/:id', (req, res) => {
  console.log('✏️ ========== UPDATE ROLE START ==========');
  console.log('🆔 Role ID:', req.params.id);
  console.log('📦 Request body:', req.body);

  const { id } = req.params;
  const { display_name, permissions, description } = req.body;

  // Validation
  if (!display_name || !permissions) {
    console.error('❌ Missing required fields');
    return res.status(400).json({ 
      error: 'Display name and permissions are required' 
    });
  }

  try {
    // ⭐ CRITICAL: Check if role exists first
    db.get('SELECT * FROM roles WHERE id = ?', [id], (err, role) => {
      if (err) {
        console.error('❌ Database error checking role:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!role) {
        console.error('❌ Role not found:', id);
        return res.status(404).json({ error: 'Role not found' });
      }

      console.log('✓ Role found:', role.name, 'is_system:', role.is_system);

      // ⭐ ALLOW EDITING SYSTEM ROLES (but warn in logs)
      if (role.is_system === 1) {
        console.warn('⚠️ WARNING: Editing system role:', role.name);
        console.warn('⚠️ This may affect default permissions');
      }

      const permissionsJson = JSON.stringify(permissions);

      console.log('💾 Updating role with:', {
        display_name,
        permissions: permissions.length + ' items',
        description
      });

      db.run(
        `UPDATE roles 
         SET display_name = ?, 
             permissions = ?, 
             description = ?,
             updated_at = datetime('now')
         WHERE id = ?`,
        [display_name, permissionsJson, description || '', id],
        function(err) {
          if (err) {
            console.error('❌ Database error updating role:', err);
            return res.status(500).json({ error: 'Failed to update role' });
          }

          if (this.changes === 0) {
            console.error('❌ No changes made');
            return res.status(404).json({ error: 'Role not found' });
          }

          console.log('✅ Role updated successfully, changes:', this.changes);
          console.log('✏️ ========== UPDATE ROLE COMPLETE ==========\n');

          res.json({
            success: true,
            changes: this.changes
          });
        }
      );
    });
  } catch (error) {
    console.error('❌ Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// ========== DELETE ROLE ==========
router.delete('/:id', (req, res) => {
  console.log('🗑️ ========== DELETE ROLE START ==========');
  console.log('🆔 Role ID:', req.params.id);

  const { id } = req.params;

  // Check if role exists and is not a system role
  db.get('SELECT * FROM roles WHERE id = ?', [id], (err, role) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!role) {
      console.error('❌ Role not found:', id);
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.is_system === 1) {
      console.error('❌ Cannot delete system role:', role.name);
      return res.status(400).json({ 
        error: 'Cannot delete system roles (admin, manager, user)' 
      });
    }

    console.log('🗑️ Deleting custom role:', role.name);

    db.run('DELETE FROM roles WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('❌ Database error deleting role:', err);
        return res.status(500).json({ error: 'Failed to delete role' });
      }

      console.log('✅ Role deleted successfully');
      console.log('🗑️ ========== DELETE ROLE COMPLETE ==========\n');

      res.json({ success: true });
    });
  });
});

module.exports = router;