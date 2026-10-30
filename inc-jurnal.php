<?php
/**
 * Aplikasi Khusus — Monitor Jurnal UNMER (/khusus/jurnal/) dan Direktori Jurnal (/khusus/direktori/).
 * Data publik OJS dibaca lewat OAI-PMH dan laman publik jurnal.unmer.ac.id (hanya host itu yang diizinkan).
 * Data disimpan di luar public_html: ~/khusus-data/jurnal/ ; antarmuka di ~/khusus-apps/jurnal/ dan ~/khusus-apps/direktori/.
 *
 * Peran: "Jurnal UNMER — Pembaca" (jurnal_view), "Jurnal UNMER — Pengelola" (jurnal_view + jurnal_update).
 * Administrator WordPress dan Admin redaksi Mintakat otomatis mendapat keduanya; Editor/Pembaca Mintakat mendapat jurnal_view.
 *
 * @package pindotutuko
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PT_JR_DATA', dirname( untrailingslashit( ABSPATH ), 2 ) . '/khusus-data/jurnal' );
define( 'PT_JR_APP', dirname( untrailingslashit( ABSPATH ), 2 ) . '/khusus-apps/jurnal' );
define( 'PT_JR_DIRAPP', dirname( untrailingslashit( ABSPATH ), 2 ) . '/khusus-apps/direktori' );
define( 'PT_JR_OJS', 'https://jurnal.unmer.ac.id/index.php/' );
define( 'PT_JR_DIR_SRC', 'https://direktorijurnal-unmer.netlify.app/' );
define( 'PT_JR_VERSION', '1.0.0' );

/* ---------------- peran ---------------- */
add_action(
	'init',
	function () {
		if ( get_option( 'pt_jr_roles_v' ) === '1' ) {
			return;
		}
		add_role( 'jurnal_viewer', 'Jurnal UNMER — Pembaca', array( 'read' => true, 'jurnal_view' => true ) );
		add_role( 'jurnal_admin', 'Jurnal UNMER — Pengelola', array( 'read' => true, 'jurnal_view' => true, 'jurnal_update' => true ) );
		foreach ( array( 'administrator' => 2, 'mintakat_admin' => 2, 'mintakat_editor' => 1, 'mintakat_viewer' => 1 ) as $r => $lvl ) {
			$role = get_role( $r );
			if ( $role ) {
				$role->add_cap( 'jurnal_view' );
				if ( $lvl > 1 ) {
					$role->add_cap( 'jurnal_update' );
				}
			}
		}
		update_option( 'pt_jr_roles_v', '1' );
	},
	6
);

add_filter(
	'login_redirect',
	function ( $to, $req, $user ) {
		if ( $user instanceof WP_User && ! user_can( $user, 'edit_posts' ) && ! user_can( $user, 'mintakat_view' ) && user_can( $user, 'jurnal_view' ) ) {
			return ( $req && false !== strpos( $req, '/khusus/' ) ) ? $req : home_url( '/khusus/' );
		}
		return $to;
	},
	21,
	3
);

/* ---------------- rute (sebelum rute Mintakat, prioritas 98) ---------------- */
add_action( 'init', 'pt_jr_route', 98 );
function pt_jr_route() {
	$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '', PHP_URL_PATH );
	if ( ! is_string( $path ) || ! preg_match( '#^/khusus(/(jurnal|direktori)(/.*)?)?/?$#', $path, $m ) ) {
		return;
	}
	$app  = isset( $m[2] ) ? $m[2] : '';
	$rest = isset( $m[3] ) ? $m[3] : '';
	if ( '' === $app && '/khusus/' !== $path ) {
		return; // /khusus tanpa garis miring: biarkan rute bawaan mengalihkan
	}
	nocache_headers();
	header( 'X-Robots-Tag: noindex, nofollow' );
	header( 'Cache-Control: no-store, private' );
	$is_api = (bool) preg_match( '#^/api/#', $rest );
	/* Direktori Jurnal terbuka untuk umum (hanya baca); fitur pembaruan dari OJS tetap khusus Pengelola yang login. */
	if ( 'direktori' === $app && ! $is_api && '' !== $rest && ! current_user_can( 'jurnal_view' ) ) {
		$f = ltrim( $rest, '/' );
		if ( 'index.html' === ( '' === $f ? 'index.html' : $f ) && ! is_file( PT_JR_DIRAPP . '/index.html' ) ) {
			pt_khusus_page( '<h1>Direktori belum tersedia</h1>' );
		}
		pt_jd_serve( '' === $f ? 'index.html' : $f );
	}
	if ( ! is_user_logged_in() ) {
		if ( $is_api ) {
			pt_jr_json( array( 'error' => 'Silakan login.' ), 401 );
		}
		wp_safe_redirect( wp_login_url( home_url( $path ) ) );
		exit;
	}
	if ( '' === $app ) {
		pt_jr_landing();
	}
	if ( ! current_user_can( 'jurnal_view' ) ) {
		if ( $is_api ) {
			pt_jr_json( array( 'error' => 'Akun Anda tidak punya akses ke aplikasi ini.' ), 403 );
		}
		pt_khusus_page( '<h1>Tidak ada akses</h1><p>Akun <b>' . esc_html( wp_get_current_user()->user_login ) . '</b> belum diberi akses ke aplikasi jurnal. Hubungi pengelola situs.</p><p><a href="' . esc_url( home_url( '/khusus/' ) ) . '">Kembali ke Aplikasi Khusus</a></p>', 403 );
	}
	if ( '' === $rest ) {
		wp_safe_redirect( home_url( '/khusus/' . $app . '/' ), 301 );
		exit;
	}
	if ( $is_api ) {
		if ( 'jurnal' === $app ) {
			pt_jr_api( substr( $rest, 5 ) );
		}
		pt_jd_api( substr( $rest, 5 ) );
	}
	$f = ltrim( $rest, '/' );
	if ( 'jurnal' === $app ) {
		pt_jr_static( PT_JR_APP, '' === $f ? 'index.html' : $f, 'jurnal' );
	}
	pt_jd_serve( '' === $f ? 'index.html' : $f );
}

