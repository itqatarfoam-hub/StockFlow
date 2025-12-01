// ============================================
// SIMPLIFY HRM MENU - SINGLE ENTRY WITH TABS
// Remove sub-menus, keep only main "HR Management"
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');

console.log('🔧 Simplifying HRM menu structure...\n');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Step 1: Remove ALL current HRM menus
    console.log('Step 1: Removing current HRM menu entries...');
    db.run(`DELETE FROM menu_items WHERE route LIKE '%hr%' OR route = 'my-hr'`, function (err) {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log(`✅ Removed ${this.changes} entries\n`);
        }
    });

    // Step 2: Add single "HR Management" menu
    setTimeout(() => {
        console.log('Step 2: Adding single HRM menu entry...');
        db.run(`
            INSERT INTO menu_items (name, icon, route, permission, display_order, is_active, parent_id, created_at, updated_at)
            VALUES ('HR Management', '🏢', 'hrm', 'hrm', 100, 1, NULL, datetime('now'), datetime('now'))
        `, function (err) {
            if (err) {
                console.error('Error:', err.message);
            } else {
                console.log('✅ Added: HR Management (route: hrm)\n');
            }
        });

        // Step 3: Add Employee Portal (optional separate menu)
        setTimeout(() => {
            console.log('Step 3: Adding Employee Portal...');
            db.run(`
                INSERT INTO menu_items (name, icon, route, permission, display_order, is_active, parent_id, created_at, updated_at)
                VALUES ('My HR Portal', '👤', 'my-hr', 'employee', 101, 1, NULL, datetime('now'), datetime('now'))
            `, function (err) {
                if (err) {
                    console.error('Error:', err.message);
                } else {
                    console.log('✅ Added: My HR Portal\n');
                }

                // Verify
                db.all('SELECT name, route, parent_id FROM menu_items ORDER BY display_order', [], (err, rows) => {
                    if (err) {
                        console.error('Error:', err);
                    } else {
                        console.log('📋 Current Menu Structure:');
                        rows.forEach(row => {
                            const prefix = row.parent_id ? '  └─ ' : '📁 ';
                            console.log(`${prefix}${row.name} (${row.route})`);
                        });
                        console.log('\n🎉 Menu simplified!');
                        console.log('💡 HRM will now show as single menu with tabs inside.');
                    }
                    db.close();
                });
            });
        }, 300);
    }, 300);
});
