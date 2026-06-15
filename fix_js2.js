var fs=require('fs');
var h=fs.readFileSync('index.html','utf8');

var novasFuncoes=`
function agSetTipo(tipo){
  var bS=document.getElementById('ag-tipo-servico');
  var bP=document.getElementById('ag-tipo-pacote');
  var bkS=document.getElementById('ag-bloco-servico');
  var bkP=document.getElementById('ag-bloco-pacote');
  if(tipo==='servico'){
    if(bS){bS.style.background='#111';bS.style.color='#fff';bS.style.borderColor='#111';}
    if(bP){bP.style.background='#fff';bP.style.color='#333';bP.style.borderColor='#ddd';}
    if(bkS)bkS.style.display='';
    if(bkP)bkP.style.display='none';
  } else {
    if(bS){bS.style.background='#fff';bS.style.color='#333';bS.style.borderColor='#ddd';}
    if(bP){bP.style.background='#111';bP.style.color='#fff';bP.style.borderColor='#111';}
    if(bkS)bkS.style.display='none';
    if(bkP)bkP.style.display='';
  }
  window._agTipo=tipo;
}
function agFiltrarServicos(){
  var catSel=document.getElementById('ag-cat');
  if(catSel&&catSel.options.length<=1){
    var cats=[...new Set(servicos.map(function(s){return s.cat;}))].sort();
    cats.forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;catSel.appendChild(o);});
  }
  var cat=(catSel||{}).value||'';
  var sel=document.getElementById('ag-servico');
  if(!sel)return;
  var filtrados=cat?servicos.filter(function(s){return s.cat===cat;}):servicos;
  sel.innerHTML=filtrados.map(function(s){return'<option value="'+parseFloat(s.preco.replace(',','.'))+'">'+ s.nome+' \u2014 R$ '+s.preco+'</option>';}).join('');
  if(!sel.innerHTML)sel.innerHTML='<option value="0">Nenhum servico nessa categoria</option>';
  agCalcSinal();
}
function agAddProduto(){
  var lista=document.getElementById('ag-produtos-list');
  if(!lista)return;
  var div=document.createElement('div');
  div.style.cssText='display:flex;gap:6px;align-items:center';
  var select=document.createElement('select');
  select.style.cssText='flex:1;padding:7px 10px;border:1.5px solid #e5e5e5;border-radius:8px;font-size:12px';
  select.innerHTML='<option value="">— Selecionar produto —</option>'+produtos.map(function(p){return'<option>'+p.nome+'</option>';}).join('');
  var btn=document.createElement('button');
  btn.type='button';btn.textContent='x';
  btn.style.cssText='padding:4px 8px;border:1px solid #e5e5e5;border-radius:6px;background:#fff;cursor:pointer;font-size:12px;color:#888';
  btn.onclick=function(){lista.removeChild(div);};
  div.appendChild(select);div.appendChild(btn);lista.appendChild(div);
}
function abrirModalAgendar(data,hora,prof){
  var cli=document.getElementById('ag-cliente');if(cli)cli.value='';
  var obs=document.getElementById('ag-obs');if(obs)obs.value='';
  var sinalCk=document.getElementById('ag-sinal-ativo');if(sinalCk){sinalCk.checked=false;agToggleSinal();}
  var prodList=document.getElementById('ag-produtos-list');if(prodList)prodList.innerHTML='';
  var hoje=new Date();
  var elData=document.getElementById('ag-data');
  if(elData)elData.value=data||(hoje.getFullYear()+'-'+String(hoje.getMonth()+1).padStart(2,'0')+'-'+String(hoje.getDate()).padStart(2,'0'));
  var elHora=document.getElementById('ag-hora');if(elHora)elHora.value=hora||'09:00';
  var elProf=document.getElementById('ag-prof');if(elProf&&prof)elProf.value=prof;
  agSetTipo('servico');
  var catSel=document.getElementById('ag-cat');if(catSel)catSel.innerHTML='<option value="">— Todas —</option>';
  agFiltrarServicos();
  openModal('modal-agendar');
}
`;

h=h.replace('function agToggleSinal()', novasFuncoes+'\nfunction agToggleSinal()');
fs.writeFileSync('index.html',h);
console.log('agSetTipo?', h.includes('function agSetTipo'));
console.log('agAddProduto?', h.includes('function agAddProduto'));
console.log('agFiltrarServicos?', h.includes('function agFiltrarServicos'));
console.log('abrirModalAgendar?', h.includes('function abrirModalAgendar'));
