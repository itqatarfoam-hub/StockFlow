// Simple test script to check role permissions via API

async function checkAdminRole() {
    console.log('🔍 Checking Admin role permissions via API...\n');

    try {
        const response = await fetch('http://localhost:3000/api/roles');
        const data = await response.json();

        console.log('✅ Response received');
        console.log('📋 Total roles:', data.roles.length);

        const adminRole = data.roles.find(r => r.name.toLowerCase() === 'admin');

        if (adminRole) {
            console.log('\n=== ADMIN ROLE ===');
            console.log('ID:', adminRole.id);
            console.log('Name:', adminRole.name);
            console.log('Display Name:', adminRole.display_name);
            console.log('Permissions:', adminRole.permissions);
            console.log('\n📝 Permissions list:');

            const perms = Array.isArray(adminRole.permissions)
                ? adminRole.permissions
                : JSON.parse(adminRole.permissions);

            perms.forEach((p, i) => {
                console.log(`  ${i + 1}. ${p}`);
            });

            if (perms.includes('reports')) {
                console.log('\n✅ "reports" permission IS present');
            } else {
                console.log('\n❌ "reports" permission is MISSING');
                console.log('👉 You need to edit the Admin role and add "reports" permission');
            }
        } else {
            console.log('❌ Admin role not found!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure the server is running on port 3000');
    }
}

// Run the check
checkAdminRole();
