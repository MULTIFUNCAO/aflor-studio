var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'window._supa = supabase.createClient(';
var novo = 'window._supa = (typeof supabase !== "undefined") ? supabase.createClient(';

// Encontrar e modificar apenas dentro do addEventListener load
var idx = c.indexOf('window.addEventListener("load", function() {\n  window._supa = supabase.createClient(');
if (idx === -1) {
  idx = c.indexOf('window._supa = supabase.createClient(');
  if (idx !== -1) {
    // Achar o fim dessa linha (fechamento do createClient)
    var fim = c.indexOf('\n', idx);
    var linhaAtual = c.substring(idx, fim);
    console.log('linha atual:', JSON.stringify(linhaAtual));
  }
} else {
  console.log('achou com load');
}
