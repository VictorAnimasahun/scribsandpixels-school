topics = ["Variables", "Loops", "Lists", "Functions", "HTML"]

print("<ul>")
for topic in topics:
    print(f"<li>{topic}</li>")
print("</ul>")


def make_list(items):
    html = "<ul>\n"
    for item in items:
        html += f"  <li>{item}</li>\n"
    return html + "</ul>"


def make_page(title, items):
    return f"""<!DOCTYPE html>
<html>
<head><title>{title}</title></head>
<body>
<h1>{title}</h1>
{make_list(items)}
</body>
</html>"""
