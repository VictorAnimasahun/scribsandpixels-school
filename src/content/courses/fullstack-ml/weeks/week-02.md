# Week 2 — Lists, Functions, and Your First Real Tool
**Theme:** Store multiple things at once. Write reusable blocks of code. Read and write files.
**Big question:** *How do I stop rewriting the same code over and over?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Mosh Python — 2hr to 3hr mark](https://www.youtube.com/watch?v=kqtD5dpn9C8) | Lists and functions section. Pause and type along. |
| 📗 | [Automate the Boring Stuff — Chapter 4 (Lists)](https://automatetheboringstuff.com/2e/chapter4/) | Read after Day 1 video. Reinforces Mosh. |
| 📗 | [Automate the Boring Stuff — Chapter 3 (Functions)](https://automatetheboringstuff.com/2e/chapter3/) | Read after Day 3 video. |
| 📺 | [Corey Schafer — Python Functions (15min)](https://www.youtube.com/watch?v=9Os0o3wzS_I) | Watch on Day 3. Crystal clear explanation. |
| 📺 | [Corey Schafer — Python Lists (20min)](https://www.youtube.com/watch?v=W8KRzm-HUcc) | Watch on Day 1 if Mosh is unclear. |
| 🌐 | [FreeCodeCamp HTML — Cat Photo App](https://www.freecodecamp.org/learn/full-stack-developer-v9/) | Continue: steps 11–30 this week. |
| 📗 | [Real Python — Reading and Writing Files](https://realpython.com/read-write-files-python/) | Read on Day 5. |

## Day 1 — Monday
**Topic:** Lists — storing multiple things in one variable
**Time:** ~2.5 hours

### Review (30 min)
- Open your terminal. From memory, write a for loop that prints numbers 1 to 5.
- Write an if/elif/else block that checks if a number is positive, negative, or zero.
- If you stumble, check your Week 1 log — not the notes, just your log. Then try again.

### Lesson (45 min)
**Watch:** Mosh Python — 2hr to 2hr 30min mark (lists section)

Key ideas to find:
- A list holds multiple values in one variable: `fruits = ["mango", "banana", "pawpaw"]`
- Lists are **ordered** — the first item is at position 0, not 1 (this trips everyone up)
- You can add, remove, and change items in a list

**Read:** [Automate the Boring Stuff — Chapter 4, first half](https://automatetheboringstuff.com/2e/chapter4/)
Takes about 20 minutes. Read it slowly.

### Practice (45 min)
Type all of this yourself — no copying:
```python
# Create a list
cities = ["Lagos", "Abuja", "Kano", "Port Harcourt"]

# Access individual items
print(cities[0])   # First item
print(cities[-1])  # Last item (negative indexing!)

# Change an item
cities[1] = "Ibadan"
print(cities)

# Add an item
cities.append("Enugu")
print(cities)

# Remove an item
cities.remove("Kano")
print(cities)

# Loop through a list
for city in cities:
    print("Nigerian city:", city)

# Check length
print("Total cities:", len(cities))
```

Break things on purpose:
- Try `print(cities[10])` — what error do you get? Write it in your log.
- Try `cities.remove("London")` — what happens?

### Mini-Task
Create a shopping list program:
- Start with a list of 5 Nigerian food items
- Print the full list
- Add one more item using `append()`
- Remove one item using `remove()`
- Print how many items are left using `len()`
- Loop through and print each item with its position number (hint: use `enumerate()` — look it up)

### Log (10 min)

## Day 2 — Tuesday
**Topic:** More list operations + list methods
**Time:** ~2.5 hours

### Review (30 min)
- Without looking at yesterday's code, recreate your shopping list program from memory.
- What does index 0 mean? What does index -1 mean? Say it out loud.

### Lesson (45 min)
**Watch:** Corey Schafer — Python Lists (link above, full 20 min video)

Key ideas:
- Slicing: `cities[1:3]` — get a chunk of the list
- Sorting: `cities.sort()` — alphabetical order
- Checking membership: `"Lagos" in cities` — returns True or False
- `len()`, `min()`, `max()` on lists of numbers

**Read:** [Automate the Boring Stuff — Chapter 4, second half](https://automatetheboringstuff.com/2e/chapter4/)

### Practice (45 min)
```python
numbers = [45, 12, 78, 3, 56, 23, 89, 1]

print("Highest:", max(numbers))
print("Lowest:", min(numbers))
print("Total items:", len(numbers))

numbers.sort()
print("Sorted:", numbers)

# Slicing
print("First three:", numbers[0:3])
print("Last two:", numbers[-2:])

# Check membership
if 78 in numbers:
    print("78 is in the list")
else:
    print("78 is not in the list")
```

### Mini-Task
**Grade Calculator:**
- Create a list of 5 exam scores (make them up)
- Print the highest score
- Print the lowest score
- Calculate and print the average (sum of all scores divided by number of scores)
- Print whether the average is a pass (50 and above) or fail

Hint for average:
```python
average = sum(scores) / len(scores)
```

### Log (10 min)

## Day 3 — Wednesday
**Topic:** Functions — writing reusable blocks of code
**Time:** ~2.5 hours

### Review (30 min)
- What is a list? Explain it out loud to yourself, no notes.
- What does `append()` do? What does `remove()` do?
- What does `len()` return?

### Lesson (45 min)
**Watch:** Mosh Python — 2hr 30min to 3hr mark (functions section)
**Then watch:** Corey Schafer — Python Functions (full 15 min, link above)

Key ideas:
- A function is a named block of code you can run whenever you want
- You **define** a function once with `def`, then **call** it as many times as you need
- Functions can take **parameters** (inputs) and **return** values (outputs)

```python
# Basic shape — study this carefully:
def function_name(parameter):
    # code goes here
    return something
```

Why functions matter: imagine you wrote 20 lines of code to validate a password. Without functions, you'd copy those 20 lines everywhere you need to check a password. With a function, you write it once and call it everywhere.

**Read:** [Automate the Boring Stuff — Chapter 3](https://automatetheboringstuff.com/2e/chapter3/) — full chapter

### Practice (45 min)
```python
# Function with no parameters
def greet():
    print("Welcome to my program!")

# Function with a parameter
def greet_user(name):
    print("Welcome,", name)

# Function with a return value
def add(a, b):
    result = a + b
    return result

# Calling your functions:
greet()
greet_user("Emeka")
total = add(10, 5)
print("Total:", total)
```

Now extend it. Write a function called `multiply` that takes two numbers and returns their product. Write another called `is_adult` that takes an age and returns True if 18 or over, False otherwise.

### Mini-Task
Rewrite your Naira calculator from Week 1 as a function:
```python
def convert_to_naira(usd_amount):
    # your code here
    return naira_amount
```
Call it 3 times with different amounts. Print each result.

### Log (10 min)

## Day 4 — Thursday
**Topic:** Functions with lists + putting concepts together
**Time:** ~2.5 hours

### Review (30 min)
- Write a function from memory: it takes a name, returns a greeting string.
- Write a function that takes a list of numbers and returns the largest one (without using `max()` — use a loop).

### Lesson (45 min)
**Key idea today:** Functions and lists work beautifully together. Most real programs are functions that operate on lists.

No new video today. Read instead:
- [Real Python — Python Functions guide](https://realpython.com/defining-your-own-python-function/) — first half
- This is reading practice. Software engineers read documentation constantly. Build the habit.

Key new concept: **default parameters**
```python
def greet(name, language="English"):
    if language == "Yoruba":
        print("Ẹ káàbọ̀,", name)
    else:
        print("Welcome,", name)

greet("Emeka")              # Uses default: English
greet("Tunde", "Yoruba")    # Overrides default
```

### Practice (45 min)
```python
def get_passing_scores(scores, pass_mark=50):
    passing = []
    for score in scores:
        if score >= pass_mark:
            passing.append(score)
    return passing

def get_average(scores):
    if len(scores) == 0:
        return 0
    return sum(scores) / len(scores)

all_scores = [45, 72, 38, 91, 55, 60, 29, 88]

passing = get_passing_scores(all_scores)
print("Passing scores:", passing)
print("Average of passing scores:", get_average(passing))
print("Average of all scores:", get_average(all_scores))
```

### Mini-Task
Write a function called `describe_list` that:
- Takes any list as a parameter
- Prints how many items are in it
- Prints the first and last item
- Prints whether "Emeka" is in the list

Call it with 3 different lists.

### Log (10 min)

## Day 5 — Friday
**Topic:** Reading and writing files
**Time:** ~2.5 hours

### Review (30 min)
- What is a function? What are parameters? What does `return` do?
- Write a function that takes a list of names and prints each one with "Hello, [name]!"

### Lesson (45 min)
**Key idea:** Real programs save data permanently. Your code right now forgets everything when it stops running. Files fix that.

**Read:** [Real Python — Reading and Writing Files](https://realpython.com/read-write-files-python/) — first half only
**Watch:** [Corey Schafer — File Objects (15min)](https://www.youtube.com/watch?v=Uh2ebFW8OYM)

The three modes:
- `"r"` — read an existing file
- `"w"` — write to a file (creates it, or WIPES it if it exists — careful!)
- `"a"` — append to a file (adds to the end without wiping)

```python
# Writing to a file
with open("my_log.txt", "w") as file:
    file.write("This is my first line\n")
    file.write("This is my second line\n")

# Reading from a file
with open("my_log.txt", "r") as file:
    content = file.read()
    print(content)
```

The `with` keyword automatically closes the file when done. Always use `with`.

### Practice (45 min)
```python
# Program that saves names to a file
def save_name(name):
    with open("names.txt", "a") as file:
        file.write(name + "\n")

def read_all_names():
    with open("names.txt", "r") as file:
        names = file.readlines()
        return names

save_name("Emeka")
save_name("Tunde")
save_name("Ngozi")

all_names = read_all_names()
print("All saved names:")
for name in all_names:
    print(name.strip())
```

Run it. Open `names.txt` in Notepad and see the data. Run it again — what happens? Why?

### Mini-Task
**Daily Journal Program:**
Write a program that:
- Asks the user to type a journal entry
- Saves it to a file called `journal.txt` with today's date beside it
- Each new entry adds to the file (doesn't wipe it)
- After saving, reads and prints all previous entries

Hint for date:
```python
from datetime import date
today = str(date.today())
```

### Log (10 min)

## Day 6 — Saturday
**Topic:** Week 2 project day — Contact Book
**Time:** ~3 hours

### Review (30 min)
- Read your entire Week 2 log.
- From memory: write a function, create a list, and write to a file. Three separate small examples.

### Weekly Project (2 hours)
**Build: A Contact Book that saves to a file**

This is your biggest program yet. It combines everything from Weeks 1 and 2:
- Variables
- Lists
- Loops
- If/elif/else
- Functions
- File reading and writing
- User input

**What it does:**
1. Shows a menu: Add Contact / View All Contacts / Search Contact / Quit
2. Add Contact: asks for name and phone number, saves to `contacts.txt`
3. View All: reads and prints every contact from the file
4. Search: asks for a name, searches the file, prints the result or "Not found"
5. Loops back to the menu after each action until user picks Quit

**Starter structure — fill in the rest yourself:**
```python
def show_menu():
    print("\n--- Contact Book ---")
    print("1. Add contact")
    print("2. View all contacts")
    print("3. Search contact")
    print("4. Quit")

def add_contact(name, phone):
    with open("contacts.txt", "a") as file:
        file.write(name + "," + phone + "\n")
    print("Contact saved!")

def view_all_contacts():
    # Open contacts.txt and print every line
    # Handle the case where the file doesn't exist yet
    pass  # Replace this with your code

def search_contact(search_name):
    # Open the file, loop through lines
    # Split each line by comma to get name and phone
    # If name matches search_name, print it
    pass  # Replace this with your code

# Main program loop
while True:
    show_menu()
    choice = input("Choose an option (1-4): ")

    if choice == "1":
        name = input("Enter name: ")
        phone = input("Enter phone number: ")
        add_contact(name, phone)
    elif choice == "2":
        view_all_contacts()
    elif choice == "3":
        name = input("Search for: ")
        search_contact(name)
    elif choice == "4":
        print("Goodbye!")
        break
    else:
        print("Invalid choice. Try again.")
```

### FreeCodeCamp (30 min)
Complete steps 11–30 of the Cat Photo App:
https://www.freecodecamp.org/learn/full-stack-developer-v9/

### Log (10 min)
Weekly review:
- What were the 3 biggest things I learned this week?
- What still confuses me?
- Did I finish the contact book? If not, what stopped me?

## Quiz
1. What is a list? How is it different from a regular variable?
2. What does index `0` refer to in a list?
3. What does `append()` do? What does `remove()` do?
4. What is a function? Why do we use them?
5. What is the difference between a parameter and an argument?
6. What does `return` do? What happens if a function has no `return`?
7. What is the difference between opening a file with `"w"` and `"a"`?
8. What does `with open(...) as file:` do?
9. Write a function that takes a list and returns only the items longer than 5 characters.
10. What was the hardest part of the contact book project, and how did you solve it?
