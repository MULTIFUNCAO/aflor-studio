var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Corrigir a chave para usar prof || profissional
var old = 'var chave = (a.prof || a.profissional || "") + ":" + a.hora;';
var novo = 'var profKey = a.prof || a.profissional || "Ana Flor"; var chave = profKey + ":" + a.hora;';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok: chave corrigida');
} else {
  // Tentar a versão original sem o fix anterior
  var old2 = 'var chave = a.prof + ":" + a.hora;';
  if (c.includes(old2)) {
    c = c.replace(old2, 'var profKey = a.prof || a.profissional || "Ana Flor"; var chave = profKey + ":" + a.hora;');
    fs.writeFileSync('index.html', c);
    console.log('ok: chave original corrigida');
  } else {
    console.log('nao achou - mostrar trecho:');
    var idx = c.indexOf('_agendaExtra[chave] = a;');
    console.log(JSON.stringify(c.substring(idx-150, idx+50)));
  }
}
