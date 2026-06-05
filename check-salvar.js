var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var idx = c.indexOf('function salvarAgendamento');
console.log(c.substring(idx, idx + 600));
