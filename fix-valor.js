var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = "valor:'R$ 0,00'";
var novo = "valor:'R$ '+(servicoSel.options[servicoSel.selectedIndex].value||'0')+',00'";

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou');
}
