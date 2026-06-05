# Inline-CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Дать авторизованному пользователю редактировать текст в размеченных блоках страницы прямо на месте; правки сохраняются в JSON на сервере вне git и подставляются при загрузке любой страницы.

**Architecture:** «Мир А» из спека (`docs/superpowers/specs/2026-06-05-inline-cms-design.md`). Контент хранится в `cms-data/content.json` (вне git, исключён из деплоя). Клиентский `cms.js` на загрузке подменяет текст размеченных `[data-cms]`-блоков значениями из JSON (оверрайд поверх HTML). При активной PHP-сессии включается inline-режим: клик → `contenteditable` → сохранение через `cms/save.php`. Пилот делаем на копии `services-cms.html`, прод не трогаем.

**Tech Stack:** Статический HTML/CSS/JS (экспорт Webflow), PHP (нативный, без фреймворка) для сессии/сохранения, `password_hash`/`password_verify`, CSRF-токен в сессии. Локальный прогон — `php -S`.

**Методология проверки:** Проект без тест-раннера; фронт верифицируется браузером+скриншотом (правило пользователя), PHP — через `curl` с проверкой тела/кода ответа. В каждой задаче шаг «проверка» = воспроизводимая команда/действие с ожидаемым результатом ДО реализации (фиксируем падение), затем реализация, затем повтор проверки (успех), затем коммит.

> **PowerShell-нюанс для всех проверочных команд ниже:** `curl` в PowerShell — это алиас `Invoke-WebRequest` и НЕ понимает unix-флаги. Везде в проверках используйте настоящий **`curl.exe`** (есть в Windows 10+), а вместо `/dev/null` пишите `$null`. Пример: `curl.exe -s -o $null -w "%{http_code}" <url>`.

---

## File Structure

**В git (код, деплоится):**
- `webflow-export-ru/services-cms.html` — копия `services.html`: `noindex`, подключён `cms.css`+`cms.js`, на нескольких блоках проставлен `data-cms`.
- `webflow-export-ru/assets/local/cms.js` — клиент: оверрайд из JSON + inline-режим редактирования.
- `webflow-export-ru/assets/local/cms.css` — стили тулбара и режима редактирования (стили только в подключаемом файле — правило пользователя).
- `webflow-export-ru/cms/session.php` — статус сессии: `{auth, csrf}`.
- `webflow-export-ru/cms/login.php` — GET отдаёт форму, POST проверяет пароль, ставит сессию+CSRF, редиректит назад.
- `webflow-export-ru/cms/logout.php` — гасит сессию.
- `webflow-export-ru/cms/save.php` — пишет правку в `content.json` (сессия + CSRF + whitelist ключа).
- `webflow-export-ru/cms/keys.php` — `return [...]` whitelist разрешённых ключей.
- `webflow-export-ru/cms/lib.php` — общее: старт сессии, путь к data-папке, загрузка config.
- `webflow-export-ru/cms/config.example.php` — образец конфига (без реального хеша).
- `.github/workflows/deploy.yml` — добавить `--exclude=cms-data/`.
- `webflow-export-ru/.gitignore` — игнор `cms-data/`.

**Вне git (создаётся вручную локально и на сервере):**
- `webflow-export-ru/cms-data/config.php` — `return ['password_hash' => '...'];`.
- `webflow-export-ru/cms-data/content.json` — сам контент `{ "<ключ>": "<текст>" }`.

**Серверные ручные шаги (при первом деплое):** создать `cms-data/` в docroot, скопировать `config.php` с боевым хешем, дать PHP-процессу права записи на папку, убедиться что `.php` исполняется (PHP-FPM уже работает — на нём форма заявки).

---

## Task 0: Установить PHP локально и завести данные-папку

**Files:**
- Create: `webflow-export-ru/cms-data/config.php` (локально, вне git)
- Create: `webflow-export-ru/cms-data/content.json` (локально, вне git)

- [ ] **Step 1: Установить PHP (Windows)**

