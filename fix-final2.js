var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = ' var _extras=window._novosAgendamentos||[];_extras.forEach(function(a){var d=a.data;agendamentosPorData=agendamentosPorData||{};});var agendamentosPorData={};(window._novosAgendamentos||[]).forEach(function(a){agendamentosPorData[a.data]=agendamentosPorData[a.data]||[];agendamentosPorData[a.data].push(a);});agendamentosPorData=Object.assign({';
var novo = ' var agendamentosPorData = Object.assign({';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok: corrigido');
} else {
  // tentar achar o trecho exato
  var idx = c.indexOf('var _extras=window._novosAgendamentos');
  console.log('idx:', idx);
  console.log(JSON.stringify(c.substring(idx, idx + 300)));
}
