<?php
/**
 * Aplikasi Khusus — Direktori Jurnal: pembaruan "Peringatan OJS" langsung dari API OJS UNMER.
 * Aktif begitu Pengelola memasukkan API token OJS (dari akun admin/editor yang diberi PUSIM).
 * Endpoint (POST, nonce pt_jr, peran jurnal_update): ojs-cfg, ojs-sync, ojs-build.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function pt_jo_token() {
	return (string) get_option( 'pt_ojs_api_token', '' );
}

function pt_jo_get( $path, $q = array() ) {
	$tok = pt_jo_token();
	if ( '' === $tok ) {
		return array( 0, null );
	}
	$q['apiToken'] = $tok;
	$url           = PT_JR_OJS . ltrim( $path, '/' ) . '?' . http_build_query( $q );
	list( $c, $h ) = pt_jr_get( $url, 60 );
	$j             = 200 === (int) $c ? json_decode( (string) $h, true ) : null;
	return array( (int) $c, is_array( $j ) ? $j : null );
}

function pt_jo_loc( $v ) {
	if ( ! is_array( $v ) ) {
		return (string) $v;
	}
	foreach ( array( 'en_US', 'id_ID' ) as $l ) {
		if ( ! empty( $v[ $l ] ) ) {
			return (string) $v[ $l ];
		}
	}
	$f = reset( $v );
	return is_string( $f ) ? $f : '';
}

/** Ambil satu jurnal; kembalikan struktur yang sama dengan berkas dir-ojs-data.js. */
function pt_jo_sync_one( $p ) {
	$out = array( 'name' => $p, 'incomplete' => 0, 'subs' => array() );
	$off = 0;
	$all = array();
	do {
		list( $c, $j ) = pt_jo_get( $p . '/api/v1/submissions', array( 'status' => 1, 'count' => 100, 'offset' => $off ) );
		if ( 200 !== $c || ! $j ) {
			return array( 'error' => 'HTTP ' . $c . ' saat membaca naskah ' . $p );
		}
		$all  = array_merge( $all, (array) $j['items'] );
		$off += 100;
	} while ( $off < (int) $j['itemsMax'] && $off < 2000 );
	$now = time();
	foreach ( $all as $it ) {
		if ( ! empty( $it['submissionProgress'] ) ) {
			++$out['incomplete'];
			continue;
		}
		$last = isset( $it['dateLastActivity'] ) ? substr( $it['dateLastActivity'], 0, 10 ) : '';
		$row  = array( 'id' => (int) $it['id'], 'stage' => (int) $it['stageId'], 'st' => '', 'rr' => null, 'ra' => new stdClass(), 'raD' => array(), 'sub' => substr( (string) $it['dateSubmitted'], 0, 10 ), 'last' => $last );
		$idle = $last ? ( $now - strtotime( $last ) ) / 86400 : 9999;
		if ( $idle <= 365 ) {
			list( $c, $s ) = pt_jo_get( $p . '/api/v1/submissions/' . (int) $it['id'] );
			if ( 200 === $c && $s ) {
				foreach ( (array) $s['stages'] as $sg ) {
					if ( ! empty( $sg['isActiveStage'] ) ) {
						$row['st'] = isset( $sg['status'] ) ? (string) $sg['status'] : '';
					}
				}
				$rr = ! empty( $s['reviewRounds'] ) ? end( $s['reviewRounds'] ) : null;
				if ( $rr ) {
					$row['rr'] = array( 'n' => (int) $rr['round'], 'sid' => (int) $rr['statusId'], 'st' => (string) $rr['status'] );
					$ra        = array();
					foreach ( (array) $s['reviewAssignments'] as $a ) {
						if ( (int) $a['round'] === (int) $rr['round'] ) {
							$k        = (string) (int) $a['statusId'];
							$ra[ $k ] = isset( $ra[ $k ] ) ? $ra[ $k ] + 1 : 1;
							$row['raD'][] = array( 's' => (int) $a['statusId'], 'd' => (string) $a['due'], 'r' => (string) $a['responseDue'] );
						}
					}
					$row['ra'] = $ra ? $ra : new stdClass();
				}
			}
		}
		$out['subs'][] = $row;
	}
	list( $c, $ed ) = pt_jo_get( $p . '/api/v1/stats/editorial' );
	if ( $ed ) {
		$m = array();
		foreach ( $ed as $x ) {
			$m[ $x['key'] ] = $x['value'];
		}
		$out['ed'] = array( 'acceptanceRate' => isset( $m['acceptanceRate'] ) ? $m['acceptanceRate'] : null, 'daysToDecision' => isset( $m['daysToDecision'] ) ? $m['daysToDecision'] : null, 'submissionsReceived' => isset( $m['submissionsReceived'] ) ? $m['submissionsReceived'] : null );
	}
	list( $c, $is ) = pt_jo_get( $p . '/api/v1/issues', array( 'count' => 1, 'isPublished' => 'true' ) );
	if ( $is ) {
		$out['issues']    = (int) $is['itemsMax'];
		$out['lastIssue'] = ! empty( $is['items'][0]['datePublished'] ) ? (string) $is['items'][0]['datePublished'] : '';
	}
	return $out;
}

