const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/stockflow.db');

console.log('📋 Current HRM Menu Structure:\n');

db.all(`
    SELECT id, name, route, parent_id, display_order 
    FROM menu_items 
    WHERE route LIKE '%hr%' OR route = 'my-hr' 
    ORDER BY parent_id NULLS FIRST, display_order
`, [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Main Menus:');
        rows.filter(r => !r.parent_id).forEach(r => {
            console.log(`  📁 ${r.name} (${r.route}) [ID: ${r.id}]`);
        });

        console.log('\nSub-Menus:');
        rows.filter(r => r.parent_id).forEach(r => {
            console.log(`    └─ ${r.name} (${r.route}) [Parent: ${r.parent_id}]`);
        });

        // Check for HR Dashboard
        const dashboard = rows.find(r => r.name === 'HR Dashboard');
        if (!dashboard) {
            console.log('\n⚠️  HR Dashboard is missing! Adding it now...');

            const parent = rows.find(r => r.name === 'HR Management');
            if (parent) {
                db.run(`
                    INSERT INTO menu_items (name, icon, route, permission, display_order, is_active, parent_id, created_at, updated_at)
                    VALUES ('HR Dashboard', '📊', 'hrm', 'hrm', 1, 1, ?, datetime('now'), datetime('now'))
                `, [parent.id], (err) => {
                    if (err) {
                        console.log('Error adding HR Dashboard:', err.message);
                    } else {
                        console.log('✅ Added HR Dashboard!');
                    }
                    db.close();
                });
            }
        } else {
            console.log('\n✅ HR Dashboard exists');
            db.close();
        }
    }
});
