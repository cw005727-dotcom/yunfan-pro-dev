import re

def to_html_entities(match):
    char = match.group(0)
    if ord(char) > 127:
        return f"&#x{ord(char):04X};"
    return char

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace all non-ASCII characters with HTML entities
new_content = re.sub(r'[^\x00-\x7f]', to_html_entities, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(new_content)
