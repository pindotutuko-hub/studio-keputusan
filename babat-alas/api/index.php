<?php
/**
 * Babat Alas — API akun & simpanan permainan (pindotutuko.id/babat-alas/api/).
 * Penyimpanan berkas JSON per pengguna (dikunci flock), dibungkus penjaga 404 agar tidak terbaca langsung.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const DATA = __DIR__ . '/data';
const GUARD = "<?php http_response_code(404); exit; ?>\n";
const MAX_SAVE = 600000;      // bita JSON simpanan
const TOKEN_DAYS = 45;
const EULA_VER = '2026-11-01';
const ERA_MAX = 7;            // era tertinggi di versi ini
const START = ['coin' => 667, 'wood' => 60];
/** biaya naik level bangunan [ke lv2, ke lv3] = [koin, kayu]; sama dengan UPG di game.js */
const UPGC = ['kom' => [[60, 4], [150, 0]], 'terminal' => [[150, 20], [300, 0]], 'stasiun' => [[350, 0], [700, 0]], 'bandara' => [[600, 30], [1500, 0]], 'house' => [[6, 10], [15, 14]], 'field' => [[5, 3], [10, 4]], 'kebun' => [[6, 3], [12, 4]], 'pond' => [[5, 4], [10, 6]], 'kandang' => [[5, 4], [10, 6]], 'peternakan' => [[8, 4], [15, 6]], 'barn' => [[8, 12], [16, 16]], 'market' => [[20, 15], [40, 25]], 'sekolah' => [[30, 20], [60, 30]], 'klinik' => [[30, 20], [60, 30]]];
const COST = ['riset' => [20, 10], 'bpbd' => [70, 8], 'dinkes' => [60, 6], 'disdik' => [60, 6], 'dispar' => [60, 6], 'bapenda' => [60, 6], 'brt' => [60, 0], 'pengadilan' => [120, 0], 'pelabuhan' => [300, 0], 'tol' => [200, 0], 'kargo' => [240, 0], 'makam' => [4, 2], 'playground' => [8, 6], 'pasmal' => [15, 10], 'homestay' => [20, 12], 'puskesling' => [40, 6], 'futsal' => [25, 6], 'senibudaya' => [45, 14], 'pltb' => [90, 0], 'daurulang' => [70, 6], 'pltu' => [260, 0], 'semen' => [220, 0], 'lapas' => [180, 0], 'smelter' => [420, 0], 'galian' => [5, 2], 'tobong' => [12, 8], 'tamin' => [40, 10], 'lapbola' => [4, 2], 'kolam' => [40, 6], 'bioskop' => [90, 10], 'planetarium' => [180, 5], 'tamhib' => [600, 40], 'baldes' => [15, 12], 'capil' => [50, 6], 'dinpu' => [80, 6], 'dinas' => [70, 6], 'dprd' => [300, 20], 'perpus' => [30, 10], 'pos' => [20, 8], 'bank' => [80, 6], 'telkom' => [60, 6], 'koramil' => [120, 10], 'lanal' => [200, 10], 'lanud' => [400, 10], 'bandara' => [400, 30], 'house' => [1, 8], 'field' => [2, 2], 'well' => [4, 2], 'barn' => [6, 12], 'pond' => [5, 0], 'tree' => [1, 0], 'hall' => [20, 30], 'worship' => [15, 15], 'market' => [25, 20], 'rt' => [8, 10], 'taman' => [6, 4], 'kebun' => [6, 3], 'bengkel' => [10, 8], 'sekolah' => [30, 25], 'klinik' => [35, 15], 'kom' => [20, 10], 'perum' => [120, 40], 'ruko' => [90, 30], 'rs' => [220, 40], 'tamkot' => [60, 5], 'apartemen' => [400, 60], 'mal' => [350, 50], 'stasiun' => [300, 40], 'balkot' => [500, 60], 'zr' => [2, 0], 'zc' => [2, 0], 'zi' => [2, 0], 'halte' => [8, 2], 'surya' => [25, 2], 'pltmh' => [60, 10], 'menara' => [40, 6], 'tps' => [12, 4], 'ipal' => [70, 8], 'pospol' => [45, 10], 'damkar' => [80, 12], 'pembangkit' => [300, 30], 'tpa' => [150, 10], 'kampus' => [350, 40], 'paud' => [10, 6], 'smp' => [60, 30], 'sma' => [90, 30], 'terminal' => [120, 20], 'alun' => [30, 5], 'tugu' => [40, 10], 'museum' => [90, 15], 'stadion' => [260, 40], 'saluran' => [6, 2], 'retensi' => [60, 5], 'rel' => [12, 4], 'dermaga' => [20, 14], 'kandang' => [4, 6], 'peternakan' => [10, 12], 'pemburu' => [3, 4], 'dapur' => [8, 6], 'tambang' => [4, 4]];
const SIZE = ['pelabuhan' => 2, 'makam' => 2, 'pasmal' => 2, 'pltu' => 2, 'semen' => 2, 'lapas' => 2, 'smelter' => 2, 'lapbola' => 2, 'tamhib' => 2, 'dprd' => 2, 'lanud' => 2, 'bandara' => 2, 'field' => 2, 'hall' => 2, 'market' => 2, 'kebun' => 2, 'sekolah' => 2, 'perum' => 2, 'ruko' => 2, 'rs' => 2, 'tamkot' => 2, 'apartemen' => 2, 'mal' => 2, 'stasiun' => 2, 'balkot' => 2, 'pembangkit' => 2, 'tpa' => 2, 'kampus' => 2, 'smp' => 2, 'sma' => 2, 'terminal' => 2, 'alun' => 2, 'stadion' => 2, 'retensi' => 2, 'peternakan' => 2];
const ERA_OF = ['riset' => 6, 'bpbd' => 4, 'dinkes' => 4, 'disdik' => 4, 'dispar' => 4, 'bapenda' => 4, 'brt' => 5, 'pengadilan' => 5, 'pelabuhan' => 5, 'tol' => 6, 'kargo' => 6, 'playground' => 2, 'pasmal' => 2, 'homestay' => 2, 'puskesling' => 3, 'futsal' => 3, 'senibudaya' => 3, 'pltb' => 4, 'daurulang' => 4, 'pltu' => 5, 'semen' => 5, 'lapas' => 5, 'smelter' => 6, 'tobong' => 2, 'tamin' => 3, 'kolam' => 4, 'bioskop' => 5, 'planetarium' => 6, 'tamhib' => 7, 'baldes' => 2, 'capil' => 4, 'dinpu' => 5, 'dinas' => 5, 'dprd' => 6, 'perpus' => 3, 'pos' => 3, 'bank' => 4, 'telkom' => 4, 'koramil' => 4, 'lanal' => 5, 'lanud' => 6, 'bandara' => 6, 'hall' => 2, 'worship' => 2, 'market' => 2, 'sekolah' => 1, 'klinik' => 2, 'kom' => 2, 'ruko' => 4, 'perum' => 5, 'rs' => 5, 'tamkot' => 5, 'apartemen' => 6, 'mal' => 6, 'stasiun' => 6, 'balkot' => 7, 'zr' => 4, 'zc' => 4, 'zi' => 4, 'halte' => 4, 'surya' => 2, 'pltmh' => 3, 'menara' => 3, 'tps' => 2, 'ipal' => 4, 'pospol' => 3, 'damkar' => 4, 'pembangkit' => 5, 'tpa' => 5, 'kampus' => 6, 'paud' => 1, 'smp' => 1, 'sma' => 1, 'terminal' => 5, 'alun' => 3, 'tugu' => 4, 'museum' => 5, 'stadion' => 6, 'saluran' => 3, 'retensi' => 4, 'rel' => 6, 'dermaga' => 2];
const BADWORDS = ['anjing', 'bangsat', 'kontol', 'memek', 'ngentot', 'jancok', 'jancuk', 'goblok', 'fuck', 'shit', 'bitch', 'asshole', 'nigger', 'pussy', 'dick'];

