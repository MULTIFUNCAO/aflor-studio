var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 's.onload = function(){    window.carregarAgendamentosSupa = async function(){';
// Tentar achar o s.onload com carregarAgendamentosSupa
var idx = c.indexOf('s.onload = function()');
if (idx === -1) { console.log('nao achou s.onload'); process.exit(); }
console.log('achou em:', c.substring(0,idx).split('\n').length);

// Ver o contexto completo
console.log(JSON.stringify(c.substring(idx, idx+200)));
