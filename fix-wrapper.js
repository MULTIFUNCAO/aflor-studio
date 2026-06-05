var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

// Injetar script antes do </body> que sobrescreve o botão confirmar
var inject = `
<script>
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.querySelector('#modal-agendar .btn-primary, #modal-agendar button[onclick*="salvar"], #modal-agendar .modal-footer button:last-child');
  console.log('btn confirmar:', btn);
});
</script>
`;

// Só para debug - ver o botão confirmar
var idx = c.indexOf('modal-agendar');
var trecho = c.substring(idx, idx + 3000);
var idxBtn = trecho.lastIndexOf('Confirmar');
console.log(JSON.stringify(trecho.substring(idxBtn - 50, idxBtn + 100)));
