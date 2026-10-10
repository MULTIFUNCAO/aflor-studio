// ===== CURSOS: Leads e interessados — CRM comercial (Prioridade 1) =====
// Funil separado de curso_matriculas: lead é pré-venda (sem valor/pagamento),
// matrícula é venda confirmada. Converter um lead NUNCA duplica o cadastro —
// reaproveita curso_alunos existente por e-mail/telefone quando encontra, e
// reaproveita o wizard de matrícula já existente (abrirNovaMatricula/salvarMatricula)
// em vez de criar um segundo fluxo de "fechar venda".
// Depende dos globais de index.html: supa, window.SALAO_ID, cursos, cursoCombos,
// cursoAlunos, colaboradores, escHtml, fmtDataBR, openModal, closeModal, showAlert,
// salvarAlunoSupa, abrirNovaMatricula, matriculaAoTrocarCursoCombo.

var cursoLeads = [];
var _clEditIdx = -1;
var clViewAtual = 'kanban';
var clFiltro = { curso:'', campanha:'', etapa:'', responsavel:'' };

var CL_ETAPAS = [
  { id:'novo', label:'Novo lead' },
  { id:'atendimento', label:'Em atendimento' },
  { id:'interessado', label:'Interessado' },
  { id:'aguardando_retorno', label:'Aguardando retorno' },
  { id:'aguardando_pagamento', label:'Aguardando pagamento' },
  { id:'matriculado', label:'Matriculado' },
  { id:'nao_fechou', label:'Não fechou' },
  { id:'perdido', label:'Perdido' }
];

function clEtapaLabel(etapa){
  var e = CL_ETAPAS.find(function(x){ return x.id === etapa; });
  return e ? e.label : etapa;
}
function clEtapaBadge(etapa){
  var map = {
    novo:'badge-gray', atendimento:'badge-blue', interessado:'badge-purple',
    aguardando_retorno:'badge-yellow', aguardando_pagamento:'badge-yellow',
    matriculado:'badge-green', nao_fechou:'badge-gray', perdido:'badge-red'
  };
  return '<span class="badge '+(map[etapa]||'badge-gray')+'">'+clEtapaLabel(etapa)+'</span>';
}

async function carregarLeadsSupa(){
  try{
    if(!supa||!window.SALAO_ID)return;
    var r = await supa.from('curso_leads').select('*').eq('salao_id', window.SALAO_ID).order('criado_em', { ascending:false });
    if(r.error){ console.log('err carregar leads', r.error); return; }
    cursoLeads = r.data || [];
    clPopularFiltros();
    renderLeads();
    clRenderDashExtra();
  }catch(e){ console.log('err carregar leads', e); }
}

