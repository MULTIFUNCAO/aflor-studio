// ===== CURSOS: Atividades — exercícios, provas e correção (Prioridade 3, frente 2) =====
// Autoria de exercícios/provas vive dentro do conteúdo do curso (mesmo modal de
// módulos/aulas/materiais já existente em index.html — abrirConteudoCurso()).
// Correção de envios é uma fila separada, cruzando todos os cursos do salão.
// Depende dos globais de index.html: supa, window.SALAO_ID, cursos, cursoCombos,
// cursoAlunos, cursoMatriculas, cursoModulosAtuais, cursoConteudoCursoId,
// escHtml, openModal, closeModal, showAlert, fmtDataBR.

var cursoExerciciosAtuais = [];
var cursoProvasAtuais = [];
var cursoProvaPerguntasAtuais = [];
var cursoCorrecoesPendentes = [];
var _opcoesEditores = {}; // containerId -> {opcoes:[{id,texto}], correta:id}

// ===== carregamento (chamado de dentro de abrirConteudoCurso, index.html) =====
async function carregarAtividadesDoCursoSupa(cursoId){
  try{
    if(!supa||!window.SALAO_ID)return;
    var r = await Promise.all([
      supa.from('curso_exercicios').select('*').eq('salao_id', window.SALAO_ID).eq('curso_id', cursoId).order('ordem'),
      supa.from('curso_provas').select('*').eq('salao_id', window.SALAO_ID).eq('curso_id', cursoId).order('ordem')
    ]);
    cursoExerciciosAtuais = r[0].data || [];
    cursoProvasAtuais = r[1].data || [];
    if(typeof renderConteudoCurso === 'function') renderConteudoCurso();
  }catch(e){ console.log('err carregar atividades curso', e); }
}

// Chamado por renderConteudoCurso() (index.html) pra cada módulo — devolve o
// HTML de exercícios/provas daquele módulo, no mesmo estilo de aula/material.
function atvRenderModuloExtra(moduloId){
  var exercicios = cursoExerciciosAtuais.filter(function(e){ return e.modulo_id === moduloId; });
  var provas = cursoProvasAtuais.filter(function(p){ return p.modulo_id === moduloId; });
  var exHtml = exercicios.map(function(e){
    var ei = cursoExerciciosAtuais.indexOf(e);
    return '<div style="display:flex;align-items:center;padding:7px 0 7px 16px;font-size:13px;border-top:1px solid #f5f5f5">'
      + '<span style="margin-right:8px">📝</span>'
      + '<span style="flex:1">'+escHtml(e.titulo)+' <span style="color:#aaa;font-size:11px">('+atvTipoLabel(e.tipo)+(e.obrigatorio?'':' · opcional')+')</span></span>'
      + '<button onclick="editarExercicio('+ei+')" style="background:none;border:none;cursor:pointer;color:#888;font-size:12px;margin-right:8px">✏️</button>'
      + '<button onclick="deletarExercicio('+ei+')" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:12px">🗑️</button>'
      + '</div>';
  }).join('');
  var provasHtml = provas.map(function(p){
    var pi = cursoProvasAtuais.indexOf(p);
    return '<div style="display:flex;align-items:center;padding:7px 0 7px 16px;font-size:13px;border-top:1px solid #f5f5f5">'
      + '<span style="margin-right:8px">🧪</span>'
      + '<span style="flex:1">'+escHtml(p.titulo)+' <span style="color:#aaa;font-size:11px">(nota mín. '+p.nota_minima+', '+p.tentativas_maximas+' tentativa(s)'+(p.ativo?'':' · inativa')+')</span></span>'
      + '<button class="btn btn-outline btn-sm" style="margin-right:6px" onclick="abrirPerguntasProva(\''+p.id+'\')">❓ Perguntas</button>'
      + '<button onclick="editarProva('+pi+')" style="background:none;border:none;cursor:pointer;color:#888;font-size:12px;margin-right:8px">✏️</button>'
      + '<button onclick="deletarProva('+pi+')" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:12px">🗑️</button>'
      + '</div>';
  }).join('');
  return exHtml + provasHtml;
}
function atvTipoLabel(t){
  var map = { texto:'resposta em texto', multipla_escolha:'múltipla escolha', verdadeiro_falso:'verdadeiro/falso', envio_imagem:'envio de imagem', envio_arquivo:'envio de PDF' };
  return map[t] || t;
}

