var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'agendaAtualizarLabel();\n  renderAgenda();\n}\nfunction agendaHoje()';
var novo = 'agendaAtualizarLabel();\n  renderAgenda();\n  if(typeof window.carregarAgendamentosSupa==="function")window.carregarAgendamentosSupa();\n}\nfunction agendaHoje()';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou');
  var idx = c.indexOf('agendaAtualizarLabel');
  console.log(JSON.stringify(c.substring(idx, idx+150)));
}
