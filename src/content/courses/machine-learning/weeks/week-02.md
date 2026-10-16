# Week 2 — A Real Project I: Look Before You Model
**Theme:** Start a real project the way professionals do: understand the problem, choose how to measure success, look hard at the data, lock away a test set, and explore, all before training a single model. Your data: 3,000 Lagos property listings.
**Big question:** *What do you need to know about a problem and its data before you're allowed to build a model?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📕 | Géron, *Hands-On Machine Learning*, Chapter 2 (pp. 41–68) | The pages listed in each day's lesson, after the plain-words explanation. Géron uses California housing; you'll do the same steps on Lagos. |
| 📺 | [StatQuest: Linear Regression, Clearly Explained](https://www.youtube.com/watch?v=nk2CQITm_eo) | Watch on Day 2: it shows why squaring errors makes sense. |
| 🌐 | [Kaggle: Pandas (free course)](https://www.kaggle.com/learn/pandas) | Optional, from Day 3: the first two lessons, if pandas feels new. |
| 🌐 | [Géron's notebook for Chapter 2](https://github.com/ageron/handson-ml2) | Optional: `02_end_to_end_machine_learning_project.ipynb` has every line of his California code. |

## Day 1 — Monday
**Topic:** Frame the problem before you touch the data
**Time:** ~1.5 hours

### Review (15 min)
From memory, in your notebook: the three sets (training, validation, test) and what each is for. Then: what's the difference between overfitting and underfitting? One everyday example each.

### Lesson (30 min)
**Your new job.** You've just joined **Ìlé Homes**, a Lagos property company. Your manager says: "Build a model that predicts the price of a property from its details." Before writing a line of code, a good data scientist asks questions.

**Question 1: What will the model's answer be used for?**
Building a model is never the goal by itself. Your manager explains: your price prediction will feed **another system**, which flags listings that look underpriced (bargains to buy) or overpriced (to warn buyers). That decides everything else: how accurate you must be, how to measure it, how much effort to spend.

**Picture: a garri processing line.** Peel → grate → press → fry → bag. Each stage takes what the stage before produced, does one job, and hands it on. That's a **pipeline**. It's robust (if the frier breaks, yesterday's pressed cassava can wait), but a broken stage can go unnoticed for days if nobody watches, and the bags slowly go bad. Data pipelines are the same: your model is one stage between "collect listings" and "flag bargains", so it must be **monitored**.

**Question 2: How is it done today?**
Today, agents estimate prices by experience. When the real sale price is later known, their estimates are often off by more than 20%. That's your **reference performance**: the number your model has to beat to be worth anything.

**Question 3: What kind of ML problem is it?** (Day 2 of last week, applied.)
- **Supervised:** every listing comes with its real price (the label).
- **Regression:** the answer is a number (₦ millions).
- **Multiple regression:** it uses several features (size, area, bedrooms…).
- **Univariate:** it predicts one value per listing (a price). Predicting price *and* days-to-sell together would be *multivariate*.
- **Batch learning:** the data doesn't stream in, and 3,000 rows fit in memory easily. Train once, retrain monthly.

**Question 4: Check the assumptions.** What if the next system doesn't actually use the price, and only needs "cheap / fair / expensive"? Then it's a **classification** problem, not regression, and months of work would be wasted. Géron's advice: ask early. (At Ìlé Homes, the next system really does need the price.)

**Now read** Géron **pp. 41–45** ("Working with Real Data", "Look at the Big Picture", "Frame the Problem"). Géron's company is "Machine Learning Housing Corporation", in California; the questions are exactly the ones above.

### Practice (30 min)
Write the framing as data, then measure the agents' reference performance on ten real sales.

::sandbox ml-w02-d1-frame

### Mini-Task
Frame this problem in five lines (supervised or not · regression or classification · single or multiple features · univariate or multivariate · batch or online): *a ride-hailing company in Abuja wants to predict how many minutes a driver will take to reach the customer, using distance, time of day, and traffic reports that update every minute.*

**Check:** supervised (past trips have the real arrival times) · regression (minutes) · multiple regression (several features) · univariate (one value: minutes) · online is worth considering (traffic data streams in and changes fast); a model retrained nightly in batches could also work if it's fed live traffic as a feature.

### Log (5 min)
What question would you ask your manager first on a real project, and why?

## Day 2 — Tuesday
**Topic:** How wrong is wrong? RMSE and MAE
**Time:** ~1.5 hours

### Review (15 min)
Explain to an imaginary colleague why Ìlé Homes' model is "supervised, multiple, univariate regression, batch". One sentence for each word.

### Lesson (30 min)
**The problem.** Your model predicts prices; some predictions are a bit off, some are way off. You need **one number** that says how wrong it is overall: the **performance measure** (for regression, Géron uses a *cost function*: lower is better).

**By hand: three Lekki listings (₦ millions).**

| listing | real price | predicted | error (predicted − real) |
|---|---|---|---|
| 1 | 45 | 50 | +5 |
| 2 | 120 | 100 | −20 |
| 3 | 60 | 63 | +3 |

**Measure 1: Mean Absolute Error (MAE).** Ignore the signs, then average:
(5 + 20 + 3) ÷ 3 = **₦9.33m**. "On average, the model is about ₦9m off."

**Measure 2: Root Mean Square Error (RMSE).** Square each error, average the squares, then take the square root (to get back to naira):
- squares: 25, 400, 9 → average: 434 ÷ 3 = 144.67 → square root: **₦12.03m**.

Why is RMSE bigger? **Squaring punishes big mistakes.** The ₦20m miss became 400, dwarfing the others. RMSE says: "I care a lot about the big misses." MAE treats every naira of error the same.

> **Which one?** RMSE is the usual choice for regression. If your data has many **outliers** (a few crazy prices you can't trust), MAE is calmer, because a single huge error can't dominate it.

**The notation (read it once, then relax).** Géron's formula on p. 45 looks scary but says exactly what you just did:
- **m**: how many examples (here 3);
- **x⁽ⁱ⁾**: the features of the i-th listing; **y⁽ⁱ⁾**: its real price (label);
- **h**: your model (Géron calls it the *hypothesis*); **ŷ⁽ⁱ⁾ = h(x⁽ⁱ⁾)** ("y-hat"): its prediction;
- **RMSE** = √( (1/m) × Σ (ŷ⁽ⁱ⁾ − y⁽ⁱ⁾)² ): Σ means "add up over all i".
- **X** (capital, bold): the whole table of features, one row per listing.

**Now read** Géron **pp. 45–48** ("Select a Performance Measure", "Check the Assumptions"). The part about norms (ℓ₁, ℓ₂, ℓₖ) is **optional**: the takeaway is only "RMSE cares more about big errors than MAE does".

### Practice (30 min)
Write RMSE and MAE yourself, check them on the three listings, then add one wildly wrong prediction and watch which measure jumps more.

::sandbox ml-w02-d2-metrics

### Mini-Task
By hand: real prices 30, 40, 50; predictions 30, 40, 80. Compute MAE and RMSE. Which one would you show a manager who's worried about the occasional disaster?

:::hint
The errors are 0, 0 and 30.
:::

**Check:** MAE = 30 ÷ 3 = **10**. RMSE = √(900 ÷ 3) = √300 ≈ **17.3**. Show RMSE: it reflects the one disaster much more strongly.

### Log (5 min)
Explain RMSE vs MAE without any formula.

## Day 3 — Wednesday
**Topic:** First look at the data with pandas
**Time:** ~1.5 hours

### Review (15 min)
Redo yesterday's three-listing RMSE on paper without looking. Then say why RMSE ≥ MAE always.

### Lesson (30 min)
**pandas in one picture: a spreadsheet you control with code.** A **DataFrame** is a table: rows are listings, columns are features. You'll use six commands constantly:

| Command | What it shows | Excel equivalent |
|---|---|---|
| `pd.read_csv("lagos_housing.csv")` | loads the file into a DataFrame | File → Open |
| `df.head()` | the first 5 rows | scrolling to the top |
| `df.info()` | every column, its type, and how many **non-missing** values | checking for blanks |
| `df["area"].value_counts()` | how many times each value appears | a PivotTable count |
| `df.describe()` | count, mean, std, min, quartiles, max of each number column | a summary sheet |
| `df.hist()` | a histogram of every number column | a chart |

**What you'll find in the Lagos data** (this is the point: look before you model):
1. **3,000 listings, 13 columns.** Most are numbers; `area`, `property_type` and `serviced` are text (*categories*).
2. **Missing values:** `size_sqm` has only 2,940 non-missing (60 missing) and `bathrooms` 2,975 (25 missing). You'll fix these next week.
3. **One area, many spellings:** `value_counts()` shows 20 "areas", but Lagos only has 12 here: "Lekki Phase 1", "lekki phase 1" and "Lekki Ph 1" are one place. One spelling is "Ajah " with a trailing space: it *looks* identical to "Ajah" in the list. That's dirty data (Week 1, Day 4), caught by looking.
4. **A capped label.** The price histogram has a spike at exactly ₦500m: 127 listings. Whoever collected the data recorded anything above ₦500m as 500. Géron's California data has the same problem at $500,000 (p. 56). Your model could learn that "nothing costs more than ₦500m". You'd ask the data team: do we need precise prices above ₦500m? If yes, get the true prices or drop those listings (from training *and* testing).
5. **Long tails.** Most prices are below ₦170m (the 75th percentile), but a few go far higher: the histogram has a long right tail. Some algorithms struggle with that; you'll learn to transform it later.
6. **Suspicious sizes.** The biggest `size_sqm` is 2,320 m², more like a hotel than a house. Probably someone added a zero.

**Reading `describe()`.** The **std** (standard deviation) says how spread out the values are. The **25%, 50%, 75%** rows are *percentiles*: 25% of listings cost less than the 25% value, and so on. The **50%** row is the **median**: half the listings cost less (₦75.2m), half more. The **mean** (₦128.0m) is much higher than the median because of the expensive tail: a few ₦400m Ikoyi homes pull the average up.

**Now read** Géron **pp. 48–57** ("Get the Data" to just before "Create a Test Set"). The installation pages (48–51) are **optional**: the sandbox already has pandas. If you also want to work on your own computer, follow them, or use the `.venv` you already have.

### Practice (30 min)
Load the Lagos listings and answer six questions about them with pandas, then draw the price histogram. (First run: the data-science libraries download once.)

::sandbox ml-w02-d3-look

### Mini-Task
In your notebook, write three things you'd ask Ìlé Homes' data team after today's first look, and why each matters for the model.

**Check:** For example: (1) Do you need prices above ₦500m, since they're capped? (2) Why are 60 sizes missing: not measured, or lost? (3) Who types the area names, and can the form use a dropdown instead of free text? Each one changes how you clean the data or what the model can learn.

### Log (5 min)
Which of the six findings surprised you most?

## Day 4 — Thursday
**Topic:** Lock away a test set, and keep it fair
**Time:** ~1.5 hours

### Review (15 min)
Without looking: how many listings are there, which two columns have missing values, and why is the mean price so much higher than the median?

### Lesson (30 min)
**The rule: set the test set aside now, before exploring further.** Your brain is a pattern-detecting machine, which means it overfits too. If you study the test set, you'll spot patterns in it and choose your model to suit them, and your final test score will be too optimistic. Géron calls this **data snooping bias**.

**1. A random split.** Shuffle the listings and put 20% (600) in the test set, 80% (2,400) in training. `train_test_split(df, test_size=0.2, random_state=42)` does exactly that. The **random_state** fixes the shuffle, so you get the same split every time you run it. (Why 42? No reason, it's a joke from *The Hitchhiker's Guide to the Galaxy*.)

**2. A split that survives new data.** If new listings are added next month and you reshuffle, some old test listings land in training: over time the model "sees" the whole test set. A fix: decide test or train from each listing's **ID** (with a hash function, a scrambling formula that turns the ID into a number). The same ID always lands on the same side, whatever else changes. On our IDs, this puts 601 listings in the test set.

**3. A fair split: stratified sampling.** Picture surveying 1,000 Nigerians about fuel prices. If you pick purely at random, you might by chance get too few people from the North, and your results tilt. A careful pollster picks the *right number from each region* (each **stratum**). That's **stratified sampling**.

For houses, bedrooms matter a lot for price, so the test set should have the same mix of 1-, 2-, 3-, 4- and 5+-bedroom homes as the whole data:

| bedrooms | whole data | random test set | stratified test set |
|---|---|---|---|
| 1 | 17.9% | 19.3% | 17.8% |
| 5+ | 10.4% | **8.7%** | 10.3% |

The random test set has **16% too few** 5-bedroom homes. A test set like that scores the model mostly on smaller homes. The stratified one is off by less than 1% in every group. Géron does the same with income categories (pp. 59–61).

**Now read** Géron **pp. 57–61** ("Create a Test Set"). Skim the hashing code on p. 58; the idea matters more than the details.

### Practice (30 min)
Split the Lagos data three ways (random, by ID hash, stratified by bedrooms) and measure which one keeps the bedroom mix honest.

::sandbox ml-w02-d4-split

### Mini-Task
You're predicting student exam scores across Nigeria's 36 states + FCT, and the state matters a lot. Your data has 400 students from Lagos and only 6 from Kebbi. What could go wrong with a random 20% test set, and what would you do?

**Check:** By chance, Kebbi (and other small states) might get 0 or 1 students in the test set, so you can't tell how the model does there. Stratify by state (or by region if some states are too small to split), so every group is represented in the right proportion.

### Log (5 min)
Explain data snooping bias with an everyday example.

## Day 5 — Friday
**Topic:** Explore: maps, correlations and new features
**Time:** ~1.5 hours

### Review (15 min)
From memory: why does a purely random test set risk sampling bias, and what does stratifying by bedrooms fix?

### Lesson (30 min)
From now on, explore only the **training set** (the test set stays locked).

**1. Draw the map.** Each listing has a latitude and longitude. Plot them as dots and you get a rough map of Lagos: a dense cluster on the Island (Ikoyi, VI, Lekki), Mainland clusters (Yaba, Surulere, Gbagada, Ikeja), and outliers east (Ajah) and north (Ikorodu). Colour the dots by price and the pattern jumps out: the Island glows expensive. Géron's California map shows the same thing: the coast is expensive (pp. 62–64). Tip from Géron: make the dots slightly see-through (`alpha=0.4`) so crowded areas show up.

**2. Correlation: does one number move with another?** The **correlation coefficient** (Pearson's r) runs from **−1 to +1**:
- **close to +1:** when one goes up, the other goes up (size and price);
- **close to −1:** when one goes up, the other goes down;
- **close to 0:** no *straight-line* relationship.

On the Lagos training set, correlation with price: `size_sqm` **0.65**, `bedrooms` 0.64, `bathrooms` 0.58, `latitude` **−0.26** (going north, away from the Island, prices tend to drop), `building_age` −0.09 (older is slightly cheaper).

Two warnings from p. 65:
- correlation only sees **straight-line** relationships; a U-shape can score 0;
- correlation is **not the slope**: your height in metres and in centimetres correlate perfectly (r = 1), however steep the line.

**3. Try combining features.** Géron finds that "rooms per household" predicts better than total rooms. Try your own:
- **size per bedroom** (roomier homes?): correlation with price **0.30**. Worse than plain size (0.65): this one doesn't help.
- **distance to Ikoyi in km** (a location feature from latitude and longitude): **−0.44**. Much stronger than raw latitude (−0.26): this one does.
That's the honest lesson: **test a combination, don't assume it helps.**

**Now read** Géron **pp. 61–68** ("Discover and Visualize the Data to Gain Insights", to just before "Prepare the Data"). Skip the matplotlib options you don't need; notice the reasoning.

### Practice (30 min)
Explore the training set: draw the price map, compute correlations, and test two new features.

::sandbox ml-w02-d5-explore

### Mini-Task
Correlation or not? For each pair, guess the sign (+, −, or about 0) and give a reason: (1) a car's age and its price · (2) a flat's floor number and its price, in a building with no lift · (3) shoe size and IQ.

**Check:** (1) negative: older cars are cheaper · (2) probably negative in a building with no lift (stairs!), though views could push the other way: that's why you measure · (3) about 0: no real relationship.

### Log (5 min)
What does a correlation of −0.44 between distance to Ikoyi and price mean, in plain words?

## Day 6 — Saturday
**Topic:** Project day: the first-look report
**Time:** ~2.5 hours

### Review (30 min)
Explain this week's whole process to someone who's never heard of ML, in the right order: frame the problem → choose a measure → first look → lock away a test set → explore. Two sentences per step.

### Weekly Project (1 hour 30 min)
**Write Ìlé Homes' first-look report.** Clean the area names, then produce the numbers a manager would want: median price per area, per property type, how many prices are capped, which sizes look like typos. Then write five findings and three questions in plain English.

::sandbox ml-w02-d6-report

Then write your **report** in your notebook (or a document you keep):
1. Five findings, each with its number (e.g. "Ikoyi's median price is ₦328.6m, about 20 times Ikorodu's ₦16.8m").
2. Three data problems and how you'd handle each.
3. Three questions for the data team.

### Log (10 min)
What would you look at next if you had one more day with this data?

## Quiz
1. Why do you ask what a model's output will be used for before building it?
2. What is a reference performance, and why does it matter?
3. Frame the Ìlé Homes problem in five words or phrases.
4. Compute MAE and RMSE for errors of 3, −4 and 0.
5. Why is RMSE more sensitive to big errors than MAE?
6. What do `info()`, `describe()` and `value_counts()` each show?
7. Why is the median price lower than the mean price in the Lagos data?
8. What is data snooping bias, and how do you avoid it?
9. Why might a purely random split give a biased test set? What does stratified sampling do?
10. What does a correlation of 0.65 between size and price mean? What can't correlation see?
11. Give one example of a combined feature that helped and one that didn't, and what that teaches you.
12. Name three data problems you found in the Lagos listings this week.
