// Builds src/index.html from the shared app.html (web version), swapping Google Fonts for bundled offline fonts.
const fs = require('fs'), path = require('path');
const src = process.argv[2] || path.join(__dirname, 'app.html');
let body = fs.readFileSync(src, 'utf8')
  .replace(/<link rel="preconnect"[^>]*>\s*/,'')
  .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, '');
const ff = (fam, file, w) => `@font-face{font-family:"${fam}";src:url(fonts/${file}) format("woff2");font-weight:${w};font-display:swap}`;
const faces = [
  ff('Atkinson Hyperlegible','atkinson-hyperlegible-latin-400-normal.woff2',400),
  ff('Atkinson Hyperlegible','atkinson-hyperlegible-latin-700-normal.woff2',700),
  ff('Familjen Grotesk','familjen-grotesk-latin-500-normal.woff2',500),
  ff('Familjen Grotesk','familjen-grotesk-latin-600-normal.woff2',600),
  ff('Familjen Grotesk','familjen-grotesk-latin-700-normal.woff2',700),
  ff('JetBrains Mono','jetbrains-mono-latin-400-normal.woff2',400),
  ff('JetBrains Mono','jetbrains-mono-latin-600-normal.woff2',600)
].join('\n');
const head = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:">
<style>${faces}
body{margin:0}[hidden]{display:none!important}</style>
</head>
<body>
`;
fs.writeFileSync(path.join(__dirname, 'src', 'index.html'), head + body + '\n</body>\n</html>\n');
console.log('src/index.html written');