// ===== filtros =====
function clPopularFiltros(){
  var selCurso = document.getElementById('cl-filtro-curso');
  var selCamp = document.getElementById('cl-filtro-campanha');
  var selResp = document.getElementById('cl-filtro-responsavel');
  if(selCurso){
    var optsC = ['<option value="">Curso/combo: todos</option>'];
    cursos.forEach(function(c){ optsC.push('<option value="curso:'+c.id+'">🎓 '+escHtml(c.nome)+'</option>'); });
    cursoCombos.forEach(function(c){ optsC.push('<option value="combo:'+c.id+'">🧩 '+escHtml(c.nome)+'</option>'); });
    var prevC = selCurso.value; selCurso.innerHTML = optsC.join(''); if(prevC) selCurso.value = prevC;
  }
  if(selCamp){
    var optsCamp = ['<option value="">Campanha: todas</option>'].concat(
      (typeof cursoCampanhas !== 'undefined' ? cursoCampanhas : []).map(function(c){ return '<option value="'+c.id+'">'+escHtml(c.nome)+'</option>'; })
    );
    var prevCamp = selCamp.value; selCamp.innerHTML = optsCamp.join(''); if(prevCamp) selCamp.value = prevCamp;
  }
  if(selResp){
    var optsR = ['<option value="">Responsável: todos</option>'].concat(
      colaboradores.filter(function(c){ return c.status !== 'Inativo' && c.id != null; }).map(function(c){ return '<option value="'+c.id+'">'+escHtml(c.nome)+'</option>'; })
    );
    var prevR = selResp.value; selResp.innerHTML = optsR.join(''); if(prevR) selResp.value = prevR;
  }
}
function clAplicarFiltros(){
  clFiltro.curso = (document.getElementById('cl-filtro-curso')||{}).value || '';
  clFiltro.campanha = (document.getElementById('cl-filtro-campanha')||{}).value || '';
  clFiltro.etapa = (document.getElementById('cl-filtro-etapa')||{}).value || '';
  clFiltro.responsavel = (document.getElementById('cl-filtro-responsavel')||{}).value || '';
  renderLeads();
}
function clLeadsFiltrados(){
  return cursoLeads.filter(function(l){
    if(clFiltro.curso){
      var parts = clFiltro.curso.split(':');
      if(parts[0]==='curso' && l.curso_id !== parts[1]) return false;
      if(parts[0]==='combo' && l.combo_id !== parts[1]) return false;
    }
    if(clFiltro.campanha && l.campanha_id !== clFiltro.campanha) return false;
    if(clFiltro.etapa && l.etapa !== clFiltro.etapa) return false;
    if(clFiltro.responsavel && l.responsavel_id !== clFiltro.responsavel) return false;
    return true;
  });
}

// ===== view switch (tabela / kanban) =====
function clSetView(v){
  clViewAtual = v;
  var bKan = document.getElementById('cl-view-kanban');
  var bTab = document.getElementById('cl-view-tabela');
  if(bKan) bKan.className = 'tab'+(v==='kanban'?' active':'');
  if(bTab) bTab.className = 'tab'+(v==='tabela'?' active':'');
  renderLeads();
}

function renderLeads(){
  var kanWrap = document.getElementById('leads-kanban');
  var tabWrap = document.getElementById('leads-tabela');
  if(!kanWrap || !tabWrap) return;
  kanWrap.style.display = clViewAtual === 'kanban' ? 'flex' : 'none';
  tabWrap.style.display = clViewAtual === 'tabela' ? 'block' : 'none';
  if(clViewAtual === 'kanban') renderLeadsKanban(); else renderLeadsTabela();
}

function clNomeCursoCombo(l){
  if(l.curso_id){ var c = cursos.find(function(x){ return x.id === l.curso_id; }); return c ? c.nome : 'Curso removido'; }
  if(l.combo_id){ var cb = cursoCombos.find(function(x){ return x.id === l.combo_id; }); return cb ? cb.nome : 'Combo removido'; }
  return '—';
}
function clNomeResponsavel(id){
  if(!id) return '—';
  var c = colaboradores.find(function(x){ return x.id === id; });
  return c ? c.nome : '—';
}
function clNomeCampanha(id){
  if(!id) return '—';
  var c = (typeof cursoCampanhas !== 'undefined' ? cursoCampanhas : []).find(function(x){ return x.id === id; });
  return c ? c.nome : '—';
}

function renderLeadsKanban(){
  var wrap = document.getElementById('leads-kanban');
  var leads = clLeadsFiltrados();
  wrap.innerHTML = CL_ETAPAS.map(function(etapa){
    var doLs = leads.filter(function(l){ return l.etapa === etapa.id; });
    return '<div class="cl-kanban-col" ondragover="event.preventDefault()" ondrop="clDrop(event,\''+etapa.id+'\')">'
      + '<div class="cl-kanban-col-head">'+etapa.label+' <span class="cl-kanban-count">'+doLs.length+'</span></div>'
      + '<div class="cl-kanban-col-body">'
      + doLs.map(function(l){
          var idx = cursoLeads.indexOf(l);
          return '<div class="cl-kanban-card" draggable="true" ondragstart="clDragStart(event,\''+l.id+'\')" onclick="clAbrirFicha('+idx+')">'
            + '<div style="font-weight:700;font-size:12.5px">'+escHtml(l.nome)+'</div>'
            + '<div style="font-size:11px;color:#888;margin-top:2px">'+escHtml(clNomeCursoCombo(l))+'</div>'
            + (l.telefone||l.whatsapp ? '<div style="font-size:11px;color:#aaa;margin-top:4px">📞 '+escHtml(l.telefone||l.whatsapp)+'</div>' : '')
            + '</div>';
        }).join('')
      + (!doLs.length ? '<div style="padding:14px 4px;text-align:center;color:#bbb;font-size:11px">Vazio</div>' : '')
      + '</div></div>';
  }).join('');
}

