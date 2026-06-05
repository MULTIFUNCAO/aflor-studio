var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Substituir a inicializacao do _supa para aguardar o CDN
var old = 'window.addEventListener("load", function() {\n  window._supa = supabase.createClient(';
var novo = 'window.addEventListener("load", function() {\n  function _initSupabase() { if (typeof supabase === "undefined") { setTimeout(_initSupabase, 100); return; } window._supa = supabase.createClient(';

if (c.includes(old)) {
  c = c.replace(old, novo);
  // Agora fechar a função _initSupabase após o createClient e antes do setTimeout(carregarAgendamentosSupa
  c = c.replace(
    ');;\n  setTimeout(carregarAgendamentosSupa',
    '); }\n  _initSupabase();\n  setTimeout(carregarAgendamentosSupa'
  );
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou - ver trecho:');
  var idx = c.indexOf('window._supa = supabase.createClient');
  console.log(JSON.stringify(c.substring(idx-60, idx+50)));
}
