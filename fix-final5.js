var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var idx = c.indexOf(' var agendamentosPorData = Object.assign({');
// Achar o fechamento: }, {}) que fecha o Object.assign
var trecho = c.substring(idx, idx + 4000);
var idxFecha = trecho.indexOf('}, {});');
if (idxFecha === -1) idxFecha = trecho.indexOf('},{});');
if (idxFecha === -1) idxFecha = trecho.indexOf('});\n');
console.log('fecha em:', idxFecha);
console.log(JSON.stringify(trecho.substring(idxFecha - 30, idxFecha + 50)));
