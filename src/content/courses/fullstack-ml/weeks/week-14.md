# Week 14 — Phase 2 Graduation
**Theme:** Turn Mama Put Kitchen from "it works on my laptop" into a site a real business could use: one source of data, a working order page, accessible, fast, findable, tested and live.
**Big question:** *What separates a finished website from a working demo?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📗 | [web.dev — Learn Accessibility](https://web.dev/learn/accessibility) | Wednesday. |
| 🧰 | [Lighthouse (Chrome DevTools)](https://developer.chrome.com/docs/lighthouse/overview) | Thursday and Friday: DevTools → Lighthouse → Analyze. |
| 🧰 | [axe DevTools (free browser extension)](https://www.deque.com/axe/devtools/) | Wednesday: finds accessibility problems for you. |
| 📗 | [The Open Graph protocol](https://ogp.me/) | Thursday: how links look when shared on WhatsApp. |
| 📗 | [WebAIM — Contrast checker](https://webaim.org/resources/contrastchecker/) | Wednesday. |

## Day 1 — Monday
**Topic:** One source of data: the menu as JSON
**Time:** ~2.5 hours

### Review (30 min)
- From memory: the cart's `add` function, and how the WhatsApp link is built.
- Where does the menu data live right now? (Probably in two places: the React app and the home page.)

### Lesson (45 min)
Right now the dishes are typed into `dishes.js` (React menu) **and** the home page's favourites. Change a price, and you must remember both. Real sites keep data in **one place** and every page reads it.

Put the menu in `menu.json` at the root of the site:
```json
[
  { "id": 1, "name": "Party jollof", "price": 3500, "category": "Rice", "spicy": false, "soldOut": false, "favourite": true },
  { "id": 4, "name": "Egusi + pounded yam", "price": 4500, "category": "Soups & swallow", "spicy": false, "soldOut": false, "favourite": true }
]
```
Then every page `fetch`es it (Week 10), with the usual three states:
```js
async function loadMenu(fetchFn = fetch) {
  const response = await fetchFn("menu.json")
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

async function showFavourites() {
  const box = document.querySelector(".favourites")
  box.textContent = "Loading…"
  try {
    const dishes = await loadMenu()
    box.innerHTML = dishes.filter((d) => d.favourite).map(cardHTML).join("")
  } catch {
    box.textContent = "Couldn't load today's favourites."
  }
}
```
- **JSON rules:** double quotes only, no trailing commas, no comments. One mistake breaks the whole file, so check it with a [JSON validator](https://jsonlint.com/).
- `fetch("menu.json")` doesn't work from a file opened directly (`file://`). Use VS Code's Live Server or `npx serve`, or test on GitHub Pages.
- In the React app, load the same file with `useEffect` (Week 13) instead of importing `dishes.js`.

### Practice (45 min)
1. Create `menu.json` with all your dishes (validate it).
2. Make the home page's favourites read from it.
3. Make the React menu read it too (`fetch("../menu.json")` from `menu/`), then delete `dishes.js`.

### Mini-Task (30 min)
::sandbox web-w14-d1-json

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** The Contact page: opening hours, "open now", and a WhatsApp enquiry form
**Time:** ~2.5 hours

### Review (30 min)
- From memory: `loadMenu` with a `fetchFn` parameter and an `ok` check.
- What are JSON's three most common mistakes?

### Lesson (45 min)
Customers' first question: **are you open right now?** Work it out from the hours, in **Lagos time** (a customer abroad, or a laptop set to another time zone, must still see Lagos hours):
```js
const HOURS = { 0: [12, 18], 1: [8, 21], 2: [8, 21], 3: [8, 21], 4: [8, 21], 5: [8, 21], 6: [8, 21] } // day → [open, close)

function lagosNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos", weekday: "short", hour: "numeric", hourCycle: "h23",
  }).formatToParts(date)
  const get = (type) => parts.find((p) => p.type === type).value
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"))
  return { day, hour: Number(get("hour")) }
}

function isOpen(date = new Date()) {
  const { day, hour } = lagosNow(date)
  const [open, close] = HOURS[day]
  return hour >= open && hour < close
}
```
- Passing `date` in (instead of always using "now") makes the function **testable**: you can ask "is it open on Sunday at 7 pm?" without waiting for Sunday.
- **The enquiry form** is plain JavaScript: validate the name and phone (the Week 13 rule), build the message, `encodeURIComponent` it, and open `https://wa.me/<number>?text=…`. Give every input a `<label>`.

### Practice (45 min)
1. Build `contact.html`: an hours table, an "Open now" / "Closed" badge, the address, and a Google Maps link (search "Herbert Macaulay Way Yaba", then Share → Copy link).
2. Add the enquiry form that opens WhatsApp with the filled-in message.
3. Test `isOpen` with dates you make up: `new Date("2026-10-11T19:00:00+01:00")` is a Sunday at 7 pm in Lagos.

### Mini-Task (30 min)
::sandbox web-w14-d2-contact

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** Accessibility: a site everyone can use
**Time:** ~2.5 hours

### Review (30 min)
- From memory: `isOpen(date)` using Lagos time, and why `date` is a parameter.
- How do you put a multi-line message into a WhatsApp link?

### Lesson (45 min)
About 1 in 6 people live with a disability. Some use a **screen reader** (the page read aloud), some only a **keyboard**, some **zoom** to 200%, some can't tell red from green. Accessible sites are also easier for everyone on a small, bright phone screen.

The checklist that catches most problems:
| Check | How |
|---|---|
| **Landmarks** | `<header>`, `<nav>`, `<main>` (one per page), `<footer>`. Screen readers jump between them. |
| **Headings in order** | One `<h1>`, then `<h2>`s, then `<h3>`s. Never pick a heading for its size; style it with CSS instead. |
| **Every input has a label** | `<label for="phone">Phone</label><input id="phone">` (or wrap the input in the label). A placeholder is not a label. |
| **Buttons are buttons** | Clickable things are `<button>` or `<a href>`, never a `<div onclick>`, which keyboards can't reach. |
| **Alt text** | Describes the food; `alt=""` for decoration. |
| **Visible focus** | Never `outline: none` without a replacement. Try `:focus-visible { outline: 3px solid var(--brand); outline-offset: 2px; }`. |
| **Colour contrast** | Text needs 4.5:1 against its background. Check with WebAIM's contrast checker. |
| **Language** | `<html lang="en">` so screen readers pronounce words correctly. |

**Test it yourself:** unplug the mouse and use the whole site with Tab, Shift+Tab, Enter and Space. Then run axe DevTools and Lighthouse's Accessibility audit.

### Practice (45 min)
1. Tab through every page of Mama Put Kitchen. Fix anything you can't reach or can't see focus on.
2. Run axe on each page and fix every "serious" or "critical" issue.
3. Check your brand red on cream with the contrast checker. Darken it if it fails.

### Mini-Task (30 min)
::sandbox web-w14-d3-a11y

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** Speed, search and sharing: Lighthouse, meta tags and Open Graph
**Time:** ~2.5 hours

### Review (30 min)
- From memory: 6 items from the accessibility checklist.
- Why is a `<div onclick>` a bug, not a style choice?

### Lesson (45 min)
**Lighthouse** (DevTools → Lighthouse) scores a page out of 100 for Performance, Accessibility, Best Practices and SEO, and tells you what to fix. Aim for **90+** in each, tested in **mobile** mode.

**What goes in every page's `<head>`:**
```html
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Menu · Mama Put Kitchen, Yaba</title>                    <!-- unique per page, under 60 characters -->
  <meta name="description" content="Jollof, egusi, pepper soup and more in Yaba. Order on WhatsApp.">
  <link rel="icon" href="favicon.png">

  <!-- Open Graph: how the link looks when shared on WhatsApp, Facebook, LinkedIn -->
  <meta property="og:title" content="Mama Put Kitchen · Yaba">
  <meta property="og:description" content="Home-style Nigerian food. Order on WhatsApp.">
  <meta property="og:image" content="https://<you>.github.io/mama-put-kitchen/images/share.jpg">
  <meta property="og:url" content="https://<you>.github.io/mama-put-kitchen/">
</head>
```
- **Open Graph matters in Nigeria**: most people will share the link on WhatsApp. Without `og:image` the preview is a bare link; with it, a photo of jollof. The image URL must be the **full** address (1200×630 works well).
- **Performance** is mostly images: compressed, sized, lazy (Week 11). Then fewer and smaller scripts.
- You can't put `<head>` tags inside the sandbox, so today's sandbox is a **Python script that audits HTML**, like a mini Lighthouse. Writing the checker is a good way to learn the rules.

### Practice (45 min)
1. Add a unique title and description to every page, plus a favicon and Open Graph tags (make a 1200×630 share image in Canva).
2. Run Lighthouse (mobile) on every page. Write down all four scores, fix the top 3 suggestions, and run it again.
3. Paste your site link into a WhatsApp chat with yourself and check the preview.

### Mini-Task (30 min)
::sandbox py-w14-d4-audit

### Log (10 min)
Update your log.

## Day 5 — Friday
**Topic:** Bug bash and launch checklist
**Time:** ~2.5 hours

### Review (30 min)
- From memory: the tags every page's `<head>` needs, and what `og:image` does.
- What were your Lighthouse scores before and after?

### Lesson (45 min)
Before a real launch, teams do a **bug bash**: use the site like a fussy customer and try to break it. Typical finds:
- a link to a page that doesn't exist (`about.htm` instead of `about.html`)
- a total that's wrong for one case (exactly ₦15,000, an empty cart)
- a page that scrolls sideways on a small phone
- an image with no alt text
- the nav marking the wrong page as current
- a missing **404 page**: GitHub Pages shows `404.html` from your repo root for any unknown address, so make a friendly one with a link home

**The launch checklist:**
1. Every page works on a real phone (not just DevTools).
2. Every link and button goes somewhere real.
3. Prices and totals are right, including edge cases.
4. Lighthouse 90+ on mobile, axe has no serious issues.
5. A `404.html` exists.
6. `README.md` has a description, a screenshot, the live link, and what you learned.
7. Someone who isn't you has tried it, and you fixed what confused them.

### Practice (45 min)
1. Bug-bash your own site for 20 minutes and write every bug down before fixing anything.
2. Ask a friend or family member to order something on their phone while you watch silently. Note where they hesitate.
3. Make `404.html`.

### Mini-Task (30 min)
::sandbox web-w14-d5-bugbash

### Log (10 min)
Update your log.

## Day 6 — Saturday
**Topic:** Graduation: ship Mama Put Kitchen and review Phase 2
**Time:** ~3 hours

### Review (30 min)
- Read your Phase 2 logs (Weeks 7–14). List the 5 things you're most proud of and the 3 that still feel shaky.

### Weekly Project (2 hours)
**Ship the Phase 2 milestone.** By the end of today Mama Put Kitchen must have:
- **Home, Menu (React), About and Contact pages**, live on GitHub Pages, all sharing one design system and one header
- **One `menu.json`** that every page reads
- **A working cart and WhatsApp order** (Menu) and **enquiry form with "open now"** (Contact)
- **Lighthouse 90+** on mobile for every page, **no serious axe issues**, a **404 page**
- **Open Graph tags**, so the link shows a photo when shared on WhatsApp
- **A `README.md`** with a screenshot, the live link, the tech used, and 3 things you learned

Final check of the order logic in one place:

::sandbox web-w14-d6-launch

Then:
1. **Portfolio:** add Mama Put Kitchen as your featured project, with a screenshot and 2 sentences on what it does and what you built.
2. **Apply:** send the link to 3 real local businesses (a buka, a salon, a tailor) offering to build theirs. Use the Phase 1 freelance template. One reply is a win.

### FreeCodeCamp (30 min)
Finish any open Responsive Web Design or JavaScript projects. Phase 3 (the backend) starts next week.

### Log (10 min)
Phase 2 retrospective:
- What can I build now that I couldn't 8 weeks ago?
- What will I do differently in Phase 3?
- Link to the live site.

## Quiz
1. Why keep the menu in one `menu.json` instead of in each page?
2. Name 3 JSON mistakes that break a file.
3. Why does `isOpen` take a `date` parameter, and why use the Africa/Lagos time zone?
4. Name 6 items from the accessibility checklist.
5. Why is a `<div onclick>` an accessibility bug?
6. What does Lighthouse measure, and what score should you aim for?
7. Which tags should every page's `<head>` have?
8. What is Open Graph, and why does it matter for a Lagos business?
9. What's a bug bash, and what's on your launch checklist?
10. What does `404.html` do on GitHub Pages?

If you can answer all ten without notes, you've finished Phase 2. 🎓 **Answers:** check each day's lesson; for 5: keyboards and screen readers can't reach or activate it, so use `<button>`.
