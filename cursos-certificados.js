// ===== CURSOS: Certificados (Prioridade 3, frente 3) =====
// Elegibilidade calculada a partir das regras que já existem no curso/combo
// (certificado_presenca_minima_pct, certificado_exige_provas_aprovadas,
// certificado_exige_exercicios) cruzando com dados reais da matrícula —
// nada inventado, nada fixo. Emissão gera um PDF de verdade com jsPDF
// (biblioteca client-side via CDN, sem serviço/credencial externa) e sobe
// pro bucket curso-certificados já existente.
// Depende dos globais de index.html: supa, window.SALAO_ID, window.SALAO_NOME,
// cursos, cursoCombos, cursoComboItens, cursoAlunos, cursoMatriculas,
// escHtml, fmtDataBR, showAlert.

var certDadosAuxiliares = { provasAtivas:[], exerciciosObrigatorios:[], tentativasAprovadas:[], enviosAprovados:[], certificadosExistentes:[] };
var certElegibilidadeLista = [];

async function carregarCertificadosDadosSupa(){
  try{
    if(!supa||!window.SALAO_ID)return;
    var r = await Promise.all([
      supa.from('curso_provas').select('*').eq('salao_id', window.SALAO_ID).eq('ativo', true),
      supa.from('curso_exercicios').select('*').eq('salao_id', window.SALAO_ID).eq('obrigatorio', true),
      supa.from('curso_prova_tentativas').select('*').eq('salao_id', window.SALAO_ID).eq('aprovado', true),
      supa.from('curso_exercicio_envios').select('*').eq('salao_id', window.SALAO_ID).eq('status', 'aprovado'),
      supa.from('curso_certificados').select('*').eq('salao_id', window.SALAO_ID)
    ]);
    certDadosAuxiliares = {
      provasAtivas: r[0].data || [],
      exerciciosObrigatorios: r[1].data || [],
      tentativasAprovadas: r[2].data || [],
      enviosAprovados: r[3].data || [],
      certificadosExistentes: r[4].data || []
    };
    calcularElegibilidadeTodas();
    renderCertificadosAdmin();
  }catch(e){ console.log('err carregar dados certificados', e); }
}

function certItemDaMatricula(m){
  return m.curso_id ? cursos.find(function(c){return c.id===m.curso_id;}) : cursoCombos.find(function(c){return c.id===m.combo_id;});
}
function certCursoIdsDaMatricula(m){
  if(m.curso_id) return [m.curso_id];
  if(m.combo_id) return cursoComboItens.filter(function(it){return it.combo_id===m.combo_id;}).map(function(it){return it.curso_id;});
  return [];
}
function certCargaHorariaDaMatricula(m){
  if(m.curso_id){ var c = cursos.find(function(x){return x.id===m.curso_id;}); return c ? (c.carga_horaria_horas||0) : 0; }
  var ids = certCursoIdsDaMatricula(m);
  return ids.reduce(function(soma, id){ var c = cursos.find(function(x){return x.id===id;}); return soma + (c?(c.carga_horaria_horas||0):0); }, 0);
}

function calcularElegibilidade(m){
  var item = certItemDaMatricula(m);
  if(!item || !item.gera_certificado) return null;
  if(certDadosAuxiliares.certificadosExistentes.some(function(c){ return c.matricula_id === m.id && c.status !== 'revogado'; })) return null;
  var cursoIds = certCursoIdsDaMatricula(m);
  var pendencias = [];
  var presencaMin = item.certificado_presenca_minima_pct != null ? item.certificado_presenca_minima_pct : 75;
  var presencaOk = (m.percentual_presenca||0) >= presencaMin;
  if(!presencaOk) pendencias.push('Presença '+Math.round(m.percentual_presenca||0)+'% (precisa '+presencaMin+'%)');
  if(item.certificado_exige_provas_aprovadas){
    var provasDoCurso = certDadosAuxiliares.provasAtivas.filter(function(p){ return cursoIds.indexOf(p.curso_id) !== -1; });
    var provasOk = provasDoCurso.every(function(p){
      return certDadosAuxiliares.tentativasAprovadas.some(function(t){ return t.prova_id === p.id && t.matricula_id === m.id; });
    });
    if(!provasOk) pendencias.push('Prova(s) pendente(s) de aprovação');
  }
  if(item.certificado_exige_exercicios){
    var exerciciosDoCurso = certDadosAuxiliares.exerciciosObrigatorios.filter(function(e){ return cursoIds.indexOf(e.curso_id) !== -1; });
    var exerciciosOk = exerciciosDoCurso.every(function(e){
      return certDadosAuxiliares.enviosAprovados.some(function(en){ return en.exercicio_id === e.id && en.matricula_id === m.id; });
    });
    if(!exerciciosOk) pendencias.push('Exercício(s) obrigatório(s) pendente(s)');
  }
  return { matricula: m, item: item, cursoIds: cursoIds, elegivel: pendencias.length === 0, pendencias: pendencias };
}
function calcularElegibilidadeTodas(){
  var ativas = cursoMatriculas.filter(function(m){ return ['matriculado','andamento','concluido'].indexOf(m.status) !== -1; });
  certElegibilidadeLista = ativas.map(calcularElegibilidade).filter(Boolean);
}

