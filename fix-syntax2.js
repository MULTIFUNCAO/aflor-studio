var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var lines = c.split('\n');
// Achar linha com _novosAgendamentos||[]).forEach
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('_novosAgendamentos||[]).forEach')) {
    console.log('linha', i+1, ':', lines[i]);
    console.log('anterior:', lines[i-1]);
    console.log('posterior:', lines[i+1]);
  }
}
