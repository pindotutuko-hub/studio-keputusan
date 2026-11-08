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
/** v51d: pengelola kompetisi antarkampus (nama pengguna, huruf kecil); dapat ditambah lewat bendera 'pengelola' di halaman admin */
const COMP_ADMINS = ['arema'];
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
function comp_admin(array $u): bool { return !empty($u['pengelola']) || in_array(mb_strtolower((string) ($u['user'] ?? '')), COMP_ADMINS, true); }
/** v51d: status kompetisi antarkampus berjalan */
function comp_cur(): ?array { $c = rd('comp.php') ?: []; $x = $c['cur'] ?? null; if (!$x) { return null; } $t = time(); $x['state'] = !empty($x['closed']) || $t > (int) $x['selesai'] ? 'selesai' : ($t < (int) $x['mulai'] ? 'akan' : 'aktif'); return $x; }
/** v51d: peringkat kampus = rata-rata 10 skor terbaik pemain kampus itu selama kompetisi; kampus dengan peserta < minimum tetap tampil di bawah */
function comp_rank(array $cur, string $myK = ''): array { $d = rd('comp_' . preg_replace('/[^a-z0-9]/', '', (string) $cur['id']) . '.php') ?: []; $g = [];
	foreach ($d as $id => $r) { $k = mb_strtolower(trim((string) $r['kampus'])); if ($k === '') { continue; } $g[$k]['nama'] = $r['kampus']; $g[$k]['sc'][] = (int) $r['best']; $g[$k]['top'][] = $r; }
	$min = max(1, (int) ($cur['min'] ?? 3)); $rank = [];
	foreach ($g as $k => $x) { rsort($x['sc']); $t10 = array_slice($x['sc'], 0, 10); usort($x['top'], fn($a, $b) => $b['best'] <=> $a['best']);
		$rank[] = ['kampus' => $x['nama'], 'n' => count($x['sc']), 'avg' => (int) round(array_sum($t10) / count($t10)), 'max' => $x['sc'][0], 'ok' => count($x['sc']) >= $min, 'me' => $myK !== '' && $k === $myK, 'best3' => array_map(fn($r) => ['who' => $r['who'], 'kampung' => $r['kampung'], 'best' => (int) $r['best']], array_slice($x['top'], 0, 3))]; }
	usort($rank, fn($a, $b) => [$b['ok'], $b['avg'], $b['n']] <=> [$a['ok'], $a['avg'], $a['n']]); return [$rank, $d]; }
function pub(array $u): array { return ['user' => $u['user'], 'name' => $u['name'] ?? $u['user'], 'kampus' => $u['kampus'] ?? '', 'kampusCC' => $u['kampusCC'] ?? '', 'pengelola' => comp_admin($u), 'kelas' => $u['kelas'] ?? '', 'created' => $u['created'] ?? 0, 'eula' => ($u['eula'] ?? '') === EULA_VER, 'mustPw' => !empty($u['mustPw']), 'dosen' => !empty($u['dosen'])]; }

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
function indicators(array $st, int $nb, array $rb = []): array {
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
	foreach (['e', 'n', 'c'] as $q) { if (!empty($rb[$q])) { $r[$q] = (int) max(0, min(100, round($r[$q] + $rb[$q]))); } } /* v51: bonus/penalti wilayah bersama */
	// kampung yang baru sedikit warganya tidak boleh langsung berskor tinggi: bobot naik sampai 50 KK
	$r['score'] = (int) round(10 * (0.25 * $r['e'] + 0.2 * $r['n'] + 0.2 * $r['c'] + 0.25 * $r['k'] + 0.1 * $r['p']) * (0.35 + 0.65 * min(1, ((int) ($st['kk'] ?? 0)) / 50)));
	$r['kk'] = (int) ($st['kk'] ?? 0); $r['era'] = (int) ($st['era'] ?? 1);
	return $r;
}
/** tantangan kelas dari dosen: dinilai server dari indikator (bukan data klien) */
const CHAL = ['hijau' => 'RTH ≥ 30% & ≥ 100 KK', 'nyaman' => 'Kenyamanan ≥ 75 & ≥ 100 KK', 'ekonomi' => 'Ekonomi warga ≥ 65 & ≥ 100 KK', 'jejaring' => 'Jejaring ≥ 75', 'layanan' => 'Layanan kota ≥ 90 (era Desa+)', 'puas' => 'Kepuasan ≥ 75 & ≥ 150 KK', 'b_hijau' => 'Lencana Kampung Hijau', 'b_airbersih' => 'Lencana Air Bersih', 'b_pejalan' => 'Lencana Pejalan Kaki', 'b_anak' => 'Lencana Ramah Anak', 'b_tanpakumuh' => 'Lencana Tanpa Kumuh', 'b_lokal' => 'Lencana Arsitektur Lokal', 'b_pangan' => 'Lencana Pangan Mandiri', 'b_tangguh' => 'Lencana Tangguh Bencana', 'b_rukun' => 'Lencana Kampung Rukun', 'b_tersambung' => 'Lencana Jejaring Tersambung', 'b_melayani' => 'Lencana Kota Melayani', 'b_sungai' => 'Lencana Penjaga Sungai'];
function chal_ok(string $c, array $i, array $bd = []): bool {
	if (strncmp($c, 'b_', 2) === 0) { return isset($bd[substr($c, 2)]); }
	switch ($c) { case 'hijau': return $i['rth'] >= 30 && $i['kk'] >= 100; case 'nyaman': return $i['c'] >= 75 && $i['kk'] >= 100; case 'ekonomi': return $i['e'] >= 65 && $i['kk'] >= 100;
		case 'jejaring': return $i['n'] >= 75; case 'layanan': return $i['svc'] >= 90 && $i['era'] >= 4; case 'puas': return $i['k'] >= 75 && $i['kk'] >= 150; } return false; }
