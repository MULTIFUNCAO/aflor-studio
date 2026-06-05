var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');
var lines = c.split('\n');

// Linha 10199 (index 10198)
var targetLine = 10198;
// Achar o <script> anterior
var scriptStart = targetLine;
while (scriptStart > 0 && !lines[scriptStart].includes('<script>')) scriptStart--;
// Achar o </script> posterior  
var scriptEnd = targetLine;
while (scriptEnd < lines.length && !lines[scriptEnd].includes('</script>')) scriptEnd++;

console.log('removendo linhas', scriptStart+1, 'a', scriptEnd+1);
console.log('inicio:', JSON.stringify(lines[scriptStart].substring(0,80)));
console.log('fim:', JSON.stringify(lines[scriptEnd].substring(0,80)));

lines.splice(scriptStart, scriptEnd - scriptStart + 1);
fs.writeFileSync('index.html', lines.join('\n'));
console.log('ok');
