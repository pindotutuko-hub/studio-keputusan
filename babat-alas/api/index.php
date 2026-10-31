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
function rate(string $act, int $max, int $win): void {
	$key = 'r_' . substr(hash('sha256', $act . ip()), 0, 24) . '.php'; $now = time();
	$ok = upd($key, function ($c) use ($now, $max, $win) { $c = $c ?: ['t' => []]; $c['t'] = array_values(array_filter($c['t'], fn($t) => $t > $now - $win));
		if (count($c['t']) >= $max) { return ['__ret' => false]; } $c['t'][] = $now; return ['__write' => $c, '__ret' => true]; });
	if (!$ok) { fail('rate_limited', 429); }
}
function uid_of(string $user): string { return substr(hash('sha256', 'ba|' . mb_strtolower($user)), 0, 20); }
function auth(): array {
	$tok = (string) ($_SERVER['HTTP_X_BA_TOKEN'] ?? ''); if (!preg_match('/^[a-f0-9]{20}\.[a-f0-9]{48}$/', $tok)) { fail('auth', 401); }
	[$uid, $sec] = explode('.', $tok, 2); $u = rd('u_' . $uid . '.php');
	if (!$u) { fail('auth', 401); }
	foreach (($u['tokens'] ?? []) as $t) { if (hash_equals($t['h'], hash('sha256', $sec)) && $t['exp'] > time()) { $u['uid'] = $uid; return $u; } }
	fail('auth', 401);
}
function new_token(string $uid): string {
	$sec = bin2hex(random_bytes(24)); $exp = time() + TOKEN_DAYS * 86400;
	upd('u_' . $uid . '.php', function ($u) use ($sec, $exp) { if (!$u) { return ['__ret' => null]; }
		$u['tokens'] = array_slice(array_values(array_filter($u['tokens'] ?? [], fn($t) => $t['exp'] > time())), -4); $u['tokens'][] = ['h' => hash('sha256', $sec), 'exp' => $exp];
		return ['__write' => $u, '__ret' => true]; });
	return $uid . '.' . $sec;
}
function pub(array $u): array { return ['user' => $u['user'], 'name' => $u['name'] ?? $u['user'], 'kampus' => $u['kampus'] ?? '', 'kelas' => $u['kelas'] ?? '', 'created' => $u['created'] ?? 0]; }

ensure_dir();
$a = (string) ($_GET['a'] ?? '');
$b = $_SERVER['REQUEST_METHOD'] === 'POST' ? body() : [];

