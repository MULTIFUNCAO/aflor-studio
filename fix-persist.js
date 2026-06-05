var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// 1. Carregar agendamentos do localStorage ao iniciar
var loadScript = '<script>\n(function(){\n  try{\n    var saved=localStorage.getItem("aflor_agendamentos");\n    if(saved) window._agendaExtra=JSON.parse(saved);\n  }catch(e){}\n})();\n</script>\n';

// 2. Salvar no localStorage toda vez que _agendaExtra for atualizado
// Achar onde adicionamos ao _agendaExtra e adicionar localStorage.setItem depois
var old = 'window._agendaExtra=window._agendaExtra||{};\n    window._agendaExtra[chave]=appt;';
var novo = 'window._agendaExtra=window._agendaExtra||{};\n    window._agendaExtra[chave]=appt;\n    try{localStorage.setItem("aflor_agendamentos",JSON.stringify(window._agendaExtra));}catch(e){}';

c = c.replace(old, novo);
console.log('ok save:', c.includes('aflor_agendamentos'));

// Inserir load antes do </head>
c = c.replace('</head>', loadScript + '</head>');
console.log('ok load:', c.includes('aflor_agendamentos'));

fs.writeFileSync('index.html', c);
