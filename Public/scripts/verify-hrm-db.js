const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/stockflow.db');

console.log('\n🔍 VERIFYING HRM DATABASE SCHEMA\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Check employees table structure
db.all("PRAGMA table_info(employees)", [], (err, cols) => {
    if (err) {
        console.error('❌ employees table does not exist!');
        console.error('   Error:', err.message);
        db.close();
        return;
    }

    console.log('✅ employees table structure:');
    console.log('');
    cols.forEach(c => {
        console.log(`   ${c.name.padEnd(25)} ${c.type.padEnd(15)} ${c.notnull ? 'NOT NULL' : ''}${c.pk ? ' PRIMARY KEY' : ''}`);
    });

    // Check if data exists
    console.log('\n📊 Checking data...\n');

    db.get('SELECT COUNT(*) as count FROM employees', [], (err, result) => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log(`   Total employees: ${result.count}`);
        }

        // Check departments
        db.get('SELECT COUNT(*) as count FROM departments', [], (err, result) => {
            if (err) {
                console.error('Error:', err.message);
            } else {
                console.log(`   Total departments: ${result.count}`);
            }

            // Show departments
            db.all('SELECT name FROM departments WHERE is_active = 1', [], (err, depts) => {
                if (err) {
                    console.error('Error:', err.message);
                } else if (depts.length > 0) {
                    console.log('\n   Departments:');
                    depts.forEach(d => console.log(`      - ${d.name}`));
                }

                console.log('\n═══════════════════════════════════════════════════════════\n');

                // Test the exact query the API will use
                console.log('🧪 Testing API query...\n');

                const query = `
                    SELECT 
                        e.*,
                        d.name as department,
                        p.title as position,
                        e.first_name || ' ' || e.last_name as full_name
                    FROM employees e
                    LEFT JOIN departments d ON e.department_id = d.id
                    LEFT JOIN positions p ON e.position_id = p.id
                    ORDER BY e.created_at DESC
                `;

                db.all(query, [], (err, employees) => {
                    if (err) {
                        console.error('❌ Query failed:', err.message);
                        console.log('\n💡 The API query has an error!');
                    } else {
                        console.log(`✅ Query successful! Found ${employees.length} employees`);
                        if (employees.length > 0) {
                            console.log('\n   Sample employee data:');
                            console.log('   ', JSON.stringify(employees[0], null, 2));
                        } else {
                            console.log('\n   ℹ️  No employees in database yet (this is normal)');
                        }
                    }

                    db.close();
                    console.log('\n');
                });
            });
        });
    });
});
