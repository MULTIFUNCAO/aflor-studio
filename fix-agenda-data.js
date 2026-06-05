var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'if(a&&a.data){agendamentosPorData[a.data]=agendamentosPorData[a.data]||[];agendamentosPorData[a.data].push(a);}';
var novo = 'if(a&&a.data){agendamentosPorData[a.data]=agendamentosPorData[a.data]||[];agendamentosPorData[a.data].push(a);}';

// Abordagem direta: adicionar guard no forEach
var old2 = '(window._novosAgendamentos||[]).forEach(function(a){if(a&&a.data){agendamentosPorData[a.data]';
if (c.includes(old2)) {
  console.log('achou variante 2');
} else {
  // Ver o trecho exato
  var idx = c.indexOf('agendamentosPorData[a.data].push(a)');
  console.log(JSON.stringify(c.substring(idx-80, idx+50)));
}
