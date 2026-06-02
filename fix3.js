var fs=require('fs');
var c=fs.readFileSync('index.html','utf8');
var iS=c.indexOf('id="page-servicos"');
console.log(c.substring(iS-300,iS+30));
