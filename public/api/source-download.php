<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

header('Content-Type: application/json');
require_source_token();

$zipPath = dirname(__DIR__) . '/downloads/techlink-source.zip';

if (!is_file($zipPath)) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Source package not found on server']);
    exit;
}

$size = filesize($zipPath);
if ($size === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Unable to read source package']);
    exit;
}

// Switch to binary download headers (clear JSON content-type)
header_remove('Content-Type');
header('Content-Type: application/zip');
header('Content-Length: ' . $size);
header('Content-Disposition: attachment; filename="techlink-source.zip"');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$fp = fopen($zipPath, 'rb');
if ($fp === false) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Unable to open source package']);
    exit;
}

fpassthru($fp);
fclose($fp);
exit;
