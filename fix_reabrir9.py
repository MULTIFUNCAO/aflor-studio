c = open('index.html', encoding='utf-8').read()

# Trocar openModal('modal-comanda') no botao Reabrir por abrirComandaAtendimento
old = 'cursor:pointer" onclick="openModal(\'modal-comanda\');">'
new = 'cursor:pointer" onclick="abrirComandaAtendimento(\'${dados.cliente}\',\'${dados.servico}\',\'${dados.valor}\');">'

if old in c:
    c = c.replace(old, new)
    print('ok')
else:
    print('nao achou')
    idx = c.find("openModal('modal-comanda');")
    while idx != -1:
        print('pos', idx, repr(c[idx-30:idx+60]))
        print('---')
        idx = c.find("openModal('modal-comanda');", idx+1)
        if idx > 700000: break

open('index.html', 'w', encoding='utf-8').write(c)
