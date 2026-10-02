# Week 9 — The DOM: Pages That React
**Theme:** JavaScript meets HTML: change the page, respond to clicks and typing, build lists from data, and handle forms.
**Big question:** *How does a web page change without reloading when I click something?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📗 | [javascript.info — Document](https://javascript.info/document) and [Introduction to Events](https://javascript.info/events) | The clearest reference. Read the matching section each day. |
| 📗 | [MDN — Manipulating documents](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) | A second explanation with a shopping-list example. |
| 📗 | [MDN — Introduction to events](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) | Tuesday. |
| 🌐 | [The Odin Project — Foundations](https://www.theodinproject.com/paths/foundations/courses/foundations) | "DOM Manipulation and Events", then the Rock Paper Scissors project if you have time. |
| 📗 | [Eloquent JavaScript (free online)](https://eloquentjavascript.net/) | Chapters 14 (The Document Object Model) and 15 (Handling Events). |

## Day 1 — Monday
**Topic:** Selecting and changing elements
**Time:** ~2.5 hours

### Review (30 min)
- From memory: map, filter and reduce on a list of products.
- Load an array from localStorage safely, in one line.

### Lesson (45 min)
The browser turns your HTML into a tree of objects called the **DOM** (Document Object Model). JavaScript can read and change it, and the page updates instantly.

**Select:**
```js
const title = document.querySelector("h1")              // the first match (CSS selector!)
const price = document.querySelector("#price")           // by id
const cards = document.querySelectorAll(".product")       // all matches (loop with for…of or forEach)
```
**Change:**
| Code | Does |
|---|---|
| `el.textContent = "Hi"` | set the text (safe) |
| `el.innerHTML = "<b>Hi</b>"` | set HTML (never with text a user typed: it can run their code) |
| `el.classList.add("highlight")` / `.remove` / `.toggle` | change classes (style stays in CSS) |
| `el.style.color = "green"` | one inline style (prefer classes) |
| `el.setAttribute("alt", "…")` / `el.alt = "…"` | attributes |
| `el.dataset.id` | reads `data-id="…"` |
| `el.hidden = true` | hide it |

**Where to put the script:** at the end of `<body>`, or `<script src="app.js" defer>` in `<head>`, so the HTML exists before the code runs.

### Practice (45 min)
On your personal site, add `app.js`: change the footer year with `new Date().getFullYear()`, add a class to every project card, and log how many links the page has.

### Mini-Task (30 min)
::sandbox web-w09-d1-select

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** Events
**Time:** ~2.5 hours

### Review (30 min)
- From memory: select one element, select many, change text, add a class.
- Why is `innerHTML` dangerous with user text?

### Lesson (45 min)
An **event** is something that happens: a click, a key press, typing. You **listen** for it and run a function:
```js
const button = document.querySelector("#like")
const count = document.querySelector("#count")
let likes = 0

button.addEventListener("click", () => {
  likes++
  count.textContent = likes
})
```
| Event | When |
|---|---|
| `click` | a click or tap |
| `input` | every change in a text box (as you type) |
| `change` | a select/checkbox changed, or an input lost focus after changing |
| `keydown` | a key is pressed (`e.key === "Enter"`) |
| `submit` | a form is sent (Thursday) |

**The event object** tells you what happened:
```js
input.addEventListener("input", (e) => {
  greeting.textContent = `Hello, ${e.target.value}!`   // e.target = the element the event happened on
})
```

### Practice (45 min)
Build a page with: a Like button and counter, a text box that previews what you type in big letters, and a dark-mode button that toggles a class on `<body>`.

### Mini-Task (30 min)
::sandbox web-w09-d2-events

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** Creating elements and rendering lists
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a click listener that updates a counter, and an input listener that reads `e.target.value`.
- What's the difference between `input` and `change`?

### Lesson (45 min)
**Create and add elements:**
```js
const li = document.createElement("li")
li.textContent = "Rice"
list.append(li)        // add at the end
li.remove()            // take it out
```

**The render pattern**: keep your data in an array and rebuild the list from it. This is exactly how React thinks, so learn it well:
```js
function renderList(items) {
  list.innerHTML = ""                 // clear (safe here: no user text)
  for (const item of items) {
    const li = document.createElement("li")
    li.textContent = item             // user text goes in textContent
    list.append(li)
  }
}
renderList(["Rice", "Beans", "Yam"])
```
**A delete button in each row:**
```js
const remove = document.createElement("button")
remove.textContent = "✕"
remove.addEventListener("click", () => li.remove())
li.append(" ", remove)
```

### Practice (45 min)
Render your Week 6 project cards from an array of objects (`title`, `description`, `url`) instead of hand-written HTML.

### Mini-Task (30 min)
::sandbox web-w09-d3-render

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** Forms
**Time:** ~2.5 hours

### Review (30 min)
- From memory: create an `li`, set its text, append it, and give it a delete button.
- Why rebuild the whole list from the array?

### Lesson (45 min)
```js
const form = document.querySelector("#contact")
form.addEventListener("submit", (e) => {
  e.preventDefault()                         // stop the page from reloading!
  const name = form.elements.name.value.trim()    // or document.querySelector("#name").value
  const phone = form.elements.phone.value.replaceAll(" ", "")

  if (name === "") return showError("Name is required")
  if (!/^\d{11}$/.test(phone)) return showError("Phone must be 11 digits")

  result.textContent = `Thanks, ${name}!`
  form.reset()                               // clear the fields
})
```
- A form's `submit` event fires on the button **and** on pressing Enter, so use it instead of a button click.
- **Values are always strings**: `Number(form.elements.amount.value)`.
- `/^\d{11}$/` is a **regular expression**: exactly 11 digits. `.test(text)` gives true/false.
- Keep HTML validation too (`required`, `type="email"`), but always check again in JavaScript.

### Practice (45 min)
Make the contact form on your site validate in JavaScript: show a red message under each wrong field, and a thank-you message when everything is right.

### Mini-Task (30 min)
::sandbox web-w09-d4-forms

### Log (10 min)
Update your log.

## Day 5 — Friday
**Topic:** State, render and saving: a to-do app
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a submit listener with `preventDefault`, reading a value, validating it.
- Why listen to `submit` and not the button's `click`?

### Lesson (45 min)
Put the pieces together the way real apps (and React) do:
1. **State**: one array holds the truth: `let todos = load()`.
2. **Render**: one function draws the page from the state.
3. **Events change the state, then call render** (never edit the page directly).
4. **Save** after every change.
```js
let todos = JSON.parse(storage.getItem("todos") ?? "[]")

function render() {
  list.innerHTML = ""
  todos.forEach((todo, i) => {
    const li = document.createElement("li")
    li.textContent = todo.text
    li.classList.toggle("done", todo.done)
    li.addEventListener("click", () => {
      todos = todos.map((t, j) => (j === i ? { ...t, done: !t.done } : t))
      update()
    })
    list.append(li)
  })
  left.textContent = `${todos.filter((t) => !t.done).length} left`
}

function update() {
  storage.setItem("todos", JSON.stringify(todos))
  render()
}
```
In the sandbox, real `localStorage` is blocked, so the starter gives you a `storage` that falls back to memory. On your own site it's the real thing.

### Practice (45 min)
Build the to-do app on your computer with real localStorage. Add, tick, delete, "clear done", and check it survives a reload.

### Mini-Task (30 min)
::sandbox web-w09-d5-todo

### Log (10 min)
Update your log.

## Day 6 — Saturday
**Topic:** Project day: the expense tracker gets a real page
**Time:** ~3 hours

### Review (30 min)
- Read your Week 9 log. From memory: state → render → events → save.

### Weekly Project (2 hours)
**Turn last week's `js-expenses` logic into a real web app.**
- A form with item, amount and category (a `<select>`); invalid amounts show an error and add nothing
- A list of expenses, each with a delete button
- A total in ₦ that updates on every change
- Saved in storage, so it survives a reload
- Styled with your Week 4 CSS skills, works on your phone, published on GitHub Pages

Build and test the core in the sandbox, then move it to your repo:

::sandbox web-w09-d6-expenses-app

### FreeCodeCamp (30 min)
Continue Basic JavaScript, or start The Odin Project's Rock Paper Scissors.

### Log (10 min)
Weekly review:
- Explain the render pattern in your own words.
- What still confuses me?
- Link to my live expense tracker.

## Quiz
1. What is the DOM?
2. What's the difference between `querySelector` and `querySelectorAll`?
3. Why prefer `textContent` over `innerHTML` for user text?
4. Write a click listener that increases a counter on the page.
5. What does `e.target` give you?
6. Create an `li` with text and add it to a list.
7. Why call `e.preventDefault()` in a submit listener?
8. Why are form values strings, and how do you get a number?
9. Describe state → render → events → save.
10. Why does the sandbox give you a `storage` instead of `localStorage`?

If you can answer all ten without notes, you're ready for Week 10. **Answers:** check each day's lesson.