// Botões "+ Exercício" / "+ Prova" por módulo (chamados do HTML gerado em
// renderConteudoCurso, index.html).
function abrirNovoExercicioBtn(moduloId){ abrirNovoExercicio(moduloId); }
function abrirNovaProvaBtn(moduloId){ abrirNovaProva(moduloId); }

// =====================================================================
// Editor reutilizável de opções (multipla_escolha) — usado tanto no
// exercício quanto na pergunta de prova.
// =====================================================================
function opcoesEditorIniciar(containerId, opcoesExistentes, respostaCorretaExistente){
  _opcoesEditores[containerId] = {
    opcoes: (opcoesExistentes && opcoesExistentes.length) ? opcoesExistentes.slice() : [{id:'1',texto:''},{id:'2',texto:''}],
    correta: respostaCorretaExistente || null
  };
  opcoesEditorRender(containerId);
}
function opcoesEditorRender(containerId){
  var st = _opcoesEditores[containerId];
  var wrap = document.getElementById(containerId);
  if(!wrap || !st) return;
  wrap.innerHTML = st.opcoes.map(function(o, i){
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
      + '<input type="radio" name="'+containerId+'-correta" '+(st.correta===o.id?'checked':'')+' onchange="opcoesEditorMarcarCorreta(\''+containerId+'\',\''+o.id+'\')"/>'
      + '<input value="'+escHtml(o.texto)+'" placeholder="Opção '+(i+1)+'" style="flex:1" oninput="opcoesEditorAtualizarTexto(\''+containerId+'\',\''+o.id+'\',this.value)"/>'
      + '<button type="button" onclick="opcoesEditorRemover(\''+containerId+'\',\''+o.id+'\')" style="background:none;border:none;cursor:pointer;color:#ef4444">🗑️</button>'
      + '</div>';
  }).join('') + '<button type="button" class="btn btn-outline btn-sm" onclick="opcoesEditorAdicionar(\''+containerId+'\')">+ Adicionar opção</button>';
}
function opcoesEditorAdicionar(containerId){
  var st = _opcoesEditores[containerId];
  var novoId = String(Date.now());
  st.opcoes.push({id:novoId, texto:''});
  opcoesEditorRender(containerId);
}
function opcoesEditorRemover(containerId, optId){
  var st = _opcoesEditores[containerId];
  st.opcoes = st.opcoes.filter(function(o){ return o.id !== optId; });
  if(st.correta === optId) st.correta = null;
  opcoesEditorRender(containerId);
}
function opcoesEditorAtualizarTexto(containerId, optId, valor){
  var st = _opcoesEditores[containerId];
  var o = st.opcoes.find(function(x){ return x.id === optId; });
  if(o) o.texto = valor;
}
function opcoesEditorMarcarCorreta(containerId, optId){
  _opcoesEditores[containerId].correta = optId;
}
function opcoesEditorColetar(containerId){
  var st = _opcoesEditores[containerId];
  return { opcoes: st.opcoes.filter(function(o){ return o.texto.trim(); }), resposta_correta: st.correta };
}

