// Membangun PDF panduan dari isi panduan di aplikasi, lalu mengisi MAN_PAGES (nomor halaman tiap bab) di app.html.
// Pakai: node build-page.js && node tools/build-manual.js   (memerlukan Playwright + Chromium, dan pdftotext dari poppler-utils)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'src'), OUT = path.join(SRC, 'manual');
const PDF = path.join(OUT, 'Panduan-Studio-Keputusan-2.pdf');
const ver = require(path.join(ROOT, 'package.json')).version;
fs.mkdirSync(OUT, { recursive: true });
const faces = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8').match(/@font-face[^}]+}/g).join('\n').replace(/url\(fonts\//g, 'url(../fonts/');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 860 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.error('pageerror', e.message));
  await p.goto('file://' + path.join(SRC, 'index.html')); await p.waitForTimeout(700);
  if (await p.$('[data-setup="full"]')) await p.click('[data-setup="full"]');
  const modgo = m => p.evaluate(x => { const b = document.createElement('button'); b.dataset.modgo = x; document.body.appendChild(b); b.click(); b.remove(); }, m);
  const step = s => p.evaluate(x => document.querySelector(`.rail button[data-step="${x}"]`).click(), s);
  const shot = async (name, sel) => { await p.waitForTimeout(400); await p.evaluate(() => { const t = document.getElementById('toast'); if (t) t.hidden = true; window.scrollTo(0, 0); });
    const el = sel ? await p.$(sel) : null; const buf = el ? await el.screenshot({ type: 'jpeg', quality: 78 }) : await p.screenshot({ type: 'jpeg', quality: 78 }); return 'data:image/jpeg;base64,' + buf.toString('base64'); };
  const imgs = {};
  imgs.home = await shot('home');
  await modgo('ahp'); await p.click('#bAhpSample');
  await modgo('mcdm'); await p.click('#bMcSample'); await step('mc-res'); imgs.mcdm = await shot('mcdm', 'section[data-sec="mc-res"]');
  await modgo('quadrant'); await p.click('#bQdSample'); await step('qd-res'); imgs.quadrant = await shot('quadrant', '#v27_qd_res .card:nth-of-type(2)') ;
  await modgo('stat'); await step('ss-data'); await p.click('.dsSample'); await step('ss-viz'); await p.click('[data-svt="scatter"]'); imgs.statviz = await shot('statviz', '#v27_ss_viz');
  await modgo('orange'); await p.click('[data-owtpl="klaster"]'); imgs.orange = await shot('orange', '.owlay');
  await p.click('[data-owtpl="keputusan"]'); await p.click('[data-owtpl="keputusan"]'); await p.click('[data-owemb="ahp-res"]'); imgs.canvas = await shot('canvas', '.owlay');
  await modgo('io'); imgs.io = await shot('io', '#v27_io');
  await modgo('bldenv'); await step('be-shade'); imgs.bldenv = await shot('bldenv', '#v27_be_shade .grid2');
  await modgo('qdas'); await p.click('#bQsSample'); await step('qs-code'); imgs.qdas = await shot('qdas', '#v27_qs_code .qscode');
  const build = async pages => { const html = (await p.evaluate(o => window.__manualDoc(o), { pages, imgs })).replace('<style>', '<style>' + faces + '\n');
    const tmp = path.join(OUT, '_manual.html'); fs.writeFileSync(tmp, html); const q = await b.newPage(); await q.goto('file://' + tmp); await q.waitForTimeout(500);
    await q.pdf({ path: PDF, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: `<div style="font:8px sans-serif;width:100%;text-align:center;color:#888">Panduan Studio Keputusan 2 · v${ver} · <span class="pageNumber"></span>/<span class="totalPages"></span></div>`, margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' } });
    await q.close(); fs.unlinkSync(tmp); };
  const locate = () => { const n = +execFileSync('pdfinfo', [PDF]).toString().match(/Pages:\s+(\d+)/)[1], map = {};
    for (let i = 1; i <= n; i++) { const t = execFileSync('pdftotext', ['-f', String(i), '-l', String(i), PDF, '-']).toString(); for (const m of t.matchAll(/\[#([\w-]+)\]/g)) if (!map[m[1]]) map[m[1]] = i; } return { n, map }; };
  await build({}); let r = locate(); await build(r.map); const r2 = locate(); if (JSON.stringify(r2.map) !== JSON.stringify(r.map)) { await build(r2.map); r = locate(); } else r = r2;
  await b.close();
  const js = JSON.stringify(r.map).slice(1, -1);
  for (const f of [path.join(ROOT, 'app.html')]) { const s = fs.readFileSync(f, 'utf8'); fs.writeFileSync(f, s.replace(/const MAN_PAGES=\{\/\*MAN_PAGES\*\/[^}]*\};/, `const MAN_PAGES={/*MAN_PAGES*/${js}};`)); }
  fs.copyFileSync(PDF, path.join(ROOT, 'docs', `Panduan-Studio-Keputusan-2-v${ver}.pdf`));
  console.log(`PDF ${r.n} halaman, ${Object.keys(r.map).length} bab dipetakan →`, path.relative(ROOT, PDF));
})();
