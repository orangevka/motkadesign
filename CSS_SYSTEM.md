# CSS_SYSTEM.md — Система классов motka.design

> Источник истины по вёрстке. Используй только эти классы при создании новых страниц.
> Все кастомные классы — с префиксом `mtk-`. Webflow-классы (`w-*`) — только в компонентах nav/footer.

---

## Подключение

```html
<!-- В <head> после Webflow CSS -->
<link href="styles.css" rel="stylesheet"/>        <!-- root-страницы -->
<link href="../styles.css" rel="stylesheet"/>     <!-- /portfolio/ страницы -->
```

---

## Компоненты (include-блоки)

| Файл | Где использовать |
|------|-----------------|
| `components/_head.html` | Внутрь `<head>` на каждой странице |
| `components/_nav.html` | Шапка root-страниц (index, about, portfolio, contacts, subscription, privacy-policy) |
| `components/_nav-case.html` | Шапка страниц `/portfolio/` |
| `components/_footer.html` | Подвал root-страниц (с DesignRush-бейджем) |
| `components/_footer-case.html` | Подвал страниц `/portfolio/` (без бейджа) |
| `components/_contact-form.html` | Форма обратной связи |
| `components/_scripts.html` | Перед `</body>` на каждой странице |

### Как собирать страницу

```html
<!DOCTYPE html>
<html>
<head>
  <!-- содержимое _head.html с заполненными плейсхолдерами -->
</head>
<body class="mtk-body-main-new">

  <!-- содержимое _nav.html -->

  <main>
    <!-- уникальный контент страницы -->
  </main>

  <!-- содержимое _footer.html -->

  <!-- содержимое _scripts.html -->
</body>
</html>
```

---

## Плейсхолдеры `_head.html`

| Плейсхолдер | Пример |
|-------------|--------|
| `{{PAGE_TITLE}}` | `Services — Motka Design` |
| `{{META_DESCRIPTION}}` | До 160 символов |
| `{{OG_TITLE}}` | = PAGE_TITLE |
| `{{OG_DESCRIPTION}}` | = META_DESCRIPTION |
| `{{OG_IMAGE}}` | Абсолютный URL (дефолт: OG.png на CDN) |
| `{{CANONICAL_URL}}` | `services.html` или `portfolio/algoritmika.html` |
| `{{BASE_URL}}` | `""` для root, `"../"` для /portfolio/ |

---

## CSS Design Tokens (CSS-переменные)

```css
--mtk-font-display:    'Factor A', 'Outfit', sans-serif   /* заголовки, nav, UI */
--mtk-font-serif:      'Spectral', serif                   /* текстовые блоки */
--mtk-font-body:       'Outfit', 'Open Sans', sans-serif  /* общий текст */

--mtk-color-ink:       #333       /* основной цвет текста */
--mtk-color-bg:        #fff       /* фон */
--mtk-color-sand:      #F3EFED   /* теги, фоны плашек */
--mtk-color-sand-dark: #E4DDD9   /* hover на тегах */
--mtk-color-accent:    #FF7379   /* акцент (красный Motka) */

--mtk-space-page-h:    40px      /* горизонтальный padding (5vw на ≤1024px) */
--mtk-space-section:   64px      /* вертикальный padding секции */
--mtk-max-width:       1440px    /* максимальная ширина контента */
```

---

## Layout-классы

| Класс | Описание |
|-------|----------|
| `.mtk-page-wrap` | Центрирующая обёртка, max-width: 1440px |
| `.mtk-section` | Секция, фон белый |
| `.mtk-section-inner` | Внутренний padding секции (64px 40px) |
| `.mtk-hero-section` | Hero-секция (padding: 32px 40px 0) |
| `.mtk-hero-sub-wrap` | Блок под hero-заголовком (padding: 24px 40px 64px) |

---

## Типографика

| Класс | Шрифт | Размер | Использование |
|-------|-------|--------|---------------|
| `.mtk-h1` | display | 94px / 72px / 56px / 36px | Hero-заголовок страницы |
| `.mtk-h2` | display | 50px / 38px / 28px | Заголовок секции |
| `.mtk-h3-teaser` | display | 35px / 26px / 20px | Подзаголовок / teaser |
| `.mtk-hero-sub` | serif | 26px / 18px | Подзаголовок hero |
| `.mtk-body-text` | serif | 20px / 16px | Основной текст |
| `.mtk-caption` | display | 16px | Мелкий текст, подписи |

> Размеры: desktop / ≤991px / ≤479px

---

## Интерактивные элементы

### CTA-ссылка («Contact us →»)
```html
<a href="contacts.html" class="mtk-cta-link">
  <span class="mtk-cta-text">Contact us</span>
  <img src="..." alt="" class="mtk-cta-arrow"/>
</a>
```

### Тег / pill (фильтр)
```html
<a href="#ui" class="mtk-tag">UI Design</a>
<a href="#branding" class="mtk-tag is-active">Branding</a>
```

### Sticky bar с тегами
```html
<div class="mtk-tags-bar">
  <div class="mtk-tags-bar-inner">
    <a class="mtk-tag is-active" href="#all">All</a>
    <a class="mtk-tag" href="#ui">UI Design</a>
    ...
  </div>
</div>
```

---

## Карточки

```html
<div class="mtk-cards">
  <div class="mtk-card">
    <img src="..." class="mtk-card-illus"/>
    <h3 class="mtk-card-title">Card title</h3>
    <p class="mtk-card-text">Description text here.</p>
  </div>
  ...
</div>
```

---

## CTA-баннер

```html
<div class="mtk-cta-banner" style="background: #EDD5B3;">
  <div class="mtk-cta-banner-content">
    <h2 class="mtk-cta-banner-title">Banner title</h2>
    <p class="mtk-cta-banner-text">Banner description.</p>
    <a href="contacts.html" class="mtk-cta-link">
      <span class="mtk-cta-text">Get in touch</span>
      <img src="..." class="mtk-cta-arrow"/>
    </a>
  </div>
</div>
```

---

## Chips (теги-примеры)

```html
<div class="mtk-chips">
  <span class="mtk-chip">Mobile app</span>
  <span class="mtk-chip">EdTech</span>
</div>
```

---

## Структура <body>

| `class` на `<body>` | Где использовать |
|---------------------|-----------------|
| `mtk-body-main-new` | Все основные страницы |
| `mtk-body-main-new body-part-page` | Страницы с боковым отступом (about, contacts) |

---

## Правила именования

1. **Все кастомные классы — с префиксом `mtk-`**. Не `svc-btn`, а `mtk-btn`.
2. **Webflow-классы** (`w-nav`, `w-dropdown` и др.) оставляем в nav/footer-компонентах — не трогаем.
3. **Состояния** — через модификатор `is-*`: `is-active`, `is-peek`, `is-unsticky`.
4. **Уникальные стили страницы** (которых нет в system) — инлайн `<style>` в `<head>` с комментарием.
5. **Никаких `style=""` атрибутов** кроме переменных цвета для уникальных секций (напр. `style="background: #EDD5B3"`).

---

## Что НЕ делать

- ❌ Не дублировать в `<style>` то, что уже есть в `styles.css`
- ❌ Не создавать новые префиксы (`svc-`, `pg-`, `page-`, `block-`)
- ❌ Не писать `font-family: 'Outfit'` инлайн — используй `var(--mtk-font-display)`
- ❌ Не копировать инлайн-стили из HTTrack-страниц в новые страницы
