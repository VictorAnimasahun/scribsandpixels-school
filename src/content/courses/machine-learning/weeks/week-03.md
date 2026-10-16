# Week 3 — A Real Project II: Prepare, Train, Tune
**Theme:** Turn the messy Lagos listings into numbers a model can learn from, train three kinds of model, compare them fairly with cross-validation, tune the best one, and test it once. By Saturday you'll have a model that beats Ìlé Homes' agents.
**Big question:** *How do you go from a raw spreadsheet to a model you can trust, step by step?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📕 | Géron, *Hands-On Machine Learning*, Chapter 2 (pp. 68–88) | The pages in each day's lesson, after the plain-words explanation. |
| 📺 | [StatQuest: Cross Validation](https://www.youtube.com/watch?v=fSytzGwwBVw) | Rewatch on Day 4: now you'll use it for real. |
| 🌐 | [Kaggle: Intro to Machine Learning](https://www.kaggle.com/learn/intro-to-machine-learning) | Optional: lessons 2–6 do the same steps on Melbourne house prices. |
| 🌐 | [Géron's notebook for Chapter 2](https://github.com/ageron/handson-ml2) | Optional: the full California code to compare with yours. |

## Day 1 — Monday
**Topic:** Clean the data: fill the gaps, and meet scikit-learn's design
**Time:** ~1.5 hours

### Review (15 min)
From memory: the five steps from last week (frame → measure → first look → lock away the test set → explore). Then: which two columns of the Lagos data have missing values, and roughly how many?

### Lesson (30 min)
**First, separate the question from the answer.** Take the training set and split it in two: the **features** (everything you know about a listing) and the **labels** (the prices). You do this because you'll transform the features (fill gaps, encode text, scale) but never the labels.

**Missing values: three choices** (Géron p. 69). In the Lagos training set, 43 listings have no size and 23 no bathroom count.
1. **Drop those listings.** Easy, but you lose data, and next month's new listing with a missing size can't be priced at all.
2. **Drop the whole column.** You'd lose `size_sqm`, the most useful feature (Week 2: correlation 0.65). Bad idea here.
3. **Fill the gap** with a sensible value, usually the **median** of that column. For `size_sqm` in the training set, that's **159 m²**.

**The trap: whose median?** Compute it on the **training set only**, then **save it**, and use that same number to fill gaps in the test set and in tomorrow's new listings. Computing a fresh median on the test set would let test information leak into your preparation.

**scikit-learn does this for you: `SimpleImputer`.** And it shows the design every scikit-learn tool shares (pp. 70–71). Learn these three words once and the whole library makes sense:
- **Estimator:** anything that learns something from data with **`.fit(data)`**. The imputer *learns* the medians.
- **Transformer:** an estimator that can also change data with **`.transform(data)`**. The imputer *fills* the gaps with the medians it learned. `.fit_transform()` does both at once.
- **Predictor:** an estimator that can **`.predict(new_data)`**, like the linear regression from Week 1's playground.

Two naming rules that help you read any scikit-learn code:
- **Hyperparameters** are settings you give when creating it: `SimpleImputer(strategy="median")`.
- **Learned values** end with an underscore: `imputer.statistics_` holds the medians it learned.

**Now read** Géron **pp. 68–71** ("Prepare the Data for Machine Learning Algorithms", "Data Cleaning", "Scikit-Learn Design").

### Practice (30 min)
Split off the labels, fix the area spellings, then fill the gaps with `SimpleImputer` and read back what it learned.

::sandbox ml-w03-d1-clean

### Mini-Task
For each tool, write *estimator*, *transformer* and/or *predictor*: (1) `SimpleImputer` · (2) `LinearRegression` · (3) `StandardScaler` (tomorrow's scaler, which learns each column's mean and spread, then rescales).

**Check:** (1) estimator + transformer (learns medians, fills gaps) · (2) estimator + predictor (learns θs, predicts prices) · (3) estimator + transformer (learns means and spreads, rescales).

### Log (5 min)
Why must the median that fills the test set come from the training set?

## Day 2 — Tuesday
**Topic:** Turn text into numbers: one-hot encoding and your own transformer
**Time:** ~1.5 hours

### Review (15 min)
Explain *estimator*, *transformer*, *predictor* and the underscore rule to an imaginary classmate, with one example each.

### Lesson (30 min)
Models need numbers. Three Lagos columns are text: `area`, `property_type`, `serviced`.

**The tempting mistake: number them.** Alphabetically, the cleaned areas are Ajah 0, Festac 1, Gbagada 2, Ikeja GRA 3, Ikorodu 4, Ikoyi 5, … A model sees 4 and 5 as *close*, so it treats Ikorodu as nearly the same as Ikoyi, when their median prices are ₦16.8m and ₦328.6m. Numbering only makes sense when the categories really have an order: "bad, average, good, excellent" (Géron's `OrdinalEncoder`, p. 72).

**The fix: one-hot encoding.** One yes/no column per category. A listing in Yaba gets a 1 in the `area_Yaba` column and 0 everywhere else:

| | area_Ajah | … | area_Ikoyi | … | area_Yaba |
|---|---|---|---|---|---|
| a Yaba flat | 0 | … | 0 | … | **1** |
| an Ikoyi duplex | 0 | … | **1** | … | 0 |

"One-hot" because exactly one column is "hot" (1). Now no area is "close" to another by accident. 12 areas become 12 columns; 6 property types, 6 more; `serviced` (yes/no), 2. scikit-learn's **`OneHotEncoder`** does it, and stores the result compactly (a *sparse matrix*: only the 1s are kept, since most entries are 0).

When a category has thousands of values (every street in Lagos), one-hot makes thousands of columns. Then Géron suggests replacing it with useful numbers instead, like you did with distance to Ikoyi (p. 73).

**Your own transformer.** scikit-learn can't know your area spellings or that distance to Ikoyi matters. So write your own transformer: a small class with `fit` (which returns `self`) and `transform`. Inherit from `BaseEstimator` and `TransformerMixin` and you get `fit_transform` for free, plus the ability to plug into pipelines tomorrow:

```python
class AddDistance(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self                     # nothing to learn
    def transform(self, X):
        X = X.copy()
        X["km_to_ikoyi"] = ...          # Week 2's formula
        return X
```

**Now read** Géron **pp. 71–74** ("Handling Text and Categorical Attributes", "Custom Transformers").

### Practice (30 min)
See why numbering areas misleads, one-hot encode them, then write two transformers of your own: one cleans area names, one adds distance to Ikoyi.

::sandbox ml-w03-d2-encode

### Mini-Task
Ordinal (numbers in order) or one-hot? (1) a house's condition: poor / fair / good / excellent · (2) the LGA a house is in · (3) a phone's brand · (4) T-shirt size S / M / L / XL.

**Check:** (1) ordinal: there's a real order · (2) one-hot (or replace it with numbers like distance, if there are many) · (3) one-hot · (4) ordinal.

### Log (5 min)
Explain one-hot encoding with an example from outside housing.

## Day 3 — Wednesday
**Topic:** Feature scaling and pipelines
**Time:** ~1.5 hours

### Review (15 min)
By hand: one-hot encode `serviced` for three listings: yes, no, yes. How many columns, and what's in each?

**Check:** two columns (`serviced_no`, `serviced_yes`): rows (0, 1), (1, 0), (0, 1).

### Lesson (30 min)
**The problem: wildly different scales.** `size_sqm` runs from 22 to over 2,000; `bedrooms` from 1 to 6; `latitude` barely moves (6.41 to 6.67). Many algorithms (linear models, k-NN, neural networks) are thrown off when one column's numbers are thousands of times bigger than another's: the big column shouts and the small ones whisper.

**Two cures** (pp. 74–75):

**1. Min-max scaling** ("normalization"): squeeze each column into 0–1. value → (value − min) ÷ (max − min).
- The catch, with your own data: the size typo of **2,320 m²** becomes 1, and squashes everything else down. After min-max scaling, **97% of all sizes land below 0.2**, and the median size becomes just 0.06. One typo flattens the whole column.

**2. Standardization**: subtract the mean, divide by the standard deviation. Values end up centred on 0, with most between about −2 and 2, and no fixed range.
- One outlier moves the mean and spread a little, but doesn't crush everyone else. scikit-learn: **`StandardScaler`**.

As always, the scaler learns its numbers (min/max, or mean/spread) on the **training set only**.

**Pipelines: the garri line in code.** You now have several steps that must run in the same order every time: clean areas → add distance → fill gaps → scale numbers → one-hot the text. Doing them by hand invites mistakes (forget one step on the test set and the results are garbage). A **`Pipeline`** chains the steps; calling `.fit()` runs them all in order, and `.transform()` applies the identical steps to new data.

Numbers and text need different treatment, so a **`ColumnTransformer`** sends each group of columns to its own mini-pipeline and glues the results back together:
- number columns → impute → scale;
- text columns → one-hot.

For the Lagos data, the result is a table of **29 columns**: 9 numbers (including distance to Ikoyi) + 12 areas + 6 property types + 2 for serviced.

**Now read** Géron **pp. 74–77** ("Feature Scaling", "Transformation Pipelines").

### Practice (30 min)
See the typo crush min-max scaling, then build the full preparation pipeline and check it produces 2,400 rows × 29 columns.

::sandbox ml-w03-d3-pipeline

### Mini-Task
Explain to a non-technical friend, using the garri line, why a pipeline makes a model safer in production.

**Check:** For example: a pipeline guarantees that tomorrow's listing goes through exactly the same steps, in the same order, with the same saved numbers (medians, means) as the training data, just as every tuber goes through the same peel → grate → press → fry. Skip a step for one batch and the result is spoiled, and you might not notice.

### Log (5 min)
Min-max or standardization for a column with a few typos, and why?

## Day 4 — Thursday
**Topic:** Train models and compare them fairly with cross-validation
**Time:** ~1.5 hours

### Review (15 min)
Draw the Lagos pipeline as boxes and arrows on paper, from raw listing to 29 numbers. Label which steps *learn* something from the training set.

### Lesson (30 min)
Finally, models. Three contenders:

**1. Linear regression.** RMSE on the training set: **₦46.6m**. For listings whose median price is ₦75m, that's a big error. It does about as badly on data it learned from as on new data: a sign of **underfitting** (Week 1): a straight-line model is too simple for Lagos prices.

**2. A decision tree** (a model that asks yes/no questions like "is it in Ikoyi? is it over 300 m²?"; you'll study it properly in Week 6). Training RMSE: **₦0**. Perfect! Too perfect: Week 1 taught you what zero training error usually means. It memorised the training listings.

**How do you know without touching the test set? Cross-validation** (p. 78). Split the training set into 5 parts (*folds*). Train on 4, measure on the 5th; repeat 5 times so every fold takes a turn; look at the 5 scores. You get an honest estimate, plus how much it wobbles (the standard deviation).

| Model | RMSE on its own training data | Cross-validated RMSE (5 folds) |
|---|---|---|
| Linear regression | ₦46.6m | ₦47.3m (± 4.0) |
| Decision tree | ₦0 | about ₦46m (± 2.6)\* |
| **Random forest** | — | **₦35.3m** (± 1.9) |

\*A single tree's score shifts a little from computer to computer (₦45.7m on a laptop, ₦46.5m in the browser sandbox): when two questions split the data equally well, the tie can be broken differently. A forest averages many trees, so its score barely moves.

The tree's honest score is nothing like its perfect training score: it's **overfitting**. (In Géron's California data the tree did *worse* than the linear model; on your data it's slightly better, but nowhere near perfect.)

**3. A random forest:** many decision trees, each trained on a random part of the data, averaging their answers (Week 6 explains why that works). Cross-validated RMSE: **₦35.3m**, clearly the best.

**A scikit-learn quirk to know:** `cross_val_score` wants a *score* (higher = better), so for errors it returns the **negative** MSE. That's why the code says `np.sqrt(-scores)` (p. 79).

**Now read** Géron **pp. 77–81** ("Select and Train a Model", "Training and Evaluating on the Training Set", "Better Evaluation Using Cross-Validation").

### Practice (30 min)
Train all three models on the prepared Lagos data, see the tree's "perfect" training score, then expose it with cross-validation.

::sandbox ml-w03-d4-train

### Mini-Task
A model's 5 cross-validation RMSEs are 30, 31, 29, 30 and 80. What would you do before trusting its average?

**Check:** Look at the fold that scored 80: something unusual is in it (outliers, a group of listings the model never learned, or a data problem). The average (40) hides it, and the high standard deviation warns you. Investigate that fold before believing any single number.

### Log (5 min)
In your own words: why can't you trust a model's score on its own training data?

## Day 5 — Friday
**Topic:** Fine-tune, then the one honest test
**Time:** ~1.5 hours

### Review (15 min)
From memory: the cross-validated RMSE of the three models, and what the decision tree's ₦0 training error was telling you.

### Lesson (30 min)
The random forest won. Can it do better with different settings (**hyperparameters**: Week 1)? For example: how many trees (`n_estimators`), and how many features each tree may consider at each question (`max_features`).

**Grid search.** List the values you want to try; scikit-learn's **`GridSearchCV`** trains and cross-validates **every combination** and reports the best. Our grid: 2 values of `n_estimators` × 3 of `max_features` = 6 combinations, each cross-validated 3 times = 18 training runs. The best: **40 trees, 12 features**, cross-validated RMSE **just under ₦35m** (₦34.7m–₦34.8m depending on the computer; from ₦35.3m).

When the grid would be huge, **randomized search** tries a fixed number of random combinations instead (p. 83). An **ensemble** (combining your best models) often helps too (p. 84).

**Look inside: feature importance.** A random forest can tell you how much each feature helped. On your data, the top three are:
1. `size_sqm` (about a quarter of all the importance, 0.24–0.25)
2. **`km_to_ikoyi` (about 0.21)**, the feature *you* built in Week 2
3. being a detached duplex (about 0.13)

That's what good feature engineering looks like: your own idea became the model's second most useful signal.

**The one honest test.** Now, and only now, run the *untouched* test set through the *same* pipeline (`transform`, never `fit`) and the final model. **Test RMSE: ₦33.2m.** Don't go back and tweak anything to improve it: the moment you do, it stops being honest.

**Did we beat the agents?** In Week 2, half the agents' estimates were more than 20% off (so only 50% were within 20%). On the test set, **about two-thirds** (66–67%, depending on the computer) of the model's predictions are within 20% of the real price. Not perfect, but better than how it's done today: the model is worth building.

**Now read** Géron **pp. 81–86** ("Fine-Tune Your Model", through "Evaluate Your System on the Test Set").

### Practice (30 min)
Grid-search the forest, read its feature importances, then evaluate it on the test set once and compare it with the agents.

::sandbox ml-w03-d5-tune

### Mini-Task
Your test RMSE disappoints you, so you try 20 more settings and pick the one with the best *test* score. What's wrong with that, and what should you have done instead?

**Check:** You've tuned to the test set (Week 1, Day 6): its score now flatters you and no longer predicts real-world performance. Do all choosing with cross-validation on the training set; use the test set once, at the end. If the final score disappoints, the honest move is to report it, and improve the data or features before collecting a *new* test set.

### Log (5 min)
What surprised you about the feature importances?

## Day 6 — Saturday
**Topic:** Project day: the whole pipeline, launch and monitor
**Time:** ~2.5 hours

### Review (30 min)
Explain the full journey of one Lagos listing from raw CSV row to predicted price, naming every step. Then list the three models you trained and why the forest won.

### Lesson (30 min)
**A model isn't done when it's trained** (pp. 86–88). Before and after launch:
- **Present it:** what you did, what worked and didn't, the assumptions, and the limits. ("It struggles with listings above ₦500m, because the training prices were capped there.")
- **Launch it:** save the trained pipeline + model (Géron uses `joblib.dump`), and put it where the bargain-flagging system can call it.
- **Monitor it:** check its accuracy regularly against real sale prices. **Models rot**: Lagos prices change with inflation and new roads, so a model trained on last year's listings slowly gets worse. This is called *data drift*.
- **Watch the inputs** too: if one agent starts typing sizes in square feet instead of square metres, predictions go wrong silently.
- **Retrain** on fresh data regularly (batch learning from Week 1), and keep backups so you can roll back a bad version.

This is the same idea as monitoring a website: in production, things break quietly unless something is watching.

**Now read** Géron **pp. 86–88** ("Launch, Monitor, and Maintain Your System", "Try It Out!", "Exercises").

### Weekly Project (1 hour 30 min)
**Ship Ìlé Homes' model.** One script, start to finish: load, split, prepare, train the tuned forest, test once, and write the model's report card.

::sandbox ml-w03-d6-ship

Then write a **model card** in your notebook (this is what professionals hand over with a model):
1. **What it predicts**, and for whom.
2. **The data:** where it came from, how many listings, the known problems (cap, missing sizes, typos).
3. **Performance:** test RMSE, and the share of predictions within 20%, compared with the agents.
4. **Limits:** where it shouldn't be trusted.
5. **Monitoring plan:** what you'll check, how often, and when you'd retrain.

### Log (10 min)
What's the one thing you'd improve first if Ìlé Homes gave you another month?

## Quiz
1. Name the three ways to handle missing values, and why the median must come from the training set.
2. What do estimators, transformers and predictors each do? What does a trailing underscore mean?
3. Why is numbering areas 0–11 a bad idea? What does one-hot encoding do instead?
4. Write the two methods every custom transformer needs, and what `fit` returns.
5. Min-max scaling vs standardization: which handles a typo like 2,320 m² better, and why?
6. What does a `Pipeline` do? What does a `ColumnTransformer` add?
7. The decision tree scored ₦0 on its training data. What does that tell you, and how did you check?
8. How does 5-fold cross-validation work? Why does scikit-learn return negative scores?
9. What does `GridSearchCV` do? When would you use randomized search instead?
10. Which features mattered most to the forest, and why is the second one interesting?
11. Why must you never tune on the test set?
12. Name three things to monitor after launch, and what data drift is.
