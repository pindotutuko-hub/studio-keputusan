<?php
/**
 * Monitor admin Babat Alas — hanya untuk administrator WordPress pindotutuko.id.
 * Menampilkan pemain, aktivitas, kampung, kelas, perjanjian dagang; admin dapat menghapus akun atau mereset simpanan.
 */
declare(strict_types=1);
$ba_wpl = dirname(__DIR__, 2) . '/wp-load.php';
if (!is_file($ba_wpl)) { http_response_code(500); exit('WordPress tidak ditemukan.'); }
require $ba_wpl;
if (!is_user_logged_in()) { nocache_headers(); wp_safe_redirect(home_url('/khusus/?to=' . rawurlencode('/babat-alas/admin/') . '#masuk')); exit; }
if (!current_user_can('manage_options')) { wp_die('Akun ini bukan administrator, jadi tidak bisa membuka Kontrol Gim Babat Alas. <a href="' . esc_url(wp_logout_url(home_url('/khusus/?to=' . rawurlencode('/babat-alas/admin/') . '#masuk'))) . '">Keluar dan masuk dengan akun lain</a>.', 'Kontrol Gim Babat Alas', ['response' => 403]); }
nocache_headers();
header('X-Robots-Tag: noindex, nofollow');

const BA_DATA = __DIR__ . '/../api/data';
const BA_GUARD = "<?php http_response_code(404); exit; ?>\n";
function ba_rd(string $f): ?array { $p = BA_DATA . '/' . $f; if (!is_file($p)) { return null; } $s = (string) file_get_contents($p); $j = json_decode(substr($s, strlen(BA_GUARD)), true); return is_array($j) ? $j : null; }
function ba_upd(string $f, callable $fn): void { $p = BA_DATA . '/' . $f; if (!is_file($p)) { return; } $h = fopen($p, 'c+'); if (!$h) { return; } flock($h, LOCK_EX);
	$s = stream_get_contents($h); $cur = json_decode(substr((string) $s, strlen(BA_GUARD)), true); $new = $fn(is_array($cur) ? $cur : []);
	ftruncate($h, 0); rewind($h); fwrite($h, BA_GUARD . json_encode($new, JSON_UNESCAPED_UNICODE)); fflush($h); flock($h, LOCK_UN); fclose($h); }
