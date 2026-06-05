c = open('index.html', encoding='utf-8').read()

# Remover o toggleSinalPopup do onclick e manter so o openModal com fechar popup
# O botao atual tem onclick="openModal('modal-comanda')" - precisa tambem fecharAgendaPopup
old = 'cursor:pointer" onclick="openModal(\'modal-comanda\')">${(dados.sinalPago||dados.sinal)?\'Reabrir\':\'\\u2705 Confirmar sinal\'}</button>'
new = 'cursor:pointer" onclick="fecharAgendaPopup();openModal(\'modal-comanda\')">${(dados.sinalPago||dados.sinal)?\'Reabrir\':\'\\u2705 Confirmar sinal\'}</button>'

if old in c:
    c = c.replace(old, new)
    print('ok - fecharAgendaPopup adicionado')
else:
    # Buscar por pedaco menor
    idx = c.find("cursor:pointer\" onclick=\"openModal('modal-comanda')\">")
    if idx != -1:
        print('achou por pedaco:', repr(c[idx:idx+120]))
    else:
        idx = c.find('modal-comanda')
        while idx != -1:
            ctx = c[idx-100:idx+80]
            if 'Reabrir' in ctx or 'sinalPago' in ctx:
                print('pos', idx, repr(ctx))
            idx = c.find('modal-comanda', idx+1)
            if idx > 700000: break

open('index.html', 'w', encoding='utf-8').write(c)