function pt_jo_api( $ep ) {
	if ( 'ojs-cfg' === $ep ) {
		pt_jr_need_update();
		$b = pt_jr_body();
		if ( ! empty( $b['clear'] ) ) {
			delete_option( 'pt_ojs_api_token' );
		} elseif ( ! empty( $b['token'] ) ) {
			update_option( 'pt_ojs_api_token', preg_replace( '/[^A-Za-z0-9._\-]/', '', (string) $b['token'] ), false );
		}
		$tok  = pt_jo_token();
		$test = null;
		if ( '' !== $tok ) {
			list( $c, $j ) = pt_jo_get( 'index/api/v1/contexts', array( 'count' => 100, 'isEnabled' => 'true' ) );
			$paths         = array();
			foreach ( (array) ( $j ? $j['items'] : array() ) as $x ) {
				$paths[] = array( 'p' => (string) $x['urlPath'], 'n' => pt_jo_loc( $x['name'] ) );
			}
			$test = array( 'code' => $c, 'journals' => $paths );
		}
		pt_jr_json( array( 'ok' => true, 'token' => $tok ? '••••' . substr( $tok, -4 ) : '', 'test' => $test, 'last' => get_option( 'pt_ojs_last_sync', '' ) ) );
	}
	if ( 'ojs-sync' === $ep ) {
		pt_jr_need_update();
		if ( '' === pt_jo_token() ) {
			pt_jr_err( 'API token OJS belum diisi.', 400 );
		}
		$b = pt_jr_body();
		$p = isset( $b['j'] ) ? sanitize_key( $b['j'] ) : '';
		if ( '' === $p || ! pt_jr_path_ok( $p ) ) {
			pt_jr_err( 'Kode jurnal tidak sah.' );
		}
		@set_time_limit( 300 ); // phpcs:ignore
		$r = pt_jo_sync_one( $p );
		if ( isset( $r['error'] ) ) {
			pt_jr_err( $r['error'], 502 );
		}
		if ( ! empty( $b['n'] ) ) {
			$r['name'] = sanitize_text_field( (string) $b['n'] );
		}
		pt_jr_write( 'ojs-' . $p . '.json', $r );
		pt_jr_json( array( 'ok' => true, 'j' => $p, 'aktif' => count( $r['subs'] ), 'inc' => $r['incomplete'] ) );
	}
	if ( 'ojs-build' === $ep ) {
		pt_jr_need_update();
		$b    = pt_jr_body();
		$list = isset( $b['js'] ) && is_array( $b['js'] ) ? array_map( 'sanitize_key', $b['js'] ) : array();
		$j    = array();
		foreach ( $list as $p ) {
			$d = pt_jr_read( 'ojs-' . $p . '.json', null );
			if ( is_array( $d ) ) {
				$j[ $p ] = $d;
			}
		}
		if ( ! $j ) {
			pt_jr_err( 'Belum ada data jurnal yang tersinkron.', 400 );
		}
		$bulan = array( 1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember' );
		$at    = current_time( 'Y-m-d' );
		$lbl   = (int) substr( $at, 8, 2 ) . ' ' . $bulan[ (int) substr( $at, 5, 2 ) ] . ' ' . substr( $at, 0, 4 );
		$js    = 'window.PT_OJS=' . wp_json_encode( array( 'at' => $at, 'atLabel' => $lbl, 'src' => 'api', 'j' => $j ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . ';';
		$dst   = PT_JR_DIRAPP . '/dir-ojs-data.js';
		if ( file_exists( $dst ) ) {
			@copy( $dst, PT_JR_DATA . '/dir-ojs-data.prev.js' ); // phpcs:ignore
		}
		if ( false === file_put_contents( $dst, $js ) ) { // phpcs:ignore
			pt_jr_err( 'Gagal menulis berkas data.', 500 );
		}
		update_option( 'pt_ojs_last_sync', $at, false );
		pt_jr_json( array( 'ok' => true, 'n' => count( $j ), 'at' => $lbl ) );
	}
	if ( 'akr-progress' === $ep ) {
		pt_jr_need_update();
		$b = pt_jr_body();
		$k = isset( $b['j'] ) ? sanitize_key( $b['j'] ) : '';
		if ( '' === $k || ! pt_jr_path_ok( $k ) ) {
			pt_jr_err( 'Kode jurnal tidak sah.' );
		}
		$cur = pt_jr_read( 'akr-progress.json', array( 'j' => array() ) );
		if ( ! is_array( $cur ) || ! isset( $cur['j'] ) || ! is_array( $cur['j'] ) ) {
			$cur = array( 'j' => array() );
		}
		$steps = array();
		foreach ( (array) ( isset( $b['steps'] ) ? $b['steps'] : array() ) as $id => $v ) {
			if ( ! preg_match( '/^S\d{1,2}$/', (string) $id ) || ! is_array( $v ) ) {
				continue;
			}
			$st = isset( $v['s'] ) && in_array( $v['s'], array( 'done', 'doing', 'todo' ), true ) ? $v['s'] : '';
			$nt = isset( $v['note'] ) ? mb_substr( sanitize_text_field( (string) $v['note'] ), 0, 300 ) : '';
			if ( '' === $st && '' === $nt ) {
				continue;
			}
			$steps[ $id ] = array( 's' => $st, 'note' => $nt, 'd' => current_time( 'Y-m-d' ) );
		}
		$plan   = isset( $b['plan'] ) && preg_match( '/^\d{4}-\d{2}$/', (string) $b['plan'] ) ? (string) $b['plan'] : '';
		$target = isset( $b['target'] ) && preg_match( '/^Peringkat [1-4]$/', (string) $b['target'] ) ? (string) $b['target'] : '';
		$cur['j'][ $k ] = array( 'steps' => (object) $steps, 'plan' => $plan, 'target' => $target );
		$cur['at']      = current_time( 'c' );
		$cur['by']      = wp_get_current_user()->display_name;
		pt_jr_write( 'akr-progress.json', $cur );
		@file_put_contents( PT_JR_DIRAPP . '/dir-akr-progress.js', 'window.PT_AKRP=' . wp_json_encode( $cur, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . ';' ); // phpcs:ignore
		pt_jr_json( array( 'ok' => true, 'data' => $cur ) );
	}
	return false;
}
