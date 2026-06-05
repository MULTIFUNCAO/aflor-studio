var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'function agendaHoje(){\n  agendaDataAtual=new Date(2026,4,26);';
var novo = 'function agendaHoje(){\n  agendaDataAtual=new Date();';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou - verificar');
}
