var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = '<meta charset="UTF-8">';
var novo = '<meta charset="UTF-8">\n<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou meta charset');
}
