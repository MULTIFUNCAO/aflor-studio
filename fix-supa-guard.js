var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'async function carregarAgendamentosSupa() {\n  try {';
var novo = 'async function carregarAgendamentosSupa() {\n  if (!window._supa) { setTimeout(carregarAgendamentosSupa, 500); return; }\n  try {';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou - verificar');
  var idx = c.indexOf('carregarAgendamentosSupa');
  console.log(JSON.stringify(c.substring(idx, idx+80)));
}
