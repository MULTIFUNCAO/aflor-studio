// ===== CURSOS: Notificações e comunicados (Prioridade 3, frente 1) =====
// Envio manual de avisos pro Portal do Aluno — não existe integração de
// WhatsApp/e-mail no projeto, então a notificação interna (curso_notificacoes)
// é o único canal real hoje. Cada envio vira 1 linha por aluno destinatário
// (schema não tem conceito de "grupo" — resolvemos a lista de alunos no
// momento do envio e inserimos em lote). Lotes enviados juntos compartilham
// um lote_id (gerado no client, guardado em entidade_ref) só pra agrupar a
// exibição no admin — não é uma entidade nova no banco.
// Depende dos globais de index.html: supa, window.SALAO_ID, window.SALAO_NOME,
// cursos, cursoCombos, cursoTurmas, cursoAlunos, cursoMatriculas, escHtml,
// fmtDataBR, openModal, closeModal, showAlert.

var cursoNotificacoes = [];

var CN_TIPOS = [
  { id:'comunicado', label:'Aviso geral' },
  { id:'aula_amanha', label:'Aula amanhã' },
  { id:'alteracao_horario', label:'Alteração de horário' },
  { id:'nova_apostila', label:'Novo conteúdo liberado (apostila/vídeo)' },
  { id:'live_evento', label:'Live / evento' },
  { id:'exercicio_corrigido', label:'Exercício corrigido' },
  { id:'aprovado_prova', label:'Aprovado em prova' },
  { id:'certificado_disponivel', label:'Certificado disponível' }
];
function cnTipoLabel(t){ var x = CN_TIPOS.find(function(o){ return o.id === t; }); return x ? x.label : t; }

async function carregarNotificacoesSupa(){
  try{
    if(!supa||!window.SALAO_ID)return;
    var r = await supa.from('curso_notificacoes').select('*').eq('salao_id', window.SALAO_ID).order('criado_em', { ascending:false });
    if(r.error){ console.log('err carregar notificacoes', r.error); return; }
    cursoNotificacoes = r.data || [];
    renderNotificacoes();
  }catch(e){ console.log('err carregar notificacoes', e); }
}

// Agrupa por lote_id (envios em massa) — notificações avulsas (sem lote_id
// no entidade_ref) viram um "lote" de 1 item só, usando o próprio id.
function cnAgrupar(){
  var grupos = {};
  var ordem = [];
  cursoNotificacoes.forEach(function(n){
    var chave = (n.entidade_ref && n.entidade_ref.lote_id) || n.id;
    if(!grupos[chave]){ grupos[chave] = []; ordem.push(chave); }
    grupos[chave].push(n);
  });
  return ordem.map(function(chave){
    var itens = grupos[chave];
    var base = itens[0];
    return {
      chave: chave,
      titulo: base.titulo,
      mensagem: base.mensagem,
      tipo_evento: base.tipo_evento,
      criado_em: base.criado_em,
      entidade_ref: base.entidade_ref,
      total: itens.length,
      lidas: itens.filter(function(x){ return x.lida; }).length,
      itens: itens
    };
  });
}

function renderNotificacoes(){
  var wrap = document.getElementById('notificacoes-list');
  if(!wrap) return;
  var grupos = cnAgrupar();
  if(!grupos.length){
    wrap.innerHTML = '<div style="padding:40px;text-align:center;color:#999;font-size:13px">Nenhum aviso enviado ainda.</div>';
    return;
  }
  wrap.innerHTML = '<table><thead><tr>'
    + '<th>Título</th><th>Tipo</th><th>Enviado em</th><th>Destinatários</th><th>Lido</th><th></th>'
    + '</tr></thead><tbody>'
    + grupos.map(function(g){
        var evento = g.entidade_ref && g.entidade_ref.data_evento
          ? ('<div style="font-size:11px;color:#888">'+fmtDataBR(g.entidade_ref.data_evento)+(g.entidade_ref.hora_evento?' às '+g.entidade_ref.hora_evento:'')+'</div>')
          : '';
        return '<tr>'
          + '<td style="font-weight:600">'+escHtml(g.titulo)+evento+'</td>'
          + '<td>'+escHtml(cnTipoLabel(g.tipo_evento))+'</td>'
          + '<td style="white-space:nowrap">'+new Date(g.criado_em).toLocaleString('pt-BR')+'</td>'
          + '<td style="text-align:center">'+g.total+'</td>'
          + '<td style="text-align:center">'+g.lidas+'/'+g.total+'</td>'
          + '<td><button onclick="cnExcluirLote(\''+g.chave+'\')" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:16px">🗑️</button></td>'
          + '</tr>';
      }).join('')
    + '</tbody></table>';
}

// ===== destinatários =====
function cnAtualizarCamposDestino(){
  var tipo = document.getElementById('cn-destino-tipo').value;
  document.getElementById('cn-destino-turma-wrap').style.display = tipo === 'turma' ? '' : 'none';
  document.getElementById('cn-destino-curso-wrap').style.display = tipo === 'curso' ? '' : 'none';
  document.getElementById('cn-destino-aluno-wrap').style.display = tipo === 'aluno' ? '' : 'none';
}
function cnAtualizarCamposEvento(){
  var tipo = document.getElementById('cn-tipo').value;
  document.getElementById('cn-evento-wrap').style.display = tipo === 'live_evento' ? '' : 'none';
}
function cnPopularDestinos(){
  var selTurma = document.getElementById('cn-destino-turma');
  var selCC = document.getElementById('cn-destino-curso');
  var selAluno = document.getElementById('cn-destino-aluno');
  if(selTurma) selTurma.innerHTML = cursoTurmas.map(function(t){ return '<option value="'+t.id+'">'+escHtml(t.nome)+'</option>'; }).join('') || '<option value="">Nenhuma turma cadastrada</option>';
  if(selCC){
    var opts = [];
    cursos.forEach(function(c){ opts.push('<option value="curso:'+c.id+'">🎓 '+escHtml(c.nome)+'</option>'); });
    cursoCombos.forEach(function(c){ opts.push('<option value="combo:'+c.id+'">🧩 '+escHtml(c.nome)+'</option>'); });
    selCC.innerHTML = opts.join('');
  }
  if(selAluno){
    selAluno.innerHTML = cursoAlunos.filter(function(a){ return a.auth_user_id; }).map(function(a){ return '<option value="'+a.id+'">'+escHtml(a.nome)+'</option>'; }).join('')
      || '<option value="">Nenhum aluno com acesso ao portal ainda</option>';
  }
}