function pt_jr_landing() {
	$cards = array();
	if ( current_user_can( 'jurnal_view' ) ) {
		$cards[] = array( '/khusus/jurnal/', 'Monitor Jurnal UNMER', 'Pemantau terbitan seluruh jurnal di jurnal.unmer.ac.id — grafik dan rekap per jurnal maupun semua jurnal, diperbarui langsung dari OJS.' );
		$cards[] = array( '/khusus/direktori/', 'Direktori Jurnal UNMER', 'Direktori jurnal dan jaringan publikasi: mitra bestari, dewan editor, afiliasi, sasaran publikasi — dengan cek pembaruan dari OJS. Terbuka untuk umum (hanya baca).' );
	}
	if ( current_user_can( 'pjpi_view' ) || current_user_can( 'pjpi_admin' ) ) {
		$cards[] = array( '/khusus/pjpi/', 'PJPI Monitoring', 'Pemantau naskah OJS semua jurnal UNMER untuk PJPI — cek artikel/naskah per jurnal, rekomendasi tindakan, draf email per kasus, ekspor Excel. Login per peran dan per jurnal.' );
	}
	if ( current_user_can( 'mintakat_view' ) ) {
		$cards[] = array( '/khusus/mintakat/', 'Mintakat Monitoring', 'Pemantau naskah OJS Mintakat: Jurnal Arsitektur — tracker redaksi, rekomendasi tindakan, draf email per kasus, dan ekspor Excel.' );
	}
	if ( ! $cards ) {
		pt_khusus_page( '<h1>Tidak ada akses</h1><p>Akun <b>' . esc_html( wp_get_current_user()->user_login ) . '</b> belum diberi akses ke Aplikasi Khusus. Hubungi pengelola situs.</p><p><a href="' . esc_url( wp_logout_url( home_url( '/khusus/' ) ) ) . '">Keluar dan masuk dengan akun lain</a></p>', 403 );
	}
	$h = '';
	foreach ( $cards as $c ) {
		$h .= '<a class="app" href="' . esc_url( home_url( $c[0] ) ) . '"><h2>' . esc_html( $c[1] ) . '</h2><p>' . esc_html( $c[2] ) . '</p><small>Buka aplikasi →</small></a>';
	}
	pt_khusus_page( '<h1>Aplikasi Khusus</h1><p class="lead">Aplikasi kerja yang hanya dapat dibuka oleh pengguna terdaftar.</p><div class="apps">' . $h . '</div><p class="note">Semua aplikasi di sini wajib login, kecuali Direktori Jurnal UNMER yang terbuka untuk umum (hanya baca). Akses diatur dari WP Admin → Pengguna (peran Jurnal UNMER, PJPI, dan Mintakat). Data aplikasi disimpan di server, di luar folder publik.</p>' );
}

