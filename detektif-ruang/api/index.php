<?php
/**
 * Detektif Ruang — API mode kelas (satu berkas per sesi + flock).
 * Rute mahasiswa ringan (tanpa WordPress); rute dosen wajib login WordPress (edit_posts) + nonce.
 * Dikembangkan oleh: Pindo Tutuko · pindotutuko.id
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');

const DR_DATA = __DIR__ . '/../data';
const DR_GUARD = "<?php http_response_code(404); exit; ?>\n";
const DR_MAX_PLAYERS = 400;
const DR_MAX_CREATE_PER_DAY = 40;
const DR_MODES = ['mix', 'int', 'seg'];

function out(array $d, int $code = 200): void { http_response_code($code); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $msg, int $code = 400): void { out(['ok' => false, 'error' => $msg], $code); }
function body(): array { static $b = null; if ($b === null) { $j = json_decode((string) file_get_contents('php://input'), true); $b = is_array($j) ? $j : []; } return $b; }
function clean(string $s, int $max): string { $s = trim(preg_replace('/[\x00-\x1F\x7F<>]/u', '', $s) ?? ''); return mb_substr($s, 0, $max); }
function code_ok(string $c): bool { return (bool) preg_match('/^[A-HJ-NP-Z2-9]{6}$/', $c); }
function sess_path(string $c): string { return DR_DATA . '/s_' . $c . '.php'; }

function levels(): array {
	static $L = null;
	if ($L === null) { $L = json_decode((string) file_get_contents(__DIR__ . '/levels.json'), true) ?: []; }
	return $L;
}
/** Largest number of distinct (level, question) rounds for a mode. */
function max_rounds(string $mode): int { return count(levels()) * ($mode === 'mix' ? 2 : 1); }
/** Random rounds: distinct levels first (random question for "mix"), then the opposite question if more are needed. */
function random_rounds(int $n, string $mode): array {
	$ix = range(0, count(levels()) - 1);
	for ($i = count($ix) - 1; $i > 0; $i--) { $j = random_int(0, $i); [$ix[$i], $ix[$j]] = [$ix[$j], $ix[$i]]; }
	$out = [];
	foreach ($ix as $lv) { $out[] = ['lv' => $lv, 'q' => $mode === 'mix' ? (random_int(0, 1) ? 'int' : 'seg') : $mode]; }
	if ($mode === 'mix') { foreach ($ix as $i => $lv) { $out[] = ['lv' => $lv, 'q' => $out[$i]['q'] === 'int' ? 'seg' : 'int']; } }
	return array_slice($out, 0, max(1, min($n, count($out))));
}
/** Total depth (TD) of every node: BFS over the door graph. */
function total_depths(array $lv): array {
	$adj = [];
	foreach ($lv['rooms'] as $r) { $adj[$r] = []; }
	foreach ($lv['doors'] as $d) { $adj[$d[0]][] = $d[1]; $adj[$d[1]][] = $d[0]; }
	$td = [];
	foreach ($lv['rooms'] as $s) {
		$dep = [$s => 0]; $q = [$s]; $i = 0;
		while ($i < count($q)) { $u = $q[$i++]; foreach ($adj[$u] as $v) { if (!isset($dep[$v])) { $dep[$v] = $dep[$u] + 1; $q[] = $v; } } }
		$td[$s] = array_sum($dep);
	}
	return $td;
}
/** Same rule as the client: 100·(1 − better/(k−1)); 0 if no pick. */
function score_picks(array $picks, array $rounds): array {
	$total = 0; $correct = 0; $per = []; $L = levels();
	foreach ($rounds as $i => $rd) {
		$lv = $L[$rd['lv']] ?? null; if (!$lv) { continue; }
		$p = $picks[$i] ?? null;
		if (!is_string($p) || !in_array($p, $lv['rooms'], true)) { $per[] = ['pick' => null, 'pts' => 0, 'ok' => false]; continue; }
		$td = total_depths($lv); $mine = $td[$p]; $better = 0;
		foreach ($td as $v) { if ($rd['q'] === 'int' ? $v < $mine : $v > $mine) { $better++; } }
		$k = count($lv['rooms']); $pts = (int) round(100 * (1 - $better / ($k - 1)));
		$ok = $better === 0; if ($ok) { $correct++; } $total += $pts;
		$per[] = ['pick' => $p, 'pts' => $pts, 'ok' => $ok];
	}
	return ['score' => $total, 'correct' => $correct, 'per' => $per];
}

