c = open('index.html', encoding='utf-8').read()

# Ver EXATAMENTE o que tem na pos 597672 (spread operator)
print('=== spread ===')
print(repr(c[597620:597750]))

# Ver trecho do botao Reabrir completo - buscar pelo texto visivel
print('=== botao reabrir ===')
idx = c.find('Reabrir')
while idx != -1:
    ctx = c[idx-300:idx+50]
    if 'button' in ctx and 'onclick' in ctx:
        print('pos', idx)
        print(repr(c[idx-300:idx+60]))
        print('---')
    idx = c.find('Reabrir', idx+1)
    if idx > 700000: break
