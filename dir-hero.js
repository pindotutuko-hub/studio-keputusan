/* Direktori Jurnal UNMER — foto latar kepala halaman, berganti setiap 5 detik (crossfade).
   Tiap foto ada di berkas dir-hero-NN.js (dimuat bertahap agar halaman tetap cepat). */
(function () {
  "use strict";
  var N = ["Air", "Bambu", "Bangku bundar", "Bangku", "Buku kanji", "Droplets", "Es", "Gorden", "Jam", "Kacamata", "Kursi konser", "Kursi", "Lampu bar", "Lampu refleksi", "Meja kantin", "Minuman", "Patung", "Pensil", "Strawberi", "Sumpit", "Tonggak", "Umbul-umbul"], V = "1";
  var run = function () {
    var m = document.querySelector("header.mast");
    if (!m || document.getElementById("ptHeroBg")) return;
    var st = document.createElement("style");
    st.textContent = "header.mast{position:relative;overflow:hidden;isolation:isolate}" +
      "#ptHeroBg{position:absolute;inset:0;z-index:-1;pointer-events:none;background:#F5F1F2}" +
      "#ptHeroBg .ly{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.6s ease;transform:scale(1.02)}#ptHeroBg .ly.on{opacity:1}" +
      "#ptHeroBg::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.93) 0%,rgba(255,255,255,.86) 42%,rgba(255,255,255,.55) 70%,rgba(255,255,255,.25) 100%),linear-gradient(0deg,rgba(251,242,244,.95) 0,rgba(251,242,244,0) 70px)}" +
      "header.mast{background:transparent!important}" +
      "#ptHeroCap{position:absolute;right:20px;top:14px;z-index:2;font-family:'JetBrains Mono','IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#141017;background:rgba(255,255,255,.8);border:1.5px solid #141017;padding:3px 8px}" +
      "@media (max-width:820px){#ptHeroBg::after{background:linear-gradient(0deg,rgba(255,255,255,.9),rgba(255,255,255,.8))}}" +
      "@media (prefers-reduced-motion:reduce){#ptHeroBg .ly{transition:none}}";
    document.head.appendChild(st);
    var bg = document.createElement("div"); bg.id = "ptHeroBg"; bg.setAttribute("aria-hidden", "true");
    bg.innerHTML = "<div class='ly'></div><div class='ly'></div>";
    m.insertBefore(bg, m.firstChild);
    var cap = document.createElement("div"); cap.id = "ptHeroCap"; m.appendChild(cap);
    var L = bg.querySelectorAll(".ly"), cur = 0, k = -1, box = window.PT_HERO_IMG = window.PT_HERO_IMG || {};
    var load = function (i, cb) {
      if (box[i]) { cb && cb(); return; }
      var s = document.createElement("script"); s.src = "dir-hero-" + String(i).padStart(2, "0") + ".js?v=" + V; s.async = true;
      s.onload = function () { cb && cb(); }; document.head.appendChild(s);
    };
    var show = function (n) {
      var i = n + 1;
      load(i, function () {
        var nx = L[1 - cur]; nx.style.backgroundImage = "url(" + box[i] + ")";
        requestAnimationFrame(function () { nx.classList.add("on"); L[cur].classList.remove("on"); cur = 1 - cur; });
        k = n; cap.textContent = N[n] + " · " + String(n + 1).padStart(2, "0") + "/" + String(N.length).padStart(2, "0");
        load(((n + 1) % N.length) + 1);
      });
    };
    show(0);
    setInterval(function () { if (!document.hidden && k >= 0) show((k + 1) % N.length); }, 5000);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
