var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Fix badge sinal
c = c.split('dados.sinalPago?').join('(dados.sinalPago||dados.sinal)?');

// Fix botao Reabrir
c = c.split('onclick="reabrirRetorno(${i})">Reabrir</button>').join('onclick="reabrirSinalSupa(dados.id)">Reabrir</button>');

// Injetar funcao reabrirSinalSupa
var fn = `
function reabrirSinalSupa(id){
  if(!window._supa||!id)return;
  window._supa.from('agendamentos').update({sinal:false,sinal_valor:null}).eq('id',id).then(function(){
    carregarAgendamentosSupa();
    var p=document.getElementById('popup-agendamento');
    if(p) p.style.display='none';
  });
}
`;
var anchor = 'function reabrirRetorno(i)';
if(c.includes(anchor)){
  c = c.split(anchor).join(fn + anchor);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou anchor');
}
