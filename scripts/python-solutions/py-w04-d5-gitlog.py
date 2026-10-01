log = """a1f3c2e Victor: Add about page
9b2d771 Ada: Fix typo in footer
4c88e01 Victor: Add contact form
e7a0b13 Victor: Style navbar with flexbox
2f9c6d0 Tunde: Add media query for phones"""

lines = log.splitlines()
print(f"{len(lines)} commits")


def commits_by(author, text):
    count = 0
    for line in text.splitlines():
        name = line.split(" ", 1)[1].split(":")[0]
        if name == author:
            count += 1
    return count


for line in lines:
    print(line.split(": ", 1)[1])
