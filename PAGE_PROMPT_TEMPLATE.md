# PAGE_PROMPT_TEMPLATE.md
## Шаблон промпта для генерации новых страниц motka.design

Скопируй секцию **«ПРОМПТ»** и подставь свои значения вместо `{{...}}`.

---

## КАК ИСПОЛЬЗОВАТЬ

1. Открой Figma-фрейм страницы
2. Скопируй ссылку: **Share → Copy link** (формат `https://www.figma.com/design/...?node-id=...`)
3. Подставь значения в поля ниже
4. Отправь промпт в Claude Code из папки `C:/Users/orang/Claude/motka-design`

---

## ВХОДНЫЕ ДАННЫЕ

| Поле | Значение |
|------|---------|
| `{{FIGMA_URL}}` | Ссылка на Figma-фрейм страницы |
| `{{PAGE_FILENAME}}` | Имя файла, напр. `blog.html` или `portfolio/new-case.html` |
| `{{PAGE_TITLE}}` | Заголовок вкладки, напр. `Blog — Motka Design` |
| `{{META_DESCRIPTION}}` | SEO-описание (до 160 символов) |
| `{{OG_IMAGE_URL}}` | URL картинки для соцсетей (абсолютный). Дефолт: OG-картинка из SITE_SPEC |
| `{{PAGE_TYPE}}` | `root` — основная страница / `case` — кейс портфолио |

---

---
## ПРОМПТ
---

Ты верстальщик сайта **motka.design**, работающий в репозитории `C:/Users/orang/Claude/motka-design`.

## Задача
Создай HTML-страницу **`webflow-export/{{PAGE_FILENAME}}`** по дизайну из Figma.

## Figma
`{{FIGMA_URL}}`

Изучи фрейм: все секции, тексты, цвета, отступы, адаптивные состояния (desktop / tablet / mobile если есть).

## Компоненты (готовые блоки — вставить без изменений)

### `<head>` → файл `components/_head.html`
Вставь содержимое файла внутрь `<head>`, заменив плейсхолдеры:
- `{{PAGE_TITLE}}` → `{{PAGE_TITLE}}`
- `{{META_DESCRIPTION}}` → `{{META_DESCRIPTION}}`
- `{{OG_TITLE}}` → `{{PAGE_TITLE}}`
- `{{OG_DESCRIPTION}}` → `{{META_DESCRIPTION}}`
- `{{OG_IMAGE}}` → `{{OG_IMAGE_URL}}`
- `{{CANONICAL_URL}}` → `{{PAGE_FILENAME}}`

### Навигация
{% if PAGE_TYPE == "root" %}
→ файл `components/_nav.html` — вставить после `<body>`
{% else %}
→ файл `components/_nav-case.html` — вставить после `<body>`
{% endif %}

**Для `root`-страниц** (`components/_nav.html`): добавить `aria-current="page"` и класс `w--current` к активному пункту меню.

**Для кейсов** (`components/_nav-case.html`): добавить `aria-current="page"` и `w--current` к активному кейсу в дропдауне.

### Футер
{% if PAGE_TYPE == "root" %}
→ файл `components/_footer.html` — вставить перед `</body>`
{% else %}
→ файл `components/_footer-case.html` — вставить перед `</body>`
{% endif %}

### Dropdown-полифил (обязательно!)
Вставить перед `</body>`, ПОСЛЕ футера:
```html
<script>
// Webflow dropdown polyfill (non-Webflow hosting)
(function(){
  function open(dd){dd.classList.add('w--open');var t=dd.querySelector('.w-dropdown-toggle');var l=dd.querySelector('.w-dropdown-list');if(t)t.classList.add('w--open');if(l)l.classList.add('w--open');}
  function close(dd){dd.classList.remove('w--open');var t=dd.querySelector('.w-dropdown-toggle');var l=dd.querySelector('.w-dropdown-list');if(t)t.classList.remove('w--open');if(l)l.classList.remove('w--open');}
  function closeAll(){document.querySelectorAll('.w-dropdown.w--open').forEach(close);}
  function init(){
    document.querySelectorAll('.w-dropdown').forEach(function(dd){
      var toggle=dd.querySelector('.w-dropdown-toggle');
      if(!toggle)return;
      var isHover=dd.getAttribute('data-hover')==='true';
      if(isHover){dd.addEventListener('mouseenter',function(){open(dd);});dd.addEventListener('mouseleave',function(){close(dd);});}
      else{toggle.addEventListener('click',function(e){e.stopPropagation();var wasOpen=dd.classList.contains('w--open');closeAll();if(!wasOpen)open(dd);});}
    });
    document.addEventListener('click',closeAll);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
</script>
```

## Дизайн-система (из SITE_SPEC.md)

### Шрифты (уже загружены через `_head.html`)
| Шрифт | Веса | Назначение |
|-------|------|------------|
| Outfit | 300–700 | Основной UI (заголовки, nav) |
| Montserrat | 100–900 | Дисплейный |
| Open Sans | 300–800 | Body-текст |
| Roboto | 300–700 | Вспомогательный |
| Spectral | 300–700 | Акцентный serif |

