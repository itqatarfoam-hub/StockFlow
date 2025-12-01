// Check broadcast_approval values for all users
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/stockflow.db');

console.log('📊 User Broadcast Approval Status:\n');

db.all(`
  SELECT id, username, full_name, role, broadcast_approval 
  FROM users 
  ORDER BY username
`, [], (err, users) => {
    if (err) {
        console.error('❌ Error:', err.message);
        db.close();
        return;
    }

    users.forEach((user, index) => {
        const status = user.broadcast_approval === 1 ? '✅ APPROVED' : '❌ NOT APPROVED';
        console.log(`${index + 1}. ${user.username} (${user.full_name})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Broadcast Approval: ${user.broadcast_approval} ${status}`);
        console.log('');
    });

    console.log('✅ Check complete!');
    db.close();
});
