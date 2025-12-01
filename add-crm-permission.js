// Add CRM permission to all admin roles
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

console.log('🔄 Adding CRM permission to roles...\n');

db.serialize(() => {
    // Get all roles first
    db.all('SELECT * FROM roles', [], (err, roles) => {
        if (err) {
            console.error('❌ Error fetching roles:', err);
            db.close();
            return;
        }

        console.log(`Found ${roles.length} roles\n`);

        roles.forEach(role => {
            let permissions = [];

            try {
                permissions = JSON.parse(role.permissions || '[]');
            } catch (e) {
                permissions = [];
            }

            // Add 'crm' if not already present and if role has dashboard access
            if (!permissions.includes('crm') && permissions.includes('dashboard')) {
                permissions.push('crm');

                const updatedPermissions = JSON.stringify(permissions);

                db.run(
                    'UPDATE roles SET permissions = ? WHERE id = ?',
                    [updatedPermissions, role.id],
                    function (err) {
                        if (err) {
                            console.error(`❌ Error updating ${role.name}:`, err);
                        } else {
                            console.log(`✅ Added CRM to ${role.name}: ${permissions.join(', ')}`);
                        }
                    }
                );
            } else if (permissions.includes('crm')) {
                console.log(`⏭️  ${role.name} already has CRM permission`);
            } else {
                console.log(`⏭️  ${role.name} - no dashboard access, skipping CRM`);
            }
        });

        // Close after all updates
        setTimeout(() => {
            console.log('\n✅ CRM permissions updated!');
            db.close();
        }, 1000);
    });
});
