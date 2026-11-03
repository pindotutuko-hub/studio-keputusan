<?php
/* Babat Alas v49 (K4): cadangan harian data pemain (akun, simpanan, kelas, peringkat, pengaturan).
   Dijalankan otomatis sekali sehari oleh permintaan pertama sesudah 24 jam (tanpa cron), atau dari Kontrol Gim.
   Disimpan di luar public_html bila bisa ditulis; 14 cadangan terbaru dipertahankan. */
if (!defined('BA_BK_KEEP')) { define('BA_BK_KEEP', 14); }
function ba_bk_dir(string $data): string {
	$data = realpath($data) ?: $data; $home = dirname($data, 5); /* data = /home/USER/public_html/pindotutuko.id/babat-alas/api/data → /home/USER */
	$out = $home . '/ba-backup';
	if ((is_dir($out) || @mkdir($out, 0750, true)) && is_writable($out)) { return $out; }
	$alt = $data . '/_backup'; if (!is_dir($alt)) { @mkdir($alt, 0750, true); }
	if (!is_file($alt . '/.htaccess')) { @file_put_contents($alt . '/.htaccess', "Require all denied\nDeny from all\n"); }
	return $alt;
}
function ba_bk_list(string $data): array { $d = ba_bk_dir($data); $f = glob($d . '/babat-alas-data-*.{zip,tar.gz}', GLOB_BRACE) ?: []; rsort($f); return $f; }
/** buat cadangan sekarang; kembalikan [berkas, jumlah file] atau [null, pesan galat] */
function ba_bk_make(string $data): array {
	$dir = ba_bk_dir($data); $stamp = date('Ymd-His'); $files = [];
	foreach (glob($data . '/*.php') ?: [] as $f) { $b = basename($f); if (preg_match('/^r_/', $b)) { continue; } $files[] = $f; }
	if (!$files) { return [null, 'tidak ada data']; }
	try {
		if (class_exists('ZipArchive')) { $out = $dir . '/babat-alas-data-' . $stamp . '.zip'; $z = new ZipArchive(); if ($z->open($out, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) { return [null, 'zip gagal dibuka']; } foreach ($files as $f) { $z->addFile($f, 'data/' . basename($f)); } $z->close(); }
		else { $tar = $dir . '/babat-alas-data-' . $stamp . '.tar'; $p = new PharData($tar); foreach ($files as $f) { $p->addFile($f, 'data/' . basename($f)); } $p->compress(Phar::GZ); unset($p); @unlink($tar); $out = $tar . '.gz'; }
	} catch (Throwable $e) { return [null, $e->getMessage()]; }
	$all = ba_bk_list($data); foreach (array_slice($all, BA_BK_KEEP) as $old) { @unlink($old); }
	@file_put_contents($data . '/bk_at.txt', (string) time());
	return [$out, count($files)];
}
/** dipanggil dari API: buat cadangan bila yang terakhir > 24 jam (dengan kunci agar tidak dobel) */
function ba_bk_daily(string $data): void {
	$at = (int) @file_get_contents($data . '/bk_at.txt'); if (time() - $at < 86400) { return; }
	$lk = @fopen($data . '/bk_lock.txt', 'c'); if (!$lk || !flock($lk, LOCK_EX | LOCK_NB)) { return; }
	$at = (int) @file_get_contents($data . '/bk_at.txt'); if (time() - $at >= 86400) { @ba_bk_make($data); }
	flock($lk, LOCK_UN); fclose($lk);
}
