const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/stockflow.db');

console.log('\n🔍 CHECKING HRM DATABASE SCHEMA\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Check for HRM tables
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%hr%' OR name LIKE '%employee%' OR name LIKE '%leave%' OR name LIKE '%attendance%'", [], (err, tables) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    console.log('HRM-related tables found:');
    if (tables.length === 0) {
        console.log('  ❌ NO HRM TABLES FOUND!');
        console.log('\n  💡 Need to create HRM database schema\n');
        db.close();
    } else {
        tables.forEach(t => console.log(`  📋 ${t.name}`));

        // Show structure of each table
        let checked = 0;
        tables.forEach(table => {
            console.log(`\n${'─'.repeat(60)}`);
            console.log(`📊 Table: ${table.name}`);
            console.log('─'.repeat(60));

            db.all(`PRAGMA table_info(${table.name})`, [], (err, cols) => {
                if (err) {
                    console.error('Error:', err);
                } else {
                    console.log('Columns:');
                    cols.forEach(c => {
                        console.log(`  ${c.name.padEnd(20)} ${c.type.padEnd(15)} ${c.notnull ? 'NOT NULL' : ''} ${c.pk ? 'PRIMARY KEY' : ''}`);
                    });
                }

                checked++;
                if (checked === tables.length) {
                    db.close();
                }
            });
        });
    }
});
