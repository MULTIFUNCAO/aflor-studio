c = open('index.html', encoding='utf-8').read()

# Ver como o objeto dados e montado no abrirAgendaPopup
idx = c.find('function abrirAgendaPopup')
if idx != -1:
    print(repr(c[idx:idx+600]))
