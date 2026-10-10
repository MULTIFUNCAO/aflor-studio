// ===== CURSOS: Campanhas e anúncios (Prioridade 1 — gestão educacional) =====
// Cadastro manual de campanhas de divulgação de cursos/combos. Sem importação
// automática de plataforma de anúncios (Meta/Google etc.) — não existe hoje,
// então não simulamos. Métricas de leads/matrículas/conversão são calculadas
// em tempo real a partir de curso_leads/curso_matriculas, nunca armazenadas.
// Depende dos globais definidos em index.html: supa, window.SALAO_ID, cursos,
// cursoCombos, escHtml, fmtDataBR, fmtCaixa, openModal, closeModal, showAlert.
// Depende de cursoLeads/cursoMatriculas (index.html e cursos-leads.js) só para
// exibir métricas — carrega de forma independente, nunca bloqueia se faltar.

var cursoCampanhas = [];
var _ccEditIdx = -1;

async function carregarCampanhasSupa(){
  try{
    if(!supa||!window.SALAO_ID)return;
    var r = await supa.from('curso_campanhas').select('*').eq('salao_id', window.SALAO_ID).order('criado_em', { ascending: false });
    if(r.error){ console.log('err carregar campanhas', r.error); return; }
    cursoCampanhas = r.data || [];
    renderCampanhas();
    if(typeof clRenderDashExtra === 'function') clRenderDashExtra();
  }catch(e){ console.log('err carregar campanhas', e); }
}

function ccNomeItem(cursoId, comboId){
  if(cursoId){ var c = cursos.find(function(x){ return x.id === cursoId; }); return c ? c.nome : 'Curso removido'; }
  if(comboId){ var cb = cursoCombos.find(function(x){ return x.id === comboId; }); return cb ? cb.nome : 'Combo removido'; }
  return '— sem curso/combo vinculado —';
}

function ccStatusBadge(status){
  var map = { planejada:'badge-gray', ativa:'badge-green', pausada:'badge-yellow', encerrada:'badge-blue' };
  var label = { planejada:'Planejada', ativa:'Ativa', pausada:'Pausada', encerrada:'Encerrada' };
  return '<span class="badge '+(map[status]||'badge-gray')+'">'+(label[status]||status)+'</span>';
}

function ccMetricas(campanhaId){
  var leads = (typeof cursoLeads !== 'undefined' ? cursoLeads : []).filter(function(l){ return l.campanha_id === campanhaId; });
  var matriculas = leads.filter(function(l){ return l.matricula_id; }).length
    + (typeof cursoMatriculas !== 'undefined' ? cursoMatriculas.filter(function(m){ return m.campanha_id === campanhaId && !leads.some(function(l){ return l.matricula_id === m.id; }); }).length : 0);
  var conversao = leads.length ? Math.round((matriculas / leads.length) * 100) : 0;
  return { leads: leads.length, matriculas: matriculas, conversao: conversao };
}

function renderCampanhas(){
  var wrap = document.getElementById('campanhas-list');
  if(!wrap) return;
  if(!cursoCampanhas.length){
    wrap.innerHTML = '<div style="padding:40px;text-align:center;color:#999;font-size:13px">Nenhuma campanha cadastrada ainda.</div>';
    return;
  }
  wrap.innerHTML = '<table><thead><tr>'
    + '<th>Campanha</th><th>Curso/Combo</th><th>Canal</th><th>Divulgação</th><th>Data do curso</th>'
    + '<th>Valor anunciado</th><th>Leads</th><th>Matrículas</th><th>Conversão</th><th>Status</th><th></th>'
    + '</tr></thead><tbody>'
    + cursoCampanhas.map(function(c, i){
        var m = ccMetricas(c.id);
        return '<tr>'
          + '<td style="font-weight:600">'+escHtml(c.nome)+'</td>'
          + '<td>'+escHtml(ccNomeItem(c.curso_id, c.combo_id))+'</td>'
          + '<td>'+escHtml(c.canal||'—')+'</td>'
          + '<td style="white-space:nowrap">'+(c.data_inicio?fmtDataBR(c.data_inicio):'—')+' a '+(c.data_fim?fmtDataBR(c.data_fim):'—')+'</td>'
          + '<td>'+(c.data_prevista_curso?fmtDataBR(c.data_prevista_curso):'—')+'</td>'
          + '<td>'+(c.valor_anunciado!=null?fmtCaixa(c.valor_anunciado):'—')+'</td>'
          + '<td style="text-align:center">'+m.leads+'</td>'
          + '<td style="text-align:center">'+m.matriculas+'</td>'
          + '<td style="text-align:center;font-weight:700">'+m.conversao+'%</td>'
          + '<td>'+ccStatusBadge(c.status)+'</td>'
          + '<td><button onclick="ccMenu(event,'+i+')" style="background:none;border:none;cursor:pointer;font-size:18px;color:#888">⋮</button></td>'
          + '</tr>';
      }).join('')
    + '</tbody></table>';
}

