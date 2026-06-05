var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var idx = c.indexOf('function renderAgenda(');
console.log(c.substring(idx + 2200, idx + 3000));
