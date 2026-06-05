c = open('index.html', encoding='utf-8').read()

# 1. Adicionar onclick no botao Registrar Pagamento
old = '") style="flex:1;padding:8px;background:#111;color:#fff;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">\U0001f4b3 Registrar Pagamento</button>'
new = '") style="flex:1;padding:8px;background:#111;color:#fff;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer" onclick="abrirModalPagamento(window._agendaPopupKey,window._agendaPopupDados)">\U0001f4b3 Registrar Pagamento</button>'

if old in c:
    c = c.replace(old, new)
    print('botao ok')
else:
    print('nao achou botao - buscando...')
    idx = c.find('Registrar Pagamento</button>')
    print(repr(c[idx-150:idx+30]))

# 2. Adicionar modal de pagamento antes do </body>
modal = '''
<!-- MODAL PAGAMENTO FINAL -->
<div id="modal-pagamento-final" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);align-items:center;justify-content:center">
  <div style="background:#fff;border-radius:16px;padding:24px;width:340px;max-width:95vw;font-family:-apple-system,sans-serif">
    <div style="font-size:16px;font-weight:800;margin-bottom:16px">💳 Confirmar Pagamento</div>
    <div id="pgto-resumo" style="background:#f8f8f8;border-radius:10px;padding:14px;margin-bottom:16px;font-size:13px"></div>
    <div style="margin-bottom:12px">
      <label style="font-size:12px;font-weight:600;color:#555">Forma de Pagamento</label>
      <select id="pgto-forma" style="width:100%;margin-top:4px;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:13px">
        <option>PIX</option>
        <option>Dinheiro</option>
        <option>Cartão de Crédito</option>
        <option>Cartão de Débito</option>
      </select>
    </div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button onclick="document.getElementById('modal-pagamento-final').style.display='none'" style="flex:1;padding:10px;background:#f5f5f5;border:none;border-radius:8px;font-size:13px;cursor:pointer">Cancelar</button>
      <button onclick="confirmarPagamentoFinal()" style="flex:1;padding:10px;background:#111;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">✅ Confirmar</button>
    </div>
  </div>
</div>'''

if 'modal-pagamento-final' not in c:
    c = c.replace('</body>', modal + '\n</body>')
    print('modal adicionado ok')
else:
    print('modal ja existe')

# 3. Adicionar funcoes JS antes do </script> final
js = '''
function abrirModalPagamento(key, dados) {
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
}

async function confirmarPagamentoFinal() {
  var dados = window._pgtoDados;
  var key = window._pgtoKey;
  var forma = document.getElementById('pgto-forma').value;
  if(!dados||!dados.id) { alert('Erro: ID do agendamento não encontrado'); return; }
  var btn = document.querySelector('#modal-pagamento-final button:last-child');
  btn.textContent = 'Salvando...'; btn.disabled = true;
  var {error} = await supabase.from('agendamentos').update({status:'concluido',forma_pagamento:forma,pago:true}).eq('id',dados.id);
  if(error){ alert('Erro ao salvar: '+error.message); btn.textContent='✅ Confirmar'; btn.disabled=false; return; }
  document.getElementById('modal-pagamento-final').style.display='none';
  fecharAgendaPopup();
  await carregarAgendaDia(window._diaAtual||new Date().toISOString().slice(0,10));
  alert('✅ Pagamento confirmado!');
}
'''

# Inserir antes do ultimo </script>
ultimo_script = c.rfind('</script>')
if ultimo_script != -1:
    c = c[:ultimo_script] + js + '\n' + c[ultimo_script:]
    print('js adicionado ok')

open('index.html', 'w', encoding='utf-8').write(c)
