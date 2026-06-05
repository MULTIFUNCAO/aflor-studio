var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var lines = c.split('\n');
for (var i = 8408; i <= 8420; i++) {
  console.log(i+1, ':', lines[i]);
}
