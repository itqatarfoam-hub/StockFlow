// Script to add messaging case to main.js
const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'public', 'js', 'main.js');
let content = fs.readFileSync(mainPath, 'utf8');

// Find the location after case 'sales' and before case 'users'
const searchPattern = /case 'sales':\s+if \(window\.salesPageModule\) salesPageModule\.attachListeners\(this\);\s+break;\s+(case 'users':)/;

const replacement = `case 'sales':
          if (window.salesPageModule) salesPageModule.attachListeners(this);
          break;
        case 'messaging':
          if (window.messagingPageModule) messagingPageModule.attachListeners(this);
          break;
        $1`;

if (content.match(searchPattern)) {
    content = content.replace(searchPattern, replacement);
    fs.writeFileSync(mainPath, content, 'utf8');
    console.log('✅ Successfully added messaging case to main.js');
} else {
    console.error('❌ Could not find the pattern to replace');
}