function ba_put(string $f, array $v): void { $p = BA_DATA . '/' . $f; $h = fopen($p, 'c+'); if (!$h) { return; } flock($h, LOCK_EX); ftruncate($h, 0); rewind($h); fwrite($h, BA_GUARD . json_encode($v, JSON_UNESCAPED_UNICODE)); fflush($h); flock($h, LOCK_UN); fclose($h); }
const BA_CFG_DEF = ['announce' => '', 'announceId' => 0, 'maint' => false, 'maintMsg' => '', 'regOpen' => true, 'guestOk' => true, 'buildMul' => 1.0, 'maxSpeed' => 3, 'disaster' => '', 'botMode' => 'normal', 'autoBan' => false, 'tgToken' => '', 'tgChat' => ''];
function ba_cfg(): array { $c = ba_rd('cfg.php') ?: []; return array_merge(BA_CFG_DEF, array_intersect_key($c, BA_CFG_DEF)); }
function ba_tg(string $tok, string $path, array $data = []): ?array { if ($tok === '') { return null; } $url = 'https://api.telegram.org/bot' . $tok . '/' . $path; $q = http_build_query($data);
	if (function_exists('curl_init')) { $ch = curl_init($url); curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $q, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8]); $r = curl_exec($ch); curl_close($ch); }
	else { $r = @file_get_contents($url, false, stream_context_create(['http' => ['method' => 'POST', 'header' => 'Content-Type: application/x-www-form-urlencoded', 'content' => $q, 'timeout' => 8]])); }
	$j = is_string($r) ? json_decode($r, true) : null; return is_array($j) ? $j : null; }
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
	$txt = fn(string $k, int $max): string => mb_substr(trim(preg_replace('/[\x00-\x09\x0B-\x1F\x7F<>]/u', '', wp_unslash((string) ($_POST[$k] ?? ''))) ?? ''), 0, $max);
	if ($act === 'cfg') {
		$old = ba_cfg(); $ann = $txt('announce', 300);
		$new = ['announce' => $ann, 'announceId' => $ann === '' ? 0 : ($ann === $old['announce'] && empty($_POST['reshow']) ? (int) $old['announceId'] : time()),
			'maint' => !empty($_POST['maint']), 'maintMsg' => $txt('maintMsg', 300), 'regOpen' => !empty($_POST['regOpen']), 'guestOk' => !empty($_POST['guestOk']),
			'buildMul' => max(0.25, min(10.0, round((float) ($_POST['buildMul'] ?? 1), 2))), 'maxSpeed' => max(1, min(3, (int) ($_POST['maxSpeed'] ?? 3))),
			'disaster' => in_array($_POST['disaster'] ?? '', ['', 'normal', 'rendah', 'mati'], true) ? (string) $_POST['disaster'] : '',
			'botMode' => in_array($_POST['botMode'] ?? '', ['off', 'normal', 'strict'], true) ? (string) $_POST['botMode'] : 'normal', 'autoBan' => !empty($_POST['autoBan']),
			'tgToken' => !empty($_POST['tgClear']) ? '' : (preg_match('/^\d{5,15}:[A-Za-z0-9_-]{30,60}$/', trim((string) ($_POST['tgToken'] ?? ''))) ? trim((string) $_POST['tgToken']) : (string) $old['tgToken']), 'tgChat' => !empty($_POST['tgClear']) ? '' : preg_replace('/[^0-9-]/', '', (string) ($_POST['tgChat'] ?? $old['tgChat'])),
			'by' => wp_get_current_user()->user_login, 'at' => time()];
		ba_put('cfg.php', $new); $msg = '✅ Pengaturan gim disimpan. Pemain menerimanya dalam ±1 menit (saat sinyal berikutnya) atau saat membuka gim.';
	} elseif ($act === 'testmail') {
		$to = 'pindotutuko@gmail.com';
		$ok = @mail($to, 'Babat Alas: uji email peringatan', "Ini email uji dari Kontrol Gim Babat Alas.\nJika email ini sampai, peringatan pemain yang dicurigai bot/AI juga akan sampai ke alamat ini.\n\nDikirim oleh: " . wp_get_current_user()->user_login . "\nWaktu: " . wp_date('d M Y H:i') . "\n", "From: Babat Alas <noreply@pindotutuko.id>\r\nContent-Type: text/plain; charset=UTF-8");
		$msg = $ok ? '✉ Email uji dikirim ke ' . esc_html($to) . '. Periksa kotak masuk (dan folder Spam) dalam beberapa menit.' : '⚠ Server menolak mengirim email (fungsi mail() gagal). Peringatan bot hanya tampil di halaman ini.';
	} elseif ($act === 'tgchat') {
		$c = ba_cfg(); $j = ba_tg((string) $c['tgToken'], 'getUpdates'); $chat = '';
		foreach (array_reverse($j['result'] ?? []) as $up) { $m = $up['message'] ?? $up['my_chat_member'] ?? null; if ($m && isset($m['chat']['id'])) { $chat = (string) $m['chat']['id']; break; } }
		if ($chat !== '') { $raw = ba_rd('cfg.php') ?: []; $raw['tgChat'] = $chat; ba_put('cfg.php', $raw); $msg = '✅ Chat ID Telegram ditemukan dan disimpan: ' . esc_html($chat) . '. Sekarang tekan “Kirim notifikasi uji”.'; }
		else { $msg = $c['tgToken'] === '' ? '⚠ Isi dan simpan token bot dulu.' : '⚠ Belum ada pesan ke bot. Buka bot Anda di Telegram, kirim /start, lalu tekan tombol ini lagi.'; }
	} elseif ($act === 'tgtest') {
		$c = ba_cfg(); $j = ba_tg((string) $c['tgToken'], 'sendMessage', ['chat_id' => $c['tgChat'], 'text' => '✅ Uji notifikasi Kontrol Gim Babat Alas berhasil. Peringatan pemain yang dicurigai bot/AI akan dikirim ke sini.']);
		$msg = !empty($j['ok']) ? '📲 Notifikasi uji terkirim ke Telegram.' : '⚠ Gagal mengirim ke Telegram' . (!empty($j['description']) ? ': ' . esc_html((string) $j['description']) : ' (periksa token & chat ID, atau server tidak bisa menghubungi Telegram).');
	} elseif ($act === 'bkmake') { require_once __DIR__ . '/../api/backup.php'; [$f, $n] = ba_bk_make(BA_DATA); $msg = $f ? '💾 Cadangan dibuat: ' . esc_html(basename($f)) . ' (' . (int) $n . ' berkas data).' : '⚠ Cadangan gagal: ' . esc_html((string) $n);
	} elseif ($act === 'bkdl') { require_once __DIR__ . '/../api/backup.php'; $l = ba_bk_list(BA_DATA); $want = basename((string) ($_POST['f'] ?? '')); $f = ''; foreach ($l as $x) { if (basename($x) === $want) { $f = $x; } }
		if ($f && is_file($f)) { nocache_headers(); header('Content-Type: application/octet-stream'); header('Content-Disposition: attachment; filename="' . basename($f) . '"'); header('Content-Length: ' . filesize($f)); readfile($f); exit; } $msg = 'Berkas cadangan tidak ditemukan.';
	} elseif ($act === 'clearalerts') { ba_put('alerts.php', []); $msg = 'Log peringatan dikosongkan.';
	} elseif (strlen($uid) === 20 && is_file(BA_DATA . '/u_' . $uid . '.php')) {
		$u = ba_rd('u_' . $uid . '.php');
		if ($act === 'delete') { ba_delete_user($uid, true); $msg = 'Akun “' . esc_html($u['user'] ?? $uid) . '” beserta simpanan, wilayah, dan peringkatnya sudah dihapus.'; }
		elseif ($act === 'ban') { ba_upd('u_' . $uid . '.php', function ($x) { $x['ban'] = time(); $x['tokens'] = []; return $x; }); ba_free_claim($uid); foreach (glob(BA_DATA . '/lb_*.php') ?: [] as $lb) { ba_upd(basename($lb), function ($d) use ($uid) { unset($d[$uid]); return $d; }); } $msg = '⛔ “' . esc_html($u['user'] ?? $uid) . '” diblokir: tidak bisa masuk/menyimpan, dihapus dari peringkat dan wilayah.'; }
		elseif ($act === 'grant') { $amt = max(0, min(6070, round((float) ($_POST['amt'] ?? 0), 2))); if ($amt > 0) { ba_upd('u_' . $uid . '.php', function ($x) use ($amt) { $x['grantPend'] = (float) ($x['grantPend'] ?? 0) + $amt; $x['grantTot'] = (float) ($x['grantTot'] ?? 0) + $amt; return $x; }); $msg = '🎁 Dana ' . $amt . ' koin (≈ Rp ' . number_format($amt * 100 / 607, 1, ',', '.') . ' miliar) untuk “' . esc_html($u['user'] ?? $uid) . '” akan masuk pada simpanan berikutnya.'; } else { $msg = 'Jumlah dana tidak valid.'; } }
		elseif ($act === 'unban') { ba_upd('u_' . $uid . '.php', function ($x) { unset($x['ban']); return $x; }); $msg = 'Blokir “' . esc_html($u['user'] ?? $uid) . '” dibuka.'; }
		elseif ($act === 'clearflags') { ba_upd('s_' . $uid . '.php', function ($s) { $s['flagged'] = []; if (isset($s['meta'])) { $s['meta']['flag'] = 0; } return $s; }); $msg = 'Tanda anti-curang simpanan “' . esc_html($u['user'] ?? $uid) . '” dihapus; simpanan berikutnya dinilai ulang untuk peringkat.'; }
		elseif ($act === 'botok') { ba_upd('u_' . $uid . '.php', function ($x) { unset($x['bot']); $x['botOk'] = time(); return $x; }); $msg = '“' . esc_html($u['user'] ?? $uid) . '” ditandai bukan bot; peringatan dihapus.'; }
		elseif ($act === 'reset') { ba_delete_user($uid, false); $msg = 'Simpanan & wilayah “' . esc_html($u['user'] ?? $uid) . '” sudah direset (akun tetap ada).'; }
	} else { $msg = 'Pengguna tidak ditemukan.'; }
	set_transient('ba_adm_msg_' . get_current_user_id(), $msg, 120);
	wp_safe_redirect(strtok((string) $_SERVER['REQUEST_URI'], '?') . '#' . (in_array($act, ['cfg', 'testmail', 'tgchat', 'tgtest', 'bkmake'], true) ? 'setel' : ($act === 'clearalerts' ? 'log' : 'pemain'))); exit;
}
if (!$msg && ($tm = get_transient('ba_adm_msg_' . get_current_user_id()))) { $msg = (string) $tm; delete_transient('ba_adm_msg_' . get_current_user_id()); }

