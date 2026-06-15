const fs = require('fs');
const path = require('path');

const file = path.join(process.env.HOME, 'Downloads', 'aflor-repo-novo', 'index.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Substituir modal de agendamento
const oldModal = `<div class="modal-overlay" id="modal-agendar">
  <div class="modal" style="width:520px">
    <div class="modal-header">
      <span class="modal-title">📅 Novo Agendamento</span>
      <button class="modal-close" onclick="closeModal('modal-agendar')">✕</button>
    </div>
    <div class="form-grid">
      <div class="form-group full"><label>Cliente</label><input id="ag-cliente" placeholder="Nome do cliente"/></div>
      <div class="form-group"><label>Data</label><input type="date" value="2026-05-26"/></div>
      <div class="form-group"><label>Horário</label><input type="time" value="09:00"/></div>
      <div class="form-group"><label>Profissional</label>
        <select><option>Ana Flor</option><option>Edu</option><option>Jeny</option><option>Vi</option><option>Lara</option><option>Angélica</option></select>
      </div>
      <div class="form-group"><label>Serviço</label>
        <select id="ag-servico" onchange="agCalcSinal()">
          <option value="40">Manicure — R$ 40,00</option>
          <option value="45">Pedicure — R$ 45,00</option>
          <option value="80">Corte de Cabelo — R$ 80,00</option>
          <option value="60">Escova — R$ 60,00</option>
          <option value="150">Coloração — R$ 150,00</option>
          <option value="80">Hidratação — R$ 80,00</option>
          <option value="100">Manutenção — R$ 100,00</option>
          <option value="12">Design de Sobrancelhas — R$ 12,00</option>
        </select>
      </div>
      <div class="form-group full"><label>Observações</label><textarea placeholder="Alguma observação?"></textarea></div>`;

if (!html.includes(oldModal.substring(0, 100))) {
  console.log('ERRO: modal antigo não encontrado');
  process.exit(1);
}

const newModal = `<div class="modal-overlay" id="modal-agendar">
  <div class="modal" style="width:560px;max-height:90vh;overflow-y:auto">
    <div class="modal-header">
      <span class="modal-title">📅 Novo Agendamento</span>
      <button class="modal-close" onclick="closeModal('modal-agendar')">✕</button>
    </div>
    <div class="form-grid">
      <div class="form-group full"><label>Cliente</label><input id="ag-cliente" placeholder="Nome do cliente"/></div>
      <div class="form-group"><label>Data</label><input type="date" id="ag-data"/></div>
      <div class="form-group"><label>Horário</label><input type="time" id="ag-hora" value="09:00"/></div>
      <div class="form-group full"><label>Profissional</label>
        <select id="ag-profissional">
          <option>Ana Flor</option><option>Edu</option><option>Jeny</option><option>Vi</option>
        </select>
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
          <label style="margin:0">🧴 Produtos Usados <span style="font-size:11px;font-weight:400;color:#888">(opcional)</span></label>
          <button type="button" class="btn btn-outline btn-sm" onclick="agAddProduto()">+ Adicionar</button>
        </div>
        <div id="ag-produtos-lista" style="display:flex;flex-direction:column;gap:6px"></div>
      </div>
      <div class="form-group full"><label>Observações</label><textarea id="ag-obs" placeholder="Alguma observação?"></textarea></div>`;

html = html.replace(oldModal, newModal);

// 2. Substituir a parte do sinal (remover as referências ao sinal que ficaram após o replace parcial)
const oldSinalEnd = `      <!-- SINAL / ENTRADA -->
      <div class="form-group full">
        <div style="background:#f8f8f8;border-radius:12px;padding:14px;border:1px solid #e5e5e5">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div>
              <div style="font-size:13px;font-weight:800;color:#111">💰 Sinal / Entrada</div>
              <div style="font-size:11px;color:#888;margin-top:2px">O cliente pagou algum valor para confirmar?</div>
            </div>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="checkbox" id="ag-sinal-ativo" onchange="agToggleSinal()" style="width:16px;height:16px;accent-color:#111"/>
              <span style="font-size:12px;font-weight:600">Sim, deu sinal</span>
            </label>
          </div>
          <div id="ag-sinal-area" style="display:none">
            <!-- Atalhos % -->
            <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
              <span style="font-size:11px;color:#888;align-self:center">Atalhos:</span>
              <button type="button" class="btn btn-outline btn-sm" onclick="agSetPct(25)">25%</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="agSetPct(30)">30%</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="agSetPct(50)">50%</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="agSetPct(100)">100%</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
              <div class="form-group">
                <label>Porcentagem (%)</label>
                <input type="number" id="ag-sinal-pct" value="50" min="1" max="100" oninput="agCalcSinal()" style="font-weight:700"/>
              </div>
              <div class="form-group">
                <label>Valor do sinal (R$)</label>
                <input type="number" id="ag-sinal-val" oninput="agCalcSinalVal()" style="font-weight:700"/>
              </div>
            </div>
            <!-- Resumo -->
            <div style="background:#fff;border-radius:9px;padding:12px;border:1px solid #e5e5e5">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
                <span style="color:#666">Valor total do serviço</span>
                <span id="ag-total" style="font-weight:700">R$ 40,00</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
                <span style="color:#666">Sinal a receber agora</span>
                <span id="ag-sinal-agora" style="font-weight:800;color:#111">R$ 20,00</span>
              </div>
              <div style="border-top:1px dashed #e5e5e5;margin:6px 0;padding-top:6px;display:flex;justify-content:space-between;font-size:12px">
                <span style="color:#888">Restante após o serviço</span>
                <span id="ag-sinal-resto" style="font-weight:700;color:#888">R$ 20,00</span>
              </div>
            </div>
            <!-- Status do sinal -->
            <div style="margin-top:10px">
              <label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:6px">Status do sinal</label>
              <div style="display:flex;gap:6px">
                <label style="display:flex;align-items:center;gap:5px;cursor:pointer;padding:7px 12px;border:1.5px solid #e5e5e5;border-radius:8px;flex:1">
                  <input type="radio" name="ag-sinal-status" value="pendente" checked style="accent-color:#111"/>
                  <span style="font-size:12px;font-weight:600">⏳ Pendente</span>
                </label>
                <label style="display:flex;align-items:center;gap:5px;cursor:pointer;padding:7px 12px;border:1.5px solid #e5e5e5;border-radius:8px;flex:1">
                  <input type="radio" name="ag-sinal-status" value="pago" style="accent-color:#111"/>
                  <span style="font-size:12px;font-weight:600">✅ Já foi pago</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
      <button class="btn btn-outline" onclick="closeModal('modal-agendar')">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarAgendamento()">✅ Confirmar Agendamento</button>
    </div>
  </div>
</div>`;

const newSinalEnd = `      <div class="form-group full" id="ag-sinal-bloco">
        <div style="background:#f8f8f8;border-radius:12px;padding:14px;border:1px solid #e5e5e5">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div>
              <div style="font-size:13px;font-weight:800;color:#111">💰 Sinal / Entrada</div>
              <div style="font-size:11px;color:#888;margin-top:2px">O cliente pagou algum valor para confirmar?</div>
            </div>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="checkbox" id="ag-sinal-ativo" onchange="agToggleSinal()" style="width:16px;height:16px;accent-color:#111"/>
              <span style="font-size:12px;font-weight:600">Sim, deu sinal</span>
            </label>
          </div>
          <div id="ag-sinal-area" style="display:none">
            <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
              <span style="font-size:11px;color:#888;align-self:center">Atalhos:</span>
              <button type="button" class="btn btn-outline btn-sm" onclick="agSetPct(25)">25%</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="agSetPct(30)">30%</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="agSetPct(50)">50%</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="agSetPct(100)">100%</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
              <div class="form-group"><label>Porcentagem (%)</label>
                <input type="number" id="ag-sinal-pct" value="50" min="1" max="100" oninput="agCalcSinal()" style="font-weight:700"/>
              </div>
              <div class="form-group"><label>Valor do sinal (R$)</label>
                <input type="number" id="ag-sinal-val" oninput="agCalcSinalVal()" style="font-weight:700"/>
              </div>
            </div>
            <div style="background:#fff;border-radius:9px;padding:12px;border:1px solid #e5e5e5">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
                <span style="color:#666">Valor total do serviço</span><span id="ag-total" style="font-weight:700">R$ 0,00</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
                <span style="color:#666">Sinal a receber agora</span><span id="ag-sinal-agora" style="font-weight:800;color:#111">R$ 0,00</span>
              </div>
              <div style="border-top:1px dashed #e5e5e5;margin:6px 0;padding-top:6px;display:flex;justify-content:space-between;font-size:12px">
                <span style="color:#888">Restante após o serviço</span><span id="ag-sinal-resto" style="font-weight:700;color:#888">R$ 0,00</span>
              </div>
            </div>
            <div style="margin-top:10px">
              <label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:6px">Forma de pagamento do sinal</label>
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
            <div style="margin-top:10px">
              <label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:6px">Status do sinal</label>
              <div style="display:flex;gap:6px">
                <label style="display:flex;align-items:center;gap:5px;cursor:pointer;padding:7px 12px;border:1.5px solid #e5e5e5;border-radius:8px;flex:1">
                  <input type="radio" name="ag-sinal-status" value="pendente" checked style="accent-color:#111"/><span style="font-size:12px;font-weight:600">⏳ Pendente</span>
                </label>
                <label style="display:flex;align-items:center;gap:5px;cursor:pointer;padding:7px 12px;border:1.5px solid #e5e5e5;border-radius:8px;flex:1">
                  <input type="radio" name="ag-sinal-status" value="pago" style="accent-color:#111"/><span style="font-size:12px;font-weight:600">✅ Já foi pago</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
      <button class="btn btn-outline" onclick="closeModal('modal-agendar')">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarAgendamento()">✅ Confirmar Agendamento</button>
    </div>
  </div>
</div>`;

if (html.includes(oldSinalEnd.substring(0, 80))) {
  html = html.replace(oldSinalEnd, newSinalEnd);
  console.log('✅ Sinal substituído');
} else {
  console.log('⚠️ Sinal não encontrado, continuando...');
}

// 3. Substituir openModal
html = html.replace(
  'function openModal(id){document.getElementById(id).classList.add(\'open\')}',
  `function openModal(id){
  document.getElementById(id).classList.add('open');
  if(id==='modal-agendar')agInicializar();
  if(id==='modal-pacote'){
    pktAba('template');
    var sel=document.getElementById('pkt-srv-0');
    if(sel)sel.innerHTML=servicos.map(s=>'<option>'+s.nome+' — R$ '+s.preco+'</option>').join('');
  }
}`
);

// 4. Substituir salvarAgendamento
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

const newSalvar = `// ===== AGENDAMENTO MELHORADO =====
function agInicializar(){
  var hoje=new Date();
  var dd=String(hoje.getDate()).padStart(2,'0');
  var mm=String(hoje.getMonth()+1).padStart(2,'0');
  var yyyy=hoje.getFullYear();
  var elD=document.getElementById('ag-data');
  if(elD)elD.value=yyyy+'-'+mm+'-'+dd;
  var cats=[...new Set(servicos.map(function(s){return s.cat;}))].sort();
  var catSel=document.getElementById('ag-categoria');
  if(catSel)catSel.innerHTML='<option value="">— Todas —</option>'+cats.map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('');
  agFiltrarServicos();
  var lista=document.getElementById('ag-produtos-lista');
  if(lista)lista.innerHTML='';
  var radS=document.querySelector('input[name="ag-tipo"][value="servico"]');
  if(radS){radS.checked=true;agTipoChange();}
  var ck=document.getElementById('ag-sinal-ativo');
  if(ck){ck.checked=false;agToggleSinal();}
  var obs=document.getElementById('ag-obs');if(obs)obs.value='';
  var cli=document.getElementById('ag-cliente');if(cli)cli.value='';
}
function agFiltrarServicos(){
  var cat=document.getElementById('ag-categoria')?.value||'';
  var filtrados=cat?servicos.filter(function(s){return s.cat===cat;}):servicos;
  var sel=document.getElementById('ag-servico');
  if(!sel)return;
  sel.innerHTML=filtrados.map(function(s){return '<option value="'+parseFloat(s.preco.replace(',','.'))+'">'+s.nome+' — R$ '+s.preco+'</option>';}).join('');
  agCalcSinal();
}
function agTipoChange(){
  var tipo=document.querySelector('input[name="ag-tipo"]:checked')?.value||'servico';
  var aS=document.getElementById('ag-area-servico');
  var aP=document.getElementById('ag-area-pacote');
  var sB=document.getElementById('ag-sinal-bloco');
  if(tipo==='pacote'){if(aS)aS.style.display='none';if(aP)aP.style.display='block';if(sB)sB.style.display='none';agCarregarPacotesCliente();}
  else{if(aS)aS.style.display='contents';if(aP)aP.style.display='none';if(sB)sB.style.display='block';}
  document.getElementById('tipo-servico-lbl').style.borderColor=tipo==='servico'?'#111':'#e5e5e5';
  document.getElementById('tipo-pacote-lbl').style.borderColor=tipo==='pacote'?'#111':'#e5e5e5';
}
function agCarregarPacotesCliente(){
  var vendidos=JSON.parse(localStorage.getItem('pacotes_vendidos')||'[]');
  var sel=document.getElementById('ag-pacote-select');
  if(!sel)return;
  if(!vendidos.length){sel.innerHTML='<option value="">Nenhum pacote vendido ainda</option>';return;}
  sel.innerHTML='<option value="">— selecione —</option>'+vendidos.map(function(v,i){
    var r=(v.sessoesTotal||1)-(v.sessoesUsadas||0);
    return '<option value="'+i+'">'+v.cliente+' — '+v.nome+' ('+r+' sessões)</option>';
  }).join('');
}
function agPacoteChange(){
  var sel=document.getElementById('ag-pacote-select');
  var info=document.getElementById('ag-pacote-info');
  var infoTxt=document.getElementById('ag-pacote-sessoes');
  if(!sel||!info)return;
  var idx=parseInt(sel.value);
  if(isNaN(idx)){info.style.display='none';return;}
  var vendidos=JSON.parse(localStorage.getItem('pacotes_vendidos')||'[]');
  var pkt=vendidos[idx];if(!pkt){info.style.display='none';return;}
  var r=(pkt.sessoesTotal||1)-(pkt.sessoesUsadas||0);
  info.style.display='block';
  if(infoTxt)infoTxt.textContent='Sessões disponíveis: '+r+' de '+(pkt.sessoesTotal||1);
}
function agAddProduto(){
  var lista=document.getElementById('ag-produtos-lista');if(!lista)return;
  var div=document.createElement('div');div.style.cssText='display:flex;gap:8px;align-items:center';
  var opts=produtos.map(function(p){return '<option>'+p.nome+' ('+p.cat+')</option>';}).join('');
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
    var sel=document.getElementById('ag-pacote-select');
    var idx=parseInt(sel?.value);
    if(isNaN(idx)){showAlert('Selecione um pacote!');return;}
    var vendidos=JSON.parse(localStorage.getItem('pacotes_vendidos')||'[]');
    if(vendidos[idx]){vendidos[idx].sessoesUsadas=(vendidos[idx].sessoesUsadas||0)+1;localStorage.setItem('pacotes_vendidos',JSON.stringify(vendidos));}
    closeModal('modal-agendar');showAlert('✅ Agendamento de pacote confirmado! 1 sessão descontada.');return;
  }
  closeModal('modal-agendar');
  var msg='✅ Agendamento confirmado para '+cliente+'!';
  if(sinalAtivo)msg+=' Sinal: '+sinalAgora+' ('+sinalForma.toUpperCase()+')'+(sinalStatus==='pago'?' ✅ pago':' ⏳ pendente');
  showAlert(msg);
}
// ===== FIM AGENDAMENTO =====`;

if (html.includes(oldSalvar.substring(0, 60))) {
  html = html.replace(oldSalvar, newSalvar);
  console.log('✅ salvarAgendamento substituído');
} else {
  console.log('⚠️ salvarAgendamento não encontrado exato, tentando alternativa...');
}

// 5. Adicionar CSS mobile
const oldMedia = '@media(max-width:900px){\n  .cards-grid{grid-template-columns:1fr 1fr}\n}';
const newMedia = `@media(max-width:900px){
  .cards-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:640px){
  .main-content{padding:12px 10px 80px!important}
  .cards-grid{grid-template-columns:1fr!important}
  .page-header{flex-direction:column;align-items:flex-start;gap:10px}
  table{font-size:12px}
  th,td{padding:8px 6px!important}
  .modal{width:95vw!important;max-width:95vw!important}
  .form-grid{grid-template-columns:1fr!important}
  .form-group.full,.form-group{grid-column:1/-1!important}
  .topbar{padding:10px 12px}
  .hide-mobile{display:none!important}
}`;

if (html.includes(oldMedia)) {
  html = html.replace(oldMedia, newMedia);
  console.log('✅ CSS mobile adicionado');
}

// 6. Atualizar modal de pacote
const oldPacoteModal = `<div class="modal-overlay" id="modal-pacote">
  <div class="modal" style="width:560px">
    <div class="modal-header">
      <span class="modal-title">Novo Pacote</span>
      <button class="modal-close" onclick="closeModal('modal-pacote')">✕</button>
    </div>`;

const newPacoteModal = `<div class="modal-overlay" id="modal-pacote">
  <div class="modal" style="width:580px;max-height:90vh;overflow-y:auto">
    <div class="modal-header">
      <span class="modal-title">🎁 Pacote / Template</span>
      <button class="modal-close" onclick="closeModal('modal-pacote')">✕</button>
    </div>
    <div style="display:flex;gap:0;border-bottom:2px solid #f0f0f0;margin-bottom:16px">
      <button id="pkt-tab-template" onclick="pktAba('template')" style="flex:1;padding:10px;font-size:13px;font-weight:700;border:none;background:none;border-bottom:2px solid #111;color:#111;cursor:pointer">📦 Criar Template</button>
      <button id="pkt-tab-vender" onclick="pktAba('vender')" style="flex:1;padding:10px;font-size:13px;font-weight:700;border:none;background:none;border-bottom:2px solid transparent;color:#888;cursor:pointer">💳 Vender para Cliente</button>
    </div>
    <div id="pkt-area-template">`;

if (html.includes(oldPacoteModal.substring(0, 80))) {
  html = html.replace(oldPacoteModal, newPacoteModal);
  console.log('✅ Modal pacote atualizado');
}

// 7. Adicionar funções de pacote antes de addPacote
const oldAddPacote = `function addPacote(){
  const nome=document.getElementById('novo-pacote-nome').value||'Novo Pacote';
  const preco='R$ '+(document.getElementById('novo-pacote-preco').value||'0')+',00';
  const validade=(document.getElementById('novo-pacote-validade').value||'30')+' dias';
  pacotes.unshift({nome,servicos:'Serviços incluídos',validade,preco});
  closeModal('modal-pacote');
  renderPacotes();
  showAlert('Pacote salvo com sucesso!');
}`;

const newAddPacote = `function pktAba(aba){
  document.getElementById('pkt-area-template').style.display=aba==='template'?'block':'none';
  document.getElementById('pkt-area-vender').style.display=aba==='vender'?'block':'none';
  var bT='flex:1;padding:10px;font-size:13px;font-weight:700;border:none;background:none;cursor:pointer;border-bottom:2px solid ';
  document.getElementById('pkt-tab-template').style.cssText=bT+(aba==='template'?'#111;color:#111':'transparent;color:#888');
  document.getElementById('pkt-tab-vender').style.cssText=bT+(aba==='vender'?'#111;color:#111':'transparent;color:#888');
  if(aba==='vender')pktPreencherSelects();
}
function pktPreencherSelects(){
  var tS=document.getElementById('pkt-venda-template');
  if(tS)tS.innerHTML='<option value="">— selecione o template —</option>'+pacotes.map(function(p,i){return '<option value="'+i+'">'+p.nome+' — '+p.preco+'</option>';}).join('');
  var cS=document.getElementById('pkt-venda-cliente');
  if(cS)cS.innerHTML='<option value="">— selecione o cliente —</option>'+clientes.map(function(c){return '<option>'+c.nome+'</option>';}).join('');
}
function pktPreencherVenda(){
  var idx=parseInt(document.getElementById('pkt-venda-template')?.value);
  var info=document.getElementById('pkt-venda-info');
  var precoEl=document.getElementById('pkt-venda-preco');
  if(isNaN(idx)){if(info)info.style.display='none';return;}
  var pkt=pacotes[idx];if(!pkt){if(info)info.style.display='none';return;}
  if(info)info.style.display='block';
  var t=document.getElementById('pkt-venda-info-txt');
  if(t)t.innerHTML='<strong>'+pkt.nome+'</strong><br>'+(pkt.servicos||'')+'<br>Validade: '+pkt.validade;
  if(precoEl)precoEl.value=(pkt.preco||'').replace('R$ ','').replace(',00','');
}
function venderPacote(){
  var tIdx=parseInt(document.getElementById('pkt-venda-template')?.value);
  var cliente=document.getElementById('pkt-venda-cliente')?.value||'';
  var preco=parseFloat(document.getElementById('pkt-venda-preco')?.value)||0;
  var forma=document.getElementById('pkt-venda-forma')?.value||'pix';
  if(isNaN(tIdx)||!cliente){showAlert('Selecione o template e o cliente!');return;}
  var pkt=pacotes[tIdx];if(!pkt){showAlert('Template inválido!');return;}
  var vendidos=JSON.parse(localStorage.getItem('pacotes_vendidos')||'[]');
  vendidos.push({nome:pkt.nome,cliente:cliente,servicos:pkt.servicos||'',preco:'R$ '+preco.toFixed(2).replace('.',','),forma:forma,sessoesTotal:pkt.sessoes||4,sessoesUsadas:0,dataCompra:new Date().toLocaleDateString('pt-BR'),validade:pkt.validade});
  localStorage.setItem('pacotes_vendidos',JSON.stringify(vendidos));
  var movs=JSON.parse(localStorage.getItem('caixa_movimentos')||'[]');
  movs.push({tipo:'entrada',desc:'Pacote: '+pkt.nome+' ('+cliente+')',valor:preco,forma:forma,data:new Date().toLocaleDateString('pt-BR'),hora:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})});
  localStorage.setItem('caixa_movimentos',JSON.stringify(movs));
  closeModal('modal-pacote');showAlert('✅ Pacote vendido para '+cliente+'! Lançado no caixa.');renderPacotes();
}
function addPacote(){
  const nome=document.getElementById('novo-pacote-nome').value.trim()||'Novo Pacote';
  const preco='R$ '+(document.getElementById('novo-pacote-preco').value||'0')+',00';
  const validade=(document.getElementById('novo-pacote-validade').value||'30')+' dias';
  var srvLinhas=document.querySelectorAll('#pacote-servicos-list select');
  var srvQtds=document.querySelectorAll('#pacote-servicos-list input[type=number]');
  var srvTexts=[];var sessoes=0;
  srvLinhas.forEach(function(s,i){var q=parseInt(srvQtds[i]?.value)||1;sessoes+=q;srvTexts.push(s.options[s.selectedIndex].text.split(' — ')[0]+' ('+q+'x)');});
  pacotes.unshift({nome,servicos:srvTexts.join(' + '),validade,preco,sessoes});
  closeModal('modal-pacote');renderPacotes();showAlert('Pacote salvo!');
}`;

if (html.includes(oldAddPacote.substring(0, 60))) {
  html = html.replace(oldAddPacote, newAddPacote);
  console.log('✅ addPacote e funções de pacote adicionados');
}

// 8. Atualizar addPacoteServico
const oldAddSrv = `function addPacoteServico(){
  const list=document.getElementById('pacote-servicos-list');
  const div=document.createElement('div');
  div.style.cssText='display:flex;gap:8px;align-items:center';
  div.innerHTML=\`<select style="flex:1"><option>Manicure — R$ 40,00</option><option>Pedicure — R$ 45,00</option><option>Escova — R$ 60,00</option><option>Corte — R$ 80,00</option><option>Coloração — R$ 150,00</option></select><input type="number" placeholder="Qtd" value="1" style="width:60px;text-align:center"/><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--red);font-size:18px">×</button>\`;
  list.appendChild(div);
}`;

const newAddSrv = `function addPacoteServico(){
  const list=document.getElementById('pacote-servicos-list');
  const div=document.createElement('div');div.style.cssText='display:flex;gap:8px;align-items:center';
  var opts=servicos.map(function(s){return '<option>'+s.nome+' — R$ '+s.preco+'</option>';}).join('');
  div.innerHTML='<select style="flex:1">'+opts+'</select><input type="number" placeholder="Sessões" value="4" style="width:70px;text-align:center"/><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:18px">×</button>';
  list.appendChild(div);
}`;

if (html.includes(oldAddSrv.substring(0, 60))) {
  html = html.replace(oldAddSrv, newAddSrv);
  console.log('✅ addPacoteServico atualizado');
}

fs.writeFileSync(file, html, 'utf8');
console.log('✅ Arquivo salvo! Tamanho:', fs.statSync(file).size, 'bytes');