function renderLeadsTabela(){
  var wrap = document.getElementById('leads-tabela');
  var leads = clLeadsFiltrados();
  if(!leads.length){ wrap.innerHTML = '<div style="padding:40px;text-align:center;color:#999;font-size:13px">Nenhum lead encontrado.</div>'; return; }
  wrap.innerHTML = '<table><thead><tr>'
    + '<th>Nome</th><th>Contato</th><th>Curso/Combo</th><th>Campanha</th><th>Etapa</th><th>Responsável</th><th>Entrada</th><th></th>'
    + '</tr></thead><tbody>'
    + leads.map(function(l){
        var idx = cursoLeads.indexOf(l);
        return '<tr>'
          + '<td style="font-weight:600;cursor:pointer" onclick="clAbrirFicha('+idx+')">'+escHtml(l.nome)+'</td>'
          + '<td>'+escHtml(l.telefone||l.whatsapp||l.email||'—')+'</td>'
          + '<td>'+escHtml(clNomeCursoCombo(l))+'</td>'
          + '<td>'+escHtml(clNomeCampanha(l.campanha_id))+'</td>'
          + '<td>'+clEtapaBadge(l.etapa)+'</td>'
          + '<td>'+escHtml(clNomeResponsavel(l.responsavel_id))+'</td>'
          + '<td>'+(l.data_entrada?fmtDataBR(l.data_entrada):'—')+'</td>'
          + '<td><button onclick="clMenu(event,'+idx+')" style="background:none;border:none;cursor:pointer;font-size:18px;color:#888">⋮</button></td>'
          + '</tr>';
      }).join('')
    + '</tbody></table>';
}

// ===== drag and drop (kanban) =====
function clDragStart(e, leadId){ e.dataTransfer.setData('text/plain', leadId); }
function clDrop(e, novaEtapa){
  e.preventDefault();
  var leadId = e.dataTransfer.getData('text/plain');
  clMudarEtapa(leadId, novaEtapa);
}

async function clMudarEtapa(leadId, novaEtapa){
  var lead = cursoLeads.find(function(l){ return l.id === leadId; });
  if(!lead) return;
  if(lead.etapa === novaEtapa) return;
  if(novaEtapa === 'matriculado'){ clConverterEmMatricula(leadId); return; }
  if(novaEtapa === 'perdido'){ clAbrirMarcarPerdido(leadId); return; }
  var etapaAnterior = lead.etapa;
  lead.etapa = novaEtapa;
  renderLeads();
  try{
    var r = await supa.from('curso_leads').update({ etapa: novaEtapa }).eq('id', leadId).eq('salao_id', window.SALAO_ID);
    if(r.error){ console.log('err mudar etapa lead', r.error); }
    await supa.from('curso_lead_historico').insert([{ lead_id: leadId, salao_id: window.SALAO_ID, etapa_anterior: etapaAnterior, etapa_nova: novaEtapa, registrado_por: (window.SALAO_NOME||'Administrador') }]);
  }catch(e){ console.log('err mudar etapa lead', e); }
}

