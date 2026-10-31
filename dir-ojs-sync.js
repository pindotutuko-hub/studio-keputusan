/* Direktori Jurnal UNMER — panel "Pembaruan lewat API OJS" di tab Peringatan OJS (khusus Pengelola). */
(function () {
  "use strict";
  var CFG = window.PT_JR || {}, sec = document.getElementById("p-ojs");
  if (!sec) return;
  var D = window.PT_OJS || {};
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var box = document.createElement("div");
  box.style.cssText = "margin-top:22px;border:1px solid var(--line);border-radius:12px;background:var(--surface);padding:14px 16px;font-size:13px";
  var asal = D.src === "api" ? "dibaca otomatis lewat API OJS" : "dibaca dari akun OJS Pengelola melalui peramban";
  if (!CFG.update) {
    box.innerHTML = "<b>Sumber data.</b> Status naskah " + esc(asal) + " pada " + esc(D.atLabel || D.at || "") + ". Pengelola dapat memperbaruinya dari tab ini.";
    sec.appendChild(box);
    return;
  }
  box.innerHTML =
    "<h3 style='margin:0 0 6px;font-size:15px'>Pembaruan lewat API OJS</h3>" +
    "<p style='margin:0 0 8px'>Data saat ini " + esc(asal) + " pada <b>" + esc(D.atLabel || D.at || "-") + "</b>. Begitu API token OJS UNMER tersedia, server situs ini dapat membaca status naskah semua jurnal sendiri — tanpa membuka OJS di peramban.</p>" +
    "<div id='ojsApiStat' style='margin:6px 0;color:var(--muted)'>Memeriksa pengaturan…</div>" +
    "<div style='display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0'><input id='ojsTok' type='password' autocomplete='off' placeholder='Tempel API token OJS di sini' style='flex:1;min-width:240px;font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink)'>" +
    "<button type='button' id='ojsTokSave'>Simpan &amp; uji</button><button type='button' id='ojsTokDel'>Hapus token</button><button type='button' id='ojsRun' disabled>Perbarui sekarang</button></div>" +
    "<div id='ojsRunLog' style='font-family:var(--mono,monospace);font-size:12px;white-space:pre-wrap;color:var(--muted)'></div>" +
    "<details style='margin-top:8px'><summary style='cursor:pointer'>Yang perlu disiapkan PUSIM/pengelola OJS</summary><ol style='margin:6px 0 0 18px'>" +
    "<li>Di server OJS (versi 3.3), isi <code>api_key_secret</code> pada bagian <code>[security]</code> berkas <code>config.inc.php</code>.</li>" +
    "<li>Buat atau pilih satu akun berperan <i>Journal Manager</i>/admin yang terdaftar di semua jurnal UNMER.</li>" +
    "<li>Pada akun itu: <i>View Profile → API Key</i>, centang <i>Enable external applications with the API key to access this account</i>, lalu <i>Generate</i>.</li>" +
    "<li>Tempelkan kunci tersebut di kotak di atas lalu tekan <b>Simpan &amp; uji</b>. Kunci disimpan di server situs, tidak ditampilkan kembali, dan tidak dikirim ke peramban pengunjung.</li></ol></details>";
  sec.appendChild(box);
  var $ = function (id) { return document.getElementById(id); };
  var api = function (ep, body) {
    return fetch((CFG.api || "") + ep, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-WP-Nonce": CFG.nonce || "" }, body: JSON.stringify(body || {}) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || j.error) throw new Error(j.error || ("HTTP " + r.status)); return j; }); });
  };
  var journals = [];
  var show = function (j) {
    if (!j.token) { $("ojsApiStat").textContent = "API token belum diisi. Fitur ini akan aktif setelah token dari PUSIM dimasukkan."; $("ojsRun").disabled = true; return; }
    var t = j.test || {};
    journals = t.journals || [];
    var ok = t.code === 200 && journals.length;
    $("ojsApiStat").innerHTML = "Token tersimpan (" + esc(j.token) + "). Uji koneksi: " + (ok ? "<b style='color:var(--patina)'>berhasil, " + journals.length + " jurnal terbaca</b>" : "<b style='color:var(--rust)'>gagal (HTTP " + esc(t.code) + ")</b> — periksa api_key_secret dan hak akun.") + (j.last ? " · Sinkron terakhir: " + esc(j.last) : "");
    $("ojsRun").disabled = !ok;
  };
  api("ojs-cfg").then(show).catch(function (e) { $("ojsApiStat").textContent = "Pengaturan tidak terbaca: " + e.message; });
  $("ojsTokSave").onclick = function () { var v = $("ojsTok").value.trim(); if (!v) return; $("ojsApiStat").textContent = "Menyimpan dan menguji…"; api("ojs-cfg", { token: v }).then(function (j) { $("ojsTok").value = ""; show(j); }).catch(function (e) { $("ojsApiStat").textContent = e.message; }); };
  $("ojsTokDel").onclick = function () { api("ojs-cfg", { clear: 1 }).then(show).catch(function (e) { $("ojsApiStat").textContent = e.message; }); };
  $("ojsRun").onclick = function () {
    var log = $("ojsRunLog"), done = [], i = 0;
    $("ojsRun").disabled = true; log.textContent = "";
    var next = function () {
      if (i >= journals.length) {
        log.textContent += "\nMenyusun berkas data…";
        return api("ojs-build", { js: done }).then(function (r) { log.textContent += " selesai (" + r.n + " jurnal, " + r.at + "). Memuat ulang…"; setTimeout(function () { location.reload(); }, 1200); });
      }
      var x = journals[i++];
      log.textContent += (log.textContent ? "\n" : "") + "[" + i + "/" + journals.length + "] " + x.n + " … ";
      return api("ojs-sync", { j: x.p, n: x.n }).then(function (r) { done.push(x.p); log.textContent += r.aktif + " naskah aktif"; }).catch(function (e) { log.textContent += "gagal: " + e.message; }).then(next);
    };
    next().catch(function (e) { log.textContent += "\nGagal: " + e.message; $("ojsRun").disabled = false; });
  };
})();