/* ===== v51: LENCANA (dinilai server dari bangunan & indikator) dan WILAYAH BERSAMA ===== */
const BADGE = ['hijau' => '🌳 Kampung Hijau', 'airbersih' => '💧 Air Bersih untuk Semua', 'pejalan' => '🚶 Kampung Pejalan Kaki', 'anak' => '🧒 Kampung Ramah Anak',
	'tanpakumuh' => '🏘️ Kampung Tanpa Kumuh', 'lokal' => '🛖 Arsitektur Lokal', 'pangan' => '🌾 Pangan Mandiri', 'tangguh' => '🛡️ Tangguh Bencana',
	'rukun' => '🤝 Kampung Rukun', 'tersambung' => '🛣️ Jejaring Tersambung', 'melayani' => '🏛️ Kota Melayani', 'sungai' => '🐟 Penjaga Sungai'];
/** gaya rumah tradisional menurut lokasi (sama dengan vernac() di game.js) */
function vernac_s(array $l): array { $la = (float) ($l['lat'] ?? 0); $lo = (float) ($l['lon'] ?? 0); $cc = (string) ($l['cc'] ?? ''); $B = fn($a, $b, $c, $d) => $la >= $a && $la <= $b && $lo >= $c && $lo <= $d;
	if ($cc === 'ID' || $cc === '') { if ($B(-3.6, -2.4, 119.4, 120.4)) { return ['tongkonan', 'panggung']; } if ($B(-3.6, 1.2, 98.5, 102)) { return ['gadang', 'panggung']; } if ($B(-9, -8, 114.4, 115.75)) { return ['bali']; }
		if ($B(-9, -5.8, 105, 108.8)) { return ['panggung', 'jawa']; } if ($B(-9, -5.8, 108.8, 114.7)) { return ['jawa', 'joglo']; } if ($B(-6, 6, 95, 106.2) || $B(-3.6, -1.3, 105, 108.6)) { return ['panggung']; }
		if ($B(-4.3, 4.5, 108.8, 119.2) || $B(-6, 2.2, 118.8, 125.6)) { return ['panggung']; } if ($B(-9.6, 0, 130.5, 141.1)) { return ['honai', 'panggung']; } if ($B(-11, -8, 115.75, 125.2) || $B(-8.5, 3, 125.6, 131)) { return ['panggung']; } }
	if ($cc === 'ID') { return ['jawa', 'panggung']; } if (in_array($cc, ['MY', 'BN', 'SG'], true)) { return ['panggung']; } if ($cc === 'JP') { return ['machiya']; }
	if (in_array($cc, ['GB', 'NL', 'DE', 'FR', 'BE', 'CH', 'NO', 'SE', 'DK', 'PL', 'CZ', 'IT', 'ES', 'PT', 'AT', 'IE', 'FI', 'GR', 'LU'], true)) { return ['eropa']; } return ['modern']; }
/** pencemaran sungai dari satu kampung (0–100): industri & tambang dikurangi pengolahan limbah */
function pollution(array $st): int { $bs = is_array($st['b'] ?? null) ? $st['b'] : []; $P = ['zi' => 6, 'pltu' => 25, 'semen' => 20, 'smelter' => 30, 'tambang' => 8, 'galian' => 5, 'tobong' => 4, 'peternakan' => 3, 'kandang' => 1, 'bengkel' => 2];
	$T = ['ipal' => 30, 'daurulang' => 15, 'tpa' => 20, 'tps' => 4, 'retensi' => 6]; $p = 0; $t = 0;
	foreach ($bs as $b) { $ty = (string) ($b['t'] ?? ''); $lv = max(1, (int) ($b['lv'] ?? 1)); if (isset($P[$ty])) { $p += $P[$ty] * ($ty === 'zi' ? $lv : 1); } if (isset($T[$ty])) { $t += $T[$ty]; } }
	return (int) max(0, min(100, round($p - $t))); }
/** kode wilayah: kelas bila tergabung kelas, selain itu sel ±25 km di sekitar lokasi */
function region_id(array $u, array $meta): string { $k = (string) ($u['kelas'] ?? ''); if ($k !== '') { return 'k:' . $k; } return 'g:' . (round((float) $meta['lat'] * 4) / 4) . ',' . (round((float) $meta['lon'] * 4) / 4); }
function region_file(string $rid): string { return 'rg_' . substr(hash('sha256', $rid), 0, 16) . '.php'; }
const RPROJ = ['jembatan' => ['n' => 'Jembatan & jalan antarkampung', 'need' => ['coin' => 800, 'wood' => 1500, 'stone' => 1000], 'fx' => ['n' => 8]],
	'terminal' => ['n' => 'Terminal & pasar regional', 'need' => ['coin' => 1600, 'wood' => 0, 'stone' => 1500], 'fx' => ['e' => 6]],
	'rs' => ['n' => 'Rumah sakit regional', 'need' => ['coin' => 2600, 'wood' => 0, 'stone' => 2000], 'fx' => ['c' => 6]],
	'limbah' => ['n' => 'Pengolahan limbah & sampah terpadu', 'need' => ['coin' => 1200, 'wood' => 0, 'stone' => 800], 'fx' => ['c' => 3, 'river' => 25]]];