/** Open a session file under an exclusive lock; returns [handle, data]. */
function sess_open(string $code, bool $must = true): array {
	$f = sess_path($code);
	if ($must && !is_file($f)) { fail('not_found', 404); }
	$h = fopen($f, 'c+'); if (!$h) { fail('io', 500); }
	flock($h, LOCK_EX);
	$raw = (string) substr((string) stream_get_contents($h), strlen(DR_GUARD));
	$d = json_decode($raw, true);
	return [$h, is_array($d) ? $d : null];
}
function sess_read(string $file): ?array {
	$h = @fopen($file, 'r'); if (!$h) { return null; }
	flock($h, LOCK_SH); $raw = (string) stream_get_contents($h); flock($h, LOCK_UN); fclose($h);
	$d = json_decode((string) substr($raw, strlen(DR_GUARD)), true);
	return is_array($d) ? $d : null;
}
function sess_save($h, array $d): void {
	ftruncate($h, 0); rewind($h);
	fwrite($h, DR_GUARD . json_encode($d, JSON_UNESCAPED_UNICODE)); fflush($h);
}
function sess_close($h): void { flock($h, LOCK_UN); fclose($h); }

/** Lecturer routes: load WordPress and require a logged-in user who can edit posts. */
function wp_boot(): void {
	static $done = false; if ($done) { return; } $done = true;
	if (!defined('WP_USE_THEMES')) { define('WP_USE_THEMES', false); }
	require_once dirname(__DIR__, 2) . '/wp-load.php';
}
function host_user(bool $needNonce = true): int {
	wp_boot();
	if (!is_user_logged_in() || !current_user_can('edit_posts')) { fail('login_required', 401); }
	if ($needNonce && !wp_verify_nonce((string) (body()['nonce'] ?? ''), 'dr_host')) { fail('bad_nonce', 403); }
	return (int) get_current_user_id();
}
function can_manage(array $d, int $uid): bool { return (int) ($d['owner'] ?? -1) === $uid || current_user_can('manage_options'); }
function settings_of(array $d): array { return ['n' => (int) ($d['n'] ?? 5), 'limit' => (int) ($d['limit'] ?? 30), 'mode' => (string) ($d['mode'] ?? 'mix')]; }

if (!is_dir(DR_DATA)) { @mkdir(DR_DATA, 0750, true); }
if (!is_file(DR_DATA . '/.htaccess')) { @file_put_contents(DR_DATA . '/.htaccess', "Require all denied\nDeny from all\n"); }

