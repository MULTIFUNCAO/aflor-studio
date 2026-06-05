var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = '  // Atualizar localmente\n  if (window._agendaExtra) {\n    var chave = dados.prof + ":" + dados.hora;\n    if (window._agendaExtra[chave]) {\n      Object.assign(window._agendaExtra[chave], novosDados);\n    }\n  }';

var novo = '  // Atualizar localmente\n  if (window._agendaExtra) {\n    var chaveAntiga = dados.prof + ":" + dados.hora;\n    var novaHora = novosDados.hora || dados.hora;\n    var chaveNova = dados.prof + ":" + novaHora;\n    // Remover chave antiga se hora mudou\n    if (chaveAntiga !== chaveNova && window._agendaExtra[chaveAntiga]) {\n      delete window._agendaExtra[chaveAntiga];\n    }\n    // Salvar com nova chave\n    window._agendaExtra[chaveNova] = Object.assign({}, dados, novosDados);\n  }';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou');
}
