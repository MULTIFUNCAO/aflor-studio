
window.editarAgendamentoAtivo = function() {
  var dados = window._agendaPopupDados;
  if (!dados) { alert("Erro: dados do agendamento não encontrados"); return; }
  
  fecharAgendaPopup();
  
  var overlay = document.createElement("div");
  overlay.id = "edit-overlay";
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;";
  
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:14px;padding:24px;width:320px;max-height:90vh;overflow-y:auto;">
      <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;">✏️ Editar Agendamento</h3>
      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Cliente</label>
      <input id="edit-cliente" value="${dados.cliente||""}" style="width:100%;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:13px;margin-bottom:12px;box-sizing:border-box;">
      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Serviço</label>
      <input id="edit-servico" value="${dados.servico||""}" style="width:100%;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:13px;margin-bottom:12px;box-sizing:border-box;">
      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Horário</label>
      <input id="edit-hora" value="${dados.hora||""}" style="width:100%;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:13px;margin-bottom:12px;box-sizing:border-box;">
      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Valor (R$)</label>
      <input id="edit-valor" value="${dados.valor||""}" style="width:100%;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:13px;margin-bottom:12px;box-sizing:border-box;">
      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Observação</label>
      <input id="edit-obs" value="${dados.obs||""}" style="width:100%;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:13px;margin-bottom:16px;box-sizing:border-box;">
      <div style="display:flex;gap:8px;">
        <button onclick="document.getElementById('edit-overlay').remove()" style="flex:1;padding:10px;background:#f0f0f0;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Cancelar</button>
        <button onclick="salvarEdicaoAgendamento()" style="flex:1;padding:10px;background:#111;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">💾 Salvar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
};

window.salvarEdicaoAgendamento = async function() {
  var dados = window._agendaPopupDados;
  if (!dados) return;
  
  var novosDados = {
    cliente: document.getElementById("edit-cliente").value,
    servico: document.getElementById("edit-servico").value,
    hora: document.getElementById("edit-hora").value,
    valor: document.getElementById("edit-valor").value,
    obs: document.getElementById("edit-obs").value
  };
  
  // Salvar no Supabase
      if(window._supa&&dados.id){window._supa["from"]("agendamentos").update({cliente:novosDados.cliente,servico:novosDados.servico,hora:novosDados.hora,valor:novosDados.valor,observacao:novosDados.obs,profissional:dados.profissional||"Ana Flor"}).eq("id",dados.id).then(function(){carregarAgendamentosSupa();});}
      // Atualizar localmente
  if (window._agendaExtra) {
    var profKey = dados.prof || dados.profissional || "Ana Flor";
    var chaveAntiga = profKey + ":" + dados.hora;
    var novaHora = novosDados.hora || dados.hora;
    var chaveNova = profKey + ":" + novaHora;
    // Remover chave antiga se hora mudou
    if (chaveAntiga !== chaveNova && window._agendaExtra[chaveAntiga]) {
      delete window._agendaExtra[chaveAntiga];
    }
    // Salvar com nova chave
    window._agendaExtra[chaveNova] = Object.assign({}, dados, novosDados);
  }
  
  // Atualizar no Supabase se tiver id
  if (dados.id && window._supa) {
    var r = await window._supa["from"]("agendamentos").update(novosDados).eq("id", dados.id);
    if (r.error) console.error("supa update:", r.error);
    else console.log("supa: editado ok");
  }
  
  document.getElementById("edit-overlay").remove();
  renderAgenda();
  if (typeof carregarAgendamentosSupa === "function") carregarAgendamentosSupa();
  showAlert("Agendamento editado!");
};
