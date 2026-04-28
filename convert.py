import re

with open('/Users/chensan/yunfan-pro-dev/index.html.bak', 'r') as f:
    content = f.read()

# Extract CSS (lines 13-42, inside <style>)
css_match = re.search(r'<style>\n(.*?)\n\s+</style>', content, re.DOTALL)
css = css_match.group(1) + '\n' if css_match else ''

# JSX starts at line 59 after <script type="text/babel">
jsx_start = content.find('<script type="text/babel">') + len('<script type="text/babel">\n')
jsx = content[jsx_start:]

# Convert class= → className= (but not classnName=)
jsx = re.sub(r'\bclass=(?!n)', 'className=', jsx)

# Handle className= inside attribute strings that have : "className="
# Actually the simple replacement above should work, let me verify with a quick check
# Check for any remaining class= (that aren't className=)
test = re.findall(r'class="[^"]*"', jsx)
print("Remaining class= attr count:", len(test))
if test:
    for x in test[:5]:
        print(" ", x)

print("---")
print("CSS lines:", css.count('\n'))
print("JSX lines:", jsx.count('\n'))