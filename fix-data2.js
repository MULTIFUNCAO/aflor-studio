var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var idx = c.indexOf('id="modal-agendar"');
var trecho = c.substring(idx, idx + 2000);
console.log(trecho);