В PowerShell:
```powershell
winget install --id PHP.PHP.8.3 -e --accept-source-agreements --accept-package-agreements
```
Если `winget` нет/не сработал — скачать ZIP «Thread Safe» x64 с https://windows.php.net/download/, распаковать в `C:\php`, добавить `C:\php` в PATH.

- [ ] **Step 2: Проверить установку**

Run (PowerShell, новое окно чтобы PATH подхватился):
```powershell
php --version
```
Expected: строка вида `PHP 8.3.x (cli) ...`. Если «не найден» — перезапустить терминал / проверить PATH.

- [ ] **Step 3: Создать локальную data-папку и контент**

Создать `webflow-export-ru/cms-data/content.json` с содержимым:
```json
{}
```

- [ ] **Step 4: Сгенерировать хеш пароля и записать config**

Run (PowerShell, пароль для локали — например `test123`):
```powershell
php -r "echo password_hash('test123', PASSWORD_DEFAULT);"
```
Скопировать вывод и создать `webflow-export-ru/cms-data/config.php`:
```php
<?php
return [
    'password_hash' => '<ВСТАВИТЬ_ХЕШ_ИЗ_ВЫВОДА>',
];
```

- [ ] **Step 5: Проверить, что `php -S` исполняет PHP**

Создать временно `webflow-export-ru/cms/ping.php`:
```php
<?php echo 'pong';
```
Run (из корня репо, PowerShell):
```powershell
php -S 127.0.0.1:8001 -t webflow-export-ru
```
В другом окне:
```powershell
curl http://127.0.0.1:8001/cms/ping.php
```
Expected: `pong`. Затем удалить `cms/ping.php` и остановить сервер (Ctrl+C).

- [ ] **Step 6: Commit (только .gitignore — данные не коммитим)**

Создать `webflow-export-ru/.gitignore`:
```
cms-data/
```
```bash
git add webflow-export-ru/.gitignore
git commit -m "chore: игнорировать cms-data/ (контент и конфиг CMS вне git)"
```

---

## Task 1: Общая PHP-библиотека и конфиг-образец

**Files:**
- Create: `webflow-export-ru/cms/lib.php`
- Create: `webflow-export-ru/cms/config.example.php`
- Create: `webflow-export-ru/cms/keys.php`

- [ ] **Step 1: Написать `cms/config.example.php`**

```php
<?php
// Образец. Реальный файл — cms-data/config.php (вне git).
// Хеш сгенерировать: php -r "echo password_hash('ПАРОЛЬ', PASSWORD_DEFAULT);"
return [
    'password_hash' => '$2y$10$REPLACE_ME',
];
```

- [ ] **Step 2: Написать `cms/keys.php` (whitelist ключей)**

```php
<?php
// Разрешённые для редактирования ключи. Должны совпадать с data-cms в HTML.
// Дополняется вручную при разметке новых блоков.
return [
    'services.hero.title',
    'services.hero.subtitle',
    'services.cta.button',
];
```

- [ ] **Step 3: Написать `cms/lib.php`**

```php
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
```

- [ ] **Step 4: Проверить, что библиотека парсится**

Run:
```powershell
php -l webflow-export-ru/cms/lib.php
php -l webflow-export-ru/cms/keys.php
php -l webflow-export-ru/cms/config.example.php
```
Expected: `No syntax errors detected` для каждого.

- [ ] **Step 5: Commit**

```bash
git add webflow-export-ru/cms/lib.php webflow-export-ru/cms/keys.php webflow-export-ru/cms/config.example.php
git commit -m "feat(cms): общая PHP-библиотека, whitelist ключей, образец конфига"
```

---

## Task 2: Эндпоинт статуса сессии

**Files:**
- Create: `webflow-export-ru/cms/session.php`

- [ ] **Step 1: Проверка-до (эндпоинта ещё нет)**

При запущенном `php -S 127.0.0.1:8001 -t webflow-export-ru`:
```powershell
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8001/cms/session.php
```
Expected: `404` (файла нет).

- [ ] **Step 2: Написать `cms/session.php`**

```php
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
```

- [ ] **Step 3: Проверка-после (без сессии)**

```powershell
curl -s http://127.0.0.1:8001/cms/session.php
```
Expected: `{"auth":false}`.

