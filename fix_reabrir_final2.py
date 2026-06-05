c = open('index.html', encoding='utf-8').read()

# Trocar onclick do Reabrir para navegar para comandas filtrado
old = "cursor:pointer\" onclick=\"abrirComandaAtendimento('${dados.cliente}','${dados.servico}','${dados.valor}');\">"
new = "cursor:pointer\" onclick=\"fecharAgendaPopup();showPage('comandas');setTimeout(function(){var el=document.getElementById('busca-comanda');if(el){el.value='${dados.cliente}';renderComandas();}},200);\">"

if old in c:
    c = c.replace(old, new)
    print('ok')
else:
    print('nao achou')
    idx = c.find('abrirComandaAtendimento')
    while idx != -1:
        print(repr(c[idx-20:idx+80]))
        print('---')
        idx = c.find('abrirComandaAtendimento', idx+1)
        if idx > 700000: break

open('index.html', 'w', encoding='utf-8').write(c)
