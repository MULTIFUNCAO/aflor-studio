var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Ao chamar carregarAgendamentosSupa, limpar _agendaExtra primeiro
var old = 'window.carregarAgendamentosSupa = async function(){';
var novo = 'window.carregarAgendamentosSupa = async function(){\n      window._agendaExtra = {};';

c = c.replace(old, novo);
console.log('ok:', c.includes('window._agendaExtra = {};'));
fs.writeFileSync('index.html', c);