- [ ] **Step 4: Commit**

```bash
git add webflow-export-ru/cms/session.php
git commit -m "feat(cms): эндпоинт статуса сессии (auth + csrf)"
```

---

## Task 3: Вход и выход

**Files:**
- Create: `webflow-export-ru/cms/login.php`
- Create: `webflow-export-ru/cms/logout.php`

- [ ] **Step 1: Написать `cms/login.php`**

```php
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
```

> Примечание: `<style>` здесь допустим — это служебная страница входа, не часть сайта. Правило «стили в подключаемых файлах» относится к страницам сайта.

- [ ] **Step 2: Написать `cms/logout.php`**

```php
<?php
require __DIR__ . '/lib.php';
cms_start_session();
$_SESSION = [];
session_destroy();
header('Location: /services-cms.html');
exit;
```

- [ ] **Step 3: Проверка — неверный пароль не пускает**

При запущенном `php -S`:
```powershell
curl -s -i -X POST -d "password=wrong" http://127.0.0.1:8001/cms/login.php | Select-String "Неверный|Location"
```
Expected: видно «Неверный пароль», нет заголовка `Location:` (редиректа нет).

- [ ] **Step 4: Проверка — верный пароль ставит сессию**

```powershell
curl -s -i -c cookies.txt -X POST -d "password=test123" http://127.0.0.1:8001/cms/login.php | Select-String "Location|Set-Cookie"
curl -s -b cookies.txt http://127.0.0.1:8001/cms/session.php
```
Expected: первый запрос — `Location: /services-cms.html` + `Set-Cookie: motka_cms=...`; второй — `{"auth":true,"csrf":"..."}`. Затем удалить `cookies.txt`.

- [ ] **Step 5: Commit**

```bash
git add webflow-export-ru/cms/login.php webflow-export-ru/cms/logout.php
git commit -m "feat(cms): вход по паролю и выход (сессия + CSRF + защита от open redirect)"
```

---

## Task 4: Сохранение правок

**Files:**
- Create: `webflow-export-ru/cms/save.php`

- [ ] **Step 1: Написать `cms/save.php`**

```php
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
if (mb_strlen($value) > 5000) {
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
```

- [ ] **Step 2: Проверка — без сессии отклоняется**

```powershell
curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{\"key\":\"services.hero.title\",\"value\":\"x\"}' http://127.0.0.1:8001/cms/save.php
```
Expected: `401`.

- [ ] **Step 3: Проверка — с сессией, валидным CSRF и whitelist-ключом пишет**

```powershell
# логин + сохранить cookie
curl -s -c cookies.txt -X POST -d "password=test123" http://127.0.0.1:8001/cms/login.php > $null
# достать csrf
$csrf = (curl -s -b cookies.txt http://127.0.0.1:8001/cms/session.php | ConvertFrom-Json).csrf
# сохранить правку
curl -s -b cookies.txt -X POST -H "Content-Type: application/json" -H "X-CMS-CSRF: $csrf" -d '{\"key\":\"services.hero.title\",\"value\":\"Новый заголовок\"}' http://127.0.0.1:8001/cms/save.php
```
Expected: `{"ok":true}`. Проверить файл:
```powershell
Get-Content webflow-export-ru/cms-data/content.json
```
Expected: содержит `"services.hero.title": "Новый заголовок"`.

- [ ] **Step 4: Проверка — ключ вне whitelist отклоняется**

```powershell
curl -s -b cookies.txt -X POST -H "Content-Type: application/json" -H "X-CMS-CSRF: $csrf" -d '{\"key\":\"evil.key\",\"value\":\"x\"}' -o /dev/null -w "%{http_code}" http://127.0.0.1:8001/cms/save.php
```
Expected: `422`. Затем удалить `cookies.txt` и вернуть `content.json` к `{}`.

- [ ] **Step 5: Commit**

```bash
git add webflow-export-ru/cms/save.php
git commit -m "feat(cms): сохранение правок в content.json (auth+csrf+whitelist+lock)"
```

---

## Task 5: Клиентская подстановка из JSON (оверрайд)

**Files:**
- Create: `webflow-export-ru/assets/local/cms.js`

