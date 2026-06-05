var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Achar a funcao de navegacao de data e adicionar chamada ao Supabase
var old = 'agendaDataAtual = new Date(agendaDataAtual);\n    agendaDataAtual.setDate(agendaDataAtual.getDate() + delta);\n    renderAgenda();';
if (c.includes(old)) {
  var novo = 'agendaDataAtual = new Date(agendaDataAtual);\n    agendaDataAtual.setDate(agendaDataAtual.getDate() + delta);\n    renderAgenda();\n    if(typeof window.carregarAgendamentosSupa==="function")window.carregarAgendamentosSupa();';
  c = c.replace(old, novo);
  console.log('ok: hook navegacao');
} else {
  // Tentar achar outra variante
  var idx = c.indexOf('setDate(agendaDataAtual.getDate()');
  console.log('pos setDate:', idx);
  if (idx > -1) console.log(JSON.stringify(c.substring(idx-50, idx+100)));
}

fs.writeFileSync('index.html', c);
