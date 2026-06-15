const fs = require('fs');
const path = require('path');

const file = path.join(process.env.HOME, 'Downloads', 'aflor-repo-novo', 'index.html');
let html = fs.readFileSync(file, 'utf8');

// 1. CSS mobile
const oldMedia = '@media(max-width:900px){\n  .cards-grid{grid-template-columns:1fr 1fr}\n}';
if (html.includes(oldMedia)) {
  html = html.replace(oldMedia, oldMedia + `
@media(max-width:640px){
  .main-content{padding:12px 10px 80px!important}
  .cards-grid{grid-template-columns:1fr!important}
  .page-header{flex-direction:column;align-items:flex-start;gap:10px}
  table{font-size:12px}
  th,td{padding:8px 6px!important}
  .modal{width:95vw!important;max-width:95vw!important}
  .form-grid{grid-template-columns:1fr!important}
  .form-group.full,.form-group{grid-column:1/-1!important}
  .hide-mobile{display:none!important}
}`);
  console.log('✅ CSS mobile OK');
} else { console.log('⚠️ CSS media não encontrado'); }

// 2. openModal
const oldOpen = "function openModal(id){document.getElementById(id).classList.add('open')}";
if (html.includes(oldOpen)) {
  html = html.replace(oldOpen, `function openModal(id){
  document.getElementById(id).classList.add('open');
  if(id==='modal-agendar')setTimeout(agInicializar,10);
  if(id==='modal-pacote'){setTimeout(function(){pktAba('template');var s=document.getElementById('pkt-srv-0');if(s)s.innerHTML=servicos.map(function(x){return'<option>'+x.nome+' — R$ '+x.preco+'</option>';}).join('');},10);}
}`);
  console.log('✅ openModal OK');
} else { console.log('⚠️ openModal não encontrado'); }

// 3. Substituir o select de serviço fixo por dinâmico (dentro do modal-agendar)
// Procura o bloco da modal pelo id e substitui os selects fixos
html = html.replace(
  /<div class="form-group"><label>Profissional<\/label>\s*<select><option>Ana Flor<\/option><option>Edu<\/option><option>Jeny<\/option><option>Vi<\/option><option>Lara<\/option><option>Angélica<\/option><\/select>\s*<\/div>\s*<div class="form-group"><label>Serviço<\/label>\s*<select id="ag-servico" onchange="agCalcSinal\(\)">[\s\S]*?<\/select>\s*<\/div>/,
  `<div class="form-group full"><label>Profissional</label>
        <select id="ag-profissional"><option>Ana Flor</option><option>Edu</option><option>Jeny</option><option>Vi</option></select>
      </div>
      <div class="form-group full">
        <label>Tipo de Agendamento</label>
        <div style="display:flex;gap:8px">
          <label style="flex:1;display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 14px;border:2px solid #111;border-radius:10px" id="tipo-servico-lbl">
            <input type="radio" name="ag-tipo" value="servico" checked onchange="agTipoChange()" style="accent-color:#111"/>
            <span style="font-size:13px;font-weight:700">✂️ Serviço</span>
          </label>
          <label style="flex:1;display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 14px;border:2px solid #e5e5e5;border-radius:10px" id="tipo-pacote-lbl">
            <input type="radio" name="ag-tipo" value="pacote" onchange="agTipoChange()" style="accent-color:#111"/>
            <span style="font-size:13px;font-weight:700">🎁 Pacote</span>
          </label>
        </div>
      </div>
      <div id="ag-area-servico" style="display:contents">
        <div class="form-group"><label>Categoria</label>
          <select id="ag-categoria" onchange="agFiltrarServicos()"><option value="">— Todas —</option></select>
        </div>
        <div class="form-group"><label>Serviço</label>
          <select id="ag-servico" onchange="agCalcSinal()"></select>
        </div>
      </div>
      <div id="ag-area-pacote" class="form-group full" style="display:none">
        <label>Pacote do Cliente</label>
        <select id="ag-pacote-select" onchange="agPacoteChange()"><option value="">— selecione o pacote —</option></select>
        <div id="ag-pacote-info" style="display:none;margin-top:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px">
          <div style="font-size:12px;color:#15803d;font-weight:700" id="ag-pacote-sessoes">Sessões disponíveis: —</div>
          <div style="font-size:11px;color:#666;margin-top:2px">1 sessão será descontada. <strong>Não cobra na comanda.</strong></div>
        </div>
      </div>
      <div class="form-group full">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <label style="margin:0">🧴 Produtos Usados</label>
          <button type="button" class="btn btn-outline btn-sm" onclick="agAddProduto()">+ Adicionar</button>
        </div>
        <div id="ag-produtos-lista" style="display:flex;flex-direction:column;gap:6px"></div>
      </div>`
);
console.log('✅ Modal agendamento campos dinâmicos OK');

