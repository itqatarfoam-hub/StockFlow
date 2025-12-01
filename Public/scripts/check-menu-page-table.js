const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/stockflow.db');

console.log('\n🔍 CHECKING FOR menu_page TABLE:\n');
console.log('═══════════════════════════════════════════════════════════');

// First check if menu_page table exists
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%menu%'", [], (err, tables) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    console.log('Menu-related tables found:');
    tables.forEach(t => console.log('  -', t.name));

    if (tables.some(t => t.name === 'menu_page')) {
        console.log('\n✅ menu_page table EXISTS!\n');

        // Show structure
        db.all("PRAGMA table_info(menu_page)", [], (err, cols) => {
            console.log('Structure of menu_page:');
            cols.forEach(c => console.log(`  ${c.name} (${c.type})`));

            // Show all data
            console.log('\nAll data in menu_page:');
            db.all("SELECT * FROM menu_page", [], (err, rows) => {
                if (err) {
                    console.error('Error:', err);
                } else if (rows.length === 0) {
                    console.log('  ⚠️  Table is EMPTY!');
                } else {
                    rows.forEach(r => {
                        console.log('\n  Entry:');
                        Object.keys(r).forEach(key => {
                            console.log(`    ${key}: ${r[key]}`);
                        });
                    });
                }

                // Check for HR entries
                console.log('\n\nSearching for HR entries:');
                db.all("SELECT * FROM menu_page WHERE page LIKE '%hr%' OR page = 'hrm'", [], (err, hrRows) => {
                    if (err) {
                        console.error('Error:', err);
                    } else if (hrRows.length === 0) {
                        console.log('  ❌ NO HR entries found in menu_page!');
                        console.log('  → This might be why HRM shows "page not found"');
                    } else {
                        console.log(`  ✅ Found ${hrRows.length} HR entries:`);
                        hrRows.forEach(r => {
                            console.log(`    - ${r.page}: ${r.title || 'No title'}`);
                        });
                    }
                    db.close();
                });
            });
        });
    } else {
        console.log('\n⚠️  menu_page table does NOT exist');
        console.log('   Your system uses menu_items table instead');
        db.close();
    }
});
