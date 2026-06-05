c = open('index.html', encoding='utf-8').read()

# Ver como agendaDiaAtual e montado - quais campos vem do Supabase
idx = c.find('agendaDiaAtual')
while idx != -1:
    ctx = c[idx:idx+80]
    if 'valor' in ctx or 'preco' in ctx or 'price' in ctx:
        print('pos', idx, repr(ctx))
        print('---')
    idx = c.find('agendaDiaAtual', idx+1)
    if idx > 700000: break

# Ver colunas do select do Supabase
idx = c.find('.from(\'agendamentos\')')
if idx == -1:
    idx = c.find('.from("agendamentos")')
if idx != -1:
    print('supabase query:', repr(c[idx:idx+200]))
