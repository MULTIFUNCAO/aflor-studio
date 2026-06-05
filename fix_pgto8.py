c = open('index.html', encoding='utf-8').read()

old = "onclick=\"abrirComandaAtendimento(\\'${dados.cliente}\\',\\'${dados.servico}\\',\\'${dados.valor}\\')\""
new = "onclick=\"abrirModalPagamento(window._agendaPopupKey,window._agendaPopupDados)\""

if old in c:
    c = c.replace(old, new)
    print('ok')
else:
    # Tentar variacao
    old2 = "onclick=\\"abrirComandaAtendimento(\\'${dados.cliente}\\',\\'${dados.servico}\\',\\'${dados.valor}\\')\\"" 
    print('nao achou - ver trecho:')
    idx = c.find("abrirComandaAtendimento(\\'${dados")
    if idx != -1:
        print(repr(c[idx-10:idx+80]))

open('index.html', 'w', encoding='utf-8').write(c)