/* ---------------- utilitas ---------------- */
function pt_jr_json( $v, $code = 200 ) {
	status_header( $code );
	header( 'Content-Type: application/json; charset=utf-8' );
	$s = wp_json_encode( $v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
	if ( strlen( $s ) > 20000 && function_exists( 'gzencode' ) && isset( $_SERVER['HTTP_ACCEPT_ENCODING'] ) && false !== strpos( $_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip' ) ) {
		header( 'Content-Encoding: gzip' );
		header( 'Vary: Accept-Encoding' );
		$s = gzencode( $s, 6 );
	}
	echo $s; // phpcs:ignore
	exit;
}
function pt_jr_err( $msg, $code = 400 ) {
	pt_jr_json( array( 'error' => $msg ), $code );
}
function pt_jr_need_update() {
	if ( ! current_user_can( 'jurnal_update' ) ) {
		pt_jr_err( 'Hanya Pengelola yang dapat memperbarui data.', 403 );
	}
	if ( 'POST' !== $_SERVER['REQUEST_METHOD'] ) {
		pt_jr_err( 'Metode tidak diizinkan.', 405 );
	}
	$n = isset( $_SERVER['HTTP_X_WP_NONCE'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_WP_NONCE'] ) ) : '';
	if ( ! wp_verify_nonce( $n, 'pt_jr' ) ) {
		pt_jr_err( 'Sesi kedaluwarsa. Muat ulang halaman.', 403 );
	}
}
function pt_jr_body() {
	$raw = file_get_contents( 'php://input', false, null, 0, 2000000 );
	$v   = json_decode( (string) $raw, true );
	return is_array( $v ) ? $v : array();
}
function pt_jr_dir( $d ) {
	if ( ! is_dir( $d ) ) {
		wp_mkdir_p( $d );
	}
	$ht = $d . '/.htaccess';
	if ( ! file_exists( $ht ) ) {
		@file_put_contents( $ht, "Require all denied\nDeny from all\n" ); // phpcs:ignore
	}
}
function pt_jr_read( $file, $def = null ) {
	$p = PT_JR_DATA . '/' . $file;
	if ( ! is_file( $p ) ) {
		return $def;
	}
	$v = json_decode( (string) file_get_contents( $p ), true );
	return null === $v ? $def : $v;
}
function pt_jr_write( $file, $v ) {
	pt_jr_dir( PT_JR_DATA );
	$p   = PT_JR_DATA . '/' . $file;
	$tmp = $p . '.tmp' . wp_rand( 1000, 9999 );
	file_put_contents( $tmp, wp_json_encode( $v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ), LOCK_EX ); // phpcs:ignore
	rename( $tmp, $p ); // phpcs:ignore
}
function pt_jr_path_ok( $p ) {
	return is_string( $p ) && preg_match( '/^[a-z0-9_-]{1,40}$/i', $p );
}
/** GET ke jurnal.unmer.ac.id (atau sumber Direktori) saja. */
function pt_jr_get( $url, $timeout = 60 ) {
	if ( 0 !== strpos( $url, PT_JR_OJS ) && 0 !== strpos( $url, 'https://jurnal.unmer.ac.id/' ) && PT_JR_DIR_SRC !== $url ) {
		return array( 0, '' );
	}
	$ch = curl_init( $url );
	curl_setopt_array(
		$ch,
		array(
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_TIMEOUT        => $timeout,
			CURLOPT_CONNECTTIMEOUT => 15,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_MAXREDIRS      => 3,
			CURLOPT_ENCODING       => '',
			CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; PT-JurnalMonitor/' . PT_JR_VERSION . '; +https://pindotutuko.id)',
		)
	);
	$b    = curl_exec( $ch );
	$code = (int) curl_getinfo( $ch, CURLINFO_HTTP_CODE );
	curl_close( $ch );
	return array( $code, is_string( $b ) ? $b : '' );
}
function pt_jr_clean( $s, $n = 300 ) {
	$s = trim( preg_replace( '/\s+/u', ' ', html_entity_decode( wp_strip_all_tags( (string) $s ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) ) );
	return function_exists( 'mb_substr' ) ? mb_substr( $s, 0, $n ) : substr( $s, 0, $n );
}

/* ---------------- daftar jurnal ---------------- */
function pt_jr_journals() {
	$l = pt_jr_read( 'journals.json' );
	return is_array( $l ) && ! empty( $l['list'] ) ? $l : array( 'at' => '', 'list' => array() );
}
function pt_jr_refresh_list() {
	$old  = pt_jr_journals();
	$keep = array();
	foreach ( $old['list'] as $j ) {
		$keep[ $j['p'] ] = $j;
	}
	$found = array();
	list( $c, $html ) = pt_jr_get( PT_JR_OJS . 'index/index' );
	if ( 200 === $c && $html ) {
		if ( preg_match_all( '#<h3[^>]*>\s*<a[^>]+href="https?://jurnal\.unmer\.ac\.id/index\.php/([a-z0-9_-]+)"[^>]*>(.*?)</a>#is', $html, $mm, PREG_SET_ORDER ) ) {
			foreach ( $mm as $x ) {
				$found[ $x[1] ] = array( 'p' => $x[1], 'name' => pt_jr_clean( $x[2], 200 ), 'src' => 'portal' );
			}
		}
		if ( ! $found && preg_match_all( '#href="https?://jurnal\.unmer\.ac\.id/index\.php/([a-z0-9_-]+)"[^>]*>([^<]{3,200})</a>#i', $html, $mm, PREG_SET_ORDER ) ) {
			foreach ( $mm as $x ) {
				$t = pt_jr_clean( $x[2], 200 );
				if ( 'index' !== $x[1] && ! isset( $found[ $x[1] ] ) && ! preg_match( '/^(view journal|current issue|lihat jurnal)/i', $t ) ) {
					$found[ $x[1] ] = array( 'p' => $x[1], 'name' => $t, 'src' => 'portal' );
				}
			}
		}
	}
	list( $c2, $xml ) = pt_jr_get( PT_JR_OJS . 'index/oai?verb=ListSets' );
	if ( 200 === $c2 && preg_match_all( '#<set>\s*<setSpec>([^<:]+)</setSpec>\s*<setName>([^<]*)</setName>#i', $xml, $mm, PREG_SET_ORDER ) ) {
		foreach ( $mm as $x ) {
			$p = trim( $x[1] );
			if ( ! isset( $found[ $p ] ) ) {
				$found[ $p ] = array( 'p' => $p, 'name' => pt_jr_clean( $x[2], 200 ), 'src' => 'oai' );
			}
		}
	}
	if ( ! $found ) {
		pt_jr_err( 'Portal OJS tidak dapat dihubungi (HTTP ' . $c . '). Coba lagi nanti.', 502 );
	}
	foreach ( $keep as $p => $j ) {
		if ( ! empty( $j['manual'] ) && ! isset( $found[ $p ] ) ) {
			$found[ $p ] = $j;
		}
		if ( isset( $found[ $p ] ) && ! empty( $j['manual'] ) ) {
			$found[ $p ]['manual'] = 1;
		}
	}
	$out = array( 'at' => current_time( 'c' ), 'list' => array_values( $found ) );
	pt_jr_write( 'journals.json', $out );
	return $out;
}

/* ---------------- panen OAI-PMH satu jurnal ---------------- */
function pt_jr_harvest( $p ) {
	@set_time_limit( 300 ); // phpcs:ignore
	$recs  = array();
	$url   = PT_JR_OJS . $p . '/oai?verb=ListRecords&metadataPrefix=oai_dc';
	$pages = 0;
	$total = 0;
	while ( $url && $pages < 120 ) {
		list( $c, $xml ) = pt_jr_get( $url, 90 );
		if ( 200 !== $c || '' === $xml ) {
			return array( 'error' => 'OAI ' . $p . ' gagal (HTTP ' . $c . ', halaman ' . ( $pages + 1 ) . ').' );
		}
		++$pages;
		if ( false !== strpos( $xml, 'noRecordsMatch' ) ) {
			break;
		}
		if ( preg_match( '/completeListSize="(\d+)"/', $xml, $cm ) ) {
			$total = (int) $cm[1];
		}
		$prev = libxml_use_internal_errors( true );
		$doc  = simplexml_load_string( $xml );
		libxml_use_internal_errors( $prev );
		if ( ! $doc ) {
			return array( 'error' => 'Respons OAI ' . $p . ' tidak terbaca.' );
		}
		$doc->registerXPathNamespace( 'o', 'http://www.openarchives.org/OAI/2.0/' );
		foreach ( $doc->xpath( '//o:record' ) as $r ) {
			$r->registerXPathNamespace( 'o', 'http://www.openarchives.org/OAI/2.0/' );
			$hd = $r->xpath( 'o:header' );
			if ( ! $hd || 'deleted' === (string) $hd[0]['status'] ) {
				continue;
			}
			$hd  = $hd[0];
			$oid = (string) $hd->identifier;
			$sec = '';
			foreach ( $hd->setSpec as $ss ) {
				$ss = (string) $ss;
				if ( false !== strpos( $ss, ':' ) ) {
					$sec = substr( $ss, strpos( $ss, ':' ) + 1 );
				}
			}
			$dc = $r->metadata->children( 'http://www.openarchives.org/OAI/2.0/oai_dc/' );
			if ( ! $dc || ! isset( $dc->dc ) ) {
				continue;
			}
			$d     = $dc->dc->children( 'http://purl.org/dc/elements/1.1/' );
			$title = pt_jr_clean( (string) $d->title, 220 );
			$date  = substr( (string) $d->date, 0, 10 );
			$issue = '';
			$doi   = '';
			$subj  = array();
			$na    = count( $d->creator );
			foreach ( $d->source as $s ) {
				$s = (string) $s;
				if ( '' === $issue && false !== strpos( $s, ';' ) ) {
					$issue = trim( substr( $s, strpos( $s, ';' ) + 1 ) );
				}
			}
			if ( preg_match( '/^(.*?\(\d{4}\))/u', $issue, $im ) ) {
				$issue = trim( $im[1] );
			}
			$issue = pt_jr_clean( $issue, 90 );
			foreach ( $d->identifier as $id ) {
				$id = (string) $id;
				if ( preg_match( '#^(https?://(dx\.)?doi\.org/)?(10\.\d{4,9}/\S+)$#i', $id, $dm ) ) {
					$doi = $dm[3];
				}
			}
			$i = 0;
			foreach ( $d->subject as $s ) {
				foreach ( preg_split( '/\s*[;,]\s*/u', (string) $s ) as $kw ) {
					$kw = pt_jr_clean( $kw, 60 );
					if ( '' !== $kw && $i < 6 ) {
						$subj[] = $kw;
						++$i;
					}
				}
			}
			$year = preg_match( '/\((\d{4})\)/', $issue, $ym ) ? (int) $ym[1] : (int) substr( $date, 0, 4 );
			$aid  = (int) preg_replace( '/\D+/', '', substr( $oid, strrpos( $oid, '/' ) + 1 ) );
			$recs[] = array( $aid, $date, $year, $issue, $doi, substr( (string) $d->language, 0, 3 ), $na, $sec, $title, implode( '; ', $subj ) );
		}
		$url = '';
		if ( preg_match( '#<resumptionToken[^>]*>([^<]+)</resumptionToken>#', $xml, $tm ) ) {
			$url = PT_JR_OJS . $p . '/oai?verb=ListRecords&resumptionToken=' . rawurlencode( trim( $tm[1] ) );
		}
	}
	$prev = pt_jr_read( 'j-' . $p . '.json', array() );
	$out  = array(
		'p'     => $p,
		'at'    => current_time( 'c' ),
		'n'     => count( $recs ),
		'total' => $total,
		'prevN' => isset( $prev['n'] ) ? (int) $prev['n'] : null,
		'r'     => $recs,
	);
	pt_jr_write( 'j-' . $p . '.json', $out );
	$log   = pt_jr_read( 'log.json', array() );
	$log[] = array( 'at' => $out['at'], 'p' => $p, 'n' => $out['n'], 'prev' => $out['prevN'], 'u' => wp_get_current_user()->user_login );
	pt_jr_write( 'log.json', array_slice( $log, -400 ) );
	return array( 'p' => $p, 'n' => $out['n'], 'prevN' => $out['prevN'], 'at' => $out['at'], 'pages' => $pages );
}

/* Metadata dari Direktori (SINTA, akronim, unit, bidang, frekuensi) bila Direktori sudah dipasang. */
function pt_jr_dirmeta() {
	$d = pt_jd_data();
	$o = array();
	if ( $d && ! empty( $d['jur'] ) ) {
		foreach ( $d['jur'] as $j ) {
			if ( empty( $j['id'] ) ) {
				continue;
			}
			$o[ $j['id'] ] = array(
				'ak'    => isset( $j['akronim'] ) ? $j['akronim'] : '',
				'sinta' => isset( $j['sinta'] ) ? $j['sinta'] : null,
				'unit'  => isset( $j['unit'] ) ? $j['unit'] : '',
				'bid'   => isset( $j['bidang'] ) ? $j['bidang'] : '',
				'frek'  => isset( $j['frek'] ) ? $j['frek'] : '',
			);
		}
	}
	return $o;
}

function pt_jr_api( $ep ) {
	$ep = trim( $ep, '/' );
	if ( 'data' === $ep ) {
		$l = pt_jr_journals();
		$j = array();
		foreach ( $l['list'] as $x ) {
			$d = pt_jr_read( 'j-' . $x['p'] . '.json' );
			$j[] = array_merge( $x, $d ? array( 'at' => $d['at'], 'n' => $d['n'], 'prevN' => $d['prevN'], 'r' => $d['r'] ) : array( 'at' => '', 'n' => 0, 'r' => array() ) );
		}
		pt_jr_json(
			array(
				'listAt' => $l['at'],
				'j'      => $j,
				'meta'   => pt_jr_dirmeta(),
				'log'    => array_slice( pt_jr_read( 'log.json', array() ), -60 ),
				'me'     => array(
					'name'   => wp_get_current_user()->display_name,
					'update' => current_user_can( 'jurnal_update' ),
				),
			)
		);
	}
	/* Impor hasil panen OAI yang dibaca lewat peramban Pengelola (bila server diblokir portal OJS). */
	if ( 'import' === $ep ) {
		pt_jr_need_update();
		$b = pt_jr_body();
		if ( ! empty( $b['list'] ) && is_array( $b['list'] ) ) {
			$old  = pt_jr_journals();
			$man  = array();
			foreach ( $old['list'] as $j ) {
				if ( ! empty( $j['manual'] ) ) {
					$man[ $j['p'] ] = $j;
				}
			}
			$list = array();
			foreach ( array_slice( $b['list'], 0, 200 ) as $j ) {
				$p = isset( $j['p'] ) ? sanitize_key( $j['p'] ) : '';
				if ( pt_jr_path_ok( $p ) ) {
					$list[ $p ] = array( 'p' => $p, 'name' => pt_jr_clean( isset( $j['name'] ) ? $j['name'] : $p, 200 ), 'src' => ( isset( $j['src'] ) && 'oai' === $j['src'] ) ? 'oai' : 'portal' );
				}
			}
			foreach ( $man as $p => $j ) {
				$list[ $p ] = isset( $list[ $p ] ) ? array_merge( $list[ $p ], array( 'manual' => 1 ) ) : $j;
			}
			pt_jr_write( 'journals.json', array( 'at' => current_time( 'c' ), 'list' => array_values( $list ), 'via' => 'browser' ) );
		}
		if ( ! empty( $b['j'] ) && is_array( $b['j'] ) ) {
			$j = $b['j'];
			$p = isset( $j['p'] ) ? sanitize_key( $j['p'] ) : '';
			if ( ! pt_jr_path_ok( $p ) || ! isset( $j['r'] ) || ! is_array( $j['r'] ) ) {
				pt_jr_err( 'Data impor tidak sah.' );
			}
			$recs = array();
			foreach ( array_slice( $j['r'], 0, 20000 ) as $r ) {
				if ( ! is_array( $r ) || count( $r ) < 10 ) {
					continue;
				}
				$recs[] = array( (int) $r[0], substr( preg_replace( '/[^0-9-]/', '', (string) $r[1] ), 0, 10 ), (int) $r[2], pt_jr_clean( $r[3], 90 ), pt_jr_clean( $r[4], 120 ), substr( preg_replace( '/[^a-z]/', '', strtolower( (string) $r[5] ) ), 0, 3 ), max( 0, min( 99, (int) $r[6] ) ), substr( preg_replace( '/[^A-Za-z0-9_-]/', '', (string) $r[7] ), 0, 20 ), pt_jr_clean( $r[8], 220 ), pt_jr_clean( $r[9], 400 ) );
			}
			$prev = pt_jr_read( 'j-' . $p . '.json', array() );
			$out  = array( 'p' => $p, 'at' => current_time( 'c' ), 'n' => count( $recs ), 'total' => isset( $j['total'] ) ? (int) $j['total'] : count( $recs ), 'prevN' => isset( $prev['n'] ) ? (int) $prev['n'] : null, 'via' => 'browser', 'r' => $recs );
			pt_jr_write( 'j-' . $p . '.json', $out );
			$log   = pt_jr_read( 'log.json', array() );
			$log[] = array( 'at' => $out['at'], 'p' => $p, 'n' => $out['n'], 'prev' => $out['prevN'], 'u' => wp_get_current_user()->user_login . ' (peramban)' );
			pt_jr_write( 'log.json', array_slice( $log, -400 ) );
			pt_jr_json( array( 'p' => $p, 'n' => $out['n'], 'prevN' => $out['prevN'] ) );
		}
		pt_jr_json( array( 'ok' => true ) );
	}
	if ( 'refresh-list' === $ep ) {
		pt_jr_need_update();
		pt_jr_json( pt_jr_refresh_list() );
	}
	if ( 'harvest' === $ep ) {
		pt_jr_need_update();
		$p = isset( $_GET['j'] ) ? sanitize_key( wp_unslash( $_GET['j'] ) ) : '';
		if ( ! pt_jr_path_ok( $p ) ) {
			pt_jr_err( 'Kode jurnal tidak sah.' );
		}
		$r = pt_jr_harvest( $p );
		pt_jr_json( $r, isset( $r['error'] ) ? 502 : 200 );
	}
	if ( 'manual' === $ep ) {
		pt_jr_need_update();
		$b = pt_jr_body();
		$p = isset( $b['p'] ) ? sanitize_key( $b['p'] ) : '';
		if ( ! pt_jr_path_ok( $p ) ) {
			pt_jr_err( 'Kode jurnal tidak sah.' );
		}
		$l = pt_jr_journals();
		$i = array_search( $p, array_column( $l['list'], 'p' ), true );
		if ( ! empty( $b['remove'] ) ) {
			if ( false !== $i && ! empty( $l['list'][ $i ]['manual'] ) && 'manual' === $l['list'][ $i ]['src'] ) {
				array_splice( $l['list'], $i, 1 );
			}
		} else {
			list( $c, $xml ) = pt_jr_get( PT_JR_OJS . $p . '/oai?verb=Identify', 30 );
			if ( 200 !== $c || false === strpos( $xml, '<repositoryName>' ) ) {
				pt_jr_err( 'Jurnal "' . $p . '" tidak ditemukan di jurnal.unmer.ac.id.' );
			}
			$name = preg_match( '#<repositoryName>([^<]*)</repositoryName>#', $xml, $nm ) ? pt_jr_clean( $nm[1], 200 ) : $p;
			if ( false === $i ) {
				$l['list'][] = array( 'p' => $p, 'name' => $name, 'src' => 'manual', 'manual' => 1 );
			} else {
				$l['list'][ $i ]['manual'] = 1;
			}
		}
		pt_jr_write( 'journals.json', $l );
		pt_jr_json( $l );
	}
	pt_jr_err( 'Endpoint tidak dikenal.', 404 );
}

/* ---------------- berkas antarmuka ---------------- */
function pt_jr_static( $dir, $f, $app ) {
	$types = array( 'html' => 'text/html; charset=utf-8', 'js' => 'application/javascript; charset=utf-8', 'css' => 'text/css; charset=utf-8', 'png' => 'image/png', 'svg' => 'image/svg+xml' );
	if ( ! preg_match( '#^[a-z0-9_-]+\.(html|js|css|png|svg)$#i', $f, $m ) ) {
		status_header( 404 );
		exit;
	}
	$p = $dir . '/' . $f;
	if ( ! is_file( $p ) ) {
		status_header( 404 );
		echo 'Berkas aplikasi belum dipasang.';
		exit;
	}
	status_header( 200 );
	header( 'Content-Type: ' . $types[ strtolower( $m[1] ) ] );
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( 'X-Content-Type-Options: nosniff' );
	$body = file_get_contents( $p );
	if ( 'index.html' === $f ) {
		$cfg  = array(
			'app'    => $app,
			'api'    => home_url( '/khusus/' . $app . '/api/' ),
			'home'   => home_url( '/khusus/' ),
			'site'   => home_url( '/' ),
			'logout' => wp_logout_url( home_url( '/' ) ),
			'nonce'  => wp_create_nonce( 'pt_jr' ),
			'user'   => wp_get_current_user()->display_name,
			'update' => current_user_can( 'jurnal_update' ),
			'pjpi'   => function_exists( 'pt_pj_role_for' ) ? array_values( array_filter( array_keys( pt_pj_journals() ), function ( $p ) { return '' !== pt_pj_role_for( wp_get_current_user(), $p ); } ) ) : array(),
		);
		$body = str_replace( '<!--PT_CFG-->', '<script>window.PT_JR=' . wp_json_encode( $cfg ) . ';</script>', $body );
	}
	echo $body; // phpcs:ignore
	exit;
}

/* =====================================================================
 * DIREKTORI JURNAL — salinan dari Netlify, dengan cek pembaruan dari OJS
 * ===================================================================== */

/** Ambil literal JSON setelah "DATA=" dari HTML Direktori (pencocokan kurung, sadar string). */
function pt_jd_extract( $html ) {
	if ( ! preg_match( '/\b(const|let|var)\s+DATA\s*=\s*\{/', $html, $m, PREG_OFFSET_CAPTURE ) ) {
		return null;
	}
	$start = $m[0][1] + strlen( $m[0][0] ) - 1;
	$len   = strlen( $html );
	$dep   = 0;
	$in    = false;
	for ( $i = $start; $i < $len; $i++ ) {
		$ch = $html[ $i ];
		if ( $in ) {
			if ( '\\' === $ch ) {
				++$i;
			} elseif ( '"' === $ch ) {
				$in = false;
			}
			continue;
		}
		if ( '"' === $ch ) {
			$in = true;
		} elseif ( '{' === $ch ) {
			++$dep;
		} elseif ( '}' === $ch ) {
			--$dep;
			if ( 0 === $dep ) {
				return array( $start, $i + 1 );
			}
		}
	}
	return null;
}
function pt_jd_data() {
	static $d = false;
	if ( false !== $d ) {
		return $d;
	}
	$d = null;
	$p = PT_JR_DIRAPP . '/data.json';
	if ( is_file( $p ) ) {
		$d = json_decode( (string) file_get_contents( $p ), true );
	}
	return $d;
}
/** Pasang/perbarui salinan Direktori dari Netlify: index.html dipisah menjadi shell + data.json. */
function pt_jd_install() {
	list( $c, $html ) = pt_jr_get( PT_JR_DIR_SRC, 90 );
	if ( 200 !== $c || strlen( $html ) < 100000 ) {
		return 'Gagal mengambil Direktori dari Netlify (HTTP ' . $c . ').';
	}
	$r = pt_jd_extract( $html );
	if ( ! $r ) {
		return 'Struktur data Direktori tidak dikenali.';
	}
	$json = substr( $html, $r[0], $r[1] - $r[0] );
	if ( null === json_decode( $json, true ) ) {
		return 'Data Direktori bukan JSON yang sah.';
	}
	$shell = substr( $html, 0, $r[0] ) . 'window.PT_DIR_APPLY(window.PT_DIR_DATA)' . substr( $html, $r[1] );
	$shell = preg_replace( '#<script(?![^>]*\bsrc=)#i', '<!--PT_CFG--><script', $shell, 1 );
	pt_jr_dir( PT_JR_DIRAPP );
	file_put_contents( PT_JR_DIRAPP . '/data.json', $json ); // phpcs:ignore
	file_put_contents( PT_JR_DIRAPP . '/index.html', $shell ); // phpcs:ignore
	return true;
}
function pt_jd_serve( $f ) {
	if ( 'index.html' === $f && ( ! is_file( PT_JR_DIRAPP . '/index.html' ) || ! is_file( PT_JR_DIRAPP . '/data.json' ) ) ) {
		if ( ! current_user_can( 'jurnal_update' ) ) {
			pt_khusus_page( '<h1>Direktori belum dipasang</h1><p>Minta Pengelola membuka halaman ini sekali untuk memasang Direktori Jurnal.</p>' );
		}
		$ok = pt_jd_install();
		if ( true !== $ok ) {
			pt_khusus_page( '<h1>Direktori belum dapat dipasang</h1><p>' . esc_html( $ok ) . '</p>' );
		}
	}
	if ( 'index.html' !== $f ) {
		pt_jr_static( PT_JR_DIRAPP, $f, 'direktori' );
	}
	$body = file_get_contents( PT_JR_DIRAPP . '/index.html' );
	$cfg  = array(
		'app'    => 'direktori',
		'api'    => home_url( '/khusus/direktori/api/' ),
		'home'   => home_url( '/khusus/' ),
		'nonce'  => wp_create_nonce( 'pt_jr' ),
		'user'   => wp_get_current_user()->display_name,
		'update' => current_user_can( 'jurnal_update' ),
		'public' => ! current_user_can( 'jurnal_view' ),
		'login'  => wp_login_url( home_url( '/khusus/' ) ),
	);
	$ovr  = pt_jr_read( 'dir-ovr.json', array( 'j' => array(), 'log' => array() ) );
	$data = (string) file_get_contents( PT_JR_DIRAPP . '/data.json' );
	$pre  = '<script>window.PT_JR=' . wp_json_encode( $cfg ) . ';window.PT_DIR_OVR=' . wp_json_encode( $ovr, JSON_UNESCAPED_UNICODE ) . ';window.PT_DIR_DATA=' . $data . ';</script><script src="dir-overlay.js?v=' . PT_JR_VERSION . '"></script>';
	$body = str_replace( '<!--PT_CFG-->', $pre, $body );
	status_header( 200 );
	header( 'Content-Type: text/html; charset=utf-8' );
	header( 'X-Frame-Options: SAMEORIGIN' );
	echo $body; // phpcs:ignore
	exit;
}

/** Teks bersih isi utama laman OJS (baris per baris). */
function pt_jd_lines( $html ) {
	$main = $html;
	foreach ( array( '#<div[^>]+class="[^"]*\bpage(_[a-z_]+)?\b[^"]*"[^>]*>(.*)<div[^>]+class="[^"]*pkp_structure_sidebar#is', '#<main[^>]*>(.*)</main>#is', '#<div[^>]+class="[^"]*pkp_structure_main[^"]*"[^>]*>(.*)#is' ) as $re ) {
		if ( preg_match( $re, $html, $m ) ) {
			$main = end( $m );
			break;
		}
	}
	$main = preg_replace( '#<(script|style|nav|header|footer)[^>]*>.*?</\1>#is', ' ', $main );
	$main = preg_replace( '#<(br|/p|/li|/h[1-6]|/tr|/div|/td|/th)\b[^>]*>#i', "\n", $main );
	$out  = array();
	foreach ( explode( "\n", html_entity_decode( wp_strip_all_tags( $main, false ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) ) as $ln ) {
		$ln = trim( preg_replace( '/[ \t\x{00A0}]+/u', ' ', $ln ) );
		if ( '' !== $ln && strlen( $ln ) < 400 ) {
			$out[] = $ln;
		}
	}
	return array_slice( $out, 0, 1500 );
}

function pt_jd_api( $ep ) {
	$ep = trim( $ep, '/' );
	if ( 'check' === $ep ) {
		pt_jr_need_update();
		$id = isset( $_GET['j'] ) ? sanitize_key( wp_unslash( $_GET['j'] ) ) : '';
		$d  = pt_jd_data();
		$jj = null;
		foreach ( (array) ( $d ? $d['jur'] : array() ) as $x ) {
			if ( isset( $x['id'] ) && $x['id'] === $id ) {
				$jj = $x;
			}
		}
		if ( ! pt_jr_path_ok( $id ) ) {
			pt_jr_err( 'Kode jurnal tidak sah.' );
		}
		$pages = array();
		$urls  = array();
		if ( $jj && ! empty( $jj['url'] ) && 0 === strpos( $jj['url'], 'https://jurnal.unmer.ac.id/' ) ) {
			$urls['rev'] = $jj['url'];
		}
		$urls['ed'] = PT_JR_OJS . $id . '/about/editorialTeam';
		$cache = pt_jr_read( 'dir-pages.json', array() );
		foreach ( $urls as $k => $u ) {
			list( $c, $h ) = pt_jr_get( $u, 45 );
			$pages[ $k ] = array( 'url' => $u, 'code' => $c, 'lines' => 200 === $c ? pt_jd_lines( $h ) : array() );
			if ( 200 !== $c && isset( $cache[ $id ]['pages'][ $k ]['lines'] ) ) {
				$pages[ $k ] = array( 'url' => $u, 'code' => 200, 'lines' => $cache[ $id ]['pages'][ $k ]['lines'], 'cached' => $cache[ $id ]['at'] );
			}
		}
		pt_jr_json( array( 'j' => $id, 'at' => current_time( 'c' ), 'pages' => $pages ) );
	}
	if ( 'apply' === $ep ) {
		pt_jr_need_update();
		$b  = pt_jr_body();
		$id = isset( $b['j'] ) ? sanitize_key( $b['j'] ) : '';
		if ( ! pt_jr_path_ok( $id ) ) {
			pt_jr_err( 'Kode jurnal tidak sah.' );
		}
		$o = pt_jr_read( 'dir-ovr.json', array( 'j' => array(), 'log' => array() ) );
		$c = isset( $o['j'][ $id ] ) ? $o['j'][ $id ] : array( 'addRev' => array(), 'delRev' => array(), 'addEd' => array(), 'delEd' => array() );
		$cl = function ( $p ) {
			return array(
				'n' => pt_jr_clean( isset( $p['n'] ) ? $p['n'] : '', 160 ),
				'a' => pt_jr_clean( isset( $p['a'] ) ? $p['a'] : '', 300 ),
				'k' => pt_jr_clean( isset( $p['k'] ) ? $p['k'] : '', 60 ),
				'p' => pt_jr_clean( isset( $p['p'] ) ? $p['p'] : '', 80 ),
			);
		};
		foreach ( array( 'addRev', 'addEd' ) as $k ) {
			foreach ( (array) ( isset( $b[ $k ] ) ? $b[ $k ] : array() ) as $p ) {
				$p = $cl( $p );
				if ( '' !== $p['n'] ) {
					$c[ $k ][] = $p;
				}
			}
		}
		foreach ( array( 'delRev', 'delEd' ) as $k ) {
			foreach ( (array) ( isset( $b[ $k ] ) ? $b[ $k ] : array() ) as $n ) {
				$n = pt_jr_clean( $n, 160 );
				if ( '' !== $n && ! in_array( $n, $c[ $k ], true ) ) {
					$c[ $k ][] = $n;
				}
			}
		}
		if ( ! empty( $b['reset'] ) ) {
			unset( $o['j'][ $id ] );
		} else {
			$c['at']        = current_time( 'c' );
			$o['j'][ $id ] = $c;
		}
		$o['log'][] = array( 'at' => current_time( 'c' ), 'j' => $id, 'u' => wp_get_current_user()->user_login, 'reset' => ! empty( $b['reset'] ), 'n' => array( count( (array) ( isset( $b['addRev'] ) ? $b['addRev'] : array() ) ), count( (array) ( isset( $b['delRev'] ) ? $b['delRev'] : array() ) ), count( (array) ( isset( $b['addEd'] ) ? $b['addEd'] : array() ) ), count( (array) ( isset( $b['delEd'] ) ? $b['delEd'] : array() ) ) ) );
		$o['log']   = array_slice( $o['log'], -300 );
		pt_jr_write( 'dir-ovr.json', $o );
		pt_jr_json( array( 'ok' => true ) );
	}
	/* Simpan laman OJS yang dibaca lewat peramban Pengelola (bila server diblokir portal OJS). */
	if ( 'pages-import' === $ep ) {
		pt_jr_need_update();
		$b     = pt_jr_body();
		$cache = pt_jr_read( 'dir-pages.json', array() );
		$n     = 0;
		foreach ( (array) ( isset( $b['pages'] ) ? $b['pages'] : array() ) as $id => $v ) {
			$id = sanitize_key( $id );
			if ( ! pt_jr_path_ok( $id ) || ! is_array( $v ) || empty( $v['pages'] ) ) {
				continue;
			}
			$pg = array();
			foreach ( array( 'rev', 'ed' ) as $k ) {
				if ( isset( $v['pages'][ $k ]['lines'] ) && is_array( $v['pages'][ $k ]['lines'] ) ) {
					$pg[ $k ] = array( 'lines' => array_map( function ( $l ) { return pt_jr_clean( $l, 400 ); }, array_slice( $v['pages'][ $k ]['lines'], 0, 1500 ) ) );
				}
			}
			$cache[ $id ] = array( 'at' => current_time( 'c' ), 'pages' => $pg );
			++$n;
		}
		pt_jr_write( 'dir-pages.json', $cache );
		pt_jr_json( array( 'ok' => true, 'n' => $n ) );
	}
	if ( 'reinstall' === $ep ) {
		pt_jr_need_update();
		$ok = pt_jd_install();
		if ( true !== $ok ) {
			pt_jr_err( $ok, 502 );
		}
		pt_jr_json( array( 'ok' => true ) );
	}
	pt_jr_err( 'Endpoint tidak dikenal.', 404 );
}
