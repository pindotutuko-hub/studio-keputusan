/* Direktori Jurnal UNMER — gaya "Dasbor beton" (mengacu pindotutuko.id: Big Shoulders Display, JetBrains Mono, Space Grotesk, bingkai tegas). Dipakai dir-cite.js dan dir-peta.js. */
(function () {
  "use strict";
  if (window.PT_BETON) return;
  var F = "/wp-content/themes/pindotutuko/assets/fonts/beton/";
  var css = document.createElement("style");
  css.id = "ptBeton";
  css.textContent =
    "@font-face{font-family:'Big Shoulders Display';font-weight:100 900;font-display:swap;src:url(" + F + "big-shoulders-display-latin.woff2) format('woff2')}" +
    "@font-face{font-family:'JetBrains Mono';font-weight:100 800;font-display:swap;src:url(" + F + "jetbrains-mono-latin.woff2) format('woff2')}" +
    "@font-face{font-family:'Space Grotesk';font-weight:300 700;font-display:swap;src:url(" + F + "space-grotesk-latin.woff2) format('woff2')}" +
    ".bt{--bk:#141017;--q1:#7A1E33;--q2:#B23A55;--q3:#D7A1AE;--q4:#EBD3D9;--q0:#CFC6CA;font-family:'Space Grotesk',system-ui,sans-serif;color:var(--bk)}" +
    ".bt .lbl{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#47404C}" +
    ".bt .disp{font-family:'Big Shoulders Display','Arial Narrow',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-.01em;line-height:.9}" +
    ".bt .ttl{font-size:clamp(40px,6vw,72px);margin:4px 0 0}.bt .ttl .ol{color:transparent;-webkit-text-stroke:1.5px var(--bk)}" +
    ".bt .lead{font-size:15px;line-height:1.6;max-width:62ch;color:#2B2530}" +
    ".bt .dash{display:grid;grid-template-columns:230px minmax(0,1fr);gap:0;border:2px solid var(--bk);background:#fff;margin:18px 0}" +
    ".bt .side{border-right:2px solid var(--bk);padding:16px 14px;background:#FAF6F7;position:relative}" +
    ".bt .side .sticky{position:sticky;top:12px}" +
    ".bt .fg{margin:0 0 16px}.bt .fg .lbl{display:block;margin-bottom:6px}" +
    ".bt .seg{display:flex;flex-wrap:wrap;gap:4px}" +
    ".bt .seg button{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;padding:6px 8px;border:1.5px solid var(--bk);background:#fff;color:var(--bk);cursor:pointer;border-radius:0;line-height:1.2}" +
    ".bt .seg button:hover{background:#F3E8EB}.bt .seg button.on{background:var(--bk);color:#fff}" +
    ".bt .seg button .c{opacity:.7;margin-left:4px}" +
    ".bt .reset{margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:11px;background:none;border:0;color:var(--q1);text-decoration:underline;cursor:pointer;padding:0}" +
    ".bt .body{padding:16px 18px;min-width:0}" +
    ".bt .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));border:2px solid var(--bk);margin-bottom:16px}" +
    ".bt .kpi{padding:12px 14px;border-right:1.5px solid var(--bk);background:#fff;position:relative}.bt .kpi:last-child{border-right:0}" +
    ".bt .kpi b{display:block;font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:42px;line-height:1;margin:6px 0 2px}" +
    ".bt .kpi small{font-size:12px;color:#47404C}.bt .kpi .no{position:absolute;top:8px;right:10px;font-family:'JetBrains Mono',monospace;font-size:10px;border:1.5px solid var(--bk);padding:0 4px}" +
    ".bt .blk{border:2px solid var(--bk);margin:0 0 16px;background:#fff}.bt .blk>.hd{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;border-bottom:1.5px solid var(--bk);background:#FAF6F7}" +
    ".bt .blk>.hd h3{margin:0;font-family:'Big Shoulders Display',sans-serif;font-weight:800;font-size:22px;text-transform:uppercase;letter-spacing:.01em}" +
    ".bt .blk>.in{padding:12px 14px}" +
    ".bt .rk{display:grid;grid-template-columns:28px 120px minmax(0,1fr) 56px;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px dashed #D9CFD3;cursor:pointer;background:none;border-left:0;border-right:0;border-top:0;width:100%;text-align:left;font:inherit;color:inherit}" +
    ".bt .rk:hover{background:#FBF2F4}.bt .rk.sel{background:#F3E1E6;box-shadow:inset 4px 0 0 var(--q1)}" +
    ".bt .rk .n{font-family:'JetBrains Mono',monospace;font-size:11px;color:#47404C}.bt .rk .a{font-weight:700;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".bt .rk .a small{display:block;font-weight:400;font-size:11px;color:#47404C;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".bt .rk .v{font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:24px;text-align:right}" +
    ".bt .sb{display:flex;height:14px;background:#F1EAEC;min-width:0}.bt .sb i{display:block;height:100%}" +
    ".bt .lg{display:flex;flex-wrap:wrap;gap:10px;font-size:12px}.bt .lg span{display:inline-flex;align-items:center;gap:5px}.bt .lg i{width:12px;height:12px;display:inline-block;border:1px solid var(--bk)}" +
    ".bt table{border-collapse:collapse;width:100%;font-size:13px}.bt th{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;text-align:left;padding:7px 8px;border-bottom:2px solid var(--bk);color:#47404C;background:#FAF6F7}" +
    ".bt td{padding:7px 8px;border-bottom:1px solid #E6DDE1;vertical-align:top}.bt td.r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.bt td a{color:var(--q1)}" +
    ".bt .q{display:inline-block;min-width:26px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;padding:1px 4px;border:1.5px solid var(--bk)}" +
    ".bt .q.Q1{background:var(--q1);color:#fff;border-color:var(--q1)}.bt .q.Q2{background:var(--q2);color:#fff;border-color:var(--q2)}.bt .q.Q3{background:var(--q3)}.bt .q.Q4{background:var(--q4)}" +
    ".bt .note{font-size:12.5px;line-height:1.6;color:#3A333F}.bt .note b{color:var(--bk)}" +
    ".bt .x{font-family:'JetBrains Mono',monospace;font-size:12px;border:1.5px solid var(--bk);background:#fff;padding:4px 10px;cursor:pointer;color:var(--bk)}.bt .x:hover{background:var(--bk);color:#fff}" +
    ".bt .btn{font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;border:1.5px solid var(--bk);background:var(--bk);color:#fff;padding:7px 12px;cursor:pointer}.bt .btn.ghost{background:#fff;color:var(--bk)}" +
    ".bt svg text{font-family:'JetBrains Mono',monospace;font-size:10px;fill:#47404C}" +
    ".bt tr:hover td{background:#FBF2F4}.bt .scroll{max-height:420px;overflow:auto}" +
    "@media (max-width:900px){.bt .dash{grid-template-columns:1fr}.bt .side{border-right:0;border-bottom:2px solid var(--bk)}.bt .side .sticky{position:static}.bt .rk{grid-template-columns:22px 90px minmax(0,1fr) 44px}}";
  document.head.appendChild(css);
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var fmt = function (n) { return Number(n || 0).toLocaleString("id-ID"); };
  /* Segmented filter: groups = [{k, l, opts:[[val,label]], multi}] ; state object mutated; onChange() */
  var seg = function (host, groups, st, onChange) {
    host.innerHTML = groups.map(function (g) {
      return "<div class='fg' data-g='" + g.k + "'><span class='lbl'>" + esc(g.l) + "</span><div class='seg'>" +
        g.opts.map(function (o) { return "<button type='button' data-v='" + esc(o[0]) + "'>" + esc(o[1]) + "<span class='c'></span></button>"; }).join("") + "</div></div>";
    }).join("") + "<button type='button' class='reset'>Atur ulang filter</button>";
    var paint = function () {
      groups.forEach(function (g) {
        host.querySelectorAll("[data-g='" + g.k + "'] button").forEach(function (b) {
          var v = b.dataset.v, on = g.multi ? (st[g.k].length ? st[g.k].indexOf(v) >= 0 : v === "*") : st[g.k] === v;
          b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
        });
      });
    };
    host.addEventListener("click", function (e) {
      if (e.target.closest(".reset")) { groups.forEach(function (g) { st[g.k] = g.multi ? [] : "*"; }); paint(); onChange(); return; }
      var b = e.target.closest("button[data-v]"); if (!b) return;
      var g = groups.filter(function (x) { return x.k === b.closest(".fg").dataset.g; })[0], v = b.dataset.v;
      if (g.multi) {
        if (v === "*") st[g.k] = [];
        else { var i = st[g.k].indexOf(v); if (i >= 0) st[g.k].splice(i, 1); else st[g.k].push(v); }
      } else st[g.k] = v;
      paint(); onChange();
    });
    paint();
    return { paint: paint, counts: function (k, map) { host.querySelectorAll("[data-g='" + k + "'] button").forEach(function (b) { var c = b.querySelector(".c"); if (c) c.textContent = map[b.dataset.v] == null ? "" : map[b.dataset.v]; }); } };
  };
  window.PT_BETON = { esc: esc, fmt: fmt, seg: seg };
})();
