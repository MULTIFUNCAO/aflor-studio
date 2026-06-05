c = open('index.html', encoding='utf-8').read()

# Fix 1: adicionar fecharAgendaPopup() no botao Reabrir
idx = c.find("cursor:pointer\" onclick=\"openModal('modal-comanda')\">")
if idx != -1:
    trecho = c[idx:idx+200]
    novo = trecho.replace(
        "cursor:pointer\" onclick=\"openModal('modal-comanda')\">",
        "cursor:pointer\" onclick=\"fecharAgendaPopup();setTimeout(function(){openModal('modal-comanda')},100);\">",
        1
    )
    c = c.replace(trecho, novo, 1)
    print('fix1 ok')
else:
    print('fix1 nao achou')

# Fix 2: remover ... literal no JS (spread operator nao suportado)
if '...' in c:
    # Ver contexto do ...
    idx2 = c.find('...')
    while idx2 != -1:
        ctx = c[idx2-50:idx2+50]
        if '<script' not in ctx and '</script' not in ctx:
            print('... pos', idx2, repr(ctx))
        idx2 = c.find('...', idx2+1)
        if idx2 > 700000: break

open('index.html', 'w', encoding='utf-8').write(c)
