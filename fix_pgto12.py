c = open('index.html', encoding='utf-8').read()

# Usar o trecho exato que o Python mostrou
pos = 515122
# Ver 100 chars a partir da pos
trecho_real = c[pos:pos+100]
print('real:', repr(trecho_real))

# Fazer replace simples do que esta la
old = "abrirComandaAtendimento(\\'${dados.cliente}\\',\\'${dados.servico}\\',\\'${dados.valor}\\')"
if old in c:
    c = c.replace(old, "abrirModalPagamento(window._agendaPopupKey,window._agendaPopupDados)", 1)
    print('ok')
    open('index.html', 'w', encoding='utf-8').write(c)
else:
    print('nao achou, ver trecho real acima')
