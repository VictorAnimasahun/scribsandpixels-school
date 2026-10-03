# Phase 2 plan (Weeks 7–14): APPROVED by Victor, 3 Oct 2026

**Phase:** Web development: making things you can see. **Topics:** JavaScript, CSS, React.
**Milestone (from the original plan):** a multi-page website for a fictional Nigerian business, live on GitHub Pages.

Nothing below is written into `course.ts` or `weeks/` until it's approved. Change anything.

## Why this order
- JavaScript comes first and slowly (Weeks 7–10): every later phase depends on it, and the learner already knows the programming ideas from Python. Each JS lesson starts from "you did this in Python; here's the JS way".
- CSS gets one more week (Week 11) for Grid and a multi-page structure, because the milestone is a multi-page site.
- React gets two weeks (12–13): enough for components, props, state and fetching. Phase 4 (React + Django) builds on it, so Phase 2 only needs the foundations.
- The milestone (Week 14) is plain HTML/CSS/JS, so it deploys to GitHub Pages with no build step. A React version is an optional stretch.

## Weeks
| Week | Title | Topics | Saturday project |
|---|---|---|---|
| 7 | JavaScript: Python's Cousin | JS in the browser and console · let/const, types, template literals · if/else, loops · functions and arrow functions | Port the Week 1 quiz game to JavaScript |
| 8 | Arrays, Objects and JSON | arrays and objects (vs lists and dicts) · map/filter/reduce · sorting · JSON.parse/stringify · localStorage | Expense tracker logic in JS, saved in localStorage |
| 9 | The DOM: Pages That React | querySelector · events (click, input, submit) · creating and removing elements · form validation | Interactive to-do list / Naira tip-and-split calculator |
| 10 | Talking to APIs from the Browser | fetch, promises, async/await · loading and error states · CORS in one paragraph | Lagos weather page (Week 6's script, now in the browser with Open-Meteo) |
| 11 | Modern CSS and Multi-page Sites | CSS Grid · custom properties (variables) · responsive images · shared header/footer across pages · a mini design system | Start the milestone: plan the business, sitemap, wireframes, and build the home page |
| 12 | React I: Components | Node and npm · Vite · JSX · components and props · rendering lists · deploying a Vite app to GitHub Pages | Menu/product cards as React components |
| 13 | React II: State and Effects | useState · events and controlled forms · useEffect + fetch · lifting state up | React shopping cart with totals in ₦ |
| 14 | Phase 2 Graduation | Milestone polish: menu from JSON, order form → WhatsApp, accessibility + Lighthouse, deploy · portfolio update · Phase 2 review | **Milestone:** multi-page site for a fictional Nigerian business on GitHub Pages |

## Milestone brief (Week 14)
A multi-page site (Home · Menu/Products · About · Contact) for a fictional business. Suggestion: **"Mama Put Kitchen", a Lagos buka** (menu with ₦ prices, opening hours, WhatsApp ordering). Alternatives: an Abuja tailor, an Enugu phone-repair shop.
- Product/menu data in a JSON file, rendered with JavaScript (Week 8–9 skills)
- An order or enquiry form that validates input and opens WhatsApp with the message filled in
- Live open/closed badge from the current time (Week 9)
- Responsive (Grid/Flexbox), accessible (Lighthouse 90+), live on GitHub Pages with a README

## Resources by week (from the phase's list)
- Weeks 7–10: Eloquent JavaScript ch. 1–5 · freeCodeCamp JavaScript · The Odin Project Foundations (JS sections)
- Week 11: Kevin Powell (Grid, custom properties)
- Weeks 12–13: Mosh, React Tutorial for Beginners · react.dev "Learn" (official, free)

## Sandboxes
Weeks 7–11 use the existing web sandbox (HTML/CSS/JS with checks). React weeks need a small addition: JSX runs in the browser via a CDN-loaded transformer, so a `react` sandbox kind (or the web kind with React preloaded). To be built in Week 12 if this plan is approved.

## Open questions for Victor
1. ✅ **Decided (3 Oct 2026): keep the order** (CSS Week 11, React Weeks 12–13, plain HTML/CSS/JS milestone in Week 14).
   ~~Is this order right, or should React start earlier (and the milestone be built in React)?~~
2. ✅ **Decided (3 Oct 2026): "Mama Put Kitchen"**, a Lagos buka (menu with ₦ prices, opening hours, WhatsApp ordering).
   ~~Which fictional business for the milestone?~~
3. ✅ **Decided (3 Oct 2026): Saturdays of Weeks 11–14 all build towards the milestone.**
   ~~Keep Saturdays as one project each, or let Weeks 11–14 all build towards the milestone (as drafted)?~~
