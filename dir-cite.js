/* Direktori Jurnal UNMER — menu "Citedness Scopus": dokumen terindeks Scopus yang mengutip artikel tiap jurnal UNMER.
   Data: window.PT_CITE (dir-cite-data.js). Dihimpun sendiri dari OpenAlex + daftar sumber SCImago; tidak memakai laman citedness buatan jurnal. */
(function () {
  "use strict";
  var P = window.PT_CITE, B = window.PT_BETON;
  var tabs = document.getElementById("tabs");
  if (!P || !B || !tabs || document.getElementById("p-cite")) return;
  var esc = B.esc, fmt = B.fmt;
  var D = typeof DATA !== "undefined" ? DATA : { jur: [], semua: [] };
  var SEM = {}; (D.semua || []).forEach(function (s) { SEM[s.kode] = s; });
  var J = (D.jur || []).map(function (j) {
    var s = SEM[j.id] || {}, c = P.j[j.id] || { src: null };
    return { id: j.id, ak: j.akronim || j.id.toUpperCase(), nama: j.nama || s.nama || "", sinta: j.sinta || s.sinta || 0, bid: j.bidang || s.bidang || "", url: j.url || s.url || "", c: c };
  });
  J.forEach(function (j) { (j.c.docs || []).forEach(function (d) { d._j = j.id; if (!/^Q[1-4]$/.test(d.q || "")) d.q = ""; }); });
  var QC = { Q1: "var(--q1)", Q2: "var(--q2)", Q3: "var(--q3)", Q4: "var(--q4)", "": "var(--q0)" };
  var QS = ["Q1", "Q2", "Q3", "Q4", ""];
  var QL = function (q) { return q || "tanpa Q"; };
  var TY = { journal: "Jurnal", "conference and proceedings": "Prosiding", "book series": "Seri buku", "trade journal": "Jurnal dagang" };
  var sg = function (s) { return !s ? "0" : s <= 2 ? "12" : s >= 5 ? "56" : String(s); };
  var yg = function (y) { return y <= 2021 ? "a" : y <= 2023 ? "b" : y === 2024 ? "c" : "d"; };

  /* ---------- tab & panel ---------- */
  var btn = document.createElement("button");
  btn.type = "button"; btn.dataset.t = "cite"; btn.setAttribute("role", "tab"); btn.setAttribute("aria-selected", "false"); btn.textContent = "Citedness Scopus";
  tabs.insertBefore(btn, tabs.querySelector('button[data-t="ojs"]') || null);
  var sec = document.createElement("section"); sec.className = "panel"; sec.id = "p-cite"; sec.setAttribute("role", "tabpanel");
  var ref = document.getElementById("p-ojs") || document.getElementById("p-update");
  ref ? ref.parentNode.insertBefore(sec, ref) : document.querySelector("main").appendChild(sec);

  var st = { s: "*", q: [], t: [], y: "*" };
  sec.innerHTML =
    "<div class='bt'>" +
    "<div style='display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;align-items:flex-end;margin-top:8px'>" +
    "<div><span class='lbl'>Scopus · citedness · data " + esc(P.atLabel) + "</span>" +
    "<h2 class='disp ttl'>Citedness<br><span class='ol'>in Scopus</span></h2></div>" +
    "<p class='lead'>Berapa kali artikel jurnal UNMER dikutip oleh dokumen yang terindeks Scopus — jurnal, prosiding, dan seri buku. Dihitung seragam untuk semua jurnal dari sumber terbuka, tidak mengambil laman <i>citedness</i> yang dibuat masing-masing jurnal. Pilih jurnal pada peringkat untuk melihat artikel yang dikutip dan dokumen pengutipnya.</p></div>" +
    "<div class='dash'><aside class='side'><div class='sticky' id='ciF'></div></aside><div class='body'>" +
    "<div class='kpis' id='ciK'></div>" +
    "<div class='blk'><div class='hd'><h3>Dokumen Scopus pengutip per tahun</h3><div class='lg' id='ciLg'></div></div><div class='in' id='ciY'></div></div>" +
    "<div class='blk'><div class='hd'><h3>Peringkat jurnal UNMER</h3><span class='lbl' id='ciRn'></span></div><div class='in' id='ciR'></div></div>" +
    "<div class='blk' id='ciDw' hidden><div class='hd'><h3 id='ciDt'>Rincian jurnal</h3><button type='button' class='x' id='ciDx'>Tutup ✕</button></div><div class='in' id='ciD'></div></div>" +
    "<div class='blk'><div class='hd'><h3>Sumber Scopus yang paling sering mengutip</h3></div><div class='in' id='ciS'></div></div>" +
    "<div class='blk'><div class='hd'><h3>Cara membaca angka ini</h3></div><div class='in note'>" +
    "<p><b>Apa yang dihitung.</b> Satu dokumen pengutip dihitung satu kali per jurnal, walaupun mengutip beberapa artikel jurnal itu. Dokumen dihitung bila sumber tempat terbitnya tercantum dalam daftar sumber Scopus yang dipakai SCImago Journal Rank 2025 (jurnal, prosiding, seri buku), dicocokkan lewat ISSN.</p>" +
    "<p><b>Dari mana datanya.</b> Daftar karya yang mengutip diambil dari OpenAlex (" + esc(P.atLabel) + "); kuartil Q1–Q4 dari SCImago. Angka ini <b>perkiraan terbuka</b>, bisa berbeda dari Scopus resmi: dokumen tanpa ISSN, sitasi yang tidak tertangkap OpenAlex, atau sumber yang baru masuk/keluar Scopus dapat membuat selisih. Untuk angka resmi, periksa lewat akun Scopus institusi (fitur <i>Cited by</i> atau pencarian REFTITLE/REFSRCTITLE).</p>" +
    "<p><b>Mengapa penting.</b> Sitasi dari dokumen bereputasi menunjukkan keterbacaan dan dampak jurnal; pada akreditasi 2026 dampak sitasi dinilai dalam unsur penyebarluasan dan dampak (lihat menu Akreditasi 2026 → Unsur penilaian).</p>" +
    "<p>Jurnal tanpa data: " + J.filter(function (j) { return !j.c.src; }).map(function (j) { return esc(j.ak); }).join(", ") + " (tidak ditemukan di OpenAlex lewat ISSN)" + (J.filter(function (j) { return j.c.src && !j.c.nCit; }).length ? "; belum tercatat dikutip: " + J.filter(function (j) { return j.c.src && !j.c.nCit; }).map(function (j) { return esc(j.ak); }).join(", ") : "") + ".</p>" +
    "</div></div></div></div></div>";

  var $ = function (id) { return document.getElementById(id); };
  $("ciLg").innerHTML = QS.map(function (q) { return "<span><i style='background:" + QC[q] + "'></i>" + QL(q) + "</span>"; }).join("");
  var groups = [
    { k: "s", l: "Peringkat SINTA jurnal", opts: [["*", "Semua"], ["12", "S1–S2"], ["3", "S3"], ["4", "S4"], ["56", "S5–S6"]] },
    { k: "q", l: "Kuartil sumber pengutip", multi: 1, opts: [["*", "Semua"], ["Q1", "Q1"], ["Q2", "Q2"], ["Q3", "Q3"], ["Q4", "Q4"], ["", "Tanpa Q"]] },
    { k: "t", l: "Jenis sumber", multi: 1, opts: [["*", "Semua"], ["journal", "Jurnal"], ["conference and proceedings", "Prosiding"], ["book series", "Seri buku"]] },
    { k: "y", l: "Tahun dokumen pengutip", opts: [["*", "Semua"], ["a", "≤2021"], ["b", "2022–23"], ["c", "2024"], ["d", "2025–26"]] }
  ];
  var S = B.seg($("ciF"), groups, st, function () { render(); });
  var sel = null;

  var docsOf = function (j) {
    return (j.c.docs || []).filter(function (d) {
      if (st.q.length && st.q.indexOf(d.q || "") < 0) return false;
      if (st.t.length && st.t.indexOf(d.ty) < 0) return false;
      if (st.y !== "*" && yg(d.y) !== st.y) return false;
      return true;
    });
  };
  var inS = function (j) { return st.s === "*" || sg(j.sinta) === st.s; };

  var bars = function (cnt, tot, max) {
    return "<div class='sb' style='width:" + (max ? Math.max(2, 100 * tot / max) : 0) + "%'>" + QS.map(function (q) { return cnt[q] ? "<i style='width:" + (100 * cnt[q] / tot) + "%;background:" + QC[q] + "' title='" + QL(q) + ": " + cnt[q] + "'></i>" : ""; }).join("") + "</div>";
  };
  var yearChart = function (docs) {
    var by = {}, ys = [];
    docs.forEach(function (d) { if (!d.y) return; by[d.y] = by[d.y] || {}; by[d.y][d.q || ""] = (by[d.y][d.q || ""] || 0) + 1; });
    ys = Object.keys(by).map(Number).sort(); if (!ys.length) return "<p class='note'>Tidak ada dokumen untuk filter ini.</p>";
    var y0 = Math.min(ys[0], 2018), y1 = Math.max(ys[ys.length - 1], 2026), all = [];
    for (var y = y0; y <= y1; y++) all.push(y);
    var mx = Math.max.apply(null, all.map(function (y) { var o = by[y] || {}; return QS.reduce(function (a, q) { return a + (o[q] || 0); }, 0); })) || 1;
    var W = 720, H = 226, L = 34, Bt = 24, bw = (W - L - 10) / all.length;
    var s = "<svg viewBox='0 0 " + W + " " + H + "' width='100%' role='img' aria-label='Dokumen Scopus pengutip per tahun'>";
    var step = mx > 60 ? 20 : mx > 25 ? 10 : 5;
    for (var g = 0; g <= mx; g += step) { var gy = H - Bt - (H - Bt - 26) * g / mx; s += "<line x1='" + L + "' x2='" + W + "' y1='" + gy + "' y2='" + gy + "' stroke='#E6DDE1'/><text x='" + (L - 6) + "' y='" + (gy + 3) + "' text-anchor='end'>" + g + "</text>"; }
    all.forEach(function (y, i) {
      var o = by[y] || {}, acc = 0, x = L + i * bw + 3;
      QS.forEach(function (q) { var v = o[q] || 0; if (!v) return; var h = (H - Bt - 26) * v / mx; acc += h; s += "<rect x='" + x + "' y='" + (H - Bt - acc) + "' width='" + (bw - 6) + "' height='" + h + "' fill='" + QC[q].replace("var(", "").replace(")", "") + "' style='fill:" + QC[q] + "' stroke='#141017' stroke-width='.6'><title>" + y + " · " + QL(q) + ": " + v + "</title></rect>"; });
      var tot = QS.reduce(function (a, q) { return a + (o[q] || 0); }, 0);
      if (tot) s += "<text x='" + (x + (bw - 6) / 2) + "' y='" + (H - Bt - acc - 4) + "' text-anchor='middle' style='fill:#141017;font-weight:600'>" + tot + "</text>";
      s += "<text x='" + (x + (bw - 6) / 2) + "' y='" + (H - 8) + "' text-anchor='middle'>" + y + "</text>";
    });
    return s + "<line x1='" + L + "' x2='" + W + "' y1='" + (H - Bt) + "' y2='" + (H - Bt) + "' stroke='#141017' stroke-width='1.5'/></svg>";
  };

  var render = function () {
    var rows = J.filter(inS).map(function (j) {
      var d = docsOf(j), cnt = {}; d.forEach(function (x) { cnt[x.q || ""] = (cnt[x.q || ""] || 0) + 1; });
      var arts = {}; d.forEach(function (x) { (x.r || []).forEach(function (i) { arts[i] = 1; }); });
      return { j: j, d: d, cnt: cnt, n: d.length, na: Object.keys(arts).length };
    });
    var all = []; rows.forEach(function (r) { all = all.concat(r.d); });
    /* jumlah per tombol filter (berdasarkan filter lain) */
    var sc = {}; J.forEach(function (j) { var k = sg(j.sinta); sc[k] = (sc[k] || 0) + docsOf(j).length; sc["*"] = (sc["*"] || 0) + docsOf(j).length; }); S.counts("s", sc);
    var qc = { "*": 0 }; rows.forEach(function (r) { (r.j.c.docs || []).forEach(function (d) { if (st.t.length && st.t.indexOf(d.ty) < 0) return; if (st.y !== "*" && yg(d.y) !== st.y) return; qc[d.q || ""] = (qc[d.q || ""] || 0) + 1; qc["*"]++; }); }); S.counts("q", qc);
    var tc = { "*": 0 }; rows.forEach(function (r) { (r.j.c.docs || []).forEach(function (d) { if (st.q.length && st.q.indexOf(d.q || "") < 0) return; if (st.y !== "*" && yg(d.y) !== st.y) return; tc[d.ty] = (tc[d.ty] || 0) + 1; tc["*"]++; }); }); S.counts("t", tc);
    var yc = { "*": 0 }; rows.forEach(function (r) { (r.j.c.docs || []).forEach(function (d) { if (st.q.length && st.q.indexOf(d.q || "") < 0) return; if (st.t.length && st.t.indexOf(d.ty) < 0) return; yc[yg(d.y)] = (yc[yg(d.y)] || 0) + 1; yc["*"]++; }); }); S.counts("y", yc);

    var q12 = all.filter(function (d) { return d.q === "Q1" || d.q === "Q2"; }).length;
    var byY = {}; all.forEach(function (d) { byY[d.y] = (byY[d.y] || 0) + 1; });
    var peak = Object.keys(byY).sort(function (a, b) { return byY[b] - byY[a]; })[0];
    var nj = rows.filter(function (r) { return r.n; }).length, na = rows.reduce(function (a, r) { return a + r.na; }, 0);
    $("ciK").innerHTML =
      "<div class='kpi'><span class='no'>K-1</span><span class='lbl'>Dokumen Scopus</span><b>" + fmt(all.length) + "</b><small>yang mengutip jurnal UNMER</small></div>" +
      "<div class='kpi'><span class='no'>K-2</span><span class='lbl'>Jurnal dikutip</span><b>" + nj + "<span style='font-size:22px'>/" + rows.length + "</span></b><small>jurnal UNMER punya ≥1 sitasi Scopus</small></div>" +
      "<div class='kpi'><span class='no'>K-3</span><span class='lbl'>Artikel dikutip</span><b>" + fmt(na) + "</b><small>artikel UNMER yang dikutip dokumen Scopus</small></div>" +
      "<div class='kpi'><span class='no'>K-4</span><span class='lbl'>Q1–Q2</span><b>" + (all.length ? Math.round(100 * q12 / all.length) : 0) + "%</b><small>" + fmt(q12) + " dokumen dari sumber Q1–Q2" + (peak ? " · puncak " + peak : "") + "</small></div>";
    $("ciY").innerHTML = yearChart(all);
    rows.sort(function (a, b) { return b.n - a.n || a.j.ak.localeCompare(b.j.ak); });
    var mx = rows.length ? rows[0].n : 0;
    $("ciRn").textContent = rows.length + " jurnal · klik untuk rincian";
    $("ciR").innerHTML = rows.map(function (r, i) {
      var j = r.j, tag = j.c.src ? "" : " · tidak ada di OpenAlex";
      return "<button type='button' class='rk" + (sel === j.id ? " sel" : "") + "' data-j='" + j.id + "'><span class='n'>" + String(i + 1).padStart(2, "0") + "</span>" +
        "<span class='a'>" + esc(j.ak) + "<small>SINTA " + (j.sinta || "–") + tag + "</small></span>" + (r.n ? bars(r.cnt, r.n, mx) : "<span class='lbl' style='font-size:10px'>belum ada sitasi Scopus</span>") + "<span class='v'>" + r.n + "</span></button>";
    }).join("");
    /* sumber teratas */
    var sn = {}; all.forEach(function (d) { var k = d.sn || "—"; sn[k] = sn[k] || { n: 0, q: d.q, ty: d.ty, js: {} }; sn[k].n++; sn[k].js[d._j] = 1; });
    var top = Object.keys(sn).sort(function (a, b) { return sn[b].n - sn[a].n; }).slice(0, 15);
    $("ciS").innerHTML = top.length ? "<div class='scroll'><table><thead><tr><th>#</th><th>Sumber Scopus</th><th>Jenis</th><th>Kuartil</th><th>Jurnal UNMER yang dikutip</th><th style='text-align:right'>Dokumen</th></tr></thead><tbody>" +
      top.map(function (k, i) { var o = sn[k]; return "<tr><td>" + (i + 1) + "</td><td>" + esc(k) + "</td><td>" + (TY[o.ty] || esc(o.ty || "")) + "</td><td><span class='q " + (o.q || "") + "'>" + (o.q || "–") + "</span></td><td>" + Object.keys(o.js).map(function (x) { var jj = J.filter(function (y) { return y.id === x; })[0]; return jj ? esc(jj.ak) : ""; }).join(", ") + "</td><td class='r'>" + o.n + "</td></tr>"; }).join("") + "</tbody></table></div>" : "<p class='note'>Tidak ada dokumen untuk filter ini.</p>";
    if (sel) detail(sel, true);
  };
  
  var detail = function (id, quiet) {
    var j = J.filter(function (x) { return x.id === id; })[0]; if (!j) return;
    sel = id; $("ciDw").hidden = false;
    $("ciR").querySelectorAll(".rk").forEach(function (b) { b.classList.toggle("sel", b.dataset.j === id); });
    var d = docsOf(j), c = j.c, arts = c.arts || [];
    var na = {}; d.forEach(function (x) { (x.r || []).forEach(function (i) { na[i] = (na[i] || 0) + 1; }); });
    var al = Object.keys(na).map(Number).sort(function (a, b) { return na[b] - na[a]; });
    $("ciDt").textContent = j.ak + " — rincian citedness";
    var dl = function (x) { return x ? "<a href='https://doi.org/" + esc(x) + "' target='_blank' rel='noopener'>" : ""; };
    $("ciD").innerHTML =
      "<p class='note' style='margin-top:0'><b>" + esc(j.nama) + "</b> · SINTA " + (j.sinta || "–") + (j.bid ? " · " + esc(j.bid) : "") + (j.url ? " · <a href='" + esc(j.url) + "' target='_blank' rel='noopener'>laman jurnal</a>" : "") + "</p>" +
      (!c.src ? "<p class='note'>Jurnal ini tidak ditemukan di OpenAlex lewat ISSN-nya, jadi sitasinya belum bisa dihitung. Pastikan ISSN terdaftar benar di ISSN Portal dan Crossref, dan setiap artikel ber-DOI dengan metadata referensi lengkap.</p>" :
      "<div class='kpis'><div class='kpi'><span class='lbl'>Dokumen Scopus</span><b>" + d.length + "</b><small>sesuai filter</small></div>" +
      "<div class='kpi'><span class='lbl'>Artikel dikutip</span><b>" + al.length + "</b><small>dari " + fmt(c.w || 0) + " karya tercatat di OpenAlex</small></div>" +
      "<div class='kpi'><span class='lbl'>Semua sitasi</span><b>" + fmt(c.nCit || 0) + "</b><small>dokumen pengutip (Scopus + non-Scopus)</small></div>" +
      "<div class='kpi'><span class='lbl'>Porsi Scopus</span><b>" + (c.nCit ? Math.round(100 * (c.docs || []).length / c.nCit) : 0) + "%</b><small>dari seluruh dokumen pengutip</small></div></div>" +
      yearChart(d) +
      "<h4 class='lbl' style='margin:16px 0 6px'>Artikel " + esc(j.ak) + " yang dikutip dokumen Scopus</h4>" +
      (al.length ? "<div class='scroll'><table><thead><tr><th>Artikel</th><th>Tahun</th><th style='text-align:right'>Dikutip Scopus</th><th style='text-align:right'>Semua sitasi*</th></tr></thead><tbody>" +
        al.map(function (i) { var a = arts[i] || {}; return "<tr><td>" + dl(a.d) + esc(a.t || "(tanpa judul)") + (a.d ? "</a>" : "") + "</td><td>" + (a.y || "") + "</td><td class='r'><b>" + na[i] + "</b></td><td class='r'>" + (a.c || 0) + "</td></tr>"; }).join("") + "</tbody></table></div><p class='note'>* jumlah semua sitasi menurut OpenAlex, tidak hanya dari Scopus.</p>" : "<p class='note'>Tidak ada artikel untuk filter ini.</p>") +
      "<h4 class='lbl' style='margin:16px 0 6px'>Dokumen Scopus yang mengutip</h4>" +
      (d.length ? "<div class='scroll'><table><thead><tr><th>Tahun</th><th>Dokumen pengutip</th><th>Sumber</th><th>Q</th><th>Jenis</th></tr></thead><tbody>" +
        d.slice().sort(function (a, b) { return (b.y || 0) - (a.y || 0); }).map(function (x) { return "<tr><td>" + (x.y || "") + "</td><td>" + dl(x.d) + esc(x.t || "(tanpa judul)") + (x.d ? "</a>" : "") + "</td><td>" + esc(x.sn) + "</td><td><span class='q " + (x.q || "") + "'>" + (x.q || "–") + "</span></td><td>" + (TY[x.ty] || esc(x.ty || "")) + "</td></tr>"; }).join("") + "</tbody></table></div>" : "<p class='note'>Tidak ada dokumen untuk filter ini.</p>"));
    if (!quiet) $("ciDw").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $("ciR").addEventListener("click", function (e) { var b = e.target.closest(".rk"); if (b) detail(b.dataset.j); });
  $("ciDx").addEventListener("click", function () { sel = null; $("ciDw").hidden = true; $("ciR").querySelectorAll(".rk").forEach(function (b) { b.classList.remove("sel"); }); });
  render();

  /* sambungkan ke mekanisme tab bawaan */
  btn.addEventListener("click", function () {
    setTimeout(function () {
      if (sec.classList.contains("on")) return;
      tabs.querySelectorAll("button[data-t]").forEach(function (b) { b.setAttribute("aria-selected", b === btn ? "true" : "false"); });
      document.querySelectorAll("section.panel").forEach(function (p) { p.classList.toggle("on", p === sec); });
    }, 0);
  });
  window.__CITE = { J: J, render: render, detail: detail };
})();
