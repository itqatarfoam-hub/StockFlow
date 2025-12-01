// Check if menu_items has parent_id column
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');
const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(menu_items)", [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    const hasParentId = rows.some(row => row.name === 'parent_id');
    console.log('Has parent_id column:', hasParentId);

    if (hasParentId) {
        console.log('\n✅ Table supports sub-menus!');
        console.log('\nChecking existing menus with sub-menus:');

        db.all(`
            SELECT m1.name as parent, m2.name as child, m2.route
            FROM menu_items m1
            LEFT JOIN menu_items m2 ON m2.parent_id = m1.id
            WHERE m2.id IS NOT NULL
            ORDER BY m1.id, m2.display_order
        `, [], (err, rows) => {
            if (err) {
                console.error('Error:', err);
            } else if (rows.length > 0) {
                console.log(JSON.stringify(rows, null, 2));
            } else {
                console.log('No sub-menus found in current data');
            }
            db.close();
        });
    } else {
        console.log('\n⚠️ Table does NOT support sub-menus - need to add parent_id column');
        db.close();
    }
});
