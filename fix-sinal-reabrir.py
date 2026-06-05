
import re

c = open("index.html", encoding="utf-8").read()

# Fix 1: badge sinal pago - adicionar fallback dados.sinal
c = c.replace("dados.sinalPago?", "(dados.sinalPago||dados.sinal)?")

# Fix 2: botao Reabrir - chamar funcao correta
c = c.replace("onclick=\"reabrirRetorno(${i})\">Reabrir", "onclick=\"reabrirSinalSupa(dados.id)\">Reabrir")

# Fix 3: injetar funcao reabrirSinalSupa (compacta, sem quebra de linha)
anchor = "function reabrirRetorno(i)"
if anchor in c:
    c = c.replace(anchor, fn + "
" + anchor)
    print("fn injetada ok")
else:
    print("ANCHOR NAO ACHADO")

count = c.count("(dados.sinalPago||dados.sinal)?")
print("badge fixes:", count)

open("index.html", "w", encoding="utf-8").write(c)
print("salvo")
