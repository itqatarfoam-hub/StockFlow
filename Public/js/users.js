// ============================================
// USERS API MODULE - COMPLETE
// Handles all user-related API operations
// Author: itqatarfoam-hub
// Date: 2025-11-24 08:55:00 UTC
// ============================================

const usersModule = (function() {
  console.log('📥 Loading Users API Module...');

  async function loadUsers() {
    console.log('📥 Loading users from API...');
    try {
      const res = await fetch('/api/users', { 
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) {
        console.error('❌ HTTP Error:', res.status);
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log('✅ Loaded', data.users?.length || 0, 'users');
      return data.users || [];
    } catch (error) {
      console.error('❌ Load users error:', error);
      return [];
    }
  }

  async function createUser(userData) {
    console.log('➕ ========== CREATE USER API CALL ==========');
    console.log('📤 User data:', {
      username: userData.username,
      full_name: userData.full_name,
      sales_code: userData.sales_code,
      email: userData.email,
      role: userData.role,
      password: '***'
    });

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(userData)
      });

      console.log('📡 Response status:', res.status);
      const data = await res.json();
      console.log('📦 Response data:', data);

      if (res.ok) {
        console.log('✅ User created successfully, ID:', data.id);
        console.log('➕ ========== CREATE USER COMPLETE ==========\n');
        return { success: true, id: data.id, user: data.user };
      }

      console.error('❌ Create failed:', data.error);
      return { success: false, error: data.error || 'Failed to create user' };
    } catch (error) {
      console.error('❌ Create user error:', error);
      return { success: false, error: error.message };
    }
  }

  async function updateUser(id, userData) {
    console.log('✏️ ========== UPDATE USER API CALL ==========');
    console.log('🆔 User ID:', id);
    console.log('📤 Update data:', {
      full_name: userData.full_name,
      sales_code: userData.sales_code,
      email: userData.email,
      role: userData.role,
      password: userData.password ? '***' : 'not changed'
    });

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(userData)
      });

      console.log('📡 Response status:', res.status);
      const data = await res.json();

      if (res.ok) {
        console.log('✅ User updated successfully');
        console.log('✏️ ========== UPDATE USER COMPLETE ==========\n');
        return { success: true };
      }

      console.error('❌ Update failed:', data.error);
      return { success: false, error: data.error || 'Failed to update user' };
    } catch (error) {
      console.error('❌ Update user error:', error);
      return { success: false, error: error.message };
    }
  }

  async function deleteUser(id) {
    console.log('🗑️ ========== DELETE USER API CALL ==========');
    console.log('🆔 User ID:', id);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      console.log('📡 Response status:', res.status);
      const data = await res.json();

      if (res.ok) {
        console.log('✅ User deleted successfully');
        console.log('🗑️ ========== DELETE USER COMPLETE ==========\n');
        return { success: true };
      }

      console.error('❌ Delete failed:', data.error);
      return { success: false, error: data.error || 'Failed to delete user' };
    } catch (error) {
      console.error('❌ Delete user error:', error);
      return { success: false, error: error.message };
    }
  }

  console.log('✅ Users API Module loaded');

  return {
    loadUsers,
    createUser,
    updateUser,
    deleteUser
  };
})();

window.usersModule = usersModule;