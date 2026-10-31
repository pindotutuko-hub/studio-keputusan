<?php
/**
 * Detektif Ruang — API mode kelas (tanpa database; satu berkas per sesi + flock).
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
const DR_MAX_CREATE_PER_DAY = 30;

function out(array $d, int $code = 200): void { http_response_code($code); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $msg, int $code = 400): void { out(['ok' => false, 'error' => $msg], $code); }
function body(): array { $j = json_decode((string) file_get_contents('php://input'), true); return is_array($j) ? $j : []; }
function clean(string $s, int $max): string { $s = trim(preg_replace('/[\x00-\x1F\x7F<>]/u', '', $s) ?? ''); return mb_substr($s, 0, $max); }
function code_ok(string $c): bool { return (bool) preg_match('/^[A-HJ-NP-Z2-9]{6}$/', $c); }
function sess_path(string $c): string { return DR_DATA . '/s_' . $c . '.php'; }

function levels(): array {
	static $L = null;
	if ($L === null) { $L = json_decode((string) file_get_contents(__DIR__ . '/levels.json'), true) ?: []; }
	return $L;
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
function score_picks(array $picks): array {
	$total = 0; $correct = 0; $per = [];
	foreach (levels() as $i => $lv) {
		$p = $picks[$i] ?? null;
		if (!is_string($p) || !in_array($p, $lv['rooms'], true)) { $per[] = ['pick' => null, 'pts' => 0, 'ok' => false]; continue; }
		$td = total_depths($lv); $mine = $td[$p]; $better = 0;
		foreach ($td as $v) { if ($lv['q'] === 'int' ? $v < $mine : $v > $mine) { $better++; } }
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
	$raw = stream_get_contents($h);
	$raw = (string) substr((string) $raw, strlen(DR_GUARD));
	$d = json_decode($raw, true);
	return [$h, is_array($d) ? $d : null];
}
function sess_save($h, array $d): void {
	ftruncate($h, 0); rewind($h);
	fwrite($h, DR_GUARD . json_encode($d, JSON_UNESCAPED_UNICODE)); fflush($h);
}
function sess_close($h): void { flock($h, LOCK_UN); fclose($h); }
function host_ok(array $d, string $key): bool { return $key !== '' && hash_equals($d['keyHash'] ?? '', hash('sha256', $key)); }

if (!is_dir(DR_DATA)) { @mkdir(DR_DATA, 0750, true); }
if (!is_file(DR_DATA . '/.htaccess')) { @file_put_contents(DR_DATA . '/.htaccess', "Require all denied\nDeny from all\n"); }

$r = (string) ($_GET['r'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'POST') { fail('method', 405); }
if ($method === 'POST' && $r !== 'ping') {
	$ct = $_SERVER['CONTENT_TYPE'] ?? '';
	if (stripos($ct, 'application/json') === false) { fail('content_type', 415); }
}

switch ($r) {
case 'ping':
	out(['ok' => true, 'levels' => count(levels())]);

case 'create': {
	$b = body();
	$title = clean((string) ($b['title'] ?? ''), 80);
	if ($title === '') { fail('title_required'); }
	// rate limit per IP per day
	$ipk = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . gmdate('Y-m-d'));
	$rl = DR_DATA . '/rl.php';
	$h = fopen($rl, 'c+'); flock($h, LOCK_EX);
	$raw = (string) substr((string) stream_get_contents($h), strlen(DR_GUARD));
	$m = json_decode($raw, true); if (!is_array($m) || ($m['day'] ?? '') !== gmdate('Y-m-d')) { $m = ['day' => gmdate('Y-m-d'), 'n' => []]; }
	$m['n'][$ipk] = ($m['n'][$ipk] ?? 0) + 1;
	sess_save($h, $m); sess_close($h);
	if ($m['n'][$ipk] > DR_MAX_CREATE_PER_DAY) { fail('rate_limited', 429); }
	$alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	do { $code = ''; for ($i = 0; $i < 6; $i++) { $code .= $alpha[random_int(0, strlen($alpha) - 1)]; } } while (is_file(sess_path($code)));
	$key = bin2hex(random_bytes(16));
	[$h, ] = sess_open($code, false);
	sess_save($h, ['code' => $code, 'title' => $title, 'keyHash' => hash('sha256', $key), 'created' => time(), 'open' => true, 'players' => []]);
	sess_close($h);
	out(['ok' => true, 'code' => $code, 'key' => $key, 'title' => $title]);
}

case 'info': {
	$code = strtoupper((string) ($_GET['code'] ?? ''));
	if (!code_ok($code)) { fail('bad_code'); }
	[$h, $d] = sess_open($code); sess_close($h);
	if (!$d) { fail('not_found', 404); }
	out(['ok' => true, 'title' => $d['title'], 'open' => (bool) $d['open']]);
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
	$pid = bin2hex(random_bytes(6)); $tok = bin2hex(random_bytes(12));
	$d['players'][$pid] = ['name' => $name, 'nim' => $nim, 'tok' => hash('sha256', $tok), 'joined' => time(), 'done' => null];
	sess_save($h, $d); sess_close($h);
	out(['ok' => true, 'pid' => $pid, 'token' => $tok, 'title' => $d['title']]);
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
	$res = score_picks(array_values($picks));
	$p['done'] = time(); $p['score'] = $res['score']; $p['correct'] = $res['correct'];
	$p['picks'] = array_map(fn($x) => $x['pick'], $res['per']); $p['secs'] = max(0, $p['done'] - $p['joined']);
	$d['players'][$pid] = $p;
	$rank = 1; $n = 0;
	foreach ($d['players'] as $q) { if ($q['done'] === null) { continue; } $n++; if ($q['score'] > $p['score'] || ($q['score'] === $p['score'] && $q['secs'] < $p['secs'])) { $rank++; } }
	sess_save($h, $d); sess_close($h);
	out(['ok' => true, 'score' => $res['score'], 'correct' => $res['correct'], 'per' => $res['per'], 'rank' => $rank, 'n' => $n, 'max' => 100 * count(levels())]);
}

case 'recap': {
	$b = body();
	$code = strtoupper((string) ($b['code'] ?? '')); $key = (string) ($b['key'] ?? '');
	if (!code_ok($code)) { fail('bad_code'); }
	[$h, $d] = sess_open($code); sess_close($h);
	if (!$d || !host_ok($d, $key)) { fail('forbidden', 403); }
	$rows = [];
	foreach ($d['players'] as $q) {
		$rows[] = ['name' => $q['name'], 'nim' => $q['nim'], 'joined' => $q['joined'], 'done' => $q['done'],
			'score' => $q['score'] ?? null, 'correct' => $q['correct'] ?? null, 'secs' => $q['secs'] ?? null, 'picks' => $q['picks'] ?? null];
	}
	usort($rows, function ($a, $b) {
		if (($a['done'] === null) !== ($b['done'] === null)) { return $a['done'] === null ? 1 : -1; }
		return [$b['score'] ?? -1, $a['secs'] ?? PHP_INT_MAX, $a['joined']] <=> [$a['score'] ?? -1, $b['secs'] ?? PHP_INT_MAX, $b['joined']];
	});
	out(['ok' => true, 'title' => $d['title'], 'open' => (bool) $d['open'], 'created' => $d['created'], 'players' => $rows, 'max' => 100 * count(levels())]);
}

case 'toggle': {
	$b = body();
	$code = strtoupper((string) ($b['code'] ?? '')); $key = (string) ($b['key'] ?? '');
	if (!code_ok($code)) { fail('bad_code'); }
	[$h, $d] = sess_open($code);
	if (!$d || !host_ok($d, $key)) { sess_close($h); fail('forbidden', 403); }
	$d['open'] = (bool) ($b['open'] ?? false);
	sess_save($h, $d); sess_close($h);
	out(['ok' => true, 'open' => $d['open']]);
}

default:
	fail('unknown_route', 404);
}
