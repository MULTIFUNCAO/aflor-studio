var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Achar a linha corrompida com Object.assign e _novosAgendamentos
var idx = c.indexOf('_novosAgendamentos||[]);_novosAgendamentos.forEach');
if (idx === -1) idx = c.indexOf('_novosAgendamentos||[]');
console.log('pos:', idx);
if (idx > -1) console.log('trecho:', JSON.stringify(c.substring(idx - 20, idx + 200)));
