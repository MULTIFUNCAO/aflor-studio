var fs=require('fs');var c=fs.readFileSync('index.html','utf8');var idx=c.indexOf('SINAL / ENTRADA');console.log(JSON.stringify(c.substring(idx-50,idx+400)));
