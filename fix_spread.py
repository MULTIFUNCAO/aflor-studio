c = open('index.html', encoding='utf-8').read()

# Fix spread operator - nao suportado
old = 'const funcs=[...funcSel.selectedOptions].map(o=>o.value)'
new = 'const funcs=Array.from(funcSel.selectedOptions).map(o=>o.value)'

if old in c:
    c = c.replace(old, new)
    print('spread fix ok')
else:
    print('nao achou spread, buscando...')
    idx = c.find('funcSel.selectedOptions')
    if idx != -1:
        print(repr(c[idx-20:idx+60]))

# Fix botao com dois onclicks - remover o toggleSinalPopup do onclick
old2 = 'onclick="toggleSinalPopup(\'${key}\')" style="font-size:11px;font-weight:700;background:#111;color:#fff;border:none;border-radius:7px;padding:5px 10px;cursor:pointer" onclick="fecharAgendaPopup();setTimeout(function(){openModal(\'modal-comanda\')},100);">'
new2 = 'style="font-size:11px;font-weight:700;background:#111;color:#fff;border:none;border-radius:7px;padding:5px 10px;cursor:pointer" onclick="fecharAgendaPopup();setTimeout(function(){openModal(\'modal-comanda\')},100);">'

if old2 in c:
    c = c.replace(old2, new2)
    print('duplo onclick fix ok')
else:
    print('nao achou duplo onclick')
    idx = c.find('toggleSinalPopup')
    while idx != -1:
        print(repr(c[idx-5:idx+80]))
        print('---')
        idx = c.find('toggleSinalPopup', idx+1)
        if idx > 700000: break

open('index.html', 'w', encoding='utf-8').write(c)
