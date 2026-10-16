# Week 1 — What Machine Learning Is
**Theme:** The big picture of machine learning: what it is, the main kinds, what goes wrong, and how you know a model is any good. Almost no maths, lots of pictures.
**Big question:** *What does it actually mean for a computer to "learn" something?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📕 | Géron, *Hands-On Machine Learning*, Chapter 1 (pp. 9–40) | The book pages listed in each day's lesson. Read them **after** the lesson's plain-words explanation. |
| 📺 | [StatQuest: A Gentle Introduction to Machine Learning](https://www.youtube.com/watch?v=Gv9_4yMHFhI) | Watch on Day 1, after the lesson. |
| 📺 | [StatQuest: Bias and Variance](https://www.youtube.com/watch?v=EuBBz3bI-aA) | Watch on Day 5: the same idea as overfitting, with pictures. |
| 📺 | [StatQuest: Cross Validation](https://www.youtube.com/watch?v=fSytzGwwBVw) | Watch on Saturday. |
| 🌐 | [Google Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course) | Optional: the "Introduction to ML" module, if you want a second explanation of this week. |

## Day 1 — Monday
**Topic:** What machine learning is, and when it's worth using
**Time:** ~1.5 hours

### Review (15 min)
Nothing to review yet: it's Day 1.
- Read the course overview once (the "Read the course overview" button on the course page). Note the rule: **picture first, words second, book third**.
- Open your copy of Géron at page 9 (Chapter 1). In the school's PDF that's PDF page 11: book page + 2.

### Lesson (30 min)
**The picture: Mama Nkechi's jollof.**
Mama Nkechi runs a buka in Surulere. Every morning she must decide how many plates of jollof to cook. Cook too few and customers leave; cook too many and food is wasted.

*Option 1: she writes rules.* "Monday: 40 plates. Friday: 70. If it's raining, 10 fewer. If there's a match on, 20 more." Every time something new happens (a new office opens nearby, school resumes), she has to think up a new rule. After a year her rules fill two pages and still go wrong.

*Option 2: she learns from her notebook.* She has written down, every day for two years, the day, the weather, any events, and how many plates actually sold. Instead of inventing rules, she looks for the pattern in those examples, and the pattern tells her what to cook tomorrow. When the new office opens, the notebook starts showing it within weeks, and her estimate adjusts by itself.

Option 1 is **traditional programming**: a person writes the rules. Option 2 is **machine learning**: the computer finds the rules from examples.

> **Machine learning** is getting a computer to improve at a task by learning from data, instead of a person writing every rule.

**The proper definition (Tom Mitchell, 1997), with the buka.** A program *learns* from experience **E** at a task **T**, measured by **P**, if its score on T (measured by P) improves with E.
- **T (task):** predict tomorrow's plates.
- **E (experience):** the two-year notebook (the *training data*; each day in it is one *training example*).
- **P (performance measure):** how far off the prediction is, on average.

If the predictions get closer as more days go into the notebook, it's learning. Downloading all of Wikipedia doesn't count: the computer has more data, but it isn't better at any task.

**The famous example: spam.** A spam filter written with rules ("block messages containing *free*, *winner*, *BVN*") breaks the day scammers write "fr33" or "B.V.N". A spam filter that *learns* from messages people have reported notices the new spellings appearing in reported messages and starts catching them, without anyone writing a new rule.

**When is ML worth it?** (You'll read these four on p. 13.)
1. **The rules would be long and keep changing.** A bank's rules for spotting a suspicious transfer.
2. **Nobody knows the rules.** Recognising spoken Yoruba: try writing the rule for "ẹ káàárọ̀" in every voice and accent.
3. **The world keeps changing.** Scam SMS patterns change every month.
4. **You want to discover something.** What do NaijaMart customers who buy rice also buy? The model can show you patterns you didn't know.

And when isn't it? When a simple, fixed rule works perfectly. VAT is 7.5%: you don't need machine learning for that.

**Now read** Géron **pp. 9–13** ("What Is Machine Learning?" and "Why Use Machine Learning?"). You'll meet the same spam example, plus speech recognition and "ML can help humans learn" (data mining).

**Then watch** the StatQuest *Gentle Introduction* (link in Resources).

### Practice (30 min)
Two spam filters for SMS: first with rules you write, then one that learns its "spam words" from labelled examples. Watch the rule-based one miss a message the learned one catches.

::sandbox ml-w01-d1-spam

### Mini-Task
For each problem, write **T**, **E** and **P** in your notebook, in one line each:
1. A Lagos estate agent wants to predict the rent of a flat from its size, area and number of bedrooms.
2. A bank wants to flag card payments that are probably fraud.
3. A music app wants to suggest the next song you'll like.

:::hint
T is what the program does for each new case. E is the data it learns from (past examples). P is a number that says how well it's doing.
:::

**Check:** 1. T: predict a flat's rent · E: past listings with their actual rents · P: average error in naira (how far off the predictions are). 2. T: label each payment fraud / not fraud · E: past payments marked fraud or not by the bank · P: share of frauds caught, without flagging too many honest payments. 3. T: pick the next song · E: what people played, skipped and liked · P: how often you play the suggestion instead of skipping it.

### Log (5 min)
In your own words: what's the difference between writing rules and learning from data? Use an example that isn't from today's lesson.

## Day 2 — Tuesday
**Topic:** Learning with or without the answers: supervised, unsupervised, semi-supervised, reinforcement
**Time:** ~1.5 hours

### Review (15 min)
Without looking: explain machine learning to a friend using Mama Nkechi's buka. Then write T, E and P for a new problem: predicting tomorrow's danfo fare from Oshodi to CMS.

### Lesson (30 min)
Machine learning systems are sorted by **how much help (answers) they get while learning**.

**1. Supervised learning: learning with the marking scheme.**
You prepare for WAEC with past questions **and their answers**. You try a question, check the answer, adjust. The answers are what make it *supervised*: a teacher, in effect, marks every example.

In ML, each training example comes with the answer you want the computer to learn, called the **label**.

Picture a table of second-hand Toyota Corollas on sale in Lagos:

| year | mileage (km) | transmission | location | **price (₦m)** |
|---|---|---|---|---|
| 2012 | 145,000 | automatic | Ikeja | **4.8** |
| 2015 | 98,000 | automatic | Lekki | **7.2** |
| 2010 | 190,000 | manual | Yaba | **3.1** |

- Each **row** is one example (one car). Géron calls it an *instance* or *sample*.
- The columns you **know** in advance (year, mileage, transmission, location) are the **features**. Géron also calls them *attributes* or *predictors*.
- The column you want to **predict** (price) is the **label** (or *target*).

Two kinds of supervised task:
- **Regression:** the answer is a **number**. "How much will this Corolla sell for?" → ₦5.6m.
- **Classification:** the answer is a **category**. "Is this SMS spam or not?" → spam. "Will this loan be repaid?" → yes/no.

> Memory trick: **regression → a number on a ruler; classification → a label on a box.**

**2. Unsupervised learning: no answers at all.**
A trader in Balogun market empties a sack of mixed Ankara fabrics on the table. Nobody has labelled them. She still sorts them into piles: the bold geometric ones, the floral ones, the dark wax prints. Nobody told her the groups; she found them.

Unsupervised learning finds structure in data **without labels**. The main jobs:
- **Clustering:** find groups. A POS business discovers its customers fall into "market traders who pay many small amounts", "salary earners who pay once a month", and "weekend spenders".
- **Anomaly detection:** spot the odd one out. A card that's always used in Abuja suddenly pays ₦900,000 at 3 a.m. in another country.
- **Dimensionality reduction:** squeeze many columns into fewer without losing much. A car's age and mileage move together, so merge them into one "wear and tear" number (Géron calls this *feature extraction*).
- **Association rules:** "people who buy Indomie also tend to buy eggs", so put them close together on the shelf.

**3. Semi-supervised learning: a few answers, lots of data.**
Google Photos groups all the photos of the same face by itself (unsupervised), then asks you to name each person once (a few labels), and now it can name everyone in every photo.

**4. Reinforcement learning: learning from rewards and penalties.**
Learning to drive in Lagos traffic. Nobody hands you a marking scheme. You try something (take Third Mainland Bridge at 5 p.m.), and the world rewards you (home early) or punishes you (stuck for two hours, or a LASTMA fine). Over time you learn a **policy**: what to do in each situation to get the most reward.
In RL the learner is called an **agent**; it observes, **acts**, and gets **rewards** (or negative rewards, penalties). DeepMind's AlphaGo learned Go this way.

**Now read** Géron **pp. 14–21** ("Supervised/Unsupervised Learning" through "Reinforcement Learning"). The lists of algorithm names (k-Nearest Neighbors, SVMs, PCA, t-SNE…) are just a preview: don't try to learn them now. You'll meet each one properly in later weeks.

### Practice (30 min)
Split a table of Corolla listings into features and labels, the way every ML library expects, then sort some everyday problems into regression, classification, clustering, anomaly detection or reinforcement learning.

::sandbox ml-w01-d2-labels

### Mini-Task
For each, write **supervised / unsupervised / semi-supervised / reinforcement**, and if supervised, **regression or classification**:
1. Predict how many litres of fuel a generator will use this week.
2. Group 10,000 NaijaMart customers by how they shop, with no groups given.
3. A robot vacuum learns to clean your flat by getting points for clean floor and losing points for bumping into walls.
4. Decide whether a photo of a cassava leaf shows disease, using 5,000 photos already marked "diseased" or "healthy".

**Check:** 1. supervised, regression (a number: litres) · 2. unsupervised (clustering) · 3. reinforcement learning (rewards and penalties) · 4. supervised, classification (the photos come with labels; the answer is a category).

### Log (5 min)
Write one example of each of the four kinds from your own life or work.

## Day 3 — Wednesday
**Topic:** All at once or bit by bit; copying or modelling
**Time:** ~1.5 hours

### Review (15 min)
From memory: what's a feature, what's a label, and what's the difference between regression and classification? Give a Nigerian example of each.

### Lesson (30 min)
Two more ways to sort ML systems.

**A. Do they learn all at once, or bit by bit?**

**Batch learning (offline):** like a textbook that's reprinted once a year. You collect all the data, train the model on all of it at once (which can take hours), then put it to work. It doesn't learn anything new on the job. To teach it about new data, you train a whole new version on old + new data and swap it in.
- Fine when the world changes slowly and you have the computing power (most projects you'll build).

**Online learning (incremental):** like a student who updates her notes after every class. The model learns from each new example (or a small *mini-batch*) as it arrives.
- Good when data arrives all the time (exchange rates, fraud patterns) or the data is too big to hold at once (*out-of-core* learning: read a chunk, learn, read the next chunk).
- **Learning rate:** how quickly it changes its mind. A trader who changes her prices after every single customer reacts fast but gets thrown by one odd customer; a trader who never changes prices ignores real changes. A high learning rate adapts fast but forgets the old; a low one is steady but slow.
- **The risk:** feed an online system bad data (a broken sensor, people gaming it) and it slowly gets worse, live, in front of users. So you watch it and can switch learning off.

**B. Do they copy, or build a model?**

Say you want to predict the yearly rent of an 84 m² flat in Yaba. You know eight flats:

| size (m²) | 45 | 55 | 60 | 70 | 80 | 90 | 100 | 120 |
|---|---|---|---|---|---|---|---|---|
| rent (₦m/yr) | 1.2 | 1.5 | 1.6 | 1.9 | 2.1 | 2.4 | 2.6 | 3.1 |

**Instance-based learning (copying, by similarity):** "This flat is like those." Find the 3 flats closest in size to 84 m²: 80 (4 away), 90 (6 away), 70 (14 away). Their rents are 2.1, 2.4 and 1.9. Average: (2.1 + 2.4 + 1.9) ÷ 3 = **₦2.13m**. This is **k-Nearest Neighbours** with k = 3. It keeps all the examples and compares each new case to them.

**Model-based learning (building a model):** "Rent goes up steadily with size." Draw the straight line that fits the eight flats best:

> rent = θ₀ + θ₁ × size

- **θ₀ ("theta zero")** is where the line starts (the base); **θ₁** is how much rent rises per extra m². These two numbers are the model's **parameters**.
- **Training** = finding the θ₀ and θ₁ that make the line fit the examples best. For these flats, the best line is θ₀ = 0.104 and θ₁ = 0.0251 (₦25,100 more per m²).
- **Using the model** (Géron: *inference*): rent of 84 m² = 0.104 + 0.0251 × 84 = **₦2.21m**.

How does training know which line is "best"? With a **cost function**: a number that measures how *bad* the line is (for example, the average distance from the line to the real rents). Training searches for the θ values that make the cost as small as possible. You'll do this by hand in Week 5; for now, know the idea.

Both methods gave a sensible answer (₦2.13m vs ₦2.21m). The difference: instance-based keeps the examples and compares; model-based learns a few parameters and throws the examples away.

**Now read** Géron **pp. 21–29** ("Batch and Online Learning", "Instance-Based Versus Model-Based Learning"). His model example is "does money make people happy?" (GDP vs life satisfaction): the same straight line as our rents. You don't need to understand the code on p. 28 yet; just notice its four steps: load the data, choose a model, `fit` (train), `predict`.

### Practice (30 min)
Predict the 84 m² Yaba flat both ways in Python: k-nearest neighbours, then the best straight line (using the least-squares formula, given).

::sandbox ml-w01-d3-knn-line

### Mini-Task
Batch or online? One line each, with a reason:
1. A model that predicts the naira–dollar rate every few minutes.
2. A model that predicts house prices, retrained once a month on all listings.
3. A phone keyboard that learns your words, on the phone itself.

**Check:** 1. online: the data streams in and the world changes fast · 2. batch: retrained from scratch on all the data on a schedule · 3. online: it learns from each new word you type, with the phone's limited memory and power.

### Log (5 min)
Explain instance-based vs model-based learning using a non-housing example.

## Day 4 — Thursday
**Topic:** Bad data: the most common reason ML fails
**Time:** ~1.5 hours

### Review (15 min)
Redo yesterday's k-NN prediction for a 65 m² flat by hand (k = 3). Then say in one sentence what the line's θ₁ means.

:::hint
The three sizes closest to 65 are 60 and 70 (both 5 away) and 55 (10 away).
:::

**Check:** (1.6 + 1.9 + 1.5) ÷ 3 = **₦1.67m**. θ₁ is how much the yearly rent rises for each extra square metre (about ₦25,100).

### Lesson (30 min)
Géron's summary is short: two things can go wrong, **bad data** and **a bad model**. Today is bad data, and it's the one that hurts most in real life. "Garbage in, garbage out."

**1. Not enough data.** A child sees three apples and knows "apple" forever. Most ML methods need thousands of examples, and millions for things like speech. A famous 2001 study found that very different methods all became about equally good once they had enough data (p. 31): data often matters more than a clever algorithm.

**2. Data that doesn't represent the cases you care about.** Imagine predicting a Nigerian election by polling only people on X (Twitter). Millions of answers, but they're mostly young, urban and online, so the prediction can be badly wrong. That's **sampling bias**: the *way* you collected the data skews it, however much you collect. Géron's story: in 1936 an American magazine polled 2.4 million people and predicted the wrong winner (pp. 32–33). Small samples have a related problem, **sampling noise**: by pure chance, the few examples you have aren't typical.

**3. Dirty data.** Typos, missing values, impossible numbers. In a rentals spreadsheet: "Lekki", "lekki", "Leki" and "LEKKI" are the same place; one row says the rent is ₦5 (someone forgot the zeros); twelve rows have no size. You must decide: fix it, drop it, or fill it in (for example with the **median**, the middle value). Data scientists spend a big share of their time on exactly this.

**4. Irrelevant features.** If you predict rent from the colour of the front door, the model may "find" a pattern that's pure coincidence. Choosing and making good features is called **feature engineering**:
- **feature selection:** keep the useful columns;
- **feature extraction:** combine columns into a better one (age + mileage → wear and tear);
- **creating new features:** collect new data (distance to the nearest BRT stop).

**Now read** Géron **pp. 30–34** (from "Main Challenges of Machine Learning" to "Irrelevant Features").

### Practice (30 min)
Clean a messy table of Lekki, Yaba and Ikeja rentals: count what's missing, fix the area names, remove impossible rents, then fill missing sizes twice: with the overall median, and with each area's own median. Compare the two: which guess would you trust for a Yaba flat?

::sandbox ml-w01-d4-clean

### Mini-Task
Name the data problem in each case (not enough data · sampling bias · sampling noise · dirty data · irrelevant feature):
1. A model predicting pass rates for all Nigerian schools was trained only on private schools in Lagos.
2. A house-price model uses "the agent's star sign" as a feature.
3. 40% of the rows in a sales file have the date written as "yesterday".
4. A model trained on 12 examples gives wildly different answers every time a new example is added.

**Check:** 1. sampling bias (the sample doesn't represent all schools) · 2. irrelevant feature · 3. dirty data · 4. not enough data (and sampling noise: 12 examples are rarely typical).

### Log (5 min)
Think of a dataset at your job (or one you'd like to use). What's most likely to be wrong with it?

## Day 5 — Friday
**Topic:** Overfitting and underfitting: too clever vs too simple
**Time:** ~1.5 hours

### Review (15 min)
From memory, list the four kinds of bad data with one example each. Then: why does a huge sample not protect you from sampling bias?

### Lesson (30 min)
**The picture: two students and WAEC maths.**
Bisi memorises every past question and its answer, word for word. Tunde learns *why* each method works. In the mock exam (the past questions themselves) Bisi scores 100% and Tunde 85%. In the real exam the examiner changes the numbers and the wording: Bisi drops to 40%, Tunde scores 82%.

Bisi learned the examples **too exactly**, including their accidents (the exact numbers), so she couldn't handle new questions.

> **Overfitting:** the model does brilliantly on the data it learned from and badly on new data. It learned the noise along with the pattern.
> **Underfitting:** the opposite. The model is too simple to catch even the real pattern (a student who only read the summary does badly on both the mock and the real exam).

**By hand.** Five Surulere flats (size m² → rent ₦m/yr): 50 → 1.4, 65 → 1.9, 80 → 2.0, 95 → 2.7, 110 → 2.9.
- A **straight line** through them misses each flat by about ₦96,000 on average.
- A **wiggly curve** (a degree-4 polynomial) can pass *exactly* through all five: error ₦0. Perfect!
- Now five *new* flats arrive. The straight line misses them by about ₦38,000 on average; the wiggly curve misses them by about ₦266,000, seven times worse. Ask the curve about a 130 m² flat and it says the rent is **minus ₦3.4 million**. It memorised the five flats, not the pattern.

**Why it happens.** The model is too complex for how little (and how noisy) the data is. With lots of features and few examples, a model can even find nonsense patterns: Géron's example is a model noticing that countries with a "w" in their name are happier (p. 34).

**Fixes for overfitting:**
1. **A simpler model** (a line instead of a wiggly curve, or fewer features);
2. **More data;**
3. **Less noise** (fix errors, remove outliers).

**Regularization** = forcing a model to stay simpler. Picture telling the student: "explain it in three sentences, not thirty". For the line, it might mean "you may tilt the line, but only a little" (keep θ₁ small). How *much* to restrain it is set by a **hyperparameter**: a setting of the *learning method* that you choose **before** training, unlike the **parameters** (θ₀, θ₁), which training finds by itself.

**Fixes for underfitting:** a more powerful model, better features, or less regularization.

**Now read** Géron **pp. 34–37** ("Overfitting the Training Data", "Underfitting the Training Data", "Stepping Back"). Then **watch** StatQuest's *Bias and Variance*: "high variance" is overfitting, "high bias" is underfitting.

### Practice (30 min)
Fit a straight line and a degree-4 curve to the five Surulere flats with numpy, compare their errors on the training flats and on five new flats, and catch the curve predicting negative rent. (The first run downloads numpy, about 3 MB.)

::sandbox ml-w01-d5-overfit

### Mini-Task
Overfitting or underfitting? What would you try first?
1. 99% accuracy on the training data, 61% on new data.
2. 55% on the training data and 54% on new data, for a problem where people manage 90%.
3. A house-price model with 200 features trained on 150 houses.

**Check:** 1. overfitting: simplify the model, get more data, or regularize · 2. underfitting: a more powerful model or better features · 3. very likely to overfit (more features than examples): use fewer features, regularize, or get more houses.

### Log (5 min)
Explain overfitting with your own example from outside school (sport, cooking, work).

## Day 6 — Saturday
**Topic:** Project day: testing, validating, and an honest score
**Time:** ~2.5 hours

### Review (30 min)
Answer out loud, then check yourself against this week's lessons:
- What's the difference between a model's parameters and a learning algorithm's hyperparameters?
- What does regularization do, and when would you turn it up?

### Lesson (30 min)
**The question:** how do you know your model will do well on flats it has never seen?

**1. Hide some data: the test set.** Put 20% of your examples in a drawer before you start (the **test set**) and train only on the other 80% (the **training set**). At the end, measure the error on the test set: that's your honest estimate of how the model will do on new cases (Géron: the *generalization error*). Low training error + high test error = overfitting.

**2. Don't peek, even by choosing.** Say you try 100 settings and keep whichever does best *on the test set*. You've now tuned the model to that particular test set, so its score flatters you; in real use it does worse. Using the test set to choose is like the exam leaking: the score no longer means anything.

**3. The fix: a validation set.** Split three ways:
- **training set:** the model learns from it;
- **validation set:** you compare candidate models and settings on it, and pick the best;
- **test set:** used **once**, at the very end, for the honest score.
After choosing, Géron's recipe is to train the chosen model again on training + validation together, then test once.

**4. Cross-validation.** One small validation set can be unlucky. **Cross-validation** rotates: split the data into several parts, let each part take a turn as the validation set, and average the scores. Fairer, but you train several times, so it takes longer.

**5. No Free Lunch.** No model is best for every problem. A straight line assumes the world is straight; a big neural network assumes something else. You can only find the right model by trying a few sensible ones and validating them, which is exactly today's project.

**Now read** Géron **pp. 37–40** ("Testing and Validating", "No Free Lunch Theorem", "Exercises"). Then **watch** StatQuest's *Cross Validation*.

### Weekly Project (1 hour 30 min)
**Pick a model the honest way.** 30 Yaba flats, already shuffled. You'll split them into train, validation and test sets, try curves of degree 1 to 5, choose by validation error, and test once at the very end. You'll see training error keep falling as the curves get wigglier while validation error goes the other way, and the plain straight line win.

::sandbox ml-w01-d6-split

Then answer Géron's **19 exercises on pp. 39–40** in your own words, in your notebook (two or three sentences each). Your copy has no Appendix A with the answers, so check yourself against this week's lessons; the ones you can't answer are next week's review.

### Log (10 min)
Write the three ideas from this week you'd teach a friend first, and the one that still feels foggy.

## Quiz
1. In one sentence, what is machine learning, and how is it different from writing rules?
2. What's the difference between a feature and a label? Give an example from house prices.
3. What are the two most common supervised tasks, and how do you tell them apart?
4. Name four unsupervised tasks.
5. What kind of learning would you use to teach a robot to walk on rough ground, and why?
6. What's the difference between batch and online learning? When would online learning be dangerous?
7. Compare instance-based and model-based learning with an example.
8. Name four ways the data can be bad.
9. A model scores 99% on its training data and 60% on new data. What's happening, and name three fixes.
10. What's the difference between a parameter and a hyperparameter?
11. Why do you need a validation set as well as a test set?
12. What is cross-validation, and what does it cost?
