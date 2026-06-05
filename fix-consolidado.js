var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// FIX 1: corrigir }; para }); - achar dentro do renderAgenda
var lines = c.split('\n');
var inRender = false;
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('function renderAgenda(')) inRender = true;
  if (inRender && lines[i].trim() === '};' && (lines[i-1] || '').includes('2026')) {
    lines[i] = '  });';
    console.log('fix1: linha', i+1, 'corrigida');
    inRender = false;
    break;
  }
}
c = lines.join('\n');

// FIX 2: injetar merge de _novosAgendamentos antes do const grid
var gridStr = "const grid=document.getElementById('agenda-grid');";
var merge = "(window._novosAgendamentos||[]).forEach(function(a){if(a&&a.data){agendamentosPorData[a.data]=agendamentosPorData[a.data]||[];agendamentosPorData[a.data].push(a);}});\n    ";
if (c.includes(gridStr) && !c.includes('_novosAgendamentos||[]).forEach')) {
  c = c.replace(gridStr, merge + gridStr);
  console.log('fix2: merge ok');
} else {
  console.log('fix2: skip');
}

// FIX 3: injetar interceptor antes do </body>
var inject = '<script>\ndocument.addEventListener("click",function(e){\n  var btn=e.target.closest("button");\n  if(!btn||!btn.textContent.includes("Confirmar"))return;\n  var m=document.getElementById("modal-agendar");\n  if(!m)return;\n  var dataVal="",horaVal="",clienteVal="",profVal="";\n  m.querySelectorAll("input").forEach(function(inp){\n    if(inp.type==="date")dataVal=inp.value;\n    if(inp.type==="time")horaVal=inp.value;\n    if(inp.id==="ag-cliente"||inp.placeholder==="Nome do cliente")clienteVal=inp.value;\n  });\n  var sels=m.querySelectorAll("select");\n  if(sels[0])profVal=sels[0].value;\n  if(!dataVal){console.warn("data vazia");return;}\n  window._novosAgendamentos=window._novosAgendamentos||[];\n  var novo={id:Date.now(),cliente:clienteVal||"Cliente",data:dataVal,hora:horaVal,prof:profVal,status:"agendado",valor:0};\n  window._novosAgendamentos.push(novo);\n  console.log("agendamento salvo:",novo);\n  setTimeout(function(){if(typeof renderAgenda==="function")renderAgenda();},400);\n},true);\n</script>';

if (!c.includes('_novosAgendamentos')) {
  c = c.replace('</body>', inject + '\n</body>');
  console.log('fix3: inject ok');
} else {
  console.log('fix3: inject ja existe');
}

fs.writeFileSync('index.html', c);

// Verificar sintaxe JS
var start = c.indexOf('<script>');
var end = c.lastIndexOf('</script>');
var js = c.substring(start + 8, end);
try { new Function(js); console.log('SINTAXE OK'); }
catch(e) { console.log('SINTAXE ERRO:', e.message); }
