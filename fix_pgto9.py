c = open('index.html', encoding='utf-8').read()

# Buscar e substituir usando find/replace por posicao
search = "abrirComandaAtendimento(\\'${dados.cliente}\\',\\'${dados.servico}\\',\\'${dados.valor}\\')"
replace = "abrirModalPagamento(window._agendaPopupKey,window._agendaPopupDados)"

if search in c:
    c = c.replace(search, replace)
    print('ok')
else:
    # Ver o que tem exatamente
    idx = c.find("abrirComandaAtendimento(\\'")
    if idx != -1:
        print('encontrou variacao:', repr(c[idx:idx+80]))
    else:
        idx = c.find("abrirComandaAtendimento")
        print('sem escape:', repr(c[idx:idx+80]))

open('index.html', 'w', encoding='utf-8').write(c)
