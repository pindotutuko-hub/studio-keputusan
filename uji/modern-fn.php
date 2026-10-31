/* Penilaian ulang di server (31-10-2026): skor dihitung dari kunci jawaban server, bukan dari angka kiriman peramban. */
function atlas_server_score(array $report, array $settings): array {
    static $key = null;
    if ($key === null) { $f = __DIR__ . '/kunci.php'; $key = is_file($f) ? (include $f) : []; if (!is_array($key)) $key = []; }
    if (!$key || !is_array($report['answers'] ?? null)) return $report;
    $current = (string)($report['sessionId'] ?? '') === (string)($settings['sessionId'] ?? '');
    $seen = []; $answers = []; $essays = 0;
    foreach ($report['answers'] as $a) {
        if (!is_array($a)) continue;
        $k = (string)($a['question'] ?? '') . '|' . (string)($a['image'] ?? '');
        if (!isset($key[$k])) continue;
        $list = $key[$k]; $seen[$k] = ($seen[$k] ?? 0) + 1; if ($seen[$k] > count($list)) continue; $isEssay = ($list[0]['t'] ?? '') === 'essay';
        if ($isEssay) { $essays++; $a['type'] = 'essay'; $a['isCorrect'] = null; $a['pointsEarned'] = null; }
        else { $ok = false; foreach ($list as $e) if ((string)($a['selected'] ?? '') === (string)$e['a']) $ok = true; $a['isCorrect'] = $ok; $a['type'] = (string)$list[0]['t']; }
        $answers[] = $a;
    }
    $n = count($answers);
    if ($current) {
        $scopes = array_map('strval', (array)($settings['scopes'] ?? []));
        $type = (string)($settings['type'] ?? 'mixed'); $pool = 0;
        foreach ($key as $list) foreach ($list as $e) if (in_array((string)$e['m'], $scopes, true) && ($type === 'mixed' || $e['t'] === $type)) $pool++;
        $n = max($n, min((int)($settings['count'] ?? $n), $pool));
    }
    $n = max(1, $n); $w = round(100 / $n, 2); $correct = 0;
    foreach ($answers as &$a) { $a['weight'] = $w; if (($a['type'] ?? '') !== 'essay') { if (!empty($a['isCorrect'])) $correct++; $a['pointsEarned'] = !empty($a['isCorrect']) ? $w : 0; } }
    unset($a);
    $report['answers'] = $answers; $report['total'] = $n; $report['correct'] = $correct; $report['questionWeight'] = $w;
    $report['needsReview'] = $essays > 0; $report['score'] = $essays ? null : max(0, min(100, (int)round($correct * 100 / $n)));
    $report['scoredBy'] = 'server';
    return $report;
}
