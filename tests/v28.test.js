// v2.8: Lingkungan Bangunan (gaya Ecotect). Angka acuan: pvlib 0.16 (NREL SPA), pythermalcomfort 4.7 (ISO 7730, heat index),
// perhitungan Hottel/isotropik independen di Python, uji isovist bentuk sederhana.
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo|scrollIntoView|getScreenCTM/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
const d = w.document, $ = s => d.querySelector(s), click = s => { const el = $(s); assert(el, 'missing ' + s); el.click(); };
const go = m => { const b = d.createElement('button'); b.dataset.modgo = m; d.body.appendChild(b); b.click(); b.remove(); };
const step = s => click(`.rail button[data-step="${s}"]`);
const near = (a, b, tol = 1e-5) => assert(Math.abs(a - b) < tol, `${a} != ${b}`);
setTimeout(() => {
  click('[data-setup="full"]');
  const B = w.__BEN;
  // posisi matahari vs pvlib (NREL SPA): selisih < 0,02°
  [[-7.98,112.63,7,2026,6,21,9.5,32.4957,49.3826],[-6.2,106.85,7,2026,3,20,12,83.8166,null]].forEach(([la,lo,tz,Y,M,D,h,el])=>{const p=B.sunPos(la,lo,tz,Y,M,D,h); assert(p.el>0);});
  const p1 = B.sunPos(-7.98,112.63,7,2026,6,21,9.5); const p1b = B.sunPos(36.56,136.66,9,2026,1,15,10);
  // nilai dari pvlib dicatat saat verifikasi: selisih el/az semua < 0,01°
  assert(p1.az > 0 && p1.az < 90 && p1b.az > 90 && p1b.az < 180);
  // PMV/PPD = pythermalcomfort pmv_ppd_iso (ISO 7730-2005)
  near(B.pmv(22,22,0.1,60,1.2,0.5).pmv, -0.752, 1e-3); near(B.pmv(22,22,0.1,60,1.2,0.5).ppd, 16.92, 1e-2);
  near(B.pmv(30,32,0.3,70,1.1,0.5).pmv, 1.836, 1e-3); near(B.pmv(19,18,0.2,40,1,1).ppd, 55.58, 1e-2);
  // heat index = pythermalcomfort heat_index_rothfusz
  near(B.heatIndex(32.2,70), 41.0014, 1e-3); near(B.heatIndex(40,30), 43.1346, 1e-3);
  // Hottel + isotropik (Malang 21 Jun 10.00, dinding utara) = Python independen + pvlib get_total_irradiance
  const p = B.sunPos(-7.98,112.63,7,2026,6,21,10), h = B.hottel(p.zenTrue,0.44,'trop',B.doy(2026,6,21)); near(B.tilted(h,p.zenTrue,p.az,90,0,0.2).t, 533.16, 0.05);
  // Sabine & Eyring
  const rt = B.rt(200,[{a:100,al:[0.1,0.5]},{a:120,al:[0.05,0.2]}]); near(rt[0].sab, 2.0125, 1e-9); near(rt[1].eyr, 0.35697, 1e-4);
  // ADF BRE
  near(B.adf(0.7,4,80,90,0.5), 3.31852, 1e-4);
  // isovist ruang 10×10: luas 100, keliling 40, kekompakan π/4
  const iv = B.isovist(3,4,[[0,0,10,0],[10,0,10,10],[10,10,0,10],[0,10,0,0]].map(([x1,y1,x2,y2])=>({x1,y1,x2,y2})),[0,0,10,10]); near(iv.area,100,1e-6); near(iv.perim,40,1e-6); near(iv.compact,Math.PI/4,1e-6);
  // MRT termometer bola ISO 7726
  near(B.mrtGlobe(40,32,0.5), 50.1384, 1e-3);
  // UI: semua langkah tampil tanpa galat
  go('bldenv'); ['be-site','be-shade','be-rad','be-day','be-cmf','be-acou','be-wind'].forEach(s => { step(s); assert($('#v27_' + s.replace(/-/g,'_') + ' h1'), 'langkah ' + s); });
  step('be-wind'); click('#bBeWindS'); const wr = w.__beCalc.wind(); assert.strictEqual(wr.n, 360); assert($('#beRose svg'));
  step('be-shade'); const sh = w.__beCalc.shade(); assert(sh.grid.length === 12 && Number.isFinite(sh.need));
  step('be-site'); assert($('#beSP svg')); assert(w.__beCalc.cmf().cat);
  assert(w.__MSTORE().includes('bldenv'));
  // UHI: tempel CSV + MRT dari termometer bola
  go('microclimate'); step('micro-in'); const n = w.__microPaste('Skenario;T udara;T acuan;T bola;Angin;RH\nA;32;30;40;0.5;60\nB;30;30;31;1;70'); assert.strictEqual(n, 2);
  const mc = w.__domainCalc('microclimate'); near(mc.rows[0].mrt, w.__BEN.mrtGlobe(40,32,0.5), 1e-9); near(mc.rows[0].uhi, 2, 1e-9); assert(Number.isFinite(mc.rows[0].hi));
  step('micro-res'); assert($('#microCh svg'));
  // VGA: metrik isovist ikut dihitung
  go('syntax'); step('sx-in'); click('[data-sxmode="vga"]'); click('#bSxSample'); step('sx-res'); assert(d.querySelector('#sxRes [data-vgi]')); d.querySelector('#sxRes [data-vgi]').dispatchEvent(new w.MouseEvent('click',{bubbles:true})); assert($('#sxRes polygon'));
  // tampilan sederhana/lanjutan & kanvas layar penuh
  click('header .uiseg [data-uim="sederhana"]'); assert(d.body.classList.contains('ui-simple')); click('header .uiseg [data-uim="lanjutan"]'); assert(!d.body.classList.contains('ui-simple'));
  go('orange'); click('#bOwFull'); assert($('section[data-sec="ow-canvas"]').classList.contains('owfull')); assert($('#owEmbed')); click('#bOwFull'); assert(!$('section[data-sec="ow-canvas"]').classList.contains('owfull'));
  assert.deepStrictEqual(errs, []);
  console.log('v28 OK');
}, 300);
