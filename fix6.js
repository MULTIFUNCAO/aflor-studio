var fs=require('fs');
var c=fs.readFileSync('index.html','utf8');
var old='closeModal(\'modal-agendar\');\n  var msg=\'✅ Agendamento confirmado para \'+cliente+\'!\';\n  if(sinalAtivo)msg+=\' Sinal: \'+sinalAgora+(sinalStatus===\'pago\'?\' ✅ pago\':\' ⏳ pendente\');\n  showAlert(msg);\n}';
var novo='var data=document.getElementById(\'ag-data\')?.value;\n  var hora=document.getElementById(\'ag-hora\')?.value;\n  var prof=document.getElementById(\'ag-prof\')?.value;\n  var servico=document.getElementById(\'ag-servico\')?.value;\n  var valor=parseFloat((servico||\'0\').replace(/[^0-9,]/g,\'\').replace(\',\',\'.\'))||0;\n  var novo={id:Date.now(),cliente:cliente,data:data,hora:hora,prof:prof,servico:(servico||\'Serviço\').split(\' —\')[0],valor:valor,status:\'agendado\',obs:\'\',sinalAtivo:sinalAtivo,sinalValor:sinalAtivo?valor*0.5:0,sinalPago:sinalAtivo&&sinalStatus===\'pago\'};\n  _agendamentosMap[data]=_agendamentosMap[data]||[];\n  _agendamentosMap[data].push(novo);\n  closeModal(\'modal-agendar\');\n  renderAgenda();\n  salvarAgendamentoSupa(novo);\n  var msg=\'✅ Agendamento confirmado para \'+cliente+\'!\';\n  showAlert(msg);\n}';
c=c.replace(old,novo);
fs.writeFileSync('index.html',c);
console.log('ok:',c.includes('_agendamentosMap[data].push'));
