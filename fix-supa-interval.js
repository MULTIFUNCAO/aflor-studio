var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'window.addEventListener(\"load\", function() {\n  window._supa = supabase.createClient(';
var novo = 'window.addEventListener(\"load\", function() {\n  var _initSupa = setInterval(function(){ if(typeof supabase === "undefined") return; clearInterval(_initSupa); window._supa = supabase.createClient(';

// Encontrar o fechamento do createClient para fechar o interval
if (c.includes(old)) {
  c = c.replace(old, novo);
  // Agora fechar o setInterval após o createClient - achar ");\n  setTimeout"
  c = c.replace('window._supa = supabase.createClient(\n' , 'PLACEHOLDER');
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou - tentando variante');
  var idx = c.indexOf('window._supa = supabase.createClient(');
  console.log('linha:', c.substring(0,idx).split('\n').length);
  console.log('contexto:', JSON.stringify(c.substring(idx-60,idx+100)));
}
