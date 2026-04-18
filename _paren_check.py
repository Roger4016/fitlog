import pathlib, re
p = pathlib.Path(__file__).with_name("index.html").read_text(encoding="utf-8")
m = re.search(r"<script>([\s\S]*?)</script>\s*</body>", p)
js = m.group(1)
needle = 'return h("div",{style:{background:"var(--bg)"'
start = js.find(needle)
end = js.find("\n}\n\nReactDOM.createRoot", start)
chunk = js[start:end]
bal = 0
i = 0
line = 1
last_zero = 0
while i < len(chunk):
    c = chunk[i]
    if c == "\n":
        line += 1
    if c in '"\'':
        q = c
        i += 1
        while i < len(chunk):
            if chunk[i] == "\n":
                line += 1
            if chunk[i] == "\\":
                i += 2
                continue
            if chunk[i] == q:
                i += 1
                break
            i += 1
        continue
    if c == "(":
        bal += 1
    elif c == ")":
        bal -= 1
        if bal < 0:
            print("negative ) at chunk index", i, "approx line", line)
            break
        if bal == 0:
            last_zero = i
    i += 1
else:
    print("final balance", bal, "last_zero at index", last_zero)
