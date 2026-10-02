# Week 8 — Arrays, Objects and JSON
**Theme:** Real data in JavaScript: lists of things, things with properties, and the array methods every React app uses.
**Big question:** *How do I store, change and summarise data in JavaScript, and keep it after the page reloads?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📗 | [javascript.info — Data types](https://javascript.info/data-types) | Arrays, Array methods, Objects, JSON. Read the matching section each day. |
| 📗 | [Eloquent JavaScript (free online)](https://eloquentjavascript.net/) | Chapter 4 (Data Structures: Objects and Arrays) and chapter 5 (Higher-Order Functions). |
| 📗 | [MDN — Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) | Your reference for every array method. |
| 🌐 | [The Odin Project — Foundations](https://www.theodinproject.com/paths/foundations/courses/foundations) | JavaScript Basics: "Arrays and Loops" and "Object Basics". |
| 🌐 | [freeCodeCamp — JavaScript](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/) | Saturday: continue Basic JavaScript. |

## Day 1 — Monday
**Topic:** Arrays
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a function with a default parameter, an arrow function, and a `for…of` loop.
- Rewrite your Week 2 Python shopping list exercise in your head: what would it look like in JS?

### Lesson (45 min)
An **array** is JavaScript's list:
```js
const foods = ["rice", "beans", "yam"]
foods[0]                 // "rice"
foods[foods.length - 1]  // "yam": JS has no foods[-1]
foods.length             // 3
```
| Python | JavaScript |
|---|---|
| `foods.append("suya")` | `foods.push("suya")` |
| `foods.pop()` | `foods.pop()` (removes and returns the last) |
| `"rice" in foods` | `foods.includes("rice")` |
| `foods.index("yam")` | `foods.indexOf("yam")` (-1 if missing) |
| `foods[1:3]` | `foods.slice(1, 3)` |
| `", ".join(foods)` | `foods.join(", ")` |
| `"a,b".split(",")` | `"a,b".split(",")` |
| `del foods[1]` | `foods.splice(1, 1)` (from index 1, remove 1) |

`const` arrays can still change: `const` stops you from replacing the whole array, not from pushing into it.

**Looping:**
```js
for (const food of foods) console.log(food)
foods.forEach((food, i) => console.log(`${i + 1}. ${food}`))
```

### Practice (45 min)
Port your Week 2 Python list exercises (shopping list, grades, top 3) to JavaScript arrays.

### Mini-Task (30 min)
::sandbox web-w08-d1-arrays

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** Objects
**Time:** ~2.5 hours

### Review (30 min)
- From memory: push, pop, includes, indexOf, slice and join.
- How do you get the last item of an array?

### Lesson (45 min)
An **object** is like a Python dictionary: named values called **properties**.
```js
const product = { name: "Tecno Spark 20", price: 145000, inStock: true }

product.price            // 145000: dot notation
product["price"]         // same: bracket notation (use it when the key is in a variable)
product.price = 139000   // change
product.category = "Phones"  // add
delete product.inStock   // remove
```
Keys don't need quotes (unless they have spaces).

**Looping over an object:**
```js
Object.keys(product)     // ["name", "price", "category"]
Object.values(product)   // ["Tecno Spark 20", 139000, "Phones"]
for (const [key, value] of Object.entries(product)) console.log(key, value)
```

**Arrays of objects** are how real data looks, in JS as in Python (Week 5):
```js
const orders = [
  { city: "Lagos", amount: 15000 },
  { city: "Kano", amount: 12000 },
]
```
**The counting pattern**, in JavaScript:
```js
const totals = {}
for (const order of orders) {
  totals[order.city] = (totals[order.city] ?? 0) + order.amount
}
```
`??` gives the right side when the left is `undefined` or `null`, like Python's `.get(key, 0)`.

### Practice (45 min)
Port the Week 5 Python orders-by-city exercise to JavaScript objects.

### Mini-Task (30 min)
::sandbox web-w08-d2-objects

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** map, filter, find
**Time:** ~2.5 hours

### Review (30 min)
- From memory: dot vs bracket notation, and the counting pattern with `??`.
- What does `Object.entries` give you?

### Lesson (45 min)
These methods take a **function** and run it on every item. You'll use them constantly in React.
```js
const products = [
  { name: "Tecno Spark 20", price: 145000, category: "Phones" },
  { name: "Indomie Carton", price: 13500, category: "Groceries" },
  { name: "JBL Flip 6", price: 129000, category: "Electronics" },
]

products.map((p) => p.name)                 // ["Tecno Spark 20", "Indomie Carton", "JBL Flip 6"]
products.filter((p) => p.price < 100000)    // [the Indomie object]
products.find((p) => p.name === "JBL Flip 6")   // the JBL object (or undefined)
products.some((p) => p.category === "Phones")   // true: at least one
products.every((p) => p.price > 0)              // true: all of them
```
| Method | Gives back | Python equivalent |
|---|---|---|
| `map` | a new array, same length, each item transformed | `[f(x) for x in xs]` |
| `filter` | a new array with only the items that pass | `[x for x in xs if test(x)]` |
| `find` | the first matching item, or `undefined` | `next((x for x in xs if test(x)), None)` |
| `some` / `every` | `true` / `false` | `any(...)` / `all(...)` |

**They don't change the original array.** To change one property without touching the original, copy each object with the spread operator:
```js
const withVat = products.map((p) => ({ ...p, priceWithVat: p.price * 1.075 }))
```

### Practice (45 min)
From a list of 8 products: the names in capitals, only those under ₦50,000, the first one in "Phones", and whether all are in stock.

### Mini-Task (30 min)
::sandbox web-w08-d3-map-filter

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** reduce and sort
**Time:** ~2.5 hours

### Review (30 min)
- From memory: map, filter and find on a list of products.
- Why `({ ...p, priceWithVat: … })` instead of changing `p`?

### Lesson (45 min)
**reduce** walks the array carrying one value along (a total, an object…):
```js
const total = products.reduce((sum, p) => sum + p.price, 0)   // 0 is the starting value

const byCategory = products.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + p.price
  return acc
}, {})
```
**sort** changes the array itself, so copy first with `[...products]`. For numbers you must give a compare function:
```js
const cheapestFirst = [...products].sort((a, b) => a.price - b.price)   // negative = a first
const aToZ = [...products].sort((a, b) => a.name.localeCompare(b.name))
```
⚠️ Without a compare function, sort compares as **text**: `[10, 9, 100].sort()` gives `[10, 100, 9]`.

**Chaining** builds a pipeline:
```js
const top2 = [...products].sort((a, b) => b.price - a.price).slice(0, 2).map((p) => p.name)
```

### Practice (45 min)
With a list of 8 products (name, price, category): total value, totals per category, and the 3 most expensive product names.

### Mini-Task (30 min)
::sandbox web-w08-d4-reduce-sort

### Log (10 min)
Update your log.

## Day 5 — Friday
**Topic:** JSON, localStorage and destructuring
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a total with reduce, and a price sort that doesn't change the original.
- Why does `[10, 9, 100].sort()` give a strange answer?

### Lesson (45 min)
**JSON in JavaScript** (it's JavaScript's own notation, so this is easy):
```js
const text = JSON.stringify(expenses)    // like Python's json.dumps
const back = JSON.parse(text)            // like json.loads; bad text throws a SyntaxError
```
**localStorage** keeps data in the browser after a reload, as text:
```js
localStorage.setItem("expenses", JSON.stringify(expenses))
const saved = JSON.parse(localStorage.getItem("expenses") ?? "[]")   // getItem gives null if missing
```
Pass the storage in as a parameter (like Week 6's `get=fake_get`) so you can test with a fake one:
```js
function save(key, data, storage = localStorage) {
  storage.setItem(key, JSON.stringify(data))
}
```
**Destructuring** unpacks objects and arrays into variables (React uses it everywhere):
```js
const { name, price } = product          // two variables from one object
const [first, second] = foods            // like Python's a, b = pair
function label({ name, price }) {        // straight from the parameter
  return `${name} (₦${price})`
}
```

### Practice (45 min)
In `week8/app.js`: save a list of 3 expenses to localStorage, reload the page, and log them back. Check them in DevTools → Application → Local Storage.

### Mini-Task (30 min)
::sandbox web-w08-d5-json-storage

### Log (10 min)
Update your log.

## Day 6 — Saturday
**Topic:** Project day: the expense tracker, in JavaScript
**Time:** ~3 hours

### Review (30 min)
- Read your Week 8 log. Redo one exercise per day from memory.

### Weekly Project (2 hours)
**Port your Week 5 Python expense tracker to JavaScript.**
1. Write and test the logic in the sandbox: `addExpense` (returns a new array), `total`, `byCategory`, `biggest`, and `save`/`load` with a storage parameter.
2. On your computer, use it from the console: `let list = load("expenses")`, add a few expenses, `save("expenses", list)`, reload, load again. Next week you'll give it a real page with a form (the DOM).
3. Push it to GitHub as `js-expenses` with a README.

::sandbox web-w08-d6-expenses

### FreeCodeCamp (30 min)
Continue Basic JavaScript: https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/

### Log (10 min)
Weekly review:
- Which array method will I use most, and why?
- What still confuses me?
- Link to my js-expenses repo.

## Quiz
1. How do you add to the end of an array, and how do you get the last item?
2. What's the difference between dot and bracket notation?
3. Write the counting pattern with `??`.
4. What do `map`, `filter` and `find` give back?
5. Write a total with `reduce`.
6. Why copy with `[...arr]` before `sort`, and why does `[10, 9, 100].sort()` look wrong?
7. What does `{ ...p, price: 0 }` do?
8. How do you save an array to localStorage and load it back?
9. What does `getItem` return when the key doesn't exist?
10. Write `const { name, price } = product` in Python terms.

If you can answer all ten without notes, you're ready for Week 9. **Answers:** check each day's lesson; for 9: `null`.
