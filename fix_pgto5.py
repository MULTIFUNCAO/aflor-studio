c = open('index.html', encoding='utf-8').read()

# O popup e gerado via innerHTML - buscar onde monta o HTML do popup com Registrar
# Pode estar como string JS com \n ou concatenacao
for termo in ['Registrar Pagamento', 'registrar pagamento', 'registrarPagamento']:
    idx = c.find(termo)
    while idx != -1:
        print('pos', idx, repr(c[idx-80:idx+80]))
        print('---')
        idx = c.find(termo, idx+1)
        if idx > 700000: break