- [ ] **Step 1: Написать первую часть `cms.js` — только оверрайд**

```js
// Inline-CMS: подстановка текста из content.json поверх размеченных блоков.
(function () {
  var CONTENT_URL = '/cms-data/content.json';

  function applyOverrides(data) {
    if (!data) return;
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var key = el.getAttribute('data-cms');
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        el.textContent = data[key];
      }
    });
  }

  fetch(CONTENT_URL, { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(applyOverrides)
    .catch(function () { /* нет файла — остаётся HTML */ });
})();
```

- [ ] **Step 2: Проверка — оверрайд работает**

Временно положить в `cms-data/content.json`:
```json
{ "services.hero.title": "ТЕКСТ ИЗ JSON" }
```
Создать временный `webflow-export-ru/cms-test.html`:
```html
<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>t</title></head>
<body><h1 data-cms="services.hero.title">Текст из HTML</h1>
<script src="/assets/local/cms.js"></script></body></html>
```
При запущенном `php -S 127.0.0.1:8001 -t webflow-export-ru` открыть http://127.0.0.1:8001/cms-test.html, сделать скриншот.
Expected: на странице видно «ТЕКСТ ИЗ JSON» (не «Текст из HTML»).

- [ ] **Step 3: Проверка — без записи в JSON остаётся HTML**

Вернуть `content.json` к `{}`, перезагрузить страницу, скриншот.
Expected: видно «Текст из HTML».

- [ ] **Step 4: Убрать временный файл и закоммитить**

Удалить `webflow-export-ru/cms-test.html`.
```bash
git add webflow-export-ru/assets/local/cms.js
git commit -m "feat(cms): клиентская подстановка текста из content.json"
```

---

## Task 6: Inline-режим редактирования + стили

**Files:**
- Modify: `webflow-export-ru/assets/local/cms.js`
- Create: `webflow-export-ru/assets/local/cms.css`

- [ ] **Step 1: Написать `cms.css`**

```css
/* Inline-CMS: тулбар и режим редактирования. */
.cms-toolbar{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);
  z-index:99999;display:flex;gap:8px;align-items:center;
  background:#111;color:#fff;padding:10px 14px;border-radius:999px;
  box-shadow:0 6px 24px rgba(0,0,0,.25);font:14px/1 system-ui,sans-serif}
.cms-toolbar button{border:0;border-radius:999px;padding:8px 14px;font:inherit;cursor:pointer}
.cms-toolbar .cms-save{background:#2d7;color:#062}
.cms-toolbar .cms-logout{background:#333;color:#fff}
.cms-toolbar .cms-status{opacity:.8;min-width:80px}
[data-cms].cms-editing{outline:2px dashed #2d7;outline-offset:3px;cursor:text;border-radius:3px}
[data-cms].cms-dirty{outline-color:#fa0}
```

- [ ] **Step 2: Дополнить `cms.js` режимом редактирования**

Добавить ПОСЛЕ блока оверрайда (внутри той же IIFE), и подключить запуск редактора после применения оверрайда:

```js
  var SESSION_URL = '/cms/session.php';
  var SAVE_URL = '/cms/save.php';
  var dirty = {}; // key -> value

  function enableEditing(csrf) {
    injectToolbar(csrf);
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      el.classList.add('cms-editing');
      el.setAttribute('contenteditable', 'plaintext-only');
      el.addEventListener('input', function () {
        dirty[el.getAttribute('data-cms')] = el.textContent;
        el.classList.add('cms-dirty');
      });
    });
  }

  function injectToolbar(csrf) {
    var bar = document.createElement('div');
    bar.className = 'cms-toolbar';
    bar.innerHTML =
      '<span class="cms-status">режим правки</span>' +
      '<button class="cms-save">Сохранить</button>' +
      '<button class="cms-logout">Выйти</button>';
    document.body.appendChild(bar);
    var status = bar.querySelector('.cms-status');
    bar.querySelector('.cms-logout').onclick = function () {
      window.location.href = '/cms/logout.php';
    };
    bar.querySelector('.cms-save').onclick = function () {
      var keys = Object.keys(dirty);
      if (!keys.length) { status.textContent = 'нет изменений'; return; }
      status.textContent = 'сохраняю…';
      Promise.all(keys.map(function (key) {
        return fetch(SAVE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CMS-CSRF': csrf },
          body: JSON.stringify({ key: key, value: dirty[key] })
        }).then(function (r) { return r.json(); });
      })).then(function (results) {
        var ok = results.every(function (x) { return x && x.ok; });
        status.textContent = ok ? 'сохранено ✓' : 'ошибка';
        if (ok) {
          dirty = {};
          document.querySelectorAll('[data-cms].cms-dirty')
            .forEach(function (el) { el.classList.remove('cms-dirty'); });
        }
      }).catch(function () { status.textContent = 'ошибка сети'; });
    };
  }

  fetch(SESSION_URL, { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (s) { if (s && s.auth) enableEditing(s.csrf); })
    .catch(function () { /* не залогинен — обычный режим */ });
```

