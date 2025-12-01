// Script to update loadRecentSales to filter by current user
const fs = require('fs');
const path = require('path');

const salesModulePath = path.join(__dirname, 'public', 'js', 'modules', 'sales.module.js');
let content = fs.readFileSync(salesModulePath, 'utf8');

// Find and replace the loadRecentSales function
const pattern = /(loadRecentSales\(app\) \{[\s\S]*?const recentSales = )app\.sales\.slice\(0, 10\);/;

const replacement = `$1app.sales
      .filter(sale => sale.created_by === app.currentUser?.username)
      .slice(0, 10);`;

if (content.match(pattern)) {
    content = content.replace(pattern, replacement);
    fs.writeFileSync(salesModulePath, content, 'utf8');
    console.log('✅ Successfully updated loadRecentSales to filter by current user');
} else {
    console.log('❌ Could not find loadRecentSales pattern');
}
