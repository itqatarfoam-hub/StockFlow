const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, 'public', 'js', 'main.js');

// Read the file
let content = fs.readFileSync(mainJsPath, 'utf8');

// Add loadRoleConfig method after checkAuth
const loadRoleConfigMethod = `
  async loadRoleConfig() {
    try {
      console.log('📋 Loading role configuration from API...');
      const res = await fetch('/api/roles', {
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        console.warn('⚠️ Could not load roles from API, using default config');
        return;
      }
      
      const data = await res.json();
      const roles = data.roles || [];
      
      console.log('📦 Loaded roles:', roles.length);
      
      // Build role access config from API data
      const newConfig = {};
      roles.forEach(role => {
        newConfig[role.name] = role.permissions || [];
        console.log(\`  - \${role.name}: [\${(role.permissions || []).join(', ')}]\`);
      });
      
      // Update roleAccessConfig
      this.roleAccessConfig = newConfig;
      console.log('✅ Role configuration updated from API');
      
    } catch (error) {
      console.error('❌ Error loading role config:', error);
      console.log('⚠️ Using default role configuration');
    }
  }
`;

// Find the position after checkAuth method
const checkAuthEnd = content.indexOf('  async loadInitialData()');

if (checkAuthEnd > 0) {
    // Insert the method before loadInitialData
    content = content.substring(0, checkAuthEnd) + loadRoleConfigMethod + '\n' + content.substring(checkAuthEnd);

    // Now update the init method to call loadRoleConfig
    const oldInit = `  async init() {
    await this.checkAuth();
    await this.render();
    this.attachGlobalListeners();
  }`;

    const newInit = `  async init() {
    await this.checkAuth();
    await this.loadRoleConfig();  // Load role configuration from API
    await this.render();
    this.attachGlobalListeners();
  }`;

    content = content.replace(oldInit, newInit);

    fs.writeFileSync(mainJsPath, content, 'utf8');
    console.log('✅ Successfully added loadRoleConfig method and updated init!');
    console.log('   - loadRoleConfig loads permissions from /api/roles');
    console.log('   - init() now calls loadRoleConfig before rendering');
    console.log('   - This fixes the "access denied" issue on page refresh');
} else {
    console.log('❌ Could not find insertion point.');
}
