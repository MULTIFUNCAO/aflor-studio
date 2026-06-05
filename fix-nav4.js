var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var idx = c.indexOf('agendaAtualizarLabel');
var end = c.indexOf('renderAgenda();', idx) + 15;

var blocoAtual = c.substring(idx, end);
var blocoNovo = blocoAtual + '\n  if(typeof window.carregarAgendamentosSupa==="function")window.carregarAgendamentosSupa();';

c = c.substring(0, idx) + blocoNovo + c.substring(end);
fs.writeFileSync('index.html', c);
console.log('ok');
