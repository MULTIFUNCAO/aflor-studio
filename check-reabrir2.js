var fs=require('fs');var c=fs.readFileSync('index.html','utf8');var idx=c.indexOf('function reabrirRetorno');console.log(idx===-1?'NAO EXISTE':JSON.stringify(c.substring(idx,idx+300)));