// 4. Adicionar forma de pagamento no sinal (após "Status do sinal")
html = html.replace(
  '<div style="font-size:13px;font-weight:800;color:#111">💰 Sinal / Entrada</div>',
  '<div style="font-size:13px;font-weight:800;color:#111" id="ag-sinal-bloco-title">💰 Sinal / Entrada</div>'
);

// Adicionar PIX/Dinheiro/Link antes do Status do sinal
html = html.replace(
  '<!-- Status do sinal -->\n            <div style="margin-top:10px">\n              <label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:6px">Status do sinal</label>',
  `<div style="margin-top:10px">
              <label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:6px">Forma de pagamento</label>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <label style="display:flex;align-items:center;gap:5px;cursor:pointer;padding:7px 10px;border:1.5px solid #e5e5e5;border-radius:8px">
                  <input type="radio" name="ag-sinal-forma" value="pix" checked style="accent-color:#111"/><span style="font-size:12px;font-weight:600">PIX</span>
                </label>
                <label style="display:flex;align-items:center;gap:5px;cursor:pointer;padding:7px 10px;border:1.5px solid #e5e5e5;border-radius:8px">
                  <input type="radio" name="ag-sinal-forma" value="dinheiro" style="accent-color:#111"/><span style="font-size:12px;font-weight:600">💵 Dinheiro</span>
                </label>
                <label style="display:flex;align-items:center;gap:5px;cursor:pointer;padding:7px 10px;border:1.5px solid #e5e5e5;border-radius:8px">
                  <input type="radio" name="ag-sinal-forma" value="link" style="accent-color:#111"/><span style="font-size:12px;font-weight:600">🔗 Link</span>
                </label>
              </div>
            </div>
            <!-- Status do sinal -->
            <div style="margin-top:10px">
              <label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:6px">Status do sinal</label>`
);
console.log('✅ Forma de pagamento sinal OK');

// 5. Substituir salvarAgendamento
const oldSalvar = `function salvarAgendamento(){
  var cliente=document.getElementById('ag-cliente')?.value||'Cliente';
  var sinalAtivo=document.getElementById('ag-sinal-ativo')?.checked;
  var sinalStatus=document.querySelector('input[name="ag-sinal-status"]:checked')?.value||'pendente';
  var sinalAgora=document.getElementById('ag-sinal-agora')?.textContent||'R$ 0,00';
  closeModal('modal-agendar');
  var msg='✅ Agendamento confirmado para '+cliente+'!';
  if(sinalAtivo)msg+=' Sinal: '+sinalAgora+(sinalStatus==='pago'?' ✅ pago':' ⏳ pendente');
  showAlert(msg);
}
// ===== FIM AGENDAMENTO =====`;

