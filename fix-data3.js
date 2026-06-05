var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var idx = c.indexOf('id="modal-agendar"');
console.log(c.substring(idx, idx + 800));