- [ ] **Step 3: Проверка — не залогинен: тулбара нет**

При запущенном `php -S`, в приватном окне (без сессии) открыть тестовую страницу с `data-cms` (как в Task 5, временно пересоздать `cms-test.html` с подключением `cms.css`+`cms.js`). Скриншот.
Expected: тулбара нет, блоки не редактируемы.

- [ ] **Step 4: Проверка — залогинен: тулбар + редактирование + сохранение**

Войти через http://127.0.0.1:8001/cms/login.php (пароль `test123`), вернуться на тестовую страницу. Скриншот: виден тулбар, у блока пунктирная обводка. Кликнуть в блок, изменить текст, «Сохранить». Скриншот: статус «сохранено ✓». Перезагрузить страницу. Скриншот: текст сохранился (пришёл из JSON). Проверить:
```powershell
Get-Content webflow-export-ru/cms-data/content.json
```
Expected: правка в файле.

- [ ] **Step 5: Убрать временный файл и закоммитить**

Удалить `cms-test.html`, вернуть `content.json` к `{}`.
```bash
git add webflow-export-ru/assets/local/cms.js webflow-export-ru/assets/local/cms.css
git commit -m "feat(cms): inline-режим редактирования (contenteditable + тулбар + сохранение)"
```

---

## Task 7: Копия пилотной страницы services-cms.html

**Files:**
- Create: `webflow-export-ru/services-cms.html` (копия `services.html`)

- [ ] **Step 1: Скопировать страницу**

Run (PowerShell):
```powershell
Copy-Item webflow-export-ru/services.html webflow-export-ru/services-cms.html
```

- [ ] **Step 2: Закрыть копию от индексации**

В `services-cms.html` в `<head>` (после `<meta charset…>`) добавить:
```html
<meta name="robots" content="noindex, nofollow"/>
```

- [ ] **Step 3: Подключить cms.css и cms.js**

В `<head>` добавить перед закрытием `</head>`:
```html
<link href="/assets/local/cms.css" rel="stylesheet" type="text/css"/>
```
Перед `</body>` (рядом с `polyfills.js`) добавить:
```html
<script src="/assets/local/cms.js"></script>
```

- [ ] **Step 4: Разметить блоки `data-cms`**

Найти в `services-cms.html` главный заголовок hero, подзаголовок и текст кнопки CTA. Проставить атрибуты так, чтобы ключи совпадали с `cms/keys.php`:
- заголовок hero → `data-cms="services.hero.title"`
- подзаголовок hero → `data-cms="services.hero.subtitle"`
- кнопка CTA → `data-cms="services.cta.button"`

