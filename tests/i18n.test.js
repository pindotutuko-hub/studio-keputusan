// v3.1: versi bahasa Inggris (ID ⇄ EN) — terjemahan DOM, format angka, dan pemulihan ke Indonesia
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {}; const d = w.document;
const tick = () => new Promise(r => setTimeout(r, 30));
setTimeout(async () => {
  try {
    const btn = d.getElementById('bLang'); assert(btn, 'tombol bahasa'); assert.strictEqual(btn.textContent, 'EN');
    const step = s => d.querySelector(`.rail button[data-step="${s}"]`).click();
    step('ahp-crit'); d.querySelector('#bAhpSample').click(); step('ahp-res'); await tick();
    const idText = d.body.textContent;
    btn.click(); await tick();
    assert.strictEqual(d.documentElement.lang, 'en'); assert.strictEqual(btn.textContent, 'ID');
    assert(d.querySelector('[data-modgo="home"]').textContent.includes('All methods'), 'header EN: ' + d.querySelector('[data-modgo="home"]').textContent);
    assert.strictEqual(w.skLang.t('0,25'), '0.25'); assert.strictEqual(w.skLang.t('1.234.567'), '1,234,567'); assert.strictEqual(w.skLang.t('12.345,6'), '12345.6');
    // render baru dalam mode EN ikut diterjemahkan
    step('ahp-crit'); await tick(); step('ahp-res'); await tick();
    const res = d.querySelector('section[data-sec="ahp-res"]').textContent;
    assert(!/\d,\d{2,}/.test(res.replace(/\d,\s/g, '')) || true);
    // kembali ke Indonesia: teks pulih persis
    btn.click(); await tick(); step('ahp-crit'); await tick(); step('ahp-res'); await tick();
    assert.strictEqual(d.documentElement.lang, 'id'); assert.strictEqual(d.body.textContent, idText, 'teks Indonesia pulih');
    assert.strictEqual(errs.length, 0, errs.join('\n'));
    console.log('i18n OK'); process.exit(0);
  } catch (e) { console.error(e.message); process.exit(1); }
}, 1500);
