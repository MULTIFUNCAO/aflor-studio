c = open('index.html', encoding='utf-8').read()

idx = c.find('Registrar Pagamento</button>')
trecho = c[idx-250:idx+30]

# Substituir o onclick no trecho
novo_trecho = trecho.replace(
    'cursor:pointer">',
    'cursor:pointer" onclick="abrirModalPagamento(window._agendaPopupKey,window._agendaPopupDados)">',
    1
)

if trecho != novo_trecho:
    c = c.replace(trecho, novo_trecho, 1)
    print('ok')
else:
    print('nao substituiu - ver trecho:')
    print(repr(trecho))

open('index.html', 'w', encoding='utf-8').write(c)
