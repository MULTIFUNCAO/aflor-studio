var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Ver o que está no salvarAgendamento depois de criar o objeto novo
var idx = c.indexOf('var novo={id:Date.now()');
console.log('salvar:', JSON.stringify(c.substring(idx, idx + 400)));
