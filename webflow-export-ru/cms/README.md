# Inline-CMS — серверная настройка

Файлы PHP (`cms/`), `cms.js`, `cms.css`, `services-cms.html` деплоятся из git.
Контент и пароль живут вне git, в `cms-data/` (исключена из rsync-деплоя через
`--exclude=cms-data/` в `.github/workflows/deploy.yml`).

Docroot на сервере: `/var/www/new.motka.ru/motka-mirror/motka-ru.webflow.io/`

## Однократно на сервере (из docroot):

1. Создать папку данных и дать PHP права записи:
   ```sh
   mkdir -p cms-data
   # права под пользователя php-fpm (обычно www-data):
   chown -R www-data:www-data cms-data && chmod 750 cms-data
   ```
2. Создать config с боевым хешем:
   ```sh
   php -r "echo password_hash('БОЕВОЙ_ПАРОЛЬ', PASSWORD_DEFAULT);"
   # положить вывод в cms-data/config.php:
   # <?php return ['password_hash' => '...'];
   ```
3. Создать пустой контент (с правами записи www-data):
   ```sh
   echo "{}" > cms-data/content.json
   chown www-data:www-data cms-data/content.json
   ```
4. Проверить, что `.php` исполняется и `/cms/session.php` отдаёт `{"auth":false}`.

## Проверка после деплоя:

- Открыть https://new.motka.ru/services-cms.html — страница грузится.
- `/cms/login.php` — войти, вернуться, отредактировать блок, сохранить, перезагрузить.

## Добавление новых редактируемых блоков:

1. В HTML на нужный текстовый тег добавить `data-cms="<ключ>"`.
2. Тот же `<ключ>` добавить в whitelist `cms/keys.php`.
   Без записи в whitelist `save.php` вернёт 422.

## Локальная разработка:

```sh
php -S 127.0.0.1:8001 -t webflow-export-ru
```
Пароль локального `cms-data/config.php` — `test123` (только для локали, в git не попадает).
