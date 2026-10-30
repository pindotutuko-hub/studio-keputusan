<?php
/**
 * PJPI Monitoring — pemantau naskah OJS untuk seluruh jurnal UNMER Malang (Pengelola Jurnal dan Publikasi Ilmiah).
 * Memakai mesin & antarmuka Mintakat Monitoring yang sama, satu data terpisah per jurnal: /khusus/pjpi/<kode-jurnal>/
 *
 * Peran WordPress:
 *   PJPI — Admin pusat   (semua jurnal, setara Admin)
 *   PJPI — Admin jurnal  (jurnal yang ditugaskan: pengaturan, API key, sinkron, impor)
 *   PJPI — Editor        (jurnal yang ditugaskan: PIC/status/tenggat, draf email, ekspor)
 *   PJPI — Pembaca       (jurnal yang ditugaskan: hanya lihat)
 * Penugasan jurnal per pengguna: WP Admin → Pengguna → Edit → "Jurnal PJPI".
 * Jurnal Mintakat (jam) memakai data Mintakat Monitoring yang sudah ada; peran Mintakat tetap berlaku.
 *
 * @package pindotutuko
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
define( 'PT_PJ_DATA', dirname( untrailingslashit( ABSPATH ), 2 ) . '/khusus-data/pjpi' );

/* ---------------- peran ---------------- */
add_action(
	'init',
	function () {
		if ( get_option( 'pt_pj_roles_v' ) === '1' ) {
			return;
		}
		$all = array( 'read' => true, 'pjpi_view' => true, 'pjpi_edit' => true, 'pjpi_jadmin' => true, 'pjpi_admin' => true, 'jurnal_view' => true, 'jurnal_update' => true );
		add_role( 'pjpi_admin', 'PJPI — Admin pusat', $all );
		add_role( 'pjpi_jadmin', 'PJPI — Admin jurnal', array( 'read' => true, 'pjpi_view' => true, 'pjpi_edit' => true, 'pjpi_jadmin' => true, 'jurnal_view' => true ) );
		add_role( 'pjpi_editor', 'PJPI — Editor', array( 'read' => true, 'pjpi_view' => true, 'pjpi_edit' => true, 'jurnal_view' => true ) );
		add_role( 'pjpi_viewer', 'PJPI — Pembaca', array( 'read' => true, 'pjpi_view' => true, 'jurnal_view' => true ) );
		$adm = get_role( 'administrator' );
		if ( $adm ) {
			foreach ( $all as $c => $v ) {
				$adm->add_cap( $c );
			}
		}
		update_option( 'pt_pj_roles_v', '1' );
	},
	7
);

/* Satu kali (disetujui pemilik situs 30-10-2026): akun jm_admin mendapat peran tambahan PJPI — Admin pusat; peran Mintakat tetap. */
add_action(
	'init',
	function () {
		if ( get_option( 'pt_pj_grant_jm' ) === '1' || ! get_role( 'pjpi_admin' ) ) {
			return;
		}
		$u = get_user_by( 'login', 'jm_admin' );
		if ( $u ) {
			$u->add_role( 'pjpi_admin' );
		}
		update_option( 'pt_pj_grant_jm', '1' );
	},
	8
);