function renderCertificadosAdmin(){
  var wrap = document.getElementById('certificados-list');
  if(!wrap) return;
  if(!certElegibilidadeLista.length){
    wrap.innerHTML = '<div style="padding:40px;text-align:center;color:#999;font-size:13px">Nenhuma matrícula pendente de certificado — ou nenhum curso com emissão de certificado ativada.</div>';
    return;
  }
  wrap.innerHTML = '<table><thead><tr><th>Aluno</th><th>Curso/Combo</th><th>Presença</th><th>Status</th><th></th></tr></thead><tbody>'
    + certElegibilidadeLista.map(function(e, i){
        var aluno = cursoAlunos.find(function(a){ return a.id === e.matricula.aluno_id; }) || {};
        var statusHtml = e.elegivel
          ? '<span class="badge badge-green">Elegível</span>'
          : '<span class="badge badge-yellow" title="'+escHtml(e.pendencias.join('; '))+'">'+escHtml(e.pendencias.join(', '))+'</span>';
        return '<tr>'
          + '<td style="font-weight:600">'+escHtml(aluno.nome||'—')+'</td>'
          + '<td>'+escHtml(e.item.nome)+'</td>'
          + '<td>'+Math.round(e.matricula.percentual_presenca||0)+'%</td>'
          + '<td>'+statusHtml+'</td>'
          + '<td>'+(e.elegivel ? '<button class="btn btn-primary btn-sm" onclick="emitirCertificado('+i+')">🎓 Emitir</button>' : '')+'</td>'
          + '</tr>';
      }).join('')
    + '</tbody></table>';
}

async function gerarNumeroCertificado(){
  var ano = new Date().getFullYear();
  var r = await supa.from('curso_certificados').select('numero_certificado', { count:'exact', head:true }).eq('salao_id', window.SALAO_ID).like('numero_certificado', 'CERT-'+ano+'-%');
  var seq = (r.count||0) + 1;
  return 'CERT-'+ano+'-'+String(seq).padStart(4,'0');
}

function gerarPdfCertificado(numero, alunoNome, cursoNome, cargaHoraria, dataEmissao){
  var jsPDFlib = window.jspdf && window.jspdf.jsPDF;
  if(!jsPDFlib) throw new Error('jsPDF não carregou');
  var doc = new jsPDFlib({ orientation:'landscape', unit:'mm', format:'a4' });
  var w = doc.internal.pageSize.getWidth(), h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(20,20,20); doc.setLineWidth(1.2);
  doc.rect(8, 8, w-16, h-16);
  doc.setFont('helvetica','bold'); doc.setFontSize(12);
  doc.text((window.SALAO_NOME||'').toUpperCase(), w/2, 30, { align:'center' });
  doc.setFontSize(26);
  doc.text('Certificado de Conclusão', w/2, 55, { align:'center' });
  doc.setFont('helvetica','normal'); doc.setFontSize(14);
  doc.text('Certificamos que', w/2, 75, { align:'center' });
  doc.setFont('helvetica','bold'); doc.setFontSize(22);
  doc.text(alunoNome, w/2, 90, { align:'center' });
  doc.setFont('helvetica','normal'); doc.setFontSize(14);
  var linha2 = 'concluiu o curso "' + cursoNome + '"' + (cargaHoraria ? (', com carga horária de ' + cargaHoraria + ' hora(s)') : '') + '.';
  doc.text(linha2, w/2, 105, { align:'center', maxWidth: w-60 });
  doc.setFontSize(11);
  doc.text('Emitido em ' + dataEmissao, w/2, h-30, { align:'center' });
  doc.text('Certificado nº ' + numero, w/2, h-22, { align:'center' });
  return doc.output('blob');
}

async function emitirCertificado(idx){
  var e = certElegibilidadeLista[idx];
  if(!e) return;
  var aluno = cursoAlunos.find(function(a){ return a.id === e.matricula.aluno_id; });
  if(!aluno){ alert('Aluno não encontrado.'); return; }
  if(!confirm('Emitir certificado pra '+aluno.nome+' — '+e.item.nome+'?')) return;
  try{
    var numero = await gerarNumeroCertificado();
    var cargaHoraria = certCargaHorariaDaMatricula(e.matricula);
    var hojeBR = new Date().toLocaleDateString('pt-BR');
    var blob = gerarPdfCertificado(numero, aluno.nome, e.item.nome, cargaHoraria, hojeBR);
    var path = window.SALAO_ID + '/' + aluno.id + '/' + numero + '.pdf';
    var up = await supa.storage.from('curso-certificados').upload(path, blob, { contentType:'application/pdf', upsert:true });
    if(up.error) throw up.error;
    var payload = {
      salao_id: window.SALAO_ID, matricula_id: e.matricula.id,
      curso_id: e.matricula.curso_id || null, combo_id: e.matricula.combo_id || null,
      numero_certificado: numero, carga_horaria_horas: cargaHoraria || null,
      criterios_atendidos: { presenca_pct: e.matricula.percentual_presenca, pendencias_verificadas: e.pendencias },
      pdf_url: path, status: 'emitido'
    };
    var r = await supa.from('curso_certificados').insert([payload]);
    if(r.error) throw r.error;
    await supa.from('curso_matriculas').update({ certificado_liberado:true }).eq('id', e.matricula.id).eq('salao_id', window.SALAO_ID);
    e.matricula.certificado_liberado = true;
    certDadosAuxiliares.certificadosExistentes.push(payload);
    calcularElegibilidadeTodas();
    renderCertificadosAdmin();
    showAlert('Certificado emitido e PDF gerado com sucesso!');
  }catch(err){
    console.log('err emitir certificado', err);
    alert('Não foi possível emitir o certificado. Veja o console.');
  }
}
