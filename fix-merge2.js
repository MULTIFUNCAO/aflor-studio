var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Remover o merge inserido errado
var merge = '    (window._novosAgendamentos||[]).forEach(function(a){if(a&&a.data){agendamentosPorData[a.data]=agendamentosPorData[a.data]||[];agendamentosPorData[a.data].push(a);}});\n';
c = c.replace(merge, '');

// Agora inserir DEPOIS de "// Agendamentos por data" e DEPOIS do Object.assign completo
// Achar a linha com "const grid=document.getElementById" dentro de renderAgenda - logo após o assign
var idxFn = c.indexOf('function renderAgenda(');
var trecho = c.substring(idxFn, idxFn + 6000);
var idxGrid = trecho.indexOf('const grid=document.getElementById');
if (idxGrid === -1) idxGrid = trecho.indexOf('var grid=document.getElementById');
console.log('grid pos:', idxGrid);
console.log('contexto:', JSON.stringify(trecho.substring(idxGrid - 30, idxGrid + 50)));
fs.writeFileSync('index.html', c);
