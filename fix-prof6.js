var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var idx = c.indexOf('var novo={id:Date.now()');
console.log(JSON.stringify(c.substring(idx - 400, idx)));
