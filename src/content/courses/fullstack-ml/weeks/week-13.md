# Week 13 — React II: State and Effects
**Theme:** Make React apps interactive: state that changes the page, forms React controls, data loaded with effects, and state shared between components.
**Big question:** *When something changes on the screen, where does that "something" live?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📗 | [react.dev — Adding Interactivity](https://react.dev/learn/adding-interactivity) | State, events, updating objects and arrays. Monday–Wednesday. |
| 📗 | [react.dev — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) | Thursday. |
| 📗 | [react.dev — Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) | Friday. |
| 📺 | [Mosh — React Tutorial for Beginners](https://www.youtube.com/watch?v=SqcY0GlETPk) | The state and forms sections. |

## Day 1 — Monday
**Topic:** useState: data that changes the screen
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a `DishCard` with props, and a list rendered with `map` and `key`.
- What happens on the page if you change a normal variable inside a component?

### Lesson (45 min)
Try this, and it won't work:
```jsx
function Counter() {
  let count = 0
  return <button onClick={() => { count = count + 1 }}>Plates: {count}</button>   // stays 0!
}
```
The variable changes, but React doesn't know it should **re-render** (run the component again and update the screen). **State** is data React remembers between renders, and changing it triggers a re-render:
```jsx
import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)       // [current value, function to change it]
  return (
    <>
      <p>Plates: {count}</p>
      <button onClick={() => setCount(count + 1)}>Add a plate</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </>
  )
}
```
- **`useState(0)`**: 0 is the starting value. It returns the current value and a **setter**.
- **Never change state directly** (`count = 5`); always call the setter.
- Each component instance has **its own** state: two `<Counter />`s count separately.
- When the next value depends on the previous one, pass a function: `setCount((c) => c + 1)`. It's always correct, even if React batches several updates together.
- Functions whose names start with `use` are **hooks**. Call them at the top of the component, never inside `if`s or loops.

### Practice (45 min)
1. In your Vite app, build the `Counter` above, then try the broken `let count` version to see it fail.
2. Add a "Remove a plate" button that never goes below 0.
3. Render two counters side by side and confirm they're independent.

### Mini-Task (30 min)
::sandbox web-w13-d1-state

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** Events and controlled forms
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a counter with `useState` and a reset button.
- Why does a plain `let` variable not update the screen?

### Lesson (45 min)
In Week 9 you read `input.value` when the form was submitted. In React, the input's value **lives in state**: a **controlled input**.
```jsx
function OrderForm() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [sent, setSent] = useState(false)

  const phoneOk = /^0\d{10}$/.test(phone)        // derived: computed, not stored

  function handleSubmit(e) {
    e.preventDefault()                            // same as Week 9: no page reload
    if (!name.trim() || !phoneOk) return
    setSent(true)
  }

  if (sent) return <p>Thanks, {name}! We'll call you.</p>

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0803…" />
      {phone && !phoneOk && <p className="error">Use 11 digits starting with 0</p>}
      <button disabled={!name.trim() || !phoneOk}>Send</button>
    </form>
  )
}
```
- **`value={state}` + `onChange`**: React is the single source of truth for what's in the box.
- Event handlers get an **event** object: `e.target.value` is the input's text.
- **Derived values**: don't keep `phoneOk` in state. Calculate it from `phone` on every render; then it can never be out of date.
- `onClick={handleClick}` passes the function. `onClick={handleClick()}` *calls* it during render: a classic bug.

### Practice (45 min)
1. Build `OrderForm` and test the validation.
2. Add a "Delivery or pickup" `<select>` as another controlled input, and show an address box only for delivery.
3. Show a live character count under a "Notes" textarea (a derived value).

### Mini-Task (30 min)
::sandbox web-w13-d2-forms

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** State with arrays and objects
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a controlled input with `value` and `onChange`.
- What's a derived value, and why not store it in state?

### Lesson (45 min)
React decides whether to re-render by checking if the state is a **new** value. If you change an array or object in place (`cart.push(...)`), it's the same array, so React may not notice. Always make **a new copy with the change**:
```jsx
const [cart, setCart] = useState([])   // [{ id, name, price, qty }]

// add
setCart([...cart, { id: 3, name: "Moi moi", price: 1000, qty: 1 }])

// remove
setCart(cart.filter((item) => item.id !== 3))

// change one item (here: qty + 1)
setCart(cart.map((item) => (item.id === 3 ? { ...item, qty: item.qty + 1 } : item)))

// objects too
const [customer, setCustomer] = useState({ name: "", area: "Yaba" })
setCustomer({ ...customer, area: "Surulere" })
```
| Don't (mutates) | Do (new copy) |
|---|---|
| `cart.push(x)` | `[...cart, x]` |
| `cart.splice(i, 1)` | `cart.filter(...)` |
| `cart[i].qty++` | `cart.map(...)` with `{ ...item, qty: item.qty + 1 }` |
| `customer.area = "Surulere"` | `{ ...customer, area: "Surulere" }` |

These are the same `map`/`filter`/spread tools from Week 8, now with a reason: **immutability** lets React (and you) see exactly what changed.

### Practice (45 min)
1. Keep a list of dishes in state, with an "Add" form and a "Remove" button on each.
2. Add a "★" button that toggles a `favourite` flag on one dish (using `map`).
3. Break it on purpose: use `push` and watch the screen not update. Then fix it.

### Mini-Task (30 min)
::sandbox web-w13-d3-arrays

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** useEffect: loading data and syncing with the outside world
**Time:** ~2.5 hours

### Review (30 min)
- From memory: add, remove and update one item in an array in state, without mutating.
- Why does `cart.push()` not update the screen?

### Lesson (45 min)
Rendering should only *describe* the page. Things that reach **outside** React (fetching data, saving to localStorage, timers) go in an **effect**, which runs after React has updated the screen:
```jsx
import { useEffect, useState } from "react"

function Menu({ loadMenu }) {           // loadMenu is passed in, so it can be faked in tests
  const [dishes, setDishes] = useState([])
  const [status, setStatus] = useState("loading")   // "loading" | "error" | "ready"

  useEffect(() => {
    loadMenu()
      .then((data) => { setDishes(data); setStatus("ready") })
      .catch(() => setStatus("error"))
  }, [loadMenu])                         // the dependency array: re-run only when these change

  if (status === "loading") return <p>Loading the menu…</p>
  if (status === "error") return <p>Couldn't load the menu. Check your connection.</p>
  return <ul>{dishes.map((d) => <li key={d.id}>{d.name}</li>)}</ul>
}
```
- **The dependency array decides when the effect runs:**
  - `[]`: once, after the first render.
  - `[city]`: after the first render, and again whenever `city` changes.
  - no array: after *every* render (rarely what you want).
- These are the same three states as Week 10 (loading, error, success), now as state.
- **Syncing to localStorage:** `useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)) }, [cart])`.
- **Cleanup:** return a function to undo the effect (clear a timer, ignore a stale response):
```jsx
useEffect(() => {
  const id = setInterval(() => setNow(new Date()), 1000)
  return () => clearInterval(id)
}, [])
```
In development, React runs effects **twice** on purpose (Strict Mode) to catch missing cleanups. That's normal.

### Practice (45 min)
1. Load the 3-day Lagos forecast from Open-Meteo (Week 10) inside a React component with loading and error states.
2. Add a city `<select>`; put the city in the dependency array so the forecast reloads when it changes.
3. Save the chosen city to localStorage with a second effect, and read it back as the starting state: `useState(() => localStorage.getItem("city") ?? "Lagos")`.

### Mini-Task (30 min)
::sandbox web-w13-d4-effects

### Log (10 min)
Update your log.

## Day 5 — Friday
**Topic:** Lifting state up: props down, events up
**Time:** ~2.5 hours

### Review (30 min)
- From memory: an effect that loads data with loading and error states.
- What does `[]` mean as a dependency array? What about `[city]`?

### Lesson (45 min)
Two components need the same data: the menu has "Add" buttons, and the cart shows what was added. If each kept its own state, they'd disagree. **Lift the state up** to their closest common parent, then:
- pass the **data down** as props;
- pass **functions down** so children can ask the parent to change it (**events up**).
```jsx
function App() {
  const [cart, setCart] = useState([])

  function add(dish) {
    setCart((c) =>
      c.some((i) => i.id === dish.id)
        ? c.map((i) => (i.id === dish.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { ...dish, qty: 1 }],
    )
  }

  return (
    <>
      <MenuList dishes={dishes} onAdd={add} />   {/* events up */}
      <CartSummary cart={cart} />               {/* data down */}
    </>
  )
}

function MenuList({ dishes, onAdd }) {
  return dishes.map((d) => (
    <button key={d.id} onClick={() => onAdd(d)}>Add {d.name}</button>
  ))
}

function CartSummary({ cart }) {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)   // derived
  return <p>{cart.length} items · ₦{total.toLocaleString()}</p>
}
```
- There is **one source of truth**: the `cart` in `App`. Everything else reads it or asks to change it.
- Name callback props `onSomething` (`onAdd`, `onRemove`), like built-in events.
- The total is **derived** from the cart, not stored.

### Practice (45 min)
1. Build `App`, `MenuList` and `CartSummary` as above.
2. Add `onRemove` and `onChangeQty` callbacks, with "+" and "−" buttons in the cart.
3. Draw the component tree on paper with arrows: data down, events up.

### Mini-Task (30 min)
::sandbox web-w13-d5-lift

### Log (10 min)
Update your log.

## Day 6 — Saturday
**Topic:** Milestone, part 3: the Mama Put Kitchen cart
**Time:** ~3 hours

### Review (30 min)
- Read your Week 13 log. From memory: `useState`, a controlled input, immutable array updates, an effect, and lifting state up.

### Weekly Project (2 hours)
Add a **cart** to your React menu (`menu-app`):
1. **Add to cart** on every `DishCard` (disabled when sold out).
2. **Cart** component: one row per dish with quantity "−" / "+" buttons (removing at 0), the line total, and the **subtotal**.
3. **Delivery**: a pickup/delivery choice (controlled `<select>`). Delivery in Yaba costs ₦1,000 and is free from ₦15,000 up. Show the **grand total**.
4. **Persist** the cart in localStorage with an effect, so a refresh doesn't empty it.
5. **Send to WhatsApp**: build the order message from the cart and open `https://wa.me/<number>?text=<message>`. Encode the message with `encodeURIComponent()`, since spaces, ₦ and line breaks aren't allowed raw in a URL.
6. Rebuild and redeploy into `menu/` (`npm run build`), and test the whole flow on your phone.

Build and test the cart logic here first:

::sandbox web-w13-d6-cart

### FreeCodeCamp (30 min)
Continue the React section, or react.dev's "Managing State" chapter.

### Log (10 min)
Weekly review:
- Explain "state", "props" and "lifting state up" to a friend in 3 sentences.
- What still confuses me?
- Link to the live menu with the working cart.

## Quiz
1. Why doesn't changing a normal variable update the screen?
2. What does `useState` return?
3. When should you pass a function to the setter (`setCount((c) => c + 1)`)?
4. What makes an input "controlled"?
5. What's a derived value? Give an example from this week.
6. Why must you not use `push` on an array in state? What do you do instead?
7. What do `[]`, `[city]` and no dependency array mean for `useEffect`?
8. What is an effect's cleanup function for?
9. What does "lifting state up" mean, and how does a child ask the parent to change it?
10. Why must the WhatsApp message go through `encodeURIComponent`?

If you can answer all ten without notes, you're ready for Week 14. **Answers:** check each day's lesson; for 6: it changes the same array, so React may not see a change: make a new array with spread, `map` or `filter`.
