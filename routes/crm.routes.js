const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ============================================
// COMPANIES MANAGEMENT
// ============================================

// Get all companies (with filtering)
router.get('/companies', requireAuth, (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM crm_companies';
    let params = [];

    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, companies) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        res.json({ success: true, companies });
    });
});

// Get single company with all related data
router.get('/companies/:id', requireAuth, (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM crm_companies WHERE id = ?', [id], (err, company) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Get contacts
        db.all('SELECT * FROM crm_company_contacts WHERE company_id = ?', [id], (err, contacts) => {
            if (err) contacts = [];

            // Get documents
            db.all('SELECT * FROM crm_company_documents WHERE company_id = ?', [id], (err, documents) => {
                if (err) documents = [];

                res.json({
                    success: true,
                    company: {
                        ...company,
                        contacts,
                        documents
                    }
                });
            });
        });
    });
});

// Create new company registration
router.post('/companies', requireAuth, (req, res) => {
    const {
        company_name,
        address,
        contact_person,
        phone,
        email,
        website,
        industry_type,
        num_employees
    } = req.body;

    if (!company_name || !contact_person || !phone || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const companyId = uuidv4();

    db.run(
        `INSERT INTO crm_companies (
      id, company_name, address, contact_person, phone, email, 
      website, industry_type, num_employees, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [companyId, company_name, address, contact_person, phone, email, website, industry_type, num_employees],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create company', details: err.message });
            }

            // Create activity log
            db.run(
                'INSERT INTO crm_activity_log (id, company_id, user_id, activity_type, description) VALUES (?, ?, ?, ?, ?)',
                [uuidv4(), companyId, req.user.id, 'company_registered', `Company "${company_name}" registered`],
                () => { }
            );

            res.json({ success: true, companyId, message: 'Company registered. Awaiting approval.' });
        }
    );
});

// Approve company (Manager/Admin only)
router.post('/companies/:id/approve', requireAuth, (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if user is manager/admin
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ error: 'Only managers can approve companies' });
    }

    db.run(
        `UPDATE crm_companies 
     SET status = 'approved', approved_by = ?, approved_date = datetime('now'), approval_notes = ?
     WHERE id = ?`,
        [req.user.id, notes, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to approve company' });
            }

            // Log activity
            db.run(
                'INSERT INTO crm_activity_log (id, company_id, user_id, activity_type, description) VALUES (?, ?, ?, ?, ?)',
                [uuidv4(), id, req.user.id, 'company_approved', `Company approved by ${req.user.username}`],
                () => { }
            );

            res.json({ success: true, message: 'Company approved successfully' });
        }
    );
});

// Reject company (Manager/Admin only)
router.post('/companies/:id/reject', requireAuth, (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ error: 'Only managers can reject companies' });
    }

    if (!notes) {
        return res.status(400).json({ error: 'Rejection notes are required' });
    }

    db.run(
        `UPDATE crm_companies 
     SET status = 'rejected', approved_by = ?, approved_date = datetime('now'), approval_notes = ?
     WHERE id = ?`,
        [req.user.id, notes, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to reject company' });
            }

            // Log activity
            db.run(
                'INSERT INTO crm_activity_log (id, company_id, user_id, activity_type, description) VALUES (?, ?, ?, ?, ?)',
                [uuidv4(), id, req.user.id, 'company_rejected', `Company rejected: ${notes}`],
                () => { }
            );

            res.json({ success: true, message: 'Company rejected' });
        }
    );
});

// ============================================
// LEADS MANAGEMENT
// ============================================

// Get all leads
router.get('/leads', requireAuth, (req, res) => {
    const { stage, assigned_to } = req.query;
    let query = `
    SELECT l.*, c.company_name, cc.name as contact_name 
    FROM crm_leads l
    LEFT JOIN crm_companies c ON l.company_id = c.id
    LEFT JOIN crm_company_contacts cc ON l.contact_id = cc.id
    WHERE 1=1
  `;
    let params = [];

    if (stage) {
        query += ' AND l.stage = ?';
        params.push(stage);
    }

    if (assigned_to) {
        query += ' AND l.assigned_to = ?';
        params.push(assigned_to);
    }

    query += ' ORDER BY l.created_at DESC';

    db.all(query, params, (err, leads) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, leads });
    });
});

// Create new lead
router.post('/leads', requireAuth, (req, res) => {
    const { company_id, contact_id, title, source, stage, assigned_to, value, probability, notes } = req.body;

    if (!company_id || !title) {
        return res.status(400).json({ error: 'Company and title are required' });
    }

    const leadId = uuidv4();

    db.run(
        `INSERT INTO crm_leads (
      id, company_id, contact_id, title, source, stage, assigned_to, value, probability, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [leadId, company_id, contact_id, title, source, stage || 'new', assigned_to, value || 0, probability || 0, notes],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create lead' });
            }

            // Log activity
            db.run(
                'INSERT INTO crm_activity_log (id, company_id, user_id, activity_type, description) VALUES (?, ?, ?, ?, ?)',
                [uuidv4(), company_id, req.user.id, 'lead_created', `Lead "${title}" created`],
                () => { }
            );

            res.json({ success: true, leadId, message: 'Lead created successfully' });
        }
    );
});

// ============================================
// DASHBOARD STATS
// ============================================

router.get('/dashboard/stats', requireAuth, (req, res) => {
    const stats = {};

    // Count companies
    db.get('SELECT COUNT(*) as total FROM crm_companies WHERE status = "approved"', (err, row) => {
        stats.totalCompanies = row?.total || 0;

        // Count pending approvals
        db.get('SELECT COUNT(*) as total FROM crm_companies WHERE status = "pending"', (err, row) => {
            stats.pendingApprovals = row?.total || 0;

            // Count active leads
            db.get('SELECT COUNT(*) as total FROM crm_leads WHERE stage IN ("new", "contacted", "qualified", "proposal", "negotiation")', (err, row) => {
                stats.activeLeads = row?.total || 0;

                // Count today's meetings
                db.get('SELECT COUNT(*) as total FROM crm_meetings WHERE DATE(meeting_date) = DATE("now")', (err, row) => {
                    stats.meetingsToday = row?.total || 0;

                    // Count quotations
                    db.get('SELECT COUNT(*) as total FROM crm_quotations WHERE status != "rejected"', (err, row) => {
                        stats.quotations = row?.total || 0;

                        // Count production orders
                        db.get('SELECT COUNT(*) as total FROM crm_production_orders WHERE status IN ("pending", "in_progress")', (err, row) => {
                            stats.inProduction = row?.total || 0;

                            // Count pending deliveries
                            db.get('SELECT COUNT(*) as total FROM crm_deliveries WHERE status = "pending"', (err, row) => {
                                stats.pendingDeliveries = row?.total || 0;

                                // Calculate outstanding payments
                                db.get('SELECT SUM(balance_due) as total FROM crm_invoices WHERE status != "paid"', (err, row) => {
                                    stats.outstandingPayments = row?.total || 0;

                                    res.json({ success: true, stats });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
