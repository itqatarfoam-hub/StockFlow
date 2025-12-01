const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/stockflow.db');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('📊 COMPLETE DATABASE CHECK FOR HRM');
console.log('═══════════════════════════════════════════════════════════\n');

// 1. Check menu_items for HRM
console.log('1️⃣  menu_items table:');
db.all("SELECT * FROM menu_items WHERE route = 'hrm'", [], (err, items) => {
    if (err) {
        console.error('   Error:', err.message);
    } else if (items.length === 0) {
        console.log('   ❌ NO HRM entry!');
    } else {
        items.forEach(i => {
            console.log(`   ✅ Found: ${i.name} (route: ${i.route})`);
            console.log(`      Permission: ${i.permission || 'NONE'}`);
            console.log(`      Active: ${i.is_active ? 'YES' : 'NO'}`);
        });
    }
});

// 2. Check menu_pages
setTimeout(() => {
    console.log('\n2️⃣  menu_pages table:');
    db.all("SELECT COUNT(*) as count FROM menu_pages", [], (err, result) => {
        if (err) {
            console.log('   Error:', err.message);
        } else {
            console.log(`   Total entries: ${result[0].count}`);

            // Check if there's an HRM entry
            db.all(`
                SELECT mp.*, mi.route, mi.name 
                FROM menu_pages mp 
                JOIN menu_items mi ON mp.menu_item_id = mi.id 
                WHERE mi.route = 'hrm'
            `, [], (err, hrPages) => {
                if (err) {
                    console.log('   Error joining:', err.message);
                } else if (hrPages.length === 0) {
                    console.log('   ❌ NO menu_pages entry for HRM!');
                    console.log('   → This might cause "page not found"!');
                } else {
                    console.log('   ✅ Found menu_pages for HRM:');
                    hrPages.forEach(p => {
                        console.log(`      Title: ${p.page_title || 'none'}`);
                    });
                }
            });
        }
    });
}, 200);

// 3. Summary
setTimeout(() => {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📋 SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\nYour app likely uses menu_pages for page content.');
    console.log('If HRM shows "page not found", it\'s because:');
    console.log('  1. No entry in menu_pages for HRM, OR');
    console.log('  2. Frontend routing not configured properly');
    console.log('\n💡 Check your ui.renderer.js to see if it uses menu_pages');
    console.log('   or if it renders modules directly.');

    db.close();
}, 400);
