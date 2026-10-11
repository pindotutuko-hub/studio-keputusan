// Smoke + numeric checks for every module. Run: npm test
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {};
const d = w.document, click = s => { const el = d.querySelector(s); assert(el, 'missing ' + s); el.click(); }, step = s => click(`.rail button[data-step="${s}"]`);
const near = (a, b, tol = 1e-3) => assert(Math.abs(a - b) < tol, `${a} != ${b}`);
setTimeout(() => {
  const flows = [['el', '#bSample', ['ssim', 'rm', 'lp', 'model', 'micmac']], ['dl-setup', '#bDlSample', ['dl-rate', 'dl-res']], ['ahp-crit', '#bAhpSample', ['ahp-cmp', 'ahp-res']], ['swot-in', '#bSwotSample', ['swot-res']],
    ['pe-in', '#bPeSample', ['pe-res']], ['po-in', '#bPoSample', ['po-res']], ['cb-in', '#bCbSample', ['cb-res']], ['cp-in', '#bCpSample', ['cp-res']], ['bs-in', '#bBsSample', ['bs-res']],
    ['sn-in', '#bSnSample', ['sn-res']], ['ql-in', '#bQlSample', ['ql-code', 'ql-res']], ['sx-in', '#bSxSample', ['sx-res']], ['st-in', '#bStSample', ['st-res']], ['bm-in', '#bBmSample', ['bm-obs', 'bm-res']], ['poe-in', '#bPoeSample', ['poe-res']], ['de-in', '#bDeSample', ['de-res']], ['tp-in', '#bTpSample', ['tp-res']]];
  for (const [a, b, rest] of flows) { step(a); click(b); rest.forEach(step); }
  const ism = w.__ismCompute(); assert.strictEqual(JSON.stringify(Array.from(ism.level)), "[5,4,3,2,2,1]");
  const ahp = w.__ahpCalc(); near(ahp.rc.CR, 0.022, 1e-3); assert(ahp.rc.w[3] > ahp.rc.w[0]);
  const sw = w.__swCalc(); assert.strictEqual(sw.quadr, 'I'); near(sw.x, 0.17, 1e-6);
  const cb = w.__cbCalc(); near(cb.npv, 379.34, 0.01); near(cb.irr * 100, 7.44, 0.01);
  const cp = w.__cpCalc(); near(cp.T, 81.5, 1e-9); assert.strictEqual(cp.path.map(i => cp.A[i].C).join(''), 'ABCEFHI');
  const sn = w.__snCalc(); near(sn.density, 0.464, 1e-3); near(sn.btw[2], 0.373, 1e-3);
  const sx = w.__sxCalc(); near(sx.D, 0.3168, 1e-4); near(sx.rows[3].int, 2.218, 1e-3);
  step('sx-in'); click('[data-sxmode="axial"]'); click('#bSxSample'); step('sx-res');
  const ax = w.__sxCalc(); assert(ax.connected); assert.strictEqual(ax.k, 13); near(ax.rows[0].int, 2.273, 1e-3);
  const de = w.__deCalc(); near(de.alpha, 0.42453, 1e-4); near(de.P[3], 4.606, 1e-3); near(de.Q[0], 1.517, 1e-3);
  const tp = w.__tpCalc(); near(tp.CC[3], 0.6189, 1e-4); assert.strictEqual(tp.rk[3], 1);
  const kw = w.__kendallW(1); near(kw.W, 0.623833, 1e-5); near(kw.p, 0.000563, 1e-5);
  // multi-expert ISM: consensus feeds the calculation and the consensus tab is read-only
  step('ssim'); click('#bMultiOn'); const cells = () => [...d.querySelectorAll('#ssim .cell')];
  cells().forEach(c => c.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'V', bubbles: true })));
  click('[data-exp="agg"]'); const ag = w.__aggregate(); assert(ag.cnt > 0); assert(Number.isFinite(ag.mean));
  const snap = JSON.stringify(ag.map); cells()[0].dispatchEvent(new w.KeyboardEvent('keydown', { key: 'O', bubbles: true })); assert.strictEqual(JSON.stringify(w.__aggregate().map), snap);
  step('sy-in'); ['dl_med', 'dl_agr'].forEach(k => { const c = d.querySelector('#sy_' + k); c.checked = true; c.dispatchEvent(new w.Event('change', { bubbles: true })); }); step('sy-res');
  const sy = w.__syCalc(); near(sy.corr[0][1].r, 0.73, 0.01);
  step('rp'); click('#bRpBuild'); assert(d.querySelectorAll('#reportOut .rpsec').length >= 10);
  assert.deepStrictEqual(errs, []); console.log('All module checks passed'); process.exit(0);
}, 300);
