# SITE_SPEC.md — «Конституция» сайта motka.design

> Источник: HTTrack-зеркало `www.motka.design`, скачано 10 марта 2026
> CMS: Webflow | Домен: www.motka.design | Site ID: `623a4d65378e3dda4dd20f87`

---

## 1. Страницы сайта

### Основные страницы

| Файл | URL | Заголовок |
|------|-----|-----------|
| `index.html` | `/` | Motka Product Design Studio |
| `about.html` | `/about` | About |
| `portfolio.html` | `/portfolio` | Portfolio |
| `contacts.html` | `/contacts` | Contacts |
| `subscription.html` | `/subscription` | Design Subscription |
| `privacy-policy.html` | `/privacy-policy` | Privacy Policy |

### Кейсы портфолио (`/portfolio/`)

| Файл | Заголовок |
|------|-----------|
| `algoritmika.html` | Algoritmics |
| `ai-body.html` | AI Body |
| `globallab.html` | GlobalLab |
| `scan.html` | SCAN |
| `spherum.html` | Spherum |
| `moneywall.html` | Moneywall |
| `dunice.html` | Dunice |
| `logistic-saas-platform.html` | Logistic SaaS Platform |
| `mtx-connect.html` | MTX Connect |
| `deepgeo.html` | DeepGeo |
| `realatom.html` | RealAtom |
| `pokerswap.html` | PokerSwap |
| `news360.html` | News360 |
| `idx.html` | IDX |
| `mobile-apps.html` | Mobile Apps |
| `foodbuddy.html` | Foodbuddy |
| `sweep-net.html` | SweepNet |
| `branding.html` | Branding |
| `landing.html` | Landing |
| `ui-design.html` | UI Design |
| `congratz.html` | Congratz |

**Итого:** 6 основных страниц + 21 кейс портфолио = **27 страниц**

---

## 2. Цветовая палитра

> Основной CSS-файл (`motka-design.webflow.shared.*.min.css`) — внешний CDN, не скачан HTTrack.
> Цвета извлечены из inline-стилей HTML-файлов.

### Базовые цвета (из inline CSS)

| Цвет | Hex | Применение |
|------|-----|------------|
| Белый | `#ffffff` / `#fff` | Цвет текста кнопок submit, фон Clutch-виджета |
| Чёрный | `#000` | Акценты |
| Тёплый бежевый | `#CEBFB8` | Акцентный (найден в HTML) |

### Акцентные цвета кейсов (inline-стили страниц портфолио)

| Цвет | Hex | Кейс / применение |
|------|-----|-------------------|
| Тёмно-синий | `#273540` | — |
| Зелёный mint | `#2ACB88` | — |
| Тёмно-фиолетовый | `#2C2543` | — |
| Сиреневый | `#7D7DF2` | — |
| Светло-мятный | `#B6DBCE` | — |
| Светло-серый | `#CFCFCF` | — |
| Лаймово-жёлтый | `#E0F87E` | — |
| Розово-лососевый | `#EEA4AA` | — |
| Янтарный | `#F79E1B` | — |
| Светло-жёлтый | `#FDFF8D` | — |
| Коралловый | `#FF7379` | — |
| Персиковый | `#FFE27B` | — |

> **Примечание:** полная палитра (фоны, тексты, border-цвета) хранится в `motka-design.webflow.shared.*.min.css` на CDN Webflow.

---

## 3. Типографика

### Шрифтовые семейства

| Шрифт | Начертания | Назначение |
|-------|-----------|------------|
| **Outfit** | 300, 400, 500, 600, 700 | Основной UI-шрифт (заголовки, навигация) |
| **Montserrat** | 100–900 (все) | Дополнительный дисплейный |
| **Open Sans** | 300–800 (+ italic) | Текстовый / body |
| **Roboto** | 300, 400, 500, 600, 700 | Вспомогательный |
| **Spectral** | 300, 400, 500, 600, 700 | Акцентный / serif |

Загрузка через **WebFont.js v1.6.26**:
```javascript
WebFont.load({
  google: {
    families: [
      "Open Sans:300,300italic,400,400italic,600,600italic,700,700italic,800,800italic",
      "Montserrat:100,100italic,...,900,900italic",
      "Outfit:300,400,500,600,700",
      "Roboto:300,400,500,600,700",
      "Spectral:300,400,500,600,700"
    ]
  }
});
```

### Размеры шрифтов (из inline CSS)

| Класс | Desktop | ≤1024px | ≤479px |
|-------|---------|---------|--------|
| `.heading-4` | — | `80px` | `48px` / `line-height: 42px` |

> Остальные типографические стили — в Webflow CSS (CDN).

