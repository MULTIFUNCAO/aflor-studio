var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Ver o que está no salvarAgendamento após criar o objeto novo
var idx = c.indexOf('var novo={id:Date.now()');
var trecho = c.substring(idx, idx + 600);
console.log(trecho);
