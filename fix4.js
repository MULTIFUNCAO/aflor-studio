var fs=require('fs');
var c=fs.readFileSync('index.html','utf8');
// page-fluxo precisa ser escondido quando não está ativo
// O showPage já faz isso mas vamos garantir
var idx=c.indexOf('#page-fluxo');
if(idx>-1) console.log('css page-fluxo:',c.substring(idx,idx+100));
else console.log('sem css #page-fluxo');
// Ver se page-fluxo tem position absolute ou fixed
var idx2=c.indexOf('page-fluxo');
console.log('primeira ocorrencia:',c.substring(idx2,idx2+80));
