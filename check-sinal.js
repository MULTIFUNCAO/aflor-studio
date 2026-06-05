var fs=require('fs');var c=fs.readFileSync('index.html','utf8');var idx=c.indexOf('Sinal pago');console.log(JSON.stringify(c.substring(idx-100,idx+100)));
