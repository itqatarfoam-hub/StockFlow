const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, 'public', 'js', 'main.js');

// Read the file
let content = fs.readFileSync(mainJsPath, 'utf8');

// The method to add
const closeUserModalMethod = `
  closeUserModal() {
    console.log('🚪 Closing user modal');
    
    const modal = document.getElementById('userModal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }

    const userForm = document.getElementById('userForm');
    if (userForm) userForm.reset();

    const errorMsg = document.getElementById('userErrorMsg');
    if (errorMsg) errorMsg.textContent = '';

    this.editingUserId = null;
    console.log('✅ User modal closed');
  }
`;

// Find the location to insert - right after handleUserFormSubmit ends and before createUserModal
// Look for the pattern: }  }  NEWLINE  createUserModal() {
const pattern = /(\s+}\s+}\s+)(createUserModal\(\)\s*{)/;

if (pattern.test(content)) {
    // Insert the method
    content = content.replace(pattern, `$1${closeUserModalMethod}\n\n  $2`);

    // Write back
    fs.writeFileSync(mainJsPath, content, 'utf8');
    console.log('✅ Successfully added closeUserModal method!');
} else {
    console.log('❌ Could not find insertion point.');
    console.log('File may have different structure than expected.');
}
