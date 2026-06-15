var fs=require('fs');
var h=fs.readFileSync('index.html','utf8');
h=h.replace(/onclick="openModal\('modal-agendar'\)"/g,'onclick="abrirModalAgendar()"');
h=h.replace(/onclick='openModal\(\\'modal-agendar\\'\)'/g,"onclick='abrirModalAgendar()'");
fs.writeFileSync('index.html',h);
console.log('abrirModalAgendar count:', (h.match(/abrirModalAgendar/g)||[]).length);
