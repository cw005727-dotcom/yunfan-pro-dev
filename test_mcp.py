#!/usr/bin/env python3
import urllib.request, json, ssl, sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

MCP_KEY = 'd2rndfo4ykr0djdta1hbbk1uqvbsdz09'
MCP_URL = 'https://mcp.sorftime.com'
payload = json.dumps({
    'jsonrpc': '2.0', 'method': 'tools/call',
    'params': {'name': 'tiktok_category_report', 'arguments': {'site': 'US', 'nodeId': ''}}, 'id': 1
}).encode()

req = urllib.request.Request(
    MCP_URL + '?key=' + MCP_KEY, data=payload,
    headers={
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'User-Agent': 'Mozilla/5.0',
    },
    method='POST'
)
proxy_handler = urllib.request.ProxyHandler({})
opener = urllib.request.build_opener(proxy_handler)

try:
    with opener.open(req, timeout=30) as resp:
        raw = resp.read().decode()
        print('raw len:', len(raw))
        print('raw repr:', repr(raw[:500]))
        for line in raw.split('\n'):
            if line.startswith('data: '):
                d = json.loads(line[6:])
                content = d.get('result', {}).get('content', [{}])
                text = content[0].get('text', '{}') if content else '{}'
                print('text repr:', repr(text[:500]))
                break
except Exception as e:
    print('error:', type(e).__name__, e)
