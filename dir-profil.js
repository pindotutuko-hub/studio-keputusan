/* Direktori Jurnal UNMER — halaman Profil Jurnal: satu halaman per jurnal berisi identitas, riwayat SINTA, simulasi akreditasi 2026,
   jaringan mitra bestari & dewan editor, sitasi (Crossref & Citedness Scopus), terbitan OJS, dan peringatan OJS.
   Dibuka dengan klik nama/chip jurnal (mis. Tangga SINTA) atau tautan #jurnal/<kode>. */
(function () {
  "use strict";
  var B = window.PT_BETON;
  if (!B || typeof DATA === "undefined" || document.getElementById("p-profil")) return;
  var esc = B.esc, fmt = B.fmt;
  var main = document.querySelector("main.wrap"), tabs = document.getElementById("tabs");
  if (!main || !tabs) return;
  var SEM = {}, JUR = {}, BYAK = {}, BYNAME = {};
  (DATA.semua || []).forEach(function (s) { SEM[s.kode] = s; BYNAME[(s.nama || "").toLowerCase()] = s.kode; });
  (DATA.jur || []).forEach(function (j) { JUR[j.id] = j; if (j.akronim) BYAK[j.akronim.toUpperCase()] = j.id; BYNAME[(j.nama || "").toLowerCase()] = j.id; });
  var idOf = function (txt) {
    var t = String(txt || "").replace(/[✓✔︎•·]/g, "").replace(/\s+/g, " ").trim();
    var hit = BYAK[t.toUpperCase()] || BYNAME[t.toLowerCase()];
    if (hit) return hit;
    var lt = t.toLowerCase(); if (lt.length < 6) return null;
    var k = Object.keys(SEM).filter(function (x) { var n = (SEM[x].nama || "").toLowerCase(); return n.indexOf(lt) === 0 || lt.indexOf(n) === 0; })[0];
    return k || null;
  };
  var CAT = { noed: ["Belum ada editor", 3], norev: ["Belum ada reviewer", 3], resp: ["Reviewer belum merespons", 3], late: ["Review terlambat", 3], dec: ["Menunggu keputusan editor", 2], init: ["Menunggu pemeriksaan awal", 2], auth: ["Menunggu revisi penulis", 2], prod: ["Tertahan di penyuntingan/produksi", 2], wait: ["Menunggu hasil review", 1] };

  var sec = document.createElement("section"); sec.className = "panel"; sec.id = "p-profil"; sec.setAttribute("role", "tabpanel");
  main.appendChild(sec);
  var prevTab = "ringkasan";

  var bar = function (v, max, col) { return "<div class='sb' style='width:100%'><i style='width:" + (max ? Math.min(100, 100 * v / max) : 0) + "%;background:" + (col || "var(--q1)") + "'></i></div>"; };
  var row = function (l, v) { return "<tr><td style='width:38%;color:#47404C'>" + l + "</td><td>" + v + "</td></tr>"; };
  var link = function (u, t) { return u ? "<a href='" + esc(u) + "' target='_blank' rel='noopener'>" + esc(t) + " ↗</a>" : ""; };

  function render(id) {
    var s = SEM[id] || {}, j = JUR[id] || {}, ak = j.akronim || (s.nama || id).split(":")[0], nama = s.nama || j.nama || id;
    var sinta = s.sinta != null ? s.sinta : j.sinta;
    var A = window.PT_AKR || {}, hist = (A.hist || {})[id] || [], cr = (A.cr || {})[id], ojsA = (A.ojs || {})[id];
    var AK = window.__AKR, sim = AK ? AK.R.filter(function (r) { return r.kode === id; })[0] : null, simT = sim ? AK.total(sim) : null;
    var C = window.PT_CITE && window.PT_CITE.j[id], cdocs = C && C.docs ? C.docs : [];
    var O = window.PT_OJS && window.PT_OJS.j && window.PT_OJS.j[id];
    /* jaringan */
    var people = [];
    (j.reviewers || []).forEach(function (r) { people.push({ n: r.n, inst: r.inst || r.a || "", k: r.k || "", p: "Mitra bestari", s: r.s }); });
    (DATA.editor || []).filter(function (e) { return e.kode === id; }).forEach(function (e) { people.push({ n: e.n, inst: e.inst || e.a || "", k: e.k || "", p: e.p || "Dewan editor", s: e.s }); });
    var neg = {}, ins = {}; people.forEach(function (p) { if (p.k) neg[p.k] = (neg[p.k] || 0) + 1; if (p.inst) ins[p.inst] = (ins[p.inst] || 0) + 1; });
    var negK = Object.keys(neg).sort(function (a, b) { return neg[b] - neg[a]; }), insK = Object.keys(ins).sort(function (a, b) { return ins[b] - ins[a]; });
    var luar = people.filter(function (p) { return p.k && p.k !== "Indonesia"; }).length;
    var nRev = (j.reviewers || []).length, nEd = people.length - nRev;
    /* OJS */
    var oc = {}, act = 0; if (O && O.subs) O.subs.forEach(function (x) { if (x.lama) return; act++; (x.cs || []).forEach(function (c) { oc[c] = (oc[c] || 0) + 1; }); });
    var krit = O && O.subs ? O.subs.filter(function (x) { return !x.lama && (x.cs || []).some(function (c) { return CAT[c] && CAT[c][1] === 3; }); }).length : 0;
    /* terbitan 3 tahun */
    var iss = ojsA && ojsA.issues ? ojsA.issues : [], arts = 0, doi = 0, auth = {}, affN = {};
    iss.forEach(function (i) { (i.arts || []).forEach(function (a) { arts++; if (a.doi) doi++; (a.au || []).forEach(function (u) { if (u[2]) affN[u[2]] = 1; }); }); });
    var cq = {}; cdocs.forEach(function (d) { var q = /^Q[1-4]$/.test(d.q || "") ? d.q : "–"; cq[q] = (cq[q] || 0) + 1; });

    var kpi = function (no, l, v, sm) { return "<div class='kpi'><span class='no'>" + no + "</span><span class='lbl'>" + l + "</span><b>" + v + "</b><small>" + sm + "</small></div>"; };
    var h = "<div class='bt'>" +
      "<div style='display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center;margin:14px 0 4px'><button type='button' class='x' id='pfBack'>← Kembali</button>" +
      "<label class='lbl' style='display:flex;gap:8px;align-items:center'>Jurnal lain <select id='pfSel' style='font:inherit;font-size:13px;padding:5px;border:1.5px solid var(--bk);border-radius:0;background:#fff;color:var(--bk);text-transform:none;letter-spacing:0'>" +
      Object.keys(SEM).map(function (k) { return "<option value='" + esc(k) + "'" + (k === id ? " selected" : "") + ">" + esc((JUR[k] && JUR[k].akronim && (SEM[k].nama || "").toUpperCase().indexOf(JUR[k].akronim.toUpperCase()) !== 0 ? JUR[k].akronim + " — " : "") + SEM[k].nama) + "</option>"; }).join("") + "</select></label></div>" +
      "<span class='lbl'>Profil jurnal · " + (sinta > 0 ? "SINTA " + sinta : "belum terakreditasi SINTA") + (s.bidang || j.bidang ? " · " + esc(s.bidang || j.bidang) : "") + "</span>" +
      "<h2 class='disp ttl' style='font-size:clamp(44px,7vw,84px)'>" + esc(ak) + "</h2>" +
      "<p class='lead' style='margin:6px 0 10px;font-size:17px'><b>" + esc(nama) + "</b>" + (s.unit || j.unit ? "<br><span style='color:#47404C'>" + esc(s.unit || j.unit) + " · Universitas Merdeka Malang</span>" : "") + "</p>" +
      "<div style='display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px'>" + [[s.url || j.url, "Laman jurnal"], [s.urlSinta, "SINTA"], [s.urlGaruda, "Garuda"], [s.urlEditor, "Dewan editor"], [s.urlBestari, "Mitra bestari"]].filter(function (x) { return x[0]; }).map(function (x) { return "<a class='btn ghost' style='text-decoration:none' href='" + esc(x[0]) + "' target='_blank' rel='noopener'>" + esc(x[1]) + " ↗</a>"; }).join("") + "</div>" +
      "<div class='kpis'>" +
      kpi("P-1", "SINTA sekarang", sinta > 0 ? "S" + sinta : "–", hist.length ? "berlaku s.d. " + hist[hist.length - 1].b : "riwayat belum tercatat") +
      kpi("P-2", "Simulasi 2026", simT ? fmt(Math.round(simT.t * 10) / 10).replace(".", ",") : "–", simT && AK.peringkat ? esc(AK.peringkat(simT.t)) + (sim.ok ? "" : " · syarat minimum belum lengkap") : "belum disimulasikan") +
      kpi("P-3", "Citedness Scopus", cdocs.length, C && C.src ? "dokumen Scopus pengutip" : "tidak ada di OpenAlex") +
      kpi("P-4", "Jaringan", people.length, nRev + " mitra bestari · " + nEd + " editor · " + negK.length + " negara") +
      kpi("P-5", "Naskah OJS", act || "–", O ? krit + " dengan peringatan kritis" : "data OJS tidak tersedia") +
      "</div>";

    /* Identitas & riwayat */
    var y0 = 2014, y1 = 2031, W = 680;
    var tl = "<svg viewBox='0 0 " + W + " 70' width='100%' role='img' aria-label='Riwayat peringkat SINTA'>";
    for (var y = y0; y <= y1; y++) { var x = 10 + (y - y0) * (W - 20) / (y1 - y0 + 1); tl += "<line x1='" + x + "' x2='" + x + "' y1='14' y2='44' stroke='#E6DDE1'/>" + (y % 2 === 0 ? "<text x='" + x + "' y='60'>" + y + "</text>" : ""); }
    hist.forEach(function (g) { var xa = 10 + (g.a - y0) * (W - 20) / (y1 - y0 + 1), xb = 10 + (g.b + 1 - y0) * (W - 20) / (y1 - y0 + 1); tl += "<rect x='" + xa + "' y='16' width='" + Math.max(6, xb - xa - 2) + "' height='26' fill='" + (g.r <= 2 ? "#5E1626" : g.r <= 3 ? "#7A1E33" : g.r <= 4 ? "#B23A55" : "#D7A1AE") + "' stroke='#141017'/><text x='" + (xa + 6) + "' y='34' style='fill:" + (g.r <= 4 ? "#fff" : "#141017") + ";font-weight:700;font-size:12px'>S" + g.r + " · " + g.a + "–" + g.b + "</text>"; });
    var xn = 10 + (2026.83 - y0) * (W - 20) / (y1 - y0 + 1); tl += "<line x1='" + xn + "' x2='" + xn + "' y1='8' y2='48' stroke='#141017' stroke-width='2' stroke-dasharray='3 2'/><text x='" + (xn + 3) + "' y='10' style='fill:#141017'>kini</text></svg>";
    h += "<div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px'>" +
      "<div class='blk'><div class='hd'><h3>Identitas</h3></div><div class='in'><table><tbody>" +
      row("ISSN", esc(s.issn || j.issn || "–")) + row("Frekuensi", esc(s.frek || j.frek || "–")) + row("Pengelola", esc(s.unit || j.unit || "–")) + row("Bidang", esc(s.bidang || j.bidang || "–")) +
      row("Indeksasi", esc((j.indeks || []).join(", ") || "–")) + row("Status akreditasi", esc(s.akrKet || s.akr || (sinta > 0 ? "SINTA " + sinta : "–"))) +
      (ojsA ? row("Terbitan 3 tahun", iss.length + " nomor · " + arts + " artikel · DOI " + (arts ? Math.round(100 * doi / arts) : 0) + "% · " + Object.keys(affN).length + " afiliasi penulis") : "") +
      (O ? row("Statistik OJS", (O.ed && O.ed.submissionsReceived ? fmt(O.ed.submissionsReceived) + " naskah diterima · " : "") + (O.ed && O.ed.acceptanceRate != null ? "tingkat terima " + Math.round(O.ed.acceptanceRate * 100) + "% · " : "") + (O.ed && O.ed.daysToDecision ? O.ed.daysToDecision + " hari ke keputusan" : "")) : "") +
      (j.catatan ? row("Catatan", esc(j.catatan)) : "") +
      "</tbody></table></div></div>" +
      "<div class='blk'><div class='hd'><h3>Riwayat SINTA & akreditasi 2026</h3></div><div class='in'>" + (hist.length ? tl : "<p class='note'>Riwayat peringkat belum tercatat di SINTA.</p>") +
      (simT ? "<p style='margin:10px 0 6px'>Simulasi otomatis 2026: <b>" + String(Math.round(simT.t * 10) / 10).replace(".", ",") + "</b> (rentang " + String(Math.round(simT.lo * 10) / 10).replace(".", ",") + "–" + String(Math.round(simT.hi * 10) / 10).replace(".", ",") + ") → <b>" + esc(AK.peringkat(simT.t)) + "</b></p>" +
        (sim.min.filter(function (m) { return !m[1]; }).length ? "<p class='note' style='margin:0 0 8px'>Syarat minimum belum terpenuhi: " + sim.min.filter(function (m) { return !m[1]; }).map(function (m) { return esc(m[0]); }).join(", ") + ".</p>" : "") +
        "<button type='button' class='btn' id='pfSim'>Buka di simulator →</button>" : "") + "</div></div></div>";

    /* Jaringan */
    var mxN = negK.length ? neg[negK[0]] : 1;
    h += "<div class='blk'><div class='hd'><h3>Jaringan mitra bestari & dewan editor</h3><button type='button' class='btn ghost' id='pfMap'>Lihat di peta →</button></div><div class='in'>" +
      (people.length ? "<p class='note' style='margin-top:0'>" + people.length + " orang dari " + negK.length + " negara dan " + insK.length + " institusi; " + Math.round(100 * luar / people.length) + "% dari luar Indonesia." + (j.internal ? " Mitra bestari internal UNMER: " + j.internal + "." : "") + "</p>" +
        "<div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px'><div><span class='lbl'>Per negara</span>" + negK.map(function (k) { return "<div style='display:grid;grid-template-columns:130px minmax(0,1fr) 30px;gap:8px;align-items:center;margin:5px 0;font-size:13px'><span>" + esc(k) + "</span>" + bar(neg[k], mxN, k === "Indonesia" ? "var(--q3)" : "var(--q1)") + "<span style='text-align:right'>" + neg[k] + "</span></div>"; }).join("") + "</div>" +
        "<div><span class='lbl'>Institusi teratas</span><table style='margin-top:4px'><tbody>" + insK.slice(0, 10).map(function (i) { return "<tr><td>" + esc(i) + "</td><td class='r'>" + ins[i] + "</td></tr>"; }).join("") + "</tbody></table></div></div>" +
        "<details style='margin-top:12px'><summary class='lbl' style='cursor:pointer'>Daftar lengkap (" + people.length + " orang)</summary><div class='scroll' style='margin-top:6px'><table><thead><tr><th>Nama</th><th>Peran</th><th>Institusi</th><th>Negara</th><th>Scopus ID</th></tr></thead><tbody>" +
        people.map(function (p) { return "<tr><td>" + esc(p.n) + "</td><td>" + esc(p.p) + "</td><td>" + esc(p.inst) + "</td><td>" + esc(p.k) + "</td><td>" + (p.s ? "<a href='https://www.scopus.com/authid/detail.uri?authorId=" + esc(p.s) + "' target='_blank' rel='noopener'>" + esc(p.s) + "</a>" : "") + "</td></tr>"; }).join("") + "</tbody></table></div></details>"
        : "<p class='note'>Daftar mitra bestari dan dewan editor jurnal ini belum dapat dipanen dari lamannya.</p>") + "</div></div>";

    /* Sitasi */
    var cy = cr && cr.yr ? Object.keys(cr.yr).filter(function (y) { return +y >= 2015 && +y <= 2026; }).sort() : [];
    var mxc = cy.reduce(function (m, y) { return Math.max(m, cr.yr[y][1]); }, 1);
    var top = C && C.arts ? C.arts.map(function (a, i) { return { a: a, i: i }; }).sort(function (x, y) { return y.a.s - x.a.s; }).slice(0, 5) : [];
    h += "<div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px'>" +
      "<div class='blk'><div class='hd'><h3>Sitasi berbasis DOI</h3><span class='lbl'>Crossref</span></div><div class='in'>" + (cr ? "<p style='margin-top:0'><b>" + cr.c3 + "</b> sitasi untuk " + cr.n3 + " artikel 3 tahun terakhir · <b>" + cr.cAll + "</b> sitasi untuk " + cr.nAll + " artikel seluruh arsip.</p>" +
        cy.map(function (y) { return "<div style='display:grid;grid-template-columns:44px minmax(0,1fr) 90px;gap:8px;align-items:center;margin:4px 0;font-size:12.5px'><span>" + y + "</span>" + bar(cr.yr[y][1], mxc, "var(--q2)") + "<span style='text-align:right'>" + cr.yr[y][1] + " · " + cr.yr[y][0] + " art.</span></div>"; }).join("") + "<p class='note'>Sitasi menurut tahun terbit artikel yang dikutip.</p>" : "<p class='note'>Data sitasi Crossref belum tersedia.</p>") + "</div></div>" +
      "<div class='blk'><div class='hd'><h3>Citedness in Scopus</h3><button type='button' class='btn ghost' id='pfCite'>Rincian →</button></div><div class='in'>" +
      (cdocs.length ? "<p style='margin-top:0'><b>" + cdocs.length + "</b> dokumen terindeks Scopus mengutip " + (C.arts || []).length + " artikel " + esc(ak) + ". Kuartil sumber: " + ["Q1", "Q2", "Q3", "Q4", "–"].filter(function (q) { return cq[q]; }).map(function (q) { return "<span class='q " + q + "'>" + q + "</span> " + cq[q]; }).join(" · ") + "</p><span class='lbl'>Artikel paling banyak dikutip Scopus</span><ol style='margin:6px 0 0;padding-left:18px'>" +
        top.map(function (x) { return "<li style='margin:5px 0;font-size:13px'>" + (x.a.d ? "<a href='https://doi.org/" + esc(x.a.d) + "' target='_blank' rel='noopener'>" : "") + esc(x.a.t) + (x.a.d ? "</a>" : "") + " (" + (x.a.y || "") + ") — <b>" + x.a.s + "</b></li>"; }).join("") + "</ol>"
        : "<p class='note'>" + (C && C.src ? "Belum ada dokumen Scopus yang tercatat mengutip jurnal ini." : "Jurnal ini tidak ditemukan di OpenAlex lewat ISSN-nya, sehingga sitasi Scopus belum bisa dihitung.") + "</p>") + "</div></div></div>";

    /* OJS */
    if (O) {
      var keys = Object.keys(CAT).filter(function (k) { return oc[k]; });
      h += "<div class='blk'><div class='hd'><h3>Peringatan OJS</h3><button type='button' class='btn ghost' id='pfOjs'>Buka Peringatan OJS →</button></div><div class='in'>" +
        (keys.length ? "<p class='note' style='margin-top:0'>" + act + " naskah aktif (tanpa naskah yang tidak aktif >1 tahun) · data " + esc(window.PT_OJS.atLabel || "") + ".</p>" + keys.map(function (k) { return "<div style='display:grid;grid-template-columns:240px minmax(0,1fr) 40px;gap:8px;align-items:center;margin:5px 0;font-size:13px'><span>" + (CAT[k][1] === 3 ? "<b style='color:var(--q1)'>■</b> " : "□ ") + CAT[k][0] + "</span>" + bar(oc[k], act, CAT[k][1] === 3 ? "var(--q1)" : "var(--q3)") + "<span style='text-align:right'>" + oc[k] + "</span></div>"; }).join("") + "<p class='note'>■ = kritis.</p>" : "<p class='note'>Tidak ada naskah aktif dengan peringatan.</p>") + "</div></div>";
    }
    h += "</div>";
    sec.innerHTML = h;
  }

  function open(id) {
    if (!SEM[id] && !JUR[id]) return;
    var cur = tabs.querySelector("button[aria-selected=true]");
    if (cur && cur.dataset.t) prevTab = cur.dataset.t;
    render(id);
    tabs.querySelectorAll("button[data-t]").forEach(function (b) { b.setAttribute("aria-selected", "false"); });
    document.querySelectorAll("main section.panel").forEach(function (p) { p.classList.toggle("on", p === sec); });
    if (location.hash !== "#jurnal/" + id) history.pushState({ pf: id }, "", "#jurnal/" + id);
    window.scrollTo({ top: Math.max(0, sec.getBoundingClientRect().top + window.scrollY - 90), behavior: "smooth" });
  }
  var goTab = function (t) { var b = tabs.querySelector("button[data-t='" + t + "']"); if (b) b.click(); };
  var close = function () { if (location.hash.indexOf("#jurnal/") === 0) history.pushState({}, "", location.pathname + location.search); goTab(prevTab); };

  sec.addEventListener("click", function (e) {
    var id = (location.hash.match(/^#jurnal\/([\w-]+)/) || [])[1];
    if (e.target.closest("#pfBack")) { close(); return; }
    if (e.target.closest("#pfSim") && window.__AKR && window.__AKR.openSim) { goTab("akr"); setTimeout(function () { window.__AKR.openSim(id); var el = document.getElementById("akrSim"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60); return; }
    if (e.target.closest("#pfCite") && window.__CITE) { goTab("cite"); setTimeout(function () { window.__CITE.detail(id); }, 60); return; }
    if (e.target.closest("#pfOjs")) { goTab("ojs"); return; }
    if (e.target.closest("#pfMap")) { var ak = (JUR[id] || {}).akronim; goTab("ringkasan"); setTimeout(function () { if (window.__PETA) window.__PETA.setJ(ak); }, 60); return; }
  });
  sec.addEventListener("change", function (e) { if (e.target.id === "pfSel") open(e.target.value); });
  window.addEventListener("popstate", function () { var m = location.hash.match(/^#jurnal\/([\w-]+)/); if (m) open(m[1]); else if (sec.classList.contains("on")) goTab(prevTab); });

  /* Sumber klik: chip jurnal (Tangga SINTA, dll.) dan elemen ber-data-prof di mana pun */
  var sty = document.createElement("style");
  sty.textContent = "main .chip.pfok{cursor:pointer}main .chip.pfok:hover{outline:2px solid var(--patina);outline-offset:1px}[data-prof]{cursor:pointer}";
  document.head.appendChild(sty);
  var mark = function () { document.querySelectorAll("main .chip:not(.pfok)").forEach(function (c) { var id = idOf(c.textContent); if (id) { c.classList.add("pfok"); c.dataset.pf = id; c.title = "Buka profil jurnal"; } }); };
  mark(); new MutationObserver(function () { mark(); }).observe(main, { childList: true, subtree: true });
  document.addEventListener("click", function (e) {
    var c = e.target.closest("main .chip.pfok,[data-prof]"); if (!c) return;
    if (e.target.closest("a[href]:not([href='#'])")) return;
    e.preventDefault(); open(c.dataset.pf || c.dataset.prof);
  });
  window.__PROFIL = { open: open };
  var m0 = location.hash.match(/^#jurnal\/([\w-]+)/); if (m0) setTimeout(function () { open(m0[1]); }, 50);
})();