Точные элементы найти по видимому тексту (страница минифицирована — искать Grep'ом по тексту и добавлять атрибут на ближайший текстовый тег `h1/h2/p/a/span`).

> Если фактические тексты/блоки отличаются — синхронно обновить список в `cms/keys.php`, чтобы whitelist и разметка совпадали.

- [ ] **Step 5: Проверка — страница открывается, оверрайд и режим работают**

При запущенном `php -S 127.0.0.1:8001 -t webflow-export-ru`:
1. Открыть http://127.0.0.1:8001/services-cms.html (не залогинен) — скриншот: страница как обычный services, без тулбара, вёрстка не сломана.
2. Войти на `/cms/login.php`, вернуться — скриншот: тулбар есть, размеченные блоки с обводкой.
3. Изменить заголовок, сохранить, перезагрузить — скриншот: новый заголовок виден из JSON.
4. Проверить ширину вьюпорта не превышена, соседние страницы (`services.html`, `index.html`) не затронуты (открыть, скриншот).

- [ ] **Step 6: Вернуть контент и закоммитить**

Вернуть `cms-data/content.json` к `{}`.
```bash
git add webflow-export-ru/services-cms.html
git commit -m "feat(cms): пилотная копия services-cms.html (noindex + разметка data-cms)"
```

---

## Task 8: Настроить деплой (исключить cms-data)

**Files:**
- Modify: `.github/workflows/deploy.yml:19`

- [ ] **Step 1: Добавить exclude**

Изменить строку switches:
```yaml
          switches: -avz --delete --exclude=tuna/ --exclude=cms-data/
```

- [ ] **Step 2: Проверка — exclude на месте**

Run (PowerShell):
```powershell
Select-String -Path .github/workflows/deploy.yml -Pattern "--exclude=cms-data/"
```
Expected: строка `switches: -avz --delete --exclude=tuna/ --exclude=cms-data/` найдена.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: исключить cms-data/ из rsync-деплоя (контент CMS вне git)"
```

---

## Task 9: Документация серверной части и финальная сверка

**Files:**
- Create: `webflow-export-ru/cms/README.md`

- [ ] **Step 1: Написать `cms/README.md` (шаги на сервере)**

```markdown
# Inline-CMS — серверная настройка

Файлы PHP (`cms/`), `cms.js`, `cms.css`, `services-cms.html` деплоятся из git.
Контент и пароль живут вне git, в `cms-data/` (исключена из деплоя).

## Однократно на сервере (docroot = .../motka-ru.webflow.io/):
1. Создать папку данных и дать PHP права записи:
   mkdir -p cms-data
   # права под пользователя php-fpm (обычно www-data):
   chown -R www-data:www-data cms-data && chmod 750 cms-data
2. Создать config с боевым хешем:
   php -r "echo password_hash('БОЕВОЙ_ПАРОЛЬ', PASSWORD_DEFAULT);"
   # положить вывод в cms-data/config.php:
   # <?php return ['password_hash' => '...'];
3. Создать пустой контент: echo "{}" > cms-data/content.json (права записи www-data).
4. Проверить, что .php исполняется и /cms/session.php отдаёт {"auth":false}.

## Проверка после деплоя:
- Открыть https://new.motka.ru/services-cms — страница грузится.
- /cms/login.php — войти, вернуться, отредактировать, сохранить, перезагрузить.
```

- [ ] **Step 2: Финальная сверка спека**

Пройтись по `docs/superpowers/specs/2026-06-05-inline-cms-design.md`: каждое решение покрыто (хранение вне git ✓ Task 8, оверрайд ✓ Task 5, inline ✓ Task 6, пароль+сессия ✓ Task 3, whitelist+textContent+csrf ✓ Task 4, пилот-копия+noindex ✓ Task 7). Зафиксировать в сообщении.

- [ ] **Step 3: Commit**

```bash
git add webflow-export-ru/cms/README.md
git commit -m "docs(cms): инструкция серверной настройки inline-CMS"
```

---

## Definition of Done

- Локально (`php -S`): вход по паролю работает, размеченные блоки `services-cms.html` редактируются по клику, сохранение пишет в `cms-data/content.json`, после перезагрузки правки видны из JSON; неавторизованный пользователь видит обычную страницу без тулбара.
- Неверный пароль, отсутствие сессии, неверный CSRF и ключ вне whitelist — отклоняются (проверено curl).
- `cms-data/` исключена из деплоя; соседние страницы и вёрстка не затронуты.
- Серверные шаги задокументированы в `cms/README.md`. Боевой деплой и проверка на `new.motka.ru` — после ревью (отдельным действием, с подтверждением).
