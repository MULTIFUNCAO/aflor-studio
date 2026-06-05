var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Achar o fechamento do Object.assign dentro de renderAgenda
var idxFn = c.indexOf('function renderAgenda(');
var trecho = c.substring(idxFn, idxFn + 5000);
var idxAssign = trecho.indexOf(' var agendamentosPorData = Object.assign({');
var aposAssign = trecho.substring(idxAssign);
var idxFecha = aposAssign.indexOf('});\n');
var posInsert = idxFn + idxAssign + idxFecha + 4;

console.log('contexto antes:', JSON.stringify(c.substring(posInsert - 20, posInsert + 5)));

var merge = '    (window._novosAgendamentos||[]).forEach(function(a){if(a&&a.data){agendamentosPorData[a.data]=agendamentosPorData[a.data]||[];agendamentosPorData[a.data].push(a);}});\n';
c = c.substring(0, posInsert) + merge + c.substring(posInsert);
fs.writeFileSync('index.html', c);
console.log('ok');
