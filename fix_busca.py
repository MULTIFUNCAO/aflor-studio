c = open('index.html', encoding='utf-8').read()

# Ver o input de busca na pagina de comandas
idx = c.find('Buscar comanda')
if idx != -1:
    print(repr(c[idx-50:idx+150]))
