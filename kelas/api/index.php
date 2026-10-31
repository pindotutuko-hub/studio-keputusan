<?php
/**
 * Mode kelas bersama untuk gim pindotutuko.id: Garis Waktu, Arsitek Pintu, Krisis Kota, Kampung Brantas.
 * Satu berkas per sesi (flock). Rute dosen wajib login WordPress (edit_posts) + nonce.
 * Skor dihitung ulang di server dari jawaban/langkah mahasiswa.
 * Dikembangkan oleh: Pindo Tutuko · pindotutuko.id
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');

const K_DATA = __DIR__ . '/../data';
const K_GUARD = "<?php http_response_code(404); exit; ?>\n";
const K_MAX_PLAYERS = 400;
const K_MAX_CREATE_PER_DAY = 40;
const K_GAMES = ['garis', 'pintu', 'krisis', 'kampung'];

function out(array $d, int $code = 200): void { http_response_code($code); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $msg, int $code = 400): void { out(['ok' => false, 'error' => $msg], $code); }
function body(): array { static $b = null; if ($b === null) { $j = json_decode((string) file_get_contents('php://input'), true); $b = is_array($j) ? $j : []; } return $b; }
function clean(string $s, int $max): string { $s = trim(preg_replace('/[\x00-\x1F\x7F<>]/u', '', $s) ?? ''); return mb_substr($s, 0, $max); }
function code_ok(string $c): bool { return (bool) preg_match('/^[A-HJ-NP-Z2-9]{6}$/', $c); }
function sess_path(string $c): string { return K_DATA . '/k_' . $c . '.php'; }
function jround(float $x): int { return (int) floor($x + 0.5); } // JavaScript Math.round
function data(string $n): array { static $c = []; if (!isset($c[$n])) { $c[$n] = json_decode((string) file_get_contents(__DIR__ . '/data-' . $n . '.json'), true) ?: []; } return $c[$n]; }
function shuffled(array $a): array { for ($i = count($a) - 1; $i > 0; $i--) { $j = random_int(0, $i); [$a[$i], $a[$j]] = [$a[$j], $a[$i]]; } return $a; }

/* ======================= GARIS WAKTU ======================= */
function garis_settings(array $b): array {
	$deck = in_array($b['deck'] ?? '', ['all', 'world', 'indo'], true) ? $b['deck'] : 'all';
	$max = count(data('garis')['decks'][$deck]);
	return ['deck' => $deck, 'n' => max(5, min($max, (int) ($b['n'] ?? 20)))];
}
function garis_params(array $s): array { return ['order' => array_slice(shuffled(data('garis')['decks'][$s['deck']]), 0, $s['n'])]; }
function garis_score(array $s, array $p, array $pay): array {
	$C = data('garis')['cards']; $order = $p['order']; $slots = array_values((array) ($pay['slots'] ?? []));
	$line = [$order[0]]; $lives = 3; $score = 0; $streak = 0; $correct = 0; $placed = 0;
	for ($t = 1; $t < count($order) && $lives > 0; $t++) {
		if (!array_key_exists($t - 1, $slots)) { break; }
		$i = (int) $slots[$t - 1]; if ($i < 0 || $i > count($line)) { break; }
		$k = $order[$t]; $y = $C[$k]['y'];
		$lo = $i > 0 ? $C[$line[$i - 1]]['y'] : PHP_INT_MIN; $hi = $i < count($line) ? $C[$line[$i]]['y'] : PHP_INT_MAX;
		$ok = $y >= $lo && $y <= $hi; $pos = $i;
		if (!$ok) { $pos = 0; while ($pos < count($line) && $C[$line[$pos]]['y'] <= $y) { $pos++; } }
		array_splice($line, $pos, 0, [$k]); $placed++;
		if ($ok) { $correct++; $streak++; $bonus = $streak >= 3 ? min(5, $streak - 2) : 0; $score += 10 + $bonus; } else { $lives--; $streak = 0; }
	}
	return ['score' => $score, 'correct' => $correct, 'placed' => $placed, 'lives' => $lives];
}

