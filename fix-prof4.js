var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var old = "var prof=document.getElementById('ag-prof')?.value;";
var novo = "var profSel=document.querySelector('#modal-agendar select');var prof=profSel?profSel.value:'';";
c = c.replace(old, novo);
fs.writeFileSync('index.html', c);
console.log('ok:', c.includes('querySelector'));