/* ---------------- jurnal & hak per jurnal ---------------- */
function pt_pj_journals() {
	$l    = function_exists( 'pt_jr_journals' ) ? pt_jr_journals() : array( 'list' => array() );
	$meta = function_exists( 'pt_jr_dirmeta' ) ? pt_jr_dirmeta() : array();
	$out  = array();
	foreach ( $l['list'] as $j ) {
		$p         = $j['p'];
		$ak        = isset( $meta[ $p ]['ak'] ) && $meta[ $p ]['ak'] ? $meta[ $p ]['ak'] : strtoupper( $p );
		$out[ $p ] = array( 'p' => $p, 'name' => $j['name'], 'ak' => $ak, 'unit' => isset( $meta[ $p ]['unit'] ) ? $meta[ $p ]['unit'] : '' );
	}
	if ( ! isset( $out['jam'] ) ) {
		$out['jam'] = array( 'p' => 'jam', 'name' => 'Mintakat: Jurnal Arsitektur', 'ak' => 'Mintakat', 'unit' => '' );
	}
	uasort(
		$out,
		function ( $a, $b ) {
			return strcasecmp( $a['ak'], $b['ak'] );
		}
	);
	return $out;
}
function pt_pj_user_journals( $u ) {
	$v = get_user_meta( $u->ID, 'pjpi_journals', true );
	return is_array( $v ) ? $v : array();
}
/** Peran pengguna pada satu jurnal: admin / editor / viewer / '' (tanpa akses). */
function pt_pj_role_for( $u, $p ) {
	if ( ! $u || ! $u->ID ) {
		return '';
	}
	if ( user_can( $u, 'pjpi_admin' ) ) {
		return 'admin';
	}
	$rank = array( '' => 0, 'viewer' => 1, 'editor' => 2, 'admin' => 3 );
	$r    = '';
	if ( 'jam' === $p && user_can( $u, 'mintakat_view' ) ) {
		$r = user_can( $u, 'mintakat_admin' ) ? 'admin' : ( user_can( $u, 'mintakat_edit' ) ? 'editor' : 'viewer' );
	}
	$js = pt_pj_user_journals( $u );
	if ( user_can( $u, 'pjpi_view' ) && ( in_array( $p, $js, true ) || in_array( '*', $js, true ) ) ) {
		$x = user_can( $u, 'pjpi_jadmin' ) ? 'admin' : ( user_can( $u, 'pjpi_edit' ) ? 'editor' : 'viewer' );
		if ( $rank[ $x ] > $rank[ $r ] ) {
			$r = $x;
		}
	}
	return $r;
}
function pt_pj_ctx( $p ) {
	$J  = pt_pj_journals();
	$j  = isset( $J[ $p ] ) ? $J[ $p ] : array( 'p' => $p, 'name' => strtoupper( $p ), 'ak' => strtoupper( $p ), 'unit' => '' );
	$GLOBALS['pt_mk_ctx'] = array(
		'p'    => $p,
		'ak'   => $j['ak'],
		'name' => $j['name'],
		'dir'  => 'jam' === $p ? PT_MK_DATA_DIR : PT_PJ_DATA . '/' . $p,
		'role' => function ( $u ) use ( $p ) {
			return pt_pj_role_for( $u, $p );
		},
	);
	return $j;
}

/* ---------------- rute ---------------- */
add_action( 'init', 'pt_pj_route', 97 );
function pt_pj_route() {
	$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '', PHP_URL_PATH );
	if ( ! is_string( $path ) || ! preg_match( '#^/khusus/pjpi(/([a-z0-9_-]+))?(/.*)?$#i', $path, $m ) ) {
		return;
	}
	$p    = isset( $m[2] ) ? strtolower( $m[2] ) : '';
	$rest = isset( $m[3] ) ? $m[3] : '';
	nocache_headers();
	header( 'X-Robots-Tag: noindex, nofollow' );
	header( 'Cache-Control: no-store, private' );
	$is_api = (bool) preg_match( '#^/api/#', $rest );
	if ( ! is_user_logged_in() ) {
		if ( $is_api ) {
			pt_mk_json( array( 'error' => 'Silakan login.' ), 401 );
		}
		wp_safe_redirect( wp_login_url( home_url( $path ) ) );
		exit;
	}
	if ( '' === $p ) {
		if ( '/khusus/pjpi' === rtrim( $path, '/' ) && '/' !== substr( $path, -1 ) ) {
			wp_safe_redirect( home_url( '/khusus/pjpi/' ), 301 );
			exit;
		}
		pt_pj_hub();
	}
	$J = pt_pj_journals();
	if ( ! isset( $J[ $p ] ) ) {
		status_header( 404 );
		pt_khusus_page( '<h1>Jurnal tidak ditemukan</h1><p><a href="' . esc_url( home_url( '/khusus/pjpi/' ) ) . '">Kembali ke PJPI Monitoring</a></p>', 404 );
	}
	$role = pt_pj_role_for( wp_get_current_user(), $p );
	if ( '' === $role ) {
		if ( $is_api ) {
			pt_mk_json( array( 'error' => 'Akun Anda tidak punya akses ke jurnal ini.' ), 403 );
		}
		pt_khusus_page( '<h1>Tidak ada akses</h1><p>Akun <b>' . esc_html( wp_get_current_user()->user_login ) . '</b> belum ditugaskan ke jurnal <b>' . esc_html( $J[ $p ]['ak'] ) . '</b>. Minta Admin PJPI menambahkan jurnal ini di profil Anda.</p><p><a href="' . esc_url( home_url( '/khusus/pjpi/' ) ) . '">Kembali ke PJPI Monitoring</a></p>', 403 );
	}
	if ( '' === $rest ) {
		wp_safe_redirect( home_url( '/khusus/pjpi/' . $p . '/' ), 301 );
		exit;
	}
	pt_pj_ctx( $p );
	if ( $is_api ) {
		if ( ! is_dir( $GLOBALS['pt_mk_ctx']['dir'] ) ) {
			wp_mkdir_p( $GLOBALS['pt_mk_ctx']['dir'] );
			@file_put_contents( PT_PJ_DATA . '/.htaccess', "Require all denied\nDeny from all\n" ); // phpcs:ignore
		}
		pt_mk_api( substr( $rest, 5 ) );
	}
	$f = ltrim( $rest, '/' );
	pt_pj_front( $p, '' === $f ? 'index.html' : $f );
}

