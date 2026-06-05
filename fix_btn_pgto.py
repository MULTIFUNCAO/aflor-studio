c = open('index.html', encoding='utf-8').read()

# Ver trecho exato do botao Registrar Pagamento
idx = c.find('Registrar Pagamento</button>')
print(repr(c[idx-200:idx+30]))
