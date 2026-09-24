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
    topics: ['Django', 'Python', 'SQL'],
    milestone: 'Full job board app — users can post and apply for jobs. Backend included.',
    resources: [
      { kind: 'video', title: 'Traversy Media — Django Crash Course', url: 'https://www.youtube.com/watch?v=e1IyzVyrLSU' },
      { kind: 'reading', title: 'Django Official Tutorial', url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/' },
      { kind: 'video', title: 'CS50P — Python (full free course, Harvard)', url: 'https://cs50.harvard.edu/python/' },
      { kind: 'reading', title: 'Automate the Boring Stuff — Chapters 8–14', url: 'https://automatetheboringstuff.com/', note: 'Files, web, data' },
      { kind: 'interactive', title: 'SQLZoo — Learn SQL interactively', url: 'https://sqlzoo.net/' },
    ],
    notes: [],
  },
  {
    number: 4,
    title: 'Fullstack',
    focus: 'Connecting it all',
    firstWeek: 25,
    lastWeek: 34,
    topics: ['React + Django', 'Authentication (JWT)', 'Deployment'],
    milestone: 'Deployed fullstack app, live on the internet with a URL you can share.',
    resources: [
      { kind: 'video', title: 'FreeCodeCamp — React + Django Full Stack', url: 'https://www.youtube.com/watch?v=tYKRAXIio28' },
      { kind: 'interactive', title: 'Render.com — Free deployment platform', url: 'https://render.com/' },
      { kind: 'book', title: 'Two Scoops of Django', url: 'https://www.feldroy.com/books/two-scoops-of-django-3-x', note: 'Best practices' },
      { kind: 'video', title: 'Fireship — JWT Authentication explained', url: 'https://www.youtube.com/watch?v=7Q17ubqLfaM' },
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
    topics: ['Algorithms practice', 'Mock interviews', 'Capstone', 'Job search'],
    milestone: 'Capstone project live (fullstack + ML feature). 10 job applications per week.',
    resources: [
      { kind: 'practice', title: 'LeetCode — Easy problems first', url: 'https://leetcode.com/problemset/?difficulty=Easy' },
      { kind: 'practice', title: 'Pramp — Free mock technical interviews', url: 'https://www.pramp.com/' },
      { kind: 'book', title: 'Cracking the Coding Interview', url: 'https://www.crackingthecodinginterview.com/', note: 'Read the first 5 chapters' },
      { kind: 'video', title: 'Tech With Tim — Python interview questions', url: 'https://www.youtube.com/watch?v=DEZKEJJFnSk' },
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

/** Weeks 7–52 have no week-level plan yet; they inherit their phase's topics (or its reading plan). */
function outlinesFor(): WeekOutline[] {
  const outlines = [...phase1Outlines]
  for (const phase of phases.slice(1)) {
    for (let week = phase.firstWeek; week <= phase.lastWeek; week++) {
      const reading = phase.readingPlan?.find((r) => r.week === week)
      outlines.push(
        reading
          ? { number: week, phase: phase.number, title: reading.topic, topics: [`Géron ${reading.chapter}`] }
          : { number: week, phase: phase.number, topics: [] },
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