/* ---------------- halaman daftar jurnal ---------------- */
function pt_pj_store_info( $p ) {
	$dir = 'jam' === $p ? PT_MK_DATA_DIR : PT_PJ_DATA . '/' . $p;
	$f   = $dir . '/mintakat-data.json';
	if ( ! is_file( $f ) ) {
		return array( 'n' => 0, 'at' => '', 'key' => false, 'tinggi' => 0 );
	}
	$d = json_decode( (string) file_get_contents( $f ), true );
	$n = 0;
	$r = 0;
	foreach ( (array) ( isset( $d['submissions'] ) ? $d['submissions'] : array() ) as $s ) {
		++$n;
		if ( isset( $s['priority'] ) && 'Tinggi' === $s['priority'] && ( empty( $s['status'] ) || ! preg_match( '/selesai|tutup/i', (string) $s['status'] ) ) ) {
			++$r;
		}
	}
	return array( 'n' => $n, 'at' => isset( $d['fetchedAt'] ) ? (string) $d['fetchedAt'] : '', 'key' => ! empty( $d['settings']['apiKey'] ), 'tinggi' => $r );
}
function pt_pj_hub() {
	$u    = wp_get_current_user();
	$rows = '';
	$lbl  = array( 'admin' => 'Admin', 'editor' => 'Editor', 'viewer' => 'Pembaca' );
	$n    = 0;
	foreach ( pt_pj_journals() as $p => $j ) {
		$r = pt_pj_role_for( $u, $p );
		if ( '' === $r ) {
			continue;
		}
		++$n;
		$i     = pt_pj_store_info( $p );
		$rows .= '<tr><td><a href="' . esc_url( home_url( '/khusus/pjpi/' . $p . '/' ) ) . '"><b>' . esc_html( $j['ak'] ) . '</b></a><div class="m">' . esc_html( $j['name'] ) . '</div></td><td>' . esc_html( $lbl[ $r ] ) . '</td><td class="n">' . ( $i['n'] ? (int) $i['n'] : '–' ) . '</td><td class="n">' . ( $i['tinggi'] ? '<b style="color:#b0451c">' . (int) $i['tinggi'] . '</b>' : '–' ) . '</td><td>' . ( $i['at'] ? esc_html( substr( str_replace( 'T', ' ', $i['at'] ), 0, 16 ) ) : '<span class="m">belum ada data</span>' ) . '</td><td>' . ( $i['key'] ? '✓' : '<span class="m">belum</span>' ) . '</td><td><a class="b" href="' . esc_url( home_url( '/khusus/pjpi/' . $p . '/' ) ) . '">Buka →</a></td></tr>';
	}
	if ( ! $n ) {
		pt_khusus_page( '<h1>PJPI Monitoring</h1><p>Akun <b>' . esc_html( $u->user_login ) . '</b> belum ditugaskan ke jurnal mana pun. Minta Admin PJPI menambahkan jurnal di profil Anda (WP Admin → Pengguna → Edit → Jurnal PJPI).</p><p><a href="' . esc_url( home_url( '/khusus/' ) ) . '">Kembali ke Aplikasi Khusus</a></p>', 403 );
	}
	$adm = current_user_can( 'pjpi_admin' ) ? '<p class="note">Penugasan: <a href="' . esc_url( admin_url( 'users.php' ) ) . '">WP Admin → Pengguna</a> → Edit pengguna → bagian <b>Jurnal PJPI</b>. Peran: PJPI — Admin pusat (semua jurnal), PJPI — Admin jurnal, PJPI — Editor, PJPI — Pembaca. ' . ( current_user_can( 'create_users' ) ? '<a href="' . esc_url( admin_url( 'user-new.php' ) ) . '">Tambah pengguna</a>.' : '' ) . '</p>' : '';
	pt_khusus_page(
		'<style>table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #d9cfbf;border-radius:10px;overflow:hidden;font-size:14px}th,td{padding:9px 12px;border-bottom:1px solid #ece4d6;text-align:left;vertical-align:top}th{background:#f5efe4;font-size:12px;letter-spacing:.03em}td.n{text-align:right}.m{color:#7a705f;font-size:12.5px}a.b{display:inline-block;padding:4px 10px;border:1px solid #c4572a;border-radius:7px;text-decoration:none;color:#c4572a;font-weight:600}main{max-width:1100px}</style>' .
		'<h1>PJPI Monitoring</h1><p class="lead">Pemantau naskah OJS seluruh jurnal Universitas Merdeka Malang — tracker redaksi, rekomendasi tindakan, draf email per kasus, dan ekspor Excel. Satu data terpisah untuk setiap jurnal.</p>' .
		'<table><tr><th>Jurnal</th><th>Peran Anda</th><th>Naskah</th><th>Prioritas tinggi</th><th>Sinkron terakhir</th><th>API key</th><th></th></tr>' . $rows . '</table>' . $adm .
		'<p class="note"><a href="' . esc_url( home_url( '/khusus/jurnal/' ) ) . '">Monitor Jurnal UNMER</a> · <a href="' . esc_url( home_url( '/khusus/' ) ) . '">Aplikasi Khusus</a></p>'
	);
}

