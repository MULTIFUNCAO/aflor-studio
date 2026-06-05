var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var idx = c.indexOf('var profNome=profSel.options');
var endIdx = c.indexOf('renderAgenda();', idx) + 15;
var blocoAtual = c.substring(idx, endIdx);
console.log('bloco atual:', JSON.stringify(blocoAtual));

var novoBloco = "var profNome=profSel.options[profSel.selectedIndex].text;\n    var chave=profNome+':'+horaSel.value;\n    var appt={cliente:cliente,servico:servicoSel?servicoSel.options[servicoSel.selectedIndex].text:'',prof:profNome,hora:horaSel.value,data:dataSel.value,valor:'R$ 0,00',sinal:false,cls:'#7c3aed'};\n    agendaAppts[chave]=appt;\n    var dObj=new Date(dataSel.value+'T00:00:00');\n    var dKey=dObj.getDate()+'/'+(dObj.getMonth()+1)+'/'+dObj.getFullYear();\n    agendaDataAtual=dObj;\n    renderAgenda();";

c = c.substring(0, idx) + novoBloco + c.substring(endIdx);
fs.writeFileSync('index.html', c);
console.log('ok');
