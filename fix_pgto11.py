c = open('index.html', encoding='utf-8').read()

# Substituir por posicao - pos 515122
target = "abrirComandaAtendimento(\\'${dados.cliente}\\',\\'${dados.servico}\\',\\'${dados.valor}\\')"
replace = "abrirModalPagamento(window._agendaPopupKey,window._agendaPopupDados)"

pos = 515122
trecho = c[pos:pos+len(target)]
print('trecho encontrado:', repr(trecho))
print('target:           ', repr(target))
print('igual:', trecho == target)

if trecho == target:
    c = c[:pos] + replace + c[pos+len(target):]
    print('substituido ok')
    open('index.html', 'w', encoding='utf-8').write(c)
else:
    # Mostrar byte a byte onde difere
    for i,(a,b) in enumerate(zip(trecho,target)):
        if a!=b:
            print(f'difere pos {i}: got {repr(a)} expected {repr(b)}')
            break
