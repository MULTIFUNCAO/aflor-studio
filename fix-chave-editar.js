var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'var chaveAntiga = dados.prof + ":" + dados.hora;\n    var novaHora = novosDados.hora || dados.hora;\n    var chaveNova = dados.prof + ":" + novaHora;';
var novo = 'var profKey = dados.prof || dados.profissional || "Ana Flor";\n    var chaveAntiga = profKey + ":" + dados.hora;\n    var novaHora = novosDados.hora || dados.hora;\n    var chaveNova = profKey + ":" + novaHora;';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou');
}
