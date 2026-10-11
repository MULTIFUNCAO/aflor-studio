// ===== CURSOS: Relatórios e Dashboard (Prioridade 3, frente 4 — última) =====
// Todos os indicadores calculados a partir de dado real já carregado
// (cursos, cursoCombos, cursoCampanhas, cursoLeads, cursoMatriculas,
// cursoTurmas, cursoAlunos) + 2 consultas próprias (materiais e progresso
// de conteúdo, que não ficam em cache global em outro lugar). Nenhum
// número fixo/fictício — tudo some se não houver dado.
// Depende dos globais de index.html: supa, window.SALAO_ID, cursos,
// cursoCombos, cursoCampanhas, cursoLeads, cursoMatriculas, cursoTurmas,
// cursoAlunos, cursoCorrecoesPendentes, escHtml, fmtDataBR.

var relDados = { materiais: [], progresso: [] };
var relFiltro = { dataInicio:'', dataFim:'', curso:'', campanha:'', turma:'' };

async function carregarRelatoriosDadosSupa(){
  try{
    if(!supa||!window.SALAO_ID)return;
    var r = await Promise.all([
      supa.from('curso_materiais').select('id,curso_id').eq('salao_id', window.SALAO_ID),
      supa.from('curso_progresso_conteudo').select('matricula_id,tipo_conteudo,status').eq('salao_id', window.SALAO_ID)
    ]);
    relDados.materiais = r[0].data || [];
    relDados.progresso = r[1].data || [];
    relPopularFiltros();
    renderRelatorios();
  }catch(e){ console.log('err carregar dados relatorios', e); }
}

function relPopularFiltros(){
  var selCurso = document.getElementById('rel-filtro-curso');
  var selCamp = document.getElementById('rel-filtro-campanha');
  var selTurma = document.getElementById('rel-filtro-turma');
  if(selCurso){
    var optsC = ['<option value="">Curso/combo: todos</option>'];
    cursos.forEach(function(c){ optsC.push('<option value="curso:'+c.id+'">🎓 '+escHtml(c.nome)+'</option>'); });
    cursoCombos.forEach(function(c){ optsC.push('<option value="combo:'+c.id+'">🧩 '+escHtml(c.nome)+'</option>'); });
    var prev = selCurso.value; selCurso.innerHTML = optsC.join(''); if(prev) selCurso.value = prev;
  }
  if(selCamp){
    var optsCamp = ['<option value="">Campanha: todas</option>'].concat(
      (typeof cursoCampanhas!=='undefined'?cursoCampanhas:[]).map(function(c){ return '<option value="'+c.id+'">'+escHtml(c.nome)+'</option>'; })
    );
    var prevCamp = selCamp.value; selCamp.innerHTML = optsCamp.join(''); if(prevCamp) selCamp.value = prevCamp;
  }
  if(selTurma){
    var optsT = ['<option value="">Turma: todas</option>'].concat(
      cursoTurmas.map(function(t){ return '<option value="'+t.id+'">'+escHtml(t.nome)+'</option>'; })
    );
    var prevT = selTurma.value; selTurma.innerHTML = optsT.join(''); if(prevT) selTurma.value = prevT;
  }
}
function relAplicarFiltros(){
  relFiltro.dataInicio = (document.getElementById('rel-filtro-data-inicio')||{}).value || '';
  relFiltro.dataFim = (document.getElementById('rel-filtro-data-fim')||{}).value || '';
  relFiltro.curso = (document.getElementById('rel-filtro-curso')||{}).value || '';
  relFiltro.campanha = (document.getElementById('rel-filtro-campanha')||{}).value || '';
  relFiltro.turma = (document.getElementById('rel-filtro-turma')||{}).value || '';
  renderRelatorios();
}
function relBateCursoFiltro(cursoId, comboId){
  if(!relFiltro.curso) return true;
  var parts = relFiltro.curso.split(':');
  if(parts[0]==='curso') return cursoId === parts[1];
  return comboId === parts[1];
}
function relBateData(dataStr){
  if(!dataStr) return !relFiltro.dataInicio && !relFiltro.dataFim;
  if(relFiltro.dataInicio && dataStr < relFiltro.dataInicio) return false;
  if(relFiltro.dataFim && dataStr > relFiltro.dataFim) return false;
  return true;
}

function relLeadsFiltrados(){
  return cursoLeads.filter(function(l){
    if(!relBateCursoFiltro(l.curso_id, l.combo_id)) return false;
    if(relFiltro.campanha && l.campanha_id !== relFiltro.campanha) return false;
    if(!relBateData(l.data_entrada)) return false;
    return true;
  });
}
function relMatriculasFiltradas(){
  return cursoMatriculas.filter(function(m){
    if(!relBateCursoFiltro(m.curso_id, m.combo_id)) return false;
    if(relFiltro.campanha && m.campanha_id !== relFiltro.campanha) return false;
    if(relFiltro.turma && m.turma_id !== relFiltro.turma) return false;
    if(!relBateData(m.data_matricula)) return false;
    return true;
  });
}
function relTurmasFiltradas(){
  return cursoTurmas.filter(function(t){
    if(relFiltro.turma && t.id !== relFiltro.turma) return false;
    if(!relBateCursoFiltro(t.curso_id, t.combo_id)) return false;
    return true;
  });
}

