c = open('index.html', encoding='utf-8').read()

# Ver onclick do botao Registrar Pagamento
idx = c.find('Registrar Pagamento')
while idx != -1:
    print('pos', idx, repr(c[idx-100:idx+50]))
    print('---')
    idx = c.find('Registrar Pagamento', idx+1)
    if idx > 700000: break