// ===== CRUD lead =====
function clPopularSelectCursoCombo(sel){
  var elSel = document.getElementById('cl-curso-combo');
  if(!elSel) return;
  var opts = ['<option value="">— Sem curso/combo específico —</option>'];
  cursos.forEach(function(c){ opts.push('<option value="curso:'+c.id+'">🎓 '+escHtml(c.nome)+'</option>'); });
  cursoCombos.forEach(function(c){ opts.push('<option value="combo:'+c.id+'">🧩 '+escHtml(c.nome)+'</option>'); });
  elSel.innerHTML = opts.join('');
  if(sel) elSel.value = sel;
}
function clPopularSelectCampanha(sel){
  var elSel = document.getElementById('cl-campanha');
  if(!elSel) return;
  var opts = ['<option value="">— Sem campanha —</option>'].concat(
    (typeof cursoCampanhas !== 'undefined' ? cursoCampanhas : []).map(function(c){ return '<option value="'+c.id+'">'+escHtml(c.nome)+'</option>'; })
  );
  elSel.innerHTML = opts.join('');
  if(sel) elSel.value = sel;
}
function clPopularSelectResponsavel(sel){
  var elSel = document.getElementById('cl-responsavel');
  if(!elSel) return;
  var opts = ['<option value="">— Sem responsável definido —</option>'].concat(
    colaboradores.filter(function(c){ return c.status !== 'Inativo' && c.id != null; }).map(function(c){ return '<option value="'+c.id+'">'+escHtml(c.nome)+'</option>'; })
  );
  elSel.innerHTML = opts.join('');
  if(sel) elSel.value = sel;
}

function clAbrirNovoLead(){
  _clEditIdx = -1;
  clPopularSelectCursoCombo();
  clPopularSelectCampanha();
  clPopularSelectResponsavel();
  ['cl-nome','cl-telefone','cl-whatsapp','cl-email','cl-periodo','cl-observacoes','cl-data-retorno'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value = '';
  });
  document.getElementById('cl-etapa').value = 'novo';
  document.querySelector('#modal-curso-lead .modal-title').textContent = '🧲 Novo Lead';
  openModal('modal-curso-lead');
}

function clEditar(idx){
  var l = cursoLeads[idx];
  if(!l) return;
  _clEditIdx = idx;
  clPopularSelectCursoCombo(l.curso_id ? ('curso:'+l.curso_id) : (l.combo_id ? ('combo:'+l.combo_id) : ''));
  clPopularSelectCampanha(l.campanha_id || '');
  clPopularSelectResponsavel(l.responsavel_id || '');
  document.getElementById('cl-nome').value = l.nome || '';
  document.getElementById('cl-telefone').value = l.telefone || '';
  document.getElementById('cl-whatsapp').value = l.whatsapp || '';
  document.getElementById('cl-email').value = l.email || '';
  document.getElementById('cl-periodo').value = l.periodo_preferencia || '';
  document.getElementById('cl-observacoes').value = l.observacoes || '';
  document.getElementById('cl-data-retorno').value = l.data_retorno || '';
  document.getElementById('cl-etapa').value = l.etapa || 'novo';
  document.querySelector('#modal-curso-lead .modal-title').textContent = '✏️ Editar Lead';
  openModal('modal-curso-lead');
}

