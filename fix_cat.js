var fs=require('fs');
var h=fs.readFileSync('index.html','utf8');

// Substituir o select de categoria hardcoded por um vazio (populado via JS)
h=h.replace(
  /<select id="ag-cat" onchange="agFiltrarServicos\(\)"[^>]*>[\s\S]*?<\/select>/,
  '<select id="ag-cat" onchange="agFiltrarServicos()" style="margin-bottom:8px"><option value="">Todas as categorias</option></select>'
);

console.log('select limpo?', !h.includes('<option>Manicure</option>'));
fs.writeFileSync('index.html',h);