// =====================================================================
// EXERCÍCIOS
// =====================================================================
function atvToggleExercicioTipoCampos(){
  var tipo = document.getElementById('ex-tipo').value;
  document.getElementById('ex-opcoes-wrap').style.display = tipo === 'multipla_escolha' ? '' : 'none';
  document.getElementById('ex-vf-wrap').style.display = tipo === 'verdadeiro_falso' ? '' : 'none';
  if(tipo === 'multipla_escolha' && !_opcoesEditores['ex-opcoes-editor']) opcoesEditorIniciar('ex-opcoes-editor', null, null);
}
function abrirNovoExercicio(moduloId){
  window._editExercicioIdx = -1;
  window._novoExercicioModuloId = moduloId;
  document.getElementById('ex-titulo').value = '';
  document.getElementById('ex-enunciado').value = '';
  document.getElementById('ex-tipo').value = 'texto';
  document.getElementById('ex-obrigatorio').checked = true;
  document.getElementById('ex-vf-correta').value = 'v';
  delete _opcoesEditores['ex-opcoes-editor'];
  atvToggleExercicioTipoCampos();
  document.querySelector('#modal-curso-exercicio .modal-title').textContent = '📝 Novo Exercício';
  openModal('modal-curso-exercicio');
}
function editarExercicio(idx){
  var e = cursoExerciciosAtuais[idx];
  if(!e) return;
  window._editExercicioIdx = idx;
  window._novoExercicioModuloId = e.modulo_id;
  document.getElementById('ex-titulo').value = e.titulo || '';
  document.getElementById('ex-enunciado').value = e.enunciado || '';
  document.getElementById('ex-tipo').value = e.tipo || 'texto';
  document.getElementById('ex-obrigatorio').checked = e.obrigatorio !== false;
  if(e.tipo === 'verdadeiro_falso') document.getElementById('ex-vf-correta').value = e.resposta_correta || 'v';
  if(e.tipo === 'multipla_escolha') opcoesEditorIniciar('ex-opcoes-editor', e.opcoes, e.resposta_correta);
  else delete _opcoesEditores['ex-opcoes-editor'];
  atvToggleExercicioTipoCampos();
  document.querySelector('#modal-curso-exercicio .modal-title').textContent = '✏️ Editar Exercício';
  openModal('modal-curso-exercicio');
}
async function salvarExercicio(){
  var titulo = document.getElementById('ex-titulo').value.trim();
  if(!titulo){ alert('Informe o título do exercício.'); return; }
  var tipo = document.getElementById('ex-tipo').value;
  var obj = {
    titulo: titulo,
    enunciado: document.getElementById('ex-enunciado').value.trim(),
    tipo: tipo,
    opcoes: null,
    resposta_correta: null,
    obrigatorio: document.getElementById('ex-obrigatorio').checked,
    modulo_id: window._novoExercicioModuloId,
    curso_id: cursoConteudoCursoId,
    ordem: cursoExerciciosAtuais.filter(function(x){ return x.modulo_id === window._novoExercicioModuloId; }).length
  };
  if(tipo === 'multipla_escolha'){
    var coletado = opcoesEditorColetar('ex-opcoes-editor');
    if(coletado.opcoes.length < 2){ alert('Adicione pelo menos 2 opções.'); return; }
    if(!coletado.resposta_correta){ alert('Marque qual opção é a correta.'); return; }
    obj.opcoes = coletado.opcoes;
    obj.resposta_correta = JSON.stringify(coletado.resposta_correta).replace(/^"|"$/g,'');
  }else if(tipo === 'verdadeiro_falso'){
    obj.opcoes = [{id:'v',texto:'Verdadeiro'},{id:'f',texto:'Falso'}];
    obj.resposta_correta = document.getElementById('ex-vf-correta').value;
  }
  var idx = window._editExercicioIdx;
  if(idx >= 0 && cursoExerciciosAtuais[idx]){
    var existente = cursoExerciciosAtuais[idx];
    Object.assign(existente, obj);
    if(existente.id){
      var r = await supa.from('curso_exercicios').update(obj).eq('id', existente.id).eq('salao_id', window.SALAO_ID);
      if(r.error){ console.log('err atualizar exercicio', r.error); alert('Não foi possível salvar. Veja o console.'); return; }
    }
  }else{
    var payload = Object.assign({}, obj, { salao_id: window.SALAO_ID });
    var r2 = await supa.from('curso_exercicios').insert([payload]).select('id').single();
    if(r2.error){ console.log('err inserir exercicio', r2.error); alert('Não foi possível salvar. Veja o console.'); return; }
    obj.id = r2.data.id;
    cursoExerciciosAtuais.push(obj);
  }
  renderConteudoCurso();
  closeModal('modal-curso-exercicio');
  showAlert('Exercício salvo com sucesso!');
}
async function deletarExercicio(idx){
  var e = cursoExerciciosAtuais[idx];
  if(!e) return;
  if(!confirm('Excluir o exercício "'+e.titulo+'"? Respostas de alunos pra ele também somem.')) return;
  try{
    if(e.id){
      await supa.from('curso_exercicio_envios').delete().eq('exercicio_id', e.id).eq('salao_id', window.SALAO_ID);
      await supa.from('curso_exercicios').delete().eq('id', e.id).eq('salao_id', window.SALAO_ID);
    }
  }catch(err){ console.log('err excluir exercicio', err); return; }
  cursoExerciciosAtuais.splice(idx, 1);
  renderConteudoCurso();
}

