/* Direktori Jurnal UNMER — lapisan Aplikasi Khusus: perubahan tersimpan di server + cek pembaruan dari OJS. */
(function () {
  "use strict";
  var CFG = window.PT_JR || {}, OVR = window.PT_DIR_OVR || { j: {}, log: [] };
  var NORM = function (s) {
    return String(s || "").toLowerCase()
      .replace(/\([^)]*\)/g, " ")
      .replace(/\b(prof|dr|drs|dra|ir|h|hj|st|mt|ms|msc|m\.sc|phd|ph\.d|se|mm|msi|m\.si|mpd|m\.pd|spd|s\.pd|sh|mh|m\.h|ssos|msos|ak|ca|cpa|ma|mba|mse|meng|m\.eng|beng|bsc|ba|mt|ts|sp|psi|m\.psi|skom|mkom|m\.kom|st\.|assoc|asst|associate|assistant|professor|lecturer)\b\.?/g, " ")
      .replace(/[^a-zÀ-ɏ ]+/g, " ").replace(/\s+/g, " ").trim();
  };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var NEGARA = ["Indonesia", "Malaysia", "Australia", "Thailand", "Philippines", "Filipina", "Vietnam", "Japan", "Jepang", "China", "Tiongkok", "Taiwan", "Korea", "India", "Pakistan", "Bangladesh", "Turkey", "Turki", "Iran", "Iraq", "Saudi Arabia", "Nigeria", "Ethiopia", "Etiopia", "Portugal", "Spain", "Spanyol", "Italy", "Italia", "Germany", "Jerman", "Netherlands", "Belanda", "United Kingdom", "Inggris", "UK", "USA", "United States", "Amerika Serikat", "Canada", "Kanada", "New Zealand", "Selandia Baru", "Cambodia", "Kamboja", "Timor-Leste", "Brunei", "Singapore", "Singapura", "Qatar", "Oman", "Poland", "Polandia", "Egypt", "Mesir", "Ghana", "Kenya", "South Africa"];
  var ID_MAP = { Philippines: "Filipina", Japan: "Jepang", China: "Tiongkok", Turkey: "Turki", Ethiopia: "Etiopia", Spain: "Spanyol", Italy: "Italia", Germany: "Jerman", Netherlands: "Belanda", "United Kingdom": "Inggris", UK: "Inggris", USA: "Amerika Serikat", "United States": "Amerika Serikat", Canada: "Kanada", "New Zealand": "Selandia Baru", Cambodia: "Kamboja", Singapore: "Singapura", Poland: "Polandia", Egypt: "Mesir" };
  var negaraDari = function (t) {
    for (var i = 0; i < NEGARA.length; i++) { var n = NEGARA[i]; if (new RegExp("\\b" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(t)) return ID_MAP[n] || n; }
    return /\b(universitas|institut|politeknik|sekolah tinggi|stie|stikes|uin|iain)\b/i.test(t) ? "Indonesia" : "";
  };

  /* 1. Terapkan perubahan tersimpan ke DATA sebelum aplikasi Direktori merender. */
  window.PT_DIR_APPLY = function (D) {
    try {
      var J = OVR.j || {};
      (D.jur || []).forEach(function (j) {
        var o = J[j.id]; if (!o) return;
        var del = (o.delRev || []).map(NORM);
        j.reviewers = (j.reviewers || []).filter(function (r) { return del.indexOf(NORM(r.n)) < 0; });
        (o.addRev || []).forEach(function (p) { j.reviewers.push({ n: p.n, a: p.a || "", inst: (p.a || "").split(",").slice(-2, -1)[0] || p.a || "", k: p.k || "", s: "", ojs: 1 }); });
      });
      if (Array.isArray(D.editor)) {
        Object.keys(J).forEach(function (id) {
          var o = J[id], del = (o.delEd || []).map(NORM), jj = (D.jur || []).filter(function (x) { return x.id === id; })[0];
          D.editor = D.editor.filter(function (e) { return !(e.kode === id && del.indexOf(NORM(e.n)) >= 0); });
          (o.addEd || []).forEach(function (p) { D.editor.push({ n: p.n, p: p.p || "Editorial Board", a: p.a || "", k: p.k || "", s: "", jur: jj ? jj.akronim : id.toUpperCase(), kode: id, inst: p.a || "", ojs: 1 }); });
        });
      }
    } catch (e) { console.warn("PT_DIR_APPLY", e); }
    window.PT_DIR = D;
    return D;
  };

  /* 2. Panel "Pembaruan dari OJS" */
  var css = "#ptjBtn{position:fixed;right:18px;bottom:18px;z-index:9998;background:#c4572a;color:#fff;border:0;border-radius:999px;padding:11px 18px;font:600 14px system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.25);cursor:pointer}" +
    "#ptjBar{position:sticky;top:0;z-index:9997;background:#161412;color:#f3ede0;font:13px system-ui,sans-serif;padding:6px 14px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}#ptjBar a{color:#f3ede0}#ptjBar b{letter-spacing:.04em}" +
    "#ptjM{position:fixed;inset:0;z-index:9999;background:rgba(17,15,12,.6);display:grid;place-items:center;padding:16px}#ptjM .bx{background:#fffdf8;color:#1d1b17;max-width:980px;width:100%;max-height:92vh;overflow:auto;border-radius:12px;padding:20px 22px;font:14px/1.5 system-ui,sans-serif}" +
    "#ptjM h3{margin:0 0 6px;font:600 20px Georgia,serif}#ptjM .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0}#ptjM button{border:1px solid #c9bda9;background:#fff;border-radius:8px;padding:6px 12px;cursor:pointer;font:inherit}#ptjM button.p{background:#c4572a;border-color:#c4572a;color:#fff}" +
    "#ptjM select{padding:6px;border-radius:8px;border:1px solid #c9bda9}#ptjM .j{border:1px solid #e3d9c8;border-radius:10px;padding:10px 12px;margin:10px 0}#ptjM .j h4{margin:0 0 4px;font-size:15px}#ptjM .ok{color:#2f7d4a}#ptjM .warn{color:#b0451c}#ptjM .mut{color:#7a705f;font-size:12.5px}" +
    "#ptjM label{display:block;padding:2px 0}#ptjM .cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:720px){#ptjM .cols{grid-template-columns:1fr}}#ptjM .prog{height:6px;background:#eee4d4;border-radius:4px;overflow:hidden}#ptjM .prog i{display:block;height:100%;background:#c4572a;width:0}";
  var TITLE_RE = /\b(prof|dr|ph\.?d|m\.?sc|m\.?t|m\.?m|m\.?si|m\.?pd|m\.?eng|m\.?kom|s\.?e|s\.?t|s\.?h|m\.?h|mba|assoc|associate professor|lecturer)\b\.?/i;
  var INST_RE = /\b(universit\w*|institut\w*|polytechnic|politeknik|department|departemen|faculty|fakultas|program|programme|study|studies|school|sekolah|college|association|asosiasi|himpunan|masyarakat|ikatan|law|hukum|engineering|teknik|center|centre|road|indonesia|indonesian|malaysia|international|editor|editorial|board|journal|jurnal|ministry|kementerian|research|penelitian|management|manajemen|science|sciences|economics|ekonomi|state|negeri|criminal|human|rights)\b/i;
  var HEAD_RE = /^(editor|editorial|chief|managing|section|associate|advisory|peer|reviewer|mitra|dewan|penyunting|ketua|redaksi|layout|copy|proof|international|board|honorary|journal manager|assistant)/i;
  function candidates(lines, known, withRole) {
    var out = [], role = "", kn = known.map(NORM);
    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i];
      if (ln.length < 70 && HEAD_RE.test(ln) && ln.indexOf(",") < 0) { role = ln.replace(/:$/, ""); continue; }
      if (!TITLE_RE.test(ln) && !/,/.test(ln)) continue;
      if (/merdeka malang|unmer/i.test(ln + " " + (lines[i + 1] || ""))) continue;
      if (/scopus|sinta|google scholar|orcid|publons|copyright|issn|http/i.test(ln) && !TITLE_RE.test(ln)) continue;
      var nm = ln.split(/[,(|–—]/)[0].trim(), core = NORM(nm);
      if (core.split(" ").length < 2 || core.length < 5 || core.split(" ").length > 7) continue;
      if (INST_RE.test(nm.replace(TITLE_RE, ""))) continue;
      if (!TITLE_RE.test(nm) && !/^([A-Z][\w'’.-]*\s+){1,5}[A-Z][\w'’.-]*$/u.test(nm)) continue;
      if (kn.some(function (k) { return k && (k.indexOf(core) >= 0 || core.indexOf(k) >= 0); })) continue;
      var aff = ln.indexOf(",") > 0 ? ln.slice(ln.indexOf(",") + 1).trim() : (lines[i + 1] && !TITLE_RE.test(lines[i + 1]) ? lines[i + 1] : "");
      if (out.some(function (o) { return NORM(o.n) === core; })) continue;
      out.push({ n: nm, a: aff, k: negaraDari(ln + " " + aff), p: withRole ? role : "" });
    }
    return out;
  }
  function api(ep, body) {
    return fetch(CFG.api + ep, { method: body ? "POST" : "GET", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-WP-Nonce": CFG.nonce || "" }, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || ("HTTP " + r.status)); return j; }); });
  }
  function check(j) {
    var pre = window.PT_DIR_PAGES && window.PT_DIR_PAGES[j.id];
    return (pre ? Promise.resolve(pre) : api("check?j=" + encodeURIComponent(j.id), {})).then(function (res) {
      var D = window.PT_DIR, txt = function (k) { var p = res.pages[k]; return p ? NORM(p.lines.join(" \n ")) : ""; };
      var rev = j.reviewers || [], ed = (D.editor || []).filter(function (e) { return e.kode === j.id; });
      var tRev = txt("rev"), tEd = txt("ed"), tAll = tRev + " " + tEd;
      var gone = function (list, t) { return t ? list.filter(function (p) { var c = NORM(p.n); return c && t.indexOf(c) < 0; }) : []; };
      var known = rev.map(function (r) { return r.n; }).concat(ed.map(function (e) { return e.n; }));
      return {
        j: j, res: res,
        revGone: gone(rev, tAll), edGone: gone(ed, tAll),
        revNew: res.pages.rev && res.pages.rev.code === 200 ? candidates(res.pages.rev.lines, known, false) : [],
        edNew: res.pages.ed && res.pages.ed.code === 200 ? candidates(res.pages.ed.lines, known, true) : []
      };
    });
  }
  function box(r, k) {
    var h = "";
    var list = function (arr, key, lab, cls, fmt) {
      if (!arr.length) return "<div class='mut'>" + lab + ": tidak ada.</div>";
      return "<div><b class='" + cls + "'>" + lab + " (" + arr.length + ")</b>" + arr.map(function (p, i) { return "<label><input type='checkbox' data-k='" + key + "' data-i='" + i + "'> " + fmt(p) + "</label>"; }).join("") + "</div>";
    };
    var pg = function (key, lab) { var p = r.res.pages[key]; return p ? "<a href='" + esc(p.url) + "' target='_blank' rel='noopener'>" + lab + "</a> " + (p.code === 200 ? "<span class='ok'>✓</span>" : "<span class='warn'>HTTP " + p.code + "</span>") : ""; };
    h += "<div class='j' data-j='" + esc(r.j.id) + "' data-x='" + k + "'><h4>" + esc(r.j.akronim || r.j.id) + " <span class='mut'>" + esc(r.j.nama || "") + "</span></h4><div class='mut'>Laman diperiksa: " + pg("rev", "mitra bestari") + " · " + pg("ed", "dewan editor") + "</div><div class='cols'>" +
      "<div>" + list(r.revNew, "revNew", "Mitra bestari baru di OJS", "ok", function (p) { return esc(p.n) + " <span class='mut'>" + esc(p.a) + (p.k ? " · " + esc(p.k) : "") + "</span>"; }) +
      list(r.revGone, "revGone", "Mitra bestari tidak ditemukan lagi", "warn", function (p) { return esc(p.n) + " <span class='mut'>" + esc(p.a || "") + "</span>"; }) + "</div>" +
      "<div>" + list(r.edNew, "edNew", "Dewan editor eksternal baru", "ok", function (p) { return esc(p.n) + " <span class='mut'>" + esc(p.p ? p.p + " · " : "") + esc(p.a) + "</span>"; }) +
      list(r.edGone, "edGone", "Dewan editor tidak ditemukan lagi", "warn", function (p) { return esc(p.n) + " <span class='mut'>" + esc(p.p || "") + "</span>"; }) + "</div></div>" +
      ((OVR.j || {})[r.j.id] ? "<div class='row'><span class='mut'>Jurnal ini sudah punya perubahan tersimpan (" + esc((OVR.j[r.j.id].at || "").slice(0, 10)) + ").</span><button data-reset='" + esc(r.j.id) + "'>Kembalikan ke cuplikan awal</button></div>" : "") + "</div>";
    return h;
  }
  function open() {
    var D = window.PT_DIR || { jur: [] }, results = [];
    var m = document.createElement("div"); m.id = "ptjM";
    var opts = D.jur.map(function (j) { return "<option value='" + esc(j.id) + "'>" + esc(j.akronim || j.id) + " — " + esc(j.nama) + "</option>"; }).join("");
    var lg = (OVR.log || []).slice(-8).reverse().map(function (l) { return "<li>" + esc(l.at.slice(0, 16).replace("T", " ")) + " · " + esc(l.j) + " · " + esc(l.u) + (l.reset ? " · dikembalikan" : " · +" + (l.n[0] + l.n[2]) + " / −" + (l.n[1] + l.n[3])) + "</li>"; }).join("");
    m.innerHTML = "<div class='bx'><div class='row' style='justify-content:space-between;margin:0'><h3>Pembaruan dari OJS</h3><button data-x>✕ Tutup</button></div>" +
      "<p class='mut' style='margin:0'>Membandingkan data Direktori dengan laman mitra bestari dan dewan editor di jurnal.unmer.ac.id. Centang perubahan yang benar, lalu simpan. Perubahan tersimpan di server dan langsung terlihat oleh semua pengguna Aplikasi Khusus. Nama baru perlu dilengkapi afiliasi/negaranya bila belum terbaca.</p>" +
      "<div class='row'><select id='ptjSel'><option value='*'>Semua jurnal (" + D.jur.length + ")</option>" + opts + "</select><button class='p' id='ptjGo'>⟳ Cek pembaruan</button><button id='ptjRe' title='Ambil ulang cuplikan dari Netlify; perubahan tersimpan tetap dipakai'>Pasang ulang dari Netlify</button></div>" +
      "<div class='prog'><i id='ptjP'></i></div><div id='ptjS' class='mut'></div><div id='ptjR'></div>" +
      "<div class='row' id='ptjSave' hidden><button class='p' id='ptjApply'>Simpan perubahan yang dicentang</button><span class='mut'>Pilih semua: <a href='#' id='ptjAll'>centang</a> · <a href='#' id='ptjNone'>kosongkan</a></span></div>" +
      (lg ? "<details><summary class='mut'>Riwayat perubahan</summary><ul class='mut'>" + lg + "</ul></details>" : "") + "</div>";
    document.body.appendChild(m);
    var $ = function (s) { return m.querySelector(s); };
    m.addEventListener("click", function (e) {
      if (e.target === m || e.target.closest("[data-x]")) m.remove();
      var rs = e.target.closest("[data-reset]");
      if (rs) { rs.disabled = true; api("apply", { j: rs.dataset.reset, reset: 1 }).then(function () { location.reload(); }).catch(function (er) { $("#ptjS").textContent = er.message; }); }
    });
    $("#ptjAll").onclick = function (e) { e.preventDefault(); m.querySelectorAll("#ptjR input").forEach(function (c) { c.checked = true; }); };
    $("#ptjNone").onclick = function (e) { e.preventDefault(); m.querySelectorAll("#ptjR input").forEach(function (c) { c.checked = false; }); };
    $("#ptjRe").onclick = function () { $("#ptjS").textContent = "Mengambil ulang dari Netlify…"; api("reinstall", {}).then(function () { location.reload(); }).catch(function (er) { $("#ptjS").textContent = er.message; }); };
    $("#ptjGo").onclick = function () {
      var v = $("#ptjSel").value, list = v === "*" ? D.jur.slice() : D.jur.filter(function (j) { return j.id === v; });
      results = []; $("#ptjR").innerHTML = ""; $("#ptjSave").hidden = true; $("#ptjGo").disabled = true;
      var i = 0, nChg = 0, fail = [];
      var next = function () {
        if (i >= list.length) {
          $("#ptjGo").disabled = false; $("#ptjP").style.width = "100%";
          $("#ptjS").innerHTML = "Selesai: " + list.length + " jurnal diperiksa, " + nChg + " jurnal dengan perbedaan" + (fail.length ? " · <span class='warn'>gagal: " + esc(fail.join(", ")) + "</span>" : "") + ". " + (nChg ? "" : "<span class='ok'>Data Direktori sudah sesuai dengan OJS.</span>");
          $("#ptjSave").hidden = !nChg; return;
        }
        var j = list[i++]; $("#ptjS").textContent = "Memeriksa " + (j.akronim || j.id) + " (" + i + "/" + list.length + ")…"; $("#ptjP").style.width = (100 * (i - 1) / list.length) + "%";
        check(j).then(function (r) {
          var n = r.revNew.length + r.revGone.length + r.edNew.length + r.edGone.length;
          if (n || list.length === 1) { results.push(r); nChg += n ? 1 : 0; $("#ptjR").insertAdjacentHTML("beforeend", box(r, results.length - 1)); }
        }).catch(function (er) { fail.push((j.akronim || j.id) + " (" + er.message + ")"); }).then(next);
      };
      next();
    };
    $("#ptjApply").onclick = function () {
      var jobs = [];
      m.querySelectorAll("#ptjR .j").forEach(function (el) {
        var r = results[+el.dataset.x], b = { j: r.j.id, addRev: [], delRev: [], addEd: [], delEd: [] }, any = false;
        el.querySelectorAll("input:checked").forEach(function (c) {
          var p = r[c.dataset.k][+c.dataset.i]; any = true;
          if (c.dataset.k === "revNew") b.addRev.push(p); else if (c.dataset.k === "edNew") b.addEd.push(p);
          else if (c.dataset.k === "revGone") b.delRev.push(p.n); else b.delEd.push(p.n);
        });
        if (any) jobs.push(b);
      });
      if (!jobs.length) { $("#ptjS").textContent = "Belum ada perubahan yang dicentang."; return; }
      $("#ptjApply").disabled = true;
      jobs.reduce(function (pr, b) { return pr.then(function () { return api("apply", b); }); }, Promise.resolve())
        .then(function () { $("#ptjS").textContent = "Tersimpan. Memuat ulang…"; setTimeout(function () { location.reload(); }, 600); })
        .catch(function (er) { $("#ptjApply").disabled = false; $("#ptjS").textContent = "Gagal menyimpan: " + er.message; });
    };
  }
  document.addEventListener("DOMContentLoaded", function () {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var bar = document.createElement("div"); bar.id = "ptjBar";
    var n = Object.keys(OVR.j || {}).length;
    bar.innerHTML = "<b>APLIKASI KHUSUS</b><a href='" + esc(CFG.home || "/khusus/") + "'>← Daftar aplikasi</a><a href='../jurnal/'>Monitor Jurnal UNMER</a>" + (n ? "<span>· " + n + " jurnal diperbarui dari OJS</span>" : "") + "<span style='margin-left:auto'>" + esc(CFG.user || "") + "</span>";
    document.body.insertBefore(bar, document.body.firstChild);
    if (CFG.update) { var b = document.createElement("button"); b.id = "ptjBtn"; b.textContent = "⟳ Pembaruan dari OJS"; b.onclick = open; document.body.appendChild(b); }
  });
})();
