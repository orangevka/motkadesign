<?php
// Общие хелперы CMS: сессия, пути, конфиг, JSON-ответ.

function cms_start_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_name('motka_cms');
        session_start();
    }
}

function cms_data_dir(): string {
    // cms/ → ../cms-data
    return realpath(__DIR__ . '/..') . '/cms-data';
}

function cms_content_path(): string {
    return cms_data_dir() . '/content.json';
}

function cms_config(): array {
    $path = cms_data_dir() . '/config.php';
    if (!is_file($path)) {
        return ['password_hash' => ''];
    }
    return require $path;
}

function cms_allowed_keys(): array {
    return require __DIR__ . '/keys.php';
}

function cms_is_authed(): bool {
    cms_start_session();
    return !empty($_SESSION['cms_auth']);
}

function cms_json(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