### Сглаживание шрифтов
```css
body { -webkit-font-smoothing: antialiased; }
```

---

## 4. Отступы и брейкпоинты адаптива

### Медиа-запросы (breakpoints)

| Брейкпоинт | Условие | Назначение |
|------------|---------|------------|
| Desktop L | `max-width: 1024px` | Большой планшет / малый десктоп |
| Tablet | `max-width: 991px` | Планшет (Webflow standard) |
| Mobile | `max-width: 479px` | Мобильный (Webflow standard) |

### Ключевые отступы

```css
/* ≤1024px */
.wrapper-story, .designsystem       { padding-left: 5vw; }
.wrapper,
.footer-thin-container.maincont80.limited { padding-left: 5vw; padding-right: 5vw; }

/* ≤991px */
.w-container .columns-9.w-row { margin-left: 0; margin-right: 0; }

/* CSS Columns (портфолио-ссылки) */
.designlinks .portlinks {
  column-width: 250px;
  column-count: 3;
  column-gap: 30px;
}
```

---

## 5. Структура навигации и футера

### Навигация

```
[Logo: Motka Design]  →  /

[Portfolio]  →  /about  (таб + дропдаун)
  └── Dropdown (tab/desktop):
        Algorithmics 🦄  →  /portfolio/algoritmika.html
        AI Body 🔮       →  /portfolio/ai-body.html
        GlobalLab 🐱     →  /portfolio/globallab.html
        SCAN 🤖          →  /portfolio/scan.html
        Spherum 🎮       →  /portfolio/spherum.html
        Moneywall 💰     →  /portfolio/moneywall.html
        Dunice 🌱        →  /portfolio/dunice.html
        All cases        →  /portfolio.html

  └── Dropdown (desktop/tablet — .dt-mob):
        Logistic SaaS    →  /portfolio/logistic-saas-platform.html
        Algorithmics 🦄  →  /portfolio/algoritmika.html
        AI Body 🔮       →  /portfolio/ai-body.html
        MTX Connect 🐱   →  /portfolio/mtx-connect.html
        DeepGeo 🐱       →  /portfolio/deepgeo.html
        GlobalLab 🐱     →  /portfolio/globallab.html
        SCAN 🤖          →  /portfolio/scan.html
        All cases        →  /portfolio.html

[About]               →  /about.html
[Design Subscription] →  /subscription.html
[Contact us]          →  /contacts.html   (класс .last-nav)

[Hamburger]  →  .mtk-menu-button-3.w-nav-button  (мобильный)
```

### Футер

```
© [year]  Motka d.o.o.  1260 Ljubljana Novo Polje, Cesta XII. All rights reserved.

hello@motka.design  (mailto:)

[LinkedIn icon]  →  linkedin.com/company/motkadesign/
[Behance icon]   →  behance.net/motkastudio

[DesignRush badge]  →  designrush.com/best-designs/websites

[Cookie banner]  →  .mtk-cookie  (Finsweet Cookie Consent)
  "We care about your data..."  →  ссылка на /privacy-policy.html
```

---

## 6. CSS-классы навигации и футера

### Навигация

| Класс | Элемент |
|-------|---------|
| `.mtk-header` | Обёртка всей шапки |
| `.mtk-wrapper.nav-wrapper` | Контейнер навбара |
| `.mtk-navbar.w-nav` | Webflow navbar (root) |
| `.mtk-top-nav` | Горизонтальная полоска навбара |
| `.mtk-logo-new.w-nav-brand` | Логотип-ссылка |
| `.mtk-top-logo-new` | Изображение логотипа |
| `.mtk-nav-menu.w-nav-menu` | Контейнер меню |
| `.tab-port-link-cont` | Обёртка таба Portfolio |
| `.mtk-nav-link` | Обычная ссылка в nav |
| `.mtk-nav-link.tab-port-link.w-nav-link` | Таб «Portfolio» |
| `.mtk-nav-link.first-nav.w-dropdown` | Дропдаун (таб) |
| `.mtk-nav-link.first-nav.dt-mob.w-dropdown` | Дропдаун (десктоп) |
| `.dropdown-toggle.tab-drop.w-dropdown-toggle` | Кнопка открытия дропдауна |
| `.dropdown-arrow` | Иконка стрелки дропдауна |
| `.dropdown-nav.tad-drop-nav.w-dropdown-list` | Список таб-дропдауна |
| `.dropdown-nav.w-dropdown-list` | Список десктоп-дропдауна |
| `.w-layout-hflex.dropdown-link-cont` | Flex-контейнер ссылок дропдауна |
| `.dropdown-link-new.w-dropdown-link` | Ссылка в дропдауне |
| `.spanemoji.nav-emoji` | Emoji-иконки в nav |
| `.arrow-link` | Иконка стрелки «All cases» |
| `.mtk-nav-link.last-nav` | Последний пункт меню (Contact us) |
| `.mtk-menu-button-3.w-nav-button` | Гамбургер (мобильный) |

