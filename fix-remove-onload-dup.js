var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Achar o script que começa com s.onload = function(){ window.carregarAgendamentosSupa
var marker = 's.onload = function(){    window.carregarAgendamentosSupa = async function(){';
var idx = c.indexOf(marker);
if (idx === -1) {
  // Tentar variante com espacos diferentes
  idx = c.indexOf('s.onload = function()');
  console.log('marker alternativo em linha:', c.substring(0,idx).split('\n').length);
  // Pegar o bloco <script> que contém isso
  var scriptStart = c.lastIndexOf('<script>', idx);
  var scriptEnd = c.indexOf('</script>', idx) + 9;
  var trecho = c.substring(scriptStart, scriptEnd);
  console.log('trecho len:', trecho.length);
  console.log('inicio:', JSON.stringify(trecho.substring(0,100)));
  // Remover
  c = c.substring(0, scriptStart) + c.substring(scriptEnd);
  fs.writeFileSync('index.html', c);
  console.log('ok: script removido');
} else {
  console.log('achou marker exato');
}