// =====================================================================
// PROVAS
// =====================================================================
function abrirNovaProva(moduloId){
  window._editProvaIdx = -1;
  window._novaProvaModuloId = moduloId;
  document.getElementById('prova-titulo').value = '';
  document.getElementById('prova-descricao').value = '';
  document.getElementById('prova-nota-minima').value = '70';
  document.getElementById('prova-tentativas').value = '1';
  document.getElementById('prova-tempo-limite').value = '';
  document.getElementById('prova-ativo').checked = true;
  document.querySelector('#modal-curso-prova .modal-title').textContent = '🧪 Nova Prova';
  openModal('modal-curso-prova');
}
function editarProva(idx){
  var p = cursoProvasAtuais[idx];
  if(!p) return;
  window._editProvaIdx = idx;
  window._novaProvaModuloId = p.modulo_id;
  document.getElementById('prova-titulo').value = p.titulo || '';
  document.getElementById('prova-descricao').value = p.descricao || '';
  document.getElementById('prova-nota-minima').value = p.nota_minima != null ? p.nota_minima : 70;
  document.getElementById('prova-tentativas').value = p.tentativas_maximas || 1;
  document.getElementById('prova-tempo-limite').value = p.tempo_limite_min || '';
  document.getElementById('prova-ativo').checked = p.ativo !== false;
  document.querySelector('#modal-curso-prova .modal-title').textContent = '✏️ Editar Prova';
  openModal('modal-curso-prova');
}
async function salvarProva(){
  var titulo = document.getElementById('prova-titulo').value.trim();
  if(!titulo){ alert('Informe o título da prova.'); return; }
  var obj = {
    titulo: titulo,
    descricao: document.getElementById('prova-descricao').value.trim(),
    nota_minima: parseFloat(document.getElementById('prova-nota-minima').value) || 70,
    tentativas_maximas: parseInt(document.getElementById('prova-tentativas').value) || 1,
    tempo_limite_min: document.getElementById('prova-tempo-limite').value ? parseInt(document.getElementById('prova-tempo-limite').value) : null,
    ativo: document.getElementById('prova-ativo').checked,
    modulo_id: window._novaProvaModuloId,
    curso_id: cursoConteudoCursoId,
    ordem: cursoProvasAtuais.filter(function(x){ return x.modulo_id === window._novaProvaModuloId; }).length
  };
  var idx = window._editProvaIdx;
  if(idx >= 0 && cursoProvasAtuais[idx]){
    var existente = cursoProvasAtuais[idx];
    Object.assign(existente, obj);
    if(existente.id){
      var r = await supa.from('curso_provas').update(obj).eq('id', existente.id).eq('salao_id', window.SALAO_ID);
      if(r.error){ console.log('err atualizar prova', r.error); alert('Não foi possível salvar. Veja o console.'); return; }
    }
  }else{
    var payload = Object.assign({}, obj, { salao_id: window.SALAO_ID });
    var r2 = await supa.from('curso_provas').insert([payload]).select('id').single();
    if(r2.error){ console.log('err inserir prova', r2.error); alert('Não foi possível salvar. Veja o console.'); return; }
    obj.id = r2.data.id;
    cursoProvasAtuais.push(obj);
  }
  renderConteudoCurso();
  closeModal('modal-curso-prova');
  showAlert('Prova salva com sucesso!');
}
async function deletarProva(idx){
  var p = cursoProvasAtuais[idx];
  if(!p) return;
  if(!confirm('Excluir a prova "'+p.titulo+'"? Perguntas e tentativas de alunos também somem.')) return;
  try{
    if(p.id){
      await supa.from('curso_prova_tentativas').delete().eq('prova_id', p.id).eq('salao_id', window.SALAO_ID);
      await supa.from('curso_prova_perguntas').delete().eq('prova_id', p.id).eq('salao_id', window.SALAO_ID);
      await supa.from('curso_provas').delete().eq('id', p.id).eq('salao_id', window.SALAO_ID);
    }
  }catch(err){ console.log('err excluir prova', err); return; }
  cursoProvasAtuais.splice(idx, 1);
  renderConteudoCurso();
}

