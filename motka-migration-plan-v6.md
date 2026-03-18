# MOTKA.DESIGN — ПЛАН МИГРАЦИИ v6.0
### Webflow → Claude Code: генерация страниц из Figma
**Март 2026 · Команда: Motka, Orangevka, Finera-Developers**

---

## Контекст

Сайт motka.design (EN) переводится с Webflow на кодовую генерацию через Claude Code + Figma MCP.

- **Репозиторий:** github.com/orangevka/motkadesign (ветка `master`)
- **Деплой:** motka-design.netlify.app (автодеплой при каждом пуше)
- **Хостинг:** Netlify → VPS (Фаза 6)
- **Дизайн:** Figma (Pencil MCP подключён)

---

## Текущее состояние (Март 2026)

### ✅ Фаза 0 — Инструменты и репозиторий (завершена)
- Node.js v24, Git, VS Code, Claude Code v2.1.71 установлены
- Figma MCP подключён (аккаунт Nata Bulanova)
- Репозиторий motkadesign создан на GitHub
- Netlify подключён к GitHub с автодеплоем (ветка master, папка webflow-export)

### ✅ Фаза 1 — Реверс-инжиниринг через HTTrack (завершена)
- Сайт скачан: https://www.motka.design
- SITE_SPEC.md создан: 27 страниц, 5 шрифтов, 3 брейкпоинта
- Пути к CDN исправлены (326 замен в 27 файлах)
- Пути в /portfolio/ исправлены, Webflow-атрибуты удалены
- Сайт корректно отображается на motka-design.netlify.app

### ✅ Фаза 2 — Компонентная библиотека v1 (завершена)
- `_head.html` — с плейсхолдерами для meta/og/canonical + ссылка на styles.css
- `_nav.html` — навигация root-страниц
- `_nav-case.html` — навигация /portfolio/ (пути с ../)
- `_footer.html` — футер root-страниц
- `_footer-case.html` — футер /portfolio/ (без DesignRush-бейджа)
- `_contact-form.html` — форма обратной связи
- `_scripts.html` — скрипты в конце body (jQuery, dropdown polyfill, peek-scroll, год) ← **новый**
- PAGE_PROMPT_TEMPLATE.md создан с чеклистом проверок
- Год в копирайте исправлен на динамический

### ✅ Фаза 2.5 — Унификация CSS-системы (завершена)
- `styles.css` создан — единый CSS-файл для всех страниц
- CSS_SYSTEM.md — документация классов и правил именования
- Все кастомные классы — с префиксом `mtk-`
- Инлайн-стили из `_head.html` перенесены в `styles.css`
- `services.html` **требует рефакторинга** классов `svc-*` → `mtk-svc-*`

---

## Проблема: разная вёрстка страниц

Страницы сейчас используют 3 несовместимых подхода:

| Страница | Статус | Проблема |
|----------|--------|----------|
| `index.html` | HTTrack-экспорт | Сырой Webflow, инлайн-стили, без компонентов |
| `about.html` | HTTrack-экспорт | Сырой Webflow, инлайн-стили, без компонентов |
| `contacts.html` | HTTrack-экспорт | Сырой Webflow, инлайн-стили, без компонентов |
| `subscription.html` | HTTrack-экспорт | Сырой Webflow, инлайн-стили, без компонентов |
| `portfolio.html` | HTTrack-экспорт | Сырой Webflow, инлайн-стили, без компонентов |
| `services.html` | Пересобрана Claude | Чистая, но классы `svc-*` вместо `mtk-*` |

**Цель:** все страницы используют одинаковые компоненты и styles.css.

---

## Пошаговый план

### → Фаза 3 — Приоритет: рефакторинг services.html
**Задача:** привести первую пересобранную страницу к стандарту системы классов.

- [ ] Переименовать все `svc-*` классы в `mtk-svc-*` (или подходящие `mtk-` классы)
- [ ] Перенести стили из инлайн `<style>` в styles.css (те, что будут переиспользоваться)
- [ ] Заменить head/scripts на содержимое компонентов `_head.html` / `_scripts.html`
- [ ] Проверить на Netlify

### → Фаза 4 — Пилотная страница из Figma
**Задача:** пересобрать одну страницу полностью из Figma через Claude Code.

