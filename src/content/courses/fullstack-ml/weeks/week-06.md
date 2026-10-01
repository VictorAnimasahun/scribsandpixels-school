# Week 6 — Phase 1 Graduation
**Theme:** Talk to a real API, finish your personal site, and put your work in front of people who pay.
**Big question:** *How does a program get live data from the internet, and how do I turn six weeks of practice into my first paid gig?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Open-Meteo — Weather Forecast API](https://open-meteo.com/en/docs) | Free, no account or API key. This is where your weather data comes from. |
| 📗 | [Requests — Quickstart](https://requests.readthedocs.io/en/latest/user/quickstart/) | Monday. Read "Make a Request", "Passing Parameters", "JSON Response Content". |
| 📺 | [CS50P — Harvard's free Python course](https://cs50.harvard.edu/python/) | Lecture 4 (Libraries), the part on APIs and `requests`. |
| 📗 | [MDN — Accessibility basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility) | Thursday. |
| 🌐 | [Chrome DevTools — Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) | Thursday: score your site. |
| 🌐 | [GitHub — Managing your profile README](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme) | Friday. |

## Day 1 — Monday
**Topic:** APIs: getting live data with requests
**Time:** ~2.5 hours

### Review (30 min)
- From memory: load a JSON file safely (`try` / `except FileNotFoundError`).
- From memory: read a value from a nested dictionary, like `students["Ada"]["city"]`.

### Lesson (45 min)
An **API** (Application Programming Interface) is a URL that answers programs instead of people: it returns **JSON** instead of a web page.

**Try it in your browser first.** Paste this URL and press Enter:
```text
https://api.open-meteo.com/v1/forecast?latitude=6.52&longitude=3.38&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Africa/Lagos
```
Everything after `?` is a **query parameter**: `latitude=6.52` and `longitude=3.38` are Lagos; `current=…` lists what you want. The answer looks like this:
```json
{
  "timezone": "Africa/Lagos",
  "current_units": { "temperature_2m": "°C", "relative_humidity_2m": "%", "wind_speed_10m": "km/h" },
  "current": {
    "time": "2026-10-01T22:30",
    "temperature_2m": 25.7,
    "relative_humidity_2m": 85,
    "weather_code": 2,
    "wind_speed_10m": 10.6
  }
}
```

**Now from Python** (you installed `requests` last Thursday: `pip install requests`):
```python
import requests

URL = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": 6.52,
    "longitude": 3.38,
    "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    "timezone": "Africa/Lagos",
}
response = requests.get(URL, params=params, timeout=10)
print(response.status_code)        # 200 means OK
data = response.json()             # JSON text → Python dictionary
print(data["current"]["temperature_2m"])
```
- `params=` builds the `?latitude=…&longitude=…` part for you.
- `timeout=10` gives up after 10 seconds instead of hanging forever.
- `response.json()` is `json.loads(response.text)`: last week's skill.

**Status codes:** 200 OK · 400 bad request (your mistake) · 404 not found · 500 server error (their mistake).

### Practice (45 min)
On your computer, in a new folder `lagos-weather`:
1. Run the code above. Print the temperature, humidity and wind.
2. Change the coordinates to Abuja (9.06, 7.49). What's the temperature there right now?
3. Break it on purpose: set `latitude` to 600. What status code and what JSON do you get?

### Mini-Task (30 min)
The browser sandbox can't reach the internet, so here's a real response saved as a dictionary. Dig the data out:

::sandbox py-w06-d1-api

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** Turning data into words: weather codes and reports
**Time:** ~2.5 hours

### Review (30 min)
- From memory: `requests.get` with `params=` and `timeout=`, then `.json()`.
- What do status codes 200, 400 and 500 mean?

### Lesson (45 min)
`weather_code` is a number from the **WMO** (World Meteorological Organization) list. A dictionary turns it into words:
| Code | Meaning |
|---|---|
| 0 | Clear sky |
| 1 · 2 · 3 | Mainly clear · Partly cloudy · Overcast |
| 45, 48 | Fog |
| 51, 53, 55 | Drizzle |
| 61, 63 · 65 | Rain · Heavy rain |
| 80, 81 · 82 | Rain showers · Violent rain showers |
| 95 · 96, 99 | Thunderstorm · Thunderstorm with hail |

```python
CODES = {0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast"}  # … and the rest

def describe(code):
    return CODES.get(code, "Unknown")
```
`.get(code, "Unknown")` means a new code never crashes your program.

**Build the report with an f-string:**
```python
def report(city, current):
    return (f"Weather in {city}: {describe(current['weather_code'])}, "
            f"{current['temperature_2m']}°C, humidity {current['relative_humidity_2m']}%, "
            f"wind {current['wind_speed_10m']} km/h")
```
Brackets let one expression run over several lines; Python joins strings that sit next to each other.

**Rain or shine?** Ranges are easy to check: `51 <= code <= 82` is True for every drizzle, rain and shower code.

### Practice (45 min)
Add `CODES`, `describe` and `report` to your `lagos-weather` script and print a real report for Lagos, then for 3 more Nigerian cities.

### Mini-Task (30 min)
::sandbox py-w06-d2-describe

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** Robust scripts: bad cities, bad networks, and main()
**Time:** ~2.5 hours

### Review (30 min)
- From memory: the `describe` function with a dictionary and `.get`.
- What does `51 <= code <= 82` check?

### Lesson (45 min)
Real programs meet three kinds of trouble. Handle each one:

**1. Bad input.** Look the city up and raise a clear error if you don't know it:
```python
CITIES = {"lagos": (6.52, 3.38), "abuja": (9.06, 7.49)}

def build_params(city):
    key = city.strip().lower()
    if key not in CITIES:
        raise ValueError(f"Sorry, I don't know {city.strip()}")
    latitude, longitude = CITIES[key]
    return {"latitude": latitude, "longitude": longitude, "current": "…", "timezone": "Africa/Lagos"}
```
`latitude, longitude = CITIES[key]` **unpacks** a pair into two variables.

**2. The server says no** (status 400, 500…). Open-Meteo sends a reason:
```python
if response.status_code != 200:
    raise RuntimeError(response.json().get("reason", "Unknown error"))
```

**3. No internet** (NEPA took the light, data finished…). `requests` raises an exception you can catch:
```python
try:
    response = requests.get(URL, params=params, timeout=10)
except requests.exceptions.RequestException:
    print("Couldn't reach the weather service. Check your connection.")
```

**Structure the script** like professionals do:
```python
def main():
    city = input("City: ")
    try:
        print(get_report(city))
    except ValueError as error:
        print(error)

if __name__ == "__main__":
    main()
```
`if __name__ == "__main__":` runs `main()` when you run the file, but **not** when another file imports it. That lets you reuse your functions.

**Two files every project needs:**
- `README.md`: what it does, how to install (`pip install -r requirements.txt`) and how to run it, with an example output.
- `requirements.txt`: one line, `requests`.

### Practice (45 min)
Add `CITIES` (at least 6 cities), `build_params`, error handling for all three troubles, and `main()`. Test: an unknown city, airplane mode, and a good city.

### Mini-Task (30 min)
::sandbox py-w06-d3-robust

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** Finish the personal site: projects, accessibility, Lighthouse
**Time:** ~2.5 hours

### Review (30 min)
- From memory: the three kinds of trouble and how you handle each.
- What does `if __name__ == "__main__":` do?

### Lesson (45 min)
Your site needs to **show your work**. Add a Projects section with a card for each project: what it does, what you used, and links.

**Accessibility** means everyone can use your site: blind users with screen readers, people using only a keyboard, people on slow phones in bright sun.
| Check | How |
|---|---|
| Every image has meaningful `alt` | Week 3 |
| Links say where they go | "View the weather script on GitHub", not "click here" |
| Keyboard users can see where they are | style `:focus-visible`, never remove outlines without a replacement |
| Enough colour contrast | dark text on light backgrounds; DevTools shows the contrast ratio |
| Links that open a new tab are safe | add `rel="noopener"` next to `target="_blank"` |
| Headings in order | `h1` → `h2` → `h3`, no skipping for looks |

```css
a:focus-visible, button:focus-visible { outline: 3px solid #f2b705; outline-offset: 2px; }
```

**Lighthouse:** DevTools → Lighthouse → Analyze page load. It scores Performance, Accessibility, Best Practices and SEO from 0–100 and lists what to fix. Aim for 90+ in Accessibility.

### Practice (45 min)
Add a Projects section to your live site (expense tracker, weather script, contact book) with GitHub links. Run Lighthouse, fix the top 3 issues, and push.

### Mini-Task (30 min)
::sandbox web-w06-d4-projects

### Log (10 min)
Update your log. Write your Lighthouse scores before and after.

## Day 5 — Friday
**Topic:** Getting seen: GitHub profile, LinkedIn, and a "Hire me" section
**Time:** ~2.5 hours

### Review (30 min)
- From memory: 4 accessibility checks.
- What does `rel="noopener"` protect against? (A new tab controlling your page through `window.opener`.)

### Lesson (45 min)
Employers and clients judge you in 30 seconds. Make those seconds count.

**GitHub profile README:** create a repository named exactly your username; its `README.md` shows on your profile. Include: one line about you, what you're learning, 2–3 pinned projects with one sentence each, how to contact you.

**LinkedIn headline**, specific beats generic: *"Learning fullstack development & ML · Python, HTML/CSS, Git · Building tools for Nigerian small businesses"*.

**What you can sell after 6 weeks** (small, real, honest):
- A one-page website for a small business: a salon, a caterer, a church event
- Fixing or restyling an existing simple site to work on phones
- Small Python scripts: renaming files, cleaning a contact list, a price calculator

**Where:** people you already know first (friends' businesses, church, your workplace), then local WhatsApp/Facebook business groups, then platforms like Upwork and Fiverr. Your first gig is about **proof and a testimonial**, not money. Price small, deliver fast, ask for a review.

**Make contacting you one tap** (most Nigerian clients are on phones):
```html
<a href="mailto:you@example.com">Email me</a>
<a href="tel:+2348031234567">Call me</a>
<a href="https://wa.me/2348031234567">Chat on WhatsApp</a>
```
WhatsApp links use the full international number, digits only: `234` + the number without its first `0`.

### Practice (45 min)
1. Create your GitHub profile README and pin your 3 best repositories.
2. Update your LinkedIn headline and add your site link.
3. Write a 3-sentence gig offer you could post in a WhatsApp group.

### Mini-Task (30 min)
Add a "Hire me" section that works on phones:

::sandbox web-w06-d5-hire

### Log (10 min)
Update your log. Paste your gig offer.

## Day 6 — Saturday
**Topic:** Graduation: the Phase 1 milestone
**Time:** ~3 hours

### Review (30 min)
- Read your Week 1 log, then your Week 5 log. Write down 5 things you can do now that you couldn't 6 weeks ago.

### Weekly Project (2 hours)
**Phase 1 milestone:** *a personal webpage AND a Python script that prints today's weather for Lagos.*

**1. Finish the weather script.** Functions can be passed around like values, so you can test your logic with saved data and run it for real with `requests`:
```python
def real_get(params):
    response = requests.get(URL, params=params, timeout=10)
    return response.status_code, response.json()

def weather_report(city, get=real_get):
    ...   # build_params → get(params) → check the status → report(...)
```
Build and test `weather_report` in the sandbox (it uses saved responses instead of the internet):

::sandbox py-w06-d6-weather

Then on your computer: README with an example output, `requirements.txt`, and push to GitHub.

**2. Ship the site.** Projects section, Hire me section, Lighthouse Accessibility 90+, live on GitHub Pages.

**3. Graduation check** (all must be true):
- [ ] `python weather.py` asks for a city and prints a real report for Lagos
- [ ] An unknown city and no internet both give a friendly message, never a crash
- [ ] Your site is live, works on your phone, and links to your repos
- [ ] At least 3 public repositories with READMEs
- [ ] Your gig offer has been sent to at least 3 people or groups

### Reflect (30 min)
Record a 2-minute video or voice note: show your site and run your weather script, explaining what each part does. Keep it: you'll watch it again at the end of Phase 2.

### Log (10 min)
Phase 1 review:
- What were the 5 biggest things I learned in 6 weeks?
- What still confuses me? (Write these down for Phase 2.)
- Links: my site, my weather repo.

## Quiz
1. What is an API, and what format does Open-Meteo answer in?
2. What do `params=` and `timeout=` do in `requests.get`?
3. What do status codes 200, 400, 404 and 500 mean?
4. How do you turn a weather code into words without crashing on unknown codes?
5. Name the three kinds of trouble a weather script meets and how you handle each.
6. What does `if __name__ == "__main__":` do?
7. What goes in `README.md` and `requirements.txt`?
8. Name 4 accessibility checks for your site.
9. Write a WhatsApp link for 0803 123 4567.
10. What 3 kinds of small gigs can you offer now?

If you can answer all ten without notes, you've passed Phase 1. 🎓 **Answers:** check each day's lesson; for 9: `https://wa.me/2348031234567`.
