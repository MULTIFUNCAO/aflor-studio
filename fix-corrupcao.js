var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Achar onde o ag-servico tem lixo
var idx = c.indexOf('id="ag-servico"');
console.log('ag-servico contexto:');
console.log(JSON.stringify(c.substring(idx, idx + 200)));

// Ver os primeiros 200 chars do arquivo
console.log('inicio arquivo:');
console.log(JSON.stringify(c.substring(0, 100)));
