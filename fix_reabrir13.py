c = open('index.html', encoding='utf-8').read()

# Ver campos do objeto dados - como sao mapeados do Supabase
idx = c.find('function abrirAgendaPopup')
print(repr(c[idx+1500:idx+3000]))
