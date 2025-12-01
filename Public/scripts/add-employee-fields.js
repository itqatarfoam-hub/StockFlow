const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');

console.log('\n🔄 ADDING NEW FIELDS TO EMPLOYEES TABLE\n');
console.log('═══════════════════════════════════════════════════════════\n');

const db = new sqlite3.Database(dbPath);

// List of new columns to add
const newColumns = [
    "ALTER TABLE employees ADD COLUMN ef_number VARCHAR(50)",
    "ALTER TABLE employees ADD COLUMN middle_name VARCHAR(100)",
    "ALTER TABLE employees ADD COLUMN full_name VARCHAR(300)",
    "ALTER TABLE employees ADD COLUMN qid VARCHAR(50)",
    "ALTER TABLE employees ADD COLUMN qid_expiry_date DATE",
    "ALTER TABLE employees ADD COLUMN qid_photo_front TEXT",
    "ALTER TABLE employees ADD COLUMN qid_photo_back TEXT",
    "ALTER TABLE employees ADD COLUMN passport_no VARCHAR(50)",
    "ALTER TABLE employees ADD COLUMN passport_photo TEXT",
    "ALTER TABLE employees ADD COLUMN passport_issued_date DATE",
    "ALTER TABLE employees ADD COLUMN passport_expiry_date DATE",
    "ALTER TABLE employees ADD COLUMN department VARCHAR(100)",
    "ALTER TABLE employees ADD COLUMN designation VARCHAR(100)",
    "ALTER TABLE employees ADD COLUMN branch VARCHAR(100)",
    "ALTER TABLE employees ADD COLUMN direct_manager VARCHAR(100)",
    "ALTER TABLE employees ADD COLUMN visa_status VARCHAR(50)",
    "ALTER TABLE employees ADD COLUMN previous_sponsor VARCHAR(200)",
    "ALTER TABLE employees ADD COLUMN date_of_joining DATE",
    "ALTER TABLE employees ADD COLUMN offer_date DATE",
    "ALTER TABLE employees ADD COLUMN confirmation_date DATE",
    "ALTER TABLE employees ADD COLUMN employment_contract_date DATE",
    "ALTER TABLE employees ADD COLUMN contract_end_date DATE",
    "ALTER TABLE employees ADD COLUMN resignation_date DATE",
    "ALTER TABLE employees ADD COLUMN official_phone VARCHAR(20)",
    "ALTER TABLE employees ADD COLUMN current_address TEXT",
    "ALTER TABLE employees ADD COLUMN permanent_address TEXT",
    "ALTER TABLE employees ADD COLUMN emergency_relation VARCHAR(50)",
    "ALTER TABLE employees ADD COLUMN allowance DECIMAL(10,2)",
    "ALTER TABLE employees ADD COLUMN transport_allowance DECIMAL(10,2)",
    "ALTER TABLE employees ADD COLUMN mobile_allowance DECIMAL(10,2)",
    "ALTER TABLE employees ADD COLUMN total_salary DECIMAL(10,2)",
    "ALTER TABLE employees ADD COLUMN salary_mode VARCHAR(50)",
    "ALTER TABLE employees ADD COLUMN bank_name VARCHAR(100)",
    "ALTER TABLE employees ADD COLUMN iban VARCHAR(100)",
    "ALTER TABLE employees ADD COLUMN marital_status VARCHAR(20)",
    "ALTER TABLE employees ADD COLUMN family_background TEXT",
    "ALTER TABLE employees ADD COLUMN blood_group VARCHAR(10)",
    "ALTER TABLE employees ADD COLUMN health_card_number VARCHAR(50)",
    "ALTER TABLE employees ADD COLUMN health_card_expiry_date DATE",
    "ALTER TABLE employees ADD COLUMN hc_renewal_fees DECIMAL(10,2)",
    "ALTER TABLE employees ADD COLUMN health_details TEXT",
    "ALTER TABLE employees ADD COLUMN insurance_number VARCHAR(50)",
    "ALTER TABLE employees ADD COLUMN insurance_type VARCHAR(100)",
    "ALTER TABLE employees ADD COLUMN insurance_company VARCHAR(100)",
    "ALTER TABLE employees ADD COLUMN insurance_expiry_date DATE",
    "ALTER TABLE employees ADD COLUMN profile_picture TEXT",
    "ALTER TABLE employees ADD COLUMN notes TEXT",
    "ALTER TABLE employees ADD COLUMN resignation_note TEXT",
    "ALTER TABLE employees ADD COLUMN mobile VARCHAR(20)"
];

let added = 0;
let skipped = 0;

// Add columns one by one
function addColumn(index) {
    if (index >= newColumns.length) {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log(`✅ Schema Update Complete!`);
        console.log(`   Added: ${added} new columns`);
        console.log(`   Skipped: ${skipped} existing columns`);
        console.log('═══════════════════════════════════════════════════════════\n');
        db.close();
        return;
    }

    const sql = newColumns[index];
    const columnName = sql.match(/ADD COLUMN (\w+)/)[1];

    db.run(sql, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log(`⏭️  ${columnName} (already exists)`);
                skipped++;
            } else {
                console.log(`❌ ${columnName}: ${err.message}`);
            }
        } else {
            console.log(`✅ ${columnName}`);
            added++;
        }
        addColumn(index + 1);
    });
}

addColumn(0);