function clMenu(e, idx){
  e.stopPropagation();
  var old = document.getElementById('cl-menu-popup'); if(old) old.remove();
  var l = cursoLeads[idx];
  var div = document.createElement('div');
  div.id = 'cl-menu-popup';
  div.style.cssText = 'position:fixed;background:#fff;border:1px solid #e5e5e5;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.12);z-index:9999;min-width:190px;padding:4px 0';
  div.innerHTML = '<div onclick="clAbrirFicha('+idx+');document.getElementById(\'cl-menu-popup\').remove()" style="padding:10px 16px;cursor:pointer;font-size:13px">📋 Abrir ficha</div>'
    + '<div onclick="clEditar('+idx+');document.getElementById(\'cl-menu-popup\').remove()" style="padding:10px 16px;cursor:pointer;font-size:13px">✏️ Editar</div>'
    + (!l.matricula_id ? '<div onclick="clConverterEmMatricula(\''+l.id+'\');document.getElementById(\'cl-menu-popup\').remove()" style="padding:10px 16px;cursor:pointer;font-size:13px;color:#16a34a">✅ Converter em matrícula</div>' : '')
    + (!l.matricula_id ? '<div onclick="clAbrirMarcarPerdido(\''+l.id+'\');document.getElementById(\'cl-menu-popup\').remove()" style="padding:10px 16px;cursor:pointer;font-size:13px;color:#ef4444">🚫 Marcar como perdido</div>' : '')
    + '<div onclick="clExcluir('+idx+');document.getElementById(\'cl-menu-popup\').remove()" style="padding:10px 16px;cursor:pointer;font-size:13px;color:#ef4444">🗑️ Excluir</div>';
  div.style.top = (e.clientY+4)+'px';
  div.style.left = Math.min(e.clientX, window.innerWidth-200)+'px';
  document.body.appendChild(div);
  setTimeout(function(){ document.addEventListener('click', function rem(){ div.remove(); document.removeEventListener('click', rem); }); }, 10);
}

async function clSalvar(){
  var get = function(id){ return document.getElementById(id); };
  var nome = get('cl-nome').value.trim();
  if(!nome){ alert('Informe o nome do lead.'); return; }
  var ccVal = get('cl-curso-combo').value;
  var tipo = null, id = null;
  if(ccVal){ var parts = ccVal.split(':'); tipo = parts[0]; id = parts[1]; }
  var obj = {
    nome: nome,
    telefone: get('cl-telefone').value.trim(),
    whatsapp: get('cl-whatsapp').value.trim(),
    email: get('cl-email').value.trim(),
    curso_id: tipo === 'curso' ? id : null,
    combo_id: tipo === 'combo' ? id : null,
    campanha_id: get('cl-campanha').value || null,
    responsavel_id: get('cl-responsavel').value || null,
    periodo_preferencia: get('cl-periodo').value.trim(),
    observacoes: get('cl-observacoes').value.trim(),
    data_retorno: get('cl-data-retorno').value || null,
    etapa: get('cl-etapa').value
  };
  try{
    if(_clEditIdx >= 0 && cursoLeads[_clEditIdx]){
      var existente = cursoLeads[_clEditIdx];
      var etapaAnterior = existente.etapa;
      Object.assign(existente, obj);
      if(existente.id){
        var r = await supa.from('curso_leads').update(obj).eq('id', existente.id).eq('salao_id', window.SALAO_ID);
        if(r.error){ console.log('err atualizar lead', r.error); alert('Não foi possível salvar. Veja o console.'); return; }
        if(etapaAnterior !== obj.etapa){
          await supa.from('curso_lead_historico').insert([{ lead_id: existente.id, salao_id: window.SALAO_ID, etapa_anterior: etapaAnterior, etapa_nova: obj.etapa, registrado_por: (window.SALAO_NOME||'Administrador') }]);
        }
      }
    }else{
      var payload = Object.assign({}, obj, { salao_id: window.SALAO_ID });
      var r2 = await supa.from('curso_leads').insert([payload]).select('id').single();
      if(r2.error){ console.log('err inserir lead', r2.error); alert('Não foi possível salvar. Veja o console.'); return; }
      obj.id = r2.data.id;
      obj.data_entrada = new Date().toISOString().slice(0,10);
      cursoLeads.unshift(obj);
      await supa.from('curso_lead_historico').insert([{ lead_id: obj.id, salao_id: window.SALAO_ID, etapa_anterior: null, etapa_nova: obj.etapa, observacao: 'Lead criado', registrado_por: (window.SALAO_NOME||'Administrador') }]);
    }
  }catch(e){ console.log('err salvar lead', e); alert('Erro ao salvar o lead.'); return; }
  renderLeads();
  clRenderDashExtra();
  closeModal('modal-curso-lead');
  showAlert('Lead salvo com sucesso!');
}

