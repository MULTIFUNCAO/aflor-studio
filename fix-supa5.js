var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var oldLoad = 'window.carregarAgendamentosSupa = async function(){\n      var r = await window._supa.from("agendamentos").select("*");';
var newLoad = 'window.carregarAgendamentosSupa = async function(){\n      var hoje = agendaDataAtual instanceof Date ? agendaDataAtual : new Date();\n      var dataKey = hoje.getFullYear()+"-"+(String(hoje.getMonth()+1).padStart(2,"0"))+"-"+(String(hoje.getDate()).padStart(2,"0"));\n      var r = await window._supa.from("agendamentos").select("*").eq("data", dataKey);';

if (c.includes(oldLoad)) {
  c = c.replace(oldLoad, newLoad);
  console.log('ok: filtro por data');
} else {
  console.log('nao achou - verificar');
}

fs.writeFileSync('index.html', c);
