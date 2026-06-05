var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Achar showAlert(msg); dentro de salvarAgendamento e adicionar depois
var old = "showAlert(msg);\n}";
var novo = "showAlert(msg);\n  // Adicionar ao agendaAppts para renderAgenda\n  var profSel=document.querySelector('#modal-agendar select');\n  var dataSel=document.querySelector('#modal-agendar input[type=date]');\n  var horaSel=document.querySelector('#modal-agendar input[type=time]');\n  var servicoSel=document.querySelectorAll('#modal-agendar select')[1];\n  if(dataSel&&dataSel.value&&profSel&&horaSel){\n    var profNome=profSel.options[profSel.selectedIndex].text;\n    var chave=profNome+':'+horaSel.value;\n    agendaAppts[chave]={cliente:cliente,servico:servicoSel?servicoSel.options[servicoSel.selectedIndex].text:'',prof:profNome,hora:horaSel.value,data:dataSel.value,valor:'R$ 0,00',sinal:false,cls:'#7c3aed'};\n    agendaDataAtual=dataSel.value;\n    renderAgenda();\n  }\n}";

// Contar quantas ocorrencias de "showAlert(msg);\n}" existem
var count = c.split("showAlert(msg);\n}").length - 1;
console.log('ocorrencias de showAlert(msg)+}:', count);

if (count === 1) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  // Ver contexto de cada ocorrencia
  var idx = 0;
  for (var i = 0; i < count; i++) {
    idx = c.indexOf("showAlert(msg);\n}", idx);
    console.log('ocorrencia', i+1, 'pos:', idx, 'ctx:', JSON.stringify(c.substring(idx-100, idx+20)));
    idx += 10;
  }
}
