const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/stockflow.db');

console.log('\n📋 ALL MENUS IN YOUR DATABASE:\n');
console.log('═══════════════════════════════════════════════════════════════');

db.all('SELECT id, name, route, permission, is_active, display_order FROM menu_items ORDER BY display_order', [], (e, menus) => {
    if (e) {
        console.error('Error:', e);
    } else {
        menus.forEach(m => {
            const status = m.is_active ? '✅' : '❌';
            const perm = m.permission || 'NO PERMISSION SET';
            console.log(`${status} ${m.name.padEnd(20)} | route: ${m.route.padEnd(15)} | perm: ${perm}`);
        });

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log(`\nTotal menus: ${menus.length}`);
        console.log(`Active: ${menus.filter(m => m.is_active).length}`);
        console.log(`Inactive: ${menus.filter(m => !m.is_active).length}`);

        const withoutPerm = menus.filter(m => !m.permission || m.permission === '');
        if (withoutPerm.length > 0) {
            console.log(`\n⚠️  ${withoutPerm.length} menus have NO permission set!`);
            withoutPerm.forEach(m => console.log(`   - ${m.name} (${m.route})`));
        }
    }
    db.close();
});