### Футер

| Класс | Элемент |
|-------|---------|
| `.mtk-footer-cont` | Внешний контейнер футера |
| `.mtk-footer-new` | Внутренний flex/grid футера |
| `.mtk-copyright` | Копирайт-строка |
| `.this-year` | `<span>` с текущим годом (JS) |
| `.mtk-footer-link` | Ссылка на юрлицо Motka d.o.o. |
| `.links-contact` | Блок с email |
| `.mtk-maillink` | Ссылка email |
| `.mtk-footer-links.w-list-unstyled` | Список соцсетей |
| `.mtk-footer-li-link` | Элемент списка соцсети |
| `.link-block-3.w-inline-block` | Блок LinkedIn |
| `.image-24` | Иконка LinkedIn |
| `.footer-link.w-inline-block` | Блок Behance |
| `.mtk-designrush-bage` | Обёртка бейджа DesignRush |
| `.mtk-badge-content` | Контент бейджа |
| `.mtk-badge-content_logo` | Логотип бейджа |
| `.badge-content_logo-link.hide.w-inline-block` | Ссылка бейджа |
| `.mtk-badge-content_logo-img` | Изображение бейджа |
| `.mtk-cookie.w-container` | Cookie-баннер |
| `.bottom-cookie-wrapper` | Обёртка баннера |
| `.cookie-content.mobile-vertical` | Контент баннера |
| `.cookie-text-cont` | Текст баннера |
| `.simple-link` | Ссылка на privacy-policy в баннере |

---

## 7. Внешние зависимости

### CSS

| Ресурс | URL / путь |
|--------|-----------|
| **Webflow CSS** (основной) | `cdn.prod.website-files.com/623a4d65378e3dda4dd20f87/css/motka-design.webflow.shared.783500890.min.css` |
| **Google Fonts preconnect** | `https://fonts.googleapis.com/` + `https://fonts.gstatic.com/` |

### JavaScript

| Библиотека | Источник | Версия / ID |
|-----------|---------|-------------|
| **WebFont.js** | `ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js` | v1.6.26 |
| **jQuery** | `d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min...` | v3.5.1 |
| **Webflow chunk 1** | `js/webflow.schunk.1a807f015b216e46.js` | — |
| **Webflow chunk 2** | `js/webflow.schunk.bc4682c1acbd769d.js` | — |
| **Webflow main** | `js/webflow.600839c5.134caefc20243375.js` | — |
| **Google Analytics 4** | `https://www.googletagmanager.com/gtag/js?id=G-7F3JRMTQCG` | GA4: `G-7F3JRMTQCG` |
| **Google reCAPTCHA** | `www.google.com/recaptcha/api.js` | v3 |
| **Yandex Metrika** | `mc.yandex.ru/metrika/tag.js` | ID: `95914791` |
| **Finsweet Cookie Consent** | `cdn.jsdelivr.net/npm/@finsweet/cookie-consent@1/fs-cc.js` | режим: informational, срок: 180 дней |
| **Clutch Reviews Widget** | `widget.clutch.co/static/js/widget.js` | type: 12, IDs: 2013039, 2011229, 2009665, 2006053 |

### Иконки и медиа (CDN Webflow)

| Ресурс | Путь |
|--------|------|
| Favicon | `cdn.prod.website-files.com/.../62457946a7ad35d7dfdf8462_MOTKA-favicon.png` |
| Apple Touch Icon | `cdn.prod.website-files.com/.../6243555f7900989f3ee6ba39_MOTKA-256.png` |
| Логотип (SVG) | `cdn.prod.website-files.com/.../65c0e83fc177319cdbeff1ac_red-logo.svg` |
| OG Image | `cdn.prod.website-files.com/.../687a348de666b1ebd114983f_OG.png` |

---

## Мета-информация

- **Webflow Page ID (index):** `65b8d14e7223ea41ff7cc227`
- **Webflow Site ID:** `623a4d65378e3dda4dd20f87`
- **Опубликовано:** Tue Mar 03 2026 12:04:29 GMT
- **Юрлицо:** Motka d.o.o., 1260 Ljubljana Novo Polje, Cesta XII, Slovenia
- **Email:** hello@motka.design
- **Telegram:** https://t.me/hellomotka
- **WhatsApp:** +38670621218
- **LinkedIn:** linkedin.com/company/motkadesign/
- **Behance:** behance.net/motkastudio