function ccPopularSelectCursoCombo(selecionado){
  var sel = document.getElementById('cc-curso-combo');
  if(!sel) return;
  var opts = ['<option value="">— Sem curso/combo específico —</option>'];
  cursos.forEach(function(c){ opts.push('<option value="curso:'+c.id+'">🎓 '+escHtml(c.nome)+'</option>'); });
  cursoCombos.forEach(function(c){ opts.push('<option value="combo:'+c.id+'">🧩 '+escHtml(c.nome)+'</option>'); });
  sel.innerHTML = opts.join('');
  if(selecionado) sel.value = selecionado;
}

function abrirNovaCampanha(){
  _ccEditIdx = -1;
  ccPopularSelectCursoCombo();
  document.getElementById('cc-nome').value = '';
  document.getElementById('cc-criativo-desc').value = '';
  document.getElementById('cc-criativo-url').value = '';
  document.getElementById('cc-canal').value = '';
  document.getElementById('cc-inicio').value = '';
  document.getElementById('cc-fim').value = '';
  document.getElementById('cc-data-curso').value = '';
  document.getElementById('cc-valor').value = '';
  document.getElementById('cc-orcamento').value = '';
  document.getElementById('cc-link').value = '';
  document.getElementById('cc-status').value = 'ativa';
  document.querySelector('#modal-curso-campanha .modal-title').textContent = '📣 Nova Campanha de Curso';
  openModal('modal-curso-campanha');
}

function ccEditar(idx){
  var c = cursoCampanhas[idx];
  if(!c) return;
  _ccEditIdx = idx;
  ccPopularSelectCursoCombo(c.curso_id ? ('curso:'+c.curso_id) : (c.combo_id ? ('combo:'+c.combo_id) : ''));
  document.getElementById('cc-nome').value = c.nome || '';
  document.getElementById('cc-criativo-desc').value = c.criativo_desc || '';
  document.getElementById('cc-criativo-url').value = c.criativo_url || '';
  document.getElementById('cc-canal').value = c.canal || '';
  document.getElementById('cc-inicio').value = c.data_inicio || '';
  document.getElementById('cc-fim').value = c.data_fim || '';
  document.getElementById('cc-data-curso').value = c.data_prevista_curso || '';
  document.getElementById('cc-valor').value = c.valor_anunciado != null ? c.valor_anunciado : '';
  document.getElementById('cc-orcamento').value = c.orcamento != null ? c.orcamento : '';
  document.getElementById('cc-link').value = c.link_externo || '';
  document.getElementById('cc-status').value = c.status || 'ativa';
  document.querySelector('#modal-curso-campanha .modal-title').textContent = '✏️ Editar Campanha';
  openModal('modal-curso-campanha');
}

