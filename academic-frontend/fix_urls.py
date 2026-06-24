import re

with open('js/dashboard.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace single-quoted hardcoded URL with backtick template string
content = re.sub(r"'https://dirictiondback\.digitalrace\.net(.*?)'", r"`${API_BASE}\1`", content)

# Replace already backtick template string hardcoded URL
content = re.sub(r"`https://dirictiondback\.digitalrace\.net(.*?)`", r"`${API_BASE}\1`", content)

# Change API_BASE to localhost for local testing
content = content.replace("const API_BASE = 'http://localhost:8085';", "const API_BASE = 'http://localhost:8080';")

# Change size=30 to size=10
content = content.replace('?size=30', '?size=10').replace('&size=30', '&size=10')

with open('js/dashboard.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
