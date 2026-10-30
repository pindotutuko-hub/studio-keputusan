// Proyek terpisah: data dari Lensa Preseden dibuka di proyek sendiri, proyek lain tetap utuh.
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo|scrollIntoView|getScreenCTM|getContext|toDataURL/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://localhost/?from=preseden&go=swot-res', virtualConsole: vc });
const w = dom.window, ls = w.localStorage;
// keadaan awal: proyek "Analisis perbankan" berisi ISM; Lensa Preseden baru saja menulis SWOT
ls.setItem('sk-scale-v1', JSON.stringify({items:[],rev:[],min:1,max:5,crit:0.3,cat:'3',name:'Skala perbankan'}));
ls.setItem('sk-projects-v1', JSON.stringify({cur:'pA', list:[{id:'pA', name:'Analisis perbankan', upd:1, src:''}]}));
ls.setItem('skb-pA', JSON.stringify({'ism-studio-swot-v1': JSON.stringify({S:[{id:'x',name:'SWOT lama perbankan',note:'',w:3,r:3}]})}));
ls.setItem('ism-studio-swot-v1', JSON.stringify({S:[{id:'y',name:'Vegetasi rimbun',note:'',w:3,r:3}],W:[],O:[],T:[]}));
for (const s of dom.window.document.querySelectorAll('script')) { if (!s.src) w.eval(s.textContent); }
setTimeout(() => {
  const R = JSON.parse(ls.getItem('sk-projects-v1'));
  assert.strictEqual(R.list.length, 2, 'proyek preseden dibuat'); const P = R.list.find(p => p.src === 'preseden'); assert.strictEqual(R.cur, P.id);
  assert(!/perbankan/.test(ls.getItem('sk-scale-v1')||''), 'data perbankan tidak ikut ke proyek preseden');
  assert(/Vegetasi/.test(ls.getItem('ism-studio-swot-v1')), 'SWOT preseden ada di proyek preseden');
  const snap = JSON.parse(ls.getItem('skp-pA')); assert(/perbankan/.test(snap['sk-scale-v1']), 'data perbankan tersimpan'); assert(/SWOT lama perbankan/.test(snap['ism-studio-swot-v1']), 'SWOT perbankan dipulihkan dari cadangan');
  assert(w.document.querySelectorAll('#projSel option').length >= 2);
  assert.deepStrictEqual(errs, []); console.log('proj OK');
}, 300);
