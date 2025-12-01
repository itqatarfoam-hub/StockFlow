const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');
console.log('\n🔧 Creating HRM Database Schema...\n');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        manager_id INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('departments:', err.message);
        else console.log('✅ departments');
    });

    db.run(`CREATE TABLE IF NOT EXISTS positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        department_id INTEGER,
        min_salary DECIMAL(10,2),
        max_salary DECIMAL(10,2),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    )`, (err) => {
        if (err) console.error('positions:', err.message);
        else console.log('✅ positions');
    });

    db.run(`CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_code VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE,
        phone VARCHAR(20),
        date_of_birth DATE,
        gender VARCHAR(10),
        nationality VARCHAR(50),
        department_id INTEGER,
        position_id INTEGER,
        hire_date DATE NOT NULL,
        employment_type VARCHAR(20) DEFAULT 'Full-time',
        employment_status VARCHAR(20) DEFAULT 'Active',
        manager_id INTEGER,
        basic_salary DECIMAL(10,2),
        address TEXT,
        city VARCHAR(100),
       emergency_contact_name VARCHAR(150),
        emergency_contact_phone VARCHAR(20),
        user_id INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`, (err) => {
        if (err) console.error('employees:', err.message);
        else console.log('✅ employees');
    });

    db.run(`CREATE TABLE IF NOT EXISTS leave_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        days_per_year INTEGER DEFAULT 0,
        is_paid BOOLEAN DEFAULT 1,
        color VARCHAR(7) DEFAULT '#4F46E5',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('leave_types:', err.message);
        else console.log('✅ leave_types');
    });

    db.run(`CREATE TABLE IF NOT EXISTS leave_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        leave_type_id INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_requested DECIMAL(5,2) NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'Pending',
        approved_by INTEGER,
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) console.error('leave_requests:', err.message);
        else console.log('✅ leave_requests');
    });

    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        date DATE NOT NULL,
        check_in_time TIME,
        check_out_time TIME,
        work_hours DECIMAL(5,2),
        status VARCHAR(20) DEFAULT 'Present',
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, date),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) console.error('attendance:', err.message);
        else console.log('✅ attendance');
    });

    db.run(`CREATE TABLE IF NOT EXISTS payroll (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        basic_salary DECIMAL(10,2) NOT NULL,
        allowances DECIMAL(10,2) DEFAULT 0,
        deductions DECIMAL(10,2) DEFAULT 0,
        net_salary DECIMAL(10,2) NOT NULL,
        payment_date DATE,
        payment_status VARCHAR(20) DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, month, year),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) console.error('payroll:', err.message);
        else console.log('✅ payroll');
    });

    db.run(`CREATE TABLE IF NOT EXISTS asset_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('asset_categories:', err.message);
        else console.log('✅ asset_categories');
    });

    db.run(`CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(150) NOT NULL,
        category_id INTEGER,
        serial_number VARCHAR(100),
        purchase_date DATE,
        assigned_to INTEGER,
        status VARCHAR(20) DEFAULT 'Available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
    )`, (err) => {
        if (err) console.error('assets:', err.message);
        else console.log('✅ assets');
    });

    db.run(`CREATE TABLE IF NOT EXISTS document_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        requires_expiry BOOLEAN DEFAULT 0,
        is_mandatory BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('document_types:', err.message);
        else console.log('✅ document_types');
    });

    db.run(`CREATE TABLE IF NOT EXISTS employee_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        document_type_id INTEGER NOT NULL,
        document_number VARCHAR(100),
        file_name VARCHAR(255),
        issue_date DATE,
        expiry_date DATE,
        status VARCHAR(20) DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) console.error('employee_documents:', err.message);
        else console.log('✅ employee_documents');
    });

    // Insert default data
    setTimeout(() => {
        console.log('\n📝 Inserting default data...\n');

        db.run(`INSERT OR IGNORE INTO departments (id, name, description) VALUES 
            (1, 'Human Resources', 'HR Department'),
            (2, 'Finance', 'Finance & Accounting'),
            (3, 'IT', 'Information Technology'),
            (4, 'Sales', 'Sales & Marketing'),
            (5, 'Operations', 'Operations & Support')`,
            (err) => {
                if (err) console.error('departments data:', err.message);
                else console.log('✅ Departments data inserted');
            });

        db.run(`INSERT OR IGNORE INTO leave_types (id, name, description, days_per_year, color) VALUES
            (1, 'Annual Leave', 'Paid annual vacation leave', 21, '#10B981'),
            (2, 'Sick Leave', 'Medical sick leave', 14, '#EF4444'),
            (3, 'Emergency Leave', 'Emergency situations', 7, '#F59E0B')`,
            (err) => {
                if (err) console.error('leave_types data:', err.message);
                else console.log('✅ Leave types data inserted');
            });

        db.run(`INSERT OR IGNORE INTO asset_categories (id, name) VALUES
            (1, 'Laptop'),
            (2, 'Mobile Phone'),
            (3, 'Monitor')`,
            (err) => {
                if (err) console.error('asset_categories data:', err.message);
                else console.log('✅ Asset categories data inserted');
            });

        db.run(`INSERT OR IGNORE INTO document_types (id, name, requires_expiry, is_mandatory) VALUES
            (1, 'Passport', 1, 1),
            (2, 'Visa', 1, 0),
            (3, 'ID Card', 1, 1),
            (4, 'Contract', 0, 1)`,
            (err) => {
                if (err) console.error('document_types data:', err.message);
                else console.log('✅ Document types data inserted');

                console.log('\n🎉 HRM Database Schema Created Successfully!\n');
                db.close();
            });
    }, 1000);
});
