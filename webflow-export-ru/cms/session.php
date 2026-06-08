<?php
require __DIR__ . '/lib.php';
cms_start_session();

if (cms_is_authed()) {
    if (empty($_SESSION['cms_csrf'])) {
        $_SESSION['cms_csrf'] = bin2hex(random_bytes(16));
    }
    cms_json(['auth' => true, 'csrf' => $_SESSION['cms_csrf']]);
}
cms_json(['auth' => false]);
