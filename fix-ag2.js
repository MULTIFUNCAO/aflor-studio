var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Ver o final da função salvarAgendamento
var idx = c.indexOf('function salvarAgendamento(');
var trecho = c.substring(idx, idx + 1200);
// Achar o closeModal dentro dela
var idxClose = trecho.indexOf('closeModal');
console.log(trecho.substring(idxClose - 10, idxClose + 200));
