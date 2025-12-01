const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');
const schemaPath = path.join(__dirname, '..', 'database', 'employees_full_schema.sql');

console.log('\n🔄 UPDATING EMPLOYEES TABLE WITH COMPREHENSIVE SCHEMA\n');
console.log('═══════════════════════════════════════════════════════════\n');

const db = new sqlite3.Database(dbPath);

// Read the SQL schema
const schema = fs.readFileSync(schemaPath, 'utf8');

// Execute the schema
db.exec(schema, (err) => {
    if (err) {
        console.error('❌ Error updating schema:', err.message);
        db.close();
        return;
    }

    console.log('✅ Employees table updated successfully!\n');

    // Verify the new structure
    db.all("PRAGMA table_info(employees)", [], (err, columns) => {
        if (err) {
            console.error('Error:', err.message);
            db.close();
            return;
        }

        console.log('📊 New Employee Table Structure:\n');
        console.log('Total Columns:', columns.length);
        console.log('');

        // Group columns by category
        const categories = {
            'Basic Info': ['employee_code', 'ef_number', 'first_name', 'middle_name', 'last_name', 'full_name'],
            'Identity': ['qid', 'qid_expiry_date', 'passport_no', 'passport_issued_date', 'passport_expiry_date', 'nationality'],
            'Personal': ['gender', 'date_of_birth', 'marital_status', 'family_background', 'blood_group'],
            'Employment': ['department_id', 'department', 'designation', 'branch', 'direct_manager', 'employment_type', 'employment_status', 'visa_status'],
            'Dates': ['date_of_joining', 'offer_date', 'confirmation_date', 'employment_contract_date', 'contract_end_date', 'resignation_date'],
            'Contact': ['mobile', 'official_phone', 'email', 'current_address', 'permanent_address'],
            'Emergency': ['emergency_contact_name', 'emergency_phone', 'emergency_relation'],
            'Salary': ['basic_salary', 'allowance', 'transport_allowance', 'mobile_allowance', 'total_salary', 'salary_mode', 'bank_name', 'iban'],
            'Health': ['health_card_number', 'health_card_expiry_date', 'hc_renewal_fees', 'health_details', 'insurance_number', 'insurance_type', 'insurance_company', 'insurance_expiry_date'],
            'Documents': ['qid_photo_front', 'qid_photo_back', 'passport_photo', 'profile_picture']
        };

        for (const [category, fields] of Object.entries(categories)) {
            const found = columns.filter(col => fields.includes(col.name));
            console.log(`${category}: ${found.length} fields`);
        }

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('✅ COMPREHENSIVE EMPLOYEE SCHEMA READY!');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('Total Fields:', columns.length);
        console.log('\nYou can now:');
        console.log('1. Store complete employee information');
        console.log('2. Upload multiple photos (Profile, QID, Passport)');
        console.log('3. Track all documents and expiries');
        console.log('4. Manage salary and bank details');
        console.log('5. Store health and insurance info');
        console.log('\n🚀 Ready for professional HRM UI!\n');

        db.close();
    });
});
