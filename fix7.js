var fs=require('fs');
var c=fs.readFileSync('index.html','utf8');
// Trocar _agendamentosMap por agendamentos (array global)
c=c.replace('_agendamentosMap[data]=_agendamentosMap[data]||[];\n  _agendamentosMap[data].push(novo);','agendamentos.push(novo);');
fs.writeFileSync('index.html',c);
console.log('ok:',c.includes('agendamentos.push(novo)'));
