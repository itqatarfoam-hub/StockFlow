// Simple meetings endpoint to add to crm.routes.js
// Add this code after the leads section

// ============================================
// MEETINGS MANAGEMENT
// ============================================

// Get all meetings
router.get('/meetings', requireAuth, (req, res) => {
    db.all(
        `SELECT m.*, c.company_name 
     FROM crm_meetings m
     LEFT JOIN crm_companies c ON m.company_id = c.id
     ORDER BY m.meeting_date ASC`,
        [],
        (err, meetings) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true, meetings });
        }
    );
});

// INSTRUCTIONS:
// 1. Open routes/crm.routes.js
// 2. Find the section after leads management
// 3. Add this code before the dashboard stats section
// 4. Save the file
