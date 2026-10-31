/* Impor riwayat kunjungan blog lama (31-10-2026): sekali saja, tercatat di opsi pindotutuko_visitor_import_blogspot. */
add_action( 'init', function () {
	if ( get_option( 'pindotutuko_visitor_import_blogspot' ) ) {
		return;
	}
	$rec = array( 'source' => 'pindotutuko.blogspot.com', 'views' => 6070, 'basis' => 'Blogger Stats, All Time pageviews', 'asof' => '2026-10-31', 'added_at' => gmdate( 'c' ) );
	if ( ! add_option( 'pindotutuko_visitor_import_blogspot', $rec, '', 'no' ) ) {
		return;
	}
	$stats = get_option( 'pindotutuko_visitor_stats', array( 'total' => 0, 'days' => array(), 'countries' => array() ) );
	if ( ! is_array( $stats ) ) {
		$stats = array( 'total' => 0, 'days' => array(), 'countries' => array() );
	}
	$stats['total'] = ( isset( $stats['total'] ) ? (int) $stats['total'] : 0 ) + 6070;
	update_option( 'pindotutuko_visitor_stats', $stats );
}, 5 );
