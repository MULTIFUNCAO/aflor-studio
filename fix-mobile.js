var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var css = '<style id="mobile-fix">\n@media (max-width: 640px) {\n  * { box-sizing: border-box !important; }\n  body { overflow-x: hidden !important; max-width: 100vw !important; }\n  .dashboard-grid, .grid-cols-2, .grid-cols-3 { grid-template-columns: 1fr !important; }\n  [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }\n  [style*="display: grid"] { grid-template-columns: 1fr !important; }\n}\n</style>';

if (!c.includes('mobile-fix')) {
  c = c.replace('</head>', css + '\n</head>');
  fs.writeFileSync('index.html', c);
  console.log('ok');
} else {
  console.log('ja existe');
}
