c = open('index.html', encoding='utf-8').read()

# Ver funcoes relacionadas a editar comanda
print('=== editarComanda / verComanda ===')
for termo in ['editarComanda', 'verComanda', 'abrirComanda', 'Ver Comanda', 'modal-ver-comanda', 'modal-editar-comanda']:
    idx = c.find(termo)
    if idx != -1:
        print(f'ACHOU {termo}:', repr(c[idx-30:idx+80]))
        print('---')

# Ver o botao "Ver Comandas" que ja existe no popup
print('=== Ver Comandas ===')
idx = c.find('Ver Comandas')
while idx != -1:
    print('pos', idx, repr(c[idx-50:idx+80]))
    print('---')
    idx = c.find('Ver Comandas', idx+1)
    if idx > 700000: break
