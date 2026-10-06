# Week 12 — React I: Components
**Theme:** Build pages from reusable pieces with React: set up a real project with Node, npm and Vite, write JSX, pass props, render lists, and deploy.
**Big question:** *Why do almost all modern web apps build pages out of components?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📗 | [react.dev — Learn](https://react.dev/learn) | The official tutorial. Read "Describing the UI" this week. |
| 📺 | [Mosh — React Tutorial for Beginners](https://www.youtube.com/watch?v=SqcY0GlETPk) | Watch the first hour across Monday–Wednesday. |
| 📗 | [Vite — Getting Started](https://vite.dev/guide/) | Monday. |
| 🌐 | [Node.js — Download (LTS)](https://nodejs.org/en/download) | Install the LTS version on Monday. |
| 📗 | [Vite — Deploying a static site](https://vite.dev/guide/static-deploy.html) | Friday: the GitHub Pages section. |

## Day 1 — Monday
**Topic:** Node, npm, Vite and your first component
**Time:** ~2.5 hours

### Review (30 min)
- From memory: how did you avoid copy-pasting the header into every page in Week 11?
- What would you have to do to add a "Blog" page to that site?

### Lesson (45 min)
Last week's `site.js` built one header from data and put it on every page. **React** does that for *everything*: you describe each piece of the page once, as a **component**, and reuse it.

**The tools:**
- **Node.js** runs JavaScript outside the browser. Your laptop needs it to run the build tools.
- **npm** comes with Node and downloads packages (other people's code), such as React itself.
- **Vite** creates the project, runs a live-reloading dev server, and builds the final files.

```bash
node --version            # after installing the LTS from nodejs.org
npm create vite@latest my-first-react -- --template react
cd my-first-react
npm install               # downloads React and friends into node_modules/
npm run dev               # opens http://localhost:5173 and reloads as you save
```
The important files:
```
my-first-react/
├── index.html           # has <div id="root"></div>
├── package.json         # the project's name, scripts and dependencies
├── node_modules/        # downloaded packages (never edit, never commit)
└── src/
    ├── main.jsx         # puts <App /> into #root
    └── App.jsx          # your first component
```

**A component is a function that returns what the page should show:**
```jsx
function Greeting() {
  return <h1>Welcome to Mama Put Kitchen</h1>
}

ReactDOM.createRoot(document.getElementById("root")).render(<Greeting />)
```
The HTML-looking part is **JSX**: JavaScript that looks like HTML. Vite turns it into ordinary JavaScript before the browser sees it. Component names **start with a capital letter**, and you use one like a tag: `<Greeting />`.

### Practice (45 min)
1. Install Node LTS and create the Vite React project above. Get `npm run dev` running.
2. Delete everything in `App.jsx` and return one `<h1>` with your name.
3. Add `node_modules` to `.gitignore` (Vite does this already; check it).

### Mini-Task (30 min)
The sandbox runs React the same way, with no install needed:

::sandbox web-w12-d1-first

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** JSX rules
**Time:** ~2.5 hours

### Review (30 min)
- From memory: the three commands that create and start a Vite React project.
- What's the difference between Node and npm?

### Lesson (45 min)
JSX looks like HTML but follows JavaScript's rules:
```jsx
function DishOfTheDay() {
  const name = "Party jollof"
  const price = 3500
  const soldOut = false

  return (
    <>                                           {/* 1. one parent: a fragment <> </> adds no extra div */}
      <h2 className="dish">{name}</h2>           {/* 2. className, not class */}
      <p>₦{price.toLocaleString()}</p>          {/* 3. {} runs any JavaScript expression */}
      <img src="jollof.jpg" alt={name} />        {/* 4. every tag must close: <img /> */}
      {soldOut && <p>Sold out today</p>}         {/* 5. show only if true */}
      <p>{soldOut ? "Try tomorrow" : "Order now"}</p>
      <p style={{ color: "#c0392b", fontWeight: "bold" }}>Hot!</p>  {/* 6. style is an object */}
    </>
  )
}
```
- **`{ }`** holds an *expression* (something that gives a value): variables, maths, function calls, ternaries. Not `if` statements or `for` loops.
- **`&&`** shows the right side only when the left is true. **`? :`** chooses between two things.
- Comments in JSX go inside braces: `{/* like this */}`.
- `return (` with brackets lets the JSX span several lines safely.

### Practice (45 min)
1. In `App.jsx`, show a dish with a name, price and image from variables.
2. Add a `soldOut` variable and show "Sold out today" only when it's true.
3. Break it on purpose: write `class=` and an unclosed `<img>`. Read the error Vite shows, then fix it.

### Mini-Task (30 min)
::sandbox web-w12-d2-jsx

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** Components and props
**Time:** ~2.5 hours

### Review (30 min)
- From memory: 4 differences between JSX and HTML.
- How do you show something only when a variable is true?

### Lesson (45 min)
A component with fixed text is only half the story. **Props** are the inputs to a component, like arguments to a function:
```jsx
function DishCard({ name, price, spicy = false }) {   // destructured props, with a default
  return (
    <article className="card">
      <h3>{name}{spicy && " 🌶️"}</h3>
      <p>₦{price.toLocaleString()}</p>
    </article>
  )
}

function Menu() {
  return (
    <section>
      <DishCard name="Party jollof" price={3500} />
      <DishCard name="Pepper soup" price={3000} spicy />
      <DishCard name="Moi moi" price={1000} />
    </section>
  )
}
```
- Strings go in quotes: `name="Party jollof"`. Anything else goes in braces: `price={3500}`.
- `spicy` on its own means `spicy={true}`.
- Props are **read-only**. A component never changes its own props.
- **`children`** is whatever you put between the tags:
```jsx
function Section({ title, children }) {
  return <section><h2>{title}</h2>{children}</section>
}
<Section title="Soups"><DishCard name="Egusi" price={4500} /></Section>
```
Small components that do one job, combined into bigger ones, is the whole idea of React.

### Practice (45 min)
1. Write `DishCard` and use it 4 times with different props.
2. Add a `Section` component with a `title` and `children`, and group your cards into "Rice" and "Soups".
3. Give `DishCard` an optional `photo` prop: show the image only if one was passed.

### Mini-Task (30 min)
::sandbox web-w12-d3-props

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** Rendering lists, and keys
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a `DishCard` with `name` and `price` props, used twice.
- What does `children` hold?

### Lesson (45 min)
Real menus come from data, not from typing `<DishCard>` 40 times. **`map`** turns an array of data into an array of components:
```jsx
const dishes = [
  { id: 1, name: "Party jollof", price: 3500, category: "Rice" },
  { id: 2, name: "Fried rice", price: 3500, category: "Rice" },
  { id: 3, name: "Egusi + pounded yam", price: 4500, category: "Soups" },
  { id: 4, name: "Pepper soup", price: 3000, category: "Soups" },
]

function Menu() {
  return (
    <ul>
      {dishes.map((dish) => (
        <li key={dish.id}>{dish.name}: ₦{dish.price.toLocaleString()}</li>
      ))}
    </ul>
  )
}
```
- **`key`** gives each item a stable identity so React can update the list correctly when items are added, removed or reordered. Use an id from the data; using the array index causes bugs when the list changes.
- Without `key`, React prints a warning in the console. Read your console!
- **Filter, then map:** `dishes.filter((d) => d.category === "Soups").map(...)`.
- **Empty states:** `{dishes.length === 0 && <p>No dishes today.</p>}`.
- Group by category: `[...new Set(dishes.map((d) => d.category))]` gives the unique categories.

### Practice (45 min)
1. Move your dishes into an array (at least 8, with `id`, `name`, `price`, `category`) and render them with `map`.
2. Render one `Section` per category, each listing only its dishes.
3. Remove the `key` and find the warning in the console. Put it back.

### Mini-Task (30 min)
::sandbox web-w12-d4-lists

### Log (10 min)
Update your log.

## Day 5 — Friday
**Topic:** Organising a React project and deploying it
**Time:** ~2.5 hours

### Review (30 min)
- From memory: render an array of dishes with `map` and a `key`.
- Why is the array index a bad key?

### Lesson (45 min)
**One component per file**, imported where it's used:
```jsx
// src/components/DishCard.jsx
export default function DishCard({ name, price }) {
  return <article className="card"><h3>{name}</h3><p>₦{price.toLocaleString()}</p></article>
}

// src/data/dishes.js
export const dishes = [ /* … */ ]

// src/App.jsx
import DishCard from "./components/DishCard.jsx"
import { dishes } from "./data/dishes.js"
```
- **`export default`** (one per file) is imported with any name and no braces. **Named exports** (`export const dishes`) are imported with braces and the exact name.
- Put images in `public/` and use them as `src="/jollof.jpg"`, or import them: `import jollof from "./assets/jollof.jpg"`.
- CSS: `import "./App.css"` in a component file. Vite bundles it.

**Building and deploying.** The browser can't run JSX, so you **build** first:
```bash
npm run build      # compiles everything into dist/: plain HTML, CSS and JS
npm run preview    # check the built site locally
```
GitHub Pages serves your repo at `https://<you>.github.io/<repo>/`, so tell Vite that base path in `vite.config.js`:
```js
export default defineConfig({
  plugins: [react()],
  base: "/mama-put-kitchen/menu/",
})
```
Then publish `dist/` (Vite's docs show a ready-made GitHub Actions workflow). The base path is the #1 reason a deployed React app shows a blank page: the files load from the wrong address.

### Practice (45 min)
1. Split your menu app into `components/DishCard.jsx`, `components/Section.jsx` and `data/dishes.js`.
2. Run `npm run build`, then `npm run preview`, and check it works.
3. Open `dist/index.html` in an editor: no JSX left, just plain JavaScript.

### Mini-Task (30 min)
::sandbox web-w12-d5-compose

### Log (10 min)
Update your log.

## Day 6 — Saturday
**Topic:** Milestone, part 2: the Mama Put Kitchen menu in React
**Time:** ~3 hours

### Review (30 min)
- Read your Week 12 log. From memory: JSX rules, props, `map` with keys, export/import, and the base path.

### Weekly Project (2 hours)
**Build the Menu page as a React app** inside your `mama-put-kitchen` repo:

1. In the repo, run `npm create vite@latest menu-app -- --template react` and `npm install` inside it.
2. **Data** (`src/data/dishes.js`): at least 12 dishes with `id`, `name`, `price`, `category` (Rice, Soups & swallow, Sides, Drinks), `spicy` (true/false) and `soldOut` (true/false).
3. **Components:**
   - `DishCard`: name, ₦ price (with commas), a 🌶️ when spicy, and a "Sold out" badge plus a faded style when sold out.
   - `MenuSection`: a category title and its cards in your Week 11 responsive grid.
   - `App`: the restaurant name, then one `MenuSection` per category, in a fixed order.
4. **Style** it with the same design tokens as the home page (copy your `:root` block into `src/index.css`).
5. **Deploy into the same site:** in `vite.config.js` set `base: "/mama-put-kitchen/menu/"` and `build: { outDir: "../menu", emptyOutDir: true }` (Vite won't clear a folder outside the project without that), run `npm run build`, and commit the `menu/` folder. Change the site nav's Menu link to `menu/`.

Build and test the components here first:

::sandbox web-w12-d6-menu

### FreeCodeCamp (30 min)
Start the React section of the Full Stack curriculum, or react.dev's "Thinking in React".

### Log (10 min)
Weekly review:
- Explain components and props to a friend in 3 sentences.
- What still confuses me?
- Link to the live React menu.

## Quiz
1. What do Node, npm and Vite each do?
2. Why must component names start with a capital letter?
3. Give 4 ways JSX differs from HTML.
4. How do you show something only when a condition is true, and how do you choose between two things?
5. What are props, and can a component change its own props?
6. What is `children`?
7. Write JSX that renders an array of dishes as a list.
8. Why do list items need a `key`, and why not use the array index?
9. What's the difference between a default export and a named export?
10. What does `npm run build` produce, and why does the `base` setting matter on GitHub Pages?

If you can answer all ten without notes, you're ready for Week 13. **Answers:** check each day's lesson; for 8: keys let React match items between renders, and indexes change when the list changes.
