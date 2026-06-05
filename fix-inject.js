var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var script = `
<script>
// Interceptar botao confirmar agendamento
document.addEventListener('click', function(e) {
  var btn = e.target.closest('#modal-agendar button');
  if (!btn) return;
  var txt = btn.textContent || '';
  if (!txt.includes('Confirmar')) return;
  // Ler dados do formulario
  var m = document.getElementById('modal-agendar');
  var inputs = m.querySelectorAll('input');
  var selects = m.querySelectorAll('select');
  var cliente = (m.querySelector('#ag-cliente') || inputs[0] || {}).value || '';
  var data = (m.querySelector('#ag-data') || inputs[1] || {}).value || '';
  var hora = (m.querySelector('#ag-hora') || inputs[2] || {}).value || '';
  var prof = selects[0] ? selects[0].value : '';
  if (!data || !cliente) return;
  window._novosAgendamentos = window._novosAgendamentos || [];
  window._novosAgendamentos.push({
    id: Date.now(), cliente: cliente, data: data, hora: hora,
    prof: prof, servico: selects[1] ? selects[1].value.split(' —')[0] : '',
    status: 'agendado', valor: 0
  });
  console.log('agendamento local salvo:', window._novosAgendamentos);
  setTimeout(function(){ if(typeof renderAgenda==='function') renderAgenda(); }, 300);
}, true);
</script>
`;

c = c.replace('</body>', script + '</body>');
fs.writeFileSync('index.html', c);
console.log('ok:', c.includes('_novosAgendamentos'));
