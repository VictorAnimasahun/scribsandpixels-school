# Week 10 — Talking to APIs from the Browser
**Theme:** Asynchronous JavaScript: wait for things without freezing the page, fetch live data, and show loading and error states.
**Big question:** *How does a web page get fresh data from the internet while you keep using it?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📗 | [javascript.info — Promises, async/await](https://javascript.info/async) | Callbacks, Promises, Promise.all, async/await. The clearest reference. |
| 📗 | [MDN — Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) | Tuesday. |
| 📗 | [MDN — How to use promises](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises) | Monday, as a second explanation. |
| 🌐 | [Open-Meteo — Weather Forecast API](https://open-meteo.com/en/docs) | The same free API as Week 6. It allows calls straight from web pages. |
| 📗 | [MDN — CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) | Friday: just the introduction. |

## Day 1 — Monday
**Topic:** Asynchronous JavaScript: timers and Promises
**Time:** ~2.5 hours

### Review (30 min)
- From memory: the state → render → events → save pattern.
- How did Week 6's Python script wait for the weather API? (It just stopped and waited.)

### Lesson (45 min)
JavaScript in a browser runs on **one thread**. If it stopped and waited for the network the way Python did, the whole page would freeze. So slow things are **asynchronous**: you start them and say what to do when they finish.

**Timers:**
```js
console.log("1")
setTimeout(() => console.log("3: two seconds later"), 2000)
console.log("2")   // runs before the timeout!
```

**A Promise** is a value that will arrive later: "I promise to give you a result (or an error)".
```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

wait(1000).then(() => console.log("one second passed"))
```
- `.then(fn)` runs when it **resolves** (succeeds).
- `.catch(fn)` runs when it **rejects** (fails).

**async / await** lets you write the same thing like normal code:
```js
async function countdown() {
  console.log("3")
  await wait(1000)    // pause THIS function only; the page keeps working
  console.log("2")
  await wait(1000)
  console.log("Go!")
}
```
An `async` function **always returns a Promise**. `await` only works inside an `async` function (or at the top of a module).

### Practice (45 min)
In the console: log three messages with different timeouts and predict the order. Then write `countdown()` with `await wait(…)`.

### Mini-Task (30 min)
::sandbox web-w10-d1-async

### Log (10 min)
Write in your log: What I learned today · What confused me · What I will review tomorrow.

## Day 2 — Tuesday
**Topic:** fetch and JSON
**Time:** ~2.5 hours

### Review (30 min)
- From memory: `wait(ms)` with a Promise, and an async function that uses `await`.
- What does an async function always return?

### Lesson (45 min)
`fetch` is the browser's `requests.get`:
```js
async function getLagosTemp() {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=6.52&longitude=3.38&current=temperature_2m"
  const response = await fetch(url)        // waits for the server's reply
  if (!response.ok) {                       // ok is true for status 200–299
    throw new Error(`HTTP ${response.status}`)
  }
  const data = await response.json()        // also async: reading the body takes time
  return data.current.temperature_2m
}

getLagosTemp().then((t) => console.log(`${t}°C`))
```
| Python (Week 6) | JavaScript |
|---|---|
| `requests.get(url, timeout=10)` | `await fetch(url)` |
| `response.status_code` | `response.status` (and `response.ok`) |
| `response.json()` | `await response.json()` |

**Errors:** `fetch` only rejects when the **network** fails (no internet). A 404 or 500 still "succeeds", so always check `response.ok`.
```js
try {
  const temp = await getLagosTemp()
} catch (error) {
  console.log("Couldn't get the weather:", error.message)
}
```
**Testing without the internet:** like Week 6's `get=fake_get`, give your function a `fetchFn` parameter: `async function getJSON(url, fetchFn = fetch)`. The sandbox passes in a fake.

### Practice (45 min)
In `week10/app.js`, fetch the Lagos temperature and show it on a page. Then break the URL (`latitude=600`) and show the error message instead.

### Mini-Task (30 min)
::sandbox web-w10-d2-fetch

### Log (10 min)
Update your log.

## Day 3 — Wednesday
**Topic:** Loading and error states
**Time:** ~2.5 hours

### Review (30 min)
- From memory: fetch, check `response.ok`, read JSON, catch errors.
- When does `fetch` reject, and when doesn't it?

### Lesson (45 min)
A network call can take seconds (or fail) on a Nigerian mobile network. Good apps always show **what's happening**:
```js
async function loadWeather() {
  status.textContent = "Loading…"
  button.disabled = true                   // stop double clicks
  try {
    const temp = await getLagosTemp()
    result.textContent = `${temp}°C`
    status.textContent = ""
  } catch (error) {
    status.textContent = "Couldn't load the weather. Check your connection."
  } finally {
    button.disabled = false                // runs on success AND on error
  }
}
```
Three states every data screen needs: **loading**, **error**, **success**. (React apps do exactly the same, with state variables.)

### Practice (45 min)
Add a "Refresh" button to your weather page with all three states. Test the error state with DevTools → Network → **Offline**, and the loading state with **Slow 3G**.

### Mini-Task (30 min)
::sandbox web-w10-d3-loading

### Log (10 min)
Update your log.

## Day 4 — Thursday
**Topic:** Building URLs and shaping API data
**Time:** ~2.5 hours

### Review (30 min)
- From memory: a load function with loading, error and finally.
- Why disable the button while loading?

### Lesson (45 min)
**URLSearchParams** builds the `?a=1&b=2` part for you (like `params=` in Python), and encodes spaces and special characters correctly:
```js
const params = new URLSearchParams({
  latitude: 6.52,
  longitude: 3.38,
  daily: "temperature_2m_max,temperature_2m_min,weather_code",
  forecast_days: 3,
  timezone: "Africa/Lagos",
})
const url = `https://api.open-meteo.com/v1/forecast?${params}`
```
**APIs often return parallel arrays.** The 3-day forecast looks like this:
```json
{ "daily": {
    "time": ["2026-10-02", "2026-10-03", "2026-10-04"],
    "temperature_2m_max": [29.2, 28.3, 27.5],
    "temperature_2m_min": [24.4, 23.6, 23.8],
    "weather_code": [51, 95, 80] } }
```
Turn them into one object per day with `map` and the index:
```js
const days = daily.time.map((date, i) => ({
  date,
  max: daily.temperature_2m_max[i],
  min: daily.temperature_2m_min[i],
  code: daily.weather_code[i],
}))
```
Then rendering is the Week 9 render pattern.

### Practice (45 min)
Show a 3-day forecast table under the current weather: date, max, min and the weather in words (reuse your Week 6 `CODES`, rewritten as a JS object).

### Mini-Task (30 min)
::sandbox web-w10-d4-params

### Log (10 min)
Update your log.

## Day 5 — Friday
**Topic:** Many requests at once, CORS and API keys
**Time:** ~2.5 hours

### Review (30 min)
- From memory: URLSearchParams, and turning parallel arrays into objects.
- What's in `daily.time`?

### Lesson (45 min)
**Promise.all** runs requests **in parallel** and waits for all of them. Six cities take the time of one, not six:
```js
const cities = { Lagos: [6.52, 3.38], Abuja: [9.06, 7.49] }
const temps = await Promise.all(
  Object.entries(cities).map(async ([name, [lat, lon]]) => [name, await getTemp(lat, lon)]),
)
// [["Lagos", 25.7], ["Abuja", 23.1]]  →  Object.fromEntries(temps)
```
If one fails, `Promise.all` fails. **Promise.allSettled** waits for all and tells you which succeeded:
```js
const results = await Promise.allSettled(promises)
results[0].status   // "fulfilled" (with .value) or "rejected" (with .reason)
```
**CORS** (Cross-Origin Resource Sharing): browsers only let your page read another site's API if that API allows it with a header (`Access-Control-Allow-Origin`). Open-Meteo allows everyone; many APIs don't, which is one reason apps have their own backend (Phase 3).

**API keys:** anything in your front-end code is public: anyone can open DevTools and read it. **Never put a secret key in browser JavaScript.** Keys belong on a server (Phase 3). Open-Meteo needs no key, which is why we use it.

### Practice (45 min)
Show the current temperature for all six Nigerian cities from Week 6 at once with `Promise.all`, sorted hottest first.

### Mini-Task (30 min)
::sandbox web-w10-d5-many

### Log (10 min)
Update your log.

## Day 6 — Saturday
**Topic:** Project day: the Lagos weather page
**Time:** ~3 hours

### Review (30 min)
- Read your Week 10 log. From memory: fetch with ok-check, loading/error states, Promise.all.

### Weekly Project (2 hours)
**Rebuild your Week 6 weather script as a web page**, live on GitHub Pages:
- A city `<select>` (the six cities) and a button
- Current weather in words and °C, plus a 3-day forecast
- Loading, error (try Offline mode) and success states; the button is disabled while loading
- Responsive and accessible (Week 4 and Week 6 skills)
- README with a screenshot; add it to your portfolio's Projects section

Build and test the logic here first (the checks use a fake fetch, so no internet needed):

::sandbox web-w10-d6-weather-page

### FreeCodeCamp (30 min)
Continue JavaScript, or The Odin Project's "Asynchronous JavaScript and APIs" lesson.

### Log (10 min)
Weekly review:
- Explain async/await to a friend in 3 sentences.
- What still confuses me?
- Link to my live weather page.

## Quiz
1. Why is browser JavaScript asynchronous?
2. What's a Promise? What do `.then` and `.catch` do?
3. What does an `async` function always return? Where can you use `await`?
4. Write a fetch that checks `response.ok` and reads the JSON.
5. When does `fetch` reject?
6. What three states should every data screen show?
7. What does `finally` do?
8. What does URLSearchParams do?
9. What's the difference between `Promise.all` and `Promise.allSettled`?
10. Why must secret API keys never be in front-end code?

If you can answer all ten without notes, you're ready for Week 11. **Answers:** check each day's lesson; for 5: only when the network fails.
