c = open('index.html', encoding='utf-8').read()

# Ver o onclick do botao Ver na lista de comandas
idx = c.find('">Ver</button>')
while idx != -1:
    print('pos', idx, repr(c[idx-100:idx+20]))
    print('---')
    idx = c.find('">Ver</button>', idx+1)
    if idx > 700000: break
