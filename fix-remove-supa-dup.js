var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var idx1 = c.indexOf('supabase.createClient');
var idx2 = c.indexOf('supabase.createClient', idx1+1);

// Pegar o trecho do 2o createClient para remover
var inicio = c.lastIndexOf('\n', idx2);
var fim = c.indexOf(';\n', idx2) + 2;
var trecho = c.substring(inicio, fim);
console.log('removendo:', JSON.stringify(trecho.substring(0,100)));

c = c.substring(0, inicio) + c.substring(fim);
fs.writeFileSync('index.html', c);

// Verificar
var count = (c.match(/supabase\.createClient/g)||[]).length;
console.log('createClient restantes:', count);
