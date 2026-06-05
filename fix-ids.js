var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

c = c.replace(
  '<label>Data</label><input type="date"',
  '<label>Data</label><input id="ag-data" type="date"'
);
c = c.replace(
  '<label>Horário</label><input type="time"',
  '<label>Horário</label><input id="ag-hora" type="time"'
);
c = c.replace(
  '<label>Profissional</label>\n          <select>',
  '<label>Profissional</label>\n          <select id="ag-prof">'
);
// Serviço - select após profissional
var idxServ = c.indexOf('id="ag-prof"');
var apos = c.substring(idxServ, idxServ + 500);
var idxSelect2 = apos.indexOf('<select>', 10);
c = c.substring(0, idxServ + idxSelect2) + '<select id="ag-servico">' + c.substring(idxServ + idxSelect2 + 8);

fs.writeFileSync('index.html', c);
console.log('data:', c.includes('id="ag-data"'));
console.log('hora:', c.includes('id="ag-hora"'));
console.log('prof:', c.includes('id="ag-prof"'));
console.log('serv:', c.includes('id="ag-servico"'));
