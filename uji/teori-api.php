<?php
/* API kelas Lensa Teori Arsitektur — turunan API Atlas Arsitektur Modern. Dibuat oleh Pindo Tutuko.
   Dipasang di public_html/teori-arsitektur/api/ dan memakai WordPress pindotutuko.id (wp-load.php dua tingkat di atas). */
declare(strict_types=1);

/* Jalur ringan (31-10-2026): rute mahasiswa yang sering dipanggil (heartbeat, kirim jawaban, bootstrap/status
   tanpa login) memuat WordPress versi SHORTINIT agar 100 mahasiswa serentak tidak membebani server. */
$__ptRoute = trim((string)($_GET['route'] ?? ''), '/');
$__ptMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$__ptWpUser = false;
foreach (array_keys($_COOKIE) as $__ptKey) { if (strpos((string)$__ptKey, 'wordpress_logged_in_') === 0) { $__ptWpUser = true; break; } }
$__ptLight = ($__ptMethod === 'POST' && in_array($__ptRoute, ['sessions', 'reports', 'reports/mine'], true))
    || ($__ptMethod === 'GET' && in_array($__ptRoute, ['bootstrap', 'admin/status'], true) && empty($_COOKIE['ta_admin']) && !$__ptWpUser);
if ($__ptLight && !defined('SHORTINIT')) define('SHORTINIT', true);
require_once dirname(__DIR__, 2) . '/wp-load.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');

global $wpdb;

const PA_SCHEMA_VERSION = '1';
const PA_COOKIE = 'ta_admin';
const PA_SESSION_SECONDS = 43200;
const PA_MEETINGS = ['2','3','4','5','6','7','9','10','11','12'];