/* ======================= ARSITEK PINTU ======================= */
function pintu_settings(array $b): array { return []; }
function pintu_params(array $s): array { return []; }
function pintu_check(array $L, array $doors): array {
	$ids = $L['ids']; $adj = []; foreach ($ids as $i) { $adj[$i] = []; }
	$valid = []; foreach ($L['walls'] as $w) { $valid[$w[0] . '|' . $w[1]] = 1; $valid[$w[1] . '|' . $w[0]] = 1; }
	$m = 0; $seen = [];
	foreach ($doors as $d) {
		if (!is_array($d) || count($d) !== 2) { continue; } $a = (string) $d[0]; $b = (string) $d[1];
		if (!isset($valid[$a . '|' . $b])) { continue; } $key = $a < $b ? $a . '|' . $b : $b . '|' . $a; if (isset($seen[$key])) { continue; } $seen[$key] = 1;
		$adj[$a][] = $b; $adj[$b][] = $a; $m++;
	}
	$bfs = function ($s) use ($adj) { $d = [$s => 0]; $q = [$s]; for ($i = 0; $i < count($q); $i++) { foreach ($adj[$q[$i]] as $v) { if (!isset($d[$v])) { $d[$v] = $d[$q[$i]] + 1; $q[] = $v; } } } return $d; };
	$dep = $bfs($ids[0]); $k = count($ids); $reach = count($dep) === $k; $TD = [];
	if ($reach) { foreach ($ids as $s) { $TD[$s] = array_sum($bfs($s)); } }
	$ring = $reach && $m > $k - 1; $all = true;
	foreach ($L['reqs'] as $q) {
		$ok = false; $t = $q['t'];
		if ($t === 'conn') { $ok = $reach; }
		elseif ($t === 'depthGe' || $t === 'depthLe' || $t === 'depthEq') { $dv = $dep[$q['r']] ?? null; if ($dv !== null) { $ok = $t === 'depthGe' ? $dv >= $q['v'] : ($t === 'depthLe' ? $dv <= $q['v'] : $dv === $q['v']); } }
		elseif ($t === 'most' || $t === 'least') { if ($reach) { $tg = $t === 'most' ? min($TD) : max($TD); $ok = $TD[$q['r']] === $tg; } }
		elseif ($t === 'door' || $t === 'nodoor') { $has = in_array($q['b'], $adj[$q['a']], true); $ok = $t === 'door' ? $has : !$has; }
		elseif ($t === 'ring') { $ok = $ring; }
		elseif ($t === 'tree') { $ok = $reach && !$ring; }
		elseif ($t === 'max') { $ok = $m <= $q['v']; }
		if (!$ok) { $all = false; }
	}
	$stars = $all ? ($m <= $L['par'] ? 3 : ($m <= $L['par'] + 1 ? 2 : 1)) : 0;
	return ['solved' => $all, 'doors' => $m, 'stars' => $stars];
}
function pintu_score(array $s, array $p, array $pay): array {
	$lv = (array) ($pay['levels'] ?? []); $stars = 0; $solved = 0; $per = [];
	foreach (data('pintu') as $i => $L) { $r = pintu_check($L, (array) ($lv[$i] ?? $lv[(string) $i] ?? [])); $stars += $r['stars']; if ($r['solved']) { $solved++; } $per[] = $r; }
	return ['score' => $stars, 'stars' => $stars, 'solved' => $solved, 'per' => $per];
}

