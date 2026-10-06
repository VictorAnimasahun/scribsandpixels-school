import type { Course, Phase, WeekOutline } from '../../types.ts'

const phases: Phase[] = [
  {
    number: 1,
    title: 'Foundations',
    focus: 'How computers think',
    firstWeek: 1,
    lastWeek: 6,
    topics: ['Python basics', 'C intro', 'How the web works', 'Terminal'],
    milestone: "Build a personal webpage AND write a Python script that prints today's weather for Lagos.",
    resources: [
      { kind: 'video', title: 'Mosh — Python for Beginners (6hrs)', url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', note: 'Watch in chunks, pause often' },
      { kind: 'video', title: 'CS50x Week 0 + Week 1', url: 'https://cs50.harvard.edu/x/', note: 'C and how computers think' },
      { kind: 'reading', title: 'Automate the Boring Stuff — Chapters 1–3 (free)', url: 'https://automatetheboringstuff.com/', note: 'Read alongside Mosh' },
      { kind: 'interactive', title: 'FreeCodeCamp — Responsive Web Design (HTML/CSS)', url: 'https://www.freecodecamp.org/learn/full-stack-developer-v9/', note: 'Start the certification' },
      { kind: 'video', title: 'Traversy Media — HTML Crash Course', url: 'https://www.youtube.com/watch?v=UB1O30fR-EE' },
    ],
    notes: [
      {
        heading: 'Job applications',
        items: [
          "Apply this week even though you've just started.",
          'Fiverr/Upwork: offer to build simple HTML pages for local businesses.',
          'Volunteer: build a website for a church, school, or NGO in your area.',
          'This builds your portfolio and teaches you what clients actually want.',
        ],
      },
    ],
  },
  {
    number: 2,
    title: 'Web development',
    focus: 'Making things you can see',
    firstWeek: 7,
    lastWeek: 14,
    topics: ['JavaScript', 'CSS', 'React'],
    milestone: 'Multi-page website for a fictional Nigerian business, live on GitHub Pages.',
    resources: [
      { kind: 'video', title: 'Mosh — React Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk' },
      { kind: 'interactive', title: 'FreeCodeCamp JavaScript Algorithms & Data Structures', url: 'https://www.freecodecamp.org/learn/full-stack-developer-v9/' },
      { kind: 'reading', title: 'Eloquent JavaScript (free online)', url: 'https://eloquentjavascript.net/', note: 'Chapters 1–5' },
      { kind: 'video', title: 'Kevin Powell — CSS (YouTube channel)', url: 'https://www.youtube.com/@KevinPowell', note: 'Best CSS teacher online' },
      { kind: 'interactive', title: 'The Odin Project — Foundations', url: 'https://www.theodinproject.com/paths/foundations/courses/foundations' },
    ],
    notes: [],
  },
  {
    number: 3,
    title: 'Backend development',
    focus: 'Making things work under the hood',
    firstWeek: 15,
    lastWeek: 24,
    topics: ['Django', 'Python', 'SQL', 'Database design + indexes', 'Auth (sessions, passwords, permissions)', 'Transactions + concurrency', 'Testing + CI', 'Background jobs, retries, timeouts', 'Logging + error tracking', 'Tradeoffs (design docs, ADRs)'],
    milestone: 'Full job board app — users can post and apply for jobs. Backend included, with tests, logs and a short design doc explaining its tradeoffs.',
    resources: [
      { kind: 'video', title: 'Traversy Media — Django Crash Course', url: 'https://www.youtube.com/watch?v=e1IyzVyrLSU' },
      { kind: 'reading', title: 'Django Official Tutorial', url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/' },
      { kind: 'video', title: 'CS50P — Python (full free course, Harvard)', url: 'https://cs50.harvard.edu/python/' },
      { kind: 'reading', title: 'Automate the Boring Stuff — Chapters 8–14', url: 'https://automatetheboringstuff.com/', note: 'Files, web, data' },
      { kind: 'interactive', title: 'SQLZoo — Learn SQL interactively', url: 'https://sqlzoo.net/' },
      { kind: 'reading', title: 'Use The Index, Luke — SQL indexing and tuning (free)', url: 'https://use-the-index-luke.com/', note: 'Week 17' },
      { kind: 'reading', title: 'OWASP Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', note: 'Week 19' },
      { kind: 'reading', title: 'PostgreSQL docs — Concurrency Control (MVCC, locks)', url: 'https://www.postgresql.org/docs/current/mvcc.html', note: 'Week 20' },
      { kind: 'reading', title: "AWS Builders' Library — Timeouts, retries and backoff with jitter", url: 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/', note: 'Week 22' },
      { kind: 'reading', title: 'Sentry for Django (free tier)', url: 'https://docs.sentry.io/platforms/python/integrations/django/', note: 'Week 23' },
      { kind: 'reading', title: 'Architecture Decision Records (ADRs)', url: 'https://adr.github.io/', note: 'Week 24' },
    ],
    notes: [
      {
        heading: "Why this phase goes beyond 'it works on my laptop'",
        items: [
          'Vibe coding (prompting an AI until something runs) won\'t teach you concurrency, observability, reliability, scalability, auth, databases or tradeoffs.',
          'AI makes a skilled engineer faster; it can\'t make you skilled. So from here on, every phase has a production-engineering thread: you build it, break it on purpose, watch it fail, and explain your choices.',
          'Plan: courses/fullstack-ml/production-track.md.',
        ],
      },
    ],
  },
  {
    number: 4,
    title: 'Fullstack',
    focus: 'Connecting it all',
    firstWeek: 25,
    lastWeek: 34,
    topics: ['React + Django', 'Authentication (JWT vs sessions)', 'Deployment', 'Async + concurrency', 'Caching + performance', 'Observability (metrics, tracing, SLOs)', 'Reliability (rate limits, graceful failure, postmortems)', 'Scalability + load testing'],
    milestone: 'Deployed fullstack app, live on the internet with a URL you can share, load-tested, monitored, with a capacity plan for 2 million users.',
    resources: [
      { kind: 'video', title: 'FreeCodeCamp — React + Django Full Stack', url: 'https://www.youtube.com/watch?v=tYKRAXIio28' },
      { kind: 'interactive', title: 'Render.com — Free deployment platform', url: 'https://render.com/' },
      { kind: 'book', title: 'Two Scoops of Django', url: 'https://www.feldroy.com/books/two-scoops-of-django-3-x', note: 'Best practices' },
      { kind: 'video', title: 'Fireship — JWT Authentication explained', url: 'https://www.youtube.com/watch?v=7Q17ubqLfaM' },
      { kind: 'reading', title: 'The Twelve-Factor App', url: 'https://12factor.net/', note: 'Week 28' },
      { kind: 'reading', title: 'Real Python — Speed Up Your Python Program With Concurrency', url: 'https://realpython.com/python-concurrency/', note: 'Week 29' },
      { kind: 'video', title: 'Philip Roberts — What the heck is the event loop anyway?', url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ', note: 'Week 29' },
      { kind: 'reading', title: 'Django docs — Cache framework', url: 'https://docs.djangoproject.com/en/stable/topics/cache/', note: 'Week 30' },
      { kind: 'reading', title: 'Google SRE book — Monitoring Distributed Systems (free)', url: 'https://sre.google/sre-book/monitoring-distributed-systems/', note: 'Weeks 31–32' },
      { kind: 'reading', title: 'OpenTelemetry — What is observability?', url: 'https://opentelemetry.io/docs/concepts/observability-primer/', note: 'Week 31' },
      { kind: 'interactive', title: 'Locust — load testing in Python', url: 'https://locust.io/', note: 'Week 33' },
      { kind: 'reading', title: 'The System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer', note: 'Week 33, then Phase 6' },
    ],
    notes: [],
  },
  {
    number: 5,
    title: 'Machine learning',
    focus: 'Teaching computers to learn',
    firstWeek: 35,
    lastWeek: 44,
    topics: ['Scikit-Learn', 'Pandas', 'Neural networks', 'Keras & TensorFlow'],
    milestone: 'Train a model that predicts house prices in Lagos. Share on GitHub.',
    resources: [
      { kind: 'book', title: 'Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow — Aurélien Géron (3rd Ed.)', url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/', note: 'THE book. Start Chapter 1 in Week 35.' },
      { kind: 'video', title: 'Sentdex — ML with Python playlist', url: 'https://www.youtube.com/watch?v=OGxgnH8y2NM&list=PLQVvvaa0QuDfKTOs3Keq_kaG2P55YRn5v', note: 'Watch alongside the book' },
      { kind: 'video', title: '3Blue1Brown — Neural Networks', url: 'https://www.youtube.com/watch?v=aircAruvnKk', note: "Visual, essential. Watch before reading Géron's deep learning chapters." },
      { kind: 'video', title: 'Recommended ML video', url: 'https://youtu.be/1dKRdX9bfIo?si=6y7ebJBT3645vqM6' },
      { kind: 'interactive', title: 'Kaggle — Intro to ML course (free)', url: 'https://www.kaggle.com/learn/intro-to-machine-learning' },
      { kind: 'interactive', title: 'Kaggle — Pandas course (free)', url: 'https://www.kaggle.com/learn/pandas' },
      { kind: 'reading', title: 'Géron GitHub notebooks (free code for the book)', url: 'https://github.com/ageron/handson-ml3' },
    ],
    notes: [],
    readingPlan: [
      { week: 35, chapter: 'Ch. 1', topic: 'The ML landscape' },
      { week: 36, chapter: 'Ch. 2', topic: 'End-to-end ML project' },
      { week: 37, chapter: 'Ch. 3', topic: 'Classification' },
      { week: 38, chapter: 'Ch. 4', topic: 'Training models' },
      { week: 39, chapter: 'Ch. 5–6', topic: 'SVMs + Decision trees' },
      { week: 40, chapter: 'Ch. 7', topic: 'Ensemble methods' },
      { week: 41, chapter: 'Ch. 10', topic: 'Intro to neural networks' },
      { week: 42, chapter: 'Ch. 11', topic: 'Training deep networks' },
      { week: 43, chapter: 'Ch. 14', topic: 'CNNs (images)' },
      { week: 44, chapter: 'Project week', topic: 'Lagos house price predictor' },
    ],
  },
  {
    number: 6,
    title: 'Job ready',
    focus: 'Specialise and launch',
    firstWeek: 45,
    lastWeek: 52,
    topics: ['Algorithms practice', 'System design (capacity math, tradeoffs)', 'Mock interviews', 'Capstone', 'Job search'],
    milestone: 'Capstone project live (fullstack + ML feature). 10 job applications per week.',
    resources: [
      { kind: 'practice', title: 'LeetCode — Easy problems first', url: 'https://leetcode.com/problemset/?difficulty=Easy' },
      { kind: 'practice', title: 'Pramp — Free mock technical interviews', url: 'https://www.pramp.com/' },
      { kind: 'book', title: 'Cracking the Coding Interview', url: 'https://www.crackingthecodinginterview.com/', note: 'Read the first 5 chapters' },
      { kind: 'video', title: 'Tech With Tim — Python interview questions', url: 'https://www.youtube.com/watch?v=DEZKEJJFnSk' },
      { kind: 'reading', title: 'The System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer', note: 'Weeks 47–48' },
      { kind: 'video', title: 'ByteByteGo — System design (YouTube)', url: 'https://www.youtube.com/@ByteByteGo', note: 'Weeks 47–48' },
      { kind: 'book', title: 'Designing Data-Intensive Applications — Martin Kleppmann', url: 'https://dataintensive.net/', note: 'The reference on databases, replication and scale. Optional, dip in from Week 47.' },
      { kind: 'interactive', title: 'Levels.fyi — Salary benchmarks Nigeria + Canada', url: 'https://www.levels.fyi/' },
      { kind: 'interactive', title: 'LinkedIn — optimize your profile', url: 'https://linkedin.com' },
    ],
    notes: [
      {
        heading: 'Canadian market prep',
        items: [
          'Resume format in Canada is different — 1 page max, no photo, results-focused bullets.',
          'WES credential evaluation: https://www.wes.org/',
          'LinkedIn is the #1 job search tool in Canada — optimize it in Week 45.',
          'Target cities: Toronto, Ottawa, Calgary — strong tech sectors.',
          'Job boards: LinkedIn, Indeed Canada, Glassdoor, Workopolis, AngelList (startups).',
        ],
      },
    ],
  },
]

const phase1Outlines: WeekOutline[] = [
  { number: 1, phase: 1, title: 'Hello, World. Hello, Computer.', topics: ['What is programming', 'Variables', 'Input + math', 'if/else', 'Loops', 'Quiz game project'] },
  { number: 2, phase: 1, title: 'Lists, Functions, and Your First Real Tool', topics: ['Lists', 'Functions', 'Reading and writing files', 'Contact book project'] },
  { number: 3, phase: 1, title: 'The Web is Just Text', topics: ['HTML deep dive', 'CSS basics', 'How websites are built', 'FreeCodeCamp Responsive Design'] },
  { number: 4, phase: 1, title: 'Making it Look Good', topics: ['CSS layout', 'Flexbox', 'Your first styled webpage', 'Git + GitHub intro'] },
  { number: 5, phase: 1, title: 'Python Gets Smarter', topics: ['Dictionaries', 'Error handling', 'Modules', 'Automate the Boring Stuff projects'] },
  { number: 6, phase: 1, title: 'Phase 1 Graduation', topics: ['Phase 1 milestone project', 'Personal webpage + Python weather script', 'Apply for first freelance gigs'] },
]

// Phase 2: approved 3 Oct 2026 (phase-2-plan.md). Saturdays of Weeks 11–14 build the Mama Put Kitchen site.
const phase2Outlines: WeekOutline[] = [
  { number: 7, phase: 2, title: "JavaScript: Python's Cousin", topics: ['JS in the browser and console', 'let/const, types, template literals', 'if/else, loops', 'Functions and arrow functions'] },
  { number: 8, phase: 2, title: 'Arrays, Objects and JSON', topics: ['Arrays and objects', 'map/filter/reduce', 'Sorting', 'JSON + localStorage'] },
  { number: 9, phase: 2, title: 'The DOM: Pages That React', topics: ['querySelector', 'Events', 'Creating and removing elements', 'Form validation'] },
  { number: 10, phase: 2, title: 'Talking to APIs from the Browser', topics: ['fetch, promises, async/await', 'Loading and error states', 'Promise.all', 'CORS and API keys'] },
  { number: 11, phase: 2, title: 'Modern CSS and Multi-page Sites', topics: ['CSS Grid', 'Custom properties', 'Responsive images', 'Shared header/footer', 'Milestone: plan Mama Put Kitchen + home page'] },
  { number: 12, phase: 2, title: 'React I: Components', topics: ['Node and npm', 'Vite', 'JSX', 'Components and props', 'Milestone: menu cards as components'] },
  { number: 13, phase: 2, title: 'React II: State and Effects', topics: ['useState', 'Controlled forms', 'useEffect + fetch', 'Lifting state up', 'Milestone: cart with ₦ totals'] },
  { number: 14, phase: 2, title: 'Phase 2 Graduation', topics: ['Mama Put Kitchen polish', 'Order form → WhatsApp', 'Accessibility + Lighthouse', 'Deploy + portfolio'] },
]

// Phases 3, 4 and 6 carry the production-engineering thread (production-track.md): the things AI-assisted
// "vibe coding" won't teach — concurrency, observability, reliability, scalability, auth, databases, tradeoffs.
const phase3Outlines: WeekOutline[] = [
  { number: 15, phase: 3, title: 'Backend Basics: HTTP and Django', topics: ['Requests, responses, status codes', 'Django project + apps', 'URLs and views', 'Job board: plan the data'] },
  { number: 16, phase: 3, title: 'Models and SQL', topics: ['Django models + ORM', 'SQL SELECT/JOIN (SQLZoo)', 'The admin', 'Job board: jobs + companies'] },
  { number: 17, phase: 3, title: 'Databases Properly', topics: ['Schema design + normalisation', 'Migrations', 'Indexes + EXPLAIN', 'Constraints that protect data'] },
  { number: 18, phase: 3, title: 'Templates and Forms', topics: ['Templates', 'Forms + validation', 'Messages', 'Job board: post a job'] },
  { number: 19, phase: 3, title: 'Auth I: Users and Permissions', topics: ['Sessions + cookies', 'Password hashing', 'Login/logout/signup', 'Permissions: who may edit what', 'OWASP top risks'] },
  { number: 20, phase: 3, title: 'Transactions and Concurrency I', topics: ['ACID transactions', 'Race conditions (two applies, one slot)', 'select_for_update + unique constraints', 'Idempotency'] },
  { number: 21, phase: 3, title: 'Testing and Reliability I', topics: ['Unit + integration tests', 'Test data + fixtures', 'CI with GitHub Actions', 'Testing the race from Week 20'] },
  { number: 22, phase: 3, title: 'Background Work', topics: ['Queues + workers', 'Sending emails off the request', 'Timeouts', 'Retries with backoff + jitter'] },
  { number: 23, phase: 3, title: 'Observability I', topics: ['Structured logging', 'Error tracking (Sentry)', 'Health checks', 'Reading a stack trace from production'] },
  { number: 24, phase: 3, title: 'Phase 3 Graduation', topics: ['Job board milestone', 'Design doc: the tradeoffs you made (ADRs)', 'Portfolio + applications'] },
]

const phase4Outlines: WeekOutline[] = [
  { number: 25, phase: 4, title: 'REST APIs with Django REST Framework', topics: ['Serializers', 'API views + routers', 'Pagination + filtering', 'API errors and status codes'] },
  { number: 26, phase: 4, title: 'React Meets the API', topics: ['Fetching from Django', 'Loading/error/empty states', 'Forms that POST', 'Optimistic updates'] },
  { number: 27, phase: 4, title: 'Auth II: Tokens and Tradeoffs', topics: ['JWT vs sessions: tradeoffs', 'Refresh tokens', 'CORS + CSRF', 'Storing tokens safely'] },
  { number: 28, phase: 4, title: 'Deployment', topics: ['Render + Postgres in production', 'Environment variables + secrets', 'The Twelve-Factor App', 'Backups and restoring them'] },
  { number: 29, phase: 4, title: 'Concurrency II: Async, Threads, Processes', topics: ['The event loop (JS and Python)', 'asyncio', 'Threads vs processes vs async: when each helps', 'Deadlocks and shared state'] },
  { number: 30, phase: 4, title: 'Caching and Performance', topics: ['Measuring before optimising', 'N+1 queries', 'Redis + Django cache', 'HTTP caching + CDNs', 'Cache invalidation tradeoffs'] },
  { number: 31, phase: 4, title: 'Observability II', topics: ['Metrics + dashboards', 'Tracing (OpenTelemetry)', 'SLIs, SLOs, error budgets', 'Alerts that matter'] },
  { number: 32, phase: 4, title: 'Reliability II', topics: ['Failure modes', 'Rate limiting', 'Circuit breakers + graceful degradation', 'Incident response + blameless postmortems'] },
  { number: 33, phase: 4, title: 'Scalability', topics: ['Stateless servers + horizontal scaling', 'Load balancers', 'Read replicas, sharding (overview)', 'Queues as shock absorbers', 'Load testing with Locust', 'Capacity math: 2 million users in 4 days'] },
  { number: 34, phase: 4, title: 'Phase 4 Graduation', topics: ['Deployed fullstack app', 'Load test report', 'Dashboard + alerts', 'Capacity plan + postmortem of one failure'] },
]

const phase6Outlines: WeekOutline[] = [
  { number: 45, phase: 6, title: 'Interview Prep: Algorithms I', topics: ['Arrays, strings, hash maps', 'Big O', 'LeetCode easies', 'Resume + LinkedIn'] },
  { number: 46, phase: 6, title: 'Interview Prep: Algorithms II', topics: ['Stacks, queues, trees', 'Recursion', 'Two pointers + sliding window', 'Applications'] },
  { number: 47, phase: 6, title: 'System Design I', topics: ['Requirements + back-of-envelope estimates', 'Designing for 2 million users', 'Tradeoffs: consistency, latency, cost', 'Mock design interview'] },
  { number: 48, phase: 6, title: 'System Design II', topics: ['Design a job board / feed / chat', 'Caching, queues, sharding in practice', 'Failure and recovery plans', 'Mock design interview'] },
  { number: 49, phase: 6, title: 'Capstone I', topics: ['Fullstack + ML feature: plan + design doc', 'Build the core'] },
  { number: 50, phase: 6, title: 'Capstone II', topics: ['ML feature integrated', 'Tests, monitoring, load test'] },
  { number: 51, phase: 6, title: 'Capstone III + Mock Interviews', topics: ['Deploy + polish', 'Mock technical + behavioural interviews'] },
  { number: 52, phase: 6, title: 'Launch', topics: ['Portfolio final', '10 applications a week', 'Canada + Nigeria job plans'] },
]

/** Week-level plans where they exist; other weeks inherit their phase's topics (or its reading plan). */
function outlinesFor(): WeekOutline[] {
  const planned = [...phase1Outlines, ...phase2Outlines, ...phase3Outlines, ...phase4Outlines, ...phase6Outlines]
  const outlines: WeekOutline[] = []
  for (const phase of phases) {
    for (let week = phase.firstWeek; week <= phase.lastWeek; week++) {
      const plan = planned.find((o) => o.number === week)
      const reading = phase.readingPlan?.find((r) => r.week === week)
      outlines.push(
        plan ?? (reading
          ? { number: week, phase: phase.number, title: reading.topic, topics: [`Géron ${reading.chapter}`] }
          : { number: week, phase: phase.number, topics: [] }),
      )
    }
  }
  return outlines
}

export const fullstackMl: Omit<Course, 'weeks'> = {
  slug: 'fullstack-ml',
  title: '12-Month Fullstack + ML School',
  designedFor: 'A motivated adult learner with a day job, new to programming, learning visually, needing repetition.',
  goal: 'Fullstack Software Engineer with ML expertise — job-ready for Nigeria AND Canada.',
  totalWeeks: 52,
  dailyStructure: [
    { kind: 'review', label: 'Review', minutes: 30, description: "Re-read yesterday's notes OR rewatch a short clip. This fights forgetting." },
    { kind: 'lesson', label: 'Lesson', minutes: 45, description: 'New concept. Watch video first, then read the text/docs.' },
    { kind: 'practice', label: 'Practice', minutes: 45, description: 'Type out every example. Break it. Fix it. Never copy-paste.' },
    { kind: 'mini-task', label: 'Mini-task', minutes: 30, description: "A small problem using today's concept." },
    { kind: 'log', label: 'Log', minutes: 10, description: 'Write 3 sentences: what you learned, what confused you, what to review tomorrow.' },
  ],
  sunday: 'Rest + 1-hour weekly review. Read your log. Plan Monday.',
  rules: [
    { title: 'Never skip review.', detail: 'Forgetting is not failure — not reviewing is.' },
    { title: 'Watch twice.', detail: 'First time for overview. Second time, pause and do it yourself.' },
    { title: "Type, don't copy.", detail: 'Your hands need to learn too.' },
    { title: 'Confusion is good.', detail: 'Write it down. It means your brain is working.' },
    { title: 'Apply early.', detail: "You'll never feel ready. Apply anyway." },
  ],
  resources: [
    { kind: 'interactive', title: 'FreeCodeCamp Full Stack Developer v9', url: 'https://www.freecodecamp.org/learn/full-stack-developer-v9/', usedIn: 'Phases 1–4' },
    { kind: 'video', title: 'Mosh Hamedani — Python for Beginners', url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', usedIn: 'Phase 1' },
    { kind: 'interactive', title: 'CS50x — Harvard (free)', url: 'https://cs50.harvard.edu/x/', usedIn: 'Phase 1 (C intro)' },
    { kind: 'video', title: 'Traversy Media — Django Crash Course', url: 'https://www.youtube.com/watch?v=e1IyzVyrLSU', usedIn: 'Phase 3' },
    { kind: 'video', title: 'Mosh — React Tutorial', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', usedIn: 'Phase 2' },
    { kind: 'video', title: 'Sentdex — Machine Learning with Python', url: 'https://www.youtube.com/watch?v=OGxgnH8y2NM&list=PLQVvvaa0QuDfKTOs3Keq_kaG2P55YRn5v', usedIn: 'Phase 5' },
    { kind: 'video', title: '3Blue1Brown — Neural Networks series', url: 'https://www.youtube.com/watch?v=aircAruvnKk', usedIn: 'Phase 5' },
    { kind: 'interactive', title: 'Kaggle Free ML Courses', url: 'https://www.kaggle.com/learn', usedIn: 'Phase 5' },
    { kind: 'book', title: 'Hands-On ML — Aurélien Géron (O\'Reilly, 3rd Ed.)', url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/', usedIn: 'Phase 5–6' },
    { kind: 'reading', title: 'Automate the Boring Stuff with Python (free online)', url: 'https://automatetheboringstuff.com/', usedIn: 'Phase 1–2' },
    { kind: 'interactive', title: 'The Odin Project', url: 'https://www.theodinproject.com/', usedIn: 'Phase 2–3' },
    { kind: 'reading', title: 'Django Official Docs', url: 'https://docs.djangoproject.com/', usedIn: 'Phase 3' },
    { kind: 'reading', title: 'Real Python', url: 'https://realpython.com/', usedIn: 'All phases' },
    { kind: 'interactive', title: 'CS50P — Python (free)', url: 'https://cs50.harvard.edu/python/', usedIn: 'Phase 2' },
    { kind: 'video', title: 'Recommended ML YouTube video', url: 'https://youtu.be/1dKRdX9bfIo?si=6y7ebJBT3645vqM6', usedIn: 'Phase 5' },
    { kind: 'practice', title: 'LeetCode', url: 'https://leetcode.com/', usedIn: 'Phase 6' },
    { kind: 'practice', title: 'Pramp', url: 'https://www.pramp.com/', usedIn: 'Phase 6' },
  ],
  phases,
  outlines: outlinesFor(),
}
