var fs=require('fs');
var h=fs.readFileSync('index.html','utf8');

// Verificar o que tem
console.log('agSetTipo definida?', h.includes('function agSetTipo'));
console.log('agAddProduto definida?', h.includes('function agAddProduto'));
console.log('agFiltrarServicos definida?', h.includes('function agFiltrarServicos'));
console.log('abrirModalAgendar definida?', h.includes('function abrirModalAgendar'));
