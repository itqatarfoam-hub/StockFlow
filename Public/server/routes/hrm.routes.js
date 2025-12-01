// ============================================
// STOCKFLOW - HRM API ROUTES
// Complete Backend Routes for HRM System
// ============================================

const express = require('express');
const router = express.Router();
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

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// ========================================
// EMPLOYEES MANAGEMENT
// ========================================

// Get all employees
router.get('/employees', async (req, res) => {
    try {
        const { status, department } = req.query;
        let query = 'SELECT * FROM hrm_employees WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }

        query += ' ORDER BY full_name';

        const employees = await req.db.query(query, params);
        res.json({ success: true, employees });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.json({ success: false, error: error.message });
    }
});

// Get single employee
router.get('/employees/:id', async (req, res) => {
    try {
        const employee = await req.db.query(
            'SELECT * FROM hrm_employees WHERE id = ?',
            [req.params.id]
        );

        if (employee.length === 0) {
            return res.json({ success: false, error: 'Employee not found' });
        }

        res.json({ success: true, employee: employee[0] });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.json({ success: false, error: error.message });
    }
});

// Create employee
router.post('/employees', upload.single('photo'), async (req, res) => {
    try {
        const employeeData = {
            ...req.body,
            photo_path: req.file ? `/uploads/hrm/${req.file.filename}` : null,
            created_by: req.user.id,
            created_at: new Date()
        };

        const result = await req.db.query(
            'INSERT INTO hrm_employees SET ?',
            employeeData
        );

        // Initialize leave balances for the new employee
        const currentYear = new Date().getFullYear();
        const leaveTypes = await req.db.query('SELECT * FROM hrm_leave_types WHERE active = 1');

        for (const type of leaveTypes) {
            await req.db.query(
                'INSERT INTO hrm_leave_balances SET ?',
                {
                    employee_id: result.insertId,
                    leave_type_id: type.id,
                    year: currentYear,
                    total_days: type.default_days_per_year,
                    used_days: 0,
                    remaining_days: type.default_days_per_year
                }
            );
        }

        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.json({ success: false, error: error.message });
    }
});

// Update employee
router.put('/employees/:id', upload.single('photo'), async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (req.file) {
            updateData.photo_path = `/uploads/hrm/${req.file.filename}`;
        }

        await req.db.query(
            'UPDATE hrm_employees SET ? WHERE id = ?',
            [updateData, req.params.id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.json({ success: false, error: error.message });
    }
});

