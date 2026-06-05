var fs=require('fs');var c=fs.readFileSync('index.html','utf8');var idx=c.indexOf('dados.sinalPago');console.log(JSON.stringify(c.substring(idx-300,idx+200)));
