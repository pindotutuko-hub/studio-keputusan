// v3.11: bidang Ilmu Komunikasi (humas, warga) dan bilah "Langkah 1 · Bidang ilmu" berbasis Kepdirjen 163/E/KPT/2022
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8') + '</body></html>';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/scrollTo/.test(e.message)) errs.push(e.message); });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
const w = dom.window; w.scrollTo = () => {};
setTimeout(() => {
  const U = w.__ui, K = w.__kp, q = 'Studi tentang public relation dengan warga kampung di bidang ilmu komunikasi';
  const r = U.skAdvise(q); assert.strictEqual(r.fd.k, 'kom'); const cs = r.hit.map(h => h.c);
  assert(cs.includes('humas') && cs.includes('warga') && cs.includes('komunikasi') && !cs.includes('komunitas') && !cs.includes('rumah'), cs.join(' '));
  assert(r.top.length >= 3 && r.top.every(x => /^kom_/.test(x.it[0])), r.top.map(x => x.it[0]).join(' '));
  const top = s => (U.skAdvise(s).top[0] || { it: [''] }).it[0];
  assert.strictEqual(top('pengaruh komunikasi humas terhadap kepercayaan dan partisipasi warga'), 'kom_humas_pengaruh');
  assert.strictEqual(top('memetakan jejaring komunikasi warga dan tokoh kunci penyebar informasi'), 'kom_jejaring');
  assert.strictEqual(top('analisis framing berita rilis humas pemerintah kota'), 'kom_isi');
  // bidang lain tidak bergeser
  assert.strictEqual(top('dampak program bantuan sosial terhadap pendapatan rumah tangga'), 'did');
  assert.strictEqual(U.skAdvise('kelimpahan komunitas plankton di teluk').fd.k, 'laut');
  // prodi komunikasi Lampiran I → bidang kom; deteksi prodi dari kalimat
  const P = K.KP_P.filter(p => p[4] === 'kom'); assert(P.length >= 6 && P.some(p => p[1] === 'Ilmu atau Sains Komunikasi'), P.length);
  assert.strictEqual(K.kpDetect(q)[1], 'Ilmu atau Sains Komunikasi'); assert.strictEqual(K.kpDetect('evaluasi pascahuni rumah susun di bidang arsitektur')[1], 'Arsitektur'); assert.strictEqual(K.kpDetect('memilih lokasi terbaik dari 4 calon lahan'), null);
  // bilah langkah 1: saran prodi terdeteksi, lalu setelah dipilih menampilkan jalur rumpun
  const d = w.document; assert(d.querySelector('#kpBar')); const b0 = K.kpBar(q); assert(/data-kpuse="294"/.test(b0) && /Pakai Ilmu atau Sains Komunikasi/.test(b0));
  K.kpSet(294); assert(/Rumpun Ilmu <b>Terapan<\/b> › Komunikasi/.test(K.kpBar(q)) && /Ilmu atau Sains Komunikasi/.test(K.kpBar(q))); assert.strictEqual(U.skAdvise('studi tentang relasi lembaga dengan masyarakat').fd.k, 'kom'); K.kpSet(null);
  // jendela rumpun ilmu terpandu: rumpun → kelompok → prodi → pakai
  { const click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })), b = d.createElement('button'); b.dataset.kpopen = ''; d.body.appendChild(b); click(b); b.remove();
    const M = d.querySelector('#skKp'); assert(M && !M.hidden && M.classList.contains('kpmodal') && !d.querySelector('#skKpBd').hidden); assert.strictEqual(M.querySelectorAll('.kprc').length, 6); assert.strictEqual(M.querySelectorAll('.kpsteps li').length, 4);
    click(M.querySelector('[data-kpr="Terapan"]')); const g = d.querySelector('#skKp [data-kpg="32"]'); assert(g && /Komunikasi/.test(g.textContent)); click(g);
    const it = d.querySelector('#skKp [data-kpsel="294"]'); assert(it, 'prodi 294'); click(it); const use = d.querySelector('#skKp .kpright [data-kpuse="294"]'); assert(use); click(use);
    assert.strictEqual(K.sel, 294); assert(/Bidang Anda: <b>Ilmu atau Sains Komunikasi/.test(d.querySelector('#skKp').innerHTML)); assert(d.querySelector('#skKp .kpsteps li:last-child').classList.contains('done'));
    click(d.querySelector('[data-kpr="__pro"]')); assert.strictEqual(d.querySelectorAll('#skKp [data-kpg]').length, 3);
    click(d.querySelector('#skKpBd')); assert(d.querySelector('#skKp').hidden); K.kpSet(null); }
  assert.strictEqual(errs.length, 0, errs.join('\n')); console.log('v311 ok'); process.exit(0);
}, 2500);