/* ---------------- antarmuka (berkas Mintakat, disesuaikan per jurnal) ---------------- */
function pt_pj_front( $p, $f ) {
	$types = array( 'html' => 'text/html; charset=utf-8', 'js' => 'application/javascript; charset=utf-8', 'css' => 'text/css; charset=utf-8', 'png' => 'image/png', 'svg' => 'image/svg+xml', 'ico' => 'image/x-icon' );
	if ( ! preg_match( '#^[a-z0-9_-]+\.(html|js|css|png|svg|ico)$#i', $f, $m ) || ! is_file( PT_MK_APP_DIR . '/' . $f ) ) {
		status_header( 404 );
		exit;
	}
	$ext  = strtolower( $m[1] );
	$body = (string) file_get_contents( PT_MK_APP_DIR . '/' . $f );
	$c    = $GLOBALS['pt_mk_ctx'];
	$base = '/khusus/pjpi/' . $p . '/';
	if ( in_array( $ext, array( 'html', 'js', 'css' ), true ) ) {
		$body = str_replace( array( 'X-Mintakat', 'MintakatMonitoring' ), array( '%%XMK%%', '%%MKUA%%' ), $body );
		$map  = array(
			'<b>Mintakat — Admin redaksi</b>, <b>Mintakat — Editor</b>, atau <b>Mintakat — Pembaca</b>' => '<b>PJPI — Admin pusat</b>, <b>PJPI — Admin jurnal</b>, <b>PJPI — Editor</b>, atau <b>PJPI — Pembaca</b> (jurnal ditugaskan di profil pengguna)',
			'/khusus/mintakat/'                                => $base,
			'Mintakat Monitoring'                              => 'PJPI Monitoring · ' . $c['ak'],
			'Mintakat: Jurnal Arsitektur'                      => $c['name'],
			'Fakultas Teknik, Universitas Merdeka Malang'      => 'Universitas Merdeka Malang',
			'Mintakat-Internal'                                => $c['ak'] . '-Internal',
			'placeholder="jam"'                                => 'placeholder="' . $p . '"',
			'Mintakat'                                         => $c['ak'],
		);
		if ( 'jam' === $p ) {
			unset( $map['Mintakat'], $map['Mintakat: Jurnal Arsitektur'], $map['Mintakat-Internal'], $map['Fakultas Teknik, Universitas Merdeka Malang'] );
		}
		$body = strtr( $body, $map );
		$body = str_replace( array( '%%XMK%%', '%%MKUA%%' ), array( 'X-Mintakat', 'MintakatMonitoring' ), $body );
	}
	status_header( 200 );
	header( 'Content-Type: ' . $types[ $ext ] );
	header( 'X-Frame-Options: DENY' );
	header( 'X-Content-Type-Options: nosniff' );
	if ( 'index.html' === $f ) {
		$cfg   = array(
			'base'    => home_url( $base ),
			'home'    => home_url( '/khusus/pjpi/' ),
			'logout'  => wp_logout_url( home_url( '/' ) ),
			'profile' => admin_url( 'profile.php' ),
			'users'   => current_user_can( 'list_users' ) ? admin_url( 'users.php' ) : '',
			'addUser' => current_user_can( 'create_users' ) ? admin_url( 'user-new.php' ) : '',
			'journal' => array( 'p' => $p, 'ak' => $c['ak'], 'name' => $c['name'] ),
		);
		$inject = '<script>window.PT_MK=' . wp_json_encode( $cfg ) . ';</script>';
		$body   = str_replace( '<script src="templates.js"></script>', $inject . '<script src="templates.js"></script>', $body );
		$body   = str_replace( '<script src="app.js"></script>', '<script src="app.js"></script><script src="web-override.js"></script>', $body );
		$bar    = '<div style="background:#161412;color:#f3ede0;font:13px system-ui,sans-serif;padding:6px 14px;display:flex;gap:14px;flex-wrap:wrap"><b style="letter-spacing:.04em">PJPI</b><a style="color:#f3ede0" href="' . esc_url( home_url( '/khusus/pjpi/' ) ) . '">← Semua jurnal</a><span>' . esc_html( $c['name'] ) . '</span><a style="color:#f3ede0" href="' . esc_url( home_url( '/khusus/jurnal/' ) ) . '">Monitor Jurnal UNMER</a></div>';
		$body   = preg_replace( '#<body([^>]*)>#i', '<body$1>' . $bar, $body, 1 );
	}
	echo $body; // phpcs:ignore
	exit;
}

