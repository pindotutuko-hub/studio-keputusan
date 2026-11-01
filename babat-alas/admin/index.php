<?php
/**
 * Monitor admin Babat Alas — hanya untuk administrator WordPress pindotutuko.id.
 * Menampilkan pemain, aktivitas, kampung, kelas, perjanjian dagang; admin dapat menghapus akun atau mereset simpanan.
 */
declare(strict_types=1);
$ba_wpl = dirname(__DIR__, 2) . '/wp-load.php';
if (!is_file($ba_wpl)) { http_response_code(500); exit('WordPress tidak ditemukan.'); }
require $ba_wpl;
if (!is_user_logged_in()) { auth_redirect(); exit; }
if (!current_user_can('manage_options')) { wp_die('Hanya administrator situs yang boleh membuka monitor ini.', 403); }
nocache_headers();
header('X-Robots-Tag: noindex, nofollow');

const BA_DATA = __DIR__ . '/../api/data';
const BA_GUARD = "<?php http_response_code(404); exit; ?>\n";
function ba_rd(string $f): ?array { $p = BA_DATA . '/' . $f; if (!is_file($p)) { return null; } $s = (string) file_get_contents($p); $j = json_decode(substr($s, strlen(BA_GUARD)), true); return is_array($j) ? $j : null; }
function ba_upd(string $f, callable $fn): void { $p = BA_DATA . '/' . $f; if (!is_file($p)) { return; } $h = fopen($p, 'c+'); if (!$h) { return; } flock($h, LOCK_EX);
	$s = stream_get_contents($h); $cur = json_decode(substr((string) $s, strlen(BA_GUARD)), true); $new = $fn(is_array($cur) ? $cur : []);
	ftruncate($h, 0); rewind($h); fwrite($h, BA_GUARD . json_encode($new, JSON_UNESCAPED_UNICODE)); fflush($h); flock($h, LOCK_UN); fclose($h); }
function ba_free_claim(string $uid): void { ba_upd('dir.php', function ($d) use ($uid) { unset($d[$uid]); return $d; }); }
function ba_delete_user(string $uid, bool $account): void {
	@unlink(BA_DATA . '/s_' . $uid . '.php'); ba_free_claim($uid);
	foreach (glob(BA_DATA . '/lb_*.php') ?: [] as $lb) { ba_upd(basename($lb), function ($d) use ($uid) { unset($d[$uid]); return $d; }); }
	if ($account) { @unlink(BA_DATA . '/u_' . $uid . '.php'); ba_upd('deals.php', function ($d) use ($uid) { foreach ($d as $k => $v) { if (($v['from'] ?? '') === $uid || ($v['to'] ?? '') === $uid) { $d[$k]['st'] = 'ended'; } } return $d; }); }
}

$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	check_admin_referer('ba_admin');
	$uid = preg_replace('/[^a-f0-9]/', '', (string) ($_POST['uid'] ?? ''));
	$act = (string) ($_POST['act'] ?? '');
	if (strlen($uid) === 20 && is_file(BA_DATA . '/u_' . $uid . '.php')) {
		$u = ba_rd('u_' . $uid . '.php');
		if ($act === 'delete') { ba_delete_user($uid, true); $msg = 'Akun “' . esc_html($u['user'] ?? $uid) . '” beserta simpanan, wilayah, dan peringkatnya sudah dihapus.'; }
		elseif ($act === 'reset') { ba_delete_user($uid, false); $msg = 'Simpanan & wilayah “' . esc_html($u['user'] ?? $uid) . '” sudah direset (akun tetap ada).'; }
	} else { $msg = 'Pengguna tidak ditemukan.'; }
}