function out(array $a, int $code = 200): void { http_response_code($code); echo json_encode($a, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $e, int $code = 400): void { out(['ok' => false, 'error' => $e], $code); }
function ensure_dir(): void {
	if (!is_dir(DATA)) { @mkdir(DATA, 0750, true); }
	if (!file_exists(DATA . '/index.php')) { @file_put_contents(DATA . '/index.php', GUARD); }
	if (!file_exists(DATA . '/.htaccess')) { @file_put_contents(DATA . '/.htaccess', "Require all denied\nDeny from all\n"); }
}
function rd(string $f): ?array {
	$p = DATA . '/' . $f; if (!is_file($p)) { return null; }
	$s = file_get_contents($p); if ($s === false) { return null; }
	$s = substr($s, strlen(GUARD)); $j = json_decode($s, true); return is_array($j) ? $j : null;
}
/** Baca–ubah–tulis atomik dengan flock. */
function upd(string $f, callable $fn) {
	$p = DATA . '/' . $f; $h = fopen($p, 'c+'); if (!$h) { fail('storage', 500); }
	flock($h, LOCK_EX); $s = stream_get_contents($h); $cur = null;
	if ($s !== false && strlen($s) > strlen(GUARD)) { $cur = json_decode(substr($s, strlen(GUARD)), true); }
	$res = $fn(is_array($cur) ? $cur : null);
	if (isset($res['__write'])) { ftruncate($h, 0); rewind($h); fwrite($h, GUARD . json_encode($res['__write'], JSON_UNESCAPED_UNICODE)); fflush($h); }
	flock($h, LOCK_UN); fclose($h); return $res['__ret'] ?? null;
}
function body(): array { $j = json_decode((string) file_get_contents('php://input'), true); return is_array($j) ? $j : []; }
function clean(string $s, int $max): string { $s = trim(preg_replace('/[\x00-\x1F\x7F<>]/u', '', $s) ?? ''); return mb_substr($s, 0, $max); }
function ip(): string { return (string) ($_SERVER['REMOTE_ADDR'] ?? '0'); }
/** Batas laju sederhana per IP & aksi. */
function rate(string $act, int $max, int $win, bool $byIp = true): void {
	$key = 'r_' . substr(hash('sha256', $act . ($byIp ? ip() : '')), 0, 24) . '.php'; $now = time();
	if (mt_rand(1, 400) === 1) { foreach (glob(DATA . '/r_*.php') ?: [] as $f) { if (@filemtime($f) < $now - 2 * 86400) { @unlink($f); } } }
	$ok = upd($key, function ($c) use ($now, $max, $win) { $c = $c ?: ['t' => []]; $c['t'] = array_values(array_filter($c['t'], fn($t) => $t > $now - $win));
		if (count($c['t']) >= $max) { return ['__ret' => false]; } $c['t'][] = $now; return ['__write' => $c, '__ret' => true]; });
	if (!$ok) { fail('rate_limited', 429); }
}
function uid_of(string $user): string { return substr(hash('sha256', 'ba|' . mb_strtolower($user)), 0, 20); }
/** v46b: kode kelas hanya huruf besar & angka (sama dengan nama berkas k_KODE.php). */
function kelas_code(string $s): string { return substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($s)) ?? '', 0, 12); }
/** v46b: periksa bentuk data simpanan sebelum audit, agar data berjenis salah ditolak 400 (bukan galat 500). */
function state_ok(array $st): bool {
	$num = fn($v) => is_int($v) || is_float($v);
	foreach (['own', 'res', 'loc', 'meta', 'stats', 'b', 'br', 'done', 'links', 'land'] as $k) { if (isset($st[$k]) && !is_array($st[$k])) { return false; } }
	foreach (['x0', 'y0', 'x1', 'y1'] as $k) { if (isset($st['own'][$k]) && !$num($st['own'][$k])) { return false; } }
	foreach (['lat', 'lon'] as $k) { if (isset($st['loc'][$k]) && !$num($st['loc'][$k])) { return false; } }
	foreach ($st['b'] ?? [] as $b) {
		if (!is_array($b) || !is_string($b['t'] ?? null)) { return false; }
		foreach (['x', 'y', 'w', 'h'] as $k) { if (!$num($b[$k] ?? null)) { return false; } }
		if (isset($b['lv']) && !$num($b['lv'])) { return false; }
	}
	return true;
}


/* ---------- pengaturan jarak jauh (diubah dari halaman admin) ---------- */
const CFG_DEF = ['announce' => '', 'announceId' => 0, 'maint' => false, 'maintMsg' => '', 'regOpen' => true, 'guestOk' => true, 'buildMul' => 1.0, 'maxSpeed' => 3, 'disaster' => '', 'botMode' => 'normal', 'autoBan' => false, 'tgToken' => '', 'tgChat' => ''];
function cfg(): array { $c = rd('cfg.php') ?: []; return array_merge(CFG_DEF, array_intersect_key($c, CFG_DEF)); }
function cfg_pub(): array { $c = cfg(); unset($c['botMode'], $c['autoBan'], $c['tgToken'], $c['tgChat']); return $c; }

/* ---------- penyaring bot/AI: dinilai dari telemetri interaksi yang dikirim gim saat simpan ---------- */
const ADMIN_MAIL = 'pindotutuko@gmail.com';
function bot_reasons($t): array {
	if (!is_array($t)) { return []; } $mode = cfg()['botMode']; if ($mode === 'off') { return []; } $k = $mode === 'strict' ? 1.6 : 1.0;
	$r = []; $ptr = (int) ($t['ptr'] ?? 0); $utr = (int) ($t['utr'] ?? 0); $acts = (int) ($t['acts'] ?? 0); $n = (int) ($t['n'] ?? 0);
	$cv = isset($t['cv']) && $t['cv'] !== null ? (float) $t['cv'] : null; $mean = (int) ($t['mean'] ?? 0);
	if (!empty($t['wd'])) { $r[] = 'peramban dikendalikan otomatis (webdriver)'; }
	if (!empty($t['hl'])) { $r[] = 'peramban tanpa layar/skrip (headless)'; }
	if ($utr > 30 && $utr > $ptr * 0.5) { $r[] = 'klik sintetis dari skrip (' . $utr . ' vs ' . $ptr . ' asli)'; }
	if ($n >= 40 && $cv !== null && $cv < 0.12 * $k) { $r[] = 'ritme tindakan terlalu teratur (CV ' . $cv . ')'; }
	if ($n >= 40 && $mean > 0 && $mean < 140 * $k) { $r[] = 'tindakan terlalu cepat (' . $mean . ' ms rata-rata)'; }
	if ($acts > 30 && $ptr === 0) { $r[] = 'ada tindakan tanpa input pengguna'; }
	return $r;
}
/** kirim pesan ke Telegram admin (bila diatur di Kontrol Gim) — pengganti email karena paket hosting tanpa layanan email */
function tg_send(string $text): bool { $c = cfg(); $tok = (string) $c['tgToken']; $chat = (string) $c['tgChat']; if ($tok === '' || $chat === '') { return false; }
	$url = 'https://api.telegram.org/bot' . $tok . '/sendMessage'; $data = http_build_query(['chat_id' => $chat, 'text' => $text, 'disable_web_page_preview' => 'true']);
	if (function_exists('curl_init')) { $ch = curl_init($url); curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $data, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5]); $r = curl_exec($ch); curl_close($ch); }
	else { $r = @file_get_contents($url, false, stream_context_create(['http' => ['method' => 'POST', 'header' => 'Content-Type: application/x-www-form-urlencoded', 'content' => $data, 'timeout' => 5]])); }
	return is_string($r) && strpos($r, '"ok":true') !== false; }
function bot_flag(string $uid, array $u, array $why): void {
	$first = empty($u['bot']);
	upd('u_' . $uid . '.php', function ($x) use ($why) { if (!$x) { return ['__ret' => false]; } $b = $x['bot'] ?? []; $x['bot'] = ['why' => array_values(array_unique(array_merge($b['why'] ?? [], $why))), 'at' => time(), 'first' => $b['first'] ?? time(), 'n' => (int) ($b['n'] ?? 0) + 1]; unset($x['botOk']); return ['__write' => $x, '__ret' => true]; });
	if (cfg()['autoBan']) { upd('u_' . $uid . '.php', function ($x) { if (!$x) { return ['__ret' => false]; } $x['ban'] = time(); $x['banAuto'] = 1; $x['tokens'] = []; return ['__write' => $x, '__ret' => true]; }); upd('dir.php', function ($d) use ($uid) { $d = $d ?: []; unset($d[$uid]); return ['__write' => $d, '__ret' => true]; }); }
	if ($first) {
		upd('alerts.php', function ($a) use ($uid, $u, $why) { $a = $a ?: []; $a[] = ['uid' => $uid, 'user' => $u['user'] ?? '', 'why' => $why, 'at' => time()]; return ['__write' => array_slice($a, -300), '__ret' => true]; });
		tg_send('⚠ Babat Alas: pemain dicurigai bot/AI — ' . ($u['user'] ?? $uid) . "\nAlasan: " . implode('; ', $why) . "\nTinjau: https://pindotutuko.id/babat-alas/admin/");
		@mail(ADMIN_MAIL, 'Babat Alas: pemain dicurigai bot/AI — ' . ($u['user'] ?? $uid), "Pengguna: " . ($u['user'] ?? '') . "\nAlasan: " . implode('; ', $why) . "\n\nTinjau dan ban bila perlu di: https://pindotutuko.id/babat-alas/admin/\n", "From: Babat Alas <noreply@pindotutuko.id>\r\nContent-Type: text/plain; charset=utf-8");
	}
}

function auth(): array {
	$tok = (string) ($_SERVER['HTTP_X_BA_TOKEN'] ?? ''); if (!preg_match('/^[a-f0-9]{20}\.[a-f0-9]{48}$/', $tok)) { fail('auth', 401); }
	[$uid, $sec] = explode('.', $tok, 2); $u = rd('u_' . $uid . '.php');
	if (!$u) { fail('auth', 401); }
	foreach (($u['tokens'] ?? []) as $t) { if (hash_equals($t['h'], hash('sha256', $sec)) && $t['exp'] > time()) { if (!empty($u['ban'])) { fail('banned', 403); } $u['uid'] = $uid; return $u; } }
	fail('auth', 401);
}
function new_token(string $uid): string {
	$sec = bin2hex(random_bytes(24)); $exp = time() + TOKEN_DAYS * 86400;
	upd('u_' . $uid . '.php', function ($u) use ($sec, $exp) { if (!$u) { return ['__ret' => null]; }
		$u['tokens'] = array_slice(array_values(array_filter($u['tokens'] ?? [], fn($t) => $t['exp'] > time())), -4); $u['tokens'][] = ['h' => hash('sha256', $sec), 'exp' => $exp];
		return ['__write' => $u, '__ret' => true]; });
	return $uid . '.' . $sec;
}
/** v48: perbarui kampus/kelas di papan peringkat semester berjalan tanpa menunggu simpan berikutnya */
function lb_sync(string $uid, array $set): void { upd('lb_' . semester() . '.php', function ($d) use ($uid, $set) { if (!$d || !isset($d[$uid])) { return ['__ret' => false]; } foreach ($set as $k => $v) { $d[$uid][$k] = $v; } return ['__write' => $d, '__ret' => true]; }); }
function pub(array $u): array { return ['user' => $u['user'], 'name' => $u['name'] ?? $u['user'], 'kampus' => $u['kampus'] ?? '', 'kampusCC' => $u['kampusCC'] ?? '', 'kelas' => $u['kelas'] ?? '', 'created' => $u['created'] ?? 0, 'eula' => ($u['eula'] ?? '') === EULA_VER, 'mustPw' => !empty($u['mustPw'])]; }

