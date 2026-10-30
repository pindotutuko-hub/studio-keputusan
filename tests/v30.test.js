// v3.0: Kalkulator Sains (MIPA) & Kesehatan/Terapan.
// Angka acuan: NumPy (det, inv, solve, eig), SciPy (integrate, optimize, stats.chi2/f/t, f_oneway), hitungan tangan (molar, setara reaksi).
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo|scrollIntoView|getScreenCTM|getContext|toDataURL/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
const d = w.document, $ = s => d.querySelector(s), click = s => { const el = $(s); assert(el, 'missing ' + s); el.click(); };
const go = m => { const b = d.createElement('button'); b.dataset.modgo = m; d.body.appendChild(b); b.click(); b.remove(); };
const step = s => click(`.rail button[data-step="${s}"]`);
const near = (a, b, tol = 1e-6) => assert(Math.abs(a - b) < tol, `${a} != ${b}`);
setTimeout(() => {
  click('[data-setup="full"]');
  const M = w.__MPE, S = w.__SF;
  const G = [[1,2,3,4,5],[0,1,-2,3,1],[2,-1,0,1,3],[1,3,1,-1,2],[-2,1,4,0,1]];
  near(M.det(G), 256, 1e-9); near(M.inv(G)[0][0], 0.5390625, 1e-12);
  assert.strictEqual(M.solve(G,[1,2,3,4,5]).x.map(x=>+x.toFixed(7)).join(), '-5.6484375,-0.515625,-2.8359375,-2.90625,5.5625');
  near(M.eigGeneral(G)[0][0], 4.426989439668463, 1e-8);
  near(M.simpson(Math.sin,0,Math.PI,100), 2.0000000108245044, 1e-12); near(M.newton(M.fx('x^3-2*x-5'),2).root, 2.0945514815423265, 1e-10);
  near(M.rk4((t,y)=>[-2*y[0]],0,[1],0.1,10).pop()[1], 0.13533954843051013, 1e-12); near(0.13533954843051013, Math.exp(-2), 1e-5);
  near(M.molar('CuSO4·5H2O').M, 249.677, 1e-3); assert.strictEqual(M.balance('KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O').coef.join(), '2,16,2,2,5,8');
  near(M.pHweak(0.1,1.8e-5).pH, 2.8752770615501357, 1e-9);
  near(M.diversity([10,20,30,40]).H, 1.2798542258336676, 1e-12);
  const mm = M.mmFit([0.5,1,2,4,8,16],[0.9,1.6,2.6,3.6,4.4,4.9]); near(mm.Vm, 5.709937670653375, 1e-6); near(mm.Km, 2.448925159216592, 1e-6);
  near(M.gum('V/I',[{k:'V',v:12,u:0.1},{k:'I',v:2,u:0.02}]).uc, 0.07810249675842205, 1e-9);
  near(M.streeter(20,1,0.23,0.4,9,10).tc, 3.033697169098715, 1e-9);
  // nilai p = SciPy
  near(S.chi2p(11.604878637845667,1), 0.0006577903818911286, 1e-12); near(S.fp(28.605263157894644,2,9), 0.00012586924053431582, 1e-12);
  near(S.tinv(0.05,9), 2.262157162798205, 1e-9); near(S.tp2(2.262,9), 0.05001284550245463, 1e-12);
  const t = M.twoBy2(20,80,10,90); near(t.OR, 2.25); near(t.ORlo, 0.9942948922815064, 1e-12); near(t.chi, 3.9215686274509802, 1e-12);
  near(M.items([[1,1,0,1,0],[1,0,0,1,1],[1,1,1,1,0],[0,0,0,1,0],[1,1,1,0,1],[1,1,0,1,1],[0,1,0,0,0],[1,1,1,1,1]]).kr20, 0.546218487394958, 1e-12);
  near(M.pk1([1,2,4,6,8,12],[8.2,6.7,4.5,3.0,2.0,0.9],500).t12, 3.448233456917078, 1e-9);
  // UI: semua alat Sains & Kesehatan menghitung contoh bawaan tanpa galat
  [['sains','mp-in','mp-res'],['kes','hk-in','hk-res']].forEach(([m,a,b]) => {
    go(m); assert($('#' + (m==='sains'?'mpIn':'hkIn') + ' h1'), m + ' in');
    w.__SCI[m] && d.querySelectorAll(`#${m==='sains'?'mpIn':'hkIn'} [data-scitool]`).length;
    const ids = [...d.querySelectorAll(`#${m==='sains'?'mpIn':'hkIn'} [data-scitool]`)].map(x => x.dataset.scitool);
    assert(ids.length >= 5, m + ' tools');
    ids.forEach(id => { click(`#${m==='sains'?'mpIn':'hkIn'} [data-scitool="${id}"]`); const r = w.__sciCalc(m); assert(r.ok, m + '/' + id + ': ' + r.err); step(b); assert(!$(`#${m==='sains'?'mpRes':'hkRes'} .warn`) || id==='mat' , m + '/' + id + ' warn'); step(a); });
  });
  // RAL contoh → BNT & notasi
  go('kes'); click('#hkIn [data-scitool="anova"]'); const an = w.__sciCalc('kes'); assert(an.ok); assert(/2,846/.test(an.html), 'BNT 2,846: '+an.html.slice(0,600)); assert(/<b>a<\/b>/.test(an.html));
  // kredit terdaftar
  go('refs'); const refs = d.body.textContent; assert(/Burden/.test(refs) && /Gomez/.test(refs) && /Streeter/.test(refs), 'kredit v3.0');
  assert.strictEqual(errs.length, 0, errs.join('\n'));
  console.log('v30 OK'); process.exit(0);
}, 400);