function relNomeCursoCombo(cursoId, comboId){
  if(cursoId){ var c = cursos.find(function(x){return x.id===cursoId;}); return c ? c.nome : 'Curso removido'; }
  if(comboId){ var cb = cursoCombos.find(function(x){return x.id===comboId;}); return cb ? cb.nome : 'Combo removido'; }
  return '— sem curso/combo —';
}

function renderRelatorios(){
  var leads = relLeadsFiltrados();
  var matriculas = relMatriculasFiltradas();
  var turmas = relTurmasFiltradas();

  // ---- KPIs ----
  var cursosAtivos = cursos.filter(function(c){return c.status==='ativo';}).length;
  var combosAtivos = cursoCombos.filter(function(c){return c.status==='ativo';}).length;
  var campanhasAtivas = (typeof cursoCampanhas!=='undefined'?cursoCampanhas:[]).filter(function(c){return c.status==='ativa';}).length;
  var leadsEmAtendimento = leads.filter(function(l){ return ['novo','atendimento','interessado','aguardando_retorno','aguardando_pagamento'].indexOf(l.etapa)!==-1; }).length;
  var vendasConfirmadas = matriculas.filter(function(m){ return ['matriculado','andamento','concluido'].indexOf(m.status)!==-1; }).length;
  var matriculasPendentes = matriculas.filter(function(m){ return m.status==='pagamento_pendente'; }).length;
  var leadsConvertidos = leads.filter(function(l){ return l.matricula_id; }).length;
  var leadsEncerrados = leads.filter(function(l){ return ['matriculado','nao_fechou','perdido'].indexOf(l.etapa)!==-1; }).length;
  var conversaoComercial = leadsEncerrados ? Math.round((leadsConvertidos/leadsEncerrados)*100) : 0;
  var alunosSemPortal = cursoAlunos.filter(function(a){
    return !a.auth_user_id && cursoMatriculas.some(function(m){ return m.aluno_id===a.id && ['matriculado','andamento','concluido'].indexOf(m.status)!==-1; });
  }).length;
  var atividadesPendentes = (typeof cursoCorrecoesPendentes!=='undefined') ? cursoCorrecoesPendentes.length : 0;

  var matriculasAtivasTodas = cursoMatriculas.filter(function(m){ return ['matriculado','andamento','concluido'].indexOf(m.status)!==-1; });
  var materiaisPorCurso = {};
  relDados.materiais.forEach(function(mt){ materiaisPorCurso[mt.curso_id] = (materiaisPorCurso[mt.curso_id]||0)+1; });
  var progressoPorMatricula = {};
  relDados.progresso.forEach(function(p){
    if(!progressoPorMatricula[p.matricula_id]) progressoPorMatricula[p.matricula_id] = { aulasConcl:0, aulasTotal:0, materialAberto:false };
    if(p.tipo_conteudo==='material' && (p.status==='em_andamento'||p.status==='concluido')) progressoPorMatricula[p.matricula_id].materialAberto = true;
  });
  var alunosSemApostila = matriculasAtivasTodas.filter(function(m){
    var cursoIds = m.curso_id ? [m.curso_id] : cursoComboItens.filter(function(it){return it.combo_id===m.combo_id;}).map(function(it){return it.curso_id;});
    var temMaterial = cursoIds.some(function(id){ return materiaisPorCurso[id]; });
    if(!temMaterial) return false; // curso sem apostila nenhuma cadastrada não entra na métrica
    var prog = progressoPorMatricula[m.id];
    return !prog || !prog.materialAberto;
  }).length;

  // progresso médio nas aulas (só aulas, não materiais) das matrículas ativas filtradas
  var progressoAulasPct = (function(){
    var rConcl = {}; // matricula_id -> contagem de aula concluida
    relDados.progresso.forEach(function(p){
      if(p.tipo_conteudo==='aula' && p.status==='concluido'){ rConcl[p.matricula_id] = (rConcl[p.matricula_id]||0)+1; }
    });
    var valores = matriculas.filter(function(m){ return ['matriculado','andamento','concluido'].indexOf(m.status)!==-1; })
      .map(function(m){ return rConcl[m.id]||0; });
    // sem total de aulas por matrícula carregado aqui (evita N+1 queries pesadas);
    // reportamos contagem média de aulas concluídas por aluno, não %, pra não fingir precisão que não temos.
    if(!valores.length) return null;
    var soma = valores.reduce(function(a,b){return a+b;},0);
    return (soma/valores.length).toFixed(1);
  })();

  var kpis = [
    { label:'Cursos ativos', valor:cursosAtivos },
    { label:'Combos ativos', valor:combosAtivos },
    { label:'Campanhas em circulação', valor:campanhasAtivas },
    { label:'Leads em atendimento', valor:leadsEmAtendimento },
    { label:'Vendas confirmadas', valor:vendasConfirmadas },
    { label:'Matrículas pendentes', valor:matriculasPendentes },
    { label:'Conversão comercial', valor:conversaoComercial+'%' },
    { label:'Alunos sem acesso ao portal', valor:alunosSemPortal },
    { label:'Alunos sem apostila aberta', valor:alunosSemApostila },
    { label:'Atividades pendentes de correção', valor:atividadesPendentes },
    { label:'Aulas concluídas por aluno (média)', valor: progressoAulasPct!=null ? progressoAulasPct : '—' }
  ];
  var wrap = document.getElementById('relatorios-kpis');
  if(wrap){
    wrap.innerHTML = kpis.map(function(k){
      return '<div class="fdash-kpi-card" style="cursor:default"><div style="font-size:11px;color:#888;font-weight:700;margin-bottom:6px">'+k.label+'</div><div style="font-size:22px;font-weight:800;color:#111">'+k.valor+'</div></div>';
    }).join('');
  }

  // ---- Leads por campanha ----
  var porCampanha = {};
  leads.forEach(function(l){
    var chave = l.campanha_id || '__sem__';
    porCampanha[chave] = (porCampanha[chave]||0)+1;
  });
  var tblCampanha = document.getElementById('relatorios-leads-campanha');
  if(tblCampanha){
    var linhasCampanha = Object.keys(porCampanha).map(function(k){
      var nome = k==='__sem__' ? '— sem campanha —' : (((typeof cursoCampanhas!=='undefined'?cursoCampanhas:[]).find(function(c){return c.id===k;})||{}).nome || 'Campanha removida');
      return { nome:nome, qtd:porCampanha[k] };
    }).sort(function(a,b){return b.qtd-a.qtd;});
    tblCampanha.innerHTML = linhasCampanha.length ? ('<table><thead><tr><th>Campanha</th><th>Leads</th></tr></thead><tbody>'
      + linhasCampanha.map(function(l){ return '<tr><td>'+escHtml(l.nome)+'</td><td>'+l.qtd+'</td></tr>'; }).join('')
      + '</tbody></table>') : '<div style="padding:16px;text-align:center;color:#999;font-size:12.5px">Sem leads no período/filtro.</div>';
  }

  // ---- Leads por curso ----
  var porCurso = {};
  leads.forEach(function(l){
    var chave = (l.curso_id||'')+'|'+(l.combo_id||'');
    if(!porCurso[chave]) porCurso[chave] = { cursoId:l.curso_id, comboId:l.combo_id, qtd:0 };
    porCurso[chave].qtd++;
  });
  var tblCurso = document.getElementById('relatorios-leads-curso');
  if(tblCurso){
    var linhasCurso = Object.values(porCurso).sort(function(a,b){return b.qtd-a.qtd;});
    tblCurso.innerHTML = linhasCurso.length ? ('<table><thead><tr><th>Curso/Combo</th><th>Leads</th></tr></thead><tbody>'
      + linhasCurso.map(function(l){ return '<tr><td>'+escHtml(relNomeCursoCombo(l.cursoId,l.comboId))+'</td><td>'+l.qtd+'</td></tr>'; }).join('')
      + '</tbody></table>') : '<div style="padding:16px;text-align:center;color:#999;font-size:12.5px">Sem leads no período/filtro.</div>';
  }

  // ---- Alunos por turma / ocupação ----
  var tblTurmas = document.getElementById('relatorios-turmas');
  if(tblTurmas){
    tblTurmas.innerHTML = turmas.length ? ('<table><thead><tr><th>Turma</th><th>Alunos</th><th>Ocupação</th></tr></thead><tbody>'
      + turmas.map(function(t){
          var qtdAlunos = cursoMatriculas.filter(function(m){ return m.turma_id===t.id && ['matriculado','andamento','concluido'].indexOf(m.status)!==-1; }).length;
          var pct = t.vagas_maximas ? Math.round(((t.vagas_ocupadas||0)/t.vagas_maximas)*100) : 0;
          return '<tr><td>'+escHtml(t.nome)+'</td><td>'+qtdAlunos+'</td><td>'+(t.vagas_ocupadas||0)+'/'+(t.vagas_maximas||0)+' ('+pct+'%)</td></tr>';
        }).join('')
      + '</tbody></table>') : '<div style="padding:16px;text-align:center;color:#999;font-size:12.5px">Nenhuma turma no filtro.</div>';
  }
}
