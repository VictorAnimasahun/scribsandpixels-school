# Week 1 — Hello, World. Hello, Computer.
**Theme:** Understand what programming is and write your very first code.
**Big question:** *How does a computer actually understand what I'm telling it?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Mosh Python — first 1.5 hours](https://www.youtube.com/watch?v=kqtD5dpn9C8) | Watch Day 1 section. Pause. Type along. |
| 📺 | [CS50 Week 0 — Scratch + Binary](https://cs50.harvard.edu/x/) | Watch the lecture. Don't skip it. Mind = blown. |
| 📗 | [Automate the Boring Stuff — Chapter 1](https://automatetheboringstuff.com/2e/chapter1/) | Read after watching Mosh. It reinforces. |
| 🌐 | [FreeCodeCamp HTML — Cat Photo App](https://www.freecodecamp.org/learn/2022/responsive-web-design/) | Do the first 3 steps only this week. |
| 📺 | [What is Programming? (Fireship, 2 min)](https://www.youtube.com/watch?v=zOjov-2OZ0E) | Watch on Day 1 to get excited. |

## Day 1 — Monday
**Topic:** What is programming? Setting up your computer.
**Time:** ~2.5 hours

### Review (30 min)
- Nothing to review yet — this is Day 1!
- Instead: spend 20 minutes reading this plan. Understand what you signed up for.
- Watch the Fireship "What is Programming?" video (2 min). Watch it 3 times.

### Lesson (45 min)
**Watch:** CS50 Week 0 lecture (first 45 minutes)
- David Malan explains how computers think in 0s and 1s.
- Pause whenever you don't understand. Write it down. Don't try to solve it. Just note it.
- Key idea to find: *What is a "program"?*

### Practice (45 min)
**Install Python and run your first line of code:**
1. Go to [python.org/downloads](https://www.python.org/downloads/) — download Python 3.x
2. Install it. Tick the box that says "Add to PATH"
3. Open your terminal (Windows: search "cmd" or "PowerShell". Mac: search "Terminal")
4. Type this and press Enter:
```
python --version
```
5. If it shows a number, Python is installed. Celebrate.
6. Now type:
```python
python
```
7. Then type:
```python
print("Hello, world!")
```
8. Press Enter. You just wrote your first program.

**Now in the browser:** the same first programs, with automatic checks.

::sandbox py-w01-d1-hello


### Mini-Task
Write 3 more print statements about yourself. Example:
```python
print("My name is Emeka")
print("I am learning to code")
print("One day I will be a software engineer")
```

### Log (10 min)
Write in a notebook or a text file called `week1_log.txt`:
- What I learned today:
- What confused me:
- What I will review tomorrow:

## Day 2 — Tuesday
**Topic:** Variables — giving names to information
**Time:** ~2.5 hours

### Review (30 min)
- Open your terminal. Type `python`. Type `print("Hello, world!")` again from memory.
- Re-read yesterday's log.
- If anything confused you yesterday, read [this short article on how Python works](https://realpython.com/python-first-steps/)

### Lesson (45 min)
**Watch:** Mosh Python tutorial — from the start to the 30-minute mark (variables section)
URL: https://www.youtube.com/watch?v=kqtD5dpn9C8

Key ideas to find today:
- What is a **variable**?
- What is a **string** (text)?
- What is an **integer** (a whole number)?
- What is a **float** (a decimal number)?

**Read:** [Automate the Boring Stuff — Chapter 1, "The Interactive Shell"](https://automatetheboringstuff.com/2e/chapter1/)
(Takes about 15 minutes. Reinforces what Mosh showed you.)

### Practice (45 min)
Open your terminal. Type `python`. Try each of these — type them yourself, don't copy:
```python
name = "Emeka"
age = 35
height = 1.75

print(name)
print(age)
print(height)
print("My name is", name, "and I am", age, "years old")
```

Now experiment. Change the values. See what happens. Break it on purpose by typing:
```python
print(age + name)
```
Read the error message. Write it in your log. This error message is teaching you something.

**Bug hunt:** run this, read the error, fix it.

::sandbox py-w01-d2-fix


### Mini-Task
Create a Python script (a `.py` file, not just the terminal) called `about_me.py`:
1. Open Notepad (Windows) or TextEdit (Mac)
2. Write a program that stores your name, age, city, and dream job in variables
3. Print a sentence using all four variables
4. Save it as `about_me.py` on your Desktop
5. In the terminal, navigate to Desktop: `cd Desktop`
6. Run it: `python about_me.py`

**Code it here** (then also save it as about_me.py on your computer):

::sandbox py-w01-d2-variables


### Log (10 min)
Update `week1_log.txt`

## Day 3 — Wednesday
**Topic:** Getting input from the user + doing math
**Time:** ~2.5 hours

### Review (30 min)
- Open `about_me.py`. Without looking at notes, can you explain what each line does?
- Watch Mosh's variables section again from the beginning (first 30 min). Second time = much clearer.

### Lesson (45 min)
**Watch:** Mosh Python — 30-minute mark to 1-hour mark
Topics covered: `input()`, basic math operators, type conversion

Key ideas:
- `input()` — lets the user type something into your program
- `int()` and `str()` — converting between types
- `+`, `-`, `*`, `/`, `//`, `%` — math operators

**Read:** [Real Python — Python Input and Output](https://realpython.com/python-input-output/) — first half only

### Practice (45 min)
Type this program from scratch (no copying):
```python
name = input("What is your name? ")
age = input("How old are you? ")
age = int(age)
next_year = age + 1

print("Hello,", name)
print("Next year you will be", next_year, "years old")
```

Run it. Type your name and age when it asks. See what happens.

Now break it: remove the `int()` conversion. Try to add 1 to age. Read the error. Write it down.

**Extra practice:** input() and maths.

::sandbox py-w01-d3-practice


### Mini-Task
Build a **Simple Naira Calculator**:
- Ask the user to enter an amount in USD
- Multiply it by 1550 (approximate exchange rate)
- Print the result in Naira

Try to write it yourself first. The hint is folded away for when you're really stuck.

:::hint
```python
# Your structure:
usd = input("Enter amount in USD: ")
usd = float(usd)
naira = usd * 1550
print("That is", naira, "Naira")
```
:::

**Code it here:** real Python in your browser, with automatic checks.

::sandbox py-w01-d3-naira


### Log (10 min)

## Day 4 — Thursday
**Topic:** Making decisions — if, else, elif
**Time:** ~2.5 hours

### Review (30 min)
- Run your Naira calculator from yesterday. Can you still explain every line?
- Read your log from the week so far.

### Lesson (45 min)
**Watch:** Mosh Python — 1-hour mark to 1h 30min mark
Topics: if statements, comparison operators, logical operators

**Key idea:** A computer can make choices. `if` something is true, do this. `else`, do that.

```python
# The basic shape — study this:
if condition:
    do_this()
else:
    do_that()
```

**Read:** [Automate the Boring Stuff — Chapter 2, first half](https://automatetheboringstuff.com/2e/chapter2/)

### Practice (45 min)
```python
age = int(input("How old are you? "))

if age >= 18:
    print("You can vote in Nigeria!")
elif age >= 16:
    print("Almost! Two more years.")
else:
    print("You are still a child.")
```

Run it 3 times with different ages (10, 16, 25). Confirm it works correctly.

**Code it here:**

::sandbox py-w01-d4-vote


### Mini-Task
**Lagos Traffic Light Program:**
Ask the user to type a colour (red, yellow, or green).
Print what a driver should do at that colour.
Add a message for any other input: "That's not a traffic light colour!"

Write it yourself from scratch. No hints today.

**Code it here:** no hints until you've tried.

::sandbox py-w01-d4-traffic


### Log (10 min)

## Day 5 — Friday
**Topic:** Loops — making the computer repeat things
**Time:** ~2.5 hours

### Review (30 min)
- Re-do your traffic light program from memory (close your file, start fresh)
- Compare to your original. What did you forget? Write it down.

### Lesson (45 min)
**Watch:** Mosh Python — 1h 30min to 2h mark
Topics: `while` loops, `for` loops, `range()`

**Key idea:** Instead of writing `print("hello")` 100 times, a loop does it for you.

```python
# For loop:
for i in range(5):
    print("Hello!", i)

# While loop:
count = 0
while count < 5:
    print("Count is", count)
    count = count + 1
```

**Watch (bonus, 6 minutes):** [Loops explained visually — CS Dojo](https://www.youtube.com/watch?v=6iF8Xb7Z3wQ)

### Practice (45 min)
```python
# Times table generator
number = int(input("Which times table? "))
for i in range(1, 11):
    result = number * i
    print(number, "x", i, "=", result)
```

Run it. Try different numbers. Now modify it: print only the even results.

**Loop workout:**

::sandbox py-w01-d5-loops


### Mini-Task
**Countdown Timer:**
Ask the user for a number. Count down from that number to 1. Then print "Blast off!"
Write it with a `while` loop.

**Code it here:**

::sandbox py-w01-d5-countdown


### Log (10 min)

## Day 6 — Saturday
**Topic:** Your first real program — putting it all together
**Time:** ~3 hours (it's a project day)

### Review (30 min)
- Read your entire week's log.
- Re-read any day that felt confusing.
- Open [Automate the Boring Stuff Chapter 1–2](https://automatetheboringstuff.com/) and skim both chapters again.

### Weekly Project (2 hours)
**Build: A Personal Quiz Game**

Your first real program. It should:
1. Welcome the user by name (use `input()`)
2. Ask them 3 questions about Nigeria (use `if/else` to check answers)
3. Keep track of how many they got right (use a variable as a counter)
4. At the end, print their score out of 3
5. Use a loop to ask each question (put your questions in a list — preview concept!)

**Starter structure to guide you — fill in the blanks:**
```python
name = input("Welcome! What is your name? ")
print("Hello,", name, "! Let's play a quiz.")

score = 0

# Question 1
answer1 = input("What is the capital of Nigeria? ").lower()
if answer1 == "abuja":
    print("Correct!")
    score = score + 1
else:
    print("Wrong! The answer is Abuja.")

# Question 2 — write this yourself

# Question 3 — write this yourself

print("Quiz over!", name, "you scored", score, "out of 3")
```

**Build it here** (and still save a copy as a .py file on your computer):

::sandbox py-w01-d6-quiz


### Mini-Task (30 min)
Go to FreeCodeCamp and complete **steps 1–10** of the Cat Photo App (HTML):
https://www.freecodecamp.org/learn/full-stack-developer-v9/

This is your first taste of web development. It'll feel different from Python. That's fine.

### Log (10 min)
Weekly review in your log:
- What were the 3 biggest things I learned this week?
- What still confuses me?
- Am I ready for Week 2?

## Quiz
1. What does `print()` do?
2. What is the difference between a string and an integer?
3. What does `input()` return — a string or a number?
4. What is a loop? Give an example in one sentence.
5. What does `if/else` do?
6. What is a variable?
7. Write a 3-line Python program from memory. Any program. Just write it.

If you can answer all 7, you passed Week 1. If not — that's what next Monday's review is for.
