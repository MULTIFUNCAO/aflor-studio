c = open('index.html', encoding='utf-8').read()

# Buscar abrirComandaAtendimento no contexto de innerHTML do popup
idx = c.find('abrirComandaAtendimento')
while idx != -1:
    print('pos', idx, repr(c[idx-50:idx+100]))
    print('---')
    idx = c.find('abrirComandaAtendimento', idx+1)
    if idx > 700000: break
