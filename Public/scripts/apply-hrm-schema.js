const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');
const schemaPath = path.join(__dirname, '..', 'database', 'hrm_schema.sql');

console.log('\n🔧 APPLYING HRM DATABASE SCHEMA\n');
console.log('═══════════════════════════════════════════════════════════\n');
console.log('Database:', dbPath);
console.log('Schema:', schemaPath);
console.log('\n');

// Read schema file
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split into individual statements
const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📝 Found ${statements.length} SQL statements\n`);

const db = new sqlite3.Database(dbPath);

let executed = 0;
let errors = 0;

db.serialize(() => {
    statements.forEach((statement, index) => {
        db.run(statement, (err) => {
            if (err) {
                // Ignore "already exists" errors
                if (!err.message.includes('already exists')) {
                    console.log(`❌ Statement ${index + 1} failed:`);
                    console.log(`   ${statement.substring(0, 80)}...`);
                    console.log(`   Error: ${err.message}\n`);
                    errors++;
                }
            } else {
                const action = statement.substring(0, 30);
                console.log(`✅ ${action}...`);
            }

            executed++;

            if (executed === statements.length) {
                console.log('\n═══════════════════════════════════════════════════════════');
                console.log(`📊 Summary:`);
                console.log(`   Total statements: ${statements.length}`);
                console.log(`   Errors: ${errors}`);
                console.log(`   Success: ${statements.length - errors}`);
                console.log('═══════════════════════════════════════════════════════════\n');

                // Verify tables created
                db.all("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%hr%' OR name LIKE '%employee%' OR name LIKE '%leave%' OR name LIKE '%attendance%' OR name LIKE '%asset%' OR name LIKE '%document%' OR name LIKE '%payroll%' OR name LIKE '%department%' OR name LIKE '%position%' OR name LIKE '%performance%' OR name LIKE '%training%' OR name LIKE '%vehicle%') ORDER BY name", [], (err, tables) => {
                    if (err) {
                        console.error('Error checking tables:', err);
                    } else {
                        console.log('✅ HRM TABLES CREATED:\n');
                        tables.forEach((t, i) => {
                            console.log(`   ${(i + 1).toString().padStart(2)}. ${t.name}`);
                        });
                        console.log(`\n   Total: ${tables.length} tables\n`);
                        console.log('🎉 HRM DATABASE SCHEMA APPLIED SUCCESSFULLY!\n');
                    }
                    db.close();
                });
            }
        });
    });
});
