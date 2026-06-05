var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = "const grid=document.getElementById('agenda-grid');";
var novo = "(window._novosAgendamentos||[]).forEach(function(a){if(a&&a.data){agendamentosPorData[a.data]=agendamentosPorData[a.data]||[];agendamentosPorData[a.data].push(a);}});\n    const grid=document.getElementById('agenda-grid');";

c = c.replace(old, novo);
fs.writeFileSync('index.html', c);
console.log('ok:', c.includes('_novosAgendamentos||[]).forEach'));
