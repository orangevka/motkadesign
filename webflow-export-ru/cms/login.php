<?php
require __DIR__ . '/lib.php';
cms_start_session();

$next = isset($_GET['next']) ? $_GET['next'] : '/services-cms.html';
// Разрешаем только локальные пути (без протокола/хоста) — защита от open redirect.
if (!preg_match('#^/[A-Za-z0-9/_\-.]*$#', $next)) {
    $next = '/services-cms.html';
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cfg = cms_config();
    $pwd = isset($_POST['password']) ? (string)$_POST['password'] : '';
    if ($cfg['password_hash'] !== '' && password_verify($pwd, $cfg['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['cms_auth'] = true;
        $_SESSION['cms_csrf'] = bin2hex(random_bytes(16));
        header('Location: ' . $next);
        exit;
    }
    $error = 'Неверный пароль';
}
?><!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Вход — CMS</title>
<style>
  body{font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#f5f5f5}
  form{background:#fff;padding:32px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);width:280px}
  h1{font-size:18px;margin:0 0 16px}
  input{width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccc;border-radius:8px;font-size:15px}
  button{margin-top:12px;width:100%;padding:10px;border:0;border-radius:8px;background:#111;color:#fff;font-size:15px;cursor:pointer}
  .err{color:#c00;font-size:13px;margin-top:8px}
</style></head>
<body>
<form method="post">
  <h1>Вход в редактор</h1>
  <input type="password" name="password" placeholder="Пароль" autofocus>
  <button type="submit">Войти</button>
  <?php if ($error): ?><div class="err"><?= htmlspecialchars($error) ?></div><?php endif; ?>
</form>
</body></html>
