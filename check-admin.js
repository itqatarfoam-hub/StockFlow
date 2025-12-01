const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./data/stockflow.db', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');
});

console.log('🔍 Checking admin user...\n');

db.get("SELECT * FROM users WHERE username = 'admin'", async (err, user) => {
  if (err) {
    console.error('❌ Database error:', err);
    db.close();
    process.exit(1);
  }

  if (!user) {
    console.log('❌ Admin user NOT found in database!');
    console.log('\n💡 Creating admin user...\n');

    const { v4: uuidv4 } = require('uuid');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const now = new Date().toISOString();

    db.run(`
      INSERT INTO users (id, username, password, full_name, email, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [uuidv4(), 'admin', hashedPassword, 'Administrator', 'admin@stockflow.com', 'admin', now, now], (err) => {
      if (err) {
        console.error('❌ Error creating admin:', err);
      } else {
        console.log('✅ Admin user created successfully!');
        console.log('\nCredentials:');
        console.log('  Username: admin');
        console.log('  Password: admin123\n');
      }
      db.close();
      process.exit(0);
    });
  } else {
    console.log('✅ Admin user found!\n');
    console.log('User Details:');
    console.log('  ID:', user.id);
    console.log('  Username:', user.username);
    console.log('  Full Name:', user.full_name);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Created:', user.created_at);
    console.log('\n🔐 Testing password "admin123"...\n');

    bcrypt.compare('admin123', user.password, (err, isMatch) => {
      if (err) {
        console.error('❌ Error comparing password:', err);
      } else if (isMatch) {
        console.log('✅ Password "admin123" is CORRECT');
      } else {
        console.log('❌ Password "admin123" is WRONG');
        console.log('\n💡 Resetting password to "admin123"...\n');

        bcrypt.hash('admin123', 10, (err, newHash) => {
          if (err) {
            console.error('❌ Error hashing password:', err);
          } else {
            const now = new Date().toISOString();
            db.run('UPDATE users SET password = ?, updated_at = ? WHERE username = ?', [newHash, now, 'admin'], (err) => {
              if (err) {
                console.error('❌ Error updating password:', err);
              } else {
                console.log('✅ Password reset successfully!');
              }
              db.close();
              process.exit(0);
            });
            return;
          }
          db.close();
          process.exit(0);
        });
        return;
      }
      db.close();
      process.exit(0);
    });
  }
});