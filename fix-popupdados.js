var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'abrirAgendaPopup(key,dados,event){\n  // Fechar popup anterior\n  fecharAgendaPopup();';
var novo = 'abrirAgendaPopup(key,dados,event){\n  window._agendaPopupDados = dados;\n  // Fechar popup anterior\n  fecharAgendaPopup();';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou - verificar');
}
