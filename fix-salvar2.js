var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'var d=novo.data;agendamentosPorData=agendamentosPorData||{};window._novosAgendamentos=window._novosAgendamentos||[];window._novosAgendamentos.push(novo);';
var novo = 'window._novosAgendamentos=window._novosAgendamentos||[];window._novosAgendamentos.push(novo);';

c = c.replace(old, novo);
fs.writeFileSync('index.html', c);
console.log('ok:', !c.includes('agendamentosPorData=agendamentosPorData||{}'));
