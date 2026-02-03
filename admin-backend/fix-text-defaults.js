const fs = require('fs');
const path = require('path');

// Read the models.js file
const modelsPath = path.join(__dirname, 'models.js');
let content = fs.readFileSync(modelsPath, 'utf8');

// Replace all DataTypes.TEXT with default values
content = content.replace(/type: DataTypes\.TEXT, defaultValue: '[^']*'/g, 'type: DataTypes.TEXT');
content = content.replace(/type: DataTypes\.TEXT, defaultValue: "[^"]*"/g, 'type: DataTypes.TEXT');
content = content.replace(/type: DataTypes\.TEXT, defaultValue: `[^`]*`/g, 'type: DataTypes.TEXT');

// Also handle TEXT('long') pattern
content = content.replace(/type: DataTypes\.TEXT\('long'\), defaultValue: '[^']*'/g, "type: DataTypes.TEXT('long')");
content = content.replace(/type: DataTypes\.TEXT\('long'\), defaultValue: "[^"]*"/g, "type: DataTypes.TEXT('long')");

// Write the fixed content back
fs.writeFileSync(modelsPath, content, 'utf8');
console.log('Fixed all TEXT columns with default values');