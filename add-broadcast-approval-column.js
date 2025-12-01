// ============================================
// ADD BROADCAST APPROVAL COLUMN TO USERS TABLE
// Migration Script
// Date: 2025-11-29
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'stockflow.db');

console.log('🔧 ========== DATABASE MIGRATION START ==========');
console.log('📁 Database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err);
        process.exit(1);
    }
    console.log('✅ Connected to database');
});

// Helper function to check if column exists
function columnExists(tableName, columnName) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
            if (err) reject(err);
            else resolve(columns.some(col => col.name === columnName));
        });
    });
}

// Helper function to run SQL
function runSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// Main migration function
async function migrate() {
    try {
        console.log('\n🔍 Checking for broadcast_approval column...');

        const exists = await columnExists('users', 'broadcast_approval');

        if (exists) {
            console.log('✓ Column broadcast_approval already exists in users table');
            console.log('✅ No migration needed');
        } else {
            console.log('🔧 Adding broadcast_approval column to users table...');

            // Add the column with default value of 0 (false)
            await runSQL(`ALTER TABLE users ADD COLUMN broadcast_approval INTEGER DEFAULT 0`);

            console.log('✅ Column broadcast_approval added successfully!');
            console.log('   - Type: INTEGER');
            console.log('   - Default: 0 (false)');
            console.log('   - Values: 0 = No approval required, 1 = Requires approval');
        }

        console.log('\n🔍 Verifying users table structure...');
        const columns = await new Promise((resolve, reject) => {
            db.all('PRAGMA table_info(users)', (err, cols) => {
                if (err) reject(err);
                else resolve(cols);
            });
        });

        console.log('\n📋 Current users table columns:');
        columns.forEach(col => {
            const highlight = col.name === 'broadcast_approval' ? '✨ ' : '   ';
            console.log(`${highlight}${col.name.padEnd(20)} - ${col.type.padEnd(10)} ${col.dflt_value ? `(default: ${col.dflt_value})` : ''}`);
        });

        console.log('\n✅ ========== DATABASE MIGRATION COMPLETE ==========\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err);
            } else {
                console.log('✅ Database connection closed\n');
            }
        });
    }
}

// Run migration
migrate();
