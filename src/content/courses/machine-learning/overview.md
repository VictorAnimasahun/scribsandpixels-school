# Machine Learning: Zero to Model — 10-Week ML School

**Designed for:** An adult with a day job who can write basic Python (variables, `if`, loops, functions, lists and dictionaries) and wants to understand machine learning properly, not just copy code.
**Goal:** Know what every core ML idea means, in plain words; build real models with scikit-learn; build a small neural network from scratch; and finish with a **Lagos house price predictor** on GitHub.
**Time:** ~1.5 hours a day, Monday–Saturday, for 10 weeks. Saturday is a longer project day.

> **The rule of this course: no boiling heads.** Machine learning books fire dozens of new words at you per chapter. Here every idea arrives one at a time: first an everyday picture, then small numbers worked by hand (in naira), then the proper word, then the formula if there is one, and only then the book's pages. You read the book *after* you already get the idea, so the pages feel like a second explanation, not a wall.

---

## How This Course Works

### Daily Structure (Mon–Fri, ~1.5 hours)
| Block | Time | What You Do |
|---|---|---|
| Review | 15 min | Explain yesterday's idea out loud, or redo yesterday's sandbox from a blank page. |
| Lesson | 30 min | The idea in plain words, with a local example, worked by hand. Then **read the book pages** listed. |
| Practice | 30 min | Do it in the Python sandbox (real Python in your browser, checked automatically). |
| Mini-Task | 15 min | A small problem of your own, or a written answer, checked against a model answer. |
| Log | 5 min | 3 sentences: what I learned, what confused me, what I'll review tomorrow. |

**Saturday** is project day (~2.5 hours): one realistic problem that uses the whole week.
**Sunday:** rest. If you want, watch one StatQuest video for fun.

### Your Learning Rules
1. **Picture first, words second.** If you can't explain an idea to a friend using an everyday example, you don't have it yet. Go back to the picture.
2. **Do the numbers by hand once.** Every formula in this course is first worked with three or five numbers. Do it on paper. Then let Python do it.
3. **Read the pages after the lesson, not before.** The lesson gives you the map; the book fills in the roads.
4. **Type the code.** Never paste. Your fingers learn what your eyes skip.
5. **Write what confused you.** The log's "confused me" line is the most useful thing you write all day.

### What You Need
- **The two books** (page numbers below are their printed page numbers):
  - **Aurélien Géron, *Hands-On Machine Learning with Scikit-Learn, Keras and TensorFlow*, 2nd edition, Early Release (2019).** Chapters 1–9. *(In this school's copy, PDF page = book page + 2.)* With another edition, find the same **section title**: they rarely change.
  - **Bernd Klein, *Python and Machine Learning*** (python-course.eu), for neural networks from scratch (Weeks 8–9).
- **The Python sandbox** in each lesson. No installation needed: Python runs in your browser. The first time a lesson uses the data-science libraries (numpy, pandas, scikit-learn), they download once (about **25 MB**, so use Wi-Fi), then stay saved on your device. numpy alone is about 3 MB.
- **Optional:** Python on your own computer (Jupyter, numpy, pandas, scikit-learn) for the Saturday projects you want to keep.
- **Before you start:** basic Python. If you're doing the Fullstack course, Weeks 1–4 cover it, and you can run this course alongside. numpy and pandas are taught here, as they're needed.

### The Datasets
| Data | What it is | First used |
|---|---|---|
| Small tables in the lessons | 5 to 30 rows (Lagos flats, Corolla listings, scam SMS…), so you can see every number | Week 1 |
| **Lagos housing** (synthetic) | ~3,000 Lagos property listings: area, type, bedrooms, bathrooms, size, age, serviced, price in ₦, with deliberate problems to clean | Week 2 |
| scikit-learn's built-in sets | Handwritten digits (8×8), iris, wine: no download | Week 4 |
| **Naija transactions** (synthetic) | 4,000 card, POS, transfer and ATM payments, about 3% of them fraud: amount, hour, distance from home, new device, foreign card, recent activity, account age | Week 4 |
| NaijaMart (from the Excel course) | Customers and sales of a fictional Nigerian retail chain | Week 7 |

The Lagos housing data is **made up but realistic** (real listing sites don't allow copying their data). It's generated from a fixed seed, so every "Check" answer in the lessons was computed from the actual file.

### Master Resource List
| Resource | Type | Used In |
|---|---|---|
| Géron, *Hands-On Machine Learning* (2nd ed., Ch. 1–9) | The main book | Weeks 1–7 |
| Klein, *Python and Machine Learning* | Neural networks from scratch | Weeks 8–9 |
| [StatQuest with Josh Starmer](https://www.youtube.com/@statquest) | YouTube: the friendliest explanations of ML ideas | All weeks |
| [3Blue1Brown — Neural networks](https://www.youtube.com/watch?v=aircAruvnKk) | YouTube: visual intuition for neural networks | Weeks 8–9 |
| [Google — Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course) | Free course with interactive exercises | Weeks 1–6 |
| [Kaggle — Intro to Machine Learning](https://www.kaggle.com/learn/intro-to-machine-learning) | Free hands-on notebooks | Weeks 2–5 |
| [Géron's notebooks (handson-ml2)](https://github.com/ageron/handson-ml2) | The book's full code, free | Weeks 1–7 |

---

## Phases at a Glance

| Phase | Weeks | Focus | Milestone |
|---|---|---|---|
| 1 | 1–3 | **Foundations:** what ML is, and one real project from start to finish | Explore, clean and model the Lagos housing data |
| 2 | 4–7 | **The core algorithms:** classification, how models learn, trees and forests, learning without answers | A fraud flagger; a random forest; NaijaMart customer groups |
| 3 | 8–9 | **Neural networks** from scratch | A network in NumPy that reads handwritten digits |
| 4 | 10 | **Graduation** | **Lagos house price predictor** on GitHub, with a design note |

## Syllabus

| Week | Title | Book pages |
|---|---|---|
| 1 | What Machine Learning Is | Géron pp. 9–40 |
| 2 | A Real Project I: Look Before You Model | Géron pp. 41–68 |
| 3 | A Real Project II: Prepare, Train, Tune | Géron pp. 68–88 |
| 4 | Classification: Yes or No, Which One | Géron pp. 89–113 |
| 5 | How Models Actually Learn | Géron pp. 115–155 |
| 6 | Trees, Forests and Margins | Géron pp. 157–215 |
| 7 | Learning Without Answers | Géron pp. 217–269 |
| 8 | Neural Networks I: From a Line to a Network | Klein pp. 96–197 |
| 9 | Neural Networks II: Deeper and on Real Data | Klein pp. 198–290, 437 on |
| 10 | Graduation: the Lagos house price predictor | Your own project |

Weeks are written one at a time, each checked from start to finish before the next.
