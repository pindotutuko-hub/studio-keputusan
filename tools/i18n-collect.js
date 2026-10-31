// Kumpulkan semua teks antarmuka (teks & atribut) dengan membuka setiap langkah + data contoh. Hasil: tools/i18n-strings.json
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const vc = new VirtualConsole();
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; const d = w.document;
const S = new Map();
const norm = s => s.replace(/\s+/g, ' ').trim();
const add = (s, kind) => { s = norm(s); if (!s || !/[A-Za-z]{2}/.test(s)) return; const k = s; S.set(k, (S.get(k) || 0) + 1); };
const harvest = () => {
  const tw = d.createTreeWalker(d.body, w.NodeFilter.SHOW_TEXT);
  let n; while ((n = tw.nextNode())) { const p = n.parentElement; if (!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName)) continue; add(n.nodeValue); }
  d.querySelectorAll('[placeholder],[title],[aria-label],[data-tip]').forEach(e => ['placeholder', 'title', 'aria-label', 'data-tip'].forEach(a => e.hasAttribute(a) && add(e.getAttribute(a))));
  d.querySelectorAll('svg title, svg text').forEach(e => add(e.textContent));
};
setTimeout(() => {
  try { d.querySelectorAll('[data-setup]').length && harvest(); } catch (e) {}
  const steps = [...new Set([...d.querySelectorAll('.rail button[data-step]')].map(b => b.dataset.step))];
  for (const s of steps) {
    try {
      d.querySelector(`.rail button[data-step="${s}"]`).click(); harvest();
      const sec = d.querySelector(`section[data-sec="${s}"]`);
      if (sec) for (const b of sec.querySelectorAll('button[id$="Sample"],#dmSample')) { try { b.click(); harvest(); } catch (e) {} }
    } catch (e) {}
  }
  for (const s of steps) { try { d.querySelector(`.rail button[data-step="${s}"]`).click(); harvest(); } catch (e) {} }
  fs.writeFileSync(path.join(__dirname, 'i18n-strings.json'), JSON.stringify([...S.keys()].sort(), null, 0));
  const words = [...S.keys()].reduce((a, s) => a + s.split(' ').length, 0);
  console.log('langkah', steps.length, 'string unik', S.size, 'kata', words);
  process.exit(0);
}, 1500);