// ===== Perguntas da prova =====
async function abrirPerguntasProva(provaId){
  window._provaPerguntasIdAtual = provaId;
  var p = cursoProvasAtuais.find(function(x){ return x.id === provaId; });
  document.getElementById('prova-perguntas-titulo').textContent = '❓ Perguntas — ' + (p ? p.titulo : '');
  document.getElementById('prova-perguntas-lista').innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:13px">Carregando...</div>';
  openModal('modal-prova-perguntas');
  try{
    var r = await supa.from('curso_prova_perguntas').select('*').eq('salao_id', window.SALAO_ID).eq('prova_id', provaId).order('ordem');
    cursoProvaPerguntasAtuais = r.data || [];
    renderPerguntasProva();
  }catch(e){ console.log('err carregar perguntas prova', e); }
}
function renderPerguntasProva(){
  var wrap = document.getElementById('prova-perguntas-lista');
  if(!wrap) return;
  if(!cursoProvaPerguntasAtuais.length){
    wrap.innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:13px">Nenhuma pergunta ainda.</div>';
  }else{
    wrap.innerHTML = cursoProvaPerguntasAtuais.map(function(pg, i){
      return '<div style="border:1px solid #eee;border-radius:8px;padding:10px 12px;margin-bottom:8px">'
        + '<div style="display:flex;align-items:flex-start"><span style="flex:1;font-size:13px;font-weight:600">'+(i+1)+'. '+escHtml(pg.enunciado)+'</span>'
        + '<span style="font-size:11px;color:#888;margin-right:8px">'+pg.pontuacao+' pt(s)</span>'
        + '<button onclick="editarPerguntaProva('+i+')" style="background:none;border:none;cursor:pointer;color:#888;font-size:12px;margin-right:6px">✏️</button>'
        + '<button onclick="deletarPerguntaProva('+i+')" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:12px">🗑️</button></div>'
        + '<div style="font-size:12px;color:#888;margin-top:4px">'+(pg.opcoes||[]).map(function(o){ return (o.id===pg.resposta_correta?'✅ ':'· ')+escHtml(o.texto); }).join('<br>')+'</div>'
        + '</div>';
    }).join('');
  }
  wrap.innerHTML += '<button class="btn btn-outline btn-sm" style="width:100%;margin-top:8px" onclick="abrirNovaPerguntaProva()">+ Adicionar pergunta</button>';
}
function abrirNovaPerguntaProva(){
  window._editPerguntaIdx = -1;
  document.getElementById('pg-enunciado').value = '';
  document.getElementById('pg-tipo').value = 'multipla_escolha';
  document.getElementById('pg-pontuacao').value = '1';
  document.getElementById('pg-vf-correta').value = 'v';
  delete _opcoesEditores['pg-opcoes-editor'];
  atvTogglePerguntaTipoCampos();
  document.querySelector('#modal-prova-pergunta .modal-title').textContent = '+ Nova Pergunta';
  openModal('modal-prova-pergunta');
}
function editarPerguntaProva(idx){
  var pg = cursoProvaPerguntasAtuais[idx];
  if(!pg) return;
  window._editPerguntaIdx = idx;
  document.getElementById('pg-enunciado').value = pg.enunciado || '';
  document.getElementById('pg-tipo').value = pg.tipo || 'multipla_escolha';
  document.getElementById('pg-pontuacao').value = pg.pontuacao || 1;
  if(pg.tipo === 'verdadeiro_falso') document.getElementById('pg-vf-correta').value = pg.resposta_correta || 'v';
  else opcoesEditorIniciar('pg-opcoes-editor', pg.opcoes, pg.resposta_correta);
  atvTogglePerguntaTipoCampos();
  document.querySelector('#modal-prova-pergunta .modal-title').textContent = '✏️ Editar Pergunta';
  openModal('modal-prova-pergunta');
}
function atvTogglePerguntaTipoCampos(){
  var tipo = document.getElementById('pg-tipo').value;
  document.getElementById('pg-opcoes-wrap').style.display = tipo === 'multipla_escolha' ? '' : 'none';
  document.getElementById('pg-vf-wrap').style.display = tipo === 'verdadeiro_falso' ? '' : 'none';
  if(tipo === 'multipla_escolha' && !_opcoesEditores['pg-opcoes-editor']) opcoesEditorIniciar('pg-opcoes-editor', null, null);
}
async function salvarPerguntaProva(){
  var enunciado = document.getElementById('pg-enunciado').value.trim();
  if(!enunciado){ alert('Informe o enunciado da pergunta.'); return; }
  var tipo = document.getElementById('pg-tipo').value;
  var obj = {
    enunciado: enunciado,
    tipo: tipo,
    pontuacao: parseFloat(document.getElementById('pg-pontuacao').value) || 1,
    prova_id: window._provaPerguntasIdAtual,
    ordem: cursoProvaPerguntasAtuais.length
  };
  if(tipo === 'multipla_escolha'){
    var coletado = opcoesEditorColetar('pg-opcoes-editor');
    if(coletado.opcoes.length < 2){ alert('Adicione pelo menos 2 opções.'); return; }
    if(!coletado.resposta_correta){ alert('Marque qual opção é a correta.'); return; }
    obj.opcoes = coletado.opcoes;
    obj.resposta_correta = coletado.resposta_correta;
  }else{
    obj.opcoes = [{id:'v',texto:'Verdadeiro'},{id:'f',texto:'Falso'}];
    obj.resposta_correta = document.getElementById('pg-vf-correta').value;
  }
  var idx = window._editPerguntaIdx;
  try{
    if(idx >= 0 && cursoProvaPerguntasAtuais[idx]){
      var existente = cursoProvaPerguntasAtuais[idx];
      Object.assign(existente, obj);
      var r = await supa.from('curso_prova_perguntas').update(obj).eq('id', existente.id).eq('salao_id', window.SALAO_ID);
      if(r.error){ console.log('err atualizar pergunta', r.error); alert('Não foi possível salvar. Veja o console.'); return; }
    }else{
      var payload = Object.assign({}, obj, { salao_id: window.SALAO_ID });
      var r2 = await supa.from('curso_prova_perguntas').insert([payload]).select('id').single();
      if(r2.error){ console.log('err inserir pergunta', r2.error); alert('Não foi possível salvar. Veja o console.'); return; }
      obj.id = r2.data.id;
      cursoProvaPerguntasAtuais.push(obj);
    }
  }catch(e){ console.log('err salvar pergunta', e); return; }
  renderPerguntasProva();
  closeModal('modal-prova-pergunta');
}
async function deletarPerguntaProva(idx){
  var pg = cursoProvaPerguntasAtuais[idx];
  if(!pg) return;
  if(!confirm('Excluir esta pergunta?')) return;
  try{
    if(pg.id) await supa.from('curso_prova_perguntas').delete().eq('id', pg.id).eq('salao_id', window.SALAO_ID);
  }catch(e){ console.log('err excluir pergunta', e); return; }
  cursoProvaPerguntasAtuais.splice(idx, 1);
  renderPerguntasProva();
}

