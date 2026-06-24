const fs = require('fs');

let content = fs.readFileSync('js/dashboard.js', 'utf8');

// Replace single-quoted hardcoded URL with backtick template string
content = content.replace(/'https:\/\/dirictiondback\.digitalrace\.net([^']*)'/g, "`${API_BASE}$1`");

// Replace already backtick template string hardcoded URL
content = content.replace(/`https:\/\/dirictiondback\.digitalrace\.net([^`]*)`/g, "`${API_BASE}$1`");

// Change API_BASE to localhost for local testing
content = content.replace("const API_BASE = 'http://localhost:8085';", "const API_BASE = 'http://localhost:8080';");

// Change size=30 to size=10
content = content.replaceAll('?size=30', '?size=10').replaceAll('&size=30', '&size=10');

fs.writeFileSync('js/dashboard.js', content, 'utf8');
console.log("Done");
