<?php
require __DIR__ . '/lib.php';
cms_start_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    cms_json(['ok' => false, 'error' => 'method'], 405);
}
if (!cms_is_authed()) {
    cms_json(['ok' => false, 'error' => 'auth'], 401);
}

$csrf = isset($_SERVER['HTTP_X_CMS_CSRF']) ? $_SERVER['HTTP_X_CMS_CSRF'] : '';
if (empty($_SESSION['cms_csrf']) || !hash_equals($_SESSION['cms_csrf'], $csrf)) {
    cms_json(['ok' => false, 'error' => 'csrf'], 403);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
$key = isset($body['key']) ? (string)$body['key'] : '';
$value = isset($body['value']) ? (string)$body['value'] : '';

if (!in_array($key, cms_allowed_keys(), true)) {
    cms_json(['ok' => false, 'error' => 'key'], 422);
}
if (strlen($value) > 20000) { // лимит в байтах (без зависимости от mbstring)
    cms_json(['ok' => false, 'error' => 'too_long'], 422);
}

$path = cms_content_path();
$data = is_file($path) ? json_decode(file_get_contents($path), true) : [];
if (!is_array($data)) { $data = []; }
$data[$key] = $value;

$fp = fopen($path, 'c+');
if (!$fp) { cms_json(['ok' => false, 'error' => 'io'], 500); }
flock($fp, LOCK_EX);
ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

cms_json(['ok' => true]);
