var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var newKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xd3picGluaGtneGZib2V1cnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTE2MTMsImV4cCI6MjA5NTcyNzYxM30.ASni8j7rfDxjhWYrDxbwidacJaV51eDzzY7XbdGQCEk';

// Remover todos os scripts supabase anteriores
c = c.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/g, '');

// Novo script consolidado antes do </body>
var novoScript = '<script>\n' +
'(function(){\n' +
'  var s = document.createElement("script");\n' +
'  s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";\n' +
'  s.onload = function(){\n' +
'    window._supa = supabase.createClient(\n' +
'      "https://nqwzbpinhkgxfboeursu.supabase.co",\n' +
'      "' + newKey + '"\n' +
'    );\n' +
'    window.carregarAgendamentosSupa = async function(){\n' +
'      var r = await window._supa.from("agendamentos").select("*");\n' +
'      if(r.error){console.error("supa:",r.error);return;}\n' +
'      window._agendaExtra = window._agendaExtra||{};\n' +
'      (r.data||[]).forEach(function(a){\n' +
'        var chave = a.prof+":"+a.hora;\n' +
'        window._agendaExtra[chave] = a;\n' +
'      });\n' +
'      window._supaAgendamentos = r.data||[];\n' +
'      console.log("supa: carregou",(r.data||[]).length,"agendamentos");\n' +
'      if(typeof renderAgenda==="function")renderAgenda();\n' +
'    };\n' +
'    window.salvarAgendamentoSupa = async function(appt){\n' +
'      var r = await window._supa.from("agendamentos").insert([appt]);\n' +
'      if(r.error)console.error("supa save:",r.error);\n' +
'      else{console.log("supa: salvo ok");window.carregarAgendamentosSupa();}\n' +
'    };\n' +
'    window.carregarAgendamentosSupa();\n' +
'  };\n' +
'  document.body.appendChild(s);\n' +
'})();\n' +
'</script>';

c = c.replace('</body>', novoScript + '\n</body>');
fs.writeFileSync('index.html', c);
console.log('ok:', c.includes(newKey));