if (html.includes(oldSalvar)) {
  html = html.replace(oldSalvar, `// ===== AGENDAMENTO MELHORADO =====
function agInicializar(){
  var hoje=new Date();
  var elD=document.getElementById('ag-data');
  if(elD)elD.value=hoje.toISOString().split('T')[0];
  var cats=[...new Set(servicos.map(function(s){return s.cat;}))].sort();
  var catSel=document.getElementById('ag-categoria');
  if(catSel)catSel.innerHTML='<option value="">— Todas —</option>'+cats.map(function(c){return'<option value="'+c+'">'+c+'</option>';}).join('');
  agFiltrarServicos();
  var lista=document.getElementById('ag-produtos-lista');if(lista)lista.innerHTML='';
  var radS=document.querySelector('input[name="ag-tipo"][value="servico"]');
  if(radS){radS.checked=true;agTipoChange();}
  var ck=document.getElementById('ag-sinal-ativo');if(ck){ck.checked=false;agToggleSinal();}
  var obs=document.getElementById('ag-obs');if(obs)obs.value='';
  var cli=document.getElementById('ag-cliente');if(cli)cli.value='';
}
function agFiltrarServicos(){
  var cat=document.getElementById('ag-categoria')?.value||'';
  var filtrados=cat?servicos.filter(function(s){return s.cat===cat;}):servicos;
  var sel=document.getElementById('ag-servico');if(!sel)return;
  sel.innerHTML=filtrados.map(function(s){return'<option value="'+parseFloat(s.preco.replace(',','.'))+'">'+s.nome+' — R$ '+s.preco+'</option>';}).join('');
  agCalcSinal();
}
function agTipoChange(){
  var tipo=document.querySelector('input[name="ag-tipo"]:checked')?.value||'servico';
  var aS=document.getElementById('ag-area-servico');
  var aP=document.getElementById('ag-area-pacote');
  var sB=document.querySelector('#modal-agendar .form-group.full:last-of-type');
  if(tipo==='pacote'){if(aS)aS.style.display='none';if(aP)aP.style.display='block';agCarregarPacotesCliente();}
  else{if(aS)aS.style.display='contents';if(aP)aP.style.display='none';}
  var lbl1=document.getElementById('tipo-servico-lbl');var lbl2=document.getElementById('tipo-pacote-lbl');
  if(lbl1)lbl1.style.borderColor=tipo==='servico'?'#111':'#e5e5e5';
  if(lbl2)lbl2.style.borderColor=tipo==='pacote'?'#111':'#e5e5e5';
}
function agCarregarPacotesCliente(){
  var vendidos=JSON.parse(localStorage.getItem('pacotes_vendidos')||'[]');
  var sel=document.getElementById('ag-pacote-select');if(!sel)return;
  if(!vendidos.length){sel.innerHTML='<option value="">Nenhum pacote vendido ainda</option>';return;}
  sel.innerHTML='<option value="">— selecione —</option>'+vendidos.map(function(v,i){
    var r=(v.sessoesTotal||1)-(v.sessoesUsadas||0);
    return'<option value="'+i+'">'+v.cliente+' — '+v.nome+' ('+r+' sessões)</option>';
  }).join('');
}
function agPacoteChange(){
  var sel=document.getElementById('ag-pacote-select');var info=document.getElementById('ag-pacote-info');var txt=document.getElementById('ag-pacote-sessoes');
  if(!sel||!info)return;
  var idx=parseInt(sel.value);if(isNaN(idx)){info.style.display='none';return;}
  var vendidos=JSON.parse(localStorage.getItem('pacotes_vendidos')||'[]');
  var pkt=vendidos[idx];if(!pkt){info.style.display='none';return;}
  var r=(pkt.sessoesTotal||1)-(pkt.sessoesUsadas||0);
  info.style.display='block';if(txt)txt.textContent='Sessões disponíveis: '+r+' de '+(pkt.sessoesTotal||1);
}
function agAddProduto(){
  var lista=document.getElementById('ag-produtos-lista');if(!lista)return;
  var div=document.createElement('div');div.style.cssText='display:flex;gap:8px;align-items:center';
  var opts=produtos.map(function(p){return'<option>'+p.nome+'</option>';}).join('');
  div.innerHTML='<select style="flex:1">'+opts+'</select><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:20px">×</button>';
  lista.appendChild(div);
}
function salvarAgendamento(){
  var cliente=document.getElementById('ag-cliente')?.value||'Cliente';
  var tipo=document.querySelector('input[name="ag-tipo"]:checked')?.value||'servico';
  var sinalAtivo=document.getElementById('ag-sinal-ativo')?.checked;
  var sinalStatus=document.querySelector('input[name="ag-sinal-status"]:checked')?.value||'pendente';
  var sinalForma=document.querySelector('input[name="ag-sinal-forma"]:checked')?.value||'pix';
  var sinalAgora=document.getElementById('ag-sinal-agora')?.textContent||'R$ 0,00';
  if(tipo==='pacote'){
    var sel=document.getElementById('ag-pacote-select');var idx=parseInt(sel?.value);
    if(isNaN(idx)){showAlert('Selecione um pacote!');return;}
    var vendidos=JSON.parse(localStorage.getItem('pacotes_vendidos')||'[]');
    if(vendidos[idx]){vendidos[idx].sessoesUsadas=(vendidos[idx].sessoesUsadas||0)+1;localStorage.setItem('pacotes_vendidos',JSON.stringify(vendidos));}
    closeModal('modal-agendar');showAlert('✅ Agendamento de pacote confirmado! 1 sessão descontada.');return;
  }
  closeModal('modal-agendar');
  var msg='✅ Agendamento confirmado para '+cliente+'!';
  if(sinalAtivo)msg+=' Sinal: '+sinalAgora+' ('+sinalForma+')'+(sinalStatus==='pago'?' ✅ pago':' ⏳ pendente');
  showAlert(msg);
}
// ===== FIM AGENDAMENTO =====`);
  console.log('✅ salvarAgendamento OK');
} else { console.log('⚠️ salvarAgendamento não encontrado'); }

// 6. Funções de pacote (adicionar antes de addPacote)
const oldAddPacote = `function addPacote(){
  const nome=document.getElementById('novo-pacote-nome').value||'Novo Pacote';`;
