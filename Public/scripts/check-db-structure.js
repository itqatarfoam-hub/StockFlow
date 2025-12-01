// Check menu_items table structure
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Checking menu_items table structure...\n');

db.all("PRAGMA table_info(menu_items)", [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    console.log('Columns in menu_items table:');
    rows.forEach(row => {
        console.log(`  - ${row.name} (${row.type})`);
    });

    console.log('\nSample data:');
    db.all("SELECT * FROM menu_items LIMIT 3", [], (err, rows) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log(JSON.stringify(rows, null, 2));
        }
        db.close();
    });
});
