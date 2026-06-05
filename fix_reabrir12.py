c = open('index.html', encoding='utf-8').read()

# Ver mais da funcao abrirAgendaPopup para ver os campos do dados
idx = c.find('function abrirAgendaPopup')
print(repr(c[idx:idx+1500]))
