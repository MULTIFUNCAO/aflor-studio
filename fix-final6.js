var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var idx = c.indexOf(' var agendamentosPorData = Object.assign({');
var trecho = c.substring(idx, idx + 4000);
var idxFecha = trecho.indexOf('});\n');
var posAbsoluta = idx + idxFecha + 4; // após });\n

var merge = '    (window._novosAgendamentos||[]).forEach(function(a){if(a.data){agendamentosPorData[a.data]=agendamentosPorData[a.data]||[];agendamentosPorData[a.data].push(a);}});\n';

// Verificar se já existe
if (c.includes('_novosAgendamentos||[]).forEach')) {
  console.log('merge ja existe, nao inserindo');
} else {
  c = c.substring(0, posAbsoluta) + merge + c.substring(posAbsoluta);
  fs.writeFileSync('index.html', c);
  console.log('ok: merge adicionado');
}
