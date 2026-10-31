/* Penilaian ulang di server (31-10-2026): skor dihitung dari kunci jawaban server, bukan dari angka kiriman peramban. */
function pa_server_score(array $report, array $settings): array {
    static $key = null;
    if ($key === null) { $f = __DIR__ . '/kunci.php'; $key = is_file($f) ? (include $f) : []; if (!is_array($key)) $key = []; }
    if (!$key || !is_array($report['answers'] ?? null)) return $report;
    $current = (string)($report['sessionId'] ?? '') === (string)($settings['sessionId'] ?? '');
    $seen = []; $answers = []; $essays = 0;
    foreach ($report['answers'] as $a) {
        if (!is_array($a)) continue;
        $qid = (string)($a['qid'] ?? '');
        if ($qid === '' || isset($seen[$qid]) || !isset($key[$qid])) continue;
        $seen[$qid] = true; $k = $key[$qid];
        if (($k['t'] ?? '') === 'essay') { $essays++; $a['type'] = 'essay'; $a['essayScore'] = null; $a['pointsEarned'] = 0; }
        else { $a['type'] = (string)$k['t']; $a['correctAnswer'] = (string)$k['a']; $a['correct'] = (string)($a['chosen'] ?? '') === (string)$k['a']; }
        $answers[] = $a;
    }
    $n = count($answers);
    if ($current) {
        $scopes = array_map('strval', (array)($settings['scopes'] ?? []));
        $type = (string)($settings['type'] ?? 'mixed'); $pool = 0;
        foreach ($key as $k) if (in_array((string)$k['m'], $scopes, true) && ($type === 'mixed' || $k['t'] === $type)) $pool++;
        $n = max($n, min((int)($settings['count'] ?? $n), $pool));
    }
    $n = max(1, $n); $w = round(100 / $n, 2); $correct = 0;
    foreach ($answers as &$a) { $a['weight'] = $w; if (($a['type'] ?? '') !== 'essay') { if (!empty($a['correct'])) $correct++; $a['pointsEarned'] = !empty($a['correct']) ? $w : 0; } }
    unset($a);
    $report['answers'] = $answers; $report['total'] = $n; $report['correct'] = $correct; $report['questionWeight'] = $w;
    $report['needsReview'] = $essays > 0; $report['score'] = $essays ? null : max(0, min(100, (int)round($correct * $w)));
    $report['status'] = $essays ? 'Menunggu penilaian esai' : ($report['status'] ?? 'Selesai');
    $report['scoredBy'] = 'server';
    return $report;
}