function ccMenu(e, idx){
  e.stopPropagation();
  var old = document.getElementById('cc-menu-popup'); if(old) old.remove();
  var div = document.createElement('div');
  div.id = 'cc-menu-popup';
  div.style.cssText = 'position:fixed;background:#fff;border:1px solid #e5e5e5;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.12);z-index:9999;min-width:160px;padding:4px 0';
  div.innerHTML = '<div onclick="ccEditar('+idx+');document.getElementById(\'cc-menu-popup\').remove()" style="padding:10px 16px;cursor:pointer;font-size:13px">✏️ Editar</div>'
    + '<div onclick="ccExcluir('+idx+');document.getElementById(\'cc-menu-popup\').remove()" style="padding:10px 16px;cursor:pointer;font-size:13px;color:#ef4444">🗑️ Excluir</div>';
  div.style.top = (e.clientY+4)+'px';
  div.style.left = Math.min(e.clientX, window.innerWidth-180)+'px';
  document.body.appendChild(div);
  setTimeout(function(){ document.addEventListener('click', function rem(){ div.remove(); document.removeEventListener('click', rem); }); }, 10);
}

async function ccSalvar(){
  var get = function(id){ return document.getElementById(id); };
  var nome = get('cc-nome').value.trim();
  if(!nome){ alert('Informe o nome da campanha.'); return; }
  var ccVal = get('cc-curso-combo').value;
  var tipo = null, id = null;
  if(ccVal){ var parts = ccVal.split(':'); tipo = parts[0]; id = parts[1]; }
  var obj = {
    nome: nome,
    curso_id: tipo === 'curso' ? id : null,
    combo_id: tipo === 'combo' ? id : null,
    criativo_desc: get('cc-criativo-desc').value.trim(),
    criativo_url: get('cc-criativo-url').value.trim() || null,
    canal: get('cc-canal').value.trim(),
    data_inicio: get('cc-inicio').value || null,
    data_fim: get('cc-fim').value || null,
    data_prevista_curso: get('cc-data-curso').value || null,
    valor_anunciado: get('cc-valor').value ? parseFloat(get('cc-valor').value) : null,
    orcamento: get('cc-orcamento').value ? parseFloat(get('cc-orcamento').value) : null,
    link_externo: get('cc-link').value.trim() || null,
    status: get('cc-status').value
  };
  try{
    if(_ccEditIdx >= 0 && cursoCampanhas[_ccEditIdx]){
      var existente = cursoCampanhas[_ccEditIdx];
      Object.assign(existente, obj);
      if(existente.id){
        var r = await supa.from('curso_campanhas').update(obj).eq('id', existente.id).eq('salao_id', window.SALAO_ID);
        if(r.error){ console.log('err atualizar campanha', r.error); alert('Não foi possível salvar. Veja o console.'); return; }
      }
    }else{
      var payload = Object.assign({}, obj, { salao_id: window.SALAO_ID });
      var r2 = await supa.from('curso_campanhas').insert([payload]).select('id').single();
      if(r2.error){ console.log('err inserir campanha', r2.error); alert('Não foi possível salvar. Veja o console.'); return; }
      obj.id = r2.data.id;
      cursoCampanhas.unshift(obj);
    }
  }catch(e){ console.log('err salvar campanha', e); alert('Erro ao salvar a campanha.'); return; }
  renderCampanhas();
  if(typeof clPopularFiltros === 'function') clPopularFiltros();
  closeModal('modal-curso-campanha');
  showAlert('Campanha salva com sucesso!');
}

async function ccExcluir(idx){
  var c = cursoCampanhas[idx];
  if(!c) return;
  var temLead = (typeof cursoLeads !== 'undefined') && cursoLeads.some(function(l){ return l.campanha_id === c.id; });
  if(temLead){ alert('Esta campanha tem leads vinculados — remova ou reatribua os leads antes de excluir a campanha.'); return; }
  if(!confirm('Excluir a campanha "'+c.nome+'"?')) return;
  try{
    if(c.id){
      var r = await supa.from('curso_campanhas').delete().eq('id', c.id).eq('salao_id', window.SALAO_ID);
      if(r.error){ console.log('err excluir campanha', r.error); alert('Não foi possível excluir. Veja o console.'); return; }
    }
  }catch(e){ console.log('err excluir campanha', e); return; }
  cursoCampanhas.splice(idx, 1);
  renderCampanhas();
}
