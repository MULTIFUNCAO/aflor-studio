var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Ver linha 8429 aproximadamente
var lines = c.split('\n');
console.log('linha 8427:', lines[8426]);
console.log('linha 8428:', lines[8427]);
console.log('linha 8429:', lines[8428]);
console.log('linha 8430:', lines[8429]);
