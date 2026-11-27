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
// v3.18.3: standarisasi z opsional untuk cosine/Pearson; template citra mengaktifkannya
assert(/norm=\(metric==="euclidean"\|\|metric==="manhattan"\)\?p\.norm!==false:p\.normc===true/.test(app), 'normc untuk cosine/pearson');
assert(/N\("distances",380,110,\{metric:"cosine",normc:true\}\)/.test(app), 'template citra memakai normc');
{ const { JSDOM } = require('jsdom'); const dom = new JSDOM('<!doctype html><body>' + app + '</body>', { runScripts: 'dangerously', url: 'https://localhost/', virtualConsole: new (require('jsdom').VirtualConsole)() });
  const V = dom.window.__v27; assert(V && V.distMat, 'V27 terekspos'); { const X = [[1, 100], [2, 100], [1, 300], [2, 300]];
    const z = X[0].map((_, j) => { const c = X.map(r => r[j]), m = c.reduce((a, b) => a + b) / c.length, sd = Math.sqrt(c.reduce((a, b) => a + (b - m) ** 2, 0) / c.length); return [m, sd]; });
    const Z = X.map(r => r.map((v, j) => (v - z[j][0]) / z[j][1]));
    const raw = V.distMat(X, 'cosine'), st = V.distMat(Z, 'cosine');
    assert(raw[0][1] < 0.001 && st[0][1] > 0.5, 'tanpa z, fitur berskala besar mendominasi cosine; dengan z, kolom 1 ikut berpengaruh'); } }
console.log('v3.18.3 standarisasi cosine OK');
