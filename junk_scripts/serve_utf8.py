import http.server
import socketserver
import os

PORT = 8501 # Cloudflare Tunnel typically points here
PORT_ALT = 8502

class Utf8Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Force UTF-8 encoding header
        if self.path.endswith(".html") or self.path == "/":
            self.send_header('Content-Type', 'text/html; charset=utf-8')
        super().end_headers()

def run_server(port):
    try:
        handler = Utf8Handler
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"Serving at port {port} with UTF-8 enforcement")
            httpd.serve_forever()
    except Exception as e:
        print(f"Port {port} failed: {e}")

if __name__ == "__main__":
    import threading
    # Run on both ports to be safe
    t1 = threading.Thread(target=run_server, args=(8501,))
    t2 = threading.Thread(target=run_server, args=(8502,))
    t1.start()
    t2.start()
    t1.join()
    t2.join()
