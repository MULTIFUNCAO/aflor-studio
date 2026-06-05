c = open('index.html', encoding='utf-8').read()

# Ver como modal-comanda e aberto em outros contextos
print('=== openModal comanda ===')
idx = c.find("openModal('modal-comanda')")
while idx != -1:
    print('pos', idx, repr(c[idx-50:idx+50]))
    print('---')
    idx = c.find("openModal('modal-comanda')", idx+1)
    if idx > 700000: break

# Ver a funcao openModal
print('=== funcao openModal ===')
idx = c.find('function openModal')
if idx != -1:
    print(repr(c[idx:idx+200]))

# Ver a funcao fecharAgendaPopup
print('=== fecharAgendaPopup ===')
idx = c.find('function fecharAgendaPopup')
if idx != -1:
    print(repr(c[idx:idx+150]))
