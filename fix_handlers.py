src = open('/Users/chensan/yunfan-pro-dev/api_server.py').read()
lines = src.split('\n')

# ─────────────────────────────────────────────────
# Fix 1: catchall (L1230 = index 1229)
#   handler: lines[1229] = '        elif path.startswith("/api/"):'
#   body:    lines[1230] = '            self.send_json(...)'
# Strategy: replace the body line with try/except wrapped version
# ─────────────────────────────────────────────────
catchall_body = lines[1230]  # '            self.send_json({"error": "Not found"}, status=404)'
print(f"Catchall body: {repr(catchall_body)}")

# Replace lines[1230] with: try line + original body + except block
indent_12 = '            '
wrapped = [
    indent_12 + 'try:',
    catchall_body,
    indent_12 + 'except Exception as e:\n' + indent_12 + '    logger.error(f"Catchall error: {e}")',
]
lines[1230:1231] = wrapped
print(f"Replaced 1 line with {len(wrapped)} lines (now at index 1230-1232)")

# ─────────────────────────────────────────────────
# Fix 2: generate_auth_url
#   Find it in current modified lines (line numbers shifted by 3)
# ─────────────────────────────────────────────────
for i, line in enumerate(lines):
    if line.strip() == 'elif path == "/api/generate_auth_url":':
        auth_handler_idx = i
        break

print(f"Auth handler at L{auth_handler_idx+1}")

# Find the auth_url = f"..." line (body starts at next non-comment)
auth_url_idx = None
for i in range(auth_handler_idx+1, auth_handler_idx+4):
    if 'auth_url = f"https://auth' in lines[i]:
        auth_url_idx = i
        break

print(f"Auth URL code at L{auth_url_idx+1}: {lines[auth_url_idx].strip()[:50]}")
print(f"wfile at L{auth_url_idx+2}: {lines[auth_url_idx+1].strip()[:50]}")
print(f"next handler at L{auth_url_idx+3}: {lines[auth_url_idx+2].strip()[:50]}")

# Replace the two code lines with try/body1/body2/except
wrapped2 = [
    indent_12 + 'try:',
    lines[auth_url_idx],       # auth_url = f"..."
    lines[auth_url_idx+1],     # self.wfile.write(...)
    indent_12 + 'except Exception as e:\n' + indent_12 + '    logger.error(f"Auth URL error: {e}")',
]
lines[auth_url_idx:auth_url_idx+2] = wrapped2
print(f"Replaced 2 lines with {len(wrapped2)} lines")

open('/Users/chensan/yunfan-pro-dev/api_server.py', 'w').write('\n'.join(lines))
print("Written")

# Verify
import ast
ast.parse(open('/Users/chensan/yunfan-pro-dev/api_server.py').read())
print("✅ Syntax OK")