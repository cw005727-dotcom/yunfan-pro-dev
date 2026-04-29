import html
import re

def decode_entities(content):
    # This will decode &#x...; and &#...; entities
    return html.unescape(content)

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

decoded_content = decode_entities(content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(decoded_content)
