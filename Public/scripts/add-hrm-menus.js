// ============================================
// ADD HRM MENUS TO SQLite DATABASE (CORRECT VERSION)
// Matches your actual table structure
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');

console.log('🔧 Adding HRM menus to database...');
console.log('📁 Database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err);
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
});

// First, check current menus
console.log('📋 Current menus:');
db.all('SELECT name, route, is_active FROM menu_items ORDER BY display_order', [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        rows.forEach(row => {
            console.log(`  - ${row.name} (${row.route}) ${row.is_active ? '✓' : '✗'}`);
        });
    }
});

// Add HRM menus
db.serialize(() => {
    console.log('\n➕ Adding HRM menus...\n');

    const hrmMenus = [
        { name: 'HR Management', icon: '🏢', route: 'hrm', permission: 'hrm', order: 100 },
        { name: 'HR Dashboard', icon: '📊', route: 'hrm', permission: 'hrm', order: 101 },
        { name: 'Employees', icon: '👥', route: 'hr-employees', permission: 'hrm', order: 102 },
        { name: 'Leave Management', icon: '🏖️', route: 'hr-leave', permission: 'hrm', order: 103 },
        { name: 'Attendance', icon: '📊', route: 'hr-attendance', permission: 'hrm', order: 104 },
        { name: 'Assets', icon: '📦', route: 'hr-assets', permission: 'hrm', order: 105 },
        { name: 'Vehicles', icon: '🚗', route: 'hr-vehicles', permission: 'hrm', order: 106 },
        { name: 'Documents', icon: '📄', route: 'hr-documents', permission: 'hrm', order: 107 },
        { name: 'Payroll', icon: '💰', route: 'hr-payroll', permission: 'hrm', order: 108 },
        { name: 'Reminders', icon: '🔔', route: 'hr-reminders', permission: 'hrm', order: 109 },
        { name: 'HR Reports', icon: '📊', route: 'hr-reports', permission: 'hrm', order: 110 },
        { name: 'My HR Portal', icon: '👤', route: 'my-hr', permission: 'employee', order: 111 }
    ];

    let completed = 0;
    const total = hrmMenus.length;

    hrmMenus.forEach(menu => {
        db.run(`
            INSERT INTO menu_items (name, icon, route, permission, display_order, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
        `, [menu.name, menu.icon, menu.route, menu.permission, menu.order], (err) => {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    console.log(`  ℹ️  ${menu.name}: Already exists`);
                } else {
                    console.log(`  ⚠️  ${menu.name}: ${err.message}`);
                }
            } else {
                console.log(`  ✅ Added: ${menu.name} (${menu.route})`);
            }

            completed++;

            if (completed === total) {
                // Wait a bit, then verify
                setTimeout(() => {
                    console.log('\n📋 HRM Menus in database:');
                    db.all('SELECT name, route, is_active FROM menu_items WHERE route LIKE "%hr%" ORDER BY display_order', [], (err, rows) => {
                        if (err) {
                            console.error('Error:', err);
                        } else {
                            if (rows.length === 0) {
                                console.log('  ⚠️  No HRM menus found!');
                            } else {
                                rows.forEach(row => {
                                    console.log(`  ✓ ${row.name} (${row.route}) ${row.is_active ? '✓' : '✗'}`);
                                });
                                console.log(`\n🎉 Success! Added ${rows.length} HRM menus!`);
                                console.log('💡 Refresh your browser (Ctrl+F5) to see the changes.');
                            }
                        }
                        db.close();
                    });
                }, 500);
            }
        });
    });
});