/* ---------------- penugasan jurnal di profil pengguna ---------------- */
function pt_pj_profile_fields( $user ) {
	if ( ! current_user_can( 'pjpi_admin' ) && ! current_user_can( 'promote_users' ) ) {
		return;
	}
	$sel = pt_pj_user_journals( $user );
	wp_nonce_field( 'pt_pj_profile', 'pt_pj_nonce' );
	echo '<h2>Jurnal PJPI</h2><p class="description">Jurnal yang dapat dibuka pengguna ini di PJPI Monitoring (berlaku untuk peran PJPI — Admin jurnal / Editor / Pembaca; PJPI — Admin pusat otomatis semua jurnal).</p><table class="form-table"><tr><th>Jurnal</th><td style="columns:3 220px">';
	echo '<label style="display:block"><input type="checkbox" name="pjpi_journals[]" value="*" ' . checked( in_array( '*', $sel, true ), true, false ) . '> <b>Semua jurnal</b></label>';
	foreach ( pt_pj_journals() as $p => $j ) {
		echo '<label style="display:block"><input type="checkbox" name="pjpi_journals[]" value="' . esc_attr( $p ) . '" ' . checked( in_array( $p, $sel, true ), true, false ) . '> ' . esc_html( $j['ak'] ) . ' <span class="description">(' . esc_html( $p ) . ')</span></label>';
	}
	echo '</td></tr></table>';
}
add_action( 'show_user_profile', 'pt_pj_profile_fields' );
add_action( 'edit_user_profile', 'pt_pj_profile_fields' );
add_action( 'user_new_form', 'pt_pj_profile_fields' );
function pt_pj_profile_save( $uid ) {
	if ( ( ! current_user_can( 'pjpi_admin' ) && ! current_user_can( 'promote_users' ) ) || ! isset( $_POST['pt_pj_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pt_pj_nonce'] ) ), 'pt_pj_profile' ) ) {
		return;
	}
	$ok  = array_merge( array( '*' ), array_keys( pt_pj_journals() ) );
	$in  = isset( $_POST['pjpi_journals'] ) ? array_map( 'sanitize_key', (array) wp_unslash( $_POST['pjpi_journals'] ) ) : array();
	update_user_meta( $uid, 'pjpi_journals', array_values( array_intersect( $in, $ok ) ) );
}
add_action( 'personal_options_update', 'pt_pj_profile_save' );
add_action( 'edit_user_profile_update', 'pt_pj_profile_save' );
add_action( 'user_register', 'pt_pj_profile_save' );
