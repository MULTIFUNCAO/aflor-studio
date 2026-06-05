var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var supaScript = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>\n' +
'<script>\n' +
'var _supa = supabase.createClient("https://nqwzbpinhkgxfboeursu.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xd3picGluaGtneGZib2V1cnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NjkwMTIsImV4cCI6MjA1OTU0NTAxMn0.N-bQoXbRHZMVPCOI0cQmouQ5aTFT0JW-QS1Nz3Qeyos");\n' +
'window.carregarAgendamentosSupa = async function(){\n' +
'  var r = await _supa.from("agendamentos").select("*");\n' +
'  if(r.error){console.error("supa:",r.error);return;}\n' +
'  window._agendaExtra = window._agendaExtra||{};\n' +
'  (r.data||[]).forEach(function(a){\n' +
'    var chave=a.prof+":"+a.hora;\n' +
'    window._agendaExtra[chave]=a;\n' +
'  });\n' +
'  window._supaAgendamentos = r.data||[];\n' +
'  console.log("supa: carregou",(r.data||[]).length,"agendamentos");\n' +
'  if(typeof renderAgenda==="function")renderAgenda();\n' +
'};\n' +
'window.salvarAgendamentoSupa = async function(appt){\n' +
'  var r = await _supa.from("agendamentos").insert([appt]);\n' +
'  if(r.error)console.error("supa save:",r.error);\n' +
'  else console.log("supa: salvo ok");\n' +
'};\n' +
'setTimeout(window.carregarAgendamentosSupa, 1500);\n' +
'</script>';

// Remove inject antigo se existir
c = c.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase[\s\S]*?<\/script>/g, '');

// Adicionar antes do </body>
c = c.replace('</body>', supaScript + '\n</body>');
fs.writeFileSync('index.html', c);
console.log('ok');
