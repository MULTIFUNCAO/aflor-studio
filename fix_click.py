c = open('index.html', encoding='utf-8').read()

old = 'slot occupied" onclick="abrirAgendaPopup(\\'${key}\\',agendaDiaAtual[\\'${key}\\'],event)">'
new = 'slot occupied" onclick="abrirAgendaPopup(\\'${key}\\',agendaDiaAtual[\\'${key}\\'],event);event.stopPropagation()">'

if old in c:
    c = c.replace(old, new)
    print('ok - adicionado stopPropagation')
else:
    print('nao achou')

open('index.html', 'w', encoding='utf-8').write(c)