function pa_reply(int $status, $value): void {
    status_header($status);
    echo wp_json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function pa_input(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}

function pa_table(string $name): string {
    global $wpdb;
    return $wpdb->prefix . 'teori_arsitektur_' . $name;
}

function pa_initial_state(): array {
    return [
        'settings' => [
            'count' => 10,
            'minutes' => 15,
            'sessionMinutes' => 15,
            'scopes' => PA_MEETINGS,
            'type' => 'mixed',
            'quizStatus' => 'closed',
            'sessionId' => 'kelas-awal',
            'sessionLabel' => '',
            'sessionStartedAt' => '',
            'fontScale' => 'normal',
            'theme' => ['ink'=>'#18211f','red'=>'#b3472f','yellow'=>'#d39b3a','paper'=>'#f1ebdf']
        ],
        'content' => [],
        'materials' => []
    ];
}

function pa_schema(): void {
    if (get_option('teori_arsitektur_schema_version') === PA_SCHEMA_VERSION) return;
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    $charset = $wpdb->get_charset_collate();
    dbDelta('CREATE TABLE ' . pa_table('admin') . " (
        id tinyint unsigned NOT NULL DEFAULT 1,
        username varchar(80) NOT NULL,
        password_hash varchar(255) NOT NULL,
        created_at datetime NOT NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY username (username)
    ) $charset;");
    dbDelta('CREATE TABLE ' . pa_table('reports') . " (
        report_id varchar(191) NOT NULL,
        payload longtext NOT NULL,
        created_at datetime NOT NULL,
        updated_at datetime NOT NULL,
        PRIMARY KEY  (report_id),
        KEY updated_at (updated_at)
    ) $charset;");
    dbDelta('CREATE TABLE ' . pa_table('sessions') . " (
        nim varchar(100) NOT NULL,
        payload longtext NOT NULL,
        last_seen datetime NOT NULL,
        PRIMARY KEY  (nim),
        KEY last_seen (last_seen)
    ) $charset;");
    if (get_option('teori_arsitektur_state', null) === null) add_option('teori_arsitektur_state', pa_initial_state(), '', false);
    update_option('teori_arsitektur_schema_version', PA_SCHEMA_VERSION, false);
}

function pa_admin_record(): ?array {
    global $wpdb;
    $row = $wpdb->get_row('SELECT * FROM ' . pa_table('admin') . ' WHERE id=1', ARRAY_A);
    return is_array($row) ? $row : null;
}

function pa_cookie_path(): string {
    $script = str_replace('\\', '/', dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/teori-arsitektur/api/index.php')));
    return rtrim($script, '/') . '/';
}

function pa_set_cookie(string $value, int $expires): void {
    setcookie(PA_COOKIE, $value, [
        'expires' => $expires,
        'path' => pa_cookie_path(),
        'secure' => is_ssl(),
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
}

function pa_session_user(): string {
    $token = sanitize_text_field(wp_unslash($_COOKIE[PA_COOKIE] ?? ''));
    if (!$token || strlen($token) < 32) return '';
    $user = get_transient('teori_arsitektur_session_' . hash('sha256', $token));
    return is_string($user) ? $user : '';
}

function pa_create_session(string $username): void {
    $token = bin2hex(random_bytes(32));
    set_transient('teori_arsitektur_session_' . hash('sha256', $token), $username, PA_SESSION_SECONDS);
    pa_set_cookie($token, time() + PA_SESSION_SECONDS);
}

function pa_clear_session(): void {
    $token = sanitize_text_field(wp_unslash($_COOKIE[PA_COOKIE] ?? ''));
    if ($token) delete_transient('teori_arsitektur_session_' . hash('sha256', $token));
    pa_set_cookie('', time() - 3600);
}

function pa_require_admin(): string {
    $username = pa_session_user();
    if (!$username) pa_reply(401, ['error'=>'Silakan login sebagai dosen/admin.']);
    return $username;
}

function pa_state(): array {
    $initial = pa_initial_state();
    $state = get_option('teori_arsitektur_state', $initial);
    if (!is_array($state)) $state = $initial;
    $saved = is_array($state['settings'] ?? null) ? $state['settings'] : [];
    $settings = array_replace($initial['settings'], $saved);
    $settings['theme'] = array_replace($initial['settings']['theme'], is_array($saved['theme'] ?? null) ? $saved['theme'] : []);
    $settings['scopes'] = array_values(is_array($saved['scopes'] ?? null) && $saved['scopes'] ? $saved['scopes'] : $initial['settings']['scopes']);
    $state['settings'] = $settings;
    $state['content'] = array_values(is_array($state['content'] ?? null) ? $state['content'] : []);
    $state['materials'] = array_values(is_array($state['materials'] ?? null) ? $state['materials'] : []);
    return $state;
}

function pa_save_state(array $state): void {
    update_option('teori_arsitektur_state', $state, false);
}

function pa_reports(): array {
    global $wpdb;
    $rows = $wpdb->get_col('SELECT payload FROM ' . pa_table('reports') . ' ORDER BY updated_at DESC');
    return array_values(array_filter(array_map(function ($raw) {
        return json_decode((string)$raw, true);
    }, $rows), 'is_array'));
}

function pa_sessions(): array {
    global $wpdb;
    $wpdb->query($wpdb->prepare('DELETE FROM ' . pa_table('sessions') . ' WHERE last_seen < %s', gmdate('Y-m-d H:i:s', time() - DAY_IN_SECONDS)));
    $rows = $wpdb->get_col('SELECT payload FROM ' . pa_table('sessions') . ' ORDER BY last_seen DESC');
    return array_values(array_filter(array_map(function ($raw) {
        return json_decode((string)$raw, true);
    }, $rows), 'is_array'));
}

function pa_clean_string($value, int $limit=160): string {
    return mb_substr(trim(wp_strip_all_tags((string)$value)), 0, $limit);
}

function pa_file_name(string $name): string {
    return time() . '-' . preg_replace('/[^a-z0-9._-]/i', '-', basename($name));
}

function pa_upload_dir(): string {
    $dir = dirname(__DIR__) . '/uploads';
    if (!is_dir($dir)) wp_mkdir_p($dir);
    return $dir;
}

function pa_public_file_url(string $name): string {
    $base = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/teori-arsitektur/api/index.php')), '/');
    return $base . '/uploads/' . rawurlencode($name);
}

/* Akun dosen bawaan: admin (hash kata sandi saja; ganti kata sandi di Ruang dosen setelah masuk). */
const PA_DEFAULT_ADMIN = 'admin';
const PA_DEFAULT_HASH = '$2y$10$L1onDflptzopV3qHvmnmzuAvpTwkeulEGPbnTrvwmsLNPJCCBsAw2';
function pa_seed_admin(): void {
    if (pa_admin_record()) return;
    global $wpdb;
    $wpdb->insert(pa_table('admin'), ['id'=>1,'username'=>PA_DEFAULT_ADMIN,'password_hash'=>PA_DEFAULT_HASH,'created_at'=>current_time('mysql', true)], ['%d','%s','%s','%s']);
}

pa_schema();
pa_seed_admin();

$route = trim((string)($_GET['route'] ?? ''), '/');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
if ($method === 'OPTIONS') pa_reply(204, ['ok'=>true]);

if ($route === 'admin/status' && $method === 'GET') {
    $admin = pa_admin_record();
    $username = pa_session_user();
    $canSetup = !$admin && (function_exists('current_user_can') && current_user_can('manage_options'));
    pa_reply(200, [
        'available'=>true,
        'authenticated'=>(bool)$username,
        'username'=>$username,
        'needsSetup'=>$canSetup,
        'isHost'=>(function_exists('current_user_can') && current_user_can('manage_options')),
        'setupProtected'=>true,
        'backend'=>'php-mysql'
    ]);
}

if ($route === 'admin/setup' && $method === 'POST') {
    if (!(function_exists('current_user_can') && current_user_can('manage_options'))) pa_reply(403, ['error'=>'Aktivasi pertama hanya dapat dilakukan oleh administrator pindotutuko.id yang sedang login.']);
    if (pa_admin_record()) pa_reply(409, ['error'=>'Akun admin sudah dibuat.']);
    $data = pa_input();
    $username = pa_clean_string($data['username'] ?? '', 80);
    $password = (string)($data['password'] ?? '');
    if (mb_strlen($username) < 3) pa_reply(400, ['error'=>'Nama pengguna minimal 3 karakter.']);
    if (strlen($password) < 10) pa_reply(400, ['error'=>'Kata sandi minimal 10 karakter.']);
    global $wpdb;
    $ok = $wpdb->insert(pa_table('admin'), [
        'id'=>1,
        'username'=>$username,
        'password_hash'=>password_hash($password, PASSWORD_DEFAULT),
        'created_at'=>current_time('mysql', true)
    ], ['%d','%s','%s','%s']);
    if (!$ok) pa_reply(500, ['error'=>'Akun admin tidak dapat disimpan.']);
    pa_create_session($username);
    pa_reply(201, ['ok'=>true,'username'=>$username]);
}

if ($route === 'admin/password' && $method === 'POST') {
    $user = pa_require_admin();
    $data = pa_input();
    $admin = pa_admin_record();
    $current = (string)($data['current'] ?? '');
    $next = (string)($data['password'] ?? '');
    $newUser = pa_clean_string($data['username'] ?? $user, 80);
    if (!$admin || !password_verify($current, (string)$admin['password_hash'])) pa_reply(403, ['error'=>'Kata sandi saat ini tidak sesuai.']);
    if (mb_strlen($newUser) < 3) pa_reply(400, ['error'=>'Nama pengguna minimal 3 karakter.']);
    if (strlen($next) < 8) pa_reply(400, ['error'=>'Kata sandi baru minimal 8 karakter.']);
    global $wpdb;
    $wpdb->update(pa_table('admin'), ['username'=>$newUser,'password_hash'=>password_hash($next, PASSWORD_DEFAULT)], ['id'=>1], ['%s','%s'], ['%d']);
    pa_create_session($newUser);
    pa_reply(200, ['ok'=>true,'username'=>$newUser]);
}

if ($route === 'admin/login' && $method === 'POST') {
    $ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $attemptKey = 'pa_login_' . substr(hash('sha256', $ip), 0, 32);
    $attempt = get_transient($attemptKey);
    if (!is_array($attempt)) $attempt = ['count'=>0,'blockedUntil'=>0];
    if ((int)$attempt['blockedUntil'] > time()) pa_reply(429, ['error'=>'Terlalu banyak percobaan. Coba lagi beberapa menit.']);
    $data = pa_input();
    $admin = pa_admin_record();
    $username = pa_clean_string($data['username'] ?? '', 80);
    $password = (string)($data['password'] ?? '');
    $valid = $admin && hash_equals((string)$admin['username'], $username) && password_verify($password, (string)$admin['password_hash']);
    if (!$valid) {
        $attempt['count'] = (int)$attempt['count'] + 1;
        if ($attempt['count'] >= 5) $attempt['blockedUntil'] = time() + 300;
        set_transient($attemptKey, $attempt, 300);
        pa_reply(401, ['error'=>'Nama pengguna atau kata sandi tidak sesuai.']);
    }
    delete_transient($attemptKey);
    pa_create_session($username);
    pa_reply(200, ['ok'=>true,'username'=>$username]);
}

if ($route === 'admin/logout' && $method === 'POST') {
    pa_clear_session();
    pa_reply(200, ['ok'=>true]);
}

if ($route === 'bootstrap' && $method === 'GET') {
    $state = pa_state();
    $username = pa_session_user();
    if ($username) {
        $state['reports'] = pa_reports();
        $state['sessions'] = pa_sessions();
        $state['isAdmin'] = true;
        $state['adminUser'] = $username;
    } else {
        $state['reports'] = [];
        $state['sessions'] = [];
        $state['isAdmin'] = false;
    }
    pa_reply(200, $state);
}

if ($route === 'network' && $method === 'GET') {
    pa_require_admin();
    $scheme = is_ssl() ? 'https' : 'http';
    $base = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/teori-arsitektur/api/index.php')), '/');
    pa_reply(200, ['port'=>443,'addresses'=>[],'publicUrl'=>$scheme . '://' . ($_SERVER['HTTP_HOST'] ?? 'pindotutuko.id') . $base . '/']);
}

if ($route === 'reports' && $method === 'POST') {
    $report = pa_input();
    $id = pa_clean_string($report['id'] ?? '', 191);
    if (!$id) pa_reply(400, ['error'=>'Identitas laporan tidak valid.']);
    global $wpdb;
    $now = current_time('mysql', true);
    $exists = $wpdb->get_var($wpdb->prepare('SELECT report_id FROM ' . pa_table('reports') . ' WHERE report_id=%s', $id));
    $report['name'] = mb_strtoupper(pa_clean_string($report['name'] ?? '', 100));
    $report['nim'] = pa_clean_string($report['nim'] ?? '', 100);
    $payload = wp_json_encode($report, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($exists) $wpdb->update(pa_table('reports'), ['payload'=>$payload,'updated_at'=>$now], ['report_id'=>$id], ['%s','%s'], ['%s']);
    else $wpdb->insert(pa_table('reports'), ['report_id'=>$id,'payload'=>$payload,'created_at'=>$now,'updated_at'=>$now], ['%s','%s','%s','%s']);
    pa_reply(201, ['ok'=>true,'count'=>(int)$wpdb->get_var('SELECT COUNT(*) FROM ' . pa_table('reports')),'reportId'=>$id]);
}

if ($route === 'reports/mine' && $method === 'POST') {
    $data = pa_input();
    $nim = pa_clean_string($data['nim'] ?? '', 100);
    $name = mb_strtoupper(pa_clean_string($data['name'] ?? '', 100));
    $sessionId = pa_clean_string($data['sessionId'] ?? '', 80);
    if (!$nim || !$sessionId) pa_reply(400, ['error'=>'NIM dan sesi diperlukan.']);
    global $wpdb;
    $raw = $wpdb->get_var($wpdb->prepare('SELECT payload FROM ' . pa_table('reports') . ' WHERE report_id=%s', $sessionId . ':' . $nim));
    $report = json_decode((string)$raw, true);
    if (!is_array($report) || mb_strtoupper((string)($report['name'] ?? '')) !== $name) pa_reply(404, ['error'=>'Hasil belum ditemukan di server.']);
    pa_reply(200, ['report'=>$report]);
}

if (strpos($route, 'reports/') === 0 && $method === 'PATCH') {
    $adminUser = pa_require_admin();
    $id = rawurldecode(substr($route, strlen('reports/')));
    global $wpdb;
    $raw = $wpdb->get_var($wpdb->prepare('SELECT payload FROM ' . pa_table('reports') . ' WHERE report_id=%s', $id));
    $report = json_decode((string)$raw, true);
    if (!is_array($report)) pa_reply(404, ['error'=>'Laporan tidak ditemukan.']);
    $grades = pa_input()['essayGrades'] ?? [];
    $scale = [0,15,50,75,100];
    if (!is_array($grades) || !$grades) pa_reply(400, ['error'=>'Pilih nilai untuk jawaban esai.']);
    foreach ($grades as $grade) {
        $index = (int)($grade['index'] ?? -1);
        $score = (int)($grade['score'] ?? -1);
        if (!isset($report['answers'][$index]) || ($report['answers'][$index]['type'] ?? '') !== 'essay' || !in_array($score, $scale, true)) pa_reply(400, ['error'=>'Nilai esai harus dipilih dari skala 0, 15, 50, 75, atau 100.']);
        $weight = (float)($report['answers'][$index]['weight'] ?? $report['questionWeight'] ?? 0);
        $report['answers'][$index]['essayScore'] = $score;
        $report['answers'][$index]['feedback'] = pa_clean_string($grade['feedback'] ?? '', 1000);
        $report['answers'][$index]['pointsEarned'] = round($weight * $score / 100, 2);
    }
    $essays = array_values(array_filter($report['answers'] ?? [], function ($a) {
        return ($a['type'] ?? '') === 'essay';
    }));
    $complete = (bool)$essays;
    foreach ($essays as $answer) if (!in_array((int)($answer['essayScore'] ?? -1), $scale, true)) $complete = false;
    $report['needsReview'] = !$complete;
    if ($complete) {
        $report['score'] = max(0, min(100, (int)round(array_sum(array_map(function ($a) {
            return (float)($a['pointsEarned'] ?? 0);
        }, $report['answers'] ?? [])))));
        $report['gradedAt'] = gmdate('c');
        $report['gradedBy'] = $adminUser;
    }
    $wpdb->update(pa_table('reports'), ['payload'=>wp_json_encode($report, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),'updated_at'=>current_time('mysql', true)], ['report_id'=>$id], ['%s','%s'], ['%s']);
    pa_reply(200, ['ok'=>true,'report'=>$report]);
}

if ($route === 'settings' && $method === 'POST') {
    pa_require_admin();
    $state = pa_state();
    $next = pa_input();
    $settings = $state['settings'];
    $types = ['mixed','mc','tf','essay'];
    $statuses = ['open','closed','ended'];
    $fontScales = ['small','normal','large','xlarge'];
    $scopes = array_values(array_intersect(array_map('strval', is_array($next['scopes'] ?? null) ? $next['scopes'] : []), PA_MEETINGS));
    $minutes = max(1, min(180, (int)($next['minutes'] ?? 15)));
    $theme = $settings['theme'];
    foreach (['ink','red','yellow','paper'] as $key) if (preg_match('/^#[0-9a-f]{6}$/i', (string)($next['theme'][$key] ?? ''))) $theme[$key] = $next['theme'][$key];
    $settings = [
        'count'=>max(1, min(100, (int)($next['count'] ?? 10))),
        'minutes'=>$minutes,
        'sessionMinutes'=>max(1, min(180, (int)($next['sessionMinutes'] ?? $minutes))),
        'scopes'=>$scopes ?: PA_MEETINGS,
        'type'=>in_array($next['type'] ?? '', $types, true) ? $next['type'] : 'mixed',
        'quizStatus'=>in_array($next['quizStatus'] ?? '', $statuses, true) ? $next['quizStatus'] : 'closed',
        'sessionId'=>pa_clean_string($next['sessionId'] ?? $settings['sessionId'], 80),
        'sessionLabel'=>pa_clean_string($next['sessionLabel'] ?? '', 160),
        'sessionStartedAt'=>pa_clean_string($next['sessionStartedAt'] ?? '', 40),
        'fontScale'=>in_array($next['fontScale'] ?? '', $fontScales, true) ? $next['fontScale'] : 'normal',
        'theme'=>$theme
    ];
    $state['settings'] = $settings;
    pa_save_state($state);
    pa_reply(200, $settings);
}

if ($route === 'sessions' && $method === 'POST') {
    $data = pa_input();
    $session = [
        'name'=>mb_strtoupper(pa_clean_string($data['name'] ?? '', 100)),
        'nim'=>pa_clean_string($data['nim'] ?? '', 100),
        'page'=>pa_clean_string($data['page'] ?? 'Aplikasi', 80),
        'lastSeen'=>gmdate('c')
    ];
    if ($session['name'] && $session['nim']) {
        global $wpdb;
        $payload = wp_json_encode($session, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $now = current_time('mysql', true);
        $wpdb->query($wpdb->prepare('INSERT INTO ' . pa_table('sessions') . ' (nim,payload,last_seen) VALUES (%s,%s,%s) ON DUPLICATE KEY UPDATE payload=VALUES(payload),last_seen=VALUES(last_seen)', $session['nim'], $payload, $now));
    }
    pa_reply(200, $session);
}

if ($route === 'content' && $method === 'POST') {
    pa_require_admin();
    $data = pa_input();
    $state = pa_state();
    $record = [
        'id'=>pa_clean_string($data['id'] ?? (string)round(microtime(true)*1000), 80),
        'title'=>pa_clean_string($data['title'] ?? 'Materi baru', 160),
        'type'=>in_array($data['type'] ?? '', ['Materi','Video','Gambar','Referensi'], true) ? $data['type'] : 'Materi',
        'url'=>esc_url_raw((string)($data['url'] ?? '')),
        'createdAt'=>pa_clean_string($data['createdAt'] ?? gmdate('c'), 40)
    ];
    if (!empty($data['fileData']) && !empty($data['fileName'])) {
        if (!preg_match('#^data:([^;]+);base64,(.+)$#s', (string)$data['fileData'], $match) || strlen($match[2]) > 28000000) pa_reply(413, ['error'=>'File terlalu besar atau tidak valid.']);
        $allowed = ['jpg','jpeg','png','webp','gif','mp4','pdf','doc','docx','ppt','pptx'];
        $ext = strtolower(pathinfo((string)$data['fileName'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed, true)) pa_reply(415, ['error'=>'Jenis file belum didukung.']);
        $name = pa_file_name((string)$data['fileName']);
        if (file_put_contents(pa_upload_dir() . '/' . $name, base64_decode($match[2], true)) === false) pa_reply(500, ['error'=>'File tidak dapat disimpan.']);
        $record['url'] = pa_public_file_url($name);
    }
    if (!$record['url']) pa_reply(400, ['error'=>'Tautan atau file diperlukan.']);
    $state['content'][] = $record;
    pa_save_state($state);
    pa_reply(201, $record);
}

if ($route === 'import-presentation' && $method === 'POST') {
    pa_require_admin();
    $data = pa_input();
    if (!class_exists('ZipArchive')) pa_reply(501, ['error'=>'Ekstensi ZIP server belum tersedia.']);
    if (!preg_match('#^data:([^;]+);base64,(.+)$#s', (string)($data['fileData'] ?? ''), $match) || strlen($match[2]) > 42000000) pa_reply(413, ['error'=>'Berkas terlalu besar atau tidak valid.']);
    $fileName = basename((string)($data['fileName'] ?? ''));
    if (strtolower(pathinfo($fileName, PATHINFO_EXTENSION)) !== 'pptx') pa_reply(415, ['error'=>'Gunakan berkas .pptx.']);
    $stored = pa_file_name($fileName);
    $path = pa_upload_dir() . '/' . $stored;
    $bytes = base64_decode($match[2], true);
    if ($bytes === false || file_put_contents($path, $bytes) === false) pa_reply(500, ['error'=>'Presentasi tidak dapat disimpan.']);
    $zip = new ZipArchive();
    if ($zip->open($path) !== true) pa_reply(422, ['error'=>'Isi PPTX tidak dapat dibaca.']);
    $slides = [];
    for ($i=1; $i<=500; $i++) {
        $xml = $zip->getFromName("ppt/slides/slide{$i}.xml");
        if ($xml === false) { if ($i === 1) continue; break; }
        preg_match_all('/<a:t>([\s\S]*?)<\/a:t>/', $xml, $matches);
        $texts = array_values(array_filter(array_map(function ($v) {
            return pa_clean_string(html_entity_decode($v, ENT_QUOTES | ENT_XML1, 'UTF-8'), 900);
        }, $matches[1] ?? [])));
        $slides[] = ['number'=>$i,'title'=>$texts[0] ?? "Slide {$i}",'summary'=>implode(' · ', array_slice($texts,1)) ?: 'Slide visual—buka berkas sumber untuk ilustrasi lengkap.','points'=>array_slice($texts,1,6)];
    }
    $zip->close();
    if (!$slides) pa_reply(422, ['error'=>'Tidak ada slide yang dapat dibaca.']);
    $state = pa_state();
    $title = pa_clean_string($data['title'] ?? $slides[0]['title'] ?? pathinfo($fileName, PATHINFO_FILENAME), 180);
    $version = 1;
    foreach ($state['materials'] as $item) if (strcasecmp((string)($item['title'] ?? ''), $title) === 0) $version++;
    $material = ['id'=>'ppt-' . round(microtime(true)*1000),'title'=>$title,'version'=>$version,'meeting'=>in_array((string)($data['meeting'] ?? ''), PA_MEETINGS, true) ? (string)$data['meeting'] : '1','meetingLabel'=>pa_clean_string($data['meetingLabel'] ?? '', 180),'sourceFile'=>$fileName,'url'=>pa_public_file_url($stored),'createdAt'=>gmdate('c'),'slideCount'=>count($slides),'slides'=>$slides];
    array_unshift($state['materials'], $material);
    pa_save_state($state);
    pa_reply(201, $material);
}

pa_reply(404, ['error'=>'Endpoint tidak ditemukan.']);
