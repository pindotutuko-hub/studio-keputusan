<?php
/* Studio Keputusan & Analisis Dosen — perantara OpenAlex dengan cache (v3.13: works/authors/institutions)
   Letak: /home/pindotut/public_html/pindotutuko.id/sk-api/openalex.php
   Kunci API: /home/pindotut/sk-config/openalex.php berisi  <?php return 'KUNCI_ANDA';
   (di luar public_html, tidak dapat dibuka dari web). Cache: /home/pindotut/sk-cache/openalex/ */
$KEYFILE = '/home/pindotut/sk-config/openalex.php';
$CACHE   = '/home/pindotut/sk-cache/openalex';
$TTL     = 7 * 86400;      // hasil yang sama disimpan 7 hari
$PER_IP  = 1000;           // batas permintaan baru per alamat IP per hari (hasil cache tidak dihitung; jaringan kampus berbagi satu IP)
$ALLOW_ORIGINS = ['https://pindotutuko.id', 'https://www.pindotutuko.id', 'null'];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $ALLOW_ORIGINS, true)) { header('Access-Control-Allow-Origin: ' . $origin); header('Vary: Origin'); }
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { header('Access-Control-Allow-Methods: GET'); exit; }
function out($code, $arr) { http_response_code($code); echo json_encode($arr, JSON_UNESCAPED_UNICODE); exit; }

if ($origin !== '' && !in_array($origin, $ALLOW_ORIGINS, true)) out(403, ['error' => 'origin']);
$key = is_file($KEYFILE) ? trim((string) (include $KEYFILE)) : '';
if ($key === '' || $key === 'KUNCI_ANDA') out(503, ['error' => 'nokey', 'message' => 'Kunci API OpenAlex belum dipasang di server.']);

/* titik akhir yang diizinkan: works (bawaan), authors, institutions */
$ep = $_GET['ep'] ?? 'works';
if (!in_array($ep, ['works', 'authors', 'institutions'], true)) out(400, ['error' => 'ep']);
/* hanya parameter pencarian yang diizinkan */
$p = [];
if (isset($_GET['per-page']) && !isset($_GET['per_page'])) $_GET['per_page'] = $_GET['per-page'];
foreach (['search', 'filter', 'per_page', 'sort', 'select', 'page'] as $k) {
  if (isset($_GET[$k]) && $_GET[$k] !== '') $p[$k] = substr((string) $_GET[$k], 0, 1500);
}
if (empty($p['search']) && empty($p['filter'])) out(400, ['error' => 'query']);
$p['per_page'] = (string) max(1, min(100, (int) ($p['per_page'] ?? 50)));
if (isset($p['page'])) $p['page'] = (string) max(1, min(5, (int) $p['page']));
ksort($p);
$qs = http_build_query($p);
$h = sha1($ep . '?' . $qs);

if (!is_dir($CACHE)) @mkdir($CACHE, 0750, true);
$cf = $CACHE . '/' . substr($h, 0, 2) . '/' . $h . '.json';
if (is_file($cf) && filemtime($cf) > time() - $TTL) { header('X-SK-Cache: hit'); readfile($cf); exit; }

/* batas harian per IP */
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$day = gmdate('Ymd');
$cntf = $CACHE . '/ip-' . $day . '-' . sha1($ip . '|sk') . '.cnt';
$n = is_file($cntf) ? (int) file_get_contents($cntf) : 0;
if ($n >= $PER_IP) out(429, ['error' => 'perip', 'message' => 'Batas pencarian harian dari jaringan ini tercapai.']);

$ctx = stream_context_create(['http' => ['timeout' => 25, 'ignore_errors' => true, 'header' => "User-Agent: StudioKeputusan/1.0 (pindotutuko.id)\r\n"]]);
$body = @file_get_contents('https://api.openalex.org/' . $ep . '?' . $qs . '&api_key=' . rawurlencode($key), false, $ctx);
$status = 0;
foreach (($http_response_header ?? []) as $hl) if (preg_match('#^HTTP/\S+\s+(\d{3})#', $hl, $m)) $status = (int) $m[1];
if ($body === false || $status === 0) out(502, ['error' => 'upstream']);
if ($status !== 200) { http_response_code($status === 429 || $status === 409 ? 429 : 502); echo json_encode(['error' => 'upstream', 'status' => $status]); exit; }
@file_put_contents($cntf, (string) ($n + 1), LOCK_EX);
@mkdir(dirname($cf), 0750, true);
@file_put_contents($cf, $body, LOCK_EX);
/* bersihkan penghitung IP hari-hari sebelumnya */
if (mt_rand(1, 50) === 1) foreach (glob($CACHE . '/ip-*.cnt') ?: [] as $f) if (strpos($f, '/ip-' . $day . '-') === false) @unlink($f);
header('X-SK-Cache: miss');
echo $body;