/* ======================= KRISIS KOTA ======================= */
function krisis_pairs(): array { $p = []; for ($i = 0; $i < 5; $i++) { for ($j = $i + 1; $j < 5; $j++) { $p[] = [$i, $j]; } } return $p; }
function krisis_val(int $p): float { return $p < 0 ? 1 - $p : ($p > 0 ? 1 / (1 + $p) : 1); }
function krisis_ahp(array $pw): array {
	$A = array_fill(0, 5, array_fill(0, 5, 1.0));
	foreach (krisis_pairs() as $k => $pr) { $v = (float) $pw[$k]; $A[$pr[0]][$pr[1]] = $v; $A[$pr[1]][$pr[0]] = 1 / $v; }
	$w = array_fill(0, 5, 0.2);
	for ($it = 0; $it < 200; $it++) { $x = []; foreach ($A as $r) { $s = 0; foreach ($r as $j => $a) { $s += $a * $w[$j]; } $x[] = $s; } $t = array_sum($x); $w = array_map(fn($v) => $v / $t, $x); }
	$lam = 0; foreach ($A as $i => $r) { $s = 0; foreach ($r as $j => $a) { $s += $a * $w[$j]; } $lam += $s / $w[$i]; } $lam /= 5;
	$CI = ($lam - 5) / 4; return ['w' => $w, 'CR' => $CI / 1.12];
}
function krisis_fis(int $c): int { return max(-3, min(3, jround((20 - $c) / 10))); }
function krisis_settings(array $b): array { return []; }
function krisis_params(array $s): array { return ['order' => shuffled(range(0, count(data('krisis')) - 1))]; }
function krisis_score(array $s, array $p, array $pay): array {
	$pw = array_values((array) ($pay['pw'] ?? [])); if (count($pw) !== 10) { fail('bad_payload'); }
	$pw = array_map(fn($v) => max(-8, min(8, (int) $v)), $pw);
	$ah = krisis_ahp(array_map('krisis_val', $pw)); $S = data('krisis'); $picks = array_values((array) ($pay['picks'] ?? []));
	$city = ['env' => 50, 'eco' => 50, 'soc' => 50, 'her' => 50]; $keys = array_keys($city); $cash = 120; $align = 0; $log = [];
	foreach ($p['order'] as $r => $si) {
		$opts = $S[$si]; $pick = (int) ($picks[$r] ?? -1); if ($pick < 0 || $pick > 2) { fail('bad_payload'); }
		$sc = []; foreach ($opts as $o) { $e = array_merge($o['e'], [krisis_fis((int) $o['c'])]); $v = 0; foreach ($e as $i => $x) { $v += $ah['w'][$i] * ($x + 3) / 6; } $sc[] = $v; }
		$best = array_search(max($sc), $sc, true);
		if ($opts[$pick]['c'] > $cash) { fail('bad_payload'); }
		$cash -= $opts[$pick]['c']; foreach ($keys as $j => $k) { $city[$k] = max(0, min(100, $city[$k] + $opts[$pick]['e'][$j] * 5)); } $cash += 10;
		if ($pick === $best) { $align++; } $log[] = ['s' => $si, 'pick' => $pick, 'best' => $best];
	}
	$ci = jround(array_sum($city) / 4);
	return ['score' => $ci, 'city' => $city, 'cityIndex' => $ci, 'align' => $align, 'w' => $ah['w'], 'CR' => $ah['CR'], 'pw' => $pw, 'role' => clean((string) ($pay['role'] ?? ''), 20), 'log' => $log];
}

