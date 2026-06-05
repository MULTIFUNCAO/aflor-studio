var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Remover o carregamento do localStorage no inicio
c = c.replace('<script>\n(function(){\n  try{\n    var saved=localStorage.getItem("aflor_agendamentos");\n    if(saved) window._agendaExtra=JSON.parse(saved);\n  }catch(e){}\n})();\n</script>\n', '');

// Remover o save no localStorage do salvarAgendamento
c = c.replace('\n    try{localStorage.setItem("aflor_agendamentos",JSON.stringify(window._agendaExtra));}catch(e){}', '');

fs.writeFileSync('index.html', c);
console.log('localStorage removido:', !c.includes('aflor_agendamentos'));
