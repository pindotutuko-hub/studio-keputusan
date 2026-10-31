// Tanam ulang kamus EN + mesin i18n ke app.html (blok terakhir <script> yang memuat window.I18N_EN).
const fs = require('fs'), path = require('path');
const p = path.join(__dirname, '..', 'app.html'); let t = fs.readFileSync(p, 'utf8');
const D = fs.readFileSync(path.join(__dirname, 'i18n', 'en.json'), 'utf8').replace(/<\//g, '<\\/');
const E = fs.readFileSync(path.join(__dirname, 'i18n', 'engine.js'), 'utf8');
const block = '<script>\n/* Kamus antarmuka Inggris (dibuat dari tools/i18n/en.json; perbarui dengan tools/i18n-collect.js lalu tools/i18n-embed.js) */\nwindow.I18N_EN=' + D + ';\n' + E + '</script>\n';
const i = t.lastIndexOf('<script>\n/* Kamus antarmuka Inggris');
if (i < 0) throw new Error('blok i18n tidak ditemukan');
t = t.slice(0, i) + block; fs.writeFileSync(p, t); console.log('tertanam', (block.length / 1024).toFixed(0) + ' KB');
