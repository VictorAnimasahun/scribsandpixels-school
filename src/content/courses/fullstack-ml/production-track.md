# Production-engineering track

Added 6 Oct 2026, at Victor's request:

> Vibe coding won't teach you concurrency, observability, reliability, scalability, tradeoffs, auth/databases, or how to scale to 2 million users in 4 days. You've got to be a skilled software engineer to do this with AI.

These skills run as a thread through Phase 3 (backend), Phase 4 (fullstack) and Phase 6 (system design), on top of each phase's main topics. Week outlines are in `course.ts`.

## How each skill is taught
Each one follows the same loop: **build it → break it on purpose → watch it fail → fix it → explain the tradeoff in writing.** You can't learn reliability from a working demo, so every topic includes a deliberate failure.

| Skill | Weeks | What you build, break and fix |
|---|---|---|
| **Databases** | 16–17 | Model the job board. Load 100,000 fake jobs, time a slow search, add an index, time it again with `EXPLAIN`. Add constraints so bad data can't be saved. |
| **Auth** | 19, 27 | Sessions and password hashing (19). JWT vs sessions and their tradeoffs, CORS and CSRF (27). Try to break your own login against the OWASP checklist. |
| **Concurrency** | 20, 29 | Two applicants grab the last interview slot at the same moment. Reproduce the double booking, then fix it with a transaction and `select_for_update` (20). The event loop, asyncio, and threads vs processes vs async: when each actually helps (29). |
| **Reliability** | 21, 22, 32 | Tests and CI that catch the Week 20 race (21). Timeouts and retries with backoff and jitter for a flaky email API (22). Rate limits, circuit breakers, graceful degradation, and a blameless postmortem of a failure you cause on purpose (32). |
| **Observability** | 23, 31 | Structured logs, Sentry and health checks: find a bug from production logs alone (23). Metrics, dashboards, tracing (OpenTelemetry), SLOs and alerts that wake you only when it matters (31). |
| **Caching & performance** | 30 | Measure first. Kill an N+1 query, cache with Redis, then live with cache invalidation. |
| **Scalability** | 33, 47–48 | Stateless servers, load balancers, read replicas, queues as shock absorbers. Load test your Phase 4 app with Locust until it breaks, and write down where and why (33). |
| **Tradeoffs** | 24, 27, 30, 33, 47–48 | Every milestone ships with a short design doc of the decisions and what each one cost (ADRs). Interviews test exactly this (47–48). |

## "2 million users in 4 days": the capacity math (Week 33, again in Week 47)
You learn to answer it with arithmetic, not vibes:
- 2,000,000 sign-ups in 4 days = 500,000 a day ≈ **5.8 per second on average**.
- Traffic isn't flat: if half of a day's sign-ups land in the busiest 2 hours, that's 250,000 ÷ 7,200 s ≈ **35 per second**. Plan for a peak of **~100/s** to be safe.
- Each new user also browses. At, say, 20 requests each in their first session, the peak is about **2,000 requests per second**.
- Then come the questions you'll have learned to ask: Which requests can be cached (most reads)? What must hit the database (writes)? Which slow work can go on a queue (emails)? What breaks first? You find out with the Week 33 load test, not by guessing.

## Resources
Listed per week in `course.ts` (Phases 3, 4 and 6). The core ones are free:
- Use The Index, Luke
- OWASP Cheat Sheets
- PostgreSQL concurrency docs
- AWS Builders' Library (retries)
- Sentry docs
- The Twelve-Factor App
- Real Python on concurrency
- The event-loop talk
- The Google SRE book
- OpenTelemetry
- Locust
- The System Design Primer
- ByteByteGo

The one paid book, *Designing Data-Intensive Applications*, is optional.

## Already in the school
- Async JavaScript, loading and error states, `Promise.all` (Week 10).
- Error handling (Week 5).
- Git and GitHub (Week 4).

The school's own code is a case study too. Its October hardening fixed a race (a stale timer killing the next run), a reliability gap (an infinite loop bricking a page) and a load problem (a 3 MB first download). Those examples can be used in Weeks 20, 32 and 30.