/* ======================= KAMPUNG BRANTAS ======================= */
const KB_MAP = ["RRRRRRRRRRRRRRRR","hhhhhghhhhhhghhh","hhhehghhhhhhghhh","hhhhhghhthhhghhh","hggggggggehhghhh","hhhhhghhhhhhghhe","hhehhghhhhhfghhh","hhhhhghhhhhhghhh","hhhhhhhhhhhhhhhh","WWWWWWWWWWWWWWWW","WWWWWWWWWWWWWWWW"];
const KB_W = 16; const KB_H = 11; const KB_BANK = 8; const KB_YEARS = 8; const KB_START = 45; const KB_INCOME = 20;
const KB_KK = ['h' => 1, 'u' => 6];
const KB_TOOLS = ['gang' => ['g', 2], 'rth' => ['r', 3], 'tree' => ['t', 1], 'bio' => [null, 1], 'rusun' => ['u', 12], 'balai' => ['f', 5], 'clear' => ['e', 1]];
const KB_RUN = ['R' => .9, 'h' => .9, 'u' => .9, 'f' => .9, 'g' => .85, 'e' => .5, 'r' => .2, 't' => .15];
const KB_RUNBIO = ['g' => .6, 'r' => .1];
const KB_HEAT = ['R' => .9, 'h' => .8, 'u' => .8, 'f' => .8, 'g' => .75, 'e' => .6, 'r' => .3, 't' => .15, 'W' => .1];
const KB_WALK = ['R' => 1, 'g' => 1, 'r' => 1];
const KB_EVENTS = ['rain', 'heat', 'fire', 'flood', 'visit', 'csr', 'dry', 'comm'];
function kb_nb4(int $x, int $y): array { $o = []; if ($x > 0) { $o[] = [$x - 1, $y]; } if ($x < KB_W - 1) { $o[] = [$x + 1, $y]; } if ($y > 0) { $o[] = [$x, $y - 1]; } if ($y < KB_H - 1) { $o[] = [$x, $y + 1]; } return $o; }
function kb_metrics(array $g, array $bio, int $k0): array {
	$INF = 1000000000; $steps = array_fill(0, KB_H, array_fill(0, KB_W, $INF)); $q = [];
	for ($y = 0; $y < KB_H; $y++) { for ($x = 0; $x < KB_W; $x++) { if ($g[$y][$x] === 'R') { $steps[$y][$x] = 0; $q[] = [$x, $y]; } } }
	for ($i = 0; $i < count($q); $i++) { [$cx, $cy] = $q[$i]; foreach (kb_nb4($cx, $cy) as [$nx, $ny]) { if (isset(KB_WALK[$g[$ny][$nx]]) && $steps[$ny][$nx] === $INF) { $steps[$ny][$nx] = $steps[$cy][$cx] + 1; $q[] = [$nx, $ny]; } } }
	$conn = 0; $kk = 0; $sum = 0; $unconn = []; $bank = 0;
	for ($y = 0; $y < KB_H; $y++) { for ($x = 0; $x < KB_W; $x++) { $tp = $g[$y][$x]; if (!isset(KB_KK[$tp]) && $tp !== 'f') { continue; } $v = $INF;
		foreach (kb_nb4($x, $y) as [$nx, $ny]) { $s = $steps[$ny][$nx]; if (isset(KB_WALK[$g[$ny][$nx]]) && $s < $INF) { $v = min($v, $s + 1); } }
		if (isset(KB_KK[$tp])) { $kk += KB_KK[$tp]; if ($v < $INF) { $conn += KB_KK[$tp]; $sum += $v * KB_KK[$tp]; } elseif ($tp === 'h') { $unconn[] = [$x, $y]; } if ($y === KB_BANK) { $bank += KB_KK[$tp]; } } } }
	$mean = $conn ? $sum / $conn : 0; $acc = jround(max(0, min(100, 100 * $conn / max(1, $kk) - max(0, $mean - 4) * 5))); if (!$kk) { $acc = 0; }
	$sc = 0; $nl = 0; for ($y = 0; $y < KB_H; $y++) { for ($x = 0; $x < KB_W; $x++) { $tp = $g[$y][$x]; if ($tp === 'W') { continue; } $sc += ($bio[$y][$x] && isset(KB_RUNBIO[$tp])) ? KB_RUNBIO[$tp] : KB_RUN[$tp]; $nl++; } }
	$C = $sc / $nl; $fld = jround(max(0, min(100, 100 * (1 - ($C - .6) / .3) - 2 * $bank)));
	$sh = 0; for ($y = 0; $y < KB_H; $y++) { for ($x = 0; $x < KB_W; $x++) { $b = KB_HEAT[$g[$y][$x]]; $s2 = 0; $n2 = 0;
		for ($dy = -1; $dy <= 1; $dy++) { for ($dx = -1; $dx <= 1; $dx++) { if (!$dx && !$dy) { continue; } $xx = $x + $dx; $yy = $y + $dy; if ($xx < 0 || $yy < 0 || $xx >= KB_W || $yy >= KB_H) { continue; } $s2 += KB_HEAT[$g[$yy][$xx]]; $n2++; } }
		if ($g[$y][$x] !== 'W') { $sh += .5 * $b + .5 * ($s2 / $n2); } } }
	$Hm = $sh / $nl; $hsc = jround(max(0, min(100, 100 * (1 - ($Hm - .55) / .3))));
	$disp = max(0, $k0 - $kk); $home = max(0, 100 - 8 * $disp);
	$fd = array_fill(0, KB_H, array_fill(0, KB_W, $INF)); $fq = [];
	for ($y = 0; $y < KB_H; $y++) { for ($x = 0; $x < KB_W; $x++) { if ($g[$y][$x] === 'r') { $fd[$y][$x] = 0; $fq[] = [$x, $y]; } elseif ($g[$y][$x] === 'f') { foreach (kb_nb4($x, $y) as [$nx, $ny]) { if (isset(KB_WALK[$g[$ny][$nx]]) && $fd[$ny][$nx] > 0) { $fd[$ny][$nx] = 0; $fq[] = [$nx, $ny]; } } } } }
	for ($i = 0; $i < count($fq); $i++) { [$cx, $cy] = $fq[$i]; foreach (kb_nb4($cx, $cy) as [$nx, $ny]) { if (isset(KB_WALK[$g[$ny][$nx]]) && $fd[$ny][$nx] === $INF) { $fd[$ny][$nx] = $fd[$cy][$cx] + 1; $fq[] = [$nx, $ny]; } } }
	$near = 0; for ($y = 0; $y < KB_H; $y++) { for ($x = 0; $x < KB_W; $x++) { $tp = $g[$y][$x]; if (!isset(KB_KK[$tp])) { continue; } $best = $INF; foreach (kb_nb4($x, $y) as [$nx, $ny]) { if (isset(KB_WALK[$g[$ny][$nx]])) { $best = min($best, $fd[$ny][$nx] + 1); } } if ($best <= 4) { $near += KB_KK[$tp]; } } }
	$fac = $kk ? jround(100 * $near / $kk) : 0;
	$nbio = 0; foreach ($bio as $r) { foreach ($r as $v) { if ($v) { $nbio++; } } }
	$total = jround(($acc + $fld + $hsc + $home + $fac) / 5);
	return compact('acc', 'fld', 'hsc', 'home', 'fac', 'total', 'unconn', 'bank', 'disp', 'nbio', 'kk');
}
function kampung_settings(array $b): array { return []; }
function kampung_params(array $s): array { $ev = shuffled(KB_EVENTS); if ($ev[0] === 'fire') { $k = random_int(1, count($ev) - 1); [$ev[0], $ev[$k]] = [$ev[$k], $ev[0]]; } return ['events' => $ev, 'seed' => random_int(0, 9999)]; }
function kampung_score(array $s, array $p, array $pay): array {
	$g = array_map('str_split', KB_MAP); $bio = array_fill(0, KB_H, array_fill(0, KB_W, false));
	$k0 = 0; foreach ($g as $r) { foreach ($r as $c) { $k0 += KB_KK[$c] ?? 0; } }
	$fund = KB_START; $year = 1; $log = array_values((array) ($pay['log'] ?? [])); $ended = false;
	foreach ($log as $a) {
		if (!is_array($a) || !$a) { continue; }
		if ($a[0] === 'y') {
			$m = kb_metrics($g, $bio, $k0); $ev = $p['events'][$year - 1]; $d = 0;
			if ($ev === 'rain') { $d = $m['fld'] < 50 ? -5 : 2; }
			elseif ($ev === 'heat') { $d = $m['hsc'] < 45 ? -4 : 0; }
			elseif ($ev === 'fire') { $n = count($m['unconn']); if ($n) { [$fx, $fy] = $m['unconn'][($p['seed'] + $year * 7) % $n]; $g[$fy][$fx] = 'e'; } }
			elseif ($ev === 'flood') { $d = -$m['bank'] - ($m['fld'] < 40 ? 3 : 0); }
			elseif ($ev === 'visit') { $d = $m['fac'] >= 60 ? 6 : 0; }
			elseif ($ev === 'csr') { $d = 6; }
			elseif ($ev === 'dry') { $d = $m['nbio'] >= 4 ? 3 : -2; }
			elseif ($ev === 'comm') { $d = $m['disp'] === 0 ? 4 : -4; }
			$fund = max(0, $fund + $d);
			if ($year >= KB_YEARS) { $ended = true; break; }
			$year++; $fund += KB_INCOME; continue;
		}
		if ($a[0] !== 'a' || count($a) < 4) { continue; }
		$tool = (string) $a[1]; $x = (int) $a[2]; $y = (int) $a[3];
		if (!isset(KB_TOOLS[$tool]) || $x < 0 || $y < 0 || $x >= KB_W || $y >= KB_H) { continue; }
		[$to, $c] = KB_TOOLS[$tool]; $tp = $g[$y][$x];
		if ($tp === 'W' || $tp === 'R') { continue; }
		if ($tool === 'bio') { if (($tp !== 'g' && $tp !== 'r') || $bio[$y][$x]) { continue; } }
		elseif ($to === $tp) { continue; }
		if ($tool === 'balai') { $okb = false; foreach (kb_nb4($x, $y) as [$nx, $ny]) { if (isset(KB_WALK[$g[$ny][$nx]])) { $okb = true; } } if (!$okb) { continue; } }
		if ($to !== null && $to !== $tp && in_array($tp, ['h', 'u', 'f'], true)) { $c += 1; }
		if ($c > $fund) { continue; }
		$fund -= $c;
		if ($tool === 'bio') { $bio[$y][$x] = true; } else { $g[$y][$x] = $to; if ($to !== 'g' && $to !== 'r') { $bio[$y][$x] = false; } }
	}
	$m = kb_metrics($g, $bio, $k0);
	return ['score' => $m['total'], 'total' => $m['total'], 'acc' => $m['acc'], 'fld' => $m['fld'], 'hsc' => $m['hsc'], 'home' => $m['home'], 'fac' => $m['fac'], 'fund' => $fund, 'complete' => $ended];
}

