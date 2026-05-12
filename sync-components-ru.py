#!/usr/bin/env python3
"""
sync-components-ru.py — Синхронизирует компоненты во всех страницах webflow-export-ru/

Компоненты читаются из webflow-export-ru/components/:
  _nav-light.html  — светлая навигация
  _nav-dark.html   — тёмная навигация (case-body без case-light)
  _popup.html      — попап «Заказать дизайн» + sticky кнопка
  _footer.html     — куки + футер

Для каждой .html страницы:
  1. Удаляет <style> из <head>
  2. Заменяет nav (light/dark по классу <body>)
  3. Заменяет popup (или вставляет перед nav если нет)
  4. Заменяет footer

Запуск:
  python sync-components-ru.py           # обновить всё
  python sync-components-ru.py --dry-run # показать изменения без записи
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent / "webflow-export-ru"
COMP = ROOT / "components"
DRY_RUN = "--dry-run" in sys.argv

# ── Читаем компоненты ──────────────────────────────────────────────────────
nav_light = (COMP / "_nav-light.html").read_text(encoding="utf-8").strip()
nav_dark  = (COMP / "_nav-dark.html").read_text(encoding="utf-8").strip()
popup     = (COMP / "_popup.html").read_text(encoding="utf-8").strip()
footer    = (COMP / "_footer.html").read_text(encoding="utf-8").strip()

# ── Утилиты ────────────────────────────────────────────────────────────────

def find_nav_block(html):
    """Найти (start, end) nav-блока. end включает закрывающий </div>."""
    # Паттерн A: новый nav — mtk-header-category
    m = re.search(r'<div\b[^>]*\bclass="mtk-header-category[^"]*"[^>]*>', html)
    # Паттерн B: старый nav — case-navbar без внешней обёртки mtk-header-category
    if not m:
        m = re.search(r'<div\b[^>]*\bclass="[^"]*\bcase-navbar\b[^"]*"[^>]*>', html)
    if not m:
        return None
    start = m.start()

    # Определяем конец: w-embed (пустой или со style) + закрывающий </div>
    # Ищем с некоторым отступом от начала
    tail = html[start + 200:]

    # Вариант A: <div class="w-embed"></div></div>
    a = tail.find('<div class="w-embed"></div></div>')
    # Вариант B: <div class="w-embed"><style>...</style></div></div>
    mb = re.search(r'<div class="w-embed"><style>.*?</style></div></div>', tail, re.DOTALL)
    b = mb.start() if mb else -1

    if a == -1 and b == -1:
        return None

    if a != -1 and (b == -1 or a <= b):
        end_offset = a + len('<div class="w-embed"></div></div>')
    else:
        end_offset = mb.end()

    return start, start + 200 + end_offset


def find_popup_block(html):
    """Найти (start, end) popup-блока (form-wrapper + buttom-design-wrapper)."""
    start = html.find('<div class="form-wrapper popup">')
    if start == -1:
        return None
    # buttom-design-wrapper заканчивается двумя закрывающими </div></div>
    btn_idx = html.find('buttom-design-wrapper', start)
    if btn_idx == -1:
        return None
    btn_end = html.find('</div></div>', btn_idx)
    if btn_end == -1:
        return None
    return start, btn_end + len('</div></div>')


def find_footer_block(html):
    """Найти (start, end) footer-блока."""
    start = html.find('<div id="cookieContainer"')
    if start == -1:
        return None
    end = html.rfind('</footer>')
    if end == -1:
        return None
    return start, end + len('</footer>')


def remove_head_styles(html):
    """Удалить все <style>…</style> из <head>."""
    def strip_styles(m):
        return re.sub(r'\n?[ \t]*<style>.*?</style>', '', m.group(0), flags=re.DOTALL)
    return re.sub(r'(?s)<head>.*?</head>', strip_styles, html)


def is_dark_nav(html):
    """True если страница требует тёмной навигации."""
    m = re.search(r'<body\b[^>]+class="([^"]+)"', html)
    if not m:
        return False
    cls = m.group(1)
    return 'case-body' in cls and 'case-light' not in cls


# ── Основной цикл ──────────────────────────────────────────────────────────
updated = []
no_nav  = []
errors  = []

SKIP_DIRS  = {'components', '.backups'}
SKIP_FILES = {'services-old.html'}

for html_file in sorted(ROOT.glob("**/*.html")):
    # Пропускаем компоненты и резервные копии
    parts = html_file.relative_to(ROOT).parts
    if any(p in SKIP_DIRS for p in parts[:-1]):
        continue
    if html_file.name in SKIP_FILES:
        continue

    try:
        original = html_file.read_text(encoding="utf-8")
        html = original
        changes = []

        # 1. Удалить <style> из <head>
        h2 = remove_head_styles(html)
        if h2 != html:
            changes.append("head <style> удалены")
            html = h2

        # 2. Заменить nav (если найден)
        nav_block = find_nav_block(html)
        new_nav = nav_dark if is_dark_nav(html) else nav_light
        if nav_block:
            s, e = nav_block
            html = html[:s] + new_nav + html[e:]
            changes.append("nav")

        # 3. Заменить popup (или вставить перед nav)
        popup_block = find_popup_block(html)
        if popup_block:
            s, e = popup_block
            html = html[:s] + popup + html[e:]
            changes.append("popup")
        else:
            # Вставить перед nav
            nb2 = find_nav_block(html)
            if nb2:
                s2, _ = nb2
                html = html[:s2] + popup + "\n\n" + html[s2:]
                changes.append("popup вставлен")

        # 2.5. Если nav не был найден — вставить после popup
        if not nav_block:
            pb = find_popup_block(html)
            if pb:
                _, pe = pb
                html = html[:pe] + "\n\n" + new_nav + html[pe:]
                changes.append("nav вставлен")
            else:
                no_nav.append(html_file.relative_to(ROOT))

        # 4. Заменить footer
        footer_block = find_footer_block(html)
        if footer_block:
            s, e = footer_block
            html = html[:s] + footer + html[e:]
            changes.append("footer")

        if html == original:
            continue

        if not DRY_RUN:
            html_file.write_text(html, encoding="utf-8")

        updated.append((html_file.relative_to(ROOT), ", ".join(changes)))

    except Exception as ex:
        errors.append((html_file.relative_to(ROOT), str(ex)))

# ── Отчёт ──────────────────────────────────────────────────────────────────
mode = " [DRY-RUN]" if DRY_RUN else ""
print(f"\nОбновлено{mode}: {len(updated)}")
for f, ch in updated:
    print(f"  + {f}  [{ch}]")

if no_nav:
    print(f"\nNav не найден ({len(no_nav)}):")
    for f in no_nav:
        print(f"  ? {f}")

if errors:
    print(f"\nОшибки: {len(errors)}")
    for f, e in errors:
        print(f"  ! {f}: {e}")
