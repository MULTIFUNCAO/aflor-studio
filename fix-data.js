var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var idx = c.indexOf('modal-agendar');
var trecho = c.substring(idx, idx + 1500);
// Achar os IDs dos inputs
var matches = trecho.match(/id="[^"]*"/g);
console.log(matches);
