c = open('index.html', encoding='utf-8').read()

# Buscar onde Registrar Pagamento e gerado no innerHTML
idx = c.find('Registrar Pagamento')
while idx != -1:
    print('pos', idx, repr(c[idx-100:idx+60]))
    print('---')
    idx = c.find('Registrar Pagamento', idx+1)
    if idx > 700000: break
