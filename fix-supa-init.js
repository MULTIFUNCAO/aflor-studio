var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Achar o trecho exato do script inline do _supa
var idx = c.indexOf('\nvar _supa = supabase.createClient(');
if (idx === -1) { console.log('nao achou variante 1'); process.exit(); }

// Pegar até o fim do fechamento do createClient (fecha com ");")
var fim = c.indexOf(');\n', idx) + 3;
var trechoAntigo = c.substring(idx, fim);
console.log('removendo:', JSON.stringify(trechoAntigo.substring(0,80)));

// Remover do lugar atual
c = c.split(trechoAntigo).join('');

// Injetar dentro do addEventListener load, logo após "setTimeout(carregarAgendamentosSupa, 1000);"
var anchor = 'setTimeout(carregarAgendamentosSupa, 1000);';
var novaLinha = trechoAntigo.trim();
c = c.replace(anchor, 'window._supa = supabase.createClient(' + c.match(/supabase\.createClient\(([^;]+)\)/)?.[1] + ');\n  ' + anchor);

fs.writeFileSync('index.html', c);
console.log('ok');