async function clExcluir(idx){
  var l = cursoLeads[idx];
  if(!l) return;
  if(l.matricula_id){ alert('Este lead já foi convertido em matrícula — não é possível excluir, apenas consultar o histórico.'); return; }
  if(!confirm('Excluir o lead "'+l.nome+'"?')) return;
  try{
    if(l.id){
      await supa.from('curso_lead_historico').delete().eq('lead_id', l.id).eq('salao_id', window.SALAO_ID);
      var r = await supa.from('curso_leads').delete().eq('id', l.id).eq('salao_id', window.SALAO_ID);
      if(r.error){ console.log('err excluir lead', r.error); alert('Não foi possível excluir. Veja o console.'); return; }
    }
  }catch(e){ console.log('err excluir lead', e); return; }
  cursoLeads.splice(idx, 1);
  renderLeads();
  clRenderDashExtra();
}

// ===== ficha do lead: histórico de atendimento =====
async function clAbrirFicha(idx){
  var l = cursoLeads[idx];
  if(!l) return;
  window._clFichaIdAtual = l.id;
  document.getElementById('cl-ficha-titulo').textContent = '🧲 ' + l.nome;
  document.getElementById('cl-ficha-corpo').innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:13px">Carregando...</div>';
  openModal('modal-curso-lead-ficha');
  try{
    var r = await supa.from('curso_lead_historico').select('*').eq('salao_id', window.SALAO_ID).eq('lead_id', l.id).order('criado_em', { ascending:false });
    clRenderFicha(l, r.data || []);
  }catch(e){ console.log('err carregar historico lead', e); clRenderFicha(l, []); }
}
function clRenderFicha(l, historico){
  var wrap = document.getElementById('cl-ficha-corpo');
  if(!wrap) return;
  var infoHtml = '<div style="background:var(--gray-50);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:12.5px;line-height:1.6">'
    + '<div><b>Contato:</b> '+escHtml(l.telefone||l.whatsapp||l.email||'—')+'</div>'
    + '<div><b>Curso/Combo:</b> '+escHtml(clNomeCursoCombo(l))+'</div>'
    + '<div><b>Campanha:</b> '+escHtml(clNomeCampanha(l.campanha_id))+'</div>'
    + '<div><b>Responsável:</b> '+escHtml(clNomeResponsavel(l.responsavel_id))+'</div>'
    + '<div><b>Etapa atual:</b> '+clEtapaBadge(l.etapa)+'</div>'
    + (l.motivo_perda ? '<div><b>Motivo da perda:</b> '+escHtml(l.motivo_perda)+'</div>' : '')
    + (l.matricula_id ? '<div style="color:#16a34a;font-weight:700;margin-top:4px">✅ Convertido em matrícula</div>' : '')
    + '</div>';
  var notaHtml = '<div style="display:flex;gap:8px;margin-bottom:14px">'
    + '<input id="cl-nova-observacao" placeholder="Registrar novo atendimento..." style="flex:1"/>'
    + '<button class="btn btn-outline btn-sm" onclick="clRegistrarAtendimento()">Registrar</button>'
    + '</div>';
  var histHtml = !historico.length
    ? '<div style="padding:14px;text-align:center;color:#999;font-size:12.5px">Nenhum atendimento registrado ainda.</div>'
    : historico.map(function(h){
        return '<div style="border-top:1px solid #f0f0f0;padding:8px 0;font-size:12.5px">'
          + '<div style="color:#888;font-size:11px">'+new Date(h.criado_em).toLocaleString('pt-BR')+' · '+escHtml(h.registrado_por||'')+'</div>'
          + (h.etapa_anterior !== h.etapa_nova ? '<div>'+clEtapaBadge(h.etapa_anterior||'novo')+' → '+clEtapaBadge(h.etapa_nova)+'</div>' : '')
          + (h.observacao ? '<div style="margin-top:2px">'+escHtml(h.observacao)+'</div>' : '')
          + '</div>';
      }).join('');
  wrap.innerHTML = infoHtml + notaHtml + histHtml;
  var acoesWrap = document.getElementById('cl-ficha-acoes');
  if(acoesWrap){
    acoesWrap.innerHTML = l.matricula_id ? '' :
      '<button class="btn btn-primary btn-sm" style="flex:1" onclick="clConverterEmMatricula(\''+l.id+'\')">✅ Converter em Matrícula</button>'
      + '<button class="btn btn-outline btn-sm" style="flex:1" onclick="clAbrirMarcarPerdido(\''+l.id+'\')">🚫 Marcar como Perdido</button>';
  }
}
async function clRegistrarAtendimento(){
  var leadId = window._clFichaIdAtual;
  var l = cursoLeads.find(function(x){ return x.id === leadId; });
  if(!l) return;
  var texto = document.getElementById('cl-nova-observacao').value.trim();
  if(!texto){ return; }
  try{
    await supa.from('curso_lead_historico').insert([{ lead_id: leadId, salao_id: window.SALAO_ID, etapa_anterior: l.etapa, etapa_nova: l.etapa, observacao: texto, registrado_por: (window.SALAO_NOME||'Administrador') }]);
  }catch(e){ console.log('err registrar atendimento', e); }
  clAbrirFicha(cursoLeads.indexOf(l));
}

