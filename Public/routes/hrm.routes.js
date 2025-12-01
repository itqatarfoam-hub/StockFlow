// ============================================
// STOCKFLOW - HRM ROUTES
// Complete HR Management API Endpoints
// ============================================

const express = require('express');
const router = express.Router();
const { db, getAllRows, runSQL, getRow } = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/hrm/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ========== EMPLOYEES ==========

// GET all employees
router.get('/employees', async (req, res) => {
    try {
        const { status, department } = req.query;

        let query = `
            SELECT 
                e.*,
                d.name as department,
                p.title as position,
                e.first_name || ' ' || e.last_name as full_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN positions p ON e.position_id = p.id
            WHERE 1=1
        `;

        const params = [];

        if (status) {
            query += ` AND e.employment_status = ?`;
            params.push(status);
        }

        if (department) {
            query += ` AND d.name = ?`;
            params.push(department);
        }

        query += ` ORDER BY e.created_at DESC`;

        const employees = await getAllRows(query, params);

        res.json({ success: true, employees });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET single employee
router.get('/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await getRow(`
            SELECT 
                e.*,
                d.name as department,
                p.title as position,
                e.first_name || ' ' || e.last_name as full_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN positions p ON e.position_id = p.id
            WHERE e.id = ?
        `, [id]);

        if (!employee) {
            return res.status(404).json({ success: false, error: 'Employee not found' });
        }

        res.json({ success: true, employee });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// CREATE employee
router.post('/employees', upload.single('photo'), async (req, res) => {
    try {
        const {
            employee_code, first_name, last_name, email, phone,
            date_of_birth, gender, nationality,
            department_id, position_id, hire_date,
            employment_type, basic_salary,
            address, city, emergency_contact_name, emergency_contact_phone
        } = req.body;

        // Check if employee code exists
        const existing = await getRow('SELECT id FROM employees WHERE employee_code = ?', [employee_code]);
        if (existing) {
            return res.status(400).json({ success: false, error: 'Employee code already exists' });
        }

        const photo_url = req.file ? `/uploads/hrm/${req.file.filename}` : null;

        await runSQL(`
            INSERT INTO employees (
                employee_code, first_name, last_name, email, phone,
                date_of_birth, gender, nationality,
                department_id, position_id, hire_date,
                employment_type, basic_salary,
                address, city,
                emergency_contact_name, emergency_contact_phone,
                photo_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            employee_code, first_name, last_name, email, phone,
            date_of_birth, gender, nationality,
            department_id || null, position_id || null, hire_date,
            employment_type || 'Full-time', basic_salary || 0,
            address, city,
            emergency_contact_name, emergency_contact_phone,
            photo_url
        ]);

        res.json({ success: true, message: 'Employee created successfully' });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// UPDATE employee
router.put('/employees/:id', upload.single('photo'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            first_name, last_name, email, phone,
            date_of_birth, gender, nationality,
            department_id, position_id, hire_date,
            employment_type, employment_status, basic_salary,
            address, city, emergency_contact_name, emergency_contact_phone
        } = req.body;

        let updateFields = `
            first_name = ?, last_name = ?, email = ?, phone = ?,
            date_of_birth = ?, gender = ?, nationality = ?,
            department_id = ?, position_id = ?, hire_date = ?,
            employment_type = ?, employment_status = ?, basic_salary = ?,
            address = ?, city = ?,
            emergency_contact_name = ?, emergency_contact_phone = ?,
            updated_at = CURRENT_TIMESTAMP
        `;

        const params = [
            first_name, last_name, email, phone,
            date_of_birth, gender, nationality,
            department_id || null, position_id || null, hire_date,
            employment_type, employment_status, basic_salary,
            address, city,
            emergency_contact_name, emergency_contact_phone
        ];

        if (req.file) {
            updateFields += `, photo_url = ?`;
            params.push(`/uploads/hrm/${req.file.filename}`);
        }

        params.push(id);

        await runSQL(`UPDATE employees SET ${updateFields} WHERE id = ?`, params);

        res.json({ success: true, message: 'Employee updated successfully' });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE employee
router.delete('/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await runSQL('DELETE FROM employees WHERE id = ?', [id]);

        res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== DEPARTMENTS ==========

// GET all departments
router.get('/departments', async (req, res) => {
    try {
        const departments = await getAllRows(`
            SELECT * FROM departments WHERE is_active = 1 ORDER BY name
        `);

        res.json({ success: true, departments: departments.map(d => d.name) });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== LEAVE MANAGEMENT ==========

// GET leave requests
router.get('/leave-requests', async (req, res) => {
    try {
        const { employee_id, status } = req.query;

        let query = `
            SELECT 
                lr.*,
                e.first_name || ' ' || e.last_name as employee_name,
                e.employee_code,
                lt.name as leave_type_name,
                lt.color as leave_type_color
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE 1=1
        `;

        const params = [];

        if (employee_id) {
            query += ` AND lr.employee_id = ?`;
            params.push(employee_id);
        }

        if (status) {
            query += ` AND lr.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY lr.created_at DESC`;

        const requests = await getAllRows(query, params);

        res.json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// CREATE leave request
router.post('/leave-requests', async (req, res) => {
    try {
        const {
            employee_id, leave_type_id, start_date, end_date,
            days_requested, reason
        } = req.body;

        await runSQL(`
            INSERT INTO leave_requests (
                employee_id, leave_type_id, start_date, end_date,
                days_requested, reason
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [employee_id, leave_type_id, start_date, end_date, days_requested, reason]);

        res.json({ success: true, message: 'Leave request submitted successfully' });
    } catch (error) {
        console.error('Error creating leave request:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// UPDATE leave request status
router.put('/leave-requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;
        const approved_by = req.session?.user?.id;

        await runSQL(`
            UPDATE leave_requests 
            SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP,
                rejection_reason = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [status, approved_by, rejection_reason || null, id]);

        res.json({ success: true, message: 'Leave request updated successfully' });
    } catch (error) {
        console.error('Error updating leave request:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== ATTENDANCE ==========

// GET attendance records
router.get('/attendance', async (req, res) => {
    try {
        const { employee_id, date, month, year } = req.query;

        let query = `
            SELECT 
                a.*,
                e.first_name || ' ' || e.last_name as employee_name,
                e.employee_code
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE 1=1
        `;

        const params = [];

        if (employee_id) {
            query += ` AND a.employee_id = ?`;
            params.push(employee_id);
        }

        if (date) {
            query += ` AND a.date = ?`;
            params.push(date);
        }

        if (month && year) {
            query += ` AND strftime('%m', a.date) = ? AND strftime('%Y', a.date) = ?`;
            params.push(month.toString().padStart(2, '0'), year.toString());
        }

        query += ` ORDER BY a.date DESC, e.first_name`;

        const records = await getAllRows(query, params);

        res.json({ success: true, records });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// MARK attendance
router.post('/attendance', async (req, res) => {
    try {
        const { employee_id, date, check_in_time, check_out_time, status, remarks } = req.body;

        // Calculate work hours if both check-in and check-out provided
        let work_hours = null;
        if (check_in_time && check_out_time) {
            const checkin = new Date(`2000-01-01 ${check_in_time}`);
            const checkout = new Date(`2000-01-01 ${check_out_time}`);
            work_hours = (checkout - checkin) / (1000 * 60 * 60); // Hours
        }

        await runSQL(`
            INSERT OR REPLACE INTO attendance (
                employee_id, date, check_in_time, check_out_time,
                work_hours, status, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [employee_id, date, check_in_time, check_out_time, work_hours, status, remarks]);

        res.json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== ASSETS ==========

// GET assets
router.get('/assets', async (req, res) => {
    try {
        const { status, assigned_to } = req.query;

        let query = `
            SELECT 
                a.*,
                ac.name as category_name,
                e.first_name || ' ' || e.last_name as assigned_to_name
            FROM assets a
            LEFT JOIN asset_categories ac ON a.category_id = ac.id
            LEFT JOIN employees e ON a.assigned_to = e.id
            WHERE 1=1
        `;

        const params = [];

        if (status) {
            query += ` AND a.status = ?`;
            params.push(status);
        }

        if (assigned_to) {
            query += ` AND a.assigned_to = ?`;
            params.push(assigned_to);
        }

        query += ` ORDER BY a.created_at DESC`;

        const assets = await getAllRows(query, params);

        res.json({ success: true, assets });
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ASSIGN asset
router.post('/assets/assign', async (req, res) => {
    try {
        const { asset_id, employee_id, assigned_by } = req.body;

        await runSQL(`
            UPDATE assets 
            SET assigned_to = ?, assigned_date = CURRENT_DATE, status = 'Assigned'
            WHERE id = ?
        `, [employee_id, asset_id]);

        await runSQL(`
            INSERT INTO asset_assignments (
                asset_id, employee_id, assigned_date, assigned_by
            ) VALUES (?, ?, CURRENT_DATE, ?)
        `, [asset_id, employee_id, assigned_by]);

        res.json({ success: true, message: 'Asset assigned successfully' });
    } catch (error) {
        console.error('Error assigning asset:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== DASHBOARD STATS ==========

router.get('/dashboard/stats', async (req, res) => {
    try {
        const totalEmployees = await getRow('SELECT COUNT(*) as count FROM employees WHERE is_active = 1');
        const activeEmployees = await getRow('SELECT COUNT(*) as count FROM employees WHERE employment_status = "Active"');
        const pendingLeaves = await getRow('SELECT COUNT(*) as count FROM leave_requests WHERE status = "Pending"');
        const presentToday = await getRow('SELECT COUNT(*) as count FROM attendance WHERE date = CURRENT_DATE AND status = "Present"');

        res.json({
            success: true,
            stats: {
                totalEmployees: totalEmployees.count,
                activeEmployees: activeEmployees.count,
                pendingLeaves: pendingLeaves.count,
                presentToday: presentToday.count
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
