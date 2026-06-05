var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
c = c.replace(
  'Profissional</label>\n          <select><option>Ana Flor',
  'Profissional</label>\n          <select id="ag-prof"><option>Ana Flor'
);
fs.writeFileSync('index.html', c);
console.log('prof:', c.includes('id="ag-prof"'));
