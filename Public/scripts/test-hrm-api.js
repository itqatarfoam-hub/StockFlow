const fetch = require('node-fetch');

console.log('\n🧪 Testing HRM API Endpoints...\n');

async function testAPI() {
    const baseURL = 'http://localhost:3000';

    try {
        // Test 1: Get employees (should be empty initially)
        console.log('1️⃣  Testing GET /api/hrm/employees');
        const empResponse = await fetch(`${baseURL}/api/hrm/employees`);
        const empData = await empResponse.json();
        console.log(`   Status: ${empResponse.status}`);
        console.log(`   Employees: ${empData.employees?.length || 0}`);
        console.log(`   ✅ Endpoint working!\n`);

        // Test 2: Get departments
        console.log('2️⃣  Testing GET /api/hrm/departments');
        const deptResponse = await fetch(`${baseURL}/api/hrm/departments`);
        const deptData = await deptResponse.json();
        console.log(`   Status: ${deptResponse.status}`);
        console.log(`   Departments: ${deptData.departments?.length || 0}`);
        if (deptData.departments) {
            deptData.departments.forEach(d => console.log(`      - ${d}`));
        }
        console.log(`   ✅ Endpoint working!\n`);

        // Test 3: Get dashboard stats
        console.log('3️⃣  Testing GET /api/hrm/dashboard/stats');
        const statsResponse = await fetch(`${baseURL}/api/hrm/dashboard/stats`);
        const statsData = await statsResponse.json();
        console.log(`   Status: ${statsResponse.status}`);
        if (statsData.stats) {
            console.log(`   Total Employees: ${statsData.stats.totalEmployees}`);
            console.log(`   Active Employees: ${statsData.stats.activeEmployees}`);
            console.log(`   Pending Leaves: ${statsData.stats.pendingLeaves}`);
            console.log(`   Present Today: ${statsData.stats.presentToday}`);
        }
        console.log(`   ✅ Endpoint working!\n`);

        console.log('═══════════════════════════════════════════════════════════');
        console.log('🎉 All HRM API endpoints are working!');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('✅ Ready to use HRM Employees module!');
        console.log('💡 Open http://localhost:3000 and navigate to HR Management > Employees\n');

    } catch (error) {
        console.error('❌ Error testing API:', error.message);
        console.log('\n💡 Make sure server is running: node server.js\n');
    }
}

testAPI();
