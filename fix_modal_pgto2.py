c = open('index.html', encoding='utf-8').read()

# Melhorar a funcao abrirModalPagamento com sinal e campo editavel
old = '''function abrirModalPagamento(key, dados) {
  if(!dados) return;
  window._pgtoKey = key;
  window._pgtoDados = dados;
  var sinalVal = parseFloat((dados.sinalValor||'0').toString().replace('R$','').replace(',','.').trim())||0;
  var total = parseFloat((dados.valor||0))||40;
  var restante = Math.max(0, total - sinalVal);
  var resumo = document.getElementById('pgto-resumo');
  resumo.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#555">Cliente</span><strong>'+(dados.cliente||'')+'</strong></div>'
    +'<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#555">Serviço</span><span>'+(dados.servico||'')+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#555">Total</span><span>R$ '+total.toFixed(2).replace('.',',')+'</span></div>'
    +(sinalVal>0?'<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#27ae60">(-) Sinal pago</span><span style="color:#27ae60">- R$ '+sinalVal.toFixed(2).replace('.',',')+'</span></div>':'')
    +'<hr style="margin:8px 0;border:none;border-top:1px solid #eee">'
    +'<div style="display:flex;justify-content:space-between"><strong>Restante</strong><strong style="font-size:16px">R$ '+restante.toFixed(2).replace('.',',')+'</strong></div>';
  document.getElementById('modal-pagamento-final').style.display='flex';
}'''

new = '''function abrirModalPagamento(key, dados) {
  if(!dados) return;
  window._pgtoKey = key;
  window._pgtoDados = dados;
  var sinalVal = parseFloat((dados.sinalValor||'0').toString().replace('R$','').replace(',','.').trim())||0;
  var total = parseFloat((dados.valor||0))||0;
  var restante = Math.max(0, total - sinalVal);
  var resumo = document.getElementById('pgto-resumo');
  var sinalStatus = dados.sinalPago ? '\\u2705 Sinal pago' : (dados.sinal ? '\\u23f3 Sinal pendente' : 'Sem sinal');
  resumo.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#555">Cliente</span><strong>'+(dados.cliente||'')+'</strong></div>'
    +'<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#555">Servi\\u00e7o</span><span>'+(dados.servico||'')+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#555">Profissional</span><span>'+(dados.prof||'Ana Flor')+'</span></div>'
    +'<hr style="margin:8px 0;border:none;border-top:1px solid #eee">'
    +'<div style="margin-bottom:8px"><label style="font-size:12px;font-weight:600;color:#555">Valor Total (R$)</label>'
    +'<input id="pgto-valor" type="number" step="0.01" value="'+total.toFixed(2)+'" style="width:100%;margin-top:4px;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px;font-weight:700;box-sizing:border-box" oninput="atualizarResumoPgto()"></div>'
    +(dados.sinal?'<div style="display:flex;justify-content:space-between;margin-bottom:6px;padding:8px;background:#f0fdf4;border-radius:8px"><span style="color:#555">'+sinalStatus+'</span><span style="color:#27ae60;font-weight:700">R$ '+sinalVal.toFixed(2).replace('.',',')+'</span></div>':'')
    +'<div style="display:flex;justify-content:space-between;padding:10px;background:#f8f8f8;border-radius:8px"><strong>Restante a cobrar</strong><strong id="pgto-restante" style="font-size:16px;color:#111">R$ '+restante.toFixed(2).replace('.',',')+'</strong></div>';
  document.getElementById('modal-pagamento-final').style.display='flex';
}

function atualizarResumoPgto() {
  var dados = window._pgtoDados;
  var sinalVal = parseFloat((dados.sinalValor||'0').toString().replace('R$','').replace(',','.').trim())||0;
  var total = parseFloat(document.getElementById('pgto-valor').value)||0;
  var restante = Math.max(0, total - sinalVal);
  var el = document.getElementById('pgto-restante');
  if(el) el.textContent = 'R$ '+restante.toFixed(2).replace('.',',');
}'''

if old in c:
    c = c.replace(old, new)
    print('ok')
else:
    print('nao achou - buscando...')
    idx = c.find('function abrirModalPagamento')
    print(repr(c[idx:idx+100]))

open('index.html', 'w', encoding='utf-8').write(c)
