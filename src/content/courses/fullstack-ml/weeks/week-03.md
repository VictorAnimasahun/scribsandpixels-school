# Week 3 — The Web is Just Text
**Theme:** How websites really work, and your first pages in HTML and CSS.
**Big question:** *What actually happens between typing a web address and seeing a page?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Traversy Media — HTML Crash Course](https://www.youtube.com/watch?v=UB1O30fR-EE) | Watch in chunks across Days 2–4. Pause and type along. |
| 📗 | [MDN — HTML basics](https://developer.mozilla.org/en-US/docs/Web/HTML) | The official reference. Look up every tag you meet. |
| 📗 | [MDN — CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) | Your CSS reference for Day 5. |
| 🌐 | [freeCodeCamp — Responsive Web Design](https://www.freecodecamp.org/learn/2022/responsive-web-design/) | Finish the Cat Photo App this week, then start the Cafe Menu (CSS). |
| 📺 | [Kevin Powell — CSS](https://www.youtube.com/@KevinPowell) | Search "CSS for absolute beginners" on Day 5. |
| 🌐 | [W3Schools — HTML](https://www.w3schools.com/html/) | Quick "Try it yourself" examples when you're stuck. |

## Day 1 — Monday
**Topic:** How the web works
**Time:** ~2.5 hours

### Review (30 min)
- From memory, write a Python function that takes a list of names and prints "Hello, [name]!" for each one.
- Re-read your Week 2 log. What still confuses you about files?

### Lesson (45 min)
**The journey of a web page:**
1. You type `naijamart.ng` in the **browser** (Chrome, Safari…). The browser is a **client**.
2. A **DNS** lookup turns the name into an IP address (like a phone number for computers).
3. The browser sends an **HTTP request** to the **server** at that address: "please send me the home page".
4. The server sends back an **HTTP response**: mostly **text files**: HTML, CSS and JavaScript.
5. The browser reads the text and **draws** the page.

**The three languages of the front end:**
| Language | Job | Analogy |
|---|---|---|
| **HTML** | Structure and content | The walls and rooms of a house |
| **CSS** | Style and layout | Paint, furniture, decoration |
| **JavaScript** | Behaviour | Electricity: lights, switches, doors that open |

Your Python runs on *your* computer (or a server). HTML/CSS/JS run in the *visitor's* browser.

**See it yourself:** on any website, right-click → **View Page Source**. It's just text! Then right-click → **Inspect** to open **DevTools**, where you can see and even edit the HTML live.

### Practice (45 min)
**Your first HTML file, on your computer:**
1. Create a folder `week3` on your Desktop.
2. In a plain-text editor (VS Code is best: [code.visualstudio.com](https://code.visualstudio.com/), free), create `index.html`:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, web!</h1>
    <p>I made this page myself.</p>
  </body>
</html>
```
3. Double-click the file. It opens in your browser. You just made a web page.
4. Change the text, save, refresh the browser. Repeat until it feels normal.

### Mini-Task (30 min)
Open three websites you use (a bank, a news site, Jumia…) with **View Page Source** and find: the `<title>`, one `<h1>` and one `<a>` link. Write what you found in your log.

Then do it in the browser sandbox below: it checks your work automatically.

::sandbox web-w03-d1-first-page

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** HTML structure and text
**Time:** ~2.5 hours

### Review (30 min)
- Without looking: write the full HTML skeleton (`<!DOCTYPE html>`, `html`, `head`, `title`, `body`).
- Explain to yourself, out loud: what's the difference between the client and the server?

### Lesson (45 min)
**Watch:** Traversy HTML Crash Course, from the start to "Lists".

**Tags and elements.** Most HTML comes in pairs: an opening tag `<p>`, the content, and a closing tag `</p>`. Together they form an **element**.
| Tag | Meaning |
|---|---|
| `<h1>` … `<h6>` | Headings, from most to least important. Use **one** `<h1>` per page. |
| `<p>` | A paragraph |
| `<strong>` / `<em>` | Important (bold) / emphasis (italic) |
| `<br>` | Line break (no closing tag) |
| `<hr>` | A horizontal line (no closing tag) |
| `<ul>` + `<li>` | Bulleted (unordered) list |
| `<ol>` + `<li>` | Numbered (ordered) list |
| `<!-- … -->` | A comment: notes the browser ignores |

**Nesting:** elements go inside each other like boxes. Close them in the right order: `<p><strong>Hi</strong></p>` ✓, `<p><strong>Hi</p></strong>` ✗.
**Indent** nested elements (like Python!). The browser doesn't care, but humans do.

### Practice (45 min)
Type this into your `index.html` (don't copy-paste) and view it in the browser:
```html
<h1>Jollof Rice</h1>
<p>The <strong>best</strong> rice dish in West Africa. <em>No debate.</em></p>
<h2>Ingredients</h2>
<ul>
  <li>3 cups of rice</li>
  <li>5 tomatoes</li>
  <li>2 onions</li>
</ul>
<h2>Steps</h2>
<ol>
  <li>Blend the tomatoes and peppers.</li>
  <li>Fry the base.</li>
  <li>Add the rice and stock.</li>
</ol>
```
Break it on purpose: delete a closing `</li>`. What does the browser do? (Browsers are forgiving, which hides mistakes. Validate your HTML at [validator.w3.org](https://validator.w3.org/#validate_by_input).)

### Mini-Task (30 min)
Build a recipe page for your favourite Nigerian dish in the sandbox. The checks look for real structure, not just text.

::sandbox web-w03-d2-recipe

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** Links, images and page structure
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a heading, a paragraph with one bold word, and a 3-item numbered list.
- What's the difference between `<ul>` and `<ol>`?

### Lesson (45 min)
**Watch:** Traversy HTML Crash Course, "Links" to "Images".

**Attributes** add information to a tag, inside the opening tag: `name="value"`.
| Element | Example | Notes |
|---|---|---|
| Link | `<a href="https://www.freecodecamp.org">freeCodeCamp</a>` | `href` = where it goes |
| Open in a new tab | `<a href="…" target="_blank">…</a>` | |
| Link to another of your pages | `<a href="about.html">About me</a>` | a **relative** path |
| Image | `<img src="photo.jpg" alt="Me at Lekki beach">` | no closing tag; **alt** is required: screen readers read it, and it shows if the image fails |

**Semantic structure:** tags that say *what* a part of the page is. Good for accessibility and Google.
```html
<header>   logo and site title          </header>
<nav>      the menu of links            </nav>
<main>     the page's main content      </main>
<section>  a themed group of content    </section>
<footer>   copyright, contact           </footer>
```

### Practice (45 min)
Create a second file `about.html` in your `week3` folder. Link `index.html` → `about.html` and back. Add an image (any `.jpg` in the same folder) with a good `alt` text. Wrap each page in `header` / `nav` / `main` / `footer`.

### Mini-Task (30 min)
Build your homepage skeleton in the sandbox.

::sandbox web-w03-d3-homepage

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** Tables and forms
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a link that opens in a new tab, and an image with alt text.
- Which tags make the semantic skeleton of a page?

### Lesson (45 min)
**Watch:** Traversy HTML Crash Course, "Tables" and "Forms".

**Tables** show data in rows and columns:
```html
<table>
  <tr><th>Product</th><th>Price (₦)</th></tr>
  <tr><td>Tecno Spark 20</td><td>145,000</td></tr>
  <tr><td>Oraimo Power Bank</td><td>21,000</td></tr>
</table>
```
`<tr>` = table row · `<th>` = header cell · `<td>` = data cell. Use tables for **data**, never for page layout.

**Forms** collect information:
```html
<form>
  <label for="name">Your name</label>
  <input id="name" name="name" type="text" required>

  <label for="email">Email</label>
  <input id="email" name="email" type="email">

  <label for="city">City</label>
  <select id="city" name="city">
    <option>Lagos</option>
    <option>Abuja</option>
  </select>

  <button type="submit">Send</button>
</form>
```
- Every input needs a `<label>`; `for` must match the input's `id`. Tapping the label focuses the input, which helps everyone, especially on phones.
- Input types: `text`, `email`, `number`, `password`, `date`, `tel`, `checkbox`, `radio`. Phones show the right keyboard for each.
- `required` stops the form from submitting while the field is empty.
(Making the form *do* something needs a backend. That's Phase 3!)

### Practice (45 min)
Add a price table of 5 products and a contact form (name, email, phone with `type="tel"`, message as `<textarea>`, a submit button) to your `about.html`.

### Mini-Task (30 min)
Do it in the sandbox with automatic checks.

::sandbox web-w03-d4-forms

### Log (10 min)
Update your log.

## Day 5 — Friday
**Topic:** CSS basics
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a 2-row table with headers, and a form with one labelled input.
- Why should every input have a label?

### Lesson (45 min)
**Watch:** Kevin Powell, "CSS for absolute beginners" (or MDN CSS first steps).

**A CSS rule:** `selector { property: value; }`
```css
h1 { color: #164f3b; font-size: 40px; }
.price { font-weight: bold; }      /* class: many elements */
#main-title { text-align: center; } /* id: one element */
```
| Selector | Selects | HTML |
|---|---|---|
| `p` | every `<p>` | |
| `.card` | every element with that class | `<div class="card">` |
| `#logo` | the one element with that id | `<img id="logo">` |

**Where CSS goes:** an external file linked in `<head>` with `<link rel="stylesheet" href="style.css">` (best), a `<style>` block in `<head>`, or the `style="…"` attribute (avoid).

**The box model:** every element is a box: **content** → **padding** (inside space) → **border** → **margin** (outside space).
```css
.card { padding: 16px; border: 1px solid #ddd; margin: 12px 0; border-radius: 8px; }
```
Useful properties: `color`, `background-color`, `font-family`, `font-size`, `text-align`, `width`, `max-width`, `padding`, `margin`, `border`, `border-radius`.

### Practice (45 min)
Create `style.css`, link it in both your pages, and style: the body font, the heading colour, a `.card` class for sections (padding, border, rounded corners), and a centred page with `max-width: 800px; margin: 0 auto;`.

### Mini-Task (30 min)
Style the page in the sandbox. The checks read the real computed styles.

::sandbox web-w03-d5-css

### Log (10 min)
Update your log.

## Day 6 — Saturday
**Topic:** Project day: your "About me" website, v1
**Time:** ~3 hours

### Review (30 min)
- Read your whole Week 3 log.
- From memory: the HTML skeleton, a semantic layout, a link, an image, and a CSS rule with a class selector.

### Weekly Project (2 hours)
**Build a 2-page personal website** in your `week3` folder. This is the first half of your **Phase 1 milestone** (the personal webpage).
- `index.html`: header with your name, a nav (Home · About), an intro section, a "What I'm learning" list, a footer
- `about.html`: a photo with alt text, your story, a table of your weekly study schedule, a contact form
- `style.css` linked to both: one font, 2–3 colours, `.card` sections, centred layout
- Validate both pages at [validator.w3.org](https://validator.w3.org/#validate_by_input) and fix every error.

Build the home page in the sandbox first if you like, then move it to your files:

::sandbox web-w03-d6-project

**Keep Python alive:** programs can *write* HTML. Generate a list page from a Python list:

::sandbox py-w03-d6-html-generator

### FreeCodeCamp (30 min)
Finish the **Cat Photo App** and start the **Cafe Menu** (CSS): https://www.freecodecamp.org/learn/2022/responsive-web-design/

### Log (10 min)
Weekly review:
- What were the 3 biggest things I learned this week?
- What still confuses me?
- Did I finish both pages and validate them?

## Quiz
1. What happens, step by step, between typing a web address and seeing the page?
2. What are the jobs of HTML, CSS and JavaScript?
3. Write the HTML skeleton from memory.
4. What's the difference between `<ul>` and `<ol>`? Between `<th>` and `<td>`?
5. Why must every `<img>` have an `alt`, and every `<input>` a `<label>`?
6. What do `header`, `nav`, `main` and `footer` tell the browser?
7. What's the difference between a class and an id selector?
8. Name the four layers of the box model, from inside out.
9. How do you link a CSS file to an HTML page?
10. What's one thing you'd improve on your personal website next week?

If you can answer all ten without notes, you're ready for Week 4. **Answers:** check the lesson for each day; for 8: content → padding → border → margin.
