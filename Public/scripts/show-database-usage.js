// ============================================
// CHECK ACTUAL DATABASE STRUCTURE AND DATA
// Shows what your app is using for menus and roles
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');

console.log('🔍 CHECKING YOUR ACTUAL DATABASE\n');
console.log('📁 Database:', dbPath);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Show current user to understand role
    console.log('1️⃣  CURRENT USER (example):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    db.all("SELECT id, username, role FROM users LIMIT 3", [], (err, users) => {
        if (err) {
            console.error('Error:', err);
        } else {
            users.forEach(u => {
                console.log(`   User: ${u.username}, Role: ${u.role}`);
            });
        }
    });

    // 2. Show HRM menu in database
    setTimeout(() => {
        console.log('\n2️⃣  HRM MENU IN DATABASE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        db.all("SELECT * FROM menu_items WHERE route = 'hrm' OR name LIKE '%HR%'", [], (err, menus) => {
            if (err) {
                console.error('Error:', err);
            } else if (menus.length === 0) {
                console.log('   ⚠️  NO HRM menu found in database!');
            } else {
                menus.forEach(m => {
                    console.log('   Menu Item:');
                    console.log('     ID:', m.id);
                    console.log('     Name:', m.name);
                    console.log('     Icon:', m.icon);
                    console.log('     Route:', m.route);
                    console.log('     Permission:', m.permission);
                    console.log('     Active:', m.is_active ? 'YES' : 'NO');
                    console.log('     Display Order:', m.display_order);
                    console.log('');
                });
            }
        });
    }, 200);

    // 3. Show what API endpoint would return
    setTimeout(() => {
        console.log('3️⃣  API ENDPOINT RESPONSE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Endpoint: GET /api/menu-items/role/:role');
        console.log('   Example: GET /api/menu-items/role/admin\n');

        // Simulate what API returns for ADMIN role
        db.all(`
            SELECT * FROM menu_items 
            WHERE is_active = 1 
            AND (
                permission IS NULL 
                OR permission = '' 
                OR permission LIKE '%admin%'
            )
            ORDER BY display_order
        `, [], (err, menus) => {
            if (err) {
                console.error('Error:', err);
            } else {
                console.log(`   Would return ${menus.length} menus for ADMIN role:`);
                menus.forEach(m => {
                    const hasHRM = m.route === 'hrm' || m.name.includes('HR');
                    console.log(`     ${hasHRM ? '✅' : '  '} ${m.icon} ${m.name} (${m.route})`);
                });
            }
        });
    }, 400);

    // 4. Check if there's a role_menu_permissions table
    setTimeout(() => {
        console.log('\n4️⃣  ROLE PERMISSIONS TABLE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%role%'", [], (err, tables) => {
            if (err) {
                console.error('Error:', err);
            } else if (tables.length === 0) {
                console.log('   ℹ️  No separate role permissions table');
                console.log('   → Permissions stored in menu_items.permission column');
            } else {
                console.log('   Found role-related tables:');
                tables.forEach(t => console.log('     -', t.name));
            }
        });
    }, 600);

    // 5. Check backend API file
    setTimeout(() => {
        console.log('\n5️⃣  BACKEND API FILE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Should be: server/routes/ or server.js');
        console.log('   Endpoint handling: /api/menu-items/role/:role');
        console.log('   This endpoint should:');
        console.log('     1. Receive user role (e.g., "admin")');
        console.log('     2. Query menu_items table');
        console.log('     3. Filter by permission column');
        console.log('     4. Return only allowed menus');

        db.close();
    }, 800);
});
