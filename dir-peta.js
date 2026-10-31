/* Direktori Jurnal UNMER — peta jaringan bergaya "Dasbor beton": filter cluster (wilayah, peran, SINTA, tahun akreditasi),
   angka pokok, panel info saat bulatan diklik, mode gelembung cluster, peringkat negara/cluster, dan matriks wilayah × SINTA. */
(function () {
  "use strict";
  var B = window.PT_BETON;
  if (!B || typeof DATA === "undefined" || !DATA.institusi) return;
  var esc = B.esc, fmt = B.fmt;

  /* Wilayah utama (saling lepas) + cluster gabungan */
  var REG = {
    id: { l: "Indonesia", c: ["Indonesia"] },
    asean: { l: "ASEAN (selain Indonesia)", s: "ASEAN lain", c: ["Malaysia", "Singapura", "Thailand", "Filipina", "Vietnam", "Kamboja", "Laos", "Myanmar", "Brunei", "Timor-Leste"] },
    eas: { l: "Asia Timur", c: ["Tiongkok", "Jepang", "Korea Selatan", "Taiwan", "Hong Kong", "Mongolia"] },
    sas: { l: "Asia Selatan", c: ["India", "Bangladesh", "Pakistan", "Sri Lanka", "Nepal"] },
    me: { l: "Timur Tengah", c: ["Turki", "Iran", "Irak", "Qatar", "Bahrain", "Arab Saudi", "Uni Emirat Arab", "Yordania", "Oman", "Kuwait", "Mesir"] },
    oc: { l: "Oseania", c: ["Australia", "Selandia Baru", "Papua Nugini", "Fiji"] },
    eu: { l: "Eropa", c: ["Inggris", "Belanda", "Jerman", "Austria", "Italia", "Portugal", "Polandia", "Rusia", "Prancis", "Spanyol", "Swedia", "Norwegia", "Finlandia", "Denmark", "Belgia", "Swiss", "Irlandia", "Yunani", "Ceko", "Hungaria", "Rumania", "Ukraina"] },
    am: { l: "Amerika", c: ["Amerika Serikat", "Kanada", "Brasil", "Meksiko", "Argentina", "Chili", "Kolombia", "Peru"] },
    af: { l: "Afrika", c: ["Nigeria", "Etiopia", "Afrika Selatan", "Kenya", "Ghana", "Aljazair", "Maroko", "Tunisia", "Tanzania", "Uganda"] }
  };
  var RK = Object.keys(REG);
  var CL = {
    "*": { l: "Semua negara" },
    id: { l: "Indonesia", r: ["id"] },
    luar: { l: "Luar negeri", r: ["asean", "eas", "sas", "me", "oc", "eu", "am", "af"] },
    asean: { l: "ASEAN", r: ["id", "asean"] },
    asia: { l: "Asia", r: ["id", "asean", "eas", "sas", "me"] },
    apac: { l: "Asia Pasifik", r: ["id", "asean", "eas", "sas", "oc"] },
    eas: { l: "Asia Timur", r: ["eas"] }, sas: { l: "Asia Selatan", r: ["sas"] }, me: { l: "Timur Tengah", r: ["me"] },
    oc: { l: "Oseania", r: ["oc"] }, eu: { l: "Eropa", r: ["eu"] }, am: { l: "Amerika", r: ["am"] }, af: { l: "Afrika", r: ["af"] }
  };
  var regOf = function (k) { for (var i = 0; i < RK.length; i++) if (REG[RK[i]].c.indexOf(k) >= 0) return RK[i]; return "lain"; };
  var tagsOf = function (k) {
    var r = regOf(k), t = [];
    if (r === "id" || r === "asean") t.push("ASEAN");
    if (["id", "asean", "eas", "sas", "me"].indexOf(r) >= 0) t.push("Asia");
    if (["id", "asean", "eas", "sas", "oc"].indexOf(r) >= 0) t.push("Asia Pasifik");
    if (REG[r] && r !== "id" && r !== "asean") t.push(REG[r].l);
    if (r !== "id") t.push("Luar negeri");
    return t;
  };

  /* Jurnal: akronim → SINTA & tahun mulai periode akreditasi terakhir */
  var JA = {}, H = (window.PT_AKR && window.PT_AKR.hist) || {};
  (DATA.jur || []).forEach(function (j) {
    var h = H[j.id] || [], last = h[h.length - 1];
    JA[j.akronim] = { id: j.id, s: j.sinta || 0, y: last ? last.a : 0, yb: last ? last.b : 0, nama: j.nama };
  });
  var sgr = function (s) { return !s ? "0" : s <= 2 ? "12" : s >= 5 ? "56" : String(s); };
  var ygr = function (y) { return !y ? "0" : y <= 2021 ? "a" : y <= 2023 ? "b" : "c"; };

  /* Orang (satu baris per orang per jurnal) */
  var ROWS = [];
  DATA.institusi.forEach(function (ins) { (ins.orang || []).forEach(function (o) { var ja = JA[o.j] || {}; ROWS.push({ k: ins.negara, ins: ins.nama, n: o.n, j: o.j, p: o.peran, s: sgr(ja.s), y: ygr(ja.y) }); }); });
  var GEO = {}; (DATA.geo || []).forEach(function (g) { GEO[g.k] = g; });

  var st = { w: "*", p: "*", s: "*", y: "*", m: "n" };
  var pass = function (r, skip) {
    if (skip !== "w" && st.w !== "*" && CL[st.w].r.indexOf(regOf(r.k)) < 0) return false;
    if (skip !== "p" && st.p !== "*" && r.p !== st.p) return false;
    if (skip !== "s" && st.s !== "*" && r.s !== st.s) return false;
    if (skip !== "y" && st.y !== "*" && r.y !== st.y) return false;
    return true;
  };

  var boot = function (tries) {
    var svg = document.getElementById("geoSvg"), wrap = svg && svg.closest(".geowrap");
    if (!svg || !svg.querySelector("circle.geo-node")) { if (tries < 40) setTimeout(function () { boot(tries + 1); }, 150); return; }
    if (document.getElementById("ptPeta")) return;
    var inner = svg.querySelector("#geoG>g") || svg.querySelector("#geoG");

    /* ---------- tata letak dasbor ---------- */
    var box = document.createElement("div"); box.id = "ptPeta"; box.className = "bt";
    box.innerHTML = "<div class='dash' style='margin-top:6px'><aside class='side'><div class='sticky' id='ppF'></div></aside><div class='body'><div class='kpis' id='ppK'></div><div id='ppMap'></div>" +
      "<div class='blk' id='ppSh' hidden style='margin-top:12px;border-top:6px solid var(--q1)'><div class='hd'><h3 id='ppSt'></h3><button type='button' class='x' id='ppSx'>Tutup ✕</button></div><div class='in' id='ppS'></div></div>" +
      "<div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:16px'>" +
      "<div class='blk' style='margin:0'><div class='hd'><h3>Peringkat</h3><div class='seg' id='ppRm'><button type='button' data-v='n' class='on'>Negara</button><button type='button' data-v='c'>Cluster</button></div></div><div class='in' id='ppR'></div></div>" +
      "<div class='blk' style='margin:0'><div class='hd'><h3>Wilayah × SINTA</h3><span class='lbl'>jumlah orang</span></div><div class='in' id='ppX' style='overflow-x:auto'></div></div></div>" +
      "<p class='note' style='margin-top:10px'>Cluster wilayah: ASEAN = 11 negara anggota termasuk Timor-Leste (resmi bergabung Oktober 2025); Asia = ASEAN, Asia Timur, Asia Selatan, dan Timur Tengah (Turki dihitung di Timur Tengah); Asia Pasifik = ASEAN, Asia Timur, Asia Selatan, dan Oseania. Tahun akreditasi = tahun mulai periode peringkat SINTA terakhir jurnal. Satu orang yang menjadi mitra bestari/editor di dua jurnal dihitung dua kali.</p></div></div>";
    wrap.parentNode.insertBefore(box, wrap);
    document.getElementById("ppMap").appendChild(wrap);
    wrap.style.position = "relative";

    var groups = [
      { k: "w", l: "Cluster wilayah", opts: Object.keys(CL).map(function (k) { return [k, k === "*" ? "Semua" : CL[k].l]; }) },
      { k: "p", l: "Peran", opts: [["*", "Semua"], ["bestari", "Mitra bestari"], ["editor", "Dewan editor"]] },
      { k: "s", l: "Peringkat SINTA jurnal", opts: [["*", "Semua"], ["12", "S1–S2"], ["3", "S3"], ["4", "S4"], ["56", "S5–S6"], ["0", "Belum"]] },
      { k: "y", l: "Tahun akreditasi (mulai)", opts: [["*", "Semua"], ["a", "≤2021"], ["b", "2022–23"], ["c", "2024–26"], ["0", "Tak tercatat"]] },
      { k: "m", l: "Tampilan peta", opts: [["n", "Titik negara"], ["c", "Gelembung cluster"]] }
    ];
    var SG = B.seg(document.getElementById("ppF"), groups, st, function () { update(); });
    var rmode = "n";
    document.getElementById("ppRm").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; rmode = b.dataset.v; this.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); }); update(); });

    /* simpul bawaan */
    var setK = function (el) { try { return JSON.parse(el.getAttribute("data-set") || "{}").ak; } catch (e) { return null; } };
    var nodes = {}; svg.querySelectorAll("circle.geo-node").forEach(function (c) { var k = setK(c); if (k) nodes[k] = { c: c, r0: +c.getAttribute("r"), x: +c.getAttribute("cx"), y: +c.getAttribute("cy") }; });
    svg.querySelectorAll("text.geo-lbl").forEach(function (t) { var k = setK(t); if (k && nodes[k]) nodes[k].t = t; });
    svg.querySelectorAll("path.geo-arc").forEach(function (p) { var m = (p.getAttribute("d") || "").match(/([\d.]+)\s+([\d.]+)\s*$/); if (!m) return; Object.keys(nodes).forEach(function (k) { var n = nodes[k]; if (Math.abs(n.x - m[1]) < 1 && Math.abs(n.y - m[2]) < 1) n.a = p; }); });
    var hub = nodes.Indonesia;
    var clu = document.createElementNS("http://www.w3.org/2000/svg", "g"); clu.setAttribute("id", "ppClu"); inner.appendChild(clu);
    var sty = document.createElement("style");
    sty.textContent = "#geoSvg.ppc .geo-node,#geoSvg.ppc .geo-lbl,#geoSvg.ppc .geo-arc{display:none}#geoSvg .geo-node,#geoSvg .geo-lbl{cursor:pointer}#geoSvg .geo-node,#geoSvg .geo-arc,#geoSvg .geo-lbl{transition:opacity .2s}" +
      "#ppClu circle{fill:#7A1E33;fill-opacity:.85;stroke:#fff;stroke-width:2;cursor:pointer}#ppClu circle:hover{fill:#B23A55}#ppClu text{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:600;fill:#141017;paint-order:stroke;stroke:#fff;stroke-width:4px;cursor:pointer}#ppClu path{fill:none;stroke:#B23A55;stroke-opacity:.45;stroke-width:1.6}" +
      "#geoSvg .geo-node.ppsel{stroke:#141017;stroke-width:3}";
    document.head.appendChild(sty);

    var agg = function (rows) {
      var o = { n: rows.length, ins: {}, bes: 0, ed: 0, j: {}, k: {} };
      rows.forEach(function (r) { o.ins[r.ins] = (o.ins[r.ins] || 0) + 1; if (r.p === "bestari") o.bes++; else o.ed++; o.j[r.j] = (o.j[r.j] || 0) + 1; o.k[r.k] = (o.k[r.k] || 0) + 1; });
      return o;
    };
    var cur = null;

    var update = function () {
      var rows = ROWS.filter(function (r) { return pass(r); });
      var A = agg(rows);
      /* jumlah pada tombol filter */
      groups.slice(0, 4).forEach(function (g) {
        var m = {}; ROWS.forEach(function (r) {
          if (!pass(r, g.k)) return;
          m["*"] = (m["*"] || 0) + 1;
          if (g.k === "w") Object.keys(CL).forEach(function (c) { if (c !== "*" && CL[c].r.indexOf(regOf(r.k)) >= 0) m[c] = (m[c] || 0) + 1; });
          else { var v = r[g.k]; m[v] = (m[v] || 0) + 1; }
        });
        SG.counts(g.k, m);
      });
      var nk = Object.keys(A.k).length, ni = Object.keys(A.ins).length, nj = Object.keys(A.j).length;
      document.getElementById("ppK").innerHTML =
        "<div class='kpi'><span class='no'>K-1</span><span class='lbl'>Orang</span><b>" + fmt(A.n) + "</b><small>" + A.bes + " mitra bestari · " + A.ed + " editor</small></div>" +
        "<div class='kpi'><span class='no'>K-2</span><span class='lbl'>Negara</span><b>" + nk + "</b><small>" + (A.k.Indonesia ? nk - 1 + " di luar Indonesia" : "semua di luar Indonesia") + "</small></div>" +
        "<div class='kpi'><span class='no'>K-3</span><span class='lbl'>Institusi</span><b>" + fmt(ni) + "</b><small>asal mitra bestari & editor</small></div>" +
        "<div class='kpi'><span class='no'>K-4</span><span class='lbl'>Internasional</span><b>" + (A.n ? Math.round(100 * (A.n - (A.k.Indonesia || 0)) / A.n) : 0) + "%</b><small>dari " + nj + " jurnal UNMER</small></div>";
      /* peta: titik negara */
      Object.keys(nodes).forEach(function (k) {
        var nd = nodes[k], v = A.k[k] || 0, g = GEO[k] || { n: 1 };
        nd.c.setAttribute("r", v ? Math.max(4, nd.r0 * Math.sqrt(v / (g.n || 1))) : nd.r0);
        nd.c.style.opacity = v ? 1 : 0.12; nd.c.style.pointerEvents = v ? "" : "none";
        if (nd.t) { nd.t.style.opacity = v ? 1 : 0.15; var c = nd.t.querySelector(".c"); if (c) c.textContent = v; }
        if (nd.a) nd.a.style.opacity = v ? 1 : 0.06;
      });
      /* gelembung cluster */
      svg.classList.toggle("ppc", st.m === "c");
      clu.innerHTML = "";
      if (st.m === "c") {
        var s = "";
        RK.forEach(function (rk) {
          var v = 0, wx = 0, wy = 0, w = 0;
          REG[rk].c.forEach(function (k) { var nd = nodes[k]; if (!nd) return; var g = (GEO[k] || {}).n || 1; wx += nd.x * g; wy += nd.y * g; w += g; v += A.k[k] || 0; });
          if (!w || !v) return;
          var x = wx / w, y = wy / w, r = 9 + 2.1 * Math.sqrt(v);
          if (hub && rk !== "id") s += "<path d='M " + hub.x + " " + hub.y + " Q " + ((hub.x + x) / 2) + " " + (Math.min(hub.y, y) - 60) + " " + x + " " + y + "'/>";
          s += "<circle data-r='" + rk + "' cx='" + x.toFixed(1) + "' cy='" + y.toFixed(1) + "' r='" + r.toFixed(1) + "'><title>" + esc(REG[rk].l) + ": " + v + " orang</title></circle>";
          s += "<text data-r='" + rk + "' x='" + (x + r + 5).toFixed(1) + "' y='" + (y + 4).toFixed(1) + "'>" + esc(REG[rk].s || REG[rk].l) + " " + v + "</text>";
        });
        clu.innerHTML = s;
      }
      /* peringkat */
      var items;
      if (rmode === "n") items = Object.keys(A.k).map(function (k) { return { k: k, l: k, v: A.k[k], d: tagsOf(k).slice(0, 2).join(" · ") }; });
      else items = RK.map(function (rk) { var v = 0; REG[rk].c.forEach(function (k) { v += A.k[k] || 0; }); return { k: "r:" + rk, l: REG[rk].l, v: v, d: REG[rk].c.filter(function (k) { return A.k[k]; }).length + " negara" }; }).filter(function (x) { return x.v; });
      items.sort(function (a, b) { return b.v - a.v; });
      var mx = items.length ? items[0].v : 1;
      document.getElementById("ppR").innerHTML = items.length ? "<div class='scroll'>" + items.map(function (it, i) {
        return "<button type='button' class='rk' data-k='" + esc(it.k) + "' style='grid-template-columns:28px 130px minmax(0,1fr) 46px'><span class='n'>" + String(i + 1).padStart(2, "0") + "</span><span class='a'>" + esc(it.l) + "<small>" + esc(it.d) + "</small></span><div class='sb' style='width:" + Math.max(2, 100 * it.v / mx) + "%'><i style='width:100%;background:var(--q1)'></i></div><span class='v'>" + it.v + "</span></button>";
      }).join("") + "</div>" : "<p class='note'>Tidak ada data untuk filter ini.</p>";
      /* matriks wilayah × SINTA */
      var SC = [["12", "S1–2"], ["3", "S3"], ["4", "S4"], ["56", "S5–6"], ["0", "Belum"]];
      var rowsW = ROWS.filter(function (r) { return pass(r, "s"); });
      var M = {}, mxM = 1; rowsW.forEach(function (r) { var rk = regOf(r.k); M[rk] = M[rk] || {}; M[rk][r.s] = (M[rk][r.s] || 0) + 1; mxM = Math.max(mxM, M[rk][r.s]); });
      document.getElementById("ppX").innerHTML = "<table><thead><tr><th>Wilayah</th>" + SC.map(function (c) { return "<th style='text-align:right'>" + c[1] + "</th>"; }).join("") + "<th style='text-align:right'>Total</th></tr></thead><tbody>" +
        RK.filter(function (rk) { return M[rk]; }).map(function (rk) {
          var t = 0; return "<tr><td>" + esc(REG[rk].l) + "</td>" + SC.map(function (c) { var v = M[rk][c[0]] || 0; t += v; var a = v ? 0.12 + 0.8 * v / mxM : 0; return "<td class='r' style='background:rgba(122,30,51," + a.toFixed(2) + ");color:" + (a > 0.5 ? "#fff" : "#141017") + "'>" + (v || "·") + "</td>"; }).join("") + "<td class='r'><b>" + t + "</b></td></tr>";
        }).join("") + "</tbody></table>";
      if (cur) sheet(cur, true);
    };

    /* ---------- panel info (bottom sheet) ---------- */
    var sheet = function (key, quiet) {
      cur = key;
      var isR = key.indexOf("r:") === 0, rk = isR ? key.slice(2) : regOf(key);
      var rows = ROWS.filter(function (r) { return pass(r, "w") && (isR ? REG[rk].c.indexOf(r.k) >= 0 : r.k === key); });
      var A = agg(rows), name = isR ? REG[rk].l : key;
      svg.querySelectorAll(".geo-node.ppsel").forEach(function (c) { c.classList.remove("ppsel"); });
      if (!isR && nodes[key]) nodes[key].c.classList.add("ppsel");
      document.getElementById("ppSt").textContent = name;
      var tags = isR ? [CL[rk] ? "Cluster" : "Wilayah", REG[rk].c.filter(function (k) { return A.k[k]; }).length + " negara"] : tagsOf(key);
      var top = function (o, n) { return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).slice(0, n); };
      var jl = top(A.j, 12), il = top(A.ins, 8), mj = jl.length ? A.j[jl[0]] : 1;
      document.getElementById("ppS").innerHTML =
        "<div class='lbl' style='margin-bottom:10px'>" + tags.map(esc).join(" · ") + "</div>" +
        (!A.n ? "<p class='note'>Tidak ada orang dari " + esc(name) + " untuk filter peran/SINTA/tahun yang dipilih.</p>" :
        "<div class='kpis'><div class='kpi'><span class='lbl'>Orang</span><b>" + A.n + "</b></div><div class='kpi'><span class='lbl'>Institusi</span><b>" + Object.keys(A.ins).length + "</b></div><div class='kpi'><span class='lbl'>Mitra bestari</span><b>" + A.bes + "</b></div><div class='kpi'><span class='lbl'>Dewan editor</span><b>" + A.ed + "</b></div><div class='kpi'><span class='lbl'>Jurnal UNMER</span><b>" + Object.keys(A.j).length + "</b></div></div>" +
        "<div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px'>" +
        "<div><span class='lbl'>Jurnal UNMER yang dilayani</span>" + jl.map(function (j) { var ja = JA[j] || {}; return "<div style='display:grid;grid-template-columns:110px minmax(0,1fr) 30px;gap:8px;align-items:center;margin:5px 0;font-size:13px'><b>" + esc(j) + "</b><div class='sb' style='width:" + (100 * A.j[j] / mj) + "%'><i style='width:100%;background:var(--q2)'></i></div><span style='text-align:right'>" + A.j[j] + "</span></div>"; }).join("") + "</div>" +
        "<div><span class='lbl'>Institusi teratas</span><table style='margin-top:4px'><tbody>" + il.map(function (i) { return "<tr><td>" + esc(i) + "</td><td class='r'>" + A.ins[i] + "</td></tr>"; }).join("") + "</tbody></table>" + (Object.keys(A.ins).length > 8 ? "<p class='note'>+" + (Object.keys(A.ins).length - 8) + " institusi lainnya</p>" : "") + "</div></div>") +
        "<div style='margin-top:12px;display:flex;gap:8px;flex-wrap:wrap'>" + (!isR ? "<button type='button' class='btn' id='ppGo'>Buka daftar institusi " + esc(name) + " →</button>" : "") +
        (isR && CL[rk] ? "<button type='button' class='btn ghost' id='ppFl'>Saring peta ke " + esc(REG[rk].l) + "</button>" : "") + "</div>";
      document.getElementById("ppSh").hidden = false;
      var go = document.getElementById("ppGo");
      if (go) go.onclick = function () {
        var a = document.createElement("button"); a.type = "button"; a.hidden = true; a.setAttribute("data-go", "afiliasi"); a.setAttribute("data-set", JSON.stringify({ ak: key, aq: "", at: "" }));
        document.querySelector("main").appendChild(a); a.click(); a.remove();
      };
      var fl = document.getElementById("ppFl");
      if (fl) fl.onclick = function () { st.w = rk; st.m = "n"; SG.paint(); update(); };
      if (!quiet) document.getElementById("ppSh").scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    document.getElementById("ppSx").onclick = function () { cur = null; document.getElementById("ppSh").hidden = true; svg.querySelectorAll(".geo-node.ppsel").forEach(function (c) { c.classList.remove("ppsel"); }); };

    /* klik bulatan/label → panel info (seret peta tetap jalan) */
    var down = null;
    svg.addEventListener("pointerdown", function (e) { down = [e.clientX, e.clientY]; }, true);
    svg.addEventListener("click", function (e) {
      var moved = down && Math.abs(e.clientX - down[0]) + Math.abs(e.clientY - down[1]) > 6;
      var el = e.target.closest("circle.geo-node,text.geo-lbl,#ppClu circle,#ppClu text"); if (!el) return;
      e.preventDefault(); e.stopPropagation(); if (moved) return;
      var r = el.getAttribute("data-r");
      sheet(r ? "r:" + r : setK(el));
    }, true);
    document.getElementById("ppR").addEventListener("click", function (e) { var b = e.target.closest(".rk"); if (b) sheet(b.dataset.k); });
    var gh = wrap.querySelector(".geohead");
    if (gh) { var tip = gh.querySelector("span,small,.mono"); }
    var ctlHint = wrap.querySelector(".geoctl");
    if (ctlHint) ctlHint.insertAdjacentHTML("beforeend", "<span class='lbl' style='margin-left:8px;font-size:10px'>klik bulatan → panel info di bawah peta</span>");
    update();
  };
  boot(0);
})();
