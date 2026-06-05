var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Substituir usando split/join para evitar problemas com \r\n
var idx = c.indexOf('window._supa = supabase.createClient(');
if (idx === -1) { console.log('nao achou'); process.exit(); }

// Inserir verificacao antes do createClient
var before = c.substring(0, idx);
var after = c.substring(idx);

// Achar o inicio do addEventListener load antes do _supa
var loadIdx = before.lastIndexOf('window.addEventListener');
console.log('load em linha:', before.split('\n').length);

// Inserir a funcao _initSupabase antes do window._supa
var insert = 'if (typeof supabase === "undefined") { setTimeout(function(){ if(window._supa) return; carregarAgendamentosSupa(); }, 2000); } else { ';
var closeInsert = ' }';

c = before + insert + after;

// Fechar o bloco else depois do setTimeout(carregarAgendamentosSupa, 1000)
c = c.split('setTimeout(carregarAgendamentosSupa, 1000);').join('setTimeout(carregarAgendamentosSupa, 1000)' + closeInsert + ';');

fs.writeFileSync('index.html', c);
console.log('ok');