// =====================================================================
// FILA DE CORREÇÃO (aba "Correções")
// =====================================================================
async function carregarCorrecoesPendentesSupa(){
  try{
    if(!supa||!window.SALAO_ID)return;
    var r = await Promise.all([
      supa.from('curso_exercicios').select('*').eq('salao_id', window.SALAO_ID),
      supa.from('curso_exercicio_envios').select('*').eq('salao_id', window.SALAO_ID).in('status',['enviado','em_analise']).order('criado_em')
    ]);
    var exerciciosPorId = {};
    (r[0].data||[]).forEach(function(e){ exerciciosPorId[e.id] = e; });
    cursoCorrecoesPendentes = (r[1].data||[]).map(function(env){
      var ex = exerciciosPorId[env.exercicio_id] || {};
      var mat = cursoMatriculas.find(function(m){ return m.id === env.matricula_id; }) || {};
      var aluno = cursoAlunos.find(function(a){ return a.id === mat.aluno_id; }) || {};
      var curso = cursos.find(function(c){ return c.id === ex.curso_id; }) || {};
      return Object.assign({}, env, { _exercicio: ex, _alunoNome: aluno.nome || '—', _cursoNome: curso.nome || '—' });
    });
    renderCorrecoes();
  }catch(e){ console.log('err carregar correcoes', e); }
}
function renderCorrecoes(){
  var wrap = document.getElementById('correcoes-list');
  if(!wrap) return;
  if(!cursoCorrecoesPendentes.length){
    wrap.innerHTML = '<div style="padding:40px;text-align:center;color:#999;font-size:13px">Nenhuma correção pendente. 🎉</div>';
    return;
  }
  wrap.innerHTML = cursoCorrecoesPendentes.map(function(env, i){
    var respostaPreview = env.resposta_texto
      ? escHtml(env.resposta_texto).slice(0,80)
      : (env.resposta_opcao ? 'Opção: '+escHtml(JSON.stringify(env.resposta_opcao)) : (env.arquivo_url ? '📎 arquivo enviado' : '—'));
    return '<div class="service-row">'
      + '<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13.5px">'+escHtml(env._exercicio.titulo||'Exercício')+'</div>'
      + '<div style="font-size:12px;color:#888">'+escHtml(env._alunoNome)+' · '+escHtml(env._cursoNome)+' · '+new Date(env.criado_em).toLocaleString('pt-BR')+'</div>'
      + '<div style="font-size:12px;color:#555;margin-top:2px">'+respostaPreview+'</div></div>'
      + '<button class="btn btn-primary btn-sm" onclick="abrirCorrigirEnvio('+i+')">Corrigir</button>'
      + '</div>';
  }).join('');
}
async function abrirCorrigirEnvio(idx){
  var env = cursoCorrecoesPendentes[idx];
  if(!env) return;
  window._correcaoEnvioIdx = idx;
  document.getElementById('correcao-titulo').textContent = '✅ Corrigir — ' + (env._exercicio.titulo||'');
  var corpo = document.getElementById('correcao-corpo');
  var html = '<div style="font-size:12.5px;color:#888;margin-bottom:10px">'+escHtml(env._alunoNome)+' · '+escHtml(env._cursoNome)+'</div>';
  html += '<div style="font-size:13px;margin-bottom:12px"><b>Enunciado:</b> '+escHtml(env._exercicio.enunciado||'')+'</div>';
  if(env.resposta_texto) html += '<div style="background:var(--gray-50);border-radius:8px;padding:10px;font-size:13px;white-space:pre-wrap">'+escHtml(env.resposta_texto)+'</div>';
  if(env.resposta_opcao){
    var opt = (env._exercicio.opcoes||[]).find(function(o){ return o.id === env.resposta_opcao || o.id === (env.resposta_opcao&&env.resposta_opcao.id); });
    html += '<div style="background:var(--gray-50);border-radius:8px;padding:10px;font-size:13px">Resposta: '+escHtml(opt?opt.texto:JSON.stringify(env.resposta_opcao))+'</div>';
  }
  if(env.arquivo_url){
    html += '<div id="correcao-arquivo-link" style="margin-top:8px"><button class="btn btn-outline btn-sm" onclick="abrirArquivoEnvio(\''+env.arquivo_url+'\')">📎 Ver arquivo enviado</button></div>';
  }
  corpo.innerHTML = html;
  document.getElementById('correcao-comentario').value = env.comentario_professor || '';
  openModal('modal-correcao-envio');
}
async function abrirArquivoEnvio(path){
  try{
    var r = await supa.storage.from('curso-envios').createSignedUrl(path, 120);
    if(r.error) throw r.error;
    window.open(r.data.signedUrl, '_blank');
  }catch(e){ console.log('err abrir arquivo envio', e); alert('Não foi possível abrir o arquivo.'); }
}
async function salvarCorrecao(novoStatus){
  var env = cursoCorrecoesPendentes[window._correcaoEnvioIdx];
  if(!env) return;
  var comentario = document.getElementById('correcao-comentario').value.trim();
  try{
    var r = await supa.from('curso_exercicio_envios').update({
      status: novoStatus, comentario_professor: comentario,
      corrigido_por: (window.SALAO_NOME||'Administrador'), corrigido_em: new Date().toISOString()
    }).eq('id', env.id).eq('salao_id', window.SALAO_ID);
    if(r.error){ console.log('err salvar correcao', r.error); alert('Não foi possível salvar. Veja o console.'); return; }
  }catch(e){ console.log('err salvar correcao', e); return; }
  cursoCorrecoesPendentes.splice(window._correcaoEnvioIdx, 1);
  renderCorrecoes();
  closeModal('modal-correcao-envio');
  showAlert(novoStatus === 'aprovado' ? 'Exercício aprovado!' : 'Aluno vai ver que precisa refazer.');
}
