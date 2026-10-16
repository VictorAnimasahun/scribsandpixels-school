# Phase 5 plan (Weeks 35–44): Machine learning, from Victor's books (APPROVED by Victor, 16 Oct 2026)

> **Approved and running as its own course** (`src/content/courses/machine-learning/`), because Victor wanted to start ML now, not at Week 35: plan Week 35 = ML course Week 1, …, Week 44 = Week 10. Decisions: neural networks from Klein; synthetic Lagos housing data; written now, a week at a time.

**Phase:** Machine learning: teaching computers to learn. **Milestone:** a model that predicts house prices in Lagos, on GitHub.
**Asked for (16 Oct 2026):** "read the ML book in my directory and pick pages from it to construct the machine learning lessons… break down those concepts in a way that doesn't make my head boil."


## The books (what Victor actually has)
1. **Géron, *Hands-On Machine Learning with Scikit-Learn, Keras and TensorFlow*, 2nd edition, Early Release (Jan 2019)**, `~/Desktop/ml-book/hands-on-machine-learning.pdf`. 279 pages, **Chapters 1–9 only**: everything up to clustering, no neural-network chapters. Page numbers below are the book's printed page numbers (PDF page = book page + 2).
2. **Bernd Klein, *Python and Machine Learning*** (python-course.eu), `~/Downloads/bernd_klein_python_and_machine_learning_a4.pdf`, 453 pages. Builds neural networks **from scratch in NumPy** (pp. 96–269), which is exactly what Géron's early release lacks, and it runs light in the browser.

`course.ts` currently names Géron's **3rd edition** and plans Weeks 41–43 on its Chapters 10, 11 and 14, which aren't in Victor's copy. This plan uses the two books he has. Every reading also gives the **section title**, so a learner with another edition can find the same pages.

