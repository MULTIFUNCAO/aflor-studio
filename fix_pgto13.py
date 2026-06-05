c = open('index.html', encoding='utf-8').read()

# Usar string raw com os caracteres exatos do arquivo
old = "abrirComandaAtendimento(\\'${dados.cliente}\\',\\'${dados.servico}\\',\\'${dados.valor}\\')"
new = "abrirModalPagamento(window._agendaPopupKey,window._agendaPopupDados)"

# Mostrar o que realmente esta no arquivo
pos = 515122
real = c[pos:pos+len(old)]
print('len old:', len(old))
print('real:', repr(real))
print('old: ', repr(old))

# Replace direto com o que o repr mostrou
real_str = "abrirComandaAtendimento(\\'${dados.cliente}\\',\\'${dados.servico}\\',\\'${dados.valor}\\')"
if real_str in c:
    c = c.replace(real_str, new, 1)
    print('ok')
    open('index.html', 'w', encoding='utf-8').write(c)
else:
    # Tentar sem double backslash
    real_str2 = r"abrirComandaAtendimento(\'${dados.cliente}\',\'${dados.servico}\',\'${dados.valor}\')"
    print('real_str2 in c:', real_str2 in c)
    if real_str2 in c:
        c = c.replace(real_str2, new, 1)
        print('ok2')
        open('index.html', 'w', encoding='utf-8').write(c)
