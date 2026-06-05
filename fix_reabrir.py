c = open('index.html', encoding='utf-8').read()

# Buscar a posicao exata
idx = c.find("cursor:pointer\">${(dados.sinalPago")
if idx != -1:
    trecho = c[idx:idx+150]
    print('trecho:', repr(trecho))
    # Inserir onclick antes do >$
    old = trecho
    new = trecho.replace('cursor:pointer">', 'cursor:pointer" onclick="openModal(\'modal-comanda\')">', 1)
    c = c.replace(old, new, 1)
    print('ok')
    open('index.html', 'w', encoding='utf-8').write(c)
else:
    print('nao achou')