/* ======================= Sessions ======================= */
function sess_open(string $code, bool $must = true): array {
	$f = sess_path($code); if ($must && !is_file($f)) { fail('not_found', 404); }
	$h = fopen($f, 'c+'); if (!$h) { fail('io', 500); } flock($h, LOCK_EX);
	$d = json_decode((string) substr((string) stream_get_contents($h), strlen(K_GUARD)), true);
	return [$h, is_array($d) ? $d : null];
}
function sess_read(string $file): ?array { $h = @fopen($file, 'r'); if (!$h) { return null; } flock($h, LOCK_SH); $raw = (string) stream_get_contents($h); flock($h, LOCK_UN); fclose($h); $d = json_decode((string) substr($raw, strlen(K_GUARD)), true); return is_array($d) ? $d : null; }
function sess_save($h, array $d): void { ftruncate($h, 0); rewind($h); fwrite($h, K_GUARD . json_encode($d, JSON_UNESCAPED_UNICODE)); fflush($h); }
function sess_close($h): void { flock($h, LOCK_UN); fclose($h); }
function wp_boot(): void { static $done = false; if ($done) { return; } $done = true; if (!defined('WP_USE_THEMES')) { define('WP_USE_THEMES', false); } require_once dirname(__DIR__, 2) . '/wp-load.php'; }
function host_user(): int {
	wp_boot();
	if (!is_user_logged_in() || !current_user_can('edit_posts')) { fail('login_required', 401); }
	if (!wp_verify_nonce((string) (body()['nonce'] ?? ''), 'kelas_host')) { fail('bad_nonce', 403); }
	return (int) get_current_user_id();
}
function can_manage(array $d, int $uid): bool { return (int) ($d['owner'] ?? -1) === $uid || current_user_can('manage_options'); }