// Delete employee
router.delete('/employees/:id', async (req, res) => {
    try {
        await req.db.query('DELETE FROM hrm_employees WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.json({ success: false, error: error.message });
    }
});

// Get departments
router.get('/departments', async (req, res) => {
    try {
        const departments = await req.db.query(
            'SELECT DISTINCT department FROM hrm_employees WHERE department IS NOT NULL ORDER BY department'
        );
        res.json({
            success: true,
            departments: departments.map(d => d.department)
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.json({ success: false, error: error.message });
    }
});

// ========================================
// LEAVE MANAGEMENT
// ========================================

// Get leave types
router.get('/leave/types', async (req, res) => {
    try {
        const types = await req.db.query('SELECT * FROM hrm_leave_types WHERE active = 1');
        res.json({ success: true, types });
    } catch (error) {
        console.error('Error fetching leave types:', error);
        res.json({ success: false, error: error.message });
    }
});

// Get my leave balance
router.get('/leave/my-balance', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const balances = await req.db.query(
            `SELECT lb.*, lt.leave_name, lt.leave_code 
       FROM hrm_leave_balances lb
       JOIN hrm_leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.employee_id = ? AND lb.year = ?`,
            [req.user.employee_id, currentYear]
        );
        res.json({ success: true, balances });
    } catch (error) {
        console.error('Error fetching leave balance:', error);
        res.json({ success: false, error: error.message });
    }
});

// Get leave requests
router.get('/leave/requests', async (req, res) => {
    try {
        const requests = await req.db.query(
            `SELECT lr.*, e.full_name as employee_name, e.employee_id as emp_id,
              lt.leave_name, approver.full_name as approved_by_name
       FROM hrm_leave_requests lr
       JOIN hrm_employees e ON lr.employee_id = e.id
       JOIN hrm_leave_types lt ON lr.leave_type_id = lt.id
       LEFT JOIN hrm_employees approver ON lr.approved_by = approver.id
       ORDER BY lr.created_at DESC`
        );

        // Mark which requests belong to current user and which require their approval
        const enhancedRequests = requests.map(r => ({
            ...r,
            is_mine: r.employee_id === req.user.employee_id,
            requires_my_approval: r.status === 'Pending' && req.user.role === 'HR'
        }));

        res.json({ success: true, requests: enhancedRequests });
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.json({ success: false, error: error.message });
    }
});

// Get pending approvals
router.get('/leave/pending-approvals', async (req, res) => {
    try {
        const requests = await req.db.query(
            `SELECT lr.*, e.full_name as employee_name, lt.leave_name
       FROM hrm_leave_requests lr
       JOIN hrm_employees e ON lr.employee_id = e.id
       JOIN hrm_leave_types lt ON lr.leave_type_id = lt.id
       WHERE lr.status = 'Pending'
       ORDER BY lr.created_at ASC
       LIMIT 10`
        );
        res.json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching pending approvals:', error);
        res.json({ success: false, error: error.message });
    }
});

// Apply for leave
router.post('/leave/apply', upload.single('document'), async (req, res) => {
    try {
        const { leave_type_id, start_date, end_date, total_days, reason } = req.body;

        // Check balance
        const currentYear = new Date().getFullYear();
        const balance = await req.db.query(
            'SELECT remaining_days FROM hrm_leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?',
            [req.user.employee_id, leave_type_id, currentYear]
        );

        if (balance.length === 0 || balance[0].remaining_days < parseFloat(total_days)) {
            return res.json({ success: false, error: 'Insufficient leave balance' });
        }

        const result = await req.db.query(
            'INSERT INTO hrm_leave_requests SET ?',
            {
                employee_id: req.user.employee_id,
                leave_type_id,
                start_date,
                end_date,
                total_days,
                reason,
                document_path: req.file ? `/uploads/hrm/${req.file.filename}` : null,
                status: 'Pending'
            }
        );

        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error applying for leave:', error);
        res.json({ success: false, error: error.message });
    }
});

// Approve leave
router.put('/leave/approve/:id', async (req, res) => {
    try {
        const leave = await req.db.query(
            'SELECT * FROM hrm_leave_requests WHERE id = ?',
            [req.params.id]
        );

        if (leave.length === 0) {
            return res.json({ success: false, error: 'Leave request not found' });
        }

        const leaveReq = leave[0];

        // Update request status
        await req.db.query(
            'UPDATE hrm_leave_requests SET status = ?, approved_by = ?, approved_date = NOW() WHERE id = ?',
            ['Approved', req.user.id, req.params.id]
        );

        // Update balance
        await req.db.query(
            `UPDATE hrm_leave_balances 
       SET used_days = used_days + ?, remaining_days = remaining_days - ?
       WHERE employee_id = ? AND leave_type_id = ? AND year = YEAR(?)`,
            [leaveReq.total_days, leaveReq.total_days, leaveReq.employee_id, leaveReq.leave_type_id, leaveReq.start_date]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error approving leave:', error);
        res.json({ success: false, error: error.message });
    }
});

// Reject leave
router.put('/leave/reject/:id', async (req, res) => {
    try {
        const { reason } = req.body;

        await req.db.query(
            'UPDATE hrm_leave_requests SET status = ?, rejection_reason = ?, approved_by = ?, approved_date = NOW() WHERE id = ?',
            ['Rejected', reason, req.user.id, req.params.id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error rejecting leave:', error);
        res.json({ success: false, error: error.message });
    }
});

// Cancel leave
router.put('/leave/cancel/:id', async (req, res) => {
    try {
        await req.db.query(
            'UPDATE hrm_leave_requests SET status = ? WHERE id = ? AND employee_id = ? AND status = ?',
            ['Cancelled', req.params.id, req.user.employee_id, 'Pending']
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error cancelling leave:', error);
        res.json({ success: false, error: error.message });
    }
});

// ========================================
// ATTENDANCE MANAGEMENT
// ========================================

// Clock in
router.post('/attendance/clock-in', async (req, res) => {
    try {
        const { location, ip } = req.body;
        const today = new Date().toISOString().split('T')[0];

        // Check if already clocked in
        const existing = await req.db.query(
            'SELECT * FROM hrm_attendance WHERE employee_id = ? AND attendance_date = ?',
            [req.user.employee_id, today]
        );

        if (existing.length > 0) {
            return res.json({ success: false, error: 'Already clocked in today' });
        }

        await req.db.query(
            'INSERT INTO hrm_attendance SET ?',
            {
                employee_id: req.user.employee_id,
                attendance_date: today,
                clock_in: new Date().toTimeString().split(' ')[0],
                clock_in_location: location || 'Unknown',
                clock_in_ip: ip || req.ip,
                status: 'Present'
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error clocking in:', error);
        res.json({ success: false, error: error.message });
    }
});

// Clock out
router.post('/attendance/clock-out', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const clockOut = new Date().toTimeString().split(' ')[0];

        const attendance = await req.db.query(
            'SELECT * FROM hrm_attendance WHERE employee_id = ? AND attendance_date = ?',
            [req.user.employee_id, today]
        );

        if (attendance.length === 0) {
            return res.json({ success: false, error: 'No clock-in record found' });
        }

        if (attendance[0].clock_out) {
            return res.json({ success: false, error: 'Already clocked out' });
        }

        // Calculate work hours
        const clockIn = new Date(`2000-01-01T${attendance[0].clock_in}`);
        const clockOutTime = new Date(`2000-01-01T${clockOut}`);
        const hours = (clockOutTime - clockIn) / (1000 * 60 * 60);
        const overtime = Math.max(0, hours - 8);

        await req.db.query(
            'UPDATE hrm_attendance SET clock_out = ?, work_hours = ?, overtime_hours = ?, clock_out_location = ?, clock_out_ip = ? WHERE id = ?',
            [clockOut, hours.toFixed(2), overtime.toFixed(2), req.body.location || 'Unknown', req.ip, attendance[0].id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error clocking out:', error);
        res.json({ success: false, error: error.message });
    }
});

// Get today's attendance
router.get('/attendance/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendance = await req.db.query(
            'SELECT * FROM hrm_attendance WHERE employee_id = ? AND attendance_date = ?',
            [req.user.employee_id, today]
        );

        res.json({
            success: true,
            attendance: attendance.length > 0 ? attendance[0] : null
        });
    } catch (error) {
        console.error('Error fetching today attendance:', error);
        res.json({ success: false, error: error.message });
    }
});

// Get attendance records
router.get('/attendance/records', async (req, res) => {
    try {
        const { month, employee } = req.query;
        let query = `
      SELECT a.*, e.full_name as employee_name 
      FROM hrm_attendance a
      JOIN hrm_employees e ON a.employee_id = e.id
      WHERE 1=1
    `;
        const params = [];

        if (month) {
            const [year, monthNum] = month.split('-');
            query += ' AND YEAR(a.attendance_date) = ? AND MONTH(a.attendance_date) = ?';
            params.push(year, monthNum);
        }

        if (employee) {
            query += ' AND a.employee_id = ?';
            params.push(employee);
        }

        query += ' ORDER BY a.attendance_date DESC';

        const records = await req.db.query(query, params);
        res.json({ success: true, records });
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.json({ success: false, error: error.message });
    }
});

// Get monthly summary
router.get('/attendance/monthly-summary', async (req, res) => {
    try {
        const { month } = req.query;
        const [year, monthNum] = (month || `${new Date().getFullYear()}-${new Date().getMonth() + 1}`).split('-');

        const summary = await req.db.query(
            `SELECT 
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'On-Leave' THEN 1 END) as onLeave,
        SUM(work_hours) as total_hours,
        SUM(overtime_hours) as overtime
       FROM hrm_attendance
       WHERE employee_id = ? AND YEAR(attendance_date) = ? AND MONTH(attendance_date) = ?`,
            [req.user.employee_id, year, monthNum]
        );

        res.json({ success: true, summary: summary[0] || {} });
    } catch (error) {
        console.error('Error fetching monthly summary:', error);
        res.json({ success: false, error: error.message });
    }
});

// Get today's summary (for dashboard)
router.get('/attendance/today-summary', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const summary = await req.db.query(
            `SELECT 
        COUNT(CASE WHEN status = 'Present' AND clock_in IS NOT NULL THEN 1 END) as present,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'On-Leave' THEN 1 END) as onLeave
       FROM hrm_attendance a
       JOIN hrm_employees e ON a.employee_id = e.id
       WHERE a.attendance_date = ? AND e.status = 'Active'`,
            [today]
        );

        res.json({ success: true, summary: summary[0] || {} });
    } catch (error) {
        console.error('Error fetching today summary:', error);
        res.json({ success: false, error: error.message });
    }
});

// ========================================
// ASSETS MANAGEMENT
// ========================================

// Get all assets
router.get('/assets', async (req, res) => {
    try {
        const assets = await req.db.query(
            `SELECT a.*, e.full_name as assigned_to_name
       FROM hrm_assets a
       LEFT JOIN hrm_employees e ON a.assigned_to = e.id
       ORDER BY a.asset_name`
        );
        res.json({ success: true, assets });
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.json({ success: false, error: error.message });
    }
});

// Create asset
router.post('/assets', upload.single('photo'), async (req, res) => {
    try {
        const result = await req.db.query(
            'INSERT INTO hrm_assets SET ?',
            { ...req.body, photo_path: req.file ? `/uploads/hrm/${req.file.filename}` : null }
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error creating asset:', error);
        res.json({ success: false, error: error.message });
    }
});

// Update asset
router.put('/assets/:id', async (req, res) => {
    try {
        await req.db.query(
            'UPDATE hrm_assets SET ? WHERE id = ?',
            [req.body, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating asset:', error);
        res.json({ success: false, error: error.message });
    }
});

// Assign asset
router.post('/assets/assign', upload.single('handover_document'), async (req, res) => {
    try {
        const { asset_id, employee_id, issue_date, expected_return_date, condition_on_issue } = req.body;

        // Create assignment
        await req.db.query(
            'INSERT INTO hrm_asset_assignments SET ?',
            {
                asset_id,
                employee_id,
                issue_date,
                expected_return_date,
                condition_on_issue,
                handover_document_path: req.file ? `/uploads/hrm/${req.file.filename}` : null,
                issued_by: req.user.id,
                status: 'Assigned'
            }
        );

        // Update asset
        await req.db.query(
            'UPDATE hrm_assets SET currently_assigned = 1, assigned_to = ? WHERE id = ?',
            [employee_id, asset_id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error assigning asset:', error);
        res.json({ success: false, error: error.message });
    }
});

// Return asset
router.post('/assets/return/:id', upload.single('return_document'), async (req, res) => {
    try {
        const { actual_return_date, condition_on_return, damage_notes } = req.body;

        // Get current assignment
        const assignment = await req.db.query(
            'SELECT * FROM hrm_asset_assignments WHERE asset_id = ? AND status = "Assigned" ORDER BY id DESC LIMIT 1',
            [req.params.id]
        );

        if (assignment.length === 0) {
            return res.json({ success: false, error: 'No active assignment found' });
        }

        // Update assignment
        await req.db.query(
            'UPDATE hrm_asset_assignments SET actual_return_date = ?, condition_on_return = ?, damage_notes = ?, return_document_path = ?, returned_to = ?, status = ? WHERE id = ?',
            [actual_return_date, condition_on_return, damage_notes, req.file ? `/uploads/hrm/${req.file.filename}` : null, req.user.id, 'Returned', assignment[0].id]
        );

        // Update asset
        await req.db.query(
            'UPDATE hrm_assets SET currently_assigned = 0, assigned_to = NULL WHERE id = ?',
            [req.params.id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error returning asset:', error);
        res.json({ success: false, error: error.message });
    }
});

// Delete asset
router.delete('/assets/:id', async (req, res) => {
    try {
        await req.db.query('DELETE FROM hrm_assets WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting asset:', error);
        res.json({ success: false, error: error.message });
    }
});

// ========================================
// VEHICLES MANAGEMENT
// ========================================

router.get('/vehicles', async (req, res) => {
    try {
        const vehicles = await req.db.query(
            `SELECT v.*, e.full_name as assigned_to_name
       FROM hrm_vehicles v
       LEFT JOIN hrm_employees e ON v.assigned_to = e.id
       ORDER BY v.plate_number`
        );
        res.json({ success: true, vehicles });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

router.post('/vehicles', async (req, res) => {
    try {
        const result = await req.db.query('INSERT INTO hrm_vehicles SET ?', req.body);
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

router.put('/vehicles/:id', async (req, res) => {
    try {
        await req.db.query('UPDATE hrm_vehicles SET ? WHERE id = ?', [req.body, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// ========================================
// DOCUMENTS MANAGEMENT
// ========================================

router.get('/documents', async (req, res) => {
    try {
        const documents = await req.db.query(
            `SELECT d.*, e.full_name as employee_name
       FROM hrm_employee_documents d
       JOIN hrm_employees e ON d.employee_id = e.id
       ORDER BY d.created_at DESC`
        );
        res.json({ success: true, documents });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

router.post('/documents/upload', upload.single('document'), async (req, res) => {
    try {
        const { employee_id, document_name, document_category } = req.body;

        const result = await req.db.query(
            'INSERT INTO hrm_employee_documents SET ?',
            {
                employee_id,
                document_name,
                document_category,
                document_path: `/uploads/hrm/${req.file.filename}`,
                file_size: req.file.size,
                file_type: req.file.mimetype
            }
        );

        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

router.delete('/documents/:id', async (req, res) => {
    try {
        await req.db.query('DELETE FROM hrm_employee_documents WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Get expiring documents
router.get('/documents/expiring', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const documents = await req.db.query(
            `SELECT * FROM v_expiring_documents 
       WHERE days_until_expiry <= ? AND days_until_expiry >= 0
       ORDER BY days_until_expiry ASC`,
            [days]
        );
        res.json({ success: true, documents });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// ========================================
// PAYROLL MANAGEMENT
// ========================================

router.get('/payroll', async (req, res) => {
    try {
        const { month, status } = req.query;
        let query = `
      SELECT p.*, e.full_name as employee_name
      FROM hrm_payroll p
      JOIN hrm_employees e ON p.employee_id = e.id
      WHERE 1=1
    `;
        const params = [];

        if (month) {
            const [year, monthNum] = month.split('-');
            query += ' AND p.year = ? AND p.month = ?';
            params.push(year, monthNum);
        }

        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }

        query += ' ORDER BY e.full_name';

        const payrolls = await req.db.query(query, params);
        res.json({ success: true, payrolls });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

router.put('/payroll/approve/:id', async (req, res) => {
    try {
        await req.db.query(
            'UPDATE hrm_payroll SET status = ?, approved_by = ? WHERE id = ?',
            ['Approved', req.user.id, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// ========================================
// REMINDERS MANAGEMENT
// ========================================

router.get('/reminders/upcoming', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;

        const reminders = await req.db.query(
            `SELECT r.*, e.full_name as employee_name
       FROM hrm_expiry_reminders r
       LEFT JOIN hrm_employees e ON r.employee_id = e.id
       WHERE r.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
       AND r.status != 'Cancelled'
       ORDER BY r.expiry_date ASC`,
            [days]
        );

        res.json({ success: true, reminders });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

router.put('/reminders/:id/renew', async (req, res) => {
    try {
        const { new_expiry } = req.body;

        await req.db.query(
            'UPDATE hrm_expiry_reminders SET status = ?, expiry_date = ? WHERE id = ?',
            ['Renewed', new_expiry, req.params.id]
        );

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// ========================================
// DASHBOARD STATS
// ========================================

router.get('/dashboard/stats', async (req, res) => {
    try {
        const stats = {};

        // Total active employees
        const employees = await req.db.query(
            'SELECT COUNT(*) as count FROM hrm_employees WHERE status = "Active"'
        );
        stats.totalEmployees = employees[0].count;

        // Expiring documents
        const expiring = await req.db.query(
            'SELECT COUNT(*) as count FROM v_expiring_documents WHERE days_until_expiry <= 30 AND days_until_expiry >= 0'
        );
        stats.expiringDocs = expiring[0].count;

        // Leaves today
        const today = new Date().toISOString().split('T')[0];
        const leaves = await req.db.query(
            'SELECT COUNT(*) as count FROM hrm_leave_requests WHERE ? BETWEEN start_date AND end_date AND status = "Approved"',
            [today]
        );
        stats.leavesToday = leaves[0].count;

        // Assigned assets
        const assets = await req.db.query(
            'SELECT COUNT(*) as count FROM hrm_assets WHERE currently_assigned = 1'
        );
        stats.assignedAssets = assets[0].count;

        res.json({ success: true, stats });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// ========================================
// REPORTS
// ========================================

router.get('/reports/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const filters = req.query;
        let data = [];

        switch (type) {
            case 'employees':
                let query = 'SELECT * FROM hrm_employees WHERE 1=1';
                const params = [];
                if (filters.department) {
                    query += ' AND department = ?';
                    params.push(filters.department);
                }
                if (filters.status) {
                    query += ' AND status = ?';
                    params.push(filters.status);
                }
                data = await req.db.query(query, params);
                break;

            case 'leave':
                data = await req.db.query(
                    `SELECT lr.*, e.full_name, lt.leave_name
           FROM hrm_leave_requests lr
           JOIN hrm_employees e ON lr.employee_id = e.id
           JOIN hrm_leave_types lt ON lr.leave_type_id = lt.id
           WHERE 1=1
           ${filters.from_date ? 'AND lr.start_date >= ?' : ''}
           ${filters.to_date ? 'AND lr.end_date <= ?' : ''}`,
                    [filters.from_date, filters.to_date].filter(Boolean)
                );
                break;

            case 'attendance':
                data = await req.db.query(
                    `SELECT a.*, e.full_name
           FROM hrm_attendance a
           JOIN hrm_employees e ON a.employee_id = e.id
           WHERE 1=1
           ${filters.from_date ? 'AND a.attendance_date >= ?' : ''}
           ${filters.to_date ? 'AND a.attendance_date <= ?' : ''}`,
                    [filters.from_date, filters.to_date].filter(Boolean)
                );
                break;

            // Add more report types as needed
        }

        res.json({ success: true, data });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

module.exports = router;
