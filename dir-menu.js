/* Direktori Jurnal UNMER — menu utama berkelompok (gaya menu pindotutuko.id: label mono kapital + daftar turun). */
(function () {
  "use strict";
  var nav = document.getElementById("tabs");
  if (!nav || nav.dataset.grouped) return;
  nav.dataset.grouped = "1";
  var B = {};
  nav.querySelectorAll("button[data-t]").forEach(function (b) { B[b.dataset.t] = b; });
  var GROUPS = [
    { t: "ringkasan" },
    { l: "Jurnal", items: [["jurnal", "Profil seluruh jurnal UNMER"], ["temuan", "Temuan utama pemetaan"], ["tautan", "SINTA, Garuda, dan indeksasi"], ["prodi", "Jurnal per program studi"]] },
    { l: "Jaringan", items: [["bestari", "Mitra bestari setiap jurnal"], ["editor", "Dewan editor dari luar UNMER"], ["afiliasi", "Institusi dan negara mitra"], ["sasaran", "Jurnal sasaran publikasi"], ["pintu", "Jembatan ke jurnal sasaran"]] },
    { t: "akr" },
    { t: "cite", badge: "Baru" },
    { t: "ojs" },
    { l: "Data", items: [["koreksi", "Butir perbaikan data jurnal"], ["update", "Daftar periksa pembaruan"], ["catatan", "Riwayat perubahan dan sumber"]] }
  ];
  var css = document.createElement("style");
  css.textContent =
    "#tabs.mgnav{display:flex;flex-wrap:wrap;align-items:stretch;gap:2px 6px;overflow:visible!important;position:relative;z-index:30}" +
    "#tabs.mgnav .mg{position:relative}" +
    "#tabs.mgnav .mgh{display:flex;align-items:center;gap:6px;height:100%}" +
    "#tabs.mgnav .mg.open .mgh{color:var(--ink)}" +
    "#tabs.mgnav .mg.on>.mgh{color:var(--ink);border-bottom-color:var(--patina);background:rgba(122,30,51,.07)}" +
    "#tabs.mgnav .mgh .car{font-size:.8em;transition:transform .15s}#tabs.mgnav .mg.open .mgh .car{transform:rotate(180deg)}" +
    "#tabs.mgnav .mgd{display:none;position:absolute;top:100%;left:0;min-width:290px;padding:8px;background:#fff;border:1px solid var(--line);border-top:3px solid var(--patina);box-shadow:0 18px 40px rgba(14,26,43,.14);border-radius:0 0 10px 10px}" +
    "#tabs.mgnav .mg.open .mgd{display:block}" +
    "#tabs.mgnav .mgd button[data-t]{display:block;width:100%;text-align:left;margin:0;padding:10px 12px!important;border:0!important;border-radius:6px;background:none;white-space:normal}" +
    "#tabs.mgnav .mgd button[data-t]{color:var(--ink)!important}#tabs.mgnav .mgd button[data-t]:hover{background:var(--surface-2)}" +
    "#tabs.mgnav .mgd button[aria-selected=true]{background:rgba(122,30,51,.08);box-shadow:inset 3px 0 0 var(--patina)}" +
    "#tabs.mgnav .mgd small{display:block;margin-top:4px;font-size:10.5px;letter-spacing:.02em;text-transform:none;color:var(--muted)}" +
    "#tabs.mgnav .bdg{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:999px;background:var(--patina);color:#fff;font-size:9px;letter-spacing:.08em;vertical-align:2px}" +
    "@media (max-width:760px){#tabs.mgnav .mgd{position:fixed;left:12px;right:12px;top:auto;min-width:0}}";
  document.head.appendChild(css);
  nav.classList.add("mgnav");
  var used = {};
  var frag = document.createDocumentFragment();
  GROUPS.forEach(function (g) {
    if (g.t) {
      var b = B[g.t]; if (!b) return; used[g.t] = 1;
      if (g.badge && !b.querySelector(".bdg")) { var s = document.createElement("span"); s.className = "bdg"; s.textContent = g.badge; b.appendChild(s); }
      frag.appendChild(b); return;
    }
    var items = g.items.filter(function (x) { return B[x[0]]; });
    if (!items.length) return;
    var wrap = document.createElement("div"); wrap.className = "mg";
    var h = document.createElement("button"); h.type = "button"; h.className = "mgh"; h.setAttribute("aria-haspopup", "true"); h.setAttribute("aria-expanded", "false");
    h.innerHTML = "<span>" + g.l + "</span><span class='car' aria-hidden='true'>▾</span>";
    var d = document.createElement("div"); d.className = "mgd"; d.setAttribute("role", "menu");
    items.forEach(function (x) {
      var b = B[x[0]]; used[x[0]] = 1;
      if (!b.querySelector("small")) { var sm = document.createElement("small"); sm.textContent = x[1]; b.appendChild(sm); }
      d.appendChild(b);
    });
    wrap.appendChild(h); wrap.appendChild(d); frag.appendChild(wrap);
  });
  Object.keys(B).forEach(function (k) { if (!used[k]) frag.appendChild(B[k]); });
  nav.appendChild(frag);
  var closeAll = function (except) { nav.querySelectorAll(".mg.open").forEach(function (m) { if (m !== except) { m.classList.remove("open"); m.querySelector(".mgh").setAttribute("aria-expanded", "false"); } }); };
  nav.addEventListener("click", function (e) {
    var h = e.target.closest(".mgh");
    if (h) { var m = h.parentNode, o = !m.classList.contains("open"); closeAll(m); m.classList.toggle("open", o); h.setAttribute("aria-expanded", o ? "true" : "false"); e.stopPropagation(); return; }
    if (e.target.closest("button[data-t]")) closeAll();
  });
  nav.querySelectorAll(".mg").forEach(function (m) {
    m.addEventListener("mouseenter", function () { if (window.matchMedia("(hover:hover)").matches) { closeAll(m); m.classList.add("open"); } });
    m.addEventListener("mouseleave", function () { if (window.matchMedia("(hover:hover)").matches) m.classList.remove("open"); });
  });
  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) closeAll(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });
  var mark = function () { nav.querySelectorAll(".mg").forEach(function (m) { m.classList.toggle("on", !!m.querySelector("button[aria-selected=true]")); }); };
  new MutationObserver(mark).observe(nav, { subtree: true, attributes: true, attributeFilter: ["aria-selected"] });
  mark();
})();

