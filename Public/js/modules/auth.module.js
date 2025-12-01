const authModule = {
  async login(username, password) {
    console.log('🔐 authModule.login called');
    console.log('  Username:', username);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password })
      });

      console.log('📡 Login response status:', res.status);
      const data = await res.json();
      console.log('📦 Login response data:', data);

      if (!res.ok) {
        console.error('❌ Login failed:', data.error);
        return { success: false, error: data.error || 'Login failed' };
      }

      console.log('✅ Login successful');
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Login network error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async checkAuth() {
    console.log('🔍 Checking authentication...');
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'same-origin'
      });

      console.log('📡 Auth check status:', res.status);

      if (!res.ok) {
        console.log('❌ Not authenticated');
        return { authenticated: false };
      }

      const data = await res.json();
      console.log('✅ Authenticated as:', data.user?.username);
      return { authenticated: true, user: data.user };
    } catch (error) {
      console.error('❌ Auth check error:', error);
      return { authenticated: false };
    }
  },

  async logout() {
    console.log('🚪 Logging out...');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      });
      console.log('✅ Logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }
};

window.authModule = authModule;