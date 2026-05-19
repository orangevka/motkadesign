# build-case Skill Update — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переписать команду `/build-case` под RU-сайт и новый 5-этапный процесс из спека.

**Architecture:** Один файл `.claude/commands/build-case.md` — slash-команда для Claude Code. Содержит полные инструкции: от аудита Figma до QA. Никакого кода — только инструкции на русском для Claude.

**Tech Stack:** Markdown, Figma MCP (`mcp__claude_ai_Figma__get_design_context`, `get_screenshot`), локальный сервер `http://127.0.0.1:8001/`

---

### Задача 1 — Проверить компоненты RU-сайта

**Файлы:**
- Read: `webflow-export-ru/portfolio/chitay-gorod.html` (референсный кейс)
- Read: список файлов компонентов в `webflow-export-ru/`

- [ ] **Шаг 1: Выяснить какие компоненты подключаются в кейсах RU-сайта**

Прочитать `webflow-export-ru/portfolio/chitay-gorod.html` и найти все `include`-паттерны — подключённые компоненты nav, footer, popup, scripts. Записать точные имена файлов и пути.

- [ ] **Шаг 2: Убедиться что компоненты существуют**

Проверить наличие каждого файла компонента через Glob. Если компонент инлайновый (встроен прямо в HTML, а не в отдельном файле) — зафиксировать это.

- [ ] **Шаг 3: Выписать итоговый список**

Результат: точные пути к файлам компонентов (или пометка «инлайн») для использования в Задаче 2.

---

### Задача 2 — Написать новый build-case.md

**Файлы:**
- Modify: `.claude/commands/build-case.md`
- Reference: `docs/superpowers/specs/2026-05-19-case-layout-process.md`

- [ ] **Шаг 1: Сохранить резервную копию текущего файла**

```bash
cp .claude/commands/build-case.md .claude/commands/.backups/build-case.md.$(date +%Y-%m-%d_%H%M%S)
```

- [ ] **Шаг 2: Написать секцию заголовка и аргументов**

Аргументы команды:
```
$ARGUMENTS: <figma-url> <filename> [light|dark]
```
- `figma-url` — ссылка на фрейм (`https://www.figma.com/design/...?node-id=...`)
- `filename` — имя файла без папки (будет в `webflow-export-ru/portfolio/`)
- `light|dark` — тема nav (по умолчанию `light`)
- Если аргументы не переданы — спросить у пользователя

- [ ] **Шаг 3: Написать Этап 0 — Figma Аудит**

Инструкции для Claude:
1. Прочитать макет через `mcp__claude_ai_Figma__get_design_context`
2. Сделать скриншот через `mcp__claude_ai_Figma__get_screenshot`
3. Составить и вывести **Карту кейса** в следующем формате:

```
## Карта кейса [Название]
Префикс CSS-классов: xx- (предложить исходя из названия)

### Секции (сверху вниз)
1. Nav — компонент [имя файла / инлайн]
2. Hero — новый блок, классы: xx-hero, xx-hero-title, ...
3. [секция] — [переиспользовать .mtk-section / новый блок]
...
N. Footer — компонент [имя файла / инлайн]

### Риски
- [абсолютные декоративные элементы]
- [mix-blend-mode]
- [нестандартные шрифты]

### Ассеты для экспорта
- [имя файла] ([размер]) — [описание]

### Типографика → CSS
- [Figma-стиль]: [шрифт] [размер]/[вес] → .xx-className
```

4. Остановиться и **ждать подтверждения карты** от пользователя перед Этапом 3.

- [ ] **Шаг 4: Написать Этап 1 — Figma Prep (памятка дизайнеру)**

Короткий блок — не для Claude, а чтобы напомнить что должен подготовить дизайнер:
- Секции верхнего уровня названы по карте
- Декоративные абсолютные элементы помечены `[decorative]`
- Ассеты из списка экспортированы
- Все тексты — редактируемый текст, не растр

Пометить: «Этот этап выполняется дизайнером ДО команды `/build-case`. Claude пропускает и переходит к Этапу 2.»

- [ ] **Шаг 5: Написать Этап 2 — Брифинг**

Claude подтверждает:
- Карта актуальна (или обновляет если Figma изменилась)
- Уточняет: есть ли экспортированные ассеты и где они лежат
- Называет первую секцию для старта

