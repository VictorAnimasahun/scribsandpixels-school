# Week 4 — Classification: Yes or No, Which One
**Theme:** Last week's model predicted a number (a price). This week's models predict a **category**: is this a 5 or not, which digit is it, is this payment fraud? You'll learn why "95% accurate" can mean nothing, the four boxes every yes/no model is judged by, the knob that trades one kind of mistake for the other, and how to pick that knob's setting by what mistakes cost in naira.
**Big question:** *When a model answers yes or no, how do you know it's any good, and how do you decide how often it should say yes?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📕 | Géron, *Hands-On Machine Learning*, Chapter 3 (pp. 89–113) | The pages in each day's lesson, after the plain-words explanation. |
| 📺 | [StatQuest: The Confusion Matrix](https://www.youtube.com/watch?v=Kdsp6soqA7o) | Day 2: the four boxes in 7 minutes. |
| 📺 | [StatQuest: Sensitivity and Specificity](https://www.youtube.com/watch?v=vP06aMoz4v8) | Day 4: the two rates behind the ROC curve (sensitivity is another name for recall). |
| 📺 | [StatQuest: ROC and AUC, Clearly Explained!](https://www.youtube.com/watch?v=4jRBRDbJemM) | Day 4: the curve and the area under it. |
| 🌐 | [Google ML Crash Course: Classification](https://developers.google.com/machine-learning/crash-course/classification) | Optional: interactive threshold and ROC widgets. |
| 🌐 | [Géron's notebook for Chapter 3](https://github.com/ageron/handson-ml2) | Optional: the same steps on the full MNIST (70,000 images). |

## Day 1 — Monday
**Topic:** Classification, the digits, and your first yes/no model
**Time:** ~1.5 hours

### Review (15 min)
From memory: the steps of last week's project, from raw CSV to tested model. Which model won, and how did you compare the models fairly without touching the test set?

### Lesson (30 min)
**Regression vs classification, once more** (Géron p. 89). Week 3's model answered *how much?* (a price: any number). Today's models answer *which one?*:
- **Binary classification:** two possible answers. *Is this POS payment fraud: yes or no?* *Is this a 5: yes or no?*
- **Multiclass classification:** more than two. *Which network is this number on: MTN, Airtel, Glo or 9mobile?* *Which digit, 0 to 9, is written here?*

**The picture: deposit slips.** A bank in Abuja receives thousands of handwritten deposit slips a day. Someone has to read each account number, digit by digit. A model that reads handwritten digits saves that work, and that's exactly the first problem in Géron's chapter.

**How a computer "sees" a handwritten digit.** Cut the image into a grid of small squares (pixels) and write down how much ink is in each one. Géron uses MNIST: 70,000 images of 28 × 28 = 784 pixels, ink from 0 to 255. We'll use scikit-learn's smaller **digits** set: **1,797 images of 8 × 8 = 64 pixels, ink from 0 (blank) to 16 (full ink)**. Same ideas, small enough to run on your phone in seconds, and it ships with scikit-learn (no download).

Here is the first image of our training set, as numbers. Squint and you'll see it:

```
 0  0 11 10 12 14 11  0
 0  0 16 16 16 16  7  0
 0  1 16 16 16 12  0  0
 0  1  5  2 11 15  0  0
 0  0  1  0  2 16  0  0
 0  3 12  0  3 15  0  0
 0  6 15  8 13 11  0  0
 0  0  9 14  9  2  0  0
```

A flat top, a stroke down the left, a belly curving round to the bottom: a **5**. To the model it's just 64 numbers in a row, the **features**. The label is 5.

**Test set first, as always** (p. 91). Before looking closer, lock away 20%. We use `train_test_split(..., stratify=y)` so every digit keeps its share on both sides: **1,437 training images, 360 test images**.

**Start simple: a 5-detector** (p. 92). Instead of all ten digits, one yes/no question: *is this a 5?* Turn the labels into True (a 5) / False (anything else). The training set has **145 fives** out of 1,437, about 10%.

**The model: `SGDClassifier`.** SGD stands for *stochastic gradient descent*: it learns by looking at the training examples one at a time in random order, nudging its settings after each one. That makes it fast on huge datasets and suitable for online learning (Week 1). How the nudging works is Week 5; today it's a tool. It's a linear model: it gives every pixel a weight, adds up *weight × ink* for an image, and that total is the image's **score**. A score above 0 means "yes, a 5".

On our first training image it says **True**, with a score of about **179**: confidently a 5, and correct. One right answer proves nothing, though. Tomorrow you'll measure it properly.

**Now read** Géron **pp. 89–92** ("MNIST", "Training a Binary Classifier").

### Practice (30 min)
Load the digits, look at one as numbers and as a picture, lock away the test set, and train the 5-detector.

::sandbox ml-w04-d1-digits

### Mini-Task
For each, write *regression*, *binary classification* or *multiclass classification*: (1) Is this POS payment fraud? · (2) Which of MTN, Airtel, Glo or 9mobile is this number on? · (3) Tomorrow's price of a 50 kg bag of rice · (4) Which digit is written in this box of a deposit slip?

**Check:** (1) binary classification · (2) multiclass (four classes) · (3) regression (a number) · (4) multiclass (ten classes)

### Log (5 min)
In your own words: what does the 5-detector actually look at, and what does its score mean?

## Day 2 — Tuesday
**Topic:** The accuracy trap and the confusion matrix
**Time:** ~1.5 hours

### Review (15 min)
How many numbers describe one digits image, and what does each number mean? What does the 5-detector's score have to be for it to say "yes"?

### Lesson (30 min)
**The picture: a bank's fraud alarm.** Kemi runs fraud at a Lagos bank. Out of **1,000** POS payments yesterday, **20** were fraud. Her alarm flagged **25** payments, and **15** of those really were fraud.

**Accuracy** is the share of answers that were right. The alarm was right about the 15 frauds it flagged and the 970 innocent payments it left alone: (15 + 970) / 1,000 = **98.5%**. Sounds excellent.

Now imagine a lazy alarm that **never rings**. It's right about all 980 innocent payments and wrong about the 20 frauds: **98.0%** accurate, while catching nothing. **When one answer is rare, accuracy is almost meaningless** (Géron p. 94): you can score high by always guessing the common answer. Datasets like this are called *skewed* or *imbalanced*, and fraud, disease and spam detection are all like this.

The same thing happens with digits: only about 10% are 5s, so a classifier that always says "not a 5" is about **90%** accurate. You'll build it in the sandbox.

**Measure it properly with cross-validation** (pp. 92–93). Same idea as Week 3: train on two-thirds, measure on the remaining third, three times. The 5-detector scores about **98.5%** accuracy. Better than 90%, but how much better, and in what way? Accuracy can't say.

**The confusion matrix: four boxes** (pp. 94–95). Sort every answer by *what it really was* (rows) and *what the model said* (columns):

| | Said "not fraud" | Said "fraud" |
|---|---|---|
| **Really not fraud** | **970** true negatives (TN) | **10** false positives (FP): false alarms |
| **Really fraud** | **5** false negatives (FN): missed frauds | **15** true positives (TP): caught |

The words are easy once you see the pattern: *positive/negative* is what the model **said**, *true/false* is whether it was **right**. A false positive is a wrong "yes"; a false negative is a wrong "no".

**Two numbers from the four boxes** (pp. 95–96):
- **Precision** = TP / (TP + FP): *when it says yes, how often is it right?* 15 / 25 = **60%**. Four in ten of Kemi's alarms are false.
- **Recall** = TP / (TP + FN): *of all the real yeses, how many did it find?* 15 / 20 = **75%**. A quarter of the frauds got through.

The lazy alarm has a recall of **0%**. Accuracy hid that; recall shows it at once.

**Honest predictions for the training set.** To build the matrix without touching the test set, use `cross_val_predict` (p. 94): each training image gets a prediction from a model that never saw it during training. The 5-detector's matrix is **[[1288, 4], [17, 128]]**: 4 false alarms, and it **misses 17 of the 145 fives**. Precision 128 / 132 = **97%**, recall 128 / 145 = **88%**.

**Now read** Géron **pp. 92–96** ("Performance Measures", "Measuring Accuracy Using Cross-Validation", "Confusion Matrix", "Precision and Recall").

### Practice (30 min)
Write precision and recall yourself, build the do-nothing classifier, then the 5-detector's confusion matrix.

::sandbox ml-w04-d2-confusion

### Mini-Task
A Lagos clinic's quick malaria test is tried on 200 patients; 40 really have malaria. The test says "malaria" for 45 patients, and 36 of them really have it. Draw the four boxes, then work out accuracy, precision and recall.

:::hint
Start with TP = 36. The 45 positives are TP + FP; the 40 sick patients are TP + FN; whatever is left of the 200 is TN.
:::

**Check:** TP 36, FP 9, FN 4, TN 151. Accuracy (36 + 151) / 200 = 93.5% · precision 36 / 45 = 80% · recall 36 / 40 = 90%.

### Log (5 min)
Explain to a friend, without the words "precision" or "recall", why 98% accuracy didn't make Kemi's lazy alarm any good.

## Day 3 — Wednesday
**Topic:** F1, and the knob that trades precision for recall
**Time:** ~1.5 hours

### Review (15 min)
Draw the four boxes from memory and label them. Write the formulas for precision and recall. Which one does a lazy "never yes" model score zero on?

### Lesson (30 min)
**One number for both: F1** (pp. 96–97). Sometimes you want a single score to compare models. F1 is the **harmonic mean** of precision and recall:

F1 = 2 × precision × recall / (precision + recall)

Kemi's alarm: 2 × 0.60 × 0.75 / (0.60 + 0.75) = 0.9 / 1.35 = **0.67**.

Why not the ordinary average? Because the harmonic mean **punishes a weak side**. A model with precision 1.0 and recall 0.1 averages 0.55, but its F1 is 2 × 1.0 × 0.1 / 1.1 = **0.18**. To score a high F1, a model must be decent at both. The 5-detector's F1 is **0.92**.

**But you rarely want both equally** (p. 97). Ask: which mistake hurts more?
- A filter choosing videos for a kids' app: a bad video slipping through is terrible; rejecting some good ones is fine. **Precision** matters most.
- A weapons scanner at an airport: missing a weapon is terrible; extra bag checks are fine. **Recall** matters most.

**The knob: the threshold** (pp. 97–98). The model doesn't really answer yes or no: it gives each case a **score**, and says "yes" when the score is above a **threshold** (0 by default). Think of a car alarm's sensitivity: turned up, every passing okada sets it off (many false alarms, few missed thieves); turned down, it stays quiet even for a real thief.

Eight payments, sorted by the alarm's score (1 = fraud). Four are fraud:

| Score | −3.1 | −2.0 | −1.2 | −0.4 | 0.3 | 0.9 | 1.8 | 2.6 |
|---|---|---|---|---|---|---|---|---|
| Fraud? | 0 | 0 | 1 | 0 | 1 | 0 | 1 | 1 |

| Threshold | Flagged | Precision | Recall |
|---|---|---|---|
| −1.5 | the last 6 | 4 / 6 = 67% | 4 / 4 = 100% |
| 0 | the last 4 | 3 / 4 = 75% | 3 / 4 = 75% |
| 0.5 | the last 3 | 2 / 3 = 67% | 2 / 4 = 50% |
| 1.0 | the last 2 | 2 / 2 = 100% | 2 / 4 = 50% |

Raise the threshold and **recall can only fall** (you flag fewer, so you can't catch more). Precision *usually* rises, but not always: from 0 to 0.5 it dropped from 75% to 67%, because the payment you stopped flagging (score 0.3) was a real fraud. That's why the precision curve in Géron's Figure 3-4 is bumpy and the recall curve is smooth (p. 99).

**Choosing the threshold in code** (pp. 98–100):
1. Get honest **scores** for every training case: `cross_val_predict(..., method="decision_function")`.
2. `precision_recall_curve` gives precision and recall at every possible threshold.
3. Pick the threshold that fits your goal.

For the 5-detector: demanding **100% precision** (never wrong when it says "5") needs a threshold of about **316**, and leaves only about **61% recall**: it now misses 4 in 10 fives. Going the other way, a threshold of **−500** catches **97%** of the fives, but only **29%** of its "yes" answers are right.

Géron's warning (p. 101): if someone says "let's get 99% precision", ask **"at what recall?"** Any precision is easy if you're allowed to miss almost everything.

**Now read** Géron **pp. 96–101** ("Precision/Recall Tradeoff").

### Practice (30 min)
Compute F1, move the threshold along the eight payments, then find the 5-detector's "never wrong" threshold and see what it costs.

::sandbox ml-w04-d3-threshold

### Mini-Task
For each, say whether you'd favour **precision** or **recall**, and why: (1) a spam filter that permanently deletes what it flags · (2) a first screening test for cervical cancer that sends positives for a proper second test · (3) a bank model that **blocks** the card immediately when it flags a payment · (4) a model that flags possible fraud for a human to review later.

**Check:** (1) precision: a deleted real email is a costly mistake · (2) recall: missing a sick person is the worst outcome; a false alarm only costs a second test · (3) precision: every false alarm strands an innocent customer with a blocked card · (4) recall: a human double-checks, so false alarms are cheap and missed fraud is expensive. (Reasoned answers that weigh the costs differently are fine: the point is to ask which mistake hurts more.)

### Log (5 min)
In one sentence: what happens to precision and recall when you raise the threshold, and why can recall only go down?

## Day 4 — Thursday
**Topic:** The ROC curve, and comparing two models
**Time:** ~1.5 hours

### Review (15 min)
Compute F1 for precision 0.8 and recall 0.4 by hand. Then: if you lower the threshold, which way do precision and recall usually move?

### Lesson (30 min)
**Another view of the same trade-off: ROC** (pp. 101–102). The ROC curve plots two rates against each other for every threshold:
- **True positive rate (TPR)**, which is just **recall** (also called *sensitivity*): of the real frauds, the share caught. Kemi's alarm: 15 / 20 = **75%**.
- **False positive rate (FPR)**: of the **innocent** payments, the share wrongly flagged. FP / (FP + TN) = 10 / 980 = **1.0%**.

(The opposite of the FPR is the *specificity*, the share of innocent payments correctly left alone: 970 / 980 = 99%. StatQuest's video uses these names.)

Lower the threshold and you move up the curve: more frauds caught, but more innocent people flagged. A useless model that guesses at random sits on the **diagonal line**; a good model bends towards the **top-left corner** (catch everything, flag no one).

**One number: the area under the curve (AUC)** (p. 102). A perfect model has ROC AUC **1.0**; random guessing has **0.5**. A useful way to read it: **the chance that a randomly picked fraud gets a higher score than a randomly picked innocent payment.**

**Comparing two models** (pp. 103–104). A random forest doesn't have a `decision_function`; it has `predict_proba`, the probability of each class. Use the probability of "yes" as the score. On the 5-detector:
- SGD: ROC AUC about **0.981**
- Random forest: about **0.995**, a curve hugging the top-left corner.

At a probability of 0.5, the forest is **never wrong** when it says "5" (100% precision) and finds about **81%** of them.

**ROC or precision/recall curve?** (p. 102). Look at Kemi's numbers again: an FPR of **1%** sounds tiny, yet **40%** of her alarms are false (precision 60%). The FPR divides by *all* 980 innocent payments, so when the "yes" class is rare, even many false alarms make a small FPR, and the ROC curve looks rosier than the reality. Géron's rule of thumb: **prefer the precision/recall curve when the positive class is rare** (fraud, disease) or when false positives worry you most; use ROC otherwise.

**Now read** Géron **pp. 101–104** ("The ROC Curve").

### Practice (30 min)
Compute the FPR by hand, then draw both models' ROC curves on one chart and compare their AUCs.

::sandbox ml-w04-d4-roc

### Mini-Task
Back to Tuesday's malaria test (TP 36, FP 9, FN 4, TN 151): work out its TPR and FPR. Then: should the clinic judge its test with a ROC curve or a precision/recall curve, given that 20% of patients have malaria? What if only 1% did?

**Check:** TPR = 36 / 40 = 90% · FPR = 9 / 160 = 5.6%. At 20% the "yes" class isn't rare, so ROC is fine. At 1%, prefer the precision/recall curve: the FPR would stay small even with many false alarms, hiding a low precision.

### Log (5 min)
What does a ROC AUC of 0.5 mean, and why can a high AUC still hide a problem when the "yes" class is rare?

## Day 5 — Friday
**Topic:** All ten digits: multiclass, error analysis, multilabel and multioutput
**Time:** ~1.5 hours

### Review (15 min)
What does the ROC curve plot on each axis? Which model had the higher AUC on Thursday, and what was the forest's precision and recall at 0.5?

### Lesson (30 min)
**From two classes to ten** (pp. 104–106). Some models handle many classes directly (random forests). Others are yes/no only (like SGD), so you combine several:
- **One-versus-the-rest (OvR):** train one detector per class (a 0-detector, a 1-detector, … a 9-detector). For a new image, ask all ten and pick the class with the **highest score**. Ten detectors.
- **One-versus-one (OvO):** train a detector for every **pair** (0 vs 1, 0 vs 2, … 8 vs 9) and let the classes fight duels; the class with the most wins takes it. For N classes that's **N × (N − 1) / 2** detectors: **45** for ten digits. Each duel trains on only two classes' data, which helps models that slow down badly on big datasets.

scikit-learn picks for you: give `SGDClassifier` the ten labels and it quietly trains ten detectors (OvR). On our first image it gives **10 scores**, the highest for 5, and answers **5**.

**How good is it?** 3-fold cross-validated accuracy on all ten digits: about **92%** on raw pixels, about **94%** after `StandardScaler` (Week 3). Random guessing would get 10%. Scaling helped because SGD, like most linear models, works best when features are on similar scales.

**Error analysis: what does it get wrong?** (pp. 106–110). Build the 10 × 10 confusion matrix: rows are the true digit, columns what it was called. Most counts sit on the diagonal (correct). To see the mistakes:
1. Divide each row by its total, so you compare **rates**, not counts (a common digit shouldn't look worse just for being common).
2. Set the diagonal to 0 to hide the correct answers.
3. Draw it: bright squares are frequent mistakes.

On our digits the **column for 8** lights up: **38** wrong answers land on 8, more than any other digit. The single worst mistake is **calling a 1 an "8"** (about 5% of the 1s). Géron found the same bright 8-column on full MNIST. The matrix tells you where to spend effort: more examples of digits that get confused with 8, or a new feature like *the number of closed loops* (an 8 has two, a 6 one, a 1 none). Géron also explains why a linear model confuses 3s and 5s: it weighs each pixel separately, and the two digits differ by only a few pixels, so a slightly shifted or rotated image fools it (pp. 109–110).

**More than one label per case: multilabel** (pp. 110–111). A Nollywood film can be tagged *comedy* **and** *romance*. A news story can be *politics* **and** *Lagos*. The model outputs several yes/no answers at once. With digits: *is it 7 or more?* and *is it odd?* For our first image (a 5) the answer is **[False, True]**. One way to score it: compute F1 for each label and average them (the "macro" average): about **0.98**.

**Several labels, each with many values: multioutput** (pp. 111–112). Géron's example removes noise from images: the input is a noisy digit and the output is a clean one, a separate prediction for **every pixel**, each with many possible values. A school example: predicting a student's grade (A1 to F9) in each of their nine WAEC subjects.

**Now read** Géron **pp. 104–112** ("Multiclass Classification", "Error Analysis", "Multilabel Classification", "Multioutput Classification").

### Practice (30 min)
Train one classifier for all ten digits, measure what scaling adds, find its worst confusions, then try two labels per image.

::sandbox ml-w04-d5-multiclass

### Mini-Task
(1) A model sorts letters by Nigerian state: 36 states plus the FCT. How many detectors does one-versus-the-rest need? One-versus-one? (2) Multilabel or multioutput? (a) tagging a photo with every friend who appears in it · (b) predicting tomorrow's temperature *and* rainfall for each of Lagos, Abuja and Kano.

**Check:** (1) OvR: 37 · OvO: 37 × 36 / 2 = 666. (2) (a) multilabel: several yes/no tags · (b) multioutput: several outputs, each a number, not just yes/no.

### Log (5 min)
What did the confusion matrix tell you about your digits model that the 94% accuracy didn't?

## Day 6 — Saturday
**Topic:** Project day: a fraud flagger, with the threshold set in naira
**Time:** ~2.5 hours

### Review (30 min)
Without notes: the four boxes, precision, recall, F1, TPR, FPR and AUC, each in one line. Then: why is accuracy useless for fraud, and why does the threshold matter?

### Lesson (30 min)
**The job.** A Nigerian bank gives you **4,000 payments** (card, POS, transfer, ATM) from last month, **114 of them fraud (2.85%)**. For each payment you know the amount, the hour, how far it happened from the customer's usual location, whether the device was new, whether the card was foreign, how many payments the account made in the last 24 hours, and how old the account is. Some patterns are visible straight away: payments from **foreign cards are fraud 17% of the time**, against 2.4% for local ones; a **new device** pushes it to 14%.

**The plan, step by step:**
1. **Baseline.** Answering "never fraud" is about **97%** accurate and catches nothing. That's the number accuracy would let you brag about. Ignore it.
2. **Compare two models by ROC AUC** on honest cross-validated scores: SGD gets about **0.89**, a random forest about **0.92**. The forest ranks fraud higher more reliably.
3. **The surprise:** at the usual threshold of 0.5, the forest flags **no fraud at all**. Because fraud is rare, the forest is almost never more than 50% sure. The scores rank payments well; **the default threshold is simply wrong for a rare class.**
4. **Pick the threshold by money.** This is a business decision, so put naira on each mistake:
   - A **missed fraud** costs its full amount: the bank refunds the customer.
   - A **false alarm** costs about **₦1,000**: a verification call, and an annoyed customer.

   Try every threshold from 0.01 to 0.59 and add up the cost on the training set. Flagging nothing costs about **₦5.6m**; the cheapest threshold is around **0.04**, costing well under ₦1m.
5. **Test once.** Train the forest on the whole training set and flag the test set at your threshold. It catches **20 of 23** frauds with **129** false alarms, cutting the cost from **₦1.59m** (doing nothing) to about **₦236k**.

Notice the precision: 20 / (20 + 129) is only **13%**. Seven in eight alarms are false, and that's the *right* choice here, because a false alarm costs ₦1,000 and a typical fraud costs over ₦30,000. A model's best threshold depends on what its mistakes cost, not on making a metric look good.

This is the engineering part of machine learning: the model gives scores, and **you** decide what to do with them, using numbers the business agrees with.

**Now read** Géron's exercises on **pp. 112–113**. Exercise 1 (beat 97% on MNIST with `KNeighborsClassifier` and a grid search) is a good optional challenge on the digits set: a plain k-NN already gets about 98% there.

### Weekly Project (1 hour 30 min)
**Build the bank's fraud flagger.** One script: look at the data, beat the baseline, compare two models, choose the threshold by cost, and test once.

::sandbox ml-w04-d6-fraud

Then, in your notebook:
1. **What if a false alarm cost ₦5,000** instead of ₦1,000 (say each one needs a branch visit)? Change `FALSE_ALARM`, run again, and write down the new threshold, how many frauds it catches on the test set, and how many false alarms.
2. Write a short **note to the bank's head of fraud** (5 lines): what the flagger does, how many frauds it catches out of how many, the false-alarm load per 800 payments, and what you need from them (the real cost of a false alarm, and feedback on flagged payments).

**Check:** at ₦5,000 the best threshold rises to about **0.10**: on the test set it catches about **17 of 23** frauds with about **55** false alarms. Costlier false alarms push the threshold up: fewer alarms, more missed fraud.

### Log (10 min)
Who should choose a fraud model's threshold: the data scientist, the bank, or both? Why?

## Quiz
1. What's the difference between regression, binary classification and multiclass classification? Give a Nigerian example of each.
2. How does a computer "see" an 8 × 8 handwritten digit?
3. Why is accuracy misleading when one class is rare? Give the do-nothing example.
4. Draw the confusion matrix and name the four boxes. What do "positive" and "true" each refer to?
5. Write the formulas for precision and recall, and say what each one answers in plain words.
6. What is F1, and why is it a harmonic mean rather than an ordinary average?
7. What does the threshold do? Why can recall only fall as the threshold rises, while precision can wobble?
8. Give one case where precision matters most and one where recall matters most.
9. What does the ROC curve plot? What do an AUC of 1.0 and of 0.5 mean?
10. When should you prefer the precision/recall curve to the ROC curve?
11. Explain one-versus-the-rest and one-versus-one. How many detectors does each need for 10 classes?
12. Why did the fraud forest catch nothing at threshold 0.5, and how did you choose a better threshold?
