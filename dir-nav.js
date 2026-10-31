/* Direktori Jurnal UNMER — menu berkelompok dipasang SEBELUM data besar dimuat, supaya bilah menu tidak berubah bentuk.
   Tombol Akreditasi 2026, Citedness Scopus, dan Peringatan OJS disiapkan lebih dulu (redup) dan aktif begitu panelnya siap. */
(function () {
  "use strict";
  var nav = document.getElementById("tabs");
  if (!nav || nav.dataset.grouped) return;
  var PH = [["akr", "Akreditasi 2026"], ["cite", "Citedness Scopus"], ["ojs", "Peringatan OJS"]];
  var upd = nav.querySelector('button[data-t="update"]');
  PH.forEach(function (p) {
    if (nav.querySelector('button[data-t="' + p[0] + '"]')) return;
    var b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", "false");
    b.dataset.t = p[0]; b.className = "ptph"; b.textContent = p[1]; b.title = "Sedang dimuat…";
    nav.insertBefore(b, upd || null);
  });
  var st = document.createElement("style");
  st.textContent = "#tabs button.ptph{opacity:.5;pointer-events:none}#ptDashPh{margin:22px 0 6px}#ptDashPh .dg{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}" +
    "#ptDashPh .dc{height:150px;border:1px solid var(--line);border-radius:12px;background:linear-gradient(90deg,#fff 0%,#FBF2F4 50%,#fff 100%);background-size:200% 100%;animation:ptsh 1.4s linear infinite}" +
    "#ptDashPh .dk{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}@keyframes ptsh{from{background-position:200% 0}to{background-position:-200% 0}}";
  document.head.appendChild(st);
  var main = document.querySelector("main.wrap"), pr = document.getElementById("p-ringkasan");
  if (main && pr && !document.getElementById("ptDash")) {
    var ph = document.createElement("section"); ph.id = "ptDashPh";
    ph.innerHTML = "<p class='dk'>Mulai dari sini — memuat ringkasan…</p><div class='dg'>" + new Array(7).join("<div class='dc'></div>") + "</div>";
    if (!pr.classList.contains("on")) ph.style.display = "none";
    main.insertBefore(ph, main.firstChild);
    new MutationObserver(function () { ph.style.display = pr.classList.contains("on") ? "" : "none"; }).observe(pr, { attributes: true, attributeFilter: ["class"] });
  }
  var ready = function () {
    nav.querySelectorAll("button.ptph").forEach(function (b) { if (document.getElementById("p-" + b.dataset.t)) { b.classList.remove("ptph"); b.removeAttribute("title"); } });
    return !nav.querySelector("button.ptph");
  };
  if (main && !ready()) { var mo = new MutationObserver(function () { if (ready()) mo.disconnect(); }); mo.observe(main, { childList: true }); }
})();

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

