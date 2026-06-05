var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'var chave = a.prof + ":" + a.hora;';
var novo = 'var chave = (a.prof || a.profissional || "") + ":" + a.hora;';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou');
}
