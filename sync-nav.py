#!/usr/bin/env python3
"""
sync-nav.py — Синхронизирует навигацию из components/_nav.html и _nav-case.html
во все страницы webflow-export/

Определяет тему по классу body:
  - class="body overflow-x"            → _nav.html  (светлый)
  - class="body overflow-x case-body"  → _nav-case.html (тёмный)

Запуск:
  python sync-nav.py           # обновить все файлы
  python sync-nav.py --dry-run # показать, что изменится, не записывая
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
DRY_RUN = "--dry-run" in sys.argv

def extract_nav(path):
    """Извлекает строку <div class="mtk-header..."> из файла компонента."""
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        if line.strip().startswith('<div class="mtk-header'):
            return line.strip()
    raise ValueError(f"Nav div not found in {path}")

# Читаем компоненты
nav_light = extract_nav(ROOT / "components" / "_nav.html")
nav_dark  = extract_nav(ROOT / "components" / "_nav-case.html")

# Nav всегда на одной строке, начинается с <div class="mtk-header" (light или dark)
NAV_LINE = re.compile(r'<div class="mtk-header[^"]*">[^\n]*')

updated = []
skipped = []
errors  = []

for html_file in sorted(ROOT.glob("webflow-export/**/*.html")):
    try:
        content = html_file.read_text(encoding="utf-8")

        if 'class="mtk-header' not in content:
            skipped.append((html_file.relative_to(ROOT), "нет mtk-header"))
            continue

        # Определяем тему
        is_dark = bool(re.search(r'class="body[^"]*case-body', content))
        new_nav = nav_dark if is_dark else nav_light

        new_content = NAV_LINE.sub(new_nav, content)

        if new_content == content:
            skipped.append((html_file.relative_to(ROOT), "без изменений"))
            continue

        if not DRY_RUN:
            html_file.write_text(new_content, encoding="utf-8")

        theme = "dark" if is_dark else "light"
        updated.append((html_file.relative_to(ROOT), theme))

    except Exception as e:
        errors.append((html_file.relative_to(ROOT), str(e)))

# Отчёт
mode = " [DRY-RUN]" if DRY_RUN else ""
print(f"\nОбновлено{mode}: {len(updated)} файлов")
for f, theme in updated:
    print(f"  + {f}  ({theme})")

if skipped:
    without_changes = [(f, r) for f, r in skipped if r == "без изменений"]
    no_nav = [(f, r) for f, r in skipped if r != "без изменений"]
    if no_nav:
        print(f"\nПропущено (нет nav): {len(no_nav)}")
        for f, r in no_nav:
            print(f"  - {f}")
    if without_changes:
        print(f"\nБез изменений: {len(without_changes)}")

if errors:
    print(f"\nОшибки: {len(errors)}")
    for f, e in errors:
        print(f"  ! {f}: {e}")
