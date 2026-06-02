var fs=require('fs');
var c=fs.readFileSync('index.html','utf8');
var iF=c.indexOf('id="page-fluxo"');
var iS=c.indexOf('id="page-servicos"');
var trecho=c.substring(iF,iS);
var abre=(trecho.match(/<div/g)||[]).length;
var fecha=(trecho.match(/<\/div>/g)||[]).length;
var falta=abre-fecha;
console.log('faltam:',falta);
if(falta>0){
  var fechas='';
  for(var i=0;i<falta;i++) fechas+='</div>\n';
  c=c.replace('<!-- SERVI', fechas+'<!-- SERVI');
  fs.writeFileSync('index.html',c);
  console.log('corrigido');
}
