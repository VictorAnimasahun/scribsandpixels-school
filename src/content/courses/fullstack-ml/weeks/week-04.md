# Week 4 — Making it Look Good
**Theme:** Layout with Flexbox, pages that work on phones, and saving your work with Git.
**Big question:** *How do professional sites line things up, and how do developers never lose their work?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Kevin Powell](https://www.youtube.com/@KevinPowell) | Day 3: search "flexbox" and watch his beginner flexbox video, then again while typing along. |
| 🎮 | [Flexbox Froggy](https://flexboxfroggy.com/) | Days 3–4. A game: all 24 levels. |
| 📗 | [MDN — Flexbox](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox) | Your reference for every flex property. |
| 📗 | [CSS-Tricks — A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) | The famous cheat sheet. Bookmark it. |
| 📗 | [MDN — Media queries](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Media_queries) | Day 4. |
| 📺 | [freeCodeCamp — Git and GitHub for Beginners](https://www.youtube.com/watch?v=RGOj5yH7evk) | Day 5. The first hour is enough. |
| 🌐 | [GitHub Pages](https://pages.github.com/) | Day 6: put your site on the internet for free. |
| 🌐 | [freeCodeCamp — Responsive Web Design](https://www.freecodecamp.org/learn/2022/responsive-web-design/) | Cafe Menu, then Colored Markers. |

## Day 1 — Monday
**Topic:** Better CSS: selectors, units and hover
**Time:** ~2.5 hours

### Review (30 min)
- From memory: the box model layers, inside to out. A class selector and an id selector.
- Open your Week 3 site. Find one thing that looks off and write it down.

### Lesson (45 min)
**More selectors**
| Selector | Selects | Example |
|---|---|---|
| `nav a` | `<a>` **inside** a `<nav>` (descendant) | menu links only |
| `h1, h2` | both (a group) | shared heading font |
| `a:hover` | a link while the mouse is over it | hover colour |
| `li:first-child` | the first `<li>` in its list | |
| `*` | every element | resets |

**Units**
| Unit | Means | Use for |
|---|---|---|
| `px` | pixels, fixed | borders, small details |
| `rem` | × the root font size (usually 16px): `1.5rem` = 24px | font sizes, spacing |
| `%` | percent of the parent | widths |
| `vh` / `vw` | percent of the screen height / width | full-screen sections |

**The border-box fix.** By default, `width` doesn't include padding and border (Week 3's 222px puzzle). Almost every site starts with:
```css
* { box-sizing: border-box; }
```
Now `width: 200px` means 200px on screen, padding included.

**Fonts.** Pick one from [Google Fonts](https://fonts.google.com/), paste its `<link>` into `<head>`, then `font-family: "Inter", sans-serif;`. The second name is the fallback.

**Hover and transitions.**
```css
.button { background: #164f3b; color: white; padding: 0.75rem 1.25rem; border-radius: 6px; transition: background 0.2s; }
.button:hover { background: #0f3a2b; }
```

### Practice (45 min)
In your Week 3 `style.css`: add the border-box reset, switch font sizes to `rem`, style only the nav links with `nav a`, and add a hover colour to them.

### Mini-Task (30 min)
Style the NaijaMart button bar in the sandbox.

::sandbox web-w04-d1-selectors

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** display and position
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a descendant selector, a hover rule, and the border-box reset.
- How many px is `2rem` when the root font size is 16px?

### Lesson (45 min)
**Every element has a `display`.**
| display | Behaviour | Default for |
|---|---|---|
| `block` | starts on a new line, full width, takes width/height | `div`, `p`, `h1`, `section`, `li` |
| `inline` | sits in the line of text; **ignores** width/height and top/bottom margin | `a`, `span`, `strong` |
| `inline-block` | sits in the line **and** takes width/height | buttons, badges |
| `none` | removed from the page completely | hidden things |
| `flex` | a flex container (tomorrow!) | |

**position** moves elements out of the normal flow:
| position | Moves relative to | Example |
|---|---|---|
| `static` | (default, no moving) | |
| `relative` | where it would have been; also becomes the **anchor** for absolute children | `.card { position: relative; }` |
| `absolute` | the nearest positioned ancestor | a "SALE" badge in a card's corner |
| `fixed` | the screen; stays put when you scroll | a WhatsApp chat button |
| `sticky` | normal, until you scroll past it, then sticks | a header that stays on top |

```css
.card { position: relative; }
.badge { position: absolute; top: 8px; right: 8px; }
```

### Practice (45 min)
Watch what changes: give a `<span>` a width (nothing happens), then make it `display: inline-block` (now it works). Make a header `position: sticky; top: 0;` and scroll.

### Mini-Task (30 min)
Fix the product card in the sandbox: badge in the corner, hidden promo, inline-block tags.

::sandbox web-w04-d2-display

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** Flexbox I: lining things up
**Time:** ~2.5 hours

### Review (30 min)
- From memory: what's the difference between `block`, `inline` and `inline-block`?
- Where does an `absolute` element measure from?

### Lesson (45 min)
**Watch:** Kevin Powell's beginner flexbox video (search "flexbox" on his channel). Then play [Flexbox Froggy](https://flexboxfroggy.com/) levels 1–12.

Put `display: flex` on a **container**, and its **direct children** (the items) line up in a row.
```css
header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
```
| Property (on the container) | Does | Common values |
|---|---|---|
| `flex-direction` | the main direction | `row` (default), `column` |
| `justify-content` | spacing **along** the main direction | `flex-start`, `center`, `space-between`, `space-around` |
| `align-items` | alignment **across** it | `stretch` (default), `center`, `flex-start` |
| `gap` | space between items | `1rem` |

**The classic navbar:** logo on the left, links on the right, all vertically centred:
```html
<header>
  <a class="logo" href="#">NaijaMart</a>
  <nav><a href="#">Shop</a> <a href="#">Deals</a> <a href="#">Contact</a></nav>
</header>
```
```css
header { display: flex; justify-content: space-between; align-items: center; }
nav { display: flex; gap: 1rem; }
```
Centring anything, both ways: `display: flex; justify-content: center; align-items: center;`

### Practice (45 min)
Finish Flexbox Froggy levels 13–24. Then give your Week 3 site a flex navbar.

### Mini-Task (30 min)
Build the NaijaMart header with Flexbox.

::sandbox web-w04-d3-navbar

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** Flexbox II and phones: wrap, grow and media queries
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a navbar with the logo left and links right.
- What's the difference between `justify-content` and `align-items`?

### Lesson (45 min)
**Rows of cards that wrap:**
```css
.cards { display: flex; flex-wrap: wrap; gap: 1rem; }
.card  { flex: 1 1 220px; }
```
`flex: 1 1 220px` = **grow** to fill space (1), **shrink** if needed (1), start from **220px**. Wide screen: 3–4 cards a row. Phone: 1 per row. No maths needed.

**Media queries** apply CSS only when the screen matches:
```css
@media (max-width: 600px) {
  header { flex-direction: column; }
  h1 { font-size: 1.75rem; }
}
```
**The viewport tag.** Without this line in `<head>`, phones pretend to be a desktop and shrink your page:
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
**Test on a phone size:** DevTools → the phone/tablet icon (Toggle device toolbar), then pick iPhone or Pixel.

### Practice (45 min)
Add the viewport tag to both your pages. Make your "What I'm learning" section a wrapping row of cards. Add one media query that stacks your navbar on phones. Test it in the device toolbar.

### Mini-Task (30 min)
Build the product grid in the sandbox. Drag the preview narrower if your screen allows: watch the cards wrap.

::sandbox web-w04-d4-cards

### Log (10 min)
Update your log.

## Day 5 — Friday
**Topic:** Git and GitHub
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a wrapping card row and a media query for screens under 600px.
- What does the viewport meta tag do?

### Lesson (45 min)
**Watch:** freeCodeCamp, "Git and GitHub for Beginners" (first hour).

**Git** saves snapshots (**commits**) of your project on your computer, so you can always go back. **GitHub** is a website that stores your Git projects online, where employers can see them.

**One-time setup:** install Git ([git-scm.com](https://git-scm.com/)), then in the terminal:
```bash
git config --global user.name "Victor Animasahun"
git config --global user.email "you@example.com"
```

**The everyday loop**, inside your `week3` folder:
```bash
git init                    # once: start tracking this folder
git status                  # what changed?
git add .                   # stage every change for the next snapshot
git commit -m "Add about page and contact form"
git log --oneline           # list your snapshots
```
| Stage | Meaning |
|---|---|
| **Working folder** | your files as they are now |
| **Staging area** | changes you've chosen for the next commit (`git add`) |
| **Repository** | the saved history of commits (`git commit`) |

**Good commit messages** say what the change does, in the present tense: *"Add contact form"*, not *"stuff"* or *"changes"*.

**Put it on GitHub:**
1. Create a free account at [github.com](https://github.com/). Use a professional username: employers will see it.
2. Install the [GitHub CLI](https://cli.github.com/) and run `gh auth login` once (GitHub no longer accepts your password in the terminal).
3. Create an empty repository on GitHub called `about-me`, then:
```bash
git remote add origin https://github.com/YOUR-USERNAME/about-me.git
git branch -M main
git push -u origin main
```
After that, every time: `git add .` → `git commit -m "…"` → `git push`.

**`.gitignore`**: a file listing what Git should never save, e.g. `.DS_Store` or, later, passwords and `.env` files.

### Practice (45 min)
Put your Week 3 site under Git, make at least 3 commits with good messages (one per real change), and push it to GitHub. Refresh the GitHub page after each push.

### Mini-Task (30 min)
Programs can read Git's output too. Count commits per author from a `git log`:

::sandbox py-w04-d5-gitlog

### Log (10 min)
Update your log.

## Day 6 — Saturday
**Topic:** Project day: your site, styled and live
**Time:** ~3 hours

### Review (30 min)
- Read your whole Week 4 log.
- From memory: a flex navbar, a wrapping card row, a media query, and the git add/commit/push loop.

### Weekly Project (2 hours)
**Restyle your About-me site and put it on the internet.** This finishes the webpage half of your **Phase 1 milestone**.
- Flexbox navbar; "What I'm learning" as wrapping cards; hover effects on links and buttons
- The viewport tag, and a media query so it works on your phone
- One Google Font, `rem` font sizes, the border-box reset
- Commit as you go (at least 5 commits), then push
- **Publish:** on GitHub, open the repo → Settings → Pages → Source: *Deploy from a branch* → `main`, `/ (root)` → Save. After a minute your site is live at `https://YOUR-USERNAME.github.io/about-me/`. Open it on your phone and send the link to a friend.

Practise the layout in the sandbox first if you like:

::sandbox web-w04-d6-project

### FreeCodeCamp (30 min)
Finish the **Cafe Menu**, then start **Colored Markers**: https://www.freecodecamp.org/learn/2022/responsive-web-design/

### Log (10 min)
Weekly review:
- What were the 3 biggest things I learned this week?
- What still confuses me?
- Is my site live? Paste the link in the log.

## Quiz
1. What does `* { box-sizing: border-box; }` change?
2. What's the difference between `px` and `rem`?
3. What's the difference between `block`, `inline` and `inline-block`?
4. When does `position: absolute` measure from a parent?
5. Write a navbar with the logo on the left and links on the right using Flexbox.
6. What does `flex: 1 1 220px` mean?
7. What does a media query do? Write one for screens under 600px.
8. What do `git add`, `git commit` and `git push` each do?
9. What makes a good commit message?
10. How do you publish a repo with GitHub Pages?

If you can answer all ten without notes, you're ready for Week 5. **Answers:** check each day's lesson; for 4: when that parent has a `position` other than `static` (usually `relative`).
