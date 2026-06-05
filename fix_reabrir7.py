c = open('index.html', encoding='utf-8').read()

# Remover o fecharAgendaPopup do onclick do Reabrir - so abrir o modal
old = 'cursor:pointer" onclick="fecharAgendaPopup();setTimeout(function(){openModal(\'modal-comanda\')},100);">'
new = 'cursor:pointer" onclick="openModal(\'modal-comanda\');">'

if old in c:
    c = c.replace(old, new)
    print('ok')
else:
    print('nao achou - buscando...')
    idx = c.find('fecharAgendaPopup();setTimeout')
    if idx != -1:
        print(repr(c[idx-20:idx+100]))

open('index.html', 'w', encoding='utf-8').write(c)
