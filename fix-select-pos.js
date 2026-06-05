var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Ver o que tem antes do modal-agendar - o select perdido
var idxSelect = c.indexOf('<select><option>-- Selecione --');
if (idxSelect === -1) idxSelect = c.indexOf('<select id="ag-prof">');
console.log('select pos:', idxSelect);
console.log('contexto:', JSON.stringify(c.substring(idxSelect - 100, idxSelect + 50)));
