// ============================================
// ADD PARENT_ID COLUMN AND RESTRUCTURE HRM MENUS
// Creates hierarchical menu structure
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');

console.log('🔧 Restructuring HRM menus with hierarchical structure...\n');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err);
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
});

db.serialize(() => {
    // Step 1: Add parent_id column if it doesn't exist
    console.log('Step 1: Adding parent_id column...');
    db.run(`ALTER TABLE menu_items ADD COLUMN parent_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error:', err.message);
        } else {
            console.log('✅ parent_id column ready\n');
        }
    });

    // Step 2: Delete old HRM entries
    setTimeout(() => {
        console.log('Step 2: Removing old HRM menu entries...');
        db.run(`DELETE FROM menu_items WHERE route LIKE '%hr%' OR route = 'my-hr'`, function (err) {
            if (err) {
                console.error('Error:', err);
            } else {
                console.log(`✅ Removed ${this.changes} old entries\n`);
            }
        });
    }, 200);

    // Step 3: Add main HRM menu
    setTimeout(() => {
        console.log('Step 3: Adding main HRM menu...');
        db.run(`
            INSERT INTO menu_items (name, icon, route, permission, display_order, is_active, parent_id, created_at, updated_at)
            VALUES ('HR Management', '🏢', 'hrm', 'hrm', 100, 1, NULL, datetime('now'), datetime('now'))
        `, function (err) {
            if (err) {
                console.error('Error:', err.message);
                db.close();
                return;
            }

            const hrmParentId = this.lastID;
            console.log(`✅ Added main HRM menu (ID: ${hrmParentId})\n`);

            // Step 4: Add HRM sub-menus
            console.log('Step 4: Adding HRM sub-menus...');

            const subMenus = [
                { name: 'HR Dashboard', icon: '📊', route: 'hrm', order: 1 },
                { name: 'Employees', icon: '👥', route: 'hr-employees', order: 2 },
                { name: 'Leave Management', icon: '🏖️', route: 'hr-leave', order: 3 },
                { name: 'Attendance', icon: '📊', route: 'hr-attendance', order: 4 },
                { name: 'Assets', icon: '📦', route: 'hr-assets', order: 5 },
                { name: 'Vehicles', icon: '🚗', route: 'hr-vehicles', order: 6 },
                { name: 'Documents', icon: '📄', route: 'hr-documents', order: 7 },
                { name: 'Payroll', icon: '💰', route: 'hr-payroll', order: 8 },
                { name: 'Reminders', icon: '🔔', route: 'hr-reminders', order: 9 },
                { name: 'HR Reports', icon: '📊', route: 'hr-reports', order: 10 }
            ];

            let completed = 0;

            subMenus.forEach(menu => {
                db.run(`
                    INSERT INTO menu_items (name, icon, route, permission, display_order, is_active, parent_id, created_at, updated_at)
                    VALUES (?, ?, ?, 'hrm', ?, 1, ?, datetime('now'), datetime('now'))
                `, [menu.name, menu.icon, menu.route, menu.order, hrmParentId], (err) => {
                    if (err) {
                        console.log(`  ⚠️  ${menu.name}: ${err.message}`);
                    } else {
                        console.log(`  ✅ Added: ${menu.name}`);
                    }

                    completed++;

                    if (completed === subMenus.length) {
                        // Add Employee Portal as separate top-level menu
                        setTimeout(() => {
                            console.log('\nStep 5: Adding Employee Portal (separate top-level menu)...');
                            db.run(`
                                INSERT INTO menu_items (name, icon, route, permission, display_order, is_active, parent_id, created_at, updated_at)
                                VALUES ('My HR Portal', '👤', 'my-hr', 'employee', 101, 1, NULL, datetime('now'), datetime('now'))
                            `, (err) => {
                                if (err) {
                                    console.log('  ⚠️  Employee Portal:', err.message);
                                } else {
                                    console.log('  ✅ Added: My HR Portal\n');
                                }

                                // Verify final structure
                                console.log('📋 Final HRM Menu Structure:');
                                db.all(`
                                    SELECT 
                                        CASE WHEN parent_id IS NULL THEN '📁 ' ELSE '  └─ ' END || name as menu,
                                        route,
                                        CASE WHEN is_active = 1 THEN '✓' ELSE '✗' END as active
                                    FROM menu_items
                                    WHERE route LIKE '%hr%' OR route = 'my-hr'
                                    ORDER BY parent_id NULLS FIRST, display_order
                                `, [], (err, rows) => {
                                    if (err) {
                                        console.error('Error:', err);
                                    } else {
                                        rows.forEach(row => {
                                            console.log(`${row.menu} (${row.route}) ${row.active}`);
                                        });
                                        console.log('\n🎉 Success! HRM menus now have proper hierarchy!');
                                        console.log('💡 Refresh your browser (Ctrl+F5) to see the changes.');
                                    }
                                    db.close();
                                });
                            });
                        }, 500);
                    }
                });
            });
        });
    }, 400);
});
