var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Achar o closeModal('modal-agendar') dentro da função salvarAgendamento
var idx = c.indexOf("closeModal('modal-agendar')");
// Ver contexto
console.log(JSON.stringify(c.substring(idx - 300, idx + 100)));
