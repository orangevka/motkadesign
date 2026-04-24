"""
Local dev server с поддержкой URL без .html расширения.
Запуск: python serve.py [папка] [порт]
"""

import sys
import os
import posixpath
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class HTMLHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Strip literal ? and #
        path = path.split('?')[0].split('#')[0]
        # URL-decode: %3F → ? etc.
        path = urllib.parse.unquote(path)
        # Strip query/fragment that appeared after decoding
        path = path.split('?')[0].split('#')[0]
        path = posixpath.normpath(path)
        words = [w for w in path.split('/') if w]
        result = os.getcwd()
        for word in words:
            result = os.path.join(result, word)
        return result

    def send_head(self):
        path = self.path.split('?')[0].split('#')[0].rstrip('/')
        if not path:
            path = '/index'

        # Проверяем: есть ли path.html на диске?
        fs_path = self.translate_path(path + '.html')
        if os.path.isfile(fs_path):
            # Временно подменяем self.path и вызываем стандартный обработчик
            orig = self.path
            self.path = path + '.html'
            result = super().send_head()
            self.path = orig
            return result

        return super().send_head()

    def log_message(self, format, *args):
        code = args[1] if len(args) > 1 else '?'
        if code not in ('200', '304'):
            print(f"  {code}  {args[0]}")

if __name__ == '__main__':
    folder = sys.argv[1] if len(sys.argv) > 1 else 'webflow-export-ru'
    port   = int(sys.argv[2]) if len(sys.argv) > 2 else 8001

    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), folder))
    server = ThreadingHTTPServer(('127.0.0.1', port), HTMLHandler)
    print(f"Serving {folder}/ at http://127.0.0.1:{port}")
    server.serve_forever()