### Брейкпоинты
| Условие | Назначение |
|---------|------------|
| `max-width: 1024px` | Desktop L → Tablet |
| `max-width: 991px` | Tablet (Webflow standard) |
| `max-width: 479px` | Mobile |

### Ключевые отступы
- Основной контейнер: `padding-left: 5vw; padding-right: 5vw` (≤1024px)
- Используй Webflow CSS-классы если они совпадают с дизайном: `w-container`, `w-layout-grid`, `w-row`, `w-col-*`

### Цвета (базовые)
- Белый: `#ffffff`
- Чёрный: `#000000`
- Тёплый бежевый: `#CEBFB8`
- Полная палитра — в Webflow CDN CSS (уже подключён через `_head.html`)

### CSS-классы (используй где подходит, не переизобретай)
- Обёртки: `.mtk-wrapper`, `.mtk-navbar`, `.mtk-header`
- Контент: `.wrapper`, `.wrapper-story`, `.designsystem`
- Кнопки: `.w-button`, `.mtk-cont-button`
- Формы: `.mtk-form`, `.mtk-form-field-line`, `.mtk-form-textfield`, `.mtk-submit-button`

## Правила вёрстки

1. **Никаких inline-стилей для цветов и типографики** — используй Webflow CSS-классы из CDN. Inline `style=""` только для фоновых изображений и уникальных значений которых нет в системе.
2. **Адаптив через медиа-запросы** в `<style>` внутри `<head>`, используя брейкпоинты выше.
3. **Картинки** — `loading="lazy"` на всех `<img>`, `alt` обязателен.
4. **Ссылки** — для `root`-страниц без префикса (`about.html`), для кейсов с `../` (`../about.html`).
5. **Body-класс**:
   - Root: `class="mtk-body-main-new"`
   - Case: `class="body overflow-x case-body"`
6. **HTML-структура**:
```html
<!DOCTYPE html>
<html>
<head>
  <!-- содержимое components/_head.html с заменёнными плейсхолдерами -->
</head>
<body class="mtk-body-main-new">

  <!-- components/_nav.html или _nav-case.html -->

  <!-- ОСНОВНОЙ КОНТЕНТ СТРАНИЦЫ -->
  <main>
    ...
  </main>

  <!-- components/_footer.html или _footer-case.html -->

  <!-- Webflow JS -->
  <script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c88953.js?site=623a4d65378e3dda4dd20f87" type="text/javascript"></script>
  <script src="https://cdn.prod.website-files.com/623a4d65378e3dda4dd20f87/js/webflow.schunk.1a807f015b216e46.js" type="text/javascript"></script>
  <script src="https://cdn.prod.website-files.com/623a4d65378e3dda4dd20f87/js/webflow.schunk.bc4682c1acbd769d.js" type="text/javascript"></script>
  <script src="https://cdn.prod.website-files.com/623a4d65378e3dda4dd20f87/js/webflow.600839c5.134caefc20243375.js" type="text/javascript"></script>

  <!-- Dropdown polyfill (обязательно) -->
  <script>/* ... вставить полифил из секции выше ... */</script>

</body>
</html>
```

## После создания файла
1. Проверь что нет `{{PLACEHOLDER}}` которые не были заменены
2. Проверь что нет `../https://` в путях (признак ошибки)
3. Проверь что `integrity=` отсутствует во всех `<link>` и `<script>`
4. Проверь что `data-wf-domain` отсутствует в `<html>`
5. Сохрани файл в `webflow-export/{{PAGE_FILENAME}}`

---

## ПРИМЕР ЗАПОЛНЕННОГО ПРОМПТА

```
Figma: https://www.figma.com/design/ABC123/motka-design?node-id=42-100
Файл: webflow-export/blog.html
Тип: root
Title: Blog — Motka Design
Description: Articles about product design, UX research and digital branding from Motka Design Studio.
OG Image: https://cdn.prod.website-files.com/623a4d65378e3dda4dd20f87/687a348de666b1ebd114983f_OG.png
```

---

## СПРАВКА: структура репозитория

```
motka-design/
├── components/
│   ├── _head.html          ← <head> шаблон (все скрипты, шрифты, стили)
│   ├── _nav.html           ← навигация для root-страниц
│   ├── _nav-case.html      ← навигация для кейсов (тёмная тема)
│   ├── _footer.html        ← футер для root-страниц
│   └── _footer-case.html   ← футер для кейсов (без DesignRush-бейджа)
├── webflow-export/
│   ├── index.html          ← референс: главная страница
│   ├── about.html          ← референс: About
│   ├── contacts.html       ← референс: Contacts (с формой)
│   ├── subscription.html   ← референс: Design Subscription
│   └── portfolio/
│       ├── algoritmika.html ← референс: типичный кейс
│       └── scan.html        ← референс: кейс (загружен с живого сайта)
├── SITE_SPEC.md            ← цвета, шрифты, брейкпоинты, классы
└── PAGE_PROMPT_TEMPLATE.md ← этот файл
```
