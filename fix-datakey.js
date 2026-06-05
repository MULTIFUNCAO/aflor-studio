var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Converter dataKey para formato ISO (YYYY-MM-DD) igual ao Supabase
var old = "dataKey=d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();";
var novo = "dataKey=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');";

if (c.includes(old)) {
  c = c.split(old).join(novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou - ver trecho:');
  var idx = c.indexOf('dataKey=d.getDate');
  console.log(JSON.stringify(c.substring(idx, idx+80)));
}
