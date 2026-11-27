// v3.18.2: Import Images membaca foto sebagai data URL (CSP img-src hanya 'self' data:), label tab metode di kanvas tidak "[object Object]".
const fs = require('fs'), path = require('path'), assert = require('assert');
const app = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');
const build = fs.readFileSync(path.join(__dirname, '..', 'build-page.js'), 'utf8');
const imgSrc = (build.match(/img-src([^;"]*)/) || [, ''])[1];
const i = app.indexOf('async function iaLoadFile'), body = app.slice(i, app.indexOf('/* ---------- evaluasi widget citra', i));
assert(i > 0 && body.length > 200, 'iaLoadFile ada');
assert(/readAsDataURL/.test(body), 'foto dibaca sebagai data URL');
if (!/blob:/.test(imgSrc)) assert(!/createObjectURL/.test(body), 'blob: tidak diizinkan CSP, jangan dipakai untuk <img>');
assert(/data:/.test(imgSrc), 'CSP mengizinkan data:');
// stepLabel versi terakhir mengembalikan {t,s}; semua pemanggil di esc() harus memakai .t
const defs = [...app.matchAll(/function stepLabel\(/g)].length;
assert(defs >= 1);
assert(!/esc\(stepLabel\([a-z]+\)\)/.test(app), 'esc(stepLabel(x)) tanpa .t menghasilkan [object Object]');
console.log('v3.18.2 impor foto & label tab OK');
