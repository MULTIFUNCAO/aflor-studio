var fs=require('fs');
var h=fs.readFileSync('index.html','utf8');
h=h.replace(
  /function abrirModalAgendar\(prof,hora\)\{/,
  'function abrirModalAgendar(prof,hora){\n  var catSel=document.getElementById(\'ag-cat\');if(catSel)catSel.innerHTML=\'<option value="">Todas as categorias</option>\';\n  agFiltrarServicos();'
);
fs.writeFileSync('index.html',h);
console.log('ok:', h.includes('agFiltrarServicos();\n  var'));