// ===== marcar como perdido (exige motivo) =====
function clAbrirMarcarPerdido(leadId){
  window._clPerdaLeadId = leadId;
  document.getElementById('cl-perda-motivo').value = '';
  openModal('modal-curso-lead-perda');
}
async function clConfirmarPerdido(){
  var leadId = window._clPerdaLeadId;
  var lead = cursoLeads.find(function(l){ return l.id === leadId; });
  if(!lead) return;
  var motivo = document.getElementById('cl-perda-motivo').value.trim();
  if(!motivo){ alert('Informe o motivo da perda.'); return; }
  var etapaAnterior = lead.etapa;
  lead.etapa = 'perdido';
  lead.motivo_perda = motivo;
  try{
    await supa.from('curso_leads').update({ etapa:'perdido', motivo_perda: motivo }).eq('id', leadId).eq('salao_id', window.SALAO_ID);
    await supa.from('curso_lead_historico').insert([{ lead_id: leadId, salao_id: window.SALAO_ID, etapa_anterior: etapaAnterior, etapa_nova:'perdido', observacao: 'Motivo: '+motivo, registrado_por: (window.SALAO_NOME||'Administrador') }]);
  }catch(e){ console.log('err marcar perdido', e); }
  closeModal('modal-curso-lead-perda');
  closeModal('modal-curso-lead-ficha');
  renderLeads();
  clRenderDashExtra();
  showAlert('Lead marcado como perdido.');
}

// ===== conversão lead -> matrícula (reaproveita aluno existente por e-mail/tel) =====
async function clConverterEmMatricula(leadId){
  var lead = cursoLeads.find(function(l){ return l.id === leadId; });
  if(!lead){ alert('Lead não encontrado.'); return; }
  if(lead.matricula_id){ alert('Este lead já foi convertido em matrícula.'); return; }
  var emailNorm = (lead.email || '').trim().toLowerCase();
  var telNorm = (lead.telefone || lead.whatsapp || '').replace(/\D/g, '');
  var alunoExistente = cursoAlunos.find(function(a){
    if(emailNorm && (a.email || '').trim().toLowerCase() === emailNorm) return true;
    if(telNorm && (a.tel || '').replace(/\D/g, '') === telNorm) return true;
    return false;
  });
  var alunoId;
  if(alunoExistente){
    alunoId = alunoExistente.id;
  }else{
    var novoAluno = { nome: lead.nome, cliente_id: null, cpf: '', tel: lead.telefone || lead.whatsapp || '', email: lead.email || '', nasc: null, endereco: '', status: 'ativo' };
    await salvarAlunoSupa(novoAluno);
    if(!novoAluno.id){ alert('Não foi possível criar o cadastro de aluno a partir do lead. Veja o console.'); return; }
    cursoAlunos.push(novoAluno);
    alunoId = novoAluno.id;
  }
  closeModal('modal-curso-lead-ficha');
  closeModal('modal-curso-lead');
  abrirNovaMatricula(alunoId);
  window._matriculaLeadIdContexto = leadId;
  window._matriculaCampanhaIdContexto = lead.campanha_id || null;
  var selCC = document.getElementById('matricula-curso-combo');
  if(selCC && (lead.curso_id || lead.combo_id)){
    selCC.value = lead.curso_id ? ('curso:'+lead.curso_id) : ('combo:'+lead.combo_id);
    if(selCC.value && typeof matriculaAoTrocarCursoCombo === 'function') matriculaAoTrocarCursoCombo();
  }
}

