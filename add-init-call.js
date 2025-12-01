const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, 'public', 'js', 'main.js');

// Read the file
let content = fs.readFileSync(mainJsPath, 'utf8');

// Find and replace the init method - be very specific
const oldInit = `  // ========== INITIALIZATION ==========
  async init() {
    await this.checkAuth();
    await this.render();
    this.attachGlobalListeners();
  }`;

const newInit = `  // ========== INITIALIZATION ==========
  async init() {
    await this.checkAuth();
    await this.loadRoleConfig();  // Load role permissions from database
    await this.render();
    this.attachGlobalListeners();
  }`;

if (content.includes(oldInit)) {
    content = content.replace(oldInit, newInit);
    fs.writeFileSync(mainJsPath, content, 'utf8');
    console.log('✅ Successfully added loadRoleConfig() call to init method!');
    console.log('   - init() now loads role permissions before rendering');
    console.log('   - This will fix the "Access Denied" issue on page refresh');
} else {
    console.log('❌ Could not find the exact init() method pattern.');
    console.log('The init() method may have different formatting.');
}