/** Semester akademik: Agustus–Januari = Ganjil, Februari–Juli = Genap. */
function semester(?int $ts = null): string { $ts = $ts ?? time(); $m = (int) date('n', $ts); $y = (int) date('Y', $ts);
	if ($m >= 8) { return $y . '-Ganjil'; } if ($m === 1) { return ($y - 1) . '-Ganjil'; } return $y . '-Genap'; }
function rude(string $s): bool { $t = mb_strtolower(preg_replace('/[^a-z0-9]/i', '', strtr($s, ['0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a', '5' => 's', '@' => 'a'])) ?? ''); foreach (BADWORDS as $w) { if (str_contains($t, $w)) { return true; } } return false; }
function check_origin(): void { $o = (string) ($_SERVER['HTTP_ORIGIN'] ?? ''); if ($o === '') { return; } $h = (string) parse_url($o, PHP_URL_HOST);
	if (!in_array($h, ['pindotutuko.id', 'www.pindotutuko.id', 'localhost', '127.0.0.1'], true)) { fail('origin', 403); } }
/**
 * Pemeriksaan kewajaran simpanan (anti-curang). Mengembalikan [skor server, daftar pelanggaran].
 * Simpanan tetap disimpan agar pemain tidak kehilangan permainan, tetapi yang melanggar tidak masuk peringkat.
 */
function audit(array $st, ?array $prev, int $prevAt): array {
	$bad = []; $n = 128;
	$land = $st['land'] ?? null;
	if (!is_array($land) || count($land) !== $n) { return [0, ['land']]; }
	foreach ($land as $row) { if (!is_string($row) || !preg_match('/^[FGWP]{128}$/', $row)) { return [0, ['land']]; } }
	$o = $st['own'] ?? null; $ex = (int) ($st['exp'] ?? 0);
	if (!is_array($o) || !isset($o['x0'], $o['y0'], $o['x1'], $o['y1']) || $o['x0'] < 0 || $o['y0'] < 0 || $o['x1'] > $n || $o['y1'] > $n || ($o['x1'] - $o['x0']) + ($o['y1'] - $o['y0']) > 80 + 8 * $ex || $ex < 0 || $ex > 60) { $bad[] = 'own'; $o = ['x0' => 0, 'y0' => 0, 'x1' => $n, 'y1' => $n]; }
	$era = (int) ($st['era'] ?? 1); $t = (int) ($st['t'] ?? 0); $kk = (int) ($st['kk'] ?? 0);
	$happy = (int) ($st['happy'] ?? 0); $coh = (int) ($st['coh'] ?? 0);
	$coin = (float) ($st['res']['coin'] ?? 0); $wood = (float) ($st['res']['wood'] ?? 0); $food = (float) ($st['res']['food'] ?? 0);
	if ($era < 1 || $era > ERA_MAX) { $bad[] = 'era'; }
	if ($t < 0 || $t > 100000) { $bad[] = 'time'; }
	if ($happy < 0 || $happy > 100 || $coh < 0 || $coh > 100) { $bad[] = 'meter'; }
	if ($coin < -1 || $wood < -1 || $food < -1) { $bad[] = 'neg'; }
	$occ = []; $zrCap = 0; $zLv = 0; $hCap = 0; $bStore = 0; $upP = 0; $spentC = 0; $spentW = 0; $cnt = []; $houses = 0; $barns = 0; $markets = 0;
	$bs = $st['b'] ?? []; if (!is_array($bs) || count($bs) > 1600) { $bad[] = 'blds'; $bs = []; }
	foreach ($bs as $b) {
		$ty = (string) ($b['t'] ?? ''); if (!isset(COST[$ty])) { $bad[] = 'btype'; continue; }
		$w = SIZE[$ty] ?? 1; $x = (int) ($b['x'] ?? -1); $y = (int) ($b['y'] ?? -1);
		if ((int) ($b['w'] ?? 0) !== $w || (int) ($b['h'] ?? 0) !== $w || $x < 0 || $y < 0 || $x + $w > $n || $y + $w > $n) { $bad[] = 'bpos'; continue; }
		if (($ERA = ERA_OF[$ty] ?? 1) > $era) { $bad[] = 'bera'; }
		for ($dy = 0; $dy < $w; $dy++) { for ($dx = 0; $dx < $w; $dx++) { $k = ($x + $dx) . ',' . ($y + $dy);
			if (isset($occ[$k])) { $bad[] = 'overlap'; } if ($x + $dx < $o['x0'] || $y + $dy < $o['y0'] || $x + $dx >= $o['x1'] || $y + $dy >= $o['y1']) { $bad[] = 'outside'; } $occ[$k] = 1; if ($land[$y + $dy][$x + $dx] !== 'G') { $bad[] = 'bland'; } } }
		/* v50g */ $spentC += COST[$ty][0] * ((ERA_OF[$ty] ?? 1) <= 2 ? 0.3 : 0.5); $spentW += COST[$ty][1]; $cnt[$ty] = ($cnt[$ty] ?? 0) + 1;
		$lv = max(0, min(3, (int) ($b['lv'] ?? 0))); if ($ty === 'zr') { $zrCap += [0, 2, 6, 16][$lv]; } if ($ty === 'zc' || $ty === 'zi') { $zLv += $lv; }
		$ul = max(1, $lv); if ($ty === 'house') { $hCap += [1, 1, 2, 3][$ul]; } if ($ty === 'barn') { $bStore += 120 * [1, 1, 1.75, 2.5][$ul]; }
		if (isset(UPGC[$ty])) { for ($k = 2; $k <= $ul; $k++) { $spentC += UPGC[$ty][$k - 2][0]; $spentW += UPGC[$ty][$k - 2][1]; } if ($ul >= 3 && $era < 2) { $bad[] = 'lv'; } if ($ul >= 2 && $ty !== 'house' && $ty !== 'barn') { $upP++; } }
	}
	$houses = $cnt['house'] ?? 0; $barns = $cnt['barn'] ?? 0; $markets = $cnt['market'] ?? 0;
	if ($kk > $hCap + 4 * ($cnt['perum'] ?? 0) + 16 * ($cnt['apartemen'] ?? 0) + $zrCap + 6 || $kk < 0 || $kk > 2000) { $bad[] = 'kk'; }
	if ($era >= 2 && $barns < 1) { $bad[] = 'era2'; }
	$eraKK = [3 => 30, 4 => 60, 5 => 120, 6 => 240, 7 => 450]; if (isset($eraKK[$era]) && $kk < $eraKK[$era] * 0.5) { $bad[] = 'eraKK'; }
	$paths = substr_count(implode('', $land), 'P'); $spentC += $paths;
	$br = is_array($st['br'] ?? null) ? $st['br'] : []; if (count($br) > 600) { $bad[] = 'br'; $br = []; }
	foreach ($br as $k) { if (!is_string($k) || !preg_match('/^(\d{1,3}),(\d{1,3})$/', $k, $mm) || (int) $mm[1] >= $n || (int) $mm[2] >= $n || !in_array($land[(int) $mm[2]][(int) $mm[1]], ['W', 'G', 'P', 'F', 'D'], true)) { $bad[] = 'br'; break; } }
	$spentC += 2 * count($br); $spentW += 5 * count($br);
	$cleared = (int) ($st['stats']['cleared'] ?? 0); // v50: babat gratis
	for ($i = 0; $i < $ex; $i++) { $spentC += 40 + 30 * $i; $spentW += 15 + 10 * $i; }
	if ($food > 40 + $bStore + 120 + 1) { $bad[] = 'food'; }
	// batas atas pemasukan: kas awal + misi (11×15) + bonus era + iuran/pasar per bulan
	$nDone = min(count($st['done'] ?? []), 11 + $ex + intdiv(max($kk, 0), 25) + 2);
	$prodB = ($cnt['kebun'] ?? 0) + ($cnt['bengkel'] ?? 0) + ($cnt['pond'] ?? 0) + ($cnt['kandang'] ?? 0) + ($cnt['peternakan'] ?? 0) + ($cnt['dapur'] ?? 0) + $upP + 1; $links = is_array($st['links'] ?? null) ? min(count($st['links']), 40) : 0;
	$loanIn = min(max(0, (int) ($st['loanTot'] ?? 0)), 133 * (1 + intdiv($t, 24)));
	$coinCap = START['coin'] + $loanIn + 25 * intdiv($era * ($era + 1), 2) + max(11, $nDone) * 15 + 40 * $era * $era + $t * (0.6 * max($kk, 1) + 9 + 6 * $markets + 10 * $prodB + 8 * $links + 4 * $zLv + 0.8 * max($kk, 1) + 3 * ($cnt['museum'] ?? 0) + 6 * ($cnt['stadion'] ?? 0) + 6 * ($cnt['dermaga'] ?? 0)) + $t * (60 * ($cnt['bandara'] ?? 0) + 3 * ($cnt['ruko'] ?? 0) + 8 * ($cnt['mal'] ?? 0) + 10 * ($cnt['kom'] ?? 0) + 4 * ($cnt['bank'] ?? 0) + 2 * ($cnt['bioskop'] ?? 0) + 4 * ($cnt['planetarium'] ?? 0) + 40 * ($cnt['tamhib'] ?? 0) + 3 * ($cnt['galian'] ?? 0) + 5 * ($cnt['tobong'] ?? 0) + 16 * ($cnt['tamin'] ?? 0) + 4 * ($cnt['homestay'] ?? 0) + 4 * ($cnt['pasmal'] ?? 0) + 4 * ($cnt['senibudaya'] ?? 0) + 8 * ($cnt['semen'] ?? 0) + 24 * ($cnt['smelter'] ?? 0) + 16 * ($cnt['pelabuhan'] ?? 0) + 8 * ($cnt['tol'] ?? 0) + 18 * ($cnt['kargo'] ?? 0) + 6 * ($cnt['riset'] ?? 0) + 6 * ($cnt['dispar'] ?? 0) + 0.1 * max($kk, 1) * ($cnt['bapenda'] ?? 0) + 2 * $zLv) + 30 * 6 * intdiv($t, 12) + 5;
	$soldC = max(0, min((float) ($st['soldC'] ?? 0), 40 + 4 * $t * max($kk, 1))); $coinCap += min((float) ($st['grantC'] ?? 0), (float) ($GLOBALS['BA_GRANT_TOT'] ?? 0)) + $soldC + (!empty($st['gift50']) ? 610 : 0) + $t * (0.6 * max($kk, 1) + 2 * $era + 2); // v50: hasil jual bahan/pangan
	if ($coin + $spentC > $coinCap * 1.15 + 20) { $bad[] = 'coin'; }
	$woodBuy = max(0, min((int) ($st['woodBuy'] ?? 0), 40000)); $spentC += $woodBuy * 0.15;
	$stone = (float) ($st['res']['stone'] ?? 0); $iron = (float) ($st['res']['iron'] ?? 0); if ($stone < 0 || $iron < 0 || $stone > 100000 || $iron > 100000) { $bad[] = 'mat'; }
	if ($wood + $spentW > 2 * (START['wood'] + 4 * $cleared) + $woodBuy + 5) { $bad[] = 'wood'; }
	if ($cleared > substr_count(implode('', $land), 'G') + $paths) { $bad[] = 'cleared'; }
	if ($cleared > 1600) { $bad[] = 'cleared'; }
	/* K1 (v47a): waktu permainan maks. = kecepatan tertinggi gim (⏩⏩ ×60: 1 jam permainan per detik, 1 bulan = 720 detik), toleransi ×1,5 + 2 bulan */
	if ($prev && ($prev['meta']['created'] ?? 0) === ($st['meta']['created'] ?? 0)) {
		$pt = (int) ($prev['t'] ?? 0); $water0 = substr_count(implode('', $prev['land'] ?? []), 'W');
		if ($t < $pt) { $bad[] = 'rewind'; }
		if ($t - $pt > (time() - $prevAt) / 720 * 1.5 + 2) { $bad[] = 'speed'; }
		if (substr_count(implode('', $land), 'W') < $water0) { $bad[] = 'water'; } // v50l: memulihkan sungai (W bertambah) bukan kecurangan
		if (array_intersect($prev['flagged'] ?? [], ['coin', 'wood', 'speed', 'rewind', 'water', 'land', 'btype', 'bpos', 'era', 'prior', 'own', 'outside'])) { $bad[] = 'prior'; }
	} elseif ($t > 6) { $bad[] = 'fresh'; }
	return [0, array_values(array_unique($bad))];
}

