var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var old = 'window.addEventListener("load", function() {\n  window._supa = supabase.createClient(';
// Substituir addEventListener load por script que aguarda supabase
var idx = c.indexOf('window._supa = supabase.createClient(');
var linha = c.substring(0, idx).split('\n').length;
console.log('createClient na linha:', linha);
