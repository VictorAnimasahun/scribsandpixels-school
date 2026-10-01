# Week 7 — JavaScript: Python's Cousin
**Theme:** The language of the browser. You already know how to program; this week you learn to say it in JavaScript.
**Big question:** *If I can write it in Python, how do I write it in JavaScript, and what's different?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📗 | [javascript.info — The Modern JavaScript Tutorial](https://javascript.info/) | Part 1, "JavaScript Fundamentals". The clearest free reference. Read the matching section each day. |
| 📗 | [Eloquent JavaScript (free online)](https://eloquentjavascript.net/) | Chapters 1–3 this week. Do the exercises at the end of chapter 2. |
| 📗 | [MDN — JavaScript first steps](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting) | When you want a second explanation. |
| 🌐 | [The Odin Project — Foundations](https://www.theodinproject.com/paths/foundations/courses/foundations) | The JavaScript Basics section, from Week 7 to Week 9. |
| 🌐 | [freeCodeCamp — JavaScript](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/) | Saturday: Basic JavaScript, first 40 lessons. |

## Day 1 — Monday
**Topic:** Hello, JavaScript: the console, variables and types
**Time:** ~2.5 hours

### Review (30 min)
- Phase 2 starts today. Read your Phase 1 graduation log and the 3 things you wrote down as still confusing.
- Open your live site. Right-click → Inspect → **Console** tab. That's where JavaScript talks back.

### Lesson (45 min)
**JavaScript (JS)** is the only programming language every browser runs. HTML is structure, CSS is style, JS is behaviour (Week 3). It's also used on servers (Node.js), so it's the most-used language in the world.

**Type straight into the Console** (DevTools → Console):
```js
console.log("Hello, Lagos!")   // print() in Python
2 + 3 * 4                      // 14: the console shows the result
```

**Variables.** Python just writes `price = 1500`. JavaScript declares them:
```js
const shopName = "NaijaMart"   // const: never reassigned (use this by default)
let price = 1500               // let: will change later
price = price + 200            // OK with let; an error with const
```
Never use `var` (old JavaScript with confusing rules).

**Types**, side by side with Python:
| Python | JavaScript | `typeof` says |
|---|---|---|
| `"text"` | `"text"` or `'text'` | `"string"` |
| `42`, `3.5` | `42`, `3.5` (one number type) | `"number"` |
| `True`, `False` | `true`, `false` (lowercase!) | `"boolean"` |
| `None` | `null` (and `undefined`: "no value yet") | `"object"` / `"undefined"` |

**Template literals** are JavaScript's f-strings, with backticks:
```js
console.log(`${shopName} sells rice at ₦${price}`)   // f"{shop_name} sells rice at ₦{price}"
```

**Syntax differences to watch:** `//` comments (not `#`), semicolons at line ends are optional (we'll leave them out), and **blocks use `{ }`**, not indentation. Indent anyway, for humans.

**JS in a page:** put it in a file `app.js` and load it at the end of `<body>`: `<script src="app.js"></script>`. Its `console.log` output appears in DevTools.

### Practice (45 min)
1. In the browser console: declare your name, age and city; log a sentence with a template literal.
2. Try `const x = 1` then `x = 2`. Read the error. Then do the same with `let`.
3. Check `typeof` of: `"5"`, `5`, `true`, `null`, `undefined`, and a variable you never declared.
4. Create `week7/index.html` + `week7/app.js` and log something from the file.

### Mini-Task (30 min)
::sandbox web-w07-d1-variables

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** Functions
**Time:** ~2.5 hours

### Review (30 min)
- From memory: `const` vs `let`, and a template literal with two variables.
- What does `typeof` return for `true`? For `"true"`?

### Lesson (45 min)
**A function declaration** is like `def`, with braces:
```js
function toNaira(usd) {
  return usd * 1550
}
console.log(toNaira(10))   // 15500
```
| Python | JavaScript |
|---|---|
| `def area(w, h):` | `function area(w, h) {` |
| indented body | body inside `{ }` |
| `return w * h` | `return w * h` |
| `def greet(name="friend"):` | `function greet(name = "friend") {` |

**Arrow functions** are a short way to write small functions. You'll see them everywhere in modern JS and React:
```js
const vat = (amount) => amount * 0.075     // one expression: returned automatically
const greet = (name = "friend") => `Hello, ${name}!`
const add = (a, b) => {                    // with braces, you must write return
  return a + b
}
```
**Formatting naira:** `(1500000).toLocaleString("en-NG")` gives `"1,500,000"`. So:
```js
const formatNaira = (n) => "₦" + n.toLocaleString("en-NG")
```
A function without `return` gives back `undefined` (Python's `None`).

### Practice (45 min)
Rewrite these Python functions from Weeks 1–2 in JavaScript, each in both styles (declaration and arrow): the Naira converter, `area(width, height)`, a `greet(name)` with a default, and `is_even(n)` → `isEven(n)` (JS uses camelCase names).

### Mini-Task (30 min)
::sandbox web-w07-d2-functions

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** Decisions: if, comparisons and logic
**Time:** ~2.5 hours

### Review (30 min)
- From memory: one function declaration and one arrow function with a default parameter.
- What does a function without `return` give back?

### Lesson (45 min)
```js
function grade(score) {
  if (score >= 70) {
    return "A"
  } else if (score >= 60) {      // elif → else if
    return "B"
  } else {
    return "F"
  }
}
```
**Always use `===` and `!==`** (strict equality: same value AND same type). The old `==` converts types and surprises you:
```js
5 === "5"    // false  ✓ what you expect
5 == "5"     // true   ✗ it converted the string
```
| Python | JavaScript |
|---|---|
| `and`, `or`, `not` | `&&`, `\|\|`, `!` |
| `==`, `!=` | `===`, `!==` |
| `x if cond else y` | `cond ? x : y` (the "ternary") |

**Truthy and falsy:** in an `if`, these count as false: `false`, `0`, `""`, `null`, `undefined`, `NaN`. Everything else is true, including `"0"` and `"false"`.

**switch** compares one value with several cases (like Excel's SWITCH):
```js
switch (color) {
  case "red": return "Stop"
  case "green": return "Go"
  default: return "Broken light"
}
```

### Practice (45 min)
Port your Week 1 voting checker and traffic light to JavaScript functions. Test each with values on every boundary (17, 18, 19…).

### Mini-Task (30 min)
::sandbox web-w07-d3-conditions

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** Loops
**Time:** ~2.5 hours

### Review (30 min)
- From memory: `===` vs `==`, and the ternary operator.
- List the 6 falsy values.

### Lesson (45 min)
**The classic `for` loop** has three parts: start; keep going while; step.
```js
for (let i = 1; i <= 5; i++) {   // for i in range(1, 6):
  console.log(i)
}
```
`i++` means `i = i + 1`; `total += x` works like Python.

**`for…of`** walks through the items of something, like Python's `for letter in word`:
```js
for (const letter of "Lagos") {
  console.log(letter)
}
```

**`while`** is the same idea as Python's:
```js
let balance = 100000
let years = 0
while (balance < 200000) {
  balance = balance * 1.1
  years++
}
```
`break` and `continue` work as in Python.

**Watch out:** a `while` whose condition never becomes false freezes the browser tab. If it happens, close the tab.

### Practice (45 min)
Port the Week 1 countdown and the "sum of 1 to n" exercise. Then print the 7 times table with a template literal: `7 x 3 = 21`.

### Mini-Task (30 min)
::sandbox web-w07-d4-loops

### Log (10 min)
Update your log.

## Day 5 — Friday
**Topic:** Strings, numbers and debugging
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a `for` loop from 10 down to 1, and a `for…of` over a word.
- What's the risk with `while`?

### Lesson (45 min)
**String tools** (no brackets after `.length`: it's a property, not a function):
| Python | JavaScript |
|---|---|
| `len(s)` | `s.length` |
| `s.upper()` / `s.lower()` | `s.toUpperCase()` / `s.toLowerCase()` |
| `s.strip()` | `s.trim()` |
| `"ab" in s` | `s.includes("ab")` |
| `s[0:3]` | `s.slice(0, 3)` |
| `s.replace(" ", "")` (all) | `s.replaceAll(" ", "")` |

**Numbers from text.** Everything typed into a web form arrives as a **string**. `"10" + 5` is `"105"` (joined), not 15. Convert first:
```js
Number("10") + 5      // 15
Number("ten")         // NaN: "Not a Number". Check with Number.isNaN(x)
(2.5).toFixed(2)      // "2.50"
```

**Reading errors** (DevTools Console shows the file and line):
| Error | Usually means |
|---|---|
| `ReferenceError: x is not defined` | a typo, or a variable used before it exists |
| `TypeError: x is not a function` / `cannot read properties of undefined` | using something that isn't what you think it is |
| `SyntaxError` | a missing `}` or `)` |

**Debugging:** `console.log` the values you're unsure about. Or in DevTools → Sources, click a line number to set a **breakpoint**; the code pauses there and you can inspect every variable.

### Practice (45 min)
Make each error happen on purpose in your `app.js` and read the message. Then use a breakpoint to watch a loop's variables change step by step.

### Mini-Task (30 min)
This code has four bugs. Fix them, then write one new function:

::sandbox web-w07-d5-debug

### Log (10 min)
Update your log.

## Day 6 — Saturday
**Topic:** Project day: the quiz game, in JavaScript
**Time:** ~3 hours

### Review (30 min)
- Read your Week 7 log. Redo one exercise from each day without looking.

### Weekly Project (2 hours)
**Port your Week 1 quiz game to JavaScript.**
1. Write the logic as functions (`checkAnswer`, `scoreMessage`, `playQuiz`) and test them in the sandbox below.
2. On your computer, make it playable: in `week7/app.js`, ask each question with `prompt("Capital of Nigeria?")` (it returns what the user typed, or `null` if they cancel) and show the result with `alert(...)`. `prompt` and `alert` are old-fashioned pop-ups; next week you'll replace them with a real page (the DOM).
3. Push it to GitHub as `js-quiz` with a README.

::sandbox web-w07-d6-quiz

### FreeCodeCamp (30 min)
Basic JavaScript, the first 40 lessons: https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/

### Log (10 min)
Weekly review:
- What were the 3 biggest differences between Python and JavaScript this week?
- What still confuses me?
- Link to my js-quiz repo.

## Quiz
1. What's the difference between `const`, `let` and `var`?
2. Name the JavaScript types and how `typeof` reports them.
3. Write a template literal that says "Ada is 24".
4. Write the same function as a declaration and as an arrow function.
5. Why use `===` instead of `==`? Give an example where they differ.
6. What are `&&`, `||` and `!` in Python?
7. List the 6 falsy values.
8. Write a `for` loop from 1 to 10 and a `for…of` over a word.
9. Why is `"10" + 5` equal to `"105"`, and how do you fix it?
10. What do `ReferenceError` and `TypeError` usually mean?

If you can answer all ten without notes, you're ready for Week 8. **Answers:** check each day's lesson; for 7: `false`, `0`, `""`, `null`, `undefined`, `NaN`.