/**
 * Indikator rapor permukiman (0–100), dasar peringkat:
 * e ekonomi warga, n jejaring (jalan & tetangga), c kenyamanan, k kepuasan, p pertumbuhan.
 */
function indicators(array $st, int $nb): array {
	$n = count($st['land']); $land = $st['land']; $bs = is_array($st['b'] ?? null) ? $st['b'] : []; $kk = max(1, (int) ($st['kk'] ?? 1));
	$cnt = []; foreach ($bs as $b) { $cnt[$b['t']] = ($cnt[$b['t']] ?? 0) + 1; }
	$c = fn($t) => $cnt[$t] ?? 0; $cl = fn($v) => max(0.0, min(1.0, (float) $v));
	$prod = $c('field') * 6 + $c('pond') * 2 + $c('kandang') * 3 + $c('peternakan') * 5 + $c('pemburu') * 3; $coin = (float) ($st['res']['coin'] ?? 0);
	$E = 100 * (0.5 * $cl($prod / ($kk * 2)) + 0.25 * $cl($c('market') * 15 / $kk) + 0.25 * $cl(min($coin, 500) / ($kk * 15)));
	$comp = []; $id = 0; $size = [];
	for ($y = 0; $y < $n; $y++) { for ($x = 0; $x < $n; $x++) { if ($land[$y][$x] !== 'P' || isset($comp["$x,$y"])) { continue; } $id++; $q = [[$x, $y]]; $comp["$x,$y"] = $id; $size[$id] = 0;
		while ($q) { [$a, $bq] = array_pop($q); $size[$id]++; foreach ([[1, 0], [-1, 0], [0, 1], [0, -1]] as [$dx, $dy]) { $X = $a + $dx; $Y = $bq + $dy; if ($X >= 0 && $Y >= 0 && $X < $n && $Y < $n && $land[$Y][$X] === 'P' && !isset($comp["$X,$Y"])) { $comp["$X,$Y"] = $id; $q[] = [$X, $Y]; } } } } }
	$big = $size ? array_search(max($size), $size, true) : 0; $tot = 0; $con = 0;
	foreach ($bs as $b) { if ($b['t'] === 'tree') { continue; } $tot++; $w = (int) $b['w']; $ok = false;
		for ($i = -1; $i <= $w && !$ok; $i++) { for ($j = -1; $j <= $w && !$ok; $j++) { $k = ($b['x'] + $i) . ',' . ($b['y'] + $j); if ($big && ($comp[$k] ?? 0) === $big) { $ok = true; } } } if ($ok) { $con++; } }
	$N = 100 * (0.8 * ($tot ? $con / $tot : 0) + 0.2 * $cl($nb / 5));
	$near = function ($h, $t, $r) use ($bs) { foreach ($bs as $b) { if ($b['t'] === $t && abs($b['x'] + ($b['w'] - 1) / 2 - $h['x']) <= $r && abs($b['y'] + ($b['h'] - 1) / 2 - $h['y']) <= $r) { return true; } } return false; };
	$houses = array_values(array_filter($bs, fn($b) => $b['t'] === 'house')); $sum = 0;
	foreach ($houses as $h) { $g = 0; $wet = false; $acc = false;
		for ($dy = -3; $dy <= 3; $dy++) { for ($dx = -3; $dx <= 3; $dx++) { $X = $h['x'] + $dx; $Y = $h['y'] + $dy; if ($X < 0 || $Y < 0 || $X >= $n || $Y >= $n) { continue; } $l = $land[$Y][$X];
			if ($l === 'F') { $g++; } if (abs($dx) <= 1 && abs($dy) <= 1) { if ($l === 'W') { $wet = true; } if ($l === 'P') { $acc = true; } } } }
		foreach ($bs as $b) { if ($b['t'] === 'tree' && abs($b['x'] - $h['x']) <= 3 && abs($b['y'] - $h['y']) <= 3) { $g += 2; } }
		$sum += 0.3 * ($near($h, 'well', 5) ? 1 : 0) + 0.2 * ($near($h, 'worship', 8) ? 1 : 0) + 0.2 * $cl($g / 8) + 0.15 * ($wet ? 0 : 1) + 0.15 * ($acc ? 1 : 0); }
	$C = $houses ? 100 * $sum / count($houses) : 0;
	// layanan kota & RTH (dihitung dari bangunan, bukan dari data klien)
	$era = (int) ($st['era'] ?? 1); $nb2 = max(1, count($bs));
	$green = $c('tree') + 2 * $c('taman') + 5 * $c('tamkot') + 4 * $c('alun') + 4 * $c('retensi');
	$svc = [$cl(($c('tps') * 40 + $c('tpa') * 700 + ($era <= 2 ? 40 : 0)) / $kk), $cl($green / $nb2 / 0.3)];
	if ($era >= 3) { $svc[] = $cl(($c('surya') * 12 + $c('pltmh') * 45 + $c('pembangkit') * 420) / ($kk * 0.3 + 5)); $svc[] = $cl(($c('pospol') * 60) / $kk); }
	if ($era >= 4) { $svc[] = $cl(($c('ipal') * 40) / $kk); $svc[] = $cl(($c('damkar') * 80) / $kk); $svc[] = $cl(($c('paud') * 10 + $c('sekolah') * 15 + $c('smp') * 40 + $c('sma') * 60 + $c('kampus') * 150) / $kk); }
	$C = 0.7 * $C + 30 * array_sum($svc) / count($svc); $RTH = 100 * min(1.0, $green / $nb2); $SVC = 100 * array_sum($svc) / count($svc);
	$K = 0.6 * (int) ($st['happy'] ?? 0) + 0.4 * (int) ($st['coh'] ?? 0);
	$P = 70 * $cl(((int) ($st['kk'] ?? 0)) / 50) + 30 * $cl(((int) ($st['era'] ?? 1) - 1) / 5);
	$r = ['e' => (int) round($E), 'n' => (int) round($N), 'c' => (int) round($C), 'k' => (int) round($K), 'p' => (int) round($P), 'rth' => (int) round($RTH), 'svc' => (int) round($SVC)];
	// kampung yang baru sedikit warganya tidak boleh langsung berskor tinggi: bobot naik sampai 50 KK
	$r['score'] = (int) round(10 * (0.25 * $r['e'] + 0.2 * $r['n'] + 0.2 * $r['c'] + 0.25 * $r['k'] + 0.1 * $r['p']) * (0.35 + 0.65 * min(1, ((int) ($st['kk'] ?? 0)) / 50)));
	$r['kk'] = (int) ($st['kk'] ?? 0); $r['era'] = (int) ($st['era'] ?? 1);
	return $r;
}
/** tantangan kelas dari dosen: dinilai server dari indikator (bukan data klien) */
const CHAL = ['hijau' => 'RTH ≥ 30% & ≥ 100 KK', 'nyaman' => 'Kenyamanan ≥ 75 & ≥ 100 KK', 'ekonomi' => 'Ekonomi warga ≥ 65 & ≥ 100 KK', 'jejaring' => 'Jejaring ≥ 75', 'layanan' => 'Layanan kota ≥ 90 (era Desa+)', 'puas' => 'Kepuasan ≥ 75 & ≥ 150 KK'];
function chal_ok(string $c, array $i): bool {
	switch ($c) { case 'hijau': return $i['rth'] >= 30 && $i['kk'] >= 100; case 'nyaman': return $i['c'] >= 75 && $i['kk'] >= 100; case 'ekonomi': return $i['e'] >= 65 && $i['kk'] >= 100;
		case 'jejaring': return $i['n'] >= 75; case 'layanan': return $i['svc'] >= 90 && $i['era'] >= 4; case 'puas': return $i['k'] >= 75 && $i['kk'] >= 150; } return false; }
