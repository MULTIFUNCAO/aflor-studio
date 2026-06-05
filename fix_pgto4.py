c = open('index.html', encoding='utf-8').read()

# Ver pos 515414 e mais adiante - segundo Registrar Pagamento
idx = c.find('Registrar Pagamento', 515500)
while idx != -1:
    print('pos', idx, repr(c[idx-150:idx+60]))
    print('---')
    idx = c.find('Registrar Pagamento', idx+1)
    if idx > 700000: break