if (html.includes(oldAddPacote)) {
  html = html.replace(oldAddPacote, `function pktAba(aba){
  var t=document.getElementById('pkt-area-template');var v=document.getElementById('pkt-area-vender');
  if(t)t.style.display=aba==='template'?'block':'none';
  if(v)v.style.display=aba==='vender'?'block':'none';
  var bT='flex:1;padding:10px;font-size:13px;font-weight:700;border:none;background:none;cursor:pointer;border-bottom:2px solid ';
  var bTT=document.getElementById('pkt-tab-template');var bTV=document.getElementById('pkt-tab-vender');
  if(bTT)bTT.style.cssText=bT+(aba==='template'?'#111;color:#111':'transparent;color:#888');
  if(bTV)bTV.style.cssText=bT+(aba==='vender'?'#111;color:#111':'transparent;color:#888');
  if(aba==='vender')pktPreencherSelects();
}
function pktPreencherSelects(){
  var tS=document.getElementById('pkt-venda-template');
  if(tS)tS.innerHTML='<option value="">— selecione o template —</option>'+pacotes.map(function(p,i){return'<option value="'+i+'">'+p.nome+' — '+p.preco+'</option>';}).join('');
  var cS=document.getElementById('pkt-venda-cliente');
  if(cS)cS.innerHTML='<option value="">— selecione —</option>'+clientes.map(function(c){return'<option>'+c.nome+'</option>';}).join('');
}
function pktPreencherVenda(){
  var idx=parseInt(document.getElementById('pkt-venda-template')?.value);
  var info=document.getElementById('pkt-venda-info');var pEl=document.getElementById('pkt-venda-preco');
  if(isNaN(idx)||!pacotes[idx]){if(info)info.style.display='none';return;}
  var pkt=pacotes[idx];if(info)info.style.display='block';
  var t=document.getElementById('pkt-venda-info-txt');
  if(t)t.innerHTML='<strong>'+pkt.nome+'</strong><br>'+(pkt.servicos||'')+'<br>Validade: '+pkt.validade;
  if(pEl)pEl.value=(pkt.preco||'').replace('R$ ','').replace(',00','');
}
function venderPacote(){
  var tIdx=parseInt(document.getElementById('pkt-venda-template')?.value);
  var cliente=document.getElementById('pkt-venda-cliente')?.value||'';
  var preco=parseFloat(document.getElementById('pkt-venda-preco')?.value)||0;
  var forma=document.getElementById('pkt-venda-forma')?.value||'pix';
  if(isNaN(tIdx)||!cliente){showAlert('Selecione o template e o cliente!');return;}
  var pkt=pacotes[tIdx];if(!pkt)return;
  var vendidos=JSON.parse(localStorage.getItem('pacotes_vendidos')||'[]');
  vendidos.push({nome:pkt.nome,cliente:cliente,servicos:pkt.servicos||'',preco:'R$ '+preco.toFixed(2).replace('.',','),sessoesTotal:pkt.sessoes||4,sessoesUsadas:0,dataCompra:new Date().toLocaleDateString('pt-BR'),validade:pkt.validade});
  localStorage.setItem('pacotes_vendidos',JSON.stringify(vendidos));
  var movs=JSON.parse(localStorage.getItem('caixa_movimentos')||'[]');
  movs.push({tipo:'entrada',desc:'Pacote: '+pkt.nome+' ('+cliente+')',valor:preco,forma:forma,data:new Date().toLocaleDateString('pt-BR'),hora:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})});
  localStorage.setItem('caixa_movimentos',JSON.stringify(movs));
  closeModal('modal-pacote');showAlert('✅ Pacote vendido para '+cliente+'!');renderPacotes();
}
function addPacote(){
  const nome=document.getElementById('novo-pacote-nome').value||'Novo Pacote';`);
  console.log('✅ Funções pacote OK');
} else { console.log('⚠️ addPacote não encontrado'); }

// 7. Atualizar addPacoteServico
html = html.replace(
  `div.innerHTML=\`<select style="flex:1"><option>Manicure — R$ 40,00</option><option>Pedicure — R$ 45,00</option><option>Escova — R$ 60,00</option><option>Corte — R$ 80,00</option><option>Coloração — R$ 150,00</option></select><input type="number" placeholder="Qtd" value="1" style="width:60px;text-align:center"/><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--red);font-size:18px">×</button>\`;`,
  `var opts=servicos.map(function(s){return'<option>'+s.nome+' — R$ '+s.preco+'</option>';}).join('');
  div.innerHTML='<select style="flex:1">'+opts+'</select><input type="number" placeholder="Sessões" value="4" style="width:70px;text-align:center"/><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:18px">×</button>';`
);
console.log('✅ addPacoteServico OK');

fs.writeFileSync(file, html, 'utf8');
console.log('✅ Arquivo salvo! Tamanho:', fs.statSync(file).size);