/** wilayah pemain (meter, relatif ke titik lokasi): 1 petak ≈ 10 m; wilayah awal 40×40 petak ≈ 400×400 m */
function claim_box(array $o): array { $x0 = (int) ($o['x0'] ?? 44); $x1 = (int) ($o['x1'] ?? 84); $y0 = (int) ($o['y0'] ?? 44); $y1 = (int) ($o['y1'] ?? 84);
	return ['hx' => max(200, ($x1 - $x0) * 5), 'hy' => max(200, ($y1 - $y0) * 5), 'dx' => (($x0 + $x1) / 2 - 64) * 10, 'dy' => (($y0 + $y1) / 2 - 64) * 10]; }
/** v46c: direktori dibaca sekali per permintaan (sebelumnya 2–3 kali saat simpan). */
function dir_rd(): array { static $d = null; return $d ??= (rd('dir.php') ?: []); }
function claim_list(float $lat, float $lon, float $km, string $me = ''): array { $d = dir_rd(); $out = []; $cut = time() - 180 * 86400;
	foreach ($d as $id => $m) { if (($m['at'] ?? 0) < $cut || !isset($m['lat'])) { continue; } $dy = ($m['lat'] - $lat) * 111320; $dx = ($m['lon'] - $lon) * 111320 * cos(deg2rad($lat));
		if (abs($dx) > $km * 1000 || abs($dy) > $km * 1000) { continue; } $out[$id] = $m + ['hx' => 200, 'hy' => 200, 'dx' => 0, 'dy' => 0]; } return $out; }
function claim_hit(string $me, array $meta): ?string { foreach (claim_list($meta['lat'], $meta['lon'], 5) as $id => $m) { if ($id === $me) { continue; }
		$cx = ($m['lon'] - $meta['lon']) * 111320 * cos(deg2rad($meta['lat'])) + $m['dx'] - $meta['dx']; $cy = -($m['lat'] - $meta['lat']) * 111320 + $m['dy'] - $meta['dy'];
		if (abs($cx) < $m['hx'] + $meta['hx'] && abs($cy) < $m['hy'] + $meta['hy']) { return (string) ($m['name'] ?? '?'); } } return null; }
function nb_count(string $me, array $m, array $u): int { $d = dir_rd(); $k = 0;
	foreach ($d as $id => $x) { if ($id === $me) { continue; } $km = 6371 * 2 * asin(sqrt(sin(deg2rad($x['lat'] - $m['lat']) / 2) ** 2 + cos(deg2rad($m['lat'])) * cos(deg2rad($x['lat'])) * sin(deg2rad($x['lon'] - $m['lon']) / 2) ** 2));
		if ($km < 25 || (($u['kelas'] ?? '') !== '' && ($x['kelas'] ?? '') === $u['kelas'])) { $k++; } if ($k >= 5) { break; } } return $k; }

ensure_dir();
check_origin();
$a = (string) ($_GET['a'] ?? '');
$b = $_SERVER['REQUEST_METHOD'] === 'POST' ? body() : [];