## How each idea is broken down (the "no boiling head" rule)
Géron fires about thirty terms in Chapter 1 alone. The lessons slow that down:
1. **One idea per block.** A day has 3–4 ideas at most, never a whole chapter.
2. **Plain words first, the jargon word last.** "The model learned the past questions by heart, so it fails when the examiner rephrases them" comes before the word *overfitting*.
3. **A local, everyday picture** for every idea (Lagos traffic, WAEC past questions, a mama put's prices, POS fraud).
4. **Small numbers worked by hand** before any formula: three Lagos houses in naira before RMSE's Σ and √.
5. **Then the pages:** "Now read pp. 34–36. You'll see the same idea with the taxi-driver example and a chart."
6. **Then do it** in the sandbox (Python in the browser) on Nigerian data, with automatic checks.
7. **"What breaks without it"**, one line, so each idea earns its place.
Maths stays in, but always as the last step, after the picture and the hand-worked numbers. Skippable deep-dives ("Under the Hood" sections) are marked optional.

### Sample breakdown (to judge the level): overfitting, Week 35 Day 5
> **The picture.** Two students prepare for WAEC maths. Bisi memorises every past question and its answer, word for word. Tunde learns *why* each method works. In the mock (the past questions) Bisi scores 100% and Tunde 85%. In the real exam the examiner changes the numbers and the wording: Bisi drops to 40%, Tunde stays at 82%.
>
> **The idea.** A model can do the same thing: learn the training examples *so exactly* that it also learns their accidents and noise, then fail on new cases. Doing brilliantly on the data it learned from and badly on new data is called **overfitting**. Its opposite, a model too simple to catch even the real pattern (a student who only read the summary), is **underfitting**.
>
> **By hand.** Five Lagos flats: a straight line through rent vs size misses each by about ₦200k. A wiggly curve passes through all five exactly (error ₦0)… then predicts ₦9m for a sixth flat that really rents for ₦2.5m. Which model do you trust?
>
> **Read** pp. 34–36 ("Overfitting the Training Data", "Underfitting"). Géron's version: a rip-off taxi driver, and a model that decides countries with a "w" in their name are happier.
>
> **Do** (sandbox): fit a line and a degree-9 curve to the five flats; compare their error on the five, then on five new flats.
>
> **Without it:** you ship a model that looked perfect in testing and embarrasses you in production.

## Weeks
Six study days a week (Saturday = project), same structure as every other week (Review · Lesson · Practice · Mini-task · Log). Book pages per day:

| Week | Title | Days (book · pages) | Saturday project |
|---|---|---|---|
| 35 | What Machine Learning Is | 1 What ML is, and why (G pp. 9–13) · 2 Learning with or without the answers: supervised, unsupervised, semi-supervised, reinforcement (G pp. 14–21) · 3 All at once or bit by bit; copying or modelling: batch/online, instance/model-based (G pp. 21–29) · 4 Bad data: too little, not representative, dirty, irrelevant (G pp. 30–34) · 5 Overfitting, underfitting, regularization, hyperparameters (G pp. 34–37) | Testing and validating, No Free Lunch (G pp. 37–40); answer Géron's 19 exercises in your own words; first train/test split by hand |
| 36 | A Real Project I: Look Before You Model | 1 Frame the problem, pipelines (G pp. 41–45) · 2 How wrong is wrong? RMSE and MAE, by hand in naira (G pp. 45–48; norms optional) · 3 First look at the data: head, info, describe, histograms (G pp. 48–57; install pages optional, the sandbox needs none) · 4 Put a test set aside: random and stratified (G pp. 57–61) · 5 Explore: maps, correlations, new attributes (G pp. 61–68) | Explore the Lagos housing data; write five findings and three questions |
| 37 | A Real Project II: Prepare, Train, Tune | 1 Clean the data: missing values (G pp. 68–71) · 2 Text categories → numbers: one-hot; custom transformers (G pp. 71–74) · 3 Feature scaling and pipelines (G pp. 74–77) · 4 Train and evaluate; cross-validation (G pp. 77–81) · 5 Fine-tune: grid and randomized search; the test set, once (G pp. 81–86) | Launch, monitor, maintain (G pp. 86–88; ties to the production thread: models drift like servers fail); the full pipeline on the Lagos data |
| 38 | Classification: Yes or No, Which One | 1 A first classifier: handwritten digits (G pp. 89–92; sklearn's built-in 8×8 digits instead of 50 MB MNIST) · 2 Accuracy lies: cross-validation, confusion matrix (G pp. 92–96) · 3 Precision vs recall, and the tradeoff (G pp. 96–101; picture: a bank flagging POS fraud) · 4 The ROC curve (G pp. 101–104) · 5 More than two classes; error analysis; multilabel (G pp. 104–112) | A fraud flagger on a synthetic Naija transactions set: choose a threshold and defend it |
| 39 | How Models Actually Learn | 1 Linear regression and the Normal Equation (G pp. 115–121) · 2 Gradient descent: walking down a hill in fog (G pp. 121–128) · 3 Stochastic and mini-batch (G pp. 128–131) · 4 Polynomial regression and learning curves (G pp. 132–138) · 5 Regularization: Ridge, Lasso, Elastic Net, early stopping (G pp. 138–145) | Logistic and softmax regression (G pp. 145–155); gradient descent written by hand in NumPy |
| 40 | Trees, Forests and Margins | 1 SVMs: the widest street between two groups (G pp. 157–166; "Under the Hood" pp. 168–176 optional) · 2 Decision trees: the loan officer's questions (G pp. 179–184) · 3 Gini, hyperparameters, regression trees, instability (G pp. 184–190) · 4 Wisdom of the crowd: voting, bagging (G pp. 193–200) · 5 Random forests, feature importance, boosting (G pp. 201–212) | Stacking (G pp. 212–215); does a random forest beat your Week 37 model on Lagos prices? |
| 41 | Learning Without Answers | 1 Too many columns: the curse of dimensionality (G pp. 217–222) · 2 PCA: the best camera angle (G pp. 223–229) · 3 Clustering and K-Means (G pp. 239–252) · 4 K-Means' limits; clustering for images and preprocessing (G pp. 252–258) · 5 DBSCAN, Gaussian mixtures, anomaly detection (G pp. 258–269) | Segment NaijaMart's customers (the Excel course's datasets, reused) and name each group |
| 42 | Neural Networks I: From a Line to a Network | 1 From dividing lines to neurons (K pp. 96–140) · 2 Structure, weights and matrices (K pp. 141–152) · 3 Running a network in Python (K pp. 153–161) · 4 Backpropagation, gently (K pp. 162–168; 3Blue1Brown ch. 3 first) · 5 Training a network (K pp. 169–197) | A network from scratch in NumPy that learns XOR |
| 43 | Neural Networks II: Deeper and on Real Data | 1 A full network class (K pp. 198–226) · 2 More hidden layers (K pp. 227–230) · 3 Epochs, and why training is repeated (K pp. 231–268) · 4 A network for the digits dataset (K pp. 269–290) · 5 Frameworks: the same network in Keras/TensorFlow (K p. 437 on; Géron's free notebook `10_neural_nets_with_keras.ipynb`) | Beat Week 38's digit classifier with your network |
| 44 | Phase 5 Graduation | Milestone build days: data, pipeline, model choice, error analysis, model card + README, GitHub | **Milestone:** Lagos house price predictor on GitHub, with a short design note on the tradeoffs |

G = Géron (2nd ed. early release), K = Klein. Klein page ranges are from his contents page; each week's exact pages get checked against the text when that week is written.

## Changes from the current `course.ts` plan
- **Chapter 2 gets two weeks** (36–37) instead of one: it is the whole job in one chapter (about 50 pages and every core idea), and the milestone is a remake of it.
- **Unsupervised learning gets a week** (41, Géron Ch. 8–9), which the old plan skipped.
- **Neural networks get two weeks** (42–43, from Klein) instead of three from Géron's 3rd edition. Deep learning (CNNs, larger Keras models) can extend into Phase 6 if wanted.
- SVMs (Ch. 5) are folded into Week 40, with the heavy maths ("Under the Hood") optional.

## Data
- **Lagos housing dataset** (synthetic, fixed seed, like the Excel course's NaijaMart files, so every "Check:" figure is computed from the file): about 3,000 listings with area (Lekki, Ikoyi, VI, Ikeja GRA, Yaba, Surulere, Gbagada, Ajah, Ikorodu…), property type, bedrooms, bathrooms, toilets, parking, size (m²), age, serviced/not, distance to the Third Mainland Bridge, price in ₦. Realistic ranges, plus a few deliberate problems to clean: missing values, a capped price, mislabelled areas, outliers. Real listing sites forbid scraping, so the data is synthetic and says so.
- **Built into scikit-learn (no download):** handwritten digits (8×8), iris, wine.
- **Reused:** NaijaMart customers and sales from the Excel course (clustering, Week 41).

## Sandboxes
- The existing Python sandbox (Pyodide) gains the ML libraries: **scikit-learn 1.8, pandas 3, numpy 2.4, scipy, matplotlib** are all in Pyodide's current release. The worker loads the packages a lesson imports (a small change, built with Week 35). Reference solutions and checks work exactly like today's Python sandboxes (`npm run check:python`).
- **Download cost:** about 25 MB the first time the ML libraries load (scipy 13.7 MB, scikit-learn 4.3, pandas 4.1, numpy 2.9), then saved offline. The first ML lesson says "on Wi-Fi". Weeks 42–43 (NumPy only) need just 3 MB.
- Charts: matplotlib renders to an image in the output panel.

## Quizzes
Checkpoint banks per day, as for every course (rapid-fire, brain teaser, gate bank). Questions test the ideas in plain words first ("Your model scores 99% on training data and 61% on new data: what's happening?"), then the vocabulary.

## Decisions for Victor
1. **Approve the week plan** (or change it).
2. **Neural networks from Klein (2 weeks, NumPy from scratch)**, or keep three weeks and buy/borrow Géron's 3rd edition for Chapters 10, 11 and 14?
3. **Synthetic Lagos data** (clean answer keys, deliberate problems to fix) vs a real public dataset (messier, licence to check)?
4. **When to write:** Phase 5 is Week 35 and you're on Week 2. Write it now, a week at a time, or keep writing in course order (Phase 3 next)?