/** keadaan wilayah: anggota (dari direktori), kesehatan sungai, proyek bersama, bonus indikator untuk pemain $me */
function region_ctx(string $rid, string $me): array { $d = dir_rd(); $cut = time() - 180 * 86400; $mem = [];
	foreach ($d as $id => $m) { if (($m['rid'] ?? '') === $rid && ($m['at'] ?? 0) >= $cut) { $mem[$id] = $m; } }
	$rg = rd(region_file($rid)) ?: []; $pj = $rg['p'] ?? []; $pol = []; foreach ($mem as $m) { $pol[] = (int) ($m['pol'] ?? 0); }
	$river = $pol ? 100 - 1.2 * array_sum($pol) / count($pol) : 100; if (!empty($pj['limbah']['done'])) { $river += RPROJ['limbah']['fx']['river']; } $river = (int) max(0, min(100, round($river)));
	$fx = ['e' => 0, 'n' => 0, 'c' => $river < 50 ? -6 : ($river >= 80 ? 3 : 0)];
	foreach (RPROJ as $k => $P) { if (empty($pj[$k]['done'])) { continue; } $mine = $pj[$k]['by'][$me] ?? null; $tot = 0; foreach (['coin', 'wood', 'stone'] as $r) { $tot += (float) ($mine[$r] ?? 0) / max(1, $P['need'][$r] ?: 1); }
		$f = $mine && $tot > 0.02 ? 1 : 0.5; foreach (['e', 'n', 'c'] as $q) { $fx[$q] += ($P['fx'][$q] ?? 0) * $f; } }
	return ['mem' => $mem, 'river' => $river, 'p' => $pj, 'fx' => $fx]; }
