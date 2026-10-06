from html.parser import HTMLParser

PAGE = """<!doctype html>
<html>
<head>
  <title>Mama Put Kitchen</title>
  <meta property="og:title" content="Mama Put Kitchen">
</head>
<body>
  <h1>Mama Put Kitchen</h1>
  <img src="jollof.jpg" alt="Party jollof with plantain">
  <img src="logo.png">
  <h1>Today's favourites</h1>
</body>
</html>"""


class Audit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.lang = None
        self.title = ""
        self.in_title = False
        self.metas = {}
        self.h1_count = 0
        self.images_without_alt = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.lang = attrs.get("lang")
        elif tag == "title":
            self.in_title = True
        elif tag == "meta":
            key = attrs.get("name") or attrs.get("property")
            if key:
                self.metas[key] = attrs.get("content", "")
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "img" and "alt" not in attrs:
            self.images_without_alt += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def audit(html):
    a = Audit()
    a.feed(html)
    problems = []
    if not a.lang:
        problems.append("missing lang on <html>")
    title = a.title.strip()
    if not title:
        problems.append("missing <title>")
    elif len(title) > 60:
        problems.append("title longer than 60 characters")
    if not a.metas.get("description"):
        problems.append("missing meta description")
    if not a.metas.get("og:image"):
        problems.append("missing og:image")
    if a.h1_count != 1:
        problems.append(f"expected 1 <h1>, found {a.h1_count}")
    if a.images_without_alt:
        problems.append(f"{a.images_without_alt} image(s) without alt")
    return problems


def main():
    problems = audit(PAGE)
    if not problems:
        print("✓ No problems found")
    for p in problems:
        print("✗", p)


if __name__ == "__main__":
    main()
