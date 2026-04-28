const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');

// Find all showPreAuthDialog occurrences
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('showPreAuthDialog')) {
        console.log('Line ' + (i+1) + ': ' + lines[i].trim().slice(0, 80));
    }
}

// Check around line 1460-1470
console('\n=== Lines 1455-1470 ===');
for (let i = 1454; i <= 1469; i++) {
    const stripped = lines[i].rstrip();
    const indent = stripped.length - stripped.lstrip().length;
    console.log('Line ' + (i+1) + ' (' + indent + ' spaces): ' + JSON.stringify(stripped.slice(0, 60)));
}
