var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var idx = c.indexOf('modal-agendar');
var trecho = c.substring(idx, idx + 4000);
var idxBtn = trecho.lastIndexOf('Confirmar');
console.log(JSON.stringify(trecho.substring(idxBtn - 100, idxBtn + 200)));
