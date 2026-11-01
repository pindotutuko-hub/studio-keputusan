
/* =========================================================================
 * Babat Alas — sorotan gim di Beranda, tepat di bawah bagian Aplikasi (2026-11-01).
 * ========================================================================= */
function pindotutuko_babat_feature() {
	$url   = esc_url( home_url( '/babat-alas/' ) );
	$cover = esc_url( home_url( '/babat-alas/cover.jpg' ) );
	ob_start();
	?>
<section id="babat-alas" class="ba-feat" aria-labelledby="ba-feat-title">
	<a class="ba-feat__card" href="<?php echo $url; ?>" target="_blank" rel="noopener">
		<img class="ba-feat__img" src="<?php echo $cover; ?>" alt="Babat Alas — kampung Jawa 3D dengan rumah joglo dan limasan, pendapa, langgar, sawah, sungai, dan warga yang beraktivitas" loading="lazy" decoding="async" width="1600" height="900">
		<span class="ba-feat__shade" aria-hidden="true"></span>
		<span class="ba-feat__body">
			<span class="ba-feat__tag">BARU · NEW · GIM 3D</span>
			<span id="ba-feat-title" class="ba-feat__title">Babat Alas</span>
			<span class="ba-feat__lead">Dari lahan kosong di lokasi nyata mana pun di dunia, bangun kampung/desa sampai kota — lengkap dengan perumahan, apartemen, dan fasilitas kota.</span>
			<span class="ba-feat__en" lang="en">Start on empty land anywhere on Earth and grow a kampung into a village, an estate and a city.</span>
			<span class="ba-feat__chips"><span>🌏 Lokasi nyata</span><span>🏠 11 gaya rumah</span><span>🧑🏽 Avatar 3D</span><span>🏆 Peringkat kelas</span><span>📚 Pustaka materi</span><span>🆓 Gratis</span></span>
			<span class="ba-feat__cta">Main sekarang · Play now <span aria-hidden="true">→</span></span>
		</span>
	</a>
	<div class="ba-teaser">
		<video controls preload="none" playsinline poster="<?php echo esc_url( home_url( '/babat-alas/teaser-poster.jpg' ) ); ?>" aria-label="Video teaser Babat Alas">
			<source src="<?php echo esc_url( home_url( '/babat-alas/teaser.mp4' ) ); ?>" type="video/mp4">
		</video>
		<div class="ba-teaser__txt">
			<b>▶ Tonton trailer · Watch the trailer <small>(1:01)</small></b>
			<span>Bermain dan belajar bersama: dari lahan kosong, membangun kampung, desa, sampai kota. Tokoh 3D berbusana daerah, lokasi nyata di seluruh dunia, naik level bangunan, ekonomi dan bahan baku, serta peringkat kelas.</span>
			<span class="ba-teaser__en" lang="en">Play and learn together: from empty land to a kampung, a village and a city.</span>
			<a class="ba-teaser__cta" href="<?php echo $url; ?>" target="_blank" rel="noopener">Main sekarang · Play now →</a>
		</div>
	</div>
</section>
<style>
.ba-feat{max-width:1200px;margin:28px auto 8px;padding:0 16px}
.ba-feat__card{position:relative;display:block;border-radius:22px;overflow:hidden;min-height:340px;color:#fff;text-decoration:none;box-shadow:0 22px 60px rgba(0,0,0,.28);isolation:isolate;background:#14211b}
.ba-feat__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s ease}
.ba-feat__card:hover .ba-feat__img{transform:scale(1.04)}
.ba-feat__shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,20,14,.88) 0%,rgba(10,20,14,.6) 42%,rgba(10,20,14,0) 75%)}
.ba-feat__body{position:relative;display:flex;flex-direction:column;gap:10px;max-width:560px;padding:34px 34px 30px}
.ba-feat__tag{align-self:flex-start;font:800 11px/1 system-ui,sans-serif;letter-spacing:.14em;background:#e0a526;color:#1b1206;border-radius:999px;padding:7px 11px}
.ba-feat__title{font:900 clamp(40px,6vw,72px)/.95 system-ui,sans-serif;letter-spacing:-.02em;text-shadow:0 4px 24px rgba(0,0,0,.5)}
.ba-feat__lead{font:600 17px/1.45 system-ui,sans-serif}
.ba-feat__en{font:500 14px/1.4 system-ui,sans-serif;opacity:.8}
.ba-feat__chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}
.ba-feat__chips span{font:700 12px/1 system-ui,sans-serif;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:7px 10px;backdrop-filter:blur(4px)}
.ba-feat__cta{align-self:flex-start;margin-top:8px;font:800 16px/1 system-ui,sans-serif;background:#2f8f6a;border-radius:14px;padding:15px 20px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.25),0 10px 24px rgba(47,143,106,.45);transition:transform .2s}
.ba-feat__card:hover .ba-feat__cta{transform:translateY(-2px)}
.ba-teaser{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:22px;align-items:center;margin-top:18px;background:#14211b;color:#f3efe6;border-radius:22px;padding:16px;box-shadow:0 16px 40px rgba(0,0,0,.2)}
.ba-teaser video{width:100%;aspect-ratio:16/9;border-radius:14px;background:#000;display:block}
.ba-teaser__txt{display:flex;flex-direction:column;gap:10px;font:500 15px/1.5 system-ui,sans-serif}.ba-teaser__txt b{font:800 19px/1.3 system-ui,sans-serif;color:#e0a526}.ba-teaser__txt small{color:#cfc8b8;font-weight:600}
.ba-teaser__en{opacity:.75;font-size:13.5px}.ba-teaser__cta{align-self:flex-start;color:#fff;text-decoration:none;font:800 15px/1 system-ui,sans-serif;background:#2f8f6a;border-radius:12px;padding:13px 18px}
@media (max-width:820px){.ba-teaser{grid-template-columns:minmax(0,1fr);padding:12px;gap:12px}}
@media (max-width:640px){.ba-feat__card{min-height:460px}.ba-feat__shade{background:linear-gradient(0deg,rgba(10,20,14,.92) 0%,rgba(10,20,14,.65) 55%,rgba(10,20,14,.1) 100%)}.ba-feat__body{position:absolute;bottom:0;padding:22px}.ba-feat__lead{font-size:15px}}
@media (prefers-reduced-motion:reduce){.ba-feat__img,.ba-feat__cta{transition:none}}
</style>
	<?php
	return ob_get_clean();
}