- [ ] Выбрать страницу (рекомендуется: About или Contacts)
- [ ] Убедиться что в Figma есть готовый макет
- [ ] Запустить Claude Code с PAGE_PROMPT_TEMPLATE.md + ссылка на Figma-фрейм
- [ ] Использовать **только** классы из CSS_SYSTEM.md, не придумывать новые
- [ ] Сравнить с оригиналом: навигация, адаптив на 3 брейкпоинтах
- [ ] Задеплоить на Netlify, убедиться что всё работает

### → Фаза 5 — Фигма в порядок (параллельно с Фазой 4-6)
- [ ] Включить Auto Layout во всех компонентах и секциях
- [ ] Переименовать слои: `Hero / Title` вместо `Rectangle 47`
- [ ] Перевести цвета и шрифты на Figma Variables / Styles
- [ ] Цель: Claude видит дизайн правильно без дополнительных пояснений

### → Фаза 6 — Масштабирование: все страницы
**Порядок пересборки (приоритет):**
1. `contacts.html` — простая структура, форма уже есть
2. `about.html` — команда, услуги
3. `portfolio.html` — сетка кейсов
4. `index.html` — главная, самая сложная
5. `subscription.html`
6. Кейсы портфолио (`/portfolio/*.html`)

**Правила для каждой страницы:**
- Использовать компоненты: `_head.html`, `_nav.html`, `_footer.html`, `_scripts.html`
- Использовать только классы из `styles.css` / CSS_SYSTEM.md
- Уникальные стили страницы — инлайн `<style>` после `_head.html`
- Проверить: навигация, адаптив (1440 / 1024 / 991 / 479px), Core Web Vitals
- git push → автодеплой → проверка на Netlify

### → Фаза 7 — Переезд на VPS + CI/CD
- GitHub Actions: пуш в master → автосборка → деплой на VPS
- Домен motka.design → VPS (отвязать от Webflow)
- Архив Webflow-проекта — резервная копия

---

## Структура репозитория

```
/motkadesign
  SITE_SPEC.md              — конституция сайта (страницы, токены, шрифты)
  CSS_SYSTEM.md             — система классов и правила именования ← новый
  PAGE_PROMPT_TEMPLATE.md   — шаблон промпта для генерации страниц
  motka-migration-plan-v6.md — этот файл

  /components
    _head.html              — <head> с плейсхолдерами + ссылка на styles.css
    _nav.html               — навигация (root)
    _nav-case.html          — навигация (/portfolio/)
    _footer.html            — футер (root, с DesignRush)
    _footer-case.html       — футер (/portfolio/, без DesignRush)
    _contact-form.html      — форма обратной связи
    _scripts.html           — скрипты конца body ← новый

  /webflow-export
    styles.css              — единый CSS для всех страниц ← новый
    index.html              — HTTrack (требует пересборки)
    about.html              — HTTrack (требует пересборки)
    portfolio.html          — HTTrack (требует пересборки)
    contacts.html           — HTTrack (требует пересборки)
    subscription.html       — HTTrack (требует пересборки)
    services.html           — Claude (требует рефакторинга классов)
    privacy-policy.html
    /portfolio/             — кейсы (HTTrack, требуют пересборки)
    /images/

  /.github/workflows/       — CI/CD (Фаза 7)
```

---

## Рабочий процесс: Figma → страница

1. Дизайнер готовит макет в Figma (Auto Layout, правильные имена, Variables)
2. Копируется ссылка на фрейм из Figma
3. Claude Code запускается с PAGE_PROMPT_TEMPLATE.md + ссылка
4. Claude читает Figma → генерирует HTML/CSS:
   - Вставляет компоненты из `/components/`
   - Использует только классы из CSS_SYSTEM.md
   - Уникальные стили — инлайн в `<style>` после `_head.html`
5. Проверка: визуал, адаптив, ссылки
6. `git push` → автодеплой на Netlify → проверка на живом сайте

---

## Критерии готовности страницы

- [ ] Использует `_head.html` (с заполненными плейсхолдерами)
- [ ] Использует `_nav.html` или `_nav-case.html`
- [ ] Использует `_footer.html` или `_footer-case.html`
- [ ] Использует `_scripts.html`
- [ ] Подключает `styles.css` (через `_head.html`)
- [ ] Нет инлайн-стилей, которые дублируют styles.css
- [ ] Все кастомные классы — с префиксом `mtk-`
- [ ] Нет мусора Webflow (HTTrack-комментарии, `data-wf-*` атрибуты, устаревшие инлайн-стили)
- [ ] Адаптив работает на 1440 / 1024 / 991 / 479px
- [ ] Нет сломанных ссылок

---

*motka.design · Миграция Webflow → Claude Code · v6.0 · Март 2026*
