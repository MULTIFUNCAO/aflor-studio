c = open('index.html', encoding='utf-8').read()

# Adicionar id ao input de busca de comandas
old = 'placeholder="\U0001f50d Buscar comanda ou cliente...'
new = 'id="busca-comanda" placeholder="\U0001f50d Buscar comanda ou cliente...'

if old in c:
    c = c.replace(old, new)
    print('id adicionado ok')
else:
    print('nao achou placeholder')
    idx = c.find('Buscar comanda')
    print(repr(c[idx-30:idx+80]))

# Ver funcao renderComandas para saber o nome correto
idx = c.find('function renderComandas')
if idx == -1:
    idx = c.find('renderComandas')
print('renderComandas:', repr(c[idx:idx+60]))

open('index.html', 'w', encoding='utf-8').write(c)
