const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

console.log('📋 Checking database tables...\n');

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('❌ Error:', err);
        db.close();
        return;
    }

    console.log('Tables found:');
    tables.forEach(t => console.log('  -', t.name));

    db.close();
});
