<?php
// Set real values on the server after upload (cPanel File Manager or SSH).
// Do not commit live tokens. Rotate any token that was ever exposed in git.
define('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE');
define('TELEGRAM_CHAT_ID', 'YOUR_CHAT_ID_HERE');

// Shared token for /source download & upload portal. Change on the server.
define('SOURCE_ACCESS_TOKEN', 'CHANGE_ME_SOURCE_TOKEN');

// Upload limits for developer source ZIP submissions
define('SOURCE_MAX_UPLOAD_BYTES', 50 * 1024 * 1024);       // 50 MB compressed
define('SOURCE_MAX_ZIP_ENTRIES', 5000);
define('SOURCE_MAX_UNCOMPRESSED_BYTES', 200 * 1024 * 1024); // 200 MB uncompressed

// Allowlisted extensions inside uploaded source ZIPs (lowercase, no dot)
define('SOURCE_ALLOWED_EXTENSIONS', [
    'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
    'css', 'scss', 'sass', 'less',
    'html', 'htm',
    'json', 'jsonc',
    'md', 'mdx', 'txt',
    'svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'ico',
    'php',
    'htaccess', 'gitignore', 'env', 'example',
    'yml', 'yaml', 'toml', 'xml',
    'map',
    'woff', 'woff2', 'ttf', 'otf', 'eot',
    'py',
    'dockerignore', 'editorconfig', 'eslintrc', 'prettierrc',
    'lock', 'npmrc', 'nvmrc',
]);

/**
 * Read the source portal access token from common request locations.
 */
function source_request_token(): string
{
    $header = $_SERVER['HTTP_X_SOURCE_TOKEN'] ?? '';
    if (is_string($header) && $header !== '') {
        return trim($header);
    }

    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (is_string($auth) && preg_match('/^Bearer\s+(.+)$/i', $auth, $m)) {
        return trim($m[1]);
    }

    if (isset($_POST['token']) && is_string($_POST['token'])) {
        return trim($_POST['token']);
    }

    if (isset($_GET['token']) && is_string($_GET['token'])) {
        return trim($_GET['token']);
    }

    return '';
}

/**
 * Require a valid SOURCE_ACCESS_TOKEN or exit with 401 JSON.
 */
function require_source_token(): void
{
    if (SOURCE_ACCESS_TOKEN === 'CHANGE_ME_SOURCE_TOKEN' || SOURCE_ACCESS_TOKEN === '') {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Source portal token not configured']);
        exit;
    }

    $provided = source_request_token();
    if ($provided === '' || !hash_equals(SOURCE_ACCESS_TOKEN, $provided)) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Invalid or missing access token']);
        exit;
    }
}