// Hook chamado por salvarMatricula() em index.html ao final de toda matrícula
// nova (de lead ou não) — só age quando há um lead em contexto.
async function onMatriculaCriada(matriculaObj){
  var leadId = window._matriculaLeadIdContexto;
  window._matriculaLeadIdContexto = null;
  window._matriculaCampanhaIdContexto = null;
  if(!leadId) return;
  var lead = cursoLeads.find(function(l){ return l.id === leadId; });
  if(!lead) return;
  var etapaAnterior = lead.etapa;
  lead.etapa = 'matriculado';
  lead.matricula_id = matriculaObj.id;
  try{
    await supa.from('curso_leads').update({ etapa:'matriculado', matricula_id: matriculaObj.id }).eq('id', leadId).eq('salao_id', window.SALAO_ID);
    await supa.from('curso_lead_historico').insert([{ lead_id: leadId, salao_id: window.SALAO_ID, etapa_anterior: etapaAnterior, etapa_nova:'matriculado', observacao:'Convertido em matrícula', registrado_por: (window.SALAO_NOME||'Administrador') }]);
  }catch(e){ console.log('err concluir conversao lead', e); }
  renderLeads();
  if(typeof renderCampanhas === 'function') renderCampanhas();
  clRenderDashExtra();
  showAlert('Lead convertido em matrícula com sucesso!');
}

// ===== KPIs extras no dashboard de Cursos (anexados, não substituem os existentes) =====
function clRenderDashExtra(){
  var host = document.getElementById('cursos-dash-cards');
  if(!host) return;
  var antigo = document.getElementById('cl-dash-extra-cards');
  if(antigo) antigo.remove();
  var leadsAtivos = cursoLeads.filter(function(l){ return ['novo','atendimento','interessado','aguardando_retorno','aguardando_pagamento'].indexOf(l.etapa) !== -1; }).length;
  var leadsConvertidos = cursoLeads.filter(function(l){ return l.matricula_id; }).length;
  var leadsEncerrados = cursoLeads.filter(function(l){ return l.etapa === 'matriculado' || l.etapa === 'nao_fechou' || l.etapa === 'perdido'; }).length;
  var conversaoGeral = leadsEncerrados ? Math.round((leadsConvertidos / leadsEncerrados) * 100) : 0;
  var campanhasAtivas = (typeof cursoCampanhas !== 'undefined' ? cursoCampanhas : []).filter(function(c){ return c.status === 'ativa'; }).length;
  var div = document.createElement('div');
  div.id = 'cl-dash-extra-cards';
  div.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px;grid-column:1 / -1';
  div.innerHTML = [
    { label:'Leads em andamento', valor:leadsAtivos },
    { label:'Conversão comercial', valor:conversaoGeral+'%' },
    { label:'Campanhas ativas', valor:campanhasAtivas }
  ].map(function(k){
    return '<div class="fdash-kpi-card" style="cursor:default"><div style="font-size:11px;color:#888;font-weight:700;margin-bottom:6px">'+k.label+'</div><div style="font-size:22px;font-weight:800;color:#111">'+k.valor+'</div></div>';
  }).join('');
  host.appendChild(div);
}
