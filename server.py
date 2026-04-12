#!/usr/bin/env python3
"""Local dev server with clean URL support (serves .html without extension)"""
import http.server
import os
import sys

PORT = 8080

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Try path as-is first
        path = self.translate_path(self.path)
        if os.path.isfile(path):
            return super().do_GET()
        # Try adding .html
        if not self.path.endswith('.html') and not '.' in os.path.basename(self.path):
            html_path = path + '.html'
            if os.path.isfile(html_path):
                self.path = self.path + '.html'
        return super().do_GET()

    def log_message(self, format, *args):
        print(f"  {args[0]} {args[1]}")

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    with http.server.HTTPServer(('', port), CleanURLHandler) as httpd:
        print(f"Server running at http://localhost:{port}/")
        print("Press Ctrl+C to stop")
        httpd.serve_forever()
