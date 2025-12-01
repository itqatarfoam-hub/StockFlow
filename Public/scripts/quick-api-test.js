// Simple API test
const http = require('http');

function testAPI(path) {
    return new Promise((resolve) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`\n${path}`);
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${data.substring(0, 200)}`);
                resolve();
            });
        }).on('error', (err) => {
            console.log(`\n${path}`);
            console.log(`ERROR: ${err.message}`);
            resolve();
        });
    });
}

async function test() {
    console.log('\n🧪 Testing HRM API Endpoints:\n');
    console.log('═══════════════════════════════════════════════════════════');

    await testAPI('/api/hrm/employees');
    await testAPI('/api/hrm/departments');
    await testAPI('/api/hrm/dashboard/stats');

    console.log('\n═══════════════════════════════════════════════════════════\n');
}

test();