$r = (string) ($_GET['r'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'POST') { fail('method', 405); }
if ($method === 'POST') {
	$ct = $_SERVER['CONTENT_TYPE'] ?? '';
	if (stripos($ct, 'application/json') === false) { fail('content_type', 415); }
}

switch ($r) {
case 'ping':
	out(['ok' => true, 'levels' => count(levels())]);

case 'whoami': {
	wp_boot();
	$logged = is_user_logged_in(); $can = $logged && current_user_can('edit_posts');
	$u = $logged ? wp_get_current_user() : null;
	out(['ok' => true, 'logged' => $logged, 'can' => $can, 'name' => $u ? $u->display_name : '',
		'nonce' => $can ? wp_create_nonce('dr_host') : '', 'login' => wp_login_url(home_url('/detektif-ruang/#dosen')),
		'maxMix' => max_rounds('mix'), 'maxOne' => max_rounds('int')]);
}

case 'create': {
	$uid = host_user();
	$b = body();
	$title = clean((string) ($b['title'] ?? ''), 80);
	if ($title === '') { fail('title_required'); }
	$mode = in_array($b['mode'] ?? '', DR_MODES, true) ? $b['mode'] : 'mix';
	$n = max(1, min(max_rounds($mode), (int) ($b['n'] ?? 5)));
	$limit = max(10, min(180, (int) ($b['limit'] ?? 30)));
	$rl = DR_DATA . '/rl.php';
	$h = fopen($rl, 'c+'); flock($h, LOCK_EX);
	$m = json_decode((string) substr((string) stream_get_contents($h), strlen(DR_GUARD)), true);
	if (!is_array($m) || ($m['day'] ?? '') !== gmdate('Y-m-d')) { $m = ['day' => gmdate('Y-m-d'), 'n' => []]; }
	$m['n']['u' . $uid] = ($m['n']['u' . $uid] ?? 0) + 1;
	sess_save($h, $m); sess_close($h);
	if ($m['n']['u' . $uid] > DR_MAX_CREATE_PER_DAY) { fail('rate_limited', 429); }
	$alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	do { $code = ''; for ($i = 0; $i < 6; $i++) { $code .= $alpha[random_int(0, strlen($alpha) - 1)]; } } while (is_file(sess_path($code)));
	[$h, ] = sess_open($code, false);
	sess_save($h, ['code' => $code, 'title' => $title, 'owner' => $uid, 'created' => time(), 'open' => true, 'n' => $n, 'limit' => $limit, 'mode' => $mode, 'players' => []]);
	sess_close($h);
	out(['ok' => true, 'code' => $code, 'title' => $title] + settings_of(['n' => $n, 'limit' => $limit, 'mode' => $mode]));
}

case 'mine': {
	$uid = host_user();
	$list = [];
	foreach ((array) glob(DR_DATA . '/s_*.php') as $f) {
		$d = sess_read((string) $f); if (!$d || !can_manage($d, $uid)) { continue; }
		$done = 0; foreach ($d['players'] as $p) { if ($p['done'] !== null) { $done++; } }
		$list[] = ['code' => $d['code'], 'title' => $d['title'], 'created' => $d['created'], 'open' => (bool) $d['open'], 'players' => count($d['players']), 'done' => $done, 'mineOwn' => (int) ($d['owner'] ?? -1) === $uid] + settings_of($d);
	}
	usort($list, fn($a, $b) => $b['created'] <=> $a['created']);
	out(['ok' => true, 'sessions' => $list]);
}

case 'info': {
	$code = strtoupper((string) ($_GET['code'] ?? ''));
	if (!code_ok($code)) { fail('bad_code'); }
	$d = sess_read(sess_path($code));
	if (!$d) { fail('not_found', 404); }
	out(['ok' => true, 'title' => $d['title'], 'open' => (bool) $d['open']] + settings_of($d));
}

case 'join': {
	$b = body();
	$code = strtoupper((string) ($b['code'] ?? ''));
	$name = clean((string) ($b['name'] ?? ''), 60);
	$nim = clean((string) ($b['nim'] ?? ''), 30);
	if (!code_ok($code)) { fail('bad_code'); }
	if ($name === '') { fail('name_required'); }
	[$h, $d] = sess_open($code);
	if (!$d) { sess_close($h); fail('not_found', 404); }
	if (!$d['open']) { sess_close($h); fail('closed', 403); }
	if (count($d['players']) >= DR_MAX_PLAYERS) { sess_close($h); fail('full', 403); }
	$set = settings_of($d);
	$pid = bin2hex(random_bytes(6)); $tok = bin2hex(random_bytes(12));
	$rounds = random_rounds($set['n'], $set['mode']);
	$d['players'][$pid] = ['name' => $name, 'nim' => $nim, 'tok' => hash('sha256', $tok), 'joined' => time(), 'done' => null, 'rounds' => $rounds];
	sess_save($h, $d); sess_close($h);
	out(['ok' => true, 'pid' => $pid, 'token' => $tok, 'title' => $d['title'], 'rounds' => $rounds, 'limit' => $set['limit']]);
}

case 'submit': {
	$b = body();
	$code = strtoupper((string) ($b['code'] ?? ''));
	$pid = (string) ($b['pid'] ?? ''); $tok = (string) ($b['token'] ?? '');
	$picks = $b['picks'] ?? null;
	if (!code_ok($code) || !preg_match('/^[a-f0-9]{12}$/', $pid) || !is_array($picks)) { fail('bad_request'); }
	[$h, $d] = sess_open($code);
	$p = $d['players'][$pid] ?? null;
	if (!$p || !hash_equals($p['tok'], hash('sha256', $tok))) { sess_close($h); fail('forbidden', 403); }
	if ($p['done'] !== null) { sess_close($h); fail('already_submitted', 409); }
	if (!$d['open']) { sess_close($h); fail('closed', 403); }
	$res = score_picks(array_values($picks), $p['rounds'] ?? []);
	$p['done'] = time(); $p['score'] = $res['score']; $p['correct'] = $res['correct'];
	$p['picks'] = array_map(fn($x) => $x['pick'], $res['per']); $p['secs'] = max(0, $p['done'] - $p['joined']);
	$d['players'][$pid] = $p;
	$rank = 1; $n = 0;
	foreach ($d['players'] as $q) { if ($q['done'] === null) { continue; } $n++; if ($q['score'] > $p['score'] || ($q['score'] === $p['score'] && $q['secs'] < $p['secs'])) { $rank++; } }
	sess_save($h, $d); sess_close($h);
	out(['ok' => true, 'score' => $res['score'], 'correct' => $res['correct'], 'per' => $res['per'], 'rank' => $rank, 'n' => $n, 'max' => 100 * count($p['rounds'] ?? [])]);
}

case 'recap': {
	$uid = host_user();
	$code = strtoupper((string) (body()['code'] ?? ''));
	if (!code_ok($code)) { fail('bad_code'); }
	$d = sess_read(sess_path($code));
	if (!$d) { fail('not_found', 404); }
	if (!can_manage($d, $uid)) { fail('forbidden', 403); }
	$rows = [];
	foreach ($d['players'] as $q) {
		$rows[] = ['name' => $q['name'], 'nim' => $q['nim'], 'joined' => $q['joined'], 'done' => $q['done'],
			'score' => $q['score'] ?? null, 'correct' => $q['correct'] ?? null, 'secs' => $q['secs'] ?? null, 'picks' => $q['picks'] ?? null, 'rounds' => $q['rounds'] ?? []];
	}
	usort($rows, function ($a, $b) {
		if (($a['done'] === null) !== ($b['done'] === null)) { return $a['done'] === null ? 1 : -1; }
		return [$b['score'] ?? -1, $a['secs'] ?? PHP_INT_MAX, $a['joined']] <=> [$a['score'] ?? -1, $b['secs'] ?? PHP_INT_MAX, $b['joined']];
	});
	$set = settings_of($d);
	out(['ok' => true, 'code' => $d['code'], 'title' => $d['title'], 'open' => (bool) $d['open'], 'created' => $d['created'], 'players' => $rows, 'max' => 100 * $set['n']] + $set);
}

case 'toggle': {
	$uid = host_user();
	$b = body();
	$code = strtoupper((string) ($b['code'] ?? ''));
	if (!code_ok($code)) { fail('bad_code'); }
	[$h, $d] = sess_open($code);
	if (!$d || !can_manage($d, $uid)) { sess_close($h); fail('forbidden', 403); }
	$d['open'] = (bool) ($b['open'] ?? false);
	sess_save($h, $d); sess_close($h);
	out(['ok' => true, 'open' => $d['open']]);
}

case 'remove': {
	$uid = host_user();
	$code = strtoupper((string) (body()['code'] ?? ''));
	if (!code_ok($code)) { fail('bad_code'); }
	[$h, $d] = sess_open($code);
	if (!$d || !can_manage($d, $uid)) { sess_close($h); fail('forbidden', 403); }
	sess_close($h);
	@unlink(sess_path($code));
	out(['ok' => true]);
}

default:
	fail('unknown_route', 404);
}
