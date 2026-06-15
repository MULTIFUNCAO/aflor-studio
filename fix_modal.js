var fs=require('fs');
var h=fs.readFileSync('index.html','utf8');

var novoModal=`<div class="modal-overlay" id="modal-agendar">
  <div class="modal" style="width:520px">
    <div class="modal-header">
      <span class="modal-title">\uD83D\uDCC5 Novo Agendamento</span>
      <button class="modal-close" onclick="closeModal('modal-agendar')">✕</button>
    </div>
    <div class="form-grid">
      <div class="form-group full"><label>Cliente</label><input id="ag-cliente" placeholder="Nome do cliente"/></div>
      <div class="form-group"><label>Data</label><input type="date" id="ag-data"/></div>
      <div class="form-group"><label>Horário</label><input type="time" id="ag-hora" value="09:00"/></div>
      <div class="form-group"><label>Profissional</label>
        <select id="ag-prof"><option>Ana Flor</option><option>Edu</option><option>Jeny</option><option>Vi</option><option>Lara</option><option>Angélica</option></select>
      </div>
      <div class="form-group full">
        <label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:6px">Tipo de agendamento</label>
        <div style="display:flex;gap:8px">
          <button type="button" id="ag-tipo-servico" onclick="agSetTipo('servico')" style="flex:1;padding:9px;border:2px solid #111;background:#111;color:#fff;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer">\uD83C\uDFAF Serviço</button>
          <button type="button" id="ag-tipo-pacote" onclick="agSetTipo('pacote')" style="flex:1;padding:9px;border:2px solid #ddd;background:#fff;color:#333;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer">\uD83C\uDF81 Usar Pacote</button>
        </div>
      </div>
      <div id="ag-bloco-servico" class="form-group full" style="padding:0;margin:0">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-group"><label>Categoria</label>
            <select id="ag-cat" onchange="agFiltrarServicos()"><option value="">— Todas —</option></select>
          </div>
          <div class="form-group"><label>Serviço</label>
            <select id="ag-servico" onchange="agCalcSinal()"><option value="0">Selecione...</option></select>
          </div>
        </div>
        <div style="margin-top:8px">
          <label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:6px">\uD83D\uDCE6 Produtos utilizados <span style="font-weight:400;color:#aaa">(sem cobrança extra)</span></label>
          <div id="ag-produtos-list" style="display:flex;flex-direction:column;gap:6px;margin-bottom:6px"></div>
          <button type="button" onclick="agAddProduto()" style="padding:6px 14px;border:1.5px dashed #bbb;background:#fafafa;border-radius:8px;font-size:12px;color:#666;cursor:pointer">+ Produto utilizado</button>
        </div>
      </div>
      <div id="ag-bloco-pacote" style="display:none" class="form-group full">
        <label>Pacote do cliente</label>
        <select id="ag-pacote-sel" style="width:100%"><option value="">— Digite o nome do cliente primeiro —</option></select>
        <div id="ag-pacote-info" style="margin-top:8px;display:none;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:9px;padding:10px;font-size:12px;color:#166534"></div>
      </div>
      <div class="form-group full"><label>Observações</label><textarea id="ag-obs" placeholder="Alguma observação?"></textarea></div>`;

h=h.replace(/(<div class="modal-overlay" id="modal-agendar">[\s\S]*?<div class="form-grid">[\s\S]*?)<div class="form-group full"><label>Observa/,
  novoModal+'\n      <div class="form-group full"><label>Observa');

fs.writeFileSync('index.html',h);
console.log('OK - ag-bloco-servico:', h.includes('ag-bloco-servico'));
