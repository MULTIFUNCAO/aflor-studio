var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var lines = c.split('\n');
for (var i = 8425; i <= 8433; i++) {
  console.log(i+1, ':', JSON.stringify(lines[i]));
}
