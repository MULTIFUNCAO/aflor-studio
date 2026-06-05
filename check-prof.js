var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var idx = c.indexOf('var novo={id:Date.now()');
console.log(c.substring(idx - 200, idx + 50));
