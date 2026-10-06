# Week 11 — Modern CSS and Multi-page Sites
**Theme:** Lay out whole pages with CSS Grid, keep a design consistent with custom properties, and start the Phase 2 milestone: a multi-page site for Mama Put Kitchen.
**Big question:** *How do real websites keep many pages looking like one design?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Kevin Powell — CSS Grid (YouTube channel)](https://www.youtube.com/@KevinPowell) | Search "learn CSS Grid the easy way". Monday and Tuesday. |
| 🎮 | [Grid Garden](https://cssgridgarden.com/) | A game that teaches Grid. Do levels 1–14 on Monday, the rest on Tuesday. |
| 📗 | [MDN — CSS grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout) | The reference. |
| 📗 | [MDN — Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) | Wednesday. |
| 📗 | [MDN — Responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images) | Thursday. |
| 🎨 | [Excalidraw](https://excalidraw.com/) | Saturday: sketch your wireframes (free, no account). |

## Day 1 — Monday
**Topic:** CSS Grid I: rows, columns and gaps
**Time:** ~2.5 hours

### Review (30 min)
- From memory: what does `display: flex` do, and what do `justify-content` and `align-items` control?
- Rebuild a row of three cards with Flexbox in under 5 minutes.

### Lesson (45 min)
Flexbox lays things out in **one direction** (a row *or* a column). **Grid** lays things out in **two directions at once**: rows *and* columns. Most real pages use both: Grid for the page and big sections, Flexbox inside small pieces like a nav bar.

```css
.menu {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* three equal columns */
  gap: 1rem;                           /* space between cells */
}
```
- **`fr`** = a fraction of the free space. `2fr 1fr` makes the first column twice as wide.
- **`repeat(3, 1fr)`** is the short way to write `1fr 1fr 1fr`.
- Mix units: `grid-template-columns: 200px 1fr` gives a fixed sidebar and a flexible main area.
- **`gap`** replaces margins between items. No more "last item has an extra margin" bugs.
- Children fill the cells in order, left to right, then wrap onto the next row by themselves.

Make one item bigger:
```css
.special { grid-column: span 2; }   /* takes two columns */
```

### Practice (45 min)
1. Play Grid Garden levels 1–14.
2. In `week11/grid.html`, make a 3-column grid of 6 dish cards (jollof, fried rice, egusi, efo riro, moi moi, plantain), with a `1rem` gap.
3. Make the first card span 2 columns. What happens to the others?

### Mini-Task (30 min)
::sandbox web-w11-d1-grid

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** CSS Grid II: responsive grids and page layouts
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a 3-column grid with a gap, and a card spanning 2 columns.
- What's the difference between `1fr` and `33%`?

### Lesson (45 min)
**A grid that fits any screen with no media query:**
```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
```
Read it as: "make as many columns as fit, each at least 220px, sharing the leftover space". It gives 1 column on a phone, 2 on a tablet and 4 on a laptop. This is the most useful line of CSS you'll learn this week.

**Whole-page layouts with named areas:**
```css
.page {
  display: grid;
  grid-template-columns: 1fr 250px;
  grid-template-areas:
    "header header"
    "main   aside"
    "footer footer";
  gap: 1rem;
}
header { grid-area: header; }
main   { grid-area: main; }
aside  { grid-area: aside; }
footer { grid-area: footer; }

@media (max-width: 600px) {          /* phones: one column, aside under main */
  .page {
    grid-template-columns: 1fr;
    grid-template-areas: "header" "main" "aside" "footer";
  }
}
```
The areas are a little drawing of the page. To rearrange it on a phone, redraw it; the HTML doesn't change.

### Practice (45 min)
1. Finish Grid Garden.
2. Turn yesterday's dish grid into `repeat(auto-fit, minmax(220px, 1fr))`, then drag your browser narrower and wider.
3. Build a page with `header / main + aside / footer` areas that becomes one column under 600px. Check it in DevTools' device toolbar (Ctrl+Shift+M / ⌘⇧M).

### Mini-Task (30 min)
::sandbox web-w11-d2-layout

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** Custom properties: a mini design system
**Time:** ~2.5 hours

### Review (30 min)
- From memory: the `auto-fit` + `minmax` line, and a `grid-template-areas` layout.
- Why doesn't the responsive card grid need a media query?

### Lesson (45 min)
Big sites repeat the same colours, spacing and fonts on hundreds of pages. Typing `#c0392b` 200 times means 200 places to change when the brand changes. **Custom properties** (CSS variables) give each value a name:
```css
:root {                         /* :root = the whole page */
  --brand: #c0392b;             /* pepper red */
  --brand-dark: #8e2a20;
  --cream: #fff8ef;
  --space: 1rem;
  --radius: 12px;
  --font-heading: Georgia, serif;
}

.button {
  background: var(--brand);
  padding: calc(var(--space) / 2) var(--space);
  border-radius: var(--radius);
}
.button:hover { background: var(--brand-dark); }
```
- Define once in `:root`, use everywhere with `var(--name)`.
- **`var(--name, fallback)`** uses the fallback if the variable isn't set.
- Variables can be **changed in one section**: `.dark { --cream: #1f1a17; }` repaints everything inside `.dark` that uses `--cream`.
- **`calc()`** does maths with them: `calc(var(--space) * 2)`.
- JavaScript can change them too: `document.documentElement.style.setProperty('--brand', 'green')`.

This set of named decisions (colours, spacing, radius, fonts) is a **design system**: a small one, but the same idea big companies use.

### Practice (45 min)
1. Write a `:root` block for Mama Put Kitchen: 2 brand colours, a background, a text colour, a spacing unit, a radius and a heading font.
2. Restyle your dish cards and a button using only variables (no raw colours below `:root`).
3. Add a `.dark` section that redefines 2 variables, and watch it repaint.

### Mini-Task (30 min)
::sandbox web-w11-d3-tokens

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** Responsive images and media
**Time:** ~2.5 hours

### Review (30 min)
- From memory: define `--brand` in `:root` and use it on a button.
- How would you make one section dark without new colours everywhere?

### Lesson (45 min)
Images are usually the heaviest part of a page. On a Nigerian mobile data plan, a 4 MB photo is a real cost to your visitor.

**Never let an image overflow its box:**
```css
img { max-width: 100%; height: auto; display: block; }
```

**Same-shaped photos from different-shaped files:**
```css
.dish img {
  width: 100%;
  aspect-ratio: 4 / 3;      /* every card image the same shape */
  object-fit: cover;        /* fill the box, crop the edges, never squash */
  border-radius: var(--radius);
}
```

**Send small files to small screens:**
```html
<img
  src="jollof-800.jpg"
  srcset="jollof-400.jpg 400w, jollof-800.jpg 800w, jollof-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw, 33vw"
  alt="Party jollof rice with fried plantain and chicken"
  loading="lazy" width="800" height="600">
```
- **`srcset` + `sizes`**: the browser picks the smallest file that still looks sharp.
- **`loading="lazy"`**: images below the screen load only when you scroll near them.
- **`width` and `height`**: the browser reserves the space, so the page doesn't jump as images arrive.
- **`alt`**: describes the image for screen readers and when it fails to load. Describe the food, not "image of".
- Make photos smaller before uploading: [Squoosh](https://squoosh.app/) (free, in the browser). WebP files are often half the size of JPEGs.

### Practice (45 min)
1. Find 4 free food photos (Unsplash or Pexels, search "jollof", "suya", "egusi") and shrink them with Squoosh to under 150 KB each.
2. Put them in your dish cards with `aspect-ratio`, `object-fit: cover`, `loading="lazy"` and good alt text.
3. DevTools → Network → reload: compare the page weight before and after.

### Mini-Task (30 min)
::sandbox web-w11-d4-images

### Log (10 min)
Update your log.

## Day 5 — Friday
**Topic:** Multi-page sites and a shared header
**Time:** ~2.5 hours

### Review (30 min)
- From memory: the 4 CSS lines that make card images the same shape without squashing them.
- What do `loading="lazy"` and `width`/`height` each fix?

### Lesson (45 min)
A real site has several pages: `index.html`, `menu.html`, `about.html`, `contact.html`, one shared `styles.css`, and an `images/` folder.
```
mama-put-kitchen/
├── index.html
├── menu.html
├── about.html
├── contact.html
├── styles.css
├── site.js
└── images/
```
- Link pages with **relative paths**: `<a href="menu.html">Menu</a>`. They keep working on GitHub Pages and on your laptop.
- Every page links the **same** `styles.css`, so the design stays consistent: that's Wednesday's design system paying off.

**The repeated header problem.** Every page needs the same nav. Copy-pasting it into 4 files means editing 4 files every time it changes. One fix without a framework: build it once in JavaScript.
```js
// site.js: loaded by every page with <script src="site.js" defer></script>
const pages = [
  { href: "index.html", label: "Home" },
  { href: "menu.html", label: "Menu" },
  { href: "about.html", label: "About" },
  { href: "contact.html", label: "Contact" },
]

const here = location.pathname.split("/").pop() || "index.html"
const links = pages
  .map((p) => `<a href="${p.href}"${p.href === here ? ' aria-current="page"' : ""}>${p.label}</a>`)
  .join("")
document.querySelector("#site-header").innerHTML = `<nav>${links}</nav>`
```
- **`aria-current="page"`** tells screen readers which page you're on. Style it too: `nav a[aria-current="page"] { font-weight: bold; }`.
- **`defer`** runs the script after the HTML has loaded.
- This is exactly the problem React solves with components (Week 12): one header, used everywhere.

### Practice (45 min)
1. Create the folder and the 4 pages above, each with a `<header id="site-header"></header>`, a `<main>` with a heading, and a footer.
2. Write `site.js` so every page gets the nav, with the current page marked.
3. Do the same for the footer (opening hours and a copyright year from `new Date()`).

### Mini-Task (30 min)
::sandbox web-w11-d5-header

### Log (10 min)
Update your log.

## Day 6 — Saturday
**Topic:** Milestone, part 1: plan Mama Put Kitchen and build the home page
**Time:** ~3 hours

### Review (30 min)
- Read your Week 11 log. From memory: an `auto-fit` grid, a `:root` design system, a responsive image, and the shared header script.

### Weekly Project (2 hours)
**The Phase 2 milestone is a multi-page site for "Mama Put Kitchen", a Lagos buka.** Each Saturday until Week 14 builds a piece of it. Today you plan it and build the home page.

**1. The brief (20 min).** Write it in `README.md`:
- Mama Put Kitchen sells home-style Nigerian food in Yaba: jollof, fried rice, egusi, efo riro, pounded yam, moi moi, plantain, pepper soup, zobo.
- Open Mon–Sat 8 am–9 pm, Sun 12–6 pm. Customers order on WhatsApp for pickup or delivery.
- Goal of the site: customers see the menu with ₦ prices, the opening hours and the location, and send an order on WhatsApp in under a minute, on a phone.

**2. Sitemap (10 min).** Home · Menu · About · Contact. One line each on what's on that page.

**3. Wireframes (30 min).** In Excalidraw, sketch the home page on a phone and on a laptop: just boxes and labels, no colours yet.

**4. Build the home page (60 min)**, using everything from this week:
- `:root` design tokens (colours, spacing, radius, fonts), and no raw colours outside `:root`
- the shared header from `site.js`, with "Home" marked current
- a hero section: name, one-line promise, an "Order on WhatsApp" button (a plain link for now)
- "Today's favourites": a responsive `auto-fit` grid of 4 dish cards with photo, name and ₦ price
- opening hours and address
- a footer with the year
- responsive images (`aspect-ratio`, `object-fit`, `loading="lazy"`, alt text)

Build and test the pieces here first:

::sandbox web-w11-d6-home

**5. Ship it.** Push to a new GitHub repo `mama-put-kitchen` and turn on GitHub Pages (Week 4). Open it on your phone.

### FreeCodeCamp (30 min)
Continue the Responsive Web Design projects, or The Odin Project's "Grid" lessons.

### Log (10 min)
Weekly review:
- Explain Grid vs Flexbox to a friend in 2 sentences.
- What still confuses me?
- Link to the live Mama Put Kitchen home page.

## Quiz
1. When would you choose Grid over Flexbox?
2. What does `1fr` mean?
3. Write a card grid that fits any screen width without a media query.
4. What does `grid-template-areas` let you do, and how do you change a layout on phones with it?
5. Where do you define custom properties so the whole page can use them, and how do you use one?
6. How would you make one section dark by changing only two variables?
7. Which CSS makes card images the same shape without squashing them?
8. What do `srcset`, `loading="lazy"` and `alt` each do?
9. Why link pages with relative paths?
10. How did you avoid copy-pasting the header into every page, and what does `aria-current="page"` do?

If you can answer all ten without notes, you're ready for Week 12. **Answers:** check each day's lesson; for 3: `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`.
