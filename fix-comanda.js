var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var old = 'function criarComanda(){';
var novo = 'function criarComanda(){\n' +
'  // Salvar comanda no Supabase\n' +
'  if (window._supa && window._agendaPopupDados) {\n' +
'    var dados = window._agendaPopupDados;\n' +
'    var sinalAtivo = document.getElementById("cmd-sinal-ativo")?.checked;\n' +
'    var sinalValor = parseFloat(document.getElementById("cmd-sinal-agora")?.textContent?.replace("R$ ","").replace(",",".")) || 0;\n' +
'    var sinalStatus = document.querySelector("input[name=\\"cmd-sinal-status\\"]:checked")?.value || "pendente";\n' +
'    var total = parseFloat(document.getElementById("cmd-total")?.textContent?.replace("R$ ","").replace(",",".")) || 0;\n' +
'    var desconto = parseFloat(document.getElementById("cmd-desconto")?.value) || 0;\n' +
'    var formaPag = document.getElementById("cmd-forma-pag")?.value || "PIX";\n' +
'    var itens = [];\n' +
'    document.querySelectorAll("#cmd-itens-lista select").forEach(function(s){\n' +
'      itens.push({nome: s.options[s.selectedIndex]?.text, valor: parseFloat(s.value)||0});\n' +
'    });\n' +
'    window._supa.from("comandos").insert([{\n' +
'      agendamento_id: dados.id || null,\n' +
'      cliente: dados.cliente,\n' +
'      prof: dados.prof,\n' +
'      data: dados.data,\n' +
'      itens: JSON.stringify(itens),\n' +
'      total: total,\n' +
'      desconto: desconto,\n' +
'      forma_pagamento: formaPag,\n' +
'      sinal_ativo: sinalAtivo || false,\n' +
'      sinal_valor: sinalValor,\n' +
'      sinal_status: sinalStatus,\n' +
'      status: "aberto"\n' +
'    }]).then(function(r){\n' +
'      if(r.error) console.error("supa comanda:", r.error);\n' +
'      else console.log("supa: comanda salva ok");\n' +
'    });\n' +
'    // Atualizar sinal no agendamento\n' +
'    if (dados.id && sinalAtivo) {\n' +
'      window._supa.from("agendamentos").update({\n' +
'        sinal: sinalAtivo,\n' +
'        sinal_valor: sinalValor,\n' +
'        sinal_status: sinalStatus\n' +
'      }).eq("id", dados.id).then(function(r){\n' +
'        if(r.error) console.error("supa sinal:", r.error);\n' +
'        else { console.log("supa: sinal atualizado ok"); carregarAgendamentosSupa(); }\n' +
'      });\n' +
'    }\n' +
'  }\n';

if (c.includes(old)) {
  c = c.replace(old, novo);
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('nao achou');
}
