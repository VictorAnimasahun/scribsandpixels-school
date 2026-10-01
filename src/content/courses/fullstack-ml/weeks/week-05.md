# Week 5 — Python Gets Smarter
**Theme:** Store data by name, survive bad input, use other people's code, and save your data properly.
**Big question:** *How do real programs keep going when users do unexpected things?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [CS50P — Harvard's free Python course](https://cs50.harvard.edu/python/) | Lecture 2 (dictionaries part) on Monday, Lecture 3 (Exceptions) on Wednesday, Lecture 4 (Libraries) on Thursday. |
| 📗 | [Automate the Boring Stuff with Python](https://automatetheboringstuff.com/) | Read the Dictionaries chapter this week. Free online. |
| 📗 | [Python tutorial — Dictionaries](https://docs.python.org/3/tutorial/datastructures.html#dictionaries) | The official reference. Short. |
| 📗 | [Python tutorial — Errors and Exceptions](https://docs.python.org/3/tutorial/errors.html) | Wednesday. |
| 📗 | [Python tutorial — Modules](https://docs.python.org/3/tutorial/modules.html) | Thursday. |
| 📗 | [Python docs — json](https://docs.python.org/3/library/json.html) | Friday. Just the first examples. |

## Day 1 — Monday
**Topic:** Dictionaries
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a list of 5 Nigerian foods, add one, remove one, loop with numbers (`enumerate`).
- Back to Python after two weeks of HTML. Re-read your Week 2 contact book code.

### Lesson (45 min)
**Watch:** CS50P Lecture 2, the dictionaries part.

A **list** finds things by **position** (`foods[0]`). A **dictionary** finds things by **name** (a **key**):
```python
prices = {"rice": 1500, "beans": 1200, "garri": 800}

print(prices["rice"])        # 1500
prices["yam"] = 2500         # add a new key
prices["rice"] = 1700        # change a value
del prices["beans"]          # remove a key
print(len(prices))           # 3
```
| Code | Does |
|---|---|
| `d[key]` | get the value (**KeyError** if the key is missing) |
| `d.get(key)` | get the value, or `None` if missing |
| `d.get(key, 0)` | get the value, or `0` if missing |
| `key in d` | `True` if the key exists |
| `d.keys()` / `d.values()` / `d.items()` | all keys / values / (key, value) pairs |

**Looping:**
```python
for item, price in prices.items():
    print(f"{item}: ₦{price:,}")
```
`{price:,}` adds thousand separators: `1700` → `1,700`.

Keys must be unique (adding `"rice"` again replaces the old value) and are usually strings. Values can be anything: numbers, strings, lists, even other dictionaries.

### Practice (45 min)
In a file `market.py` on your computer:
1. A dictionary of 6 items you buy every month with their prices.
2. Print the most expensive item (loop and keep track; don't use `max` yet).
3. Ask the user for an item and print its price, or "Not found".

### Mini-Task (30 min)
::sandbox py-w05-d1-prices

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** Lists of dictionaries, and counting with dictionaries
**Time:** ~2.5 hours

### Review (30 min)
- From memory: create a dict, add a key, change a value, loop with `.items()`.
- What's the difference between `d["x"]` and `d.get("x")`?

### Lesson (45 min)
**A list of dictionaries is how real data looks** (it's what a spreadsheet row, a database row and an API response become in Python):
```python
orders = [
    {"city": "Lagos", "item": "rice", "amount": 15000},
    {"city": "Abuja", "item": "beans", "amount": 8000},
    {"city": "Lagos", "item": "garri", "amount": 4000},
]
for order in orders:
    print(order["city"], order["amount"])
```

**Counting / totalling with a dictionary**: the most useful pattern this week:
```python
totals = {}
for order in orders:
    city = order["city"]
    totals[city] = totals.get(city, 0) + order["amount"]
print(totals)   # {'Lagos': 19000, 'Abuja': 8000}
```
`totals.get(city, 0)` starts each new city at 0.

**Finding the biggest:**
```python
best = max(totals, key=totals.get)    # the key with the largest value
```

**Nested data:** `students = {"Ada": {"age": 24, "city": "Lagos"}}` → `students["Ada"]["city"]`.

### Practice (45 min)
Make a list of 8 dictionaries for your expenses this week (`item`, `amount`, `category`). Total per category with the counting pattern, and print the category you spent the most on.

### Mini-Task (30 min)
::sandbox py-w05-d2-orders

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** Errors and exceptions
**Time:** ~2.5 hours

### Review (30 min)
- From memory: the counting pattern with `.get(key, 0)`.
- Write a list of 3 dictionaries and loop over it.

### Lesson (45 min)
**Watch:** CS50P Lecture 3 (Exceptions).

When something goes wrong, Python **raises an exception** and the program stops:
| Exception | Example |
|---|---|
| `ValueError` | `int("ten")` |
| `ZeroDivisionError` | `10 / 0` |
| `KeyError` | `prices["egusi"]` when there's no such key |
| `IndexError` | `foods[10]` on a short list |
| `FileNotFoundError` | `open("missing.txt")` |
| `TypeError` | `"Age: " + 30` |

**Catch it** with `try` / `except` so the program can carry on:
```python
try:
    amount = int(input("Amount: "))
except ValueError:
    print("Please enter a number.")
```
**Keep asking until it's valid:**
```python
while True:
    try:
        amount = int(input("Amount: "))
        break                     # it worked: leave the loop
    except ValueError:
        print("Please enter a number.")
```
- Catch **specific** exceptions (`except ValueError:`), never a bare `except:` that hides every bug.
- `else:` runs if nothing went wrong; `finally:` runs no matter what.
- `raise ValueError("Amount can't be negative")` raises your own error.

### Practice (45 min)
Go back to your Week 1 Naira converter and Week 2 contact book. Make them survive bad input: letters instead of numbers, a missing file, an empty name.

### Mini-Task (30 min)
::sandbox py-w05-d3-split

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** Modules: using code other people wrote
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a loop that keeps asking for a number until it gets one.
- Name 4 exception types and what causes each.

### Lesson (45 min)
**Watch:** CS50P Lecture 4 (Libraries).

A **module** is a Python file of ready-made code. Python ships with hundreds (the *standard library*):
```python
import random
print(random.randint(1, 6))          # a dice roll
print(random.choice(["Ada", "Tolu", "Emeka"]))

import math
print(math.ceil(40 / 18))            # 3: buses needed for 40 people, 18 seats each

from datetime import date
today = date.today()
christmas = date(2026, 12, 25)
print((christmas - today).days)      # days to go
```
- `import math` → use `math.ceil(...)`. `from math import ceil` → use `ceil(...)` directly.
- **Your own module:** save functions in `helpers.py`, then in another file in the same folder: `import helpers` → `helpers.format_naira(1500)`.
- **Third-party packages** come from PyPI with `pip install requests` (in your terminal, not inside Python). You'll use `requests` for the weather script next week.

### Practice (45 min)
1. A "who buys lunch?" picker with `random.choice`.
2. Move your Naira formatting function into `helpers.py` and import it from two different scripts.
3. Run `pip install requests` in your terminal so it's ready for next week.

### Mini-Task (30 min)
::sandbox py-w05-d4-modules

### Log (10 min)
Update your log.

## Day 5 — Friday
**Topic:** Saving data with JSON
**Time:** ~2.5 hours

### Review (30 min)
- From memory: import `random` and roll a dice; import `ceil` directly from `math`.
- Why use `try/except FileNotFoundError` when opening a file?

### Lesson (45 min)
Text files (Week 2) store lines. **JSON** stores whole lists and dictionaries, and it's the format almost every web API uses, including next week's weather API.
```python
import json

contacts = [{"name": "Ada", "phone": "0803 111 2222"}]

with open("contacts.json", "w") as file:
    json.dump(contacts, file, indent=2)     # Python → JSON file

with open("contacts.json") as file:
    loaded = json.load(file)                # JSON file → Python
print(loaded[0]["name"])                    # Ada
```
The file looks almost like Python:
```json
[
  {
    "name": "Ada",
    "phone": "0803 111 2222"
  }
]
```
- `json.dumps(data)` / `json.loads(text)` (with an **s**) work with **strings** instead of files.
- JSON uses `true`/`false`/`null` where Python has `True`/`False`/`None`, and always double quotes.
- **Loading safely** the first time the program runs:
```python
try:
    with open("contacts.json") as file:
        contacts = json.load(file)
except FileNotFoundError:
    contacts = []
```

### Practice (45 min)
Upgrade your Week 2 contact book: store contacts as a list of dictionaries in `contacts.json` instead of a text file. Add search by name.

### Mini-Task (30 min)
::sandbox py-w05-d5-json

### Log (10 min)
Update your log.

## Day 6 — Saturday
**Topic:** Project day: expense tracker
**Time:** ~3 hours

### Review (30 min)
- Read your whole Week 5 log.
- From memory: the counting pattern, a try/except input loop, and JSON save/load.

### Weekly Project (2 hours)
**Build `expenses.py`, an expense tracker you'd actually use:**
- Ask for expenses in a loop: item, amount (keep asking until it's a valid number), category. Stop when the item is `done`.
- Store each expense as a dictionary in a list.
- At the end print the total, the total per category, and the biggest expense.
- Save everything to `expenses.json` and load it again next time the program starts (no crash on the first run).
- Put your helper functions (`format_naira`, `total`, `by_category`) in a separate module and import them.
- Push it to GitHub in a new repository with at least 4 commits.

Build and test the core here first:

::sandbox py-w05-d6-expenses

### FreeCodeCamp (30 min)
Optional: [Scientific Computing with Python](https://www.freecodecamp.org/learn/scientific-computing-with-python/): work through the first project.

### Log (10 min)
Weekly review:
- What were the 3 biggest things I learned this week?
- What still confuses me?
- Link to my expense tracker repo.

## Quiz
1. What's the difference between a list and a dictionary?
2. What's the difference between `d["key"]` and `d.get("key", 0)`?
3. Write a loop that prints every key and value of a dictionary.
4. Write the pattern that totals amounts per city from a list of order dictionaries.
5. What does `try` / `except ValueError` do? Why not a bare `except:`?
6. Name 4 exceptions and what causes each.
7. What's the difference between `import math` and `from math import ceil`?
8. How do you use functions from your own `helpers.py`?
9. Write the code that saves a list of dictionaries to a JSON file and loads it back.
10. How do you load a JSON file safely when it might not exist yet?

If you can answer all ten without notes, you're ready for Week 6. **Answers:** check each day's lesson.
