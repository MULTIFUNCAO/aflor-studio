var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var idx = c.indexOf('var novo={id:Date.now()');
var trecho = c.substring(idx - 500, idx);
// Achar a linha do prof
var idxProf = trecho.lastIndexOf('var prof=');
console.log('prof linha:', JSON.stringify(trecho.substring(idxProf, idxProf + 80)));
