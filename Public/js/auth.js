// ============================================
// AUTHENTICATION MODULE
// Handle user authentication
// ============================================

if (typeof authModule === 'undefined') {
  const authModule = {
    async checkAuth() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        const data = await res.json();
        
        if (res.ok && data.user) {
          return { authenticated: true, user: data.user };
        }
        
        return { authenticated: false, user: null };
      } catch (error) {
        console.error('Auth check error:', error);
        return { authenticated: false, user: null };
      }
    },

    async login(username, password) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
          return { success: true, user: data.user };
        }

        return { success: false, error: data.error || 'Login failed' };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error' };
      }
    },

    async logout() {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'same-origin'
        });
        return { success: true };
      } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
      }
    }
  };

  window.authModule = authModule;
}