if (!is_dir(K_DATA)) { @mkdir(K_DATA, 0750, true); }
if (!is_file(K_DATA . '/.htaccess')) { @file_put_contents(K_DATA . '/.htaccess', "Require all denied\nDeny from all\n"); }

$r = (string) ($_GET['r'] ?? ''); $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'POST') { fail('method', 405); }
if ($method === 'POST' && stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) { fail('content_type', 415); }

switch ($r) {
case 'ping': out(['ok' => true, 'games' => K_GAMES]);

case 'whoami': {
	wp_boot(); $logged = is_user_logged_in(); $can = $logged && current_user_can('edit_posts'); $u = $logged ? wp_get_current_user() : null;
	out(['ok' => true, 'logged' => $logged, 'can' => $can, 'name' => $u ? $u->display_name : '', 'nonce' => $can ? wp_create_nonce('kelas_host') : '', 'login' => wp_login_url(home_url('/kelas/')),
		'decks' => array_map('count', data('garis')['decks'])]);
}

case 'create': {
	$uid = host_user(); $b = body();
	$game = in_array($b['game'] ?? '', K_GAMES, true) ? $b['game'] : fail('bad_game');
	$title = clean((string) ($b['title'] ?? ''), 80); if ($title === '') { fail('title_required'); }
	$set = ($game . '_settings')((array) ($b['settings'] ?? []));
	$rl = K_DATA . '/rl.php'; $h = fopen($rl, 'c+'); flock($h, LOCK_EX);
	$m = json_decode((string) substr((string) stream_get_contents($h), strlen(K_GUARD)), true);
	if (!is_array($m) || ($m['day'] ?? '') !== gmdate('Y-m-d')) { $m = ['day' => gmdate('Y-m-d'), 'n' => []]; }
	$m['n']['u' . $uid] = ($m['n']['u' . $uid] ?? 0) + 1; sess_save($h, $m); sess_close($h);
	if ($m['n']['u' . $uid] > K_MAX_CREATE_PER_DAY) { fail('rate_limited', 429); }
	$alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	do { $code = ''; for ($i = 0; $i < 6; $i++) { $code .= $alpha[random_int(0, 31)]; } } while (is_file(sess_path($code)));
	[$h, ] = sess_open($code, false);
	sess_save($h, ['code' => $code, 'game' => $game, 'title' => $title, 'owner' => $uid, 'created' => time(), 'open' => true, 'settings' => $set, 'players' => []]); sess_close($h);
	out(['ok' => true, 'code' => $code, 'game' => $game, 'title' => $title, 'settings' => $set]);
}

case 'mine': {
	$uid = host_user(); $list = [];
	foreach ((array) glob(K_DATA . '/k_*.php') as $f) {
		$d = sess_read((string) $f); if (!$d || !can_manage($d, $uid)) { continue; }
		$done = 0; foreach ($d['players'] as $p) { if ($p['done'] !== null) { $done++; } }
		$list[] = ['code' => $d['code'], 'game' => $d['game'], 'title' => $d['title'], 'created' => $d['created'], 'open' => (bool) $d['open'], 'settings' => $d['settings'], 'players' => count($d['players']), 'done' => $done];
	}
	usort($list, fn($a, $b) => $b['created'] <=> $a['created']); out(['ok' => true, 'sessions' => $list]);
}

case 'info': {
	$code = strtoupper((string) ($_GET['code'] ?? '')); if (!code_ok($code)) { fail('bad_code'); }
	$d = sess_read(sess_path($code)); if (!$d) { fail('not_found', 404); }
	out(['ok' => true, 'game' => $d['game'], 'title' => $d['title'], 'open' => (bool) $d['open']]);
}

case 'join': {
	$b = body(); $code = strtoupper((string) ($b['code'] ?? '')); $name = clean((string) ($b['name'] ?? ''), 60); $nim = clean((string) ($b['nim'] ?? ''), 30);
	if (!code_ok($code)) { fail('bad_code'); } if ($name === '') { fail('name_required'); }
	[$h, $d] = sess_open($code);
	if (!$d) { sess_close($h); fail('not_found', 404); }
	if (($b['game'] ?? '') !== $d['game']) { sess_close($h); out(['ok' => false, 'error' => 'wrong_game', 'game' => $d['game']], 409); }
	if (!$d['open']) { sess_close($h); fail('closed', 403); }
	if (count($d['players']) >= K_MAX_PLAYERS) { sess_close($h); fail('full', 403); }
	$pid = bin2hex(random_bytes(6)); $tok = bin2hex(random_bytes(12)); $params = ($d['game'] . '_params')($d['settings']);
	$d['players'][$pid] = ['name' => $name, 'nim' => $nim, 'tok' => hash('sha256', $tok), 'joined' => time(), 'done' => null, 'params' => $params];
	sess_save($h, $d); sess_close($h);
	out(['ok' => true, 'pid' => $pid, 'token' => $tok, 'title' => $d['title'], 'game' => $d['game'], 'settings' => $d['settings'], 'params' => $params]);
}

case 'submit': {
	$b = body(); $code = strtoupper((string) ($b['code'] ?? '')); $pid = (string) ($b['pid'] ?? ''); $tok = (string) ($b['token'] ?? '');
	if (!code_ok($code) || !preg_match('/^[a-f0-9]{12}$/', $pid) || !is_array($b['payload'] ?? null)) { fail('bad_request'); }
	[$h, $d] = sess_open($code); $p = $d['players'][$pid] ?? null;
	if (!$p || !hash_equals($p['tok'], hash('sha256', $tok))) { sess_close($h); fail('forbidden', 403); }
	if ($p['done'] !== null) { sess_close($h); fail('already_submitted', 409); }
	if (!$d['open']) { sess_close($h); fail('closed', 403); }
	$res = ($d['game'] . '_score')($d['settings'], $p['params'], $b['payload']);
	$p['done'] = time(); $p['secs'] = max(0, $p['done'] - $p['joined']); $p['result'] = $res; $p['score'] = $res['score'];
	$d['players'][$pid] = $p;
	$rank = 1; $n = 0; foreach ($d['players'] as $q) { if ($q['done'] === null) { continue; } $n++; if ($q['score'] > $p['score'] || ($q['score'] === $p['score'] && $q['secs'] < $p['secs'])) { $rank++; } }
	sess_save($h, $d); sess_close($h);
	out(['ok' => true, 'result' => $res, 'rank' => $rank, 'n' => $n]);
}

case 'recap': {
	$uid = host_user(); $code = strtoupper((string) (body()['code'] ?? '')); if (!code_ok($code)) { fail('bad_code'); }
	$d = sess_read(sess_path($code)); if (!$d) { fail('not_found', 404); } if (!can_manage($d, $uid)) { fail('forbidden', 403); }
	$rows = []; $pws = [];
	foreach ($d['players'] as $q) {
		$rows[] = ['name' => $q['name'], 'nim' => $q['nim'], 'joined' => $q['joined'], 'done' => $q['done'], 'secs' => $q['secs'] ?? null, 'score' => $q['score'] ?? null, 'result' => $q['result'] ?? null];
		if ($d['game'] === 'krisis' && isset($q['result']['pw'])) { $pws[] = $q['result']['pw']; }
	}
	usort($rows, function ($a, $b) { if (($a['done'] === null) !== ($b['done'] === null)) { return $a['done'] === null ? 1 : -1; } return [$b['score'] ?? -1, $a['secs'] ?? PHP_INT_MAX, $a['joined']] <=> [$a['score'] ?? -1, $b['secs'] ?? PHP_INT_MAX, $b['joined']]; });
	$extra = [];
	if ($pws) { $g = []; foreach (krisis_pairs() as $k => $_) { $pr = 1.0; foreach ($pws as $pw) { $pr *= krisis_val((int) $pw[$k]); } $g[] = pow($pr, 1 / count($pws)); } $extra['classAhp'] = krisis_ahp($g); }
	out(['ok' => true, 'code' => $d['code'], 'game' => $d['game'], 'title' => $d['title'], 'open' => (bool) $d['open'], 'created' => $d['created'], 'settings' => $d['settings'], 'players' => $rows] + $extra);
}

case 'toggle': {
	$uid = host_user(); $b = body(); $code = strtoupper((string) ($b['code'] ?? '')); if (!code_ok($code)) { fail('bad_code'); }
	[$h, $d] = sess_open($code); if (!$d || !can_manage($d, $uid)) { sess_close($h); fail('forbidden', 403); }
	$d['open'] = (bool) ($b['open'] ?? false); sess_save($h, $d); sess_close($h); out(['ok' => true, 'open' => $d['open']]);
}

case 'remove': {
	$uid = host_user(); $code = strtoupper((string) (body()['code'] ?? '')); if (!code_ok($code)) { fail('bad_code'); }
	[$h, $d] = sess_open($code); if (!$d || !can_manage($d, $uid)) { sess_close($h); fail('forbidden', 403); }
	sess_close($h); @unlink(sess_path($code)); out(['ok' => true]);
}

default: fail('unknown_route', 404);
}
