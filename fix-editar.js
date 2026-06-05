var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Substituir o botão Editar fake por um que abre o form real
var old = 'onclick="fecharAgendaPopup();showAlert(\'Agendamento editado!\')\" style="flex:1;padding:9px;background:#111;color:#fff;border:none;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer\">✏️ Editar</button>';
var novo = 'onclick="editarAgendamentoAtivo()" style="flex:1;padding:9px;background:#111;color:#fff;border:none;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer\">✏️ Editar</button>';

if (c.includes(old)) {
  c = c.replace(old, novo);
  console.log('ok: botao editar atualizado');
} else {
  console.log('nao achou botao - verificar');
}

// Injetar função editarAgendamentoAtivo antes do </body>
var funcEditar = '<script>\n' +
'window.editarAgendamentoAtivo = function() {\n' +
'  var dados = window._agendaPopupDados;\n' +
'  if (!dados) { alert("Erro: dados do agendamento não encontrados"); return; }\n' +
'  \n' +
'  fecharAgendaPopup();\n' +
'  \n' +
'  var overlay = document.createElement("div");\n' +
'  overlay.id = "edit-overlay";\n' +
'  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;";\n' +
'  \n' +
'  overlay.innerHTML = `\n' +
'    <div style="background:#fff;border-radius:14px;padding:24px;width:320px;max-height:90vh;overflow-y:auto;">\n' +
'      <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;">✏️ Editar Agendamento</h3>\n' +
'      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Cliente</label>\n' +
'      <input id="edit-cliente" value="${dados.cliente||""}" style="width:100%;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:13px;margin-bottom:12px;box-sizing:border-box;">\n' +
'      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Serviço</label>\n' +
'      <input id="edit-servico" value="${dados.servico||""}" style="width:100%;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:13px;margin-bottom:12px;box-sizing:border-box;">\n' +
'      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Horário</label>\n' +
'      <input id="edit-hora" value="${dados.hora||""}" style="width:100%;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:13px;margin-bottom:12px;box-sizing:border-box;">\n' +
'      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Valor (R$)</label>\n' +
'      <input id="edit-valor" value="${dados.valor||""}" style="width:100%;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:13px;margin-bottom:12px;box-sizing:border-box;">\n' +
'      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Observação</label>\n' +
'      <input id="edit-obs" value="${dados.obs||""}" style="width:100%;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:13px;margin-bottom:16px;box-sizing:border-box;">\n' +
'      <div style="display:flex;gap:8px;">\n' +
'        <button onclick="document.getElementById(\'edit-overlay\').remove()" style="flex:1;padding:10px;background:#f0f0f0;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Cancelar</button>\n' +
'        <button onclick="salvarEdicaoAgendamento()" style="flex:1;padding:10px;background:#111;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">💾 Salvar</button>\n' +
'      </div>\n' +
'    </div>\n' +
'  `;\n' +
'  document.body.appendChild(overlay);\n' +
'};\n' +
'\n' +
'window.salvarEdicaoAgendamento = async function() {\n' +
'  var dados = window._agendaPopupDados;\n' +
'  if (!dados) return;\n' +
'  \n' +
'  var novosDados = {\n' +
'    cliente: document.getElementById("edit-cliente").value,\n' +
'    servico: document.getElementById("edit-servico").value,\n' +
'    hora: document.getElementById("edit-hora").value,\n' +
'    valor: document.getElementById("edit-valor").value,\n' +
'    obs: document.getElementById("edit-obs").value\n' +
'  };\n' +
'  \n' +
'  // Atualizar localmente\n' +
'  if (window._agendaExtra) {\n' +
'    var chave = dados.prof + ":" + dados.hora;\n' +
'    if (window._agendaExtra[chave]) {\n' +
'      Object.assign(window._agendaExtra[chave], novosDados);\n' +
'    }\n' +
'  }\n' +
'  \n' +
'  // Atualizar no Supabase se tiver id\n' +
'  if (dados.id && window._supa) {\n' +
'    var r = await window._supa.from("agendamentos").update(novosDados).eq("id", dados.id);\n' +
'    if (r.error) console.error("supa update:", r.error);\n' +
'    else console.log("supa: editado ok");\n' +
'  }\n' +
'  \n' +
'  document.getElementById("edit-overlay").remove();\n' +
'  renderAgenda();\n' +
'  if (typeof carregarAgendamentosSupa === "function") carregarAgendamentosSupa();\n' +
'  showAlert("Agendamento editado!");\n' +
'};\n' +
'</script>\n';

c = c.replace('</body>', funcEditar + '</body>');
fs.writeFileSync('index.html', c);
console.log('ok: funcao editar injetada');
