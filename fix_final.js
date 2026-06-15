var fs=require('fs');
var h=fs.readFileSync('index.html','utf8');

// 1. Adicionar renderRemuneracoes no showPage
if(!h.includes("if(id==='remuneracoes')renderRemuneracoes()")){
  h=h.replace(
    "if(id==='agenda')renderAgenda();",
    "if(id==='agenda')renderAgenda();\n    if(id==='remuneracoes')renderRemuneracoes();"
  );
}

// 2. Adicionar ag-bloco-servico no modal se não existir
if(!h.includes('ag-bloco-servico')){
  h=h.replace(
    /<select id="ag-cat"[^>]*>[\s\S]*?<\/select>/,
    function(m){
      return m; // já vai ser incluído abaixo
    }
  );
  // Substituir o select de serviço simples pelo bloco completo
  h=h.replace(
    /(<div class="form-group"><label>Servi[^<]*<\/label>\s*)<select id="ag-servico"/,
    '<div id="ag-bloco-servico"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div class="form-group"><label>Categoria<\/label><select id="ag-cat" onchange="agFiltrarServicos()"><option value="">— Todas —<\/option><\/select><\/div>$1<select id="ag-servico"'
  );
}

fs.writeFileSync('index.html',h);
console.log('renderRemuneracoes:', h.includes("if(id==='remuneracoes')renderRemuneracoes()"));
console.log('linhas:', h.split('\n').length);