- [ ] **Шаг 6: Написать Этап 3 — Верстка**

Структура HTML для RU-сайта:
```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <!-- _head: PAGE_TITLE, META_DESCRIPTION, OG_*, CANONICAL_URL, BASE_URL="../" -->

  <style>
    /* Обязательный сброс Webflow p-тега */
    [class*="xx-"] p { font-size: inherit; font-family: inherit; }
    /* Явные переопределения */
    p.xx-body { font-size: 18px; font-family: 'Factor A', sans-serif; }

    /* Декоративные абсолютные элементы */
    .xx-decorative { position: absolute; z-index: 0; }
    .xx-card       { position: relative; z-index: 1; }
  </style>
</head>
<body class="body overflow-x"> <!-- + case-body для dark -->
  <!-- nav компонент (light или dark) -->
  <main>
    <!-- секции по карте -->
  </main>
  <!-- footer компонент -->
  <!-- popup компонент -->
  <!-- scripts компонент -->
</body>
</html>
```

Правила:
- Одна секция за раз → скриншот `http://127.0.0.1:8001/portfolio/<filename>` → ждать «ок»
- Картинки из Figma MCP (`figma.com/api/mcp/asset/...`) — временные, нельзя в HTML. Сохранить через Bash или оставить `src="TODO: export-from-figma"` с описанием
- `loading="lazy"` и `alt` на всех `<img>`
- `{{BASE_URL}}` = `"../"`
- Inline `style=""` — только для уникальных фонов, не для типографики

- [ ] **Шаг 7: Написать Этап 4 — QA чеклист**

```
### Типографика
- [ ] Нет fallback serif вместо Factor A
- [ ] p-теги не умножают font-size (Webflow bug)
- [ ] Размеры заголовков совпадают с Figma (проверить DevTools)

### Отступы и сетка
- [ ] Горизонтальный скролл отсутствует
- [ ] Паддинги секций ≈ Figma (±4px)
- [ ] Ширина контента ≤ 1440px

### Ассеты
- [ ] Нет 404 на изображениях
- [ ] Нет src="TODO: ..." (все заменены)

### Адаптив
- [ ] 991px: колонки корректны
- [ ] 767px: мобильный — читаемо
- [ ] 479px: форма и кнопки работают

### Интеграция
- [ ] Ссылка добавлена в portfolio.html
- [ ] Canonical URL прописан
- [ ] Title и description заполнены
- [ ] git commit с понятным сообщением
```

- [ ] **Шаг 8: Проверить целостность нового файла**

Перечитать `.claude/commands/build-case.md` — убедиться:
- Нет плейсхолдеров `{{TODO}}`
- Пути используют `webflow-export-ru/`, не `webflow-export/`
- Пути к компонентам совпадают с реально существующими файлами (из Задачи 1)
- CSS-префикс `xx-` явно помечен как «заменить на реальный»

- [ ] **Шаг 9: Коммит**

```bash
git add .claude/commands/build-case.md
git commit -m "Update: /build-case — RU-сайт, Figma Аудит + карта, QA чеклист"
```

---

### Задача 3 — Smoke test: прогон на синтетическом примере

**Файлы:**
- Read: `.claude/commands/build-case.md` (финальный)
- Reference: `webflow-export-ru/portfolio/chitay-gorod.html`

- [ ] **Шаг 1: Мысленный прогон по chitay-gorod**

Применить новый build-case.md к уже существующему chitay-gorod как будто его верстаем с нуля:
- Этап 0: смог бы Claude составить карту кейса по спеку?
- Этап 3: есть ли все нужные CSS-паттерны в шаблоне?
- Этап 4: покрывает ли QA-чеклист ошибки из `CASE_REVIEW_chitay-gorod.md`?

- [ ] **Шаг 2: Зафиксировать пробелы**

Если smoke test выявил нехватку — добавить в build-case.md. Если всё покрыто — документ готов.

---

## Ожидаемый результат

После выполнения плана:
- `/build-case` ведёт по 5-этапному процессу из спека
- Карта кейса обязательна перед стартом верстки
- CSS-паттерны (сброс p-тега, z-index для декоративных элементов) встроены в шаблон
- QA-чеклист покрывает известные проблемы из chitay-gorod
- Пути и компоненты соответствуют RU-сайту
