var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var idx = c.indexOf('modal-agendar');
var trecho = c.substring(idx, idx + 5000);
// Buscar onclick dentro do modal
var matches = trecho.match(/onclick="[^"]*"/g);
console.log(matches);
