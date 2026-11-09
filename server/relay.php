<?php
/* Analisis Dosen — perantara halaman publik (pengganti proxy CORS publik yang kini tertutup)
   Letak: /home/pindotut/public_html/pindotutuko.id/sk-api/relay.php
   Hanya mengambil halaman HTML/JSON publik dari daftar host di bawah, dengan cache dan batas per IP.
   Cache: /home/pindotut/sk-cache/relay/ */
$CACHE  = '/home/pindotut/sk-cache/relay';
$TTL    = 3 * 86400;   // 3 hari
$PER_IP = 200;         // permintaan baru per IP per hari
$MAXB   = 3000000;     // batas ukuran respons (byte)
$ALLOW_ORIGINS = ['https://pindotutuko.id', 'https://www.pindotutuko.id', 'null'];
$HOSTS = [
  'sinta.kemdiktisaintek.go.id' => '#^/(authors|affiliations|journals)#',
  'sinta.kemdikbud.go.id'       => '#^/(authors|affiliations|journals)#',
  'scholar.google.com'          => '#^/citations#',
  'html.duckduckgo.com'         => '#^/html#',
  'lite.duckduckgo.com'         => '#^/lite#',
  'www.bing.com'                => '#^/(search|images/search)#',
  'garuda.kemdiktisaintek.go.id'=> '#^/(author|documents)#',
  'pddikti.rone.dev'            => '#^/api/#',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $ALLOW_ORIGINS, true)) { header('Access-Control-Allow-Origin: ' . $origin); header('Vary: Origin'); }
header('X-Content-Type-Options: nosniff');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { header('Access-Control-Allow-Methods: GET'); exit; }
function out($code, $msg) { http_response_code($code); header('Content-Type: text/plain; charset=utf-8'); echo $msg; exit; }
if ($origin !== '' && !in_array($origin, $ALLOW_ORIGINS, true)) out(403, 'origin');

$u = (string) ($_GET['u'] ?? '');
$pu = parse_url($u);
if (!$pu || ($pu['scheme'] ?? '') !== 'https' || empty($pu['host'])) out(400, 'url');
$host = strtolower($pu['host']);
if (!isset($HOSTS[$host]) || !preg_match($HOSTS[$host], $pu['path'] ?? '/')) out(403, 'host');
if (strlen($u) > 2000) out(400, 'url');

if (!is_dir($CACHE)) @mkdir($CACHE, 0750, true);
$h = sha1($u);
$cf = $CACHE . '/' . substr($h, 0, 2) . '/' . $h;
if (is_file($cf . '.body') && filemtime($cf . '.body') > time() - $TTL) {
  header('Content-Type: ' . (@file_get_contents($cf . '.ct') ?: 'text/html; charset=utf-8'));
  header('X-SK-Cache: hit'); readfile($cf . '.body'); exit;
}

$ip = $_SERVER['REMOTE_ADDR'] ?? '0'; $day = gmdate('Ymd');
$cntf = $CACHE . '/ip-' . $day . '-' . sha1($ip . '|rl') . '.cnt';
$n = is_file($cntf) ? (int) file_get_contents($cntf) : 0;
if ($n >= $PER_IP) out(429, 'batas harian tercapai');

$ctx = stream_context_create(['http' => ['timeout' => 20, 'ignore_errors' => true, 'follow_location' => 1, 'max_redirects' => 3,
  'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36\r\nAccept-Language: id-ID,id;q=0.9,en;q=0.8\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\nUpgrade-Insecure-Requests: 1\r\n"]]);
$body = @file_get_contents($u, false, $ctx, 0, $MAXB);
$status = 0; $ct = 'text/html; charset=utf-8';
foreach (($http_response_header ?? []) as $hl) {
  if (preg_match('#^HTTP/\S+\s+(\d{3})#', $hl, $m)) $status = (int) $m[1];
  if (stripos($hl, 'Content-Type:') === 0) $ct = trim(substr($hl, 13));
}
if ($body === false || $status === 0) out(502, 'upstream');
if (!preg_match('#^(text/|application/(json|xhtml))#i', $ct)) out(415, 'jenis konten');
@file_put_contents($cntf, (string) ($n + 1), LOCK_EX);
if ($status === 200 && strlen($body) > 300) { @mkdir(dirname($cf), 0750, true); @file_put_contents($cf . '.body', $body, LOCK_EX); @file_put_contents($cf . '.ct', $ct, LOCK_EX); }
if (mt_rand(1, 50) === 1) foreach (glob($CACHE . '/ip-*.cnt') ?: [] as $f) if (strpos($f, '/ip-' . $day . '-') === false) @unlink($f);
http_response_code($status === 200 ? 200 : 502);
header('Content-Type: ' . $ct); header('X-SK-Cache: miss');
echo $body;
