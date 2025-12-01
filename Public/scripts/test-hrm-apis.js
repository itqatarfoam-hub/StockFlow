// ============================================
// HRM API DIAGNOSTICS - Check if APIs work
// ============================================

const http = require('http');

console.log('\n🔍 HRM API DIAGNOSTICS\n');
console.log('═══════════════════════════════════════════════════════════\n');

function testEndpoint(path, description) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`✅ ${description}`);
                    console.log(`   Status: ${res.statusCode}`);
                    console.log(`   Response: ${JSON.stringify(json).substring(0, 100)}...`);
                    console.log('');
                    resolve({ success: true, data: json });
                } catch (e) {
                    console.log(`❌ ${description}`);
                    console.log(`   Status: ${res.statusCode}`);
                    console.log(`   Error: Invalid JSON response`);
                    console.log('');
                    resolve({ success: false, error: e.message });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ ${description}`);
            console.log(`   Error: ${error.message}`);
            console.log(`   💡 Make sure server is running: node server.js`);
            console.log('');
            resolve({ success: false, error: error.message });
        });

        req.end();
    });
}

async function runDiagnostics() {
    console.log('1️⃣  Testing Server Connection...\n');

    const serverTest = await testEndpoint('/', 'Server Root');

    if (!serverTest.success) {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('❌ SERVER IS NOT RUNNING!');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('\n💡 Start server with: node server.js\n');
        return;
    }

    console.log('2️⃣  Testing HRM API Endpoints...\n');

    await testEndpoint('/api/hrm/employees', 'GET /api/hrm/employees');
    await testEndpoint('/api/hrm/departments', 'GET /api/hrm/departments');
    await testEndpoint('/api/hrm/dashboard/stats', 'GET /api/hrm/dashboard/stats');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ DIAGNOSTICS COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📋 NEXT STEPS:');
    console.log('');
    console.log('1. If server is not running:');
    console.log('   → Open terminal');
    console.log('   → Run: node server.js');
    console.log('');
    console.log('2. If APIs are failing:');
    console.log('   → Check routes/hrm.routes.js is loaded');
    console.log('   → Check server.js has: app.use(\'/api/hrm\', hrmRoutes)');
    console.log('');
    console.log('3. If APIs work but frontend shows "Loading...":');
    console.log('   → Hard refresh browser: Ctrl + Shift + F5');
    console.log('   → Check browser console for errors (F12)');
    console.log('   → Check Network tab to see if API is called');
    console.log('');
}

runDiagnostics();
