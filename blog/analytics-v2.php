/* Halaman admin Analitik Pengunjung v2 (31-10-2026): grafik harian, rekap bulanan, negara, unduh CSV. Data: opsi pindotutuko_visitor_stats (tanpa IP). */
function pindotutuko_analytics_v2_data() {
	$s = get_option( 'pindotutuko_visitor_stats', array() );
	$s = is_array( $s ) ? $s : array();
	$days = isset( $s['days'] ) && is_array( $s['days'] ) ? $s['days'] : array();
	ksort( $days );
	$countries = isset( $s['countries'] ) && is_array( $s['countries'] ) ? $s['countries'] : array();
	arsort( $countries );
	$imp = get_option( 'pindotutuko_visitor_import_blogspot' );
	return array( 'total' => isset( $s['total'] ) ? (int) $s['total'] : 0, 'days' => array_map( 'intval', $days ), 'countries' => array_map( 'intval', $countries ), 'import' => is_array( $imp ) ? $imp : null );
}
function pindotutuko_analytics_v2_country_name( $cc ) {
	static $pins = null;
	if ( null === $pins ) {
		$pins = function_exists( 'pindotutuko_country_pins' ) ? pindotutuko_country_pins() : array();
	}
	return isset( $pins[ $cc ][2] ) ? $pins[ $cc ][2] : $cc;
}
function pindotutuko_analytics_v2_csv() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Tidak diizinkan.' );
	}
	check_admin_referer( 'pt_analytics_csv' );
	$d = pindotutuko_analytics_v2_data();
	$kind = isset( $_GET['kind'] ) && 'countries' === $_GET['kind'] ? 'countries' : 'days';
	nocache_headers();
	header( 'Content-Type: text/csv; charset=utf-8' );
	header( 'Content-Disposition: attachment; filename=pengunjung-' . $kind . '-' . gmdate( 'Ymd' ) . '.csv' );
	$out = fopen( 'php://output', 'w' );
	fwrite( $out, "\xEF\xBB\xBF" );
	if ( 'countries' === $kind ) {
		fputcsv( $out, array( 'Kode', 'Negara', 'Kunjungan' ) );
		foreach ( $d['countries'] as $cc => $n ) {
			fputcsv( $out, array( $cc, pindotutuko_analytics_v2_country_name( $cc ), $n ) );
		}
	} else {
		fputcsv( $out, array( 'Tanggal (UTC)', 'Kunjungan' ) );
		foreach ( $d['days'] as $day => $n ) {
			fputcsv( $out, array( $day, $n ) );
		}
	}
	fclose( $out );
	exit;
}
add_action( 'admin_post_pt_analytics_csv', 'pindotutuko_analytics_v2_csv' );
function pindotutuko_analytics_v2_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$d = pindotutuko_analytics_v2_data();
	$days = $d['days'];
	$today = gmdate( 'Y-m-d' );
	$sum_last = function ( $n ) use ( $days ) {
		$t = 0;
		for ( $i = 0; $i < $n; $i++ ) {
			$k = gmdate( 'Y-m-d', time() - $i * DAY_IN_SECONDS );
			$t += isset( $days[ $k ] ) ? $days[ $k ] : 0;
		}
		return $t;
	};
	$first = $days ? array_key_first( $days ) : $today;
	/* deret harian lengkap (hari tanpa kunjungan = 0) */
	$series = array();
	for ( $ts = strtotime( $first . ' 00:00:00 UTC' ); $ts <= time(); $ts += DAY_IN_SECONDS ) {
		$k = gmdate( 'Y-m-d', $ts );
		$series[ $k ] = isset( $days[ $k ] ) ? $days[ $k ] : 0;
	}
	$recorded = array_sum( $series );
	$months = array();
	foreach ( $series as $k => $v ) {
		$m = substr( $k, 0, 7 );
		$months[ $m ] = ( isset( $months[ $m ] ) ? $months[ $m ] : 0 ) + $v;
	}
	$csv = function ( $kind ) {
		return wp_nonce_url( admin_url( 'admin-post.php?action=pt_analytics_csv&kind=' . $kind ), 'pt_analytics_csv' );
	};
	$fmt = function ( $n ) {
		return number_format_i18n( (int) $n );
	};
	/* grafik SVG */
	$vals = array_values( $series );
	$keys = array_keys( $series );
	$n = count( $vals );
	$w = 980; $h = 260; $pl = 44; $pb = 28; $pt = 12;
	$max = max( 1, $vals ? max( $vals ) : 1 );
	$bw = $n ? ( $w - $pl - 8 ) / $n : 1;
	$bars = ''; $avg = ''; $labels = '';
	for ( $i = 0; $i < $n; $i++ ) {
		$x = $pl + $i * $bw;
		$bh = ( $h - $pt - $pb ) * $vals[ $i ] / $max;
		$bars .= sprintf( '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#D7A1AE"><title>%s: %s</title></rect>', $x + 0.5, $h - $pb - $bh, max( 1, $bw - 1 ), $bh, esc_attr( $keys[ $i ] ), esc_attr( $vals[ $i ] ) );
		$lo = max( 0, $i - 6 );
		$ma = array_sum( array_slice( $vals, $lo, $i - $lo + 1 ) ) / ( $i - $lo + 1 );
		$avg .= sprintf( '%s%.1f,%.1f', $i ? ' L' : 'M', $x + $bw / 2, $h - $pb - ( $h - $pt - $pb ) * $ma / $max );
		if ( '01' === substr( $keys[ $i ], 8, 2 ) || 0 === $i ) {
			$labels .= sprintf( '<text x="%.1f" y="%d" font-size="11" fill="#6B5A60">%s</text>', $x, $h - 8, esc_html( date_i18n( 'M Y', strtotime( $keys[ $i ] ) ) ) );
		}
	}
	$grid = '';
	foreach ( array( 0, 0.5, 1 ) as $g ) {
		$y = $h - $pb - ( $h - $pt - $pb ) * $g;
		$grid .= sprintf( '<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="#EBD3D9"/><text x="%d" y="%.1f" font-size="11" fill="#6B5A60" text-anchor="end">%s</text>', $pl, $w - 8, $y, $y, $pl - 6, $y + 4, esc_html( $fmt( round( $max * $g ) ) ) );
	}
	$ctot = max( 1, array_sum( $d['countries'] ) );
	?>
	<div class="wrap pt-an">
		<style>.pt-an .kp{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:14px 0}.pt-an .kp div{background:#fff;border:1px solid #EBD3D9;border-top:4px solid #7A1E33;padding:12px 14px}.pt-an .kp b{display:block;font-size:26px;line-height:1.2;color:#141017}.pt-an .kp span{color:#6B5A60;font-size:12px;text-transform:uppercase;letter-spacing:.06em}.pt-an .card2{background:#fff;border:1px solid #EBD3D9;padding:14px 16px;margin:14px 0}.pt-an table{border-collapse:collapse;width:100%}.pt-an td,.pt-an th{padding:6px 8px;border-bottom:1px solid #F5E6EA;text-align:left}.pt-an td.r,.pt-an th.r{text-align:right}.pt-an .bar{height:8px;background:#7A1E33;border-radius:2px}.pt-an .two{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px}.pt-an .note{color:#6B5A60;font-size:12px}</style>
		<h1>Analitik Pengunjung</h1>
		<p class="note">Penghitung bawaan situs: satu pengunjung dihitung sekali per hari, negara dari header server; alamat IP tidak disimpan. Tanggal memakai UTC.</p>
		<div class="kp">
			<div><span>Total kunjungan</span><b><?php echo esc_html( $fmt( $d['total'] ) ); ?></b><?php if ( $d['import'] ) : ?><small class="note">termasuk <?php echo esc_html( $fmt( $d['import']['views'] ) ); ?> tampilan arsip <?php echo esc_html( $d['import']['source'] ); ?></small><?php endif; ?></div>
			<div><span>Hari ini</span><b><?php echo esc_html( $fmt( $sum_last( 1 ) ) ); ?></b></div>
			<div><span>7 hari terakhir</span><b><?php echo esc_html( $fmt( $sum_last( 7 ) ) ); ?></b></div>
			<div><span>30 hari terakhir</span><b><?php echo esc_html( $fmt( $sum_last( 30 ) ) ); ?></b></div>
			<div><span>Negara</span><b><?php echo esc_html( $fmt( count( $d['countries'] ) ) ); ?></b></div>
		</div>
		<div class="card2">
			<h2 style="margin-top:0">Kunjungan per hari <span class="note">(<?php echo esc_html( date_i18n( 'j M Y', strtotime( $first ) ) ); ?> – sekarang · <?php echo esc_html( $fmt( $recorded ) ); ?> kunjungan tercatat harian · garis = rata-rata 7 hari)</span></h2>
			<svg viewBox="0 0 <?php echo (int) $w; ?> <?php echo (int) $h; ?>" style="width:100%;height:auto" role="img" aria-label="Grafik kunjungan harian"><?php echo $grid . $bars; // phpcs:ignore ?><path d="<?php echo esc_attr( $avg ); ?>" fill="none" stroke="#7A1E33" stroke-width="2"/><?php echo $labels; // phpcs:ignore ?></svg>
			<p class="note">Riwayat harian disimpan hingga 5 tahun. Sebelum 31 Oktober 2026 situs hanya menyimpan 90 hari terakhir, sehingga data harian yang lebih lama tidak tersedia; angka totalnya tetap utuh.</p>
		</div>
		<div class="two">
			<div class="card2"><h2 style="margin-top:0">Per bulan</h2><table><thead><tr><th>Bulan</th><th class="r">Kunjungan</th></tr></thead><tbody>
			<?php foreach ( array_reverse( $months, true ) as $m => $v ) : ?><tr><td><?php echo esc_html( date_i18n( 'F Y', strtotime( $m . '-01' ) ) ); ?></td><td class="r"><?php echo esc_html( $fmt( $v ) ); ?></td></tr><?php endforeach; ?>
			</tbody></table></div>
			<div class="card2"><h2 style="margin-top:0">Negara (<?php echo esc_html( $fmt( count( $d['countries'] ) ) ); ?>)</h2><table><thead><tr><th>Negara</th><th class="r">Kunjungan</th><th style="width:38%">Porsi</th></tr></thead><tbody>
			<?php foreach ( $d['countries'] as $cc => $v ) : ?><tr><td><?php echo esc_html( pindotutuko_analytics_v2_country_name( $cc ) ); ?> <span class="note"><?php echo esc_html( $cc ); ?></span></td><td class="r"><?php echo esc_html( $fmt( $v ) ); ?></td><td><div class="bar" style="width:<?php echo esc_attr( max( 1, round( 100 * $v / $ctot, 1 ) ) ); ?>%"></div><span class="note"><?php echo esc_html( number_format_i18n( 100 * $v / $ctot, 1 ) ); ?>%</span></td></tr><?php endforeach; ?>
			</tbody></table><p class="note">Negara dihitung dari kunjungan pindotutuko.id saja; arsip Blogger tidak menyediakan data negara.</p></div>
		</div>
		<p><a class="button" href="<?php echo esc_url( $csv( 'days' ) ); ?>">Unduh CSV harian</a> <a class="button" href="<?php echo esc_url( $csv( 'countries' ) ); ?>">Unduh CSV negara</a></p>
	</div>
	<?php
}
