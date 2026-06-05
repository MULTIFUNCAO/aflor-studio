var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var merge = '    (window._novosAgendamentos||[]).forEach(function(a){if(a.data){agendamentosPorData[a.data]=agendamentosPorData[a.data]||[];agendamentosPorData[a.data].push(a);}});\n';
c = c.replace(merge, '');
fs.writeFileSync('index.html', c);
console.log('removido:', !c.includes('_novosAgendamentos||[]).forEach'));
