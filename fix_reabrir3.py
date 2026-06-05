c = open('index.html', encoding='utf-8').read()

# O botao tem dois onclicks - vamos ver o trecho exato completo
idx = 513220
print(repr(c[idx-10:idx+300]))
