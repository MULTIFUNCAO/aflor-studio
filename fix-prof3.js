var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var idx = c.indexOf('id="modal-agendar"');
var trecho = c.substring(idx, idx + 1500);
var idxSelect = trecho.indexOf('<select><option>Ana Flor');
var posAbs = idx + idxSelect;
c = c.substring(0, posAbs) + '<select id="ag-prof"><option>Ana Flor' + c.substring(posAbs + 24);
fs.writeFileSync('index.html', c);
console.log('prof:', c.includes('id="ag-prof"'));