/* Dasbor "Mulai dari sini": ringkasan lintas bagian di atas tab Ringkasan, tiap kartu membuka bagian terkait. */
(function () {
  "use strict";
  var main = document.querySelector("main.wrap"), pr = document.getElementById("p-ringkasan");
  if (!main || !pr || document.getElementById("ptDash")) { var dp0 = document.getElementById("ptDashPh"); if (dp0) dp0.remove(); return; }
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var D = typeof DATA !== "undefined" ? DATA : {};
  var K = [];
  var semua = D.semua || [];
  if (semua.length) {
    var s12 = semua.filter(function (j) { return j.sinta === 1 || j.sinta === 2; }).length, s34 = semua.filter(function (j) { return j.sinta === 3 || j.sinta === 4; }).length;
    K.push({ k: "Jurnal UNMER", v: semua.length, l: "jurnal terdata", d: s12 + " SINTA 1–2 · " + s34 + " SINTA 3–4 · 0 Scopus", go: "jurnal" });
  }
  var A = window.__AKR;
  if (A && A.R) {
    var ok = 0, low = 0, best = null;
    A.R.forEach(function (r) { var t = A.total(r).t; if (r.ok && t >= 60) ok++; if (t < 60) low++; if (!best || t > best.t) best = { t: t, n: r.nama }; });
    K.push({ k: "Akreditasi 2026", v: ok + "/" + A.R.length, l: "jurnal lolos syarat minimum & nilai ≥60", d: low + " jurnal diperkirakan <60 · tertinggi " + (best ? String(Math.round(best.t * 10) / 10).replace(".", ",") : "–"), go: "akr", sub: "sim", hot: 1 });
  }
  var pb = document.querySelectorAll("#p-ojs .pintro b");
  if (pb.length >= 3) K.push({ k: "Peringatan OJS", v: pb[2].textContent, l: "naskah dengan peringatan kritis", d: "dari " + pb[1].textContent + " naskah aktif · dibaca " + pb[0].textContent, go: "ojs", warn: 1 });
  var PC = window.PT_CITE;
  if (PC && PC.j) {
    var cd = 0, cj = 0; Object.keys(PC.j).forEach(function (k) { var n = (PC.j[k].docs || []).length; cd += n; if (n) cj++; });
    K.push({ k: "Citedness Scopus", v: cd, l: "dokumen Scopus mengutip jurnal UNMER", d: cj + " jurnal dikutip · data " + PC.atLabel, go: "cite", hot: 1 });
  }
  var P = window.PT_AKR;
  if (P && P.cr) {
    var c = 0, n = 0; Object.keys(P.cr).forEach(function (k) { c += P.cr[k].c3 || 0; n += P.cr[k].n3 || 0; });
    K.push({ k: "Sitasi (DOI)", v: c, l: "sitasi artikel 3 tahun terakhir", d: n + " artikel ber-DOI · sumber Crossref", go: "akr", sub: "sit" });
  }
  if (D.geo || D.institusi) K.push({ k: "Jaringan", v: (D.geo || []).length + " negara", l: (D.institusi || []).length + " institusi mitra", d: "mitra bestari & dewan editor", go: "afiliasi" });
  if (D.sasaran) K.push({ k: "Sasaran publikasi", v: D.sasaran.length, l: "jurnal sasaran", d: D.sasaran.filter(function (x) { return x.tier === "A"; }).length + " Scopus · " + D.sasaran.filter(function (x) { return x.tier === "B"; }).length + " SINTA 1–2", go: "sasaran" });
  var css = document.createElement("style");
  css.textContent =
    "#ptDash{margin:22px 0 6px}#ptDash .dk{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}" +
    "#ptDash .dg{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}" +
    "#ptDash a.dc{display:block;text-decoration:none;color:inherit;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px 12px;position:relative;transition:transform .12s,box-shadow .12s}" +
    "#ptDash a.dc:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(14,26,43,.12)}" +
    "#ptDash a.dc::before{content:'';position:absolute;left:0;top:12px;bottom:12px;width:3px;border-radius:3px;background:var(--line)}" +
    "#ptDash a.dc.hot::before{background:var(--patina)}#ptDash a.dc.warn::before{background:var(--rust)}" +
    "#ptDash .ck{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}" +
    "#ptDash .cv{display:block;font-size:28px;font-weight:700;line-height:1.1;margin:6px 0 2px}#ptDash a.hot .cv{color:var(--patina)}#ptDash a.warn .cv{color:var(--rust)}" +
    "#ptDash .cl{display:block;font-size:13px}#ptDash .cd{display:block;font-size:12px;color:var(--muted);margin-top:6px}#ptDash .ca{position:absolute;right:14px;top:12px;color:var(--muted);font-size:14px}";
  document.head.appendChild(css);
  var box = document.createElement("section");
  box.id = "ptDash";
  box.innerHTML = "<p class='dk'>Mulai dari sini — pilih kartu untuk membuka bagiannya</p><div class='dg'>" + K.map(function (x) {
    return "<a href='#' class='dc" + (x.hot ? " hot" : "") + (x.warn ? " warn" : "") + "' data-dash='" + esc(x.go) + "'" + (x.sub ? " data-sub2='" + esc(x.sub) + "'" : "") + "><span class='ck'>" + esc(x.k) + "</span><span class='ca'>→</span><span class='cv'>" + esc(x.v) + "</span><span class='cl'>" + esc(x.l) + "</span><span class='cd'>" + esc(x.d) + "</span></a>";
  }).join("") + "</div>";
  main.insertBefore(box, main.firstChild);
  var dph = document.getElementById("ptDashPh"); if (dph) dph.remove();
  box.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-dash]"); if (!a) return; e.preventDefault();
    var b = document.querySelector('#tabs button[data-t="' + a.dataset.dash + '"]'); if (b) b.click();
    if (a.dataset.sub2) setTimeout(function () { var s = document.querySelector('#p-akr [data-sub="' + a.dataset.sub2 + '"]'); if (s) s.click(); }, 60);
  });
  var sync = function () { box.style.display = pr.classList.contains("on") ? "" : "none"; };
  new MutationObserver(sync).observe(pr, { attributes: true, attributeFilter: ["class"] });
  sync();
})();

/* Tema terang: kepala halaman & menu cerah, aksen burgundy. */
(function () {
  var css = document.createElement("style");
  css.textContent =
    "header.mast{background:linear-gradient(180deg,#FFFFFF 0%,#FBF2F4 100%)!important;color:var(--ink)!important;border-bottom:1px solid var(--line)}" +
    "header.mast h1{color:var(--ink)!important}header.mast h1 em{color:var(--patina)!important}" +
    "header.mast .eyebrow{color:var(--patina)!important}header.mast .lede{color:var(--muted)!important}" +
    "header.mast .snap{color:var(--ink)!important;background:#fff!important;border-color:var(--line)!important}header.mast .snap b{color:var(--ink)!important}header.mast .snap .lnk{color:var(--patina)!important}" +
    "header.mast .tabs button{color:var(--muted)!important}header.mast .tabs button:hover{color:var(--ink)!important}" +
    "header.mast .tabs button[aria-selected=true]{color:var(--ink)!important;border-bottom-color:var(--patina)!important;background:rgba(122,30,51,.07)!important}" +
    "main table thead th{background:var(--surface-2)!important;color:var(--muted)!important}";
  document.head.appendChild(css);
})();
