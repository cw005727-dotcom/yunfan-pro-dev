#!/usr/bin/env python3
"""
部署 Webhook 监听器
用法: python3 deploy-webhook.py [port]
默认端口 8123

触发方式: curl -X POST http://47.76.179.242:8123/deploy
"""
import http.server
import socketserver
import subprocess
import os
import sys
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
TOKEN = "chensan-deploy-2026"
PROJECT_DIR = Path(__file__).parent.resolve()

class DeployHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if not self.path.startswith('/deploy'):
            self.send_error(404)
            return

        # 简单的 token 验证
        auth = self.headers.get('Authorization', '')
        if f'Bearer {TOKEN}' not in auth and auth != TOKEN:
            self.send_response(401)
            self.end_headers()
            self.wfile.write(b'Unauthorized')
            return

        print(f'[{self.log_date_time_string()}] Deploy triggered!')

        try:
            # git pull
            pull = subprocess.run(
                ['git', 'pull', 'origin', 'main'],
                cwd=PROJECT_DIR,
                capture_output=True, text=True, timeout=60
            )
            print('git pull:', pull.stdout, pull.stderr)

            # npm run build
            build = subprocess.run(
                ['npm', 'run', 'build'],
                cwd=PROJECT_DIR,
                capture_output=True, text=True, timeout=120
            )
            print('build:', build.stdout[-500:] if build.stdout else '', build.stderr[-500:] if build.stderr else '')

            # pm2 restart
            restart = subprocess.run(
                ['pm2', 'restart', 'yunfan-pro', '--update-env'],
                capture_output=True, text=True, timeout=30
            )
            print('pm2 restart:', restart.stdout, restart.stderr)

            self.send_response(200)
            self.end_headers()
            self.wfile.write(f'OK\npull={pull.returncode} build={build.returncode} restart={restart.returncode}\n'.encode())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f'Error: {e}'.encode())
            print('Error:', e)

    def log_message(self, format, *args):
        print(f'[Webhook] {format % args}')

if __name__ == '__main__':
    print(f'Deploy webhook listening on port {PORT}')
    print(f'Project: {PROJECT_DIR}')
    print(f'Trigger: curl -X POST -H "Authorization: Bearer {TOKEN}" http://47.76.179.242:{PORT}/deploy')
    with socketserver.TCPServer(('', PORT), DeployHandler) as httpd:
        httpd.serve_forever()