$now = time();
$ago = function (int $t) use ($now): string { if (!$t) { return '–'; } $d = $now - $t; if ($d < 60) { return 'baru saja'; } if ($d < 3600) { return intdiv($d, 60) . ' mnt lalu'; } if ($d < 86400) { return intdiv($d, 3600) . ' jam lalu'; } return intdiv($d, 86400) . ' hari lalu'; };
$users = [];
foreach (glob(BA_DATA . '/u_*.php') ?: [] as $f) {
	$uid = substr(basename($f, '.php'), 2); $u = ba_rd(basename($f)); if (!$u) { continue; }
	$s = ba_rd('s_' . $uid . '.php'); $m = $s['meta'] ?? [];
	$seen = max((int) ($u['seen'] ?? 0), (int) ($m['at'] ?? 0));
	$users[] = ['uid' => $uid, 'user' => $u['user'] ?? '', 'name' => $u['name'] ?? '', 'kampus' => $u['kampus'] ?? '', 'kelas' => $u['kelas'] ?? '', 'created' => (int) ($u['created'] ?? 0),
		'seen' => $seen, 'kampung' => $m['name'] ?? '', 'loc' => $m['loc'] ?? '', 'lat' => $m['lat'] ?? null, 'lon' => $m['lon'] ?? null, 'era' => $m['era'] ?? '', 'kk' => $m['kk'] ?? '',
		'month' => $m['month'] ?? '', 'score' => $m['score'] ?? '', 'bot' => $u['bot'] ?? null, 'ban' => $u['ban'] ?? 0, 'flags' => $s['flagged'] ?? [], 'ver' => $s['ver'] ?? 0, 'owns' => $u['owns'] ?? [],
		'coin' => isset($s['state']['res']['coin']) ? (float) $s['state']['res']['coin'] : null, 'loan' => (float) ($s['state']['loan']['left'] ?? 0), 'gTot' => (float) ($u['grantTot'] ?? 0), 'gPend' => (float) ($u['grantPend'] ?? 0)];
}
usort($users, fn($a, $b) => $b['seen'] <=> $a['seen']);
$online = count(array_filter($users, fn($x) => $now - $x['seen'] < 300)); $day = count(array_filter($users, fn($x) => $now - $x['seen'] < 86400));
$saves = count(array_filter($users, fn($x) => $x['ver'] > 0));
$classes = []; foreach (glob(BA_DATA . '/k_*.php') ?: [] as $f) { $k = ba_rd(basename($f)); if ($k) { $code = substr(basename($f, '.php'), 2); $classes[] = $k + ['code' => $code, 'n' => count(array_filter($users, fn($x) => $x['kelas'] === $code))]; } }
$deals = ba_rd('deals.php') ?: []; $activeDeals = count(array_filter($deals, fn($d) => ($d['st'] ?? '') === 'active'));
$byUid = []; foreach ($users as $x) { $byUid[$x['uid']] = $x['user']; }
$cfg = ba_cfg(); $cfgRaw = ba_rd('cfg.php') ?: [];
$live = ba_rd('live.php') ?: []; foreach (glob(BA_DATA . '/live/*.php') ?: [] as $lf) { $sid = basename($lf, '.php'); if ($sid === 'index') { continue; } $row = json_decode(substr((string) @file_get_contents($lf), strlen(BA_GUARD)), true); if (is_array($row) && ($row['at'] ?? 0) > $now - 7 * 86400) { $live[$sid] = $row; } }
uasort($live, fn($a, $b) => ($b['at'] ?? 0) <=> ($a['at'] ?? 0));
$liveOn = array_filter($live, fn($v) => $now - (int) ($v['at'] ?? 0) < 300); $liveDay = array_filter($live, fn($v) => $now - (int) ($v['at'] ?? 0) < 86400);
$guestOn = count(array_filter($liveOn, fn($v) => !empty($v['guest'])));
$alerts = array_reverse(ba_rd('alerts.php') ?: []);
$pts = []; foreach ($live as $v) { if (!empty($v['lat']) || !empty($v['lon'])) { $d = $now - (int) $v['at']; $pts[] = ['la' => (float) $v['lat'], 'lo' => (float) $v['lon'], 's' => $d < 300 ? 2 : ($d < 86400 ? 1 : 0), 'n' => ($v['user'] ?: 'Tamu') . ' · ' . ($v['name'] ?: '–'), 'l' => (string) ($v['loc'] ?? ''), 't' => $ago((int) $v['at'])]; } }
$seenUid = array_flip(array_filter(array_column($live, 'uid')));
foreach ($users as $x) { if ($x['lat'] !== null && !isset($seenUid[$x['uid']])) { $d = $now - $x['seen']; $pts[] = ['la' => (float) $x['lat'], 'lo' => (float) $x['lon'], 's' => $d < 300 ? 2 : ($d < 86400 ? 1 : 0), 'n' => $x['user'] . ' · ' . ($x['kampung'] ?: '–'), 'l' => (string) $x['loc'], 't' => $ago($x['seen'])]; } }
$online = max($online, count($liveOn));
$eras = ['', 'Babat alas', 'Dusun', 'Kampung', 'Desa', 'Kelurahan', 'Kota kecil', 'Kota'];
$nonce = wp_create_nonce('ba_admin');
?><!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kontrol Gim Babat Alas</title>
<link rel="stylesheet" href="lf/leaflet.css">
<style>
:root{--g:#1f6f4f;--ink:#1d1a16;--mut:#6b655b;--line:#e3dccd;--bg:#f6f1e7}*{box-sizing:border-box}body{margin:0;font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:var(--bg)}
header{background:#0f1e16;color:#fff;padding:14px 22px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}header h1{margin:0;font-size:19px}header a{color:#e0a526}
main{padding:18px 22px;max-width:1400px;margin:auto}.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-bottom:16px}.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px 14px}.card b{display:block;font-size:24px;color:var(--g)}.card span{color:var(--mut);font-size:12px}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden}th,td{padding:7px 9px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top;font-size:13px}th{background:#efe8da;position:sticky;top:0}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;background:#bbb}.on{background:#2f8f6a}.day{background:#e0a526}.flag{color:#a33a2a;font-size:11px}
button{border:0;border-radius:8px;padding:5px 9px;cursor:pointer;font-size:12px}.del{background:#a33a2a;color:#fff}.rst{background:#efe8da}.alert{background:#fbe9e5;border:1px solid #e3a99c;border-radius:12px;padding:12px 14px;margin-bottom:14px;display:flex;flex-direction:column;gap:6px}.alert .arow{display:flex;justify-content:space-between;gap:10px;align-items:center;border-top:1px solid #efc9bf;padding-top:8px}.msg{background:#eaf3ee;border-left:4px solid var(--g);padding:9px 12px;border-radius:8px;margin-bottom:12px}
input[type=search]{padding:8px 11px;border:1px solid var(--line);border-radius:9px;width:min(420px,100%)}h2{font-size:16px;margin:22px 0 8px}.mut{color:var(--mut);font-size:12px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 4px;border-bottom:1px solid var(--line)}.tabs a{padding:8px 13px;border-radius:10px 10px 0 0;color:var(--ink);text-decoration:none;font-weight:600}.tabs a.cur{background:#fff;border:1px solid var(--line);border-bottom-color:#fff;margin-bottom:-1px}.pane{display:none}.pane.show{display:block}
.setel{display:grid;gap:12px;max-width:760px}.setel fieldset{background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px 14px;display:grid;gap:8px}.setel legend{font-weight:700;padding:0 6px}.setel textarea,.setel input[type=text]{width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:9px;font:inherit}.setel input[type=number],.setel select{padding:5px 8px;border:1px solid var(--line);border-radius:8px;font:inherit}.save{background:var(--g);color:#fff;font-size:14px;padding:9px 16px}
</style></head><body>
<header><a href="/khusus/">← Aplikasi Khusus</a><h1>🛰️ Kontrol Gim Babat Alas</h1><span class="mut" style="color:#cfc8b8">Diperbarui <?= esc_html(wp_date('d M Y H:i:s')) ?></span>
<a href="#" id="autoBtn">⟳ Segarkan otomatis (30 dtk)</a><a href="/babat-alas/">▶ Buka gim</a><span style="margin-left:auto;color:#cfc8b8">👤 <?= esc_html(wp_get_current_user()->user_login) ?></span><a href="<?= esc_url(wp_logout_url(home_url('/khusus/'))) ?>">⎋ Keluar</a></header>
<main>
<?php if ($msg): ?><div class="msg"><?= $msg ?></div><?php endif; ?>
<?php if ($cfg['maint']): ?><div class="alert" style="background:#fff4d6;border-color:#e0c06a"><b>🛠 Mode pemeliharaan AKTIF — pemain tidak bisa bermain/menyimpan.</b><span class="mut">Matikan di tab Pengaturan bila sudah selesai.</span></div><?php endif; ?>
<?php $sus = array_filter($users, fn($x) => $x['bot'] && !$x['ban']); if ($sus): ?>
<div class="alert"><b>⚠ <?= count($sus) ?> pemain dicurigai memakai bot/AI atau otomasi</b><span class="mut" style="color:#5a2a20">Periksa alasannya; blokir (ban) bila benar, atau abaikan bila keliru.</span>
<?php foreach ($sus as $x): ?><div class="arow"><div><b><?= esc_html($x['user']) ?></b> · <?= esc_html($x['kampung'] ?: '–') ?><br><span class="mut"><?= esc_html(implode(' · ', $x['bot']['why'] ?? [])) ?> — terdeteksi <?= esc_html($ago((int) ($x['bot']['at'] ?? 0))) ?>, <?= (int) ($x['bot']['n'] ?? 1) ?>×</span></div>
<form method="post"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="uid" value="<?= $x['uid'] ?>"><button class="del" name="act" value="ban">⛔ Ban</button> <button class="rst" name="act" value="botok">Abaikan (bukan bot)</button></form></div><?php endforeach; ?></div>
<?php endif; ?>
<div class="cards">
 <div class="card"><b><?= $online ?></b><span>sedang bermain (≤ 5 menit)</span></div>
 <div class="card"><b><?= $guestOn ?></b><span>tamu sedang bermain</span></div>
 <div class="card"><b><?= $day ?></b><span>aktif 24 jam terakhir</span></div>
 <div class="card"><b><?= count($users) ?></b><span>akun terdaftar</span></div>
 <div class="card"><b><?= $saves ?></b><span>punya simpanan kampung</span></div>
 <div class="card"><b><?= count($classes) ?></b><span>kelas dosen</span></div>
 <div class="card"><b><?= $activeDeals ?></b><span>perjanjian dagang aktif</span></div>
 <div class="card"><b style="color:#a33a2a"><?= count(array_filter($users, fn($x) => $x['bot'] && !$x['ban'])) ?></b><span>dicurigai bot/AI</span></div>
</div>
<nav class="tabs"><a href="#pemain" data-t="pemain">👥 Pemain</a><a href="#monitor" data-t="monitor">🗺️ Monitor langsung</a><a href="#setel" data-t="setel">⚙️ Pengaturan gim</a><a href="#log" data-t="log">⚠ Log peringatan (<?= count($alerts) ?>)</a></nav>
<section id="t-pemain" class="pane">
<p class="mut">"Sedang bermain" berdasarkan sinyal ke server (tiap ±1 menit, termasuk tamu). Simpanan tamu hanya ada di peramban masing-masing.</p>
<h2>👥 Pemain</h2>
<input type="search" id="q" placeholder="Cari nama pengguna, kampung, kampus, kelas, lokasi…" oninput="f(this.value)">
<p class="mut" style="margin:6px 0 0">💰 Kas dari simpanan terakhir tiap pemain. Merah = kas habis (< Rp 3,3 M). <b><?= count(array_filter($users, fn($x) => $x['coin'] !== null && $x['coin'] < 20)) ?></b> pemain kas habis · klik judul kolom <b>Kas</b> untuk mengurutkan · beri dana dengan tombol 🎁 di kolom Aksi.</p><div style="overflow:auto;max-height:70vh;margin-top:8px"><table id="tb"><thead><tr><th>Status</th><th>Pengguna</th><th>Kampung</th><th>Lokasi</th><th>Era · KK</th><th>Skor</th><th data-sortkas="1" style="cursor:pointer" title="Klik: urutkan kas terendah dulu">Kas ⇅</th><th>Kampus · Kelas</th><th>Daftar</th><th>Aksi</th></tr></thead><tbody>
<?php foreach ($users as $x): $d = $now - $x['seen']; $cls = $d < 300 ? 'on' : ($d < 86400 ? 'day' : ''); ?>
<tr><td><span class="dot <?= $cls ?>"></span><?= esc_html($ago($x['seen'])) ?></td>
<td><b><?= esc_html($x['user']) ?></b><?= $x['ban'] ? ' <span class="flag">⛔ diblokir</span>' : ($x['bot'] ? ' <span class="flag">⚠ dicurigai bot/AI</span>' : '') ?><?= $x['owns'] ? '<br><span class="mut">👩‍🏫 dosen (' . count($x['owns']) . ' kelas)</span>' : '' ?></td>
<td><?= esc_html($x['kampung'] ?: '–') ?><?= $x['flags'] ? '<br><span class="flag">⚠ ' . esc_html(implode(', ', $x['flags'])) . '</span>' : '' ?></td>
<td><?php if ($x['lat'] !== null): ?><a href="https://www.openstreetmap.org/?mlat=<?= (float) $x['lat'] ?>&amp;mlon=<?= (float) $x['lon'] ?>#map=16/<?= (float) $x['lat'] ?>/<?= (float) $x['lon'] ?>" target="_blank" rel="noopener"><?= esc_html($x['loc'] ?: 'peta') ?></a><?php else: ?>–<?php endif; ?></td>
<td><?= $x['era'] !== '' ? esc_html(($eras[(int) $x['era']] ?? $x['era']) . ' · ' . $x['kk'] . ' KK') : '–' ?><br><span class="mut"><?= $x['month'] !== '' ? 'bulan ke-' . (int) $x['month'] : '' ?></span></td>
<td><?= esc_html((string) $x['score']) ?></td><td data-kas="<?= $x['coin'] === null ? 1e12 : $x['coin'] ?>"><?php if ($x['coin'] === null): ?>–<?php else: $mil = $x['coin'] * 100 / 607; ?><b style="color:<?= $x['coin'] < 20 ? '#c0392b' : ($x['coin'] < 120 ? '#b36b00' : 'inherit') ?>">Rp <?= number_format($mil, 1, ',', '.') ?> M</b><?= $x['coin'] < 20 ? ' <span class="flag">kas habis</span>' : '' ?><?php endif; ?><?= $x['loan'] > 0 ? '<br><span class="mut">pinjaman Rp ' . number_format($x['loan'] * 100 / 607, 1, ',', '.') . ' M</span>' : '' ?><?= $x['gPend'] > 0 ? '<br><span class="mut">⏳ menunggu +Rp ' . number_format($x['gPend'] * 100 / 607, 1, ',', '.') . ' M</span>' : '' ?><?= $x['gTot'] > 0 ? '<br><span class="mut">🎁 total diberi Rp ' . number_format($x['gTot'] * 100 / 607, 1, ',', '.') . ' M</span>' : '' ?></td><td><?= esc_html($x['kampus'] ?: '–') ?><br><span class="mut"><?= esc_html($x['kelas'] ?: '') ?></span></td>
<td><span class="mut"><?= $x['created'] ? esc_html(wp_date('d M Y', $x['created'])) : '–' ?></span></td>
<td><form method="post" style="margin-bottom:4px"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="uid" value="<?= $x['uid'] ?>"><?php if ($x['ban']): ?><button class="rst" name="act" value="unban">Buka blokir</button><?php else: ?><button class="del" name="act" value="ban" onclick="return confirm('Blokir <?= esc_js($x['user']) ?>?')">⛔ Ban</button><?php endif; ?></form><form method="post" style="margin-bottom:4px" onsubmit="return confirm('Beri dana kompensasi ke <?= esc_js($x['user']) ?>?')"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="uid" value="<?= $x['uid'] ?>"><input type="hidden" name="act" value="grant"><select name="amt"><option value="607">Rp 100 miliar</option><option value="303.5">Rp 50 miliar</option><option value="1214">Rp 200 miliar</option></select> <button class="rst">🎁 Beri dana</button></form><form method="post" onsubmit="return confirm('Reset simpanan & lepaskan wilayah <?= esc_js($x['user']) ?>? Akun tetap ada.')"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="uid" value="<?= $x['uid'] ?>"><input type="hidden" name="act" value="reset"><button class="rst">Reset simpanan</button></form><?php if ($x['flags']): ?><form method="post" style="margin-top:4px" onsubmit="return confirm('Hapus tanda anti-curang (<?= esc_js(implode(', ', $x['flags'])) ?>) milik <?= esc_js($x['user']) ?>? Gunakan bila tanda muncul karena galat, misalnya simpanan dari dua tab.')"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="uid" value="<?= $x['uid'] ?>"><input type="hidden" name="act" value="clearflags"><button class="rst">Hapus tanda</button></form><?php endif; ?>
<form method="post" style="margin-top:4px" onsubmit="return confirm('HAPUS akun <?= esc_js($x['user']) ?> beserta simpanan, wilayah, dan peringkatnya? Tindakan ini tidak bisa dibatalkan.')"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="uid" value="<?= $x['uid'] ?>"><input type="hidden" name="act" value="delete"><button class="del">Hapus akun</button></form></td></tr>
<?php endforeach; if (!$users): ?><tr><td colspan="9">Belum ada akun terdaftar.</td></tr><?php endif; ?>
</tbody></table><script>(function(){var th=document.querySelector('#tb th[data-sortkas]');if(!th)return;var asc=true;th.onclick=function(){var tb=document.querySelector('#tb tbody'),rows=[].slice.call(tb.rows);rows.sort(function(a,b){var x=+(a.querySelector('td[data-kas]')||{}).dataset.kas,y=+(b.querySelector('td[data-kas]')||{}).dataset.kas;return asc?x-y:y-x});rows.forEach(function(r){tb.appendChild(r)});asc=!asc}})();</script></div>
<h2>🎓 Kelas</h2>
<table><thead><tr><th>Kode</th><th>Nama kelas</th><th>Dosen</th><th>Tantangan</th><th>Anggota</th><th>Dibuat</th></tr></thead><tbody>
<?php foreach ($classes as $k): ?><tr><td><b><?= esc_html($k['code']) ?></b></td><td><?= esc_html($k['nama'] ?? '') ?></td><td><?= esc_html($k['ownerUser'] ?? ($byUid[$k['owner']] ?? '')) ?></td><td><?= esc_html($k['tantangan'] ?? '') ?: '–' ?></td><td><?= (int) $k['n'] ?></td><td><span class="mut"><?= !empty($k['created']) ? esc_html(wp_date('d M Y', (int) $k['created'])) : '' ?></span></td></tr><?php endforeach; if (!$classes): ?><tr><td colspan="6">Belum ada kelas.</td></tr><?php endif; ?>
</tbody></table>
<h2>🤝 Perjanjian dagang</h2>
<table><thead><tr><th>Dari</th><th>Kepada</th><th>Komoditas</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>
<?php $nd = 0; foreach (array_reverse($deals, true) as $id => $dd): if ($nd++ >= 100) { break; } ?><tr><td><?= esc_html($byUid[$dd['from']] ?? '?') ?></td><td><?= esc_html($byUid[$dd['to']] ?? '?') ?></td><td><?= esc_html($dd['com'] ?? '') ?></td><td><?= esc_html($dd['st'] ?? '') ?></td><td><span class="mut"><?= !empty($dd['t']) ? esc_html(wp_date('d M Y H:i', (int) $dd['t'])) : '' ?></span></td></tr><?php endforeach; if (!$deals): ?><tr><td colspan="5">Belum ada perjanjian.</td></tr><?php endif; ?>
</tbody></table>
</section>
<section id="t-monitor" class="pane">
<h2>🗺️ Peta pemain</h2><p class="mut"><span class="dot on"></span>sedang bermain (≤ 5 mnt) · <span class="dot day"></span>aktif 24 jam · <span class="dot"></span>lebih lama. Titik = lokasi kampung yang dipilih pemain (bukan lokasi perangkat).</p>
<div id="map" style="height:min(62vh,560px);border-radius:12px;border:1px solid var(--line)"></div>
<h2>🟢 Sesi aktif 24 jam terakhir (<?= count($liveDay) ?>)</h2>
<div style="overflow:auto;max-height:60vh"><table><thead><tr><th>Status</th><th>Pemain</th><th>Kampung</th><th>Lokasi</th><th>Era · KK</th><th>Perangkat</th></tr></thead><tbody>
<?php foreach ($liveDay as $v): $d = $now - (int) $v['at']; ?><tr><td><span class="dot <?= $d < 300 ? 'on' : 'day' ?>"></span><?= esc_html($ago((int) $v['at'])) ?></td><td><?= $v['guest'] ? '<span class="mut">Tamu</span>' : '<b>' . esc_html($v['user']) . '</b>' ?></td><td><?= esc_html($v['name'] ?: '–') ?></td><td><?= esc_html(trim(($v['loc'] ?? '') . ' ' . (($v['cc'] ?? '') ? '(' . strtoupper($v['cc']) . ')' : '')) ?: '–') ?></td><td><?= !empty($v['era']) ? esc_html(($eras[(int) $v['era']] ?? $v['era']) . ' · ' . (int) $v['kk'] . ' KK') : '–' ?></td><td><span class="mut"><?= esc_html(($v['dev'] ?? '') . ' ' . ($v['scr'] ?? '')) ?></span></td></tr><?php endforeach; if (!$liveDay): ?><tr><td colspan="6">Belum ada sesi dalam 24 jam terakhir.</td></tr><?php endif; ?>
</tbody></table></div>
</section>
<section id="t-setel" class="pane">
<h2>⚙️ Pengaturan gim (berlaku untuk semua pemain)</h2>
<form method="post" class="setel"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="act" value="cfg">
<fieldset><legend>📢 Pengumuman</legend><textarea name="announce" maxlength="300" rows="2" placeholder="Kosongkan bila tidak ada pengumuman"><?= esc_textarea($cfg['announce']) ?></textarea><label><input type="checkbox" name="reshow" value="1"> Tampilkan ulang ke semua pemain (meski teks sama)</label></fieldset>
<fieldset><legend>🛠 Pemeliharaan</legend><label><input type="checkbox" name="maint" value="1" <?= $cfg['maint'] ? 'checked' : '' ?>> Aktifkan mode pemeliharaan (gim dikunci, simpan ditolak)</label><input type="text" name="maintMsg" maxlength="300" value="<?= esc_attr($cfg['maintMsg']) ?>" placeholder="Pesan, mis. Pemeliharaan sampai pukul 21.00 WIB"></fieldset>
<fieldset><legend>🚪 Akses</legend><label><input type="checkbox" name="regOpen" value="1" <?= $cfg['regOpen'] ? 'checked' : '' ?>> Pendaftaran akun baru dibuka</label><label><input type="checkbox" name="guestOk" value="1" <?= $cfg['guestOk'] ? 'checked' : '' ?>> Boleh bermain sebagai tamu</label></fieldset>
<fieldset><legend>⏱ Laju permainan</legend><label>Pengali kecepatan membangun <input type="number" name="buildMul" min="0.25" max="10" step="0.25" value="<?= esc_attr((string) $cfg['buildMul']) ?>"> × <span class="mut">(1 = normal)</span></label>
<label>Kecepatan waktu maksimum <select name="maxSpeed"><?php foreach ([1 => '▶ ×1', 2 => '⏩ ×10', 3 => '⏩⏩ ×60 (semua)'] as $k => $l): ?><option value="<?= $k ?>" <?= (int) $cfg['maxSpeed'] === $k ? 'selected' : '' ?>><?= $l ?></option><?php endforeach; ?></select></label>
<label>Bencana <select name="disaster"><?php foreach (['' => 'Ikuti pilihan pemain', 'normal' => 'Paksa normal', 'rendah' => 'Paksa rendah', 'mati' => 'Paksa mati'] as $k => $l): ?><option value="<?= $k ?>" <?= $cfg['disaster'] === $k ? 'selected' : '' ?>><?= $l ?></option><?php endforeach; ?></select></label></fieldset>
<fieldset><legend>🤖 Penyaring bot/AI</legend><label>Kepekaan <select name="botMode"><?php foreach (['off' => 'Mati', 'normal' => 'Normal', 'strict' => 'Ketat'] as $k => $l): ?><option value="<?= $k ?>" <?= $cfg['botMode'] === $k ? 'selected' : '' ?>><?= $l ?></option><?php endforeach; ?></select></label>
<label><input type="checkbox" name="autoBan" value="1" <?= $cfg['autoBan'] ? 'checked' : '' ?>> Ban otomatis saat terdeteksi (tanpa menunggu saya)</label><span class="mut">Peringatan pertama dikirim ke Telegram di bawah (dan ke email admin situs bila layanan email tersedia).</span></fieldset>
<fieldset><legend>📲 Notifikasi Telegram (pengganti email)</legend><span class="mut">Paket hosting ini tidak punya layanan email. Peringatan bot/AI bisa dikirim ke Telegram: (1) di Telegram buka <b>@BotFather</b> → /newbot → salin token; (2) tempel token di bawah lalu Simpan; (3) buka bot baru Anda, kirim <b>/start</b>; (4) tekan “Ambil chat ID”, lalu “Kirim notifikasi uji”.</span>
<label>Token bot <input type="password" name="tgToken" autocomplete="off" placeholder="<?= $cfg['tgToken'] !== '' ? 'tersimpan (••••' . esc_attr(substr($cfg['tgToken'], -4)) . ') — kosongkan bila tidak diganti' : '123456789:AA…' ?>" style="width:100%;padding:7px 10px;border:1px solid var(--line);border-radius:8px"></label>
<label>Chat ID <input type="text" name="tgChat" value="<?= esc_attr($cfg['tgChat']) ?>" placeholder="otomatis lewat tombol di bawah" style="padding:5px 8px;border:1px solid var(--line);border-radius:8px"></label><label><input type="checkbox" name="tgClear" value="1"> Hapus pengaturan Telegram</label></fieldset>
<button class="save">💾 Simpan pengaturan</button> <span class="mut"><?= !empty($cfgRaw['at']) ? 'Terakhir diubah ' . esc_html(wp_date('d M Y H:i', (int) $cfgRaw['at'])) . ' oleh ' . esc_html((string) ($cfgRaw['by'] ?? '')) : 'Belum pernah diubah (nilai bawaan).' ?></span>
</form>
<form method="post" style="margin-top:10px"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="act" value="testmail"><button class="rst">✉ Kirim email uji ke pindotutuko@gmail.com</button> <button class="rst" name="act" value="tgchat" formnovalidate>🔎 Ambil chat ID Telegram</button> <button class="rst" name="act" value="tgtest">📲 Kirim notifikasi uji (Telegram)</button> <span class="mut">untuk memastikan peringatan bot/AI sampai ke Telegram atau email Anda.</span></form>
<?php require_once __DIR__ . '/../api/backup.php'; $bks = ba_bk_list(BA_DATA); $bkAt = (int) @file_get_contents(BA_DATA . '/bk_at.txt'); $bkIn = strpos(ba_bk_dir(BA_DATA), 'public_html') === false; ?>
<fieldset style="margin-top:14px"><legend>💾 Cadangan data pemain (otomatis harian)</legend>
<p class="mut">Akun, simpanan, kelas, peringkat, dan pengaturan dicadangkan otomatis sekali sehari (14 cadangan terbaru disimpan) <?= $bkIn ? 'di luar folder situs (tidak bisa diakses publik).' : 'di folder data yang terkunci (server tidak mengizinkan menulis di luar folder situs).' ?> Terakhir: <b><?= $bkAt ? esc_html(wp_date('d M Y H:i', $bkAt)) : 'belum pernah' ?></b>.</p>
<form method="post" style="margin:6px 0"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><button class="rst" name="act" value="bkmake">💾 Cadangkan sekarang</button></form>
<?php if ($bks): ?><table><tr><th>Berkas</th><th>Ukuran</th><th></th></tr><?php foreach (array_slice($bks, 0, 14) as $f): ?><tr><td><?= esc_html(basename($f)) ?></td><td><?= number_format(filesize($f) / 1024, 0, ',', '.') ?> KB</td><td><form method="post"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="f" value="<?= esc_attr(basename($f)) ?>"><button class="rst" name="act" value="bkdl">⬇ Unduh</button></form></td></tr><?php endforeach; ?></table><?php endif; ?>
</fieldset>
</section>
<section id="t-log" class="pane">
<h2>⚠ Log peringatan bot/AI</h2>
<table><thead><tr><th>Waktu</th><th>Pengguna</th><th>Alasan</th></tr></thead><tbody>
<?php foreach (array_slice($alerts, 0, 200) as $a): ?><tr><td><span class="mut"><?= esc_html(wp_date('d M Y H:i', (int) ($a['at'] ?? 0))) ?></span></td><td><b><?= esc_html((string) ($a['user'] ?? '')) ?></b></td><td><?= esc_html(implode(' · ', (array) ($a['why'] ?? []))) ?></td></tr><?php endforeach; if (!$alerts): ?><tr><td colspan="3">Belum ada peringatan.</td></tr><?php endif; ?>
</tbody></table>
<?php if ($alerts): ?><form method="post" style="margin-top:8px" onsubmit="return confirm('Kosongkan log peringatan?')"><input type="hidden" name="_wpnonce" value="<?= $nonce ?>"><input type="hidden" name="act" value="clearalerts"><button class="rst">Kosongkan log</button></form><?php endif; ?>
</section>
<p class="mut" style="margin-top:20px">Hanya administrator WordPress yang dapat membuka halaman ini. Penghapusan bersifat permanen.</p>
</main>
<script src="lf/leaflet.js"></script>
<script>const PTS=<?= wp_json_encode($pts) ?>;let map;
function tab(t){if(!document.getElementById('t-'+t))t='pemain';document.querySelectorAll('.pane').forEach(e=>e.classList.toggle('show',e.id==='t-'+t));document.querySelectorAll('.tabs a').forEach(a=>a.classList.toggle('cur',a.dataset.t===t));if(t==='monitor')mk()}
function mk(){if(map){map.invalidateSize();return}if(!window.L)return;map=L.map('map',{worldCopyJump:true}).setView([-2.5,118],4);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap'}).addTo(map);const col=['#9a9387','#e0a526','#2f8f6a'],b=[];
PTS.forEach(p=>{const m=L.circleMarker([p.la,p.lo],{radius:p.s===2?9:6,color:'#fff',weight:2,fillColor:col[p.s],fillOpacity:.95}).addTo(map);const e=document.createElement('div');e.innerHTML='<b></b><br><span></span><br><small></small>';e.querySelector('b').textContent=p.n;e.querySelector('span').textContent=p.l;e.querySelector('small').textContent=p.t;m.bindPopup(e);b.push([p.la,p.lo])});if(b.length)map.fitBounds(b,{padding:[30,30],maxZoom:9})}
window.addEventListener('hashchange',()=>tab(location.hash.slice(1)));tab(location.hash.slice(1));
let auto=sessionStorage.getItem('baAuto')==='1',at=null;const ab=document.getElementById('autoBtn');function au(){ab.textContent=auto?'⏸ Hentikan penyegaran otomatis':'⟳ Segarkan otomatis (30 dtk)';clearTimeout(at);if(auto)at=setTimeout(()=>{if(!document.querySelector('.setel :focus'))location.reload();else au()},30000)}ab.onclick=e=>{e.preventDefault();auto=!auto;sessionStorage.setItem('baAuto',auto?'1':'0');au()};au();
if(location.search)history.replaceState(null,'',location.pathname+location.hash);
function f(v){v=v.toLowerCase();document.querySelectorAll('#tb tbody tr').forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(v)?'':'none'})}</script>
</body></html>