/** lencana yang terpenuhi SAAT INI (dihitung dari state & indikator) */
function badges_now(array $st, array $ind, array $rc): array { $bs = is_array($st['b'] ?? null) ? $st['b'] : []; $land = $st['land']; $n = count($land); $kk = (int) ($st['kk'] ?? 0); $era = (int) ($st['era'] ?? 1);
	$cnt = []; foreach ($bs as $b) { $cnt[$b['t']] = ($cnt[$b['t']] ?? 0) + 1; } $c = fn(...$t) => array_sum(array_map(fn($x) => $cnt[$x] ?? 0, $t));
	$dw = array_values(array_filter($bs, fn($b) => in_array($b['t'], ['house', 'perum', 'apartemen'], true))); $nd = count($dw);
	$near = function ($h, array $ts, int $r) use ($bs) { $hx = $h['x'] + ($h['w'] - 1) / 2; $hy = $h['y'] + ($h['h'] - 1) / 2; foreach ($bs as $b) { if (in_array($b['t'], $ts, true) && abs($b['x'] + ($b['w'] - 1) / 2 - $hx) <= $r + ($b['w'] - 1) / 2 && abs($b['y'] + ($b['h'] - 1) / 2 - $hy) <= $r + ($b['h'] - 1) / 2) { return true; } } return false; };
	$ring = function ($h, string $l) use ($land, $n) { for ($y = $h['y'] - 1; $y <= $h['y'] + $h['h']; $y++) { for ($x = $h['x'] - 1; $x <= $h['x'] + $h['w']; $x++) { if ($x >= 0 && $y >= 0 && $x < $n && $y < $n && $land[$y][$x] === $l) { return true; } } } return false; };
	$share = function (callable $f) use ($dw, $nd) { if (!$nd) { return 0; } $k = 0; foreach ($dw as $h) { if ($f($h)) { $k++; } } return $k / $nd; };
	$prod = $c('field') * 6 + $c('pond') * 2 + $c('kandang') * 3 + $c('peternakan') * 5 + $c('pemburu') * 3; $houses = array_values(array_filter($bs, fn($b) => $b['t'] === 'house'));
	$vs = vernac_s($st['loc'] ?? []); $loc = count($houses) ? count(array_filter($houses, fn($h) => in_array((string) ($h['s'] ?? ''), $vs, true))) / count($houses) : 0;
	$o = [];
	if (($ind['rth'] ?? 0) >= 30 && $kk >= 50) { $o[] = 'hijau'; }
	if ($kk >= 20 && $nd >= 8 && $share(fn($h) => $near($h, ['well'], 5)) >= 0.95) { $o[] = 'airbersih'; }
	if ($kk >= 30 && $share(fn($h) => $ring($h, 'P')) >= 0.9 && $share(fn($h) => $near($h, ['market', 'pasmal', 'ruko'], 10)) >= 0.8 && $share(fn($h) => $near($h, ['paud', 'sekolah', 'smp', 'sma'], 10)) >= 0.8) { $o[] = 'pejalan'; }
	if ($kk >= 40 && $c('paud', 'sekolah') >= 1 && $c('klinik', 'puskesling', 'rs') >= 1 && $share(fn($h) => $near($h, ['taman', 'playground', 'tamkot', 'lapbola', 'alun'], 8)) >= 0.8) { $o[] = 'anak'; }
	if ($kk >= 40 && $nd && $c('tps', 'tpa', 'daurulang') >= 1 && $share(fn($h) => $ring($h, 'P') && !$ring($h, 'W') && ($h['t'] !== 'house' || $near($h, ['well'], 5))) >= 1) { $o[] = 'tanpakumuh'; }
	if (count($houses) >= 15 && $loc >= 0.8) { $o[] = 'lokal'; }
	if ($kk >= 30 && $prod >= $kk * 2) { $o[] = 'pangan'; }
	if ($kk >= 70 && $c('saluran') >= 1 && $c('retensi') >= 1 && $c('damkar') >= 1 && $share(fn($h) => !$ring($h, 'W')) >= 1) { $o[] = 'tangguh'; }
	if ($kk >= 50 && ($ind['k'] ?? 0) >= 75 && $c('hall', 'baldes') >= 1 && $c('worship') >= 1) { $o[] = 'rukun'; }
	if ($kk >= 30 && ($ind['n'] ?? 0) >= 90) { $o[] = 'tersambung'; }
	if ($era >= 4 && ($ind['svc'] ?? 0) >= 85) { $o[] = 'melayani'; }
	if ($kk >= 50 && pollution($st) <= 10 && ($rc['river'] ?? 0) >= 80 && count($rc['mem'] ?? []) >= 2) { $o[] = 'sungai'; }
	return $o; }
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
		$din = 0; if ($uid) { upd('u_' . $uid . '.php', function ($x) { if (!$x) { return ['__ret' => false]; } $x['seen'] = time(); return ['__write' => $x, '__ret' => true]; });
			foreach ((rd('deals.php') ?: []) as $v) { if (($v['to'] ?? '') === $uid && ($v['st'] ?? '') === 'pending') { $din++; } } } /* v51i: jumlah tawaran perjanjian dagang masuk yang menunggu jawaban */
		out(['ok' => true, 'cfg' => cfg_pub(), 'dealIn' => $din]);
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
		$nbc = nb_count($u['uid'], $meta, $u); $meta['pol'] = pollution($j['state']); $meta['rid'] = region_id($u, $meta); $rc = region_ctx($meta['rid'], $u['uid']); $newB = []; $GLOBALS['BA_GRANT_TOT'] = (float) ($u['grantTot'] ?? 0);
		$sah = !empty($u['sah']); /* v50m: pemain sah (diverifikasi pengelola) — catatan pemeriksaan otomatis tidak menahan peringkat */
		$r = upd('s_' . $u['uid'] . '.php', function ($s) use ($j, &$meta, $base, $nbc, $sah, $rc, &$newB) { $ver = (int) ($s['ver'] ?? 0);
			if ($s && $base && $base !== $ver && empty($j['force'])) { return ['__ret' => ['conflict' => $ver]]; }
			// v46b: simpanan yang waktunya mundur (tab/perangkat lama) ditolak, tidak ditulis & tidak ditandai curang
			if ($s && ($s['state']['meta']['created'] ?? 0) === ($j['state']['meta']['created'] ?? 0) && (int) ($j['state']['t'] ?? 0) < (int) ($s['state']['t'] ?? 0)) { return ['__ret' => ['stale' => $ver]]; }
			$prev = $s['state'] ?? null; if ($prev !== null) { $prev['flagged'] = ((int) ($s['meta']['at'] ?? 0) < 1793771100) ? [] : ($s['flagged'] ?? []); } /* v50l: amnesti tanda yang muncul karena bug hitung bangunan (v50g, 4 Nov 00.25–12.45 WIB) */
			[$score, $bad] = audit($j['state'], $prev, (int) ($s['meta']['at'] ?? 0));
			$ind = in_array('land', $bad, true) ? ['e' => 0, 'n' => 0, 'c' => 0, 'k' => 0, 'p' => 0, 'score' => 0] : indicators($j['state'], $nbc, $rc['fx']); $score = $ind['score']; $meta['ind'] = $ind;
			if (($prev['meta']['created'] ?? 0) !== ($j['state']['meta']['created'] ?? 0)) { $bad = array_values(array_diff($bad, ['prior'])); }
			$note = []; if ($sah) { $note = array_values(array_diff($bad, ['prior'])); $bad = []; }
			$meta['score'] = $score; $meta['flag'] = $bad ? 1 : 0;
			$bd = (($s['state']['meta']['created'] ?? 0) === ($j['state']['meta']['created'] ?? 0)) ? (array) ($s['meta']['badges'] ?? []) : []; /* v51: lencana sekali didapat tetap tercatat untuk kampung ini */
			if (!$bad && isset($ind['rth'])) { foreach (badges_now($j['state'], $ind, $rc) as $bk) { if (!isset($bd[$bk])) { $bd[$bk] = time(); $newB[] = $bk; } } } $meta['badges'] = $bd;
			return ['__write' => ['ver' => $ver + 1, 'meta' => $meta, 'state' => array_merge($j['state'], ['_ind' => $meta['ind'], '_badges' => $meta['badges'], '_river' => $rc['river']]), 'flagged' => $bad, 'note' => $note], '__ret' => ['ver' => $ver + 1, 'bad' => $bad]]; });
		if (isset($r['conflict'])) { out(['ok' => false, 'error' => 'conflict', 'ver' => $r['conflict']], 409); }
		if (isset($r['stale'])) { out(['ok' => false, 'error' => 'stale', 'ver' => $r['stale']], 409); }
		// direktori publik ringkas untuk tetangga (tanpa data pribadi selain nama tokoh)
		// v42: berkas bersama (direktori & peringkat) hanya ditulis bila ada perubahan berarti atau sudah 15 menit → aman untuk ratusan pemain bersamaan
		$dirSig = md5(json_encode([$meta['name'], $meta['loc'], round((float) $meta['lat'], 3), round((float) $meta['lon'], 3), $meta['era'], intdiv((int) $meta['kk'], 5), $u['kelas'] ?? '', $u['name'] ?? '', intdiv((int) $meta['pol'], 5), $meta['rid']]));
		$doDir = $fresh || $dirSig !== ($u['dirSig'] ?? '') || time() - (int) ($u['dirAt'] ?? 0) > 900;
		if ($doDir) upd('dir.php', function ($d) use ($u, $meta) { $d = $d ?: []; $d[$u['uid']] = array_diff_key($meta, ['badges' => 1]) + ['nb' => count($meta['badges'] ?? []), 'who' => $u['name'] ?? $u['user'], 'kelas' => $u['kelas'] ?? '', 'kampus' => $u['kampus'] ?? ''];
			if (count($d) > 5000) { uasort($d, fn($x, $y) => $y['at'] <=> $x['at']); $d = array_slice($d, 0, 5000, true); } return ['__write' => $d, '__ret' => true]; });
		$kc = ($u['kelas'] ?? '') !== '' ? (rd('k_' . kelas_code((string) $u['kelas']) . '.php') ?: []) : []; $chal = (string) ($kc['tantangan'] ?? ''); $chalNow = $chal !== '' && !$r['bad'] && isset($meta['ind']['rth']) && chal_ok($chal, $meta['ind'], $meta['badges'] ?? []);
		$lbSig = $meta['score'] . '|' . $meta['era'] . '|' . ($u['kelas'] ?? '') . '|' . count($meta['badges'] ?? []); $doLb = $chalNow || $lbSig !== ($u['lbSig'] ?? '') || time() - (int) ($u['lbAt'] ?? 0) > 900;
		if (!$r['bad'] && $doLb) { $sem = semester(); $row = ['who' => $u['user'], 'name' => $meta['name'], 'kelas' => $u['kelas'] ?? '', 'kampus' => $u['kampus'] ?? '', 'score' => $meta['score'], 'era' => $meta['era'], 'kk' => $meta['kk'], 'month' => $meta['month'], 'loc' => $meta['loc'], 'ind' => $meta['ind'], 'badges' => $meta['badges'] ?? [], 'at' => time()];
			upd('lb_' . $sem . '.php', function ($d) use ($u, $row, $chal, $chalNow) { $d = $d ?: []; $old = $d[$u['uid']] ?? null; if ($row['score'] >= (int) ($old['best'] ?? 0)) { $row['best'] = $row['score']; $row['bestInd'] = $row['ind']; $row['bestEra'] = $row['era']; $row['bestKK'] = $row['kk']; $row['bestName'] = $row['name']; } else { $row['best'] = (int) $old['best']; $row['bestInd'] = $old['bestInd'] ?? $row['ind']; $row['bestEra'] = $old['bestEra'] ?? null; $row['bestKK'] = $old['bestKK'] ?? null; $row['bestName'] = $old['bestName'] ?? null; } $row['saves'] = (int) ($old['saves'] ?? 0) + 1; $row['chal'] = $chal; $row['chalAt'] = ($old['chal'] ?? '') === $chal && !empty($old['chalAt']) ? $old['chalAt'] : ($chalNow ? time() : 0); $row['first'] = $old['first'] ?? time(); $d[$u['uid']] = $row; return ['__write' => $d, '__ret' => true]; });
		if ($doDir || (!$r['bad'] && $doLb)) { upd('u_' . $u['uid'] . '.php', function ($x) use ($doDir, $dirSig, $doLb, $lbSig, $r) { if (!$x) { return ['__ret' => false]; } if ($doDir) { $x['dirSig'] = $dirSig; $x['dirAt'] = time(); } if (!$r['bad'] && $doLb) { $x['lbSig'] = $lbSig; $x['lbAt'] = time(); } return ['__write' => $x, '__ret' => true]; }); } }
		$cp = comp_cur(); if ($cp && $cp['state'] === 'aktif' && !$r['bad'] && !comp_admin($u) && trim((string) ($u['kampus'] ?? '')) !== '') { /* pengelola memantau, tidak ikut dihitung */ /* v51d: catat skor terbaik selama kompetisi antarkampus */
			$cid = preg_replace('/[^a-z0-9]/', '', (string) $cp['id']); $sc = (int) $meta['score']; $kp = clean((string) $u['kampus'], 80);
			upd('comp_' . $cid . '.php', function ($d) use ($u, $sc, $kp, $meta) { $d = $d ?: []; $o = $d[$u['uid']] ?? null; if ($o && (int) $o['best'] >= $sc && $o['kampus'] === $kp) { return ['__ret' => false]; }
				$d[$u['uid']] = ['who' => $u['user'], 'name' => $u['name'] ?? $u['user'], 'kampus' => $kp, 'kelas' => $u['kelas'] ?? '', 'best' => max($sc, $o && $o['kampus'] === $kp ? (int) $o['best'] : 0), 'kampung' => $meta['name'], 'at' => time()]; return ['__write' => $d, '__ret' => true]; }); }
		$grant = 0; if ((float) ($u['grantPend'] ?? 0) > 0) { $grant = upd('u_' . $u['uid'] . '.php', function ($x) { if (!$x) { return ['__ret' => 0]; } $g = (float) ($x['grantPend'] ?? 0); $x['grantPend'] = 0; return ['__write' => $x, '__ret' => $g]; }); }
		out(['ok' => true, 'grant' => $grant, 'ver' => $r['ver'], 'score' => $meta['score'], 'ind' => $meta['ind'], 'ranked' => !$r['bad'], 'flags' => $r['bad'], 'chal' => $chal, 'chalOk' => $chalNow, 'badges' => $meta['badges'] ?? [], 'newBadges' => $newB, 'river' => $rc['river']]);
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
	case 'kelas_new': { $u = auth(); if (empty($u['dosen'])) { fail('not_dosen', 403); } /* v50p: hanya akun yang ditetapkan dosen oleh pengelola */ rate('kelasnew' . $u['uid'], 10, 86400); $nama = clean((string) ($b['nama'] ?? ''), 80); if (mb_strlen($nama) < 3 || rude($nama)) { fail('bad_name'); }
		for ($i = 0; $i < 8; $i++) { $code = ''; $al = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; for ($k = 0; $k < 6; $k++) { $code .= $al[random_int(0, 31)]; }
			$ok = upd('k_' . $code . '.php', function ($k) use ($u, $nama) { if ($k) { return ['__ret' => false]; } return ['__write' => ['owner' => $u['uid'], 'ownerUser' => $u['user'], 'nama' => $nama, 'created' => time()], '__ret' => true]; });
			if ($ok) { upd('u_' . $u['uid'] . '.php', function ($x) use ($code) { $x['owns'] = array_values(array_unique(array_merge($x['owns'] ?? [], [$code]))); return ['__write' => $x, '__ret' => true]; }); out(['ok' => true, 'code' => $code]); } }
		fail('storage', 500); }
	case 'comp_get': { $u = auth(); rate('compget', 600, 300); $c = rd('comp.php') ?: []; $cur = comp_cur(); $past = array_slice($c['past'] ?? [], 0, 10);
		$rank = []; $mine = null; $myK = mb_strtolower(trim((string) ($u['kampus'] ?? '')));
		if ($cur) { [$rank, $d] = comp_rank($cur, $myK); foreach ($rank as $i => $x) { if ($x['me']) { $mine = $i + 1; } } $cur['peserta'] = count($d); $myRow = $d[$u['uid']] ?? null; $cur['saya'] = $myRow ? (int) $myRow['best'] : null; }
		$mon = null; if ($cur && comp_admin($u)) { /* v51e: pemantauan pengelola — seluruh peserta, kampus, kelas */ $kn = []; $mon = [];
			foreach ($d as $r) { $kc = (string) ($r['kelas'] ?? ''); if ($kc !== '' && !array_key_exists($kc, $kn)) { $kk = rd('k_' . preg_replace('/[^A-Za-z0-9]/', '', $kc) . '.php'); $kn[$kc] = $kk['nama'] ?? $kc; }
				$mon[] = ['who' => $r['who'], 'name' => $r['name'] ?? $r['who'], 'kampus' => $r['kampus'], 'kelas' => $kc !== '' ? $kn[$kc] : '', 'best' => (int) $r['best'], 'kampung' => $r['kampung'] ?? '', 'at' => (int) ($r['at'] ?? 0)]; }
			usort($mon, fn($a, $b) => $b['best'] <=> $a['best']); $mon = array_slice($mon, 0, 3000); }
		out(['ok' => true, 'mon' => $mon, 'cur' => $cur, 'rank' => array_slice($rank, 0, 100), 'myRank' => $mine, 'past' => $past, 'admin' => comp_admin($u)]); }
	case 'comp_open': { $u = auth(); if (!comp_admin($u)) { fail('forbidden', 403); } rate('compopen' . $u['uid'], 20, 86400);
		$nama = clean((string) ($b['nama'] ?? ''), 80); if (mb_strlen($nama) < 3 || rude($nama)) { fail('bad_name'); }
		$mulai = strtotime((string) ($b['mulai'] ?? '') . ' 00:00:00 Asia/Jakarta') ?: time(); $selesai = strtotime((string) ($b['selesai'] ?? '') . ' 23:59:59 Asia/Jakarta') ?: 0;
		if ($selesai <= $mulai || $selesai - $mulai > 400 * 86400) { fail('bad_date'); } $min = max(1, min(50, (int) ($b['min'] ?? 3)));
		$id = gmdate('Ymd', $mulai + 7 * 3600) . substr(bin2hex(random_bytes(3)), 0, 4);
		upd('comp.php', function ($c) use ($u, $nama, $mulai, $selesai, $min, $id) { $c = $c ?: []; if (!empty($c['cur'])) { $o = $c['cur']; if (empty($o['closed']) && time() < (int) $o['selesai']) { $o['closed'] = time(); } [$rk] = comp_rank($o); $o['juara'] = array_map(fn($x) => ['kampus' => $x['kampus'], 'avg' => $x['avg'], 'n' => $x['n']], array_slice(array_values(array_filter($rk, fn($x) => $x['ok'])), 0, 3)); $c['past'] = array_slice(array_merge([$o], $c['past'] ?? []), 0, 20); }
			$c['cur'] = ['id' => $id, 'nama' => $nama, 'mulai' => $mulai, 'selesai' => $selesai, 'min' => $min, 'by' => $u['user'], 'created' => time()]; return ['__write' => $c, '__ret' => true]; });
		out(['ok' => true, 'id' => $id]); }
	case 'comp_close': { $u = auth(); if (!comp_admin($u)) { fail('forbidden', 403); }
		$ok = upd('comp.php', function ($c) { if (empty($c['cur'])) { return ['__ret' => false]; } $c['cur']['closed'] = time(); return ['__write' => $c, '__ret' => true]; }); out(['ok' => (bool) $ok]); }
	case 'kelas_list': { $u = auth(); /* v51c: daftar kelas yang dapat dipilih mahasiswa (kelas dari kampus yang sama tampil lebih dulu) */
		$myK = mb_strtolower(trim((string) ($u['kampus'] ?? ''))); $own = []; $list = [];
		foreach (glob(DATA . '/k_*.php') ?: [] as $f) { $c = substr(basename($f, '.php'), 2); if ($c === '' || !preg_match('/^[A-Z0-9]{1,12}$/', $c)) { continue; } $k = rd('k_' . $c . '.php'); if (!$k || !empty($k['hidden'])) { continue; }
			$oid = (string) ($k['owner'] ?? ''); if (!isset($own[$oid])) { $o = $oid !== '' ? (rd('u_' . $oid . '.php') ?: []) : []; $own[$oid] = ['name' => (string) ($o['name'] ?? $k['ownerUser'] ?? ''), 'kampus' => (string) ($o['kampus'] ?? '')]; }
			$kp = $own[$oid]['kampus']; $list[] = ['code' => $c, 'nama' => (string) ($k['nama'] ?? $c), 'dosen' => $own[$oid]['name'], 'kampus' => $kp, 'same' => $myK !== '' && mb_strtolower($kp) === $myK, 'created' => (int) ($k['created'] ?? 0), 'me' => ($u['kelas'] ?? '') === $c]; }
		usort($list, fn($a, $b) => [$b['same'], $b['created']] <=> [$a['same'], $a['created']]);
		out(['ok' => true, 'list' => array_slice($list, 0, 200)]); }
	case 'kelas_mine': { $u = auth(); if (empty($u['dosen'])) { fail('not_dosen', 403); } $list = []; foreach (($u['owns'] ?? []) as $c) { $k = rd('k_' . $c . '.php'); if ($k) { $list[] = ['code' => $c, 'nama' => $k['nama'], 'created' => $k['created'], 'tantangan' => (string) ($k['tantangan'] ?? '')]; } } out(['ok' => true, 'list' => $list]); }
	case 'kelas_tantangan': { $u = auth(); if (empty($u['dosen'])) { fail('not_dosen', 403); } rate('kt' . $u['uid'], 30, 3600); $c = preg_replace('/[^A-Z0-9]/', '', strtoupper((string) ($b['code'] ?? ''))); $t = (string) ($b['t'] ?? '');
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
		if (empty($u['dosen']) || !$k || $k['owner'] !== $u['uid']) { fail('forbidden', 403); }
		$sem = preg_match('/^\d{4}-(Ganjil|Genap)$/', (string) ($_GET['sem'] ?? '')) ? (string) $_GET['sem'] : semester(); $d = rd('lb_' . $sem . '.php') ?: []; $rows = [];
		foreach ($d as $r) { if ($r['kelas'] === $c) { $rows[] = ['user' => $r['who'], 'permukiman' => $r['name'], 'lokasi' => $r['loc'], 'skor_terbaik' => $r['best'], 'skor_terakhir' => $r['score'], 'ekonomi' => $r['bestInd']['e'] ?? '', 'jejaring' => $r['bestInd']['n'] ?? '', 'kenyamanan' => $r['bestInd']['c'] ?? '', 'kepuasan' => $r['bestInd']['k'] ?? '', 'pertumbuhan' => $r['bestInd']['p'] ?? '', 'era' => $r['era'], 'kk' => $r['kk'], 'bulan_main' => $r['month'], 'jumlah_simpan' => $r['saves'], 'lencana' => count($r['badges'] ?? []), 'daftar_lencana' => implode('; ', array_map(fn($k) => preg_replace('/^\S+\s/u', '', BADGE[$k] ?? $k), array_keys($r['badges'] ?? []))), 'tantangan' => $r['chal'] ?? '', 'tantangan_tercapai' => !empty($r['chalAt']) ? date('Y-m-d', $r['chalAt']) : '', 'rth' => $r['bestInd']['rth'] ?? '', 'layanan_kota' => $r['bestInd']['svc'] ?? '', 'mulai' => date('Y-m-d', $r['first']), 'terakhir' => date('Y-m-d H:i', $r['at'])]; } }
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
	// ---- v51: wilayah bersama (kelas atau sekitar ±25 km): sungai bersama, proyek patungan, peringkat wilayah ----
	case 'region': {
		$u = auth(); rate('rg' . $u['uid'], 240, 600); $s = rd('s_' . $u['uid'] . '.php'); if (!$s) { fail('no_save', 404); } $me = $u['uid'];
		$rid = (string) ($s['meta']['rid'] ?? ''); if ($rid === '') { $rid = region_id($u, $s['meta']); } $rc = region_ctx($rid, $me);
		$label = strncmp($rid, 'k:', 2) === 0 ? 'Kelas ' . ((rd('k_' . kelas_code(substr($rid, 2)) . '.php') ?: [])['nama'] ?? substr($rid, 2)) : 'Sekitar ' . clean((string) ($s['meta']['loc'] ?? ''), 60);
		$mem = []; foreach ($rc['mem'] as $id => $m) { $mem[] = ['me' => $id === $me, 'who' => (string) ($m['who'] ?? ''), 'name' => (string) ($m['name'] ?? ''), 'loc' => (string) ($m['loc'] ?? ''), 'era' => (int) ($m['era'] ?? 1), 'kk' => (int) ($m['kk'] ?? 0), 'score' => (int) ($m['score'] ?? 0), 'pol' => (int) ($m['pol'] ?? 0), 'nb' => (int) ($m['nb'] ?? 0)]; }
		usort($mem, fn($a, $b) => $b['score'] <=> $a['score']);
		$pj = []; foreach (RPROJ as $k => $P) { $x = $rc['p'][$k] ?? []; $pj[] = ['k' => $k, 'n' => $P['n'], 'need' => $P['need'], 'fx' => $P['fx'], 'got' => $x['got'] ?? ['coin' => 0, 'wood' => 0, 'stone' => 0], 'my' => $x['by'][$me] ?? ['coin' => 0, 'wood' => 0, 'stone' => 0], 'givers' => count($x['by'] ?? []), 'done' => (int) ($x['done'] ?? 0)]; }
		$g = []; $cut = time() - 180 * 86400; foreach (dir_rd() as $m) { if (($m['rid'] ?? '') !== '' && ($m['at'] ?? 0) >= $cut) { $g[$m['rid']][] = (int) ($m['score'] ?? 0); } }
		$avg = []; foreach ($g as $k => $sc) { rsort($sc); $top = array_slice($sc, 0, 10); $avg[$k] = array_sum($top) / count($top); } arsort($avg); $rank = array_search($rid, array_keys($avg), true);
		out(['ok' => true, 'rid' => substr($rid, 0, 2), 'label' => $label, 'members' => $mem, 'river' => $rc['river'], 'fx' => $rc['fx'], 'pol' => (int) ($s['meta']['pol'] ?? 0), 'projects' => $pj, 'rank' => $rank === false ? null : $rank + 1, 'regions' => count($avg), 'ver' => (int) ($s['ver'] ?? 0)]);
	}
	case 'region_give': {
		if (cfg()['maint']) { fail('maint', 503); } $u = auth(); rate('rgg' . $u['uid'], 30, 3600); $p = (string) ($b['p'] ?? ''); if (!isset(RPROJ[$p])) { fail('bad'); }
		$amt = []; foreach (['coin', 'wood', 'stone'] as $q) { $v = (float) ($b[$q] ?? 0); if (!is_finite($v) || $v < 0 || $v > 100000) { fail('bad'); } $amt[$q] = round($v, 2); } if (array_sum($amt) <= 0) { fail('bad'); }
		$base = (int) ($b['base'] ?? 0);
		$res = upd('s_' . $u['uid'] . '.php', function ($s) use ($u, $p, $amt, $base) {
			if (!$s) { return ['__ret' => ['e' => 'no_save']]; } if (!empty($s['flagged']) && empty($u['sah'])) { return ['__ret' => ['e' => 'flagged']]; }
			$ver = (int) ($s['ver'] ?? 0); if ($base !== $ver) { return ['__ret' => ['e' => 'conflict', 'ver' => $ver]]; }
			$rid = (string) ($s['meta']['rid'] ?? ''); if ($rid === '') { return ['__ret' => ['e' => 'no_region']]; }
			foreach ($amt as $q => $v) { if ((float) ($s['state']['res'][$q] ?? 0) + 1e-6 < $v) { return ['__ret' => ['e' => 'lack', 'r' => $q]]; } }
			$acc = upd(region_file($rid), function ($g) use ($rid, $p, $amt, $u) { $g = $g ?: ['rid' => $rid, 'p' => []]; $P = RPROJ[$p];
				$x = $g['p'][$p] ?? ['got' => ['coin' => 0, 'wood' => 0, 'stone' => 0], 'by' => []]; if (!empty($x['done'])) { return ['__ret' => ['e' => 'done']]; }
				$ok = []; foreach ($amt as $q => $v) { $left = max(0, $P['need'][$q] - (float) $x['got'][$q]); $ok[$q] = round(min($v, $left), 2); }
				if (array_sum($ok) <= 0) { return ['__ret' => ['e' => 'nothing']]; }
				foreach ($ok as $q => $v) { $x['got'][$q] = round((float) $x['got'][$q] + $v, 2); $x['by'][$u['uid']][$q] = round((float) ($x['by'][$u['uid']][$q] ?? 0) + $v, 2); }
				$full = true; foreach ($P['need'] as $q => $nv) { if ((float) $x['got'][$q] + 1e-6 < $nv) { $full = false; } } if ($full) { $x['done'] = time(); }
				$g['p'][$p] = $x; return ['__write' => $g, '__ret' => ['ok' => $ok, 'done' => $full]]; });
			if (isset($acc['e'])) { return ['__ret' => $acc]; }
			foreach ($acc['ok'] as $q => $v) { $s['state']['res'][$q] = round((float) $s['state']['res'][$q] - $v, 4); } $s['ver'] = $ver + 1;
			return ['__write' => $s, '__ret' => ['ok' => $acc['ok'], 'done' => $acc['done'], 'ver' => $ver + 1]]; });
		if (isset($res['e'])) { if ($res['e'] === 'conflict') { out(['ok' => false, 'error' => 'conflict', 'ver' => $res['ver']], 409); } fail($res['e']); }
		out(['ok' => true, 'given' => $res['ok'], 'done' => $res['done'], 'ver' => $res['ver']]);
	}
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
