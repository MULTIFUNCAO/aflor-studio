c = open('index.html', encoding='utf-8').read()

# Ver a funcao abrirComandaAtendimento completa
idx = c.find('function abrirComandaAtendimento')
if idx != -1:
    print(repr(c[idx:idx+500]))
else:
    print('nao achou - buscando...')
    idx = c.find('abrirComandaAtendimento')
    print(repr(c[idx:idx+300]))
