c = open('index.html', encoding='utf-8').read()

# Ver contexto completo do botão Reabrir (150 chars antes e depois)
idx = c.find('modal-comanda')
while idx != -1:
    ctx = c[idx-200:idx+100]
    if 'Reabrir' in ctx or 'onclick' in ctx:
        print('pos', idx)
        print(repr(ctx))
        print('---')
    idx = c.find('modal-comanda', idx+1)
    if idx > 700000:
        break
