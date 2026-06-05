var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// 1. Declarar array global logo após <script>
var tagScript = c.indexOf('<script>');
if (tagScript === -1) tagScript = c.indexOf('<script ');
var posInsert = c.indexOf('\n', tagScript) + 1;
var globalDecl = 'var _agendamentosLocal = [];\n';
if (!c.includes('_agendamentosLocal')) {
  c = c.substring(0, posInsert) + globalDecl + c.substring(posInsert);
  console.log('array global adicionado');
}

// 2. Ver o conteúdo atual de salvarAgendamento para saber onde injetar
var idxFn = c.indexOf('function salvarAgendamento(');
var trecho = c.substring(idxFn, idxFn + 800);
console.log('--- salvarAgendamento ---');
console.log(trecho);
fs.writeFileSync('index.html', c);