switch ($a) {
	case 'ping': out(['ok' => true, 'v' => '0.2', 'eula' => EULA_VER, 'sem' => semester()]);
	case 'cfg': { out(['ok' => true, 'cfg' => cfg_pub()]); }
	case 'hb': {
		if (mt_rand(1, 20) === 1) { try { require_once __DIR__ . '/backup.php'; ba_bk_daily(DATA); } catch (Throwable $e) {} } /* v49 K4: cadangan harian */
		$sid = preg_replace('/[^a-z0-9]/', '', strtolower((string) ($b['sid'] ?? ''))); if (strlen($sid) < 8 || strlen($sid) > 24) { fail('bad'); }
		rate('hb' . $sid, 8, 300, false); rate('hb_ip', 3000, 300); // v46b: juga dibatasi per IP (longgar untuk NAT kampus)
		$who = ''; $uid = '';
		$tok = (string) ($_SERVER['HTTP_X_BA_TOKEN'] ?? ''); if (preg_match('/^([a-f0-9]{20})\.([a-f0-9]{48})$/', $tok, $mm)) { $uu = rd('u_' . $mm[1] . '.php'); foreach (($uu['tokens'] ?? []) as $tt) { if (hash_equals($tt['h'], hash('sha256', $mm[2])) && $tt['exp'] > time()) { $uid = $mm[1]; $who = (string) ($uu['user'] ?? ''); } } }
		$row = ['at' => time(), 'user' => $who, 'uid' => $uid, 'guest' => $uid === '', 'name' => clean((string) ($b['name'] ?? ''), 60), 'loc' => clean((string) ($b['loc'] ?? ''), 80), 'cc' => clean((string) ($b['cc'] ?? ''), 3),
			'lat' => round((float) ($b['lat'] ?? 0), 3), 'lon' => round((float) ($b['lon'] ?? 0), 3), 'era' => (int) ($b['era'] ?? 0), 'kk' => (int) ($b['kk'] ?? 0), 'dev' => clean((string) ($b['dev'] ?? ''), 12), 'scr' => clean((string) ($b['scr'] ?? ''), 10)];
		if (!is_dir(DATA . '/live')) { @mkdir(DATA . '/live', 0750); @file_put_contents(DATA . '/live/index.php', GUARD); }
		// v46b: sesi baru hanya dibuat bila folder live/ belum penuh, agar sid acak tidak bisa memenuhi disk
		$lf = DATA . '/live/' . $sid . '.php'; if (!is_file($lf) && count(glob(DATA . '/live/*.php', GLOB_NOSORT) ?: []) > 5000) { out(['ok' => true, 'cfg' => cfg_pub()]); }
		@file_put_contents($lf, GUARD . json_encode($row, JSON_UNESCAPED_UNICODE), LOCK_EX);
		if (mt_rand(1, 200) === 1) { $cut = time() - 7 * 86400; foreach (glob(DATA . '/live/*.php') ?: [] as $f) { if (basename($f) !== 'index.php' && @filemtime($f) < $cut) { @unlink($f); } } }
		if ($uid) { upd('u_' . $uid . '.php', function ($x) { if (!$x) { return ['__ret' => false]; } $x['seen'] = time(); return ['__write' => $x, '__ret' => true]; }); }
		out(['ok' => true, 'cfg' => cfg_pub()]);
	}
	case 'register': {
		if (!cfg()['regOpen']) { fail('reg_closed', 403); } if (cfg()['maint']) { fail('maint', 503); }
		rate('reg', 200, 3600); rate('reg_burst', 150, 60);
		$user = clean((string) ($b['user'] ?? ''), 32); $pass = (string) ($b['pass'] ?? '');
		if (!preg_match('/^[A-Za-z0-9_.\-]{3,32}$/', $user)) { fail('bad_user'); }
		if (strlen($pass) < 6 || strlen($pass) > 200) { fail('bad_pass'); }
		if (($b['eula'] ?? '') !== EULA_VER) { fail('eula'); }
		if (rude($user) || rude((string) ($b['name'] ?? ''))) { fail('rude'); }
		$kc = kelas_code((string) ($b['kelas'] ?? '')); if ($kc !== '' && !rd('k_' . $kc . '.php')) { fail('no_class'); }
		$uid = uid_of($user);
		$made = upd('u_' . $uid . '.php', function ($u) use ($user, $pass, $b, $kc) { if ($u) { return ['__ret' => false]; }
			return ['__write' => ['user' => $user, 'hash' => password_hash($pass, PASSWORD_DEFAULT), 'name' => clean((string) ($b['name'] ?? $user), 60), 'kampus' => clean((string) ($b['kampus'] ?? ''), 80), 'kampusCC' => preg_replace('/[^A-Z]/', '', strtoupper(substr((string) ($b['kampusCC'] ?? ''), 0, 2))), 'kelas' => $kc, 'created' => time(), 'eula' => EULA_VER, 'eulaAt' => time(), 'tokens' => []], '__ret' => true]; });
		if (!$made) { fail('user_taken', 409); }
		$u = rd('u_' . $uid . '.php'); out(['ok' => true, 'token' => new_token($uid), 'me' => pub($u)]);
	}
	case 'login': {
		$user = clean((string) ($b['user'] ?? ''), 32); rate('login_u' . mb_strtolower($user), 10, 900); rate('login_ua' . mb_strtolower($user), 30, 900, false); /* v46c: 10 per (akun, IP) + 30 per akun, agar satu penyerang tidak bisa mengunci akun orang lain */ rate('login_ip', 600, 900); $pass = (string) ($b['pass'] ?? ''); $uid = uid_of($user); $u = rd('u_' . $uid . '.php');
		if (!$u || !password_verify($pass, $u['hash'])) { fail('bad_login', 401); }
		if (!empty($u['ban'])) { fail('banned', 403); }
		out(['ok' => true, 'token' => new_token($uid), 'me' => pub($u)]);
	}
	case 'chpw': { /* v50k: ganti kata sandi (wajib setelah reset oleh pengelola) */
		$u = auth(); rate('chpw' . $u['uid'], 10, 3600, false); $old = (string) ($b['old'] ?? ''); $new = (string) ($b['new'] ?? '');
		if (strlen($new) < 6 || strlen($new) > 200) { fail('bad_pass'); }
		$tok = (string) ($_SERVER['HTTP_X_BA_TOKEN'] ?? ''); $sec = explode('.', $tok, 2)[1] ?? '';
		$ok = upd('u_' . $u['uid'] . '.php', function ($x) use ($old, $new, $sec) { if (!$x || !password_verify($old, $x['hash'])) { return ['__ret' => false]; }
			$x['hash'] = password_hash($new, PASSWORD_DEFAULT); unset($x['mustPw']); $h = hash('sha256', $sec); $x['tokens'] = array_values(array_filter($x['tokens'] ?? [], fn($t) => hash_equals($t['h'], $h))); $x['pwAt'] = time();
			return ['__write' => $x, '__ret' => true]; });
		if (!$ok) { fail('bad_login', 401); } out(['ok' => true]);
	}
	case 'me': { $u = auth(); $s = rd('s_' . $u['uid'] . '.php'); $kc = ($u['kelas'] ?? '') !== '' ? (rd('k_' . kelas_code((string) $u['kelas']) . '.php') ?: []) : []; out(['ok' => true, 'tantangan' => (string) ($kc['tantangan'] ?? ''), 'me' => pub($u), 'hasSave' => (bool) $s, 'saveMeta' => $s ? ($s['meta'] ?? null) : null]); }
	case 'logout': { $u = auth(); $tok = (string) $_SERVER['HTTP_X_BA_TOKEN']; $sec = explode('.', $tok, 2)[1];
		upd('u_' . $u['uid'] . '.php', function ($x) use ($sec) { $x['tokens'] = array_values(array_filter($x['tokens'] ?? [], fn($t) => !hash_equals($t['h'], hash('sha256', $sec)))); return ['__write' => $x, '__ret' => true]; }); out(['ok' => true]); }
	case 'save': {
		if (cfg()['maint']) { fail('maint', 503); }
		$u = auth(); rate('save' . $u['uid'], 40, 600);
		$raw = (string) file_get_contents('php://input'); if (strlen($raw) > MAX_SAVE) { fail('too_big', 413); }
		$j = json_decode($raw, true); if (!is_array($j) || !isset($j['state']) || !is_array($j['state']) || !state_ok($j['state'])) { fail('bad_save'); }
		$why = bot_reasons($j['tele'] ?? null); if ($why && empty($u['botOk']) && empty($u['sah'])) { bot_flag($u['uid'], $u, $why); }
		$meta = ['name' => clean((string) ($j['state']['meta']['name'] ?? ''), 60), 'era' => (int) ($j['state']['era'] ?? 1), 'month' => (int) ($j['state']['t'] ?? 0), 'kk' => (int) ($j['state']['kk'] ?? 0),
			'loc' => clean((string) ($j['state']['loc']['name'] ?? ''), 80), 'lat' => (float) ($j['state']['loc']['lat'] ?? 0), 'lon' => (float) ($j['state']['loc']['lon'] ?? 0), 'score' => (int) ($j['state']['score'] ?? 0), 'at' => time()];
		$ow = $j['state']['own'] ?? []; $meta += claim_box($ow);
		if (($u['eula'] ?? '') !== EULA_VER) { fail('eula', 403); }
		$base = (int) ($j['base'] ?? 0);
		$old = rd('s_' . $u['uid'] . '.php'); $fresh = !$old || (($old['state']['meta']['created'] ?? 0) !== ($j['state']['meta']['created'] ?? 0));
		if ($fresh && ($who = claim_hit($u['uid'], $meta))) { out(['ok' => false, 'error' => 'claimed', 'by' => $who], 409); }
		$nbc = nb_count($u['uid'], $meta, $u); $GLOBALS['BA_GRANT_TOT'] = (float) ($u['grantTot'] ?? 0);
		$sah = !empty($u['sah']); /* v50m: pemain sah (diverifikasi pengelola) — catatan pemeriksaan otomatis tidak menahan peringkat */
		$r = upd('s_' . $u['uid'] . '.php', function ($s) use ($j, &$meta, $base, $nbc, $sah) { $ver = (int) ($s['ver'] ?? 0);
			if ($s && $base && $base !== $ver && empty($j['force'])) { return ['__ret' => ['conflict' => $ver]]; }
			// v46b: simpanan yang waktunya mundur (tab/perangkat lama) ditolak, tidak ditulis & tidak ditandai curang
			if ($s && ($s['state']['meta']['created'] ?? 0) === ($j['state']['meta']['created'] ?? 0) && (int) ($j['state']['t'] ?? 0) < (int) ($s['state']['t'] ?? 0)) { return ['__ret' => ['stale' => $ver]]; }
			$prev = $s['state'] ?? null; if ($prev !== null) { $prev['flagged'] = ((int) ($s['meta']['at'] ?? 0) < 1793771100) ? [] : ($s['flagged'] ?? []); } /* v50l: amnesti tanda yang muncul karena bug hitung bangunan (v50g, 4 Nov 00.25–12.45 WIB) */
			[$score, $bad] = audit($j['state'], $prev, (int) ($s['meta']['at'] ?? 0));
			$ind = in_array('land', $bad, true) ? ['e' => 0, 'n' => 0, 'c' => 0, 'k' => 0, 'p' => 0, 'score' => 0] : indicators($j['state'], $nbc); $score = $ind['score']; $meta['ind'] = $ind;
			if (($prev['meta']['created'] ?? 0) !== ($j['state']['meta']['created'] ?? 0)) { $bad = array_values(array_diff($bad, ['prior'])); }
			$note = []; if ($sah) { $note = array_values(array_diff($bad, ['prior'])); $bad = []; }
			$meta['score'] = $score; $meta['flag'] = $bad ? 1 : 0;
			return ['__write' => ['ver' => $ver + 1, 'meta' => $meta, 'state' => array_merge($j['state'], ['_ind' => $meta['ind']]), 'flagged' => $bad, 'note' => $note], '__ret' => ['ver' => $ver + 1, 'bad' => $bad]]; });
		if (isset($r['conflict'])) { out(['ok' => false, 'error' => 'conflict', 'ver' => $r['conflict']], 409); }
		if (isset($r['stale'])) { out(['ok' => false, 'error' => 'stale', 'ver' => $r['stale']], 409); }
		// direktori publik ringkas untuk tetangga (tanpa data pribadi selain nama tokoh)
		// v42: berkas bersama (direktori & peringkat) hanya ditulis bila ada perubahan berarti atau sudah 15 menit → aman untuk ratusan pemain bersamaan
		$dirSig = md5(json_encode([$meta['name'], $meta['loc'], round((float) $meta['lat'], 3), round((float) $meta['lon'], 3), $meta['era'], intdiv((int) $meta['kk'], 5), $u['kelas'] ?? '', $u['name'] ?? '']));
		$doDir = $fresh || $dirSig !== ($u['dirSig'] ?? '') || time() - (int) ($u['dirAt'] ?? 0) > 900;
		if ($doDir) upd('dir.php', function ($d) use ($u, $meta) { $d = $d ?: []; $d[$u['uid']] = $meta + ['who' => $u['name'] ?? $u['user'], 'kelas' => $u['kelas'] ?? '', 'kampus' => $u['kampus'] ?? ''];
			if (count($d) > 5000) { uasort($d, fn($x, $y) => $y['at'] <=> $x['at']); $d = array_slice($d, 0, 5000, true); } return ['__write' => $d, '__ret' => true]; });
		$kc = ($u['kelas'] ?? '') !== '' ? (rd('k_' . kelas_code((string) $u['kelas']) . '.php') ?: []) : []; $chal = (string) ($kc['tantangan'] ?? ''); $chalNow = $chal !== '' && !$r['bad'] && isset($meta['ind']['rth']) && chal_ok($chal, $meta['ind']);
		$lbSig = $meta['score'] . '|' . $meta['era'] . '|' . ($u['kelas'] ?? ''); $doLb = $chalNow || $lbSig !== ($u['lbSig'] ?? '') || time() - (int) ($u['lbAt'] ?? 0) > 900;
		if (!$r['bad'] && $doLb) { $sem = semester(); $row = ['who' => $u['user'], 'name' => $meta['name'], 'kelas' => $u['kelas'] ?? '', 'kampus' => $u['kampus'] ?? '', 'score' => $meta['score'], 'era' => $meta['era'], 'kk' => $meta['kk'], 'month' => $meta['month'], 'loc' => $meta['loc'], 'ind' => $meta['ind'], 'at' => time()];
			upd('lb_' . $sem . '.php', function ($d) use ($u, $row, $chal, $chalNow) { $d = $d ?: []; $old = $d[$u['uid']] ?? null; if ($row['score'] >= (int) ($old['best'] ?? 0)) { $row['best'] = $row['score']; $row['bestInd'] = $row['ind']; $row['bestEra'] = $row['era']; $row['bestKK'] = $row['kk']; $row['bestName'] = $row['name']; } else { $row['best'] = (int) $old['best']; $row['bestInd'] = $old['bestInd'] ?? $row['ind']; $row['bestEra'] = $old['bestEra'] ?? null; $row['bestKK'] = $old['bestKK'] ?? null; $row['bestName'] = $old['bestName'] ?? null; } $row['saves'] = (int) ($old['saves'] ?? 0) + 1; $row['chal'] = $chal; $row['chalAt'] = ($old['chal'] ?? '') === $chal && !empty($old['chalAt']) ? $old['chalAt'] : ($chalNow ? time() : 0); $row['first'] = $old['first'] ?? time(); $d[$u['uid']] = $row; return ['__write' => $d, '__ret' => true]; });
		if ($doDir || (!$r['bad'] && $doLb)) { upd('u_' . $u['uid'] . '.php', function ($x) use ($doDir, $dirSig, $doLb, $lbSig, $r) { if (!$x) { return ['__ret' => false]; } if ($doDir) { $x['dirSig'] = $dirSig; $x['dirAt'] = time(); } if (!$r['bad'] && $doLb) { $x['lbSig'] = $lbSig; $x['lbAt'] = time(); } return ['__write' => $x, '__ret' => true]; }); } }
		$grant = 0; if ((float) ($u['grantPend'] ?? 0) > 0) { $grant = upd('u_' . $u['uid'] . '.php', function ($x) { if (!$x) { return ['__ret' => 0]; } $g = (float) ($x['grantPend'] ?? 0); $x['grantPend'] = 0; return ['__write' => $x, '__ret' => $g]; }); }
		out(['ok' => true, 'grant' => $grant, 'ver' => $r['ver'], 'score' => $meta['score'], 'ind' => $meta['ind'], 'ranked' => !$r['bad'], 'flags' => $r['bad'], 'chal' => $chal, 'chalOk' => $chalNow]);
	}
	case 'eula': { $u = auth(); if (($b['ver'] ?? '') !== EULA_VER) { fail('eula'); }
		upd('u_' . $u['uid'] . '.php', function ($x) { $x['eula'] = EULA_VER; $x['eulaAt'] = time(); return ['__write' => $x, '__ret' => true]; }); out(['ok' => true]); }
	case 'board': {
		$u = auth(); rate('board', 1200, 300); $sem = preg_match('/^\d{4}-(Ganjil|Genap)$/', (string) ($_GET['sem'] ?? '')) ? (string) $_GET['sem'] : semester();
		$scope = (string) ($_GET['scope'] ?? 'publik'); $d = rd('lb_' . $sem . '.php') ?: []; $rows = [];
		if ($scope === 'antarkelas') { /* v48: rata-rata skor terbaik per kelas di kampus yang sama */
			if (($u['kampus'] ?? '') === '') { out(['ok' => true, 'sem' => $sem, 'scope' => $scope, 'total' => 0, 'myRank' => null, 'list' => []]); }
			$g = []; foreach ($d as $id => $r) { if (($r['kelas'] ?? '') === '' || mb_strtolower($r['kampus'] ?? '') !== mb_strtolower($u['kampus'])) { continue; } $g[$r['kelas']][] = (int) $r['best']; }
			$cls = []; foreach ($g as $c => $sc) { $k = rd('k_' . kelas_code((string) $c) . '.php') ?: []; rsort($sc); $top = array_slice($sc, 0, 10); $cls[] = ['me' => $c === ($u['kelas'] ?? ''), 'who' => (string) ($k['nama'] ?? $c), 'name' => $c, 'kampus' => '', 'best' => (int) round(array_sum($top) / count($top)), 'ind' => null, 'era' => '', 'kk' => count($sc)]; }
			usort($cls, fn($a, $b) => $b['best'] <=> $a['best']); $mine = null; foreach ($cls as $i => $r) { if ($r['me']) { $mine = $i + 1; break; } }
			out(['ok' => true, 'sem' => $sem, 'scope' => $scope, 'total' => count($cls), 'myRank' => $mine, 'list' => array_slice($cls, 0, 50)]); }
		foreach ($d as $id => $r) { if ($scope === 'kelas' && (($u['kelas'] ?? '') === '' || $r['kelas'] !== $u['kelas'])) { continue; } if ($scope === 'kampus' && (($u['kampus'] ?? '') === '' || mb_strtolower($r['kampus']) !== mb_strtolower($u['kampus']))) { continue; }
			$rows[] = ['me' => $id === $u['uid'], 'who' => $r['who'], 'name' => $r['name'], 'kampus' => $scope === 'publik' ? $r['kampus'] : '', 'best' => $r['best'], 'ind' => $r['bestInd'] ?? null, 'era' => $r['era'], 'kk' => $r['kk'], 'bEra' => $r['bestEra'] ?? null, 'bKK' => $r['bestKK'] ?? null, 'now' => (int) ($r['score'] ?? $r['best'])]; } /* v50m: era/KK saat skor terbaik + skor sekarang */
		usort($rows, fn($a, $b) => $b['best'] <=> $a['best']); $mine = null; foreach ($rows as $i => $r) { if ($r['me']) { $mine = $i + 1; break; } }
		out(['ok' => true, 'sem' => $sem, 'scope' => $scope, 'total' => count($rows), 'myRank' => $mine, 'list' => array_slice($rows, 0, 50)]);
	}
	case 'kelas_new': { $u = auth(); rate('kelasnew' . $u['uid'], 10, 86400); $nama = clean((string) ($b['nama'] ?? ''), 80); if (mb_strlen($nama) < 3 || rude($nama)) { fail('bad_name'); }
		for ($i = 0; $i < 8; $i++) { $code = ''; $al = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; for ($k = 0; $k < 6; $k++) { $code .= $al[random_int(0, 31)]; }
			$ok = upd('k_' . $code . '.php', function ($k) use ($u, $nama) { if ($k) { return ['__ret' => false]; } return ['__write' => ['owner' => $u['uid'], 'ownerUser' => $u['user'], 'nama' => $nama, 'created' => time()], '__ret' => true]; });
			if ($ok) { upd('u_' . $u['uid'] . '.php', function ($x) use ($code) { $x['owns'] = array_values(array_unique(array_merge($x['owns'] ?? [], [$code]))); return ['__write' => $x, '__ret' => true]; }); out(['ok' => true, 'code' => $code]); } }
		fail('storage', 500); }
	case 'kelas_mine': { $u = auth(); $list = []; foreach (($u['owns'] ?? []) as $c) { $k = rd('k_' . $c . '.php'); if ($k) { $list[] = ['code' => $c, 'nama' => $k['nama'], 'created' => $k['created'], 'tantangan' => (string) ($k['tantangan'] ?? '')]; } } out(['ok' => true, 'list' => $list]); }
	case 'kelas_tantangan': { $u = auth(); rate('kt' . $u['uid'], 30, 3600); $c = preg_replace('/[^A-Z0-9]/', '', strtoupper((string) ($b['code'] ?? ''))); $t = (string) ($b['t'] ?? '');
		if ($t !== '' && !isset(CHAL[$t])) { fail('bad'); } $ok = upd('k_' . $c . '.php', function ($k) use ($u, $t) { if (!$k || $k['owner'] !== $u['uid']) { return ['__ret' => false]; } $k['tantangan'] = $t; return ['__write' => $k, '__ret' => true]; });
		if (!$ok) { fail('forbidden', 403); } out(['ok' => true]); }
	case 'kelas_join': { $u = auth(); rate('join' . $u['uid'], 10, 3600); $c = preg_replace('/[^A-Z0-9]/', '', strtoupper((string) ($b['code'] ?? '')));
		if ($c === '' && !empty($b['leave'])) { upd('u_' . $u['uid'] . '.php', function ($x) { $x['kelas'] = ''; return ['__write' => $x, '__ret' => true]; }); lb_sync($u['uid'], ['kelas' => '']); out(['ok' => true, 'kelas' => '']); } /* v48: keluar kelas */
		$k = $c ? rd('k_' . $c . '.php') : null; if (!$k) { fail('no_class', 404); }
		upd('u_' . $u['uid'] . '.php', function ($x) use ($c) { $x['kelas'] = $c; return ['__write' => $x, '__ret' => true]; }); lb_sync($u['uid'], ['kelas' => $c]); out(['ok' => true, 'kelas' => $c, 'nama' => $k['nama']]); }
	case 'profile': { /* v48: ubah kampus (nama baku dari daftar kampus dunia atau "Lainnya") */
		$u = auth(); rate('prof' . $u['uid'], 20, 86400, false); $kp = clean((string) ($b['kampus'] ?? ''), 80); $cc = preg_replace('/[^A-Z]/', '', strtoupper(substr((string) ($b['kampusCC'] ?? ''), 0, 2)));
		if ($kp !== '' && (mb_strlen($kp) < 3 || rude($kp))) { fail('bad_name'); }
		upd('u_' . $u['uid'] . '.php', function ($x) use ($kp, $cc) { $x['kampus'] = $kp; $x['kampusCC'] = $cc; return ['__write' => $x, '__ret' => true]; }); lb_sync($u['uid'], ['kampus' => $kp]);
		$u2 = rd('u_' . $u['uid'] . '.php'); out(['ok' => true, 'me' => pub($u2)]); }
	case 'rekap': {
		$u = auth(); $c = preg_replace('/[^A-Z0-9]/', '', strtoupper((string) ($_GET['code'] ?? ''))); $k = $c ? rd('k_' . $c . '.php') : null;
		if (!$k || $k['owner'] !== $u['uid']) { fail('forbidden', 403); }
		$sem = preg_match('/^\d{4}-(Ganjil|Genap)$/', (string) ($_GET['sem'] ?? '')) ? (string) $_GET['sem'] : semester(); $d = rd('lb_' . $sem . '.php') ?: []; $rows = [];
		foreach ($d as $r) { if ($r['kelas'] === $c) { $rows[] = ['user' => $r['who'], 'permukiman' => $r['name'], 'lokasi' => $r['loc'], 'skor_terbaik' => $r['best'], 'skor_terakhir' => $r['score'], 'ekonomi' => $r['bestInd']['e'] ?? '', 'jejaring' => $r['bestInd']['n'] ?? '', 'kenyamanan' => $r['bestInd']['c'] ?? '', 'kepuasan' => $r['bestInd']['k'] ?? '', 'pertumbuhan' => $r['bestInd']['p'] ?? '', 'era' => $r['era'], 'kk' => $r['kk'], 'bulan_main' => $r['month'], 'jumlah_simpan' => $r['saves'], 'tantangan' => $r['chal'] ?? '', 'tantangan_tercapai' => !empty($r['chalAt']) ? date('Y-m-d', $r['chalAt']) : '', 'rth' => $r['bestInd']['rth'] ?? '', 'layanan_kota' => $r['bestInd']['svc'] ?? '', 'mulai' => date('Y-m-d', $r['first']), 'terakhir' => date('Y-m-d H:i', $r['at'])]; } }
		usort($rows, fn($a, $b) => $b['skor_terbaik'] <=> $a['skor_terbaik']); out(['ok' => true, 'kelas' => $c, 'nama' => $k['nama'], 'sem' => $sem, 'rows' => $rows]);
	}
	case 'delete': { $u = auth(); rate('del' . $u['uid'], 5, 3600, false); $full = rd('u_' . $u['uid'] . '.php'); if (!$full || !password_verify((string) ($b['pass'] ?? ''), $full['hash'])) { fail('bad_login', 401); }
		@unlink(DATA . '/s_' . $u['uid'] . '.php'); @unlink(DATA . '/u_' . $u['uid'] . '.php');
		upd('dir.php', function ($d) use ($u) { $d = $d ?: []; unset($d[$u['uid']]); return ['__write' => $d, '__ret' => true]; });
		foreach (glob(DATA . '/lb_*.php') ?: [] as $f) { upd(basename($f), function ($d) use ($u) { $d = $d ?: []; unset($d[$u['uid']]); return ['__write' => $d, '__ret' => true]; }); }
		// v46b: akhiri perjanjian dagang & hapus catatan peringatan bot milik akun ini
		if (is_file(DATA . '/deals.php')) { upd('deals.php', function ($x) use ($u) { $x = $x ?: []; foreach ($x as $k => $v) { if (($v['from'] ?? '') === $u['uid'] || ($v['to'] ?? '') === $u['uid']) { unset($x[$k]); } } return ['__write' => $x, '__ret' => true]; }); }
		if (is_file(DATA . '/alerts.php')) { upd('alerts.php', function ($a) use ($u) { $a = array_values(array_filter($a ?: [], fn($r) => ($r['uid'] ?? '') !== $u['uid'])); return ['__write' => $a, '__ret' => true]; }); }
		out(['ok' => true]); }
	case 'load': { $u = auth(); $s = rd('s_' . $u['uid'] . '.php'); out(['ok' => true, 'save' => $s]); }
	case 'neighbors': {
		$u = auth(); $lat = (float) ($_GET['lat'] ?? 0); $lon = (float) ($_GET['lon'] ?? 0); $d = rd('dir.php') ?: []; $me = $u['uid']; $out = [];
		foreach ($d as $id => $m) { if ($id === $me) { continue; } $km = 6371 * 2 * asin(sqrt(sin(deg2rad($m['lat'] - $lat) / 2) ** 2 + cos(deg2rad($lat)) * cos(deg2rad($m['lat'])) * sin(deg2rad($m['lon'] - $lon) / 2) ** 2));
			$rel = $km < 25 ? 'dekat' : (($u['kelas'] ?? '') !== '' && ($m['kelas'] ?? '') === $u['kelas'] ? 'kelas' : (($u['kampus'] ?? '') !== '' && ($m['kampus'] ?? '') === $u['kampus'] ? 'kampus' : ''));
			if ($rel) { $out[] = ['id' => substr(hash('sha256', $id), 0, 10), 'who' => $m['who'], 'name' => $m['name'], 'era' => $m['era'], 'kk' => $m['kk'], 'loc' => $m['loc'], 'km' => round($km, 1), 'rel' => $rel, 'score' => $m['score']]; } }
		usort($out, fn($x, $y) => $x['km'] <=> $y['km']); out(['ok' => true, 'list' => array_slice($out, 0, 30)]);
	}
	case 'claimed': {
		rate('claimed', 2400, 600); $lat = (float) ($_GET['lat'] ?? 0); $lon = (float) ($_GET['lon'] ?? 0); $me = '';
		$tok = (string) ($_SERVER['HTTP_X_BA_TOKEN'] ?? ''); if (preg_match('/^([a-f0-9]{20})\.([a-f0-9]{48})$/', $tok, $mm)) { $uu = rd('u_' . $mm[1] . '.php'); foreach (($uu['tokens'] ?? []) as $tt) { if (hash_equals($tt['h'], hash('sha256', $mm[2])) && $tt['exp'] > time()) { $me = $mm[1]; } } }
		// v46b: koordinat dibulatkan (±50 m) dan nama tokoh hanya untuk pemain yang masuk, agar lokasi pemain tidak bisa dipetakan anonim
		$res = []; foreach (claim_list($lat, $lon, 15) as $id => $m) { $res[] = ['lat' => round((float) $m['lat'], 3), 'lon' => round((float) $m['lon'], 3), 'hx' => $m['hx'], 'hy' => $m['hy'], 'dx' => $m['dx'], 'dy' => $m['dy'], 'name' => $m['name'] ?? '', 'who' => $me !== '' ? ($m['who'] ?? '') : '', 'mine' => $id === $me]; }
		out(['ok' => true, 'list' => array_slice($res, 0, 300)]);
	}
	// ---- perjanjian dagang dua arah antarpemain ----
	case 'deal_offer': {
		$u = auth(); rate('deal' . $u['uid'], 20, 3600); $to = preg_replace('/[^a-f0-9]/', '', (string) ($b['to'] ?? '')); $com = preg_replace('/[^a-z_]/', '', (string) ($b['com'] ?? ''));
		if (strlen($to) !== 10 || $com === '' || strlen($com) > 20) { fail('bad'); }
		$d = rd('dir.php') ?: []; $tid = null; foreach ($d as $id => $m) { if (substr(hash('sha256', $id), 0, 10) === $to) { $tid = $id; break; } }
		if (!$tid || $tid === $u['uid']) { fail('no_user', 404); }
		$r = upd('deals.php', function ($x) use ($u, $tid, $com) { $x = $x ?: [];
			$mine = 0; foreach ($x as $k => $v) { if ($v['from'] === $u['uid'] && $v['st'] === 'pending') { $mine++; } if (($v['from'] === $u['uid'] && $v['to'] === $tid || $v['from'] === $tid && $v['to'] === $u['uid']) && $v['st'] !== 'ended') { return ['__ret' => 'dup']; } }
			if ($mine >= 10) { return ['__ret' => 'limit']; } if (count($x) > 5000) { return ['__ret' => 'full']; }
			$id = bin2hex(random_bytes(6)); $x[$id] = ['from' => $u['uid'], 'to' => $tid, 'com' => $com, 'st' => 'pending', 't' => time()]; return ['__write' => $x, '__ret' => $id]; });
		if (in_array($r, ['dup', 'limit', 'full'], true)) { fail($r); } out(['ok' => true, 'id' => $r]);
	}
	case 'deals': {
		$u = auth(); $x = rd('deals.php') ?: []; $d = rd('dir.php') ?: []; $me = $u['uid']; $res = [];
		foreach ($x as $id => $v) { if ($v['st'] === 'ended' || ($v['from'] !== $me && $v['to'] !== $me)) { continue; } $other = $v['from'] === $me ? $v['to'] : $v['from'];
			$res[] = ['id' => $id, 'dir' => $v['from'] === $me ? 'out' : 'in', 'st' => $v['st'], 'com' => $v['com'], 'name' => $d[$other]['name'] ?? '?', 'who' => $d[$other]['who'] ?? '?', 'loc' => $d[$other]['loc'] ?? '', 'pid' => substr(hash('sha256', $other), 0, 10)]; }
		out(['ok' => true, 'list' => $res]);
	}
	case 'deal_reply': {
		$u = auth(); rate('dealr' . $u['uid'], 60, 3600); $id = preg_replace('/[^a-f0-9]/', '', (string) ($b['id'] ?? '')); $acc = !empty($b['accept']); $end = !empty($b['end']);
		$r = upd('deals.php', function ($x) use ($u, $id, $acc, $end) { $x = $x ?: []; if (!isset($x[$id])) { return ['__ret' => false]; } $v = $x[$id];
			if ($end) { if ($v['from'] !== $u['uid'] && $v['to'] !== $u['uid']) { return ['__ret' => false]; } $x[$id]['st'] = 'ended'; }
			else { if ($v['to'] !== $u['uid'] || $v['st'] !== 'pending') { return ['__ret' => false]; } $x[$id]['st'] = $acc ? 'active' : 'ended'; $x[$id]['ta'] = time(); }
			return ['__write' => $x, '__ret' => true]; });
		if (!$r) { fail('forbidden', 403); } out(['ok' => true]);
	}
	default: fail('unknown', 404);
}
