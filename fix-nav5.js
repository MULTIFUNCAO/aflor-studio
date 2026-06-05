var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'window.carregarAgendamentosSupa = async function(){\n      window._agendaExtra = {};';
var novo = 'window.carregarAgendamentosSupa = async function(){\n      window._agendaExtra = {};\n      renderAgenda();';

c = c.replace(old, novo);
fs.writeFileSync('index.html', c);
console.log('ok:', c.includes('window._agendaExtra = {};\n      renderAgenda();'));