function cnResolverDestinatarios(){
  var tipo = document.getElementById('cn-destino-tipo').value;
  var comAcesso = function(ids){ return cursoAlunos.filter(function(a){ return ids.indexOf(a.id) !== -1 && a.auth_user_id; }); };
  var matriculasAtivas = cursoMatriculas.filter(function(m){ return ['matriculado','andamento','concluido'].indexOf(m.status) !== -1; });
  if(tipo === 'todos'){
    return cursoAlunos.filter(function(a){ return a.auth_user_id; });
  }
  if(tipo === 'turma'){
    var turmaId = document.getElementById('cn-destino-turma').value;
    var ids = matriculasAtivas.filter(function(m){ return m.turma_id === turmaId; }).map(function(m){ return m.aluno_id; });
    return comAcesso(ids);
  }
  if(tipo === 'curso'){
    var val = document.getElementById('cn-destino-curso').value;
    if(!val) return [];
    var parts = val.split(':'); var ccTipo = parts[0], ccId = parts[1];
    var ids2 = matriculasAtivas.filter(function(m){
      return ccTipo === 'curso' ? m.curso_id === ccId : m.combo_id === ccId;
    }).map(function(m){ return m.aluno_id; });
    return comAcesso(ids2);
  }
  if(tipo === 'aluno'){
    var alunoId = document.getElementById('cn-destino-aluno').value;
    return comAcesso([alunoId]);
  }
  return [];
}

// ===== modal de envio =====
function abrirNovaNotificacao(){
  cnPopularDestinos();
  document.getElementById('cn-titulo').value = '';
  document.getElementById('cn-mensagem').value = '';
  document.getElementById('cn-tipo').value = 'comunicado';
  document.getElementById('cn-destino-tipo').value = 'todos';
  document.getElementById('cn-evento-data').value = '';
  document.getElementById('cn-evento-hora').value = '';
  document.getElementById('cn-evento-link').value = '';
  cnAtualizarCamposDestino();
  cnAtualizarCamposEvento();
  openModal('modal-curso-notificacao');
}

async function cnEnviar(){
  var get = function(id){ return document.getElementById(id); };
  var titulo = get('cn-titulo').value.trim();
  var mensagem = get('cn-mensagem').value.trim();
  var tipoEvento = get('cn-tipo').value;
  if(!titulo){ alert('Informe o título do aviso.'); return; }
  var destinatarios = cnResolverDestinatarios();
  if(!destinatarios.length){ alert('Nenhum aluno com acesso ao Portal encontrado pra esse destino. Confira se já foi criado o acesso (botão "Criar Acesso" na ficha do aluno).'); return; }
  if(!confirm('Enviar este aviso para '+destinatarios.length+' aluno(s)?')) return;
  var entidadeRef = { lote_id: (crypto.randomUUID ? crypto.randomUUID() : (Date.now()+'-'+Math.random().toString(36).slice(2))) };
  if(tipoEvento === 'live_evento'){
    entidadeRef.data_evento = get('cn-evento-data').value || null;
    entidadeRef.hora_evento = get('cn-evento-hora').value || null;
    entidadeRef.link = get('cn-evento-link').value.trim() || null;
  }
  var linhas = destinatarios.map(function(a){
    return {
      salao_id: window.SALAO_ID,
      destinatario_tipo: 'aluno',
      destinatario_id: a.id,
      tipo_evento: tipoEvento,
      titulo: titulo,
      mensagem: mensagem,
      entidade_ref: entidadeRef,
      lida: false,
      enviada: true
    };
  });
  try{
    var r = await supa.from('curso_notificacoes').insert(linhas).select('*');
    if(r.error){ console.log('err enviar notificacoes', r.error); alert('Não foi possível enviar. Veja o console.'); return; }
    cursoNotificacoes = (r.data||[]).concat(cursoNotificacoes);
  }catch(e){ console.log('err enviar notificacoes', e); alert('Erro ao enviar o aviso.'); return; }
  renderNotificacoes();
  closeModal('modal-curso-notificacao');
  showAlert('Aviso enviado para '+destinatarios.length+' aluno(s)!');
}

async function cnExcluirLote(chave){
  var grupo = cnAgrupar().find(function(g){ return g.chave === chave; });
  if(!grupo) return;
  if(!confirm('Excluir este aviso (enviado para '+grupo.total+' aluno(s))?')) return;
  try{
    var ids = grupo.itens.map(function(n){ return n.id; });
    var r = await supa.from('curso_notificacoes').delete().in('id', ids).eq('salao_id', window.SALAO_ID);
    if(r.error){ console.log('err excluir notificacoes', r.error); alert('Não foi possível excluir. Veja o console.'); return; }
  }catch(e){ console.log('err excluir notificacoes', e); return; }
  cursoNotificacoes = cursoNotificacoes.filter(function(n){ return grupo.itens.indexOf(n) === -1; });
  renderNotificacoes();
}
