// ============================================
// COMPREHENSIVE DATABASE CHECK FOR HRM ACCESS
// Check tables, roles, permissions, and menu
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');

console.log('🔍 COMPREHENSIVE DATABASE CHECK\n');
console.log('📁 Database:', dbPath, '\n');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Check all tables
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. ALL TABLES IN DATABASE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
        if (err) {
            console.error('Error:', err);
        } else {
            tables.forEach(t => console.log(`  📋 ${t.name}`));
        }
    });

    // 2. Check menu_items structure
    setTimeout(() => {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('2. MENU_ITEMS TABLE STRUCTURE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        db.all("PRAGMA table_info(menu_items)", [], (err, columns) => {
            if (err) {
                console.error('Error:', err);
            } else {
                columns.forEach(col => {
                    console.log(`  ${col.name} (${col.type})`);
                });
            }
        });
    }, 200);

    // 3. Check HRM menu
    setTimeout(() => {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('3. HRM MENU ITEMS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        db.all("SELECT * FROM menu_items WHERE route LIKE '%hr%' OR name LIKE '%HR%'", [], (err, rows) => {
            if (err) {
                console.error('Error:', err);
            } else {
                rows.forEach(row => {
                    console.log('Menu:', row.name);
                    console.log('  Route:', row.route);
                    console.log('  Permission:', row.permission);
                    console.log('  Active:', row.is_active);
                    console.log('  Display Order:', row.display_order);
                    console.log('');
                });
            }
        });
    }, 400);

    // 4. Check users table
    setTimeout(() => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('4. USERS TABLE (sample):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        db.all("SELECT id, username, role FROM users LIMIT 5", [], (err, rows) => {
            if (err) {
                console.error('Error:', err);
            } else {
                rows.forEach(row => {
                    console.log(`  User: ${row.username}, Role: ${row.role}`);
                });
            }
        });
    }, 600);

    // 5. Check if there's a role_menu_permissions table
    setTimeout(() => {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('5. ROLE PERMISSIONS TABLE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%role%'", [], (err, tables) => {
            if (err) {
                console.error('Error:', err);
            } else if (tables.length === 0) {
                console.log('  ⚠️  No role permission tables found');
                console.log('  → Permissions likely based on menu_items.permission column');
            } else {
                console.log('Found role tables:', tables.map(t => t.name).join(', '));

                // Check role_menu_permissions if it exists
                if (tables.some(t => t.name.includes('permission'))) {
                    db.all("SELECT * FROM role_menu_permissions WHERE menu_id IN (SELECT id FROM menu_items WHERE route LIKE '%hr%') LIMIT 10", [], (err, perms) => {
                        if (err) {
                            console.log('  (Table exists but empty or different structure)');
                        } else {
                            console.log('\n  Role-Menu Permissions for HRM:');
                            perms.forEach(p => {
                                console.log(`    - Role: ${p.role_name}, Menu: ${p.menu_id}, Access: ${p.can_view}`);
                            });
                        }
                    });
                }
            }
        });
    }, 800);

    // 6. Final recommendations
    setTimeout(() => {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('6. RECOMMENDATIONS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Check where access control happens
        db.get("SELECT permission FROM menu_items WHERE route = 'hrm'", [], (err, row) => {
            if (err) {
                console.error('Error:', err);
            } else if (!row) {
                console.log('❌ HRM menu not found in database!');
                console.log('   → Need to add HR Management menu');
            } else {
                const perm = row.permission;
                console.log(`✅ HRM menu exists with permission: "${perm}"`);

                if (!perm || perm === 'hrm') {
                    console.log('\n⚠️  PROBLEM IDENTIFIED:');
                    console.log('   Permission is set to "hrm" but user role is likely "admin" or "administrator"');
                    console.log('\n📝 SOLUTION:');
                    console.log('   Run this SQL:');
                    console.log('   UPDATE menu_items SET permission = NULL WHERE route = \'hrm\';');
                    console.log('   OR');
                    console.log('   UPDATE menu_items SET permission = \'admin,administrator,hr,manager\' WHERE route = \'hrm\';');
                } else {
                    console.log('\n✅ Permission looks good!');
                    console.log('\n🔍 Check your user role matches one of these:', perm);
                    console.log('\n💡 If still denied, check browser console for:');
                    console.log('   - app.hasAccessToPage() function');
                    console.log('   - Current user role');
                    console.log('   - Access control logic in main.js or events.manager.js');
                }
            }

            db.close();
        });
    }, 1000);
});
