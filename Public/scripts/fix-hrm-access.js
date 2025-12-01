// ============================================
// FIX HRM ACCESS PERMISSIONS
// Add HRM permission to admin/hr roles
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');

console.log('🔧 Fixing HRM access permissions...\n');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Check if there's a permissions table
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%permission%'", [], (err, tables) => {
        if (err) {
            console.error('Error:', err);
            db.close();
            return;
        }

        console.log('Found permission tables:', tables.map(t => t.name));

        // Update menu item permission
        db.run(`UPDATE menu_items SET permission = 'admin,hr,manager' WHERE route = 'hrm'`, function (err) {
            if (err) {
                console.log('⚠️  Could not update permission:', err.message);
            } else {
                console.log(`✅ Updated permission for HRM menu (${this.changes} rows)`);
            }
        });

        // Check current HRM menu
        setTimeout(() => {
            db.all("SELECT id, name, route, permission FROM menu_items WHERE route = 'hrm'", [], (err, rows) => {
                if (err) {
                    console.error('Error:', err);
                } else {
                    console.log('\n📋 Current HRM menu:');
                    console.log(JSON.stringify(rows, null, 2));
                    console.log('\n✅ Done! HRM should now be accessible.');
                    console.log('💡 Refresh your browser and try again.');
                }
                db.close();
            });
        }, 300);
    });
});
