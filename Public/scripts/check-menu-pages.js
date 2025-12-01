const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/stockflow.db');

console.log('\n🔍 CHECKING menu_pages TABLE:\n');
console.log('═══════════════════════════════════════════════════════════');

// Show structure
db.all("PRAGMA table_info(menu_pages)", [], (err, cols) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    console.log('Structure of menu_pages:');
    cols.forEach(c => console.log(`  ${c.name} (${c.type})`));

    // Show all data
    console.log('\n\nAll entries in menu_pages:');
    console.log('═══════════════════════════════════════════════════════════');
    db.all("SELECT * FROM menu_pages ORDER BY page_name", [], (err, rows) => {
        if (err) {
            console.error('Error:', err);
        } else if (rows.length === 0) {
            console.log('  ⚠️  Table is EMPTY!');
        } else {
            rows.forEach(r => {
                console.log(`\n  ${r.page_name || r.name || 'unnamed'}:`);
                Object.keys(r).forEach(key => {
                    if (r[key]) console.log(`    ${key}: ${r[key]}`);
                });
            });
        }

        // Check for HR entries
        console.log('\n\n═══════════════════════════════════════════════════════════');
        console.log('Searching for HR/HRM entries:');
        console.log('═══════════════════════════════════════════════════════════');

        db.all(`
            SELECT * FROM menu_pages 
            WHERE page_name LIKE '%hr%' 
            OR page_name = 'hrm'
            OR content LIKE '%hr%'
        `, [], (err, hrRows) => {
            if (err) {
                console.error('Error:', err);
            } else if (hrRows.length === 0) {
                console.log('  ❌ NO HR entries found in menu_pages!');
                console.log('\n  💡 SOLUTION: Add HRM entry to menu_pages:');
                console.log('     INSERT INTO menu_pages (page_name, title, content)');
                console.log('     VALUES (\'hrm\', \'HR Management\', \'<div>HR content</div>\');');
            } else {
                console.log(`  ✅ Found ${hrRows.length} HR entries:`);
                hrRows.forEach(r => {
                    console.log(`\n    Page: ${r.page_name}`);
                    console.log(`    Title: ${r.title || 'No title'}`);
                    if (r.content) {
                        console.log(`    Content: ${r.content.substring(0, 100)}...`);
                    }
                });
            }
            db.close();
        });
    });
});
