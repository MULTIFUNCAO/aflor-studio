var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var SUPA_URL = 'https://nqwzbpinhkgxfboeursu.supabase.co';
var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xd3picGluaGtneGZib2V1cnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NjkwMTIsImV4cCI6MjA1OTU0NTAxMn0.N-bQoXbRHZMVPCOI0cQmouQ5aTFT0JW-QS1Nz3Qeyos';

var supaScript = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>\n' +
'<script>\n' +
'var _supa = supabase.createClient("' + SUPA_URL + '", "' + SUPA_KEY + '");\n' +
'\n' +
'// Salvar agendamento no Supabase\n' +
'async function salvarAgendamentoSupa(appt) {\n' +
'  try {\n' +
'    var { error } = await _supa.from("agendamentos").insert([appt]);\n' +
'    if (error) console.error("supa insert:", error);\n' +
'    else console.log("supa: salvo ok");\n' +
'  } catch(e) { console.error("supa:", e); }\n' +
'}\n' +
'\n' +
'// Carregar agendamentos do Supabase\n' +
'async function carregarAgendamentosSupa() {\n' +
'  try {\n' +
'    var { data, error } = await _supa.from("agendamentos").select("*");\n' +
'    if (error) { console.error("supa select:", error); return; }\n' +
'    window._agendaExtra = window._agendaExtra || {};\n' +
'    (data || []).forEach(function(a) {\n' +
'      var chave = a.prof + ":" + a.hora;\n' +
'      window._agendaExtra[chave] = a;\n' +
'    });\n' +
'    window._supaAgendamentos = data || [];\n' +
'    console.log("supa: carregou", (data||[]).length, "agendamentos");\n' +
'    if (typeof renderAgenda === "function") renderAgenda();\n' +
'  } catch(e) { console.error("supa:", e); }\n' +
'}\n' +
'\n' +
'// Carregar ao iniciar\n' +
'window.addEventListener("load", function() {\n' +
'  setTimeout(carregarAgendamentosSupa, 1000);\n' +
'});\n' +
'</script>\n';

if (!c.includes('supabase.createClient')) {
  c = c.replace('</head>', supaScript + '</head>');
  console.log('ok: supabase injetado');
} else {
  console.log('ja existe');
}

// Hook no salvarAgendamento para também salvar no Supabase
var old = 'window._agendaExtra=window._agendaExtra||{};\n    window._agendaExtra[chave]=appt;\n    try{localStorage.setItem("aflor_agendamentos",JSON.stringify(window._agendaExtra));}catch(e){}';
var novo = 'window._agendaExtra=window._agendaExtra||{};\n    window._agendaExtra[chave]=appt;\n    try{localStorage.setItem("aflor_agendamentos",JSON.stringify(window._agendaExtra));}catch(e){}\n    if(typeof salvarAgendamentoSupa==="function")salvarAgendamentoSupa({cliente:appt.cliente,servico:appt.servico,prof:appt.prof,data:appt.data,hora:appt.hora,valor:appt.valor,status:appt.status||"agendado",cls:appt.cls||""});';

if (c.includes('window._agendaExtra[chave]=appt;')) {
  c = c.replace(old, novo);
  console.log('ok: hook salvar');
}

fs.writeFileSync('index.html', c);
