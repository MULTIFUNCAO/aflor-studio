var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = ' var agendamentosPorData = Object.assign({';
var novo = ' var agendamentosPorData = Object.assign({';
// Achar o fechamento do Object.assign (o }, {}) e adicionar merge depois
var idx = c.indexOf(old);
// Ver o que vem depois para achar onde o assign termina
console.log(JSON.stringify(c.substring(idx, idx + 100)));
