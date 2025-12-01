const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/stockflow.db');

console.log('🔧 Setting permissions for all menus...\n');

db.serialize(() => {
    // Set permissions for all existing menus
    const updates = [
        { route: 'dashboard', permission: 'admin,manager,hr,sales,purchase,store,user' },
        { route: 'crm', permission: 'admin,manager,sales' },
        { route: 'sales', permission: 'admin,manager,sales' },
        { route: 'messaging', permission: 'admin,manager,hr,sales,purchase,store,user' },
        { route: 'products', permission: 'admin,manager,sales,purchase,store' },
        { route: 'customers', permission: 'admin,manager,sales' },
        { route: 'settings', permission: 'admin' },
        { route: 'reports', permission: 'admin,manager' },
        { route: 'hrm', permission: 'admin,hr,manager' }
    ];

    let completed = 0;

    updates.forEach(({ route, permission }) => {
        db.run(
            'UPDATE menu_items SET permission = ? WHERE route = ?',
            [permission, route],
            function (err) {
                if (err) {
                    console.log(`  ❌ Error updating ${route}:`, err.message);
                } else if (this.changes > 0) {
                    console.log(`  ✅ Updated ${route}: ${permission}`);
                } else {
                    console.log(`  ⚠️  No menu found for route: ${route}`);
                }

                completed++;

                if (completed === updates.length) {
                    // Verify
                    setTimeout(() => {
                        console.log('\n═══════════════════════════════════════════════════════');
                        console.log('📋 ALL MENUS WITH PERMISSIONS:');
                        console.log('═══════════════════════════════════════════════════════\n');

                        db.all('SELECT name, route, permission FROM menu_items ORDER BY display_order', [], (err, menus) => {
                            if (err) {
                                console.error('Error:', err);
                            } else {
                                menus.forEach(m => {
                                    console.log(`${m.name.padEnd(20)} | ${m.route.padEnd(15)} | ${m.permission || 'NO PERMISSION'}`);
                                });
                                console.log('\n✅ All menus updated!');
                                console.log('💡 Restart server and refresh browser.');
                            }
                            db.close();
                        });
                    }, 500);
                }
            }
        );
    });
});
