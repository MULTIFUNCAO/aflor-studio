var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var lines = c.split('\n');
lines[8429] = '  });';
c = lines.join('\n');
fs.writeFileSync('index.html', c);
console.log('ok:', lines[8429]);
