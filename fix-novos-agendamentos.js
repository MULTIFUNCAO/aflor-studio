var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'window._supaAgendamentos = data || [];';
var novo = 'window._supaAgendamentos = data || [];\n      window._novosAgendamentos = data || [];';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou');
}