$now = time(); $users = [];
foreach (glob(BA_DATA . '/u_*.php') ?: [] as $f) {
	$uid = substr(basename($f, '.php'), 2); $u = ba_rd(basename($f)); if (!$u) { continue; }
	$s = ba_rd('s_' . $uid . '.php'); $m = $s['meta'] ?? [];
	$seen = max((int) ($u['seen'] ?? 0), (int) ($m['at'] ?? 0));
	$users[] = ['uid' => $uid, 'user' => $u['user'] ?? '', 'name' => $u['name'] ?? '', 'kampus' => $u['kampus'] ?? '', 'kelas' => $u['kelas'] ?? '', 'created' => (int) ($u['created'] ?? 0),
		'seen' => $seen, 'kampung' => $m['name'] ?? '', 'loc' => $m['loc'] ?? '', 'lat' => $m['lat'] ?? null, 'lon' => $m['lon'] ?? null, 'era' => $m['era'] ?? '', 'kk' => $m['kk'] ?? '',
		'month' => $m['month'] ?? '', 'score' => $m['score'] ?? '', 'flags' => $s['flagged'] ?? [], 'ver' => $s['ver'] ?? 0, 'owns' => $u['owns'] ?? []];
}
usort($users, fn($a, $b) => $b['seen'] <=> $a['seen']);
$online = count(array_filter($users, fn($x) => $now - $x['seen'] < 300)); $day = count(array_filter($users, fn($x) => $now - $x['seen'] < 86400));
$saves = count(array_filter($users, fn($x) => $x['ver'] > 0));
$classes = []; foreach (glob(BA_DATA . '/k_*.php') ?: [] as $f) { $k = ba_rd(basename($f)); if ($k) { $code = substr(basename($f, '.php'), 2); $classes[] = $k + ['code' => $code, 'n' => count(array_filter($users, fn($x) => $x['kelas'] === $code))]; } }
$deals = ba_rd('deals.php') ?: []; $activeDeals = count(array_filter($deals, fn($d) => ($d['st'] ?? '') === 'active'));
$byUid = []; foreach ($users as $x) { $byUid[$x['uid']] = $x['user']; }
$ago = function (int $t) use ($now): string { if (!$t) { return '–'; } $d = $now - $t; if ($d < 60) { return 'baru saja'; } if ($d < 3600) { return intdiv($d, 60) . ' mnt lalu'; } if ($d < 86400) { return intdiv($d, 3600) . ' jam lalu'; } return intdiv($d, 86400) . ' hari lalu'; };
$eras = ['', 'Babat alas', 'Dusun', 'Kampung', 'Desa', 'Kelurahan', 'Kota kecil', 'Kota'];
$nonce = wp_create_nonce('ba_admin');
?><!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Monitor Babat Alas</title>
<?php if (!empty($_GET['auto'])): ?><meta http-equiv="refresh" content="30"><?php endif; ?>
<style>
:root{--g:#1f6f4f;--ink:#1d1a16;--mut:#6b655b;--line:#e3dccd;--bg:#f6f1e7}*{box-sizing:border-box}body{margin:0;font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:var(--bg)}
header{background:#0f1e16;color:#fff;padding:14px 22px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}header h1{margin:0;font-size:19px}header a{color:#e0a526}
main{padding:18px 22px;max-width:1400px;margin:auto}.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-bottom:16px}.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px 14px}.card b{display:block;font-size:24px;color:var(--g)}.card span{color:var(--mut);font-size:12px}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden}th,td{padding:7px 9px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top;font-size:13px}th{background:#efe8da;position:sticky;top:0}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;background:#bbb}.on{background:#2f8f6a}.day{background:#e0a526}.flag{color:#a33a2a;font-size:11px}
button{border:0;border-radius:8px;padding:5px 9px;cursor:pointer;font-size:12px}.del{background:#a33a2a;color:#fff}.rst{background:#efe8da}.msg{background:#eaf3ee;border-left:4px solid var(--g);padding:9px 12px;border-radius:8px;margin-bottom:12px}
input[type=search]{padding:8px 11px;border:1px solid var(--line);border-radius:9px;width:min(420px,100%)}h2{font-size:16px;margin:22px 0 8px}.mut{color:var(--mut);font-size:12px}
</style></head><body>
<header><h1>🛰️ Monitor Babat Alas</h1><span class="mut" style="color:#cfc8b8">Diperbarui <?= esc_html(wp_date('d M Y H:i:s')) ?></span>
<a href="?<?= empty($_GET['auto']) ? 'auto=1' : '' ?>"><?= empty($_GET['auto']) ? '⟳ Segarkan otomatis (30 dtk)' : '⏸ Hentikan penyegaran otomatis' ?></a><a href="/babat-alas/">▶ Buka gim</a></header>
<main>
<?php if ($msg): ?><div class="msg"><?= $msg ?></div><?php endif; ?>
<div class="cards">
 <div class="card"><b><?= $online ?></b><span>sedang bermain (≤ 5 menit)</span></div>
 <div class="card"><b><?= $day ?></b><span>aktif 24 jam terakhir</span></div>
 <div class="card"><b><?= count($users) ?></b><span>akun terdaftar</span></div>
 <div class="card"><b><?= $saves ?></b><span>punya simpanan kampung</span></div>
 <div class="card"><b><?= count($classes) ?></b><span>kelas dosen</span></div>
 <div class="card"><b><?= $activeDeals ?></b><span>perjanjian dagang aktif</span></div>
</div>
<p class="mut">Pemain tamu tidak tercatat di server (simpanannya hanya di peramban masing-masing). "Sedang bermain" berdasarkan aktivitas terakhir ke server (simpan otomatis tiap ±1 menit).</p>
<h2>👥 Pemain</h2>
<input type="search" id="q" placeholder="Cari nama pengguna, kampung, kampus, kelas, lokasi…" oninput="f(this.value)">
<div style="overflow:auto;max-height:70vh;margin-top:8px"><table id="tb"><thead><tr><th>Status</th><th>Pengguna</th><th>Kampung</th><th>Lokasi</th><th>Era · KK</th><th>Skor</th><th>Kampus · Kelas</th><th>Daftar</th><th>Aksi</th></tr></thead><tbody>
<?php foreach ($users as $x): $d = $now - $x['seen']; $cls = $d < 300 ? 'on' : ($d < 86400 ? 'day' : ''); ?>
<tr><td><span class="dot <?= $cls ?>"></span><?= esc_html($ago($x['seen'])) ?></td>
<td><b><?= esc_html($x['user']) ?></b><?= $x['owns'] ? '<br><span class="mut">👩‍🏫 dosen (' . count($x['owns']) . ' kelas)</span>' : '' ?></td>
<td><?= esc_html($x['kampung'] ?: '–') ?><?= $x['flags'] ? '<br><span class="flag">⚠ ' . esc_html(implode(', ', $x['flags'])) . '</span>' : '' ?></td>
<td><?php if ($x['lat'] !== null): ?><a href="https://www.openstreetmap.org/?mlat=<?= (float) $x['lat'] ?>&amp;mlon=<?= (float) $x['lon'] ?>#map=16/<?= (float) $x['lat'] ?>/<?= (float) $x['lon'] ?>" target="_blank" rel="noopener"><?= esc_html($x['loc'] ?: 'peta') ?></a><?php else: ?>–<?php endif; ?></td>
<td><?= $x['era'] !== '' ? esc_html(($eras[(int) $x['era']] ?? $x['era']) . ' · ' . $x['kk'] . ' KK') : '–' ?><br><span class="mut"><?= $x['month'] !== '' ? 'bulan ke-' . (int) $x['month'] : '' ?></span></td>
<td><?= esc_html((string) $x['score']) ?></td><td><?= esc_html($x['kampus'] ?: '–') ?><br><span class="mut"><?= esc_html($x['kelas'] ?: '') ?></span></td>
<td><span class="mut"><?= $x['created'] ? esc_html(wp_date('d M Y', $x['created'])) : '–' ?></span></td>
<td><form method="post" onsubmit="return confirm('Reset simpanan & lepaskan wilayah <?= esc_js($x['user']) ?>? Akun tetap ada.')"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="uid" value="<?= $x['uid'] ?>"><input type="hidden" name="act" value="reset"><button class="rst">Reset simpanan</button></form>
<form method="post" style="margin-top:4px" onsubmit="return confirm('HAPUS akun <?= esc_js($x['user']) ?> beserta simpanan, wilayah, dan peringkatnya? Tindakan ini tidak bisa dibatalkan.')"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="uid" value="<?= $x['uid'] ?>"><input type="hidden" name="act" value="delete"><button class="del">Hapus akun</button></form></td></tr>
<?php endforeach; if (!$users): ?><tr><td colspan="9">Belum ada akun terdaftar.</td></tr><?php endif; ?>
</tbody></table></div>
<h2>🎓 Kelas</h2>
<table><thead><tr><th>Kode</th><th>Nama kelas</th><th>Dosen</th><th>Tantangan</th><th>Anggota</th><th>Dibuat</th></tr></thead><tbody>
<?php foreach ($classes as $k): ?><tr><td><b><?= esc_html($k['code']) ?></b></td><td><?= esc_html($k['nama'] ?? '') ?></td><td><?= esc_html($k['ownerUser'] ?? ($byUid[$k['owner']] ?? '')) ?></td><td><?= esc_html($k['tantangan'] ?? '') ?: '–' ?></td><td><?= (int) $k['n'] ?></td><td><span class="mut"><?= !empty($k['created']) ? esc_html(wp_date('d M Y', (int) $k['created'])) : '' ?></span></td></tr><?php endforeach; if (!$classes): ?><tr><td colspan="6">Belum ada kelas.</td></tr><?php endif; ?>
</tbody></table>
<h2>🤝 Perjanjian dagang</h2>
<table><thead><tr><th>Dari</th><th>Kepada</th><th>Komoditas</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>
<?php $nd = 0; foreach (array_reverse($deals, true) as $id => $dd): if ($nd++ >= 100) { break; } ?><tr><td><?= esc_html($byUid[$dd['from']] ?? '?') ?></td><td><?= esc_html($byUid[$dd['to']] ?? '?') ?></td><td><?= esc_html($dd['com'] ?? '') ?></td><td><?= esc_html($dd['st'] ?? '') ?></td><td><span class="mut"><?= !empty($dd['t']) ? esc_html(wp_date('d M Y H:i', (int) $dd['t'])) : '' ?></span></td></tr><?php endforeach; if (!$deals): ?><tr><td colspan="5">Belum ada perjanjian.</td></tr><?php endif; ?>
</tbody></table>
<p class="mut" style="margin-top:20px">Hanya administrator WordPress yang dapat membuka halaman ini. Penghapusan bersifat permanen.</p>
</main>
<script>function f(v){v=v.toLowerCase();document.querySelectorAll('#tb tbody tr').forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(v)?'':'none'})}</script>
</body></html>
