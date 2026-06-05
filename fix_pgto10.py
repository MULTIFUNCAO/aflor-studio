c = open('index.html', encoding='utf-8').read()

# Achar todas as ocorrencias de abrirComandaAtendimento e ver o contexto
# para identificar qual e o do botao no innerHTML do popup
idx = c.find('abrirComandaAtendimento')
results = []
while idx != -1:
    results.append((idx, c[idx:idx+80]))
    idx = c.find('abrirComandaAtendimento', idx+1)
    if idx > 700000: break

for pos, trecho in results:
    print('pos', pos, repr(trecho))
    print('---')
