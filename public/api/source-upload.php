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

require_source_token();

if (!isset($_FILES['package']) || !is_array($_FILES['package'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing file field "package"']);
    exit;
}

$file = $_FILES['package'];

if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Upload error code ' . ($file['error'] ?? 'unknown')]);
    exit;
}

$size = (int) ($file['size'] ?? 0);
if ($size <= 0 || $size > SOURCE_MAX_UPLOAD_BYTES) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'File too large or empty (max ' . (int) (SOURCE_MAX_UPLOAD_BYTES / (1024 * 1024)) . ' MB)',
    ]);
    exit;
}

$tmp = $file['tmp_name'] ?? '';
if ($tmp === '' || !is_uploaded_file($tmp)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid upload']);
    exit;
}

$originalName = (string) ($file['name'] ?? 'upload.zip');
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if ($ext !== 'zip') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Only .zip packages are accepted']);
    exit;
}

$mime = mime_content_type($tmp);
$allowedMimes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream',
    'multipart/x-zip',
];
if ($mime !== false && !in_array($mime, $allowedMimes, true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => "Invalid file type ($mime)"]);
    exit;
}

if (!class_exists('ZipArchive')) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'ZipArchive extension not available on server']);
    exit;
}

$zip = new ZipArchive();
$opened = $zip->open($tmp, ZipArchive::RDONLY);
if ($opened !== true) {
    // Some PHP builds lack RDONLY; fall back
    $opened = $zip->open($tmp);
}
if ($opened !== true) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unable to open ZIP archive']);
    exit;
}

$entryCount = $zip->numFiles;
if ($entryCount <= 0 || $entryCount > SOURCE_MAX_ZIP_ENTRIES) {
    $zip->close();
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'ZIP has too many or zero entries']);
    exit;
}

$allowed = array_fill_keys(SOURCE_ALLOWED_EXTENSIONS, true);
$totalUncompressed = 0;

for ($i = 0; $i < $entryCount; $i++) {
    $stat = $zip->statIndex($i);
    if ($stat === false) {
        $zip->close();
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Corrupt ZIP entry metadata']);
        exit;
    }

    $name = str_replace('\\', '/', (string) ($stat['name'] ?? ''));
    if ($name === '' || str_starts_with($name, '/') || preg_match('#(^|/)\.\.(/|$)#', $name)) {
        $zip->close();
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'ZIP contains unsafe paths']);
        exit;
    }

    // Directory entries are fine
    if (str_ends_with($name, '/')) {
        continue;
    }

    $uncompressed = (int) ($stat['size'] ?? 0);
    $totalUncompressed += $uncompressed;
    if ($totalUncompressed > SOURCE_MAX_UNCOMPRESSED_BYTES) {
        $zip->close();
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'ZIP uncompressed size exceeds limit']);
        exit;
    }

    $base = basename($name);
    // Dotfiles / extensionless config names mapped via allowlist special-cases
    if ($base === '.htaccess' || $base === '.gitignore' || $base === '.dockerignore'
        || $base === '.editorconfig' || $base === '.npmrc' || $base === '.nvmrc'
        || $base === '.env' || $base === '.env.example') {
        continue;
    }

    // Nested archives not allowed
    $fileExt = strtolower(pathinfo($base, PATHINFO_EXTENSION));
    if ($fileExt === 'zip' || $fileExt === '7z' || $fileExt === 'rar' || $fileExt === 'tar' || $fileExt === 'gz') {
        $zip->close();
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => "Nested archives are not allowed ($base)"]);
        exit;
    }

    if ($fileExt === '' || !isset($allowed[$fileExt])) {
        // Allow common no-extension filenames
        $lower = strtolower($base);
        $nameAllow = ['dockerfile', 'makefile', 'license', 'licence', 'readme', 'changelog', 'procfile'];
        if (!in_array($lower, $nameAllow, true)) {
            $zip->close();
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => "Disallowed file type in package: $base"]);
            exit;
        }
    }
}

$zip->close();

$inbox = dirname(__DIR__) . '/storage/source-uploads';
if (!is_dir($inbox) && !mkdir($inbox, 0750, true) && !is_dir($inbox)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Unable to create upload inbox']);
    exit;
}

$safeStamp = gmdate('Ymd-His');
$rand = bin2hex(random_bytes(4));
$destName = "source-{$safeStamp}-{$rand}.zip";
$destPath = $inbox . DIRECTORY_SEPARATOR . $destName;

if (!move_uploaded_file($tmp, $destPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to store upload']);
    exit;
}

@chmod($destPath, 0640);

echo json_encode([
    'ok' => true,
    'id' => $destName,
    'bytes' => $size,
    'entries' => $entryCount,
    'message' => 'Upload stored for review. It will not be deployed automatically.',
]);