switch ($a) {
	case 'ping': out(['ok' => true, 'v' => '0.1']);
	case 'register': {
		rate('reg', 6, 3600);
		$user = clean((string) ($b['user'] ?? ''), 32); $pass = (string) ($b['pass'] ?? '');
		if (!preg_match('/^[A-Za-z0-9_.\-]{3,32}$/', $user)) { fail('bad_user'); }
		if (strlen($pass) < 6 || strlen($pass) > 200) { fail('bad_pass'); }
		$uid = uid_of($user);
		$made = upd('u_' . $uid . '.php', function ($u) use ($user, $pass, $b) { if ($u) { return ['__ret' => false]; }
			return ['__write' => ['user' => $user, 'hash' => password_hash($pass, PASSWORD_DEFAULT), 'name' => clean((string) ($b['name'] ?? $user), 60), 'kampus' => clean((string) ($b['kampus'] ?? ''), 80), 'kelas' => strtoupper(clean((string) ($b['kelas'] ?? ''), 12)), 'created' => time(), 'tokens' => []], '__ret' => true]; });
		if (!$made) { fail('user_taken', 409); }
		$u = rd('u_' . $uid . '.php'); out(['ok' => true, 'token' => new_token($uid), 'me' => pub($u)]);
	}
	case 'login': {
		rate('login', 12, 900);
		$user = clean((string) ($b['user'] ?? ''), 32); $pass = (string) ($b['pass'] ?? ''); $uid = uid_of($user); $u = rd('u_' . $uid . '.php');
		if (!$u || !password_verify($pass, $u['hash'])) { fail('bad_login', 401); }
		out(['ok' => true, 'token' => new_token($uid), 'me' => pub($u)]);
	}
	case 'me': { $u = auth(); $s = rd('s_' . $u['uid'] . '.php'); out(['ok' => true, 'me' => pub($u), 'hasSave' => (bool) $s, 'saveMeta' => $s ? ($s['meta'] ?? null) : null]); }
	case 'logout': { $u = auth(); $tok = (string) $_SERVER['HTTP_X_BA_TOKEN']; $sec = explode('.', $tok, 2)[1];
		upd('u_' . $u['uid'] . '.php', function ($x) use ($sec) { $x['tokens'] = array_values(array_filter($x['tokens'] ?? [], fn($t) => !hash_equals($t['h'], hash('sha256', $sec)))); return ['__write' => $x, '__ret' => true]; }); out(['ok' => true]); }
	case 'save': {
		$u = auth(); rate('save' . $u['uid'], 40, 600);
		$raw = (string) file_get_contents('php://input'); if (strlen($raw) > MAX_SAVE) { fail('too_big', 413); }
		$j = json_decode($raw, true); if (!is_array($j) || !isset($j['state']) || !is_array($j['state'])) { fail('bad_save'); }
		$meta = ['name' => clean((string) ($j['state']['meta']['name'] ?? ''), 60), 'era' => (int) ($j['state']['era'] ?? 1), 'month' => (int) ($j['state']['t'] ?? 0), 'kk' => (int) ($j['state']['kk'] ?? 0),
			'loc' => clean((string) ($j['state']['loc']['name'] ?? ''), 80), 'lat' => (float) ($j['state']['loc']['lat'] ?? 0), 'lon' => (float) ($j['state']['loc']['lon'] ?? 0), 'score' => (int) ($j['state']['score'] ?? 0), 'at' => time()];
		$base = (int) ($j['base'] ?? 0);
		$r = upd('s_' . $u['uid'] . '.php', function ($s) use ($j, $meta, $base) { $ver = (int) ($s['ver'] ?? 0);
			if ($s && $base && $base !== $ver && empty($j['force'])) { return ['__ret' => ['conflict' => $ver]]; }
			return ['__write' => ['ver' => $ver + 1, 'meta' => $meta, 'state' => $j['state']], '__ret' => ['ver' => $ver + 1]]; });
		if (isset($r['conflict'])) { out(['ok' => false, 'error' => 'conflict', 'ver' => $r['conflict']], 409); }
		// direktori publik ringkas untuk tetangga (tanpa data pribadi selain nama tokoh)
		upd('dir.php', function ($d) use ($u, $meta) { $d = $d ?: []; $d[$u['uid']] = $meta + ['who' => $u['name'] ?? $u['user'], 'kelas' => $u['kelas'] ?? '', 'kampus' => $u['kampus'] ?? ''];
			if (count($d) > 5000) { uasort($d, fn($x, $y) => $y['at'] <=> $x['at']); $d = array_slice($d, 0, 5000, true); } return ['__write' => $d, '__ret' => true]; });
		out(['ok' => true, 'ver' => $r['ver']]);
	}
	case 'load': { $u = auth(); $s = rd('s_' . $u['uid'] . '.php'); out(['ok' => true, 'save' => $s]); }
	case 'neighbors': {
		$u = auth(); $lat = (float) ($_GET['lat'] ?? 0); $lon = (float) ($_GET['lon'] ?? 0); $d = rd('dir.php') ?: []; $me = $u['uid']; $out = [];
		foreach ($d as $id => $m) { if ($id === $me) { continue; } $km = 6371 * 2 * asin(sqrt(sin(deg2rad($m['lat'] - $lat) / 2) ** 2 + cos(deg2rad($lat)) * cos(deg2rad($m['lat'])) * sin(deg2rad($m['lon'] - $lon) / 2) ** 2));
			$rel = $km < 25 ? 'dekat' : (($u['kelas'] ?? '') !== '' && ($m['kelas'] ?? '') === $u['kelas'] ? 'kelas' : (($u['kampus'] ?? '') !== '' && ($m['kampus'] ?? '') === $u['kampus'] ? 'kampus' : ''));
			if ($rel) { $out[] = ['id' => substr(hash('sha256', $id), 0, 10), 'who' => $m['who'], 'name' => $m['name'], 'era' => $m['era'], 'kk' => $m['kk'], 'loc' => $m['loc'], 'km' => round($km, 1), 'rel' => $rel, 'score' => $m['score']]; } }
		usort($out, fn($x, $y) => $x['km'] <=> $y['km']); out(['ok' => true, 'list' => array_slice($out, 0, 30)]);
	}
	default: fail('unknown', 404);
}
