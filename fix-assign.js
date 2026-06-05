var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var lines = c.split('\n');
// linha 8430 (index 8429) tem "};"  - precisa ser "});"
// mas só dentro do contexto do Object.assign em renderAgenda
// Ver contexto completo
console.log(8428, JSON.stringify(lines[8427]));
console.log(8429, JSON.stringify(lines[8428]));
console.log(8430, JSON.stringify(lines[8429]));
console.log(8431, JSON.stringify(lines[8430]));
